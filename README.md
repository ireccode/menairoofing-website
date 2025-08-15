# Menai Roofing Website

A professional, responsive website for Menai Roofing - a roofing contractor service in NSW, Australia. This website features a clean, modern design with full mobile responsiveness and SEO optimization.

## Features

- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **SEO Optimized**: Proper meta tags, structured data, and semantic HTML for better search engine visibility
- **Contact Form**: Functional contact form with client-side validation and error handling
- **Modern UI**: Clean, professional design with smooth animations and hover effects
- **Fast Loading**: Optimized images, CSS, and JavaScript for quick page load times
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation support

## Pages

1. **Home Page** (`index.html`) - Landing page with hero section, services overview, testimonials, and FAQ
2. **Contact Page** (`contact.html`) - Contact form and business information
3. **Thank You Page** (`thank-you.html`) - Form submission confirmation page

## Technology Stack

- **HTML5**: Semantic markup with proper structure
- **CSS3**: Modern styling with Flexbox and Grid layouts
- **JavaScript**: Vanilla JS for form validation and interactive features
- **Google Fonts**: Inter font family for typography

## File Structure

```
menai-roofing-website/
├── index.html              # Home page
├── contact.html            # Contact page
├── thank-you.html          # Thank you page
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   └── script.js           # JavaScript functionality
├── images/                 # Image assets
│   ├── menai_roofing_logo.png
│   ├── landing_page_background.webp
│   ├── contact_page_image.webp
│   └── confirmation_page_image.webp
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Search engine directives
├── .htaccess               # Apache configuration
└── README.md               # This file
```

## SEO Features

- Unique meta titles and descriptions for each page
- Proper heading hierarchy (H1, H2, H3, etc.)
- Alt text for all images
- Structured data markup
- XML sitemap
- Robots.txt file
- Clean, semantic URLs

## Contact Form Features

- **Client-side Validation**: Real-time form validation with error messages
- **Required Fields**: Name, email, and phone validation
- **Email Format**: Proper email format validation
- **Phone Format**: Phone number format validation
- **Character Limits**: Message length validation
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Error Handling**: User-friendly error messages and visual feedback

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Internet Explorer 11+ (with graceful degradation)

## Performance Optimizations

- Minified CSS and JavaScript
- Optimized images (WebP format where supported)
- Browser caching headers
- Gzip compression
- Lazy loading for images
- Critical CSS inlined

## Deployment

### GitHub Pages

1. Create a new repository on GitHub
2. Upload all files to the repository
3. Go to repository Settings > Pages
4. Select source branch (usually `main`)
5. Your site will be available at `https://github.com/ireccode/menairoofing-website`

### Cloudflare Pages (with Functions)

This project includes a Cloudflare Pages Function at `functions/api/contact.ts` that handles contact form submissions and sends an HTML email via MailChannels (Cloudflare-recommended).

Steps:

1. **Create/Connect a Pages project** to this repo in Cloudflare Dashboard.
2. Build command: leave empty (static site) or set to `-`.
3. Output directory: `/` (root).
4. Ensure "Functions" are enabled (Pages detects the `functions/` directory automatically).
5. Add environment variables (optional, improves deliverability):
   - `TO_EMAIL` (e.g., `info@menairoofing.com`)
   - `FROM_EMAIL` (e.g., `noreply@menairoofing.com`)
   - `FROM_NAME` (e.g., `Menai Roofing Website`)
   - `DKIM_DOMAIN` / `DKIM_SELECTOR` / `DKIM_PRIVATE_KEY` (if you want DKIM signing; otherwise omit)
6. Deploy. Your form will POST to `/api/contact`.

Allowed CORS origins are configured in the function (`functions/api/contact.ts`). Update the `allowedOrigins` array if your domain changes.

### Custom Domain Setup

1. Update the sitemap.xml with your actual domain
2. Update robots.txt with your domain
3. Configure DNS settings with your domain provider
4. Enable SSL certificate

## Customization

### Colors
The website uses a color scheme based on:
- Primary Green: #4CAF50
- Primary Red: #C62828
- Dark Text: #2c3e50
- Light Background: #f8f9fa

### Fonts
- Primary Font: Inter (Google Fonts)
- Fallback: system fonts (Arial, sans-serif)

### Images
Replace images in the `/images/` directory with your own:
- Logo: `menai_roofing_logo.png` (recommended size: 200x100px)
- Hero Background: `landing_page_background.webp` (recommended size: 1920x1080px)
- Contact Image: `contact_page_image.webp` (recommended size: 800x600px)
- Confirmation Image: `confirmation_page_image.webp` (recommended size: 800x600px)

## Form Integration

The contact form is wired to POST JSON to the Pages Function at `/api/contact`. Frontend logic is in `js/contact-form.js`.

Backend handler: `functions/api/contact.ts`

Features:

- **Validation**: `name`, `email`, and `pain_points` (or `message`) required; email format checked.
- **Spam/Honeypot**: ignores submissions with common honeypot fields.
- **CORS**: allows specific origins; includes OPTIONS preflight.
- **Email**: Sends responsive HTML email via MailChannels to `free432lancer@gmail.com`.
- **JSON responses**: `{ success: true }` on success; on error `{ success: false, error, fields? }`.

Expected form field names (mapped from the current multi-step form):

- `name` (Full Name)
- `email`
- `phone` (optional)
- `pain_points` (message-like field)
- `timeline`
- `budget`
- `annual_revenue`
- `contact_method` (defaults to `Email` if absent)
- `goals` (array) and/or `ai_goal1..ai_goal10`, `ai_goal_other`

Honeypot fields discarded if present: `hp`, `honeypot`, `_honey`, `bot_field`, `website`, `company_website`.

HTML email includes clearly separated sections for each field and is responsive across clients.

### Local/Remote Testing

Use `curl` against your deployed Pages URL:

```
curl -X POST https://<your-pages-domain>/api/contact \
  -H 'content-type: application/json' \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "pain_points":"Leaking roof around chimney",
    "timeline":"ASAP",
    "budget":"$5k-$10k",
    "annual_revenue":"n/a",
    "contact_method":"Email",
    "goals":["Inspection","Quote"],
    "phone":"0400 000 000"
  }'
```

You should receive `{ "success": true }`. Check the inbox `free432lancer@gmail.com`.

### Changing the Recipient

Edit `TO_EMAIL` inside `functions/api/contact.ts` to update the destination address.

### Example PHP Integration

```php
<?php
if ($_POST) {
    $name = $_POST['fullName'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $message = $_POST['message'];
    
    // Validate and sanitize data
    // Send email
    // Redirect to thank-you.html
}
?>
```

## Security Considerations

- Form validation on both client and server side
- CSRF protection for form submissions
- Input sanitization to prevent XSS attacks
- Rate limiting for form submissions
- SSL certificate for HTTPS

## Maintenance

- Regularly update contact information
- Monitor form submissions for spam
- Update content and images as needed
- Check for broken links
- Monitor website performance and loading times

## License

This project is created for Menai Roofing. All rights reserved.

## Support

For technical support or questions about this website, please contact the development team.

---

**Built with ❤️ for Menai Roofing**

