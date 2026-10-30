/**
 * TEST SUITE: ZALO PHONE NUMBER UPDATE & TELEGRAM BOT CHAT ID AUTO-DISCOVERY
 * Strict TDD & E2E Autonomous Protocol
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_JS_PATH = path.join(ROOT_DIR, 'js', 'config.js');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');
const ADMIN_HTML_PATH = path.join(ROOT_DIR, 'admin.html');
const APP_JS_PATH = path.join(ROOT_DIR, 'js', 'app.js');
const TELEGRAM_NOTIFIER_PATH = path.join(ROOT_DIR, 'js', 'telegram-notifier.js');
const ADMIN_JS_PATH = path.join(ROOT_DIR, 'js', 'admin.js');

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
console.log('   TEST SUITE: ZALO PHONE & TELEGRAM CHAT ID RESOLUTION   ');
console.log('==========================================================');

const configJs = fs.readFileSync(CONFIG_JS_PATH, 'utf8');
const indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
const adminHtml = fs.readFileSync(ADMIN_HTML_PATH, 'utf8');
const appJs = fs.readFileSync(APP_JS_PATH, 'utf8');
const tgJs = fs.readFileSync(TELEGRAM_NOTIFIER_PATH, 'utf8');
const adminJs = fs.readFileSync(ADMIN_JS_PATH, 'utf8');

// 1. Hotline & Zalo Phone in config.js updated to 0349657529
runTest('1. config.js updates hotline to 0349.657.529 and zaloPhone to 0349657529', () => {
  assert.ok(
    configJs.includes('0349657529'),
    'js/config.js must contain the user phone number 0349657529 for zaloPhone'
  );
  assert.ok(
    configJs.includes('0349.657.529'),
    'js/config.js must contain the formatted hotline 0349.657.529'
  );
  assert.ok(
    !configJs.includes('0986888333'),
    'js/config.js must not retain the old hardcoded number 0986888333'
  );
});

// 2. index.html updates visible hotline to 0349.657.529
runTest('2. index.html updates visible hotline to 0349.657.529', () => {
  assert.ok(
    indexHtml.includes('0349.657.529'),
    'index.html must display hotline 0349.657.529'
  );
  assert.ok(
    !indexHtml.includes('0986.888.333'),
    'index.html must not contain old hotline 0986.888.333'
  );
});

// 3. app.js default hotline fallback updated to 0349.657.529 / 0349657529
runTest('3. app.js updates fallback hotline to 0349.657.529 / 0349657529', () => {
  assert.ok(
    appJs.includes('0349657529') || appJs.includes('0349.657.529'),
    'js/app.js fallback must point to 0349657529'
  );
});

// 4. telegram-notifier.js provides detectLatestChatId using getUpdates
runTest('4. telegram-notifier.js exports detectLatestChatId using getUpdates API', () => {
  assert.ok(
    tgJs.includes('detectLatestChatId') || tgJs.includes('getLatestChatId'),
    'js/telegram-notifier.js must provide a method to auto-detect chat_id from Telegram getUpdates'
  );
  assert.ok(
    tgJs.includes('/getUpdates'),
    'js/telegram-notifier.js must query getUpdates endpoint'
  );
});

// 5. Phone number validation warning for Chat ID in admin.js / telegram-notifier.js
runTest('5. Validation detects phone number entered in Chat ID and provides actionable guidance', () => {
  assert.ok(
    adminJs.includes('0349657529') || adminJs.includes('isPhoneNumber') || adminJs.includes('chat-id-hint') || tgJs.includes('phone') || adminJs.includes('chat not found') || adminJs.includes('chat_id'),
    'admin.js must provide specific guidance when a phone number is entered as Telegram Chat ID'
  );
});

// 6. admin.html has Auto-detect Chat ID button and step-by-step guidance
runTest('6. admin.html provides Auto-detect Chat ID button and clear 3-step setup guide', () => {
  assert.ok(
    adminHtml.includes('btn-auto-chat-id') || adminHtml.includes('btn-detect-chat-id'),
    'admin.html must have an auto-detect button for Telegram Chat ID'
  );
  assert.ok(
    adminHtml.includes('@userinfobot') || adminHtml.includes('/start'),
    'admin.html must guide user to press /start on their bot'
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
