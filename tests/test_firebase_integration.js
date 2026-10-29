/**
 * Test Suite: Firebase & Google Analytics Configuration Verification
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('==========================================================');
console.log('   TEST SUITE: FIREBASE & GOOGLE ANALYTICS INTEGRATION   ');
console.log('==========================================================');

const firebaseJs = fs.readFileSync(path.join(__dirname, '../js/firebase-init.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf8');
const configJs = fs.readFileSync(path.join(__dirname, '../js/config.js'), 'utf8');

let passedCount = 0;
let totalCount = 0;

function test(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

// 1. Firebase Config in firebase-init.js
test('1. Firebase project config matches credentials provided', () => {
  assert(firebaseJs.includes('AIzaSyDq99rkCb_I8WeeG-qc_uhBnfAPep1emls'), 'API key must match');
  assert(firebaseJs.includes('tt3dlabs.firebaseapp.com'), 'AuthDomain must match');
  assert(firebaseJs.includes('tt3dlabs'), 'Project ID must match');
  assert(firebaseJs.includes('G-GWCNJ0W537'), 'Measurement ID must match');
});

// 2. index.html integration
test('2. index.html includes firebase-init.js module', () => {
  assert(indexHtml.includes('js/firebase-init.js'), 'index.html must load firebase-init.js');
  assert(indexHtml.includes('type="module"'), 'index.html must load as ES module');
});

// 3. admin.html integration
test('3. admin.html includes firebase-init.js module', () => {
  assert(adminHtml.includes('js/firebase-init.js'), 'admin.html must load firebase-init.js');
  assert(adminHtml.includes('type="module"'), 'admin.html must load as ES module');
});

// 4. Central config.js integration
test('4. config.js exposes Firebase config in TT_DEFAULT_CONFIG', () => {
  assert(configJs.includes('firebase: {'), 'config.js must define firebase config block');
  assert(configJs.includes('tt3dlabs'), 'config.js must include tt3dlabs project ID');
  assert(configJs.includes('G-GWCNJ0W537'), 'config.js must include G-GWCNJ0W537');
});

// 5. Safe analytics interface
test('5. firebase-init.js provides complete analytics methods and fail-safe queue', () => {
  assert(firebaseJs.includes('pageView'), 'Must provide pageView');
  assert(firebaseJs.includes('viewItem'), 'Must provide viewItem');
  assert(firebaseJs.includes('addToCart'), 'Must provide addToCart');
  assert(firebaseJs.includes('removeFromCart'), 'Must provide removeFromCart');
  assert(firebaseJs.includes('beginCheckout'), 'Must provide beginCheckout');
  assert(firebaseJs.includes('purchase'), 'Must provide purchase');
  assert(firebaseJs.includes('eventQueue'), 'Must queue events prior to SDK readiness');
});

console.log('==========================================================');
console.log(`Results: ${passedCount} / ${totalCount} Passed`);
console.log('==========================================================');

if (passedCount !== totalCount) {
  process.exit(1);
}
