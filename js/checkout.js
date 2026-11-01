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

  // Checkout Context cô lập phiên đặt hàng
  let currentCheckoutContext = null;
  let previousActiveElement = null;

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
   * Kiểm tra schema bản ghi đơn hàng nghiêm ngặt (Codex Directive TT3D-ARCH-20261021-R2)
   * Chặn hoàn toàn invalid channel types, invalid totals fields, markup hoặc injection
   */
  function isValidOrderRecord(rec) {
    if (!rec || typeof rec !== 'object') return false;
    if (typeof rec.clientRequestId !== 'string' || !rec.clientRequestId || rec.clientRequestId.length > 64) return false;
    if (typeof rec.createdAt !== 'string' || isNaN(Date.parse(rec.createdAt))) return false;

    // Validate channel strictly (string only, max 32 chars)
    if (rec.channel !== undefined && rec.channel !== null) {
      if (typeof rec.channel !== 'string' || !rec.channel.trim() || rec.channel.length > 32) return false;
    }

    if (!rec.customer || typeof rec.customer !== 'object') return false;
    if (typeof rec.customer.name !== 'string' || !rec.customer.name.trim() || rec.customer.name.length > 100) return false;
    const cleanPhone = (typeof rec.customer.phone === 'string') ? rec.customer.phone.replace(/[\s.-]/g, '') : '';
    if (!/^(?:0|\+84)(?:3|5|7|8|9)\d{8}$/.test(cleanPhone)) return false;
    if (typeof rec.customer.address !== 'string' || !rec.customer.address.trim() || rec.customer.address.length > 255) return false;
    if (rec.customer.note !== undefined && rec.customer.note !== null && (typeof rec.customer.note !== 'string' || rec.customer.note.length > 500)) return false;

    if (!Array.isArray(rec.items) || rec.items.length === 0 || rec.items.length > 100) return false;
    for (const item of rec.items) {
      if (!item || typeof item !== 'object') return false;
      if (typeof item.title !== 'string' || item.title.length > 150) return false;
      if (typeof item.qty !== 'number' || !Number.isSafeInteger(item.qty) || item.qty <= 0) return false;
      if (typeof item.price !== 'number' || !Number.isSafeInteger(item.price) || item.price < 0) return false;
    }

    if (!rec.totals || typeof rec.totals !== 'object') return false;
    const finalTotal = rec.totals.finalTotal !== undefined ? rec.totals.finalTotal : rec.totals.total;
    if (typeof finalTotal !== 'number' || !Number.isSafeInteger(finalTotal) || finalTotal < 0) return false;

    // Validate subtotal if present (must be safe non-negative integer)
    if (rec.totals.subtotal !== undefined && rec.totals.subtotal !== null) {
      if (typeof rec.totals.subtotal !== 'number' || !Number.isSafeInteger(rec.totals.subtotal) || rec.totals.subtotal < 0) return false;
    }
    // Validate shippingFee if present
    if (rec.totals.shippingFee !== undefined && rec.totals.shippingFee !== null) {
      if (typeof rec.totals.shippingFee !== 'number' || !Number.isSafeInteger(rec.totals.shippingFee) || rec.totals.shippingFee < 0) return false;
    }
    // Validate discountAmount if present
    if (rec.totals.discountAmount !== undefined && rec.totals.discountAmount !== null) {
      if (typeof rec.totals.discountAmount !== 'number' || !Number.isSafeInteger(rec.totals.discountAmount) || rec.totals.discountAmount < 0) return false;
    }
    // Validate discountPercent if present (0 to 100)
    if (rec.totals.discountPercent !== undefined && rec.totals.discountPercent !== null) {
      if (typeof rec.totals.discountPercent !== 'number' || isNaN(rec.totals.discountPercent) || rec.totals.discountPercent < 0 || rec.totals.discountPercent > 100) return false;
    }

    return true;
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
      shipping: shippingFee,
      finalTotal,
      total: finalTotal,
      payableTotal: finalTotal,
      isFreeShipping: (shippingFee === 0 && subtotal > 0)
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
   * Tuân thủ triệt để Contract TT3D-ARCH-20261021-R2 từ Codex Master Controller:
   * Phân biệt rõ key chưa tồn tại (raw === null) với JSON rỗng / chuỗi whitespace / corrupted
   * Trả về:
   *   { ok: true, clientRequestId: string }
   *   { ok: false, code: 'INVALID_RECORD' | 'INVALID_STORE' | 'STORAGE_UNAVAILABLE' }
   */
  function saveOrderDraft(orderRecord) {
    if (!isValidOrderRecord(orderRecord)) {
      return { ok: false, code: 'INVALID_RECORD' };
    }
    try {
      if (typeof localStorage === 'undefined') {
        return { ok: false, code: 'STORAGE_UNAVAILABLE' };
      }
      const raw = localStorage.getItem(DRAFT_ORDERS_KEY);
      let list = [];
      if (raw !== null) {
        try {
          list = JSON.parse(raw);
        } catch (e) {
          // raw JSON hỏng hoặc chuỗi rỗng: giữ nguyên dữ liệu gốc, KHÔNG ghi đè, trả INVALID_STORE (Codex R2-03)
          return { ok: false, code: 'INVALID_STORE' };
        }
        if (!Array.isArray(list)) {
          // raw JSON không phải mảng (kể cả object/null): không tự ý đè, trả INVALID_STORE
          return { ok: false, code: 'INVALID_STORE' };
        }
      }

      // Deduplicate theo clientRequestId khi retry, không tạo bản sao trùng lặp
      const existingIdx = list.findIndex(d => d && d.clientRequestId === orderRecord.clientRequestId);
      if (existingIdx >= 0) {
        list[existingIdx] = orderRecord;
      } else {
        list.unshift(orderRecord);
      }

      // Giữ tối đa 50 đơn nháp gần nhất
      const sliced = list.slice(0, 50);
      localStorage.setItem(DRAFT_ORDERS_KEY, JSON.stringify(sliced));
      return { ok: true, clientRequestId: orderRecord.clientRequestId };
    } catch (e) {
      console.warn('[Checkout] Lỗi lưu đơn nháp vào localStorage:', e);
      return { ok: false, code: 'STORAGE_UNAVAILABLE' };
    }
  }

  /**
   * Lấy danh sách các đơn hàng nháp từ localStorage
   * Lọc và chỉ trả về các record hợp lệ (safe schema). Bỏ qua record sai, không ném lỗi.
   */
  function getDraftOrders() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(DRAFT_ORDERS_KEY);
      if (raw === null || !raw.trim()) return [];
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return [];
      return list.filter(isValidOrderRecord);
    } catch (e) {
      console.warn('[Checkout] Lỗi đọc đơn nháp từ localStorage:', e);
      return [];
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng trong kho draft TT_DIRECT_ORDER_DRAFTS_V1
   */
  function updateDraftOrderStatus(orderId, updateData) {
    if (!orderId || !updateData) return { ok: false, error: 'Thiếu dữ liệu' };
    const orders = getDraftOrders();
    const idx = orders.findIndex(o => o.orderId === orderId || o.clientRequestId === orderId || o.id === orderId);
    if (idx === -1) {
      return { ok: false, error: 'Không tìm thấy đơn hàng trong draft' };
    }

    const ord = orders[idx];
    if (updateData.status) ord.status = updateData.status;
    if (updateData.etaDate !== undefined) ord.etaDate = updateData.etaDate;
    if (updateData.carrier !== undefined) ord.carrier = updateData.carrier;
    if (updateData.customerAlert !== undefined) ord.customerAlert = updateData.customerAlert;
    if (updateData.publicNote !== undefined) ord.publicNote = updateData.publicNote;
    if (updateData.privateNote !== undefined) ord.privateNote = updateData.privateNote;
    ord.updatedAt = new Date().toISOString();

    if (!Array.isArray(ord.history)) ord.history = [];
    ord.history.push({
      status: ord.status,
      timestamp: ord.updatedAt,
      note: updateData.historyNote || (updateData.status === 'confirmed' ? 'Xưởng xác nhận đơn và xếp lịch in 3D' : `Đổi trạng thái sang ${updateData.status}`),
      staff: updateData.staff || 'Quản trị xưởng'
    });

    try {
      localStorage.setItem(DRAFT_ORDERS_KEY, JSON.stringify(orders));
      return { ok: true, order: ord };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  /**
   * Tra cứu đơn hàng theo Mã Đơn chính xác (clientRequestId)
   * Không tìm theo tên, số điện thoại hoặc partial ID ở bản client-side (Codex Directive F06 & R2-06).
   * Trả về view model đã được whitelist projection tối thiểu an toàn, che giấu PII.
   */
  function lookupOrder(query) {
    if (!query || typeof query !== 'string') return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const orders = getDraftOrders();
    const match = orders.find(ord => {
      return typeof ord.clientRequestId === 'string' && ord.clientRequestId.toLowerCase() === q;
    });
    if (!match) return [];

    const rawPhone = (match.customer && typeof match.customer.phone === 'string') ? match.customer.phone.replace(/\D/g, '') : '';
    const masked = rawPhone.length > 5
      ? rawPhone.slice(0, 3) + '***' + rawPhone.slice(-3)
      : rawPhone;

    const totalVnd = (match.totals && typeof (match.totals.finalTotal !== undefined ? match.totals.finalTotal : match.totals.total) === 'number')
      ? (match.totals.finalTotal !== undefined ? match.totals.finalTotal : match.totals.total)
      : 0;

    return [{
      clientRequestId: match.clientRequestId,
      createdAt: match.createdAt,
      statusText: 'Bản nháp trên thiết bị · Chưa gửi tới xưởng',
      channel: match.channel || 'zalo',
      maskedPhone: masked,
      items: match.items.map(item => ({
        title: item.title,
        qty: item.qty,
        price: item.price
      })),
      estimatedTotalVnd: totalVnd,
      isFreeShipping: !!(match.totals && match.totals.isFreeShipping)
    }];
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
      if (item.customText) {
        const fontNote = item.fontId ? ` [Font: ${item.fontId}]` : '';
        opt.push(`Khắc tên: "${item.customText}"${fontNote}`);
      }
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
  
  /**
   * Khởi tạo và đồng bộ dropdown 2 cấp hành chính (Tỉnh/Thành phố & Phường/Xã)
   */
  function initAdminDropdowns() {
    if (typeof document === 'undefined') return;
    const provSelect = document.getElementById('checkout-province-select');
    const wardSelect = document.getElementById('checkout-ward-select');
    if (!provSelect || !wardSelect) return;

    // Chỉ điền tỉnh nếu chưa có options
    const optLen = (provSelect.options ? provSelect.options.length : 0);
    if (optLen <= 1 && window.VNAdmin && Array.isArray(window.VNAdmin.ALL_PROVINCES)) {
      provSelect.innerHTML = '<option value="">-- Chọn Tỉnh / Thành phố --</option>';
      window.VNAdmin.ALL_PROVINCES.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.code;
        opt.textContent = p.name;
        provSelect.appendChild(opt);
      });
    }

    provSelect.onchange = function () {
      const pCode = provSelect.value;
      if (!pCode || !window.VNAdmin) {
        wardSelect.innerHTML = '<option value="">-- Chọn Tỉnh trước --</option>';
        wardSelect.disabled = true;
        return;
      }
      const wards = window.VNAdmin.getWardsByProvince(pCode);
      wardSelect.innerHTML = '<option value="">-- Chọn Phường / Xã / Đặc khu --</option>';
      wards.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.code;
        opt.textContent = w.name + (w.old_district ? ' (' + w.old_district + ')' : '');
        wardSelect.appendChild(opt);
      });
      wardSelect.disabled = false;
      updateCheckoutTotalsDisplay();
    };
  }

  /**
   * Cập nhật hiển thị tổng tiền & chiết khấu trong Checkout
   */
  function updateCheckoutTotalsDisplay() {
    if (!currentCheckoutContext) return;
    const totals = calculateOrderTotals(currentCheckoutContext.items, currentCheckoutContext.discountPercent);

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
  }

  /**
   * Chuyển đổi giữa chế độ Chọn địa chỉ đã lưu và Nhập địa chỉ mới
   */
  function toggleCheckoutAddressMode() {
    if (!currentCheckoutContext) return;
    const savedView = document.getElementById('checkout-saved-addresses-view');
    const newView = document.getElementById('checkout-new-address-view');
    const toggleBtn = document.getElementById('checkout-btn-toggle-address-mode');

    if (currentCheckoutContext.addressMode === 'saved') {
      currentCheckoutContext.addressMode = 'new';
      if (savedView) savedView.classList.add('hidden');
      if (newView) newView.classList.remove('hidden');
      if (toggleBtn) toggleBtn.textContent = '← Chọn địa chỉ đã lưu';
    } else {
      currentCheckoutContext.addressMode = 'saved';
      if (savedView) savedView.classList.remove('hidden');
      if (newView) newView.classList.add('hidden');
      if (toggleBtn) toggleBtn.textContent = '+ Nhập địa chỉ mới';
    }
  }

  /**
   * Hiển thị Sổ địa chỉ thông minh trong Checkout Modal
   */
  async function renderCheckoutAddressBook() {
    if (typeof document === 'undefined') return;
    initAdminDropdowns();

    const savedView = document.getElementById('checkout-saved-addresses-view');
    const newView = document.getElementById('checkout-new-address-view');
    const cardsContainer = document.getElementById('checkout-saved-address-cards');
    const toggleBtn = document.getElementById('checkout-btn-toggle-address-mode');

    let addresses = [];
    if (window.TTAddressBook && typeof window.TTAddressBook.loadAddresses === 'function') {
      addresses = await window.TTAddressBook.loadAddresses();
    }

    if (Array.isArray(addresses) && addresses.length > 0) {
      // Khách đã có địa chỉ lưu
      currentCheckoutContext.addressMode = 'saved';
      if (savedView) savedView.classList.remove('hidden');
      if (newView) newView.classList.add('hidden');
      if (toggleBtn) {
        toggleBtn.classList.remove('hidden');
        toggleBtn.textContent = '+ Nhập địa chỉ mới';
      }

      // Xác định địa chỉ được chọn ban đầu (mặc định hoặc địa chỉ đầu tiên)
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
      currentCheckoutContext.selectedAddressId = defaultAddr.id;

      if (cardsContainer) {
        cardsContainer.innerHTML = '';
        addresses.forEach(addr => {
          const isSelected = addr.id === currentCheckoutContext.selectedAddressId;
          const meta = window.TTAddressBook.getLabelMeta(addr.label);
          const fullAddrText = window.TTAddressBook.formatFullAddress(addr);

          const card = document.createElement('div');
          card.className = `p-3 rounded-2xl border transition-all cursor-pointer ${
            isSelected
              ? 'bg-[#D45B34]/5 border-[#D45B34] shadow-xs'
              : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] hover:border-zinc-400'
          }`;

          card.onclick = () => {
            currentCheckoutContext.selectedAddressId = addr.id;
            renderCheckoutAddressBook();
          };

          card.innerHTML = `
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <input type="radio" name="checkout-addr-select" ${isSelected ? 'checked' : ''} class="text-[#D45B34] focus:ring-[#D45B34] pointer-events-none mt-0.5">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${meta.badgeClass}">
                  <i class="fa-solid ${meta.icon}"></i>
                  <span>${meta.name}</span>
                </span>
                ${addr.is_default ? '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">Mặc định</span>' : ''}
              </div>
              <span class="text-xs font-mono font-bold text-[var(--text-primary)]">${addr.recipient_phone}</span>
            </div>
            <div class="mt-1.5 pl-5 space-y-0.5 text-xs">
              <div class="font-bold text-[var(--text-primary)]">${escapeHtml(addr.recipient_name)}</div>
              <div class="text-[var(--text-secondary)] text-[11px] leading-relaxed">${escapeHtml(fullAddrText)}</div>
              ${addr.delivery_note ? `<div class="text-[10px] text-zinc-400 italic"><i class="fa-solid fa-note-sticky mr-1"></i>${escapeHtml(addr.delivery_note)}</div>` : ''}
            </div>
          `;

          cardsContainer.appendChild(card);
        });
      }
    } else {
      // Khách chưa có địa chỉ lưu -> Hiện form nhập địa chỉ mới
      currentCheckoutContext.addressMode = 'new';
      if (savedView) savedView.classList.add('hidden');
      if (newView) newView.classList.remove('hidden');
      if (toggleBtn) toggleBtn.classList.add('hidden');

      // Tự động điền họ tên, số điện thoại từ tài khoản nếu có
      const currentUser = (window.TTSupabase && typeof window.TTSupabase.getUser === 'function')
        ? window.TTSupabase.getUser()
        : null;

      const nameInput = document.getElementById('checkout-cust-name');
      const phoneInput = document.getElementById('checkout-cust-phone');
      if (currentUser && currentUser.user_metadata) {
        if (nameInput && !nameInput.value) nameInput.value = currentUser.user_metadata.full_name || '';
        if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.user_metadata.phone || '';
      }
    }
  }

  /**
   * Áp dụng mã giảm giá
   */
  function applyCheckoutCoupon() {
    if (!currentCheckoutContext) return;
    const input = document.getElementById('checkout-coupon-input');
    const msg = document.getElementById('checkout-coupon-msg');
    const code = input ? input.value.trim().toUpperCase() : '';

    if (!code) {
      currentCheckoutContext.discountPercent = 0;
      updateCheckoutTotalsDisplay();
      if (msg) {
        msg.className = 'text-[11px] text-zinc-400 font-medium block';
        msg.textContent = 'Đã hủy mã giảm giá.';
      }
      return;
    }

    // Danh mục mã ưu đãi T&T 3D Studio
    const coupons = {
      'TT3D10': { percent: 10, note: 'Giảm 10% đơn hàng chào mừng' },
      'GIAM10': { percent: 10, note: 'Ưu đãi 10% khách hàng mới' },
      'TT3D15': { percent: 15, note: 'Giảm 15% tri ân khách hàng thân thiết' },
      'TT3D20': { percent: 20, note: 'Ưu đãi đặc biệt 20% xưởng in' }
    };

    if (coupons[code]) {
      currentCheckoutContext.discountPercent = coupons[code].percent;
      updateCheckoutTotalsDisplay();
      if (msg) {
        msg.className = 'text-[11px] text-emerald-500 font-medium block';
        msg.textContent = `✓ Áp dụng mã ${code}: ${coupons[code].note}`;
      }
    } else {
      if (msg) {
        msg.className = 'text-[11px] text-rose-500 font-medium block';
        msg.textContent = 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
      }
    }
  }

  function openCheckoutModal(items, discountPercent = 0, options = {}) {
    if (!Array.isArray(items) || items.length === 0) {
      if (typeof alert === 'function') {
        alert('Không có sản phẩm nào để thanh toán! Vui lòng chọn sản phẩm.');
      }
      return;
    }

    // MANDATORY AUTH CHECK (Codex Directive 2026-10-31)
    if (window.TTSupabase && !window.TTSupabase.isAuthenticated()) {
      if (window.TTAccountManager && typeof window.TTAccountManager.openAuthModal === 'function') {
        window.TTAccountManager.openAuthModal('login', 'checkout');
      } else if (typeof alert === 'function') {
        alert('Khách hàng bắt buộc phải đăng nhập trước khi tiến hành đặt hàng.');
      }
      return;
    }

    // MANDATORY EMAIL VERIFICATION CHECK
    if (window.TTSupabase && !window.TTSupabase.isEmailVerified()) {
      if (typeof alert === 'function') {
        alert('Vui lòng xác minh địa chỉ email của bạn trước khi tiến hành đặt hàng.');
      }
      return;
    }

    // Chặn các dòng CAD cũ có id print-quote-* hoặc category custom-print ở đầu vào checkout (Codex R2-01)
    const hasLegacyCadQuote = items.some(item => item && (String(item.id || '').startsWith('print-quote-') || item.category === 'custom-print'));
    if (hasLegacyCadQuote) {
      const msg = 'Đơn hàng có chứa mục yêu cầu in 3D theo file CAD chưa có báo giá từ xưởng. Vui lòng gửi yêu cầu báo giá qua Zalo để kỹ thuật viên cắt lớp (slice) và báo giá chính xác, hoặc xóa mục này khỏi giỏ trước khi đặt hàng.';
      if (typeof window.showToast === 'function') {
        window.showToast(msg);
      } else if (typeof alert === 'function') {
        alert(msg);
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
      fontId: item.fontId || null,
      fontName: item.fontName || null,
      customText: item.customText ? String(item.customText).trim().slice(0, 100) : null
    }));

    currentCheckoutContext = {
      source,
      items: cleanItems,
      discountPercent: Math.min(100, Math.max(0, parseInt(discountPercent, 10) || 0)),
      clientRequestId: generateOrderId(),
      state: 'editing',
      addressMode: 'saved', // 'saved' hoặc 'new'
      selectedAddressId: null,
      createdAt: new Date().toISOString()
    };

    if (typeof document === 'undefined') return;

    if (document.activeElement) {
      previousActiveElement = document.activeElement;
    }

    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    const totals = calculateOrderTotals(currentCheckoutContext.items, currentCheckoutContext.discountPercent);
    const saved = getSavedCustomerPreferences();

    // Tải và hiển thị Sổ địa chỉ thông minh
    renderCheckoutAddressBook();

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

    // Gửi sự kiện phân tích begin_checkout an toàn
    if (typeof window !== 'undefined' && window.TTAnalytics && typeof window.TTAnalytics.beginCheckout === 'function') {
      window.TTAnalytics.beginCheckout(items, totals.finalTotal);
    }

    // Reset view trạng thái kết quả
    const formSection = document.getElementById('checkout-form-section') || document.getElementById('checkout-step-input');
    const resultSection = document.getElementById('checkout-result-section') || document.getElementById('checkout-step-result');
    if (formSection) formSection.classList.remove('hidden');
    if (resultSection) resultSection.classList.add('hidden');

    // Chuyển focus vào ô nhập đầu tiên hoặc nút đóng (Codex B07 Accessibility)
    setTimeout(() => {
      const firstInput = document.getElementById('checkout-cust-name') || document.getElementById('checkout-close-btn');
      if (firstInput && typeof firstInput.focus === 'function') {
        try { firstInput.focus(); } catch (_) {}
      }
    }, 50);
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
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      try {
        previousActiveElement.focus();
      } catch (_) {}
      previousActiveElement = null;
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

    // Xác định kênh thanh toán (từ radio hoặc từ đối số)
    const selectedPaymentRadio = (typeof document !== 'undefined' && typeof document.querySelector === 'function')
      ? document.querySelector('input[name="checkout-payment-method"]:checked')
      : null;
    const finalChannel = selectedPaymentRadio ? selectedPaymentRadio.value : (channel || 'cod');

    let recipientName = '';
    let recipientPhone = '';
    let fullShippingAddress = '';
    let addressId = null;
    let provinceCode = null;
    let provinceName = null;
    let wardCode = null;
    let wardName = null;
    let addressLine = null;
    let addressLabel = 'home';
    let saveAddress = false;
    let deliveryNote = '';

    const noteInput = (typeof document !== 'undefined') ? document.getElementById('checkout-cust-note') : null;
    deliveryNote = noteInput ? noteInput.value.trim() : '';

    // Phân nhánh đọc địa chỉ: Đã lưu (Saved) hoặc Nhập mới (New)
    if (currentCheckoutContext.addressMode === 'saved') {
      const addresses = (window.TTAddressBook && window.TTAddressBook.addresses) ? window.TTAddressBook.addresses : [];
      const selected = addresses.find(a => a.id === currentCheckoutContext.selectedAddressId) || addresses.find(a => a.is_default) || addresses[0];

      if (!selected) {
        if (typeof alert === 'function') alert('Vui lòng chọn hoặc thêm địa chỉ nhận hàng.');
        return;
      }

      addressId = selected.id;
      recipientName = selected.recipient_name;
      recipientPhone = selected.recipient_phone;
      provinceCode = selected.province_code;
      provinceName = selected.province_name;
      wardCode = selected.ward_code;
      wardName = selected.ward_name;
      addressLine = selected.address_line;
      addressLabel = selected.label || 'home';
      fullShippingAddress = window.TTAddressBook ? window.TTAddressBook.formatFullAddress(selected) : `${addressLine}, ${wardName}, ${provinceName}`;
      if (!deliveryNote && selected.delivery_note) deliveryNote = selected.delivery_note;
    } else {
      // Chế độ nhập địa chỉ mới (2 cấp hành chính)
      const nameInput = document.getElementById('checkout-cust-name');
      const phoneInput = document.getElementById('checkout-cust-phone');
      const provSelect = document.getElementById('checkout-province-select');
      const wardSelect = document.getElementById('checkout-ward-select');
      const lineInput = document.getElementById('checkout-cust-address-line') || document.getElementById('checkout-cust-address');
      const saveChk = document.getElementById('checkout-save-address-chk');
      const labelRadio = (typeof document !== 'undefined' && typeof document.querySelector === 'function')
        ? document.querySelector('input[name="checkout-addr-label"]:checked')
        : null;

      recipientName = nameInput ? nameInput.value.trim() : '';
      const rawPhone = phoneInput ? phoneInput.value.trim() : '';
      provinceCode = provSelect ? provSelect.value : '';
      provinceName = (provSelect && provSelect.selectedIndex >= 0) ? provSelect.options[provSelect.selectedIndex].textContent : '';
      wardCode = wardSelect ? wardSelect.value : '';
      wardName = (wardSelect && wardSelect.selectedIndex >= 0) ? wardSelect.options[wardSelect.selectedIndex].textContent : '';
      addressLine = lineInput ? lineInput.value.trim() : '';
      addressLabel = labelRadio ? labelRadio.value : 'home';
      saveAddress = saveChk ? saveChk.checked : false;

      // Validate tên người nhận
      if (!recipientName) {
        if (typeof alert === 'function') alert('Vui lòng nhập Họ và Tên người nhận hàng.');
        if (nameInput) nameInput.focus();
        return;
      }

      // Chuẩn hóa và validate số điện thoại
      recipientPhone = rawPhone.replace(/[\s.-]/g, '');
      const phoneRegex = /^(?:0|\+84)(?:3|5|7|8|9)\d{8}$/;
      if (!phoneRegex.test(recipientPhone)) {
        if (typeof alert === 'function') alert('Vui lòng nhập số điện thoại hợp lệ (10 chữ số) để kỹ thuật viên liên hệ.');
        if (phoneInput) phoneInput.focus();
        return;
      }

      // Validate 2 cấp hành chính (nếu có dropdown)
      if (provSelect && !provinceCode) {
        if (typeof alert === 'function') alert('Vui lòng chọn Tỉnh / Thành phố nhận hàng.');
        provSelect.focus();
        return;
      }

      if (wardSelect && !wardCode && !wardSelect.disabled) {
        if (typeof alert === 'function') alert('Vui lòng chọn Phường / Xã / Đặc khu nhận hàng.');
        wardSelect.focus();
        return;
      }

      // Validate số nhà, tên đường
      if (!addressLine) {
        if (typeof alert === 'function') alert('Vui lòng nhập số nhà, ngõ/đường hoặc thôn xóm.');
        if (lineInput) lineInput.focus();
        return;
      }

      const parts = [addressLine];
      if (wardName && !wardName.includes('--')) parts.push(wardName);
      if (provinceName && !provinceName.includes('--')) parts.push(provinceName);
      fullShippingAddress = parts.join(', ');
    }

    // Đánh dấu trạng thái submitting
    currentCheckoutContext.state = 'submitting';

    // Cập nhật nút bấm sang trạng thái loading
    const submitBtnText = document.getElementById('checkout-btn-submit-text');
    if (submitBtnText) submitBtnText.textContent = 'ĐANG XỬ LÝ ĐẶT HÀNG...';

    // Tính toán lại tổng tiền từ context
    const totals = calculateOrderTotals(currentCheckoutContext.items, currentCheckoutContext.discountPercent);
    const orderId = currentCheckoutContext.clientRequestId || generateOrderId();

    const orderRecord = {
      schemaVersion: 1,
      clientRequestId: orderId,
      createdAt: new Date().toISOString(),
      channel: finalChannel,
      source: currentCheckoutContext.source,
      status: 'handoff_ready',
      customer: {
        name: recipientName,
        phone: recipientPhone,
        address: fullShippingAddress,
        note: deliveryNote
      },
      items: currentCheckoutContext.items.map(i => ({
        id: i.id,
        title: i.title,
        colorId: i.colorId || null,
        colorName: i.colorName || null,
        materialId: i.materialId || null,
        materialName: i.materialName || null,
        customText: i.customText || null,
        fontId: i.fontId || null,
        fontName: i.fontName || null,
        qty: i.qty,
        price: i.price
      })),
      totals
    };

    // Call Supabase RPC create_order (PostgreSQL Ground Truth pricing & atomic transaction)
    if (!window.TTSupabase || typeof window.TTSupabase.createOrder !== 'function') {
      currentCheckoutContext.state = 'editing';
      if (submitBtnText) submitBtnText.textContent = 'XÁC NHẬN ĐẶT HÀNG NGAY';
      const msg = 'Hệ thống kết nối máy chủ đặt hàng tạm thời không khả dụng. Giỏ hàng của bạn được bảo lưu an toàn.';
      if (typeof alert === 'function') alert(msg);
      return;
    }

    let serverRes;
    try {
      serverRes = await window.TTSupabase.createOrder({
        idempotency_key: orderId,
        payment_method: finalChannel,
        items: currentCheckoutContext.items.map(i => ({
          product_id: i.id,
          quantity: i.qty,
          selected_options: {
            color: i.colorName,
            material: i.materialName,
            custom_text: i.customText,
            font_id: i.fontId
          }
        })),
        shipping_name: recipientName,
        shipping_phone: recipientPhone,
        shipping_address: fullShippingAddress,
        customer_note: deliveryNote,
        address_id: addressId,
        save_address: saveAddress,
        province_code: provinceCode,
        province_name: provinceName,
        ward_code: wardCode,
        ward_name: wardName,
        address_line: addressLine,
        address_label: addressLabel
      });
    } catch (err) {
      currentCheckoutContext.state = 'editing';
      if (submitBtnText) submitBtnText.textContent = 'XÁC NHẬN ĐẶT HÀNG NGAY';
      console.error('[Checkout] Supabase RPC execution/network error:', err);
      const msg = 'Lỗi kết nối máy chủ: Không thể hoàn tất đơn hàng do mạng gián đoạn. Giỏ hàng của bạn được bảo lưu an toàn.';
      if (typeof alert === 'function') alert(msg);
      return;
    }

    if (!serverRes || !serverRes.ok) {
      currentCheckoutContext.state = 'editing';
      if (submitBtnText) submitBtnText.textContent = 'XÁC NHẬN ĐẶT HÀNG NGAY';
      const errMsg = (serverRes && serverRes.error) || 'Đặt hàng không thành công. Giỏ hàng của bạn được bảo lưu.';
      if (typeof alert === 'function') alert(errMsg);
      return;
    }

    if (serverRes.order_number) {
      orderRecord.orderNumber = serverRes.order_number;
    }

    // REQUIREMENT 6: Xóa giỏ hàng an toàn CHỈ KHI backend xác nhận thành công
    if (currentCheckoutContext.source === 'cart' && window.TTCart && typeof window.TTCart.clearCart === 'function') {
      window.TTCart.clearCart();
    }

    // Tải lại sổ địa chỉ nếu vừa lưu địa chỉ mới
    if (saveAddress && window.TTAddressBook && typeof window.TTAddressBook.loadAddresses === 'function') {
      window.TTAddressBook.loadAddresses(true).catch(() => {});
    }

    if (submitBtnText) submitBtnText.textContent = 'XÁC NHẬN ĐẶT HÀNG NGAY';

    // Lưu vào draft storage và thông tin ghi nhớ với contract chặt chẽ (Codex F03)
    const saved = saveOrderDraft(orderRecord);
    if (!saved.ok) {
      currentCheckoutContext.state = 'editing';
      const errMsg = (saved.code === 'STORAGE_UNAVAILABLE')
        ? 'Không thể lưu bản nháp đơn hàng (bộ nhớ trình duyệt bị đầy hoặc bị vô hiệu hóa). Giỏ hàng của bạn vẫn được giữ nguyên.'
        : 'Không thể lưu bản nháp đơn hàng do dữ liệu hoặc bộ nhớ cục bộ bị lỗi. Giỏ hàng của bạn vẫn được giữ nguyên.';
      if (typeof alert === 'function') alert(errMsg);
      return;
    }

    saveCustomerPreferences({ name: recipientName, phone: recipientPhone, address: fullShippingAddress }, saveAddress);
    currentCheckoutContext.state = 'handoff_ready';

    // Gửi sự kiện phân tích purchase / order_submitted an toàn
    if (typeof window !== 'undefined' && window.TTAnalytics && typeof window.TTAnalytics.purchase === 'function') {
      window.TTAnalytics.purchase(orderRecord);
    }

    // Đồng bộ đơn hàng lên Cloud Firestore đám mây (nếu có kết nối)
    if (typeof window !== 'undefined' && window.TTFirestore && typeof window.TTFirestore.saveOrder === 'function') {
      window.TTFirestore.saveOrder(orderRecord);
    }

    // Tự động thông báo đơn hàng mới về Chatbot Telegram (chạy ngầm an toàn)
    if (typeof window !== 'undefined' && window.TTTelegram && typeof window.TTTelegram.notifyNewOrder === 'function') {
      try {
        window.TTTelegram.notifyNewOrder(orderRecord);
      } catch (tgErr) {
        console.warn('[Checkout] Không thể gửi thông báo Telegram:', tgErr);
      }
    }

    // Tạo tin nhắn chuyển tiếp
    const messageText = buildOrderMessage(orderRecord);

    // Lấy số Zalo hotline từ helper dùng chung (Codex R2-04: Resolver duy nhất, không dùng fallback hardcode)
    const hotlinePhone = (window.TTStore && typeof window.TTStore.getZaloPhone === 'function')
      ? window.TTStore.getZaloPhone()
      : null;

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
        ? 'Đã Chuẩn Bị Yêu Cầu COD Trên Thiết Bị!'
        : 'Bản Nháp Sẵn Sàng Chuyển Tiếp Zalo!';
    }

    const resMsgEl = document.getElementById('checkout-result-msg');
    if (resMsgEl) {
      resMsgEl.textContent = (channel === 'cod')
        ? 'Đã chuẩn bị yêu cầu COD trên thiết bị này. Hãy gửi nội dung đơn hàng cho xưởng qua Zalo hoặc Hotline để kỹ thuật viên xác nhận.'
        : 'Bản nháp đã lưu trên thiết bị. Vui lòng nhấn nút "Mở Chat Zalo Với Xưởng" để gửi chi tiết đơn hàng cho kỹ thuật viên tiếp nhận.';
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
      if (hotlinePhone) {
        const zaloUrl = `https://zalo.me/${hotlinePhone}?text=${encodeURIComponent(messageText)}`;
        if ('href' in zaloBtn) {
          zaloBtn.href = zaloUrl;
          zaloBtn.target = '_blank';
          zaloBtn.rel = 'noopener noreferrer';
        }
        if (typeof zaloBtn.removeAttribute === 'function') {
          zaloBtn.removeAttribute('aria-disabled');
        }
        zaloBtn.onclick = function (e) {
          copyTextToClipboard(messageText, fallbackTextarea);
        };
      } else {
        // Resolver trả null: bỏ href, không tự fallback số khác (Codex R2-04)
        if (typeof zaloBtn.removeAttribute === 'function') {
          zaloBtn.removeAttribute('href');
        } else if ('href' in zaloBtn) {
          zaloBtn.href = '';
        }
        if (typeof zaloBtn.setAttribute === 'function') {
          zaloBtn.setAttribute('aria-disabled', 'true');
        }
        zaloBtn.onclick = function (e) {
          if (e && e.preventDefault) e.preventDefault();
          copyTextToClipboard(messageText, fallbackTextarea);
          const msg = 'Chưa cấu hình kênh Zalo hợp lệ. Vui lòng liên hệ hotline xưởng hoặc sao chép nội dung đơn hàng.';
          if (typeof window.showToast === 'function') window.showToast(msg);
          else if (typeof alert === 'function') alert(msg);
          return false;
        };
      }
    }

    // Ghi chú Codex F03: Không tự ý clearCart khi chỉ mới ở bước handoff_ready hoặc mở Zalo link.
    // Giỏ hàng được giữ an toàn để tránh mất dữ liệu của khách hàng.
  }

  function getCurrentContext() {
    return currentCheckoutContext ? JSON.parse(JSON.stringify(currentCheckoutContext)) : null;
  }

  function getFocusableElements(container) {
    if (!container || typeof container.querySelectorAll !== 'function') return [];
    const selectors = [
      'button:not([disabled]):not([aria-hidden="true"])',
      '[href]:not([aria-disabled="true"]):not([aria-hidden="true"])',
      'input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"])',
      'select:not([disabled]):not([aria-hidden="true"])',
      'textarea:not([disabled]):not([aria-hidden="true"])',
      '[tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])'
    ];
    const elements = Array.from(container.querySelectorAll(selectors.join(',')));
    return elements.filter(el => {
      return el.offsetParent !== null || (typeof el.offsetWidth === 'number' && el.offsetWidth > 0) || (typeof el.offsetHeight === 'number' && el.offsetHeight > 0);
    });
  }

  function initCheckoutModal() {
    if (typeof document === 'undefined') return;

    const modal = document.getElementById('checkout-modal');
    const closeBtn = document.getElementById('checkout-close-btn');
    const submitZaloBtn = document.getElementById('checkout-submit-zalo');
    const submitCodBtn = document.getElementById('checkout-submit-cod');
    const submitOrderBtn = document.getElementById('checkout-btn-submit-order');
    const toggleAddrBtn = document.getElementById('checkout-btn-toggle-address-mode');
    const applyCouponBtn = document.getElementById('checkout-coupon-apply-btn');

    if (submitOrderBtn) {
      submitOrderBtn.addEventListener('click', () => submitCheckout());
    }

    if (toggleAddrBtn) {
      toggleAddrBtn.addEventListener('click', toggleCheckoutAddressMode);
    }

    if (applyCouponBtn) {
      applyCouponBtn.addEventListener('click', applyCheckoutCoupon);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeCheckoutModal);
    }

    if (submitZaloBtn) {
      submitZaloBtn.addEventListener('click', () => submitCheckout('zalo'));
    }

    if (submitCodBtn) {
      submitCodBtn.addEventListener('click', () => submitCheckout('cod'));
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeCheckoutModal();
        }
      });

      // Trap Tab key inside modal (Codex B07 Focus Isolation)
      modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusables = getFocusableElements(modal);
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !modal.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modal.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      });
    }

    const addKeydown = (typeof window !== 'undefined' && typeof window.addEventListener === 'function')
      ? window.addEventListener.bind(window)
      : (typeof document !== 'undefined' && typeof document.addEventListener === 'function')
        ? document.addEventListener.bind(document)
        : null;

    if (addKeydown) {
      addKeydown('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
          const modalEl = document.getElementById('checkout-modal');
          if (modalEl && !modalEl.classList.contains('hidden')) {
            closeCheckoutModal();
          }
        }
      });
    }
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCheckoutModal);
    } else {
      initCheckoutModal();
    }
  }

  // Export API
  window.TTCheckout = {
    openCheckout: openCheckoutModal,
    openCheckoutModal,
    closeCheckout: closeCheckoutModal,
    closeCheckoutModal,
    submitCheckout,
    calculateOrderTotals,
    toggleCheckoutAddressMode,
    applyCheckoutCoupon,
    renderCheckoutAddressBook,
    getCurrentContext,
    escapeHtml,
    formatMoney,
    buildOrderMessage,
    getDraftOrders,
    updateDraftOrderStatus: updateDraftOrderStatus,
    lookupOrder
  };

})(typeof window !== 'undefined' ? window : this);
