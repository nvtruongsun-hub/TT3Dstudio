/**
 * Test Suite: Network Drop In-Flight & Safe Idempotency Retry
 * Requirement 8: Thử lỗi mạng không rõ kết quả: backend đã tạo đơn nhưng frontend không nhận được phản hồi.
 * Kiểm tra việc gửi lại bằng idempotency key cũ và không tạo đơn trùng.
 */

const https = require('https');
const assert = require('assert');

const SUPABASE_URL = 'https://nbsumfhfxohawiuxrwqj.supabase.co';
const ANON_KEY = 'sb_publishable_axTex7YiB0DOBquiWFtR-g_L-0q8n5e';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) {
  console.warn('⚠️ CẢNH BÁO: SUPABASE_SERVICE_ROLE_KEY chưa được đặt trong biến môi trường. Test suite này yêu cầu biến môi trường để chạy teardown/setup.');
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

(async () => {
  console.log('📡 [GATE 8: IN-FLIGHT NETWORK DROP & IDEMPOTENCY RETRY] Bắt đầu kiểm tra...\n');

  // 1. Tạo user khách hàng
  const email = `retry_cust_${Date.now()}@tt3dstudio.vn`;
  const pass = 'RetryPassStrong!2026';
  const u = await req('/auth/v1/admin/users', 'POST', {
    email,
    password: pass,
    email_confirm: true,
    user_metadata: { full_name: 'Khách Hàng Retry' }
  }, SERVICE_KEY);
  console.log('u create status:', u.status, 'body:', u.body);

  const login = await req('/auth/v1/token?grant_type=password', 'POST', { email, password: pass }, ANON_KEY);
  console.log('login status:', login.status, 'body:', login.body);
  const token = login.body.access_token;
  const userId = u.body.id;
  console.log('User id from admin create:', userId, 'User id from login:', login.body.user && login.body.user.id);

  // 2. Tạo địa chỉ hợp lệ
  const addrRes = await req('/rest/v1/customer_addresses', 'POST', {
    user_id: userId,
    recipient_name: 'Khách Hàng Retry',
    recipient_phone: '0349657529',
    province_code: '42',
    province_name: 'Tỉnh Hà Tĩnh',
    ward_code: '18220',
    ward_name: 'Phường Bắc Hà',
    address_line: 'Số 99 Đường Retry',
    is_default: true
  }, token);

  console.log('addrRes status:', addrRes.status, 'body:', addrRes.body);
  const addr = (Array.isArray(addrRes.body) && addrRes.body[0]) || (await req('/rest/v1/customer_addresses?select=*', 'GET', null, token)).body[0];
  const idempotencyKey = 'inflight-retry-' + Date.now();

  console.log('--- BƯỚC 1: REQUEST ĐẦU TIÊN TỚI BACKEND ---');
  // Giả lập: Request 1 được gửi tới backend và DB xử lý thành công
  const firstFlight = await req('/rest/v1/rpc/create_order', 'POST', {
    p_items: [{ product_id: 'mw-cn-2084928', quantity: 2 }],
    p_address_id: addr.id,
    p_idempotency_key: idempotencyKey,
    p_payment_method: 'cod'
  }, token);

  assert.strictEqual(firstFlight.body.ok, true, 'Lần 1 tạo đơn phải thành công');
  const originalOrderId = firstFlight.body.order_id;
  const originalOrderNumber = firstFlight.body.order_number;
  console.log(`✅ Lần 1: Backend đã ghi nhận đơn thành công: ${originalOrderNumber} (ID: ${originalOrderId})`);

  // GIẢ LẬP SỰ CỐ: Frontend bị rớt mạng ngay khi server gửi response. Frontend không nhận được mã đơn.
  console.log('\n--- BƯỚC 2: GIẢ LẬP RỚT MẠNG IN-FLIGHT & CLIENT GỬI LẠI VỚI IDEMPOTENCY KEY CŨ ---');

  // Client thử lại lần 2 với CHÍNH XÁC idempotencyKey cũ
  const retryFlight = await req('/rest/v1/rpc/create_order', 'POST', {
    p_items: [{ product_id: 'mw-cn-2084928', quantity: 2 }],
    p_address_id: addr.id,
    p_idempotency_key: idempotencyKey, // KHÓA CŨ
    p_payment_method: 'cod'
  }, token);

  assert.strictEqual(retryFlight.body.ok, true, 'Lần gửi lại phải trả về kết quả OK');
  assert.strictEqual(retryFlight.body.is_duplicate, true, 'Backend BẮT BUỘC phải đánh dấu is_duplicate: true');
  assert.strictEqual(retryFlight.body.order_id, originalOrderId, 'Phải trả về đúng order_id ban đầu');
  assert.strictEqual(retryFlight.body.order_number, originalOrderNumber, 'Phải trả về đúng order_number ban đầu');
  console.log(`✅ Lần 2: Backend phát hiện trùng khóa, trả về đơn cũ: ${retryFlight.body.order_number} (is_duplicate: true)`);

  // Client thử lại lần 3 (Spam / Retry tự động)
  const retryFlight3 = await req('/rest/v1/rpc/create_order', 'POST', {
    p_items: [{ product_id: 'mw-cn-2084928', quantity: 2 }],
    p_address_id: addr.id,
    p_idempotency_key: idempotencyKey,
    p_payment_method: 'cod'
  }, token);
  assert.strictEqual(retryFlight3.body.is_duplicate, true);

  console.log('\n--- BƯỚC 3: KIỂM CHỨNG TÍNH TOÀN VẸN DỮ LIỆU DATABASE ---');
  // Kiểm tra số lượng dòng trong orders có idempotencyKey này
  const ordersInDb = await req(`/rest/v1/orders?idempotency_key=eq.${idempotencyKey}&select=*`, 'GET', null, token);
  assert.strictEqual(ordersInDb.body.length, 1, 'Bảng orders chỉ được phép có DUY NHẤT 1 dòng cho idempotency key này');
  console.log('✅ PASS: Bảng orders chỉ có duy nhất 1 bản ghi (KHÔNG bị nhân đôi đơn)');

  // Kiểm tra số lượng order_items
  const itemsInDb = await req(`/rest/v1/order_items?order_id=eq.${originalOrderId}&select=*`, 'GET', null, token);
  assert.strictEqual(itemsInDb.body.length, 1, 'Bảng order_items chỉ có đúng 1 dòng item');
  assert.strictEqual(itemsInDb.body[0].quantity, 2, 'Số lượng sản phẩm đúng bằng 2');
  console.log('✅ PASS: Bảng order_items không bị chèn trùng dòng, số lượng bảo toàn chính xác');

  console.log('\n🎉 [GATE 8 VERIFIED PASS] CƠ CHẾ CHỐNG TRÙNG ĐƠN KHI RỚT MẠNG IN-FLIGHT ĐẠT CHUẨN HOÀN HẢO!');
})();
