/**
 * T&T 3D Labs - Social OAuth Authentication Test Suite (Google / Gmail & Facebook)
 * Strict TDD & E2E Verification for:
 * 1. Supabase OAuth Client integration (signInWithOAuth)
 * 2. Provider validation: Google & Facebook
 * 3. Automatic verified email assertion for OAuth logins
 * 4. UI Social buttons in Auth Modal (Google & Facebook)
 * 5. Immediate checkout eligibility for OAuth authenticated users
 */

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

console.log('🧪 [TEST] Running Social OAuth Authentication Test Suite...');

// 1. Verify UI Buttons in index.html
console.log('--- TEST 1: Social OAuth Buttons in index.html ---');
const indexHtml = read('index.html');
assert.ok(indexHtml.includes('auth-btn-google'), 'index.html must contain Google Login button (id="auth-btn-google")');
assert.ok(indexHtml.includes('auth-btn-facebook'), 'index.html must contain Facebook Login button (id="auth-btn-facebook")');
assert.ok(indexHtml.includes('Tiếp tục với Google') || indexHtml.includes('Google'), 'index.html must display Google action label');
assert.ok(indexHtml.includes('Tiếp tục với Facebook') || indexHtml.includes('Facebook'), 'index.html must display Facebook action label');
console.log('✅ TEST 1 PASSED: Social OAuth buttons present in index.html.');

// 2. Verify TTSupabase.signInWithOAuth in js/supabase-client.js
console.log('--- TEST 2: Supabase Client OAuth Implementation ---');
const clientJs = read('js/supabase-client.js');

function createMockBrowser() {
  const localStorageStore = new Map();
  const listeners = {};

  const window = {
    location: { href: 'https://nvtruongsun-hub.github.io/TT3Dstudio/', origin: 'https://nvtruongsun-hub.github.io', pathname: '/TT3Dstudio/', hash: '', search: '' },
    localStorage: {
      getItem: (k) => localStorageStore.get(k) || null,
      setItem: (k, v) => localStorageStore.set(k, String(v)),
      removeItem: (k) => localStorageStore.delete(k),
      clear: () => localStorageStore.clear()
    },
    addEventListener: (evt, fn) => {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(fn);
    },
    dispatchEvent: () => {},
    document: {
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    console,
    Date,
    Math,
    JSON,
    setTimeout,
    clearTimeout
  };
  window.window = window;
  return window;
}

const mockWindow = createMockBrowser();
const ctx = vm.createContext(mockWindow);
vm.runInContext(clientJs, ctx);

assert.ok(mockWindow.TTSupabase, 'window.TTSupabase must exist');
assert.equal(typeof mockWindow.TTSupabase.signInWithOAuth, 'function', 'TTSupabase.signInWithOAuth must be a function');
console.log('✅ TEST 2 PASSED: TTSupabase.signInWithOAuth interface verified.');

// 3. Test Google & Facebook OAuth Login Flow
console.log('--- TEST 3: Google & Facebook OAuth Login Execution ---');

// Invalid provider rejection
Promise.resolve(mockWindow.TTSupabase.signInWithOAuth('unsupported_provider')).then(res => {
  assert.equal(res.ok, false, 'Unsupported provider must be rejected');
  assert.ok(res.error.includes('không hỗ trợ') || res.error.includes('hợp lệ'), 'Error must inform unsupported provider');
  console.log('✅ TEST 3.1 PASSED: Unsupported provider safely rejected.');

  // Google OAuth Login
  return mockWindow.TTSupabase.signInWithOAuth('google');
}).then(resGoogle => {
  assert.equal(resGoogle.ok, true, 'Google OAuth should succeed');
  assert.equal(mockWindow.TTSupabase.isAuthenticated(), true, 'User must be authenticated after Google login');
  assert.equal(mockWindow.TTSupabase.isEmailVerified(), true, 'Google OAuth user email must be automatically verified');
  const user = mockWindow.TTSupabase.getUser();
  assert.ok(user.email.includes('@'), 'Google user must have valid email');
  console.log('✅ TEST 3.2 PASSED: Google OAuth login sets authenticated and verified session.');

  // Immediate order capability for Google authenticated customer
  return mockWindow.TTSupabase.createOrder({
    idempotency_key: 'oauth-test-order-001',
    payment_method: 'cod',
    items: [{ id: 'mw-cn-2084928', qty: 1 }],
    shipping_name: 'Khách Hàng Google',
    shipping_phone: '0987654321',
    shipping_address: 'Hà Nội'
  });
}).then(orderRes => {
  assert.equal(orderRes.ok, true, 'OAuth customer can place order without email verification block');
  console.log('✅ TEST 3.3 PASSED: OAuth user successfully places order.');

  // Facebook OAuth Login
  return mockWindow.TTSupabase.signInWithOAuth('facebook');
}).then(resFb => {
  assert.equal(resFb.ok, true, 'Facebook OAuth should succeed');
  assert.equal(mockWindow.TTSupabase.isAuthenticated(), true, 'User must be authenticated after Facebook login');
  assert.equal(mockWindow.TTSupabase.isEmailVerified(), true, 'Facebook OAuth user email must be verified');
  console.log('✅ TEST 3.4 PASSED: Facebook OAuth login succeeds.');

  console.log('🎉 ALL SOCIAL OAUTH AUTHENTICATION TESTS PASSED!');
});
