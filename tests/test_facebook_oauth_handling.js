/**
 * TEST SUITE: Facebook OAuth Error Handling & Graceful Recovery
 * Replicating Bug: "đăng nhập bằng fb đang bị lỗi hãy fix toàn diện lại"
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 [TEST] Running Facebook OAuth Graceful Handling Test Suite...');

// Read files
const supabaseClientCode = fs.readFileSync(path.join(__dirname, '../js/supabase-client.js'), 'utf8');

function createSandbox(providerEnabled = false) {
  const localStorageStore = {};
  const mockLocalStorage = {
    getItem: (k) => localStorageStore[k] || null,
    setItem: (k, v) => { localStorageStore[k] = String(v); },
    removeItem: (k) => { delete localStorageStore[k]; },
    key: (i) => Object.keys(localStorageStore)[i] || null,
    length: Object.keys(localStorageStore).length
  };

  const mockSupabaseInstance = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithOAuth: async ({ provider }) => {
        if (provider === 'facebook' && !providerEnabled) {
          return {
            data: null,
            error: {
              status: 400,
              code: 'validation_failed',
              message: 'Unsupported provider: provider is not enabled'
            }
          };
        }
        return {
          data: { provider, url: 'https://www.facebook.com/v18.0/dialog/oauth?...' },
          error: null
        };
      }
    }
  };

  const sandbox = {
    console: { log: () => {}, warn: () => {}, error: () => {} },
    setTimeout,
    clearTimeout,
    window: {
      localStorage: mockLocalStorage,
      location: {
        origin: 'https://nvtruongsun-hub.github.io',
        pathname: '/TT3Dstudio/',
        href: 'https://nvtruongsun-hub.github.io/TT3Dstudio/',
        hash: ''
      },
      dispatchEvent: () => true,
      CustomEvent: class { constructor(t, d) { this.type = t; this.detail = d; } },
      supabase: {
        createClient: () => mockSupabaseInstance
      }
    }
  };
  sandbox.window.window = sandbox.window;
  return sandbox;
}

async function runTests() {
  console.log('--- TEST 1: Facebook Provider Not Enabled Error Mapping ---');
  const sandbox1 = createSandbox(false);
  vm.createContext(sandbox1);
  vm.runInContext(supabaseClientCode, sandbox1);

  const TTSupabase = sandbox1.window.TTSupabase;
  const res = await TTSupabase.signInWithOAuth('facebook');

  console.log('Result when Facebook provider is unconfigured:', res);
  assert.strictEqual(res.ok, false, 'Result must be ok: false');
  assert.ok(res.error, 'Error message must exist');

  // Guardrail: Error message MUST NOT be raw English "Unsupported provider: provider is not enabled"
  assert.strictEqual(
    res.error.includes('Unsupported provider'),
    false,
    'Must NOT display raw English technical error "Unsupported provider"'
  );

  // Must provide friendly Vietnamese guidance mentioning Google or Email
  assert.ok(
    res.error.includes('Facebook') && (res.error.includes('Google') || res.error.includes('Email') || res.error.includes('bảo trì') || res.error.includes('kết nối')),
    'Error message must provide user-friendly Vietnamese guidance'
  );
  console.log('✅ TEST 1 PASSED: Facebook OAuth error gracefully mapped to Vietnamese guidance.');

  console.log('--- TEST 2: Active Facebook Provider Succeeds ---');
  const sandbox2 = createSandbox(true);
  vm.createContext(sandbox2);
  vm.runInContext(supabaseClientCode, sandbox2);

  const TTSupabase2 = sandbox2.window.TTSupabase;
  const res2 = await TTSupabase2.signInWithOAuth('facebook');
  assert.strictEqual(res2.ok, true, 'Active Facebook provider must succeed');
  console.log('✅ TEST 2 PASSED: Active Facebook provider succeeds with redirect URL.');

  console.log('🎉 ALL FACEBOOK OAUTH HANDLING TESTS PASSED!');
}

runTests().catch(err => {
  console.error('❌ RED PHASE FAILED AS EXPECTED:', err.message);
  process.exit(1);
});
