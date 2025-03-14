class Obstacle {
  constructor(x, y, size) {
    this.position = createVector(x, y);
    this.size = size;
    this.type = random() > 0.5 ? 'rock' : 'wall';
    
    if (this.type === 'rock') {
      // Round rock
      this.shape = 'ellipse';
      this.radius = size / 2;
      this.color = color(120, 120, 120);
      
      // Create some bumps for the rock
      this.bumpCount = floor(random(5, 10));
      this.bumps = [];
      for (let i = 0; i < this.bumpCount; i++) {
        this.bumps.push({
          angle: i * TWO_PI / this.bumpCount,
          size: random(0.8, 1.2)
        });
      }
    } else {
      // Rectangular wall
      this.shape = 'rect';
      this.width = size;
      this.height = size / random(1.5, 3);
      this.rotation = random(TWO_PI);
      this.color = color(80, 60, 40);
    }
  }
  
  display() {
    push();
    translate(this.position.x, this.position.y);
    
    if (this.type === 'rock') {
      // Draw the rock with bumps
      noStroke();
      
      // Shadow
      fill(0, 0, 0, 50);
      ellipse(5, 5, this.size * 0.9);
      
      // Main rock body
      fill(this.color);
      beginShape();
      for (let i = 0; i < this.bumpCount; i++) {
        let angle = this.bumps[i].angle;
        let r = this.radius * this.bumps[i].size;
        let x = cos(angle) * r;
        let y = sin(angle) * r;
        curveVertex(x, y);
      }
      // Add the first few points again to close the shape smoothly
      for (let i = 0; i < 3; i++) {
        let angle = this.bumps[i].angle;
        let r = this.radius * this.bumps[i].size;
        let x = cos(angle) * r;
        let y = sin(angle) * r;
        curveVertex(x, y);
      }
      endShape();
      
      // Highlights
      fill(200, 200, 200, 50);
      ellipse(-this.radius / 3, -this.radius / 3, this.radius * 0.6);
      
    } else {
      // Draw the wall
      rotate(this.rotation);
      
      // Shadow
      fill(0, 0, 0, 50);
      rect(-this.width / 2 + 3, -this.height / 2 + 3, this.width, this.height, 3);
      
      // Main wall
      fill(this.color);
      rect(-this.width / 2, -this.height / 2, this.width, this.height, 3);
      
      // Add some brick pattern
      stroke(60, 40, 20, 100);
      strokeWeight(1);
      let brickHeight = this.height / 5;
      let brickWidth = this.width / 3;
      
      for (let y = -this.height / 2; y < this.height / 2; y += brickHeight) {
        line(-this.width / 2, y, this.width / 2, y);
      }
      
      for (let x = -this.width / 2; x < this.width / 2; x += brickWidth) {
        line(x, -this.height / 2, x, this.height / 2);
      }
    }
    
    pop();
  }
  
  // Check if a point is inside this obstacle
  contains(x, y) {
    let d = dist(x, y, this.position.x, this.position.y);
    
    if (this.type === 'rock') {
      return d < this.radius;
    } else {
      // For walls, we need to check based on rotation
      // Transform the point to the wall's coordinate system
      let rotatedX = (x - this.position.x) * cos(-this.rotation) - (y - this.position.y) * sin(-this.rotation);
      let rotatedY = (x - this.position.x) * sin(-this.rotation) + (y - this.position.y) * cos(-this.rotation);
      
      return abs(rotatedX) < this.width / 2 && abs(rotatedY) < this.height / 2;
    }
  }
  
  // Check if a moving ant collides with this obstacle
  checkCollision(ant) {
    if (this.type === 'rock') {
      // Simple distance check for rock
      let d = dist(ant.position.x, ant.position.y, this.position.x, this.position.y);
      if (d < this.radius + ant.size) {
        // Collision detected, reflect the ant's velocity
        let toAnt = p5.Vector.sub(ant.position, this.position);
        toAnt.normalize();
        ant.velocity = p5.Vector.mult(toAnt, ant.velocity.mag());
        
        // Push the ant outside the obstacle
        let pushDist = this.radius + ant.size - d;
        ant.position.add(p5.Vector.mult(toAnt, pushDist));
        return true;
      }
    } else {
      // For walls, we need to check based on rotation
      // Transform the point to the wall's coordinate system
      let rotatedX = (ant.position.x - this.position.x) * cos(-this.rotation) - (ant.position.y - this.position.y) * sin(-this.rotation);
      let rotatedY = (ant.position.x - this.position.x) * sin(-this.rotation) + (ant.position.y - this.position.y) * cos(-this.rotation);
      
      // Check if within the wall's bounding box
      if (abs(rotatedX) < this.width / 2 + ant.size && abs(rotatedY) < this.height / 2 + ant.size) {
        // Determine which side was hit (horizontal or vertical)
        let overlapH = this.width / 2 + ant.size - abs(rotatedX);
        let overlapV = this.height / 2 + ant.size - abs(rotatedY);
        
        if (overlapH < overlapV) {
          // Horizontal collision
          let rotatedVel = createVector(ant.velocity.x * cos(-this.rotation) - ant.velocity.y * sin(-this.rotation),
                                       ant.velocity.x * sin(-this.rotation) + ant.velocity.y * cos(-this.rotation));
          rotatedVel.x *= -1; // Reflect x component
          
          // Transform velocity back
          ant.velocity.x = rotatedVel.x * cos(this.rotation) - rotatedVel.y * sin(this.rotation);
          ant.velocity.y = rotatedVel.x * sin(this.rotation) + rotatedVel.y * cos(this.rotation);
          
          // Push the ant outside the wall
          rotatedX = sign(rotatedX) * (this.width / 2 + ant.size);
        } else {
          // Vertical collision
          let rotatedVel = createVector(ant.velocity.x * cos(-this.rotation) - ant.velocity.y * sin(-this.rotation),
                                       ant.velocity.x * sin(-this.rotation) + ant.velocity.y * cos(-this.rotation));
          rotatedVel.y *= -1; // Reflect y component
          
          // Transform velocity back
          ant.velocity.x = rotatedVel.x * cos(this.rotation) - rotatedVel.y * sin(this.rotation);
          ant.velocity.y = rotatedVel.x * sin(this.rotation) + rotatedVel.y * cos(this.rotation);
          
          // Push the ant outside the wall
          rotatedY = sign(rotatedY) * (this.height / 2 + ant.size);
        }
        
        // Transform the position back
        ant.position.x = this.position.x + rotatedX * cos(this.rotation) - rotatedY * sin(this.rotation);
        ant.position.y = this.position.y + rotatedX * sin(this.rotation) + rotatedY * cos(this.rotation);
        
        return true;
      }
    }
    return false;
  }
}

// Helper function for the sign of a number
function sign(n) {
  return n > 0 ? 1 : (n < 0 ? -1 : 0);
} 