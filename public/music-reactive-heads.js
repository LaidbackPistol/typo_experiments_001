// Music Reactive Floating Heads

// Configuration
const config = {
    minSpinInterval: 3000,  // Minimum time between spins (3 seconds)
    maxSpinInterval: 10000, // Maximum time between spins (10 seconds)
    spinChance: 0.7,        // 70% chance of spinning when interval triggers
    spinsMin: 1,            // Minimum number of spins
    spinsMax: 3,            // Maximum number of spins
    spinDuration: 800,      // Duration of one spin in ms
    debug: false            // Set to true to enable console logs
  };
  
  // State tracking
  let isMusicPlaying = false;
  let spinInterval = null;
  let lastSpinTime = 0;
  let headElements = [];
  
  // Initialize when the DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    setupMusicDetection();
    setupHeadsAnimation();
    
    if (config.debug) {
      console.log('Music reactive heads initialized');
    }
  });
  
  // Setup music playback detection
  function setupMusicDetection() {
    // Check for Soundcloud iframes
    detectSoundcloudPlayback();
    
    // We could add more audio detection methods here in the future
    // e.g., HTML5 audio elements, YouTube embeds, etc.
  }
  
  // Detect Soundcloud playback
  function detectSoundcloudPlayback() {
    // When Soundcloud Widget API is loaded
    window.addEventListener('message', (event) => {
      // Filter messages from Soundcloud iframes
      if (event.origin.includes('soundcloud.com') && typeof event.data === 'object') {
        try {
          // Check if the message contains playback information
          if (event.data.soundcloud && event.data.soundcloud.playerState) {
            const isPlaying = event.data.soundcloud.playerState === 'playing';
            
            // Handle state change
            if (isPlaying !== isMusicPlaying) {
              isMusicPlaying = isPlaying;
              handleMusicStateChange(isPlaying);
              
              if (config.debug) {
                console.log(`Music playback: ${isPlaying ? 'started' : 'stopped'}`);
              }
            }
          }
        } catch (e) {
          if (config.debug) {
            console.error('Error parsing Soundcloud message:', e);
          }
        }
      }
    });
    
    // Alternative approach - observe Soundcloud iframes directly
    const observer = new MutationObserver((mutations) => {
      const soundcloudIframes = document.querySelectorAll('iframe[src*="soundcloud.com"]');
      
      // If we found new iframes, set up detection on them
      if (soundcloudIframes.length > 0) {
        setupSoundcloudIframeDetection(soundcloudIframes);
        
        if (config.debug) {
          console.log(`Found ${soundcloudIframes.length} Soundcloud iframes`);
        }
      }
    });
    
    // Start observing the document for added iframes
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // Initial check for existing iframes
    const existingIframes = document.querySelectorAll('iframe[src*="soundcloud.com"]');
    if (existingIframes.length > 0) {
      setupSoundcloudIframeDetection(existingIframes);
    }
  }
  
  // Set up detection on specific Soundcloud iframes
  function setupSoundcloudIframeDetection(iframes) {
    // Inject code to detect play/pause events in each iframe
    iframes.forEach(iframe => {
      // Skip if already processed
      if (iframe.dataset.musicDetectionSetup) return;
      
      // Mark as processed
      iframe.dataset.musicDetectionSetup = 'true';
      
      // Add event listener for when iframe loads
      iframe.addEventListener('load', () => {
        // Add player API URL parameter if not already present
        if (!iframe.src.includes('api_widget=1')) {
          // Add API widget parameter to enable messaging
          iframe.src = iframe.src + (iframe.src.includes('?') ? '&' : '?') + 'api_widget=1';
        }
      });
      
      // For already loaded iframes
      if (!iframe.src.includes('api_widget=1')) {
        iframe.src = iframe.src + (iframe.src.includes('?') ? '&' : '?') + 'api_widget=1';
      }
    });
  }
  
  // Set up the spinning animations for floating heads
  function setupHeadsAnimation() {
    // Find all floating head elements
    headElements = document.querySelectorAll('.floating-head');
    
    if (headElements.length === 0) {
      if (config.debug) {
        console.log('No floating head elements found. Will check again in 1 second.');
      }
      
      // Try again in 1 second, as the heads might be dynamically added
      setTimeout(setupHeadsAnimation, 1000);
      return;
    }
    
    if (config.debug) {
      console.log(`Found ${headElements.length} floating head elements`);
    }
    
    // Add spinning CSS classes if they don't already exist
    if (!document.getElementById('head-spin-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'head-spin-styles';
      styleEl.textContent = `
        @keyframes head-spin-once {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .head-spinning {
          animation-name: head-spin-once;
          animation-timing-function: ease-in-out;
          animation-fill-mode: forwards;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }
  
  // Handle music state change (playing/stopped)
  function handleMusicStateChange(isPlaying) {
    if (isPlaying) {
      // Start random spinning when music starts
      startRandomSpins();
    } else {
      // Stop random spinning when music stops
      stopRandomSpins();
    }
  }
  
  // Start the random spin interval
  function startRandomSpins() {
    if (spinInterval) return; // Already running
    
    // Initial spin with a small delay
    setTimeout(spinRandomHead, 500);
    
    // Set up interval for future spins
    scheduleNextSpin();
  }
  
  // Schedule the next spin at a random interval
  function scheduleNextSpin() {
    // Clear any existing interval
    if (spinInterval) {
      clearTimeout(spinInterval);
    }
    
    // Random time until next potential spin
    const nextSpinTime = Math.floor(
      Math.random() * (config.maxSpinInterval - config.minSpinInterval) + 
      config.minSpinInterval
    );
    
    spinInterval = setTimeout(() => {
      // Only spin if music is still playing
      if (isMusicPlaying) {
        // Random chance to actually trigger the spin
        if (Math.random() < config.spinChance) {
          spinRandomHead();
        }
        
        // Schedule the next potential spin
        scheduleNextSpin();
      }
    }, nextSpinTime);
    
    if (config.debug) {
      console.log(`Next potential spin in ${nextSpinTime}ms`);
    }
  }
  
  // Stop the random spinning
  function stopRandomSpins() {
    if (spinInterval) {
      clearTimeout(spinInterval);
      spinInterval = null;
    }
  }
  
  // Spin a random floating head
  function spinRandomHead() {
    if (headElements.length === 0) {
      setupHeadsAnimation();
      return;
    }
    
    // Select a random head
    const randomIndex = Math.floor(Math.random() * headElements.length);
    const head = headElements[randomIndex];
    
    // Skip if this head is already spinning
    if (head.classList.contains('head-spinning')) {
      if (config.debug) {
        console.log(`Head ${randomIndex} is already spinning, trying another one`);
      }
      
      // Try to spin another head instead
      if (headElements.length > 1) {
        spinRandomHead();
      }
      return;
    }
    
    // Determine number of spins (1-3)
    const spins = Math.floor(Math.random() * (config.spinsMax - config.spinsMin + 1)) + config.spinsMin;
    const duration = config.spinDuration * spins;
    
    // Apply the spinning animation
    head.style.animationDuration = `${duration}ms`;
    head.classList.add('head-spinning');
    
    if (config.debug) {
      console.log(`Spinning head ${randomIndex} for ${spins} rotations (${duration}ms)`);
    }
    
    // Remove the class when animation is complete
    setTimeout(() => {
      head.classList.remove('head-spinning');
    }, duration);
    
    // Update last spin time
    lastSpinTime = Date.now();
  }
  
  // Additional method to manually trigger a spin (for testing)
  window.triggerHeadSpin = function() {
    spinRandomHead();
    return "Triggered a random head spin!";
  };
  
  // Additional method to manually toggle music state (for testing)
  window.toggleMusicState = function(playing) {
    if (playing === undefined) {
      isMusicPlaying = !isMusicPlaying;
    } else {
      isMusicPlaying = !!playing;
    }
    
    handleMusicStateChange(isMusicPlaying);
    return `Music state set to: ${isMusicPlaying ? 'playing' : 'stopped'}`;
  };