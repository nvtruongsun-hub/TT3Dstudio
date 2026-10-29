const fs = require('fs');
const { PNG } = require('pngjs');

const p = 'assets/images/poster-r6/icecream-clicker.png';
const img = PNG.sync.read(fs.readFileSync(p));

let minX = img.width, maxX = 0, minY = img.height, maxY = 0;

for (let y = 0; y < img.height; y++) {
  for (let x = 0; x < img.width; x++) {
    const idx = (img.width * y + x) << 2;
    if (img.data[idx + 3] > 10) { // non-transparent
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

console.log(`Non-transparent bbox: X[${minX}..${maxX}] (${maxX - minX + 1}px), Y[${minY}..${maxY}] (${maxY - minY + 1}px)`);
