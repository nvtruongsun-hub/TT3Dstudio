/**
 * T&T 3D Studio - Slide-over Mini Cart & VietQR Automatic Checkout Engine
 * Tích hợp chuẩn NAPAS VietQR QuickLink & Polling Webhook Simulator
 */

(function () {
  'use strict';

  let currentDiscountPercent = 0;
  let activeOrderCode = null;
  let pollingInterval = null;
  let countdownTimer = null;
  let currentCustomerInfo = null;
  let selectedPaymentOption = 'full';

  // Audio Ting-Ting effect using Web Audio API (không cần tải file mp3 ngoài)
  function playSuccessChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.12); // D6

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.9);
      osc2.stop(ctx.currentTime + 0.9);
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  }

  // Trigger celebration confetti
  function triggerConfetti() {
    if (typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  // Universal Copy Text Helper with fallback
  function copyTextToClipboard(text, onSuccess) {
    if (!text) return;
    if (navigator.clipboard && window.isSecureContext !== false) {
      navigator.clipboard.writeText(text)
        .then(() => { if (typeof onSuccess === 'function') onSuccess(); })
        .catch(() => fallbackCopy(text, onSuccess));
    } else {
      fallbackCopy(text, onSuccess);
    }
  }

  function fallbackCopy(text, onSuccess) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (typeof onSuccess === 'function') onSuccess();
    } catch (err) {
      console.warn('Fallback copy failed:', err);
    }
  }

  // Update Checkout Stepper UI (Steps 1, 2, 3, 4)
  function updateStepper(step) {
    const line = document.getElementById('checkout-stepper-progress');
    const step1 = document.getElementById('stepper-step-1');
    const step2 = document.getElementById('stepper-step-2');
    const step3 = document.getElementById('stepper-step-3');

    if (!step1 || !step2 || !step3) return;

    const setNodeState = (node, state) => {
      const icon = node.querySelector('.stepper-icon');
      const label = node.querySelector('.stepper-label');
      if (!icon || !label) return;

      if (state === 'completed') {
        icon.className = 'stepper-icon w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md shadow-emerald-500/30 transition-all';
        icon.innerHTML = '<i class="fa-solid fa-check"></i>';
        label.className = 'stepper-label text-[10px] font-mono mt-1 text-emerald-400 font-bold';
      } else if (state === 'active') {
        icon.className = 'stepper-icon w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow-lg shadow-cyan-400/30 ring-2 ring-cyan-400/50 transition-all';
        label.className = 'stepper-label text-[10px] font-mono mt-1 text-cyan-300 font-bold';
      } else {
        icon.className = 'stepper-icon w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center border border-slate-700 transition-all';
        label.className = 'stepper-label text-[10px] font-mono mt-1 text-slate-400';
      }
    };

    if (step === 1) {
      if (line) line.style.width = '0%';
      setNodeState(step1, 'active');
      const i1 = step1.querySelector('.stepper-icon');
      if (i1) i1.innerHTML = '<i class="fa-solid fa-truck"></i>';
      setNodeState(step2, 'idle');
      const i2 = step2.querySelector('.stepper-icon');
      if (i2) i2.innerHTML = '<i class="fa-solid fa-clipboard-check"></i>';
      setNodeState(step3, 'idle');
      const i3 = step3.querySelector('.stepper-icon');
      if (i3) i3.innerHTML = '<i class="fa-solid fa-qrcode"></i>';
    } else if (step === 2) {
      if (line) line.style.width = '50%';
      setNodeState(step1, 'completed');
      setNodeState(step2, 'active');
      const i2 = step2.querySelector('.stepper-icon');
      if (i2) i2.innerHTML = '<i class="fa-solid fa-clipboard-check"></i>';
      setNodeState(step3, 'idle');
      const i3 = step3.querySelector('.stepper-icon');
      if (i3) i3.innerHTML = '<i class="fa-solid fa-qrcode"></i>';
    } else if (step >= 3) {
      if (line) line.style.width = '100%';
      setNodeState(step1, 'completed');
      setNodeState(step2, 'completed');
      if (step === 3) {
        setNodeState(step3, 'active');
        const i3 = step3.querySelector('.stepper-icon');
        if (i3) i3.innerHTML = '<i class="fa-solid fa-qrcode"></i>';
      } else {
        setNodeState(step3, 'completed');
      }
    }
  }

  // Cart API
  window.TTCart = {
    openCart: function () {
      const drawer = document.getElementById('slideover-cart');
      const backdrop = document.getElementById('cart-backdrop');
      if (drawer) {
        drawer.classList.remove('hidden-cart');
        drawer.classList.add('open-cart');
      }
      if (backdrop) {
        backdrop.classList.remove('hidden');
      }
      document.body.style.overflow = 'hidden';
      this.renderCart();
    },

    closeCart: function () {
      const drawer = document.getElementById('slideover-cart');
      const backdrop = document.getElementById('cart-backdrop');
      if (drawer) {
        drawer.classList.remove('open-cart');
        drawer.classList.add('hidden-cart');
      }
      if (backdrop) {
        backdrop.classList.add('hidden');
      }
      document.body.style.overflow = '';
    },

    renderCart: function () {
      const cart = window.TTStore.getCart();
      const listContainer = document.getElementById('cart-items-list');
      const emptyState = document.getElementById('cart-empty-state');
      const footer = document.getElementById('cart-footer');
      const badges = document.querySelectorAll('.cart-badge-count');

      // Update badge counts
      const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
      badges.forEach(b => {
        b.textContent = totalCount;
        if (totalCount > 0) {
          b.classList.remove('hidden');
        } else {
          b.classList.add('hidden');
        }
      });

      if (!listContainer) return;

      if (cart.length === 0) {
        listContainer.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        if (footer) footer.classList.add('hidden');
        return;
      }

      if (emptyState) emptyState.classList.add('hidden');
      if (footer) footer.classList.remove('hidden');

      let subtotal = 0;
      let totalGrams = 0;

      listContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        if (item.weightGrams) totalGrams += item.weightGrams * item.qty;

        // Custom options text chips
        let optionsHtml = '';
        if (item.customOptions && typeof item.customOptions === 'object') {
          optionsHtml = Object.entries(item.customOptions).map(([k, v]) => `
            <span class="inline-block px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700/60 mr-1 mb-1">
              ${k}: <strong class="text-white">${v}</strong>
            </span>
          `).join('');
        }

        return `
          <div class="flex gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 relative group transition-all hover:border-slate-700">
            <img src="${item.image || 'assets/images/logo.jpg'}" alt="${item.title}" class="w-16 h-16 rounded-xl object-cover border border-slate-800 flex-shrink-0">
            <div class="flex-1 min-w-0 space-y-1.5">
              <div class="flex items-start justify-between gap-2">
                <h4 class="text-xs font-display font-bold text-white leading-tight line-clamp-1">${item.title}</h4>
                <button onclick="window.TTCart.removeItem('${item.cartItemId}')" class="text-slate-500 hover:text-red-400 text-xs transition-colors p-1" title="Xóa món">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>

              <div class="flex flex-wrap">${optionsHtml}</div>

              <div class="flex items-center justify-between pt-1">
                <div class="flex items-center gap-2 border border-slate-700 rounded-lg px-2 py-0.5 bg-slate-950">
                  <button onclick="window.TTCart.updateQty('${item.cartItemId}', ${item.qty - 1})" class="text-slate-400 hover:text-white text-xs px-1 font-bold">-</button>
                  <span class="text-xs font-mono font-bold text-cyan-300 px-1.5">${item.qty}</span>
                  <button onclick="window.TTCart.updateQty('${item.cartItemId}', ${item.qty + 1})" class="text-slate-400 hover:text-white text-xs px-1 font-bold">+</button>
                </div>
                <div class="text-right">
                  <span class="text-xs font-display font-bold text-white">${itemTotal.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Calculations: Freeship from 290k, standard 30k
      const freeShipThreshold = 290000;
      const isFreeShip = subtotal >= freeShipThreshold;
      const shippingFee = isFreeShip ? 0 : 30000;
      const discountAmount = Math.round(subtotal * (currentDiscountPercent / 100));
      const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

      // Update Subtotal and Summary elements
      const elSubtotal = document.getElementById('cart-subtotal');
      const elShipping = document.getElementById('cart-shipping');
      const elDiscount = document.getElementById('cart-discount-row');
      const elDiscountAmt = document.getElementById('cart-discount-val');
      const elGrandTotal = document.getElementById('cart-grand-total');
      const elFreeshipBar = document.getElementById('cart-freeship-bar');
      const elFreeshipText = document.getElementById('cart-freeship-text');

      if (elSubtotal) elSubtotal.textContent = `${subtotal.toLocaleString('vi-VN')} đ`;
      if (elShipping) elShipping.textContent = isFreeShip ? 'Miễn Phí (Freeship)' : `${shippingFee.toLocaleString('vi-VN')} đ`;
      if (elGrandTotal) elGrandTotal.textContent = `${grandTotal.toLocaleString('vi-VN')} đ`;

      if (elDiscount && elDiscountAmt) {
        if (discountAmount > 0) {
          elDiscount.classList.remove('hidden');
          elDiscountAmt.textContent = `-${discountAmount.toLocaleString('vi-VN')} đ`;
        } else {
          elDiscount.classList.add('hidden');
        }
      }

      // Freeship Progress
      if (elFreeshipBar && elFreeshipText) {
        const percent = Math.min(100, Math.round((subtotal / freeShipThreshold) * 100));
        elFreeshipBar.style.width = `${percent}%`;
        if (isFreeShip) {
          elFreeshipText.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-truck-fast mr-1"></i> Chúc mừng! Bạn được Miễn Phí Vận Chuyển toàn quốc!</span>`;
        } else {
          const diff = freeShipThreshold - subtotal;
          elFreeshipText.innerHTML = `Mua thêm <strong class="text-cyan-400">${diff.toLocaleString('vi-VN')} đ</strong> để được <strong>Freeship toàn quốc</strong>`;
        }
      }
    },

    removeItem: function (cartItemId) {
      window.TTStore.removeFromCart(cartItemId);
      this.renderCart();
      if (window.showToast) window.showToast('Đã xóa sản phẩm khỏi giỏ hàng.');
    },

    updateQty: function (cartItemId, newQty) {
      if (newQty <= 0) {
        this.removeItem(cartItemId);
      } else {
        window.TTStore.updateCartQty(cartItemId, newQty);
        this.renderCart();
      }
    },

    applyPromoCode: function () {
      const codeInput = document.getElementById('cart-promo-input');
      const code = (codeInput?.value || '').trim().toUpperCase();
      if (code === 'TT3D2026' || code === 'VIETQR' || code === 'SMART3D') {
        currentDiscountPercent = 10;
        if (window.showToast) window.showToast(`Áp dụng mã ${code} thành công: Giảm 10% tổng đơn!`);
      } else if (code === 'VIP20') {
        currentDiscountPercent = 20;
        if (window.showToast) window.showToast('Áp dụng mã VIP thành công: Giảm 20%!');
      } else {
        currentDiscountPercent = 0;
        if (window.showToast) window.showToast('Mã giảm giá không hợp lệ hoặc đã hết hạn!', 'error');
      }
      this.renderCart();
    },

    // Mở Modal Thanh Toán VietQR Tự Động
    openCheckoutModal: function () {
      const cart = window.TTStore.getCart();
      if (cart.length === 0) {
        if (window.showToast) window.showToast('Giỏ hàng đang trống, vui lòng chọn sản phẩm!', 'error');
        return;
      }
      this.closeCart();

      const modal = document.getElementById('vietqr-checkout-modal');
      if (!modal) return;

      // Update Mini Order Summary in Step 1
      const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
      let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const isFreeShip = subtotal >= 290000;
      const shipping = isFreeShip ? 0 : 30000;
      const discount = Math.round(subtotal * (currentDiscountPercent / 100));
      const grandTotal = Math.max(0, subtotal - discount + shipping);

      const summaryItemsCount = document.getElementById('checkout-summary-items-count');
      const summaryGrandTotal = document.getElementById('checkout-summary-grand-total');

      if (summaryItemsCount) {
        summaryItemsCount.textContent = `${totalCount} sản phẩm (${cart.map(i => i.title).slice(0, 2).join(', ')}${cart.length > 2 ? '...' : ''})`;
      }
      if (summaryGrandTotal) {
        summaryGrandTotal.textContent = `${grandTotal.toLocaleString('vi-VN')} đ`;
      }

      // Reset states to Step 1
      document.getElementById('checkout-step-form')?.classList.remove('hidden');
      document.getElementById('checkout-step-confirm')?.classList.add('hidden');
      document.getElementById('checkout-step-qr')?.classList.add('hidden');
      document.getElementById('checkout-step-success')?.classList.add('hidden');

      updateStepper(1);

      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    },

    closeCheckoutModal: function () {
      const modal = document.getElementById('vietqr-checkout-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      document.body.style.overflow = '';
      if (pollingInterval) clearInterval(pollingInterval);
      if (countdownTimer) clearInterval(countdownTimer);
    },

    // Chuyển sang Bước 2: Xác nhận thông tin đơn hàng trước khi thanh toán
    goToConfirmStep: function (customerInfo) {
      currentCustomerInfo = customerInfo;
      const cart = window.TTStore.getCart();

      let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      if (subtotal <= 0) subtotal = 109000;
      const isFreeShip = subtotal >= 290000;
      const shipping = isFreeShip ? 0 : 30000;
      const discount = Math.round(subtotal * (currentDiscountPercent / 100));
      const grandTotal = Math.max(0, subtotal - discount + shipping);
      const depositAmount = Math.round(grandTotal * 0.5);

      // Điền thông tin người nhận
      const nameEl = document.getElementById('confirm-cust-name');
      const phoneEl = document.getElementById('confirm-cust-phone');
      const addrEl = document.getElementById('confirm-cust-address');
      const notesEl = document.getElementById('confirm-cust-notes');
      const notesRow = document.getElementById('confirm-cust-notes-row');

      if (nameEl) nameEl.textContent = customerInfo.name || '--';
      if (phoneEl) phoneEl.textContent = customerInfo.phone || '--';
      if (addrEl) addrEl.textContent = customerInfo.address || '--';

      if (customerInfo.notes && customerInfo.notes.trim()) {
        if (notesEl) notesEl.textContent = `"${customerInfo.notes.trim()}"`;
        if (notesRow) notesRow.classList.remove('hidden');
      } else {
        if (notesRow) notesRow.classList.add('hidden');
      }

      // Render danh sách sản phẩm trong màn hình xác nhận
      const countEl = document.getElementById('confirm-items-count');
      const listEl = document.getElementById('confirm-items-list');
      const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
      if (countEl) countEl.textContent = totalCount;

      if (listEl) {
        listEl.innerHTML = cart.map(item => {
          let optionsHtml = '';
          if (item.customOptions && typeof item.customOptions === 'object') {
            optionsHtml = Object.entries(item.customOptions).map(([k, v]) => `
              <span class="inline-block px-1.5 py-0.5 rounded bg-slate-900 text-[10px] font-mono text-slate-300 border border-slate-800 mr-1 mb-0.5">
                ${k}: <strong class="text-white">${v}</strong>
              </span>
            `).join('');
          }
          const itemTotal = (item.price * item.qty).toLocaleString('vi-VN');
          return `
            <div class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <img src="${item.image || 'assets/images/logo.jpg'}" alt="${item.title}" class="w-12 h-12 rounded-lg object-cover border border-slate-800 flex-shrink-0">
              <div class="flex-1 min-w-0">
                <div class="font-bold text-white text-xs line-clamp-1">${item.title}</div>
                <div class="flex flex-wrap mt-0.5">${optionsHtml}</div>
                <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-0.5">
                  <span>Số lượng: <strong class="text-cyan-300">${item.qty}</strong></span>
                  <span class="text-white font-bold">${itemTotal} đ</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      // Render Bảng tính tiền chi tiết
      const subEl = document.getElementById('confirm-subtotal');
      const discRow = document.getElementById('confirm-discount-row');
      const discVal = document.getElementById('confirm-discount-val');
      const shipEl = document.getElementById('confirm-shipping');
      const grandEl = document.getElementById('confirm-grand-total');

      if (subEl) subEl.textContent = `${subtotal.toLocaleString('vi-VN')} đ`;
      if (shipEl) shipEl.textContent = isFreeShip ? 'Miễn Phí (Freeship)' : `${shipping.toLocaleString('vi-VN')} đ`;
      if (grandEl) grandEl.textContent = `${grandTotal.toLocaleString('vi-VN')} đ`;

      if (discRow && discVal) {
        if (discount > 0) {
          discRow.classList.remove('hidden');
          discVal.textContent = `-${discount.toLocaleString('vi-VN')} đ`;
        } else {
          discRow.classList.add('hidden');
        }
      }

      // Cập nhật số tiền trên các lựa chọn thanh toán
      const optFullVal = document.getElementById('confirm-opt-full-val');
      const optDepVal = document.getElementById('confirm-opt-deposit-val');
      if (optFullVal) optFullVal.textContent = `${grandTotal.toLocaleString('vi-VN')} đ`;
      if (optDepVal) optDepVal.textContent = `${depositAmount.toLocaleString('vi-VN')} đ`;

      // Đặt mặc định lựa chọn full 100%
      selectedPaymentOption = 'full';
      const defaultRadio = document.querySelector('input[name="checkout-payment-opt"][value="full"]');
      if (defaultRadio) defaultRadio.checked = true;
      this.updatePaymentOptionUI('full', grandTotal, depositAmount);

      // Gắn sự kiện thay đổi phương thức thanh toán
      document.querySelectorAll('input[name="checkout-payment-opt"]').forEach(radio => {
        radio.onchange = () => {
          selectedPaymentOption = radio.value;
          this.updatePaymentOptionUI(selectedPaymentOption, grandTotal, depositAmount);
        };
      });

      // Chuyển view sang Bước 2
      document.getElementById('checkout-step-form')?.classList.add('hidden');
      document.getElementById('checkout-step-confirm')?.classList.remove('hidden');
      document.getElementById('checkout-step-qr')?.classList.add('hidden');
      document.getElementById('checkout-step-success')?.classList.add('hidden');

      updateStepper(2);
    },

    // Cập nhật giao diện khi chọn phương thức thanh toán
    updatePaymentOptionUI: function (option, grandTotal, depositAmount) {
      const btnText = document.getElementById('btn-confirm-proceed-text');
      const cards = document.querySelectorAll('.payment-option-card');

      cards.forEach(card => {
        const input = card.querySelector('input[type="radio"]');
        if (input && input.value === option) {
          card.classList.add('border-cyan-500/60', 'bg-cyan-950/30');
          card.classList.remove('border-slate-800', 'bg-slate-950');
        } else {
          card.classList.remove('border-cyan-500/60', 'bg-cyan-950/30');
          card.classList.add('border-slate-800', 'bg-slate-950');
        }
      });

      if (!btnText) return;
      if (option === 'full') {
        btnText.textContent = `Xác Nhận Đơn & Thanh Toán 100% (${grandTotal.toLocaleString('vi-VN')} đ)`;
      } else if (option === 'deposit') {
        btnText.textContent = `Xác Nhận Đơn & Đặt Cọc 50% (${depositAmount.toLocaleString('vi-VN')} đ)`;
      } else if (option === 'zalo') {
        btnText.textContent = 'Gửi Đơn & Mở Chat Zalo Tư Vấn';
      }
    },

    // Quay lại Bước 1: Giao hàng
    backToShippingStep: function () {
      document.getElementById('checkout-step-confirm')?.classList.add('hidden');
      document.getElementById('checkout-step-form')?.classList.remove('hidden');
      updateStepper(1);
    },

    // Quay lại Bước 2: Xác nhận đơn hàng từ màn hình QR
    backToConfirmStep: function () {
      if (pollingInterval) clearInterval(pollingInterval);
      if (countdownTimer) clearInterval(countdownTimer);
      document.getElementById('checkout-step-qr')?.classList.add('hidden');
      document.getElementById('checkout-step-confirm')?.classList.remove('hidden');
      updateStepper(2);
    },

    // Nhấn nút xác nhận tại Bước 2 để tiến hành thanh toán hoặc gửi Zalo
    confirmAndProceedPayment: function () {
      const cart = window.TTStore.getCart();
      if (!currentCustomerInfo) {
        this.backToShippingStep();
        return;
      }

      let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      if (subtotal <= 0) subtotal = 109000;
      const isFreeShip = subtotal >= 290000;
      const shipping = isFreeShip ? 0 : 30000;
      const discount = Math.round(subtotal * (currentDiscountPercent / 100));
      const grandTotal = Math.max(0, subtotal - discount + shipping);
      const depositAmount = Math.round(grandTotal * 0.5);

      const checkedRadio = document.querySelector('input[name="checkout-payment-opt"]:checked');
      const method = checkedRadio ? checkedRadio.value : (selectedPaymentOption || 'full');

      if (method === 'zalo') {
        // Luồng đặt đơn tư vấn qua Zalo
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const code = `TT3D-${randNum}`;
        const primaryItem = cart[0] || {};
        const allTitles = cart.length ? cart.map(i => `${i.title} (x${i.qty})`).join(', ') : 'Đơn hàng in 3D theo yêu cầu';
        const totalWeight = cart.length ? cart.reduce((sum, i) => sum + ((i.weightGrams || 50) * i.qty), 0) : 50;

        const newOrder = {
          id: code,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          stage: 'new',
          customerName: currentCustomerInfo.name || 'Khách hàng',
          phone: currentCustomerInfo.phone || '0986 888 333',
          address: currentCustomerInfo.address || 'Nhận tại xưởng',
          productName: allTitles,
          color: primaryItem.customOptions?.['Màu sắc'] || 'Theo yêu cầu',
          spoolId: 'SPL-01',
          weightGrams: totalWeight,
          material: primaryItem.customOptions?.['Vật liệu'] || 'PLA+ Matte',
          nfcData: primaryItem.customOptions?.['WiFi'] ? { ssid: primaryItem.customOptions['WiFi'] } : null,
          assignedPrinter: null,
          estTimeHours: Math.max(1.5, Math.round((totalWeight / 30) * 10) / 10),
          statusPayment: 'zalo_confirm',
          totalPrice: grandTotal,
          notes: (currentCustomerInfo.notes ? currentCustomerInfo.notes + ' | ' : '') + 'Khách chọn đặt hẹn tư vấn & duyệt file qua Zalo'
        };

        window.TTStore.addOrder(newOrder);
        playSuccessChime();
        triggerConfetti();
        window.TTStore.clearCart();
        this.renderCart();

        // Switch to success screen
        document.getElementById('checkout-step-confirm')?.classList.add('hidden');
        document.getElementById('checkout-step-success')?.classList.remove('hidden');
        updateStepper(4);

        const successTitle = document.getElementById('success-title');
        const successSubtitle = document.getElementById('success-subtitle');
        const successCodeEl = document.getElementById('success-order-code');
        const successNameEl = document.getElementById('success-cust-name');
        const successAmountLabel = document.getElementById('success-amount-label');
        const successTotalEl = document.getElementById('success-total-amount');
        const successBadge = document.getElementById('success-status-badge');
        const zaloBtn = document.getElementById('btn-success-zalo-chat');

        if (successTitle) successTitle.textContent = 'Đã Nhận Yêu Cầu Tư Vấn Đơn Hàng!';
        if (successSubtitle) successSubtitle.textContent = 'Kỹ thuật viên T&T 3D Studio sẽ liên hệ qua Zalo/SĐT trong 15 phút để kiểm tra file in và chốt đơn.';
        if (successCodeEl) successCodeEl.textContent = code;
        if (successNameEl) successNameEl.textContent = currentCustomerInfo.name;
        if (successAmountLabel) successAmountLabel.textContent = 'Giá trị dự kiến:';
        if (successTotalEl) successTotalEl.textContent = `${grandTotal.toLocaleString('vi-VN')} đ`;
        if (successBadge) {
          successBadge.textContent = 'Chờ KTV tư vấn Zalo';
          successBadge.className = 'text-blue-400 font-bold';
        }
        if (zaloBtn) zaloBtn.classList.remove('hidden');

        if (window.showToast) {
          window.showToast(`✅ Đã gửi đơn ${code} thành công! KTV sẽ liên hệ Zalo ngay.`);
        }
      } else {
        // VietQR: 100% full hoặc 50% deposit
        const paymentAmount = method === 'deposit' ? depositAmount : grandTotal;
        this.generateVietQRAndPay(currentCustomerInfo, method, paymentAmount, grandTotal);
      }
    },

    // Tạo mã VietQR chuẩn NAPAS và kích hoạt Polling
    generateVietQRAndPay: function (customerInfo, paymentOption = 'full', paymentAmount = null, grandTotal = null) {
      const cart = window.TTStore.getCart();
      const cfg = window.TTStore.getConfig();
      const banking = cfg.banking || window.TT_DEFAULT_CONFIG.banking;

      // Tính tổng tiền nếu chưa truyền
      let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      if (subtotal <= 0) {
        subtotal = 109000;
      }
      const isFreeShip = subtotal >= 290000;
      const shipping = isFreeShip ? 0 : 30000;
      const discount = Math.round(subtotal * (currentDiscountPercent / 100));
      const calcGrandTotal = Math.max(0, subtotal - discount + shipping);
      const safeGrandTotal = grandTotal || calcGrandTotal;

      // Số tiền thực thanh toán qua QR
      const isDeposit = (paymentOption === 'deposit');
      const depositAmt = Math.round(safeGrandTotal * 0.5);
      const actualPayAmount = paymentAmount || (isDeposit ? depositAmt : safeGrandTotal);

      // Sinh mã đơn hàng duy nhất: TT3D-XXXX
      const randNum = Math.floor(1000 + Math.random() * 9000);
      activeOrderCode = `TT3D-${randNum}`;

      // Nội dung chuyển khoản: nếu cọc ghi thêm "COC"
      const memo = isDeposit ? `${activeOrderCode} COC` : activeOrderCode;

      // URL VietQR QuickLink chuẩn NAPAS hoặc Ảnh QR riêng do Shop tải lên
      const bankId = banking.bankId || 'MB';
      const accountNo = banking.accountNo || '0349657529';
      const accountName = banking.accountName || 'NGUYEN VAN TRUONG';

      const dynamicVietQrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.jpg?amount=${actualPayAmount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accountName)}`;
      
      const hasCustomQr = Boolean(banking.customQrImage);
      const isCustomMode = (banking.qrMode === 'custom' || (!banking.qrMode && hasCustomQr)) && hasCustomQr;
      const qrImageUrl = isCustomMode ? banking.customQrImage : dynamicVietQrUrl;

      // Cập nhật thông báo cọc 50%
      const depositBanner = document.getElementById('qr-deposit-banner');
      if (depositBanner) {
        if (isDeposit) {
          depositBanner.classList.remove('hidden');
          depositBanner.innerHTML = `<i class="fa-solid fa-circle-info mr-1 text-cyan-400"></i> Quý khách đang thanh toán <strong>tiền cọc 50% (${actualPayAmount.toLocaleString('vi-VN')} đ)</strong> cho đơn <strong>${activeOrderCode}</strong>. Số tiền còn lại <strong>${(safeGrandTotal - actualPayAmount).toLocaleString('vi-VN')} đ</strong> sẽ thanh toán COD khi nhận hàng.`;
        } else {
          depositBanner.classList.add('hidden');
        }
      }

      // Update UI elements in QR Screen
      const qrImgEl = document.getElementById('qr-img-display');
      if (qrImgEl) {
        qrImgEl.src = qrImageUrl;
        // Fallback onerror nếu máy khách lag mạng hoặc VietQR API lag
        qrImgEl.onerror = function () {
          this.onerror = null;
          this.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`2|99|${accountNo}|${actualPayAmount}|${memo}`)}`;
        };
      }

      const qrModeBadge = document.getElementById('qr-mode-badge');
      if (qrModeBadge) {
        if (isCustomMode) {
          qrModeBadge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px]"><i class="fa-solid fa-image"></i> ẢNH QR THANH TOÁN CỦA SHOP (Quét & nhập đúng Số tiền / Nội dung)</span>`;
        } else {
          qrModeBadge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[11px]"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> BƯỚC 3/3: CỔNG THANH TOÁN VIETQR NAPAS 24/7</span>`;
        }
      }

      // Nút chuyển đổi nhanh giữa QR riêng của Shop và VietQR động (nếu có ảnh custom)
      const qrSwitchContainer = document.getElementById('qr-switch-container');
      if (qrSwitchContainer) {
        if (hasCustomQr) {
          qrSwitchContainer.classList.remove('hidden');
          let showingCustom = isCustomMode;
          qrSwitchContainer.innerHTML = `
            <button type="button" id="btn-toggle-qr-view" class="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline transition-colors cursor-pointer">
              ${showingCustom ? '→ Chuyển sang mã VietQR NAPAS tự động' : '→ Chuyển sang ảnh QR riêng của Shop'}
            </button>
          `;
          const toggleBtn = document.getElementById('btn-toggle-qr-view');
          if (toggleBtn) {
            toggleBtn.onclick = () => {
              showingCustom = !showingCustom;
              if (qrImgEl) qrImgEl.src = showingCustom ? banking.customQrImage : dynamicVietQrUrl;
              if (qrModeBadge) {
                qrModeBadge.innerHTML = showingCustom
                  ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px]"><i class="fa-solid fa-image"></i> ẢNH QR THANH TOÁN CỦA SHOP</span>`
                  : `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[11px]"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> BƯỚC 3/3: CỔNG THANH TOÁN VIETQR NAPAS 24/7</span>`;
              }
              toggleBtn.textContent = showingCustom ? '→ Chuyển sang mã VietQR NAPAS tự động' : '→ Chuyển sang ảnh QR riêng của Shop';
            };
          }
        } else {
          qrSwitchContainer.classList.add('hidden');
        }
      }

      // Safe update text fields with null-check
      const safeSetText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      safeSetText('qr-order-code', activeOrderCode);
      safeSetText('qr-total-amount', `${actualPayAmount.toLocaleString('vi-VN')} đ${isDeposit ? ' (Cọc 50%)' : ''}`);
      safeSetText('qr-bank-name', banking.bankName || bankId);
      safeSetText('qr-account-no', accountNo);
      safeSetText('qr-account-name', accountName);
      safeSetText('qr-memo-content', memo);

      // Switch to QR View
      document.getElementById('checkout-step-form')?.classList.add('hidden');
      document.getElementById('checkout-step-confirm')?.classList.add('hidden');
      document.getElementById('checkout-step-qr')?.classList.remove('hidden');
      document.getElementById('checkout-step-success')?.classList.add('hidden');

      updateStepper(3);

      // Start Countdown Timer (10:00 minutes)
      let timeLeft = 600;
      const timerEl = document.getElementById('qr-countdown-timer');
      if (countdownTimer) clearInterval(countdownTimer);
      countdownTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
          clearInterval(countdownTimer);
          if (timerEl) timerEl.textContent = '00:00 (Mã hết hạn)';
        } else {
          const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
          const s = (timeLeft % 60).toString().padStart(2, '0');
          if (timerEl) timerEl.textContent = `${m}:${s}`;
        }
      }, 1000);

      // Start Polling Loop (Mô phỏng xác thực Webhook Real-time)
      if (pollingInterval) clearInterval(pollingInterval);
      let pollTicks = 0;
      pollingInterval = setInterval(() => {
        pollTicks++;
        // Sau 25 giây, nếu khách chưa bấm thì mô phỏng tự động nhận diện thanh toán (hoặc khi khách ấn nút Test)
        if (pollTicks >= 25) {
          window.TTCart.confirmPaymentSuccess(customerInfo, actualPayAmount, activeOrderCode, paymentOption, safeGrandTotal);
        }
      }, 1000);

      // Lưu thông tin tạm để nút Mô phỏng dùng
      window._lastPendingPayment = {
        customerInfo,
        totalAmount: actualPayAmount,
        grandTotal: safeGrandTotal,
        orderCode: activeOrderCode,
        paymentOption
      };
    },

    // Xác nhận thanh toán thành công
    confirmPaymentSuccess: function (customerInfo, totalAmount, orderCode, paymentOption = 'full', grandTotal = null) {
      if (pollingInterval) clearInterval(pollingInterval);
      if (countdownTimer) clearInterval(countdownTimer);

      const cart = window.TTStore.getCart();
      const code = orderCode || activeOrderCode || `TT3D-${Math.floor(1000 + Math.random() * 9000)}`;

      const primaryItem = cart[0] || {};
      const allTitles = cart.length ? cart.map(i => `${i.title} (x${i.qty})`).join(', ') : 'Đơn hàng in 3D theo yêu cầu';
      const totalWeight = cart.length ? cart.reduce((sum, i) => sum + ((i.weightGrams || 50) * i.qty), 0) : 50;

      const safeCust = customerInfo || {};
      const finalPaidAmount = totalAmount || 109000;
      const isDeposit = (paymentOption === 'deposit');
      const finalGrandTotal = grandTotal || (isDeposit ? finalPaidAmount * 2 : finalPaidAmount);

      const newOrder = {
        id: code,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        stage: 'new',
        customerName: safeCust.name || 'Khách hàng',
        phone: safeCust.phone || '0986 888 333',
        address: safeCust.address || 'Nhận tại xưởng',
        productName: allTitles,
        color: primaryItem.customOptions?.['Màu sắc'] || 'Theo yêu cầu',
        spoolId: 'SPL-01',
        weightGrams: totalWeight,
        material: primaryItem.customOptions?.['Vật liệu'] || 'PLA+ Matte',
        nfcData: primaryItem.customOptions?.['WiFi'] ? { ssid: primaryItem.customOptions['WiFi'] } : null,
        assignedPrinter: null,
        estTimeHours: Math.max(1.5, Math.round((totalWeight / 30) * 10) / 10),
        statusPayment: isDeposit ? 'deposit_50' : 'paid',
        totalPrice: finalGrandTotal,
        notes: safeCust.notes || (isDeposit ? `Đã đặt cọc 50% (${finalPaidAmount.toLocaleString('vi-VN')} đ) qua VietQR. Còn lại COD.` : 'Thanh toán tự động qua VietQR NAPAS')
      };

      // 1. Thêm vào hệ thống đơn hàng xưởng (Kanban Board)
      window.TTStore.addOrder(newOrder);

      // 2. Âm thanh Ting-Ting & Pháo hoa
      playSuccessChime();
      triggerConfetti();

      // 3. Clear giỏ hàng
      window.TTStore.clearCart();
      this.renderCart();

      // 4. Chuyển sang màn hình thành công
      document.getElementById('checkout-step-qr')?.classList.add('hidden');
      document.getElementById('checkout-step-confirm')?.classList.add('hidden');
      document.getElementById('checkout-step-success')?.classList.remove('hidden');

      const successTitle = document.getElementById('success-title');
      const successSubtitle = document.getElementById('success-subtitle');
      const successCodeEl = document.getElementById('success-order-code');
      const successTotalEl = document.getElementById('success-total-amount');
      const successNameEl = document.getElementById('success-cust-name');
      const successAmountLabel = document.getElementById('success-amount-label');
      const successStatus = document.getElementById('success-status-badge');
      const zaloBtn = document.getElementById('btn-success-zalo-chat');

      if (successTitle) successTitle.textContent = isDeposit ? 'Đã Nhận Tiền Đặt Cọc 50%!' : 'Thanh Toán Thành Công!';
      if (successSubtitle) successSubtitle.textContent = isDeposit 
        ? `Hệ thống đã nhận tiền cọc ${finalPaidAmount.toLocaleString('vi-VN')} đ. Đơn hàng đã được xếp lịch in ngay lập tức!`
        : 'Hệ thống xưởng T&T 3D Studio đã nhận được đơn hàng và chuyển sang quy trình cắt lớp chuẩn bị in.';
      if (successAmountLabel) successAmountLabel.textContent = isDeposit ? 'Đã cọc (50%):' : 'Đã thanh toán:';
      if (successCodeEl) successCodeEl.textContent = code;
      if (successTotalEl) successTotalEl.textContent = `${finalPaidAmount.toLocaleString('vi-VN')} đ`;
      if (successNameEl) successNameEl.textContent = safeCust.name || 'Khách hàng';
      if (successStatus) {
        successStatus.textContent = isDeposit ? 'Đã cọc 50% - Đang xếp lịch in' : 'Đã vào hàng đợi in 3D';
        successStatus.className = 'text-cyan-400 font-bold';
      }
      if (zaloBtn) zaloBtn.classList.add('hidden');

      updateStepper(4);

      if (window.showToast) {
        window.showToast(`🎉 Đã nhận ${isDeposit ? 'tiền cọc 50%' : 'thanh toán'} ${finalPaidAmount.toLocaleString('vi-VN')} đ cho đơn ${code}!`);
      }
    }
  };

  // Setup DOM Event Listeners
  function initCartEvents() {
    // Open Cart buttons (Header cart button & Floating dock button)
    document.querySelectorAll('[data-open-cart]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.TTCart.openCart();
      });
    });

    // Close Cart button & Backdrop
    const closeBtn = document.getElementById('cart-close-btn');
    const backdrop = document.getElementById('cart-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', () => window.TTCart.closeCart());
    if (backdrop) backdrop.addEventListener('click', () => window.TTCart.closeCart());

    // Promo code apply button
    const promoBtn = document.getElementById('btn-apply-promo');
    if (promoBtn) promoBtn.addEventListener('click', () => window.TTCart.applyPromoCode());

    // Checkout button in cart
    const checkoutBtn = document.getElementById('btn-cart-checkout');
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => window.TTCart.openCheckoutModal());

    // Checkout modal close button
    const checkoutClose = document.getElementById('checkout-modal-close');
    if (checkoutClose) checkoutClose.addEventListener('click', () => window.TTCart.closeCheckoutModal());

    // Checkout form submit -> Chuyển sang Bước 2: Xác nhận đơn hàng
    const checkoutForm = document.getElementById('checkout-customer-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('chk-name')?.value.trim();
        const phone = document.getElementById('chk-phone')?.value.trim();
        const address = document.getElementById('chk-address')?.value.trim();
        const notes = document.getElementById('chk-notes')?.value.trim();

        if (!name || !phone || !address) {
          alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!');
          return;
        }

        window.TTCart.goToConfirmStep({ name, phone, address, notes });
      });
    }

    // Nút sao chép nội dung chuyển khoản / STK / Mã đơn
    document.querySelectorAll('[data-copy-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-copy-target');
        const text = document.getElementById(targetId)?.textContent || '';
        if (text) {
          copyTextToClipboard(text, () => {
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i> Đã sao chép';
            setTimeout(() => { btn.innerHTML = orig; }, 1800);
          });
        }
      });
    });

    // Nút Mô phỏng Quét QR thành công (Test Mode)
    const btnSimulate = document.getElementById('btn-simulate-payment');
    if (btnSimulate) {
      btnSimulate.addEventListener('click', () => {
        if (window._lastPendingPayment) {
          window.TTCart.confirmPaymentSuccess(
            window._lastPendingPayment.customerInfo,
            window._lastPendingPayment.totalAmount,
            window._lastPendingPayment.orderCode,
            window._lastPendingPayment.paymentOption,
            window._lastPendingPayment.grandTotal
          );
        } else {
          // Fallback simulation
          window.TTCart.confirmPaymentSuccess(
            { name: 'Khách hàng thử nghiệm', phone: '0986 888 333', address: 'Hà Nội' },
            139000,
            activeOrderCode || 'TT3D-TEST',
            'full',
            139000
          );
        }
      });
    }

    // Lắng nghe cập nhật giỏ hàng từ các module khác
    window.addEventListener('tt_cart_updated', () => {
      window.TTCart.renderCart();
    });

    // Render badge & count initial
    window.TTCart.renderCart();
  }

  // Init on DOM ready
  window.addEventListener('DOMContentLoaded', () => {
    initCartEvents();
  });

})();
