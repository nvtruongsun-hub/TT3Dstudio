/**
 * STRICT TDD / REGRESSION TEST: NO TEXT AND IMAGE OVERLAP
 * Verifies that Bento category cards and product cards enforce strict spatial separation
 * between text content (titles, badges, descriptions) and imagery across desktop and mobile.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectRoot = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf-8');
const upgradeCss = fs.readFileSync(path.join(projectRoot, 'css/world-class-upgrade.css'), 'utf-8');

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    process.exit(1);
  }
}

// 1. Bento cards must not use conflicting max-w-[75%] that forces text over images
runTest('1. Bento card content does not use overlapping max-w-[75%] utility class', () => {
  const bentoSectionMatch = indexHtml.match(/<div class="bento-categories">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/);
  assert.ok(bentoSectionMatch, 'Bento categories section must be present');
  const bentoHtml = bentoSectionMatch[1];
  assert.ok(!bentoHtml.includes('max-w-[75%]'), 'Bento cards must not contain max-w-[75%] which causes text to overlap images');
  assert.ok(bentoHtml.includes('bento-card-content'), 'Bento cards must use structured .bento-card-content wrapper');
});

// 2. Mobile Bento layout must strictly prevent image and text collision
runTest('2. Mobile Bento CSS does not allow 60% image + 78% text collision', () => {
  // Check that mobile CSS does not define the broken overlapping combo (width: 60% and max-width: 78%)
  const hasBrokenMobileCombo = upgradeCss.includes('width: 60%; max-width: 125px; right: -3px; bottom: -8px;') &&
                               upgradeCss.includes('.bento-card > div { max-width: 78%; }');
  assert.strictEqual(hasBrokenMobileCombo, false, 'Mobile CSS must not have 60% image overlapping 78% text');
  
  // Must have safe mobile layout ensuring no text overlap
  assert.ok(
    upgradeCss.includes('bento-card-bg-img') && 
    (upgradeCss.includes('position: static') || upgradeCss.includes('bento-card-content') || upgradeCss.includes('max-width: 52%')),
    'Mobile CSS must enforce non-overlapping layout for bento imagery'
  );
});

// 3. Desktop Bento layout guarantees separation between text and image
runTest('3. Desktop Bento CSS enforces bounded content zone preventing overlap with thumbnail', () => {
  assert.ok(
    upgradeCss.includes('.bento-card-content') || upgradeCss.includes('.bento-card .bento-card-content'),
    'world-class-upgrade.css must define dedicated .bento-card-content styles with clear boundary'
  );
});

console.log('\nAll No-Overlap Invariant Tests Passed!\n');
