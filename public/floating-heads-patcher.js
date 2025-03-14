/**
 * FLOATING HEADS PATCHER
 * This script patches the existing floating-heads.js implementation
 * with music reactive spinning functionality
 */

(function() {
    console.log("🎧 EN5EMBLE Patcher: Loading");
    
    // Configuration
    const config = {
      minSpinInterval: 3000,   // Min time between spins (ms)
      maxSpinInterval: 8000,   // Max time between spins (ms)
      spinChance: 0.7,         // Chance of spinning when triggered
      debug: true              // Enable debug logs
    };
    
    // State tracking
    let isMusicPlaying = false;
    let spinInterval = null;
    let originalCreateHeads = null;
    let headElements = [];
    
    // Wait for the original floating-heads.js to load and patch it
    function patchFloatingHeads() {
      // Check if it's already loaded
      if (window.floatingHeadsSystem) {
        console.log("🎧 EN5EMBLE Patcher: Found existing floating heads system");
        attachToExistingSystem();
        return;
      }
      
      // No existing system, need to patch the loading process
      console.log("🎧 EN5EMBLE Patcher: Waiting for floating-heads.js to load");
      
      // Function to hook when image elements are added to the DOM
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length) {
            // Check each added node for floating head images
            mutation.addedNodes.forEach(node => {
              // If this is an element node
              if (node.nodeType === Node.ELEMENT_NODE) {
                // If it's an image with src containing 5_heads
                if (node.tagName === 'IMG' && 
                    node.src && node.src.includes('5_heads')) {
                  console.log("🎧 EN5EMBLE Patcher: Found a head image being added to DOM");
                  registerHeadElement(node);
                }
                
                // Check for contained images as well (if it's a container)
                const containedHeads = node.querySelectorAll('img[src*="5_heads"]');
                if (containedHeads.length > 0) {
                  console.log(`🎧 EN5EMBLE Patcher: Found ${containedHeads.length} head images in a container`);
                  containedHeads.forEach(registerHeadElement);
                }
              }
            });
          }
        }
      });
      
      // Start observing the entire document
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Also check for existing head images
      const existingHeads = document.querySelectorAll('img[src*="5_heads"]');
      if (existingHeads.length > 0) {
        console.log(`🎧 EN5EMBLE Patcher: Found ${existingHeads.length} existing head images`);
        existingHeads.forEach(registerHeadElement);
      }
    }
    
    // Register a head element for spinning
    function registerHeadElement(element) {
      // Skip if we've already registered this element
      if (headElements.includes(element) || element.dataset.spinRegistered) {
        return;
      }
      
      // Mark as registered to avoid duplicates
      element.dataset.spinRegistered = 'true';
      headElements.push(element);
      
      console.log(`🎧 EN5EMBLE Patcher: Registered head (total: ${headElements.length})`);
      
      // Make sure we have the required CSS
      ensureSpinCSS();
    }
    
    // Attach to an existing floating heads system
    function attachToExistingSystem() {
      const system = window.floatingHeadsSystem;
      
      // If the system has heads, register them
      if (system.heads && system.heads.length > 0) {
        system.heads.forEach(head => {
          if (head instanceof HTMLElement) {
            registerHeadElement(head);
          } else if (head.element instanceof HTMLElement) {
            registerHeadElement(head.element);
          }
        });
      }
      
      // If it's a class/object with a createHeads method, patch that too
      if (typeof system.createHeads === 'function' && !originalCreateHeads) {
        originalCreateHeads = system.createHeads;
        system.createHeads = function(...args) {
          const result = originalCreateHeads.apply(this, args);
          
          // After creating heads, register them for spinning
          if (this.heads && this.heads.length > 0) {
            this.heads.forEach(head => {
              if (head instanceof HTMLElement) {
                registerHeadElement(head);
              } else if (head.element instanceof HTMLElement) {
                registerHeadElement(head.element);
              }
            });
          }
          
          return result;
        };
        
        console.log("🎧 EN5EMBLE Patcher: Patched createHeads method");
      }
    }
    
    // Ensure the spin animation CSS exists
    function ensureSpinCSS() {
      if (document.getElementById('floating-heads-spin-css')) {
        return;
      }
      
      const style = document.createElement('style');
      style.id = 'floating-heads-spin-css';
      style.textContent = `
        @keyframes head-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        img[data-spinning="true"] {
          animation: head-spin var(--spin-duration, 0.8s) ease-in-out;
        }
      `;
      
      document.head.appendChild(style);
      console.log("🎧 EN5EMBLE Patcher: Added spin animation CSS");
    }
    
    // Set up music detection
    function setupMusicDetection() {
      console.log("🎧 EN5EMBLE Patcher: Setting up music detection");
      
      // Listen for messages from Soundcloud iframes
      window.addEventListener('message', (event) => {
        // Skip messages not from Soundcloud
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
              console.log(`🎧 EN5EMBLE Patcher: Music ${newState ? 'started' : 'stopped'} playing`);
              isMusicPlaying = newState;
              
              if (newState) {
                startRandomSpins();
              } else {
                stopRandomSpins();
              }
            }
          }
        } catch (e) {
          // Silently handle cross-origin errors
          if (!e.toString().includes('cross-origin')) {
            console.error("Error processing Soundcloud message:", e);
          }
        }
      });
      
      // Find and update Soundcloud iframes to enable messages
      function updateSoundcloudIframes() {
        const iframes = document.querySelectorAll('iframe[src*="soundcloud.com"]');
        let updated = 0;
        
        iframes.forEach(iframe => {
          // Skip if already processed
          if (iframe.dataset.apiEnabled) {
            return;
          }
          
          try {
            // Check if API widget parameter is missing
            if (!iframe.src.includes('api_widget=1')) {
              const newSrc = iframe.src + (iframe.src.includes('?') ? '&' : '?') + 'api_widget=1';
              iframe.src = newSrc;
              iframe.dataset.apiEnabled = 'true';
              updated++;
            }
          } catch (e) {
            console.log("🎧 EN5EMBLE Patcher: Couldn't update iframe", e);
          }
        });
        
        if (updated > 0) {
          console.log(`🎧 EN5EMBLE Patcher: Enabled API for ${updated} Soundcloud iframes`);
        }
        
        return iframes.length;
      }
      
      // Initial update
      const initialCount = updateSoundcloudIframes();
      console.log(`🎧 EN5EMBLE Patcher: Found ${initialCount} Soundcloud iframes initially`);
      
      // Watch for new iframes
      const observer = new MutationObserver(() => {
        updateSoundcloudIframes();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    
    // Start random spinning
    function startRandomSpins() {
      if (spinInterval) {
        return;
      }
      
      console.log("🎧 EN5EMBLE Patcher: Starting random spins");
      
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
        console.log("🎧 EN5EMBLE Patcher: Stopped random spins");
      }
    }
    
    // Schedule the next potential spin
    function scheduleNextSpin() {
      if (spinInterval) {
        clearTimeout(spinInterval);
      }
      
      const delay = Math.floor(
        Math.random() * (config.maxSpinInterval - config.minSpinInterval) + 
        config.minSpinInterval
      );
      
      console.log(`🎧 EN5EMBLE Patcher: Next potential spin in ${Math.round(delay/1000)}s`);
      
      spinInterval = setTimeout(() => {
        if (isMusicPlaying) {
          // Random chance to trigger spin
          if (Math.random() < config.spinChance) {
            spinRandomHead();
          } else {
            console.log("🎧 EN5EMBLE Patcher: Spin skipped (random chance)");
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
        console.log("🎧 EN5EMBLE Patcher: No heads to spin");
        return;
      }
      
      // Pick a random head
      const index = Math.floor(Math.random() * headElements.length);
      const head = headElements[index];
      
      // Skip if already spinning
      if (head.dataset.spinning === 'true') {
        console.log("🎧 EN5EMBLE Patcher: Head already spinning, trying another");
        if (headElements.length > 1) {
          spinRandomHead();
        }
        return;
      }
      
      // Track spinning state
      head.dataset.spinning = 'true';
      
      // Determine spin parameters
      const rotations = Math.floor(Math.random() * 3) + 1; // 1-3 rotations
      const duration = 800 * rotations; // 800ms per rotation
      
      console.log(`🎧 EN5EMBLE Patcher: Spinning head ${index} (${rotations} rotations)`);
      
      // Store original transform to restore later
      const originalTransform = head.style.transform || '';
      const originalTransition = head.style.transition || '';
      
      // Apply the spin using the cleanest method
      head.style.setProperty('--spin-duration', `${duration}ms`);
      
      // Try multiple approaches for maximum browser compatibility
      
      // Approach 1: CSS animation (preferred)
      head.style.animation = `head-spin ${duration}ms ease-in-out`;
      
      // Approach 2: If animation doesn't apply, use transform
      if (!head.style.animation) {
        head.style.transition = `transform ${duration}ms ease-in-out`;
        
        // Force a reflow to ensure the transition applies
        head.offsetHeight; 
        
        head.style.transform = `${originalTransform} rotate(${360 * rotations}deg)`;
      }
      
      // Reset after animation completes
      setTimeout(() => {
        head.style.animation = '';
        head.style.transform = originalTransform;
        head.style.transition = originalTransition;
        head.dataset.spinning = 'false';
        
        console.log(`🎧 EN5EMBLE Patcher: Head ${index} spin complete`);
      }, duration + 50);
    }
    
    // Export test functions
    window.headSpinner = {
      toggleMusic: function(state) {
        isMusicPlaying = (state !== undefined) ? !!state : !isMusicPlaying;
        
        if (isMusicPlaying) {
          startRandomSpins();
        } else {
          stopRandomSpins();
        }
        
        return `Music ${isMusicPlaying ? 'playing' : 'stopped'}`;
      },
      
      spin: function() {
        spinRandomHead();
        return "Spinning a random head";
      },
      
      status: function() {
        return {
          headCount: headElements.length,
          isMusicPlaying: isMusicPlaying,
          hasSpinInterval: !!spinInterval
        };
      },
      
      findHeads: function() {
        const existingHeads = document.querySelectorAll('img[src*="5_heads"]');
        console.log(`Found ${existingHeads.length} heads in DOM`);
        
        if (existingHeads.length > 0) {
          existingHeads.forEach(registerHeadElement);
        }
        
        return `Now tracking ${headElements.length} heads`;
      }
    };
    
    // Initialize
    function init() {
      console.log("🎧 EN5EMBLE Patcher: Initializing");
      
      // Set up music detection
      setupMusicDetection();
      
      // Patch the floating heads system
      patchFloatingHeads();
      
      // Ensure spin CSS is added
      ensureSpinCSS();
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();