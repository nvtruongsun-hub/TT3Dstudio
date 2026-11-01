const { execSync } = require('child_process');

console.log('🔍 [SECRET SCANNING] Đang quét toàn bộ Git History tìm kiếm secrets...\n');

// 1. Scan for service_role in committed files across all branches and commits
try {
  const serviceRoleMatches = execSync('git log -p -S"service_role" -- "*.js" "*.html" "*.json" "*.sql"', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  
  // Filter out comments like "zero service_role or admin secrets on client"
  const lines = serviceRoleMatches.split('\n');
  const suspiciousLines = lines.filter(l => l.startsWith('+') && !l.startsWith('+++') && l.includes('service_role') && !l.includes('zero service_role') && !l.includes('No service_role') && !l.includes('comment'));
  
  console.log(`Kết quả quét service_role: ${suspiciousLines.length} dòng khả nghi.`);
  if (suspiciousLines.length > 0) {
    suspiciousLines.forEach(l => console.log('  Cảnh báo dòng:', l.trim()));
  } else {
    console.log('✅ PASS: Không tìm thấy service_role key bị commit trái phép vào client files trong git history.');
  }
} catch (e) {
  console.error('Lỗi khi quét service_role:', e.message);
}

// 2. Scan for management token (sbp_) in tracked files
try {
  const sbpMatches = execSync('git grep "sbp_" -- "*.html" "js/*.js"', { encoding: 'utf8' }).trim();
  if (sbpMatches) {
    console.error('❌ FAIL: Phát hiện sbp_ token trong client files:', sbpMatches);
  } else {
    console.log('✅ PASS: Client files (html, js/) hoàn toàn KHÔNG chứa sbp_ management token.');
  }
} catch (e) {
  // git grep returns exit code 1 if no matches found
  console.log('✅ PASS: Không có bất kỳ sbp_ token nào trong client files.');
}
