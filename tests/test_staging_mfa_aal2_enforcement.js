/**
 * T&T 3D STUDIO - STAGING MFA & AAL2 ENFORCEMENT VERIFICATION
 * Strict TDD & E2E Verification of Phase 2 Requirements
 * Target: STAGING Database (vtxzlgkvmvoushluthme) - STRICT GUARDRAILS
 */

const https = require('https');
const crypto = require('crypto');
const assert = require('assert');
const { assertNotProduction, STAGING_CONFIG } = require('./test_env_guard');

// Strictly enforce target is staging
assertNotProduction(STAGING_CONFIG.URL);

function req(path, method = 'GET', body = null, token = STAGING_CONFIG.SERVICE_KEY) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, STAGING_CONFIG.URL);
    const headers = {
      'apikey': STAGING_CONFIG.ANON_KEY,
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    };
    const payload = body ? JSON.stringify(body) : null;
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

    const request = https.request(url, { method, headers }, res => {
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

// RFC 6238 TOTP Generator (pure Node.js crypto, zero dependencies)
function base32ToBuffer(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const clean = base32.replace(/=+$/, '').toUpperCase();
  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}

function generateTOTP(secret, step = 30) {
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / step);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));

  const key = base32ToBuffer(secret);
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const codeInt = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;
  return codeInt.toString().padStart(6, '0');
}

async function runMfaVerification() {
  console.log('========================================================================');
  console.log('   KIỂM ĐỊNH BẢO VỆ ADMIN BẰNG MFA & BẮT BUỘC AAL2 TRÊN STAGING');
  console.log(`   Endpoint: ${STAGING_CONFIG.URL}`);
  console.log('========================================================================\n');

  // BƯỚC 1: KHỞI TẠO TÀI KHOẢN ADMIN VÀ CUSTOMER TRÊN STAGING
  console.log('[1/6] Khởi tạo Admin và Customer trên Staging...');
  const adminEmail = `staging_admin_${Date.now()}@tt3dstudio.vn`;
  const custEmail = `staging_cust_${Date.now()}@tt3dstudio.vn`;
  const pass = 'SuperSecurePass2026!';

  const adminCreate = await req('/auth/v1/admin/users', 'POST', {
    email: adminEmail,
    password: pass,
    email_confirm: true,
    user_metadata: { full_name: 'Quản Trị Viên Staging' }
  }, STAGING_CONFIG.SERVICE_KEY);

  const custCreate = await req('/auth/v1/admin/users', 'POST', {
    email: custEmail,
    password: pass,
    email_confirm: true,
    user_metadata: { full_name: 'Khách Hàng Staging' }
  }, STAGING_CONFIG.SERVICE_KEY);

  const adminId = adminCreate.body.id;
  const custId = custCreate.body.id;

  // Gán role admin cho adminId, customer cho custId
  await req('/rest/v1/user_roles', 'POST', { user_id: adminId, role: 'admin' }, STAGING_CONFIG.SERVICE_KEY);
  await req('/rest/v1/user_roles', 'POST', { user_id: custId, role: 'customer' }, STAGING_CONFIG.SERVICE_KEY);

  console.log(`- Admin ID: ${adminId} (${adminEmail})`);
  console.log(`- Customer ID: ${custId} (${custEmail})`);

  // BƯỚC 2: TẠO 1 ĐƠN HÀNG MẪU TRÊN STAGING ĐỂ ADMIN CẬP NHẬT
  console.log('\n[2/6] Tạo đơn hàng mẫu trên Staging...');
  const orderRes = await req('/rest/v1/orders', 'POST', [{
    user_id: custId,
    order_number: 'TT3D-STAG-0001',
    shipping_name: 'Khách Hàng Staging',
    shipping_phone: '0349657529',
    shipping_address: 'Xã Thạch Trung, TP Hà Tĩnh',
    payment_method: 'cod',
    subtotal: 139000,
    shipping_fee: 25000,
    total: 164000,
    status: 'request_received',
    idempotency_key: 'STAG-KEY-' + Date.now()
  }], STAGING_CONFIG.SERVICE_KEY);

  const queryOrder = await req('/rest/v1/orders?order_number=eq.TT3D-STAG-0001&select=id', 'GET', null, STAGING_CONFIG.SERVICE_KEY);
  const sampleOrderId = queryOrder.body[0].id;
  console.log(`- Đơn hàng mẫu ID: ${sampleOrderId}`);

  // BƯỚC 3: ĐĂNG NHẬP ADMIN (CẤP ĐỘ AAL1)
  console.log('\n[3/6] Đăng nhập Admin mật khẩu thường -> Xác minh cấp độ AAL1...');
  const loginRes = await req('/auth/v1/token?grant_type=password', 'POST', {
    email: adminEmail,
    password: pass
  }, STAGING_CONFIG.ANON_KEY);

  const aal1Token = loginRes.body.access_token;
  const tokenPayload = JSON.parse(Buffer.from(aal1Token.split('.')[1], 'base64').toString('utf8'));
  console.log(`- Phiên đăng nhập Admin ban đầu: aal = "${tokenPayload.aal}" (Cấp 1)`);
  assert.strictEqual(tokenPayload.aal, 'aal1', 'Token ban đầu phải là aal1');

  // BƯỚC 4: THỬ GỌI RPC QUẢN TRỊ BẰNG TOKEN AAL1 (CHỐNG BYPASS MFA)
  console.log('\n[4/6] Thử gọi update_order_status_admin bằng Token AAL1 (Kịch bản kẻ tấn công cố bypass MFA)...');
  const aal1RpcAttempt = await req('/rest/v1/rpc/update_order_status_admin', 'POST', {
    p_order_id: sampleOrderId,
    p_new_status: 'in_production',
    p_note: 'Cố tình gọi bằng AAL1'
  }, aal1Token);

  console.log('- Phản hồi từ Database:', aal1RpcAttempt.status, aal1RpcAttempt.body);
  assert.strictEqual(aal1RpcAttempt.body.ok, false, 'Backend BẮT BUỘC phải từ chối AAL1');
  assert.strictEqual(aal1RpcAttempt.body.code, 'MFA_REQUIRED', 'Mã lỗi trả về phải là MFA_REQUIRED');
  console.log('✅ PASS: Backend đã chặn đứng 100% token AAL1 khi gọi RPC nhạy cảm (Không thể bypass bằng DevTools/Direct RPC)!');

  // BƯỚC 5: ĐĂNG KÝ TOTP VÀ XÁC THỰC LÊN CẤP ĐỘ AAL2
  console.log('\n[5/6] Đăng ký TOTP Authenticator và giải đố (Challenge & Verify)...');
  const enrollRes = await req('/auth/v1/factors', 'POST', {
    factor_type: 'totp',
    friendly_name: 'TT3D Admin Authenticator',
    issuer: 'TT3D Studio'
  }, aal1Token);

  const factorId = enrollRes.body.id;
  const totpSecret = enrollRes.body.totp.secret;
  console.log(`- Factor ID: ${factorId}`);

  // Tạo mã 6 số TOTP chuẩn
  const otpCode = generateTOTP(totpSecret);
  console.log(`- Mã TOTP 6 số sinh ra từ ứng dụng Authenticator: ${otpCode}`);

  // Challenge
  const challengeRes = await req(`/auth/v1/factors/${factorId}/challenge`, 'POST', {}, aal1Token);
  const challengeId = challengeRes.body.id;

  // Verify
  const verifyRes = await req(`/auth/v1/factors/${factorId}/verify`, 'POST', {
    challenge_id: challengeId,
    code: otpCode
  }, aal1Token);

  const aal2Token = verifyRes.body.access_token;
  const aal2Payload = JSON.parse(Buffer.from(aal2Token.split('.')[1], 'base64').toString('utf8'));
  console.log(`- Phiên đăng nhập sau khi xác thực 2 bước: aal = "${aal2Payload.aal}" (Cấp 2)`);
  assert.strictEqual(aal2Payload.aal, 'aal2', 'Token sau khi verify phải được nâng lên aal2');
  console.log('✅ PASS: Tài khoản đã đạt cấp độ xác thực AAL2 thành công!');

  // BƯỚC 6: GỌI LẠI RPC QUẢN TRỊ BẰNG TOKEN AAL2
  console.log('\n[6/6] Gọi update_order_status_admin bằng Token AAL2 chính chủ...');
  const aal2RpcAttempt = await req('/rest/v1/rpc/update_order_status_admin', 'POST', {
    p_order_id: sampleOrderId,
    p_new_status: 'in_production',
    p_note: 'Đã hoàn tất xác thực AAL2'
  }, aal2Token);

  console.log('- Phản hồi từ Database:', aal2RpcAttempt.status, aal2RpcAttempt.body);
  assert.strictEqual(aal2RpcAttempt.body.ok, true, 'Backend phải chấp nhận phiên AAL2');
  assert.strictEqual(aal2RpcAttempt.body.new_status, 'in_production');

  // Kiểm tra audit_logs xem có ghi vết AAL2 không
  const auditRes = await req(`/rest/v1/audit_logs?entity_id=eq.${sampleOrderId}&select=*`, 'GET', null, STAGING_CONFIG.SERVICE_KEY);
  console.log('- Ghi vết Audit Logs:', auditRes.body[0].action, 'AAL ghi nhận:', auditRes.body[0].payload.aal);
  assert.strictEqual(auditRes.body[0].payload.aal, 'aal2', 'Audit log phải ghi nhận phiên AAL2');

  console.log('\n🎉 [PHASE 2 VERIFIED PASS] TOÀN BỘ QUY TRÌNH BẢO VỆ ADMIN BẰNG MFA & AAL2 ĐÃ HOÀN TẤT VÀ ĐẠT CHUẨN AN TOÀN TUYỆT ĐỐI!');
}

runMfaVerification().catch(err => {
  console.error('\n❌ TEST THẤT BẠI:', err);
  process.exit(1);
});
