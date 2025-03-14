/**
 * Shake Detection for Floating Heads
 * 
 * This script adds a shake-to-spin feature to the floating heads
 * When the user shakes their phone, the heads will do random spins
 */

// Shake detection configuration
const SHAKE_CONFIG = {
    threshold: 20,            // How hard the shake needs to be (lower = more sensitive)
    timeout: 800,             // Minimum time between shake triggers (ms)
    maxSpinHeads: 5,          // Maximum number of heads to spin at once
    spinDurationMin: 800,     // Minimum spin duration (ms)
    spinDurationMax: 1500,    // Maximum spin duration (ms)
    spinDirectionRandom: true, // Random spin direction (clockwise/counter)
    spinMultipleShakes: true, // Whether multiple shakes add more intensity
    debugMode: false          // Set to true to show acceleration values
  };
  
  // Variables to track shake state
  let lastShakeTime = 0;
  let shakeCount = 0;
  let shakeTimeout = null;
  
  // Initialize shake detection when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    // Check if device has motion sensors
    if (window.DeviceMotionEvent) {
      initShakeDetection();
    } else {
      console.log('Device motion not supported - shake feature disabled');
    }
  });
  
  // Initialize shake detection with permission handling
  function initShakeDetection() {
    // For iOS 13+ which requires permission
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof DeviceMotionEvent.requestPermission === 'function') {
      
      // We'll request permission when user first interacts with page
      document.body.addEventListener('click', function handleFirstTouch() {
        DeviceMotionEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              window.addEventListener('devicemotion', handleMotionEvent);
              console.log('Shake detection enabled');
            }
          })
          .catch(console.error);
        
        // Remove this listener after first touch
        document.body.removeEventListener('click', handleFirstTouch);
      }, {once: true});
      
    } else {
      // For non-iOS or older iOS versions
      window.addEventListener('devicemotion', handleMotionEvent);
      console.log('Shake detection enabled');
    }
  }
  
  // Handle device motion events to detect shakes
  function handleMotionEvent(event) {
    const acceleration = event.accelerationIncludingGravity;
    
    if (!acceleration) return;
    
    // Get acceleration values
    const x = acceleration.x;
    const y = acceleration.y;
    const z = acceleration.z;
    
    // Calculate acceleration magnitude
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    
    // Debug mode - show acceleration values
    if (SHAKE_CONFIG.debugMode) {
      console.log(`Acceleration: ${magnitude.toFixed(2)}`);
    }
    
    // Detect if this is a shake
    if (magnitude > SHAKE_CONFIG.threshold) {
      const currentTime = new Date().getTime();
      
      // Ensure we don't trigger too frequently
      if (currentTime - lastShakeTime > SHAKE_CONFIG.timeout) {
        // Reset shake count if it's been a while
        if (currentTime - lastShakeTime > SHAKE_CONFIG.timeout * 3) {
          shakeCount = 0;
        }
        
        shakeCount++;
        lastShakeTime = currentTime;
        
        // Trigger the spin animation!
        triggerSpinAnimation();
        
        // Visual feedback that shake was detected
        showShakeFeedback();
        
        // Clear any existing timeout
        if (shakeTimeout) clearTimeout(shakeTimeout);
        
        // Reset shake count after a period of inactivity
        shakeTimeout = setTimeout(() => {
          shakeCount = 0;
        }, SHAKE_CONFIG.timeout * 2);
      }
    }
  }
  
  // Trigger spin animations on the floating heads
  function triggerSpinAnimation() {
    // Check if the floating heads instance exists
    const floatingHeads = window.floatingHeadsInstance || 
                          (document.getElementById('floating-heads-canvas') && 
                           document.getElementById('floating-heads-canvas').__floatingHeads);
    
    if (!floatingHeads || !floatingHeads.heads || floatingHeads.heads.length === 0) {
      console.log('No floating heads found - cannot trigger spin');
      return;
    }
    
    // Calculate how many heads to spin based on shake count and max setting
    const headsToSpin = Math.min(
      SHAKE_CONFIG.spinMultipleShakes ? shakeCount : 1, 
      SHAKE_CONFIG.maxSpinHeads,
      floatingHeads.heads.length
    );
    
    console.log(`Shake detected! Spinning ${headsToSpin} heads`);
    
    // Create an array of random indices to select which heads to spin
    const headIndices = [];
    while (headIndices.length < headsToSpin) {
      const randomIndex = Math.floor(Math.random() * floatingHeads.heads.length);
      if (!headIndices.includes(randomIndex)) {
        headIndices.push(randomIndex);
      }
    }
    
    // Now spin each selected head
    headIndices.forEach(index => {
      const head = floatingHeads.heads[index];
      
      // Method 1: Using the existing spin properties
      if (typeof head.spinningNow !== 'undefined') {
        // Set up the spin animation parameters
        head.spinningNow = true;
        head.spinStartTime = performance.now();
        
        // Random duration within configured range
        head.spinDuration = SHAKE_CONFIG.spinDurationMin + 
                            Math.random() * (SHAKE_CONFIG.spinDurationMax - SHAKE_CONFIG.spinDurationMin);
        
        // Determine spin direction (clockwise=1, counter-clockwise=-1)
        head.spinDirection = SHAKE_CONFIG.spinDirectionRandom ? 
                             (Math.random() > 0.5 ? 1 : -1) : 1;
        
        head.initialRotation = head.rotation; // Remember starting rotation
        
        // Calculate target rotation (full 360° spin)
        // For stronger shakes, do multiple rotations
        const rotations = 1 + (shakeCount > 1 ? 1 : 0);
        head.targetRotation = head.initialRotation + (360 * rotations * head.spinDirection);
      } 
      // Method 2: Apply rotation directly
      else {
        // Add a big instant rotation bump
        head.rotation += (Math.random() > 0.5 ? 360 : -360) * (1 + (shakeCount > 1 ? 1 : 0));
        
        // Increase rotation speed significantly
        head.rotationSpeed = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5 + 3);
        
        // Schedule a reset of rotation speed after the spin
        setTimeout(() => {
          if (head) {
            head.rotationSpeed = (Math.random() * 0.3 - 0.15); // Back to normal
          }
        }, SHAKE_CONFIG.spinDurationMax);
      }
      
      // Add a significant velocity boost (works with both methods)
      head.velocityX += (Math.random() * 6 - 3);
      head.velocityY += (Math.random() * 6 - 3);
    });
    
    // If nothing else worked, try triggering music mode temporarily
    if (typeof floatingHeads.setMusicMode === 'function') {
      // Temporarily enable music mode to trigger animations
      floatingHeads.setMusicMode(true);
      
      // Turn it off after a short delay
      setTimeout(() => {
        if (typeof floatingHeads.setMusicMode === 'function' && 
            !window.isMusicPlaying) { // Don't turn off if music is actually playing
          floatingHeads.setMusicMode(false);
        }
      }, 2000);
    }
  }
  
  // Show visual feedback that shake was detected
  function showShakeFeedback() {
    // Flash the background briefly with white color
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; // Changed to white
    flash.style.zIndex = '1000';
    flash.style.pointerEvents = 'none';
    flash.style.opacity = '0';
    flash.style.transition = 'opacity 0.3s ease';
    
    document.body.appendChild(flash);
    
    // Trigger animation
    setTimeout(() => flash.style.opacity = '1', 10);
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => document.body.removeChild(flash), 300);
    }, 300);
  }
  
  // Make the function available globally
  window.triggerFloatingHeadsSpin = triggerSpinAnimation;
  
  // For testing without shake
  window.testShake = function() {
    shakeCount++;
    triggerSpinAnimation();
    showShakeFeedback();
  };