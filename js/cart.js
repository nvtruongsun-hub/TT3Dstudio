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

  /**
   * Tạo Line ID dạng tuple có cấu trúc an toàn
   */
  function buildLineId(productId, colorId, materialId, customText) {
    return JSON.stringify([
      String(productId || ''),
      String(colorId || ''),
      String(materialId || ''),
      String(customText || '').trim().normalize('NFC')
    ]);
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
          return {
            cartItemId: item.cartItemId || buildLineId(item.id, cId, mId, cText),
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
            category: item.category || 'general'
          };
        });
      }
    }
  } catch (e) {
    cart = [];
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
   * Thêm sản phẩm vào giỏ với lineId có cấu trúc
   */
  function addToCart(item) {
    const cId = (item.color && item.color.id) || item.colorId || '';
    const mId = (item.material && item.material.id) || item.materialId || '';
    const cText = item.customText || '';
    const lineId = buildLineId(item.id, cId, mId, cText);

    const existingIndex = cart.findIndex(i => i.cartItemId === lineId);
    if (existingIndex > -1) {
      cart[existingIndex].qty += (item.qty || 1);
    } else {
      cart.push({
        cartItemId: lineId,
        id: item.id || `prod-${Date.now()}`,
        title: item.title,
        price: item.price,
        qty: Math.max(1, item.qty || 1),
        image: item.image,
        color: item.color || null,
        colorId: cId,
        colorName: (item.color && item.color.name) || item.colorName || '',
        material: item.material || null,
        materialId: mId,
        materialName: (item.material && (item.material.label || item.material.name)) || item.materialName || '',
        customText: cText,
        category: item.category || 'general'
      });
    }
    saveCart();
  }

  function updateItemQty(cartItemId, delta) {
    const idx = cart.findIndex(i => i.cartItemId === cartItemId || i.id === cartItemId);
    if (idx > -1) {
      cart[idx].qty += delta;
      if (cart[idx].qty <= 0) {
        cart.splice(idx, 1);
      }
      saveCart();
    }
  }

  function removeCartItem(cartItemId) {
    cart = cart.filter(i => i.cartItemId !== cartItemId && i.id !== cartItemId);
    saveCart();
  }

  function clearCart() {
    cart = [];
    currentDiscountPercent = 0;
    saveCart();
  }

  // Quản lý Drawer trượt
  function openCart() {
    const drawer = document.getElementById('cart-slide-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (drawer && overlay) {
      overlay.classList.add('active');
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCart() {
    const drawer = document.getElementById('cart-slide-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Render giao diện giỏ hàng
  function renderCartUI() {
    const totalCount = cart.reduce((acc, i) => acc + i.qty, 0);
    const subtotalRaw = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    
    // Đồng bộ tính toán với TTCheckout
    const totals = (window.TTCheckout && typeof window.TTCheckout.calculateOrderTotals === 'function')
      ? window.TTCheckout.calculateOrderTotals(cart, currentDiscountPercent)
      : {
          subtotal: subtotalRaw,
          discountedSubtotal: Math.max(0, subtotalRaw - Math.round(subtotalRaw * (currentDiscountPercent / 100))),
          shippingFee: subtotalRaw >= FREESHIP_THRESHOLD ? 0 : 25000,
          finalTotal: subtotalRaw
        };

    const subtotal = totals.subtotal;
    const discountedTotal = totals.discountedSubtotal;
    const grandTotal = totals.finalTotal;

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

    // Danh sách mặt hàng
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

      listContainer.innerHTML = cart.map(item => {
        const lineKey = encodeURIComponent(item.cartItemId || item.id);
        return `
          <div class="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex gap-3.5 relative group">
            <img src="${item.image || 'assets/images/logo-premium-mark.svg'}" 
                 alt="${item.title}" 
                 class="w-16 h-16 rounded-xl object-cover bg-[var(--bg-surface)] shrink-0 border border-[var(--border-subtle)]"
                 onerror="this.src='assets/images/logo-premium-mark.svg';">
            
            <div class="flex-1 min-w-0 pr-6">
              <h4 class="text-xs font-bold text-primary-color truncate">${item.title}</h4>
              
              <div class="text-[11px] text-secondary-color mt-0.5 space-y-0.5">
                ${item.colorName ? `<div>Màu: <strong class="text-primary-color">${item.colorName}</strong></div>` : ''}
                ${item.materialName ? `<div>Vật liệu: <strong class="text-primary-color">${item.materialName}</strong></div>` : ''}
                ${item.customText ? `<div class="text-[#FF5C00] truncate">Khắc tên: "${item.customText}"</div>` : ''}
              </div>

              <div class="flex items-center justify-between mt-2.5">
                <div class="flex items-center border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)]">
                  <button type="button" 
                          onclick="window.TTCart.updateQty(decodeURIComponent('${lineKey}'), -1)" 
                          class="px-2.5 py-0.5 text-xs text-secondary-color hover:text-primary-color transition-colors"
                          aria-label="Giảm số lượng">-</button>
                  <span class="px-2 py-0.5 text-xs font-mono font-bold text-primary-color">${item.qty}</span>
                  <button type="button" 
                          onclick="window.TTCart.updateQty(decodeURIComponent('${lineKey}'), 1)" 
                          class="px-2.5 py-0.5 text-xs text-secondary-color hover:text-primary-color transition-colors"
                          aria-label="Tăng số lượng">+</button>
                </div>
                <span class="text-xs font-extrabold text-[#FF5C00] font-mono">
                  ${formatMoney(item.price * item.qty)}
                </span>
              </div>
            </div>

            <button type="button" 
                    onclick="window.TTCart.removeItem(decodeURIComponent('${lineKey}'))" 
                    class="absolute top-3 right-3 p-1.5 text-secondary-color hover:text-red-500 transition-colors" 
                    title="Xóa khỏi giỏ"
                    aria-label="Xóa sản phẩm">
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
        `;
      }).join('');

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
