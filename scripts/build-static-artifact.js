#!/usr/bin/env node
/**
 * T&T 3D Labs - Static Artifact Builder (Codex Directive TT3D-ARCH-20261021-R5)
 * Đóng gói bản phát hành Client-Side Single Page Application vào thư mục dist/
 * Sử dụng Allowlist nghiêm ngặt, loại bỏ hoàn toàn các file nội bộ/test/source không liên quan.
 * Tự động biên dịch Tailwind CSS tĩnh và tạo manifest SHA-256 cho từng file.
 * Cơ chế Giao dịch (Transactional Staging & Promotion):
 * - Preflight bắt buộc toàn bộ runtime entrypoints (20 tệp cốt lõi).
 * - Đóng gói vào dist_staging/ độc lập, bảo vệ nguyên vẹn dist/ hiện tại nếu xảy ra lỗi.
 * - Swap nguyên tử (atomic promotion) và tự động rollback nếu promote thất bại.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const STAGING_DIR = path.join(ROOT_DIR, 'dist_staging');
const BACKUP_DIR = path.join(ROOT_DIR, 'dist_backup');

console.log('==========================================================');
console.log('   T&T 3D LABS - STATIC ARTIFACT PACKAGING PIPELINE (R5)');
console.log('==========================================================\n');

// 0. Preflight checks - Bắt buộc entrypoints và toàn bộ runtime JS/CSS/HTML (Codex R5-03)
console.log('[*] Đang thực hiện Preflight kiểm tra tài nguyên bắt buộc...');
const REQUIRED_PREFLIGHT_FILES = [
  'index.html',
  'admin.html',
  'products.json',
  'css/style.css',
  'css/admin.css',
  'css/tailwind-input.css',
  'tailwind.static.config.cjs',
  'js/app.js',
  'js/calculator.js',
  'js/config.js',
  'js/cart.js',
  'js/checkout.js',
  'js/catalog-store.js',
  'js/category-registry.js',
  'js/art-presets.js',
  'js/image-uploader.js',
  'js/purchase-config.js',
  'js/products-manager.js',
  'js/product-experience.js',
  'js/visual-renderer.js',
  'js/viewer3d.js',
  'js/order-engine.js',
  'js/personalize-studio.js',
  'js/gift-quiz.js',
  'js/admin.js',
  'js/automation-simulator.js',
  'js/studio-state.js'
];

for (const reqFile of REQUIRED_PREFLIGHT_FILES) {
  const p = path.join(ROOT_DIR, reqFile);
  if (!fs.existsSync(p)) {
    console.error(`[!] Preflight Error: Không tìm thấy entrypoint bắt buộc: ${reqFile}`);
    process.exit(1);
  }
  const stat = fs.statSync(p);
  if (stat.size === 0) {
    console.error(`[!] Preflight Error: Entrypoint bắt buộc rỗng (0 bytes): ${reqFile}`);
    process.exit(1);
  }
}
console.log(`  + Đã xác minh đầy đủ ${REQUIRED_PREFLIGHT_FILES.length} entrypoints cốt lõi.\n`);

// 1. Kiểm tra an toàn đường dẫn output & realpath
const relDist = path.relative(ROOT_DIR, DIST_DIR);
if (relDist.startsWith('..') || path.isAbsolute(relDist)) {
  console.error('[!] Lỗi an toàn: DIST_DIR nằm ngoài ROOT_DIR');
  process.exit(1);
}

try {
  const realRoot = fs.realpathSync(ROOT_DIR);
  if (fs.existsSync(DIST_DIR)) {
    const realDist = fs.realpathSync(DIST_DIR);
    const rel = path.relative(realRoot, realDist);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      console.error('[!] Lỗi an toàn: realpath của DIST_DIR nằm ngoài workspace');
      process.exit(1);
    }
  }
} catch (e) {
  if (e && e.code !== 'ENOENT') {
    console.error('[!] Lỗi kiểm tra realpath:', e.message);
    process.exit(1);
  }
}

// 2. Biên dịch Tailwind CSS tĩnh trước khi đóng gói
console.log('[*] Đang biên dịch Tailwind CSS tĩnh (Industrial Design System)...');
const cliPath = path.join(ROOT_DIR, 'node_modules', 'tailwindcss', 'lib', 'cli.js');
const outputCss = path.join(ROOT_DIR, 'css', 'tailwind.css');

if (!fs.existsSync(cliPath)) {
  console.error('[!] Không tìm thấy Tailwind CLI tại node_modules/tailwindcss/lib/cli.js');
  process.exit(1);
}

try {
  execFileSync(process.execPath, [
    cliPath,
    '-c', 'tailwind.static.config.cjs',
    '-i', 'css/tailwind-input.css',
    '-o', 'css/tailwind.css',
    '--minify'
  ], {
    cwd: ROOT_DIR,
    stdio: 'inherit'
  });
} catch (err) {
  console.error('[!] Lỗi trong quá trình biên dịch Tailwind CSS:', err.message);
  process.exit(1);
}

if (!fs.existsSync(outputCss) || fs.statSync(outputCss).size === 0) {
  console.error('[!] Lỗi: css/tailwind.css không tồn tại hoặc rỗng sau biên dịch');
  process.exit(1);
}
console.log(`  + Đã biên dịch css/tailwind.css (${fs.statSync(outputCss).size} bytes)\n`);

// 3. Chuẩn bị Staging Directory (Transactional Build - Codex R5-03)
if (fs.existsSync(STAGING_DIR)) {
  fs.rmSync(STAGING_DIR, { recursive: true, force: true });
}
if (fs.existsSync(BACKUP_DIR)) {
  fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
}
fs.mkdirSync(STAGING_DIR, { recursive: true });

// 4. Allowlist các thư mục và tập tin được phép phát hành
const ALLOWLIST_FILES = [
  'index.html',
  'admin.html',
  'products.json'
];

const ALLOWLIST_DIRS = [
  'css',
  'js',
  'assets'
];

if (fs.existsSync(path.join(ROOT_DIR, '3d-models'))) {
  ALLOWLIST_DIRS.push('3d-models');
}

function copyRecursive(src, dest) {
  const lstat = fs.lstatSync(src);
  if (lstat.isSymbolicLink()) {
    console.warn(`[!] Bỏ qua symbolic link: ${src}`);
    return;
  }
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (entry.startsWith('.') || entry.endsWith('.tmp') || entry.endsWith('.bak') || entry === 'tailwind-input.css') {
        continue;
      }
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  // Sao chép allowlist files vào STAGING_DIR
  console.log('[*] Đang sao chép các tệp HTML & cấu hình phát hành vào staging...');
  for (const file of ALLOWLIST_FILES) {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(STAGING_DIR, file);
    if (!fs.existsSync(src)) {
      throw new Error(`File allowlist không tồn tại: ${file}`);
    }
    fs.copyFileSync(src, dest);
    console.log(`  + ${file}`);
  }

  // Sao chép allowlist dirs vào STAGING_DIR
  console.log('[*] Đang sao chép tài nguyên tĩnh (css, js, assets) vào staging...');
  for (const dir of ALLOWLIST_DIRS) {
    const src = path.join(ROOT_DIR, dir);
    const dest = path.join(STAGING_DIR, dir);
    if (!fs.existsSync(src)) {
      throw new Error(`Thư mục allowlist không tồn tại: ${dir}`);
    }
    copyRecursive(src, dest);
    console.log(`  + ${dir}/`);
  }

  // 5. Tính toán SHA-256 Manifest tại STAGING_DIR
  console.log('\n[*] Đang tính toán bảng băm SHA-256 cho toàn bộ artifact...');
  const manifest = {
    appName: 'T&T 3D Labs',
    version: '2.0.0-tactile-minimalism',
    buildTimestamp: new Date().toISOString(),
    architecture: 'Client-Side Static SPA',
    files: {}
  };

  function hashDirectory(dir, relPrefix = '') {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const relPath = path.posix.join(relPrefix, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        hashDirectory(fullPath, relPath);
      } else {
        const content = fs.readFileSync(fullPath);
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        manifest.files[relPath] = {
          sizeBytes: stat.size,
          sha256: hash
        };
      }
    }
  }

  hashDirectory(STAGING_DIR);

  const manifestPath = path.join(STAGING_DIR, 'artifact-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  // 6. Promote Staging to DIST_DIR atomically
  console.log('[*] Đang xúc tiến (promote) bản đóng gói staging sang dist/...');
  let distPromoted = false;
  try {
    if (fs.existsSync(DIST_DIR)) {
      fs.renameSync(DIST_DIR, BACKUP_DIR);
    }
    fs.renameSync(STAGING_DIR, DIST_DIR);
    distPromoted = true;
    if (fs.existsSync(BACKUP_DIR)) {
      fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
    }
  } catch (promoteErr) {
    console.error('[!] Lỗi promote dist:', promoteErr.message);
    if (!distPromoted && fs.existsSync(BACKUP_DIR) && !fs.existsSync(DIST_DIR)) {
      try {
        fs.renameSync(BACKUP_DIR, DIST_DIR);
      } catch (_) {}
    }
    throw promoteErr;
  }

  const totalFiles = Object.keys(manifest.files).length;
  console.log(`\n==========================================================`);
  console.log(`   BUILD HOÀN TẤT: ${totalFiles} tệp đã được đóng gói an toàn`);
  console.log(`   Đích phát hành: dist/`);
  console.log(`   Manifest: dist/artifact-manifest.json`);
  console.log(`==========================================================\n`);

} catch (err) {
  console.error(`[!] Lỗi nghiêm trọng trong quá trình build: ${err.message}`);
  // Dọn dẹp staging nếu dở dang
  if (fs.existsSync(STAGING_DIR)) {
    try { fs.rmSync(STAGING_DIR, { recursive: true, force: true }); } catch (_) {}
  }
  process.exit(1);
}
