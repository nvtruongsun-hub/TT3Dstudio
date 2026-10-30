const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '../../index.html');
let html = fs.readFileSync(file, 'utf8');
const start = html.indexOf('      <section id="store-catalog"');
const destination = html.indexOf('      <!-- SHOP THE LOOK:');
if (start < 0 || destination < 0) throw new Error('Catalog or destination missing');
if (start > destination) {
  const end = html.indexOf('      </section>', start) + '      </section>'.length;
  const section = html.slice(start, end);
  html = html.slice(0, start) + html.slice(end);
  html = html.replace('      <!-- SHOP THE LOOK:', section + '\n\n      <!-- SHOP THE LOOK:');
  fs.writeFileSync(file, html);
}
console.log('Catalog follows the selected products, before inspiration and live customizer.');
