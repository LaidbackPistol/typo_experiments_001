/**
 * EN5EMBLE COMPATIBLE HEADS SPINNER
 * This script is designed to work with EN5EMBLE's specific floating heads implementation
 */

(function() {
  console.log("🎵 EN5EMBLE: Starting heads spinner");

  // Configuration
  const config = {
    debug: true,                 // Enable console logs
    minSpinInterval: 3000,       // Min time between spins (ms)
    maxSpinInterval: 8000,       // Max time between spins (ms) 
    spinChance: 0.7,             // Chance to spin when triggered
    animationDuration: 800,      // Base duration for one spin (ms)
    checkInterval: 1000,         // How often to check for new heads (ms)
    headContainer: null,         // Will store the heads container reference
    apiPath: '/api/floating-heads', // Path to the API for heads
    headPrefix: '/5_heads/'      // Path prefix for head images
  };

  // State tracking
  let headElements = [];
  let isMusicPlaying = false;
  let spinInterval = null;
  let initialized = false;
  let monitoringStarted = false;
  let observingContainer = false;

  // Main initialization
  function init() {
    if (initialized) return;
    
    console.log("🎵 EN5EMBLE: Initializing");
    
    // Start monitoring for music
    setupMusicMonitoring();
    
    // Try to find existing heads
    findHeadElements();
    
    // Monitor for head elements being added later
    startHeadMonitoring();
    
    initialized = true;
    
    // Expose public API
    window.headSpinner = {
      spin: spinRandomHead,
      toggleMusic: toggleMusicState,
      status: getStatus,
      findHeads: findHeadElements
    };
  }

  // Get current status for debugging
  function getStatus() {
    return {
      initialized,
      headCount: headElements.length,
      isMusicPlaying,
      hasSpinInterval: !!spinInterval,
      containerFound: !!config.headContainer
    };
  }

  // Toggle music playing state
  function toggleMusicState(state) {
    isMusicPlaying = (state !== undefined) ? !!state : !isMusicPlaying;
    
    if (isMusicPlaying) {
      startRandomSpins();
    } else {
      stopRandomSpins();
    }
    
    return `Music ${isMusicPlaying ? 'playing' : 'stopped'}`;
  }

  // Start monitoring for head elements
  function startHeadMonitoring() {
    if (monitoringStarted) return;
    
    console.log("🎵 EN5EMBLE: Starting head monitoring");
    
    // First approach: Intercept the API call for heads
    monitorApiCalls();
    
    // Second approach: Watch for new floating-heads container
    watchForContainer();
    
    // Third approach: Check DOM periodically for head images
    setInterval(findHeadElements, config.checkInterval);
    
    monitoringStarted = true;
  }

  // Monitor API calls to intercept the floating-heads data
  function monitorApiCalls() {
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Override fetch to monitor for the floating-heads API call
    window.fetch = function(url, options) {
      const fetchPromise = originalFetch.apply(this, arguments);
      
      // Check if this is a call to the floating-heads API
      if (url && url.includes('floating-heads')) {
        console.log("🎵 EN5EMBLE: Intercepted floating-heads API call");
        
        // Wait a bit for the heads to be added to the DOM
        setTimeout(findHeadElements, 1000);
        setTimeout(findHeadElements, 2000);
        setTimeout(findHeadElements, 3000);
      }
      
      return fetchPromise;
    };
    
    console.log("🎵 EN5EMBLE: Monitoring API calls");
  }

  // Watch for the container element
  function watchForContainer() {
    // Use MutationObserver to watch for the container
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          // Check each added node
          mutation.addedNodes.forEach(node => {
            // If this is an element node
            if (node.nodeType === Node.ELEMENT_NODE) {
              // If it's the container or has an ID/class suggesting it's related
              if (node.id === 'floating-heads' || 
                  (node.className && node.className.includes('head'))) {
                console.log("🎵 EN5EMBLE: Found potential container", node);
                setupContainerObservation(node);
              }
              
              // Check children for any that might be floating heads
              findHeadElementsIn(node);
            }
          });
        }
      }
    });
    
    // Start observing the body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log("🎵 EN5EMBLE: Watching for container");
  }

  // Set up observation of the container
  function setupContainerObservation(container) {
    if (observingContainer) return;
    
    config.headContainer = container;
    
    // Observe changes to the container
    const observer = new MutationObserver((mutations) => {
      let foundNew = false;
      
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          // For each added node, check if it's a head element
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // If it's an image or has a src with head in it
              if ((node.tagName === 'IMG' && node.src && node.src.includes('head')) ||
                 (node.style && node.style.backgroundImage && node.style.backgroundImage.includes('head'))) {
                registerHeadElement(node);
                foundNew = true;
              }
            }
          });
        }
      }
      
      if (foundNew) {
        console.log(`🎵 EN5EMBLE: Found new heads in container (total: ${headElements.length})`);
      }
    });
    
    // Start observing
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'style']
    });
    
    observingContainer = true;
    console.log("🎵 EN5EMBLE: Observing container for changes");
    
    // Also check existing children
    findHeadElementsIn(container);
  }

  // Find head elements in the DOM
  function findHeadElements() {
    // Search for images with head in the path
    const headImages = document.querySelectorAll('img[src*="5_heads"], img[src*="head"]');
    let newCount = 0;
    
    headImages.forEach(img => {
      if (!headElements.includes(img) && !img.dataset.registeredHead) {
        registerHeadElement(img);
        newCount++;
      }
    });
    
    // Also look for elements with background-image containing head
    const bgElements = document.querySelectorAll('[style*="background-image"]');
    bgElements.forEach(el => {
      const style = window.getComputedStyle(el);
      const bgImage = style.backgroundImage;
      
      if (bgImage && (bgImage.includes('5_heads') || bgImage.includes('head')) &&
          !headElements.includes(el) && !el.dataset.registeredHead) {
        registerHeadElement(el);
        newCount++;
      }
    });
    
    // Look for div containers that might contain the heads
    if (headElements.length === 0) {
      const potentialContainers = document.querySelectorAll('div');
      potentialContainers.forEach(container => {
        // Skip if already checked
        if (container.dataset.checkedContainer) return;
        
        // Mark as checked to avoid rechecking
        container.dataset.checkedContainer = 'true';
        
        // Check if this div has multiple absolutely positioned children
        const absChildren = container.querySelectorAll('[style*="position: absolute"]');
        if (absChildren.length >= 3) {
          console.log(`🎵 EN5EMBLE: Found potential container with ${absChildren.length} absolute children`);
          setupContainerObservation(container);
        }
      });
    }
    
    if (newCount > 0) {
      console.log(`🎵 EN5EMBLE: Found ${newCount} new head elements (total: ${headElements.length})`);
    }
    
    return headElements.length;
  }

  // Find head elements within a specific container
  function findHeadElementsIn(container) {
    // Look for images first
    const images = container.querySelectorAll('img');
    let newCount = 0;
    
    images.forEach(img => {
      // If it has 'head' in the src and isn't already registered
      if (img.src && (img.src.includes('5_heads') || img.src.includes('head')) &&
          !headElements.includes(img) && !img.dataset.registeredHead) {
        registerHeadElement(img);
        newCount++;
      }
    });
    
    // Look for absolutely positioned elements that might be heads
    const absElements = container.querySelectorAll('[style*="position: absolute"]');
    absElements.forEach(el => {
      // Skip if already registered
      if (headElements.includes(el) || el.dataset.registeredHead) return;
      
      // If it has an image child, register the element
      const childImg = el.querySelector('img');
      if (childImg) {
        registerHeadElement(el);
        newCount++;
      }
      // Or if it has a background image with head in it
      else {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;
        
        if (bgImage && (bgImage.includes('5_heads') || bgImage.includes('head'))) {
          registerHeadElement(el);
          newCount++;
        }
      }
    });
    
    if (newCount > 0) {
      console.log(`🎵 EN5EMBLE: Found ${newCount} new head elements in container (total: ${headElements.length})`);
    }
    
    return newCount;
  }

  // Register a head element
  function registerHeadElement(element) {
    // Skip if already registered
    if (headElements.includes(element) || element.dataset.registeredHead) {
      return;
    }
    
    // Register the element
    headElements.push(element);
    element.dataset.registeredHead = 'true';
    
    console.log(`🎵 EN5EMBLE: Registered head element (total: ${headElements.length})`);
    
    // Make sure we have the CSS for spinning
    ensureSpinCSS();
    
    return element;
  }
  
  // Make sure we have the CSS for spinning animation
  function ensureSpinCSS() {
    if (document.getElementById('head-spin-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'head-spin-styles';
    style.textContent = `
      @keyframes headSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .spinning-head {
        animation: headSpin var(--spin-duration, 0.8s) ease-in-out !important;
      }
    `;
    
    document.head.appendChild(style);
    console.log("🎵 EN5EMBLE: Added spin animation CSS");
  }

  // Set up monitoring for music playing state
  function setupMusicMonitoring() {
    console.log("🎵 EN5EMBLE: Setting up music monitoring");
    
    // Listen for Soundcloud messages
    window.addEventListener('message', event => {
      // Skip if not from Soundcloud
      if (!event.origin.includes('soundcloud.com')) {
        return;
      }
      
      try {
        // Check for player state messages
        if (typeof event.data === 'object' && 
            event.data.soundcloud && 
            event.data.soundcloud.playerState) {
          const newState = event.data.soundcloud.playerState === 'playing';
          
          if (newState !== isMusicPlaying) {
            console.log(`🎵 EN5EMBLE: Soundcloud ${newState ? 'started' : 'stopped'} playing`);
            toggleMusicState(newState);
          }
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    });
    
    // Update Soundcloud iframes to enable API
    function updateIframes() {
      const iframes = document.querySelectorAll('iframe[src*="soundcloud.com"]');
      let updated = 0;
      
      iframes.forEach(iframe => {
        // Skip if already processed
        if (iframe.dataset.apiEnabled) return;
        
        // Add API parameter if not present
        if (!iframe.src.includes('api_widget=1')) {
          try {
            const newSrc = iframe.src + (iframe.src.includes('?') ? '&' : '?') + 'api_widget=1';
            iframe.src = newSrc;
            iframe.dataset.apiEnabled = 'true';
            updated++;
          } catch (e) {
            // Ignore errors
          }
        }
      });
      
      if (updated > 0) {
        console.log(`🎵 EN5EMBLE: Enabled API for ${updated} Soundcloud iframes`);
      }
      
      return iframes.length;
    }
    
    // Initial update
    const initialCount = updateIframes();
    console.log(`🎵 EN5EMBLE: Found ${initialCount} Soundcloud iframes initially`);
    
    // Watch for new iframes
    const observer = new MutationObserver(() => {
      updateIframes();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start random spinning
  function startRandomSpins() {
    if (spinInterval) return;
    
    console.log("🎵 EN5EMBLE: Starting random spins");
    
    // Do an initial spin after a short delay
    setTimeout(spinRandomHead, 1000);
    
    // Schedule next spin
    scheduleNextSpin();
  }

  // Stop random spinning
  function stopRandomSpins() {
    if (spinInterval) {
      clearTimeout(spinInterval);
      spinInterval = null;
      console.log("🎵 EN5EMBLE: Stopped random spins");
    }
  }

  // Schedule the next spin
  function scheduleNextSpin() {
    if (spinInterval) {
      clearTimeout(spinInterval);
    }
    
    const delay = Math.floor(
      Math.random() * (config.maxSpinInterval - config.minSpinInterval) + 
      config.minSpinInterval
    );
    
    console.log(`🎵 EN5EMBLE: Next potential spin in ${Math.round(delay/1000)}s`);
    
    spinInterval = setTimeout(() => {
      if (isMusicPlaying) {
        // Random chance to trigger spin
        if (Math.random() < config.spinChance) {
          spinRandomHead();
        } else {
          console.log("🎵 EN5EMBLE: Spin skipped (random chance)");
        }
        
        // Schedule next spin
        scheduleNextSpin();
      }
    }, delay);
  }

  // Spin a random head
  function spinRandomHead() {
    // Refresh head elements if none found
    if (headElements.length === 0) {
      findHeadElements();
      
      if (headElements.length === 0) {
        console.log("🎵 EN5EMBLE: No heads to spin");
        return false;
      }
    }
    
    // Choose a random head
    const index = Math.floor(Math.random() * headElements.length);
    const head = headElements[index];
    
    // Skip if already spinning
    if (head.dataset.spinning === 'true' || head.classList.contains('spinning-head')) {
      console.log("🎵 EN5EMBLE: Head already spinning, trying another");
      
      if (headElements.length > 1) {
        return spinRandomHead();
      }
      return false;
    }
    
    // Mark as spinning
    head.dataset.spinning = 'true';
    
    // Choose number of rotations (1-3)
    const rotations = Math.floor(Math.random() * 3) + 1;
    const duration = config.animationDuration * rotations;
    
    console.log(`🎵 EN5EMBLE: Spinning head ${index} (${rotations} rotations)`);
    
    // Remember original styles
    const originalTransform = head.style.transform || '';
    const originalTransition = head.style.transition || '';
    const originalAnimation = head.style.animation || '';
    
    // Set up the animation
    head.style.setProperty('--spin-duration', `${duration}ms`);
    
    // Method 1: Add class
    head.classList.add('spinning-head');
    
    // Method 2: Use direct animation style (fallback)
    if (!head.classList.contains('spinning-head') || 
        window.getComputedStyle(head).animationName !== 'headSpin') {
      head.style.animation = `headSpin ${duration}ms ease-in-out`;
    }
    
    // Method 3: Use transform (extra fallback)
    if (!head.style.animation && !head.classList.contains('spinning-head')) {
      head.style.transition = `transform ${duration}ms ease-in-out`;
      
      // Force reflow
      head.offsetHeight;
      
      // Apply transform
      if (originalTransform) {
        head.style.transform = `${originalTransform} rotate(${360 * rotations}deg)`;
      } else {
        head.style.transform = `rotate(${360 * rotations}deg)`;
      }
    }
    
    // Reset after animation completes
    setTimeout(() => {
      head.classList.remove('spinning-head');
      head.style.animation = originalAnimation;
      head.style.transform = originalTransform;
      head.style.transition = originalTransition;
      head.dataset.spinning = 'false';
      
      console.log(`🎵 EN5EMBLE: Head ${index} spin complete`);
    }, duration + 100);
    
    return true;
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();