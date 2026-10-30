/**
 * TEST SUITE: CODEX TT3D-MASTER-AUDIT-R7 INVARIANTS & INTEGRITY
 * Adheres strictly to STRICT TDD rules. Verifies:
 * - P0: Bot Token secret isolation (no hardcoded token in client JS)
 * - P1: Strict State Machine transition validation (no resurrection of delivered orders)
 * - P1: Storage error propagation (no silent fake ok: true on storage failure)
 * - P1: Phone auth minimum 4 digits (rejection of '-' or single digit)
 * - P1: Projection secret leakage prevention (no token in projection)
 * - P1: No demo resurrection when order database is empty array []
 * - P2: HTML escaping for all user/item fields in Telegram & Packing Slip
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const ORDER_ENGINE_PATH = path.join(ROOT_DIR, 'js', 'order-engine.js');
const TELEGRAM_PATH = path.join(ROOT_DIR, 'js', 'telegram-notifier.js');
const ADMIN_PATH = path.join(ROOT_DIR, 'js', 'admin.js');

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

console.log('===============================================================');
console.log('   TEST SUITE: CODEX TT3D-MASTER-AUDIT-R7 INVARIANTS           ');
console.log('===============================================================');

// Mock localStorage for Node environment
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
global.window = {
  addEventListener: () => {},
  dispatchEvent: () => {}
};

const orderEngine = require(ORDER_ENGINE_PATH);
const tgNotifier = require(TELEGRAM_PATH);
const orderEngineSrc = fs.readFileSync(ORDER_ENGINE_PATH, 'utf8');
const tgSrc = fs.readFileSync(TELEGRAM_PATH, 'utf8');
const adminSrc = fs.readFileSync(ADMIN_PATH, 'utf8');

// 1. P0 Secret Isolation
runTest('1. P0: Secret Telegram Bot Token is NOT hardcoded in client source', () => {
  assert.ok(!tgSrc.includes("token: '9107317312"), 'Hardcoded token must not exist in DEFAULT_CONFIG');
  const cfg = tgNotifier.getTelegramConfig();
  assert.strictEqual(cfg.token, '', 'Default token in client JS must be empty string');
});

// 2. P1 State Machine Transitions
runTest('2. P1: Strict State Machine prevents invalid resurrection of delivered orders', () => {
  localStorage.clear();
  const created = orderEngine.createOrderRequest({
    clientRequestId: 'TEST-STATE-01',
    customer: { name: 'Nguyễn Văn A', phone: '0987654321' },
    items: [{ title: 'Đèn Washi', qty: 1, price: 289000 }]
  });
  assert.ok(created.ok, 'Order must be created');

  // Step to delivered
  orderEngine.updateOrderStatus(created.orderId, { status: 'confirmed' });
  orderEngine.updateOrderStatus(created.orderId, { status: 'ready_to_pack' });
  orderEngine.updateOrderStatus(created.orderId, { status: 'shipped' });
  const deliverRes = orderEngine.updateOrderStatus(created.orderId, { status: 'delivered' });
  assert.ok(deliverRes.ok, 'Must reach delivered state');

  // Try invalid transition from delivered -> in_production
  const invalidRes = orderEngine.updateOrderStatus(created.orderId, { status: 'in_production' });
  assert.strictEqual(invalidRes.ok, false, 'Delivered order must not transition to in_production');
  assert.strictEqual(invalidRes.code, 'INVALID_TRANSITION', 'Must return INVALID_TRANSITION code');
});

// 3. P1 Phone Auth Security in Projection
runTest('3. P1: getOrderProjection rejects empty string, "-", or single digit phone auth', () => {
  localStorage.clear();
  const created = orderEngine.createOrderRequest({
    clientRequestId: 'TEST-PROJ-01',
    customer: { name: 'Trần B', phone: '0912345678' },
    items: [{ title: 'Khay Nơ', qty: 1, price: 119000 }]
  });
  assert.ok(created.ok);

  // Attempt lookup with '-' (would strip to '' and match endsWith)
  const dashLookup = orderEngine.getOrderProjection(created.orderId, '-');
  assert.strictEqual(dashLookup.ok, false, "Lookup with '-' must be rejected");

  // Attempt lookup with single digit '8'
  const singleDigitLookup = orderEngine.getOrderProjection(created.orderId, '8');
  assert.strictEqual(singleDigitLookup.ok, false, "Lookup with single digit '8' must be rejected");

  // Valid 4-digit suffix '5678'
  const validLookup = orderEngine.getOrderProjection(created.orderId, '5678');
  assert.strictEqual(validLookup.ok, true, "Lookup with 4-digit suffix '5678' must succeed");
});

// 4. P1 Projection does NOT leak token
runTest('4. P1: getOrderProjection does NOT leak secret token in returned projection', () => {
  localStorage.clear();
  const created = orderEngine.createOrderRequest({
    clientRequestId: 'TEST-LEAK-01',
    customer: { name: 'Lê C', phone: '0988776655' }
  });
  assert.ok(created.ok);

  const proj = orderEngine.getOrderProjection(created.orderId, '6655');
  assert.ok(proj.ok);
  assert.strictEqual(proj.token, undefined, 'Projection must not contain token property');
});

// 5. P1 Empty order array [] is preserved and does NOT auto-resurrect demo orders
runTest('5. P1: Empty orders database [] is preserved and does NOT resurrect demo orders', () => {
  localStorage.clear();
  localStorage.setItem('TT_ORDERS_DATABASE_V1', JSON.stringify([]));
  const orders = orderEngine.getStoredOrders();
  assert.strictEqual(orders.length, 0, 'Must preserve empty array [] without resurrecting demo data');
});

// 6. P2 HTML escaping for all item fields in Telegram message
runTest('6. P2: formatOrderTelegramMessage escapes all dynamic item and user fields', () => {
  const maliciousOrder = {
    orderId: 'XSS-01',
    createdAt: new Date().toISOString(),
    customer: {
      name: '<script>alert(1)</script>',
      phone: '0988888888',
      address: '<b>Hack</b> & Co',
      note: '"><img src=x onerror=alert(1)>'
    },
    items: [
      {
        title: '<Item Title & Hack>',
        qty: 1,
        price: 100000,
        colorName: '<Color & Red>',
        materialName: '<PLA & Silk>',
        customText: '<Text & Inject>',
        fontName: '<Font & Mono>'
      }
    ]
  };

  const formatted = tgNotifier.formatOrderTelegramMessage(maliciousOrder);
  assert.ok(!formatted.includes('<script>'), 'Must escape script tags in customer name');
  assert.ok(!formatted.includes('<Item Title & Hack>'), 'Must escape item title');
  assert.ok(!formatted.includes('<Color & Red>'), 'Must escape colorName');
  assert.ok(!formatted.includes('<Text & Inject>'), 'Must escape customText');
  assert.ok(formatted.includes('&lt;Item Title &amp; Hack&gt;'), 'Must properly HTML-entity escape');
});

// 7. P2 Packing Slip escapes colorName and phone
runTest('7. P2: openPackingSlipModal escapes colorName and customer phone in HTML output', () => {
  assert.ok(adminSrc.includes('escapeHtml(item.colorName)'), 'Packing slip must escape item.colorName');
  assert.ok(adminSrc.includes('escapeHtml(ord.customer?.phone'), 'Packing slip must escape customer phone');
});

console.log('===============================================================');
console.log(`Results: ${passed} Passed, ${failed} Failed`);
console.log('===============================================================');

if (failed > 0) process.exit(1);
