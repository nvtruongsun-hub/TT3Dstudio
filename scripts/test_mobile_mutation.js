const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== PHASE 4: MOBILE MUTATION TESTING ===');
const indexPath = 'index.html';
const originalHtml = fs.readFileSync(indexPath, 'utf8');

try {
  // Mutant: Inject an emoji into artisan-trust-strip
  const mutatedHtml = originalHtml.replace('IN 3D CHUẨN 0.1MM', '🖨️ IN 3D CHUẨN 0.1MM');
  fs.writeFileSync(indexPath, mutatedHtml, 'utf8');
  console.log('Injected Mutant: Added emoji into artisan-trust-strip');

  let failed = false;
  try {
    execSync('node tests/test_mobile_store_overhaul.js', { stdio: 'pipe' });
  } catch (err) {
    failed = true;
    console.log('[MUTATION DETECTED - RED]: Test immediately failed as expected with output:');
    console.log(err.stdout.toString().split('\n').filter(l => l.includes('[FAIL]')).join('\n'));
  }

  if (!failed) {
    throw new Error('Test did NOT catch the emoji mutation!');
  }
} finally {
  fs.writeFileSync(indexPath, originalHtml, 'utf8');
  console.log('[MUTANT RESTORED]: index.html restored to clean code.');
}

console.log('Re-running test on clean code:');
execSync('node tests/test_mobile_store_overhaul.js', { stdio: 'inherit' });
console.log('Phase 4 Mobile Mutation Test Complete: PASS & SENSITIVE.');
