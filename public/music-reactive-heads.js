/**
 * IMPROVED MUSIC REACTIVE FLOATING HEADS
 * This version addresses common issues with the implementation
 */

(function() {
    console.log("🎵 Music Reactive Heads: Script loaded");
  
    // Configuration
    const config = {
      minSpinInterval: 3000,  // Minimum time between spins (3 seconds)
      maxSpinInterval: 10000, // Maximum time between spins (10 seconds)
      spinChance: 0.7,        // 70% chance of spinning when interval triggers
      spinsMin: 1,            // Minimum number of spins
      spinsMax: 3,            // Maximum number of spins
      spinDuration: 800,      // Duration of one spin in ms
      debug: true             // Enable debug logs
    };
  
    // State tracking
    let isMusicPlaying = false;
    let spinInterval = null;
    let lastSpinTime = 0;
    let headElements = [];
    let initialized = false;
    let cssInjected = false;
  
    // Main initialization function
    function init() {
      if (initialized) return;
      
      console.log("🎵 Music Reactive Heads: Initializing");
      
      // First ensure CSS is available
      injectCSSIfNeeded();
      
      // Find heads and set up message listeners
      findHeadElements();
      setupSoundcloudDetection();
      
      // Mark as initialized
      initialized = true;
      
      // Set up a repeating check for newly added heads
      setInterval(findHeadElements, 3000);
    }
  
    // Inject required CSS if it's not already present
    function injectCSSIfNeeded() {
      if (cssInjected) return;
      
      console.log("🎵 Music Reactive Heads: Injecting CSS");
      
      const css = `
        @keyframes head-spin-once {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes head-spin-twice {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(360deg); }
          100% { transform: rotate(720deg); }
        }
        
        @keyframes head-spin-thrice {
          0% { transform: rotate(0deg); }
          33% { transform: rotate(360deg); }
          66% { transform: rotate(720deg); }
          100% { transform: rotate(1080deg); }
        }
        
        .head-spinning {
          animation-timing-function: ease-in-out !important;
          animation-fill-mode: forwards !important;
        }
        
        .head-spinning.spin-once {
          animation-name: head-spin-once !important;
        }
        
        .head-spinning.spin-twice {
          animation-name: head-spin-twice !important;
        }
        
        .head-spinning.spin-thrice {
          animation-name: head-spin-thrice !important;
        }
      `;
      
      const styleElem = document.createElement('style');
      styleElem.id = 'music-reactive-heads-css';
      styleElem.innerHTML = css;
      document.head.appendChild(styleElem);
      
      cssInjected = true;
    }
    
    // Find all floating head elements
    function findHeadElements() {
      const foundHeads = document.querySelectorAll('.floating-head');
      
      if (foundHeads.length === 0) {
        console.log("🎵 Music Reactive Heads: No heads found, will check again later");
        return;
      }
      
      // Only update if we found new heads
      if (foundHeads.length !== headElements.length) {
        headElements = foundHeads;
        console.log(`🎵 Music Reactive Heads: Found ${headElements.length} heads`);
      }
    }
    
    // Set up Soundcloud detection
    function setupSoundcloudDetection() {
      console.log("🎵 Music Reactive Heads: Setting up Soundcloud detection");
      
      // Listen for messages from Soundcloud iframes
      window.addEventListener('message', handleSoundcloudMessage);
      
      // Set up observer to find new iframes
      const observer = new MutationObserver((mutations) => {
        const soundcloudIframes = document.querySelectorAll('iframe[src*="soundcloud.com"]');
        if (soundcloudIframes.length > 0) {
          console.log(`🎵 Music Reactive Heads: Found ${soundcloudIframes.length} Soundcloud iframes`);
          setupIframesForAPI(soundcloudIframes);
        }
      });
      
      // Start observing
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Check for existing iframes
      const existingIframes = document.querySelectorAll('iframe[src*="soundcloud.com"]');
      if (existingIframes.length > 0) {
        console.log(`🎵 Music Reactive Heads: Found ${existingIframes.length} existing Soundcloud iframes`);
        setupIframesForAPI(existingIframes);
      }
      
      // Track play/pause directly on Soundcloud iframe
      function setupIframesForAPI(iframes) {
        iframes.forEach(iframe => {
          // Skip if already processed
          if (iframe.dataset.apiSetup) return;
          
          // Mark as processed
          iframe.dataset.apiSetup = 'true';
          
          if (!iframe.src.includes('api_widget=1')) {
            const newSrc = iframe.src + (iframe.src.includes('?') ? '&' : '?') + 'api_widget=1';
            console.log(`🎵 Music Reactive Heads: Updating iframe src to enable API`);
            console.log(`   Old: ${iframe.src}`);
            console.log(`   New: ${newSrc}`);
            iframe.src = newSrc;
          }
        });
      }
    }
    
    // Handle messages from Soundcloud iframes
    function handleSoundcloudMessage(event) {
      // Only process messages from Soundcloud
      if (!event.origin.includes('soundcloud.com')) return;
      
      try {
        // Check if this is a playerState message
        if (typeof event.data === 'object' && 
            event.data.soundcloud && 
            event.data.soundcloud.playerState) {
          
          const newState = event.data.soundcloud.playerState === 'playing';
          
          // Only process if there's a change
          if (newState !== isMusicPlaying) {
            console.log(`🎵 Music Reactive Heads: Music ${newState ? 'started' : 'stopped'} playing`);
            isMusicPlaying = newState;
            
            if (newState) {
              startRandomSpins();
              document.body.classList.add('music-playing');
            } else {
              stopRandomSpins();
              document.body.classList.remove('music-playing');
            }
          }
        }
      } catch (e) {
        console.error('Error processing Soundcloud message:', e);
      }
    }
    
    // Start random spinning of heads
    function startRandomSpins() {
      if (spinInterval) return;
      
      // Do an initial spin after a short delay
      setTimeout(spinRandomHead, 500);
      
      // Schedule next spin
      scheduleNextSpin();
    }
    
    // Stop random spinning
    function stopRandomSpins() {
      if (spinInterval) {
        clearTimeout(spinInterval);
        spinInterval = null;
      }
    }
    
    // Schedule the next spin
    function scheduleNextSpin() {
      if (spinInterval) {
        clearTimeout(spinInterval);
      }
      
      // Random time until next spin
      const nextSpinTime = Math.floor(
        Math.random() * (config.maxSpinInterval - config.minSpinInterval) + 
        config.minSpinInterval
      );
      
      console.log(`🎵 Music Reactive Heads: Next potential spin in ${nextSpinTime}ms`);
      
      spinInterval = setTimeout(() => {
        if (isMusicPlaying) {
          // Random chance to spin
          if (Math.random() < config.spinChance) {
            spinRandomHead();
          } else {
            console.log(`🎵 Music Reactive Heads: Spin skipped (random chance)`);
          }
          
          // Schedule next spin
          scheduleNextSpin();
        }
      }, nextSpinTime);
    }
    
    // Spin a random head
    function spinRandomHead() {
      // Make sure we have heads to spin
      if (headElements.length === 0) {
        findHeadElements();
        if (headElements.length === 0) {
          console.log("🎵 Music Reactive Heads: No heads to spin!");
          return;
        }
      }
      
      // Select a random head
      const randomIndex = Math.floor(Math.random() * headElements.length);
      const head = headElements[randomIndex];
      
      // Skip if already spinning
      if (head.classList.contains('head-spinning')) {
        console.log(`🎵 Music Reactive Heads: Head ${randomIndex} already spinning, trying another`);
        // Try another head if available
        if (headElements.length > 1) {
          spinRandomHead();
        }
        return;
      }
      
      // Determine number of spins (1-3)
      const numSpins = Math.floor(Math.random() * (config.spinsMax - config.spinsMin + 1)) + config.spinsMin;
      const duration = config.spinDuration * numSpins;
      
      // Apply the appropriate animation
      head.classList.add('head-spinning');
      
      // Clear any existing animation class
      head.classList.remove('spin-once', 'spin-twice', 'spin-thrice');
      
      // Add the right animation class
      const spinClass = numSpins === 1 ? 'spin-once' : 
                        numSpins === 2 ? 'spin-twice' : 'spin-thrice';
      head.classList.add(spinClass);
      
      // Set duration
      head.style.animationDuration = `${duration}ms`;
      
      console.log(`🎵 Music Reactive Heads: Spinning head ${randomIndex} (${numSpins} rotations, ${duration}ms)`);
      
      // Remove classes when animation completes
      setTimeout(() => {
        head.classList.remove('head-spinning', spinClass);
        head.style.animationDuration = '';
        console.log(`🎵 Music Reactive Heads: Head ${randomIndex} spin complete`);
      }, duration);
    }
    
    // Test functions for debugging
    window.musicHeadsTest = {
      // Manually spin a head
      spinHead: function() {
        spinRandomHead();
        return "Triggered a head spin";
      },
      
      // Toggle music state for testing
      toggleMusic: function(state) {
        if (state === undefined) {
          isMusicPlaying = !isMusicPlaying;
        } else {
          isMusicPlaying = !!state;
        }
        
        if (isMusicPlaying) {
          startRandomSpins();
          document.body.classList.add('music-playing');
        } else {
          stopRandomSpins();
          document.body.classList.remove('music-playing');
        }
        
        return `Music state set to: ${isMusicPlaying ? 'playing' : 'stopped'}`;
      },
      
      // Find all heads
      findHeads: function() {
        findHeadElements();
        return `Found ${headElements.length} heads`;
      },
      
      // Debug info
      status: function() {
        return {
          initialized,
          cssInjected,
          headCount: headElements.length,
          isMusicPlaying,
          hasSpinInterval: !!spinInterval
        };
      }
    };
    
    // Initialize once DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      // DOM already loaded, initialize immediately
      init();
    }
  })();