/**
 * TEST SUITE: WORKSHOP 1-CLICK ORDER CONFIRMATION & FULL PIPELINE SYNCHRONIZATION
 * Strict TDD & E2E Autonomous Protocol (Kun Chen Red-Green-Refactor)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const ADMIN_HTML_PATH = path.join(ROOT_DIR, 'admin.html');
const ADMIN_JS_PATH = path.join(ROOT_DIR, 'js', 'admin.js');
const CHECKOUT_JS_PATH = path.join(ROOT_DIR, 'js', 'checkout.js');
const ORDER_ENGINE_PATH = path.join(ROOT_DIR, 'js', 'order-engine.js');

let passCount = 0;
let failCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         Error: ${err.message}`);
    failCount++;
  }
}

console.log('==========================================================');
console.log('   TEST SUITE: WORKSHOP ORDER CONFIRMATION & SYNC PIPELINE');
console.log('==========================================================');

const adminHtml = fs.readFileSync(ADMIN_HTML_PATH, 'utf8');
const adminJs = fs.readFileSync(ADMIN_JS_PATH, 'utf8');
const checkoutJs = fs.readFileSync(CHECKOUT_JS_PATH, 'utf8');
const orderEngineJs = fs.readFileSync(ORDER_ENGINE_PATH, 'utf8');

// 1. admin.js merges both engineOrders AND checkoutOrders without dropping draft orders
runTest('1. admin.js merges both engineOrders and checkoutOrders into orderMap', () => {
  assert.ok(
    adminJs.includes('checkoutOrders.forEach') || adminJs.includes('(checkoutOrders || []).forEach'),
    'admin.js must iterate over checkoutOrders and merge them into orderMap, not use fallback engineOrders || checkoutOrders'
  );
});

// 2. checkout.js exports updateDraftOrderStatus to update TT_DIRECT_ORDER_DRAFTS_V1
runTest('2. checkout.js provides and exports updateDraftOrderStatus method', () => {
  assert.ok(
    checkoutJs.includes('updateDraftOrderStatus') || checkoutJs.includes('updateOrderStatus'),
    'checkout.js must implement an order status update method for TT_DIRECT_ORDER_DRAFTS_V1'
  );
  assert.ok(
    checkoutJs.includes('updateDraftOrderStatus:'),
    'checkout.js must export updateDraftOrderStatus on window.TTCheckout'
  );
});

// 3. order-engine.js updateOrderStatus also updates TT_DIRECT_ORDER_DRAFTS_V1 if present
runTest('3. order-engine.js updateOrderStatus synchronizes with checkout drafts storage', () => {
  assert.ok(
    orderEngineJs.includes('TT_DIRECT_ORDER_DRAFTS_V1') || orderEngineJs.includes('TTCheckout') || orderEngineJs.includes('updateDraftOrderStatus'),
    'order-engine.js updateOrderStatus must cross-sync with checkout drafts'
  );
});

// 4. admin.js provides quick order confirmation action directly in orders table
runTest('4. admin.js implements quick order confirmation directly from orders table row', () => {
  assert.ok(
    adminJs.includes('admin-confirm-order') || adminJs.includes('admin-quick-confirm') || adminJs.includes('confirmOrderQuick'),
    'admin.js must have a direct 1-click order confirmation action for pending orders'
  );
});

// 5. admin.html order detail modal provides explicit Workshop Confirm Order button
runTest('5. admin.html order detail modal contains explicit Workshop Confirm Order action', () => {
  assert.ok(
    adminHtml.includes('btn-detail-confirm-order') || adminHtml.includes('btn-confirm-order-detail'),
    'admin.html order detail modal must contain an explicit Workshop Confirm Order button'
  );
});

// 6. admin.js updates both Local Storage and Cloud Firestore upon confirmation
runTest('6. admin.js synchronizes status update to Cloud Firestore and broadcasts channel event', () => {
  assert.ok(
    adminJs.includes('TTFirestore.updateOrderStatus') || adminJs.includes('TTFirestore.saveOrder'),
    'admin.js must dispatch status update to Cloud Firestore'
  );
  assert.ok(
    adminJs.includes('TT3D_ORDERS_CHANNEL') || adminJs.includes('BroadcastChannel'),
    'admin.js must broadcast status change for customer realtime tracking'
  );
});

console.log('==========================================================');
console.log(`Results: ${passCount} Passed, ${failCount} Failed`);
console.log('==========================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
