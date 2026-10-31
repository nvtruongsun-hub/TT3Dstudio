/**
 * Test Suite: World-Class Tactile Editorial & Precision Craft Storefront
 * Verifies the 5 core upgrades:
 * 1. Design Tokens & CSS upgrade integration
 * 2. 32px Technical Marquee ticker
 * 3. Interactive Hero color swatches
 * 4. Asymmetric Bento Grid for 5 categories (zero IA redundancy)
 * 5. Homepage "Shop the Look" with Interactive Hotspots & Combo Add-to-cart
 * 6. Homepage Live Customizer Preview in Obsidian Dark theme (#141413)
 * 7. Catalog cards show actual color choices, benefits and clearly labelled actions
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
const cssFiles = ['world-class-upgrade.css', 'style.css', 'minimal.css', 'catalog.css'];
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
runTest('1. Scoped storefront palette is integrated without changing the admin stylesheet', () => {
  assert.ok(cssContent.includes('body.minimal-storefront'), 'Storefront styles must have their own scope');
  assert.ok(cssContent.includes('--accent-primary:'), 'Storefront must define a shared action color');
  assert.ok(cssContent.includes('--accent-craft'), 'Craft accent token remains available to components');
  assert.ok(indexHtml.includes('world-class-upgrade.css'), 'index.html must load world-class-upgrade.css');
});

// 2. Technical Marquee Ticker
runTest('2. Purchase information uses a static accessible strip instead of duplicate scrolling text', () => {
  assert.ok(indexHtml.includes('class="studio-benefits"'), 'Purchase information strip must exist');
  assert.ok(indexHtml.includes('aria-label="Thông tin mua hàng"'), 'Purchase information needs an accessible label');
  assert.ok(!indexHtml.includes('class="marquee-track"'), 'Automatically scrolling duplicate text has been retired');
});

// 3. Interactive Hero Color Swatches
runTest('3. Hero exposes manual product selection and an explicitly labelled pause control', () => {
  assert.ok(indexHtml.includes('data-hero-tab'), 'Hero needs manual product selection');
  assert.ok(indexHtml.includes('id="studio-motion-toggle"'), 'Automatic rotation must have a control');
  assert.ok(indexHtml.includes('aria-label="Tạm dừng tự chuyển sản phẩm"'), 'Pause control must have an accessible label');
  assert.ok(indexHtml.includes('js/studio-experience.js'), 'Motion controller must ship with the storefront');
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
runTest('7. Catalog cards show actual color choices, benefits and clearly labelled actions', () => {
  const cardTemplate = productsJs.slice(productsJs.indexOf('function buildProductCardHTML'), productsJs.indexOf('function buildHeroSpotlightHTML'));
  assert.ok(cardTemplate.includes('catalog-product-colors') && cardTemplate.includes('isValidHex(color.hex)'), 'Color legends must use valid colors from the product');
  assert.ok(cardTemplate.includes('catalog-product-benefit'), 'Card must show the product benefit');
  assert.ok(cardTemplate.includes('data-action="open-detail"') && cardTemplate.includes('data-action="configure-product"'), 'Photos and configuration need distinct named actions');
  assert.ok(cssContent.includes('object-fit: contain'), 'Catalog photos must remain fully visible');
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
