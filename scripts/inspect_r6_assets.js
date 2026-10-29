const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const images = [
  { id: 'mw-cn-2331892', name: 'icecream-clicker', p1: 'assets/images/poster-r4/icecream-clicker.png', p2: 'assets/images/products/thumb_2331892.png' },
  { id: 'mw-cn-1433737', name: 'mini-cat', p1: 'assets/images/poster-r4/mini-cat.png', p2: 'assets/images/products/thumb_1433737.png' },
  { id: 'mw-cn-1646129', name: 'tray-hero', p1: 'assets/images/poster-r4/tray-hero.png', p2: 'assets/images/products/thumb_1646129.png' },
  { id: 'mw-cn-2084928', name: 'brush-pot', p1: 'assets/images/poster-r4/brush-pot.png', p2: 'assets/images/products/thumb_2084928.png' },
  { id: 'mw-cn-2235027', name: 'washi-lamp', p1: 'assets/images/poster-r4/washi-lamp.png', p2: 'assets/images/products/thumb_2235027.png' },
  { id: 'mw-cn-1438306', name: 'cloud-lamp', p1: 'assets/images/poster-r4/cloud-lamp.png', p2: 'assets/images/products/thumb_1438306.png' },
  { id: 'mw-cn-704003', name: 'robot-keychain', p1: 'assets/images/poster-r4/robot-keychain.png', p2: 'assets/images/products/thumb_704003.png' },
  { id: 'mw-cn-939925', name: 'spotify-nfc', p1: 'assets/images/poster-r4/spotify-nfc.png', p2: 'assets/images/products/thumb_939925.png' }
];

console.log('--- CHECKING 8 SKU IMAGES ---');
images.forEach(img => {
  const f1 = fs.existsSync(img.p1) ? PNG.sync.read(fs.readFileSync(img.p1)) : null;
  const f2 = fs.existsSync(img.p2) ? PNG.sync.read(fs.readFileSync(img.p2)) : null;
  console.log(`[${img.id}] ${img.name}:`);
  if (f1) console.log(`  p1 (${img.p1}): ${f1.width}x${f1.height}`);
  if (f2) console.log(`  p2 (${img.p2}): ${f2.width}x${f2.height}`);
});
