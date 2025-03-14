/**
 * FINAL MUSIC REACTIVE FLOATING HEADS
 * This version addresses cross-origin restrictions and floating head class detection
 */

(function() {
    console.log("🎧 Music Reactive Heads: Loading");
  
    // Configuration
    const config = {
      minSpinInterval: 3000,   // Min time between spins (3s)
      maxSpinInterval: 10000,  // Max time between spins (10s)
      spinChance: 0.7,         // 70% chance of spinning when triggered
      spinDuration: 800,       // Base duration of one spin (ms)
      debug: true              // Enable debug logs
    };
  
    // State tracking
    let isMusicPlaying = false;
    let spinInterval = null;
    let headElements = [];
    let initialized = false;
  
    // Try multiple selectors to find the head elements
    function findHeadElements() {
      // Try different possible selectors for the heads
      const selectors = [
        '.floating-head',           // Standard class from our script
        '.head-element',            // Alternative class
        '#floating-heads img',      // Images inside floating-heads container
        '.floating-heads-container img', // Another possibility
        '.floating-heads img',      // Another container class
        'img[src*="head"]',         // Images with "head" in the src
        'img[src*="5_heads"]'       // Images from the 5_heads directory
      ];
  
      // Try each selector
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`🎧 Music Reactive Heads: Found ${elements.length} heads using "${selector}" selector`);
          headElements = Array.from(elements);
          return true;
        }
      }
  
      // Try one last approach - look for images loaded from the 5_heads directory
      // or with head in the filename
      const allImages = document.querySelectorAll('img');
      const likelyHeads = Array.from(allImages).filter(img => {
        const src = img.src.toLowerCase();
        return src.includes('head') || src.includes('5_heads');
      });
  
      if (likelyHeads.length > 0) {
        console.log(`🎧 Music Reactive Heads: Found ${likelyHeads.length} likely head images based on src`);
        headElements = likelyHeads;
        return true;
      }
  
      console.log("🎧 Music Reactive Heads: No heads found, will try again later");
      return false;
    }
  
    // Inject the necessary CSS for animations
    function injectCSS() {
      if (document.getElementById('spin-animation-css')) return;
  
      const css = `
        @keyframes head-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
  
        .spinning-head {
          animation: head-spin var(--spin-duration, 0.8s) ease-in-out;
        }
      `;
  
      const style = document.createElement('style');
      style.id = 'spin-animation-css';
      style.textContent = css;
      document.head.appendChild(style);
      
      console.log("🎧 Music Reactive Heads: CSS injected");
    }
  
    // Initialize the script
    function init() {
      if (initialized) return;
      
      console.log("🎧 Music Reactive Heads: Initializing");
      
      // Inject CSS for animations
      injectCSS();
      
      // Look for head elements
      findHeadElements();
      
      // Set up detection for Soundcloud
      setupMusicDetection();
      
      // Mark as initialized
      initialized = true;
      
      // Periodically check for new head elements
      setInterval(() => {
        if (headElements.length === 0) {
          findHeadElements();
        }
      }, 5000);
    }
  
    // Set up detection for music playback
    function setupMusicDetection() {
      // Method 1: Listen for Soundcloud iframe messages
      window.addEventListener('message', (event) => {
        try {
          // Only process messages that seem to be from Soundcloud
          if (event.origin.includes('soundcloud.com') && typeof event.data === 'object') {
            // Check for playerState property
            if (event.data.soundcloud && event.data.soundcloud.playerState) {
              const newState = event.data.soundcloud.playerState === 'playing';
              
              // Only update if state changed
              if (newState !== isMusicPlaying) {
                console.log(`🎧 Music Reactive Heads: Music ${newState ? 'started' : 'stopped'} playing`);
                isMusicPlaying = newState;
                
                if (newState) {
                  startRandomSpins();
                } else {
                  stopRandomSpins();
                }
              }
            }
          }
        } catch (e) {
          // Silently handle cross-origin errors
          if (!e.toString().includes('cross-origin')) {
            console.error('Error handling Soundcloud message:', e);
          }
        }
      });
  
      // Method 2: Check for iframe changes directly
      const observer = new MutationObserver((mutations) => {
        const iframes = document.querySelectorAll('iframe[src*="soundcloud.com"]');
        iframes.forEach(iframe => {
          // Add API parameter if not present
          if (!iframe.src.includes('api_widget=1') && !iframe.hasAttribute('data-api-added')) {
            try {
              const newSrc = iframe.src + (iframe.src.includes('?') ? '&' : '?') + 'api_widget=1';
              iframe.src = newSrc;
              iframe.setAttribute('data-api-added', 'true');
              console.log("🎧 Music Reactive Heads: Added API to Soundcloud iframe");
            } catch (e) {
              console.log("🎧 Music Reactive Heads: Couldn't update iframe src");
            }
          }
        });
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Check existing iframes
      const existingIframes = document.querySelectorAll('iframe[src*="soundcloud.com"]');
      existingIframes.forEach(iframe => {
        if (!iframe.src.includes('api_widget=1') && !iframe.hasAttribute('data-api-added')) {
          try {
            const newSrc = iframe.src + (iframe.src.includes('?') ? '&' : '?') + 'api_widget=1';
            iframe.src = newSrc;
            iframe.setAttribute('data-api-added', 'true');
            console.log("🎧 Music Reactive Heads: Added API to existing Soundcloud iframe");
          } catch (e) {
            console.log("🎧 Music Reactive Heads: Couldn't update existing iframe src");
          }
        }
      });
      
      console.log(`🎧 Music Reactive Heads: Detected ${existingIframes.length} Soundcloud iframes`);
    }
  
    // Start the random spinning system
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
  
    // Schedule the next random spin
    function scheduleNextSpin() {
      if (spinInterval) {
        clearTimeout(spinInterval);
      }
      
      const delay = Math.floor(
        Math.random() * (config.maxSpinInterval - config.minSpinInterval) + 
        config.minSpinInterval
      );
      
      spinInterval = setTimeout(() => {
        if (isMusicPlaying) {
          if (Math.random() < config.spinChance) {
            spinRandomHead();
          }
          scheduleNextSpin();
        }
      }, delay);
      
      if (config.debug) {
        console.log(`🎧 Music Reactive Heads: Next potential spin in ${Math.round(delay/1000)}s`);
      }
    }
  
    // Spin a random head
    function spinRandomHead() {
      // Make sure we have heads
      if (headElements.length === 0) {
        if (!findHeadElements()) return;
      }
      
      // Pick a random head
      const index = Math.floor(Math.random() * headElements.length);
      const head = headElements[index];
      
      // Skip if already spinning (has the class or inline animation)
      if (head.classList.contains('spinning-head') || 
          (head.style.animation && head.style.animation.includes('spin'))) {
        console.log(`🎧 Music Reactive Heads: Head already spinning, trying another`);
        if (headElements.length > 1) {
          spinRandomHead();
        }
        return;
      }
      
      // Apply animation using most compatible method
      const numSpins = Math.floor(Math.random() * 3) + 1; // 1-3 spins
      const duration = config.spinDuration * numSpins;
      
      console.log(`🎧 Music Reactive Heads: Spinning head with ${numSpins} rotation(s)`);
      
      // Method 1: Try using CSS class
      head.style.setProperty('--spin-duration', `${duration}ms`);
      head.classList.add('spinning-head');
      
      // Method 2: Fallback to inline style
      if (window.getComputedStyle(head).animationName !== 'head-spin') {
        head.style.animation = `head-spin ${duration}ms ease-in-out`;
      }
      
      // Reset after animation completes
      setTimeout(() => {
        head.classList.remove('spinning-head');
        head.style.animation = '';
      }, duration + 50);
    }
  
    // Force music state (for testing)
    window.toggleMusicHeads = function(state) {
      isMusicPlaying = state !== undefined ? !!state : !isMusicPlaying;
      
      if (isMusicPlaying) {
        console.log("🎧 Music Reactive Heads: Manually started");
        startRandomSpins();
      } else {
        console.log("🎧 Music Reactive Heads: Manually stopped");
        stopRandomSpins();
      }
      
      return `Music state set to: ${isMusicPlaying ? 'playing' : 'stopped'}`;
    };
  
    // Force a head spin (for testing)
    window.spinHeadNow = function() {
      spinRandomHead();
      return "Spinning a random head";
    };
  
    // Initialize
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();