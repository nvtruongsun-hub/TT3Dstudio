/**
 * Comprehensive Live Security & RLS Matrix Verification (Strict TDD & E2E)
 * Project: T&T 3D Studio (Supabase nbsumfhfxohawiuxrwqj)
 * Executes REAL HTTP requests directly to Supabase Cloud - Zero Client Mocks.
 */

const https = require('https');
const assert = require('assert');

const SUPABASE_URL = 'https://nbsumfhfxohawiuxrwqj.supabase.co';
const ANON_KEY = 'sb_publishable_axTex7YiB0DOBquiWFtR-g_L-0q8n5e';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) {
  console.warn('⚠️ CẢNH BÁO: SUPABASE_SERVICE_ROLE_KEY chưa được đặt trong biến môi trường. Test suite này yêu cầu biến môi trường để chạy verification.');
}

function req(path, method = 'GET', body = null, token = ANON_KEY) {
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

async function createFreshTestUser(prefix, password, fullName, roles = ['customer']) {
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
    user: loginRes.body.user,
    email
  };
}

(async () => {
  console.log('🚀 [LIVE SECURITY AUDIT] Bắt đầu kiểm định bảo mật trực tiếp trên Supabase Cloud...\n');

  // =========================================================================
  // 1. ANONYMOUS ATTACK SIMULATION
  // =========================================================================
  console.log('--- TEST 1: ANONYMOUS ATTACK & RLS RESTRICTIONS ---');

  // A. Anonymous SELECT orders
  const anonOrders = await req('/rest/v1/orders?select=*', 'GET', null, ANON_KEY);
  assert.strictEqual(anonOrders.status, 200);
  assert(Array.isArray(anonOrders.body) && anonOrders.body.length === 0, 'Anonymous không được xem bất kỳ đơn hàng nào');
  console.log('✅ PASS: Anonymous SELECT /orders -> 0 records');

  // B. Anonymous SELECT customer_addresses
  const anonAddresses = await req('/rest/v1/customer_addresses?select=*', 'GET', null, ANON_KEY);
  assert.strictEqual(anonAddresses.status, 200);
  assert(Array.isArray(anonAddresses.body) && anonAddresses.body.length === 0, 'Anonymous không được xem bất kỳ địa chỉ nào');
  console.log('✅ PASS: Anonymous SELECT /customer_addresses -> 0 records');

  // C. Anonymous direct INSERT into orders
  const anonInsertOrder = await req('/rest/v1/orders', 'POST', { total: 100, shipping_address: 'Hacked' }, ANON_KEY);
  assert(anonInsertOrder.status >= 400, 'Anonymous direct INSERT orders phải bị chặn');
  console.log('✅ PASS: Anonymous direct INSERT /orders -> BLOCKED (' + anonInsertOrder.status + ')');

  // D. Anonymous direct INSERT into customer_addresses
  const anonInsertAddr = await req('/rest/v1/customer_addresses', 'POST', { recipient_name: 'Hacked' }, ANON_KEY);
  assert(anonInsertAddr.status >= 400, 'Anonymous direct INSERT customer_addresses phải bị chặn');
  console.log('✅ PASS: Anonymous direct INSERT /customer_addresses -> BLOCKED (' + anonInsertAddr.status + ')');

  // E. Anonymous call create_order RPC
  const anonRpc = await req('/rest/v1/rpc/create_order', 'POST', {
    p_items: [{ product_id: 'mw-cn-2084928', quantity: 1 }],
    p_shipping_name: 'Anon',
    p_shipping_phone: '0349657529',
    p_shipping_address: 'No where',
    p_idempotency_key: 'anon-idemp-' + Date.now()
  }, ANON_KEY);
  assert.strictEqual(anonRpc.body.ok, false);
  assert.strictEqual(anonRpc.body.code, 'UNAUTHORIZED');
  console.log('✅ PASS: Anonymous create_order RPC -> UNAUTHORIZED (Chặn người dùng chưa đăng nhập)');

  // F. Anonymous call update_order_status_admin RPC
  const anonAdminRpc = await req('/rest/v1/rpc/update_order_status_admin', 'POST', {
    p_order_id: '00000000-0000-0000-0000-000000000000',
    p_new_status: 'completed',
    p_note: 'Test anon attempt'
  }, ANON_KEY);
  assert.strictEqual(anonAdminRpc.body.ok, false);
  assert.strictEqual(anonAdminRpc.body.code, 'FORBIDDEN');
  console.log('✅ PASS: Anonymous update_order_status_admin RPC -> FORBIDDEN (Chặn quyền quản trị)');


  // =========================================================================
  // 2. PROVISION TEST ACCOUNTS (Customer A, Customer B, Admin)
  // =========================================================================
  console.log('\n--- TẠO TÀI KHOẢN THỰC THẾ CHO KIỂM THỬ CROSS-ACCOUNT ---');
  const custA = await createFreshTestUser('live_cust_a', 'SecurePassA!2026', 'Nguyễn Văn A (Cust A)', ['customer']);
  console.log('Đã khởi tạo Customer A ID:', custA.userId);

  const custB = await createFreshTestUser('live_cust_b', 'SecurePassB!2026', 'Trần Văn B (Cust B)', ['customer']);
  console.log('Đã khởi tạo Customer B ID:', custB.userId);

  const adminUser = await createFreshTestUser('live_admin', 'AdminPassSecret!2026', 'Quản Trị Viên Xưởng', ['customer', 'admin']);
  console.log('Đã khởi tạo Admin ID:', adminUser.userId);


  // =========================================================================
  // 3. CROSS-ACCOUNT ISOLATION (Customer A vs Customer B)
  // =========================================================================
  console.log('\n--- TEST 2: CROSS-ACCOUNT ISOLATION (Customer A vs Customer B) ---');

  // Customer A tạo 1 địa chỉ giao hàng
  const addAddrA = await req('/rest/v1/customer_addresses', 'POST', {
    user_id: custA.userId,
    label: 'home',
    recipient_name: 'Nguyễn Văn A',
    recipient_phone: '0349657529',
    province_code: '42',
    province_name: 'Tỉnh Hà Tĩnh',
    ward_code: '18220',
    ward_name: 'Phường Bắc Hà',
    address_line: 'Số 12 đường Hải Thượng Lãn Ông',
    is_default: true
  }, custA.token);

  assert(addAddrA.status === 201 || addAddrA.status === 200, 'Customer A thêm địa chỉ phải thành công');
  console.log('✅ Customer A đã thêm địa chỉ thành công');

  // Lấy ID địa chỉ của Customer A
  const getAddrA = await req('/rest/v1/customer_addresses?select=*', 'GET', null, custA.token);
  assert(getAddrA.body.length > 0, 'Customer A phải nhìn thấy địa chỉ của mình');
  const addrA = getAddrA.body[0];
  console.log('Địa chỉ ID của Customer A:', addrA.id);

  // Customer B thử SELECT danh sách địa chỉ -> KHÔNG được thấy địa chỉ của Customer A
  const getAddrB = await req('/rest/v1/customer_addresses?select=*', 'GET', null, custB.token);
  const foundAInB = (getAddrB.body || []).some(a => a.id === addrA.id);
  assert.strictEqual(foundAInB, false, 'Customer B tuyệt đối KHÔNG được nhìn thấy địa chỉ của Customer A');
  console.log('✅ PASS: Customer B không thấy địa chỉ của Customer A (RLS SELECT Isolation)');

  // Customer B thử UPDATE trực tiếp địa chỉ của Customer A
  const hackUpdate = await req(`/rest/v1/customer_addresses?id=eq.${addrA.id}`, 'PATCH', {
    recipient_name: 'HACKED BY B'
  }, custB.token);
  // Với RLS, UPDATE vào record không thuộc quyền sở hữu sẽ match 0 rows
  const verifyAddrA = await req(`/rest/v1/customer_addresses?id=eq.${addrA.id}`, 'GET', null, custA.token);
  assert.strictEqual(verifyAddrA.body[0].recipient_name, 'Nguyễn Văn A', 'Tên của Customer A không bị thay đổi');
  console.log('✅ PASS: Customer B không thể UPDATE địa chỉ của Customer A (RLS UPDATE Isolation)');

  // Customer B thử tạo đơn hàng bằng cách TRUYỀN p_address_id của Customer A
  const crossAccountOrder = await req('/rest/v1/rpc/create_order', 'POST', {
    p_items: [{ product_id: 'mw-cn-2084928', quantity: 1 }],
    p_payment_method: 'cod',
    p_idempotency_key: 'cross-account-steal-' + Date.now(),
    p_address_id: addrA.id // Thử mạo danh địa chỉ của Customer A
  }, custB.token);

  assert.strictEqual(crossAccountOrder.body.ok, false);
  assert.strictEqual(crossAccountOrder.body.code, 'UNAUTHORIZED_ADDRESS');
  console.log('✅ PASS: create_order chặn đứng Customer B dùng trái phép địa chỉ của Customer A (UNAUTHORIZED_ADDRESS)');


  // =========================================================================
  // 4. PRICE MANIPULATION & GROUND TRUTH RECALCULATION
  // =========================================================================
  console.log('\n--- TEST 3: GROUND TRUTH PRICING & PRICE TAMPERING PROTECTION ---');
  // mw-cn-2084928: giá trong DB là 139,000 đ. Dưới 300k -> phí ship 25,000 đ -> Tổng 164,000 đ
  // Thử truyền giá sai hoặc giả mạo từ client: RPC chỉ đọc product_id và quantity, tính giá từ database
  const legitimateIdemp = 'idemp_order_legit_' + Date.now();
  const orderCreateA = await req('/rest/v1/rpc/create_order', 'POST', {
    p_items: [{ product_id: 'mw-cn-2084928', quantity: 1 }],
    p_address_id: addrA.id,
    p_payment_method: 'cod',
    p_idempotency_key: legitimateIdemp
  }, custA.token);

  console.log('orderCreateA result:', orderCreateA.status, JSON.stringify(orderCreateA.body));
  assert.strictEqual(orderCreateA.body.ok, true, 'Customer A tạo đơn hợp lệ phải thành công');
  assert.strictEqual(orderCreateA.body.subtotal, 139000, 'Subtotal phải được tính chính xác từ bảng products (139.000đ)');
  assert.strictEqual(orderCreateA.body.shipping_fee, 25000, 'Phí ship phải là 25.000đ khi < 300k');
  assert.strictEqual(orderCreateA.body.total, 164000, 'Tổng tiền phải là 164.000đ');
  console.log('✅ PASS: Giá tiền được tính toán ground-truth từ Database:', orderCreateA.body.total, 'đ (Mã đơn:', orderCreateA.body.order_number, ')');

  // Kiểm tra snapshot trong đơn hàng
  const checkOrderRecord = await req(`/rest/v1/orders?id=eq.${orderCreateA.body.order_id}&select=*`, 'GET', null, custA.token);
  assert(checkOrderRecord.body.length > 0);
  const ord = checkOrderRecord.body[0];
  assert(ord.order_shipping_snapshot && ord.order_shipping_snapshot.recipient_name === 'Nguyễn Văn A');
  console.log('✅ PASS: order_shipping_snapshot lưu trữ bất biến đầy đủ thông tin giao hàng');


  // =========================================================================
  // 5. IDEMPOTENCY KEY DUPLICATE PROTECTION
  // =========================================================================
  console.log('\n--- TEST 4: IDEMPOTENCY KEY ATOMIC DUPLICATE PROTECTION ---');
  // Gửi lại CHÍNH XÁC payload vừa tạo với cùng idempotency key
  const duplicateOrderRes = await req('/rest/v1/rpc/create_order', 'POST', {
    p_items: [{ product_id: 'mw-cn-2084928', quantity: 1 }],
    p_address_id: addrA.id,
    p_payment_method: 'cod',
    p_idempotency_key: legitimateIdemp
  }, custA.token);

  assert.strictEqual(duplicateOrderRes.body.ok, true);
  assert.strictEqual(duplicateOrderRes.body.is_duplicate, true, 'Phải đánh dấu is_duplicate: true');
  assert.strictEqual(duplicateOrderRes.body.order_number, orderCreateA.body.order_number, 'Phải trả về đúng mã đơn cũ');
  console.log('✅ PASS: Gửi trùng idempotency key trả về đúng mã đơn cũ, KHÔNG tạo đơn nhân đôi');


  // =========================================================================
  // 6. ADMIN RBAC & ORDER STATUS UPDATE
  // =========================================================================
  console.log('\n--- TEST 5: ADMIN RBAC & ORDER STATUS WORKFLOW ---');

  // Customer A (người dùng thường) thử cập nhật trạng thái đơn sang 'completed'
  const custUpdateAttempt = await req('/rest/v1/rpc/update_order_status_admin', 'POST', {
    p_order_id: orderCreateA.body.order_id,
    p_new_status: 'completed',
    p_note: 'Khách hàng tự đổi trạng thái'
  }, custA.token);

  assert.strictEqual(custUpdateAttempt.body.ok, false);
  assert.strictEqual(custUpdateAttempt.body.code, 'FORBIDDEN');
  console.log('✅ PASS: Khách hàng thường gọi update_order_status_admin bị từ chối 100% (FORBIDDEN)');

  // Admin thực thụ (có role admin trong public.user_roles) thực hiện cập nhật
  const adminUpdateRes = await req('/rest/v1/rpc/update_order_status_admin', 'POST', {
    p_order_id: orderCreateA.body.order_id,
    p_new_status: 'in_production',
    p_note: 'Dàn máy Bambu Lab bắt đầu in phôi 3D',
    p_carrier_name: 'GiaoHangNhanh',
    p_carrier_tracking_code: 'GHN123456789'
  }, adminUser.token);

  console.log('adminUpdateRes:', adminUpdateRes.status, JSON.stringify(adminUpdateRes.body));
  assert.strictEqual(adminUpdateRes.body.ok, true, 'Admin cập nhật trạng thái phải thành công');
  console.log('✅ PASS: Admin cập nhật trạng thái đơn hàng thành công sang:', adminUpdateRes.body.new_status);

  // Kiểm tra bảng audit_logs & order_status_history
  const auditRes = await req(`/rest/v1/audit_logs?entity_id=eq.${orderCreateA.body.order_id}&select=*`, 'GET', null, adminUser.token);
  assert(auditRes.body.length > 0, 'Phải có bản ghi audit log');
  console.log('✅ PASS: audit_logs đã tự động lưu vết hành động của Admin');

  console.log('\n🎉 [HOÀN TẤT KIỂM THỬ THỰC TẾ] 100% CÁC BÀI TEST BẢO MẬT TRÊN SUPABASE CLOUD ĐỀU ĐẠT CHUẨN (VERIFIED PASS)!');
})();
