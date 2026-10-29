/**
 * T&T 3D Labs - Slide-Over Mini Cart & Direct Order Controller
 * Quản lý giỏ hàng xúc giác, định danh tuple chính xác, không còn phụ thuộc VietQR
 * Tuân thủ quy chuẩn kỹ thuật Codex Master Controller (Directive 2026-10-20)
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'tt3d_cart_items_v2';
  const LEGACY_STORAGE_KEY = 'tt3d_cart_items';
  const FREESHIP_THRESHOLD = 300000; // 300.000 VND

  let cart = [];
  let currentDiscountPercent = 0;

  function formatMoney(amount) {
    const num = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/\D/g, ''), 10) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Tạo Line ID dạng tuple có cấu trúc an toàn (bảo toàn fontId)
   */
  function buildLineId(productId, colorId, materialId, customText, fontId) {
    const parts = [
      String(productId || ''),
      String(colorId || ''),
      String(materialId || ''),
      String(customText || '').trim().normalize('NFC')
    ];
    if (fontId) {
      parts.push(String(fontId).trim());
    }
    return JSON.stringify(parts);
  }

  // Khởi tạo giỏ hàng từ localStorage (có migration an toàn từ v1)
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        cart = parsed.map(item => {
          const cId = (item.color && item.color.id) || item.colorId || '';
          const mId = (item.material && item.material.id) || item.materialId || '';
          const cText = item.customText || '';
          const fId = item.fontId ? String(item.fontId).trim() : '';
          return {
            cartItemId: buildLineId(item.id, cId, mId, cText, fId),
            id: item.id,
            title: item.title,
            price: item.price,
            qty: Math.max(1, parseInt(item.qty, 10) || 1),
            image: item.image,
            color: item.color || null,
            colorId: cId,
            colorName: (item.color && item.color.name) || item.colorName || '',
            material: item.material || null,
            materialId: mId,
            materialName: (item.material && (item.material.label || item.material.name)) || item.materialName || '',
            customText: cText,
            fontId: fId || null,
            category: item.category || 'general'
          };
        });
      }
    }
  } catch (e) {
    cart = [];
  }

  function sanitizeImageUrl(url) {
    if (!url || typeof url !== 'string') return 'assets/images/logo-premium-mark.svg';
    const trimmed = url.trim();
    if (trimmed.startsWith('javascript:')) return 'assets/images/logo-premium-mark.svg';
    if (trimmed.startsWith('data:')) {
      if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(trimmed)) {
        return trimmed;
      }
      return 'assets/images/logo-premium-mark.svg';
    }
    if (
      trimmed.startsWith('assets/') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('./') ||
      trimmed.startsWith('/')
    ) {
      return trimmed;
    }
    return 'assets/images/logo-premium-mark.svg';
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('[Cart] Lỗi lưu giỏ hàng:', e);
    }
    renderCartUI();
  }

  /**
   * Thêm sản phẩm vào giỏ với lineId có cấu trúc và validation nghiêm ngặt (Codex R06)
   */
  function addToCart(item) {
    if (!item || typeof item !== 'object') {
      console.warn('[Cart] Bị từ chối: Dữ liệu sản phẩm không hợp lệ.');
      return false;
    }
    if (typeof item.id !== 'string' || !item.id.trim()) {
      console.warn('[Cart] Bị từ chối: ID sản phẩm không được rỗng.');
      return false;
    }
    const qty = item.qty !== undefined ? item.qty : 1;
    if (typeof qty !== 'number' || !Number.isInteger(qty) || !Number.isSafeInteger(qty) || qty < 1 || qty > 99) {
      console.warn('[Cart] Bị từ chối: Số lượng phải là số nguyên safe integer từ 1 đến 99.');
      return false;
    }
    const price = item.price;
    if (typeof price !== 'number' || !Number.isInteger(price) || !Number.isSafeInteger(price) || price < 0) {
      console.warn('[Cart] Bị từ chối: Giá sản phẩm phải là số nguyên safe integer không âm.');
      return false;
    }

    const cId = (item.color && item.color.id) || item.colorId || '';
    const mId = (item.material && item.material.id) || item.materialId || '';
    const cText = (typeof item.customText === 'string') ? item.customText.trim().normalize('NFC').slice(0, 100) : '';
    const fId = item.fontId ? String(item.fontId).trim() : '';
    const lineId = buildLineId(item.id, cId, mId, cText, fId);

    const existingIndex = cart.findIndex(i => i.cartItemId === lineId);
    if (existingIndex > -1) {
      const mergedQty = cart[existingIndex].qty + qty;
      cart[existingIndex].qty = Math.min(99, mergedQty);
    } else {
      cart.push({
        cartItemId: lineId,
        id: item.id.trim(),
        title: String(item.title || 'Sản phẩm 3D').trim(),
        price: price,
        qty: qty,
        image: sanitizeImageUrl(item.image),
        color: item.color || null,
        colorId: cId,
        colorName: (item.color && item.color.name) || item.colorName || '',
        material: item.material || null,
        materialId: mId,
        materialName: (item.material && (item.material.label || item.material.name)) || item.materialName || '',
        customText: cText,
        fontId: item.fontId || null,
        category: item.category || 'general'
      });
    }
    saveCart();
    if (typeof window !== 'undefined' && window.TTAnalytics && typeof window.TTAnalytics.addToCart === 'function') {
      window.TTAnalytics.addToCart(item);
    }
    return true;
  }

  function updateItemQty(cartItemId, delta) {
    const idx = cart.findIndex(i => i.cartItemId === cartItemId || i.id === cartItemId);
    if (idx > -1) {
      const targetQty = cart[idx].qty + delta;
      if (targetQty <= 0) {
        const removed = cart[idx];
        cart.splice(idx, 1);
        if (typeof window !== 'undefined' && window.TTAnalytics && typeof window.TTAnalytics.removeFromCart === 'function') {
          window.TTAnalytics.removeFromCart(removed);
        }
      } else {
        cart[idx].qty = Math.min(99, targetQty);
      }
      saveCart();
    }
  }

  function removeCartItem(cartItemId) {
    const itemToRemove = cart.find(i => i.cartItemId === cartItemId || i.id === cartItemId);
    cart = cart.filter(i => i.cartItemId !== cartItemId && i.id !== cartItemId);
    saveCart();
    if (itemToRemove && typeof window !== 'undefined' && window.TTAnalytics && typeof window.TTAnalytics.removeFromCart === 'function') {
      window.TTAnalytics.removeFromCart(itemToRemove);
    }
  }

  function clearCart() {
    cart = [];
    currentDiscountPercent = 0;
    saveCart();
  }

  // Quản lý Drawer trượt
  let cartPreviousActiveElement = null;

  function openCart() {
    const drawer = document.getElementById('cart-slide-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (typeof document !== 'undefined' && document.activeElement) {
      cartPreviousActiveElement = document.activeElement;
    }
    if (drawer && overlay) {
      overlay.classList.add('active');
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const closeBtn = document.getElementById('cart-drawer-close-btn');
        if (closeBtn && typeof closeBtn.focus === 'function') {
          try { closeBtn.focus(); } catch (_) {}
        }
      }, 50);
    }
  }

  function closeCart() {
    const drawer = document.getElementById('cart-slide-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      if (cartPreviousActiveElement && typeof cartPreviousActiveElement.focus === 'function') {
        try { cartPreviousActiveElement.focus(); } catch (_) {}
        cartPreviousActiveElement = null;
      }
    }
  }

  // Render giao diện giỏ hàng
  function renderCartUI() {
    const totalCount = cart.reduce((acc, i) => acc + i.qty, 0);
    const subtotalRaw = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    
    // Đồng bộ tính toán với TTCheckout (Codex R06)
    let totals = null;
    if (window.TTCheckout && typeof window.TTCheckout.calculateOrderTotals === 'function') {
      totals = window.TTCheckout.calculateOrderTotals(cart, currentDiscountPercent);
    }
    if (!totals) {
      console.warn('[Cart] TTCheckout chưa sẵn sàng.');
    }

    const subtotal = totals ? totals.subtotal : subtotalRaw;
    const discountedTotal = totals ? totals.discountedSubtotal : subtotalRaw;
    const grandTotal = totals ? totals.finalTotal : subtotalRaw;

    // Cập nhật số đếm trên Header & Mobile Dock
    document.querySelectorAll('.cart-badge-count').forEach(badge => {
      badge.textContent = totalCount;
      if (totalCount > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    });

    const titleEl = document.getElementById('cart-drawer-title');
    if (titleEl) titleEl.textContent = `Giỏ Hàng (${totalCount})`;

    // Thanh tiến độ Freeship (Xét theo tiền hàng sau giảm giá)
    const freeshipText = document.getElementById('cart-freeship-text');
    const freeshipBar = document.getElementById('cart-freeship-bar');
    if (freeshipText && freeshipBar) {
      if (discountedTotal >= FREESHIP_THRESHOLD) {
        freeshipText.innerHTML = `🎉 <strong>Chúc mừng!</strong> Đơn hàng đủ điều kiện <strong>Miễn Phí Vận Chuyển</strong>.`;
        freeshipBar.style.width = '100%';
        freeshipBar.classList.add('bg-emerald-500');
        freeshipBar.classList.remove('bg-[#FF5C00]');
      } else {
        const remaining = FREESHIP_THRESHOLD - discountedTotal;
        const percent = Math.min(100, Math.round((discountedTotal / FREESHIP_THRESHOLD) * 100));
        freeshipText.innerHTML = `Mua thêm <strong class="text-[#FF5C00] font-mono">${formatMoney(remaining)}</strong> để nhận <strong>Freeship</strong>`;
        freeshipBar.style.width = `${percent}%`;
        freeshipBar.classList.remove('bg-emerald-500');
        freeshipBar.classList.add('bg-[#FF5C00]');
      }
    }

    // Danh sách mặt hàng - Render an toàn hoàn toàn bằng DOM (Codex R03)
    const listContainer = document.getElementById('cart-items-container');
    const emptyState = document.getElementById('cart-empty-state');
    const footerTray = document.getElementById('cart-drawer-footer');

    if (!listContainer) return;

    if (cart.length === 0) {
      listContainer.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      if (footerTray) footerTray.classList.add('hidden');
    } else {
      if (emptyState) emptyState.classList.add('hidden');
      if (footerTray) footerTray.classList.remove('hidden');

      listContainer.innerHTML = '';
      cart.forEach(item => {
        const lineKey = item.cartItemId || item.id;

        const row = document.createElement('div');
        row.className = 'p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex gap-3.5 relative group';

        const img = document.createElement('img');
        img.className = 'w-16 h-16 rounded-xl object-cover bg-[var(--bg-surface)] shrink-0 border border-[var(--border-subtle)]';
        img.alt = item.title || 'Product';
        img.onerror = function () {
          this.onerror = null;
          this.src = 'assets/images/logo-premium-mark.svg';
        };
        img.src = sanitizeImageUrl(item.image);
        row.appendChild(img);

        const body = document.createElement('div');
        body.className = 'flex-1 min-w-0 pr-6';

        const titleEl = document.createElement('h4');
        titleEl.className = 'text-xs font-bold text-primary-color truncate';
        titleEl.textContent = item.title || '';
        body.appendChild(titleEl);

        const metaEl = document.createElement('div');
        metaEl.className = 'text-[11px] text-secondary-color mt-0.5 space-y-0.5';

        if (item.colorName) {
          const cDiv = document.createElement('div');
          cDiv.appendChild(document.createTextNode('Màu: '));
          const cStrong = document.createElement('strong');
          cStrong.className = 'text-primary-color';
          cStrong.textContent = item.colorName;
          cDiv.appendChild(cStrong);
          metaEl.appendChild(cDiv);
        }

        if (item.materialName) {
          const mDiv = document.createElement('div');
          mDiv.appendChild(document.createTextNode('Vật liệu: '));
          const mStrong = document.createElement('strong');
          mStrong.className = 'text-primary-color';
          mStrong.textContent = item.materialName;
          mDiv.appendChild(mStrong);
          metaEl.appendChild(mDiv);
        }

        if (item.customText) {
          const tDiv = document.createElement('div');
          tDiv.className = 'text-[#FF5C00] truncate';
          tDiv.textContent = `Khắc tên: "${item.customText}"`;
          metaEl.appendChild(tDiv);
        }

        body.appendChild(metaEl);

        const priceRow = document.createElement('div');
        priceRow.className = 'flex items-center justify-between mt-2.5';

        const counter = document.createElement('div');
        counter.className = 'flex items-center border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)]';

        const decBtn = document.createElement('button');
        decBtn.type = 'button';
        decBtn.dataset.action = 'cart-qty-dec';
        decBtn.dataset.lineId = lineKey;
        decBtn.className = 'px-2.5 py-0.5 text-xs text-secondary-color hover:text-primary-color transition-colors';
        decBtn.setAttribute('aria-label', 'Giảm số lượng');
        decBtn.textContent = '-';
        counter.appendChild(decBtn);

        const qtySpan = document.createElement('span');
        qtySpan.className = 'px-2 py-0.5 text-xs font-mono font-bold text-primary-color';
        qtySpan.textContent = String(item.qty);
        counter.appendChild(qtySpan);

        const incBtn = document.createElement('button');
        incBtn.type = 'button';
        incBtn.dataset.action = 'cart-qty-inc';
        incBtn.dataset.lineId = lineKey;
        incBtn.className = 'px-2.5 py-0.5 text-xs text-secondary-color hover:text-primary-color transition-colors';
        incBtn.setAttribute('aria-label', 'Tăng số lượng');
        incBtn.textContent = '+';
        counter.appendChild(incBtn);

        priceRow.appendChild(counter);

        const totalSpan = document.createElement('span');
        totalSpan.className = 'text-xs font-extrabold text-[#FF5C00] font-mono';
        totalSpan.textContent = formatMoney(item.price * item.qty);
        priceRow.appendChild(totalSpan);

        body.appendChild(priceRow);
        row.appendChild(body);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.dataset.action = 'cart-item-remove';
        removeBtn.dataset.lineId = lineKey;
        removeBtn.className = 'absolute top-3 right-3 p-1.5 text-secondary-color hover:text-red-500 transition-colors';
        removeBtn.title = 'Xóa khỏi giỏ';
        removeBtn.setAttribute('aria-label', 'Xóa sản phẩm');
        const trashIcon = document.createElement('i');
        trashIcon.className = 'fa-solid fa-trash-can text-xs';
        removeBtn.appendChild(trashIcon);

        row.appendChild(removeBtn);

        listContainer.appendChild(row);
      });

      // Event delegation an toàn cho giỏ hàng (Codex R01)
      if (!listContainer._hasCartDelegation) {
        listContainer.addEventListener('click', (e) => {
          const decBtn = e.target.closest('[data-action="cart-qty-dec"]');
          if (decBtn) {
            const lId = decBtn.dataset.lineId || '';
            if (lId) updateItemQty(lId, -1);
            return;
          }
          const incBtn = e.target.closest('[data-action="cart-qty-inc"]');
          if (incBtn) {
            const lId = incBtn.dataset.lineId || '';
            if (lId) updateItemQty(lId, 1);
            return;
          }
          const removeBtn = e.target.closest('[data-action="cart-item-remove"]');
          if (removeBtn) {
            const lId = removeBtn.dataset.lineId || '';
            if (lId) removeCartItem(lId);
            return;
          }
        });
        listContainer._hasCartDelegation = true;
      }

      // Tổng tiền
      const subtotalEl = document.getElementById('cart-subtotal-val');
      const grandTotalEl = document.getElementById('cart-grandtotal-val');
      if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
      if (grandTotalEl) grandTotalEl.textContent = formatMoney(grandTotal);
    }
  }

  // Mã giảm giá
  function applyCoupon(code) {
    const clean = (code || '').trim().toUpperCase();
    if (clean === 'TT3D2026' || clean === 'STUDIO' || clean === 'SPECIAL10') {
      currentDiscountPercent = 10;
      saveCart();
      if (window.showToast) window.showToast('Đã áp dụng mã ưu đãi giảm 10% thành công!');
    } else if (clean) {
      if (window.showToast) window.showToast('Mã giảm giá không hợp lệ hoặc đã hết hạn!', 'error');
    }
  }

  // Khởi động Checkout chuẩn
  function triggerCheckout() {
    if (cart.length === 0) {
      if (window.showToast) window.showToast('Giỏ hàng trống!', 'error');
      return;
    }
    closeCart();
    if (window.TTCheckout && typeof window.TTCheckout.openCheckout === 'function') {
      window.TTCheckout.openCheckout(cart, currentDiscountPercent, { source: 'cart' });
    }
  }

  // Khởi tạo listeners
  function initCartListeners() {
    const btnOpenCart = document.getElementById('nav-cart-btn');
    if (btnOpenCart) btnOpenCart.addEventListener('click', openCart);

    const btnMobileCart = document.getElementById('mobile-dock-cart-btn');
    if (btnMobileCart) btnMobileCart.addEventListener('click', openCart);

    const btnCloseDrawer = document.getElementById('cart-drawer-close-btn');
    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeCart);

    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) overlay.addEventListener('click', closeCart);

    const btnApplyCoupon = document.getElementById('cart-apply-coupon-btn');
    const inputCoupon = document.getElementById('cart-coupon-input');
    if (btnApplyCoupon && inputCoupon) {
      btnApplyCoupon.addEventListener('click', () => applyCoupon(inputCoupon.value));
      inputCoupon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') applyCoupon(inputCoupon.value);
      });
    }

    // Nút kích hoạt Đặt Hàng Trực Tiếp
    const btnCheckout = document.getElementById('cart-checkout-direct-btn');
    if (btnCheckout) {
      btnCheckout.addEventListener('click', triggerCheckout);
    }

    // Đóng giỏ hàng bằng phím Escape (Codex B07)
    const addKeydown = (typeof window !== 'undefined' && typeof window.addEventListener === 'function')
      ? window.addEventListener.bind(window)
      : (typeof document !== 'undefined' && typeof document.addEventListener === 'function')
        ? document.addEventListener.bind(document)
        : null;

    if (addKeydown) {
      addKeydown('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
          const drawerEl = document.getElementById('cart-slide-drawer');
          if (drawerEl && drawerEl.classList.contains('active')) {
            closeCart();
          }
        }
      });
    }

    // Cô lập Tab focus trong giỏ hàng khi mở
    const slideDrawer = document.getElementById('cart-slide-drawer');
    if (slideDrawer) {
      slideDrawer.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const selectors = [
          'button:not([disabled]):not([aria-hidden="true"])',
          '[href]:not([aria-disabled="true"]):not([aria-hidden="true"])',
          'input:not([disabled]):not([aria-hidden="true"])',
          '[tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])'
        ];
        const focusables = Array.from(slideDrawer.querySelectorAll(selectors.join(','))).filter(el => {
          return el.offsetParent !== null || (typeof el.offsetWidth === 'number' && el.offsetWidth > 0) || (typeof el.offsetHeight === 'number' && el.offsetHeight > 0);
        });
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first || !slideDrawer.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !slideDrawer.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      });
    }

    renderCartUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartListeners);
  } else {
    initCartListeners();
  }

  // Export API
  window.TTCart = {
    addToCart,
    addItem: addToCart,
    updateQty: updateItemQty,
    removeItem: removeCartItem,
    clearCart,
    openCart,
    closeCart,
    getItems: () => [...cart],
    getDiscountPercent: () => currentDiscountPercent,
    renderCartUI
  };

  // Tương thích ngược
  window.TTStore = window.TTStore || {};
  window.TTStore.addToCart = addToCart;
  window.TTStore.openCart = openCart;

})(window);
