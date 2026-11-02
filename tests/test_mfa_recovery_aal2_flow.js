/**
 * Test Suite: MFA Recovery -> AAL2 Flow (BLOCKER #05, #12)
 * Target: supabase-client.js MFA APIs + Edge Function mfa-recovery-reset contract.
 * Chạy offline với Supabase client giả lập (không chạm Staging/Production).
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('==========================================================');
console.log('   TEST MFA RECOVERY -> AAL2 FLOW');
console.log('==========================================================\n');

function createMockSupabase() {
  const state = {
    aal: 'aal1',
    factors: [{ id: 'old-factor', factor_type: 'totp', status: 'verified' }],
    calls: []
  };
  const session = () => ({ access_token: 'jwt-' + state.aal, user: { id: 'admin-1', email: 'a@x.vn' } });
  const client = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      getSession: async () => ({ data: { session: session() }, error: null }),
      mfa: {
        getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: state.aal, nextLevel: 'aal2' }, error: null }),
        listFactors: async () => ({ data: { all: state.factors.slice() }, error: null }),
        unenroll: async ({ factorId }) => {
          state.calls.push('unenroll:' + factorId);
          state.factors = state.factors.filter(f => f.id !== factorId);
          return { error: null };
        },
        enroll: async () => {
          const f = { id: 'new-factor', factor_type: 'totp', status: 'unverified' };
          state.factors.push(f);
          return { data: { id: f.id, totp: { qr_code: 'data:image/svg+xml;qr', secret: 'SECRET' } }, error: null };
        },
        challengeAndVerify: async ({ factorId, code }) => {
          state.calls.push('verify:' + factorId + ':' + code);
          if (code !== '123456') return { data: null, error: { message: 'Invalid TOTP code' } };
          state.factors.forEach(f => { if (f.id === factorId) f.status = 'verified'; });
          state.aal = 'aal2';
          return { data: {}, error: null };
        }
      }
    },
    rpc: async (name) => {
      state.calls.push('rpc:' + name);
      if (name === 'generate_recovery_codes_admin') {
        if (state.aal !== 'aal2') return { data: { ok: false, code: 'MFA_REQUIRED' }, error: null };
        return { data: { ok: true, codes: ['TT3D-AAAA-BBBB'] }, error: null };
      }
      return { data: null, error: null };
    },
    functions: {
      invoke: async (name, { body }) => {
        state.calls.push('fn:' + name);
        if (body.code !== 'TT3D-GOOD-CODE') {
          return { data: null, error: { context: { json: async () => ({ ok: false, code: 'INVALID_RECOVERY_CODE', error: 'Mã sai' }) } } };
        }
        state.factors = state.factors.filter(f => f.status !== 'verified');
        return { data: { ok: true, removed_factors: 1 }, error: null };
      }
    }
  };
  return { client, state };
}

async function run() {
  const { client, state } = createMockSupabase();
  const sandbox = {
    console: { log() {}, warn() {}, error() {}, info() {} },
    setTimeout, clearTimeout, URLSearchParams, URL,
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    location: { hostname: 'localhost', search: '', href: 'http://localhost/' }
  };
  sandbox.window = sandbox;
  sandbox.supabase = { createClient: () => client };
  vm.createContext(sandbox);
  for (const file of ['env-config.js', 'supabase-client.js']) {
    const src = fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8');
    vm.runInContext(src, sandbox, { filename: file });
  }
  const api = sandbox.TTSupabase;
  let passed = 0;
  const ok = (name) => { passed++; console.log('  ✅ ' + name); };

  // 1. Phiên mới đăng nhập là AAL1, có 1 factor verified -> phải challenge
  let st = await api.getMfaStatus();
  assert.strictEqual(st.ok, true);
  assert.strictEqual(st.currentLevel, 'aal1');
  assert.strictEqual(st.verifiedTotp.length, 1);
  ok('getMfaStatus báo aal1 + 1 TOTP verified');

  // 2. AAL1 không được tạo mã dự phòng
  const denied = await api.generateRecoveryCodes();
  assert.strictEqual(denied.code, 'MFA_REQUIRED');
  ok('AAL1 bị chặn generate_recovery_codes_admin (MFA_REQUIRED)');

  // 3. Mã dự phòng sai bị từ chối, factor cũ giữ nguyên
  const bad = await api.resetMfaWithRecoveryCode('TT3D-BAD0-CODE');
  assert.strictEqual(bad.ok, false);
  assert.strictEqual(bad.code, 'INVALID_RECOVERY_CODE');
  assert.strictEqual(state.factors.length, 1);
  ok('Mã dự phòng sai -> INVALID_RECOVERY_CODE, không gỡ factor');

  // 4. Mã đúng -> server gỡ factor cũ
  const good = await api.resetMfaWithRecoveryCode('TT3D-GOOD-CODE');
  assert.strictEqual(good.ok, true);
  st = await api.getMfaStatus();
  assert.strictEqual(st.verifiedTotp.length, 0);
  ok('Mã dự phòng đúng -> Edge Function gỡ toàn bộ factor cũ');

  // 5. Đăng ký TOTP mới, mã sai bị từ chối, vẫn AAL1
  const enroll = await api.enrollTotp();
  assert.strictEqual(enroll.ok, true);
  assert.strictEqual(enroll.factorId, 'new-factor');
  assert.ok(enroll.qrCode.startsWith('data:image'));
  const wrong = await api.verifyTotp(enroll.factorId, '000000');
  assert.strictEqual(wrong.ok, false);
  const malformed = await api.verifyTotp(enroll.factorId, '12ab');
  assert.strictEqual(malformed.ok, false);
  assert.strictEqual((await api.getMfaStatus()).currentLevel, 'aal1');
  ok('Mã TOTP sai/sai định dạng không nâng phiên');

  // 6. Mã đúng -> AAL2 -> được tạo mã dự phòng mới  (ĐIỀU KIỆN PASS CỦA BLOCKER #05)
  const verified = await api.verifyTotp(enroll.factorId, '123 456');
  assert.strictEqual(verified.ok, true);
  assert.strictEqual((await api.getMfaStatus()).currentLevel, 'aal2');
  const codes = await api.generateRecoveryCodes();
  assert.strictEqual(codes.ok, true);
  assert.strictEqual(codes.codes.length, 1);
  ok('Sau recovery + đăng ký TOTP mới: phiên đạt AAL2, tạo được mã dự phòng');

  // 7. Đăng ký lại dọn factor chưa verify còn sót
  state.factors.push({ id: 'stale', factor_type: 'totp', status: 'unverified' });
  await api.enrollTotp();
  assert.ok(state.calls.includes('unenroll:stale'));
  ok('enrollTotp dọn factor chưa verify còn sót');

  // 8. Hợp đồng RPC update_order_status_admin khớp chữ ký SQL
  const clientSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'supabase-client.js'), 'utf8');
  const sqlSrc = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20261101_mfa_admin_hardening.sql'), 'utf8');
  for (const p of ['p_carrier_name', 'p_carrier_tracking_code']) {
    assert.ok(clientSrc.includes(p + ':'), 'client phải gửi ' + p);
    assert.ok(sqlSrc.includes(p + ' TEXT'), 'SQL phải nhận ' + p);
  }
  assert.ok(!/p_carrier:\s/.test(clientSrc) && !clientSrc.includes('p_tracking_number'));
  ok('Tham số RPC update_order_status_admin khớp chữ ký SQL');

  // 9. Edge Function: không lộ service role, xác minh mã bằng JWT người dùng trước khi gỡ factor
  const fnSrc = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'functions', 'mfa-recovery-reset', 'index.ts'), 'utf8');
  assert.ok(fnSrc.includes("Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')"));
  assert.ok(!/eyJhbGciOi/.test(fnSrc), 'không hardcode JWT');
  assert.ok(fnSrc.indexOf("rpc('redeem_recovery_code_admin'") < fnSrc.indexOf('deleteFactor'), 'phải redeem trước khi gỡ factor');
  ok('Edge Function: redeem bằng JWT người dùng trước, service role chỉ lấy từ env');

  console.log(`\n🎉 ${passed}/9 PASS`);
}

run().catch((e) => { console.error('❌ FAIL:', e.message); process.exit(1); });
