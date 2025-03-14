// Add this CSS to your main styles (in index.html) or to a separate CSS file
const musicIndicatorStyles = `
  /* Music Playing Indicator */
  .music-indicator {
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 36px;
    height: 36px;
    background-color: rgba(0, 0, 0, 0.0);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 101;
    opacity: 0;
    transition: opacity 0.4s ease, transform 0.3s ease;
    pointer-events: none;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transform: scale(0.8);
  }

  .music-indicator.playing {
    opacity: 1;
    transform: scale(1);
  }

  .music-indicator .wave {
    display: flex;
    align-items: center;
    height: 20px;
  }

  .music-indicator .bar {
    width: 2px;
    height: 3px;
    margin: 0 1px;
    background-color: #ffff00;
    border-radius: 1px;
    animation-name: sound-wave;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }

  .music-indicator .bar:nth-child(1) { 
    animation-duration: 0.4s;
    animation-delay: 0.3s;
  }
  .music-indicator .bar:nth-child(2) { 
    animation-duration: 0.5s;
    animation-delay: 0.1s;
  }
  .music-indicator .bar:nth-child(3) { 
    animation-duration: 0.7s;
    animation-delay: 0s;
  }
  .music-indicator .bar:nth-child(4) { 
    animation-duration: 0.3s;
    animation-delay: 0.2s;
  }
  .music-indicator .bar:nth-child(5) { 
    animation-duration: 0.6s;
    animation-delay: 0.1s;
  }

  @keyframes sound-wave {
    0% {
      height: 3px;
    }
    100% {
      height: 15px;
    }
  }

  /* Make sure it's hidden when not in main view */
  .archive-gallery.active ~ .music-indicator,
  .mixes-gallery.active ~ .music-indicator,
  .fullscreen-viewer.active ~ .music-indicator {
    opacity: 0 !important;
    visibility: hidden !important;
  }
`;

// Create and inject the styles
function injectMusicIndicatorStyles() {
  const styleEl = document.createElement('style');
  styleEl.textContent = musicIndicatorStyles;
  document.head.appendChild(styleEl);
}

// Create the indicator HTML element
function createMusicIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'music-indicator';
  
  // Create wave animation elements
  const wave = document.createElement('div');
  wave.className = 'wave';
  
  // Add 5 bars for the sound wave visualization
  for (let i = 0; i < 5; i++) {
    const bar = document.createElement('div');
    bar.className = 'bar';
    wave.appendChild(bar);
  }
  
  indicator.appendChild(wave);
  document.body.appendChild(indicator);
  
  return indicator;
}

// Initialize the music indicator system
function initMusicIndicator() {
  // First inject the styles
  injectMusicIndicatorStyles();
  
  // Create the indicator element
  const indicator = createMusicIndicator();
  
  // Track original updateFloatingHeadsMode function to hook into it
  const originalUpdateFunction = window.updateFloatingHeadsMode;
  
  // Override the updateFloatingHeadsMode function to include our indicator
  window.updateFloatingHeadsMode = function(forcedState) {
    // Call the original function first
    if (typeof originalUpdateFunction === 'function') {
      originalUpdateFunction.call(this, forcedState);
    }
    
    // Get the current music playing state
    const isPlaying = (forcedState !== undefined) ? forcedState : window.isMusicPlaying;
    
    // Update the indicator
    if (isPlaying) {
      indicator.classList.add('playing');
    } else {
      indicator.classList.remove('playing');
    }
  };
  
  // Add direct method to check music status from console
  window.checkMusicIndicator = function() {
    console.log('Music playing:', window.isMusicPlaying);
    window.updateFloatingHeadsMode();
  };
  
  // Handle visibility changes when navigating between sections
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      // If we're returning to the main screen and music is playing,
      // make sure indicator is shown
      if (!document.querySelector('.menu-item.active') && window.isMusicPlaying) {
        setTimeout(() => {
          indicator.classList.add('playing');
        }, 300);
      }
    });
  });
}

// Run when the page loads
document.addEventListener('DOMContentLoaded', initMusicIndicator);

// As a fallback, also run when window is fully loaded
window.addEventListener('load', function() {
  if (!document.querySelector('.music-indicator')) {
    console.log('Music indicator not initialized during DOMContentLoaded, initializing now');
    initMusicIndicator();
  }
  
  // Also ensure we hook into the SoundCloud integration's function
  // if it wasn't available during initial setup
  setTimeout(function() {
    const indicator = document.querySelector('.music-indicator');
    if (indicator && window.isMusicPlaying && !indicator.classList.contains('playing')) {
      indicator.classList.add('playing');
    }
  }, 2000);
});