const fs = require('fs');
const path = require('path');
const https = require('https');

const STAGING_REF = 'vtxzlgkvmvoushluthme';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) {
  console.error('❌ Thiếu biến môi trường SUPABASE_ACCESS_TOKEN.');
  process.exit(1);
}

function queryStagingSql(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${STAGING_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'Node/Staging-Deployer'
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

async function main() {
  console.log('========================================================================');
  console.log('   TRIỂN KHAI SCHEMA VÀ DỮ LIỆU KIỂM THỬ LÊN SUPABASE STAGING');
  console.log('   Project Ref: vtxzlgkvmvoushluthme (tt3dstudio-staging)');
  console.log('========================================================================\n');

  // Guardrail: Không bao giờ chạy trên production
  if (STAGING_REF === 'nbsumfhfxohawiuxrwqj') {
    throw new Error('❌ NGUY HIỂM: Phát hiện nhầm lẫn sang Production Project Ref nbsumfhfxohawiuxrwqj! Dừng ngay lập tức.');
  }

  // 1. Kiểm tra kết nối tới Staging
  console.log('[1/4] Kiểm tra phiên bản PostgreSQL trên Staging...');
  const ver = await queryStagingSql('SELECT version();');
  console.log('Staging DB version:', ver.data[0].version);

  // 2. Chạy migration 20261031_ecommerce_upgrade.sql
  console.log('\n[2/4] Chạy migration 20261031_ecommerce_upgrade.sql...');
  const mig1Path = path.join(__dirname, '..', 'supabase', 'migrations', '20261031_ecommerce_upgrade.sql');
  const mig1Sql = fs.readFileSync(mig1Path, 'utf8');
  const res1 = await queryStagingSql(mig1Sql);
  console.log('Migration 1 status:', res1.status, res1.status === 201 ? 'SUCCESS' : JSON.stringify(res1.data || res1.raw));

  // 3. Chạy migration 20261101_smart_address_checkout.sql
  console.log('\n[3/4] Chạy migration 20261101_smart_address_checkout.sql...');
  const mig2Path = path.join(__dirname, '..', 'supabase', 'migrations', '20261101_smart_address_checkout.sql');
  const mig2Sql = fs.readFileSync(mig2Path, 'utf8');
  const res2 = await queryStagingSql(mig2Sql);
  console.log('Migration 2 status:', res2.status, res2.status === 201 ? 'SUCCESS' : JSON.stringify(res2.data || res2.raw));

  // 4. Nạp seed_products.sql (105 sản phẩm catalog mẫu không chứa PII khách hàng)
  console.log('\n[4/4] Nạp seed_products.sql...');
  const seedPath = path.join(__dirname, '..', 'supabase', 'seed_products.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf8');
  const resSeed = await queryStagingSql(seedSql);
  console.log('Seed products status:', resSeed.status, resSeed.status === 201 ? 'SUCCESS' : JSON.stringify(resSeed.data || resSeed.raw));

  // 5. Kiểm tra số lượng bảng trên Staging
  const tablesRes = await queryStagingSql(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('\n✅ CÁC BẢNG TRÊN STAGING:');
  console.table(tablesRes.data);

  const prodCount = await queryStagingSql('SELECT count(*) as total FROM public.products;');
  console.log(`\n✅ Tổng số sản phẩm trên Staging: ${prodCount.data[0].total}`);
}

main().catch(console.error);
