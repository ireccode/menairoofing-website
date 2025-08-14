// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
});

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Active Navigation Link Highlighting
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const headerHeight = document.querySelector('.header').offsetHeight;
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});

// Contact Form Validation and Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    // Form validation rules
    const validationRules = {
        fullName: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-Z\s]+$/,
            message: 'Please enter a valid full name (letters and spaces only, minimum 2 characters)'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        phone: {
            required: true,
            pattern: /^[\+]?[0-9\s\-\(\)]{10,}$/,
            message: 'Please enter a valid phone number (minimum 10 digits)'
        },
        message: {
            required: false,
            maxLength: 1000,
            message: 'Message must be less than 1000 characters'
        }
    };
    
    // Validate individual field
    function validateField(fieldName, value) {
        const rules = validationRules[fieldName];
        const errors = [];
        
        if (rules.required && (!value || value.trim() === '')) {
            errors.push('This field is required');
        }
        
        if (value && rules.minLength && value.length < rules.minLength) {
            errors.push(`Minimum ${rules.minLength} characters required`);
        }
        
        if (value && rules.maxLength && value.length > rules.maxLength) {
            errors.push(`Maximum ${rules.maxLength} characters allowed`);
        }
        
        if (value && rules.pattern && !rules.pattern.test(value)) {
            errors.push(rules.message);
        }
        
        return errors;
    }
    
    // Display error message
    function showError(fieldName, errors) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        const inputElement = document.getElementById(fieldName);
        
        if (errorElement) {
            errorElement.textContent = errors.length > 0 ? errors[0] : '';
        }
        
        if (inputElement) {
            if (errors.length > 0) {
                inputElement.style.borderColor = '#ff6b6b';
                inputElement.style.boxShadow = '0 0 0 2px rgba(255, 107, 107, 0.2)';
            } else {
                inputElement.style.borderColor = '#4CAF50';
                inputElement.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
            }
        }
    }
    
    // Real-time validation
    Object.keys(validationRules).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('blur', function() {
                const errors = validateField(fieldName, this.value);
                showError(fieldName, errors);
            });
            
            field.addEventListener('input', function() {
                // Clear error styling on input
                this.style.borderColor = '';
                this.style.boxShadow = '';
                const errorElement = document.getElementById(`${fieldName}Error`);
                if (errorElement) {
                    errorElement.textContent = '';
                }
            });
        }
    });
    
    // Form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        const formData = new FormData(this);
        
        Object.keys(validationRules).forEach(fieldName => {
            const value = formData.get(fieldName) || '';
            const errors = validateField(fieldName, value);
            showError(fieldName, errors);
            
            if (errors.length > 0) {
                isValid = false;
            }
        });
        
        if (isValid) {
            // Disable submit button
            const submitButton = this.querySelector('.submit-button');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'SENDING...';
            
            // Simulate form submission (replace with actual submission logic)
            setTimeout(() => {
                // In a real implementation, you would send the data to your server here
                // For now, we'll just redirect to the thank you page
                window.location.href = 'thank-you.html';
            }, 1500);
            
            // Reset button after timeout (in case redirect fails)
            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }, 5000);
        } else {
            // Scroll to first error
            const firstError = this.querySelector('.error-message:not(:empty)');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

// FAQ Accordion Functionality
document.querySelectorAll('.faq-item h4').forEach(question => {
    question.addEventListener('click', function() {
        const answer = this.nextElementSibling;
        const isOpen = answer.style.display === 'block';
        
        // Close all other answers
        document.querySelectorAll('.faq-item p').forEach(p => {
            p.style.display = 'none';
        });
        
        // Toggle current answer
        answer.style.display = isOpen ? 'none' : 'block';
        
        // Update question styling
        document.querySelectorAll('.faq-item h4').forEach(h4 => {
            h4.style.background = '#4CAF50';
        });
        
        if (!isOpen) {
            this.style.background = '#45a049';
        }
    });
});

// Scroll-triggered Animations
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function handleScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature, .service-card, .testimonial-card, .faq-item');
    
    animatedElements.forEach(el => {
        if (isElementInViewport(el) && !el.classList.contains('animated')) {
            el.classList.add('animated');
            el.style.animation = 'fadeInUp 0.6s ease forwards';
        }
    });
}

// Throttled scroll event listener
let scrollTimeout;
window.addEventListener('scroll', function() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(handleScrollAnimations, 10);
});

// Initial check for elements in viewport
document.addEventListener('DOMContentLoaded', handleScrollAnimations);

// Form Enhancement: Auto-format Phone Number
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 10) {
            // Format as (XXX) XXX-XXXX for US numbers
            if (value.length === 10) {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
            } else if (value.length === 11 && value[0] === '1') {
                value = `+1 (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7, 11)}`;
            }
        }
        
        e.target.value = value;
    });
}

// Enhanced Error Handling for Form Submission
function handleFormError(error) {
    console.error('Form submission error:', error);
    
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-message';
    errorDiv.style.cssText = `
        background: #ff6b6b;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
        text-align: center;
    `;
    errorDiv.textContent = 'Sorry, there was an error submitting your form. Please try again or contact us directly.';
    
    const form = document.getElementById('contactForm');
    if (form) {
        // Remove existing error message
        const existingError = form.querySelector('.form-error-message');
        if (existingError) {
            existingError.remove();
        }
        
        form.appendChild(errorDiv);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Page Load Performance Optimization
document.addEventListener('DOMContentLoaded', function() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Preload critical resources
    const preloadLinks = [
        'css/styles.css',
        'images/menai_roofing_logo.png'
    ];
    
    preloadLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = href.endsWith('.css') ? 'style' : 'image';
        document.head.appendChild(link);
    });
});

// Accessibility Enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add keyboard navigation for hamburger menu
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.setAttribute('tabindex', '0');
        hamburger.setAttribute('role', 'button');
        hamburger.setAttribute('aria-label', 'Toggle navigation menu');
        
        hamburger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    // Add ARIA labels to form inputs
    const formInputs = document.querySelectorAll('#contactForm input, #contactForm textarea');
    formInputs.forEach(input => {
        const label = input.getAttribute('placeholder');
        if (label) {
            input.setAttribute('aria-label', label);
        }
    });
    
    // Add focus indicators for better keyboard navigation
    const focusableElements = document.querySelectorAll('a, button, input, textarea, [tabindex]');
    focusableElements.forEach(el => {
        el.addEventListener('focus', function() {
            this.style.outline = '2px solid #4CAF50';
            this.style.outlineOffset = '2px';
        });
        
        el.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
});

