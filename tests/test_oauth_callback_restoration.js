/**
 * TEST SUITE: OAuth Callback & Page Load Session Auto-Restoration
 * Replicating Bug: "đang bị lỗi đăng nhập xong vẫn báo không được"
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 [TEST] Running OAuth Callback & Session Restoration Test Suite...');

// Read files
const supabaseClientCode = fs.readFileSync(path.join(__dirname, '../js/supabase-client.js'), 'utf8');

function createMockEnvironment({ hash = '', initialStorage = {} } = {}) {
  const localStorageStore = { ...initialStorage };
  const mockLocalStorage = {
    getItem: (k) => localStorageStore[k] || null,
    setItem: (k, v) => { localStorageStore[k] = String(v); },
    removeItem: (k) => { delete localStorageStore[k]; },
    clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
  };

  let authListenerCallback = null;
  const mockSession = hash.includes('access_token=valid_token') ? {
    access_token: 'valid_token',
    refresh_token: 'valid_refresh',
    user: {
      id: 'usr_oauth_google_123',
      email: 'nvtruong.sun@gmail.com',
      email_confirmed_at: '2026-11-01T02:00:00Z',
      user_metadata: {
        full_name: 'Trường Nguyễn Văn',
        email_verified: true
      },
      app_metadata: {
        provider: 'google',
        providers: ['google']
      }
    }
  } : null;

  const mockSupabaseInstance = {
    auth: {
      onAuthStateChange: (cb) => {
        authListenerCallback = cb;
        if (mockSession) {
          // Supabase JS fires SIGNED_IN asynchronously on detectSessionInUrl
          setTimeout(() => cb('SIGNED_IN', mockSession), 10);
        }
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      getSession: async () => {
        return { data: { session: mockSession }, error: null };
      },
      signInWithOAuth: async ({ provider }) => {
        return { data: { provider, url: 'https://accounts.google.com/o/oauth2/v2/auth' }, error: null };
      },
      signOut: async () => {
        return { error: null };
      }
    }
  };

  const sandbox = {
    console: {
      log: console.log,
      warn: () => {},
      error: console.error
    },
    setTimeout,
    clearTimeout,
    window: {
      localStorage: mockLocalStorage,
      location: {
        origin: 'https://nvtruongsun-hub.github.io',
        pathname: '/TT3Dstudio/',
        href: 'https://nvtruongsun-hub.github.io/TT3Dstudio/' + hash,
        hash: hash
      },
      history: {
        replaceState: () => {}
      },
      dispatchEvent: () => true,
      CustomEvent: class CustomEvent {
        constructor(type, detail) {
          this.type = type;
          this.detail = detail;
        }
      },
      supabase: {
        createClient: (url, key, options) => {
          mockSupabaseInstance._options = options;
          return mockSupabaseInstance;
        }
      }
    }
  };
  sandbox.window.window = sandbox.window;
  return { sandbox, mockSupabaseInstance, mockLocalStorage };
}

async function runTests() {
  console.log('--- TEST 1: Page Load with OAuth Redirect Hash ---');
  // Scenario: Google redirected back with access_token in URL hash
  const env1 = createMockEnvironment({
    hash: '#access_token=valid_token&expires_in=3600&token_type=bearer'
  });

  vm.createContext(env1.sandbox);
  vm.runInContext(supabaseClientCode, env1.sandbox);

  // Allow async session detection loop to complete
  await new Promise(r => setTimeout(r, 50));

  const TTSupabase = env1.sandbox.window.TTSupabase;
  assert.ok(TTSupabase, 'TTSupabase should be exported to window');

  // Verify whether session was restored on page load
  const isAuth = TTSupabase.isAuthenticated();
  const isVerified = TTSupabase.isEmailVerified();
  const user = TTSupabase.getUser();

  console.log('Test 1 State:', { isAuth, isVerified, userEmail: user?.email });
  assert.strictEqual(isAuth, true, 'User MUST be authenticated automatically on page load when OAuth token exists');
  assert.strictEqual(isVerified, true, 'OAuth user email MUST be verified');
  assert.strictEqual(user?.email, 'nvtruong.sun@gmail.com', 'User email must match OAuth payload');
  console.log('✅ TEST 1 PASSED: OAuth session automatically restored on page load.');

  console.log('--- TEST 2: Verify isEmailVerified recognizes OAuth providers even if email_confirmed_at is not standard ---');
  const env2 = createMockEnvironment({});
  vm.createContext(env2.sandbox);
  vm.runInContext(supabaseClientCode, env2.sandbox);

  const TTSupabase2 = env2.sandbox.window.TTSupabase;
  // Test OAuth user with email_verified in metadata but null email_confirmed_at
  TTSupabase2.setMockSession({
    user: {
      id: 'usr_oauth_no_date',
      email: 'oauth_user@gmail.com',
      email_confirmed_at: null,
      user_metadata: {
        email_verified: true,
        full_name: 'OAuth User'
      },
      app_metadata: {
        provider: 'google'
      }
    }
  });

  assert.strictEqual(TTSupabase2.isAuthenticated(), true, 'Must be authenticated');
  assert.strictEqual(TTSupabase2.isEmailVerified(), true, 'Must recognize OAuth provider/email_verified as verified email');
  console.log('✅ TEST 2 PASSED: isEmailVerified handles OAuth metadata robustly.');

  console.log('🎉 ALL OAUTH RESTORATION TESTS PASSED!');
}

runTests().catch(err => {
  console.error('❌ RED PHASE FAILED AS EXPECTED:', err.message);
  process.exit(1);
});
