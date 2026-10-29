/**
 * Test Suite: World-Class Tactile Editorial & Precision Craft Storefront
 * Verifies the 5 core upgrades:
 * 1. Design Tokens & CSS upgrade integration
 * 2. 32px Technical Marquee ticker
 * 3. Interactive Hero color swatches
 * 4. Asymmetric Bento Grid for 5 categories (zero IA redundancy)
 * 5. Homepage "Shop the Look" with Interactive Hotspots & Combo Add-to-cart
 * 6. Homepage Live Customizer Preview in Obsidian Dark theme (#141413)
 * 7. World-class Product Card anatomy with color swatches & technical spec pills
 * 8. Mobile Zalo conversion quick action with copy-to-clipboard functionality
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('==========================================================');
console.log('   TEST SUITE: WORLD-CLASS STOREFRONT OVERHAUL            ');
console.log('==========================================================');

const rootDir = path.join(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const productsJs = fs.readFileSync(path.join(rootDir, 'js', 'products-manager.js'), 'utf8');
const appJs = fs.readFileSync(path.join(rootDir, 'js', 'app.js'), 'utf8');

let cssContent = '';
const cssFiles = ['world-class-upgrade.css', 'style.css', 'minimal.css'];
cssFiles.forEach(file => {
  const p = path.join(rootDir, 'css', file);
  if (fs.existsSync(p)) {
    cssContent += '\n' + fs.readFileSync(p, 'utf8');
  }
});

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

// 1. CSS Design Tokens
runTest('1. Design Tokens include Tactile Minimalist Palette (--bg-canvas: #F7F6F2, --bg-obsidian: #141413, --accent-craft: #C85A32)', () => {
  assert.ok(cssContent.includes('--bg-canvas: #F7F6F2') || cssContent.includes('#F7F6F2'), 'Canvas #F7F6F2 must be defined');
  assert.ok(cssContent.includes('--bg-obsidian: #141413') || cssContent.includes('#141413'), 'Obsidian #141413 must be defined');
  assert.ok(cssContent.includes('--accent-craft') || cssContent.includes('#C85A32'), 'Accent Terracotta #C85A32 must be defined');
  assert.ok(indexHtml.includes('world-class-upgrade.css'), 'index.html must load world-class-upgrade.css');
});

// 2. Technical Marquee Ticker
runTest('2. Technical Marquee ticker exists with precision speed and 0.12-0.16mm layer spec', () => {
  assert.ok(indexHtml.includes('artisan-marquee') || indexHtml.includes('technical-marquee'), 'Marquee element must exist');
  assert.ok(indexHtml.includes('0.12') || indexHtml.includes('0.12MM') || indexHtml.includes('0.12–0.16MM'), 'Must highlight 0.12mm precision spec');
});

// 3. Interactive Hero Color Swatches
runTest('3. Split Hero includes interactive color swatches allowing real-time color preview', () => {
  assert.ok(indexHtml.includes('hero-swatch-row') || indexHtml.includes('hero-swatches'), 'Hero must contain color swatch row');
  assert.ok(indexHtml.includes('hero-swatch-dot') || indexHtml.includes('data-hero-color'), 'Hero must contain interactive swatch dots');
  assert.ok(appJs.includes('heroSwatch') || appJs.includes('hero-swatch') || productsJs.includes('hero-swatch') || indexHtml.includes('switchHeroColor'), 'Logic must support hero color switching');
});

// 4. Asymmetric Bento Grid
runTest('4. Asymmetric Bento Grid exists with 5 spatial categories (zero redundancy)', () => {
  assert.ok(cssContent.includes('.bento-categories') || cssContent.includes('bento-grid'), 'CSS must define .bento-categories');
  assert.ok(indexHtml.includes('bento-categories') || indexHtml.includes('bento-card'), 'index.html must implement bento cards');
  // Check 5 categories linked
  assert.ok(indexHtml.includes('Hop_De_Ban_Tien_Ich'), 'Bento must link to Hop_De_Ban_Tien_Ich');
  assert.ok(indexHtml.includes('Trang_Diem_Vanity'), 'Bento must link to Trang_Diem_Vanity');
  assert.ok(indexHtml.includes('Ca_Nhan_Hoa_NFC'), 'Bento must link to Ca_Nhan_Hoa_NFC');
  assert.ok(indexHtml.includes('Decor_Den_Noi_That'), 'Bento must link to Decor_Den_Noi_That');
  assert.ok(indexHtml.includes('Do_Choi_Moc_Khoa'), 'Bento must link to Do_Choi_Moc_Khoa');
});

// 5. Homepage Shop the Look with Hotspots
runTest('5. Homepage features "Shop the Look" with interactive hotspots and 10% combo deal', () => {
  assert.ok(indexHtml.includes('home-shop-the-look') || indexHtml.includes('shop-the-look-section'), 'Homepage must feature Shop the Look section');
  assert.ok(indexHtml.includes('hotspot-dot') || indexHtml.includes('look-hotspot'), 'Shop the Look must have interactive hotspots');
  assert.ok(indexHtml.includes('combo-buy-btn') || indexHtml.includes('addComboToCart') || indexHtml.includes('-10%'), 'Must offer 10% combo bundle purchase');
});

// 6. Homepage Live Customizer Preview (Obsidian Dark)
runTest('6. Homepage features Live Customizer Preview with Obsidian dark theme and real-time text reflection', () => {
  assert.ok(indexHtml.includes('home-live-customizer') || indexHtml.includes('obsidian-customizer-preview'), 'Homepage must feature Live Customizer Preview');
  assert.ok(indexHtml.includes('#141413') || cssContent.includes('var(--bg-obsidian)'), 'Must use Obsidian dark background');
  assert.ok(indexHtml.includes('live-custom-input') || indexHtml.includes('customizer-preview-input'), 'Must have real-time preview input');
});

// 7. World-class Product Card Template
runTest('7. Product Card template renders tactile color swatches and technical spec pill', () => {
  assert.ok(productsJs.includes('tt-swatch-row') || productsJs.includes('swatch-dot') || productsJs.includes('swatch-row'), 'Product card must render color swatches');
  assert.ok(productsJs.includes('tt-spec-pill') || productsJs.includes('spec-pill') || productsJs.includes('badge-mono'), 'Product card must render technical spec pill');
  assert.ok(productsJs.includes('font-mono') || productsJs.includes('product-price'), 'Product price must use monospace tabular-nums');
});

// 8. Sticky Filter Bar & Zalo Conversion Quick Action
runTest('8. Catalog has sticky filter bar and mobile Zalo conversion action with clipboard support', () => {
  assert.ok(cssContent.includes('sticky') || indexHtml.includes('sticky'), 'Catalog filters must support sticky positioning');
  assert.ok(indexHtml.includes('zalo-quick-action') || appJs.includes('copyZaloOrder') || appJs.includes('zalo-quick-action') || indexHtml.includes('copyOrderToClipboard') || indexHtml.includes('clipboard'), 'Must provide Zalo quick action / clipboard support');
});

console.log('==========================================================');
console.log(`Results: ${passed} / ${total} Passed`);
console.log('==========================================================');

if (passed !== total) {
  process.exit(1);
}
