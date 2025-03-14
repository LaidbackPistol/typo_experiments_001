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
          // Get the dimensions of the SVG container
          const svgWidth = circularTextSvg.clientWidth || 300;
          const svgHeight = circularTextSvg.clientHeight || 300;
          
          // Calculate the radius (from our path: M50,90 a40,40 0 1,1 0,-80 a40,40 0 1,1 0,80z)
          // The radius in the viewBox coordinates is 40
          const viewBoxSize = 100; // The viewBox is 100x100
          const pathRadius = 40; // From the path definition
          
          // Convert the viewBox radius to actual pixels
          const actualRadius = (svgWidth / viewBoxSize) * pathRadius;
          
          // Calculate the circumference of the path
          const circumference = 2 * Math.PI * actualRadius;
          
          // Base text size on container size
          let fontSize = Math.max(10, Math.floor(svgWidth / 25));
          let letterSpacing = Math.max(2, Math.floor(svgWidth / 80));
          
          // Set the font size and letter spacing
          spinningText.style.fontSize = `${fontSize}px`;
          spinningText.style.letterSpacing = `${letterSpacing}px`;
          
          // Measure text "STAY TUNED" with current styles
          const tempSpan = document.createElement('span');
          tempSpan.style.fontFamily = 'monospace';
          tempSpan.style.fontSize = `${fontSize}px`;
          tempSpan.style.letterSpacing = `${letterSpacing}px`;
          tempSpan.style.fontWeight = 'bold';
          tempSpan.style.visibility = 'hidden';
          tempSpan.style.position = 'absolute';
          tempSpan.textContent = "STAY TUNED";
          document.body.appendChild(tempSpan);
          
          // Get the width of the text
          const textWidth = tempSpan.offsetWidth;
          document.body.removeChild(tempSpan);
          
          // Calculate spacing needed for perfect distribution (half the circumference minus text width)
          const halfCircumference = circumference / 2;
          const emptySpace = halfCircumference - textWidth;
          
          // Convert empty space to equivalent number of space characters
          const approximateSpaceWidth = fontSize * 0.6; // Monospace space is about 60% of font size
          const spacesNeeded = Math.max(4, Math.round(emptySpace / approximateSpaceWidth));
          
          // Set the text with calculated spacing
          spinningText.textContent = `STAY TUNED${' '.repeat(spacesNeeded)}STAY TUNED${' '.repeat(spacesNeeded)}`;
          
          console.log(`Circular text optimized: fontSize=${fontSize}px, spaces=${spacesNeeded}, circumference=${Math.round(circumference)}px`);
        }
        
        // Call once immediately
        optimizeCircularText();
        
        // Call again after a short delay to ensure accurate measurements
        setTimeout(optimizeCircularText, 200);
        
        // Then on window resize
        window.addEventListener('resize', optimizeCircularText);
        
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