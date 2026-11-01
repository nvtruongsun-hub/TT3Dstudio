const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { querySql } = require('./query_db');

const TABLES = [
  'categories',
  'products',
  'coupons',
  'profiles',
  'user_roles',
  'customer_addresses',
  'orders',
  'order_items',
  'order_status_history',
  'audit_logs'
];

async function createBackup() {
  console.log('--- BẮT ĐẦU TẠO BẢN BACKUP DỮ LIỆU ĐẦY ĐỦ CHO DATABASE TT3DSTUDIO ---');
  const backup = {
    timestamp: new Date().toISOString(),
    postgres_version: null,
    tables: {},
    checksums: {}
  };

  const verRes = await querySql('SELECT version();');
  backup.postgres_version = verRes.data[0].version;

  for (const table of TABLES) {
    const res = await querySql(`SELECT * FROM public.${table};`);
    const rows = res.data || [];
    backup.tables[table] = rows;
    const jsonStr = JSON.stringify(rows);
    const hash = crypto.createHash('sha256').update(jsonStr).digest('hex');
    backup.checksums[table] = {
      count: rows.length,
      sha256: hash
    };
    console.log(`[+] Backup bảng public.${table}: ${rows.length} bản ghi (SHA-256: ${hash.slice(0, 12)}...)`);
  }

  // Backup auth.users (excluding hashed passwords for security)
  const authUsersRes = await querySql(`
    SELECT id, email, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_sso_user
    FROM auth.users;
  `);
  backup.tables['auth.users'] = authUsersRes.data || [];
  backup.checksums['auth.users'] = {
    count: (authUsersRes.data || []).length,
    sha256: crypto.createHash('sha256').update(JSON.stringify(authUsersRes.data)).digest('hex')
  };
  console.log(`[+] Backup bảng auth.users: ${(authUsersRes.data || []).length} tài khoản`);

  const backupDir = path.join(__dirname, '..', 'supabase', 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const backupFilePath = path.join(backupDir, `backup_${Date.now()}.json`);
  fs.writeFileSync(backupFilePath, JSON.stringify(backup, null, 2), 'utf8');
  console.log(`\n🎉 ĐÃ XUẤT FILE BACKUP THÀNH CÔNG: ${backupFilePath}`);
  return backupFilePath;
}

if (require.main === module) {
  createBackup().catch(console.error);
}

module.exports = { createBackup };
