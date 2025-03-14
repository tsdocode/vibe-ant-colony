// Mobile-specific controls and interactions

document.addEventListener('DOMContentLoaded', function() {
  // Get references to mobile elements
  const leftPanelToggle = document.getElementById('left-panel-toggle');
  const rightPanelToggle = document.getElementById('right-panel-toggle');
  const leftPanel = document.getElementById('left-panel');
  const rightPanel = document.getElementById('right-panel');
  const panelOverlay = document.getElementById('panel-overlay');
  
  // Check if required elements exist
  if (!leftPanelToggle || !rightPanelToggle || !leftPanel || !rightPanel || !panelOverlay) {
    console.warn('Mobile UI elements not found - mobile functionality may be limited');
    return; // Exit if elements don't exist
  }
  
  // Initialize panels as closed
  let leftPanelOpen = false;
  let rightPanelOpen = false;
  
  // Function to toggle the left panel
  leftPanelToggle.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent event from bubbling
    leftPanelOpen = !leftPanelOpen;
    rightPanelOpen = false; // Close the other panel
    
    leftPanel.classList.toggle('active', leftPanelOpen);
    rightPanel.classList.remove('active');
    panelOverlay.classList.toggle('active', leftPanelOpen);
  });
  
  // Function to toggle the right panel
  rightPanelToggle.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent event from bubbling
    rightPanelOpen = !rightPanelOpen;
    leftPanelOpen = false; // Close the other panel
    
    rightPanel.classList.toggle('active', rightPanelOpen);
    leftPanel.classList.remove('active');
    panelOverlay.classList.toggle('active', rightPanelOpen);
  });
  
  // Close panels when clicking overlay
  panelOverlay.addEventListener('click', function() {
    leftPanel.classList.remove('active');
    rightPanel.classList.remove('active');
    panelOverlay.classList.remove('active');
    leftPanelOpen = false;
    rightPanelOpen = false;
  });
  
  // Ensure clicks on the panels don't close them
  leftPanel.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent event from reaching the overlay
  });
  
  rightPanel.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent event from reaching the overlay
  });
  
  // Modified touch handling - Fix clicking issues
  
  // Instead of preventing ALL double-tap zooms, only prevent on the canvas
  const canvas = document.querySelector('canvas');
  let lastTouchEnd = 0;
  
  if (canvas) {
    canvas.addEventListener('touchend', function(event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
    
    // More selective touchmove prevention - only prevent on canvas
    canvas.addEventListener('touchmove', function(event) {
      if (event.touches.length > 1) {
        // Only prevent default for multi-touch on canvas
        event.preventDefault();
      }
    }, { passive: false });
  }
  
  // Allow touch events to pass through to buttons and controls
  document.querySelectorAll('button, input, .control-panel').forEach(function(el) {
    el.addEventListener('touchstart', function(e) {
      e.stopPropagation(); // Don't bubble up to the canvas
    }, { passive: true });
  });
  
  // Add instructions for mobile users
  const showMobileInstructions = function() {
    if (window.innerWidth <= 768 && !localStorage.getItem('mobileTipShown')) {
      // Show a tip for mobile users
      const tip = document.createElement('div');
      tip.className = 'mobile-tip';
      tip.innerHTML = `
        <div class="tip-content">
          <h3>Mobile Controls</h3>
          <p>• Tap on the <i class="fas fa-cog"></i> or <i class="fas fa-tree"></i> icons to access controls</p>
          <p>• Tap to add food sources</p>
          <p>• Use two-finger tap to add obstacles</p>
          <button id="close-tip">Got it!</button>
        </div>
      `;
      document.body.appendChild(tip);
      
      // Add style for the tip
      const style = document.createElement('style');
      style.textContent = `
        .mobile-tip {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tip-content {
          background: #1e1e1e;
          padding: 20px;
          border-radius: 8px;
          max-width: 80%;
          text-align: center;
        }
        .tip-content h3 {
          color: #4CAF50;
          margin-top: 0;
        }
        .tip-content p {
          margin: 10px 0;
        }
        #close-tip {
          background: #4CAF50;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          margin-top: 15px;
          cursor: pointer;
        }
      `;
      document.head.appendChild(style);
      
      // Close button - safely add event listener
      const closeButton = document.getElementById('close-tip');
      if (closeButton) {
        closeButton.addEventListener('click', function() {
          document.body.removeChild(tip);
          localStorage.setItem('mobileTipShown', 'true');
        });
      }
    }
  };
  
  // Show mobile instructions after a short delay
  setTimeout(showMobileInstructions, 1000);
  
  // Fix for iOS Safari - make the panels scrollable
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    document.querySelectorAll('.control-panel').forEach(panel => {
      panel.style.webkitOverflowScrolling = 'touch';
    });
  }
}); 