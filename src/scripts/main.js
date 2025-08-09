// Import animation utilities
import { initAnimations } from '../utils/animations';
import { initAccessibility } from '../utils/accessibility';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize animations
  initAnimations();
  
  // Initialize accessibility features
  initAccessibility();
  
  // Add any additional JavaScript functionality here
  console.log('Dr\'s Palate website initialized');
});

// Handle service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// Handle scroll events for header
const header = document.querySelector('header');
if (header) {
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add/remove scrolled class to header
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Hide/show header on scroll
    if (currentScroll <= 0) {
      header.classList.remove('scroll-up');
      return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
      // Scrolling down
      header.classList.remove('scroll-up');
      header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
      // Scrolling up
      header.classList.remove('scroll-down');
      header.classList.add('scroll-up');
    }
    
    lastScroll = currentScroll;
  });
}

// Handle mobile menu toggle
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    mobileMenu.classList.toggle('hidden');
    
    // Toggle body scroll
    document.body.style.overflow = isExpanded ? '' : 'hidden';
  });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
});

// Handle contact form submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const formObject = Object.fromEntries(formData.entries());
    
    // Here you would typically send the form data to a server
    console.log('Form submitted:', formObject);
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative';
    successMessage.setAttribute('role', 'alert');
    successMessage.innerHTML = `
      <strong class="font-bold">Thank you!</strong>
      <span class="block sm:inline">Your message has been sent. We'll get back to you soon!</span>
    `;
    
    const formContainer = contactForm.parentElement;
    formContainer.insertBefore(successMessage, contactForm);
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Reset form
    contactForm.reset();
    
    // Remove success message after 5 seconds
    setTimeout(() => {
      successMessage.style.opacity = '0';
      setTimeout(() => {
        successMessage.remove();
      }, 300);
    }, 5000);
  });
}

// Lazy load images
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.add('opacity-100');
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '200px 0px',
    threshold: 0.01
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Add loading class to body
const body = document.body;
let timer;

window.addEventListener('load', () => {
  clearTimeout(timer);
  body.classList.add('loaded');
});

// Fallback in case load event doesn't fire
setTimeout(() => {
  body.classList.add('loaded');
}, 3000);

// Handle dark mode toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (darkModeToggle) {
  // Check for saved user preference, if any, on load
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  // Apply the saved theme
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    darkModeToggle.checked = true;
  }
  
  // Toggle theme when the toggle is clicked
  darkModeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  });
}

// Handle scroll to top button
const scrollToTopBtn = document.getElementById('scroll-to-top');
if (scrollToTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.classList.remove('opacity-0', 'invisible');
      scrollToTopBtn.classList.add('opacity-100', 'visible');
    } else {
      scrollToTopBtn.classList.remove('opacity-100', 'visible');
      scrollToTopBtn.classList.add('opacity-0', 'invisible');
    }
  });
  
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
