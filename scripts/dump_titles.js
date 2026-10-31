const fs = require('fs');
const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
const list = products.map((p, i) => `${i+1}. [${p.id}] [${p.category}]\n   RAW: ${p.title}\n   CLEAN: ${p.cleanTitle || ''}`).join('\n');
fs.writeFileSync('reports/typography-r1/current_titles_dump.txt', list, 'utf8');
console.log('Dumped ' + products.length + ' titles.');
