class Ant {
  constructor(position, colony) {
    this.position = position.copy();
    this.colony = colony;
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(config.antSpeed);
    this.size = 4;
    this.hasFood = false;
    this.wanderStrength = 0.3;
    this.sensorAngle = config.sensorAngle;
    this.sensorDistance = config.sensorDistance;
    this.memoryLength = 10; // How many steps to remember
    this.path = []; // Store the recent path
    this.randomBehavior = random() < 0.2; // Some ants are naturally more random
    this.color = this.randomBehavior ? color(220, 220, 255) : color(255);
    this.lastCollision = 0; // Track time since last collision
  }

  update(foods, pheromoneMap, obstacles) {
    // Store current position in path memory
    this.rememberPath();
    
    // Check if this ant should be randomly ignoring pheromones
    let ignoresPheromones = this.randomBehavior || random() < config.randomBehaviorRate;
    
    if (!ignoresPheromones) {
      // Sense pheromones and adjust direction
      this.sense(pheromoneMap);
    } else {
      // Random wandering behavior
      this.wander();
    }
    
    // Store previous position
    let prevPosition = this.position.copy();
    
    // Move the ant
    this.position.add(this.velocity);
    
    // Check for collisions with obstacles
    this.checkObstacleCollisions(obstacles);
    
    // Check for collisions with edges
    this.checkEdges();
    
    // Look for food if not carrying any
    if (!this.hasFood) {
      this.lookForFood(foods);
    } 
    // Return to nest if carrying food
    else {
      this.returnToNest();
    }
    
    // Drop pheromones based on state
    this.leavePheromone(pheromoneMap);
  }

  rememberPath() {
    this.path.push(this.position.copy());
    if (this.path.length > this.memoryLength) {
      this.path.shift();
    }
  }

  sense(pheromoneMap) {
    // Calculate sensor positions
    let forwardSensor = p5.Vector.add(
      this.position,
      p5.Vector.mult(this.velocity.copy().normalize(), this.sensorDistance)
    );
    
    let leftSensor = p5.Vector.add(
      this.position,
      p5.Vector.mult(this.velocity.copy().rotate(-this.sensorAngle).normalize(), this.sensorDistance)
    );
    
    let rightSensor = p5.Vector.add(
      this.position,
      p5.Vector.mult(this.velocity.copy().rotate(this.sensorAngle).normalize(), this.sensorDistance)
    );
    
    // Get pheromone values at sensor positions
    let forwardPheromone = pheromoneMap.getPheromone(forwardSensor.x, forwardSensor.y, this.hasFood);
    let leftPheromone = pheromoneMap.getPheromone(leftSensor.x, leftSensor.y, this.hasFood);
    let rightPheromone = pheromoneMap.getPheromone(rightSensor.x, rightSensor.y, this.hasFood);
    
    // Steer based on pheromone strengths
    if (forwardPheromone > leftPheromone && forwardPheromone > rightPheromone) {
      // Continue forward, maybe with a slight random adjustment
      this.velocity.rotate(random(-0.1, 0.1));
    } else if (leftPheromone > rightPheromone) {
      // Turn left
      this.velocity.rotate(-random(0.1, 0.3));
    } else if (rightPheromone > leftPheromone) {
      // Turn right
      this.velocity.rotate(random(0.1, 0.3));
    } else {
      // Random wandering behavior
      this.wander();
    }
  }

  wander() {
    // Add some random steering
    let randomStrength = this.randomBehavior ? this.wanderStrength * 2 : this.wanderStrength;
    this.velocity.rotate(random(-randomStrength, randomStrength));
    this.velocity.setMag(config.antSpeed);
  }

  checkObstacleCollisions(obstacles) {
    // Skip if just collided (to prevent getting stuck)
    if (millis() - this.lastCollision < 200) return;
    
    for (let obstacle of obstacles) {
      if (obstacle.checkCollision(this)) {
        this.lastCollision = millis();
        // Add some randomness after collision
        this.velocity.rotate(random(-0.5, 0.5));
        break;
      }
    }
  }

  checkEdges() {
    // Bounce off edges
    if (this.position.x < 0 || this.position.x > width) {
      this.velocity.x *= -1;
      this.position.x = constrain(this.position.x, 0, width);
      this.lastCollision = millis();
    }
    if (this.position.y < 0 || this.position.y > height) {
      this.velocity.y *= -1;
      this.position.y = constrain(this.position.y, 0, height);
      this.lastCollision = millis();
    }
  }

  lookForFood(foods) {
    for (let food of foods) {
      if (dist(this.position.x, this.position.y, food.position.x, food.position.y) < food.size / 2) {
        // Found food!
        if (food.amount > 0) {
          this.hasFood = true;
          food.amount -= 1;
          
          // Turn around and head back to nest
          this.velocity.mult(-1);
          return;
        }
      }
    }
  }

  returnToNest() {
    // Check if reached nest
    if (dist(this.position.x, this.position.y, config.nestX, config.nestY) < config.nestRadius) {
      this.hasFood = false;
      this.colony.foodCollected++;
      
      // Turn around and head back out
      this.velocity.mult(-1);
    } else {
      // Adjust direction toward nest
      let toNest = createVector(config.nestX - this.position.x, config.nestY - this.position.y);
      toNest.normalize();
      
      // Blend current direction with nest direction
      let steerStrength = 0.1;
      this.velocity.lerp(toNest, steerStrength);
      this.velocity.setMag(config.antSpeed);
    }
  }

  leavePheromone(pheromoneMap) {
    if (this.hasFood) {
      // Leave food pheromone (type 1)
      pheromoneMap.addPheromone(this.position.x, this.position.y, true, config.pheromoneStrength);
    } else {
      // Leave home pheromone (type 0)
      pheromoneMap.addPheromone(this.position.x, this.position.y, false, config.pheromoneStrength * 0.5);
    }
  }

  display() {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading());
    
    // Draw ant body
    noStroke();
    if (this.hasFood) {
      fill(255, 200, 0);
    } else if (this.randomBehavior) {
      // Slightly different color for random ants
      fill(220, 220, 255);
    } else {
      fill(255);
    }
    
    ellipse(0, 0, this.size * 2, this.size);
    
    // Draw ant head
    fill(this.hasFood ? color(255, 200, 0) : this.color);
    ellipse(this.size, 0, this.size, this.size);
    
    pop();
  }
}

class Colony {
  constructor(x, y, radius, antCount) {
    this.position = createVector(x, y);
    this.radius = radius;
    this.ants = [];
    this.foodCollected = 0;
    
    // Create ants at random positions around the nest
    for (let i = 0; i < antCount; i++) {
      this.createAnt();
    }
  }

  // Creates a new ant at a random position around the nest
  createAnt() {
    let angle = random(TWO_PI);
    let r = random(this.radius);
    let pos = createVector(
      this.position.x + cos(angle) * r,
      this.position.y + sin(angle) * r
    );
    let ant = new Ant(pos, this);
    this.ants.push(ant);
    return ant;
  }
  
  // Add a specific number of new ants to the colony
  addAnts(count) {
    let newAnts = [];
    for (let i = 0; i < count; i++) {
      newAnts.push(this.createAnt());
    }
    return newAnts;
  }
  
  // Remove a specific number of ants from the colony
  removeAnts(count) {
    count = Math.min(count, this.ants.length);
    this.ants.splice(this.ants.length - count, count);
  }

  update(foods, pheromoneMap, obstacles) {
    for (let ant of this.ants) {
      ant.update(foods, pheromoneMap, obstacles);
    }
  }

  display() {
    // Draw nest
    fill(220, 160, 40);
    ellipse(this.position.x, this.position.y, this.radius * 2);
    
    // Draw ants
    for (let ant of this.ants) {
      ant.display();
    }
  }
} 