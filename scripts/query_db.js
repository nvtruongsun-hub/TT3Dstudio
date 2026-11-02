const https = require('https');

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('❌ Thiếu biến môi trường SUPABASE_ACCESS_TOKEN.');
  process.exit(1);
}
const projectRef = 'nbsumfhfxohawiuxrwqj';

function querySql(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectRef}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'Node/DB-Auditor'
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

module.exports = { querySql };

if (require.main === module) {
  querySql('SELECT version();').then(res => {
    console.log('Query status:', res.status);
    console.log('Postgres Version:', res.data);
  }).catch(console.error);
}
