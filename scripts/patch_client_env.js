const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'supabase-client.js');
let code = fs.readFileSync(filePath, 'utf8');

const target = `  // Configurable Supabase Endpoint & Anon Key
  // Note: anon public key is safe for client-side use under PostgreSQL Row Level Security (RLS)
  const DEFAULT_SUPABASE_URL = (window.TT_ENV && window.TT_ENV.SUPABASE_URL) || 'https://nbsumfhfxohawiuxrwqj.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = (window.TT_ENV && window.TT_ENV.SUPABASE_ANON_KEY) || 'sb_publishable_axTex7YiB0DOBquiWFtR-g_L-0q8n5e';`;

const replacement = `  // Multi-environment routing: Production vs Staging
  const PROD_URL = 'https://nbsumfhfxohawiuxrwqj.supabase.co';
  const PROD_ANON = 'sb_publishable_axTex7YiB0DOBquiWFtR-g_L-0q8n5e';

  const STAGING_URL = 'https://vtxzlgkvmvoushluthme.supabase.co';
  const STAGING_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eHpsZ2t2bXZvdXNobHV0aG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MDU4NzgsImV4cCI6MjEwOTA4MTg3OH0.e78lpCrZZ07Y15aXXXTceNQxzsd46XyTLWebXZZB4oo';

  function resolveEnvironment() {
    if (typeof window !== 'undefined') {
      if (window.TT_ENV && window.TT_ENV.SUPABASE_URL) {
        return { url: window.TT_ENV.SUPABASE_URL, anon: window.TT_ENV.SUPABASE_ANON_KEY || PROD_ANON, env: 'custom' };
      }
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('env') === 'staging' || window.location.hostname.includes('staging') || window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
          return { url: STAGING_URL, anon: STAGING_ANON, env: 'staging' };
        }
      } catch (e) {}
    }
    return { url: PROD_URL, anon: PROD_ANON, env: 'production' };
  }

  const activeEnv = resolveEnvironment();
  const DEFAULT_SUPABASE_URL = activeEnv.url;
  const DEFAULT_SUPABASE_ANON_KEY = activeEnv.anon;`;

if (code.includes('DEFAULT_SUPABASE_URL')) {
  code = code.replace(/  \/\/ Configurable Supabase Endpoint[\s\S]*?const DEFAULT_SUPABASE_ANON_KEY = [^;]+;/, replacement);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully updated js/supabase-client.js');
} else {
  console.log('Target pattern not found');
}
