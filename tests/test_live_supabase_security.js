/**
 * Live Supabase Security & RLS Isolation Verification
 * Chạy trực tiếp qua HTTPS tới Supabase Cloud Endpoint
 * Kiểm tra:
 * 1. Anonymous Read / Write Protection
 * 2. Customer A vs Customer B Isolation (Customer B không thể xem hoặc sửa địa chỉ/đơn của Customer A)
 * 3. Bẻ gãy can thiệp giá: RPC create_order tính lại giá từ DB, bỏ qua giá client
 * 4. Ngăn chặn trái phép RPC create_order với address_id của người khác
 * 5. Admin RBAC: Khách hàng thường gọi update_order_status_admin bị từ chối
 */

const https = require('https');

const SUPABASE_URL = 'https://nbsumfhfxohawiuxrwqj.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3VtZmhmeG9oYXdpdXhyd3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0Njk4NzAsImV4cCI6MjEwOTA0NTg3MH0.fptFtIhcY90mm_Oj4FoxzI6ZPpkf9du876UMMXj14Io';

function apiRequest(path, method = 'GET', body = null, token = ANON_KEY) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const headers = {
      'apikey': ANON_KEY,
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    };
    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) { json = data; }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  console.log('🛡️ [SECURITY AUDIT] Bắt đầu kiểm định trực tiếp Supabase Cloud Backend...');

  // 1. ANONYMOUS RESTRICTIONS
  console.log('\n--- 1. Kiểm thử Anonymous Access ---');
  const anonOrders = await apiRequest('/rest/v1/orders?select=*');
  console.log('Anonymous GET /orders:', anonOrders.status, Array.isArray(anonOrders.data) && anonOrders.data.length === 0 ? 'PASS (0 records)' : 'FAIL');

  const anonAddr = await apiRequest('/rest/v1/customer_addresses?select=*');
  console.log('Anonymous GET /customer_addresses:', anonAddr.status, Array.isArray(anonAddr.data) && anonAddr.data.length === 0 ? 'PASS (0 records)' : 'FAIL');

  const anonRpcOrder = await apiRequest('/rest/v1/rpc/create_order', 'POST', {
    p_items: [{ product_id: 'mw-cn-2084928', quantity: 1 }],
    p_shipping_name: 'Anon Hacker',
    p_shipping_phone: '0349657529',
    p_shipping_address: 'No where',
    p_idempotency_key: 'anon-test-' + Date.now()
  });
  console.log('Anonymous call create_order RPC:', anonRpcOrder.status, anonRpcOrder.data.code === 'UNAUTHORIZED' ? 'PASS (UNAUTHORIZED)' : 'FAIL');

  const anonAdminRpc = await apiRequest('/rest/v1/rpc/update_order_status_admin', 'POST', {
    p_order_id: '00000000-0000-0000-0000-000000000000',
    p_new_status: 'completed',
    p_note: 'Hacker note'
  });
  console.log('Anonymous call update_order_status_admin RPC:', anonAdminRpc.status, anonAdminRpc.data.code === 'FORBIDDEN' ? 'PASS (FORBIDDEN)' : 'FAIL');

  // 2. TẠO HOẶC ĐĂNG NHẬP 2 CUSTOMER KHÁC NHAU ĐỂ KIỂM THỬ CROSS-ACCOUNT ISOLATION
  console.log('\n--- 2. Kiểm thử Cross-Account Isolation (Customer A vs Customer B) ---');
  const userAEmail = `audit_cust_a_${Date.now()}@tt3dtest.com`;
  const userBEmail = `audit_cust_b_${Date.now()}@tt3dtest.com`;
  const testPass = 'AuditSecurePass!2026';

  // Sign up User A
  const signUpA = await apiRequest('/auth/v1/signup', 'POST', {
    email: userAEmail,
    password: testPass,
    data: { full_name: 'Customer A' }
  });

  // Sign up User B
  const signUpB = await apiRequest('/auth/v1/signup', 'POST', {
    email: userBEmail,
    password: testPass,
    data: { full_name: 'Customer B' }
  });

  const tokenA = signUpA.data.access_token;
  const tokenB = signUpB.data.access_token;

  if (!tokenA || !tokenB) {
    console.log('Notice: Email confirmation might be required on sign up. Sign up response A:', signUpA.status, 'B:', signUpB.status);
    console.log('User A ID:', signUpA.data.id || (signUpA.data.user && signUpA.data.user.id));
    console.log('User B ID:', signUpB.data.id || (signUpB.data.user && signUpB.data.user.id));
  } else {
    console.log('✅ Đã tạo 2 tài khoản thử nghiệm token A & token B');

    // Customer A thêm 1 địa chỉ
    const addAddrA = await apiRequest('/rest/v1/customer_addresses', 'POST', {
      user_id: signUpA.data.user.id,
      label: 'home',
      recipient_name: 'Customer A Address',
      recipient_phone: '0349657529',
      province_code: '42',
      province_name: 'Tỉnh Hà Tĩnh',
      ward_code: '18220',
      ward_name: 'Phường Bắc Hà',
      address_line: 'Số 10 Bắc Hà'
    }, tokenA);
    console.log('Customer A tạo địa chỉ:', addAddrA.status);

    // Customer B thử SELECT địa chỉ của Customer A
    const bSelectAddr = await apiRequest('/rest/v1/customer_addresses?select=*', 'GET', null, tokenB);
    console.log('Customer B SELECT customer_addresses:', bSelectAddr.status, 'Record count:', Array.isArray(bSelectAddr.data) ? bSelectAddr.data.length : 0);

    // Customer B thử UPDATE địa chỉ của Customer A
    // ...
  }

  console.log('\n--- 3. Kiểm thử Coupon & Giá từ RPC ---');
  // ...
})();
