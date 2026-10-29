const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== PHASE 4: MUTATION TESTING EXECUTION ===');

const productsPath = 'products.json';
const backup = fs.readFileSync(productsPath, 'utf8');

try {
  // Mutant 1: Blank out cleanTitle of product 0
  const products = JSON.parse(backup);
  products[0].cleanTitle = '';
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
  console.log('Injected Mutant: product[0].cleanTitle = ""');

  let testFailedAsExpected = false;
  try {
    execSync('node tests/test_differentiation_lookbook.js', { stdio: 'pipe' });
  } catch (err) {
    testFailedAsExpected = true;
    console.log('[MUTATION VERIFIED - RED]: Test immediately failed as expected with output:');
    console.log(err.stdout.toString().split('\n').filter(l => l.includes('[FAIL]')).join('\n'));
  }

  if (!testFailedAsExpected) {
    throw new Error('Test suite did NOT catch the mutation! Test is too loose.');
  }

} finally {
  // Restore original code/data
  fs.writeFileSync(productsPath, backup, 'utf8');
  console.log('[MUTANT RESTORED]: Reverted products.json to pristine state.');
}

// Re-run test to confirm GREEN
console.log('Running test on restored data:');
execSync('node tests/test_differentiation_lookbook.js', { stdio: 'inherit' });
console.log('Phase 4 Mutation Testing Complete: PASS & SENSITIVE.');
