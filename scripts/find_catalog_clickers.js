const fs = require('fs');
const path = require('path');

const imgDir = path.resolve('assets/images/products');
if (fs.existsSync(imgDir)) {
  const files = fs.readdirSync(imgDir);
  console.log(`Total images in products: ${files.length}`);
  const clickers = files.filter(f => f.toLowerCase().includes('click') || f.toLowerCase().includes('key') || f.toLowerCase().includes('fidget'));
  console.log('Clicker/Key/Fidget image files:', clickers);
}

// Check makerworld or catalog files
['js/catalog.js', 'js/app.js', 'data/catalog.json', 'data/products.json'].forEach(f => {
  if (fs.existsSync(f)) {
    console.log(`Found ${f}`);
  }
});
