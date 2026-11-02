/**
 * T&T 3D STUDIO - AUTOMATED TEST ENVIRONMENT GUARDRAIL
 * Chặn đứng mọi hành vi chạy test tự động trên database Production (nbsumfhfxohawiuxrwqj).
 * Bắt buộc mọi test suite phải chạy trên Staging (vtxzlgkvmvoushluthme) hoặc local sandbox.
 */

const PRODUCTION_PROJECT_REF = 'nbsumfhfxohawiuxrwqj';

const STAGING_CONFIG = {
  PROJECT_REF: 'vtxzlgkvmvoushluthme',
  URL: 'https://vtxzlgkvmvoushluthme.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eHpsZ2t2bXZvdXNobHV0aG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MDU4NzgsImV4cCI6MjEwOTA4MTg3OH0.e78lpCrZZ07Y15aXXXTceNQxzsd46XyTLWebXZZB4oo',
  SERVICE_KEY: process.env.STAGING_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
};

function assertNotProduction(targetUrlOrRef) {
  const str = String(targetUrlOrRef || '').toLowerCase();
  if (str.includes(PRODUCTION_PROJECT_REF)) {
    console.error('\n🚨 ========================================================================');
    console.error('   CRITICAL SECURITY GUARDRAIL VIOLATION:');
    console.error(`   Phát hiện test suite đang kết nối tới PRODUCTION (${PRODUCTION_PROJECT_REF})!`);
    console.error('   Mọi bài test tự động bị CHẶN ĐỨNG để bảo vệ dữ liệu khách hàng thật.');
    console.error('========================================================================\n');
    throw new Error(`CRITICAL: Automated tests are strictly prohibited from running against PRODUCTION (${PRODUCTION_PROJECT_REF})!`);
  }
}

module.exports = {
  PRODUCTION_PROJECT_REF,
  STAGING_CONFIG,
  assertNotProduction
};
