// Global variables
let colony;
let foods = [];
let obstacles = [];
let pheromoneMap;
let config = {
  canvasWidth: 700,
  canvasHeight: 600,
  antCount: 100,
  foodCount: 5,
  nestX: 350,
  nestY: 300,
  nestRadius: 20,
  evaporationRate: 0.995, // Rate at which pheromones evaporate
  diffusionRate: 0.1,     // Rate at which pheromones diffuse
  antSpeed: 2,
  sensorAngle: Math.PI / 4, // 45 degrees
  sensorDistance: 20,
  pheromoneStrength: 1.0,
  randomBehaviorRate: 0.1, // Probability of ignoring pheromones
  obstacleCount: 5,        // Number of random obstacles to place
  isMobile: false          // Flag for mobile detection
};

function setup() {
  // Detect if we're on mobile
  detectMobile();
  
  // Make canvas responsive
  let canvasParent = document.getElementById('canvas-container');
  let canvasWidth = canvasParent.clientWidth - 30; // Account for padding
  let canvasHeight = min(window.innerHeight * 0.7, 600); // Limit max height
  
  config.canvasWidth = canvasWidth;
  config.canvasHeight = canvasHeight;
  
  // Center of canvas should be the nest position
  config.nestX = canvasWidth / 2;
  config.nestY = canvasHeight / 2;
  
  // Adjust parameters for mobile
  if (config.isMobile) {
    // Smaller values for better performance on mobile
    config.antCount = max(50, config.antCount);
    config.pheromoneStrength = min(2.0, config.pheromoneStrength);
    config.obstacleCount = 3;
  }
  
  // Create canvas inside the canvas-container
  const canvas = createCanvas(config.canvasWidth, config.canvasHeight);
  canvas.parent('canvas-container');
  
  // Initialize the pheromone map
  pheromoneMap = new PheromoneMap(config.canvasWidth, config.canvasHeight);
  
  // Create the ant colony
  colony = new Colony(config.nestX, config.nestY, config.nestRadius, config.antCount);
  
  // Place food sources randomly
  foods = [];
  for (let i = 0; i < config.foodCount; i++) {
    let x, y;
    // Make sure food is not placed inside the nest
    do {
      x = random(width);
      y = random(height);
    } while (dist(x, y, config.nestX, config.nestY) < config.nestRadius * 2);
    
    foods.push(new Food(x, y, random(20, 50)));
  }
  
  // Create obstacles
  obstacles = [];
  createRandomObstacles(config.obstacleCount);
  
  // Add window resize listener
  window.addEventListener('resize', windowResized);
}

function detectMobile() {
  // Check if we're on a mobile device
  config.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

function windowResized() {
  // Only resize if significant change in dimensions
  let canvasParent = document.getElementById('canvas-container');
  let newWidth = canvasParent.clientWidth - 30;
  let newHeight = min(window.innerHeight * 0.7, 600);
  
  // Check if size changed significantly
  if (abs(newWidth - config.canvasWidth) > 50 || abs(newHeight - config.canvasHeight) > 50) {
    // Save nest position relative ratio
    let nestXRatio = config.nestX / config.canvasWidth;
    let nestYRatio = config.nestY / config.canvasHeight;
    
    // Update canvas size
    config.canvasWidth = newWidth;
    config.canvasHeight = newHeight;
    
    // Update nest position
    config.nestX = config.canvasWidth * nestXRatio;
    config.nestY = config.canvasHeight * nestYRatio;
    
    // Resize canvas
    resizeCanvas(config.canvasWidth, config.canvasHeight);
    
    // Recreate pheromone map for new dimensions
    pheromoneMap = new PheromoneMap(config.canvasWidth, config.canvasHeight);
    
    // Update colony position
    colony.position.x = config.nestX;
    colony.position.y = config.nestY;
    
    // Redetect mobile
    detectMobile();
  }
}

function draw() {
  background(51);
  
  // Update and display pheromones
  pheromoneMap.update();
  
  // Only show pheromones if the toggle is on
  if (showPheromones) {
    pheromoneMap.display();
  }
  
  // Display obstacles
  for (let obstacle of obstacles) {
    obstacle.display();
  }
  
  // Display food sources
  for (let food of foods) {
    food.display();
  }
  
  // Update and display the colony
  colony.update(foods, pheromoneMap, obstacles);
  colony.display();
  
  // Display nest
  fill(220, 160, 40);
  noStroke();
  ellipse(config.nestX, config.nestY, config.nestRadius * 2);
  
  // Display simulation information
  displayInfo();
}

function displayInfo() {
  // Semi-transparent background for text
  fill(0, 0, 0, 150);
  noStroke();
  rect(5, 5, 180, 75, 5);
  
  // Text for info
  fill(255);
  textSize(config.isMobile ? 14 : 16);
  textAlign(LEFT, TOP);
  text(`Ants: ${colony.ants.length}`, 15, 15);
  text(`Food Collected: ${colony.foodCollected}`, 15, 40);
  text(`FPS: ${floor(frameRate())}`, 15, 65);
}

// Create random obstacles
function createRandomObstacles(count) {
  for (let i = 0; i < count; i++) {
    let x, y, size;
    // Make sure obstacles are not placed inside the nest
    do {
      x = random(50, width - 50);
      y = random(50, height - 50);
      size = random(30, 80);
    } while (dist(x, y, config.nestX, config.nestY) < config.nestRadius * 3);
    
    obstacles.push(new Obstacle(x, y, size));
  }
}

// Handle both mouse and touch input
function mousePressed() {
  handleInteraction(mouseX, mouseY);
}

function touchStarted() {
  // Prevent default touch behavior
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    handleInteraction(mouseX, mouseY);
    return false;
  }
  return true;
}

// Unified interaction handler
function handleInteraction(x, y) {
  // Only process clicks that happen on the canvas
  if (x >= 0 && x < width && y >= 0 && y < height) {
    // Check if shift key is pressed for obstacle placement
    if (keyIsDown(SHIFT) || (touches && touches.length > 1)) { // Shift key or multi-touch for obstacles
      // Place a new obstacle
      obstacles.push(new Obstacle(x, y, random(30, 60)));
      return;
    }
    
    // Check if near a food source to remove it
    for (let i = foods.length - 1; i >= 0; i--) {
      if (dist(x, y, foods[i].position.x, foods[i].position.y) < foods[i].size / 2) {
        foods.splice(i, 1);
        return;
      }
    }
    
    // Check if near an obstacle to remove it
    for (let i = obstacles.length - 1; i >= 0; i--) {
      if (obstacles[i].contains(x, y)) {
        obstacles.splice(i, 1);
        return;
      }
    }
    
    // Add new food if clicked away from nest
    if (dist(x, y, config.nestX, config.nestY) > config.nestRadius) {
      foods.push(new Food(x, y, random(20, 50)));
    }
  }
} 