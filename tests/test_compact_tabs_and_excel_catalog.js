/**
 * TEST SUITE: COMPACT TAB BAR & EXCEL CATALOG INTEGRATION
 * Verification for User Request: Streamlined shop tab bar & Full 55 Excel products update
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('==========================================================');
console.log('   TEST SUITE: COMPACT SHOP TABS & EXCEL CATALOG SYNC     ');
console.log('==========================================================\n');

let passCount = 0;
let failCount = 0;

function runCheck(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failCount++;
  }
}

// 1. Verify CSS rules for compact shop tabs
runCheck('Check 1: Catalog CSS enforces streamlined tab height (<= 34px) and no native scrollbar', () => {
  const css = fs.readFileSync('css/catalog.css', 'utf8');
  
  // Check if segmented-pill height is reduced to <= 34px
  const pillMatch = css.match(/#store-catalog\s+\.catalog-categories\s+\.segmented-pill\s*\{([^}]+)\}/);
  assert(pillMatch, 'Cannot find #store-catalog .catalog-categories .segmented-pill in css/catalog.css');
  const pillRules = pillMatch[1];
  
  const minHeightMatch = pillRules.match(/min-height:\s*(\d+)px/);
  assert(minHeightMatch, 'segmented-pill must specify min-height');
  const minHeight = parseInt(minHeightMatch[1], 10);
  assert(minHeight <= 34, `Expected segmented-pill min-height <= 34px, got ${minHeight}px`);
  
  // Check that scrollbar is hidden
  assert(
    css.includes('scrollbar-width: none') || css.includes('::-webkit-scrollbar { display: none; }') || css.includes('::-webkit-scrollbar{display:none}'),
    'Tab bar must hide native scrollbar completely'
  );
});

// 2. Verify Tab HTML or dynamic renderer contains counts for all 5 categories + all
runCheck('Check 2: Tab buttons include item count badges matching 55 products from Excel', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  // Should have (55) or count badge for All, and (11) for each category
  assert(
    html.includes('data-category="all"') && (html.includes('(55)') || html.includes('catalog-pill-count')),
    'Tab "all" must display item count (55) or dynamic count placeholder'
  );
  assert(
    html.includes('(11)') || html.includes('catalog-pill-count'),
    'Category tabs must display count (11) or dynamic count placeholders'
  );
});

// 3. Verify products.json contains all 55 products from the 5 Excel sheets
runCheck('Check 3: products.json contains 55 products across the 5 specific Excel categories', () => {
  const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
  assert.strictEqual(products.length, 55, `Expected 55 products, got ${products.length}`);
  
  const categories = {};
  products.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + 1;
  });
  
  const expectedCats = [
    'Trang_Diem_Vanity',
    'Decor_Den_Noi_That',
    'Hop_De_Ban_Tien_Ich',
    'Ca_Nhan_Hoa_NFC',
    'Do_Choi_Moc_Khoa'
  ];
  
  expectedCats.forEach(cat => {
    assert.strictEqual(categories[cat], 11, `Category ${cat} must have exactly 11 products, got ${categories[cat]}`);
  });
});

// 4. Verify Catalog Store revision bump for client cache migration
runCheck('Check 4: CatalogStore revision is bumped to trigger client refresh', () => {
  const storeJs = fs.readFileSync('js/catalog-store.js', 'utf8');
  assert(
    storeJs.includes("CURRENT_CATALOG_REVISION = 'mw-55-v5-compact-tabs'") ||
    storeJs.includes('CURRENT_CATALOG_REVISION = "mw-55-v5-compact-tabs"'),
    'Catalog revision must be bumped to mw-55-v5-compact-tabs'
  );
});

// 5. Verify Catalog Page Size preserves compact initial view (12) with full catalog reachable (55)
runCheck('Check 5: Initial catalog display limit is compact (12) and total catalog has 55 items', () => {
  const pmJs = fs.readFileSync('js/products-manager.js', 'utf8');
  const match = pmJs.match(/CATALOG_PAGE_SIZE\s*=\s*(\d+)/);
  assert(match, 'CATALOG_PAGE_SIZE must be defined in products-manager.js');
  const size = parseInt(match[1], 10);
  assert.strictEqual(size, 12, `Expected CATALOG_PAGE_SIZE = 12, got ${size}`);
  
  const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
  assert.strictEqual(products.length, 55, `Expected 55 total products in catalog, got ${products.length}`);
});

console.log('\n==========================================================');
console.log(`Results: ${passCount} Passed, ${failCount} Failed`);
console.log('==========================================================');

if (failCount > 0) {
  process.exit(1);
}
