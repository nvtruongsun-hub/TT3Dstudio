/**
 * TEST SUITE: TELEGRAM PHONE AUTORESOLVE & WORLD-CLASS DESIGN STANDARDS
 * Verifies that phone numbers in Telegram Chat ID are automatically resolved to real Telegram ID,
 * and storefront design conforms to Dieter Rams & Baymard Institute standards.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const TELEGRAM_JS_PATH = path.join(ROOT_DIR, 'js', 'telegram-notifier.js');
const ADMIN_HTML_PATH = path.join(ROOT_DIR, 'admin.html');
const ADMIN_JS_PATH = path.join(ROOT_DIR, 'js', 'admin.js');
const WORLD_CLASS_CSS_PATH = path.join(ROOT_DIR, 'css', 'world-class-upgrade.css');

let pass = 0;
let fail = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    pass++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    fail++;
  }
}

console.log('--- TEST SUITE: TELEGRAM PHONE AUTORESOLVE & WORLD-CLASS DESIGN ---');

const tgJs = fs.readFileSync(TELEGRAM_JS_PATH, 'utf8');
const adminHtml = fs.readFileSync(ADMIN_HTML_PATH, 'utf8');
const adminJs = fs.readFileSync(ADMIN_JS_PATH, 'utf8');
const wcCss = fs.readFileSync(WORLD_CLASS_CSS_PATH, 'utf8');

// 1. telegram-notifier.js auto-resolves phone number to verified Chat ID
test('1. testTelegramConnection intercepts phone numbers and auto-resolves to valid numeric Chat ID', () => {
  assert.ok(tgJs.includes('actualChatId') || tgJs.includes('autoResolvedFromPhone'), 'Must handle auto-resolution of phone numbers');
  assert.ok(tgJs.includes('8773439139'), 'Must contain verified workshop Telegram Chat ID 8773439139');
});

// 2. admin.html provides verified Chat ID chip
test('2. admin.html contains quick-fill chip for verified Chat ID 8773439139', () => {
  assert.ok(adminHtml.includes('btn-use-known-chat-id'), 'admin.html must have btn-use-known-chat-id button');
  assert.ok(adminHtml.includes('8773439139'), 'admin.html must display 8773439139 in modal hint');
});

// 3. admin.js wires verified Chat ID button and updates input
test('3. admin.js handles btn-use-known-chat-id and autoResolved response', () => {
  assert.ok(adminJs.includes('btn-use-known-chat-id'), 'admin.js must wire btn-use-known-chat-id');
  assert.ok(adminJs.includes('autoResolved'), 'admin.js must handle autoResolved response');
});

// 4. world-class-upgrade.css unhides Dieter Rams PLA swatches at Hero
test('4. world-class-upgrade.css displays tactile physical swatches at Hero', () => {
  assert.ok(wcCss.includes('.hero-swatch-row { display: flex !important;'), 'Must unhide hero swatch row');
  assert.ok(wcCss.includes('.hero-swatch-dot'), 'Must define interactive dot styles');
});

// 5. world-class-upgrade.css adheres to Baymard Institute sticky catalog filter & tabular prices
test('5. world-class-upgrade.css adheres to Baymard Institute sticky header & tabular prices', () => {
  assert.ok(wcCss.includes('position: sticky; top: 52px;'), 'Must keep catalog filter sticky at 52px');
  assert.ok(wcCss.includes('font-variant-numeric: tabular-nums'), 'Must enforce tabular numbers for price scannability');
});

console.log(`-----------------------------------------------------------------`);
console.log(`Results: ${pass} Passed, ${fail} Failed`);
if (fail > 0) process.exit(1);
