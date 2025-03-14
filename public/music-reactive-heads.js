/**
 * INTEGRATED MUSIC REACTIVE HEADS
 * This version integrates directly with the existing floating-heads.js implementation
 */

(function() {
    console.log("🎵 EN5EMBLE Heads: Initializing");
  
    // Configuration
    const config = {
      minSpinInterval: 3000,   // Min time between spins (ms)
      maxSpinInterval: 8000,   // Max time between spins (ms)
      spinChance: 0.8,         // 80% chance of spinning
      debug: true              // Enable debug logs
    };
  
    // State tracking
    let isMusicPlaying = false;
    let spinInterval = null;
    let floatingHeadsSystem = null;
    let initialized = false;
  
    // Main initialization function
    function init() {
      if (initialized) return;
      
      console.log("🎵 EN5EMBLE Heads: Setting up");
      
      // Set up Soundcloud detection
      setupSoundcloudDetection();
      
      // Wait until floating heads system is ready
      waitForFloatingHeads();
      
      initialized = true;
    }
  
    // Wait for floating heads to be available
    function waitForFloatingHeads() {
      // Check if floating heads are already available in the global scope
      if (window.floatingHeadsSystem) {
        console.log("🎵 EN5EMBLE Heads: Found floating heads system in global scope");
        floatingHeadsSystem = window.floatingHeadsSystem;
        return;
      }
      
      // Set up mutation observer to find when heads are added to the DOM
      const observer = new MutationObserver((mutations) => {
        // Look for added IMG elements that could be heads
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length) {
            const headImages = document.querySelectorAll('img[src*="5_heads"]');
            if (headImages.length > 0) {
              console.log(`🎵 EN5EMBLE Heads: Found ${headImages.length} head images in the DOM`);
              
              // Create a direct reference to them for our functions
              floatingHeadsSystem = {
                headElements: Array.from(headImages)
              };
              
              // Store globally for easy access
              window.floatingHeadsSystem = floatingHeadsSystem;
              
              // Stop observing once found
              observer.disconnect();
              return;
            }
          }
        }
      });
      
      // Start observing the document
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Do an initial check
      const existingHeads = document.querySelectorAll('img[src*="5_heads"]');
      if (existingHeads.length > 0) {
        console.log(`🎵 EN5EMBLE Heads: Found ${existingHeads.length} existing head images`);
        floatingHeadsSystem = {
          headElements: Array.from(existingHeads)
        };
        window.floatingHeadsSystem = floatingHeadsSystem;
        observer.disconnect();
      } else {
        console.log("🎵 EN5EMBLE Heads: Waiting for head images to be added to the DOM");
      }
    }
  
    // Set up detection for Soundcloud playback
    function setupSoundcloudDetection() {
      console.log("🎵 EN5EMBLE Heads: Setting up Soundcloud detection");
      
      // Listen for messages from Soundcloud iframes
      window.addEventListener('message', (event) => {
        // Only handle messages from Soundcloud
        if (!event.origin.includes('soundcloud.com')) return;
        
        try {
          // Check for playback state messages
          if (typeof event.data === 'object' && 
              event.data.soundcloud && 
              event.data.soundcloud.playerState) {
            
            const newState = event.data.soundcloud.playerState === 'playing';
            
            // Only update on state change
            if (newState !== isMusicPlaying) {
              console.log(`🎵 EN5EMBLE Heads: Music ${newState ? 'started' : 'stopped'} playing`);
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
            console.error("🎵 EN5EMBLE Heads: Error processing message", e);
          }
        }
      });
      
      // Find and update Soundcloud iframes to enable the API
      const updateSoundcloudIframes = () => {
        const iframes = document.querySelectorAll('iframe[src*="soundcloud.com"]');
        
        iframes.forEach(iframe => {
          // Skip if already processed
          if (iframe.hasAttribute('data-api-added')) return;
          
          // Add API parameter if not present
          if (!iframe.src.includes('api_widget=1')) {
            try {
              const newSrc = iframe.src + (iframe.src.includes('?') ? '&' : '?') + 'api_widget=1';
              iframe.src = newSrc;
              iframe.setAttribute('data-api-added', 'true');
              console.log("🎵 EN5EMBLE Heads: Enabled Soundcloud API for iframe");
            } catch (e) {
              console.log("🎵 EN5EMBLE Heads: Couldn't update iframe src");
            }
          }
        });
        
        return iframes.length;
      };
      
      // Check for iframes when pages change
      const iframeCount = updateSoundcloudIframes();
      console.log(`🎵 EN5EMBLE Heads: Found ${iframeCount} Soundcloud iframes initially`);
      
      // Watch for new iframes being added
      const iframeObserver = new MutationObserver((mutations) => {
        const newCount = updateSoundcloudIframes();
        if (newCount > 0) {
          console.log(`🎵 EN5EMBLE Heads: Updated ${newCount} Soundcloud iframes`);
        }
      });
      
      iframeObserver.observe(document.body, { childList: true, subtree: true });
    }
  
    // Start the random spinning system
    function startRandomSpins() {
      if (spinInterval) return;
      
      console.log("🎵 EN5EMBLE Heads: Starting random spins");
      
      // Initial spin after a short delay
      setTimeout(spinRandomHead, 1000);
      
      // Schedule next spin
      scheduleNextSpin();
    }
  
    // Stop the random spinning
    function stopRandomSpins() {
      if (spinInterval) {
        clearTimeout(spinInterval);
        spinInterval = null;
        console.log("🎵 EN5EMBLE Heads: Stopped random spins");
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
      
      console.log(`🎵 EN5EMBLE Heads: Next potential spin in ${Math.round(delay/1000)}s`);
      
      spinInterval = setTimeout(() => {
        if (isMusicPlaying) {
          if (Math.random() < config.spinChance) {
            spinRandomHead();
          } else {
            console.log("🎵 EN5EMBLE Heads: Spin skipped (random chance)");
          }
          
          // Schedule next spin
          scheduleNextSpin();
        }
      }, delay);
    }
  
    // Spin a random head
    function spinRandomHead() {
      // Make sure floating heads system is available
      if (!floatingHeadsSystem || !floatingHeadsSystem.headElements || floatingHeadsSystem.headElements.length === 0) {
        console.log("🎵 EN5EMBLE Heads: No heads available to spin");
        waitForFloatingHeads(); // Try to find heads again
        return;
      }
      
      // Pick a random head
      const heads = floatingHeadsSystem.headElements;
      const index = Math.floor(Math.random() * heads.length);
      const head = heads[index];
      
      // Skip if already animating
      if (head.classList.contains('spinning') || 
          head.dataset.spinning === 'true' || 
          head.style.animation) {
        console.log("🎵 EN5EMBLE Heads: Head already spinning, trying another");
        
        if (heads.length > 1) {
          spinRandomHead();
        }
        return;
      }
      
      // Mark as spinning to prevent multiple animations
      head.dataset.spinning = 'true';
      
      // Determine number of rotations (1-3)
      const rotations = Math.floor(Math.random() * 3) + 1;
      const duration = 800 * rotations; // 800ms per rotation
      
      console.log(`🎵 EN5EMBLE Heads: Spinning head #${index} (${rotations} rotations)`);
      
      // Apply spin animation
      head.style.transition = 'none'; // Disable existing transitions
      
      // Use CSS animation for the spin
      head.style.animation = `spin${rotations} ${duration}ms ease-in-out`;
      
      // If animation doesn't work, use manual rotation with keyframes
      if (!head.style.animation || window.getComputedStyle(head).animationName === 'none') {
        // Fallback to manual rotation
        head.style.transition = `transform ${duration}ms ease-in-out`;
        head.style.transform = `rotate(${360 * rotations}deg)`;
      }
      
      // Create animation styles if they don't exist
      if (!document.getElementById('head-spin-styles')) {
        const styleElem = document.createElement('style');
        styleElem.id = 'head-spin-styles';
        styleElem.textContent = `
          @keyframes spin1 {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spin2 {
            from { transform: rotate(0deg); }
            to { transform: rotate(720deg); }
          }
          @keyframes spin3 {
            from { transform: rotate(0deg); }
            to { transform: rotate(1080deg); }
          }
        `;
        document.head.appendChild(styleElem);
      }
      
      // Reset after animation completes
      setTimeout(() => {
        head.style.animation = '';
        head.style.transform = '';
        head.style.transition = ''; // Restore original transitions
        delete head.dataset.spinning;
        console.log(`🎵 EN5EMBLE Heads: Head #${index} spin complete`);
      }, duration + 100);
    }
  
    // Create test functions
    window.musicHeads = {
      // Toggle music state
      toggleMusic: function(state) {
        isMusicPlaying = (state !== undefined) ? !!state : !isMusicPlaying;
        
        if (isMusicPlaying) {
          startRandomSpins();
        } else {
          stopRandomSpins();
        }
        
        return `Music state set to: ${isMusicPlaying ? 'playing' : 'stopped'}`;
      },
      
      // Trigger a spin
      spin: function() {
        spinRandomHead();
        return "Triggered a spin";
      },
      
      // Get status
      status: function() {
        return {
          initialized,
          isMusicPlaying,
          hasSpinInterval: !!spinInterval,
          headsFound: floatingHeadsSystem && floatingHeadsSystem.headElements ? 
                     floatingHeadsSystem.headElements.length : 0
        };
      }
    };
  
    // Initialize after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      // DOM already loaded, initialize immediately
      init();
    }
  })();

  