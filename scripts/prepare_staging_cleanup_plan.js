const https = require('https');
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('❌ Thiếu biến môi trường SUPABASE_ACCESS_TOKEN.');
  process.exit(1);
}
const projectRef = 'nbsumfhfxohawiuxrwqj';

function runSql(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
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
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  const users = await runSql(`SELECT id, email, created_at FROM auth.users ORDER BY created_at ASC;`);
  
  const legitUsers = users.filter(u => 
    u.email === 'nvtruong.sun@gmail.com' || 
    u.email === 'tt3dstudio.customer@gmail.com' || 
    u.email === 'congtuvodanh2901@gmail.com'
  );
  
  const testUsers = users.filter(u => !legitUsers.some(l => l.id === u.id));

  console.log(`--- PHÂN LOẠI DỮ LIỆU TÀI KHOẢN TRÊN STAGING ---`);
  console.log(`Tổng số tài khoản: ${users.length}`);
  console.log(`Tài khoản THẬT / QUẢN TRỊ BẢO LƯU (BẤT KHẢ XÂM PHẠM): ${legitUsers.length}`);
  legitUsers.forEach(u => console.log(`  🛡️ [KEEP] ${u.email} (${u.id})`));

  console.log(`\nTài khoản TEST tự động sinh trong các đợt kiểm thử: ${testUsers.length}`);
  testUsers.forEach(u => console.log(`  🗑️ [CANDIDATE CLEANUP] ${u.email} (${u.id})`));

  const testUserIds = testUsers.map(u => `'${u.id}'`).join(',');
  let testOrdersCount = 0;
  if (testUsers.length > 0) {
    const orders = await runSql(`SELECT count(*) FROM public.orders WHERE user_id IN (${testUserIds});`);
    testOrdersCount = orders[0].count;
  }

  console.log(`\nSố đơn hàng thử nghiệm liên quan: ${testOrdersCount} đơn.`);
})();
