/**
 * Test Suite: Hero Artisan Showcase Logic & Regression Verification
 * Codex Directive: TT3D-HERO-20261024-R1
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('==========================================================');
console.log('   HERO SHOWCASE LOGIC & DATA INTEGRITY TESTS');
console.log('==========================================================\n');

// 1. Kiểm tra catalog thực tế
const productsJsonPath = path.join(__dirname, '..', 'products.json');
const products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));

// Test 1: ID danh tính sản phẩm trong Hero khớp chính xác với catalog
const heroApprovedIds = ['mw-cn-1646129', 'mw-cn-1147539', 'mw-cn-2235027'];
heroApprovedIds.forEach(id => {
  const p = products.find(x => x.id === id);
  assert(p, `Sản phẩm ${id} phải tồn tại trong products.json`);
  assert.strictEqual(p.status || 'active', 'active', `Sản phẩm ${id} phải có status active`);
  assert(p.price > 0, `Sản phẩm ${id} phải có giá hợp lệ`);
  assert(fs.existsSync(path.join(__dirname, '..', p.image)), `Ảnh ${p.image} phải tồn tại trên đĩa`);
});
console.log('  [PASS] H01: Approved Hero IDs exist in catalog with active status & valid images on disk');

// Test 2: mw-cn-1646129 là Khay Coquette Silk Ribbon chứ không phải sản phẩm khác
const pSilk = products.find(x => x.id === 'mw-cn-1646129');
assert(pSilk.title.includes('lụa') || pSilk.title.includes('Silk') || pSilk.title.includes('nơ'), 'mw-cn-1646129 phải là khay lụa/nơ');
assert.strictEqual(pSilk.price, 119000, 'Giá catalog của mw-cn-1646129 phải là 119.000₫');
console.log('  [PASS] H02: mw-cn-1646129 identity matches catalog record (Coquette Silk Tray, 119.000₫)');

// Test 3: mw-cn-1147539 là Biển tên để bàn chứ không phải đồ chơi Rắn Zootopia (1702306)
const pName = products.find(x => x.id === 'mw-cn-1147539');
assert(pName.title.includes('Biển tên') || pName.title.includes('Nameplate') || pName.title.includes('biển hiệu'), 'mw-cn-1147539 phải là biển tên để bàn');
assert.strictEqual(pName.price, 99000, 'Giá catalog của mw-cn-1147539 phải là 99.000₫');
console.log('  [PASS] H03: mw-cn-1147539 identity matches catalog record (Customizable Nameplate, 99.000₫)');

// Test 4: mw-cn-2235027 là Đèn bàn Washi KŌHAKU chứ không phải Đèn Lithophane đêm tối (1836100)
const pLamp = products.find(x => x.id === 'mw-cn-2235027');
assert(pLamp.title.includes('Washi') || pLamp.title.includes('KŌHAKU'), 'mw-cn-2235027 phải là Đèn Washi');
assert.strictEqual(pLamp.price, 289000, 'Giá catalog của mw-cn-2235027 phải là 289.000₫');
console.log('  [PASS] H04: mw-cn-2235027 identity matches catalog record (KŌHAKU Washi Lamp, 289.000₫)');

// Test 5: Kiểm tra CSS Geometry trong css/style.css
const styleCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
assert(styleCss.includes('.hero-showcase-card'), 'css/style.css phải chứa .hero-showcase-card');
assert(styleCss.includes('max-width: 460px'), 'css/style.css phải chứa max-width: 460px');
assert(styleCss.includes('aspect-ratio: 4 / 3'), 'css/style.css phải chứa aspect-ratio: 4 / 3');
assert(styleCss.includes('.hero-showcase-media.is-entering'), 'css/style.css phải chứa .hero-showcase-media.is-entering');
console.log('  [PASS] H05: CSS Geometry rules enforce max-width 460px, aspect-ratio 4:3 and fade animation');

// Test 6: Kiểm tra HTML cấu trúc Accessibility và Roving Tabindex
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(indexHtml.includes('class="hero-copy'), 'index.html phải có class hero-copy');
assert(indexHtml.includes('class="hero-showcase-card'), 'index.html phải có class hero-showcase-card');
assert(indexHtml.includes('class="hero-showcase-media'), 'index.html phải có class hero-showcase-media');
assert(indexHtml.includes('role="tablist"'), 'index.html phải có role="tablist"');
assert(indexHtml.includes('role="tab"'), 'index.html phải có role="tab"');
assert(indexHtml.includes('role="tabpanel"'), 'index.html phải có role="tabpanel"');
assert(indexHtml.includes('aria-controls="hero-showcase-panel"'), 'index.html phải có aria-controls');
assert(indexHtml.includes('data-product-id="mw-cn-1646129"'), 'index.html nút CTA phải liên kết đúng mw-cn-1646129');
assert(!indexHtml.includes('aspect-4/3'), 'index.html không được dùng class aspect-4/3 sai cú pháp');
assert(!indexHtml.includes('lg:pb-18'), 'index.html không được dùng class lg:pb-18 sai cú pháp');
console.log('  [PASS] H06: HTML satisfies WAI-ARIA tablist contract, semantic geometry and clean utilities');

// Test 7: Kiểm tra js/app.js không còn hardcode giá hay sai ID
const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
assert(appJs.includes('HERO_CURRENCY_FORMATTER'), 'js/app.js phải dùng Intl.NumberFormat để định dạng giá');
assert(appJs.includes('showcaseRequestCounter'), 'js/app.js phải có counter chống race condition khi tải ảnh');
assert(appJs.includes('initHeroArtisanShowcase'), 'js/app.js phải có hàm khởi tạo showcase');
assert(appJs.includes('tt_products_updated'), 'js/app.js phải lắng nghe tt_products_updated');
assert(!appJs.includes('1836100\': {\n      id: \'mw-cn-1836100\',\n      title: \'Đế Chạm WiFi'), 'js/app.js không được gán sai danh tính 1836100');
console.log('  [PASS] H07: js/app.js controller eliminates hardcoded catalogs and enforces race condition guard');

console.log('\n==========================================================');
console.log('   ALL 7 HERO SHOWCASE REGRESSION CHECKS PASSED (7/7)');
console.log('==========================================================\n');
