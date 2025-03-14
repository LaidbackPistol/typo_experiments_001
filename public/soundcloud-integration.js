// Add a direct stopping method for debugging
window.stopFloatingHeadsMusic = function() {
    isMusicPlaying = false;
    updateFloatingHeadsMode();
    console.log('Manually stopped floating heads music mode');
  };
  
  // Listen for play/pause button clicks as an additional detection method
  document.addEventListener('click', function(e) {
    // Check if we clicked on a SoundCloud play/pause button or waveform
    const target = e.target;
    if (target.closest('.playButton') || 
        target.closest('.playControls') || 
        target.closest('.sc-button-play') ||
        target.closest('.sc-button-pause') ||
        target.closest('.waveform')) {
      
      // Give SoundCloud time to update its state
      setTimeout(checkIfAnyPlaying, 100);
    }
  });/**
   * SoundCloud Music Detection for Floating Heads
   * 
   * This script detects when SoundCloud tracks are playing
   * and makes the floating heads spin randomly when music is on.
   */
  
  // Load the SoundCloud Widget API
  function loadSoundCloudAPI() {
    if (window.SC) return Promise.resolve(); // Already loaded
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // Track music playing state
  let isMusicPlaying = false;
  let soundCloudWidgets = [];
  let headsMusicMode = false;
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    // Load the SoundCloud API
    loadSoundCloudAPI().then(() => {
      console.log('SoundCloud API loaded');
      
      // Initial setup for any existing embeds
      setupSoundCloudWidgets();
      
      // Watch for new SoundCloud embeds (when user clicks on mixes section)
      const mixxsMenuItem = document.querySelector('.menu-item[data-section="mixxs"]');
      if (mixxsMenuItem) {
        mixxsMenuItem.addEventListener('click', function() {
          // Wait for iframes to load
          setTimeout(setupSoundCloudWidgets, 1000);
        });
      }
      
      // Also check when mixesGallery becomes active
      const mixesGallery = document.getElementById('mixes-gallery');
      if (mixesGallery) {
        const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class' && 
                mixesGallery.classList.contains('active')) {
              setTimeout(setupSoundCloudWidgets, 1000);
            }
          });
        });
        
        observer.observe(mixesGallery, { attributes: true });
      }
    }).catch(err => {
      console.error('Failed to load SoundCloud API:', err);
    });
  });
  
  // Set up SoundCloud widgets from iframes
  function setupSoundCloudWidgets() {
    if (!window.SC) {
      console.warn('SoundCloud API not available');
      return;
    }
    
    // Find all SoundCloud iframes
    const iframes = document.querySelectorAll('iframe[src*="soundcloud.com/player"]');
    console.log(`Found ${iframes.length} SoundCloud iframes`);
    
    // Clear existing widgets
    soundCloudWidgets = [];
    
    // Create widget for each iframe
    iframes.forEach((iframe, index) => {
      try {
        const widget = SC.Widget(iframe);
        
        // Set up event listeners
        widget.bind(SC.Widget.Events.PLAY, () => {
          console.log(`SoundCloud track ${index + 1} playing`);
          isMusicPlaying = true;
          updateFloatingHeadsMode();
        });
        
        widget.bind(SC.Widget.Events.PAUSE, () => {
          console.log(`SoundCloud track ${index + 1} paused`);
          // Immediately check if any other tracks are still playing
          setTimeout(checkIfAnyPlaying, 50);
        });
        
        widget.bind(SC.Widget.Events.FINISH, () => {
          console.log(`SoundCloud track ${index + 1} finished`);
          // Immediately check if any other tracks are still playing
          setTimeout(checkIfAnyPlaying, 50);
        });
        
        // Also listen for PLAY_PROGRESS to catch when tracks are stopped
        // in other ways (like clicking at the end of the track)
        widget.bind(SC.Widget.Events.PLAY_PROGRESS, () => {
          // Only check occasionally to avoid performance issues
          if (Math.random() < 0.02) { // 2% chance each progress event
            checkIfAnyPlaying();
          }
        });
        
        soundCloudWidgets.push(widget);
      } catch (error) {
        console.error(`Error setting up SoundCloud widget for iframe ${index}:`, error);
      }
    });
  }
  
  // Check if any track is still playing
  function checkIfAnyPlaying() {
    let anyPlaying = false;
    let checkCount = 0;
    
    // No widgets? Music is definitely not playing
    if (soundCloudWidgets.length === 0) {
      isMusicPlaying = false;
      updateFloatingHeadsMode();
      return;
    }
    
    // Check each widget's state
    soundCloudWidgets.forEach(widget => {
      widget.isPaused(isPaused => {
        checkCount++;
        
        // If not paused, music is playing
        if (!isPaused) {
          anyPlaying = true;
        }
        
        // After checking all widgets, update state if needed
        if (checkCount >= soundCloudWidgets.length) {
          if (isMusicPlaying !== anyPlaying) {
            isMusicPlaying = anyPlaying;
            updateFloatingHeadsMode();
          }
        }
      });
    });
    
    // Set a backup timeout in case callbacks fail
    setTimeout(() => {
      if (checkCount < soundCloudWidgets.length) {
        console.log('Timeout reached while checking play state - forcing check');
        if (isMusicPlaying) {
          // Double-check with getPosition as backup method
          let stillPlaying = false;
          let backupCheckCount = 0;
          
          soundCloudWidgets.forEach(widget => {
            widget.getPosition(position => {
              backupCheckCount++;
              if (position > 0) {
                widget.getDuration(duration => {
                  if (position < duration - 1000) { // Not at the end
                    stillPlaying = true;
                  }
                  
                  if (backupCheckCount >= soundCloudWidgets.length && !stillPlaying) {
                    isMusicPlaying = false;
                    updateFloatingHeadsMode();
                  }
                });
              } else if (backupCheckCount >= soundCloudWidgets.length && !stillPlaying) {
                isMusicPlaying = false;
                updateFloatingHeadsMode();
              }
            });
          });
        }
      }
    }, 500);
     }
  
    // Make isMusicPlaying accessible globally
    window.isMusicPlaying = false;

    // Modify the updateFloatingHeadsMode function to expose the state globally
    function updateFloatingHeadsMode() {
    if (isMusicPlaying === headsMusicMode) return; // No change needed
    
    headsMusicMode = isMusicPlaying;
    window.isMusicPlaying = isMusicPlaying; // Make accessible globally
    
    // Find the FloatingHeads instance
    if (window.floatingHeadsInstance) {
        window.floatingHeadsInstance.setMusicMode(headsMusicMode);
    } else {
        // Try to find the canvas or container
        const canvas = document.getElementById('floating-heads-canvas');
        if (canvas && canvas.__floatingHeads) {
        canvas.__floatingHeads.setMusicMode(headsMusicMode);
        } else {
        // Modify the global config as a fallback
        modifyFloatingHeadsConfig(headsMusicMode);
        }
    }
    
    // This will trigger our music indicator if it's initialized
    if (typeof window.updateMusicIndicator === 'function') {
        window.updateMusicIndicator(isMusicPlaying);
    }
    }

    // Make the function available globally for our indicator to call
    window.updateFloatingHeadsMode = updateFloatingHeadsMode;
  
  // Modify global config as a fallback method
  function modifyFloatingHeadsConfig(musicOn) {
    // Get a reference to the global config
    if (window.FLOATING_HEADS_CONFIG) {
      if (musicOn) {
        // Music playing - increase rotation and randomness
        window.FLOATING_HEADS_CONFIG.rotationRange = 180; // Full rotation
        // Create a new config value if it doesn't exist yet
        window.FLOATING_HEADS_CONFIG.musicModeActive = true;
      } else {
        // Music stopped - restore normal values
        window.FLOATING_HEADS_CONFIG.rotationRange = 8; // Back to normal
        window.FLOATING_HEADS_CONFIG.musicModeActive = false;
      }
      
      console.log(`Floating heads music mode ${musicOn ? 'enabled' : 'disabled'}`);
    }
  }
  
  // Update the FloatingHeads class to include music mode
  // This function modifies the existing FloatingHeads class to add a new method
  function enhanceFloatingHeadsClass() {
    // Don't run this more than once
    if (window.FloatingHeads && window.FloatingHeads.prototype.setMusicMode) return;
    
    // Get the original function
    const OriginalFloatingHeads = window.FloatingHeads;
    
    if (!OriginalFloatingHeads) {
      console.warn('FloatingHeads class not found, cannot enhance');
      return;
    }
    
    // Add new method to prototype
    OriginalFloatingHeads.prototype.setMusicMode = function(enabled) {
      // Store reference to the instance
      window.floatingHeadsInstance = this;
      
      // Apply changes to all heads
      if (this.heads) {
        this.heads.forEach(head => {
          if (enabled) {
            // Music playing - make heads spin faster and more randomly
            head.rotationSpeed = (Math.random() * 5 - 2.5); // -2.5 to 2.5
            head.velocityX += (Math.random() * 0.4 - 0.2);
            head.velocityY += (Math.random() * 0.4 - 0.2);
          } else {
            // Music stopped - restore normal values
            head.rotationSpeed = (Math.random() * 0.3 - 0.15); // Original value
            head.velocityX *= 0.5; // Slow down
            head.velocityY *= 0.5; // Slow down
          }
        });
      }
      
      console.log(`Floating heads music mode ${enabled ? 'enabled' : 'disabled'}`);
    };
  }
  
  // Run the enhancement when the script loads
  enhanceFloatingHeadsClass();
  
  // Also run again when window loads in case the FloatingHeads class loads later
  window.addEventListener('load', function() {
    setTimeout(enhanceFloatingHeadsClass, 1000);
  });