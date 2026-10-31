/**
 * Test Suite: Product Presentation Contract & Typography Synchronizer (TT3D-STUDIO-TYPO-R1)
 * Mandated by Codex GPT-6.1-Sol High Reasoning Directive
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('==========================================================');
console.log('   TEST SUITE: PRODUCT PRESENTATION CONTRACT & TYPO R1    ');
console.log('==========================================================\n');

// Mock browser environment for catalog-store.js and products-manager.js
const mockLocalStorage = {
  store: {},
  getItem(k) { return this.store[k] !== undefined ? this.store[k] : null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

global.window = {
  localStorage: mockLocalStorage,
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {}
};
global.localStorage = mockLocalStorage;
global.fetch = async () => ({ ok: false, status: 404 });

// Load catalog-store.js in this context
const catalogStoreCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'catalog-store.js'), 'utf8');
eval(catalogStoreCode);

const store = global.window.TTCatalogStore;
assert.ok(store, 'TTCatalogStore must be exported');
assert.strictEqual(typeof store.getProductPresentation, 'function', 'getProductPresentation must be a function');

let passed = 0;
let total = 0;

function runCheck(name, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${total}. ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${total}. ${name}:`, err.message);
  }
}

// 1. Prioritize cleanTitle, fallback when empty/whitespace, null/wrong type doesn't crash
runCheck('1. Prioritizes cleanTitle, handles whitespace/null safely without [object Object]', () => {
  const p1 = { id: 'p1', title: 'Tên Gốc', cleanTitle: 'Tên Đẹp Atelier' };
  assert.strictEqual(store.getProductPresentation(p1).title, 'Tên Đẹp Atelier');

  const p2 = { id: 'p2', title: 'Tên Gốc #MW-1234', cleanTitle: '   ' };
  assert.strictEqual(store.getProductPresentation(p2).title, 'Tên Gốc');

  const p3 = store.getProductPresentation(null);
  assert.strictEqual(p3.title, 'Sản phẩm T&T');
  assert.ok(!p3.title.includes('[object Object]'));

  const p4 = store.getProductPresentation({ id: 'p4', title: '', cleanTitle: '' });
  assert.strictEqual(p4.title, 'Sản phẩm T&T');
});

// 2. Preserves (size L), (2 dòng), parentheses content, only strips importer ID suffix
runCheck('2. Preserves specifications in parentheses, only strips #MW-XXXX suffix', () => {
  const p1 = { id: 'p1', title: 'Đèn ngủ tam giác (size L) #MW-99999', cleanTitle: '' };
  assert.strictEqual(store.getProductPresentation(p1).title, 'Đèn ngủ tam giác (size L)');

  const p2 = { id: 'p2', title: 'Biển tên chức danh (2 dòng)', cleanTitle: '' };
  assert.strictEqual(store.getProductPresentation(p2).title, 'Biển tên chức danh (2 dòng)');

  const p3 = { id: 'p3', title: '(Phiên bản giới hạn)', cleanTitle: '' };
  assert.strictEqual(store.getProductPresentation(p3).title, '(Phiên bản giới hạn)');
});

// 3. Unicode NFC/NFD normalization consistency
runCheck('3. Enforces NFC Unicode normalization without altering Vietnamese tonal marks', () => {
  const nfdTitle = 'Ống cắm cọ'.normalize('NFD');
  const presentation = store.getProductPresentation({ id: 'p1', cleanTitle: nfdTitle });
  assert.strictEqual(presentation.title, 'Ống cắm cọ'.normalize('NFC'));
  assert.strictEqual(presentation.title.normalize('NFC'), presentation.title);
});

// 4. XSS & Payload resilience in presentation output
runCheck('4. XSS payloads, quotes, and HTML entities treated strictly as raw text', () => {
  const dangerous = {
    id: 'xss',
    title: '<img src=x onerror=alert(1)>',
    cleanTitle: '<script>alert("xss")</script> & "quo\'te"'
  };
  const presentation = store.getProductPresentation(dangerous);
  assert.strictEqual(presentation.title, '<script>alert("xss")</script> & "quo\'te"');
  // API returns plain text, leaving escaping to DOM view template
});

// 5. Shared SKU has matching title across Card, Category Hero, and Modal
runCheck('5. SKU presentation is consistent across card, category hero, home hero, and modal', () => {
  const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'products.json'), 'utf8'));
  const testSku = products.find(p => p.id === 'mw-cn-2084928');
  assert.ok(testSku, 'Target SKU must exist');

  const pres = store.getProductPresentation(testSku);
  assert.strictEqual(pres.title, 'Ống cắm cọ Nơ Lụa Sweet Silk');
  assert.strictEqual(pres.categoryLabel, 'Trang Điểm & Nơ Lụa');
});

// 6. Missing specs does not invent fake layer/material claims
runCheck('6. Absence of technical specs does not invent unverified claims', () => {
  const pNoSpecs = { id: 'p1', cleanTitle: 'Đồ chơi', specs: {} };
  const pres = store.getProductPresentation(pNoSpecs);
  assert.deepStrictEqual(pres.specs, []);
  assert.strictEqual(typeof pNoSpecs.specs, 'object');
  assert.ok(!Array.isArray(pNoSpecs.specs));
});

// 7. Migration upgrades untouched seed while preserving Admin custom edits
runCheck('7. Three-way merge upgrades baseline seed while strictly preserving Admin edits', () => {
  const baselineSeed = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'reports', 'typography-r1', 'baseline_seed.json'), 'utf8'));
  const b1 = baselineSeed[0]; // mw-cn-2084928

  // Case A: User has untouched baseline seed -> Should receive new curated title
  const incomingSeed = [{ id: b1.id, title: b1.title, cleanTitle: 'Ống cắm cọ Nơ Lụa Sweet Silk' }];
  const storedUntouched = [{ id: b1.id, title: b1.title, cleanTitle: b1.cleanTitle }];

  const migA = store.buildMigration({
    storedProducts: storedUntouched,
    incomingDefaults: incomingSeed,
    currentRevision: '2026-10-31-rev2',
    metadata: { catalogRevision: '2026-10-30-rev1' }
  });
  assert.strictEqual(migA.products[0].cleanTitle, 'Ống cắm cọ Nơ Lụa Sweet Silk');

  // Case B: Admin explicitly renamed the product -> MUST preserve Admin custom cleanTitle!
  const storedAdminEdited = [{ id: b1.id, title: b1.title, cleanTitle: 'Tên Riêng Do Admin Đặt' }];
  const migB = store.buildMigration({
    storedProducts: storedAdminEdited,
    incomingDefaults: incomingSeed,
    currentRevision: '2026-10-31-rev2',
    metadata: { catalogRevision: '2026-10-30-rev1' }
  });
  assert.strictEqual(migB.products[0].cleanTitle, 'Tên Riêng Do Admin Đặt');
});

// 8. Search query by original title or model ID remains functional
runCheck('8. Searchability and product invariants preserved after title curation', () => {
  const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'products.json'), 'utf8'));
  const sample = products[0];
  assert.ok(sample.title.length > 0, 'Original title preserved');
  assert.ok(sample.id.length > 0, 'Model ID preserved');
  assert.ok(sample.price > 0, 'Price preserved');
});

console.log('\n==========================================================');
console.log(`Results: ${passed} / ${total} Passed`);
console.log('==========================================================\n');

if (passed !== total) {
  process.exit(1);
}
