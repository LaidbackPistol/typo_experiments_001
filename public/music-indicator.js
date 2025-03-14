/**
 * Music Menu Indicator
 * Animates the "mixxs" menu item when music is playing
 */

// CSS for the wave animation
const waveAnimationStyles = `
  /* Base letter animation styles */
  .menu-item[data-section="mixxs"].music-playing span {
    display: inline-block;
    animation-name: wave-letter;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    transform-origin: center bottom;
    animation-timing-function: ease-in-out;
    animation-play-state: running;
  }
  
  /* IMPORTANT: Make sure spans don't capture clicks */
  .menu-item[data-section="mixxs"] span {
    pointer-events: none;
  }
  
  /* Remove animation when menu item is active */
  .menu-item[data-section="mixxs"].active.music-playing span {
    animation-play-state: paused !important;
  }
  
  /* Glow effect when music is playing */
  .menu-item[data-section="mixxs"].music-playing {
    text-shadow: 0 0 8px rgba(255, 255, 0, 0.6);
    position: relative;
  }
  
  /* Tiny equalizer indicator */
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
  
  @keyframes pulse-dot {
    0%, 100% { opacity: 0.4; transform: translateY(-50%) scale(0.8); }
    50% { opacity: 1; transform: translateY(-50%) scale(1); }
  }
  
  /* Letter animation keyframes */
  @keyframes wave-letter {
    0% { transform: translateY(0px) scaleY(1); }
    100% { transform: translateY(-2px) scaleY(1.1); }
  }
  
  /* Apply different timings to each letter for wave effect */
  .menu-item[data-section="mixxs"].music-playing span:nth-child(1) {
    animation-duration: 0.5s;
    animation-delay: 0.1s;
  }
  .menu-item[data-section="mixxs"].music-playing span:nth-child(2) {
    animation-duration: 0.7s;
    animation-delay: 0.2s;
  }
  .menu-item[data-section="mixxs"].music-playing span:nth-child(3) {
    animation-duration: 0.6s;
    animation-delay: 0.3s;
  }
  .menu-item[data-section="mixxs"].music-playing span:nth-child(4) {
    animation-duration: 0.8s;
    animation-delay: 0.1s;
  }
  .menu-item[data-section="mixxs"].music-playing span:nth-child(5) {
    animation-duration: 0.7s;
    animation-delay: 0.2s;
  }
  
  /* Special animation for the characters at the end */
  .menu-item[data-section="mixxs"].music-playing span:nth-child(6) {
    animation-duration: 0.6s;
    animation-delay: 0.05s;
  }
  
  @media (max-width: 768px) {
    /* Adjust for mobile */
    .menu-item[data-section="mixxs"].music-playing::after {
      right: -10px;
      width: 6px;
      height: 6px;
    }
    
    @keyframes wave-letter {
      0% { transform: translateY(0px) scaleY(1); }
      100% { transform: translateY(-1px) scaleY(1.1); }
    }
  }
`;

// Function to inject styles
function injectWaveStyles() {
  const styleEl = document.createElement('style');
  styleEl.textContent = waveAnimationStyles;
  document.head.appendChild(styleEl);
}

// Function to convert menu text into span-wrapped letters with click handling preserved
function wrapMenuLetters() {
  const mixxsMenuItem = document.querySelector('.menu-item[data-section="mixxs"]');
  if (!mixxsMenuItem) return;
  
  // Only process if not already processed
  if (mixxsMenuItem.querySelector('span')) return;
  
  // Store original attributes
  const href = mixxsMenuItem.getAttribute('href');
  const dataSection = mixxsMenuItem.getAttribute('data-section');
  const className = mixxsMenuItem.className;
  
  // Get the original text
  const text = mixxsMenuItem.textContent.trim();
  
  // Clear the element
  mixxsMenuItem.innerHTML = '';
  
  // Add each letter wrapped in a span
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.textContent = text[i];
    mixxsMenuItem.appendChild(span);
  }
  
  // Preserve all original attributes
  mixxsMenuItem.setAttribute('href', href);
  mixxsMenuItem.setAttribute('data-section', dataSection);
  mixxsMenuItem.className = className;
}

// Function to toggle music playing animation
function toggleMusicAnimation(isPlaying) {
  const mixxsMenuItem = document.querySelector('.menu-item[data-section="mixxs"]');
  if (!mixxsMenuItem) return;
  
  if (isPlaying) {
    mixxsMenuItem.classList.add('music-playing');
  } else {
    mixxsMenuItem.classList.remove('music-playing');
  }
}

// Function to initialize the wave animation
function initMusicWave() {
  // Inject styles
  injectWaveStyles();
  
  // Wrap menu letters
  wrapMenuLetters();
  
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
  
  // Fix menu click handling
  console.log('Adding click handler fix for mixxs menu item');
  restoreMenuItemClickability();
}

// This function ensures the menu item remains clickable after modification
function restoreMenuItemClickability() {
  const mixxsMenuItem = document.querySelector('.menu-item[data-section="mixxs"]');
  if (!mixxsMenuItem) return;
  
  // Make sure there's a proper click handler
  const originalOnClick = mixxsMenuItem.onclick;
  
  mixxsMenuItem.onclick = function(e) {
    // Get section from data attribute
    const section = this.getAttribute('data-section');
    
    // Update URL without navigation - using History API
    if (section) {
      history.pushState(null, '', `#${section}`);
    }
    
    // Trigger any existing event handlers or page functionality
    if (typeof window.setupMenu === 'function') {
      // If setupMenu exists, call it to ensure handlers are correctly bound
      window.setupMenu();
    }
    
    // If the menu item doesn't have the active class, add it
    if (!this.classList.contains('active')) {
      // Remove active class from all other menu items
      document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.parentElement) {
          item.parentElement.classList.remove('active-item');
        }
      });
      
      // Add active class to this item
      this.classList.add('active');
      if (this.parentElement) {
        this.parentElement.classList.add('active-item');
      }
      
      // Show mixes gallery if it exists
      const mixesGallery = document.getElementById('mixes-gallery');
      if (mixesGallery) {
        mixesGallery.classList.add('active');
        mixesGallery.style.visibility = 'visible';
      }
    }
    
    // Call the original click handler if it exists
    if (typeof originalOnClick === 'function') {
      originalOnClick.call(this, e);
    }
    
    // Prevent default to avoid multiple triggers
    e.preventDefault();
    return false;
  };
}

// Run when the page loads
document.addEventListener('DOMContentLoaded', initMusicWave);

// As a fallback, also run when window is fully loaded
window.addEventListener('load', function() {
  setTimeout(function() {
    // Check if menu item spans exist, if not initialize again
    const mixxsMenuItem = document.querySelector('.menu-item[data-section="mixxs"]');
    if (mixxsMenuItem && !mixxsMenuItem.querySelector('span')) {
      console.log('Music wave not initialized during DOMContentLoaded, initializing now');
      initMusicWave();
    }
    
    // Check if music is playing on load
    if (window.isMusicPlaying) {
      toggleMusicAnimation(true);
    }
    
    // Double-check menu click functionality
    restoreMenuItemClickability();
  }, 1000);
});