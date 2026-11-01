const { querySql } = require('./query_db');

async function hardenPrivileges() {
  console.log('--- TIẾN HÀNH THẮT CHẶT QUYỀN TỐI THIỂU (LEAST PRIVILEGE) CHO CÁC HÀM SECURITY DEFINER ---');

  // 1. Thu hồi quyền EXECUTE của anon trên hàm nhạy cảm admin
  console.log('[1/2] Thu hồi EXECUTE của anon trên update_order_status_admin...');
  await querySql(`
    REVOKE EXECUTE ON FUNCTION public.update_order_status_admin(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM anon, public;
    GRANT EXECUTE ON FUNCTION public.update_order_status_admin(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
  `);

  // 2. Thu hồi quyền EXECUTE trực tiếp của anon/authenticated trên trigger function handle_new_user
  console.log('[2/2] Thu hồi EXECUTE trực tiếp trên trigger handle_new_user...');
  await querySql(`
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, public;
  `);

  console.log('[+] Đã áp dụng phân quyền tối thiểu thành công.');

  // Kiểm tra lại quyền
  const checkRes = await querySql(`
    SELECT 
      p.proname,
      has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_can_execute,
      has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_can_execute
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.prosecdef = true AND n.nspname = 'public'
    ORDER BY p.proname;
  `);
  console.table(checkRes.data);
}

hardenPrivileges().catch(console.error);
