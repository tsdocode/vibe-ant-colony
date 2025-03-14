// Controls for the ant colony simulation
let showPheromones = true;

// Wait for DOM to load completely
document.addEventListener('DOMContentLoaded', function() {
  // Get references to all control elements
  const addAntsButton = document.getElementById('add-ants');
  const antCountSlider = document.getElementById('ant-count-slider');
  const antCountDisplay = document.getElementById('ant-count-display');
  const pheromoneStrengthSlider = document.getElementById('pheromone-strength-slider');
  const pheromoneStrengthDisplay = document.getElementById('pheromone-strength-display');
  const evaporationRateSlider = document.getElementById('evaporation-rate-slider');
  const evaporationRateDisplay = document.getElementById('evaporation-rate-display');
  const antSpeedSlider = document.getElementById('ant-speed-slider');
  const antSpeedDisplay = document.getElementById('ant-speed-display');
  const randomBehaviorSlider = document.getElementById('random-behavior-slider');
  const randomBehaviorDisplay = document.getElementById('random-behavior-display');
  const togglePheromonesButton = document.getElementById('toggle-pheromones');
  const clearPheromonesButton = document.getElementById('clear-pheromones');
  const addObstacleButton = document.getElementById('add-obstacle');
  const clearObstaclesButton = document.getElementById('clear-obstacles');
  const resetSimulationButton = document.getElementById('reset-simulation');
  const panelOverlay = document.getElementById('panel-overlay');
  
  // Initialize the toggle pheromones button text
  togglePheromonesButton.textContent = showPheromones ? 'Hide Pheromones' : 'Show Pheromones';

  // Add ants button
  addAntsButton.addEventListener('click', function() {
    addMoreAnts(10); // Add 10 ants when clicked
    closeControlPanelsOnMobile();
  });

  // Ant count slider
  antCountSlider.addEventListener('input', function() {
    const newCount = parseInt(this.value);
    antCountDisplay.textContent = newCount;
    updateAntCount(newCount);
  });

  // Pheromone strength slider
  pheromoneStrengthSlider.addEventListener('input', function() {
    const newStrength = parseFloat(this.value);
    pheromoneStrengthDisplay.textContent = newStrength.toFixed(1);
    config.pheromoneStrength = newStrength;
  });

  // Evaporation rate slider
  evaporationRateSlider.addEventListener('input', function() {
    const newRate = parseFloat(this.value);
    evaporationRateDisplay.textContent = newRate.toFixed(3);
    config.evaporationRate = newRate;
  });

  // Ant speed slider
  antSpeedSlider.addEventListener('input', function() {
    const newSpeed = parseFloat(this.value);
    antSpeedDisplay.textContent = newSpeed.toFixed(1);
    updateAntSpeed(newSpeed);
  });
  
  // Random behavior slider
  randomBehaviorSlider.addEventListener('input', function() {
    const newRate = parseFloat(this.value);
    randomBehaviorDisplay.textContent = newRate.toFixed(2);
    config.randomBehaviorRate = newRate;
  });

  // Toggle pheromones button
  togglePheromonesButton.addEventListener('click', function() {
    showPheromones = !showPheromones;
    this.textContent = showPheromones ? 'Hide Pheromones' : 'Show Pheromones';
    closeControlPanelsOnMobile();
  });

  // Clear pheromones button
  clearPheromonesButton.addEventListener('click', function() {
    clearPheromones();
    closeControlPanelsOnMobile();
  });
  
  // Add obstacle button
  addObstacleButton.addEventListener('click', function() {
    // Add a random obstacle
    let x = random(50, width - 50);
    let y = random(50, height - 50);
    let size = random(30, 80);
    
    // Make sure it's not too close to the nest
    if (dist(x, y, config.nestX, config.nestY) > config.nestRadius * 2) {
      obstacles.push(new Obstacle(x, y, size));
    }
    
    closeControlPanelsOnMobile();
  });
  
  // Clear obstacles button
  clearObstaclesButton.addEventListener('click', function() {
    obstacles = [];
    closeControlPanelsOnMobile();
  });

  // Reset simulation button
  resetSimulationButton.addEventListener('click', function() {
    resetSimulation();
    closeControlPanelsOnMobile();
  });
  
  // Function to close panels on mobile after button actions
  function closeControlPanelsOnMobile() {
    if (window.innerWidth <= 768) {
      document.getElementById('left-panel').classList.remove('active');
      document.getElementById('right-panel').classList.remove('active');
      panelOverlay.classList.remove('active');
    }
  }
  
  // Update UI to match initial config
  updateUIFromConfig();
});

// Function to update UI to match config values
function updateUIFromConfig() {
  if (document.readyState === 'complete') {
    document.getElementById('ant-count-slider').value = config.antCount;
    document.getElementById('ant-count-display').textContent = config.antCount;
    document.getElementById('pheromone-strength-slider').value = config.pheromoneStrength;
    document.getElementById('pheromone-strength-display').textContent = config.pheromoneStrength.toFixed(1);
    document.getElementById('evaporation-rate-slider').value = config.evaporationRate;
    document.getElementById('evaporation-rate-display').textContent = config.evaporationRate.toFixed(3);
    document.getElementById('ant-speed-slider').value = config.antSpeed;
    document.getElementById('ant-speed-display').textContent = config.antSpeed.toFixed(1);
    document.getElementById('random-behavior-slider').value = config.randomBehaviorRate;
    document.getElementById('random-behavior-display').textContent = config.randomBehaviorRate.toFixed(2);
  }
}

// Function to add more ants to the colony
function addMoreAnts(count) {
  // Adjust count for mobile
  if (config.isMobile && count > 5) {
    count = 5; // Add fewer ants at once on mobile for performance
  }
  
  const newAnts = colony.addAnts(count);
  config.antCount += count;
  
  // Update the ant count slider and display
  const antCountSlider = document.getElementById('ant-count-slider');
  const antCountDisplay = document.getElementById('ant-count-display');
  
  antCountSlider.value = config.antCount;
  antCountDisplay.textContent = config.antCount;
}

// Function to update the ant count
function updateAntCount(newCount) {
  const diff = newCount - config.antCount;
  
  if (diff > 0) {
    // Add more ants
    colony.addAnts(diff);
  } else if (diff < 0) {
    // Remove some ants
    colony.removeAnts(Math.abs(diff));
  }
  
  config.antCount = newCount;
}

// Function to update the speed of all ants
function updateAntSpeed(newSpeed) {
  config.antSpeed = newSpeed;
  
  // Update the speed of all existing ants
  for (let ant of colony.ants) {
    // Maintain the direction but change the magnitude
    ant.velocity.normalize().mult(newSpeed);
  }
}

// Function to clear all pheromones
function clearPheromones() {
  if (pheromoneMap) {
    pheromoneMap.clear();
  }
}

// Function to reset the entire simulation
function resetSimulation() {
  // Detect if we're on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  
  // Reset to initial configuration
  const defaultConfig = {
    canvasWidth: window.innerWidth < 768 ? window.innerWidth : 700,
    canvasHeight: window.innerWidth < 768 ? window.innerHeight * 0.7 : 600,
    antCount: isMobile ? 50 : 100,
    foodCount: isMobile ? 3 : 5,
    nestX: 0, // Will be set in setup based on canvas size
    nestY: 0, // Will be set in setup based on canvas size
    nestRadius: 20,
    evaporationRate: 0.995,
    diffusionRate: 0.1,
    antSpeed: 2,
    pheromoneStrength: 1.0,
    randomBehaviorRate: 0.1,
    obstacleCount: isMobile ? 3 : 5,
    isMobile: isMobile
  };
  
  // Update the config with default values
  Object.assign(config, defaultConfig);
  
  // Show pheromones by default after reset
  showPheromones = true;
  document.getElementById('toggle-pheromones').textContent = 'Hide Pheromones';
  
  // Update UI controls to match defaults
  updateUIFromConfig();
  
  // Restart the simulation
  setup();
} 