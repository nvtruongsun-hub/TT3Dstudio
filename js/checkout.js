/**
 * T&T 3D Labs - Seamless Direct Checkout & Order Handoff Engine
 * Thay thế hoàn toàn cổng VietQR bằng luồng đặt hàng trực tiếp & Zalo 1-Chạm trung thực
 * Nguồn dữ liệu duy nhất: Checkout Context (Hỗ trợ cả Luồng Giỏ Hàng và Luồng Mua Ngay Độc Lập)
 * Tuân thủ quy chuẩn kỹ thuật GPT-6.1-Sol (Codex Master Controller Directive 2026-10-20)
 */

(function (window) {
  'use strict';

  const DRAFT_ORDERS_KEY = 'TT_DIRECT_ORDER_DRAFTS_V1';
  const CUSTOMER_INFO_KEY = 'tt_customer_saved_info';
  const DEFAULT_ZALO = '0968988647';

  // Checkout Context cô lập phiên đặt hàng
  let currentCheckoutContext = null;

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatMoney(amount) {
    if (amount === null || amount === undefined) return 'Đang cập nhật';
    const num = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/\D/g, ''), 10) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
  }

  function generateOrderId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return 'TT3D-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    }
    return 'TT3D-' + Date.now().toString(36).slice(-6).toUpperCase();
  }

  /**
   * Tính toán tổng tiền đơn hàng chuẩn xác theo quy tắc Codex
   * Miễn phí vận chuyển khi tiền hàng sau giảm giá >= 300.000đ
   */
  function calculateOrderTotals(items, discountPercent = 0) {
    let subtotal = 0;
    if (Array.isArray(items)) {
      items.forEach(item => {
        const p = (typeof item.price === 'number' && Number.isSafeInteger(item.price)) ? item.price : 0;
        const q = (typeof item.qty === 'number' && Number.isSafeInteger(item.qty) && item.qty > 0) ? item.qty : 1;
        subtotal += p * q;
      });
    }

    const pct = Math.min(100, Math.max(0, parseInt(discountPercent, 10) || 0));
    const discountAmount = Math.round((subtotal * pct) / 100);
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    // Chính sách vận chuyển: Trên 300K sau giảm giá miễn phí giao hàng (25.000đ nếu dưới 300k)
    let shippingFee = (subtotal === 0 || discountedSubtotal >= 300000) ? 0 : 25000;
    let finalTotal = discountedSubtotal + shippingFee;

    return {
      subtotal,
      discountPercent: pct,
      discountAmount,
      discountedSubtotal,
      merchandiseTotal: discountedSubtotal,
      shippingFee,
      finalTotal,
      total: finalTotal,
      payableTotal: finalTotal,
      isFreeShipping: shippingFee === 0
    };
  }

  /**
   * Lưu thông tin khách hàng nếu khách chọn ghi nhớ
   */
  function saveCustomerPreferences(info, remember) {
    try {
      if (typeof localStorage === 'undefined') return;
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
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(CUSTOMER_INFO_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // Ignored
    }
    return null;
  }

  /**
   * Lưu đơn nháp vào lịch sử trình duyệt (TT_DIRECT_ORDER_DRAFTS_V1)
   * Chống trùng lặp draft theo clientRequestId
   */
  function saveOrderDraft(orderRecord) {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(DRAFT_ORDERS_KEY);
      const list = raw ? JSON.parse(raw) : [];

      // Kiểm tra nếu clientRequestId đã tồn tại thì không ghi đè thêm mới
      const existingIdx = list.findIndex(d => d.clientRequestId === orderRecord.clientRequestId);
      if (existingIdx >= 0) {
        list[existingIdx] = orderRecord;
      } else {
        list.unshift(orderRecord);
      }

      // Giữ tối đa 50 đơn nháp gần nhất
      localStorage.setItem(DRAFT_ORDERS_KEY, JSON.stringify(list.slice(0, 50)));
    } catch (e) {
      console.warn('[Checkout] Lỗi lưu đơn nháp vào localStorage:', e);
    }
  }

  /**
   * Soạn tin nhắn đặt hàng chuẩn hóa (không rò rỉ dữ liệu thừa, định dạng chuyên nghiệp)
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
      lines.push(`Tiền hàng sau giảm: ${formatMoney(orderData.totals.discountedSubtotal)}`);
    }
    lines.push(`Phí vận chuyển: ${orderData.totals.shippingFee === 0 ? 'MIỄN PHÍ (Đơn ≥ 300K)' : formatMoney(orderData.totals.shippingFee)}`);
    lines.push(`👉 TỔNG TIỀN DỰ KIẾN: ${formatMoney(orderData.totals.finalTotal)}`);
    lines.push(`Phương thức mong muốn: ${orderData.channel === 'cod' ? 'Thanh toán COD khi nhận hàng' : 'Trao đổi & Giữ hàng qua Zalo'}`);
    lines.push(`----------------------------------------`);
    lines.push(`Xin chào Kỹ thuật viên T&T 3D Labs, nhờ xưởng xác nhận đơn và thời gian hoàn thiện giúp mình!`);

    return lines.join('\n');
  }

  /**
   * Sao chép nội dung vào Clipboard an toàn
   */
  async function copyTextToClipboard(text, fallbackEl) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
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
      if (typeof fallbackEl.select === 'function') {
        fallbackEl.select();
      }
      try {
        if (typeof document !== 'undefined' && document.execCommand) {
          return document.execCommand('copy');
        }
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  /**
   * Mở Modal Checkout với Context độc lập
   * @param {Array} items - Danh sách mặt hàng (từ giỏ hàng hoặc từ luồng Mua Ngay)
   * @param {number} discountPercent - Mức giảm giá áp dụng
   * @param {Object} options - Tùy chọn nguồn { source: 'cart' | 'direct' }
   */
  function openCheckoutModal(items, discountPercent = 0, options = {}) {
    if (!Array.isArray(items) || items.length === 0) {
      if (typeof alert === 'function') {
        alert('Không có sản phẩm nào để thanh toán! Vui lòng chọn sản phẩm.');
      }
      return;
    }

    // Thiết lập Context duy nhất cho phiên checkout này
    const source = (options && options.source === 'direct') ? 'direct' : 'cart';
    const cleanItems = items.map(item => ({
      id: item.id || 'prod-item',
      title: item.title || 'Sản phẩm in 3D',
      price: Math.max(0, parseInt(item.price, 10) || 0),
      qty: Math.max(1, parseInt(item.qty, 10) || 1),
      colorId: item.colorId || null,
      colorName: item.colorName || null,
      materialId: item.materialId || null,
      materialName: item.materialName || null,
      customText: item.customText ? String(item.customText).trim().slice(0, 100) : null
    }));

    currentCheckoutContext = {
      source,
      items: cleanItems,
      discountPercent: Math.min(100, Math.max(0, parseInt(discountPercent, 10) || 0)),
      clientRequestId: generateOrderId(),
      state: 'editing',
      createdAt: new Date().toISOString()
    };

    if (typeof document === 'undefined') return;

    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    const totals = calculateOrderTotals(currentCheckoutContext.items, currentCheckoutContext.discountPercent);
    const saved = getSavedCustomerPreferences();

    // Điền thông tin khách hàng nếu đã lưu
    const nameInput = document.getElementById('checkout-cust-name');
    const phoneInput = document.getElementById('checkout-cust-phone');
    const addrInput = document.getElementById('checkout-cust-address') || document.getElementById('checkout-cust-addr');
    const noteInput = document.getElementById('checkout-cust-note');
    const rememberCheckbox = document.getElementById('checkout-remember-me');

    if (saved) {
      if (nameInput) nameInput.value = saved.name || '';
      if (phoneInput) phoneInput.value = saved.phone || '';
      if (addrInput) addrInput.value = saved.address || '';
      if (rememberCheckbox) rememberCheckbox.checked = true;
    } else {
      if (nameInput) nameInput.value = '';
      if (phoneInput) phoneInput.value = '';
      if (addrInput) addrInput.value = '';
      if (noteInput) noteInput.value = '';
      if (rememberCheckbox) rememberCheckbox.checked = false;
    }

    // Hiển thị tóm tắt danh sách mặt hàng (An toàn XSS)
    const summaryContainer = document.getElementById('checkout-summary-lines') || document.getElementById('checkout-summary-container');
    if (summaryContainer) {
      summaryContainer.innerHTML = '';
      currentCheckoutContext.items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between py-2 text-xs border-b border-[var(--border-subtle)]';

        const left = document.createElement('div');
        left.className = 'min-w-0 flex-1 pr-2';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'font-bold text-primary-color block truncate';
        titleSpan.textContent = item.title;
        left.appendChild(titleSpan);

        const detailsSpan = document.createElement('span');
        detailsSpan.className = 'text-secondary-color text-[11px] block mt-0.5';
        const opts = [];
        if (item.colorName) opts.push(item.colorName);
        if (item.materialName) opts.push(item.materialName);
        if (item.customText) opts.push(`Khắc: "${item.customText}"`);
        detailsSpan.textContent = `${item.qty} x ${formatMoney(item.price)}${opts.length > 0 ? ' • ' + opts.join(', ') : ''}`;
        left.appendChild(detailsSpan);

        const priceSpan = document.createElement('span');
        priceSpan.className = 'font-mono font-bold text-primary-color ml-2 shrink-0';
        priceSpan.textContent = formatMoney(item.price * item.qty);

        row.appendChild(left);
        row.appendChild(priceSpan);
        summaryContainer.appendChild(row);
      });
    }

    // Cập nhật các trường tổng tiền
    const subtotalEl = document.getElementById('checkout-total-subtotal') || document.getElementById('checkout-subtotal-val');
    if (subtotalEl) subtotalEl.textContent = formatMoney(totals.subtotal);

    const discountEl = document.getElementById('checkout-total-discount') || document.getElementById('checkout-discount-val');
    if (discountEl) {
      discountEl.textContent = totals.discountAmount > 0 ? `-${formatMoney(totals.discountAmount)}` : '0 đ';
    }

    const shipEl = document.getElementById('checkout-total-shipping') || document.getElementById('checkout-shipping-val');
    if (shipEl) {
      shipEl.textContent = totals.shippingFee === 0 ? 'Miễn phí (Freeship)' : formatMoney(totals.shippingFee);
    }

    const grandEl = document.getElementById('checkout-total-grand') || document.getElementById('checkout-total-val');
    if (grandEl) grandEl.textContent = formatMoney(totals.finalTotal);

    // Mở modal
    modal.classList.add('active');
    modal.classList.remove('hidden');
    if (document.body && document.body.style) {
      document.body.style.overflow = 'hidden';
    }

    // Reset view trạng thái kết quả
    const formSection = document.getElementById('checkout-form-section') || document.getElementById('checkout-step-input');
    const resultSection = document.getElementById('checkout-result-section') || document.getElementById('checkout-step-result');
    if (formSection) formSection.classList.remove('hidden');
    if (resultSection) resultSection.classList.add('hidden');
  }

  function closeCheckoutModal() {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.classList.add('hidden');
    if (document.body && document.body.style) {
      document.body.style.overflow = '';
    }
    if (currentCheckoutContext) {
      currentCheckoutContext.state = 'closed';
    }
  }

  /**
   * Xử lý xác nhận chốt đơn (Đọc CHÍNH XÁC từ currentCheckoutContext)
   * Chống nhấn đúp và bảo vệ đơn hàng giỏ hàng khi Mua Ngay
   */
  async function submitCheckout(channel) {
    if (!currentCheckoutContext || !Array.isArray(currentCheckoutContext.items) || currentCheckoutContext.items.length === 0) {
      if (typeof alert === 'function') alert('Không tìm thấy thông tin đơn hàng!');
      return;
    }

    // Chống gửi trùng lặp nếu đang xử lý hoặc đã hoàn tất
    if (currentCheckoutContext.state === 'submitting' || currentCheckoutContext.state === 'handoff_ready') {
      return;
    }

    const nameInput = document.getElementById('checkout-cust-name');
    const phoneInput = document.getElementById('checkout-cust-phone');
    const addrInput = document.getElementById('checkout-cust-address') || document.getElementById('checkout-cust-addr');
    const noteInput = document.getElementById('checkout-cust-note');
    const rememberCheckbox = document.getElementById('checkout-remember-me');

    const name = nameInput ? nameInput.value.trim() : '';
    const rawPhone = phoneInput ? phoneInput.value.trim() : '';
    const address = addrInput ? addrInput.value.trim() : '';
    const note = noteInput ? noteInput.value.trim() : '';
    const remember = rememberCheckbox ? rememberCheckbox.checked : false;

    // Validate tên
    if (!name) {
      if (typeof alert === 'function') alert('Vui lòng nhập Họ và Tên của bạn.');
      if (nameInput) nameInput.focus();
      return;
    }

    // Chuẩn hóa và validate số điện thoại (Chuẩn di động Việt Nam)
    const cleanPhone = rawPhone.replace(/[\s.-]/g, '');
    const phoneRegex = /^(?:0|\+84)(?:3|5|7|8|9)\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      if (typeof alert === 'function') alert('Vui lòng nhập số điện thoại hợp lệ (10 chữ số) để kỹ thuật viên liên hệ.');
      if (phoneInput) phoneInput.focus();
      return;
    }

    // Validate địa chỉ
    if (!address) {
      if (typeof alert === 'function') alert('Vui lòng nhập địa chỉ nhận hàng.');
      if (addrInput) addrInput.focus();
      return;
    }

    // Đánh dấu trạng thái submitting
    currentCheckoutContext.state = 'submitting';

    // Tính toán lại tổng tiền từ context
    const totals = calculateOrderTotals(currentCheckoutContext.items, currentCheckoutContext.discountPercent);
    const orderId = currentCheckoutContext.clientRequestId || generateOrderId();

    const orderRecord = {
      schemaVersion: 1,
      clientRequestId: orderId,
      createdAt: new Date().toISOString(),
      channel: channel || 'zalo', // 'zalo' hoặc 'cod'
      source: currentCheckoutContext.source, // 'direct' hoặc 'cart'
      status: 'handoff_ready',
      customer: {
        name,
        phone: cleanPhone,
        address,
        note
      },
      items: currentCheckoutContext.items.map(i => ({
        id: i.id,
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
    saveCustomerPreferences({ name, phone: cleanPhone, address }, remember);

    currentCheckoutContext.state = 'handoff_ready';

    // Tạo tin nhắn chuyển tiếp
    const messageText = buildOrderMessage(orderRecord);

    // Lấy số Zalo hotline từ cấu hình
    const hotlinePhone = (window.TT_CONFIG && (window.TT_CONFIG.hotline || window.TT_CONFIG.zalo))
      ? String(window.TT_CONFIG.hotline || window.TT_CONFIG.zalo).replace(/\D/g, '')
      : DEFAULT_ZALO;

    // Chuyển sang màn hình xác nhận kết quả
    const formSection = document.getElementById('checkout-form-section') || document.getElementById('checkout-step-input');
    const resultSection = document.getElementById('checkout-result-section') || document.getElementById('checkout-step-result');
    if (formSection) formSection.classList.add('hidden');
    if (resultSection) resultSection.classList.remove('hidden');

    const orderIdEl = document.getElementById('checkout-res-order-id') || document.getElementById('checkout-result-order-id');
    if (orderIdEl) orderIdEl.textContent = orderId;

    const resTitleEl = document.getElementById('checkout-result-title');
    if (resTitleEl) {
      resTitleEl.textContent = (channel === 'cod')
        ? 'Đã Ghi Nhận Yêu Cầu COD Thành Công!'
        : 'Yêu Cầu Đã Sẵn Sàng Chuyển Tiếp Zalo!';
    }

    const resMsgEl = document.getElementById('checkout-result-msg');
    if (resMsgEl) {
      resMsgEl.textContent = (channel === 'cod')
        ? 'Xưởng in T&T 3D Labs đã lưu yêu cầu của bạn. Kỹ thuật viên sẽ gọi điện xác nhận chi tiết kỹ thuật trước khi đưa vào máy in.'
        : 'Vui lòng nhấn nút "Mở Chat Zalo Với Xưởng" để gửi chi tiết đơn hàng cho kỹ thuật viên tiếp nhận ngay.';
    }

    const msgPreviewEl = document.getElementById('checkout-res-msg-preview') || document.getElementById('checkout-msg-text');
    if (msgPreviewEl) {
      if ('value' in msgPreviewEl) {
        msgPreviewEl.value = messageText;
      } else {
        msgPreviewEl.textContent = messageText;
      }
    }

    const copyBtn = document.getElementById('checkout-btn-copy-msg') || document.getElementById('checkout-zalo-copy-btn');
    const fallbackTextarea = document.getElementById('checkout-fallback-copy-box') || document.getElementById('checkout-zalo-fallback-box');

    if (copyBtn) {
      copyBtn.onclick = async function () {
        const copied = await copyTextToClipboard(messageText, fallbackTextarea);
        if (copied) {
          copyBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i><span>Đã Sao Chép Đơn Hàng!</span>';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-regular fa-copy mr-2"></i><span>Sao Chép Lại Nội Dung</span>';
          }, 3000);
        } else {
          if (typeof alert === 'function') {
            alert('Không thể tự động sao chép. Vui lòng chọn và copy nội dung trong ô văn bản bên dưới.');
          }
        }
      };
    }

    const zaloBtn = document.getElementById('checkout-btn-open-zalo') || document.getElementById('checkout-zalo-direct-link');
    if (zaloBtn) {
      const zaloUrl = `https://zalo.me/${hotlinePhone}?text=${encodeURIComponent(messageText)}`;
      if ('href' in zaloBtn) {
        zaloBtn.href = zaloUrl;
        zaloBtn.target = '_blank';
        zaloBtn.rel = 'noopener noreferrer';
      }
      zaloBtn.onclick = function (e) {
        copyTextToClipboard(messageText, fallbackTextarea);
      };
    }

    // Nếu đơn hàng từ Giỏ Hàng hoàn tất qua Zalo/COD, xóa giỏ hàng (nếu là Mua Ngay, không động tới giỏ hàng)
    if (currentCheckoutContext.source === 'cart' && window.TTCart && typeof window.TTCart.clearCart === 'function') {
      window.TTCart.clearCart();
    }
  }

  function getCurrentContext() {
    return currentCheckoutContext ? JSON.parse(JSON.stringify(currentCheckoutContext)) : null;
  }

  // Export API
  window.TTCheckout = {
    openCheckout: openCheckoutModal,
    openCheckoutModal,
    closeCheckout: closeCheckoutModal,
    closeCheckoutModal,
    submitCheckout,
    calculateOrderTotals,
    getCurrentContext,
    escapeHtml,
    formatMoney,
    buildOrderMessage
  };

})(typeof window !== 'undefined' ? window : this);
