// Add this to public/floating-heads.js

/**
 * Floating Heads Component
 * Creates floating cut-out images with stop-motion animation and parallax effects
 */
class FloatingHeads {
    constructor(options = {}) {
      // Default settings
      this.settings = {
        container: document.body,           // Where to add the heads
        imagesPath: '/5_heads/',            // Path to the images folder
        maxRotation: 5,                     // Max rotation in degrees
        parallaxStrength: 30,               // Strength of mouse parallax effect
        floatStrength: 15,                  // How much the heads float up and down
        floatSpeed: 0.8,                    // Speed of floating animation
        frameDuration: 150,                 // How long to show each frame (ms) - higher for more stop-motion effect
        zIndex: 50,                         // z-index for the heads (should be above canvas but below UI)
        scaleRange: [0.8, 1.2],             // Min and max scale of heads
        ...options
      };
  
      // State variables
      this.heads = [];
      this.initialized = false;
      this.centerX = window.innerWidth / 2;
      this.centerY = window.innerHeight / 2;
      this.mouseX = this.centerX;
      this.mouseY = this.centerY;
      this.currentFrameIndex = 0;
      this.frameTimer = null;
      this.availableImages = [];
      this.isActive = true;
      this.lastFrameTime = 0;
      
      // Bind methods
      this.onResize = this.onResize.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.animate = this.animate.bind(this);
      this.nextFrame = this.nextFrame.bind(this);
      this.hide = this.hide.bind(this);
      this.show = this.show.bind(this);
      
      // Initialize
      this.init();
    }
    
    async init() {
      // Create a container for the heads
      this.headContainer = document.createElement('div');
      this.headContainer.className = 'floating-heads-container';
      this.headContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: ${this.settings.zIndex};
        overflow: hidden;
      `;
      this.settings.container.appendChild(this.headContainer);
      
      // First check if we should load images from server or use predefined list
      try {
        await this.loadImagesFromDirectory();
        
        // If no images were found or loaded, use a default list
        if (this.availableImages.length === 0) {
          this.useDefaultImageList();
        }
        
        // Create the heads
        this.createHeads();
        
        // Set up event listeners
        window.addEventListener('resize', this.onResize);
        window.addEventListener('mousemove', this.onMouseMove);
        
        // Start animation
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.animate);
        
        // Start frame rotation for stop-motion effect
        this.startFrameRotation();
        
        this.initialized = true;
        
        // Check if any menu items become active and hide heads if so
        this.setupMenuItemListeners();
        
      } catch (error) {
        console.error('Error initializing floating heads:', error);
      }
    }
    
    async loadImagesFromDirectory() {
      try {
        // Use our new API endpoint to get the list of images
        const response = await fetch('/api/heads');
        
        if (response.ok) {
          const data = await response.json();
          if (data.images && Array.isArray(data.images)) {
            // Use the direct paths from the API
            this.availableImages = data.images;
            console.log("Loaded images from API:", this.availableImages);
            return;
          }
        }
        
        // Fallback approach: Try to check for a manifest file
        try {
          const manifestResponse = await fetch('/archive_assets/5_heads/manifest.json');
          if (manifestResponse.ok) {
            const data = await manifestResponse.json();
            if (data.images && Array.isArray(data.images)) {
              this.availableImages = data.images.map(img => this.settings.imagesPath + img);
              console.log("Loaded images from manifest:", this.availableImages);
              return;
            }
          }
        } catch (e) {
          console.log('No manifest file found, trying alternative methods');
        }
        
        // Fallback to checking individual files with common patterns
        const testPatterns = [
          { prefix: 'head', start: 1, end: 10 },
          { prefix: '', start: 1, end: 10 },
          { prefix: 'image', start: 1, end: 10 }
        ];
        
        for (const pattern of testPatterns) {
          for (let i = pattern.start; i <= pattern.end; i++) {
            const fileName = `${pattern.prefix}${i}.png`;
            const filePath = this.settings.imagesPath + fileName;
            
            try {
              // Try to fetch the file to see if it exists
              const response = await fetch(filePath, { method: 'HEAD' });
              if (response.ok) {
                this.availableImages.push(filePath);
              }
            } catch (e) {
              // Skip failed fetches
            }
          }
          
          if (this.availableImages.length > 0) {
            break; // Found some images, no need to try other patterns
          }
        }
        
      } catch (error) {
        console.error('Error loading images from directory:', error);
      }
    }
    
    useDefaultImageList() {
      // If we couldn't load the images dynamically, use a default list
      this.availableImages = [
        this.settings.imagesPath + 'head1.png',
        this.settings.imagesPath + 'head2.png', 
        this.settings.imagesPath + 'head3.png',
        this.settings.imagesPath + 'head4.png',
        this.settings.imagesPath + 'head5.png'
      ];
    }
    
    createHeads() {
      // Number of heads to create (based on available images, max 5)
      const numHeads = Math.min(this.availableImages.length, 5);
      
      for (let i = 0; i < numHeads; i++) {
        // Create a div for each head
        const headElement = document.createElement('div');
        headElement.className = 'floating-head';
        
        // Randomly position the head within the viewport
        const scale = this.getRandomValue(this.settings.scaleRange[0], this.settings.scaleRange[1]);
        const posX = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1; // Keep away from edges
        const posY = Math.random() * window.innerHeight * 0.8 + window.innerHeight * 0.1;
        
        // Set up CSS for the head element
        headElement.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          transform: translate(${posX}px, ${posY}px) rotate(0deg) scale(${scale});
          transition: transform 0.05s ease-out; /* Quick transition for stop-motion feel */
          will-change: transform;
          pointer-events: none;
        `;
        
        // Create the image inside
        const img = document.createElement('img');
        img.src = this.availableImages[i % this.availableImages.length];
        img.alt = 'Floating head';
        img.style.cssText = `
          width: 200px; 
          height: auto;
          display: block;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
        `;
        
        // Add to DOM
        headElement.appendChild(img);
        this.headContainer.appendChild(headElement);
        
        // Store head data
        this.heads.push({
          element: headElement,
          x: posX,
          y: posY,
          startX: posX,
          startY: posY,
          rotation: 0,
          scale: scale,
          speed: this.getRandomValue(0.8, 1.2) * this.settings.floatSpeed,
          phase: Math.random() * Math.PI * 2, // Random starting phase
          direction: Math.random() > 0.5 ? 1 : -1,
          image: img
        });
      }
    }
    
    startFrameRotation() {
      // Clear any existing timer
      if (this.frameTimer) {
        clearInterval(this.frameTimer);
      }
      
      // Set up interval for frame changes (stop-motion effect)
      this.frameTimer = setInterval(this.nextFrame, this.settings.frameDuration);
    }
    
    nextFrame() {
      // Don't update frames if not active
      if (!this.isActive) return;
      
      // Calculate the new positions and rotations for all heads
      for (const head of this.heads) {
        // Small random changes to position for stop-motion effect
        const rotationChange = (Math.random() - 0.5) * 2;
        head.rotation += rotationChange;
        
        // Keep rotation within limits
        if (Math.abs(head.rotation) > this.settings.maxRotation) {
          head.rotation = Math.sign(head.rotation) * this.settings.maxRotation;
        }
        
        // Small random position changes
        const randomOffsetX = (Math.random() - 0.5) * 2;
        const randomOffsetY = (Math.random() - 0.5) * 2;
        
        // Get the current transform and update it
        head.element.style.transform = `
          translate(${head.x + randomOffsetX}px, ${head.y + randomOffsetY}px) 
          rotate(${head.rotation}deg) 
          scale(${head.scale})
        `;
      }
    }
    
    animate(timestamp) {
      if (!this.isActive) {
        requestAnimationFrame(this.animate);
        return;
      }
      
      // Calculate elapsed time
      const deltaTime = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;
      
      // Update each head position
      for (const head of this.heads) {
        // Calculate floating movement (sinusoidal)
        const floatOffset = Math.sin(timestamp * 0.001 * head.speed + head.phase) * this.settings.floatStrength;
        
        // Calculate parallax effect based on mouse position
        const dx = this.mouseX - this.centerX;
        const dy = this.mouseY - this.centerY;
        
        // Parallax factor depends on scale (larger heads move less)
        const parallaxFactor = this.settings.parallaxStrength * (1.1 - head.scale * 0.5);
        
        // Apply parallax and floating effects
        head.x = head.startX + dx * (parallaxFactor / window.innerWidth) * head.direction;
        head.y = head.startY + dy * (parallaxFactor / window.innerHeight) * head.direction + floatOffset;
      }
      
      // Continue animation
      requestAnimationFrame(this.animate);
    }
    
    onMouseMove(e) {
      // Update mouse position
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }
    
    onResize() {
      // Update center position
      this.centerX = window.innerWidth / 2;
      this.centerY = window.innerHeight / 2;
      
      // Reposition heads within new bounds if needed
      for (const head of this.heads) {
        // Adjust if head would be outside viewport
        if (head.startX > window.innerWidth) {
          head.startX = window.innerWidth * 0.8;
        }
        if (head.startY > window.innerHeight) {
          head.startY = window.innerHeight * 0.8;
        }
      }
    }
    
    getRandomValue(min, max) {
      return min + Math.random() * (max - min);
    }
    
    setupMenuItemListeners() {
      // Find all menu items
      const menuItems = document.querySelectorAll('.menu-item');
      if (!menuItems.length) return;
      
      // Add click listeners to each menu item
      menuItems.forEach(item => {
        item.addEventListener('click', () => {
          // Short delay to allow the menu active state to be updated
          setTimeout(() => {
            // Check if any menu item is active
            const anyActive = Array.from(menuItems).some(menuItem => 
              menuItem.classList.contains('active')
            );
            
            // Hide heads if any menu item is active, show otherwise
            if (anyActive) {
              this.hide();
            } else {
              this.show();
            }
          }, 50);
        });
      });
      
      // Also listen for URL hash changes (which may activate menu items)
      window.addEventListener('hashchange', () => {
        // Check the URL and menu state
        const hash = window.location.hash;
        
        if (hash && hash !== '#') {
          // If there's a hash, assume a section is active, hide heads
          this.hide();
        } else {
          // If no hash, check if any menu is active
          const anyActive = Array.from(menuItems).some(menuItem => 
            menuItem.classList.contains('active')
          );
          
          if (!anyActive) {
            this.show();
          }
        }
      });
      
      // Initial check for active menu items or hash
      const anyActiveInitially = Array.from(menuItems).some(menuItem => 
        menuItem.classList.contains('active')
      );
      
      const hasHash = window.location.hash && window.location.hash !== '#';
      
      if (anyActiveInitially || hasHash) {
        this.hide();
      }
      
      // Also listen for fullscreen viewer activation
      const fullscreenViewer = document.getElementById('fullscreen-viewer');
      if (fullscreenViewer) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
              if (fullscreenViewer.classList.contains('active')) {
                this.hide();
              } else if (!anyActiveInitially && !hasHash) {
                this.show();
              }
            }
          });
        });
        
        observer.observe(fullscreenViewer, { attributes: true });
      }
    }
    
    hide() {
      this.isActive = false;
      this.headContainer.style.opacity = '0';
      this.headContainer.style.visibility = 'hidden';
    }
    
    show() {
      this.isActive = true;
      this.headContainer.style.opacity = '1';
      this.headContainer.style.visibility = 'visible';
    }
    
    destroy() {
      // Clean up resources
      if (this.frameTimer) {
        clearInterval(this.frameTimer);
      }
      
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('mousemove', this.onMouseMove);
      
      if (this.headContainer && this.headContainer.parentNode) {
        this.headContainer.parentNode.removeChild(this.headContainer);
      }
      
      this.heads = [];
      this.initialized = false;
    }
  }
  
  // Initialize after the main content has loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Wait for all images and resources to load
    window.addEventListener('load', () => {
      // Wait a bit longer to ensure all initialization is complete
      setTimeout(() => {
        // Check if we're in design mode - don't show floating heads in design mode
        const designMode = localStorage.getItem('designMode') === 'true';
        
        if (!designMode) {
          // Create a floating heads instance with custom settings
          window.floatingHeads = new FloatingHeads({
            container: document.body,
            imagesPath: '/archive_assets/5_heads/',  // Path based on server structure
            zIndex: 50,                              // Above canvas but below UI
            frameDuration: 200,                      // Slower frame rate for stop-motion feel
            maxRotation: 8,                          // Slightly more rotation
            parallaxStrength: 35,                    // Increased parallax effect
            scaleRange: [0.6, 1.2]                   // Varied sizes for more depth
          });
          
          // Automatically hide/show based on menu activity
          const checkMenuState = () => {
            const activeMenuItems = document.querySelectorAll('.menu-item.active');
            if (activeMenuItems.length > 0) {
              if (window.floatingHeads) window.floatingHeads.hide();
            } else {
              if (window.floatingHeads) window.floatingHeads.show();
            }
          };
          
          // Initial check
          checkMenuState();
          
          // Also check when hash changes (for navigation)
          window.addEventListener('hashchange', checkMenuState);
          
          // Listen for design mode toggling
          document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
              // Design mode toggle shortcut detected
              setTimeout(() => {
                const newDesignMode = localStorage.getItem('designMode') === 'true';
                if (newDesignMode && window.floatingHeads) {
                  // Destroy floating heads in design mode
                  window.floatingHeads.destroy();
                  window.floatingHeads = null;
                } else if (!newDesignMode && !window.floatingHeads) {
                  // Recreate floating heads when exiting design mode
                  window.floatingHeads = new FloatingHeads({
                    container: document.body,
                    imagesPath: '/archive_assets/5_heads/',
                    zIndex: 50,
                    frameDuration: 200,
                    maxRotation: 8,
                    parallaxStrength: 35,
                    scaleRange: [0.6, 1.2]
                  });
                }
              }, 100);
            }
          });
        }
      }, 500);
    });
  });