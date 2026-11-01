/**
 * T&T 3D STUDIO - BUILD & ENVIRONMENT SECURITY VALIDATOR
 * =========================================================================
 * Bắt buộc chạy trước khi build, test hoặc deploy.
 * Kiểm tra:
 * 1. Chặn đứng query param ?env=staging trên frontend production.
 * 2. Cấu hình cố định build-time giữa Production và Staging.
 * 3. Tuyệt đối không rò rỉ secret key (service_role, sbp_, private key) ở client.
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const STAGING_DIST_DIR = path.join(ROOT_DIR, 'dist_staging_deploy');

const PROD_REF = 'nbsumfhfxohawiuxrwqj';
const STAGING_REF = 'vtxzlgkvmvoushluthme';

const SECRET_PATTERNS = [
  /service_role/i,
  /sbp_[a-zA-Z0-9_-]{20,}/,
  /-----BEGIN PRIVATE KEY-----/,
  /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]*service_role/
];

function scanDirectoryForSecrets(dirPath, allowedFiles = []) {
  const violations = [];
  function scan(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (allowedFiles.includes(entry.name)) continue;

      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git') {
          scan(full);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.html') || entry.name.endsWith('.json'))) {
        const content = fs.readFileSync(full, 'utf8');
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(content)) {
            violations.push({ file: path.relative(ROOT_DIR, full), pattern: pattern.toString() });
          }
        }
      }
    }
  }
  scan(dirPath);
  return violations;
}

function runValidation() {
  console.log('========================================================================');
  console.log('   KIỂM ĐỊNH BẢO VỆ CẤU HÌNH MÔI TRƯỜNG & TOÀN VẸN FRONTEND');
  console.log('========================================================================\n');

  // 1. KIỂM TRA ROOT PRODUCTION CONFIG
  console.log('[1/5] Kiểm tra cấu hình Root js/env-config.js...');
  const rootEnvPath = path.join(ROOT_DIR, 'js', 'env-config.js');
  assert(fs.existsSync(rootEnvPath), 'Root js/env-config.js phải tồn tại');
  const rootEnvContent = fs.readFileSync(rootEnvPath, 'utf8');
  assert(rootEnvContent.includes(PROD_REF), `Root env-config.js bắt buộc phải trỏ tới PRODUCTION (${PROD_REF})`);
  assert(!rootEnvContent.includes(STAGING_REF), `Root env-config.js không được chứa URL của STAGING (${STAGING_REF})`);
  console.log('✅ PASS: Root env-config.js đã được cấu hình cố định chuẩn xác về Production.');

  // 2. KIỂM TRA CHẶN CHUYỂN MÔI TRƯỜNG BẰNG QUERY STRING TRONG SUPABASE CLIENT
  console.log('\n[2/5] Kiểm tra logic phân giải môi trường trong js/supabase-client.js...');
  const supabaseClientPath = path.join(ROOT_DIR, 'js', 'supabase-client.js');
  const clientContent = fs.readFileSync(supabaseClientPath, 'utf8');
  assert(!clientContent.includes("params.get('env') === 'staging'"), 'js/supabase-client.js tuyệt đối KHÔNG được chuyển môi trường theo params.get("env")');
  
  // Chạy giả lập trong VM: Thử giả lập window.location.search = "?env=staging"
  const sandbox = {
    window: {
      location: { search: '?env=staging', hostname: 'nvtruongsun-hub.github.io' },
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      console: { log: () => {}, warn: () => {}, error: () => {} }
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(rootEnvContent, sandbox);
  vm.runInContext(clientContent, sandbox);

  assert.strictEqual(sandbox.window.TT_ENV.SUPABASE_URL, `https://${PROD_REF}.supabase.co`, 'URL phải giữ nguyên Production');
  assert.strictEqual(sandbox.window.TTSupabase.isProduction(), true, 'Client phải ở trạng thái Production kể cả khi cố chèn ?env=staging');
  console.log('✅ PASS: Giả lập URL có "?env=staging" hoàn toàn không thể bẻ hướng backend của Production!');

  // 3. KIỂM TRA BẢN BUILD STAGING ĐỘC LẬP (dist_staging_deploy)
  console.log('\n[3/5] Kiểm tra bản deploy Staging độc lập (dist_staging_deploy)...');
  assert(fs.existsSync(STAGING_DIST_DIR), 'Thư mục dist_staging_deploy phải tồn tại (hãy chạy scripts/build_environments.js trước)');
  const stagingEnvPath = path.join(STAGING_DIST_DIR, 'js', 'env-config.js');
  const stagingEnvContent = fs.readFileSync(stagingEnvPath, 'utf8');
  assert(stagingEnvContent.includes(STAGING_REF), `Staging env-config.js phải trỏ tới STAGING (${STAGING_REF})`);
  assert(!stagingEnvContent.includes(PROD_REF), `Staging env-config.js không được phép chứa URL của PRODUCTION (${PROD_REF})`);

  const stagingIndexHtml = fs.readFileSync(path.join(STAGING_DIST_DIR, 'index.html'), 'utf8');
  assert(stagingIndexHtml.includes('tt3d-staging-banner'), 'index.html trên Staging phải có banner cảnh báo môi trường độc lập');
  console.log('✅ PASS: dist_staging_deploy đã được cấu hình cố định độc lập về Staging và có watermark banner rõ ràng.');

  // 4. KIỂM TRA RÒ RỈ SECRET TRONG CLIENT FILES
  console.log('\n[4/5] Quét mã bí mật (service_role, sbp_, private keys) trong các file client...');
  const clientFilesRoot = path.join(ROOT_DIR, 'js');
  const violationsRoot = scanDirectoryForSecrets(clientFilesRoot);
  assert.strictEqual(violationsRoot.length, 0, `Phát hiện secret trong js/: ${JSON.stringify(violationsRoot)}`);

  const violationsDist = scanDirectoryForSecrets(STAGING_DIST_DIR);
  assert.strictEqual(violationsDist.length, 0, `Phát hiện secret trong dist_staging_deploy/: ${JSON.stringify(violationsDist)}`);
  console.log('✅ PASS: Không tìm thấy bất kỳ secret key hay service_role nào trong toàn bộ tài nguyên client!');

  // 5. KIỂM TRA THẺ SCRIPT TRONG CẢ 2 TRANG CHÍNH
  console.log('\n[5/5] Kiểm tra thứ tự nạp thẻ script env-config.js trước supabase-client.js...');
  const rootIndex = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const rootAdmin = fs.readFileSync(path.join(ROOT_DIR, 'admin.html'), 'utf8');
  assert(rootIndex.indexOf('env-config.js') < rootIndex.indexOf('supabase-client.js'), 'env-config.js phải được nạp trước supabase-client.js trong index.html');
  assert(rootAdmin.indexOf('env-config.js') < rootAdmin.indexOf('supabase-client.js'), 'env-config.js phải được nạp trước supabase-client.js trong admin.html');
  console.log('✅ PASS: Thứ tự script tags trên index.html và admin.html hoàn toàn chuẩn xác.');

  console.log('\n🎉 [PHASE 1 VERIFIED PASS] TÁCH CẤU HÌNH FRONTEND HOÀN THÀNH 100% VỚI ĐỦ BẰNG CHỨNG KIỂM TRA ĐỘC LẬP!');
}

if (require.main === module) {
  try {
    runValidation();
  } catch (err) {
    console.error('\n❌ VALIDATION THẤT BẠI:', err.message);
    process.exit(1);
  }
}

module.exports = { runValidation };
