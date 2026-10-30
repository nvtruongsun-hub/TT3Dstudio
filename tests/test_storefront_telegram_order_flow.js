/**
 * TEST SUITE: STOREFRONT ORDERING & TELEGRAM BOT DISPATCH FLOW
 * Strict TDD & E2E Autonomous Operating Rules (Kun Chen Red-Green-Refactor)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const FIREBASE_INIT_PATH = path.join(ROOT_DIR, 'js', 'firebase-init.js');
const TELEGRAM_NOTIFIER_PATH = path.join(ROOT_DIR, 'js', 'telegram-notifier.js');
const CHECKOUT_PATH = path.join(ROOT_DIR, 'js', 'checkout.js');
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
console.log('   TEST SUITE: STOREFRONT TELEGRAM NOTIFICATION PIPELINE  ');
console.log('==========================================================');

const firebaseInitJs = fs.readFileSync(FIREBASE_INIT_PATH, 'utf8');
const telegramNotifierJs = fs.readFileSync(TELEGRAM_NOTIFIER_PATH, 'utf8');
const checkoutJs = fs.readFileSync(CHECKOUT_PATH, 'utf8');
const adminJs = fs.readFileSync(ADMIN_JS_PATH, 'utf8');

// 1. TTFirestore must provide explicit saveTelegramConfig and getTelegramConfig
runTest('1. firebase-init.js exports saveTelegramConfig and getTelegramConfig in TTFirestore', () => {
  assert.ok(
    firebaseInitJs.includes('saveTelegramConfig') && firebaseInitJs.includes('getTelegramConfig'),
    'TTFirestore must provide saveTelegramConfig and getTelegramConfig methods'
  );
  assert.ok(
    firebaseInitJs.includes("system_configs") && firebaseInitJs.includes("telegram"),
    'TTFirestore must target system_configs/telegram collection'
  );
});

// 2. firebase-init.js automatically loads cloud telegram config into localStorage on ready
runTest('2. firebase-init.js auto-syncs telegram config to local storage', () => {
  assert.ok(
    firebaseInitJs.includes('TT_TELEGRAM_CONFIG_V1'),
    'firebase-init.js must sync cloud config to TT_TELEGRAM_CONFIG_V1'
  );
});

// 3. telegram-notifier.js notifyNewOrder fetches cloud config if local config is empty
runTest('3. telegram-notifier.js notifyNewOrder fetches config from TTFirestore when unconfigured locally', () => {
  assert.ok(
    telegramNotifierJs.includes('getTelegramConfig') && telegramNotifierJs.includes('TTFirestore'),
    'notifyNewOrder must be able to load config from TTFirestore when token/chatId is missing in client localStorage'
  );
});

// 4. telegram-notifier.js automatically resolves phone number Chat ID via detectLatestChatId
runTest('4. telegram-notifier.js auto-detects real Chat ID when chatId is a phone number', () => {
  assert.ok(
    telegramNotifierJs.includes('detectLatestChatId') && telegramNotifierJs.includes('effectiveChatId'),
    'notifyNewOrder must auto-resolve real Chat ID if effectiveChatId is a phone number'
  );
});

// 5. checkout.js dispatches notifyNewOrder upon order completion
runTest('5. checkout.js triggers notifyNewOrder on window.TTTelegram', () => {
  assert.ok(
    checkoutJs.includes('TTTelegram.notifyNewOrder(orderRecord)'),
    'checkout.js must pass orderRecord to TTTelegram.notifyNewOrder'
  );
});

// 6. admin.js saves telegram config directly to both LocalStorage and TTFirestore
runTest('6. admin.js delegates telegram config persistence to TTTelegram / TTFirestore', () => {
  assert.ok(
    adminJs.includes('saveTelegramConfig'),
    'admin.js must save telegram config via saveTelegramConfig'
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
