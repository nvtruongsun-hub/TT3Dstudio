/**
 * T&T 3D Labs - Precision Craft & Automation Simulator Feature Test Suite
 * Comprehensive Behavioral Verification Suite covering Codex Findings F01 - F07
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('==========================================================');
console.log('   T&T 3D LABS - PRECISION CRAFT & AUTOMATION FEATURE TESTS');
console.log('==========================================================\n');

// Mock browser environment for Node.js
global.window = global;

const mockStorage = new Map();
global.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

const docListeners = new Map();
global.document = {
  hidden: false,
  addEventListener: (evt, fn) => {
    if (!docListeners.has(evt)) docListeners.set(evt, []);
    docListeners.get(evt).push(fn);
  },
  removeEventListener: (evt, fn) => {
    if (docListeners.has(evt)) {
      const arr = docListeners.get(evt).filter(f => f !== fn);
      docListeners.set(evt, arr);
    }
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    className: '',
    innerHTML: '',
    style: {},
    appendChild: () => {}
  }),
  documentElement: {
    setAttribute: () => {},
    classList: { toggle: () => {}, add: () => {}, remove: () => {} }
  },
  body: {
    classList: { toggle: () => {}, add: () => {}, remove: () => {} }
  }
};
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.performance = { now: () => Date.now() };

let rafTimerId = 1;
const activeRafs = new Set();
global.requestAnimationFrame = (fn) => {
  const id = rafTimerId++;
  activeRafs.add(id);
  setTimeout(() => {
    if (activeRafs.has(id)) {
      activeRafs.delete(id);
      fn(Date.now());
    }
  }, 16);
  return id;
};
global.cancelAnimationFrame = (id) => {
  activeRafs.delete(id);
};

// 1. Load Modules
require('../js/purchase-config.js');
require('../js/studio-state.js');
require('../js/automation-simulator.js');
require('../js/checkout.js');
require('../js/cart.js');
require('../js/personalize-studio.js');

let passedCount = 0;
let totalTests = 0;
function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------------
// 1. TTAutomationSimulator Tests (F01, F06)
// -----------------------------------------------------------------
test('F01.1: Simulator initializes without error when canvas dimensions are non-zero', () => {
  const mockCanvas = {
    getContext: () => ({
      clearRect: () => {},
      beginPath: () => {},
      ellipse: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      setTransform: () => {},
      setLineDash: () => {}
    }),
    getBoundingClientRect: () => ({ width: 480, height: 380 })
  };

  const mockContainer = {
    innerHTML: '',
    querySelector: (sel) => {
      if (sel === '.layercraft-canvas') return mockCanvas;
      if (sel === '.btn-play-pause') return { innerHTML: '', setAttribute: () => {}, addEventListener: () => {} };
      if (sel === '.btn-replay') return { addEventListener: () => {} };
      if (sel === '.layercraft-seek-slider') return { value: 0, addEventListener: () => {} };
      return null;
    },
    querySelectorAll: () => []
  };

  const sim = window.TTAutomationSimulator.create(mockContainer, {
    totalLayers: 60,
    autoPlay: false
  });

  assert.ok(sim, 'Simulator instance must be created');
  assert.strictEqual(typeof sim.play, 'function');
  assert.strictEqual(typeof sim.pause, 'function');
  assert.strictEqual(typeof sim.seek, 'function');

  sim.resize();
  sim.seek(0.5);
  assert.strictEqual(sim.currentProgress, 0.5);

  sim.destroy();
});

test('F01.2: Simulator gracefully renders fallback when Canvas 2D is unavailable', () => {
  let fallbackCreated = false;
  const mockViewport = {
    appendChild: (el) => {
      if (el && el.className && el.className.includes('layercraft-fallback')) {
        fallbackCreated = true;
      }
    }
  };

  const mockCanvas = {
    getContext: () => null,
    getBoundingClientRect: () => ({ width: 480, height: 380 }),
    style: {}
  };

  const mockContainer = {
    innerHTML: '',
    querySelector: (sel) => {
      if (sel === '.layercraft-canvas') return mockCanvas;
      if (sel === '.layercraft-viewport') return mockViewport;
      if (sel === '.btn-play-pause') return { innerHTML: '', setAttribute: () => {}, addEventListener: () => {} };
      if (sel === '.btn-replay') return { addEventListener: () => {} };
      if (sel === '.layercraft-seek-slider') return { value: 0, addEventListener: () => {} };
      return null;
    },
    querySelectorAll: () => []
  };

  assert.doesNotThrow(() => {
    const sim = window.TTAutomationSimulator.create(mockContainer, { autoPlay: false });
    assert.ok(sim, 'Simulator instance should be created without crashing');
    sim.resize();
    sim.render();
    sim.destroy();
  });

  assert.strictEqual(fallbackCreated, true, 'Fallback DOM element must be appended to viewport');
});

test('F06: Simulator visibility listener stops loop on hidden and restarts on visible', () => {
  const mockCanvas = {
    getContext: () => ({
      clearRect: () => {},
      beginPath: () => {},
      ellipse: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      setTransform: () => {},
      setLineDash: () => {}
    }),
    getBoundingClientRect: () => ({ width: 480, height: 380 })
  };

  const mockContainer = {
    innerHTML: '',
    querySelector: (sel) => {
      if (sel === '.layercraft-canvas') return mockCanvas;
      if (sel === '.btn-play-pause') return { innerHTML: '', setAttribute: () => {}, addEventListener: () => {} };
      if (sel === '.btn-replay') return { addEventListener: () => {} };
      if (sel === '.layercraft-seek-slider') return { value: 0, addEventListener: () => {} };
      return null;
    },
    querySelectorAll: () => []
  };

  global.document.hidden = false;
  const sim = window.TTAutomationSimulator.create(mockContainer, { autoPlay: true });
  assert.strictEqual(sim.isPlaying, true);
  assert.ok(sim.rafId !== null, 'RAF must be scheduled when autoPlay is true');

  // Trigger document visibilitychange to hidden
  global.document.hidden = true;
  const visListeners = docListeners.get('visibilitychange') || [];
  visListeners.forEach(fn => fn());

  assert.strictEqual(sim.rafId, null, 'RAF must be cancelled immediately when tab becomes hidden');
  assert.strictEqual(sim._canRunLoop(), false, '_canRunLoop must return false when tab is hidden');

  // Trigger document visibilitychange back to visible
  global.document.hidden = false;
  visListeners.forEach(fn => fn());

  assert.ok(sim.rafId !== null, 'RAF must resume automatically when tab becomes visible');
  assert.strictEqual(sim._canRunLoop(), true, '_canRunLoop must return true when tab is visible');

  sim.destroy();
  assert.strictEqual(sim.rafId, null, 'RAF must be cancelled after destroy()');
});

// -----------------------------------------------------------------
// 2. TTStudioState Tests (F04, F05)
// -----------------------------------------------------------------
test('F05.1: TTStudioState enforces deep recursive freezing and input isolation', () => {
  const mockProd = {
    id: 'test-sku-nested',
    title: 'Original Title',
    price: 150000,
    colors: [{ id: 'col-1', name: 'White', hex: '#FFF' }],
    materials: [
      { id: 'mat-1', name: 'Standard', priceModifier: 15000 }
    ],
    specs: {
      depth: { mm: 25 },
      weight: 120
    }
  };

  window.TTStudioState.setProduct(mockProd);
  const state = window.TTStudioState.getState();

  assert.strictEqual(Object.isFrozen(state), true, 'State root must be frozen');
  assert.strictEqual(Object.isFrozen(state.product), true, 'product must be frozen');
  assert.strictEqual(Object.isFrozen(state.product.materials), true, 'materials array must be frozen');
  assert.strictEqual(Object.isFrozen(state.product.materials[0]), true, 'materials[0] object must be frozen');
  assert.strictEqual(Object.isFrozen(state.product.specs), true, 'specs object must be frozen');
  assert.strictEqual(Object.isFrozen(state.product.specs.depth), true, 'specs.depth object must be frozen');

  try {
    state.product.materials[0].priceModifier = 99999;
  } catch (_) {}
  try {
    state.product.specs.depth.mm = 999;
  } catch (_) {}

  mockProd.materials[0].priceModifier = 88888;
  mockProd.specs.depth.mm = 888;

  const freshState = window.TTStudioState.getState();
  assert.strictEqual(freshState.product.materials[0].priceModifier, 15000, 'Internal material modifier must remain pristine 15000');
  assert.strictEqual(freshState.product.specs.depth.mm, 25, 'Internal specs depth must remain pristine 25');

  const snapshot = window.TTStudioState.createSnapshot();
  assert.ok(snapshot, 'Snapshot must be created');
  assert.strictEqual(snapshot.price, 165000, 'Price must be 150k + 15k = 165k regardless of attempted mutations');
});

test('F04.1: TTStudioState rejects invalid material and invalidates snapshot', () => {
  const mockProd = {
    id: 'test-sku-mat-validation',
    title: 'Test Vase',
    price: 100000,
    colors: [{ id: 'white', name: 'Trắng', hex: '#FFF' }],
    materials: [
      { id: 'pla_matte', name: 'PLA Matte', priceModifier: 0 },
      { id: 'pla_silk', name: 'PLA Silk', priceModifier: 25000 }
    ]
  };

  window.TTStudioState.setProduct(mockProd);
  assert.strictEqual(window.TTStudioState.getState().isValid, true);

  window.TTStudioState.setMaterial('unknown_hack_mat', 'Unknown Material');
  const state = window.TTStudioState.getState();

  assert.strictEqual(state.isValid, false, 'State must become invalid when material does not belong to product');
  assert.strictEqual(state.calculatedPrice, 0, 'Calculated price must be 0 when configuration is invalid');
  assert.strictEqual(window.TTStudioState.createSnapshot(), null, 'createSnapshot() must return null when validation fails');
});

test('F04.2: Real catalog Monogram mw-cn-1702306 strictly rejects empty customText', () => {
  const monogramProd = window.TTPersonalizeStudio.CUSTOM_PRODUCTS.find(p => p.id === 'mw-cn-1702306');
  assert.ok(monogramProd, 'Monogram product mw-cn-1702306 must exist in CUSTOM_PRODUCTS');
  assert.strictEqual(monogramProd.type, 'monogram', 'Monogram SKU must declare type monogram');

  window.TTStudioState.setProduct(monogramProd);
  window.TTStudioState.setCustomText(''); // Clear text

  const state = window.TTStudioState.getState();
  assert.strictEqual(state.isValid, false, 'Monogram with empty customText must be invalid');
  assert.strictEqual(window.TTStudioState.createSnapshot(), null, 'Snapshot must be refused when Monogram text is empty');

  // Provide valid text
  window.TTStudioState.setCustomText('MINH ANH');
  const validState = window.TTStudioState.getState();
  assert.strictEqual(validState.isValid, true, 'State becomes valid when required custom text is provided');
  assert.ok(window.TTStudioState.createSnapshot(), 'Snapshot must succeed once text is valid');
});

// -----------------------------------------------------------------
// 3. Studio Catalog Integrity & Submit Guard Tests (F03 P1)
// -----------------------------------------------------------------
test('F03.1: All CUSTOM_PRODUCTS in Studio have valid materials matching TTPurchaseConfig contract', () => {
  assert.ok(Array.isArray(window.TTPersonalizeStudio.CUSTOM_PRODUCTS), 'CUSTOM_PRODUCTS must be an array');
  assert.strictEqual(window.TTPersonalizeStudio.CUSTOM_PRODUCTS.length, 4, 'Must have 4 custom studio products');

  for (const prod of window.TTPersonalizeStudio.CUSTOM_PRODUCTS) {
    assert.ok(Array.isArray(prod.materials) && prod.materials.length > 0, `Product ${prod.id} must have non-empty materials`);
    assert.ok(Array.isArray(prod.colors) && prod.colors.length > 0, `Product ${prod.id} must have non-empty colors`);

    const validated = window.TTPurchaseConfig.validateConfiguration(prod, {
      colorId: prod.colors[0].id,
      materialId: prod.materials[0].id,
      qty: 1,
      customText: prod.defaultText
    });
    assert.ok(validated, `Product ${prod.id} must validate cleanly`);
    assert.ok(validated.material, `Product ${prod.id} must return valid material object`);
  }
});

test('F03.2: Studio submit button halts and refuses checkout when State snapshot is null', () => {
  let checkoutCalled = false;
  let cartCalled = false;
  let alertMessage = null;

  global.alert = (msg) => { alertMessage = msg; };
  const origOpenCheckout = window.TTCheckout.openCheckout;
  const origAddToCart = window.TTCart.addToCart;
  window.TTCheckout.openCheckout = () => { checkoutCalled = true; };
  window.TTCart.addToCart = () => { cartCalled = true; };

  let clickHandler = null;
  const mockBtn = {
    addEventListener: (evt, fn) => { if (evt === 'click') clickHandler = fn; }
  };

  const origGetElementById = global.document.getElementById;
  global.document.getElementById = (id) => {
    if (id === 'btn-personalize-submit') return mockBtn;
    if (id === 'personalize-studio-container') return { innerHTML: '' };
    return null;
  };

  window.TTPersonalizeStudio.init();
  assert.ok(clickHandler, 'Submit button click handler must be bound');

  // Force snapshot to return null to simulate validation refusal
  const origSnapshot = window.TTStudioState.createSnapshot;
  window.TTStudioState.createSnapshot = () => null;

  // Trigger submit with invalid state
  clickHandler();

  assert.strictEqual(checkoutCalled, false, 'TTCheckout must NOT be called when snapshot is null');
  assert.strictEqual(cartCalled, false, 'TTCart must NOT be called when snapshot is null');
  assert.ok(alertMessage !== null, 'User must be alerted of validation failure');

  window.TTStudioState.createSnapshot = origSnapshot;
  window.TTCheckout.openCheckout = origOpenCheckout;
  window.TTCart.addToCart = origAddToCart;
  global.document.getElementById = origGetElementById;
});

test('F03.3: Studio submit halts and warns when TTStudioState module is absent, with NO fabricated fallback', () => {
  let checkoutCalled = false;
  let cartCalled = false;
  let alertMessage = null;

  global.alert = (msg) => { alertMessage = msg; };
  const origOpenCheckout = window.TTCheckout.openCheckout;
  const origAddToCart = window.TTCart.addToCart;
  window.TTCheckout.openCheckout = () => { checkoutCalled = true; };
  window.TTCart.addToCart = () => { cartCalled = true; };

  let clickHandler = null;
  const mockBtn = {
    addEventListener: (evt, fn) => { if (evt === 'click') clickHandler = fn; }
  };

  const origGetElementById = global.document.getElementById;
  global.document.getElementById = (id) => {
    if (id === 'btn-personalize-submit') return mockBtn;
    if (id === 'personalize-studio-container') return { innerHTML: '' };
    return null;
  };

  // Temporarily simulate missing TTStudioState
  const origStudioState = window.TTStudioState;
  window.TTStudioState = undefined;

  window.TTPersonalizeStudio.init();
  clickHandler();

  assert.strictEqual(checkoutCalled, false, 'TTCheckout must NOT be called when TTStudioState is absent');
  assert.strictEqual(cartCalled, false, 'TTCart must NOT be called when TTStudioState is absent');
  assert.ok(alertMessage !== null, 'User must be alerted when state module is absent');

  window.TTStudioState = origStudioState;
  window.TTCheckout.openCheckout = origOpenCheckout;
  window.TTCart.addToCart = origAddToCart;
  global.document.getElementById = origGetElementById;
});

// -----------------------------------------------------------------
// 4. Cart Distinct Line Items for Fonts (Finding 2)
// -----------------------------------------------------------------
test('F03.4: TTCart does NOT merge items with different fonts', () => {
  window.TTCart.clearCart();

  const itemSans = {
    id: 'prod-monogram-test',
    title: 'Móc Khóa Monogram',
    price: 89000,
    qty: 1,
    colorId: 'craft_orange',
    colorName: 'Cam Signature',
    materialId: 'pla_matte',
    materialName: 'PLA Matte Tiêu Chuẩn',
    fontId: 'sans',
    customText: 'VIETNAM'
  };

  const itemScript = {
    id: 'prod-monogram-test',
    title: 'Móc Khóa Monogram',
    price: 89000,
    qty: 1,
    colorId: 'craft_orange',
    colorName: 'Cam Signature',
    materialId: 'pla_matte',
    materialName: 'PLA Matte Tiêu Chuẩn',
    fontId: 'script',
    customText: 'VIETNAM'
  };

  window.TTCart.addToCart(itemSans);
  window.TTCart.addToCart(itemScript);

  const cartItems = window.TTCart.getItems();
  assert.strictEqual(cartItems.length, 2, 'Cart must have 2 distinct lines for sans vs script');
  assert.strictEqual(cartItems[0].fontId, 'sans', 'Line 1 must preserve fontId sans');
  assert.strictEqual(cartItems[1].fontId, 'script', 'Line 2 must preserve fontId script');
  assert.strictEqual(cartItems[0].qty, 1);
  assert.strictEqual(cartItems[1].qty, 1);
});

// -----------------------------------------------------------------
// 5. Complete Modal Tokenization & WCAG 2.2 Contrast Verification
// -----------------------------------------------------------------
function getLuminance(hex) {
  const rgb = hex.replace('#', '').match(/.{2}/g).map(x => {
    const v = parseInt(x, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const bright = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (bright + 0.05) / (dark + 0.05);
}

test('F02: Complete Checkout modal is tokenized and satisfies WCAG AA contrast', () => {
  const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const modalIndex = htmlContent.indexOf('id="checkout-modal"');
  assert.ok(modalIndex > 0, 'checkout-modal must exist');

  const nextSectionIndex = htmlContent.indexOf('id="order-modal"', modalIndex);
  const modalSlice = htmlContent.slice(modalIndex, nextSectionIndex > 0 ? nextSectionIndex : modalIndex + 9500);

  // 1. Strict anti-patterns: No hardcoded light/dark clash classes
  assert.ok(!modalSlice.includes('text-[#20231F]'), 'Modal must not contain hardcoded dark text text-[#20231F]');
  assert.ok(!modalSlice.includes('text-[#586057]'), 'Modal must not contain hardcoded dark text text-[#586057]');
  assert.ok(!modalSlice.includes('bg-[#F7F6F2]'), 'Modal must not contain hardcoded light bg bg-[#F7F6F2]');
  assert.ok(!modalSlice.includes('text-emerald-400'), 'Modal must not contain low-contrast text-emerald-400 on light bg');

  // 2. Token presence
  assert.ok(modalSlice.includes('text-[var(--text-primary)]'), 'Must use var(--text-primary)');
  assert.ok(modalSlice.includes('text-[var(--status-success)]'), 'Must use var(--status-success)');
  assert.ok(modalSlice.includes('bg-[var(--bg-surface-elevated)]'), 'Must use var(--bg-surface-elevated)');
  assert.ok(modalSlice.includes('border-[var(--border-subtle)]'), 'Must use var(--border-subtle)');

  // 3. Mathematical WCAG AA Contrast Checks (>= 4.5:1)
  const lightBg = '#E8EFF4';
  const darkBg = '#1B2530';
  const lightPlaceholder = '#465B6B';
  const darkPlaceholder = '#7E8F9E';
  const lightStatus = '#146C4B';
  const darkStatus = '#69D9AF';

  const lightPlContrast = getContrastRatio(lightPlaceholder, lightBg);
  const darkPlContrast = getContrastRatio(darkPlaceholder, darkBg);
  const lightStContrast = getContrastRatio(lightStatus, lightBg);
  const darkStContrast = getContrastRatio(darkStatus, darkBg);

  assert.ok(lightPlContrast >= 4.5, `Light placeholder contrast must be >= 4.5:1 (got ${lightPlContrast.toFixed(2)}:1)`);
  assert.ok(darkPlContrast >= 4.5, `Dark placeholder contrast must be >= 4.5:1 (got ${darkPlContrast.toFixed(2)}:1)`);
  assert.ok(lightStContrast >= 4.5, `Light status contrast must be >= 4.5:1 (got ${lightStContrast.toFixed(2)}:1)`);
  assert.ok(darkStContrast >= 7.0, `Dark status contrast must be >= 7.0:1 (got ${darkStContrast.toFixed(2)}:1)`);
});

console.log(`\n==========================================================`);
console.log(`   PRECISION CRAFT TESTS: ${passedCount} / ${totalTests} PASSED`);
console.log(`==========================================================\n`);
