// tests/test_catalog_105_contract.js
// Strict TDD contract test for 105-product catalog and 7-category taxonomy
// Approved by Codex Master Directive TT3D-MW105-R1

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 [TEST] Running test_catalog_105_contract.js...');

const ROOT_DIR = path.resolve(__dirname, '..');
const PRODUCTS_JSON_PATH = path.join(ROOT_DIR, 'products.json');
const REGISTRY_JSON_PATH = path.join(ROOT_DIR, 'data', 'category-registry.json');
const CATALOG_STORE_PATH = path.join(ROOT_DIR, 'js', 'catalog-store.js');
const BASELINE_55_PATH = path.join(ROOT_DIR, 'reports', 'mw105-r1', 'baseline_55_products.json');

// 1. Expected Taxonomy & Distribution
const EXPECTED_CATEGORY_COUNTS = Object.freeze({
  Trang_Diem_Vanity: 12,
  Decor_Den_Noi_That: 17,
  Hoa_Decor_Kim_Loai: 10,
  Hop_De_Ban_Tien_Ich: 14,
  Ca_Nhan_Hoa_NFC: 11,
  Do_Choi_Moc_Khoa: 24,
  Moc_Khoa_Clicker_Viral: 17
});
const EXPECTED_TOTAL_PRODUCTS = 105;
const EXPECTED_REVISION = 'mw-105-v1-full';

// 2. Read products.json
assert(fs.existsSync(PRODUCTS_JSON_PATH), `products.json must exist at ${PRODUCTS_JSON_PATH}`);
const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8'));

console.log(`Checking products.json count: current = ${products.length}, expected = ${EXPECTED_TOTAL_PRODUCTS}`);
assert.strictEqual(products.length, EXPECTED_TOTAL_PRODUCTS, `products.json must contain exactly ${EXPECTED_TOTAL_PRODUCTS} items (got ${products.length})`);

// 3. Unique IDs check
const idSet = new Set(products.map(p => p.id));
assert.strictEqual(idSet.size, EXPECTED_TOTAL_PRODUCTS, `All ${EXPECTED_TOTAL_PRODUCTS} product IDs must be unique (got ${idSet.size})`);

// 4. Old IDs preservation check (oldIds ⊆ incomingIds, exactly 50 new IDs)
assert(fs.existsSync(BASELINE_55_PATH), `baseline_55_products.json must exist at ${BASELINE_55_PATH}`);
const baseline55 = JSON.parse(fs.readFileSync(BASELINE_55_PATH, 'utf-8'));
const oldIds = new Set(baseline55.map(p => p.id));
assert.strictEqual(oldIds.size, 55, 'Baseline fixture must contain exactly 55 unique IDs');

const missingOldIds = [...oldIds].filter(id => !idSet.has(id));
assert.strictEqual(missingOldIds.length, 0, `All 55 old IDs must be preserved. Missing: ${missingOldIds.join(', ')}`);

const newIds = [...idSet].filter(id => !oldIds.has(id));
assert.strictEqual(newIds.length, 50, `Exactly 50 new IDs must be added (got ${newIds.length})`);

// 5. Category distribution check
const actualCategoryCounts = {};
for (const [catKey] of Object.entries(EXPECTED_CATEGORY_COUNTS)) {
  actualCategoryCounts[catKey] = 0;
}
for (const p of products) {
  assert(p.category in EXPECTED_CATEGORY_COUNTS, `Product ${p.id} has unknown category: ${p.category}`);
  actualCategoryCounts[p.category]++;
}

for (const [catKey, expectedCount] of Object.entries(EXPECTED_CATEGORY_COUNTS)) {
  assert.strictEqual(
    actualCategoryCounts[catKey],
    expectedCount,
    `Category ${catKey} count mismatch: expected ${expectedCount}, got ${actualCategoryCounts[catKey]}`
  );
}

// 6. Thumbnails existence check on disk
for (const p of products) {
  assert(p.image, `Product ${p.id} must have an image property`);
  const imageDiskPath = path.join(ROOT_DIR, p.image.replace(/^\//, ''));
  assert(fs.existsSync(imageDiskPath), `Image file for ${p.id} must exist at ${imageDiskPath}`);
  const stat = fs.statSync(imageDiskPath);
  assert(stat.size > 500, `Image file for ${p.id} must be non-empty and valid size (>500B), got ${stat.size} bytes`);
}

// 7. Check category-registry.json
assert(fs.existsSync(REGISTRY_JSON_PATH), `category-registry.json must exist at ${REGISTRY_JSON_PATH}`);
const registryData = JSON.parse(fs.readFileSync(REGISTRY_JSON_PATH, 'utf-8'));
const registryCategories = Array.isArray(registryData) ? registryData : Object.values(registryData);
assert(Array.isArray(registryCategories), 'Registry categories must be an array');
assert.strictEqual(registryCategories.length, 7, `Registry must define exactly 7 categories (got ${registryCategories.length})`);

for (const catKey of Object.keys(EXPECTED_CATEGORY_COUNTS)) {
  const catDef = registryCategories.find(c => c.id === catKey);
  assert(catDef, `Registry must include category definition for ${catKey}`);
  assert(catDef.name, `Category ${catKey} must have name`);
  assert(catDef.shortName, `Category ${catKey} must have shortName`);
  assert(catDef.heroId, `Category ${catKey} must specify heroId`);
  // Verify hero exists in products and belongs to that category
  const heroProduct = products.find(p => p.id === catDef.heroId);
  assert(heroProduct, `Hero ${catDef.heroId} for category ${catKey} must exist in products.json`);
  assert.strictEqual(heroProduct.category, catKey, `Hero ${catDef.heroId} category must match ${catKey}`);
}

// 8. Check catalog-store.js revision
const storeContent = fs.readFileSync(CATALOG_STORE_PATH, 'utf-8');
assert(
  storeContent.includes(`CURRENT_CATALOG_REVISION = '${EXPECTED_REVISION}'`),
  `catalog-store.js must define CURRENT_CATALOG_REVISION = '${EXPECTED_REVISION}'`
);

console.log('✅ ALL 8 CONTRACT CHECKS PASSED!');
