/**
 * Floating Heads Animation
 * Creates 3D paper cutout effect for head images that float on screen
 */
// Detect mobile devices
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Base configuration with shared parameters
const FLOATING_HEADS_CONFIG = {
  fps: 0,                    // 0 means unlimited (no throttling)
  repulsionRadius: isMobile ? 150 : 200,  // Smaller radius on mobile
  repulsionForce: 0.8,       // Strength of mouse repulsion
  shadowBlur: 15,            // Shadow blur amount for 3D effect
  shadowOffsetX: 10,         // Shadow X offset
  shadowOffsetY: 10,         // Shadow Y offset
  rotationRange: 8,          // Max degrees of rotation (-8 to 8)
  fallbackImage: '/5_heads/head1.png',  // Default image if none found
  
  // Device-specific configurations
  mobile: {
    minScale: 0.2,           // Smaller minimum scale for mobile
    maxScale: 0.4,           // Smaller maximum scale for mobile
    velocityDamping: 0.97,   // Slightly higher damping (slower movement)
    randomMovementInterval: 800,  // Less frequent random movements
    randomMovementIntensity: 0.08 // Less intense random movements
  },
  
  desktop: {
    minScale: 0.3,           // Larger minimum scale for desktop
    maxScale: 0.7,           // Larger maximum scale for desktop
    velocityDamping: 0.98,   // Standard damping
    randomMovementInterval: 500,  // More frequent random movements
    randomMovementIntensity: 0.1  // More intense random movements
  },
  
  // Function to get the correct scale range based on device
  getScaleRange: function() {
    if (isMobile) {
      return {
        min: this.mobile.minScale,
        max: this.mobile.maxScale
      };
    } else {
      return {
        min: this.desktop.minScale,
        max: this.desktop.maxScale
      };
    }
  },
  
  // Function to get device-specific parameters
  getDeviceParams: function() {
    return isMobile ? this.mobile : this.desktop;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing floating heads');
  
  // Create container if it doesn't exist
  let container = document.getElementById('floating-heads-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'floating-heads-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '5';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
  }
  
  // Create new floating heads instance
  new FloatingHeads(container);
});

// FloatingHeads class
function FloatingHeads(container) {
  // Private variables
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let heads = [];
  let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let lastFrameTime = 0;
  let animationId = null;
  let isInitialized = false;
  
  // Initialize
  this.init = async function() {
    // Setup canvas
    canvas.id = 'floating-heads-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    // Add touch event listeners for mobile
    if (isMobile) {
      window.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      
      // On mobile, set initial mouse position to center
      mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
    
    // Load images
    await loadImagesFromDirectory();
    
    // Begin animation
    if (heads.length > 0) {
      isInitialized = true;
      startAnimation();
    }
  };
  
  // Add the following touch event handlers
  const handleTouchStart = function(e) {
    e.preventDefault(); // Prevent scrolling when touching the canvas
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      mousePos = { x: touch.clientX, y: touch.clientY };
    }
  };
  
  const handleTouchMove = function(e) {
    e.preventDefault(); // Prevent scrolling when touching the canvas
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      mousePos = { x: touch.clientX, y: touch.clientY };
    }
  };
  
  const handleTouchEnd = function(e) {
    // Optional: You could reset the mouse position or apply some effect when touch ends
  };
  
  // Add cleanup for touch events
  this.cleanup = function() {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('resize', handleResize);
    
    if (isMobile) {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    }
    
    container.removeChild(canvas);
  };
  
  // You may also want to add a special handling for mobile orientation changes
  window.addEventListener('orientationchange', function() {
    // Wait a moment for the new dimensions to take effect
    setTimeout(handleResize, 300);
  });
  
  // Load images from directory
  const loadImagesFromDirectory = async function() {
    console.log('Loading head images...');
    try {
      // Try to fetch from API
      console.log('Attempting to fetch from /api/heads');
      const response = await fetch('/api/heads');
      
      // Check response status
      if (!response.ok) {
        console.warn('API response not OK:', response.status, response.statusText);
        throw new Error('API response not OK: ' + response.status);
      }
      
      // Check if the response is actually JSON (not HTML)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API returned non-JSON response:', contentType);
        console.log('Switching to direct image loading (bypassing API)');
        throw new Error('API returned non-JSON response');
      }
      
      const data = await response.json();
      console.log('API response:', data);
      
      if (data.images && data.images.length > 0) {
        await loadImages(data.images);
      } else {
        console.log('No images returned from API, using fallback image');
        await loadImages([FLOATING_HEADS_CONFIG.fallbackImage]);
      }
    } catch (error) {
      console.warn('Error fetching images from API:', error);
      
      // Fallback: try to directly load the image we know exists
      console.log('Trying fallback image:', FLOATING_HEADS_CONFIG.fallbackImage);
      
      // Test if fallback image exists
      try {
        const testImage = new Image();
        testImage.src = FLOATING_HEADS_CONFIG.fallbackImage;
        await new Promise((resolve, reject) => {
          testImage.onload = resolve;
          testImage.onerror = reject;
        });
        
        // If we get here, the image loaded successfully
        await loadImages([FLOATING_HEADS_CONFIG.fallbackImage]);
      } catch (imgError) {
        console.error('Fallback image failed to load:', imgError);
      }
    }
  };
  
  // Load specific images
  const loadImages = async function(imagePaths) {
    console.log('Loading images:', imagePaths);
    
    // Create loading promises for all images
    const loadPromises = imagePaths.map((path, index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        
        img.onload = () => {
          console.log(`Image loaded: ${path}`);
          
          // Get device-specific scale range
          const scaleRange = FLOATING_HEADS_CONFIG.getScaleRange();
          
          // Create a head object with random properties
          heads.push({
            id: index,
            img: img,
            x: Math.random() * window.innerWidth * 0.7 + window.innerWidth * 0.15,
            y: Math.random() * window.innerHeight * 0.7 + window.innerHeight * 0.15,
            rotation: Math.random() * FLOATING_HEADS_CONFIG.rotationRange * 2 - FLOATING_HEADS_CONFIG.rotationRange,
            rotationSpeed: (Math.random() * 0.3 - 0.15),
            // Use device-specific scale range
            scale: scaleRange.min + Math.random() * (scaleRange.max - scaleRange.min),
            velocityX: (Math.random() * 0.4 - 0.2),
            velocityY: (Math.random() * 0.4 - 0.2),
            lastMoveTime: 0
          });
          resolve();
        };
        
        img.onerror = () => {
          console.error(`Failed to load image: ${path}`);
          resolve(); // Resolve anyway to not block other images
        };
      });
    });
    
    // Wait for all images to load or fail
    await Promise.all(loadPromises);
    console.log(`Loaded ${heads.length} images out of ${imagePaths.length} paths`);
  };
  
  // Event handlers
  const handleMouseMove = function(e) {
    mousePos = { x: e.clientX, y: e.clientY };
  };
  
  const handleResize = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  
  // Animation functions
  const startAnimation = function() {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(animate);
  };
  
  const animate = function(timestamp) {
    // Skip frame rate limiting if fps is 0 (unlimited)
    if (FLOATING_HEADS_CONFIG.fps > 0) {
      const frameInterval = 1000 / FLOATING_HEADS_CONFIG.fps;
      if (timestamp - lastFrameTime < frameInterval) {
        animationId = requestAnimationFrame(animate);
        return;
      }
    }
    
    lastFrameTime = timestamp;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get device-specific parameters
    const deviceParams = FLOATING_HEADS_CONFIG.getDeviceParams();
    
    // Update and draw each head
    heads.forEach(head => {
      // Calculate distance from mouse for repulsion effect
      const dx = mousePos.x - head.x;
      const dy = mousePos.y - head.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Apply mouse repulsion when mouse is close
      if (distance < FLOATING_HEADS_CONFIG.repulsionRadius) {
        const repulsionForce = FLOATING_HEADS_CONFIG.repulsionForce * (1 - distance / FLOATING_HEADS_CONFIG.repulsionRadius);
        head.velocityX -= (dx / distance) * repulsionForce;
        head.velocityY -= (dy / distance) * repulsionForce;
      }
      
      // Apply slight randomness for natural movement using device-specific parameters
      if (timestamp - head.lastMoveTime > deviceParams.randomMovementInterval) {
        const randomIntensity = deviceParams.randomMovementIntensity;
        head.velocityX += (Math.random() * randomIntensity * 2 - randomIntensity);
        head.velocityY += (Math.random() * randomIntensity * 2 - randomIntensity);
        head.lastMoveTime = timestamp;
      }
      
      // Apply velocity with device-specific damping
      head.x += head.velocityX;
      head.y += head.velocityY;
      head.velocityX *= deviceParams.velocityDamping;
      head.velocityY *= deviceParams.velocityDamping;
      
      // Apply rotation
      head.rotation += head.rotationSpeed;
      
      // Boundary checking to keep heads within screen
      const margin = 50;
      if (head.x < margin) {
        head.x = margin;
        head.velocityX *= -0.5;
      } else if (head.x > canvas.width - margin) {
        head.x = canvas.width - margin;
        head.velocityX *= -0.5;
      }
      
      if (head.y < margin) {
        head.y = margin;
        head.velocityY *= -0.5;
      } else if (head.y > canvas.height - margin) {
        head.y = canvas.height - margin;
        head.velocityY *= -0.5;
      }
      
      // Draw the head with shadow for 3D effect
      ctx.save();
      ctx.translate(head.x, head.y);
      ctx.rotate((head.rotation * Math.PI) / 180);
      ctx.scale(head.scale, head.scale);
      
      // Add shadow for 3D paper cutout effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = FLOATING_HEADS_CONFIG.shadowBlur;
      ctx.shadowOffsetX = FLOATING_HEADS_CONFIG.shadowOffsetX;
      ctx.shadowOffsetY = FLOATING_HEADS_CONFIG.shadowOffsetY;
      
      // Draw the head
      const imgWidth = head.img.width;
      const imgHeight = head.img.height;
      ctx.drawImage(head.img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
      
      ctx.restore();
    });
    
    animationId = requestAnimationFrame(animate);
  };
  
  // Cleanup function
  this.cleanup = function() {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('resize', handleResize);
    container.removeChild(canvas);
  };
  
  // Initialize
  this.init();
}

// Add CSS style for container
const style = document.createElement('style');
style.textContent = `
  #floating-heads-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    pointer-events: none;
    overflow: hidden;
  }
  
  #floating-heads-canvas {
    filter: drop-shadow(0px 5px 15px rgba(0, 0, 0, 0.2));
  }
`;

// Attempt to directly load images from common paths if needed
window.addEventListener('load', function() {
  setTimeout(() => {
    const floatingHeadsCanvas = document.getElementById('floating-heads-canvas');
    const headsContainer = document.getElementById('floating-heads-container');
    
    // If no floating heads are visible after 3 seconds, try direct loading
    if (!floatingHeadsCanvas || headsContainer.childElementCount === 0) {
      console.log('Floating heads not initialized after timeout, trying direct loading');
      
      // Create new instance with direct loading
      const directInstance = new FloatingHeads(headsContainer || document.body);
      
      // Store for debugging
      window.floatingHeadsDirectInstance = directInstance;
    }
  }, 3000);
});
document.head.appendChild(style);