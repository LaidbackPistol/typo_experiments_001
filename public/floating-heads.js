/**
 * SIMPLE MODIFICATION FOR FLOATING-HEADS.JS
 * 
 * HOW TO USE:
 * 1. Find your original floating-heads.js file
 * 2. Add this code at the end of that file (before any closing brackets or parentheses)
 * 3. Save the file
 */

// Add spinning functionality to floating heads
(function addSpinToHeads() {
    console.log("Adding spin capability to floating heads");
    
    // Simple configuration
    const spinConfig = {
      minInterval: 3000,   // Minimum time between spins (ms)
      maxInterval: 8000,   // Maximum time between spins (ms)
      spinDuration: 800,   // Base duration for one spin (ms)
      maxRotations: 3      // Maximum number of rotations
    };
    
    // State tracking
    let isMusicPlaying = false;
    let spinInterval = null;
    
    // Add spin animation CSS if needed
    function addSpinStyles() {
      if (document.getElementById('head-spin-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'head-spin-styles';
      style.textContent = `
        @keyframes headSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Spin a random head
    function spinRandomHead() {
      // Check if we have head images
      const heads = document.querySelectorAll('img[src*="5_heads"]');
      if (heads.length === 0) return;
      
      // Select a random head
      const head = heads[Math.floor(Math.random() * heads.length)];
      
      // Skip if already spinning
      if (head.dataset.spinning === 'true') return;
      
      // Mark as spinning
      head.dataset.spinning = 'true';
      
      // Random number of rotations (1-3)
      const rotations = Math.floor(Math.random() * spinConfig.maxRotations) + 1;
      const duration = spinConfig.spinDuration * rotations;
      
      // Apply animation
      const originalTransform = head.style.transform || '';
      head.style.transition = `transform ${duration}ms ease-in-out`;
      
      // Wait for next frame to ensure transition is applied
      requestAnimationFrame(() => {
        head.style.transform = `${originalTransform} rotate(${360 * rotations}deg)`;
      });
      
      // Reset after animation completes
      setTimeout(() => {
        head.style.transition = '';
        head.style.transform = originalTransform;
        head.dataset.spinning = 'false';
      }, duration + 50);
    }
    
    // Start randomly spinning heads
    function startRandomSpins() {
      if (spinInterval) return;
      
      // Do initial spin
      setTimeout(spinRandomHead, 1000);
      
      // Schedule next spin
      spinInterval = setInterval(() => {
        if (isMusicPlaying) {
          spinRandomHead();
        }
      }, Math.floor(Math.random() * 
        (spinConfig.maxInterval - spinConfig.minInterval) + 
        spinConfig.minInterval));
    }
    
    // Stop spinning
    function stopRandomSpins() {
      if (spinInterval) {
        clearInterval(spinInterval);
        spinInterval = null;
      }
    }
    
    // Listen for Soundcloud messages
    window.addEventListener('message', event => {
      if (!event.origin.includes('soundcloud.com')) return;
      
      try {
        if (typeof event.data === 'object' && 
            event.data.soundcloud && 
            event.data.soundcloud.playerState) {
          
          const isPlaying = event.data.soundcloud.playerState === 'playing';
          
          if (isPlaying !== isMusicPlaying) {
            isMusicPlaying = isPlaying;
            
            if (isPlaying) {
              startRandomSpins();
            } else {
              stopRandomSpins();
            }
          }
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    });
    
    // Enable API on Soundcloud iframes
    function enableSoundcloudAPI() {
      const iframes = document.querySelectorAll('iframe[src*="soundcloud.com"]');
      
      iframes.forEach(iframe => {
        if (!iframe.src.includes('api_widget=1')) {
          try {
            iframe.src = iframe.src + (iframe.src.includes('?') ? '&' : '?') + 'api_widget=1';
          } catch (e) {
            // Ignore errors
          }
        }
      });
    }
    
    // Initialize
    function init() {
      addSpinStyles();
      enableSoundcloudAPI();
      
      // Watch for new Soundcloud iframes
      const observer = new MutationObserver(enableSoundcloudAPI);
      observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
      
      // Add testing functions
      window.spinHeads = {
        spin: spinRandomHead,
        toggleMusic: (state) => {
          isMusicPlaying = state !== undefined ? !!state : !isMusicPlaying;
          if (isMusicPlaying) {
            startRandomSpins();
          } else {
            stopRandomSpins();
          }
          return `Music ${isMusicPlaying ? 'playing' : 'stopped'}`;
        }
      };
    }
    
    // If DOM already loaded, initialize now
    if (document.readyState !== 'loading') {
      init();
    } else {
      document.addEventListener('DOMContentLoaded', init);
    }
  })();