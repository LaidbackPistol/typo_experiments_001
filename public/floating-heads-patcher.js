/**
 * DIRECT DOM INSPECTOR FOR FLOATING HEADS
 * This script directly inspects the DOM structure to find the floating heads
 * and adds spinning capability when music plays
 */

(function() {
  // Start with an immediate self-check
  console.log("🔍 Inspector: Starting DOM analysis");
  
  // Configuration
  const config = {
    debug: true,
    spinDuration: 800,        // Duration of one spin in ms
    spinRotations: [1, 2, 3], // Possible number of rotations
    checkInterval: 500,       // How often to check for new elements (ms)
    musicCheckInterval: 1000  // How often to check for playing music (ms)
  };
  
  // State tracking
  let headElements = [];
  let isMusicPlaying = false;
  let nextSpinTime = 0;
  let musicCheckTimer = null;
  
  // Examine the entire DOM for potential floating head elements
  function inspectDOM() {
    console.log("🔍 Inspector: Searching entire DOM for floating heads");
    
    // 1. Try common selectors first
    const commonSelectors = [
      'img[src*="head"]',
      'img[src*="5_heads"]',
      '.floating-head',
      '#floating-heads img',
      '[style*="position: absolute"]'
    ];
    
    for (const selector of commonSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`🔍 Inspector: Found ${elements.length} potential elements with selector "${selector}"`);
        
        elements.forEach(examineElement);
      }
    }
    
    // 2. Check ALL images
    const allImages = document.querySelectorAll('img');
    console.log(`🔍 Inspector: Examining ${allImages.length} total images on page`);
    
    allImages.forEach(examineElement);
    
    // 3. Check for absolutely positioned elements that might be heads
    const allAbsolute = document.querySelectorAll('[style*="position: absolute"], [style*="position:absolute"]');
    console.log(`🔍 Inspector: Examining ${allAbsolute.length} absolutely positioned elements`);
    
    allAbsolute.forEach(examineElement);
    
    // Final report
    if (headElements.length > 0) {
      console.log(`🔍 Inspector: Successfully identified ${headElements.length} floating head elements`);
    } else {
      console.log("🔍 Inspector: Could not automatically identify floating heads");
      
      // Look for the container based on known path structure
      if (window.floatingHeadsContainer) {
        console.log("🔍 Inspector: Found floating heads container in global scope");
        setupManualHeadFinding();
      } else {
        // Try to find the container
        const containers = Array.from(document.querySelectorAll('div')).filter(div => {
          // Check if this div might be the container
          const hasAbsoluteChildren = div.querySelectorAll('[style*="position: absolute"]').length > 0;
          const hasImgChildren = div.querySelectorAll('img').length > 0;
          return hasAbsoluteChildren || hasImgChildren;
        });
        
        console.log(`🔍 Inspector: Found ${containers.length} potential containers`);
        
        if (containers.length > 0) {
          window.floatingHeadsContainer = containers[0];
          setupManualHeadFinding();
        }
      }
    }
    
    return headElements.length;
  }
  
  // Examine a single element to determine if it's a floating head
  function examineElement(element) {
    // Skip if already registered
    if (headElements.includes(element) || element.dataset.headInspected) {
      return false;
    }
    
    // Mark as inspected to avoid re-processing
    element.dataset.headInspected = 'true';
    
    // Criteria that suggest this might be a floating head
    let score = 0;
    const styles = window.getComputedStyle(element);
    
    // Check src attribute for images
    if (element.tagName === 'IMG') {
      if (element.src && (element.src.includes('head') || element.src.includes('5_heads'))) {
        score += 5;
      }
    }
    
    // Check position and styles
    if (styles.position === 'absolute' || styles.position === 'fixed') {
      score += 2;
    }
    
    // Check for animation or transition properties
    if (styles.animation || styles.transition) {
      score += 1;
    }
    
    // Check size - floating heads are typically not too large
    const width = parseInt(styles.width);
    if (width > 0 && width < 200) {
      score += 1;
    }
    
    // If it has a high confidence score, register it as a head
    if (score >= 3) {
      registerHeadElement(element);
      return true;
    }
    
    return false;
  }
  
  // Register an element as a floating head
  function registerHeadElement(element) {
    // Skip if already registered
    if (headElements.includes(element)) {
      return;
    }
    
    headElements.push(element);
    console.log(`🔍 Inspector: Registered new floating head (total: ${headElements.length})`);
    
    // Ensure we have the CSS for spinning
    ensureSpinCSS();
    
    // Return the element for chaining
    return element;
  }
  
  // Inject CSS for spinning animation if needed
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
        animation: headSpin var(--spin-duration, 0.8s) ease-in-out;
      }
    `;
    
    document.head.appendChild(style);
    console.log("🔍 Inspector: Added spin animation CSS");
  }
  
  // Setup manual head finding method
  function setupManualHeadFinding() {
    // Look for elements added to the container
    const container = window.floatingHeadsContainer;
    
    if (!container) {
      console.log("🔍 Inspector: No container found for manual inspection");
      return;
    }
    
    // Check all children of the container
    Array.from(container.children).forEach(child => {
      // If it's an image or absolutely positioned, it's likely a head
      if (child.tagName === 'IMG' || 
          window.getComputedStyle(child).position === 'absolute') {
        registerHeadElement(child);
      }
    });
    
    // Set up an observer for new elements
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              examineElement(node);
            }
          });
        }
      });
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true
    });
    
    console.log("🔍 Inspector: Set up manual container monitoring");
  }
  
  // Start monitoring for music playback
  function startMusicMonitoring() {
    console.log("🔍 Inspector: Starting music monitoring");
    
    // 1. Monitor Soundcloud via messaging
    window.addEventListener('message', event => {
      // Only process Soundcloud messages
      if (!event.origin.includes('soundcloud.com')) {
        return;
      }
      
      try {
        // Look for playerState messages
        if (typeof event.data === 'object' && 
            event.data.soundcloud && 
            event.data.soundcloud.playerState) {
          const newState = event.data.soundcloud.playerState === 'playing';
          
          if (newState !== isMusicPlaying) {
            console.log(`🔍 Inspector: Music ${newState ? 'started' : 'stopped'} playing`);
            setMusicPlaying(newState);
          }
        }
      } catch (e) {
        // Silently handle cross-origin errors
      }
    });
    
    // 2. Update Soundcloud iframes to enable API
    const updateIframes = () => {
      const iframes = document.querySelectorAll('iframe[src*="soundcloud.com"]');
      let updated = 0;
      
      iframes.forEach(iframe => {
        if (!iframe.dataset.apiEnabled && !iframe.src.includes('api_widget=1')) {
          try {
            const newSrc = iframe.src + (iframe.src.includes('?') ? '&' : '?') + 'api_widget=1';
            iframe.src = newSrc;
            iframe.dataset.apiEnabled = 'true';
            updated++;
          } catch (e) {
            // Ignore errors updating iframe
          }
        }
      });
      
      if (updated > 0) {
        console.log(`🔍 Inspector: Enabled API for ${updated} Soundcloud iframes`);
      }
      
      return iframes.length;
    };
    
    // Do initial update
    updateIframes();
    
    // Watch for new iframes
    const observer = new MutationObserver(() => {
      updateIframes();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // 3. Periodically check audio/video elements
    musicCheckTimer = setInterval(() => {
      const mediaElements = document.querySelectorAll('audio, video');
      
      // Check if any are playing
      const anyPlaying = Array.from(mediaElements).some(media => 
        !media.paused && !media.ended && media.currentTime > 0
      );
      
      if (anyPlaying && !isMusicPlaying) {
        console.log("🔍 Inspector: Detected playing media element");
        setMusicPlaying(true);
      } else if (!anyPlaying && isMusicPlaying) {
        // Don't automatically set to false - could be playing via Soundcloud
      }
    }, config.musicCheckInterval);
  }
  
  // Set music playing state
  function setMusicPlaying(isPlaying) {
    isMusicPlaying = isPlaying;
    
    if (isPlaying) {
      // Schedule first spin
      nextSpinTime = Date.now() + Math.random() * 2000;
      
      // Start checking for spin time
      requestAnimationFrame(checkSpinTime);
    }
  }
  
  // Check if it's time to spin a head
  function checkSpinTime() {
    if (!isMusicPlaying) {
      return;
    }
    
    const now = Date.now();
    
    if (now >= nextSpinTime) {
      // Time to spin!
      spinRandomHead();
      
      // Schedule next spin (3-8 seconds)
      nextSpinTime = now + 3000 + Math.random() * 5000;
    }
    
    // Continue checking
    requestAnimationFrame(checkSpinTime);
  }
  
  // Spin a random head
  function spinRandomHead() {
    if (headElements.length === 0) {
      console.log("🔍 Inspector: No heads to spin");
      return false;
    }
    
    // Choose a random head
    const index = Math.floor(Math.random() * headElements.length);
    const head = headElements[index];
    
    // Skip if already spinning
    if (head.dataset.spinning === 'true' || head.classList.contains('spinning-head')) {
      console.log("🔍 Inspector: Head already spinning, trying another");
      
      if (headElements.length > 1) {
        return spinRandomHead();
      }
      return false;
    }
    
    // Mark as spinning
    head.dataset.spinning = 'true';
    
    // Choose number of rotations (1-3)
    const rotations = config.spinRotations[Math.floor(Math.random() * config.spinRotations.length)];
    const duration = config.spinDuration * rotations;
    
    console.log(`🔍 Inspector: Spinning head #${index} (${rotations} rotations)`);
    
    // Store original transform/transition
    const originalTransform = head.style.transform || '';
    const originalTransition = head.style.transition || '';
    
    // Set spin duration
    head.style.setProperty('--spin-duration', `${duration}ms`);
    
    // Try multiple animation methods for compatibility
    
    // Method 1: CSS class
    head.classList.add('spinning-head');
    
    // Method 2: Direct animation style
    if (!head.classList.contains('spinning-head') || 
        window.getComputedStyle(head).animationName !== 'headSpin') {
      head.style.animation = `headSpin ${duration}ms ease-in-out`;
    }
    
    // Method 3: Transform rotation
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
      
      console.log(`🔍 Inspector: Head #${index} spin complete`);
    }, duration + 50);
    
    return true;
  }
  
  // Public methods for testing
  window.headInspector = {
    // Manually inspect the DOM
    inspect: function() {
      return inspectDOM();
    },
    
    // Get current status
    status: function() {
      return {
        headCount: headElements.length,
        isMusicPlaying: isMusicPlaying,
        nextSpinIn: nextSpinTime > 0 ? Math.max(0, (nextSpinTime - Date.now()) / 1000).toFixed(1) + 's' : 'not scheduled'
      };
    },
    
    // Toggle music state
    toggleMusic: function(state) {
      setMusicPlaying(state !== undefined ? !!state : !isMusicPlaying);
      return `Music ${isMusicPlaying ? 'playing' : 'stopped'}`;
    },
    
    // Manually trigger a spin
    spin: function() {
      const result = spinRandomHead();
      return result ? "Spinning a head" : "Failed to spin (no heads available)";
    },
    
    // Add an element manually
    addHead: function(selector) {
      try {
        const elements = document.querySelectorAll(selector);
        let added = 0;
        
        elements.forEach(el => {
          if (!headElements.includes(el)) {
            registerHeadElement(el);
            added++;
          }
        });
        
        return `Added ${added} elements as heads`;
      } catch (e) {
        return `Error: ${e.message}`;
      }
    }
  };
  
  // Run initial inspection
  inspectDOM();
  
  // Start music monitoring
  startMusicMonitoring();
  
  // Re-check DOM periodically for new heads
  setInterval(() => {
    // Only search again if we haven't found any heads yet
    if (headElements.length === 0) {
      inspectDOM();
    }
  }, config.checkInterval);
  
  console.log("🔍 Inspector: Initialization complete");
})();