// =========================================================================
// T&T 3D STUDIO - EDGE FUNCTION: MFA RECOVERY RESET
// Mục đích: Sửa BLOCKER #05 (FINAL_RELEASE_DECISION).
//   Hàm SQL không thể nâng JWT lên AAL2 (aal do Supabase Auth cấp).
//   Luồng đúng: Recovery code hợp lệ -> server gỡ toàn bộ TOTP factor cũ
//   -> client đăng ký TOTP mới + verify -> Supabase Auth cấp phiên AAL2.
// Deploy: supabase functions deploy mfa-recovery-reset
// Secrets cần có (mặc định Supabase tự cấp): SUPABASE_URL, SUPABASE_ANON_KEY,
//   SUPABASE_SERVICE_ROLE_KEY (chỉ tồn tại phía server, KHÔNG bao giờ gửi về client).
// =========================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, code: 'METHOD_NOT_ALLOWED' }, 405);

  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return json({ ok: false, code: 'UNAUTHENTICATED', error: 'Thiếu phiên đăng nhập.' }, 401);
  }

  let code = '';
  try {
    const body = await req.json();
    code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : '';
  } catch (_) { /* body rỗng */ }
  if (!code) return json({ ok: false, code: 'INVALID_CODE', error: 'Mã dự phòng không được để trống.' }, 400);

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // 1. Client mang JWT của chính người dùng: RPC tự kiểm tra role staff/admin
  //    và tiêu thụ mã (chống replay) trong cùng một giao dịch SQL.
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false }
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return json({ ok: false, code: 'UNAUTHENTICATED', error: 'Phiên đăng nhập không hợp lệ.' }, 401);
  }
  const userId = userData.user.id;

  const { data: redeem, error: redeemErr } = await userClient.rpc('redeem_recovery_code_admin', { p_code: code });
  if (redeemErr) return json({ ok: false, code: 'RPC_ERROR', error: redeemErr.message }, 500);
  if (!redeem?.ok) return json(redeem ?? { ok: false, code: 'INVALID_RECOVERY_CODE' }, 403);

  // 2. Mã hợp lệ và đã bị đánh dấu dùng -> gỡ toàn bộ factor cũ bằng service role.
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: factorData, error: listErr } = await admin.auth.admin.mfa.listFactors({ userId });
  if (listErr) return json({ ok: false, code: 'FACTOR_LIST_FAILED', error: listErr.message }, 500);

  let removed = 0;
  for (const factor of factorData?.factors ?? []) {
    const { error: delErr } = await admin.auth.admin.mfa.deleteFactor({ id: factor.id, userId });
    if (delErr) return json({ ok: false, code: 'FACTOR_DELETE_FAILED', error: delErr.message }, 500);
    removed++;
  }

  await admin.from('audit_logs').insert({
    actor_id: userId,
    action: 'MFA_FACTORS_RESET_BY_RECOVERY_CODE',
    entity_type: 'auth.mfa_factors',
    entity_id: userId,
    payload: { removed_factors: removed }
  });

  return json({
    ok: true,
    removed_factors: removed,
    message: 'Đã gỡ thiết bị Authenticator cũ. Vui lòng đăng ký thiết bị mới để hoàn tất xác thực 2 bước.'
  });
});
