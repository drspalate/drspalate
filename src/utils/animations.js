/**
 * Initialize scroll reveal animations
 */
export function initScrollReveal() {
  // Check if IntersectionObserver is supported
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers that don't support IntersectionObserver
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  // Create intersection observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after animation completes to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1, // Trigger when 10% of the element is visible
    rootMargin: '0px 0px -50px 0px' // Adjust when the animation triggers
  });

  // Observe all elements with the 'reveal' class
  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

/**
 * Smooth scroll to an element with offset for fixed header
 * @param {string} target - The target element selector
 * @param {number} [offset=80] - Offset in pixels (default: 80)
 */
export function smoothScrollTo(target, offset = 80) {
  const element = document.querySelector(target);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });

  // Update URL hash without scrolling
  if (history.pushState) {
    history.pushState(null, null, target);
  } else {
    window.location.hash = target;
  }
}

/**
 * Initialize smooth scroll for anchor links
 */
export function initSmoothScroll() {
  // Handle clicks on anchor links
  document.addEventListener('click', (e) => {
    // Check if the clicked element is an anchor link
    if (e.target.matches('a[href^="#"]')) {
      e.preventDefault();
      const target = e.target.getAttribute('href');
      if (target === '#') return;
      smoothScrollTo(target);
    }
  });

  // Handle hash in URL on page load
  if (window.location.hash) {
    // Small timeout to ensure DOM is fully loaded
    setTimeout(() => {
      smoothScrollTo(window.location.hash);
    }, 100);
  }
}

/**
 * Add animation classes to elements when they come into view
 */
export function initAnimateOnScroll() {
  // Check if IntersectionObserver is supported
  if (!('IntersectionObserver' in window)) return;

  const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add animation class when element is in view
        entry.target.classList.add('animate');
        // Unobserve after animation completes
        animateObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  // Observe elements with data-animate attribute
  document.querySelectorAll('[data-animate]').forEach(el => {
    animateObserver.observe(el);
  });
}

/**
 * Initialize all animations
 */
export function initAnimations() {
  if (typeof document === 'undefined') return;
  
  // Initialize scroll reveal
  initScrollReveal();
  
  // Initialize smooth scrolling
  initSmoothScroll();
  
  // Initialize other animations
  initAnimateOnScroll();
  
  // Add loaded class to body when DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
  });
}

// Export all animation functions
export default {
  initScrollReveal,
  smoothScrollTo,
  initSmoothScroll,
  initAnimateOnScroll,
  initAnimations
};
