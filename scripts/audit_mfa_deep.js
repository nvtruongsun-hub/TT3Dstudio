const { querySql } = require('./query_db');

async function test() {
  console.log('--- AUDIT MFA ADMIN & AAL LEVEL ---');
  const users = await querySql(`
    SELECT u.id, u.email, u.created_at, r.role,
           (SELECT count(*) FROM auth.mfa_factors f WHERE f.user_id = u.id) as mfa_count
    FROM auth.users u
    LEFT JOIN public.user_roles r ON u.id = r.user_id
    WHERE r.role = 'admin' OR u.email = 'nvtruong.sun@gmail.com';
  `);
  console.log('Admin Users & MFA Count:');
  console.table(users.data);

  const factors = await querySql('SELECT * FROM auth.mfa_factors;');
  console.log('\nAll MFA Factors in auth.mfa_factors:', factors.data);

  // Check update_order_status_admin RPC definition for aal requirement
  const rpcDef = await querySql(`
    SELECT proname, prosrc
    FROM pg_proc
    WHERE proname = 'update_order_status_admin';
  `);
  console.log('\nupdate_order_status_admin prosrc:');
  if (rpcDef.data && rpcDef.data.length > 0) {
    const src = rpcDef.data[0].prosrc;
    console.log(src);
    const hasAal2Check = src.includes('aal2') || src.includes('aal') || src.includes('mfa');
    console.log('\nChecks AAL2 / MFA in RPC body?', hasAal2Check ? 'YES' : 'NO');
  }
}

test().catch(console.error);
