const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlPath = path.join(__dirname, '../admin.html');
const orig = fs.readFileSync(htmlPath, 'utf8');

try {
  // Mutant: change id="btn-sync-cloud-db" to id="btn-disabled"
  const mutated = orig.replace('id="btn-sync-cloud-db"', 'id="btn-disabled"');
  fs.writeFileSync(htmlPath, mutated, 'utf8');

  try {
    execSync('node tests/test_admin_database_sync.js', { stdio: 'pipe' });
    console.error('MUTATION TEST FAILED: Test passed despite mutant!');
    process.exit(1);
  } catch (err) {
    console.log('MUTATION TEST PASSED: Test caught mutant and correctly reported RED!');
  }
} finally {
  fs.writeFileSync(htmlPath, orig, 'utf8');
}

// Re-verify that restored code is GREEN
execSync('node tests/test_admin_database_sync.js', { stdio: 'inherit' });
console.log('MUTATION VERIFICATION COMPLETE: Restored code is 100% GREEN.');
