const p = JSON.parse(require('fs').readFileSync('products.json', 'utf8'));
const clickers = p.filter(x => x.subCategory === 'fidget_clicker');
console.log(clickers.map(x => ({ id: x.id, title: x.cleanTitle, originalTitle: x.originalTitle, subCategory: x.subCategory })));
