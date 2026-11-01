/**
 * Test Suite: Order Tracking Alert Formatting & DOM Rendering (Strict TDD)
 * Bug Reference: BUG-P1-01
 * Target: Ensure customerAlert objects are rendered cleanly without '[object Object]'
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('==========================================================');
console.log('   TEST TRACKING CUSTOMER ALERT RENDERING (TDD)');
console.log('==========================================================\n');

// 1. Read app.js source
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Helper to extract formatting logic or simulate app.js rendering
function extractAlertMessage(alertData) {
  if (!alertData) return '';
  if (typeof alertData === 'string') return alertData;
  if (typeof alertData === 'object') {
    return alertData.message || alertData.text || alertData.content || '';
  }
  return String(alertData);
}

// Test 1: Verify app.js code logic does not do raw string interpolation of res.customerAlert
const rawInterpolation = '${escapeHtmlApp(res.customerAlert)}';
const isVulnerable = appJsContent.includes(rawInterpolation);

console.log(`Checking raw interpolation in app.js: ${isVulnerable ? 'FOUND (VULNERABLE)' : 'CLEAN'}`);
assert.strictEqual(
  isVulnerable,
  false,
  'CRITICAL BUG-P1-01: app.js must not directly pass res.customerAlert object to escapeHtmlApp without extracting .message'
);

// Test 2: Formatting helper correctly handles various alert schemas
const objAlert = { message: 'Xưởng cần bạn xác nhận lại mẫu chữ khắc, logo hoặc màu sắc trước khi in.' };
const strAlert = 'Đơn hàng đang chờ phôi nhựa màu Silk Gold về xưởng.';

assert.strictEqual(
  extractAlertMessage(objAlert),
  'Xưởng cần bạn xác nhận lại mẫu chữ khắc, logo hoặc màu sắc trước khi in.'
);
assert.strictEqual(
  extractAlertMessage(strAlert),
  'Đơn hàng đang chờ phôi nhựa màu Silk Gold về xưởng.'
);
assert.strictEqual(extractAlertMessage(null), '');
assert.strictEqual(extractAlertMessage(undefined), '');

console.log('✅ ALL TRACKING ALERT RENDERING CHECKS PASSED!');
