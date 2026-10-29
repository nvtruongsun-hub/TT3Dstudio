const fs = require('fs');
const { PNG } = require('pngjs');

const p1 = 'assets/images/poster-r4/icecream-clicker.png';
const p2 = 'assets/images/products/thumb_2331892.png';

const img1 = PNG.sync.read(fs.readFileSync(p1));
const img2 = PNG.sync.read(fs.readFileSync(p2));

console.log('p1 size:', img1.width, img1.height);
console.log('p2 size:', img2.width, img2.height);

// Check if they have transparent pixels or corners
function checkCorners(img, name) {
  const corners = [
    [0, 0],
    [img.width - 1, 0],
    [0, img.height - 1],
    [img.width - 1, img.height - 1]
  ];
  console.log(`${name} corner colors:`);
  corners.forEach(([x, y]) => {
    const idx = (img.width * y + x) << 2;
    console.log(`  (${x},${y}): R=${img.data[idx]}, G=${img.data[idx+1]}, B=${img.data[idx+2]}, A=${img.data[idx+3]}`);
  });
}

checkCorners(img1, 'p1 (poster-r4/icecream-clicker.png)');
checkCorners(img2, 'p2 (products/thumb_2331892.png)');
