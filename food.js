class Food {
  constructor(x, y, size) {
    this.position = createVector(x, y);
    this.size = size;
    this.amount = floor(size); // Amount of food proportional to size
    this.maxAmount = this.amount;
    this.color = color(0, 255, 0);
    this.originalSize = size; // Store the original size
    // Add subtle pulse effect
    this.pulseAmount = 0;
    this.pulseSpeed = random(0.03, 0.06);
  }
  
  display() {
    if (this.amount <= 0) return; // Don't display if no food left
    
    // Calculate the size based on remaining amount
    let currentSize = map(this.amount, 0, this.maxAmount, this.originalSize * 0.3, this.originalSize);
    
    // Add subtle pulse effect
    this.pulseAmount = (this.pulseAmount + this.pulseSpeed) % TWO_PI;
    let pulseFactor = 1 + sin(this.pulseAmount) * 0.05;
    currentSize *= pulseFactor;
    
    // Draw food with glow effect
    let alpha = map(this.amount, 0, this.maxAmount, 150, 255);
    
    // Glow effect
    noStroke();
    for (let i = 3; i > 0; i--) {
      let glowSize = currentSize + i * 4;
      let glowAlpha = alpha * (1 - i * 0.2);
      fill(0, 255, 0, glowAlpha);
      ellipse(this.position.x, this.position.y, glowSize);
    }
    
    // Main food
    fill(0, 255, 0, alpha);
    ellipse(this.position.x, this.position.y, currentSize);
    
    // Inner highlight
    fill(100, 255, 100, alpha * 0.7);
    ellipse(this.position.x - currentSize * 0.15, this.position.y - currentSize * 0.15, currentSize * 0.4);
    
    // Optionally display amount
    if (currentSize > 15) {
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(min(10, currentSize * 0.4));
      text(this.amount, this.position.x, this.position.y);
    }
  }
} 