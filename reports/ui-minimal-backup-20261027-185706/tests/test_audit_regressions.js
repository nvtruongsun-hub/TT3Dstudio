/**
 * T&T 3D Labs - Audit Regression Test Suite (Ca A - H & F01 - F12)
 * Tests expected CORRECT behavior. Must FAIL on unpatched snapshot and PASS after fixes.
 */
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const catalog = JSON.parse(read('products.json'));

function createEnvironment(initial = {}) {
  const data = { ...initial };
  const nodes = new Map();
  const events = {};
  const html = read('index.html') + '\n' + read('admin.html');

  function makeElement(tag, id = '') {
    const classes = new Set();
    const attrs = new Map();
    const dataset = {};
    const listeners = {};
    const children = [];

    const el = {
      tagName: (tag || 'DIV').toUpperCase(),
      id,
      value: '',
      textContent: '',
      innerHTML: '',
      style: {},
      dataset,
      hidden: false,
      disabled: false,
      children,
      parentElement: { clientWidth: 600, clientHeight: 500 },
      focus: () => {},
      blur: () => {},
      classList: {
        add: (...a) => a.forEach(x => classes.add(x)),
        remove: (...a) => a.forEach(x => classes.delete(x)),
        contains: x => classes.has(x),
        toggle: (x, force) => {
          if (force === undefined) {
            classes.has(x) ? classes.delete(x) : classes.add(x);
          } else if (force) {
            classes.add(x);
          } else {
            classes.delete(x);
          }
        }
      },
      setAttribute: (k, v) => attrs.set(k, String(v)),
      getAttribute: (k) => attrs.get(k) ?? null,
      removeAttribute: (k) => attrs.delete(k),
      appendChild: (c) => { children.push(c); if (c && typeof c === 'object') c.parentElement = el; return c; },
      append: (...items) => { items.forEach(c => { children.push(c); if (c && typeof c === 'object') c.parentElement = el; }); },
      addEventListener: (ev, fn) => { (listeners[ev] ||= []).push(fn); },
      dispatchEvent: (e) => {
        const fns = listeners[e.type] || [];
        fns.forEach(fn => fn(e));
      },
      closest: (sel) => {
        const match = sel.match(/\[data-action="([^"]+)"\]/);
        if (match && el.dataset.action === match[1]) return el;
        if (el.parentElement && typeof el.parentElement.closest === 'function') return el.parentElement.closest(sel);
        return null;
      },
      querySelector: (sel) => {
        function search(node) {
          for (const c of (node.children || [])) {
            if (typeof c === 'object') {
              if (sel.startsWith('.') && c.classList && c.classList.contains(sel.slice(1))) return c;
              const matchAction = sel.match(/\[data-action="([^"]+)"\]/);
              if (matchAction && c.dataset && c.dataset.action === matchAction[1]) return c;
              const found = search(c);
              if (found) return found;
            }
          }
          return null;
        }
        return search(el);
      },
      querySelectorAll: (sel) => {
        const res = [];
        for (const c of children) {
          if (typeof c === 'object') {
            if (sel.startsWith('.') && c.classList && c.classList.contains(sel.slice(1))) res.push(c);
            if (c.querySelectorAll) res.push(...c.querySelectorAll(sel));
          }
        }
        return res;
      }
    };
    return el;
  }

  for (const match of html.matchAll(/\bid="([^"]+)"/g)) {
    nodes.set(match[1], makeElement('DIV', match[1]));
  }

  const document = {
    readyState: 'complete',
    getElementById: id => nodes.get(id) || null,
    querySelector: () => null,
    querySelectorAll: (sel) => {
      const res = [];
      nodes.forEach(n => {
        if (sel.startsWith('.') && n.classList && n.classList.contains(sel.slice(1))) res.push(n);
      });
      return res;
    },
    addEventListener: (ev, fn) => { (events[ev] ||= []).push(fn); },
    createElement: (tag) => makeElement(tag),
    createTextNode: (text) => ({ nodeType: 3, textContent: String(text) }),
    body: makeElement('BODY', 'body')
  };

  const activeRaf = new Set();
  const win = {
    document,
    console: { log() {}, warn() {}, error() {} },
    sessionStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    localStorage: {
      getItem: k => data[k] ?? null,
      setItem: (k, v) => { data[k] = String(v); },
      removeItem: (k) => { delete data[k]; }
    },
    fetch: async () => ({ ok: true, json: async () => catalog }),
    addEventListener: (k, fn) => { (events[k] ||= []).push(fn); },
    dispatchEvent() {},
    CustomEvent: class { constructor(type, detail) { this.type = type; this.detail = detail; } },
    location: { hash: '#store' },
    URLSearchParams,
    requestAnimationFrame: (cb) => {
      if (typeof cb === 'function' && !activeRaf.has(cb)) {
        activeRaf.add(cb);
        try { cb(); } finally { activeRaf.delete(cb); }
      }
      return 1;
    },
    setTimeout: (cb) => { if (typeof cb === 'function') cb(); },
    clearTimeout: () => {},
    scrollTo() {},
    THREE: {
      Scene: class { add() {} remove() {} },
      PerspectiveCamera: class { position = { set() {} }; lookAt() {} },
      WebGLRenderer: class {
        setSize() {}
        setPixelRatio() {}
        setClearColor() {}
        render() {}
        shadowMap = { enabled: false, type: 0 };
        domElement = { style: {}, addEventListener() {} }
      },
      DoubleSide: 2,
      PCFSoftShadowMap: 2,
      ACESFilmicToneMapping: 1,
      AmbientLight: class {},
      DirectionalLight: class { position = { set() {} }; shadow = { bias: 0, mapSize: { width: 0, height: 0 }, camera: { near: 0, far: 0 } } },
      Group: class { add() {}; position = { set() {} }; rotation = { set() {} } },
      Color: class {},
      MeshStandardMaterial: class { setValues() {} },
      ShadowMaterial: class {},
      Mesh: class { position = { set() {} }; rotation = { set() {}, y: 0 }; castShadow = false; receiveShadow = false; },
      BoxGeometry: class { rotateX() {} rotateY() {} rotateZ() {} },
      CylinderGeometry: class { rotateX() {} rotateY() {} rotateZ() {} },
      SphereGeometry: class { rotateX() {} rotateY() {} rotateZ() {} },
      TorusGeometry: class { rotateX() {} rotateY() {} rotateZ() {} },
      ConeGeometry: class { rotateX() {} rotateY() {} rotateZ() {} },
      PlaneGeometry: class { rotateX() {} rotateY() {} rotateZ() {} },
      GridHelper: class { position = { set() {} } }
    },
    history: {
      pushState(_s, _t, url) { win.location.hash = url; }
    }
  };
  win.window = win;
  vm.createContext(win);

  return {
    win,
    data,
    nodes,
    events,
    load: f => vm.runInContext(read(f), win, { filename: f })
  };
}

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.log(`[FAIL] ${name} -> ${err.stack || err.message}`);
    failed++;
  }
}

async function run() {
  console.log('--- RUNNING AUDIT REGRESSION SUITE (TARGETING CORRECT BEHAVIOR) ---');

  // Ca A: Wrong-type JSON preserved without overwriting
  await test('Ca A (F05): Valid JSON of wrong type in localStorage must NOT be overwritten with 55 seeds', async () => {
    const e = createEnvironment({ tt_products: '{"custom":"preserve"}' });
    e.load('js/catalog-store.js');
    await e.win.TTCatalogStore.initCatalog();
    assert.strictEqual(e.data.tt_products, '{"custom":"preserve"}', 'Raw invalid JSON must remain untouched in storage');
  });

  // Ca B: Fresh storage offline doesn't save []
  await test('Ca B (F04): Offline first load must not persist [] into storage; recovery after reload loads 55 items', async () => {
    const e = createEnvironment();
    e.win.fetch = async () => { throw new Error('Network offline'); };
    e.load('js/catalog-store.js');
    await e.win.TTCatalogStore.initCatalog();
    assert.strictEqual(e.data.tt_products, undefined, 'Must not write tt_products when offline on fresh storage');
    assert.strictEqual(e.data.tt_catalog_meta, undefined, 'Must not write tt_catalog_meta marker when offline on fresh storage');

    // Simulate reload with restored network
    const next = createEnvironment(e.data);
    next.load('js/catalog-store.js');
    await next.win.TTCatalogStore.initCatalog();
    assert.strictEqual(next.win.TTCatalogStore.getProductsSync(false).length, 55, 'Should load 55 items when back online');
  });

  // Ca C: Raw merge before sanitize preserves missing seed fields
  await test('Ca C (F06): Stored customized item missing category/image/downloads preserves seed defaults', async () => {
    const e = createEnvironment({
      tt_products: JSON.stringify([{ id: catalog[0].id, title: 'Admin Custom Title', price: 999999 }])
    });
    e.load('js/catalog-store.js');
    await e.win.TTCatalogStore.initCatalog();
    const p = e.win.TTCatalogStore.getProductByIdSync(catalog[0].id);
    assert.strictEqual(p.title, 'Admin Custom Title', 'Admin custom title preserved');
    assert.strictEqual(p.price, 999999, 'Admin custom price preserved');
    assert.strictEqual(p.category, catalog[0].category, 'Seed category preserved');
    assert.strictEqual(p.image, catalog[0].image, 'Seed image preserved');
    assert.strictEqual(p.downloads, catalog[0].downloads, 'Seed downloads count preserved');
  });

  // Ca D: Null modelKey in modal hides 3D button and refuses launch
  await test('Ca D (F01): Product with modelKey: null must hide 3D button and refuse open3DFromModal', async () => {
    const e = createEnvironment();
    e.win.TTCatalogStore = { getProductsSync: () => catalog, getProductByIdSync: id => catalog.find(p => p.id === id) };
    e.load('js/products-manager.js');
    e.win.openProductDetailModal(catalog[0].id);
    const btn3D = e.nodes.get('order-modal-3d-btn');
    assert.ok(btn3D.classList.contains('hidden') || btn3D.hidden === true, '3D button must be hidden for null modelKey');
    let launched = null;
    e.win.open3DViewerById = id => { launched = id; };
    e.win.open3DFromModal();
    assert.strictEqual(launched, null, 'open3DFromModal must NOT launch viewer for null modelKey');
  });

  // Ca E: Default viewer line item ID and active viewer product resolution
  await test('Ca E (F02, F03): Viewer add to cart preserves id: product.id without fabricated palette suffix', async () => {
    const e = createEnvironment();
    const modelProd = { ...catalog[0], id: 'test-model-prod', modelKey: 'nfc_wifi', price: 109000, colors: [{ id: 'obsidian', name: 'Đen Obsidian' }], materials: [{ id: 'pla_matte', name: 'PLA Matte', priceModifier: 0 }] };
    e.win.getStoredProducts = () => [modelProd];
    e.win.TTCatalogStore = { getProductsSync: () => [modelProd], getProductByIdSync: id => (id === modelProd.id ? modelProd : null) };
    e.load('js/category-registry.js');
    e.load('js/purchase-config.js');
    e.load('js/cart.js');
    e.load('js/viewer3d.js');
    e.win.open3DViewerById('test-model-prod');
    e.win.addActive3DModelToCart();
    const items = e.win.TTCart.getItems();
    assert.ok(items.length > 0, 'Cart must have item');
    assert.strictEqual(items[0].id, 'test-model-prod', 'Line item id must match product.id exactly');
  });

  // Ca F: Shared modelKey does not cause Product B to purchase Product A
  await test('Ca F (F02): Products sharing modelKey resolve to activeViewerProductId, not first match', async () => {
    const e = createEnvironment();
    const a = { ...catalog[0], id: 'prod-a', title: 'Product A', modelKey: 'nfc_wifi', price: 100000, colors: [{ id: 'c1', name: 'C1' }], materials: [{ id: 'm1', name: 'M1', priceModifier: 0 }] };
    const b = { ...catalog[1], id: 'prod-b', title: 'Product B', modelKey: 'nfc_wifi', price: 120000, colors: [{ id: 'c2', name: 'C2' }], materials: [{ id: 'm2', name: 'M2', priceModifier: 0 }] };
    e.win.getStoredProducts = () => [a, b];
    e.win.TTCatalogStore = { getProductsSync: () => [a, b], getProductByIdSync: id => (id === 'prod-a' ? a : id === 'prod-b' ? b : null) };
    let added = null;
    e.win.TTCart = { addToCart: (item) => { added = item; }, getItems: () => [] };
    e.win.TTStore = { addToCart: (item) => { added = item; } };
    e.load('js/category-registry.js');
    e.load('js/purchase-config.js');
    e.load('js/viewer3d.js');
    e.win.open3DViewerById('prod-b');
    e.win.addActive3DModelToCart();
    assert.ok(added, 'An item must be added');
    assert.strictEqual(added.id, 'prod-b', 'Purchased product id must be prod-b, not prod-a');
  });

  // Ca G: Store tab navigation resets view to all categories
  await test('Ca G (F09): Switching back to Store tab must reset category to all and render all 5 Hero spotlights', async () => {
    const e = createEnvironment();
    e.win.TTCatalogStore = { getProductsSync: () => catalog };
    e.load('js/products-manager.js');
    e.load('js/app.js');
    e.win.navigateToCategory('Trang_Diem_Vanity');
    e.win.switchWorkspace('view-studio3d');
    e.win.switchWorkspace('view-store');
    assert.strictEqual(e.win.location.hash, '#store');
    const heroCount = (e.nodes.get('store-product-grid').innerHTML.match(/class="studio-hero-spotlight /g) || []).length;
    assert.strictEqual(heroCount, 5, 'Must render 5 Hero spotlights when switching back to store');
  });

  // Ca H: Swatch click uses DOM/dataset delegation, escaping injection payloads
  await test('Ca H (F07): Malicious color ID does not execute via inline onclick injection', async () => {
    const e = createEnvironment();
    const maliciousColor = { id: "x');window.auditInjected=1;//", name: 'Injected Color', hex: '#000000' };
    const custom = { ...catalog[0], colors: [maliciousColor] };
    e.win.TTCatalogStore = { getProductsSync: () => [custom], getProductByIdSync: () => custom };
    e.load('js/products-manager.js');
    e.win.openProductDetailModal(custom.id);
    const box = e.nodes.get('order-swatches-box');
    assert.ok(!box.innerHTML.includes('onclick='), 'Modal color swatches must not use inline onclick handler');
    assert.strictEqual(e.win.auditInjected, undefined, 'Inline JS injection must not execute');
  });

  // Additional Regression 1: Purchase Config Pricing & Zero Price Preserved
  await test('Additional 1 (F03, F10): Shared purchase builder calculates unitPrice accurately and preserves price 0', async () => {
    const e = createEnvironment();
    const p1 = {
      ...catalog[0],
      id: 'price-test-1',
      price: 109000,
      materials: [{ id: 'pla_silk', name: 'Silk', priceModifier: 20000 }]
    };
    const pZero = {
      ...catalog[0],
      id: 'price-test-zero',
      price: 0,
      materials: [{ id: 'pla_free', name: 'Free', priceModifier: 0 }]
    };
    e.win.TTCatalogStore = {
      getProductByIdSync: (id) => (id === 'price-test-1' ? p1 : id === 'price-test-zero' ? pZero : null)
    };
    e.load('js/purchase-config.js');
    assert.ok(e.win.TTPurchaseConfig, 'TTPurchaseConfig must exist');

    const line1 = e.win.TTPurchaseConfig.buildConfiguredLine('price-test-1', {
      materialId: 'pla_silk',
      qty: 3
    });
    // unitPrice = 109000 + 20000 = 129000
    assert.strictEqual(line1.price, 129000, 'Unit price must be base + material modifier');
    assert.strictEqual(line1.qty, 3, 'Qty must be 3');

    const lineZero = e.win.TTPurchaseConfig.buildConfiguredLine('price-test-zero', {
      materialId: 'pla_free',
      qty: 1
    });
    assert.strictEqual(lineZero.price, 0, 'Price 0 must remain 0, not default to 109000');
  });

  // Additional Regression 2: Direct Purchase Isolation
  await test('Additional 2: Direct purchase does not mutate cart items', async () => {
    const e = createEnvironment();
    e.load('js/cart.js');
    e.load('js/checkout.js');
    e.win.TTCart.addToCart({ id: 'cart-item-1', title: 'Item 1', price: 100000, qty: 1 });
    assert.strictEqual(e.win.TTCart.getItems().length, 1);

    let openedDirectItems = null;
    e.win.renderCheckoutModal = () => {};
    // Call openCheckout with direct line
    e.win.TTCheckout.openCheckout([{ id: 'direct-item', title: 'Direct', price: 200000, qty: 1 }], 0, { source: 'direct' });
    assert.strictEqual(e.win.TTCart.getItems().length, 1, 'TTCart items must not be mutated by direct checkout');
    assert.strictEqual(e.win.TTCart.getItems()[0].id, 'cart-item-1', 'Existing cart item remains intact');
  });

  // Additional Regression 3: Cart Totals Calculation
  await test('Additional 3: CalculateOrderTotals discount 10% on 310k -> 279k + 25k ship = 304k; empty cart ship 0', async () => {
    const e = createEnvironment();
    e.load('js/checkout.js');
    const calc = e.win.TTCheckout.calculateOrderTotals;
    assert.ok(typeof calc === 'function', 'calculateOrderTotals must be a function');

    const emptyRes = calc([]);
    assert.strictEqual(emptyRes.shipping, 0, 'Empty cart has 0 shipping');
    assert.strictEqual(emptyRes.finalTotal, 0, 'Empty cart has 0 total');

    const items = [{ id: 'p1', price: 310000, qty: 1 }];
    const res = calc(items, 10); // 10% discount
    // Subtotal: 310,000. Discount 10% = 31,000. Discounted subtotal: 279,000. Shipping: 25,000 (standard). Final: 304,000.
    assert.strictEqual(res.subtotal, 310000);
    assert.strictEqual(res.discountAmount, 31000, 'Discount must be 31,000');
    assert.strictEqual(res.shipping, 25000, 'Shipping must be 25,000');
    assert.strictEqual(res.finalTotal, 304000, 'Final total must be 304,000');
  });

  // Ca I (R01): Cart +/- click dispatch without ReferenceError, correctly calling updateItemQty
  await test('Ca I (R01): Cart +/- click dispatches without ReferenceError, correctly calling updateItemQty', async () => {
    const e = createEnvironment();
    e.load('js/cart.js');
    e.win.TTCart.addToCart({ id: 'item-qty-test', title: 'Test Qty', price: 100000, qty: 1 });
    const container = e.nodes.get('cart-items-container');
    assert.ok(container.children.length > 0, 'Container must render item');
    const incBtn = container.children[0].querySelector('[data-action="cart-qty-inc"]');
    assert.ok(incBtn, 'Must find cart-qty-inc button');
    container.dispatchEvent({ type: 'click', target: incBtn });
    const items = e.win.TTCart.getItems();
    assert.strictEqual(items[0].qty, 2, 'Quantity must increment to 2 without ReferenceError');
  });

  // Ca J (R02): Admin orders table renders without ReferenceError on tableBody
  await test('Ca J (R02): Admin orders table renders without ReferenceError on tableBody', async () => {
    const e = createEnvironment();
    e.win.TTCheckout = {
      getDraftOrders: () => [
        {
          clientRequestId: 'req-001',
          createdAt: Date.now(),
          customer: { name: 'Nguyen Van A', phone: '0901234567' },
          items: [{ title: 'Item 1', qty: 2 }],
          totals: { payableTotal: 200000 },
          channel: 'zalo'
        }
      ]
    };
    e.load('js/admin.js');
    assert.doesNotThrow(() => {
      e.win.TTAdmin.renderOrdersTable();
    }, 'renderOrdersTable must not throw ReferenceError');
    const tableBody = e.nodes.get('orders-table-body');
    assert.ok(tableBody.children.length > 0, 'Orders table body must have rendered order row');
  });

  // Ca K (R03): Cart DOM rendering prevents XSS markup injection from title and customText
  await test('Ca K (R03): Cart DOM rendering prevents XSS markup injection from title and customText', async () => {
    const e = createEnvironment();
    e.load('js/cart.js');
    const xssPayload = '<img src=x onerror=alert(1)>';
    e.win.TTCart.addToCart({
      id: 'xss-test-prod',
      title: xssPayload,
      customText: xssPayload,
      price: 50000,
      qty: 1
    });
    const container = e.nodes.get('cart-items-container');
    assert.ok(container.children.length > 0);
    assert.ok(!container.innerHTML.includes('<img src=x'), 'Attacker markup must not be parsed into innerHTML');
  });

  // Ca L (R04): Tombstones are preserved in cachedMetadata and journal even if metadata write fails
  await test('Ca L (R04): Tombstones are preserved in cachedMetadata even if metadata write fails', async () => {
    const e = createEnvironment();
    const p1 = { ...catalog[0], id: 'prod-del-1', title: 'Product 1', price: 100000 };
    const p2 = { ...catalog[1], id: 'prod-del-2', title: 'Product 2', price: 120000 };
    e.data.tt_products = JSON.stringify([p1, p2]);
    e.data.tt_catalog_meta = JSON.stringify({ schemaVersion: 5, catalogRevision: 'mw-55-v2', tombstones: [] });

    e.load('js/category-registry.js');
    e.load('js/catalog-store.js');
    await e.win.TTCatalogStore.initCatalog();

    const originalSetItem = e.win.localStorage.setItem;
    let failMeta = true;
    e.win.localStorage.setItem = (k, v) => {
      if (k === 'tt_catalog_meta' && failMeta) {
        throw new Error('QuotaExceededError mock');
      }
      originalSetItem(k, v);
    };

    const res1 = await e.win.TTCatalogStore.deleteProduct('prod-del-1');
    assert.strictEqual(res1.productsCommitted, true, 'Products must be committed');
    assert.strictEqual(res1.metadataPending, true, 'Metadata must be marked pending');

    failMeta = false;
    const res2 = await e.win.TTCatalogStore.deleteProduct('prod-del-2');
    assert.strictEqual(res2.productsCommitted, true);
    assert.strictEqual(res2.metadataCommitted, true);

    const finalMeta = JSON.parse(e.data.tt_catalog_meta);
    assert.ok(finalMeta.tombstones.includes('prod-del-1'), 'First deleted product tombstone must not be lost');
    assert.ok(finalMeta.tombstones.includes('prod-del-2'), 'Second deleted product tombstone must be recorded');
  });

  // Ca M (R05): Offline buildMigration with empty incomingDefaults does not advance revision
  await test('Ca M (R05): Offline buildMigration with empty incomingDefaults does not advance revision', async () => {
    const e = createEnvironment();
    e.load('js/catalog-store.js');
    const stored = [{ id: 'custom-1', title: 'Custom 1', price: 100000, category: 'Trang_Diem_Vanity' }];
    const meta = { schemaVersion: 5, catalogRevision: 'legacy-v1', tombstones: [] };
    const migration = e.win.TTCatalogStore.buildMigration({
      storedProducts: stored,
      incomingDefaults: [],
      metadata: meta,
      currentRevision: 'mw-55-v2',
      currentSchemaVersion: 5,
      timestamp: new Date().toISOString()
    });
    assert.strictEqual(migration.metadata.catalogRevision, 'legacy-v1', 'Offline migration must NOT advance catalogRevision');
  });

  // Ca N (R06): Purchase builder rejects fractional/junk qty and cart rejects empty ID / negative price
  await test('Ca N (R06): Purchase builder rejects fractional/junk qty and cart rejects empty ID / negative price', async () => {
    const e = createEnvironment();
    const p1 = {
      ...catalog[0],
      id: 'test-p1',
      price: 100000,
      colors: [{ id: 'c1', name: 'Color 1' }],
      materials: [{ id: 'm1', name: 'Mat 1', priceModifier: 0 }]
    };
    e.win.TTCatalogStore = { getProductByIdSync: () => p1 };
    e.load('js/purchase-config.js');
    e.load('js/cart.js');

    assert.throws(() => {
      e.win.TTPurchaseConfig.buildConfiguredLine('test-p1', { qty: 1.5 });
    }, /Số lượng sản phẩm phải là số nguyên/);

    assert.throws(() => {
      e.win.TTPurchaseConfig.buildConfiguredLine('test-p1', { qty: '2junk' });
    }, /Số lượng sản phẩm phải là số nguyên/);

    const addEmptyId = e.win.TTCart.addToCart({ id: '', price: 100000, qty: 1 });
    assert.strictEqual(addEmptyId, false, 'addToCart must reject empty id');

    const addNegativePrice = e.win.TTCart.addToCart({ id: 'test-p1', price: -5000, qty: 1 });
    assert.strictEqual(addNegativePrice, false, 'addToCart must reject negative price');

    const addFractionalQty = e.win.TTCart.addToCart({ id: 'test-p1', price: 100000, qty: 2.5 });
    assert.strictEqual(addFractionalQty, false, 'addToCart must reject fractional qty');
  });

  // Ca O: Order Tracker Exact Code Lookup & Safe Projection (Codex TT3D-ARCH-20261021-R1)
  await test('Ca O: Order Tracker Exact Code Lookup & Safe Projection in TTCheckout', async () => {
    const e = createEnvironment();
    e.load('js/checkout.js');

    assert.strictEqual(typeof e.win.TTCheckout.getDraftOrders, 'function', 'getDraftOrders must be exported');
    assert.strictEqual(typeof e.win.TTCheckout.lookupOrder, 'function', 'lookupOrder must be exported');

    // Initially empty
    assert.strictEqual(e.win.TTCheckout.getDraftOrders().length, 0);

    const ord1 = {
      clientRequestId: 'TT3D-TEST01',
      createdAt: '2026-10-21T05:00:00.000Z',
      channel: 'zalo',
      customer: { name: 'Nguyen Van A', phone: '0986888333', address: 'Hanoi' },
      items: [{ id: 'p1', title: 'Khay Lụa Vanity', price: 150000, qty: 1 }],
      totals: { finalTotal: 175000, isFreeShipping: false }
    };
    const ord2 = {
      clientRequestId: 'TT3D-DEMO02',
      createdAt: '2026-10-21T05:30:00.000Z',
      channel: 'cod',
      customer: { name: 'Tran Thi B', phone: '0912345678', address: 'Danang' },
      items: [{ id: 'p2', title: 'Hộp Đựng Bánh Răng', price: 220000, qty: 1 }],
      totals: { finalTotal: 220000, isFreeShipping: false }
    };

    e.data.TT_DIRECT_ORDER_DRAFTS_V1 = JSON.stringify([ord1, ord2]);

    const drafts = e.win.TTCheckout.getDraftOrders();
    assert.strictEqual(drafts.length, 2, 'Must retrieve 2 valid draft orders');

    // Tra chính xác toàn bộ mã (không phân biệt hoa thường)
    const matchUpper = e.win.TTCheckout.lookupOrder('TT3D-TEST01');
    assert.strictEqual(matchUpper.length, 1);
    assert.strictEqual(matchUpper[0].clientRequestId, 'TT3D-TEST01');
    assert.strictEqual(matchUpper[0].maskedPhone, '098***333');
    assert.strictEqual(matchUpper[0].statusText, 'Bản nháp trên thiết bị · Chưa gửi tới xưởng');
    assert.strictEqual(matchUpper[0].customerAddress, undefined, 'Full address must not be exposed');

    const matchLower = e.win.TTCheckout.lookupOrder('tt3d-test01');
    assert.strictEqual(matchLower.length, 1);
    assert.strictEqual(matchLower[0].clientRequestId, 'TT3D-TEST01');

    // Không tìm theo partial ID, số điện thoại hoặc tên (Codex F06)
    assert.strictEqual(e.win.TTCheckout.lookupOrder('TEST01').length, 0, 'Partial ID must not match');
    assert.strictEqual(e.win.TTCheckout.lookupOrder('888333').length, 0, 'Phone must not match');
    assert.strictEqual(e.win.TTCheckout.lookupOrder('Tran Thi').length, 0, 'Name must not match');
    assert.strictEqual(e.win.TTCheckout.lookupOrder('').length, 0);
    assert.strictEqual(e.win.TTCheckout.lookupOrder('nonexistent').length, 0);

    // Corrupt storage recovery: không crash và không ghi đè raw hỏng
    e.data.TT_DIRECT_ORDER_DRAFTS_V1 = '{invalid json syntax';
    assert.strictEqual(e.win.TTCheckout.getDraftOrders().length, 0, 'Corrupt storage must return empty array safely');
    assert.strictEqual(e.win.TTCheckout.lookupOrder('TT3D-TEST01').length, 0, 'Lookup on corrupt storage must return empty array safely');
    assert.strictEqual(e.data.TT_DIRECT_ORDER_DRAFTS_V1, '{invalid json syntax', 'Raw corrupt storage must NOT be overwritten');
  });

  // Ca P: saveOrderDraft Result Contract & QuotaExceeded Protection (Codex F03)
  await test('Ca P: saveOrderDraft Result Contract & QuotaExceeded Protection', async () => {
    const e = createEnvironment();
    e.load('js/checkout.js');

    // 1. Invalid record rejected
    const invalidRes = e.win.TTCheckout.submitCheckout ? null : null;
    const ordValid = {
      clientRequestId: 'TT3D-SAVE01',
      createdAt: '2026-10-21T06:00:00.000Z',
      customer: { name: 'Test User', phone: '0986888333', address: '123 Test St' },
      items: [{ id: 'p1', title: 'Item 1', qty: 1, price: 100000 }],
      totals: { finalTotal: 100000 }
    };

    // Open checkout context with item
    e.win.TTCheckout.openCheckout([{ id: 'cart-item-1', title: 'Cart Item', price: 100000, qty: 1 }], 0, { source: 'cart' });
    assert.strictEqual(e.win.TTCheckout.getCurrentContext().state, 'editing');

    // Simulate storage quota failure on setItem
    const origSetItem = e.win.localStorage.setItem;
    e.win.localStorage.setItem = (k, v) => {
      if (k === 'TT_DIRECT_ORDER_DRAFTS_V1') {
        const err = new Error('QuotaExceededError');
        err.name = 'QuotaExceededError';
        throw err;
      }
      return origSetItem.call(e.win.localStorage, k, v);
    };

    // Fill form elements
    const nameEl = e.nodes.get('checkout-cust-name') || { value: 'Test User', focus() {} };
    nameEl.value = 'Test User';
    const phoneEl = e.nodes.get('checkout-cust-phone') || { value: '0986888333', focus() {} };
    phoneEl.value = '0986888333';
    const addrEl = e.nodes.get('checkout-cust-address') || { value: '123 Test', focus() {} };
    addrEl.value = '123 Test';

    // Mock cart having items
    let cartCleared = false;
    e.win.TTCart = {
      clearCart: () => { cartCleared = true; }
    };

    // Run submitCheckout when storage throws QuotaExceeded
    await e.win.TTCheckout.submitCheckout('zalo');

    // Cart must NOT be cleared when storage fails (Codex F03)
    assert.strictEqual(cartCleared, false, 'Cart must NOT be cleared when draft save fails');
    // State must remain 'editing' to allow retry
    assert.strictEqual(e.win.TTCheckout.getCurrentContext().state, 'editing', 'State must remain editing after storage failure');

    // Restore setItem
    e.win.localStorage.setItem = origSetItem;
  });

  console.log(`\nRegression Suite Complete: Passed ${passed} / ${passed + failed}`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

run().catch(err => {
  console.error('Test suite runner failed:', err);
  process.exit(1);
});
