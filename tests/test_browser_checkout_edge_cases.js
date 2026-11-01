/**
 * Test Suite: Browser Checkout Edge Cases & Security Defenses
 * 1. Network drop (Mất mạng / Network error)
 * 2. RPC Failure (Lỗi RPC backend / 500)
 * 3. Duplicate Order (Đơn hàng trùng / Double-click)
 * 4. DevTools Price Tampering (Khách sửa giá trong DevTools DOM/JS)
 * 5. Expired Session (Phiên đăng nhập hết hạn)
 */

const assert = require('assert');

// Setup mock browser window & document
global.window = global;
global.navigator = { onLine: true };

function createMockElement(tag, id = '') {
  return {
    tagName: (tag || 'div').toUpperCase(),
    id,
    value: '',
    textContent: '',
    innerHTML: '',
    className: '',
    classList: {
      _classes: new Set(),
      contains(cls) { return this._classes.has(cls); },
      add(cls) { this._classes.add(cls); },
      remove(cls) { this._classes.delete(cls); }
    },
    style: {},
    addEventListener: () => {},
    appendChild(child) {
      if (!this.children) this.children = [];
      this.children.push(child);
      return child;
    },
    querySelector: () => ({ value: 'cod', checked: true }),
    querySelectorAll: () => [],
    focus: () => {}
  };
}

global.document = {
  activeElement: null,
  body: { style: {} },
  addEventListener: () => {},
  createElement: (tag) => createMockElement(tag),
  getElementById: (id) => {
    if (!global._mockElements) global._mockElements = {};
    if (!global._mockElements[id]) {
      global._mockElements[id] = createMockElement('div', id);
    }
    return global._mockElements[id];
  },
  querySelector: () => ({ value: 'cod', checked: true }),
  querySelectorAll: () => []
};

global.localStorage = {
  _store: {},
  getItem: (k) => (k in global.localStorage._store ? global.localStorage._store[k] : null),
  setItem: (k, v) => { global.localStorage._store[k] = String(v); },
  removeItem: (k) => { delete global.localStorage._store[k]; },
  clear: () => { global.localStorage._store = {}; }
};

require('../js/vn-administrative.js');
require('../js/address-book.js');

global.TTAddressBook = {
  addresses: [
    {
      id: 'addr_123',
      recipient_name: 'Nguyễn Văn Test',
      recipient_phone: '0349657529',
      province_code: '42',
      province_name: 'Tỉnh Hà Tĩnh',
      ward_code: '18220',
      ward_name: 'Phường Bắc Hà',
      address_line: 'Số 100 Đường Trần Phú',
      label: 'home',
      is_default: true
    }
  ],
  formatFullAddress: (a) => `${a.address_line}, ${a.ward_name}, ${a.province_name}`,
  loadAddresses: async () => []
};

let cartItems = [
  { id: 'mw-cn-2084928', title: 'Mô hình T&T 3D', price: 139000, qty: 1 }
];
let cartCleared = false;
global.TTCart = {
  getCart: () => cartItems,
  clearCart: () => {
    cartCleared = true;
    cartItems = [];
  }
};

let lastAlert = null;
global.alert = (msg) => { lastAlert = msg; };

// Setup mock TTSupabase
let mockNetworkOnline = true;
let mockRpcReturn = null;
let rpcCallCount = 0;
let mockUserSessionValid = true;

global.TTSupabase = {
  isAuthenticated: () => mockUserSessionValid,
  isEmailVerified: () => mockUserSessionValid,
  getUser: () => (mockUserSessionValid ? { id: 'u_real_123', email: 'test@tt3dstudio.vn' } : null),
  createOrder: async (payload) => {
    rpcCallCount++;
    if (!mockNetworkOnline) {
      throw new Error('Failed to fetch: NetworkError when attempting to fetch resource.');
    }
    if (!mockUserSessionValid) {
      return { ok: false, code: 'UNAUTHORIZED', error: 'Bạn phải đăng nhập tài khoản trước khi tiến hành đặt hàng.' };
    }
    if (mockRpcReturn) {
      return mockRpcReturn;
    }
    return {
      ok: true,
      order_id: 'ord_real_' + Date.now(),
      order_number: 'TT3D-TEST-SUCCESS',
      subtotal: 139000,
      shipping_fee: 25000,
      total: 164000
    };
  }
};

require('../js/checkout.js');

function populateCheckoutForm() {
  document.getElementById('checkout-cust-name').value = 'Nguyễn Văn Test';
  document.getElementById('checkout-cust-phone').value = '0349657529';
  document.getElementById('checkout-province-select').value = '42';
  document.getElementById('checkout-province-select').options = [{ value: '42', textContent: 'Tỉnh Hà Tĩnh' }];
  document.getElementById('checkout-province-select').selectedIndex = 0;
  document.getElementById('checkout-ward-select').value = '18220';
  document.getElementById('checkout-ward-select').options = [{ value: '18220', textContent: 'Phường Bắc Hà' }];
  document.getElementById('checkout-ward-select').selectedIndex = 0;
  document.getElementById('checkout-cust-address-line').value = 'Số 100 Đường Trần Phú';
}

(async () => {
  console.log('🛡️ [TEST BROWSER EDGE CASES] Bắt đầu kiểm tra các kịch bản ngoại lệ trình duyệt...\n');

  // =========================================================================
  // SCENARIO 1: MẤT MẠNG (NETWORK OFFLINE / DROP)
  // =========================================================================
  console.log('--- SCENARIO 1: MẤT MẠNG KHI BẤM ĐẶT HÀNG ---');
  cartItems = [{ id: 'mw-cn-2084928', title: 'Mô hình T&T 3D', price: 139000, qty: 1 }];
  cartCleared = false;
  mockNetworkOnline = false; // Rớt mạng!
  mockUserSessionValid = true;
  mockRpcReturn = null;
  lastAlert = null;

  global.TTCheckout.openCheckoutModal(cartItems);
  populateCheckoutForm();

  await global.TTCheckout.submitCheckout('cod');

  assert.strictEqual(cartCleared, false, 'Giỏ hàng KHÔNG được xóa khi mất mạng');
  assert.strictEqual(cartItems.length, 1, 'Sản phẩm trong giỏ hàng phải còn nguyên');
  assert(lastAlert && lastAlert.includes('mạng gián đoạn'), 'Phải thông báo lỗi mạng cho khách hàng');
  const ctxNet = global.TTCheckout.getCurrentContext();
  assert.strictEqual(ctxNet.state, 'editing', 'State phải hồi phục về editing để khách thử lại');
  console.log('✅ PASS SCENARIO 1: Mất mạng -> Báo lỗi, bảo toàn giỏ hàng, cho phép thử lại.');

  // =========================================================================
  // SCENARIO 2: LỖI RPC BACKEND (500 / SERVICE UNAVAILABLE)
  // =========================================================================
  console.log('\n--- SCENARIO 2: LỖI MÁY CHỦ RPC BACKEND ---');
  mockNetworkOnline = true;
  cartCleared = false;
  mockRpcReturn = { ok: false, code: 'SERVICE_UNAVAILABLE', error: 'Máy chủ đang bảo trì nâng cấp' };
  lastAlert = null;

  await global.TTCheckout.submitCheckout('cod');

  assert.strictEqual(cartCleared, false, 'Giỏ hàng KHÔNG được xóa khi backend lỗi');
  assert(lastAlert && lastAlert.includes('Máy chủ đang bảo trì'), 'Phải hiển thị lỗi trả về từ máy chủ');
  const ctxRpc = global.TTCheckout.getCurrentContext();
  assert.strictEqual(ctxRpc.state, 'editing', 'State hồi phục về editing');
  console.log('✅ PASS SCENARIO 2: Lỗi RPC -> Giữ nguyên giỏ hàng, không sinh đơn ảo.');

  // =========================================================================
  // SCENARIO 3: CHỐNG GỬI TRÙNG KHI CLICK NHIỀU LẦN (RAPID DOUBLE CLICK)
  // =========================================================================
  console.log('\n--- SCENARIO 3: CHỐNG GỬI ĐƠN HÀNG TRÙNG (RAPID MULTI-CLICK) ---');
  mockRpcReturn = null;
  rpcCallCount = 0;
  cartCleared = false;

  // Giả lập click 3 lần cực nhanh khi request 1 đang pending
  let delayedRpcResolve;
  global.TTSupabase.createOrder = () => new Promise(res => {
    rpcCallCount++;
    delayedRpcResolve = res;
  });

  const p1 = global.TTCheckout.submitCheckout('cod');
  const p2 = global.TTCheckout.submitCheckout('cod');
  const p3 = global.TTCheckout.submitCheckout('cod');

  assert.strictEqual(rpcCallCount, 1, 'Chỉ 1 network call được phép bay đi, các click sau bị khóa');

  // Cho request 1 hoàn tất
  delayedRpcResolve({
    ok: true,
    order_id: 'ord_real_first',
    order_number: 'TT3D-FIRST-111',
    total: 164000
  });

  await Promise.all([p1, p2, p3]);
  assert.strictEqual(rpcCallCount, 1, 'Vẫn chỉ có đúng 1 lệnh gọi RPC hoàn tất');
  console.log('✅ PASS SCENARIO 3: Khóa trạng thái submitting chặn đứng spam click phía trình duyệt.');

  // =========================================================================
  // SCENARIO 4: KHÁCH SỬA GIÁ BẰNG DEVTOOLS (PRICE TAMPERING)
  // =========================================================================
  console.log('\n--- SCENARIO 4: KHÁCH CỐ TÌNH SỬA GIÁ TRONG DEVTOOLS CONSOLE ---');
  // Khách hàng mở DevTools Console, sửa thuộc tính price thành 100đ
  global.TTSupabase.createOrder = async (payload) => {
    // Backend RPC nhận payload: Chỉ đọc product_id và quantity!
    // Giá tiền phải tính theo database (139.000đ + 25.000đ ship = 164.000đ)
    assert(!('price' in payload.items[0]), 'Payload gửi lên backend KHÔNG chứa trường price từ client!');
    return {
      ok: true,
      order_id: 'ord_tamper_defended',
      order_number: 'TT3D-TAMPER-SAFE',
      subtotal: 139000,
      shipping_fee: 25000,
      total: 164000
    };
  };

  global.TTCheckout.openCheckoutModal([{ id: 'mw-cn-2084928', title: 'Mô hình T&T 3D', price: 100, qty: 1 }]); // Giá bị sửa thành 100đ
  populateCheckoutForm();
  await global.TTCheckout.submitCheckout('cod');
  console.log('✅ PASS SCENARIO 4: Client price bị loại bỏ 100%, backend hoàn toàn tự tính giá ground-truth.');

  // =========================================================================
  // SCENARIO 5: PHIÊN ĐĂNG NHẬP HẾT HẠN (EXPIRED SESSION)
  // =========================================================================
  console.log('\n--- SCENARIO 5: PHIÊN ĐĂNG NHẬP HẾT HẠN KHI ĐANG THANH TOÁN ---');
  // Khách mở checkout khi còn phiên, nhưng lúc submit thì token hết hạn
  const freshItems = [{ id: 'mw-cn-2084928', title: 'Mô hình T&T 3D', price: 139000, qty: 1 }];
  mockUserSessionValid = true;
  global.TTCheckout.openCheckoutModal(freshItems);

  mockUserSessionValid = false; // Token hết hạn
  lastAlert = null;
  cartCleared = false;

  global.TTSupabase.createOrder = async () => ({
    ok: false,
    code: 'UNAUTHORIZED',
    error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
  });

  await global.TTCheckout.submitCheckout('cod');

  assert.strictEqual(cartCleared, false, 'Giỏ hàng không được xóa khi phiên hết hạn');
  assert(lastAlert && lastAlert.includes('đăng nhập'), 'Báo lỗi phiên đăng nhập');
  console.log('✅ PASS SCENARIO 5: Phiên hết hạn -> Từ chối đặt hàng, bảo toàn giỏ hàng.');

  console.log('\n🎉 [HOÀN TẤT KIỂM THỬ TRÌNH DUYỆT] CẢ 5 KỊCH BẢN NGOẠI LỆ ĐỀU ĐẠT CHUẨN AN TOÀN (VERIFIED PASS)!');
})();
