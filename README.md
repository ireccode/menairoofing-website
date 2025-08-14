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
5. Your site will be available at `https://username.github.io/repository-name`

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: (leave empty for static site)
3. Set build output directory: `/` (root directory)
4. Deploy automatically on git push

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

The contact form is currently set up for client-side validation only. To make it fully functional, you'll need to:

1. **Server-side Processing**: Add server-side form processing (PHP, Node.js, etc.)
2. **Email Service**: Integrate with an email service (SendGrid, Mailgun, etc.)
3. **Database**: Optionally store form submissions in a database
4. **Spam Protection**: Add reCAPTCHA or similar spam protection

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

