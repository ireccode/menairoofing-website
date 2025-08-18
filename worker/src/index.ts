// @ts-nocheck
// Cloudflare Worker: Email handler for contact form
// Deploy with: wrangler deploy --config worker/wrangler.toml
// Secrets required: TO_EMAIL, FROM_EMAIL, FROM_NAME
import { EmailMessage } from 'cloudflare:email';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = [
      'https://menairoofing-website.pages.dev',
      'https://www.menairoofing.com',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ];
    const allowOrigin = allowedOrigins.includes(origin) ? origin : '*';

    if (request.method === 'OPTIONS') {
      console.log('[contact-worker] OPTIONS preflight from', origin);
      return new Response(null, { status: 204, headers: corsHeaders(allowOrigin) });
    }

    if (request.method !== 'POST') {
      console.warn('[contact-worker] Non-POST method:', request.method);
      return json({ success: false, error: 'Method Not Allowed' }, 405, allowOrigin);
    }

    let data: Record<string, any> = {};
    const contentType = request.headers.get('content-type') || '';
    console.log('[contact-worker] Incoming POST', { origin, contentType });
    try {
      if (contentType.includes('application/json')) {
        data = await request.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const form = await request.formData();
        form.forEach((value, key) => {
          if (data[key]) {
            data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
          } else {
            data[key] = value;
          }
        });
      } else {
        return json({ success: false, error: 'Unsupported Content-Type' }, 415, allowOrigin);
      }
    } catch (e) {
      console.error('[contact-worker] Body parse error:', e);
      return json({ success: false, error: 'Invalid request body' }, 400, allowOrigin);
    }

    // Honeypot fields
    const honeypots = ['hp', 'honeypot', '_honey', 'bot_field', 'website', 'company_website'];
    for (const key of honeypots) {
      if (data[key]) {
        console.warn('[contact-worker] Honeypot triggered:', key);
        return json({ success: true, message: 'Submitted' }, 200, allowOrigin);
      }
    }

    // Map contact.html fields
    const name = (data.fullName || data.name || '').toString().trim();
    const email = (data.email || '').toString().trim();
    const phone = (data.phone || '').toString().trim();
    const message = (data.message || '').toString().trim();

    const errors: string[] = [];
    if (!name) errors.push('fullName/name');
    if (!email) errors.push('email');
    if (!phone) errors.push('phone');
    if (email && !isValidEmail(email)) errors.push('email_format');
    if (errors.length) {
      console.warn('[contact-worker] Validation failed:', errors);
      return json({ success: false, error: 'Validation failed', fields: errors }, 422, allowOrigin);
    }

    const submittedAt = new Date().toISOString();
    const subject = `New Website Contact from ${name}`;
    const html = buildHtmlEmail({ name, email, phone, message, submittedAt, raw: data });

    const TO_EMAIL = env.TO_EMAIL || 'info@menairoofing.com';
    const FROM_EMAIL = env.FROM_EMAIL || 'noreply@menairoofing.com';
    const FROM_NAME = env.FROM_NAME || 'Menai Roofing Website';

    try {
      if (env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
        console.log('[contact-worker] Using Mailgun provider');
        // Use Mailgun (works without owning your own domain if using sandbox with authorized recipients)
        const params = new URLSearchParams();
        const fromDomain = env.MAILGUN_DOMAIN; // e.g., sandboxXXXX.mailgun.org
        params.set('from', `${FROM_NAME} <postmaster@${fromDomain}>`);
        params.set('to', TO_EMAIL);
        params.set('subject', subject);
        params.set('text', toTextFallback({ name, email, phone, message, submittedAt }));
        params.set('html', html);
        params.set('h:Reply-To', `${name} <${email}>`);

        const auth = 'Basic ' + btoa(`api:${env.MAILGUN_API_KEY}`);
        const mgResp = await fetch(`https://api.mailgun.net/v3/${fromDomain}/messages`, {
          method: 'POST',
          headers: {
            Authorization: auth,
            'content-type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        if (!mgResp.ok) {
          const errText = await mgResp.text();
          console.error('[contact-worker] Mailgun send failed', mgResp.status, errText.slice(0, 500));
          return json({ success: false, error: 'Mailgun send failed', details: errText.slice(0, 500) }, 502, allowOrigin);
        }
        console.log('[contact-worker] Mailgun send OK');
      } else {
        // Prefer Cloudflare Email Workers (native send) if binding is configured
        if ((env as any)?.SEND && typeof (env as any).SEND.send === 'function') {
          console.log('[contact-worker] Using Cloudflare Email Workers (native send)');
          const boundary = '=_cf_' + Math.random().toString(36).slice(2);
          const textBody = toTextFallback({ name, email, phone, message, submittedAt });
          const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@menairoofing.com>`;
          const dateHeader = new Date().toUTCString();
          const CRLF = "\r\n";
          const emailContent = `MIME-Version: 1.0${CRLF}`
            + `Message-ID: ${messageId}${CRLF}`
            + `Date: ${dateHeader}${CRLF}`
            + `From: ${FROM_NAME} <${FROM_EMAIL}>${CRLF}`
            + `To: ${TO_EMAIL}${CRLF}`
            + `Subject: ${subject}${CRLF}`
            + `Reply-To: ${name} <${email}>${CRLF}`
            + `Content-Type: multipart/alternative; boundary="${boundary}"${CRLF}${CRLF}`
            + `--${boundary}${CRLF}`
            + `Content-Type: text/plain; charset=utf-8${CRLF}`
            + `Content-Transfer-Encoding: 7bit${CRLF}${CRLF}`
            + `${textBody}${CRLF}${CRLF}`
            + `--${boundary}${CRLF}`
            + `Content-Type: text/html; charset=utf-8${CRLF}`
            + `Content-Transfer-Encoding: 7bit${CRLF}${CRLF}`
            + `${html}${CRLF}${CRLF}`
            + `--${boundary}--${CRLF}`;

          // Create EmailMessage(from, to, raw)
          // @ts-ignore EmailMessage provided by Email Workers runtime
          const emailMessage = new EmailMessage(FROM_EMAIL, undefined as any, emailContent);
          await (env as any).SEND.send(emailMessage);
          console.log('[contact-worker] CF Email send OK');
        } else {
          // Fallback: MailChannels (requires authorized From domain)
          console.log('[contact-worker] Using MailChannels provider (fallback)');
          // Prepare email data with proper DKIM and headers
          const emailData = {
            personalizations: [{
              to: [{ email: TO_EMAIL, name: 'Website Contact' }],
              dkim_domain: 'menairoofing.com',
              dkim_selector: 'mailchannels',
              dkim_private_key: env.DKIM_PRIVATE_KEY || undefined,
            }],
            from: { 
              email: FROM_EMAIL, 
              name: FROM_NAME 
            },
            reply_to: { email: email, name: name },
            subject: subject,
            content: [
              { 
                type: 'text/plain', 
                value: toTextFallback({ name, email, phone, message, submittedAt }) 
              },
              { 
                type: 'text/html', 
                value: html 
              },
            ],
          };

          console.log('[contact-worker] Sending email with data:', JSON.stringify(emailData, null, 2));
          
          const sendResp = await fetch('https://api.mailchannels.net/tx/v1/send', {
            method: 'POST',
            headers: { 
              'content-type': 'application/json',
              'X-MC-DKIM': 'true'
            },
            body: JSON.stringify(emailData),
          });

          if (!sendResp.ok) {
            const errText = await sendResp.text();
            console.error('[contact-worker] MailChannels send failed', sendResp.status, errText.slice(0, 500));
            return json({ success: false, error: 'Email send failed', details: errText.slice(0, 500) }, 502, allowOrigin);
          }
          console.log('[contact-worker] MailChannels send OK');
        }
      }
    } catch (e: any) {
      console.error('[contact-worker] Email service error', e);
      return json({ success: false, error: 'Email service error', details: e?.message || String(e) }, 502, allowOrigin);
    }

    console.log('[contact-worker] Submission success for', { name, email, phone: !!phone });
    return json({ success: true, message: 'Submitted successfully' }, 200, allowOrigin);
  },
};

function corsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(body: any, status = 200, origin = '*') {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function toTextFallback(payload: { name: string; email: string; phone: string; message: string; submittedAt: string; }) {
  const lines = [
    `New Website Contact`,
    `Submitted: ${payload.submittedAt}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : undefined,
    payload.message ? `Message: ${payload.message}` : undefined,
  ].filter(Boolean);
  return lines.join('\n');
}

function buildHtmlEmail(params: {
  name: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: string;
  raw: Record<string, any>;
}) {
  const { name, email, phone, message, submittedAt, raw } = params;

  const section = (label: string, value?: string) =>
    value
      ? `<tr><td style="padding:12px 16px;border:1px solid #eee;background:#fff;"><div style="font:600 13px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#555;text-transform:uppercase;letter-spacing:.03em;margin-bottom:6px;">${escHtml(
          label
        )}</div><div style="font:400 15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#111;white-space:pre-line;word-break:break-word;">${escHtml(
          value
        )}</div></td></tr>`
      : '';

  const rawPairs = Object.entries(raw)
    .filter(([k]) => !['fullName','name','email','phone','message'].includes(k))
    .map(([k, v]) => `<tr><td style="padding:8px 12px;border-bottom:1px dashed #eee;"><strong style="color:#666;">${escHtml(k)}</strong>: <span style="color:#111;">${escHtml(String(v))}</span></td></tr>`) // fallback for extra fields
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>New Website Contact</title>
</head>
<body style="margin:0;background:#f6f7fb;padding:24px;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #eaeaea;border-radius:8px;overflow:hidden;">
    <tr>
      <td style="background:#0b2545;padding:20px 24px;">
        <h2 style="margin:0;color:#ffd166;font:600 20px/1.3 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">New Website Contact</h2>
        <div style="margin-top:6px;color:#d0e0ff;font:400 13px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">Submitted: ${submittedAt}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:0;background:#fafbfe;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0;">
          ${section('Name', name)}
          ${section('Email', email)}
          ${section('Phone', phone)}
          ${section('Message', message)}
        </table>
      </td>
    </tr>
    ${rawPairs ? `<tr><td style="padding:12px 16px;background:#fff;border-top:1px solid #eee;">
      <div style="font:600 13px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#555;text-transform:uppercase;letter-spacing:.03em;margin-bottom:8px;">Additional Fields</div>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${rawPairs}</table>
    </td></tr>` : ''}
    <tr>
      <td style="padding:16px 24px;background:#f4f6fb;border-top:1px solid #eaeaea;">
        <div style="color:#667085;font:400 12px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">This email was sent from the Menai Roofing website contact form.</div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

interface Env {
  TO_EMAIL: string;
  FROM_EMAIL: string;
  FROM_NAME: string;
  DKIM_DOMAIN?: string;
  DKIM_SELECTOR?: string;
  DKIM_PRIVATE_KEY?: string;
}
