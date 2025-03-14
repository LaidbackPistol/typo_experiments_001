// Enhanced Creative Music Indicator
// Offers multiple animation styles for the "mixxs" menu item

// Configuration - you can adjust these options
const MUSIC_INDICATOR_CONFIG = {
    // Choose which effect to use: "wave", "equalizer", "pulse", "spin", or "all"
    activeEffect: "all",
    
    // Global animation properties
    glowColor: "#ffff00",  // Yellow glow
    animationSpeed: 1.0,   // Animation speed multiplier (higher = faster)
    
    // Show dot indicator next to menu
    showDot: true,
    
    // Automatically cycle between effects when music plays longer
    autoCycle: true,
    cycleDuration: 30      // Seconds between effect changes
  };
  
  // CSS for all animation styles
  const musicAnimationStyles = `
    /* ========== BASE STYLES ========== */
    .menu-item[data-section="mixxs"].music-playing {
      text-shadow: 0 0 8px rgba(255, 255, 0, 0.6);
      position: relative;
    }
    
    /* Letter container - all effects use this */
    .menu-item[data-section="mixxs"].music-playing span {
      display: inline-block;
      transform-origin: center bottom;
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
      opacity: ${MUSIC_INDICATOR_CONFIG.showDot ? 1 : 0};
    }
    
    @keyframes pulse-dot {
      0%, 100% { opacity: 0.4; transform: translateY(-50%) scale(0.8); }
      50% { opacity: 1; transform: translateY(-50%) scale(1); }
    }
    
    /* Remove animations when menu item is active/selected */
    .menu-item[data-section="mixxs"].active.music-playing span {
      animation-play-state: paused !important;
      transform: none !important;
    }
    
    /* ========== WAVE EFFECT ========== */
    .menu-item[data-section="mixxs"].music-playing.effect-wave span {
      animation-name: wave-letter;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-timing-function: ease-in-out;
    }
    
    @keyframes wave-letter {
      0% { transform: translateY(0px) scaleY(1); }
      100% { transform: translateY(-2px) scaleY(1.1); }
    }
    
    /* ========== EQUALIZER EFFECT ========== */
    .menu-item[data-section="mixxs"].music-playing.effect-equalizer span {
      animation-name: eq-letter;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-timing-function: ease-in-out;
    }
    
    @keyframes eq-letter {
      0% { transform: scaleY(0.9); }
      100% { transform: scaleY(1.2); }
    }
    
    /* ========== PULSE EFFECT ========== */
    .menu-item[data-section="mixxs"].music-playing.effect-pulse span {
      animation-name: pulse-letter;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-timing-function: ease-in-out;
      transform-origin: center center;
    }
    
    @keyframes pulse-letter {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(1.1); opacity: 1; }
    }
    
    /* ========== SPIN EFFECT ========== */
    .menu-item[data-section="mixxs"].music-playing.effect-spin span {
      animation-name: spin-letter;
      animation-iteration-count: infinite;
      animation-timing-function: ease-in-out;
      transform-origin: center center;
    }
    
    @keyframes spin-letter {
      0% { transform: rotateY(0deg); }
      100% { transform: rotateY(360deg); }
    }
    
    /* ========== TIMING VARIATIONS ========== */
    /* Apply different timings to each letter for wave effect */
    .menu-item[data-section="mixxs"].music-playing span:nth-child(1) {
      animation-duration: calc(0.5s / ${MUSIC_INDICATOR_CONFIG.animationSpeed});
      animation-delay: 0.1s;
    }
    .menu-item[data-section="mixxs"].music-playing span:nth-child(2) {
      animation-duration: calc(0.7s / ${MUSIC_INDICATOR_CONFIG.animationSpeed});
      animation-delay: 0.2s;
    }
    .menu-item[data-section="mixxs"].music-playing span:nth-child(3) {
      animation-duration: calc(0.6s / ${MUSIC_INDICATOR_CONFIG.animationSpeed});
      animation-delay: 0.3s;
    }
    .menu-item[data-section="mixxs"].music-playing span:nth-child(4) {
      animation-duration: calc(0.8s / ${MUSIC_INDICATOR_CONFIG.animationSpeed});
      animation-delay: 0.1s;
    }
    .menu-item[data-section="mixxs"].music-playing span:nth-child(5) {
      animation-duration: calc(0.7s / ${MUSIC_INDICATOR_CONFIG.animationSpeed});
      animation-delay: 0.2s;
    }
    
    /* Special animation for the characters at the end */
    .menu-item[data-section="mixxs"].music-playing span:nth-child(6) {
      animation-duration: calc(0.6s / ${MUSIC_INDICATOR_CONFIG.animationSpeed});
      animation-delay: 0.05s;
    }
    
    /* Mobile adjustments */
    @media (max-width: 768px) {
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
  function injectMusicStyles() {
    const styleEl = document.createElement('style');
    styleEl.id = 'music-indicator-styles';
    styleEl.textContent = musicAnimationStyles;
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
  
  // Available effects
  const EFFECTS = ["wave", "equalizer", "pulse", "spin"];
  let currentEffectIndex = 0;
  let effectCycleInterval = null;
  
  // Function to set the current effect
  function setCurrentEffect(effect) {
    const mixxsMenuItem = document.querySelector('.menu-item[data-section="mixxs"]');
    if (!mixxsMenuItem) return;
    
    // Remove all effect classes
    EFFECTS.forEach(e => {
      mixxsMenuItem.classList.remove(`effect-${e}`);
    });
    
    // Apply the specified effect (or do nothing for "none")
    if (effect !== "none") {
      mixxsMenuItem.classList.add(`effect-${effect}`);
    }
  }
  
  // Function to cycle to the next effect
  function cycleToNextEffect() {
    currentEffectIndex = (currentEffectIndex + 1) % EFFECTS.length;
    setCurrentEffect(EFFECTS[currentEffectIndex]);
  }
  
  // Function to toggle music playing animation
  function toggleMusicAnimation(isPlaying) {
    const mixxsMenuItem = document.querySelector('.menu-item[data-section="mixxs"]');
    if (!mixxsMenuItem) return;
    
    if (isPlaying) {
      mixxsMenuItem.classList.add('music-playing');
      
      // Apply effect based on configuration
      if (MUSIC_INDICATOR_CONFIG.activeEffect === "all") {
        // Start with the first effect
        currentEffectIndex = 0;
        setCurrentEffect(EFFECTS[currentEffectIndex]);
        
        // Set up cycling if enabled
        if (MUSIC_INDICATOR_CONFIG.autoCycle) {
          // Clear any existing interval
          if (effectCycleInterval) {
            clearInterval(effectCycleInterval);
          }
          
          // Create new interval
          effectCycleInterval = setInterval(cycleToNextEffect, 
            MUSIC_INDICATOR_CONFIG.cycleDuration * 1000);
        }
      } else {
        // Apply the single specified effect
        setCurrentEffect(MUSIC_INDICATOR_CONFIG.activeEffect);
      }
    } else {
      mixxsMenuItem.classList.remove('music-playing');
      
      // Clear effect classes
      EFFECTS.forEach(effect => {
        mixxsMenuItem.classList.remove(`effect-${effect}`);
      });
      
      // Clear cycling interval
      if (effectCycleInterval) {
        clearInterval(effectCycleInterval);
        effectCycleInterval = null;
      }
    }
  }
  
  // Function to initialize music effects
  function initMusicEffects() {
    // Inject styles
    injectMusicStyles();
    
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
    
    // Expose control functions globally
    window.musicIndicator = {
      setEffect: function(effect) {
        if (EFFECTS.includes(effect) || effect === "all" || effect === "none") {
          MUSIC_INDICATOR_CONFIG.activeEffect = effect;
          if (window.isMusicPlaying) {
            if (effect === "all") {
              currentEffectIndex = 0;
              setCurrentEffect(EFFECTS[currentEffectIndex]);
            } else {
              setCurrentEffect(effect);
            }
          }
        }
      },
      
      toggleCycling: function(enabled) {
        MUSIC_INDICATOR_CONFIG.autoCycle = enabled;
        if (!enabled && effectCycleInterval) {
          clearInterval(effectCycleInterval);
          effectCycleInterval = null;
        } else if (enabled && window.isMusicPlaying && MUSIC_INDICATOR_CONFIG.activeEffect === "all") {
          if (effectCycleInterval) {
            clearInterval(effectCycleInterval);
          }
          effectCycleInterval = setInterval(cycleToNextEffect, 
            MUSIC_INDICATOR_CONFIG.cycleDuration * 1000);
        }
      },
      
      setCycleDuration: function(seconds) {
        if (seconds > 0) {
          MUSIC_INDICATOR_CONFIG.cycleDuration = seconds;
          // Update interval if active
          if (effectCycleInterval) {
            clearInterval(effectCycleInterval);
            effectCycleInterval = setInterval(cycleToNextEffect, 
              MUSIC_INDICATOR_CONFIG.cycleDuration * 1000);
          }
        }
      },
      
      setAnimationSpeed: function(speed) {
        // This requires regenerating the CSS
        if (speed > 0) {
          MUSIC_INDICATOR_CONFIG.animationSpeed = speed;
          
          // Remove existing styles
          const oldStyle = document.getElementById('music-indicator-styles');
          if (oldStyle) {
            oldStyle.remove();
          }
          
          // Reinject with new speed
          injectMusicStyles();
        }
      }
    };
    
    // Initial check if music is already playing
    if (window.isMusicPlaying) {
      toggleMusicAnimation(true);
    }
  }
  
  // Run when the page loads
  document.addEventListener('DOMContentLoaded', initMusicEffects);
  
  // As a fallback, also run when window is fully loaded
  window.addEventListener('load', function() {
    // Check if menu item spans exist, if not initialize again
    const mixxsMenuItem = document.querySelector('.menu-item[data-section="mixxs"]');
    if (mixxsMenuItem && !mixxsMenuItem.querySelector('span')) {
      console.log('Music effects not initialized during DOMContentLoaded, initializing now');
      initMusicEffects();
    }
    
    // Check if music is playing on load
    setTimeout(function() {
      if (window.isMusicPlaying) {
        toggleMusicAnimation(true);
      }
    }, 1000);
  });