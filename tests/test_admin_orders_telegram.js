/**
 * TEST SUITE: ADMIN ORDER MANAGEMENT, DAILY/MONTHLY/YEARLY SUMMARY & TELEGRAM BOT NOTIFICATIONS
 * Adheres strictly to STRICT TDD & E2E AUTONOMOUS OPERATING RULES (Kun Chen Red-Green-Refactor)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const ADMIN_HTML_PATH = path.join(ROOT_DIR, 'admin.html');
const ADMIN_JS_PATH = path.join(ROOT_DIR, 'js', 'admin.js');
const ORDER_ENGINE_PATH = path.join(ROOT_DIR, 'js', 'order-engine.js');
const CHECKOUT_JS_PATH = path.join(ROOT_DIR, 'js', 'checkout.js');
const TELEGRAM_NOTIFIER_PATH = path.join(ROOT_DIR, 'js', 'telegram-notifier.js');

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
console.log('   TEST SUITE: ADMIN ORDERS, SUMMARIES & TELEGRAM BOT     ');
console.log('==========================================================');

const adminHtml = fs.readFileSync(ADMIN_HTML_PATH, 'utf8');
const adminJs = fs.readFileSync(ADMIN_JS_PATH, 'utf8');
const orderEngineJs = fs.readFileSync(ORDER_ENGINE_PATH, 'utf8');
const checkoutJs = fs.readFileSync(CHECKOUT_JS_PATH, 'utf8');

// 1. STATUS_CONFIG in order-engine.js must support 'handoff_ready' with Vietnamese label
runTest('1. STATUS_CONFIG in order-engine.js supports handoff_ready with clean Vietnamese label', () => {
  assert.ok(
    orderEngineJs.includes('handoff_ready:'),
    "STATUS_CONFIG in js/order-engine.js must define the 'handoff_ready' key"
  );
  assert.ok(
    orderEngineJs.includes('Chờ xưởng xác nhận') || orderEngineJs.includes('Chờ duyệt'),
    "STATUS_CONFIG['handoff_ready'] must have a clear Vietnamese label such as 'Chờ xưởng xác nhận'"
  );
});

// 2. admin.html must contain Order KPI Cards (Revenue, Order Count, In Production, AOV)
runTest('2. admin.html contains Order KPI Cards for dynamic time-frame statistics', () => {
  assert.ok(
    adminHtml.includes('order-kpi-revenue') || adminHtml.includes('orders-stat-revenue'),
    'admin.html must contain an element for filtered order revenue KPI'
  );
  assert.ok(
    adminHtml.includes('order-kpi-count') || adminHtml.includes('orders-stat-count'),
    'admin.html must contain an element for filtered total orders count KPI'
  );
  assert.ok(
    adminHtml.includes('order-kpi-processing') || adminHtml.includes('orders-stat-processing'),
    'admin.html must contain an element for orders in production / processing KPI'
  );
  assert.ok(
    adminHtml.includes('order-kpi-aov') || adminHtml.includes('orders-stat-aov'),
    'admin.html must contain an element for average order value (AOV) KPI'
  );
});

// 3. admin.html must provide Time Filters (All, Today, Yesterday, 7 Days, This Month, This Year) & Search
runTest('3. admin.html has Time Frame Filter buttons, Search Input, and Status Filter', () => {
  assert.ok(
    adminHtml.includes('data-order-time-filter') || adminHtml.includes('order-time-range') || adminHtml.includes('filter-order-time'),
    'admin.html must provide time frame filter buttons (today, yesterday, this month, this year)'
  );
  assert.ok(
    adminHtml.includes('search-orders-input') || adminHtml.includes('order-search-input'),
    'admin.html must have an instant search input for order ID, customer name, phone'
  );
  assert.ok(
    adminHtml.includes('filter-order-status') || adminHtml.includes('order-status-filter'),
    'admin.html must have a status filter dropdown or pill selector'
  );
});

// 4. orders-table in admin.html must have Order Time Column
runTest('4. orders-table header in admin.html contains Order Time column', () => {
  assert.ok(
    adminHtml.includes('Thời gian') || adminHtml.includes('Ngày đặt'),
    'orders-table header must have a column for Order Time / Date'
  );
});

// 5. admin.html contains Telegram Bot Configuration Section / Modal
runTest('5. admin.html contains Telegram Bot configuration inputs and test trigger button', () => {
  assert.ok(
    adminHtml.includes('telegram-bot-token') || adminHtml.includes('tg-bot-token'),
    'admin.html must provide an input for Telegram Bot Token'
  );
  assert.ok(
    adminHtml.includes('telegram-chat-id') || adminHtml.includes('tg-chat-id'),
    'admin.html must provide an input for Telegram Chat ID'
  );
  assert.ok(
    adminHtml.includes('btn-test-telegram') || adminHtml.includes('btn-tg-test'),
    'admin.html must have a button to test Telegram connection'
  );
  assert.ok(
    adminHtml.includes('btn-save-telegram') || adminHtml.includes('btn-tg-save'),
    'admin.html must have a button to save Telegram settings'
  );
});

// 6. js/telegram-notifier.js exists and exports TTTelegram
runTest('6. js/telegram-notifier.js exists with sendMessage, formatOrderMessage, notifyNewOrder', () => {
  assert.ok(fs.existsSync(TELEGRAM_NOTIFIER_PATH), 'js/telegram-notifier.js must exist');
  const tgJs = fs.readFileSync(TELEGRAM_NOTIFIER_PATH, 'utf8');
  assert.ok(
    tgJs.includes('api.telegram.org/bot'),
    'telegram-notifier.js must call api.telegram.org/bot'
  );
  assert.ok(
    tgJs.includes('formatOrderTelegramMessage') || tgJs.includes('formatOrderMessage'),
    'telegram-notifier.js must provide message formatting'
  );
  assert.ok(
    tgJs.includes('notifyNewOrder') || tgJs.includes('sendOrderNotification'),
    'telegram-notifier.js must provide notifyNewOrder method'
  );
});

// 7. js/checkout.js integrates Telegram dispatch when order is placed
runTest('7. js/checkout.js triggers Telegram notification upon order submission', () => {
  assert.ok(
    checkoutJs.includes('TTTelegram') && checkoutJs.includes('notifyNewOrder'),
    'js/checkout.js must dispatch order notification via TTTelegram.notifyNewOrder'
  );
});

// 8. js/admin.js handles order time filtering, daily/monthly summary aggregation, and table rendering
runTest('8. js/admin.js handles order time filtering, KPI calculation, and Telegram operations', () => {
  assert.ok(
    adminJs.includes('filterOrdersByTime') || adminJs.includes('updateOrderSummaryKpi') || adminJs.includes('calculateOrderSummary'),
    'js/admin.js must provide time filtering and KPI calculation for orders'
  );
  assert.ok(
    adminJs.includes('sendTelegramMessage') || adminJs.includes('testTelegram') || adminJs.includes('TTTelegram'),
    'js/admin.js must wire Telegram test and configuration saving'
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
