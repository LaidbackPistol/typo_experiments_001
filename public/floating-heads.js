/**
 * Floating Heads Animation
 * Creates a dynamic display of floating head images that move around the screen
 */
class FloatingHeads {
    constructor(options = {}) {
      // Configuration with defaults
      this.config = {
        containerId: options.containerId || 'floating-heads-container',
        imageCount: options.imageCount || 8,
        minSize: options.minSize || 40,
        maxSize: options.maxSize || 120,
        minSpeed: options.minSpeed || 0.5,
        maxSpeed: options.maxSpeed || 2,
        responsive: options.responsive !== false,
        zIndex: options.zIndex || 10
      };
      
      // Initialize state
      this.heads = [];
      this.containerWidth = 0;
      this.containerHeight = 0;
      this.container = null;
      this.isRunning = false;
      this.animationFrame = null;
      this.images = [];
      
      // Bound methods
      this.animate = this.animate.bind(this);
      this.onResize = this.onResize.bind(this);
    }
    
    async init() {
      console.log("Initializing floating heads");
      
      // Create container if it doesn't exist
      if (!document.getElementById(this.config.containerId)) {
        this.container = document.createElement('div');
        this.container.id = this.config.containerId;
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.overflow = 'hidden';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = this.config.zIndex;
        document.body.appendChild(this.container);
      } else {
        this.container = document.getElementById(this.config.containerId);
      }
      
      // Set initial dimensions
      this.containerWidth = window.innerWidth;
      this.containerHeight = window.innerHeight;
      
      // Load images
      await this.loadImagesFromDirectory();
      
      // Create heads
      this.createHeads();
      
      // Start animation
      this.start();
      
      // Add resize listener if responsive
      if (this.config.responsive) {
        window.addEventListener('resize', this.onResize);
      }
      
      return this;
    }
    
    async loadImagesFromDirectory() {
      console.log("Loading head images...");
      
      try {
        // First try to load images from the API
        console.log("Attempting to fetch from /api/floating-heads");
        const response = await fetch('/api/floating-heads');
        
        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.log(`API returned non-JSON response: ${contentType}`);
          throw new Error('API returned non-JSON response');
        }
        
        const data = await response.json();
        
        if (data.images && data.images.length > 0) {
          this.images = data.images;
          console.log(`Loaded ${this.images.length} images from API`);
        } else {
          console.log("No images found in API response, fallback to direct loading");
          this.loadImagesDirectly();
        }
      } catch (error) {
        console.log("Switching to direct image loading (bypassing API)");
        this.loadImagesDirectly();
        console.log("Error fetching images from API:", error);
      }
    }
    
    loadImagesDirectly() {
      // Fallback: Define some hardcoded image paths if the API doesn't work
      const basePath = '/5_heads/';
      const filenames = [
        'head1.png',
        'head2.png',
        'head3.png',
        'head4.png',
        'head5.png'
      ];
      
      // Check if these files actually exist
      this.images = filenames.map(name => basePath + name);
      console.log(`Loaded ${this.images.length} hardcoded image paths`);
    }
    
    createHeads() {
      // Clear existing heads
      if (this.heads.length > 0) {
        this.heads.forEach(head => {
          if (head.element && this.container.contains(head.element)) {
            this.container.removeChild(head.element);
          }
        });
        this.heads = [];
      }
      
      // No images available
      if (this.images.length === 0) {
        console.warn("No images available for floating heads");
        return;
      }
      
      // Create new heads
      const count = Math.min(this.config.imageCount, this.images.length * 2);
      
      for (let i = 0; i < count; i++) {
        // Randomly select an image, allowing duplicates
        const imageIndex = Math.floor(Math.random() * this.images.length);
        const imageSrc = this.images[imageIndex];
        
        // Create DOM element for the head
        const element = document.createElement('img');
        element.src = imageSrc;
        element.alt = 'Floating head';
        element.style.position = 'absolute';
        element.style.opacity = '0';
        element.style.transition = 'opacity 1s ease-in';
        element.style.zIndex = this.config.zIndex;
        element.setAttribute('draggable', 'false');
        
        // Append to container
        this.container.appendChild(element);
        
        // Calculate random size between min and max
        const size = Math.floor(Math.random() * (this.config.maxSize - this.config.minSize + 1)) + this.config.minSize;
        
        // Calculate random position
        const x = Math.random() * (this.containerWidth - size);
        const y = Math.random() * (this.containerHeight - size);
        
        // Calculate random speeds
        const speedX = (Math.random() * (this.config.maxSpeed - this.config.minSpeed) + this.config.minSpeed) * (Math.random() > 0.5 ? 1 : -1);
        const speedY = (Math.random() * (this.config.maxSpeed - this.config.minSpeed) + this.config.minSpeed) * (Math.random() > 0.5 ? 1 : -1);
        
        // Random rotation speed
        const rotationSpeed = (Math.random() * 2 - 1) * 0.5; // Between -0.5 and 0.5 degrees per frame
        
        // Add head object to array
        this.heads.push({
          element,
          x,
          y,
          size,
          speedX,
          speedY,
          rotation: Math.random() * 360,
          rotationSpeed
        });
        
        // Fade in the element after a slight delay
        setTimeout(() => {
          element.style.opacity = '0.9';
        }, 100 + i * 200);
      }
    }
    
    animate() {
      if (!this.isRunning) return;
      
      // Update position of each head
      this.heads.forEach(head => {
        head.x += head.speedX;
        head.y += head.speedY;
        head.rotation += head.rotationSpeed;
        
        // Bounce off edges
        if (head.x <= 0 || head.x >= this.containerWidth - head.size) {
          head.speedX *= -1;
          head.x = Math.max(0, Math.min(head.x, this.containerWidth - head.size));
        }
        
        if (head.y <= 0 || head.y >= this.containerHeight - head.size) {
          head.speedY *= -1;
          head.y = Math.max(0, Math.min(head.y, this.containerHeight - head.size));
        }
        
        // Update element position
        head.element.style.transform = `translate(${head.x}px, ${head.y}px) rotate(${head.rotation}deg)`;
        head.element.style.width = `${head.size}px`;
        head.element.style.height = `${head.size}px`;
      });
      
      // Continue animation
      this.animationFrame = requestAnimationFrame(this.animate);
    }
    
    start() {
      if (this.isRunning) return;
      
      this.isRunning = true;
      this.animate();
    }
    
    stop() {
      if (!this.isRunning) return;
      
      this.isRunning = false;
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    }
    
    onResize() {
      // Update container dimensions
      this.containerWidth = window.innerWidth;
      this.containerHeight = window.innerHeight;
      
      // Optionally recreate heads for new dimensions
      this.createHeads();
    }
    
    destroy() {
      // Stop animation
      this.stop();
      
      // Remove event listeners
      if (this.config.responsive) {
        window.removeEventListener('resize', this.onResize);
      }
      
      // Remove all elements
      this.heads.forEach(head => {
        if (head.element && this.container.contains(head.element)) {
          this.container.removeChild(head.element);
        }
      });
      
      // Clear references
      this.heads = [];
      this.images = [];
      
      // Remove container if we created it
      if (this.container && this.container.parentNode && this.container.id === this.config.containerId) {
        this.container.parentNode.removeChild(this.container);
      }
      
      this.container = null;
    }
  }
  
  // Create and initialize floating heads when the page loads
  document.addEventListener('DOMContentLoaded', () => {
    // Check if floating heads container exists or should be created automatically
    const floatingHeads = new FloatingHeads({
      imageCount: 10,
      minSize: 40,
      maxSize: 120,
      minSpeed: 0.5,
      maxSpeed: 1.5,
      zIndex: 5  // Keep below other UI elements
    });
    
    floatingHeads.init();
    
    // Expose to global scope for debugging or manual control
    window.floatingHeads = floatingHeads;
  });