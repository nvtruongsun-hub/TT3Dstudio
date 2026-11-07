/**
 * T&T 3D STUDIO - MULTI-ENVIRONMENT BUILD & ARTIFACT GENERATOR
 * =========================================================================
 * Độc lập hóa cấu hình Frontend giữa Production và Staging.
 * Chặn đứng mọi cơ chế chuyển backend qua URL query parameter.
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const STAGING_DIST_DIR = path.join(ROOT_DIR, 'dist_staging_deploy');

const PROD_CONFIG = {
  ENV_NAME: 'production',
  SUPABASE_URL: 'https://nbsumfhfxohawiuxrwqj.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_axTex7YiB0DOBquiWFtR-g_L-0q8n5e',
  IS_STAGING: false,
  VERSION: '5.2.0-prod'
};

const STAGING_CONFIG = {
  ENV_NAME: 'staging',
  SUPABASE_URL: 'https://vtxzlgkvmvoushluthme.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eHpsZ2t2bXZvdXNobHV0aG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MDU4NzgsImV4cCI6MjEwOTA4MTg3OH0.e78lpCrZZ07Y15aXXXTceNQxzsd46XyTLWebXZZB4oo',
  IS_STAGING: true,
  VERSION: '5.2.0-staging'
};

function generateEnvConfigFileContent(config) {
  return `/**
 * T&T 3D STUDIO - ENVIRONMENT CONFIGURATION (STATIC BUILD-TIME)
 * =========================================================================
 * Build-time immutable configuration. URL (?env=...) cannot override this.
 * Target: ${config.ENV_NAME.toUpperCase()} (${config.SUPABASE_URL})
 * Generated At: ${new Date().toISOString()}
 * =========================================================================
 */

(function (window) {
  'use strict';

  var ENV_CONFIG = {
    ENV_NAME: '${config.ENV_NAME}',
    SUPABASE_URL: '${config.SUPABASE_URL}',
    SUPABASE_ANON_KEY: '${config.SUPABASE_ANON_KEY}',
    IS_STAGING: ${config.IS_STAGING},
    BUILD_TIMESTAMP: '${new Date().toISOString()}',
    VERSION: '${config.VERSION}'
  };

  if (typeof Object.freeze === 'function') {
    Object.freeze(ENV_CONFIG);
  }

  if (typeof window !== 'undefined') {
    window.TT_ENV = ENV_CONFIG;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENV_CONFIG;
  }
})(typeof window !== 'undefined' ? window : this);
`;
}

function copyDirectorySync(src, dest, ignoreList = []) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (ignoreList.includes(entry.name)) continue;

    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath, ignoreList);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function buildStagingDeployPackage() {
  console.log('========================================================================');
  console.log('   BẮT ĐẦU ĐÓNG GÓI BẢN DEPLOY STAGING ĐỘC LẬP (dist_staging_deploy)');
  console.log('   Target Backend: https://vtxzlgkvmvoushluthme.supabase.co');
  console.log('========================================================================\n');

  if (fs.existsSync(STAGING_DIST_DIR)) {
    console.log('[1/4] Dọn dẹp thư mục dist_staging_deploy cũ...');
    fs.rmSync(STAGING_DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(STAGING_DIST_DIR, { recursive: true });

  console.log('[2/4] Sao chép các tài nguyên tĩnh cần thiết...');
  const directFiles = ['index.html', 'admin.html', 'products.json', 'poster-artisan-stall.html'];
  for (const file of directFiles) {
    const src = path.join(ROOT_DIR, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(STAGING_DIST_DIR, file));
    }
  }

  const directDirs = ['css', 'js', 'images'];
  for (const dir of directDirs) {
    const srcDir = path.join(ROOT_DIR, dir);
    if (fs.existsSync(srcDir)) {
      copyDirectorySync(srcDir, path.join(STAGING_DIST_DIR, dir));
    }
  }

  console.log('[3/4] Ghi cấu hình cố định Staging vào dist_staging_deploy/js/env-config.js...');
  const stagingEnvConfigContent = generateEnvConfigFileContent(STAGING_CONFIG);
  fs.writeFileSync(path.join(STAGING_DIST_DIR, 'js', 'env-config.js'), stagingEnvConfigContent, 'utf8');

  console.log('[4/4] Chèn Staging Watermark Banner vào index.html và admin.html...');
  const stagingBannerHtml = `
  <!-- STAGING WATERMARK BANNER (INDEPENDENT ENVIRONMENT WARNING) -->
  <div id="tt3d-staging-banner" style="position:fixed;top:0;left:0;right:0;height:26px;background:#dc2626;color:#ffffff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;z-index:9999999;box-shadow:0 2px 6px rgba(0,0,0,0.4);letter-spacing:0.8px;font-family:system-ui,-apple-system,sans-serif;">
    ⚠️ MÔI TRƯỜNG KIỂM THỬ STAGING (vtxzlgkvmvoushluthme) — KHÔNG SỬ DỤNG CHO GIAO DỊCH THẬT
  </div>
  <style>body { padding-top: 26px !important; }</style>
`;

  ['index.html', 'admin.html'].forEach(filename => {
    const targetFile = path.join(STAGING_DIST_DIR, filename);
    if (fs.existsSync(targetFile)) {
      let content = fs.readFileSync(targetFile, 'utf8');
      if (content.includes('<body>')) {
        content = content.replace('<body>', '<body>\n' + stagingBannerHtml);
      } else if (content.includes('<body ')) {
        content = content.replace(/<body([^>]*)>/, '<body$1>\n' + stagingBannerHtml);
      }
      fs.writeFileSync(targetFile, content, 'utf8');
    }
  });

  console.log('\n✅ HOÀN TẤT: Bản build Staging độc lập đã được tạo thành công tại:');
  console.log(`   ${STAGING_DIST_DIR}`);
}

function ensureProductionRootConfig() {
  const rootEnvConfigFile = path.join(ROOT_DIR, 'js', 'env-config.js');
  const prodContent = generateEnvConfigFileContent(PROD_CONFIG);
  fs.writeFileSync(rootEnvConfigFile, prodContent, 'utf8');
  console.log('✅ Cấu hình Root js/env-config.js đã được khóa cứng về PRODUCTION (nbsumfhfxohawiuxrwqj).');
}

if (require.main === module) {
  ensureProductionRootConfig();
  buildStagingDeployPackage();
}

module.exports = {
  buildStagingDeployPackage,
  ensureProductionRootConfig,
  PROD_CONFIG,
  STAGING_CONFIG
};
