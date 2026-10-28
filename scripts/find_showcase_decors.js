const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'products.json'), 'utf8'));

console.log('\n--- DECOR / LIVING / ART ---');
const decors = products.filter(p => p.category === 'decor' || p.category === 'art' || p.category === 'living');
decors.slice(0, 15).forEach(p => {
  const imgExists = fs.existsSync(path.join(__dirname, '..', p.image));
  console.log(`[${p.id}] ${p.title} | ${p.price}d | img: ${p.image} (${imgExists ? 'EXISTS' : 'MISSING'})`);
});
