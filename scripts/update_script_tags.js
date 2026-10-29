const fs = require('fs');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');
html = html.replace('js/catalog-store.js?v=4.0', 'js/catalog-store.js?v=4.2');
html = html.replace('js/products-manager.js?v=20261027-clarity', 'js/products-manager.js?v=4.2');
fs.writeFileSync(file, html, 'utf8');
console.log('Script tags version bumped to 4.2');
