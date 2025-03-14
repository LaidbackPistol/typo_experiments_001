/**
 * DIRECT FLOATING HEADS HOOK
 * This script directly integrates with the existing floating-heads.js implementation
 * by analyzing the actual DOM structure from the index.html file
 */

(function() {
  console.log("🎧 EN5EMBLE: Direct Heads Hook loaded");
  
  // Configuration
  const config = {
    debug: true,              // Enable debug logs
    minSpinInterval: 3000,    // Min time between spins (ms)
    maxSpinInterval: 8000,    // Max time between spins (ms)
    spinChance: 0.8,          // Chance of spinning when triggered
    spinDuration: 800,        // Base duration for one spin (ms)
    loadTimeout: 5000,        // Max time to wait for heads (ms)
    hookTimeout: 1000,        // Time to wait before hooking into API (ms)
    retryInterval: 1000       // Time between retries (ms)
  };
  
  // State tracking
  let headElements = [];
  let isMusicPlaying = false;
  let spinInterval = null;
  let retryCount = 0;
  let fetchFunction = null;
  let floatingHeadsLoaded = false;
  
  // Start initialization
  init();
  
  // Main initialization function
  function init() {
    console.log("🎧 EN5EMBLE: Initializing");
    
    // Add spin styles
    addSpinStyles();
    
    // Add hooks to catch floating heads as they're created
    addFloatingHeadsHooks();
    
    // Set up Soundcloud detection
    setupSoundcloudDetection();
    
    // Try to find existing floating heads
    findFloatingHeads();
    
    // Define public API
    window.headSpinner = {
      spin: spinRandomHead,
      toggleMusic: toggleMusicState,
      status: getStatus,
      refresh: findFloatingHeads
    };
    
    // Check periodically for new heads
    const checkInterval = setInterval(() => {
      if (headElements.length > 0) {
        clearInterval(checkInterval);
        return;
      }
      
      retryCount++;
      findFloatingHeads();
      
      // After several retries, try a different approach
      if (retryCount > 3) {
        // Try searching for any images that might be the heads
        searchAllImages();
      }
      
      // Stop retrying after a while
      if (retryCount > 10) {
        clearInterval(checkInterval);
        console.log("🎧 EN5EMBLE: Failed to find floating heads after multiple attempts");
      }
    }, config.retryInterval);
  }
  
  // Get current status for testing
  function getStatus() {
    return {
      headCount: headElements.length,
      isMusicPlaying: isMusicPlaying,
      hasSpinInterval: !!spinInterval,
      originalFetchHooked: !!fetchFunction,
      retries: retryCount
    };
  }
  
  // Add styles for head spinning
  function addSpinStyles() {
    if (document.getElementById('head-spin-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'head-spin-styles';
    style.textContent = `
      @keyframes en5embleSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .spinning-head {
        animation: en5embleSpin var(--spin-duration, 0.8s) ease-in-out;
      }
    `;
    
    document.head.appendChild(style);
    console.log("🎧 EN5EMBLE: Added spin animation styles");
  }
  
  // Add hooks to catch floating heads as they're created
  function addFloatingHeadsHooks() {
    // 1. Hook into fetch to detect API calls
    if (!fetchFunction) {
      fetchFunction = window.fetch;
      window.fetch = function(url, options) {
        const fetchResult = fetchFunction.apply(this, arguments);
        
        // If this is a call to the floating-heads API
        if (url && typeof url === 'string' && url.includes('floating-heads')) {
          console.log("🎧 EN5EMBLE: Detected floating-heads API call");
          
          // The fetch has been made, so heads will be loaded soon
          setTimeout(() => {
            findFloatingHeads();
          }, config.hookTimeout);
          
          // Check again a bit later to be sure
          setTimeout(() => {
            findFloatingHeads();
          }, config.hookTimeout * 3);
        }
        
        return fetchResult;
      };
      
      console.log("🎧 EN5EMBLE: Hooked into fetch API");
    }
    
    // 2. Monitor DOM for new elements
    const observer = new MutationObserver((mutations) => {
      let newElementsFound = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          // For each added node
          mutation.addedNodes.forEach(node => {
            // If it's an element
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if it's an image with a src containing "head"
              if (node.tagName === 'IMG' && node.src && 
                  (node.src.includes('5_heads') || node.src.includes('head'))) {
                registerHead(node);
                newElementsFound = true;
              }
              
              // If it's a container, check its children
              const headImages = node.querySelectorAll('img[src*="5_heads"], img[src*="head"]');
              if (headImages.length > 0) {
                headImages.forEach(img => {
                  registerHead(img);
                  newElementsFound = true;
                });
              }
            }
          });
        }
      });
      
      if (newElementsFound) {
        console.log(`🎧 EN5EMBLE: Found new head elements (total: ${headElements.length})`);
      }
    });
    
    // Start observing the entire document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log("🎧 EN5EMBLE: Monitoring DOM for head elements");
  }
  
  // Find floating heads in the DOM
  function findFloatingHeads() {
    console.log("🎧 EN5EMBLE: Searching for floating head elements");
    
    // Check all images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // If the image has "head" in the src
      if (img.src && (img.src.includes('5_heads') || img.src.includes('head'))) {
        registerHead(img);
      }
    });
    
    // Look for the floating heads container
    const container = document.getElementById('floating-heads');
    if (container) {
      console.log("🎧 EN5EMBLE: Found floating-heads container");
      
      // Get all images inside the container
      const containerImages = container.querySelectorAll('img');
      containerImages.forEach(img => {
        registerHead(img);
      });
    }
    
    // Try to access global floating heads if available
    if (window.floatingHeads || window.heads || window.headElements) {
      const globalHeads = window.floatingHeads || window.heads || window.headElements;
      console.log("🎧 EN5EMBLE: Found global head elements reference");
      
      if (Array.isArray(globalHeads)) {
        globalHeads.forEach(head => {
          if (head instanceof HTMLElement) {
            registerHead(head);
          } else if (head.element instanceof HTMLElement) {
            registerHead(head.element);
          }
        });
      }
    }
    
    // Look for any script variables that might contain the heads
    const scripts = document.querySelectorAll('script:not([src])');
    scripts.forEach(script => {
      const content = script.textContent || '';
      if (content.includes('5_heads') || 
          content.includes('floating-head') || 
          content.includes('head.png')) {
        console.log("🎧 EN5EMBLE: Found script with potential head references");
      }
    });
    
    return headElements.length;
  }
  
  // Search all images as a last resort
  function searchAllImages() {
    console.log("🎧 EN5EMBLE: Searching all images as last resort");
    
    // Get all images
    const allImages = document.querySelectorAll('img');
    console.log(`🎧 EN5EMBLE: Found ${allImages.length} total images on page`);
    
    // If we have very few head elements, consider all images
    if (headElements.length < 2 && allImages.length > 0 && allImages.length < 20) {
      console.log("🎧 EN5EMBLE: Using all images as fallback");
      
      allImages.forEach(img => {
        if (!headElements.includes(img)) {
          registerHead(img);
        }
      });
    }
  }
  
  // Register a head element
  function registerHead(element) {
    // Skip if already registered
    if (headElements.includes(element) || element.dataset.headRegistered) {
      return false;
    }
    
    // Register the element
    headElements.push(element);
    element.dataset.headRegistered = 'true';
    
    console.log(`🎧 EN5EMBLE: Registered head element (total: ${headElements.length})`);
    
    return true;
  }
  
  // Set up detection for Soundcloud playback
  function setupSoundcloudDetection() {
    console.log("🎧 EN5EMBLE: Setting up Soundcloud detection");
    
    // Listen for Soundcloud messages
    window.addEventListener('message', event => {
      // Only handle messages from Soundcloud
      if (!event.origin.includes('soundcloud.com')) {
        return;
      }
      
      try {
        // Check for player state messages
        if (typeof event.data === 'object' && 
            event.data.soundcloud && 
            event.data.soundcloud.playerState) {
          
          const newState = event.data.soundcloud.playerState === 'playing';
          
          // Only update if state changed
          if (newState !== isMusicPlaying) {
            console.log(`🎧 EN5EMBLE: Music ${newState ? 'started' : 'stopped'} playing`);
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
        
        // Add API parameter if needed
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
        console.log(`🎧 EN5EMBLE: Enabled API for ${updated} Soundcloud iframes`);
      }
      
      return iframes.length;
    }
    
    // Initial update
    const initialCount = updateIframes();
    
    // Watch for new iframes
    const observer = new MutationObserver(() => {
      updateIframes();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log(`🎧 EN5EMBLE: Found ${initialCount} Soundcloud iframes initially`);
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
  
  // Start random spinning
  function startRandomSpins() {
    if (spinInterval) return;
    
    console.log("🎧 EN5EMBLE: Starting random spins");
    
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
      console.log("🎧 EN5EMBLE: Stopped random spins");
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
    
    console.log(`🎧 EN5EMBLE: Next potential spin in ${Math.round(delay/1000)}s`);
    
    spinInterval = setTimeout(() => {
      if (isMusicPlaying) {
        // Random chance to trigger spin
        if (Math.random() < config.spinChance) {
          spinRandomHead();
        } else {
          console.log("🎧 EN5EMBLE: Spin skipped (random chance)");
        }
        
        // Schedule next spin
        scheduleNextSpin();
      }
    }, delay);
  }
  
  // Spin a random head
  function spinRandomHead() {
    // Make sure we have heads to spin
    if (headElements.length === 0) {
      // Try to find heads again
      findFloatingHeads();
      
      if (headElements.length === 0) {
        console.log("🎧 EN5EMBLE: No heads to spin");
        return false;
      }
    }
    
    // Choose a random head
    const index = Math.floor(Math.random() * headElements.length);
    const head = headElements[index];
    
    // Validate the head is a real element
    if (!head || !head.tagName) {
      console.log("🎧 EN5EMBLE: Invalid head element, removing from list");
      headElements.splice(index, 1);
      return spinRandomHead();
    }
    
    // Skip if already spinning
    if (head.dataset.spinning === 'true' || head.classList.contains('spinning-head')) {
      console.log("🎧 EN5EMBLE: Head already spinning, trying another");
      
      if (headElements.length > 1) {
        return spinRandomHead();
      }
      return false;
    }
    
    // Mark as spinning
    head.dataset.spinning = 'true';
    
    // Choose number of rotations (1-3)
    const rotations = Math.floor(Math.random() * 3) + 1;
    const duration = config.spinDuration * rotations;
    
    console.log(`🎧 EN5EMBLE: Spinning head ${index} (${rotations} rotations)`);
    
    // Store original styles
    const originalTransform = head.style.transform || '';
    const originalTransition = head.style.transition || '';
    
    // Set up the animation
    head.style.setProperty('--spin-duration', `${duration}ms`);
    
    // Try multiple animation methods for best compatibility
    
    // Method 1: CSS class
    head.classList.add('spinning-head');
    
    // Method 2: Direct animation style
    if (!head.classList.contains('spinning-head') || 
        window.getComputedStyle(head).animationName !== 'en5embleSpin') {
      head.style.animation = `en5embleSpin ${duration}ms ease-in-out`;
    }
    
    // Method 3: Transform 
    if (!head.style.animation) {
      head.style.transition = `transform ${duration}ms ease-in-out`;
      
      // Force reflow
      head.offsetHeight;
      
      head.style.transform = `${originalTransform} rotate(${360 * rotations}deg)`;
    }
    
    // Reset after animation completes
    setTimeout(() => {
      head.classList.remove('spinning-head');
      head.style.animation = '';
      head.style.transform = originalTransform;
      head.style.transition = originalTransition;
      head.dataset.spinning = 'false';
      
      console.log(`🎧 EN5EMBLE: Head ${index} spin complete`);
    }, duration + 100);
    
    return true;
  }
})();


