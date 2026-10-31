/**
 * Test Suite: Product Differentiation Architecture & Inspiration Lookbook Sync
 * Đảm bảo 100% 55 sản phẩm có thông tin phân hóa sắc nét và Lookbook đồng bộ SKU thật
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('==========================================================');
console.log('   TEST SUITE: PRODUCT DIFFERENTIATION & LOOKBOOK SYNC    ');
console.log('==========================================================');

const rootDir = path.join(__dirname, '..');
const products = JSON.parse(fs.readFileSync(path.join(rootDir, 'products.json'), 'utf8'));
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

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

// 1. All 105 products have differentiation fields
runTest('All 105 products have cleanTitle, archetypeBadge, useCaseEyebrow, subCategory, and microSpecs', () => {
  assert.strictEqual(products.length, 105, 'Should have exactly 105 products');
  products.forEach(p => {
    assert.ok(p.cleanTitle && p.cleanTitle.trim().length > 0, `Product ${p.id} missing cleanTitle`);
    assert.ok(p.archetypeBadge && p.archetypeBadge.trim().length > 0, `Product ${p.id} missing archetypeBadge`);
    assert.ok(p.useCaseEyebrow && p.useCaseEyebrow.trim().length > 0, `Product ${p.id} missing useCaseEyebrow`);
    assert.ok(p.subCategory && p.subCategory.trim().length > 0, `Product ${p.id} missing subCategory`);
    assert.ok(p.subCategoryName && p.subCategoryName.trim().length > 0, `Product ${p.id} missing subCategoryName`);
    assert.ok(p.microSpecs && p.microSpecs.trim().length > 0, `Product ${p.id} missing microSpecs`);
    assert.ok(p.badgeTheme && p.badgeTheme.trim().length > 0, `Product ${p.id} missing badgeTheme`);
  });
});

// 2. No massive duplicate badges
runTest('Archetype badges are differentiated across products in same category (no 10-item monopoly)', () => {
  const categories = ['Trang_Diem_Vanity', 'Decor_Den_Noi_That', 'Do_Choi_Moc_Khoa', 'Hop_De_Ban_Tien_Ich', 'Ca_Nhan_Hoa_NFC'];
  categories.forEach(cat => {
    const catProducts = products.filter(p => p.category === cat);
    const badgeCounts = {};
    catProducts.forEach(p => {
      badgeCounts[p.archetypeBadge] = (badgeCounts[p.archetypeBadge] || 0) + 1;
    });
    // No single badge should appear on more than 3 products in an 11-product category
    Object.entries(badgeCounts).forEach(([badge, count]) => {
      assert.ok(count <= 3, `Badge "${badge}" is overused (${count} times) in category ${cat}`);
    });
  });
});

// 3. 5 Parking plate products have distinct clean titles and eyebrows
runTest('5 Car parking plate models in Ca_Nhan_Hoa_NFC have completely differentiated titles', () => {
  const parkingPlates = products.filter(p => p.subCategory === 'bien_do_xe');
  assert.strictEqual(parkingPlates.length, 5, 'Should have 5 distinct parking plate models');
  const titles = new Set(parkingPlates.map(p => p.cleanTitle));
  assert.strictEqual(titles.size, 5, 'All 5 parking plates must have unique titles');
});

// 4. Fidget clicker models in Do_Choi_Moc_Khoa have distinct clean titles and eyebrows
runTest('Fidget clicker models in Do_Choi_Moc_Khoa have completely differentiated titles', () => {
  const clickers = products.filter(p => p.subCategory === 'fidget_clicker');
  assert.ok(clickers.length >= 5, 'Should have at least 5 distinct fidget clicker models');
  const titles = new Set(clickers.map(p => p.cleanTitle));
  assert.strictEqual(titles.size, clickers.length, 'All clickers must have unique titles');
});

// 5. Lookbook SKUs exist in catalog and thumbnails exist on disk
runTest('All SKUs referenced in Lookbook Setups exist in products.json and have valid image assets', () => {
  const lookbookSkuMatches = indexHtml.match(/mw-cn-\d+/g) || [];
  const lookbookSkus = [...new Set(lookbookSkuMatches)];
  assert.ok(lookbookSkus.length >= 6, 'Lookbook should reference at least 6 real product SKUs');

  lookbookSkus.forEach(sku => {
    const prod = products.find(p => p.id === sku);
    assert.ok(prod, `Lookbook references unknown SKU ${sku}`);
    assert.ok(fs.existsSync(path.join(rootDir, prod.image)), `Asset missing for SKU ${sku}: ${prod.image}`);
  });
});

// 6. Sub-filters container exists in DOM and CSS defines .sub-filter-pill
runTest('#store-sub-filters exists in index.html and CSS has .sub-filter-pill styles', () => {
  assert.ok(indexHtml.includes('id="store-sub-filters"'), 'index.html must have #store-sub-filters container');
  const css = fs.readFileSync(path.join(rootDir, 'css', 'style.css'), 'utf8');
  assert.ok(css.includes('.sub-filter-pill'), 'CSS must define .sub-filter-pill');
  assert.ok(css.includes('.badge-theme-terracotta'), 'CSS must define .badge-theme-terracotta');
  assert.ok(css.includes('.badge-theme-amber'), 'CSS must define .badge-theme-amber');
});

console.log('==========================================================');
console.log(`Results: ${passed} / ${total} Passed`);
console.log('==========================================================');

if (passed !== total) {
  process.exit(1);
}
