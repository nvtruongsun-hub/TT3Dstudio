/**
 * Verification of Order Management & Telegram Notification Pipeline
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock window & localStorage
const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v)),
  removeItem: (k) => localStorageMap.delete(k)
};
global.window = global;

// Load order-engine and telegram-notifier
require('../js/order-engine.js');
require('../js/telegram-notifier.js');

console.log('Testing Pipeline Components...');

// 1. Verify STATUS_CONFIG handoff_ready
const cfg = window.TTOrderEngine.STATUS_CONFIG.handoff_ready;
assert.ok(cfg, 'handoff_ready must exist in STATUS_CONFIG');
assert.strictEqual(cfg.label, 'Chờ xưởng xác nhận', 'Label must be Chờ xưởng xác nhận');
console.log('1. STATUS_CONFIG handoff_ready: PASS');

// 2. Verify Telegram Message Formatting
const testOrder = {
  orderId: 'TT3D-TEST-999',
  createdAt: new Date().toISOString(),
  channel: 'zalo',
  customer: {
    name: 'Nguyễn Văn Trường',
    phone: '0986888333',
    address: 'Hà Nội',
    note: 'In phôi lụa mịn'
  },
  items: [
    {
      title: 'Hộp đu quay Ferris 360°',
      qty: 1,
      price: 389000,
      colorName: 'Silk Rose Gold',
      materialName: 'Bio-PLA',
      customText: 'Trường & Lan'
    }
  ],
  totals: {
    finalTotal: 389000
  }
};

const tgMsg = window.TTTelegram.formatOrderTelegramMessage(testOrder);
assert.ok(tgMsg.includes('#TT3D-TEST-999'), 'Must contain order code');
assert.ok(tgMsg.includes('Nguyễn Văn Trường'), 'Must contain customer name');
assert.ok(tgMsg.includes('0986888333'), 'Must contain phone number');
assert.ok(tgMsg.includes('389.000₫'), 'Must contain formatted total');
assert.ok(tgMsg.includes('Hộp đu quay Ferris 360°'), 'Must contain item name');
assert.ok(tgMsg.includes('Silk Rose Gold'), 'Must contain item color');
assert.ok(tgMsg.includes('Trường & Lan'), 'Must contain custom engraving text');
console.log('2. Telegram Message Formatting: PASS\nSample Message:\n' + tgMsg);

// 3. Test config saving and loading
window.TTTelegram.saveTelegramConfig({
  token: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
  chatId: '987654321',
  enabled: true
});

const loadedCfg = window.TTTelegram.getTelegramConfig();
assert.strictEqual(loadedCfg.token, '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11');
assert.strictEqual(loadedCfg.chatId, '987654321');
assert.strictEqual(loadedCfg.enabled, true);
console.log('3. Telegram Config Storage: PASS');

console.log('\nAll Pipeline Verifications PASSED Successfully!');
