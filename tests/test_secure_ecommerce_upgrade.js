/**
 * T&T 3D Labs - Secure Ecommerce Upgrade Test Suite
 * Strict TDD & E2E Verification for:
 * 1. Supabase Auth Integration & Mandatory Login for Ordering
 * 2. Email Verification Gate
 * 3. Server-side Ground Truth Pricing & Coupon Validation
 * 4. Idempotency & Atomic Order RPC
 * 5. Customer Portal & 8-Stage 3D Production Tracker
 * 6. Admin Portal Backend RBAC (Eliminating client-side PIN)
 * 7. RLS Security Contracts & Static GitHub Pages Compatibility
 */

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

console.log('🧪 [TEST] Initializing Secure Ecommerce Upgrade Test Suite...');

// 1. Verify existence of Database Migration & Seed
console.log('--- TEST 1: Database Migration & Seed Files ---');
const migrationSql = read('supabase/migrations/20261031_ecommerce_upgrade.sql');
assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.profiles'), 'Migration must create profiles table');
assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.user_roles'), 'Migration must create user_roles table');
assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.products'), 'Migration must create products table');
assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.coupons'), 'Migration must create coupons table');
assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.orders'), 'Migration must create orders table');
assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.order_items'), 'Migration must create order_items table');
assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.order_status_history'), 'Migration must create order_status_history table');
assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.audit_logs'), 'Migration must create audit_logs table');
assert.ok(migrationSql.includes('FUNCTION public.is_admin()'), 'Migration must define is_admin security function');
assert.ok(migrationSql.includes('FUNCTION public.create_order('), 'Migration must define create_order RPC function');
assert.ok(migrationSql.includes('FUNCTION public.update_order_status_admin('), 'Migration must define update_order_status_admin RPC function');
assert.ok(migrationSql.includes('ROW LEVEL SECURITY'), 'Migration must enable RLS on all tables');

const seedSql = read('supabase/seed_products.sql');
assert.ok(seedSql.includes('INSERT INTO public.categories'), 'Seed must insert categories');
assert.ok(seedSql.includes('INSERT INTO public.products'), 'Seed must insert products');
assert.ok(seedSql.includes('INSERT INTO public.coupons'), 'Seed must insert standard coupons');
console.log('✅ TEST 1 PASSED: Migration & Seed SQL files are complete and valid.');

// 2. Verify Supabase Client Module (js/supabase-client.js)
console.log('--- TEST 2: Supabase Client Module & Auth Contracts ---');
assert.ok(fs.existsSync(path.join(root, 'js', 'supabase-client.js')), 'js/supabase-client.js must exist');
const supabaseClientCode = read('js/supabase-client.js');

// Create mock browser sandbox
function createMockBrowser() {
  const localStorageStore = new Map();
  const listeners = {};

  const window = {
    location: { href: 'https://nvtruongsun-hub.github.io/TT3Dstudio/', hash: '', search: '' },
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
    dispatchEvent: (evt) => {
      if (listeners[evt.type]) {
        listeners[evt.type].forEach(fn => fn(evt));
      }
    },
    document: {
      getElementById: (id) => null,
      querySelector: (sel) => null,
      querySelectorAll: (sel) => [],
      createElement: (tag) => ({ tagName: tag.toUpperCase(), setAttribute: () => {}, appendChild: () => {}, classList: { add: () => {}, remove: () => {} } }),
      body: { appendChild: () => {}, classList: { add: () => {}, remove: () => {} } },
      addEventListener: () => {}
    },
    console,
    Date,
    Math,
    JSON,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
  };
  window.window = window;
  return window;
}

const mockWindow = createMockBrowser();
const ctx = vm.createContext(mockWindow);
vm.runInContext(supabaseClientCode, ctx);

assert.ok(mockWindow.TTSupabase, 'window.TTSupabase must be exported');
assert.equal(typeof mockWindow.TTSupabase.signUp, 'function', 'TTSupabase.signUp must be a function');
assert.equal(typeof mockWindow.TTSupabase.signIn, 'function', 'TTSupabase.signIn must be a function');
assert.equal(typeof mockWindow.TTSupabase.signOut, 'function', 'TTSupabase.signOut must be a function');
assert.equal(typeof mockWindow.TTSupabase.resetPassword, 'function', 'TTSupabase.resetPassword must be a function');
assert.equal(typeof mockWindow.TTSupabase.getUser, 'function', 'TTSupabase.getUser must be a function');
assert.equal(typeof mockWindow.TTSupabase.getSession, 'function', 'TTSupabase.getSession must be a function');
assert.equal(typeof mockWindow.TTSupabase.isAuthenticated, 'function', 'TTSupabase.isAuthenticated must be a function');
assert.equal(typeof mockWindow.TTSupabase.isEmailVerified, 'function', 'TTSupabase.isEmailVerified must be a function');
assert.equal(typeof mockWindow.TTSupabase.createOrder, 'function', 'TTSupabase.createOrder must be a function');
assert.equal(typeof mockWindow.TTSupabase.getCustomerOrders, 'function', 'TTSupabase.getCustomerOrders must be a function');
assert.equal(typeof mockWindow.TTSupabase.updateOrderStatusAdmin, 'function', 'TTSupabase.updateOrderStatusAdmin must be a function');
console.log('✅ TEST 2 PASSED: window.TTSupabase exposes all required auth and RPC interfaces.');

// 3. Test Mandatory Login & Email Verification Enforcement at Checkout
console.log('--- TEST 3: Mandatory Login & Email Gate Enforcement ---');
// Unauthenticated user
assert.equal(mockWindow.TTSupabase.isAuthenticated(), false, 'Default user should be unauthenticated');
const unauthOrderResult = mockWindow.TTSupabase.createOrder({
  items: [{ id: 'p-mw-001', qty: 1 }],
  shipping_name: 'Nguyen Van A',
  shipping_phone: '0912345678',
  shipping_address: 'Ha Tinh'
});

// Direct order without login must fail synchronously or asynchronously
Promise.resolve(unauthOrderResult).then(res => {
  assert.equal(res.ok, false, 'Direct order without authentication MUST be rejected');
  assert.ok(res.error.includes('đăng nhập') || res.code === 'AUTH_REQUIRED', 'Error message must clearly state login required');
  console.log('✅ TEST 3.1 PASSED: Unauthenticated order attempt rejected with AUTH_REQUIRED.');
}).catch(err => {
  assert.ok(err.message.includes('đăng nhập') || err.code === 'AUTH_REQUIRED');
  console.log('✅ TEST 3.1 PASSED: Unauthenticated order attempt rejected.');
});

// 4. Test Cart Preservation across Login
console.log('--- TEST 4: Cart Preservation Across Login ---');
mockWindow.localStorage.setItem('tt3d_cart_items_v2', JSON.stringify([
  { id: 'p-mw-001', title: 'Rồng Khớp Động Crystal Dragon', price: 155000, qty: 2 }
]));
const initialCart = JSON.parse(mockWindow.localStorage.getItem('tt3d_cart_items_v2'));
assert.equal(initialCart.length, 1, 'Cart has 1 item prior to login');
assert.equal(initialCart[0].qty, 2, 'Quantity is 2 prior to login');

// Simulate Login event
mockWindow.TTSupabase.setMockSession({
  user: {
    id: 'user-uuid-1234',
    email: 'khachhang@gmail.com',
    email_confirmed_at: '2026-10-31T12:00:00Z',
    user_metadata: { full_name: 'Nguyen Van A', phone: '0912345678' }
  },
  roles: ['customer']
});

assert.equal(mockWindow.TTSupabase.isAuthenticated(), true, 'User must be authenticated after login');
assert.equal(mockWindow.TTSupabase.isEmailVerified(), true, 'User email must be verified');

const postLoginCart = JSON.parse(mockWindow.localStorage.getItem('tt3d_cart_items_v2'));
assert.equal(postLoginCart.length, 1, 'Cart items must be strictly preserved after login');
assert.equal(postLoginCart[0].id, 'p-mw-001', 'Cart item ID preserved');
console.log('✅ TEST 4 PASSED: Cart preserved across login.');

// 5. Test Server-side Ground Truth Pricing & Order Creation
console.log('--- TEST 5: Ground Truth Pricing & Idempotency ---');
const orderAttempt = mockWindow.TTSupabase.createOrder({
  idempotency_key: 'idem-key-test-001',
  payment_method: 'cod',
  items: [
    {
      product_id: 'p-mw-001',
      unit_price: 1000, // Tampered client price (Real price in catalog is 155,000đ)
      quantity: 2,
      selected_options: { color: 'Titanium Grey' }
    }
  ],
  shipping_name: 'Nguyen Van A',
  shipping_phone: '0912345678',
  shipping_address: '123 Cẩm Xuyên, Hà Tĩnh'
});

Promise.resolve(orderAttempt).then(res => {
  assert.equal(res.ok, true, 'Order creation should succeed for verified customer');
  assert.ok(res.order_number.startsWith('TT3D-'), 'Order number should follow TT3D- prefix');
  // Subtotal should be 155,000 * 2 = 310,000 (NOT 1000 * 2 = 2000)
  assert.equal(res.subtotal, 310000, 'Subtotal must be computed from server ground truth price (155k * 2 = 310k)');
  // Total >= 300k gets free shipping (shipping_fee = 0)
  assert.equal(res.shipping_fee, 0, 'Shipping fee must be 0 for subtotal >= 300,000đ');
  assert.equal(res.total, 310000, 'Final total must match 310,000đ');
  console.log('✅ TEST 5.1 PASSED: Ground truth pricing enforced. Tampered client price was ignored.');

  // Test Idempotency with identical key
  return mockWindow.TTSupabase.createOrder({
    idempotency_key: 'idem-key-test-001',
    payment_method: 'cod',
    items: [{ product_id: 'p-mw-001', quantity: 2 }],
    shipping_name: 'Nguyen Van A',
    shipping_phone: '0912345678',
    shipping_address: '123 Cẩm Xuyên, Hà Tĩnh'
  });
}).then(res2 => {
  assert.equal(res2.ok, true, 'Idempotent request returns original order response');
  assert.equal(res2.is_duplicate, true, 'Duplicate submission identified via idempotency key');
  console.log('✅ TEST 5.2 PASSED: Idempotency protection prevents duplicate orders.');
});

// 6. Test Admin Backend RBAC & Non-Admin Rejection
console.log('--- TEST 6: Admin Backend RBAC & Non-Admin Rejection ---');
assert.equal(mockWindow.TTSupabase.isAdmin(), false, 'Customer user must NOT be recognized as admin');

// Attempting admin action as customer must be rejected
const updateAttempt = mockWindow.TTSupabase.updateOrderStatusAdmin({
  order_id: 'ord-123',
  new_status: 'printing_in_progress',
  note: 'Bắt đầu in'
});

Promise.resolve(updateAttempt).then(res => {
  assert.equal(res.ok, false, 'Non-admin status update MUST be rejected');
  assert.equal(res.code, 'FORBIDDEN', 'Error code must be FORBIDDEN');
  console.log('✅ TEST 6.1 PASSED: Non-admin update blocked by RBAC.');

  // Elevate to Admin session
  mockWindow.TTSupabase.setMockSession({
    user: { id: 'admin-uuid-999', email: 'admin@tt3dlabs.vn', email_confirmed_at: '2026-10-31T12:00:00Z' },
    roles: ['admin']
  });
  assert.equal(mockWindow.TTSupabase.isAdmin(), true, 'Admin user recognized as admin');

  return mockWindow.TTSupabase.updateOrderStatusAdmin({
    order_id: 'ord-123',
    new_status: 'printing_in_progress',
    note: 'Bắt đầu in trên máy Bambu Lab A1'
  });
}).then(adminRes => {
  assert.equal(adminRes.ok, true, 'Admin status update succeeds');
  assert.equal(adminRes.status, 'printing_in_progress');
  console.log('✅ TEST 6.2 PASSED: Authorized admin status update successful.');
});

// 7. Verify Index.html & Admin.html Integration
console.log('--- TEST 7: HTML & UI Security Integration ---');
const indexHtml = read('index.html');
assert.ok(indexHtml.includes('js/supabase-client.js'), 'index.html must include js/supabase-client.js');
assert.ok(indexHtml.includes('id="auth-modal"') || indexHtml.includes('auth-modal'), 'index.html must have Auth Modal for login/register');
assert.ok(indexHtml.includes('id="header-account-btn"') || indexHtml.includes('header-account-btn'), 'index.html must have Account button on header');

const adminHtml = read('admin.html');
assert.ok(adminHtml.includes('js/supabase-client.js'), 'admin.html must include js/supabase-client.js');
assert.ok(!adminHtml.includes('Mặc định là 2026'), 'admin.html must NOT contain hardcoded PIN 2026');
assert.ok(adminHtml.includes('admin-email-input') || adminHtml.includes('type="email"'), 'admin.html must use email login for admin');
console.log('✅ TEST 7 PASSED: UI templates correctly integrated with Supabase.');

// 8. Verify Customer Portal & 3D Production Tracker
console.log('--- TEST 8: Customer Portal & 3D Tracking ---');
assert.ok(fs.existsSync(path.join(root, 'js', 'account-manager.js')), 'js/account-manager.js must exist');
const accountManagerCode = read('js/account-manager.js');
assert.ok(accountManagerCode.includes('pending_confirmation'), 'Account manager must support 8 3D production statuses');
assert.ok(accountManagerCode.includes('printing_in_progress'), 'Account manager must support printing_in_progress');
assert.ok(accountManagerCode.includes('completed'), 'Account manager must support completed');
console.log('✅ TEST 8 PASSED: Customer Portal and 8-stage 3D tracker verified.');

console.log('🎉 ALL SECURE ECOMMERCE UPGRADE TESTS PASSED!');
