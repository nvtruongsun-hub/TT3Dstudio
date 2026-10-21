/**
 * T&T 3D Labs - Behavioral Regression & Contract Tests
 * Tuân thủ bản chỉ thị phê duyệt GPT-6.1-Sol (Codex Master Controller)
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('==========================================================');
console.log('   T&T 3D LABS - BEHAVIORAL REGRESSION TEST SUITE');
console.log('==========================================================\n');

let passCount = 0;
let failCount = 0;

async function it(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    failCount++;
  }
}

// Read products.json baseline
const defaultCatalog = JSON.parse(fs.readFileSync(path.join(__dirname, '../products.json'), 'utf-8'));

function createMockStorage() {
  const store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    _store: store
  };
}

function createMockBrowser(storage) {
  const mockStorage = storage || createMockStorage();
  const listeners = {};
  const docListeners = {};

  const doc = {
    addEventListener: (ev, fn) => { docListeners[ev] = docListeners[ev] || []; docListeners[ev].push(fn); },
    removeEventListener: () => {},
    dispatchEvent: () => {},
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      className: '',
      textContent: '',
      innerHTML: '',
      appendChild: () => {},
      classList: { add: () => {}, remove: () => {} },
      addEventListener: () => {}
    }),
    getElementById: (id) => ({
      id,
      value: '',
      textContent: '',
      innerHTML: '',
      appendChild: () => {},
      classList: { add: () => {}, remove: () => {} },
      addEventListener: () => {}
    }),
    querySelectorAll: () => []
  };

  const win = {
    localStorage: mockStorage,
    addEventListener: (ev, fn) => { listeners[ev] = listeners[ev] || []; listeners[ev].push(fn); },
    removeEventListener: () => {},
    dispatchEvent: () => {},
    CustomEvent: class CustomEvent { constructor(type, detail) { this.type = type; this.detail = detail; } },
    URLSearchParams: URLSearchParams,
    document: doc,
    fetch: async () => ({ ok: true, json: async () => defaultCatalog }),
    console: { log: () => {}, warn: () => {}, error: () => {} },
    TT_CONFIG: { hotline: '0968988647' },
    open: () => {},
    navigator: { clipboard: { writeText: async () => {} } }
  };
  win.window = win;
  return win;
}

const catalogStoreCode = fs.readFileSync(path.join(__dirname, '../js/catalog-store.js'), 'utf-8');
const checkoutCode = fs.readFileSync(path.join(__dirname, '../js/checkout.js'), 'utf-8');

async function runTests() {
  // -------------------------------------------------------------
  // CASE 1: Old Cache Enrichment & Seed Ingestion
  // -------------------------------------------------------------
  await it('Case 1: Old cache prod-1 with custom image & weight 101g restores missing specs/colors/materials', async () => {
    const storage = createMockStorage();
    const oldProd1 = {
      id: 'prod-1',
      title: 'Đế Chạm WiFi Thông Minh (Cũ)',
      price: 109000,
      image: 'data:image/webp;base64,custom_uploaded_image_data',
      specs: { weight: '101g' }
    };
    storage.setItem('tt_products', JSON.stringify([oldProd1]));

    const win = createMockBrowser(storage);
    vm.createContext(win);
    vm.runInContext(catalogStoreCode, win);

    await win.TTCatalogStore.initCatalog();
    const prods = win.TTCatalogStore.getProductsSync(false);
    assert.strictEqual(prods.length, 56, 'Should keep 1 legacy product + 55 new seeds (total 56)');
    const p1 = win.TTCatalogStore.getProductByIdSync('prod-1');
    assert.ok(p1, 'prod-1 must exist in store');
    assert.strictEqual(p1.id, 'prod-1');
    assert.strictEqual(p1.image, 'data:image/webp;base64,custom_uploaded_image_data', 'Must preserve custom image');
    assert.strictEqual(p1.specs.weight, '101g', 'Must preserve custom 101g weight');
    assert.ok(p1.specs.dimensions, 'Must restore missing dimensions from base product');
    assert.ok(Array.isArray(p1.colors) && p1.colors.length > 0, 'Must restore colors from base product');
    assert.ok(Array.isArray(p1.materials) && p1.materials.length > 0, 'Must restore materials from base product');
  });

  // -------------------------------------------------------------
  // CASE 2: Admin Partial Update
  // -------------------------------------------------------------
  await it('Case 2: Admin partial update (only title) preserves existing colors, materials, and specs', async () => {
    const storage = createMockStorage();
    storage.setItem('tt_products', JSON.stringify(defaultCatalog));

    const win = createMockBrowser(storage);
    vm.createContext(win);
    vm.runInContext(catalogStoreCode, win);

    await win.TTCatalogStore.initCatalog();
    const targetProd = defaultCatalog[0];
    await win.TTCatalogStore.upsertProduct({
      id: targetProd.id,
      title: 'Khay đĩa lụa mềm Studio Edition 2026'
    });

    const updated = win.TTCatalogStore.getProductByIdSync(targetProd.id);
    assert.strictEqual(updated.title, 'Khay đĩa lụa mềm Studio Edition 2026');
    assert.ok(Array.isArray(updated.colors) && updated.colors.length >= 3, 'Must retain colors');
    assert.ok(Array.isArray(updated.materials) && updated.materials.length >= 2, 'Must retain materials');
    assert.ok(updated.specs && (updated.specs.weight || updated.specs.layer || updated.specs.dimensions), 'Must retain specs');
  });

  // -------------------------------------------------------------
  // CASE 3: Empty Catalog []
  // -------------------------------------------------------------
  await it('Case 3: Empty catalog [] does not auto-recreate deleted products', async () => {
    const storage = createMockStorage();
    storage.setItem('tt_products', JSON.stringify([]));

    const win = createMockBrowser(storage);
    vm.createContext(win);
    vm.runInContext(catalogStoreCode, win);

    await win.TTCatalogStore.initCatalog();
    const list = win.TTCatalogStore.getProductsSync(false);
    assert.strictEqual(list.length, 0, 'Catalog must remain empty []');
  });

  // -------------------------------------------------------------
  // CASE 4: Corrupt JSON / Fetch failure
  // -------------------------------------------------------------
  await it('Case 4: Corrupt JSON in storage is preserved without being overwritten with empty list', async () => {
    const storage = createMockStorage();
    const corruptData = '{{NOT_VALID_JSON...';
    storage.setItem('tt_products', corruptData);

    const win = createMockBrowser(storage);
    win.fetch = async () => { throw new Error('Network error'); };
    vm.createContext(win);
    vm.runInContext(catalogStoreCode, win);

    await win.TTCatalogStore.initCatalog();
    assert.strictEqual(storage.getItem('tt_products'), corruptData, 'Raw corrupt data must be preserved');
  });

  // -------------------------------------------------------------
  // CASE 5: Double migration idempotent
  // -------------------------------------------------------------
  await it('Case 5: Migration is idempotent; running twice yields exact same output without duplicate writes', async () => {
    const storage = createMockStorage();
    const baseOld = [{ id: 'prod-1', title: 'Test Product', price: 100000 }];
    storage.setItem('tt_products', JSON.stringify(baseOld));

    const win = createMockBrowser(storage);
    vm.createContext(win);
    vm.runInContext(catalogStoreCode, win);

    await win.TTCatalogStore.initCatalog();
    const firstPass = storage.getItem('tt_products');
    await win.TTCatalogStore.initCatalog();
    const secondPass = storage.getItem('tt_products');
    assert.strictEqual(firstPass, secondPass, 'Output must be strictly identical across runs');
  });

  // -------------------------------------------------------------
  // CASE 6: Buy Now Item A while Cart has Item B
  // -------------------------------------------------------------
  await it('Case 6: Direct Buy Now with item A while Cart contains item B isolates item A and preserves cart B', async () => {
    const storage = createMockStorage();
    const win = createMockBrowser(storage);

    const itemB = { id: 'prod-2', title: 'Bình Hoa', price: 149000, qty: 2 };
    const cartItems = [itemB];
    win.TTCart = {
      getItems: () => cartItems,
      getDiscountPercent: () => 0
    };

    const itemA = {
      id: 'prod-1',
      title: 'Đế WiFi NFC',
      price: 129000,
      qty: 1,
      colorId: 'matte_black',
      colorName: 'Đen Mờ Nhám',
      materialId: 'pla_matte',
      materialName: 'PLA Matte Thẩm Mỹ',
      customText: 'Kafe_5G'
    };

    vm.createContext(win);
    vm.runInContext(checkoutCode, win);

    win.TTCheckout.openCheckout([itemA], 0, { source: 'direct' });
    const ctx = win.TTCheckout.getCurrentContext();
    assert.ok(ctx, 'Context must exist');
    assert.strictEqual(ctx.source, 'direct');
    assert.strictEqual(ctx.items.length, 1);
    assert.strictEqual(ctx.items[0].id, 'prod-1', 'Context items must ONLY contain item A');
    assert.strictEqual(cartItems.length, 1);
    assert.strictEqual(cartItems[0].id, 'prod-2', 'Cart B must remain completely intact');
  });

  // -------------------------------------------------------------
  // CASE 7: Pricing: 109k base + 20k mat mod, qty 3
  // -------------------------------------------------------------
  await it('Case 7: Pricing: Base 109k + 20k modifier x 3 -> Unit 129k, Subtotal 387k, Shipping 0 (Free >= 300k)', async () => {
    const win = createMockBrowser();
    vm.createContext(win);
    vm.runInContext(checkoutCode, win);

    const items = [{ id: 'prod-1', price: 129000, qty: 3 }];
    const totals = win.TTCheckout.calculateOrderTotals(items, 0);
    assert.strictEqual(totals.subtotal, 387000, 'Subtotal must be 387,000 VND');
    assert.strictEqual(totals.shippingFee, 0, 'Shipping must be 0 VND because subtotal >= 300,000 VND');
    assert.strictEqual(totals.finalTotal, 387000, 'Final total must be 387,000 VND');
  });

  // -------------------------------------------------------------
  // CASE 8: Pricing: Subtotal 310k with 10% discount -> Net 279k, Shipping 25k, Total 304k
  // -------------------------------------------------------------
  await it('Case 8: Subtotal 310k with 10% discount -> Net 279k, Shipping 25k, Total 304k', async () => {
    const win = createMockBrowser();
    vm.createContext(win);
    vm.runInContext(checkoutCode, win);

    const items = [{ id: 'prod-custom', price: 310000, qty: 1 }];
    const totals = win.TTCheckout.calculateOrderTotals(items, 10);
    assert.strictEqual(totals.subtotal, 310000, 'Raw subtotal 310,000 VND');
    assert.strictEqual(totals.discountAmount, 31000, 'Discount amount 31,000 VND');
    assert.strictEqual(totals.discountedSubtotal, 279000, 'Discounted subtotal 279,000 VND');
    assert.strictEqual(totals.shippingFee, 25000, 'Shipping fee 25,000 VND because 279k < 300k');
    assert.strictEqual(totals.finalTotal, 304000, 'Final total must be 304,000 VND');
  });

  // -------------------------------------------------------------
  // CASE 9: Double Confirmation Guard
  // -------------------------------------------------------------
  await it('Case 9: Double confirmation creates exactly one order draft per clientRequestId', async () => {
    const storage = createMockStorage();
    const win = createMockBrowser(storage);
    vm.createContext(win);
    vm.runInContext(checkoutCode, win);

    // Mock inputs
    win.document.getElementById = (id) => ({
      value: id.includes('name') ? 'Nguyen Van A' : id.includes('phone') ? '0988123456' : id.includes('addr') ? '123 Pho Hue' : '',
      textContent: '',
      innerHTML: '',
      appendChild: () => {},
      classList: { add: () => {}, remove: () => {} },
      addEventListener: () => {}
    });

    win.TTCheckout.openCheckout([{ id: 'prod-1', price: 109000, qty: 1, title: 'Item 1' }], 0);
    win.TTCheckout.submitCheckout('cod');
    win.TTCheckout.submitCheckout('cod');

    const drafts = JSON.parse(storage.getItem('TT_DIRECT_ORDER_DRAFTS_V1') || '[]');
    assert.strictEqual(drafts.length, 1, 'Only one order draft should be created');
  });

  // -------------------------------------------------------------
  // CASE 10: XSS Protection
  // -------------------------------------------------------------
  await it('Case 10: Markup and quotes in customer name or engraving text are escaped safely', async () => {
    const win = createMockBrowser();
    vm.createContext(win);
    vm.runInContext(checkoutCode, win);

    const maliciousText = '<script>alert("xss")</script> & "quotes" \'single\'';
    const escaped = win.TTCheckout.escapeHtml(maliciousText);
    assert.ok(!escaped.includes('<script>'), 'Must escape <script>');
    assert.ok(escaped.includes('&lt;script&gt;'), 'Must convert to &lt;script&gt;');
    assert.ok(!escaped.includes('"quotes"'), 'Must escape double quotes');
  });

  // -------------------------------------------------------------
  // CASE 11: Catalog Baseline Contract (55 Items, 11 per Category)
  // -------------------------------------------------------------
  await it('Case 11: Catalog contains exactly 55 unique IDs across 5 categories (11 items each)', async () => {
    assert.strictEqual(defaultCatalog.length, 55, 'Catalog must contain exactly 55 products');
    const ids = new Set(defaultCatalog.map(p => p.id));
    assert.strictEqual(ids.size, 55, 'All 55 product IDs must be unique');

    const expectedCats = ['Trang_Diem_Vanity', 'Decor_Den_Noi_That', 'Do_Choi_Moc_Khoa', 'Hop_De_Ban_Tien_Ich', 'Ca_Nhan_Hoa_NFC'];
    expectedCats.forEach(cat => {
      const inCat = defaultCatalog.filter(p => p.category === cat);
      assert.strictEqual(inCat.length, 11, `Category ${cat} must contain exactly 11 products`);
    });
  });

  // -------------------------------------------------------------
  // CASE 12: Hero Selection Accuracy (Codex Directive Ranking)
  // -------------------------------------------------------------
  await it('Case 12: Hero selection identifies exact 5 Hero IDs approved by Codex Master Controller', async () => {
    const expectedHeroes = {
      Trang_Diem_Vanity: '1646129',
      Decor_Den_Noi_That: '1438306',
      Do_Choi_Moc_Khoa: '1702306',
      Hop_De_Ban_Tien_Ich: '1971424',
      Ca_Nhan_Hoa_NFC: '1836100'
    };

    const win = createMockBrowser();
    vm.createContext(win);
    vm.runInContext(catalogStoreCode, win);
    await win.TTCatalogStore.initCatalog();

    Object.entries(expectedHeroes).forEach(([catId, expectedModelId]) => {
      const hero = win.TTCatalogStore.getCategoryHeroSync(catId);
      assert.ok(hero, `Hero for category ${catId} must exist`);
      assert.strictEqual(String(hero.modelId || hero.id), expectedModelId, `Hero for ${catId} must be Model ID ${expectedModelId}`);
      assert.strictEqual(hero.isHero, true, `Hero item must have isHero === true`);
    });
  });

  // -------------------------------------------------------------
  // CASE 13: Media Pipeline Verification (55/55 Thumbnails Exist)
  // -------------------------------------------------------------
  await it('Case 13: All 55 product images exist on disk in assets/images/products/ and are readable', async () => {
    defaultCatalog.forEach(p => {
      const imgPath = path.join(__dirname, '..', p.image);
      assert.ok(fs.existsSync(imgPath), `Thumbnail must exist on disk: ${p.image}`);
      const stats = fs.statSync(imgPath);
      assert.ok(stats.size > 0, `Thumbnail file must not be empty: ${p.image}`);
    });
  });

  // -------------------------------------------------------------
  // CASE 14: Router Query Hash Contract (Case Sensitive Cat ID)
  // -------------------------------------------------------------
  await it('Case 14: parseStoreHash preserves case of Category ID and defaults invalid categories to all', async () => {
    const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf-8');
    const win = createMockBrowser();
    vm.createContext(win);
    vm.runInContext(appCode, win);

    assert.ok(typeof win.parseStoreHash === 'function', 'parseStoreHash must be globally exposed');

    // Test 1: Valid category preserves exact casing
    const res1 = win.parseStoreHash('#store?cat=Trang_Diem_Vanity');
    assert.strictEqual(res1.path, 'store', 'Path must be store');
    assert.strictEqual(res1.category, 'Trang_Diem_Vanity', 'Category ID casing must be preserved');

    // Test 2: Invalid category falls back to all
    const res2 = win.parseStoreHash('#store?cat=INVALID_CATEGORY');
    assert.strictEqual(res2.category, 'all', 'Invalid category must fall back to all');

    // Test 3: No query param falls back to all
    const res3 = win.parseStoreHash('#store');
    assert.strictEqual(res3.category, 'all', 'No cat param must default to all');
  });

  // -------------------------------------------------------------
  // CASE 15: Tombstone Preservation Across Inits
  // -------------------------------------------------------------
  await it('Case 15: Deleted seed records tombstone and is not resurrected on next catalog init', async () => {
    const storage = createMockStorage();
    const win = createMockBrowser(storage);
    vm.createContext(win);
    vm.runInContext(catalogStoreCode, win);

    await win.TTCatalogStore.initCatalog();
    assert.strictEqual(win.TTCatalogStore.getProductsSync(false).length, 55, 'Initial load has 55 items');

    // Delete one seed
    const idToDelete = defaultCatalog[0].id;
    await win.TTCatalogStore.deleteProduct(idToDelete);
    assert.strictEqual(win.TTCatalogStore.getProductsSync(false).length, 54, 'Store has 54 items after deletion');

    // Re-initialize with same storage and incoming catalog
    await win.TTCatalogStore.initCatalog();
    const reloaded = win.TTCatalogStore.getProductsSync(false);
    assert.strictEqual(reloaded.length, 54, 'Deleted seed must NOT be resurrected on re-init');
    assert.strictEqual(win.TTCatalogStore.getProductByIdSync(idToDelete), null, 'Deleted seed remains absent');
  });

  console.log('\n==========================================================');
  console.log(`Test Results: Total ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);
  console.log('==========================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
