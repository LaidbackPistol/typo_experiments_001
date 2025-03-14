/**
 * Floating Heads Animation
 * Creates 3D paper cutout effect for head images that float on screen
 */

// Configuration
const FLOATING_HEADS_CONFIG = {
    fps: 12,               // Frames per second (lower = more stop-motion feel)
    repulsionRadius: 200,  // How close mouse needs to be to affect heads
    repulsionForce: 0.8,   // Strength of mouse repulsion
    shadowBlur: 15,        // Shadow blur amount for 3D effect
    shadowOffsetX: 10,     // Shadow X offset
    shadowOffsetY: 10,     // Shadow Y offset
    minScale: 0.3,         // Minimum size scale
    maxScale: 0.7,         // Maximum size scale
    rotationRange: 20,      // Max degrees of rotation (-8 to 8)
    fallbackImage: '/5_heads/head1.png'  // Default image if none found
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
      
      // Load images
      await loadImagesFromDirectory();
      
      // Begin animation
      if (heads.length > 0) {
        isInitialized = true;
        startAnimation();
      }
    };
    
    // Load images from directory
    const loadImagesFromDirectory = async function() {
      console.log('Loading head images...');
      try {
        // Try to fetch from API
        const response = await fetch('/api/heads');
        if (!response.ok) throw new Error('API response not OK: ' + response.status);
        
        const data = await response.json();
        console.log('API response:', data);
        
        if (data.images && data.images.length > 0) {
          await loadImages(data.images);
        } else {
          console.log('No images returned from API, using fallback image');
          await loadImages([FLOATING_HEADS_CONFIG.fallbackImage]);
        }
      } catch (error) {
        console.error('Error fetching images from API:', error);
        
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
            // Create a head object with random properties
            heads.push({
              id: index,
              img: img,
              x: Math.random() * window.innerWidth * 0.7 + window.innerWidth * 0.15,
              y: Math.random() * window.innerHeight * 0.7 + window.innerHeight * 0.15,
              rotation: Math.random() * FLOATING_HEADS_CONFIG.rotationRange * 2 - FLOATING_HEADS_CONFIG.rotationRange,
              rotationSpeed: (Math.random() * 0.3 - 0.15),
              scale: FLOATING_HEADS_CONFIG.minScale + Math.random() * (FLOATING_HEADS_CONFIG.maxScale - FLOATING_HEADS_CONFIG.minScale),
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
      // Control frame rate for stop-motion effect
      const frameInterval = 1000 / FLOATING_HEADS_CONFIG.fps;
      if (timestamp - lastFrameTime < frameInterval) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      
      lastFrameTime = timestamp;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
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
        
        // Apply slight randomness for natural movement (every 500ms)
        if (timestamp - head.lastMoveTime > 500) {
          head.velocityX += (Math.random() * 0.2 - 0.1);
          head.velocityY += (Math.random() * 0.2 - 0.1);
          head.lastMoveTime = timestamp;
        }
        
        // Apply velocity (with damping)
        head.x += head.velocityX;
        head.y += head.velocityY;
        head.velocityX *= 0.98;
        head.velocityY *= 0.98;
        
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
  document.head.appendChild(style);