/**
 * T&T 3D STUDIO - STAGING MFA & AAL2 ENFORCEMENT VERIFICATION
 * Strict TDD & E2E Verification of Phase 2 Requirements
 * Target: STAGING Database (vtxzlgkvmvoushluthme) - STRICT GUARDRAILS
 * 
 * Verifies:
 * 1. Staff role with AAL1 is rejected by update_order_status_admin (MFA_REQUIRED)
 * 2. Staff role with AAL1 is rejected by direct table PATCH RLS
 * 3. Staff role upgraded to AAL2 succeeds in updating orders
 * 4. Admin role with AAL1 is rejected (MFA_REQUIRED)
 * 5. Admin role with AAL2 can generate 8 emergency recovery codes
 * 6. Admin can redeem emergency recovery code once; replay is rejected
 * 7. Customer role cannot generate recovery codes (FORBIDDEN)
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
  console.log('   KIỂM ĐỊNH BẢO VỆ ADMIN & STAFF BẰNG MFA / AAL2 TRÊN STAGING');
  console.log(`   Target Endpoint: ${STAGING_CONFIG.URL}`);
  console.log('========================================================================\n');

  const ts = Date.now();
  const pass = 'SuperSecurePass2026!';

  // BƯỚC 1: KHỞI TẠO TÀI KHOẢN ADMIN, STAFF, VÀ CUSTOMER TRÊN STAGING
  console.log('[1/7] Khởi tạo Admin, Staff và Customer trên Staging...');
  const adminEmail = `staging_admin_${ts}@tt3dstudio.vn`;
  const staffEmail = `staging_staff_${ts}@tt3dstudio.vn`;
  const custEmail = `staging_cust_${ts}@tt3dstudio.vn`;

  const adminCreate = await req('/auth/v1/admin/users', 'POST', {
    email: adminEmail, password: pass, email_confirm: true,
    user_metadata: { full_name: 'Quản Trị Viên Staging' }
  });
  const staffCreate = await req('/auth/v1/admin/users', 'POST', {
    email: staffEmail, password: pass, email_confirm: true,
    user_metadata: { full_name: 'Nhân Viên Xưởng Staging' }
  });
  const custCreate = await req('/auth/v1/admin/users', 'POST', {
    email: custEmail, password: pass, email_confirm: true,
    user_metadata: { full_name: 'Khách Hàng Staging' }
  });

  const adminId = adminCreate.body.id;
  const staffId = staffCreate.body.id;
  const custId = custCreate.body.id;

  // Gán role
  await req('/rest/v1/user_roles', 'POST', { user_id: adminId, role: 'admin' });
  await req('/rest/v1/user_roles', 'POST', { user_id: staffId, role: 'staff' });
  await req('/rest/v1/user_roles', 'POST', { user_id: custId, role: 'customer' });

  console.log(`- Admin ID: ${adminId} (${adminEmail})`);
  console.log(`- Staff ID: ${staffId} (${staffEmail})`);
  console.log(`- Customer ID: ${custId} (${custEmail})`);

  // BƯỚC 2: TẠO 1 ĐƠN HÀNG MẪU TRÊN STAGING
  console.log('\n[2/7] Tạo đơn hàng mẫu trên Staging...');
  await req('/rest/v1/orders', 'POST', [{
    user_id: custId,
    order_number: `TT3D-MFA-${ts}`,
    shipping_name: 'Khách Hàng Staging',
    shipping_phone: '0349657529',
    shipping_address: 'Hà Nội, Việt Nam',
    payment_method: 'cod',
    subtotal: 139000,
    shipping_fee: 25000,
    total: 164000,
    status: 'request_received',
    idempotency_key: `STAG-MFA-${ts}`
  }]);

  const queryOrder = await req(`/rest/v1/orders?order_number=eq.TT3D-MFA-${ts}&select=id`);
  const sampleOrderId = queryOrder.body[0].id;
  console.log(`- Đơn hàng mẫu ID: ${sampleOrderId}`);

  // BƯỚC 3: KIỂM TRA STAFF VỚI TOKEN AAL1 (PHẢI BỊ CHẶN)
  console.log('\n[3/7] Đăng nhập Staff (AAL1) -> Thử gọi update_order_status_admin...');
  const staffLogin = await req('/auth/v1/token?grant_type=password', 'POST', {
    email: staffEmail, password: pass
  }, STAGING_CONFIG.ANON_KEY);
  const staffAal1Token = staffLogin.body.access_token;

  const staffRpcAal1 = await req('/rest/v1/rpc/update_order_status_admin', 'POST', {
    p_order_id: sampleOrderId,
    p_new_status: 'in_production',
    p_note: 'Staff cố gọi bằng AAL1'
  }, staffAal1Token);

  console.log('- Phản hồi từ RPC:', staffRpcAal1.body);
  assert.strictEqual(staffRpcAal1.body.ok, false, 'Staff AAL1 bắt buộc phải bị từ chối');
  assert.strictEqual(staffRpcAal1.body.code, 'MFA_REQUIRED', 'Mã lỗi phải là MFA_REQUIRED');
  console.log('✅ PASS: Backend đã chặn đứng Staff sử dụng token AAL1!');

  // Thử Direct REST PATCH trên table orders bằng Staff AAL1 (RLS check)
  console.log('- Thử Direct REST PATCH vào table orders bằng Staff AAL1...');
  const staffDirectPatch = await req(`/rest/v1/orders?id=eq.${sampleOrderId}`, 'PATCH', {
    status: 'in_production'
  }, staffAal1Token);
  console.log('- Phản hồi Direct PATCH:', staffDirectPatch.status, staffDirectPatch.body);
  // Status 204 or 200 with empty rows or error, verify order didn't change
  const verifyOrderUnchanged = await req(`/rest/v1/orders?id=eq.${sampleOrderId}&select=status`);
  assert.strictEqual(verifyOrderUnchanged.body[0].status, 'request_received', 'Trạng thái đơn hàng KHÔNG được thay đổi khi gọi bằng AAL1');
  console.log('✅ PASS: RLS đã chặn đứng Direct PATCH bảng orders khi token chưa đạt AAL2!');

  // BƯỚC 4: NÂNG CẤP STAFF LÊN AAL2 VÀ THỰC HIỆN CẬP NHẬT
  console.log('\n[4/7] Đăng ký TOTP cho Staff -> Nâng cấp lên AAL2 -> Thực hiện cập nhật...');
  const staffEnroll = await req('/auth/v1/factors', 'POST', {
    factor_type: 'totp', friendly_name: 'Staff Authenticator', issuer: 'TT3D Studio'
  }, staffAal1Token);
  const staffTotpCode = generateTOTP(staffEnroll.body.totp.secret);
  const staffChallenge = await req(`/auth/v1/factors/${staffEnroll.body.id}/challenge`, 'POST', {}, staffAal1Token);
  const staffVerify = await req(`/auth/v1/factors/${staffEnroll.body.id}/verify`, 'POST', {
    challenge_id: staffChallenge.body.id, code: staffTotpCode
  }, staffAal1Token);

  const staffAal2Token = staffVerify.body.access_token;
  const staffRpcAal2 = await req('/rest/v1/rpc/update_order_status_admin', 'POST', {
    p_order_id: sampleOrderId,
    p_new_status: 'in_production',
    p_note: 'Staff đã xác thực AAL2'
  }, staffAal2Token);

  console.log('- Phản hồi từ RPC sau khi AAL2:', staffRpcAal2.body);
  assert.strictEqual(staffRpcAal2.body.ok, true, 'Staff AAL2 phải cập nhật thành công');
  console.log('✅ PASS: Staff với AAL2 cập nhật trạng thái đơn hàng thành công!');

  // BƯỚC 5: KIỂM TRA ADMIN AAL1 BỊ CHẶN & NÂNG CẤP AAL2
  console.log('\n[5/7] Đăng nhập Admin (AAL1) -> Kiểm tra bị chặn -> Nâng cấp AAL2...');
  const adminLogin = await req('/auth/v1/token?grant_type=password', 'POST', {
    email: adminEmail, password: pass
  }, STAGING_CONFIG.ANON_KEY);
  const adminAal1Token = adminLogin.body.access_token;

  const adminRpcAal1 = await req('/rest/v1/rpc/update_order_status_admin', 'POST', {
    p_order_id: sampleOrderId,
    p_new_status: 'completed',
    p_note: 'Admin cố gọi AAL1'
  }, adminAal1Token);
  assert.strictEqual(adminRpcAal1.body.ok, false, 'Admin AAL1 bắt buộc phải bị từ chối');
  assert.strictEqual(adminRpcAal1.body.code, 'MFA_REQUIRED');
  console.log('✅ PASS: Admin AAL1 bị chặn đứng bởi RPC update_order_status_admin.');

  const adminEnroll = await req('/auth/v1/factors', 'POST', {
    factor_type: 'totp', friendly_name: 'Admin Authenticator', issuer: 'TT3D Studio'
  }, adminAal1Token);
  const adminTotpCode = generateTOTP(adminEnroll.body.totp.secret);
  const adminChallenge = await req(`/auth/v1/factors/${adminEnroll.body.id}/challenge`, 'POST', {}, adminAal1Token);
  const adminVerify = await req(`/auth/v1/factors/${adminEnroll.body.id}/verify`, 'POST', {
    challenge_id: adminChallenge.body.id, code: adminTotpCode
  }, adminAal1Token);
  const adminAal2Token = adminVerify.body.access_token;
  console.log('✅ PASS: Admin đã hoàn tất nâng cấp lên AAL2.');

  // BƯỚC 6: XÂY DỰNG & KIỂM THỬ QUY TRÌNH MÃ DỰ PHÒNG KHÔI PHỤC (RECOVERY CODES)
  console.log('\n[6/7] Kiểm thử quy trình cấp phát và sử dụng mã dự phòng khẩn cấp...');
  // AAL1 gọi tạo mã dự phòng -> Phải bị từ chối
  const failGen = await req('/rest/v1/rpc/generate_recovery_codes_admin', 'POST', {}, adminAal1Token);
  assert.strictEqual(failGen.body.ok, false);
  assert.strictEqual(failGen.body.code, 'MFA_REQUIRED');
  console.log('✅ PASS: AAL1 không thể tạo mã dự phòng (phòng chống leo thang đặc quyền).');

  // AAL2 gọi tạo mã dự phòng -> Nhận 8 mã
  const successGen = await req('/rest/v1/rpc/generate_recovery_codes_admin', 'POST', {}, adminAal2Token);
  console.log('- Kết quả tạo mã dự phòng:', successGen.body.ok, 'Số lượng mã:', successGen.body.codes ? successGen.body.codes.length : 0);
  assert.strictEqual(successGen.body.ok, true);
  assert.strictEqual(successGen.body.codes.length, 8, 'Hệ thống phải sinh đúng 8 mã dự phòng');
  const backupCodes = successGen.body.codes;
  console.log(`- Mã mẫu sinh ra: ${backupCodes[0]}`);

  // Thử redeem mã đầu tiên
  const redeemRes = await req('/rest/v1/rpc/redeem_recovery_code_admin', 'POST', {
    p_code: backupCodes[0]
  }, adminAal1Token); // Được phép gọi bằng AAL1 khi khôi phục tài khoản
  console.log('- Kết quả sử dụng mã dự phòng lần đầu:', redeemRes.body);
  assert.strictEqual(redeemRes.body.ok, true, 'Redeem mã hợp lệ phải thành công');

  // Thử dùng lại mã đó lần thứ hai (Chống Replay Attack)
  const replayRes = await req('/rest/v1/rpc/redeem_recovery_code_admin', 'POST', {
    p_code: backupCodes[0]
  }, adminAal1Token);
  console.log('- Kết quả dùng lại mã đã sử dụng:', replayRes.body);
  assert.strictEqual(replayRes.body.ok, false, 'Không được phép dùng lại mã cũ');
  assert.strictEqual(replayRes.body.code, 'INVALID_RECOVERY_CODE');
  console.log('✅ PASS: Mã dự phòng chỉ dùng được 1 lần duy nhất; Replay attack bị chặn đứng 100%!');

  // BƯỚC 7: KIỂM TRA PHÂN QUYỀN KHÁCH HÀNG (CUSTOMER)
  console.log('\n[7/7] Kiểm tra vai trò Customer gọi các API quản trị đặc quyền...');
  const custLogin = await req('/auth/v1/token?grant_type=password', 'POST', {
    email: custEmail, password: pass
  }, STAGING_CONFIG.ANON_KEY);
  const custToken = custLogin.body.access_token;

  const custGenAttempt = await req('/rest/v1/rpc/generate_recovery_codes_admin', 'POST', {}, custToken);
  assert.strictEqual(custGenAttempt.body.ok, false);
  assert.strictEqual(custGenAttempt.body.code, 'FORBIDDEN');

  const custUpdateAttempt = await req('/rest/v1/rpc/update_order_status_admin', 'POST', {
    p_order_id: sampleOrderId, p_new_status: 'cancelled'
  }, custToken);
  assert.strictEqual(custUpdateAttempt.body.ok, false);
  assert.strictEqual(custUpdateAttempt.body.code, 'FORBIDDEN');
  console.log('✅ PASS: Vai trò Customer bị từ chối 100% ở mọi hàm quản trị!');

  console.log('\n🎉 [PHASE 2 VERIFIED PASS] BẢO VỆ MFA CHO CẢ ADMIN VÀ STAFF + QUY TRÌNH KHÔI PHỤC ĐÃ ĐƯỢC KIỂM CHỨNG TOÀN DIỆN VÀ HOÀN HẢO!');
}

runMfaVerification().catch(err => {
  console.error('\n❌ TEST THẤT BẠI:', err);
  process.exit(1);
});
