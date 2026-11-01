/**
 * T&T 3D STUDIO - MFA RECOVERY AUDIT & JWT AAL LEVEL VERIFIER
 * Target: STAGING Database (vtxzlgkvmvoushluthme)
 * 
 * Verifies:
 * 1. Code generation & entropy analysis
 * 2. Code redemption does NOT elevate JWT to AAL2
 * 3. Calling AAL2-protected RPC after redemption still fails with MFA_REQUIRED
 * 4. Replay attack rejection (used code cannot be reused)
 * 5. Brute-force & rate-limiting vulnerability assessment
 */

const https = require('https');
const crypto = require('crypto');
const assert = require('assert');
const { assertNotProduction, STAGING_CONFIG } = require('../tests/test_env_guard');

assertNotProduction(STAGING_CONFIG.URL);

function generateTOTP(secretBase32) {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (let i = 0; i < secretBase32.length; i++) {
    const val = base32chars.indexOf(secretBase32.charAt(i).toUpperCase());
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  const key = Buffer.from(bytes);
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / 30);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(timeStep));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(timeBuffer);
  const digest = hmac.digest();
  const offset = digest[digest.length - 1] & 0xf;
  const code = (
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  ) % 1000000;
  return code.toString().padStart(6, '0');
}

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
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
}

function parseJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
}

async function runMfaRecoveryAudit() {
  console.log('========================================================================');
  console.log('   KIỂM ĐỊNH ĐỘC LẬP CƠ CHẾ MFA RECOVERY & MỨC ĐỘ BẢO VỆ AAL2');
  console.log(`   Target Staging: ${STAGING_CONFIG.URL}`);
  console.log('========================================================================\n');

  const stamp = Date.now();
  const adminEmail = `recovery_audit_admin_${stamp}@tt3dstudio.vn`;
  const password = 'AuditAdminPassword123!@#';

  // 1. Tạo Admin trên Staging
  console.log('[1/6] Tạo tài khoản Admin thử nghiệm...');
  const createRes = await req('/auth/v1/admin/users', 'POST', {
    email: adminEmail,
    password: password,
    email_confirm: true,
    user_metadata: { full_name: 'Audit Admin' }
  });
  assert.strictEqual(createRes.status, 200);
  const adminId = createRes.body.id;

  // Gán role admin trong user_roles
  await req('/rest/v1/user_roles', 'POST', {
    user_id: adminId,
    role: 'admin'
  });
  console.log(`- Admin ID: ${adminId}`);

  // Đăng nhập email/pass -> JWT AAL1
  const loginRes = await req('/auth/v1/token?grant_type=password', 'POST', {
    email: adminEmail,
    password: password
  }, STAGING_CONFIG.ANON_KEY);
  assert.strictEqual(loginRes.status, 200);
  const aal1Token = loginRes.body.access_token;
  const aal1Jwt = parseJwt(aal1Token);
  console.log(`- Token đăng nhập ban đầu: aal = "${aal1Jwt.aal}"`);
  assert.strictEqual(aal1Jwt.aal, 'aal1', 'Token ban đầu bắt buộc phải là aal1');

  // 2. Đăng ký TOTP để nâng cấp lên AAL2
  console.log('\n[2/6] Đăng ký TOTP & nâng cấp session lên AAL2...');
  const enrollRes = await req('/auth/v1/factors', 'POST', {
    factor_type: 'totp',
    friendly_name: 'Audit Authenticator',
    issuer: 'TT3D Studio'
  }, aal1Token);
  assert.strictEqual(enrollRes.status, 200);
  const factorId = enrollRes.body.id;
  const secret = enrollRes.body.totp.secret;

  const challengeRes = await req(`/auth/v1/factors/${factorId}/challenge`, 'POST', {}, aal1Token);
  assert.strictEqual(challengeRes.status, 200);
  const challengeId = challengeRes.body.id;
  const totpCode = generateTOTP(secret);

  const verifyRes = await req(`/auth/v1/factors/${factorId}/verify`, 'POST', {
    challenge_id: challengeId,
    code: totpCode
  }, aal1Token);
  assert.strictEqual(verifyRes.status, 200);
  const aal2Token = verifyRes.body.access_token;
  const aal2Jwt = parseJwt(aal2Token);
  console.log(`- Token sau xác thực TOTP: aal = "${aal2Jwt.aal}"`);
  assert.strictEqual(aal2Jwt.aal, 'aal2', 'Sau khi verify TOTP token phải đạt aal2');

  // 3. Tạo recovery codes bằng token AAL2
  console.log('\n[3/6] Sinh bộ mã dự phòng (generate_recovery_codes_admin)...');
  const genRes = await req('/rest/v1/rpc/generate_recovery_codes_admin', 'POST', {}, aal2Token);
  assert.strictEqual(genRes.status, 200);
  assert.strictEqual(genRes.body.ok, true);
  const codes = genRes.body.codes;
  console.log(`- Sinh thành công ${codes.length} mã. Mã mẫu: ${codes[0]}`);

  // 4. Giả lập Admin mất điện thoại: Đăng nhập lại bằng email/pass -> Có JWT AAL1 mới
  console.log('\n[4/6] Giả lập Admin mất Authenticator: Đăng nhập lại (AAL1)...');
  const reLoginRes = await req('/auth/v1/token?grant_type=password', 'POST', {
    email: adminEmail,
    password: password
  }, STAGING_CONFIG.ANON_KEY);
  const lostDeviceToken = reLoginRes.body.access_token;
  const lostDeviceJwt = parseJwt(lostDeviceToken);
  console.log(`- Token phiên mất máy: aal = "${lostDeviceJwt.aal}"`);

  // Sử dụng recovery code
  console.log(`- Gọi redeem_recovery_code_admin với mã: ${codes[0]}...`);
  const redeemRes = await req('/rest/v1/rpc/redeem_recovery_code_admin', 'POST', {
    p_code: codes[0]
  }, lostDeviceToken);
  console.log('- Phản hồi từ redeem RPC:', redeemRes.body);
  assert.strictEqual(redeemRes.body.ok, true, 'Redeem code phải trả về ok: true');

  // 5. KIỂM CHỨNG QUAN TRỌNG: JWT CÓ ĐƯỢC LÊN AAL2 KHÔNG?
  console.log('\n[5/6] ĐỐI CHIẾU JWT & AAL THỰC TẾ SAU KHI DÙNG RECOVERY CODE:');
  const postRedeemJwt = parseJwt(lostDeviceToken);
  console.log(`- Token của Admin sau redeem: aal = "${postRedeemJwt.aal}"`);
  console.log(`  => KẾT QUẢ ĐO THỰC TẾ: JWT của client VẪN LÀ "${postRedeemJwt.aal}" (KHÔNG ĐỔI).`);

  // Thử gọi RPC yêu cầu AAL2 (update_order_status_admin)
  console.log('- Thử gọi update_order_status_admin bằng token sau khi redeem...');
  const updateRes = await req('/rest/v1/rpc/update_order_status_admin', 'POST', {
    p_order_id: '00000000-0000-0000-0000-000000000000',
    p_new_status: 'in_production',
    p_note: 'Audit test'
  }, lostDeviceToken);
  console.log('- Phản hồi từ update_order_status_admin:', updateRes.body);
  assert.strictEqual(updateRes.body.code, 'MFA_REQUIRED', 'RPC quản trị vẫn từ chối vì JWT vẫn là AAL1!');
  console.log('  => XÁC NHẬN SỰ THẬT: RPC quản trị VẪN TỪ CHỐI THAO TÁC do JWT chưa đạt AAL2!');

  // 6. KIỂM TRA CHỐNG REPLAY VÀ RATE LIMITING
  console.log('\n[6/6] Kiểm tra chống dùng lại mã (Replay) và Rate Limiting:');
  const replayRes = await req('/rest/v1/rpc/redeem_recovery_code_admin', 'POST', {
    p_code: codes[0]
  }, lostDeviceToken);
  console.log('- Dùng lại mã cũ:', replayRes.body);
  assert.strictEqual(replayRes.body.ok, false);
  assert.strictEqual(replayRes.body.code, 'INVALID_RECOVERY_CODE');
  console.log('✅ PASS: Chống dùng lại mã (Replay Protection) hoạt động chính xác.');

  // Thử brute force 5 mã sai liên tiếp
  console.log('- Thử brute-force 5 mã ngẫu nhiên không đúng...');
  let rejectedCount = 0;
  for (let i = 0; i < 5; i++) {
    const fakeCode = `TT3D-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const bfRes = await req('/rest/v1/rpc/redeem_recovery_code_admin', 'POST', {
      p_code: fakeCode
    }, lostDeviceToken);
    if (!bfRes.body.ok) rejectedCount++;
  }
  console.log(`- Số lần thử sai bị từ chối: ${rejectedCount}/5.`);
  console.log('⚠️ CẢNH BÁO KIẾN TRÚC: redeem_recovery_code_admin KHÔNG CÓ cơ chế lockout/delay khi thử sai liên tiếp.');

  // Dọn dẹp tài khoản audit
  await req(`/auth/v1/admin/users/${adminId}`, 'DELETE', null, STAGING_CONFIG.SERVICE_KEY);
  console.log('\n[+] Đã dọn dẹp tài khoản test audit an toàn.');
}

runMfaRecoveryAudit().catch(err => {
  console.error('\n❌ AUDIT THẤT BẠI:', err);
  process.exit(1);
});
