const fs = require('fs');

const appContent = fs.readFileSync('js/app.js', 'utf8');

// Match seedProducts array
const match = appContent.match(/const\s+seedProducts\s*=\s*(\[[\s\S]*?\]);\s*\n/);
if (!match) {
  console.log('seedProducts not matched directly, searching for product objects');
} else {
  // Try evaluating or extracting
  try {
    const products = eval(match[1]);
    console.log(`Found ${products.length} products in seedProducts!`);
    
    // Group by category
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
      byCat[c].forEach(p => console.log(`  - [${p.id}] ${p.title} | ${p.price.toLocaleString()}đ | DL: ${p.downloads} | img: ${p.image}`));
    });
  } catch (e) {
    console.error('Eval error:', e.message);
  }
}
