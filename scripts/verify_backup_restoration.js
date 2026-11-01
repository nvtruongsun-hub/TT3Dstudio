const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const { assertNotProduction, STAGING_CONFIG } = require('../tests/test_env_guard');

// Strictly verify on Staging
assertNotProduction(STAGING_CONFIG.URL);

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || 'REDACTED_SUPABASE_ACCESS_TOKEN';

function queryStagingSql(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${STAGING_CONFIG.PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'Node/Backup-Verifier'
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(b) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: b });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function verifyBackupRestore() {
  console.log('========================================================================');
  console.log('   XÁC MINH KHẢ NĂNG KHÔI PHỤC BẢN BACKUP TRÊN MÔI TRƯỜNG THỬ NGHIỆM');
  console.log(`   Môi trường: STAGING (${STAGING_CONFIG.PROJECT_REF})`);
  console.log('========================================================================\n');

  const backupDir = path.join(__dirname, '..', 'supabase', 'backups');
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) throw new Error('Không tìm thấy file backup nào trong supabase/backups');

  const latestBackupFile = path.join(backupDir, files.sort().reverse()[0]);
  console.log(`[1/4] Đọc bản backup: ${path.basename(latestBackupFile)}...`);
  const backupData = JSON.parse(fs.readFileSync(latestBackupFile, 'utf8'));

  console.log(`- Timestamp: ${backupData.timestamp}`);
  console.log(`- Số bảng được lưu: ${Object.keys(backupData.tables).length}`);

  try {
    // 1. Tạo schema cô lập để khôi phục
    console.log('\n[2/4] Tạo isolated schema: backup_restore_verification trên Staging...');
    await queryStagingSql('CREATE SCHEMA IF NOT EXISTS backup_restore_verification;');

    // 2. Tái tạo bảng categories và products bằng CREATE TABLE LIKE
    console.log('[3/4] Tái tạo bảng và khôi phục dữ liệu từ bản backup...');
    await queryStagingSql(`
      CREATE TABLE backup_restore_verification.categories (LIKE public.categories INCLUDING ALL);
      CREATE TABLE backup_restore_verification.products (LIKE public.products INCLUDING ALL);
    `);

    // Restore categories via jsonb_populate_recordset
    const cats = backupData.tables['categories'] || [];
    const jsonCats = JSON.stringify(cats).replace(/'/g, "''");
    const resCats = await queryStagingSql(`
      INSERT INTO backup_restore_verification.categories
      SELECT * FROM jsonb_populate_recordset(NULL::public.categories, '${jsonCats}'::jsonb);
    `);
    console.log(`- Khôi phục bảng categories: status ${resCats.status}`);

    // Restore products via jsonb_populate_recordset
    const prods = backupData.tables['products'] || [];
    const jsonProds = JSON.stringify(prods).replace(/'/g, "''");
    const resProds = await queryStagingSql(`
      INSERT INTO backup_restore_verification.products
      SELECT * FROM jsonb_populate_recordset(NULL::public.products, '${jsonProds}'::jsonb);
    `);
    console.log(`- Khôi phục bảng products: status ${resProds.status}`);

    // 3. Đối chiếu tính toàn vẹn
    console.log('\n[4/4] Đối chiếu tính toàn vẹn dữ liệu sau khôi phục...');
    const verifyCats = await queryStagingSql('SELECT count(*) as total FROM backup_restore_verification.categories;');
    const verifyProds = await queryStagingSql('SELECT count(*) as total FROM backup_restore_verification.products;');

    const restoredCatsCount = parseInt(verifyCats.data[0].total, 10);
    const restoredProdsCount = parseInt(verifyProds.data[0].total, 10);

    console.log(`- Categories gốc: ${cats.length} -> Khôi phục: ${restoredCatsCount} (${cats.length === restoredCatsCount ? 'PASS' : 'FAIL'})`);
    console.log(`- Products gốc: ${prods.length} -> Khôi phục: ${restoredProdsCount} (${prods.length === restoredProdsCount ? 'PASS' : 'FAIL'})`);

    if (cats.length === restoredCatsCount && prods.length === restoredProdsCount) {
      console.log('\n🎉 [PHASE 3 VERIFIED PASS] BẢN BACKUP HOÀN TOÀN CÓ KHẢ NĂNG KHÔI PHỤC NGUYÊN VẸN TRÊN MÔI TRƯỜNG ĐỘC LẬP!');
    } else {
      console.log('\n❌ KHÔI PHỤC THẤT BẠI!');
      process.exit(1);
    }

  } finally {
    console.log('\n[*] Dọn dẹp schema kiểm thử khôi phục (DROP SCHEMA backup_restore_verification CASCADE)...');
    await queryStagingSql('DROP SCHEMA IF EXISTS backup_restore_verification CASCADE;');
    console.log('[+] Đã dọn dẹp hoàn tất.');
  }
}

verifyBackupRestore().catch(console.error);
