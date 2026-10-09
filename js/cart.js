/**
 * T&T 3D Studio - Slide-Over Mini Cart & Dynamic VietQR Engine
 * Benchmark: Shopify / Nomad Goods E-Commerce Standards
 * (Sheet 3: ID-03, ID-28, ID-29, Sheet 5: Điểm 1 & 4)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'tt3d_cart_items';
  const FREESHIP_THRESHOLD = 300000; // 300,000 VND
  const BANK_CONFIG = {
    bankId: 'MB',
    bankName: 'MB Bank (Ngân hàng Quân Đội)',
    accountNo: '0349657529',
    accountName: 'NGUYEN VAN TRUONG'
  };

  let cart = [];
  let currentDiscountPercent = 0;
  let activeOrderCode = null;

  // Initialize cart from localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) cart = JSON.parse(saved);
  } catch (e) {
    cart = [];
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
    renderCartUI();
  }

  function formatMoney(amount) {
    const num = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/\D/g, '')) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
  }

  // Web Audio pleasant chime (No confetti, ID-03)
  function playSuccessChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {}
  }

  // Add Item to Cart API
  function addToCart(item) {
    const existingIndex = cart.findIndex(i => i.id === item.id);
    if (existingIndex > -1) {
      cart[existingIndex].qty += (item.qty || 1);
    } else {
      cart.push({
        id: item.id || `item-${Date.now()}`,
        title: item.title,
        price: item.price,
        qty: item.qty || 1,
        image: item.image,
        color: item.color || null,
        material: item.material || null,
        customText: item.customText || null,
        category: item.category || 'general'
      });
    }
    saveCart();
  }

  function updateItemQty(id, delta) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx > -1) {
      cart[idx].qty += delta;
      if (cart[idx].qty <= 0) {
        cart.splice(idx, 1);
      }
      saveCart();
    }
  }

  function removeCartItem(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
  }

  function clearCart() {
    cart = [];
    currentDiscountPercent = 0;
    saveCart();
  }

  // Open & Close Slide-Over Drawer (ID-28)
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

  // Render Slide-Over Cart UI
  function renderCartUI() {
    const totalCount = cart.reduce((acc, i) => acc + i.qty, 0);
    const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const discountAmount = Math.round(subtotal * (currentDiscountPercent / 100));
    const grandTotal = Math.max(0, subtotal - discountAmount);

    // Update Badges on Header & Mobile Sticky Bar
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

    // Free Shipping Progress Bar
    const freeshipText = document.getElementById('cart-freeship-text');
    const freeshipBar = document.getElementById('cart-freeship-bar');
    if (freeshipText && freeshipBar) {
      if (subtotal >= FREESHIP_THRESHOLD) {
        freeshipText.innerHTML = `🎉 <strong>Chúc mừng!</strong> Bạn đã được Miễn Phí Vận Chuyển toàn quốc.`;
        freeshipBar.style.width = '100%';
        freeshipBar.classList.add('bg-emerald-500');
        freeshipBar.classList.remove('bg-[#FF5C00]');
      } else {
        const remaining = FREESHIP_THRESHOLD - subtotal;
        const percent = Math.min(100, Math.round((subtotal / FREESHIP_THRESHOLD) * 100));
        freeshipText.innerHTML = `Mua thêm <strong class="text-[#FF5C00] font-mono">${formatMoney(remaining)}</strong> để được <strong>Freeship toàn quốc</strong>`;
        freeshipBar.style.width = `${percent}%`;
        freeshipBar.classList.remove('bg-emerald-500');
        freeshipBar.classList.add('bg-[#FF5C00]');
      }
    }

    // Cart Items Container
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

      listContainer.innerHTML = cart.map(item => `
        <div class="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex gap-3.5 relative group">
          <img src="${item.image || 'assets/images/logo-premium-mark.svg'}" 
               alt="${item.title}" 
               class="w-16 h-16 rounded-xl object-cover bg-[var(--bg-surface)] shrink-0 border border-[var(--border-subtle)]">
          
          <div class="flex-1 min-w-0 pr-6">
            <h4 class="text-xs font-bold text-primary-color truncate">${item.title}</h4>
            
            <div class="text-[11px] text-secondary-color mt-0.5 space-y-0.5">
              ${item.color ? `<div>Màu: <strong class="text-primary-color">${item.color.name}</strong></div>` : ''}
              ${item.material ? `<div>Chất liệu: <strong class="text-primary-color">${item.material.label || item.material.name}</strong></div>` : ''}
              ${item.customText ? `<div class="text-[#FF5C00] truncate">Khắc/Cài: ${item.customText}</div>` : ''}
            </div>

            <div class="flex items-center justify-between mt-2.5">
              <div class="flex items-center border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)]">
                <button type="button" 
                        onclick="window.TTCart.updateQty('${item.id}', -1)" 
                        class="px-2.5 py-0.5 text-xs text-secondary-color hover:text-primary-color">-</button>
                <span class="px-2 py-0.5 text-xs font-mono font-bold text-primary-color">${item.qty}</span>
                <button type="button" 
                        onclick="window.TTCart.updateQty('${item.id}', 1)" 
                        class="px-2.5 py-0.5 text-xs text-secondary-color hover:text-primary-color">+</button>
              </div>
              <span class="text-xs font-extrabold text-[#FF5C00] font-mono">
                ${formatMoney(item.price * item.qty)}
              </span>
            </div>
          </div>

          <button type="button" 
                  onclick="window.TTCart.removeItem('${item.id}')" 
                  class="absolute top-3 right-3 p-1 text-secondary-color hover:text-red-500 transition-colors" 
                  title="Xóa khỏi giỏ">
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>
      `).join('');

      // Subtotals & Grand totals
      const subtotalEl = document.getElementById('cart-subtotal-val');
      const grandTotalEl = document.getElementById('cart-grandtotal-val');
      if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
      if (grandTotalEl) grandTotalEl.textContent = formatMoney(grandTotal);
    }
  }

  // Apply Coupon Code
  function applyCoupon(code) {
    const clean = (code || '').trim().toUpperCase();
    if (clean === 'TT3D2026' || clean === 'VIETQR' || clean === 'STUDIO') {
      currentDiscountPercent = 10;
      saveCart();
      if (window.showToast) window.showToast('Đã áp dụng mã giảm giá 10% thành công!');
    } else if (clean) {
      if (window.showToast) window.showToast('Mã giảm giá không hợp lệ!', 'error');
    }
  }

  // Trigger Direct Zalo Checkout (Sheet 5 Point 2)
  function triggerZaloCheckout() {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const discountAmount = Math.round(subtotal * (currentDiscountPercent / 100));
    const grandTotal = Math.max(0, subtotal - discountAmount);

    const itemListStr = cart.map((item, idx) => {
      const details = [
        item.color ? `Màu: ${item.color.name}` : null,
        item.material ? `Vật liệu: ${item.material.label || item.material.name}` : null,
        item.customText ? `Khắc: ${item.customText}` : null
      ].filter(Boolean).join(' • ');

      return `${idx + 1}. ${item.title}\n   ${details ? '(' + details + ')\n   ' : ''}SL: ${item.qty} x ${formatMoney(item.price)} = ${formatMoney(item.price * item.qty)}`;
    }).join('\n\n');

    const message = `🛍️ ĐẶT HÀNG T&T 3D STUDIO 🛍️
----------------------------------------
${itemListStr}
----------------------------------------
${currentDiscountPercent > 0 ? `Giảm giá: ${currentDiscountPercent}%\n` : ''}👉 TỔNG TIỀN ĐƠN HÀNG: ${formatMoney(grandTotal)}
(Đơn hàng trên 300K được Miễn Phí Vận Chuyển)
----------------------------------------
Xin chào Studio, mình muốn đặt các món trên. Vui lòng hướng dẫn gửi địa chỉ nhận hàng nhé!`;

    const cleanZalo = '0986888333';
    window.open(`https://zalo.me/${cleanZalo}?text=${encodeURIComponent(message)}`, '_blank');
  }

  // Trigger Dynamic VietQR 1-Touch Checkout (ID-29)
  function triggerVietQRModal() {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const discountAmount = Math.round(subtotal * (currentDiscountPercent / 100));
    const grandTotal = Math.max(0, subtotal - discountAmount);

    activeOrderCode = `TT3D${Math.floor(1000 + Math.random() * 9000)}`;

    // Build VietQR QuickLink (NAPAS Standard via VietQR API)
    // https://img.vietqr.io/image/MB-0349657529-compact2.png?amount=109000&addInfo=TT3D1234&accountName=NGUYEN%20VAN%20TRUONG
    const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact2.png?amount=${grandTotal}&addInfo=${activeOrderCode}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

    // Populate Modal
    const qrImg = document.getElementById('vietqr-image');
    const orderCodeEl = document.getElementById('vietqr-order-code');
    const amountEl = document.getElementById('vietqr-amount');
    const accNoEl = document.getElementById('vietqr-account-no');
    const accNameEl = document.getElementById('vietqr-account-name');

    if (qrImg) qrImg.src = qrUrl;
    if (orderCodeEl) orderCodeEl.textContent = activeOrderCode;
    if (amountEl) amountEl.textContent = formatMoney(grandTotal);
    if (accNoEl) accNoEl.textContent = BANK_CONFIG.accountNo;
    if (accNameEl) accNameEl.textContent = BANK_CONFIG.accountName;

    const modal = document.getElementById('vietqr-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  function closeVietQRModal() {
    const modal = document.getElementById('vietqr-modal');
    if (modal) modal.classList.remove('active');
  }

  function confirmPaymentSuccess() {
    playSuccessChime();
    closeVietQRModal();
    closeCart();

    const orderRef = activeOrderCode;
    clearCart();

    if (window.showToast) {
      window.showToast(`🎉 Cảm ơn bạn! Đơn hàng #${orderRef} đã ghi nhận. Kỹ thuật viên xưởng đang chuẩn bị hàng!`);
    } else {
      alert(`Đã ghi nhận đơn hàng #${orderRef}! Chúng tôi sẽ liên hệ xác nhận giao hàng ngay.`);
    }
  }

  function copyTextToClipboard(text, successMsg) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        if (window.showToast) window.showToast(successMsg);
      });
    }
  }

  // Setup Event Listeners
  function initCartListeners() {
    // Open Cart buttons
    document.querySelectorAll('.open-cart-btn').forEach(btn => {
      btn.addEventListener('click', openCart);
    });

    // Close buttons & overlay
    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) overlay.addEventListener('click', closeCart);

    const closeBtn = document.getElementById('cart-drawer-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeCart);

    // Coupon button
    const couponBtn = document.getElementById('cart-apply-coupon-btn');
    const couponInput = document.getElementById('cart-coupon-input');
    if (couponBtn && couponInput) {
      couponBtn.addEventListener('click', () => {
        applyCoupon(couponInput.value);
      });
    }

    // Checkout actions
    const btnZalo = document.getElementById('cart-checkout-zalo-btn');
    if (btnZalo) btnZalo.addEventListener('click', triggerZaloCheckout);

    const btnVietQR = document.getElementById('cart-checkout-vietqr-btn');
    if (btnVietQR) btnVietQR.addEventListener('click', triggerVietQRModal);

    // VietQR Modal buttons
    const btnCloseQR = document.getElementById('vietqr-close-btn');
    if (btnCloseQR) btnCloseQR.addEventListener('click', closeVietQRModal);

    const qrModal = document.getElementById('vietqr-modal');
    if (qrModal) {
      qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) closeVietQRModal();
      });
    }

    const btnPaid = document.getElementById('vietqr-confirm-paid-btn');
    if (btnPaid) btnPaid.addEventListener('click', confirmPaymentSuccess);

    // Escape key listener for accessible closing
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCart();
        closeVietQRModal();
      }
    });

    // Copy buttons
    const copyAcc = document.getElementById('copy-vietqr-acc');
    if (copyAcc) copyAcc.addEventListener('click', () => copyTextToClipboard(BANK_CONFIG.accountNo, 'Đã sao chép Số tài khoản MB Bank!'));

    const copyCode = document.getElementById('copy-vietqr-code');
    if (copyCode) copyCode.addEventListener('click', () => copyTextToClipboard(activeOrderCode, 'Đã sao chép Mã đơn hàng!'));
  }

  // Global APIs
  window.TTCart = {
    openCart,
    closeCart,
    addToCart,
    updateQty: updateItemQty,
    removeItem: removeCartItem,
    clearCart,
    triggerVietQR: triggerVietQRModal,
    triggerZalo: triggerZaloCheckout
  };

  window.TTStore = window.TTStore || {};
  window.TTStore.addToCart = addToCart;
  window.TTStore.getCart = () => cart;

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initCartListeners();
    renderCartUI();
  });

})();
