/**
 * Logo Animation
 * Handles the rotating logo display and its visibility based on menu section
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create the logo container and image elements
    createLogoElements();
    
    // Setup event listeners for menu navigation to control logo visibility
    setupLogoVisibilityHandlers();
  });
  
  // Create and add the logo elements to the DOM
  function createLogoElements() {
    // Create container
    const logoContainer = document.createElement('div');
    logoContainer.className = 'logo-container';
    logoContainer.id = 'logo-container';
    
    // Create image
    const logoImage = document.createElement('img');
    logoImage.src = '/Logo/LOGO_Round_White.png';
    logoImage.alt = 'FC Ensemble Logo';
    
    // Add image to container
    logoContainer.appendChild(logoImage);
    
    // Add container to body (after the canvas container for proper stacking)
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
      document.body.insertBefore(logoContainer, canvasContainer.nextSibling);
    } else {
      document.body.appendChild(logoContainer);
    }
  }
  
  // Set up event listeners to manage logo visibility
  function setupLogoVisibilityHandlers() {
    // Get menu items
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Check initial state (if a section is already active on page load)
    checkInitialState();
    
    // Listen for menu item clicks
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        updateLogoVisibility();
      });
    });
    
    // Also listen for hash changes (for browser navigation)
    window.addEventListener('popstate', () => {
      updateLogoVisibility();
    });
    
    window.addEventListener('hashchange', () => {
      updateLogoVisibility();
    });
  }
  
  // Check if any section is active on page load
  function checkInitialState() {
    // If the URL has a hash for a section, check if logo should be hidden
    setTimeout(updateLogoVisibility, 100);
  }
  
  function updateLogoVisibility() {
    const logoContainer = document.getElementById('logo-container');
    if (!logoContainer) return;
    
    // Check if any section is active
    const archiveGallery = document.getElementById('archive-gallery');
    const mixesGallery = document.getElementById('mixes-gallery');
    const eventsGallery = document.getElementById('events-gallery');
    
    const archiveActive = archiveGallery && archiveGallery.classList.contains('active');
    const mixesActive = mixesGallery && mixesGallery.classList.contains('active');
    const eventsActive = eventsGallery && eventsGallery.classList.contains('active');
    
    // Check if contact menu is active
    const contactActive = document.querySelector('.menu-item[data-section="contact"]')?.classList.contains('active');
    
    // Check if fullscreen viewer is active
    const fullscreenActive = document.getElementById('fullscreen-viewer') && 
                            document.getElementById('fullscreen-viewer').classList.contains('active');
    
    // Check if body has fullscreen mode class
    const fullscreenMode = document.body.classList.contains('fullscreen-mode');
    
    // If any section is active, hide the logo
    if (archiveActive || mixesActive || contactActive || fullscreenActive || fullscreenMode) {
      logoContainer.style.opacity = '0';
    } else {
      logoContainer.style.opacity = '1';
    }
  }