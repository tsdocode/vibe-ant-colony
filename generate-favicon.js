// This is a simple script to convert the SVG favicon to PNG
// You can run this with Node.js if you have the 'sharp' package installed
// npm install sharp
// node generate-favicon.js

const fs = require('fs');
const sharp = require('sharp');

// Read the SVG file
const svgBuffer = fs.readFileSync('favicon.svg');

// Convert to PNG
sharp(svgBuffer)
  .resize(32, 32) // Resize to desired dimensions
  .toFile('favicon.png', (err, info) => {
    if (err) {
      console.error('Error generating PNG favicon:', err);
    } else {
      console.log('PNG favicon generated successfully:', info);
    }
  });

// You can also generate multiple sizes for different devices
const sizes = [16, 32, 48, 64, 128, 192, 256];

sizes.forEach(size => {
  sharp(svgBuffer)
    .resize(size, size)
    .toFile(`favicon-${size}.png`, (err, info) => {
      if (err) {
        console.error(`Error generating ${size}x${size} favicon:`, err);
      } else {
        console.log(`${size}x${size} favicon generated successfully:`, info);
      }
    });
}); 