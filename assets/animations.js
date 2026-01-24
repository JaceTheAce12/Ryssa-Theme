/**
 * Magazine-Style Fashion Landing Page
 * Main JavaScript - Vanilla JS Implementation
 * * Includes:
 * - Intersection Observer (Fade In)
 * - Parallax Effect
 * - Header Scroll Behavior
 * - Mobile Menu Toggle
 * - Smooth Scroll
 * - Newsletter Form Handling
 * - Lazy Loading Fallback
 */

(function() {
  'use strict';

  /* ========================================
     HEADER SCROLL BEHAVIOR
     Hide on scroll down, show on scroll up
     ======================================== */

  class HeaderScroll {
    constructor() {
      this.header = document.querySelector('.site-header');
      this.lastScrollY = window.scrollY;
      this.ticking = false;

      if (this.header) {
        this.init();
      }
    }

    init() {
      window.addEventListener('scroll', () => {
        if (!this.ticking) {
          window.requestAnimationFrame(() => {
            this.handleScroll();
            this.ticking = false;
          });
          this.ticking = true;
        }
      }, { passive: true });
    }

    handleScroll() {
      if (!this.header) return;

      const currentScrollY = window.scrollY;

      // Hide header when scrolling down, show when scrolling up
      // Threshold of 100px prevents flickering at top of page
      if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
        this.header.classList.add('site-header--hidden');
      } else {
        this.header.classList.remove('site-header--hidden');
      }

      this.lastScrollY = currentScrollY;
    }
  }


  /* ========================================
     MOBILE MENU TOGGLE
     ======================================== */

  class MobileMenu {
    constructor() {
      this.toggle = document.querySelector('.site-header__menu-toggle');
      this.overlay = document.querySelector('.mobile-nav-overlay');
      this.body = document.body;
      this.scrollbarWidth = 0;
      this.isOpen = false;

      if (this.toggle && this.overlay) {
        this.scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        this.init();
      }
    }

    init() {
      this.toggle.addEventListener('click', () => this.toggleMenu());

      // Close menu when clicking on links inside overlay
      const menuLinks = this.overlay.querySelectorAll('a');
      menuLinks.forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeMenu();
          this.toggle.focus();
        }
      });
    }

    toggleMenu() {
      if (this.isOpen) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    }

    openMenu() {
      this.overlay.classList.add('active');
      this.overlay.setAttribute('aria-hidden', 'false');
      this.toggle.setAttribute('aria-expanded', 'true');
      this.toggle.setAttribute('aria-label', 'Close menu');
      this.body.style.overflow = 'hidden'; // Prevent background scrolling
      this.body.style.paddingRight = `${this.scrollbarWidth}px`; // Prevent layout shift
      this.isOpen = true;

      // Trap focus: Focus first menu item
      const firstLink = this.overlay.querySelector('a');
      if (firstLink) {
        firstLink.focus();
      }
    }

    closeMenu() {
      this.overlay.classList.remove('active');
      this.overlay.setAttribute('aria-hidden', 'true');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.toggle.setAttribute('aria-label', 'Open menu');
      this.body.style.overflow = '';
      this.body.style.paddingRight = '';
      this.isOpen = false;
    }
  }


  /* ========================================
     INTERSECTION OBSERVER - FADE IN ANIMATIONS
     ======================================== */

  class FadeInObserver {
    constructor(scope = document) {
      this.scope = scope;
      this.elements = this.scope.querySelectorAll('.fade-in');
      this.options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is fully in view
      };

      if (this.elements.length > 0) {
        this.init();
      }
    }

    init() {
      if (!('IntersectionObserver' in window)) {
        // Fallback for browsers without IntersectionObserver
        this.elements.forEach(el => el.classList.add('visible'));
        return;
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target;
            
            // Add staggered delay for multiple elements in same grid container
            const delay = this.getStaggerDelay(target);
            
            setTimeout(() => {
              target.classList.add('visible');
            }, delay);
            
            // Stop observing once visible
            this.observer.unobserve(target);
          }
        });
      }, this.options);

      this.elements.forEach(el => this.observer.observe(el));
    }

    getStaggerDelay(element) {
      // Check if element is inside a known grid container
      // If so, calculate delay based on its index
      const parent = element.closest('.ryssa-grid__items, .lookbook-grid, .product-grid__items, .site-footer__grid');
      
      if (parent) {
        // Get all direct children that are likely siblings in the grid
        const siblings = Array.from(parent.children);
        // Find index of current element (or its wrapper article/div)
        const index = siblings.indexOf(element.closest('article') || element.closest('div') || element);
        
        // 100ms delay per item index for subtle ripple effect
        return Math.max(0, index * 100);
      }
      return 0;
    }
  }


  /* ========================================
     PARALLAX EFFECT
     Subtle background movement on scroll
     ======================================== */

  class ParallaxEffect {
    constructor() {
      this.elements = document.querySelectorAll('.parallax-element');
      this.ticking = false;
      this.speed = 0.3; // Adjust for more/less parallax intensity

      if (this.elements.length > 0) {
        this.init();
      }
    }

    init() {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      window.addEventListener('scroll', () => {
        if (!this.ticking) {
          window.requestAnimationFrame(() => {
            this.updateParallax();
            this.ticking = false;
          });
          this.ticking = true;
        }
      }, { passive: true });
    }

    updateParallax() {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      this.elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementHeight = element.offsetHeight;

        // Only apply parallax if element is currently in or near viewport
        if (scrollY + viewportHeight > elementTop && scrollY < elementTop + elementHeight) {
          // Calculate relative scroll position
          const yPos = (scrollY - elementTop) * this.speed;
          
          // Apply transform to children (usually the image) or the element itself
          const target = element.querySelector('img, video, picture') || element;
          target.style.transform = `translateY(${yPos}px)`;
        }
      });
    }
  }


  /* ========================================
     SMOOTH SCROLL FOR ANCHOR LINKS
     ======================================== */

  class SmoothScroll {
    constructor() {
      this.header = document.querySelector('.site-header');
      this.init();
    }

    init() {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const links = document.querySelectorAll('a[href^="#"]');

      links.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');

          // Ignore empty hash
          if (href === '#') return;

          const target = document.querySelector(href);

          if (target) {
            e.preventDefault();

            const headerHeight = this.header ? this.header.offsetHeight : 80;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  }


  /* ========================================
     NEWSLETTER FORM HANDLER
     ======================================== */

  class NewsletterForm {
    constructor() {
      // Select all forms to handle multiple instances (e.g. footer + popup)
      this.forms = document.querySelectorAll('.newsletter-form');
      
      if (this.forms.length > 0) {
        this.init();
      }
    }

    init() {
      this.forms.forEach(form => {
        form.addEventListener('submit', (e) => {
          // Note: In Shopify, we usually let the form submit naturally to /contact
          // unless using AJAX API. This provides basic client-side validation.
          
          const input = form.querySelector('input[type="email"]');
          const messageContainer = form.querySelector('.newsletter-form__message');
          
          if (!input) return;

          const email = input.value.trim();

          if (!this.validateEmail(email)) {
            e.preventDefault(); // Stop submission if invalid
            if (messageContainer) {
              messageContainer.textContent = 'Please enter a valid email address.';
              messageContainer.classList.add('visible', 'error');
              messageContainer.classList.remove('success');
            }
            input.focus();
          }
          // If valid, allow default Shopify submission
        });
      });
    }

    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
  }


  /* ========================================
     IMAGE LAZY LOADING FALLBACK
     (For browsers that don't support native lazy loading)
     ======================================== */

  class LazyLoadImages {
    constructor() {
      this.images = document.querySelectorAll('img[loading="lazy"]');
      
      if (this.images.length > 0) {
        this.init();
      }
    }

    init() {
      // Check if browser supports native lazy loading
      if ('loading' in HTMLImageElement.prototype) {
        return; // Browser supports native lazy loading
      }

      // Fallback to Intersection Observer
      if (!('IntersectionObserver' in window)) {
        // Load all images immediately if no IntersectionObserver support
        this.images.forEach(img => this.loadImage(img));
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px'
      });

      this.images.forEach(img => observer.observe(img));
    }

    loadImage(img) {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
        img.removeAttribute('data-srcset');
      }
    }
  }


  /* ========================================
     PERFORMANCE OPTIMIZATION
     Debounce utility for resize events
     ======================================== */

  function debounce(func, wait = 250) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }


  /* ========================================
     INITIALIZE ALL MODULES
     ======================================== */

  function initializeModules(scope = document) {
    // Initialize all modules with error handling
    try {
      new HeaderScroll();
      new MobileMenu();
      new FadeInObserver(scope); // Pass scope for editor re-init
      new ParallaxEffect();
      new SmoothScroll();
      new NewsletterForm();
      new LazyLoadImages();
    } catch (error) {
      console.warn('Ryssa Theme JS Error:', error);
    }
  }

  // 1. Start on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initializeModules());
  } else {
    initializeModules();
  }

  // 2. Handle Shopify Theme Editor Events
  // Re-initialize animations/JS when a section is reloaded in the editor
  document.addEventListener('shopify:section:load', (event) => {
    initializeModules(event.target);
  });

  /* ========================================
     HANDLE WINDOW RESIZE
     Update parallax and other dynamic elements
     ======================================== */

  window.addEventListener('resize', debounce(() => {
    // Re-calculate positions if needed
    // Typically managed by CSS, but good hook for complex JS layouts
  }, 250));

})();