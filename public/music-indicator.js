/**
 * Non-Intrusive Music Menu Indicator with Spacing Fix
 * Creates a visual effect for the mixxs menu without modifying its DOM structure
 */

// CSS for creating the music animation without modifying the DOM
const musicIndicatorStyles = `
  /* Base styles */
  .menu-item[data-section="mixxs"].music-playing {
    text-shadow: 0 0 8px rgba(255, 255, 0, 0.6);
    position: relative;
    animation: mixxs-pulse 1.2s ease-in-out infinite alternate;
    /* Add margin-right to compensate for the dot indicator */
    margin-right: 15px;
  }
  
  /* Add adequate spacing to the next menu item in mobile views */
  @media (max-width: 768px) {
    /* Increase the spacing specifically between mixxs and archives */
    .menu-item[data-section="mixxs"].music-playing + li .menu-item[data-section="archives"] {
      margin-left: 8px;
    }
  }
  
  /* Dot indicator */
  .menu-item[data-section="mixxs"].music-playing::after {
    content: '';
    position: absolute;
    right: -15px;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #ffff00;
    box-shadow: 0 0 8px rgba(255, 255, 0, 0.8);
    animation: pulse-dot 1.5s ease-in-out infinite;
  }
  
  /* Subtle animation for the menu text */
  @keyframes mixxs-pulse {
    0% {
      transform: translateY(0px);
    }
    100% {
      transform: translateY(-2px);
    }
  }
  
  @keyframes pulse-dot {
    0%, 100% { opacity: 0.4; transform: translateY(-50%) scale(0.8); }
    50% { opacity: 1; transform: translateY(-50%) scale(1); }
  }
  
  /* Pause animation when active */
  .menu-item[data-section="mixxs"].active.music-playing {
    animation-play-state: paused;
  }
  
  /* Mobile adjustments */
  @media (max-width: 768px) {
    .menu-item[data-section="mixxs"].music-playing::after {
      right: -10px;
      width: 6px;
      height: 6px;
    }
  }
`;

// Function to inject styles
function injectMusicStyles() {
  const styleEl = document.createElement('style');
  styleEl.textContent = musicIndicatorStyles;
  document.head.appendChild(styleEl);
}

// Function to toggle music playing animation
function toggleMusicAnimation(isPlaying) {
  const mixxsMenuItem = document.querySelector('.menu-item[data-section="mixxs"]');
  if (!mixxsMenuItem) return;
  
  if (isPlaying) {
    mixxsMenuItem.classList.add('music-playing');
    
    // Add extra space to the parent list item for better layout
    const parentLi = mixxsMenuItem.closest('li');
    if (parentLi) {
      parentLi.style.marginRight = '8px';
    }
    
  } else {
    mixxsMenuItem.classList.remove('music-playing');
    
    // Remove the extra space when not playing
    const parentLi = mixxsMenuItem.closest('li');
    if (parentLi) {
      parentLi.style.marginRight = '';
    }
  }
}

// Function to initialize the music indicator
function initMusicIndicator() {
  // Inject styles
  injectMusicStyles();
  
  // Create a new global function to toggle the animation
  window.updateMusicIndicator = function(isPlaying) {
    toggleMusicAnimation(isPlaying);
  };
  
  // Hook into existing music detection
  const originalUpdateFunction = window.updateFloatingHeadsMode;
  window.updateFloatingHeadsMode = function(forcedState) {
    // Call original function
    if (typeof originalUpdateFunction === 'function') {
      originalUpdateFunction.call(this, forcedState);
    }
    
    // Get the current music playing state
    const isPlaying = (forcedState !== undefined) ? forcedState : window.isMusicPlaying;
    
    // Update the animation
    toggleMusicAnimation(isPlaying);
  };
  
  // Initial check if music is already playing
  if (window.isMusicPlaying) {
    toggleMusicAnimation(true);
  }
  
  // Watch for responsive layout changes and adjust spacing accordingly
  window.addEventListener('resize', function() {
    if (window.isMusicPlaying) {
      // Re-apply spacing on resize to account for layout changes
      setTimeout(function() {
        toggleMusicAnimation(true);
      }, 100);
    }
  });
}

// Run when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait a short time to ensure the original page code runs first
  setTimeout(() => {
    initMusicIndicator();
  }, 100);
});

// As a fallback, also run when window is fully loaded
window.addEventListener('load', function() {
  setTimeout(function() {
    // Check if the indicator was applied
    const mixxsMenuItem = document.querySelector('.menu-item[data-section="mixxs"]');
    if (mixxsMenuItem && window.isMusicPlaying && !mixxsMenuItem.classList.contains('music-playing')) {
      console.log('Music indicator not initialized, initializing now');
      initMusicIndicator();
      toggleMusicAnimation(true);
    }
  }, 1000);
});