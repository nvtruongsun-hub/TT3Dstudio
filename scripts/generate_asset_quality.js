const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const manifest = JSON.parse(fs.readFileSync('data/poster-r6.json', 'utf8'));

console.log('=== ASSET QUALITY & PPI REPORT PREPARATION ===');
const qualityReport = [];

manifest.items.forEach(item => {
  const filePath = path.resolve(item.image);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${filePath}`);
    return;
  }
  const img = PNG.sync.read(fs.readFileSync(filePath));
  let minX = img.width, maxX = 0, minY = img.height, maxY = 0;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const idx = (img.width * y + x) << 2;
      if (img.data[idx + 3] > 15) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const objW = maxX - minX + 1;
  const objH = maxY - minY + 1;
  qualityReport.push({
    id: item.id,
    name: item.name,
    image: item.image,
    sourceResolution: `${img.width}x${img.height}`,
    productBBox: `${objW}x${objH}`
  });
  console.log(`[${item.id}] ${item.name}: src ${img.width}x${img.height}, product bbox ${objW}x${objH}`);
});

fs.writeFileSync('reports/poster-r6/asset-quality.json', JSON.stringify(qualityReport, null, 2));
