class PheromoneMap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.resolution = 5; // Resolution of pheromone grid
    this.cols = floor(width / this.resolution);
    this.rows = floor(height / this.resolution);
    
    // Create two pheromone grids:
    // homePheromones (0): Lead to home/nest
    // foodPheromones (1): Lead to food sources
    this.homePheromones = new Array(this.cols * this.rows).fill(0);
    this.foodPheromones = new Array(this.cols * this.rows).fill(0);
  }
  
  // Convert x,y coordinates to array index
  coordToIndex(x, y) {
    const col = floor(constrain(x / this.resolution, 0, this.cols - 1));
    const row = floor(constrain(y / this.resolution, 0, this.rows - 1));
    return row * this.cols + col;
  }
  
  // Add pheromone at position
  addPheromone(x, y, isFood, strength) {
    const index = this.coordToIndex(x, y);
    if (isFood) {
      this.foodPheromones[index] += strength;
    } else {
      this.homePheromones[index] += strength;
    }
  }
  
  // Get pheromone value at position
  getPheromone(x, y, lookingForHome) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 0;
    }
    
    const index = this.coordToIndex(x, y);
    // If ant has food, it's looking for home, otherwise it's looking for food
    return lookingForHome ? this.homePheromones[index] : this.foodPheromones[index];
  }
  
  // Clear all pheromones
  clear() {
    this.homePheromones = new Array(this.cols * this.rows).fill(0);
    this.foodPheromones = new Array(this.cols * this.rows).fill(0);
  }
  
  // Update pheromones (evaporation and diffusion)
  update() {
    // Create new arrays for the updated values
    const newHomePheromones = [...this.homePheromones];
    const newFoodPheromones = [...this.foodPheromones];
    
    // Process evaporation and diffusion
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        const index = j * this.cols + i;
        
        // Evaporation
        newHomePheromones[index] *= config.evaporationRate;
        newFoodPheromones[index] *= config.evaporationRate;
        
        // Diffusion - average with neighbors
        this.diffuse(newHomePheromones, i, j, this.homePheromones);
        this.diffuse(newFoodPheromones, i, j, this.foodPheromones);
      }
    }
    
    // Update the pheromone arrays
    this.homePheromones = newHomePheromones;
    this.foodPheromones = newFoodPheromones;
  }
  
  diffuse(newArray, i, j, sourceArray) {
    const index = j * this.cols + i;
    let sum = 0;
    let count = 0;
    
    // Check surrounding cells (Moore neighborhood)
    for (let di = -1; di <= 1; di++) {
      for (let dj = -1; dj <= 1; dj++) {
        const ni = i + di;
        const nj = j + dj;
        
        // Skip if out of bounds
        if (ni < 0 || ni >= this.cols || nj < 0 || nj >= this.rows) {
          continue;
        }
        
        const neighborIndex = nj * this.cols + ni;
        sum += sourceArray[neighborIndex];
        count++;
      }
    }
    
    if (count > 0) {
      // Blend current value with average of neighbors
      newArray[index] = sourceArray[index] * (1 - config.diffusionRate) + 
                        (sum / count) * config.diffusionRate;
    }
  }
  
  // Display pheromones on canvas
  display() {
    noStroke();
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        const index = j * this.cols + i;
        const x = i * this.resolution;
        const y = j * this.resolution;
        
        // Display home pheromones in blue
        const homePheromone = this.homePheromones[index];
        if (homePheromone > 0.1) {
          fill(0, 0, 255, homePheromone * 100);
          rect(x, y, this.resolution, this.resolution);
        }
        
        // Display food pheromones in green
        const foodPheromone = this.foodPheromones[index];
        if (foodPheromone > 0.1) {
          fill(0, 255, 0, foodPheromone * 100);
          rect(x, y, this.resolution, this.resolution);
        }
      }
    }
  }
} 