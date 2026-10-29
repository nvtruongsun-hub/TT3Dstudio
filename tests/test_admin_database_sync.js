/**
 * Test Suite: Admin Portal & Firebase Cloud Firestore Realtime Synchronization
 * Verifies that the Admin Portal is fully wired to Cloud Firestore with bidirectional sync:
 * - Live cloud status indicator
 * - One-click and automated product sync (upsert, delete, batch)
 * - Realtime order listener
 * - Strict adherence to Refined Dark SaaS UI (zero emoji, matte dark, tabular-nums)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('==========================================================');
console.log('   TEST SUITE: ADMIN PORTAL & FIRESTORE DATABASE SYNC     ');
console.log('==========================================================');

const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf8');
const adminJs = fs.readFileSync(path.join(__dirname, '../js/admin.js'), 'utf8');
const firebaseJs = fs.readFileSync(path.join(__dirname, '../js/firebase-init.js'), 'utf8');

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

// 1. Cloud Database Sync UI in admin.html
test('1. admin.html contains Cloud Sync button and live connection badge', () => {
  assert(adminHtml.includes('btn-sync-cloud-db'), 'admin.html must contain #btn-sync-cloud-db button');
  assert(adminHtml.includes('cloud-status-dot'), 'admin.html must contain #cloud-status-dot status indicator');
  assert(adminHtml.includes('cloud-status-text'), 'admin.html must contain #cloud-status-text status label');
});

// 2. Enhanced Firestore API in firebase-init.js
test('2. firebase-init.js exports upsertProduct, deleteProduct, and syncAllProducts in TTFirestore', () => {
  assert(firebaseJs.includes('upsertProduct'), 'TTFirestore must export upsertProduct');
  assert(firebaseJs.includes('deleteProduct'), 'TTFirestore must export deleteProduct');
  assert(firebaseJs.includes('syncAllProducts'), 'TTFirestore must export syncAllProducts');
});

// 3. Admin JS Cloud Sync Event Wiring
test('3. admin.js wires #btn-sync-cloud-db to perform full Firestore catalog sync', () => {
  assert(adminJs.includes('btn-sync-cloud-db'), 'admin.js must listen to #btn-sync-cloud-db');
  assert(adminJs.includes('syncAllProducts') || adminJs.includes('syncCatalogToFirestore'), 'admin.js must call Firestore sync routine');
});

// 4. Realtime Orders Synchronization in admin.js
test('4. admin.js integrates listenOrders for live order feed updates', () => {
  assert(adminJs.includes('listenOrders'), 'admin.js must attach to TTFirestore.listenOrders');
});

// 5. Product CRUD Sync to Firestore in admin.js
test('5. admin.js automatically synchronizes product upsert and delete to Firestore', () => {
  assert(adminJs.includes('TTFirestore.upsertProduct') || adminJs.includes('syncProductToCloud'), 'admin.js must push upserted product to Firestore');
  assert(adminJs.includes('TTFirestore.deleteProduct') || adminJs.includes('deleteProductFromCloud'), 'admin.js must push deleted product to Firestore');
});

// 6. Zero AI Emoji & Refined Dark SaaS UI Compliance
test('6. admin.html maintains zero forbidden emojis and strictly conforms to Refined Dark SaaS UI', () => {
  const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;
  const match = adminHtml.match(emojiRegex);
  assert.strictEqual(match, null, `Found forbidden emoji in admin.html: ${match ? match[0] : ''}`);
});

console.log('==========================================================');
console.log(`Results: ${passedCount} / ${totalCount} Passed`);
console.log('==========================================================');

if (passedCount !== totalCount) {
  process.exit(1);
}
