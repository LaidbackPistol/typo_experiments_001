// Creative Music Indicator using Menu Animation
// This script transforms the "mixxs" menu item into a sound wave visualization

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

// Function to convert menu text into span-wrapped letters
function wrapMenuLetters() {
  const mixxsMenuItem = document.querySelector('.menu-item[data-section="mixxs"]');
  if (!mixxsMenuItem) return;
  
  // Only process if not already processed
  if (mixxsMenuItem.querySelector('span')) return;
  
  // Get the original text
  const text = mixxsMenuItem.textContent;
  
  // Clear the element
  mixxsMenuItem.innerHTML = '';
  
  // Add each letter wrapped in a span
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.textContent = text[i];
    mixxsMenuItem.appendChild(span);
  }
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
}

// Run when the page loads
document.addEventListener('DOMContentLoaded', initMusicWave);

// As a fallback, also run when window is fully loaded
window.addEventListener('load', function() {
  // Check if menu item spans exist, if not initialize again
  const mixxsMenuItem = document.querySelector('.menu-item[data-section="mixxs"]');
  if (mixxsMenuItem && !mixxsMenuItem.querySelector('span')) {
    console.log('Music wave not initialized during DOMContentLoaded, initializing now');
    initMusicWave();
  }
  
  // Check if music is playing on load
  setTimeout(function() {
    if (window.isMusicPlaying) {
      toggleMusicAnimation(true);
    }
  }, 1000);
});