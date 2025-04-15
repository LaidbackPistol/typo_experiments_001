/**
 * Interactive Gradient Controls
 * Makes the gradient respond to mouse position and device tilt
 */

// Flag to track if interactive mode is enabled
let interactiveGradientMode = true;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Set up interactive controls after a short delay to ensure gradient is initialized
  setTimeout(setupInteractiveGradientControls, 1000);
});

// Set up interactive controls for mouse and device orientation
function setupInteractiveGradientControls() {
  // Create and add toggle button for interactive mode
  createInteractiveModeToggle();
  
  // Set up mouse movement tracking
  setupMouseInteraction();
  
  // Set up device orientation tracking
  setupDeviceOrientationTracking();
  
  console.log('Interactive gradient controls initialized');
}

// Create toggle button for interactive mode
function createInteractiveModeToggle() {
  const toggleButton = document.createElement('div');
  toggleButton.id = 'interactive-gradient-toggle';
  toggleButton.className = 'design-element'; // Add design-element class to hide in production mode
  toggleButton.textContent = 'I';
  toggleButton.style.cssText = `
    position: fixed;
    top: 10px;
    right: 56px; /* Position next to gradient controls button */
    background: rgba(0, 0, 0, 0.7);
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 101;
    border: 1px solid #444;
    font-weight: bold;
    font-size: 18px;
    opacity: 0.5;
    transition: opacity 0.3s ease;
  `;
  
  // Add active class if interactive mode is enabled
  if (interactiveGradientMode) {
    toggleButton.classList.add('active');
    toggleButton.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
  }
  
  // Add event listener for toggle
  toggleButton.addEventListener('click', function() {
    interactiveGradientMode = !interactiveGradientMode;
    
    // Update appearance
    if (interactiveGradientMode) {
      toggleButton.classList.add('active');
      toggleButton.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
    } else {
      toggleButton.classList.remove('active');
      toggleButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    }
    
    // Show notification
    showGradientNotification(interactiveGradientMode ? 
      'Interactive mode enabled' : 'Interactive mode disabled');
  });
  
  // Add hover effect
  toggleButton.addEventListener('mouseenter', function() {
    toggleButton.style.opacity = '1';
  });
  
  toggleButton.addEventListener('mouseleave', function() {
    toggleButton.style.opacity = '0.5';
  });
  
  // Add to document
  document.body.appendChild(toggleButton);
}

// Set up mouse interaction
function setupMouseInteraction() {
  // Debounce function to limit update frequency
  let lastMouseMoveTime = 0;
  const THROTTLE_MS = 50; // Throttle to 20 updates per second
  
  // Track if mouse is on screen
  let mouseOnScreen = false;
  
  document.addEventListener('mousemove', function(e) {
    // Only process if interactive mode is enabled
    if (!interactiveGradientMode) return;
    
    // Throttle updates to avoid performance issues
    const now = Date.now();
    if (now - lastMouseMoveTime < THROTTLE_MS) return;
    lastMouseMoveTime = now;
    
    // Calculate normalized position (0 to 1)
    const normalizedX = e.clientX / window.innerWidth;
    const normalizedY = e.clientY / window.innerHeight;
    
    // Map position to parameter ranges
    updateGradientParametersFromPosition(normalizedX, normalizedY);
    
    // Set flag to indicate mouse is being used
    mouseOnScreen = true;
  });
  
  // When mouse leaves the window, stop controlling
  document.addEventListener('mouseout', function(e) {
    if (e.relatedTarget === null) {
      mouseOnScreen = false;
    }
  });
  
  // Special handling for touches for mobiles that might have both
  document.addEventListener('touchstart', function() {
    // Disable mouse control on touch devices to avoid conflicts
    mouseOnScreen = false;
  });
}

// Set up device orientation tracking
function setupDeviceOrientationTracking() {
  // Check if device orientation is supported
  if (window.DeviceOrientationEvent) {
    // For iOS 13+ which requires permission
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // We need to wait for a user interaction to request permission
      const requestPermissionOnTouch = function() {
        DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleDeviceOrientation);
              console.log('Device orientation permission granted');
            }
          })
          .catch(console.error);
        
        // Remove this listener after first touch
        document.body.removeEventListener('click', requestPermissionOnTouch);
        document.body.removeEventListener('touchstart', requestPermissionOnTouch);
      };
      
      // Add listeners for touch/click to request permission
      document.body.addEventListener('click', requestPermissionOnTouch);
      document.body.addEventListener('touchstart', requestPermissionOnTouch);
    } else {
      // For non-iOS or older iOS versions
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
  }
}

// Handle device orientation data
function handleDeviceOrientation(event) {
  // Only process if interactive mode is enabled
  if (!interactiveGradientMode) return;
  
  // Check if the device has touch (to filter out desktop with orientation sensors)
  if (!isTouchDevice()) return;
  
  // Get orientation data
  const x = event.beta;  // -180 to 180 (front to back tilt)
  const y = event.gamma; // -90 to 90 (left to right tilt)
  
  // Normalize to 0-1 range (limit tilt range to make it more usable)
  const normalizedX = (Math.min(Math.max(x, -45), 45) + 45) / 90;
  const normalizedY = (Math.min(Math.max(y, -45), 45) + 45) / 90;
  
  // Update gradient parameters
  updateGradientParametersFromPosition(normalizedY, normalizedX); // Swap for intuitive control
}

// Update gradient parameters based on position
function updateGradientParametersFromPosition(x, y) {
  // Get the slider elements
  const seedSlider = document.getElementById('gradient-seed');
  const seedValue = document.getElementById('gradient-seed-value');
  const amplitudeSlider = document.getElementById('gradient-amplitude');
  const amplitudeValue = document.getElementById('gradient-amplitude-value');
  
  if (!seedSlider || !seedValue || !amplitudeSlider || !amplitudeValue) return;
  
  // Map x to seed (0-1000)
  const newSeed = Math.round(x * 1000 * 100) / 100; // 0-1000 with 2 decimal places
  
  // Map y to amplitude (0-1)
  const newAmplitude = (Math.round(y * 100) / 100)+0.15; // 0-1 with 2 decimal places
  
  // Update UI sliders
  seedSlider.value = newSeed;
  seedValue.value = newSeed;
  amplitudeSlider.value = newAmplitude;
  amplitudeValue.value = newAmplitude;
  
  // Trigger shader update (if needed)
  // In most cases, the input event listeners will handle this
  // But we'll trigger it manually just to be sure
  updateGradientShaderManually();
}

// Manually trigger shader update
function updateGradientShaderManually() {
  // Check if there's a custom function to update the shader
  if (typeof updateShaderUniforms === 'function') {
    // Call with current time
    const elapsedTime = (Date.now() - (window.startTime || Date.now())) / 1000;
    updateShaderUniforms(elapsedTime);
  }
}

// Helper to check if device is touch-enabled
function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}

// Show notification
function showGradientNotification(message) {
  // Use existing notification element if available
  let notification = document.getElementById('notification');
  
  // Create notification element if it doesn't exist
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;
    document.body.appendChild(notification);
  }
  
  // Set message and show
  notification.textContent = message;
  notification.classList.add('show');
  notification.style.opacity = '1';
  
  // Hide after delay
  setTimeout(() => {
    notification.classList.remove('show');
    notification.style.opacity = '0';
  }, 2000);
}