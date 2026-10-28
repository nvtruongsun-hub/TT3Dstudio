const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'products.json'), 'utf8'));

console.log('--- TOYS / FIDGETS / MÓC KHÓA ---');
const toys = products.filter(p => 
  p.category === 'toy' || p.category === 'fidget' || 
  p.title.toLowerCase().includes('móc khóa') || 
  p.title.toLowerCase().includes('clicker') || 
  p.title.toLowerCase().includes('khớp') ||
  p.title.toLowerCase().includes('mèo')
);
toys.forEach(p => {
  const imgExists = fs.existsSync(path.join(__dirname, '..', p.image));
  console.log(`[${p.id}] ${p.title} | ${p.price}d | img: ${p.image} (${imgExists ? 'EXISTS' : 'MISSING'})`);
});

console.log('\n--- DECOR / LIVING / QUÀ TẶNG ---');
const decors = products.filter(p => p.category === 'decor' || p.category === 'living');
decors.slice(0, 10).forEach(p => {
  const imgExists = fs.existsSync(path.join(__dirname, '..', p.image));
  console.log(`[${p.id}] ${p.title} | ${p.price}d | img: ${p.image} (${imgExists ? 'EXISTS' : 'MISSING'})`);
});
