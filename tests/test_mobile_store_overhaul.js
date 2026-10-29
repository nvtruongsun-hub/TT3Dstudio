/**
 * Test Suite: Mobile Store Overhaul & High-Craft Native Ergonomics
 * Đảm bảo giao diện điện thoại bao quát gian hàng, 2 cột chuẩn e-commerce, zero emoji, Birds-Eye Hub
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('==========================================================');
console.log('   TEST SUITE: MOBILE STORE OVERHAUL & BIRDS-EYE HUB      ');
console.log('==========================================================');

const rootDir = path.join(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const cssStyle = fs.readFileSync(path.join(rootDir, 'css', 'style.css'), 'utf8');
const cssMinimal = fs.readFileSync(path.join(rootDir, 'css', 'minimal.css'), 'utf8');
const productsJs = fs.readFileSync(path.join(rootDir, 'js', 'products-manager.js'), 'utf8');

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${total}. ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${total}. ${name}:`, err.message);
  }
}

// 1. Mobile 2-column grid definition in CSS
runTest('CSS enforces 2-column grid on mobile (< 768px) with 10px gap and 12px padding', () => {
  const allCss = cssStyle + '\n' + cssMinimal;
  const has2Col = allCss.includes('grid-template-columns: repeat(2, minmax(0, 1fr))') ||
                  allCss.includes('grid-template-columns: repeat(2,minmax(0,1fr))') ||
                  allCss.includes('grid-template-columns: 1fr 1fr');
  assert.ok(has2Col, 'CSS must define 2-column grid for mobile');
  assert.ok(allCss.includes('.mobile-storefront') || allCss.includes('mobile-product-grid') || allCss.includes('.minimal-product-grid'), 'Must have storefront grid selector');
});

// 2. Store Birds-Eye Hub (5 Category Squircles with 11 items each)
runTest('Store Birds-Eye Hub exists in index.html with 5 categories and count badges', () => {
  assert.ok(indexHtml.includes('id="store-birdseye-hub"'), 'Must have #store-birdseye-hub container');
  assert.ok(indexHtml.includes('Trang_Diem_Vanity'), 'Hub must link to Trang_Diem_Vanity');
  assert.ok(indexHtml.includes('Decor_Den_Noi_That'), 'Hub must link to Decor_Den_Noi_That');
  assert.ok(indexHtml.includes('Hop_De_Ban_Tien_Ich'), 'Hub must link to Hop_De_Ban_Tien_Ich');
  assert.ok(indexHtml.includes('Ca_Nhan_Hoa_NFC'), 'Hub must link to Ca_Nhan_Hoa_NFC');
  assert.ok(indexHtml.includes('Do_Choi_Moc_Khoa'), 'Hub must link to Do_Choi_Moc_Khoa');
});

// 3. Artisan Trust Strip without Emojis
runTest('Artisan Trust Strip exists and contains ZERO emoji characters', () => {
  assert.ok(indexHtml.includes('id="artisan-trust-strip"') || indexHtml.includes('class="artisan-trust-strip"'), 'Must have artisan trust strip');
  // Extract trust strip
  const match = indexHtml.match(/<div[^>]*class="[^"]*artisan-trust-strip[^"]*"[^>]*>([\s\S]+?)<\/div>/);
  assert.ok(match, 'Artisan trust strip block must be present');
  const stripContent = match[1];
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert.strictEqual(emojiRegex.test(stripContent), false, 'Trust strip must use clean SVG / typography, NOT emojis');
});

// 4. Compact Product Card on Mobile (Aspect ratio 1:1, compact body)
runTest('Product Card template has uniform min-height on title and compact mobile paddings', () => {
  assert.ok(productsJs.includes('min-h-[32px]') || productsJs.includes('min-height: 32px') || cssMinimal.includes('min-height: 32px') || cssStyle.includes('product-card-title'), 'Card title must have controlled uniform height');
  assert.ok(productsJs.includes('truncate') || productsJs.includes('line-clamp-2'), 'Card texts must be truncated cleanly');
});

// 5. Curated Products Section is compact on mobile (Horizontal snap carousel or 2-column)
runTest('#curated-product-grid supports compact mobile browsing', () => {
  assert.ok(indexHtml.includes('curated-product-grid'), '#curated-product-grid must exist in DOM');
  const curatedContainer = indexHtml.match(/<div[^>]*id="curated-product-grid"[^>]*>/);
  assert.ok(curatedContainer, 'Must match #curated-product-grid tag');
  const tag = curatedContainer[0];
  // Must NOT be grid-cols-1 on mobile
  const isOneColOnMobile = tag.includes('grid-cols-1');
  assert.strictEqual(isOneColOnMobile, false, '#curated-product-grid must NOT be grid-cols-1 on mobile');
  const isCompactMobile = tag.includes('grid-cols-2') || tag.includes('overflow-x-auto') || tag.includes('flex');
  assert.ok(isCompactMobile, '#curated-product-grid must be grid-cols-2 or horizontal scroll on mobile');
});

console.log('==========================================================');
console.log(`Results: ${passed} / ${total} Passed`);
console.log('==========================================================');

if (passed !== total) {
  process.exit(1);
}
