// Add keyboard navigation to dropdown menus
export function initDropdownAccessibility() {
  const dropdowns = document.querySelectorAll('[data-dropdown]');
  
  dropdowns.forEach(dropdown => {
    const button = dropdown.querySelector('[data-dropdown-button]');
    const menu = dropdown.querySelector('[data-dropdown-menu]');
    
    if (!button || !menu) return;
    
    // Toggle menu on button click
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isExpanded));
      menu.hidden = isExpanded;
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        button.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
      }
    });
    
    // Handle keyboard navigation
    const menuItems = menu.querySelectorAll('a, button, [tabindex="0"]');
    const firstItem = menuItems[0];
    const lastItem = menuItems[menuItems.length - 1];
    
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      } else if (e.key === 'ArrowDown' && menu.hidden) {
        e.preventDefault();
        button.click();
        if (firstItem) firstItem.focus();
      }
    });
    
    menuItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        const nextItem = menuItems[index + 1];
        const prevItem = menuItems[index - 1];
        
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            if (nextItem) nextItem.focus();
            else firstItem.focus();
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (prevItem) prevItem.focus();
            else lastItem.focus();
            break;
          case 'Escape':
            e.preventDefault();
            button.focus();
            button.click();
            break;
        }
      });
    });
  });
}

// Add skip to main content link
export function addSkipToContent() {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'skip-to-content';
  skipLink.textContent = 'Skip to main content';
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  // Add styles for the skip link
  const style = document.createElement('style');
  style.textContent = `
    .skip-to-content {
      position: absolute;
      top: -100px;
      left: 0;
      background: #000;
      color: white;
      padding: 12px;
      z-index: 100;
      opacity: 0;
      transition: opacity 0.3s, top 0.3s;
    }
    .skip-to-content:focus {
      top: 0;
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
}

// Initialize all accessibility features
export function initAccessibility() {
  if (typeof document !== 'undefined') {
    addSkipToContent();
    document.addEventListener('DOMContentLoaded', () => {
      initDropdownAccessibility();
      
      // Add focus styles for keyboard navigation
      document.body.classList.add('js-focus-visible');
      
      // Handle focus styles for keyboard users
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          document.body.classList.add('using-keyboard');
        }
      });
      
      document.addEventListener('mousedown', () => {
        document.body.classList.remove('using-keyboard');
      });
    });
  }
}
