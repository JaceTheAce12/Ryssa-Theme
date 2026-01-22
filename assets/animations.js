/**
 * Global Animation Handler
 * Handles .fade-in intersection observation and Staggered grid animations.
 * Supports Shopify Theme Editor events.
 */

(function() {
  'use strict';

  const SELECTORS = {
    fadeIn: '.fade-in',
    gridContainer: '.ryssa-grid__items, .ryssa-lookbook-grid, .product-grid__items, .site-footer__grid'
  };

  const CLASSES = {
    visible: 'visible'
  };

  // Main Initialization Function
  function initAnimations(scope = document) {
    
    const elements = scope.querySelectorAll(SELECTORS.fadeIn);
    if (elements.length === 0) return;

    // Fallback for browsers without IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add(CLASSES.visible));
      return;
    }

    const observerOptions = {
      threshold: 0.1, // Trigger when 10% visible
      rootMargin: '0px 0px -50px 0px' // Offset bottom slightly
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          
          // Check if we should stagger this element
          // (If it's inside a grid container)
          const parentGrid = target.closest(SELECTORS.gridContainer);
          
          if (parentGrid) {
            // It's in a grid: Calculate index for delay
            // We convert children to Array to find the index of the current target
            const siblings = Array.from(parentGrid.children); 
            // We look for the closest article/div incase the .fade-in is on the wrapper
            const itemIndex = siblings.indexOf(target.closest('article') || target.closest('div') || target);
            
            // 100ms delay per item index
            const delay = Math.max(0, itemIndex * 100); 

            setTimeout(() => {
              target.classList.add(CLASSES.visible);
            }, delay);

          } else {
            // Not in a grid: Fade in immediately
            target.classList.add(CLASSES.visible);
          }

          // Stop observing once visible
          observer.unobserve(target);
        }
      });
    }, observerOptions);

    elements.forEach(el => observer.observe(el));
  }

  // 1. Run on Page Load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAnimations());
  } else {
    initAnimations();
  }

  // 2. Support Shopify Theme Editor (Re-init when a section loads)
  document.addEventListener('shopify:section:load', (event) => {
    initAnimations(event.target);
  });

})();