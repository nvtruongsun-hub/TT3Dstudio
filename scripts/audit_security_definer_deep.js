const { querySql } = require('./query_db');

async function auditSecurityDefiner() {
  console.log('========================================================================');
  console.log('   KIỂM ĐỊNH TOÀN DIỆN TẤT CẢ HÀM SECURITY DEFINER & PHÂN QUYỀN SCHEMA');
  console.log('========================================================================\n');

  // 1. Tìm tất cả các hàm có cờ SECURITY DEFINER trong database
  const secDefRes = await querySql(`
    SELECT 
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS arguments,
      p.prosecdef AS is_security_definer,
      p.proconfig AS search_path_config,
      pg_get_userbyid(p.proowner) AS function_owner
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.prosecdef = true
      AND n.nspname IN ('public', 'auth')
    ORDER BY n.nspname, p.proname;
  `);

  console.log('[1/4] Danh sách tất cả hàm SECURITY DEFINER trong schema public/auth:');
  console.table(secDefRes.data);

  // 2. Kiểm tra quyền CREATE trên schema public đối với anon và authenticated
  const createPrivRes = await querySql(`
    SELECT 
      r.rolname,
      has_schema_privilege(r.rolname, 'public', 'CREATE') AS can_create_in_public,
      has_schema_privilege(r.rolname, 'public', 'USAGE') AS can_use_public
    FROM pg_roles r
    WHERE r.rolname IN ('anon', 'authenticated', 'public');
  `);
  console.log('\n[2/4] Quyền CREATE / USAGE trên schema public:');
  console.table(createPrivRes.data);

  // 3. Kiểm tra quyền EXECUTE trên từng hàm SECURITY DEFINER của public schema
  console.log('\n[3/4] Quyền EXECUTE của các vai trò (anon, authenticated, public):');
  const executePrivRes = await querySql(`
    SELECT 
      p.proname,
      has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_can_execute,
      has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_can_execute,
      has_function_privilege('public', p.oid, 'EXECUTE') AS public_can_execute
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.prosecdef = true AND n.nspname = 'public'
    ORDER BY p.proname;
  `);
  console.table(executePrivRes.data);

  // 4. Đánh giá rủi ro Search Path Hijacking & Leo thang quyền
  console.log('\n[4/4] Phân tích chi tiết từng hàm:');
  for (const fn of secDefRes.data) {
    const hasSearchPath = Array.isArray(fn.search_path_config) && 
      fn.search_path_config.some(c => c.startsWith('search_path='));
    const isOwnerPostgres = fn.function_owner === 'postgres' || fn.function_owner === 'supabase_admin';
    
    console.log(`- [${fn.schema_name}.${fn.function_name}]`);
    console.log(`  + search_path: ${hasSearchPath ? 'ĐÃ KHÓA (' + fn.search_path_config.join(', ') + ')' : '⚠️ CẢNH BÁO: CHƯA KHÓA'}`);
    console.log(`  + Owner: ${fn.function_owner} (${isOwnerPostgres ? 'Đặc quyền cao' : 'Thường'})`);
  }
}

auditSecurityDefiner().catch(console.error);
