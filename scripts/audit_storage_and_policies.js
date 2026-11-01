const https = require('https');

const token = 'REDACTED_SUPABASE_ACCESS_TOKEN';

function runSql(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request('https://api.supabase.com/v1/projects/nbsumfhfxohawiuxrwqj/database/query', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (_) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log('--- STORAGE BUCKETS ---');
  const buckets = await runSql('SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets;');
  console.log(JSON.stringify(buckets, null, 2));

  console.log('\n--- STORAGE POLICIES ---');
  const storagePolicies = await runSql("SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'storage';");
  console.log(JSON.stringify(storagePolicies, null, 2));

  console.log('\n--- PUBLIC TABLES RLS STATUS ---');
  const rlsStatus = await runSql("SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';");
  console.log(JSON.stringify(rlsStatus, null, 2));
})();
