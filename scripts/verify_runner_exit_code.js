const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'tests', 'test_audit_regressions.js');
const tempFile = path.join(__dirname, '..', 'tests', 'temp_verify_runner.js');

const code = fs.readFileSync(target, 'utf8');
const failingCode = code.replace("passed++;", "throw new Error('Forced failure for exit-code test');");

fs.writeFileSync(tempFile, failingCode, 'utf8');
try {
  execSync(`node "${tempFile}"`, { stdio: 'pipe' });
  console.log('FAIL: Runner returned exit 0 despite failures!');
  process.exit(1);
} catch (err) {
  if (err.status !== 0) {
    console.log(`PASS: Runner exited with non-zero exit code (${err.status}) on test failure.`);
  } else {
    console.log('FAIL: err.status is 0');
    process.exit(1);
  }
} finally {
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }
}
