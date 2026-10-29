/**
 * Test Suite: Anti-Vibecoding / Refined Dark SaaS UI Verification
 * Tests admin.html, css/admin.css, and js/admin.js against strict design specifications.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('==========================================================');
console.log('   TEST SUITE: REFINED DARK SAAS UI (ANTI-VIBECODING)   ');
console.log('==========================================================');

const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf8');
const adminCss = fs.readFileSync(path.join(__dirname, '../css/admin.css'), 'utf8');
const adminJs = fs.readFileSync(path.join(__dirname, '../js/admin.js'), 'utf8');

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

// 1. Emoji check in admin.html
test('1. Zero AI emojis in admin.html headings, sidebar, and KPI cards', () => {
  const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;
  const match = adminHtml.match(emojiRegex);
  assert.strictEqual(match, null, `Found forbidden emoji: ${match ? match[0] : ''}`);
});

// 2. Color Palette in css/admin.css
test('2. Strict Neutral Matte Dark Palette (#0C0C0E, #111114, #16161A, hairline borders)', () => {
  assert(adminCss.includes('#0C0C0E'), 'admin.css must define base background #0C0C0E');
  assert(adminCss.includes('#111114'), 'admin.css must define sidebar background #111114');
  assert(adminCss.includes('#16161A'), 'admin.css must define surface background #16161A');
  assert(adminCss.includes('rgba(255, 255, 255, 0.07)') || adminCss.includes('rgba(255,255,255,0.07)'), 'admin.css must define subtle hairline border');
});

// 3. Grid & Spacing Constraints (16px sidebar padding, 28px content gap, 24px card padding)
test('3. Standardized Spacing: 16px sidebar padding, 28px content spacing, 24px card padding', () => {
  assert(adminHtml.includes('px-4') || adminHtml.includes('p-4'), 'Sidebar must have 16px padding');
  assert(adminHtml.includes('space-y-[28px]'), 'Main content container must have 28px vertical spacing gap');
  assert(adminCss.includes('padding: 24px;'), '.admin-card in admin.css must have strict 24px inner padding');
});

// 4. Tabular numbers formatting
test('4. Enforce font-variant-numeric: tabular-nums for numeric telemetry and badges', () => {
  assert(adminCss.includes('font-variant-numeric: tabular-nums;'), 'admin.css must enforce tabular-nums');
  assert(adminHtml.includes('tabular-nums'), 'admin.html elements must include tabular-nums');
  assert(adminHtml.includes('sidebar-tab-num'), 'admin.html sidebar must use sidebar-tab-num for muted counter');
});

// 5. Multi-Series Smooth Spline Chart Infrastructure
test('5. Multi-series Smooth Spline Chart container and Bezier spline generator', () => {
  assert(adminHtml.includes('workshop-spline-card'), 'admin.html must contain workshop-spline-card');
  assert(adminHtml.includes('spline-chart-svg'), 'admin.html must contain spline-chart-svg');
  assert(adminHtml.includes('spline-chart-paths'), 'admin.html must contain spline-chart-paths');
  assert(adminHtml.includes('spline-crosshair'), 'admin.html must contain spline-crosshair');
  assert(adminHtml.includes('spline-tooltip'), 'admin.html must contain spline-tooltip');
  assert(adminJs.includes('renderWorkshopSplineChart'), 'admin.js must implement renderWorkshopSplineChart');
  assert(adminJs.includes('catmullRomToBezier'), 'admin.js must implement Catmull-Rom to Cubic Bezier curve math');
});

// 6. Category Syncing with Sidebar
test('6. Spline chart legends and sidebar categories are color-synchronized', () => {
  assert(adminHtml.includes('#FF5C00'), 'Category NFC orange synchronized');
  assert(adminHtml.includes('#F59E0B'), 'Category Ambient amber synchronized');
  assert(adminHtml.includes('#F43F5E'), 'Category Vanity rose synchronized');
  assert(adminHtml.includes('#10B981'), 'Category Fidget emerald synchronized');
  assert(adminHtml.includes('#38BDF8'), 'Category Desk sky blue synchronized');
  assert(adminHtml.includes('legend-count-nfc'), 'Legend NFC count element exists');
  assert(adminHtml.includes('legend-count-ambient'), 'Legend Ambient count element exists');
});

// 7. Contextual Titles & No Shouting or Emotional Greetings
test('7. Sentence case contextual titles without "Welcome back" or emotional greetings', () => {
  assert(!adminHtml.includes('Welcome back'), 'Must not have emotional "Welcome back"');
  assert(!adminHtml.includes('WELCOME BACK'), 'Must not have "WELCOME BACK"');
  assert(adminHtml.includes('Tổng quan vận hành xưởng'), 'Must have practical contextual title');
});

// 8. Matte dark toast notifications without exclamation marks
test('8. Toast notifications styled in matte #16161A with clean sentence case and 6px dot', () => {
  assert(adminJs.includes('status-dot-6'), 'Toast notification in admin.js uses status-dot-6');
  assert(adminJs.includes('#16161A'), 'Toast notification uses matte dark #16161A');
  assert(adminJs.includes('.replace(/!+/g'), 'Toast notification replaces exclamation marks');
});

console.log('==========================================================');
console.log(`Results: ${passedCount} / ${totalCount} Passed`);
console.log('==========================================================');

if (passedCount !== totalCount) {
  process.exit(1);
}
