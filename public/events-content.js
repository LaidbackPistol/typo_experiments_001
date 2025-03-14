/**
 * Events Section Handling
 * Loads and displays events or a placeholder animation if no events are available
 */

document.addEventListener('DOMContentLoaded', function() {
    // Variables for the events gallery
    const eventsMenuItem = document.querySelector('.menu-item[data-section="events"]');
    const eventsGallery = document.getElementById('events-gallery');
    const eventsContainer = eventsGallery ? eventsGallery.querySelector('.gallery-container') : null;
    const eventsPlaceholder = eventsGallery ? eventsGallery.querySelector('.events-placeholder') : null;
    
    let eventsContentLoaded = false;
  
    // If events menu item exists, set up click handler
    if (eventsMenuItem) {
      eventsMenuItem.addEventListener('click', (e) => {
        // If events section becomes active, show the gallery
        if (eventsMenuItem.classList.contains('active')) {
          // Make sure events gallery has both proper visibility and active class
          if (eventsGallery) {
            eventsGallery.style.visibility = 'visible';
            eventsGallery.classList.add('active');
            
            // Only load content the first time, not on subsequent visits
            if (!eventsContentLoaded) {
              loadEventsContent();
              eventsContentLoaded = true;
            }
          }
          
          // Make sure other galleries are hidden to avoid conflicts
          const archiveGallery = document.getElementById('archive-gallery');
          const mixesGallery = document.getElementById('mixes-gallery');
          
          if (archiveGallery) {
            archiveGallery.classList.remove('active');
          }
          
          if (mixesGallery) {
            mixesGallery.classList.remove('active');
          }
        } else {
          // Hide the events gallery when section is deactivated
          if (eventsGallery) {
            eventsGallery.classList.remove('active');
          }
        }
      });
    }
  
    // Function to load events content from the server
    async function loadEventsContent() {
      if (!eventsContainer) return;
      
      try {
        // Show loading state
        if (eventsPlaceholder) {
          eventsPlaceholder.style.display = 'flex';
        }
        
        // Fetch events from the server
        const response = await fetch('/api/events');
        const data = await response.json();
        
        console.log('Events data:', data);
        
        // Check if we have actual events
        if (data.events && data.events.length > 0) {
          // Hide placeholder
          if (eventsPlaceholder) {
            eventsPlaceholder.style.display = 'none';
          }
          
          // Future implementation: display actual events
          // For now, we'll keep the placeholder visible
          
          console.log('Found', data.events.length, 'events to display');
        } else {
          // Show placeholder if no events
          if (eventsPlaceholder) {
            eventsPlaceholder.style.display = 'flex';
          }
          
          console.log('No events found. Showing placeholder.');
        }
      } catch (error) {
        console.error('Error loading events:', error);
        
        // Ensure placeholder is visible in case of error
        if (eventsPlaceholder) {
          eventsPlaceholder.style.display = 'flex';
        }
      }
    }
  
    // Check if events is already active on page load
    if (eventsMenuItem && eventsMenuItem.classList.contains('active') && eventsGallery) {
      eventsGallery.classList.add('active');
      loadEventsContent();
      eventsContentLoaded = true;
    }
  
    // Custom animations for the spinning text (optional enhancements)
    function enhanceSpinningText() {
      const spinningText = document.getElementById('spinning-text');
      const circularTextSvg = document.getElementById('circular-text-svg');
      const circularTextPath = document.getElementById('circular-text-path');
      
      if (spinningText && circularTextSvg) {
        // Function to optimize text spacing based on circle size
        function optimizeCircularText() {
          // Check if we're on mobile or desktop
          const isMobile = window.innerWidth <= 768;
          
          // Set base font size based on device type
          let fontSize, spacesNeeded;
          
          if (isMobile) {
            // Mobile settings
            fontSize = 14; // Fixed smaller size for mobile
            spacesNeeded = 8; // Less spaces on mobile
          } else {
            // Desktop settings
            fontSize = 14; // Fixed larger size for desktop
            spacesNeeded = 14; // More spaces on desktop
          }
          
          // Apply the font size directly via JavaScript
          spinningText.style.fontSize = `${fontSize}px`;
          spinningText.style.letterSpacing = `${Math.floor(fontSize / 4)}px`;
          
          // Create spaced text
          const spacing = ' '.repeat(spacesNeeded);
          spinningText.textContent = `STAY TUNED${spacing}STAY TUNED${spacing}`;
          
          console.log(`Circular text set: fontSize=${fontSize}px, spaces=${spacesNeeded}, mobile=${isMobile}`);
        }
        
        // Call once immediately
        optimizeCircularText();
        
        // Then again after a short delay to ensure rendering
        setTimeout(optimizeCircularText, 300);
        
        // Listen for window resize
        window.addEventListener('resize', function() {
          // Use debounce to avoid too many calculations
          clearTimeout(window.resizeTimer);
          window.resizeTimer = setTimeout(optimizeCircularText, 100);
        });
        
        // Reverse direction on hover
        circularTextSvg.addEventListener('mouseenter', () => {
          circularTextSvg.style.animationDirection = 'reverse';
        });
        
        circularTextSvg.addEventListener('mouseleave', () => {
          circularTextSvg.style.animationDirection = 'normal';
        });
        
        // Change spinning speed when music is detected
        if (window.isMusicPlaying !== undefined) {
          setInterval(() => {
            if (window.isMusicPlaying) {
              circularTextSvg.style.animationDuration = '10s';  // Faster when music is playing
            } else {
              circularTextSvg.style.animationDuration = '20s';  // Normal speed
            }
          }, 1000);
        }
      }
    }
    
    // Call the enhancement function
    enhanceSpinningText();
  });