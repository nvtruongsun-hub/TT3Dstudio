/**
 * Test Suite: Dual-Track Workshop Fulfillment Pipeline
 * Enforces Argon 4 Strategic Directive: In-Stock Fast Track vs. Print on Demand
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('==========================================================');
console.log('   TEST SUITE: DUAL-TRACK WORKSHOP FULFILLMENT PIPELINE   ');
console.log('==========================================================');

const orderEngineCode = fs.readFileSync(path.join(__dirname, '../js/order-engine.js'), 'utf8');
const adminJsCode = fs.readFileSync(path.join(__dirname, '../js/admin.js'), 'utf8');
const adminHtmlCode = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf8');

// Test 1: STATUS_CONFIG contains ready_to_pack
try {
  assert(
    orderEngineCode.includes('ready_to_pack:'),
    'order-engine.js must define ready_to_pack in STATUS_CONFIG'
  );
  assert(
    orderEngineCode.includes('Chờ đóng gói') || orderEngineCode.includes('Ch\\u00f2 \\u0111\\u00f3ng g\\u00f3i'),
    'ready_to_pack must have readable Vietnamese label "Chờ đóng gói"'
  );
  console.log('  [PASS] 1. order-engine.js defines ready_to_pack in STATUS_CONFIG');
} catch (e) {
  console.error('  [FAIL] 1. ' + e.message);
  process.exit(1);
}

// Test 2: detectOrderTrack runtime logic
try {
  const engine = require('../js/order-engine.js');
  assert(typeof engine.detectOrderTrack === 'function', 'Must export detectOrderTrack function');
  
  const inStockOrder = { items: [{ title: 'Khay Tròn Sẵn Kho', isCustomizable: false }] };
  const customOrder = { items: [{ title: 'Đế Tên Để Bàn', customText: 'Trường & Lan' }] };
  const madeToOrder = { items: [{ title: 'Hộp Đu Quay 360', madeToOrder: true }] };

  assert.strictEqual(engine.detectOrderTrack(inStockOrder), 'in_stock', 'Standard items without custom text must be detected as in_stock');
  assert.strictEqual(engine.detectOrderTrack(customOrder), 'print_on_demand', 'Items with customText must be detected as print_on_demand');
  assert.strictEqual(engine.detectOrderTrack(madeToOrder), 'print_on_demand', 'Items marked madeToOrder must be detected as print_on_demand');

  console.log('  [PASS] 2. detectOrderTrack function implemented and verified at runtime');
} catch (e) {
  console.error('  [FAIL] 2. ' + e.message);
  process.exit(1);
}

// Test 3: getNextStepAction provides contextual 1-click actions
try {
  const engine = require('../js/order-engine.js');
  assert(typeof engine.getNextStepAction === 'function', 'Must export getNextStepAction');

  // In-stock order confirmed -> goes directly to ready_to_pack (Fast Track)
  const inStockAction = engine.getNextStepAction({
    status: 'handoff_ready',
    items: [{ title: 'Khay Sẵn Kho', isCustomizable: false }]
  });
  assert(inStockAction, 'Must return next step action for handoff_ready');
  assert.strictEqual(inStockAction.nextStatus, 'ready_to_pack', 'In-stock order must route directly to ready_to_pack');
  assert.strictEqual(inStockAction.track, 'in_stock', 'Track must be in_stock');

  // Print-on-demand order confirmed -> routes to in_production (Bambu Lab print queue)
  const customAction = engine.getNextStepAction({
    status: 'handoff_ready',
    items: [{ title: 'Biển tên NFC', customText: 'Studio 3D' }]
  });
  assert(customAction, 'Must return next step action for custom order');
  assert.strictEqual(customAction.nextStatus, 'in_production', 'Print-on-demand order must route to in_production');
  assert.strictEqual(customAction.track, 'print_on_demand', 'Track must be print_on_demand');

  // Order in ready_to_pack -> next status is shipped
  const packAction = engine.getNextStepAction({
    status: 'ready_to_pack',
    items: [{ title: 'Khay Sẵn Kho' }]
  });
  assert.strictEqual(packAction.nextStatus, 'shipped', 'Packed order next status must be shipped');

  console.log('  [PASS] 3. Contextual next step action logic verified at runtime');
} catch (e) {
  console.error('  [FAIL] 3. ' + e.message);
  process.exit(1);
}

// Test 4: admin.html contains Pipeline Status Tabs with count badges
try {
  assert(
    adminHtmlCode.includes('pipeline-tab-ready-to-pack') || adminHtmlCode.includes('data-pipeline-status="ready_to_pack"'),
    'admin.html must contain ready_to_pack pipeline tab'
  );
  assert(
    adminHtmlCode.includes('pipeline-tab-print-queue') || adminHtmlCode.includes('data-pipeline-status="print_queue"') || adminHtmlCode.includes('data-pipeline-status="in_production"'),
    'admin.html must contain print_queue pipeline tab'
  );
  console.log('  [PASS] 4. admin.html contains Pipeline Status Tabs (In-Stock & Print Queue)');
} catch (e) {
  console.error('  [FAIL] 4. ' + e.message);
  process.exit(1);
}

// Test 5: Printable Workshop Packing Slip (A5) feature
try {
  assert(
    adminJsCode.includes('printWorkshopPackingSlip') || adminJsCode.includes('openPackingSlipModal'),
    'admin.js must provide printable workshop packing slip generator'
  );
  console.log('  [PASS] 5. Printable workshop packing slip feature implemented');
} catch (e) {
  console.error('  [FAIL] 5. ' + e.message);
  process.exit(1);
}

console.log('==========================================================');
console.log('Results: All tests passed successfully!');
console.log('==========================================================');
