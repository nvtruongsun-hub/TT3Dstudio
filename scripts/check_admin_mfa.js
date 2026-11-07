const https = require('https');

const SUPABASE_URL = 'https://nbsumfhfxohawiuxrwqj.supabase.co';
const ANON_KEY = 'sb_publishable_axTex7YiB0DOBquiWFtR-g_L-0q8n5e';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) {
  console.warn('⚠️ CẢNH BÁO: SUPABASE_SERVICE_ROLE_KEY chưa được đặt trong biến môi trường. Script yêu cầu biến này để thực thi thao tác đặc quyền.');
}

function req(path, method = 'GET', body = null, token = SERVICE_KEY) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const headers = {
      'apikey': ANON_KEY,
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    };
    const payload = body ? JSON.stringify(body) : null;
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

    const request = https.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) { json = data; }
        resolve({ status: res.statusCode, body: json });
      });
    });
    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
}

async function main() {
  console.log('--- KIỂM TRA MFA ADMIN VÀ PHÂN QUYỀN TRÊN SUPABASE ---');

  // 1. Lấy danh sách user_roles admin
  const adminRolesRes = await req('/rest/v1/user_roles?role=eq.admin&select=*', 'GET', null, SERVICE_KEY);
  console.log('Admin user_roles:', JSON.stringify(adminRolesRes.body, null, 2));

  // 2. Với mỗi admin, lấy chi tiết từ auth admin
  if (Array.isArray(adminRolesRes.body)) {
    for (const r of adminRolesRes.body) {
      const userRes = await req(`/auth/v1/admin/users/${r.user_id}`, 'GET', null, SERVICE_KEY);
      const u = userRes.body;
      console.log(`\nAdmin: ${u.email} (ID: ${u.id})`);
      console.log(`- Factors:`, u.factors);
      console.log(`- AAL:`, u.aal);
      console.log(`- App Metadata:`, u.app_metadata);
      console.log(`- User Metadata:`, u.user_metadata);
    }
  }

  // 3. Kiểm tra xem RPC update_order_status_admin có yêu cầu MFA hay AAL2 không
  console.log('\n--- KIỂM TRA MÃ NGUỒN RPC update_order_status_admin ---');
  // Ta đã đọc code hàm update_order_status_admin trong 20261031_ecommerce_upgrade.sql:
  // Chỉ kiểm tra: IF NOT public.is_staff_or_admin() THEN RETURN FORBIDDEN
  // Hoàn toàn KHÔNG kiểm tra auth.jwt() ->> 'aal' = 'aal2'
  console.log('Hàm update_order_status_admin: CHƯA có kiểm tra mức độ xác thực AAL2 (MFA challenge).');
}

main().catch(console.error);
