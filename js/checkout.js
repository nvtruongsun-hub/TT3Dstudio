/**
 * T&T 3D Labs - Seamless Direct Checkout & Order Handoff Engine
 * Thay thế hoàn toàn cổng VietQR bằng luồng đặt hàng trực tiếp & Zalo 1-Chạm trung thực
 * Tuân thủ quy chuẩn bảo mật và nghiệp vụ từ Codex Master Controller (Directive 2026-10-20)
 */

(function (window) {
  'use strict';

  const DRAFT_ORDERS_KEY = 'TT_DIRECT_ORDER_DRAFTS_V1';
  const CUSTOMER_INFO_KEY = 'tt_customer_saved_info';
  const DEFAULT_ZALO = '0986888333';

  function formatMoney(amount) {
    if (amount === null || amount === undefined) return 'Đang cập nhật';
    const num = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/\D/g, ''), 10) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
  }

  function generateOrderId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return 'TT3D-' + window.crypto.randomUUID().slice(0, 8).toUpperCase();
    }
    return 'TT3D-' + Date.now().toString(36).slice(-6).toUpperCase();
  }

  /**
   * Tính toán tổng tiền đơn hàng chuẩn xác
   */
  function calculateOrderTotals(items, discountPercent = 0) {
    let subtotal = 0;
    if (Array.isArray(items)) {
      items.forEach(item => {
        const p = Number.isSafeInteger(item.price) ? item.price : 0;
        const q = Number.isSafeInteger(item.qty) && item.qty > 0 ? item.qty : 1;
        subtotal += p * q;
      });
    }

    const pct = Math.min(100, Math.max(0, parseInt(discountPercent, 10) || 0));
    const discountAmount = Math.round((subtotal * pct) / 100);
    const merchandiseTotal = subtotal - discountAmount;

    // Chính sách vận chuyển: Trên 300K miễn phí giao hàng
    let shippingFee = merchandiseTotal >= 300000 ? 0 : 25000;
    let payableTotal = merchandiseTotal + shippingFee;

    return {
      subtotal,
      discountPercent: pct,
      discountAmount,
      merchandiseTotal,
      shippingFee,
      payableTotal,
      isFreeShipping: shippingFee === 0
    };
  }

  /**
   * Lưu thông tin khách hàng nếu khách chọn ghi nhớ
   */
  function saveCustomerPreferences(info, remember) {
    try {
      if (remember) {
        localStorage.setItem(CUSTOMER_INFO_KEY, JSON.stringify({
          name: info.name || '',
          phone: info.phone || '',
          address: info.address || ''
        }));
      } else {
        localStorage.removeItem(CUSTOMER_INFO_KEY);
      }
    } catch (e) {
      console.warn('[Checkout] Lỗi lưu thông tin khách hàng:', e);
    }
  }

  /**
   * Đọc thông tin khách hàng đã lưu
   */
  function getSavedCustomerPreferences() {
    try {
      const raw = localStorage.getItem(CUSTOMER_INFO_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // Ignored
    }
    return null;
  }

  /**
   * Lưu đơn nháp vào lịch sử trình duyệt (TT_DIRECT_ORDER_DRAFTS_V1)
   */
  function saveOrderDraft(orderRecord) {
    try {
      const raw = localStorage.getItem(DRAFT_ORDERS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(orderRecord);
      // Giữ tối đa 50 đơn nháp gần nhất
      localStorage.setItem(DRAFT_ORDERS_KEY, JSON.stringify(list.slice(0, 50)));
    } catch (e) {
      console.warn('[Checkout] Lỗi lưu đơn nháp vào localStorage:', e);
    }
  }

  /**
   * Soạn tin nhắn đặt hàng chuẩn hóa
   */
  function buildOrderMessage(orderData) {
    const lines = [];
    lines.push(`🔥 YÊU CẦU ĐẶT HÀNG IN 3D - T&T 3D LABS 🔥`);
    lines.push(`Mã tham chiếu: ${orderData.clientRequestId}`);
    lines.push(`Thời gian: ${new Date(orderData.createdAt).toLocaleString('vi-VN')}`);
    lines.push(`----------------------------------------`);
    lines.push(`Khách hàng: ${orderData.customer.name}`);
    lines.push(`Số điện thoại: ${orderData.customer.phone}`);
    lines.push(`Địa chỉ nhận: ${orderData.customer.address}`);
    if (orderData.customer.note) {
      lines.push(`Ghi chú: ${orderData.customer.note}`);
    }
    lines.push(`----------------------------------------`);
    lines.push(`DANH SÁCH MẶT HÀNG:`);

    orderData.items.forEach((item, idx) => {
      const opt = [];
      if (item.colorName) opt.push(`Màu: ${item.colorName}`);
      if (item.materialName) opt.push(`Vật liệu: ${item.materialName}`);
      if (item.customText) opt.push(`Khắc tên: "${item.customText}"`);
      const optStr = opt.length > 0 ? ` (${opt.join(', ')})` : '';

      lines.push(`${idx + 1}. ${item.title}${optStr}`);
      lines.push(`   Số lượng: ${item.qty} x ${formatMoney(item.price)} = ${formatMoney(item.price * item.qty)}`);
    });

    lines.push(`----------------------------------------`);
    lines.push(`Tạm tính: ${formatMoney(orderData.totals.subtotal)}`);
    if (orderData.totals.discountAmount > 0) {
      lines.push(`Khuyến mại: -${formatMoney(orderData.totals.discountAmount)} (${orderData.totals.discountPercent}%)`);
    }
    lines.push(`Phí vận chuyển: ${orderData.totals.shippingFee === 0 ? 'MIỄN PHÍ (Đơn > 300K)' : formatMoney(orderData.totals.shippingFee)}`);
    lines.push(`👉 TỔNG TIỀN DỰ KIẾN: ${formatMoney(orderData.totals.payableTotal)}`);
    lines.push(`Phương thức: ${orderData.channel === 'cod' ? 'Thanh toán COD khi nhận hàng' : 'Trao đổi & Giữ hàng qua Zalo'}`);
    lines.push(`----------------------------------------`);
    lines.push(`Xin chào Kỹ thuật viên T&T 3D Labs, nhờ xưởng xác nhận đơn và thời gian hoàn thiện giúp mình!`);

    return lines.join('\n');
  }

  /**
   * Sao chép nội dung vào Clipboard với fallback an toàn
   */
  async function copyTextToClipboard(text, fallbackEl) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('[Checkout] Clipboard writeText thất bại, chuyển sang fallback:', err);
      }
    }

    if (fallbackEl) {
      fallbackEl.classList.remove('hidden');
      fallbackEl.value = text;
      fallbackEl.focus();
      fallbackEl.select();
      try {
        const success = document.execCommand('copy');
        return success;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  // Quản lý Modal Checkout
  function openCheckoutModal(cartItems, discountPercent = 0) {
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      alert('Giỏ hàng của bạn đang trống! Vui lòng chọn sản phẩm trước khi thanh toán.');
      return;
    }

    const totals = calculateOrderTotals(cartItems, discountPercent);
    const saved = getSavedCustomerPreferences();

    // Điền sẵn thông tin nếu có
    const nameInput = document.getElementById('checkout-cust-name');
    const phoneInput = document.getElementById('checkout-cust-phone');
    const addrInput = document.getElementById('checkout-cust-address');
    const noteInput = document.getElementById('checkout-cust-note');
    const rememberCheckbox = document.getElementById('checkout-remember-me');

    if (saved) {
      if (nameInput) nameInput.value = saved.name || '';
      if (phoneInput) phoneInput.value = saved.phone || '';
      if (addrInput) addrInput.value = saved.address || '';
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }

    // Hiển thị tóm tắt đơn
    const summaryEl = document.getElementById('checkout-summary-lines');
    if (summaryEl) {
      summaryEl.innerHTML = cartItems.map(item => `
        <div class="flex items-center justify-between py-1.5 text-xs border-b border-[var(--border-subtle)]">
          <div class="min-w-0 flex-1 pr-2">
            <span class="font-bold text-primary-color">${item.title}</span>
            <span class="text-secondary-color text-[11px] block">${item.qty} x ${formatMoney(item.price)}</span>
          </div>
          <span class="font-mono font-bold text-primary-color">${formatMoney(item.price * item.qty)}</span>
        </div>
      `).join('');
    }

    const subtotalEl = document.getElementById('checkout-total-subtotal');
    if (subtotalEl) subtotalEl.textContent = formatMoney(totals.subtotal);

    const shipEl = document.getElementById('checkout-total-shipping');
    if (shipEl) shipEl.textContent = totals.shippingFee === 0 ? 'Miễn phí (Freeship)' : formatMoney(totals.shippingFee);

    const grandEl = document.getElementById('checkout-total-grand');
    if (grandEl) grandEl.textContent = formatMoney(totals.payableTotal);

    // Mở modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Reset trạng thái màn hình chốt đơn
    const formSection = document.getElementById('checkout-form-section');
    const resultSection = document.getElementById('checkout-result-section');
    if (formSection) formSection.classList.remove('hidden');
    if (resultSection) resultSection.classList.add('hidden');
  }

  function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  /**
   * Xử lý xác nhận chốt đơn
   */
  async function submitCheckout(channel) {
    const nameInput = document.getElementById('checkout-cust-name');
    const phoneInput = document.getElementById('checkout-cust-phone');
    const addrInput = document.getElementById('checkout-cust-address');
    const noteInput = document.getElementById('checkout-cust-note');
    const rememberCheckbox = document.getElementById('checkout-remember-me');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const address = addrInput ? addrInput.value.trim() : '';
    const note = noteInput ? noteInput.value.trim() : '';
    const remember = rememberCheckbox ? rememberCheckbox.checked : false;

    // Validate
    if (!name) {
      alert('Vui lòng nhập Họ và Tên của bạn.');
      if (nameInput) nameInput.focus();
      return;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      alert('Vui lòng nhập số điện thoại hợp lệ (10 chữ số) để kỹ thuật viên liên hệ.');
      if (phoneInput) phoneInput.focus();
      return;
    }

    if (!address) {
      alert('Vui lòng nhập địa chỉ nhận hàng.');
      if (addrInput) addrInput.focus();
      return;
    }

    // Lấy giỏ hàng hiện tại
    const cart = window.TTCart ? window.TTCart.getItems() : [];
    if (!cart || cart.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    const discountPercent = window.TTCart ? window.TTCart.getDiscountPercent() : 0;
    const totals = calculateOrderTotals(cart, discountPercent);
    const orderId = generateOrderId();

    const orderRecord = {
      schemaVersion: 1,
      clientRequestId: orderId,
      createdAt: new Date().toISOString(),
      channel: channel, // 'zalo' hoặc 'cod'
      paymentMethod: 'cod',
      status: 'handoff_started',
      customer: { name, phone, address, note },
      items: cart.map(i => ({
        lineId: i.cartItemId || i.id,
        productId: i.id,
        title: i.title,
        colorId: i.colorId || null,
        colorName: i.colorName || null,
        materialId: i.materialId || null,
        materialName: i.materialName || null,
        customText: i.customText || null,
        qty: i.qty,
        price: i.price
      })),
      totals
    };

    // Lưu vào draft storage và thông tin ghi nhớ
    saveOrderDraft(orderRecord);
    saveCustomerPreferences({ name, phone, address }, remember);

    const messageText = buildOrderMessage(orderRecord);

    // Chuyển sang màn hình xác nhận kết quả
    const formSection = document.getElementById('checkout-form-section');
    const resultSection = document.getElementById('checkout-result-section');
    if (formSection) formSection.classList.add('hidden');
    if (resultSection) resultSection.classList.remove('hidden');

    const orderIdEl = document.getElementById('checkout-res-order-id');
    if (orderIdEl) orderIdEl.textContent = orderId;

    const msgPreviewEl = document.getElementById('checkout-res-msg-preview');
    if (msgPreviewEl) msgPreviewEl.textContent = messageText;

    const copyBtn = document.getElementById('checkout-btn-copy-msg');
    const fallbackTextarea = document.getElementById('checkout-fallback-copy-box');

    if (copyBtn) {
      copyBtn.onclick = async function () {
        const copied = await copyTextToClipboard(messageText, fallbackTextarea);
        if (copied) {
          copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Đã Sao Chép Tin Nhắn!</span>';
          copyBtn.classList.remove('btn-secondary');
          copyBtn.classList.add('bg-emerald-600', 'text-white');
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> <span>Sao Chép Lại Nội Dung</span>';
            copyBtn.classList.remove('bg-emerald-600', 'text-white');
            copyBtn.classList.add('btn-secondary');
          }, 3000);
        } else {
          alert('Không thể tự động sao chép. Vui lòng chọn và copy nội dung trong ô bên dưới.');
        }
      };
    }

    const zaloBtn = document.getElementById('checkout-btn-open-zalo');
    if (zaloBtn) {
      zaloBtn.href = `https://zalo.me/${DEFAULT_ZALO}?text=${encodeURIComponent(messageText)}`;
      zaloBtn.target = '_blank';
      zaloBtn.rel = 'noopener noreferrer';
    }

    // Nếu khách chọn COD, vẫn có nút chốt nhanh
    const codBadge = document.getElementById('checkout-res-cod-badge');
    if (codBadge) {
      if (channel === 'cod') {
        codBadge.classList.remove('hidden');
      } else {
        codBadge.classList.add('hidden');
      }
    }
  }

  // Khởi tạo listeners
  function init() {
    const closeBtn = document.getElementById('checkout-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeCheckoutModal);

    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCheckoutModal();
      });
    }

    const btnSubmitZalo = document.getElementById('checkout-submit-zalo');
    if (btnSubmitZalo) {
      btnSubmitZalo.addEventListener('click', () => submitCheckout('zalo'));
    }

    const btnSubmitCod = document.getElementById('checkout-submit-cod');
    if (btnSubmitCod) {
      btnSubmitCod.addEventListener('click', () => submitCheckout('cod'));
    }

    // Phím Escape để đóng modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeCheckoutModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TTCheckout = {
    openCheckout: openCheckoutModal,
    closeCheckout: closeCheckoutModal,
    calculateOrderTotals,
    getDraftOrders: () => {
      try {
        const raw = localStorage.getItem(DRAFT_ORDERS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }
  };

})(window);
