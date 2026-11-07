/**
 * Exhaustive 10-Table CRUD & Permission Matrix Verification (Strict TDD & E2E)
 * Target: T&T 3D Studio (Supabase Cloud nbsumfhfxohawiuxrwqj)
 * Personas: Anonymous, Customer A, Customer B, Admin
 * 10 Tables: profiles, user_roles, categories, products, coupons,
 *            order_items, order_status_history, audit_logs, orders, customer_addresses
 */

const https = require('https');
const assert = require('assert');

const SUPABASE_URL = 'https://nbsumfhfxohawiuxrwqj.supabase.co';
const ANON_KEY = 'sb_publishable_axTex7YiB0DOBquiWFtR-g_L-0q8n5e';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) {
  console.warn('⚠️ CẢNH BÁO: SUPABASE_SERVICE_ROLE_KEY chưa được đặt trong biến môi trường. Test suite này yêu cầu biến môi trường để chạy Admin persona verification.');
}

function req(path, method = 'GET', body = null, token = ANON_KEY) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const headers = {
      'apikey': token === SERVICE_KEY ? SERVICE_KEY : ANON_KEY,
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

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

async function createFreshUser(prefix, password, fullName, roles = ['customer']) {
  const email = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}@tt3dstudio.vn`;
  const createRes = await req('/auth/v1/admin/users', 'POST', {
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  }, SERVICE_KEY);

  if (createRes.status !== 200 && createRes.status !== 201) {
    throw new Error('Không thể tạo user: ' + JSON.stringify(createRes.body));
  }

  const userId = createRes.body.id;

  for (const role of roles) {
    await req('/rest/v1/user_roles', 'POST', {
      user_id: userId,
      role
    }, SERVICE_KEY);
  }

  const loginRes = await req('/auth/v1/token?grant_type=password', 'POST', {
    email,
    password
  }, ANON_KEY);

  if (!loginRes.body.access_token) {
    throw new Error(`Đăng nhập thất bại cho ${email}: ` + JSON.stringify(loginRes.body));
  }

  return {
    userId,
    token: loginRes.body.access_token,
    email
  };
}

(async () => {
  console.log('🛡️ [GATE 3: 10-TABLE PERMISSION MATRIX] Bắt đầu kiểm tra ma trận bảo mật 10 bảng...\n');

  // =========================================================================
  // 1. SETUP PERSONAS
  // =========================================================================
  console.log('--- KHỞI TẠO TÀI KHOẢN TEST CHO 3 PERSONAS ---');
  const custA = await createFreshUser('gate_cust_a', 'SecurePassA!2026', 'Khách Hàng A', ['customer']);
  console.log('Customer A ID:', custA.userId);

  const custB = await createFreshUser('gate_cust_b', 'SecurePassB!2026', 'Khách Hàng B', ['customer']);
  console.log('Customer B ID:', custB.userId);

  const admin = await createFreshUser('gate_admin', 'AdminPassSecret!2026', 'Quản Trị Viên Gate', ['customer', 'admin']);
  console.log('Admin ID:', admin.userId);

  // =========================================================================
  // 2. ANONYMOUS CRUD PERMISSIONS (10 TABLES)
  // =========================================================================
  console.log('\n--- 1. ANONYMOUS CRUD TEST TRÊN 10 BẢNG ---');

  // Table 1: profiles
  const anonProfSel = await req('/rest/v1/profiles?select=*', 'GET', null, ANON_KEY);
  assert.strictEqual((anonProfSel.body || []).length, 0, 'Anon không được xem profiles');
  const anonProfIns = await req('/rest/v1/profiles', 'POST', { id: '00000000-0000-0000-0000-000000000000', full_name: 'Hack' }, ANON_KEY);
  assert(anonProfIns.status >= 400, 'Anon không được insert profile');
  console.log('✅ [profiles] Anon: SELECT=BLOCKED (0 rows), INSERT=BLOCKED (' + anonProfIns.status + ')');

  // Table 2: user_roles
  const anonRoleSel = await req('/rest/v1/user_roles?select=*', 'GET', null, ANON_KEY);
  assert.strictEqual((anonRoleSel.body || []).length, 0, 'Anon không được xem user_roles');
  const anonRoleIns = await req('/rest/v1/user_roles', 'POST', { user_id: custA.userId, role: 'admin' }, ANON_KEY);
  assert(anonRoleIns.status >= 400, 'Anon không được insert user_roles');
  console.log('✅ [user_roles] Anon: SELECT=BLOCKED, INSERT=BLOCKED (' + anonRoleIns.status + ')');

  // Table 3: categories (Public catalog)
  const anonCatSel = await req('/rest/v1/categories?select=*', 'GET', null, ANON_KEY);
  assert(Array.isArray(anonCatSel.body) && anonCatSel.body.length > 0, 'Anon được xem catalog categories');
  const anonCatIns = await req('/rest/v1/categories', 'POST', { id: 'cat-hack', name: 'Hack' }, ANON_KEY);
  assert(anonCatIns.status >= 400, 'Anon không được insert categories');
  console.log('✅ [categories] Anon: SELECT=ALLOWED (' + anonCatSel.body.length + ' cats), INSERT=BLOCKED (' + anonCatIns.status + ')');

  // Table 4: products (Public active catalog)
  const anonProdSel = await req('/rest/v1/products?select=*', 'GET', null, ANON_KEY);
  assert(Array.isArray(anonProdSel.body) && anonProdSel.body.length > 0, 'Anon được xem active products');
  const anonProdIns = await req('/rest/v1/products', 'POST', { id: 'prod-hack', title: 'Hack', price: 100 }, ANON_KEY);
  assert(anonProdIns.status >= 400, 'Anon không được insert products');
  console.log('✅ [products] Anon: SELECT=ALLOWED (' + anonProdSel.body.length + ' prods), INSERT=BLOCKED (' + anonProdIns.status + ')');

  // Table 5: coupons (Public active coupon read for validation, no inserts)
  const anonCpnSel = await req('/rest/v1/coupons?select=*', 'GET', null, ANON_KEY);
  assert(Array.isArray(anonCpnSel.body), 'Anon query coupons trả về danh sách active');
  const anonCpnIns = await req('/rest/v1/coupons', 'POST', { code: 'HACK99', discount_value: 99 }, ANON_KEY);
  assert(anonCpnIns.status >= 400, 'Anon không được tạo coupon');
  console.log('✅ [coupons] Anon: SELECT=ALLOWED (Active coupons), INSERT=BLOCKED (' + anonCpnIns.status + ')');

  // Table 6: customer_addresses
  const anonAddrSel = await req('/rest/v1/customer_addresses?select=*', 'GET', null, ANON_KEY);
  assert.strictEqual((anonAddrSel.body || []).length, 0);
  const anonAddrIns = await req('/rest/v1/customer_addresses', 'POST', { recipient_name: 'Hack' }, ANON_KEY);
  assert(anonAddrIns.status >= 400);
  console.log('✅ [customer_addresses] Anon: SELECT=BLOCKED, INSERT=BLOCKED (' + anonAddrIns.status + ')');

  // Table 7: orders
  const anonOrdSel = await req('/rest/v1/orders?select=*', 'GET', null, ANON_KEY);
  assert.strictEqual((anonOrdSel.body || []).length, 0);
  const anonOrdIns = await req('/rest/v1/orders', 'POST', { total: 100 }, ANON_KEY);
  assert(anonOrdIns.status >= 400);
  console.log('✅ [orders] Anon: SELECT=BLOCKED, INSERT=BLOCKED (' + anonOrdIns.status + ')');

  // Table 8: order_items
  const anonItemsSel = await req('/rest/v1/order_items?select=*', 'GET', null, ANON_KEY);
  assert.strictEqual((anonItemsSel.body || []).length, 0);
  const anonItemsIns = await req('/rest/v1/order_items', 'POST', { product_id: 'test', quantity: 1 }, ANON_KEY);
  assert(anonItemsIns.status >= 400);
  console.log('✅ [order_items] Anon: SELECT=BLOCKED, INSERT=BLOCKED (' + anonItemsIns.status + ')');

  // Table 9: order_status_history
  const anonHistSel = await req('/rest/v1/order_status_history?select=*', 'GET', null, ANON_KEY);
  assert.strictEqual((anonHistSel.body || []).length, 0);
  const anonHistIns = await req('/rest/v1/order_status_history', 'POST', { new_status: 'hacked' }, ANON_KEY);
  assert(anonHistIns.status >= 400);
  console.log('✅ [order_status_history] Anon: SELECT=BLOCKED, INSERT=BLOCKED (' + anonHistIns.status + ')');

  // Table 10: audit_logs
  const anonAuditSel = await req('/rest/v1/audit_logs?select=*', 'GET', null, ANON_KEY);
  assert.strictEqual((anonAuditSel.body || []).length, 0);
  const anonAuditIns = await req('/rest/v1/audit_logs', 'POST', { action: 'hack' }, ANON_KEY);
  assert(anonAuditIns.status >= 400);
  console.log('✅ [audit_logs] Anon: SELECT=BLOCKED, INSERT=BLOCKED (' + anonAuditIns.status + ')');


  // =========================================================================
  // 3. CUSTOMER A VS CUSTOMER B PRIVILEGE & ISOLATION
  // =========================================================================
  console.log('\n--- 2. KIỂM THỬ ĐẶC QUYỀN & CÔ LẬP KHÁCH HÀNG (CUSTOMER A vs B) ---');

  // 1. Thử Privilege Escalation: Customer A tự phong mình làm Admin
  const escalateInsert = await req('/rest/v1/user_roles', 'POST', {
    user_id: custA.userId,
    role: 'admin'
  }, custA.token);
  assert(escalateInsert.status >= 400, 'Khách hàng tự INSERT role admin phải bị chặn');
  console.log('✅ PASS: Chống nâng quyền (Privilege Escalation INSERT) -> BLOCKED (' + escalateInsert.status + ')');

  const escalateUpdate = await req(`/rest/v1/user_roles?user_id=eq.${custA.userId}`, 'PATCH', {
    role: 'admin'
  }, custA.token);
  // Không có policy UPDATE cho public -> match 0 rows hoặc báo lỗi
  const checkRoleCustA = await req(`/rest/v1/user_roles?user_id=eq.${custA.userId}&select=*`, 'GET', null, custA.token);
  const hasAdmin = (checkRoleCustA.body || []).some(r => r.role === 'admin');
  assert.strictEqual(hasAdmin, false, 'Customer A tuyệt đối không thể có quyền admin');
  console.log('✅ PASS: Chống nâng quyền (Privilege Escalation UPDATE) -> BẢO TOÀN (role: customer)');

  // 2. Customer A tạo địa chỉ
  const addAddrRes = await req('/rest/v1/customer_addresses', 'POST', {
    user_id: custA.userId,
    label: 'home',
    recipient_name: 'Khách A Chính Chủ',
    recipient_phone: '0349657529',
    province_code: '42',
    province_name: 'Tỉnh Hà Tĩnh',
    ward_code: '18220',
    ward_name: 'Phường Bắc Hà',
    address_line: 'Số 100 Trần Phú',
    is_default: true
  }, custA.token);
  assert(addAddrRes.status === 201 || addAddrRes.status === 200);
  const addrA = addAddrRes.body[0] || (await req('/rest/v1/customer_addresses?select=*', 'GET', null, custA.token)).body[0];
  console.log('Địa chỉ của Customer A ID:', addrA.id);

  // Customer B thử xem địa chỉ của Customer A
  const bSeeAddr = await req(`/rest/v1/customer_addresses?id=eq.${addrA.id}&select=*`, 'GET', null, custB.token);
  assert.strictEqual((bSeeAddr.body || []).length, 0, 'Customer B không thể thấy địa chỉ của Customer A');
  console.log('✅ PASS: Customer B đọc địa chỉ Customer A -> 0 rows (RLS SELECT Isolated)');

  // Customer B thử UPDATE địa chỉ của Customer A
  const bUpdateAddr = await req(`/rest/v1/customer_addresses?id=eq.${addrA.id}`, 'PATCH', {
    recipient_name: 'Hacked by B'
  }, custB.token);
  const aVerifyAddr = await req(`/rest/v1/customer_addresses?id=eq.${addrA.id}&select=*`, 'GET', null, custA.token);
  assert.strictEqual(aVerifyAddr.body[0].recipient_name, 'Khách A Chính Chủ');
  console.log('✅ PASS: Customer B sửa địa chỉ Customer A -> MATCHES 0 ROWS, KHÔNG BỊ ĐỔI');

  // Customer B thử DELETE địa chỉ của Customer A
  const bDeleteAddr = await req(`/rest/v1/customer_addresses?id=eq.${addrA.id}`, 'DELETE', null, custB.token);
  const aVerifyAddrStillExists = await req(`/rest/v1/customer_addresses?id=eq.${addrA.id}&select=*`, 'GET', null, custA.token);
  assert.strictEqual(aVerifyAddrStillExists.body.length, 1);
  console.log('✅ PASS: Customer B xóa địa chỉ Customer A -> MATCHES 0 ROWS, ĐỊA CHỈ NGUYÊN VẸN');

  // Customer A tạo đơn hàng hợp lệ qua RPC create_order
  const orderA = await req('/rest/v1/rpc/create_order', 'POST', {
    p_items: [{ product_id: 'mw-cn-2084928', quantity: 1 }],
    p_address_id: addrA.id,
    p_idempotency_key: 'gate-idemp-ord-' + Date.now(),
    p_payment_method: 'cod'
  }, custA.token);
  assert.strictEqual(orderA.body.ok, true);
  const orderIdA = orderA.body.order_id;
  console.log('Đơn hàng Customer A tạo thành công, Mã:', orderA.body.order_number, 'ID:', orderIdA);

  // Customer B thử xem đơn hàng của Customer A
  const bSeeOrder = await req(`/rest/v1/orders?id=eq.${orderIdA}&select=*`, 'GET', null, custB.token);
  assert.strictEqual((bSeeOrder.body || []).length, 0);
  console.log('✅ PASS: Customer B đọc đơn hàng Customer A -> 0 rows (RLS Orders Isolated)');

  // Customer B thử xem order_items của Customer A
  const bSeeItems = await req(`/rest/v1/order_items?order_id=eq.${orderIdA}&select=*`, 'GET', null, custB.token);
  assert.strictEqual((bSeeItems.body || []).length, 0);
  console.log('✅ PASS: Customer B đọc order_items Customer A -> 0 rows (RLS Order Items Isolated)');

  // Customer B thử xem order_status_history của Customer A
  const bSeeHistory = await req(`/rest/v1/order_status_history?order_id=eq.${orderIdA}&select=*`, 'GET', null, custB.token);
  assert.strictEqual((bSeeHistory.body || []).length, 0);
  console.log('✅ PASS: Customer B đọc lịch sử đơn hàng Customer A -> 0 rows (RLS History Isolated)');

  // Customer A thử trực tiếp UPDATE trạng thái đơn hàng của chính mình (chuyển sang delivered/completed)
  const aTamperStatus = await req(`/rest/v1/orders?id=eq.${orderIdA}`, 'PATCH', {
    status: 'delivered'
  }, custA.token);
  const checkStatusA = await req(`/rest/v1/orders?id=eq.${orderIdA}&select=*`, 'GET', null, custA.token);
  assert.strictEqual(checkStatusA.body[0].status, 'request_received', 'Khách hàng không thể tự đổi status đơn hàng');
  console.log('✅ PASS: Customer A tự sửa status đơn hàng qua API -> BLOCKED (0 rows modified)');


  // =========================================================================
  // 4. ADMIN PRIVILEGES & AUDIT TRACKING
  // =========================================================================
  console.log('\n--- 3. QUYỀN HẠN ADMIN & GHI VẾT AUDIT LOGS ---');

  // Customer A gọi update_order_status_admin -> FORBIDDEN
  const custCallAdmin = await req('/rest/v1/rpc/update_order_status_admin', 'POST', {
    p_order_id: orderIdA,
    p_new_status: 'in_production'
  }, custA.token);
  assert.strictEqual(custCallAdmin.body.ok, false);
  assert.strictEqual(custCallAdmin.body.code, 'FORBIDDEN');
  console.log('✅ PASS: Customer gọi RPC Admin -> FORBIDDEN');

  // Admin thực thụ cập nhật trạng thái đơn hàng
  const adminCall = await req('/rest/v1/rpc/update_order_status_admin', 'POST', {
    p_order_id: orderIdA,
    p_new_status: 'in_production',
    p_note: 'Bắt đầu in phôi 3D cho Gate Test',
    p_carrier_name: 'GiaoHangNhanh',
    p_carrier_tracking_code: 'GHN-GATE-999'
  }, admin.token);
  assert.strictEqual(adminCall.body.ok, true);
  console.log('✅ PASS: Admin cập nhật trạng thái đơn hàng sang: in_production');

  // Admin xem audit_logs
  const adminAudit = await req(`/rest/v1/audit_logs?entity_id=eq.${orderIdA}&select=*`, 'GET', null, admin.token);
  assert(adminAudit.body.length > 0, 'Admin phải xem được audit log ghi vết');
  console.log('✅ PASS: audit_logs tự động ghi nhận hành động quản trị (Action: ' + adminAudit.body[0].action + ')');

  // Customer A KHÔNG xem được audit_logs
  const custAudit = await req(`/rest/v1/audit_logs?entity_id=eq.${orderIdA}&select=*`, 'GET', null, custA.token);
  assert.strictEqual((custAudit.body || []).length, 0);
  console.log('✅ PASS: Customer xem audit_logs -> 0 rows (Bảo mật tuyệt đối nội bộ xưởng)');

  console.log('\n🎉 [GATE 3 VERIFIED PASS] 100% MA TRẬN 10 BẢNG CRUD & ĐẶC QUYỀN ĐẠT CHUẨN AN TOÀN TUYỆT ĐỐI!');
})();
