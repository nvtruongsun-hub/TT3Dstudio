const fs = require('fs');

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
console.log(`Loaded ${products.length} products from products.json\n`);

const byCat = {};
products.forEach(p => {
  byCat[p.category] = byCat[p.category] || [];
  byCat[p.category].push({
    id: p.id,
    title: p.title,
    price: p.price,
    downloads: p.downloads,
    image: p.image,
    description: p.description
  });
});

Object.keys(byCat).forEach(c => {
  console.log(`\n=== CATEGORY: ${c} (${byCat[c].length} items) ===`);
  byCat[c].forEach(p => {
    console.log(`  - [${p.id}] ${p.title} | ${p.price.toLocaleString()}đ | DL: ${p.downloads} | img: ${p.image}`);
  });
});
