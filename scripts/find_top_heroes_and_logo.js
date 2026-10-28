const fs = require('fs');
const path = require('path');

// 1. Tìm logo
function findFiles(dir, pattern) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules' && f.name !== '.git' && f.name !== '.next') {
      results = results.concat(findFiles(full, pattern));
    } else if (f.isFile() && pattern.test(f.name)) {
      results.push(full);
    }
  }
  return results;
}

const logos = findFiles('.', /logo|brand|avatar|tt3d/i);
console.log('=== LOGO FILES FOUND ===');
logos.forEach(l => console.log(l));

// 2. Tìm sản phẩm hero / đặc sắc nhất trong products.json
const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
console.log('\n=== TOP AESTHETIC & HERO PRODUCTS ===');
const heroes = products.filter(p => p.isHero || (p.selectionScore && p.selectionScore >= 95) || p.downloads >= 5000);
heroes.forEach(p => {
  const imgExists = fs.existsSync(p.image);
  console.log(`[${p.id}] ${p.title} | ${p.price}₫ | hero: ${p.isHero} | dl: ${p.downloads} | img: ${p.image} (${imgExists ? 'OK' : 'MISSING'})`);
});

console.log('\n=== ALL CATEGORIES & TOP ITEMS ===');
const categories = {};
products.forEach(p => {
  if (!categories[p.category]) categories[p.category] = [];
  categories[p.category].push(p);
});
for (const [cat, list] of Object.entries(categories)) {
  console.log(`Category: ${cat} (${list.length} products)`);
  list.slice(0, 3).forEach(p => console.log(`  - [${p.id}] ${p.title} (${p.price}₫)`));
}
