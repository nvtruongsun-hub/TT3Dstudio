/**
 * T&T 3D STUDIO - CUSTOMER ACCOUNT & 3D PRODUCTION TRACKER PORTAL
 * Quản lý thông tin cá nhân, lịch sử đơn hàng và theo dõi tiến độ sản xuất 3D 8 giai đoạn:
 * 1. pending_confirmation (Chờ xác nhận)
 * 2. confirmed (Đã xác nhận)
 * 3. printing_in_progress (Đang in 3D)
 * 4. post_processing (Đang xử lý hoàn thiện)
 * 5. ready_for_dispatch (Sẵn sàng giao hàng)
 * 6. shipping (Đang vận chuyển)
 * 7. completed (Hoàn thành)
 * 8. cancelled (Đã hủy)
 */

(function (window) {
  'use strict';

  const PRODUCTION_STAGES = [
    { key: 'pending_confirmation', label: 'Chờ xác nhận', icon: 'fa-clock', desc: 'Đơn hàng mới được tiếp nhận vào hàng đợi xưởng' },
    { key: 'confirmed', label: 'Đã xác nhận', icon: 'fa-check-double', desc: 'Kỹ thuật viên đã duyệt file CAD & chuẩn bị vật liệu' },
    { key: 'printing_in_progress', label: 'Đang in 3D', icon: 'fa-cube', desc: 'Dàn máy Bambu Lab / Anycubic đang in từng lớp siêu nét' },
    { key: 'post_processing', label: 'Đang xử lý hoàn thiện', icon: 'fa-wand-magic-sparkles', desc: 'Cắt gọt support, xử lý bề mặt, phủ bóng & đúc chip NFC' },
    { key: 'ready_for_dispatch', label: 'Sẵn sàng giao', icon: 'fa-box', desc: 'Kiểm định chất lượng QC & đóng gói chống sốc 3 lớp' },
    { key: 'shipping', label: 'Đang vận chuyển', icon: 'fa-truck-fast', desc: 'Đơn vị vận chuyển đang phát hàng tới địa chỉ của bạn' },
    { key: 'completed', label: 'Hoàn thành', icon: 'fa-circle-check', desc: 'Giao hàng thành công. Chúc bạn trải nghiệm sản phẩm tuyệt vời!' },
    { key: 'cancelled', label: 'Đã hủy', icon: 'fa-ban', desc: 'Đơn hàng đã được hoàn tất hủy bỏ theo yêu cầu' }
  ];

  function formatMoney(amount) {
    const num = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/\D/g, ''), 10) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
  }

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return iso;
    }
  }

  function getStatusMeta(statusKey) {
    const found = PRODUCTION_STAGES.find(s => s.key === statusKey);
    return found || { key: statusKey, label: statusKey, icon: 'fa-circle-info', desc: '' };
  }

  class TTAccountManager {
    constructor() {
      this.currentTab = 'orders';
      this.orders = [];
      this.selectedOrder = null;
    }

    init() {
      this.bindEvents();
      if (window.TTSupabase && typeof window.TTSupabase.onAuthStateChange === 'function') {
        window.TTSupabase.onAuthStateChange((user) => {
          this.handleAuthUpdate(user);
        });
      }
    }

    handleAuthUpdate(user) {
      this.updateHeaderUI(user);
      if (user) {
        this.loadCustomerOrders();
      } else {
        this.orders = [];
      }
    }

    updateHeaderUI(user) {
      const btn = document.getElementById('header-account-btn');
      if (!btn) return;
      if (user) {
        const name = (user.user_metadata && user.user_metadata.full_name) || user.email.split('@')[0];
        btn.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="truncate max-w-[100px] sm:max-w-[130px] font-medium text-xs text-white">${name}</span>
            <i class="fa-solid fa-chevron-down text-[10px] text-zinc-400"></i>
          </div>
        `;
        btn.title = `Tài khoản: ${user.email}`;
      } else {
        btn.innerHTML = `
          <div class="flex items-center gap-1.5">
            <i class="fa-regular fa-user text-xs"></i>
            <span class="font-medium text-xs">Đăng nhập</span>
          </div>
        `;
        btn.title = 'Đăng nhập / Đăng ký';
      }
    }

    bindEvents() {
      // Header Account Button Click
      const btn = document.getElementById('header-account-btn');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.TTSupabase && window.TTSupabase.isAuthenticated()) {
            this.openAccountModal();
          } else {
            this.openAuthModal('login');
          }
        });
      }

      // Close modal events
      const closeAuth = document.getElementById('auth-modal-close-btn');
      if (closeAuth) {
        closeAuth.addEventListener('click', () => this.closeAuthModal());
      }
      const closeAcc = document.getElementById('account-modal-close-btn');
      if (closeAcc) {
        closeAcc.addEventListener('click', () => this.closeAccountModal());
      }

      // Tab switcher in Auth Modal
      const authTabs = document.querySelectorAll('[data-auth-tab]');
      authTabs.forEach(t => {
        t.addEventListener('click', () => {
          this.switchAuthTab(t.getAttribute('data-auth-tab'));
        });
      });

      // Switcher in Account Modal
      const accTabs = document.querySelectorAll('[data-account-tab]');
      accTabs.forEach(t => {
        t.addEventListener('click', () => {
          this.switchAccountTab(t.getAttribute('data-account-tab'));
        });
      });

      // Bind Login Form
      const loginForm = document.getElementById('auth-login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.handleLoginSubmit();
        });
      }

      // Bind Register Form
      const regForm = document.getElementById('auth-register-form');
      if (regForm) {
        regForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.handleRegisterSubmit();
        });
      }

      // Bind Forgot Form
      const forgotForm = document.getElementById('auth-forgot-form');
      if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.handleForgotSubmit();
        });
      }

      // Logout button
      const logoutBtn = document.getElementById('account-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          if (window.TTSupabase) {
            await window.TTSupabase.signOut();
            this.closeAccountModal();
            if (window.showToast) window.showToast('Đã đăng xuất an toàn khỏi hệ thống.', 'info');
          }
        });
      }
    }

    openAuthModal(tab = 'login', intent = null) {
      this.pendingIntent = intent;
      const modal = document.getElementById('auth-modal');
      if (!modal) return;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      this.switchAuthTab(tab);
    }

    closeAuthModal() {
      const modal = document.getElementById('auth-modal');
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    switchAuthTab(tab) {
      const tabs = ['login', 'register', 'forgot'];
      tabs.forEach(t => {
        const formEl = document.getElementById(`auth-form-${t}`);
        const tabBtn = document.querySelector(`[data-auth-tab="${t}"]`);
        if (formEl) {
          if (t === tab) formEl.classList.remove('hidden');
          else formEl.classList.add('hidden');
        }
        if (tabBtn) {
          if (t === tab) {
            tabBtn.classList.add('text-orange-500', 'border-b-2', 'border-orange-500', 'font-semibold');
            tabBtn.classList.remove('text-zinc-400');
          } else {
            tabBtn.classList.remove('text-orange-500', 'border-b-2', 'border-orange-500', 'font-semibold');
            tabBtn.classList.add('text-zinc-400');
          }
        }
      });
      // Clear alerts
      const errBox = document.getElementById('auth-error-alert');
      if (errBox) errBox.classList.add('hidden');
    }

    openAccountModal() {
      const modal = document.getElementById('account-modal');
      if (!modal) return;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      this.switchAccountTab('orders');
      this.loadCustomerOrders();
    }

    closeAccountModal() {
      const modal = document.getElementById('account-modal');
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    switchAccountTab(tab) {
      this.currentTab = tab;
      const tabs = ['orders', 'profile', 'security'];
      tabs.forEach(t => {
        const sec = document.getElementById(`account-sec-${t}`);
        const btn = document.querySelector(`[data-account-tab="${t}"]`);
        if (sec) {
          if (t === tab) sec.classList.remove('hidden');
          else sec.classList.add('hidden');
        }
        if (btn) {
          if (t === tab) {
            btn.classList.add('bg-orange-500/10', 'text-orange-400', 'border-orange-500/40');
            btn.classList.remove('text-zinc-400', 'border-transparent');
          } else {
            btn.classList.remove('bg-orange-500/10', 'text-orange-400', 'border-orange-500/40');
            btn.classList.add('text-zinc-400', 'border-transparent');
          }
        }
      });
    }

    async handleLoginSubmit() {
      const emailInput = document.getElementById('auth-login-email');
      const passInput = document.getElementById('auth-login-pass');
      const errBox = document.getElementById('auth-error-alert');

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passInput ? passInput.value : '';

      if (errBox) errBox.classList.add('hidden');

      if (!window.TTSupabase) return;
      const res = await window.TTSupabase.signIn({ email, password });
      if (!res.ok) {
        if (errBox) {
          errBox.textContent = res.error;
          errBox.classList.remove('hidden');
        }
        return;
      }

      this.closeAuthModal();
      if (window.showToast) window.showToast('Đăng nhập thành công!', 'success');

      // Check if there was a pending intent (e.g. checkout)
      if (this.pendingIntent === 'checkout') {
        this.pendingIntent = null;
        if (window.TTCheckout && typeof window.TTCheckout.openCheckout === 'function') {
          const cart = (window.TTCart && window.TTCart.getCart) ? window.TTCart.getCart() : [];
          window.TTCheckout.openCheckout(cart, 0, { source: 'cart' });
        }
      }
    }

    async handleRegisterSubmit() {
      const nameInput = document.getElementById('auth-reg-name');
      const phoneInput = document.getElementById('auth-reg-phone');
      const emailInput = document.getElementById('auth-reg-email');
      const passInput = document.getElementById('auth-reg-pass');
      const errBox = document.getElementById('auth-error-alert');

      const fullName = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passInput ? passInput.value : '';

      if (errBox) errBox.classList.add('hidden');

      if (!window.TTSupabase) return;
      const res = await window.TTSupabase.signUp({ email, password, fullName, phone });
      if (!res.ok) {
        if (errBox) {
          errBox.textContent = res.error;
          errBox.classList.remove('hidden');
        }
        return;
      }

      if (res.needsVerification) {
        if (errBox) {
          errBox.className = 'p-3 rounded-lg text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 mb-4 block';
          errBox.textContent = res.message;
        }
      } else {
        this.closeAuthModal();
        if (window.showToast) window.showToast('Đăng ký thành công!', 'success');
      }
    }

    async handleForgotSubmit() {
      const emailInput = document.getElementById('auth-forgot-email');
      const errBox = document.getElementById('auth-error-alert');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!window.TTSupabase) return;
      const res = await window.TTSupabase.resetPassword(email);
      if (errBox) {
        errBox.className = res.ok
          ? 'p-3 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 mb-4 block'
          : 'p-3 rounded-lg text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 mb-4 block';
        errBox.textContent = res.ok ? res.message : res.error;
      }
    }

    async loadCustomerOrders() {
      if (!window.TTSupabase || !window.TTSupabase.isAuthenticated()) return;
      const res = await window.TTSupabase.getCustomerOrders();
      if (res.ok) {
        this.orders = res.orders || [];
        this.renderOrdersList();
      }
    }

    renderOrdersList() {
      const container = document.getElementById('account-orders-list');
      if (!container) return;

      if (this.orders.length === 0) {
        container.innerHTML = `
          <div class="p-8 text-center text-zinc-500 space-y-3">
            <i class="fa-solid fa-box-open text-3xl text-zinc-600"></i>
            <p class="text-xs">Bạn chưa có đơn hàng nào.</p>
            <a href="#featured-products" class="inline-block px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors">
              Khám phá 105 mẫu in 3D
            </a>
          </div>
        `;
        return;
      }

      container.innerHTML = this.orders.map(order => {
        const meta = getStatusMeta(order.status || 'pending_confirmation');
        const itemCount = (order.items && order.items.length) || (order.order_items && order.order_items.length) || 1;
        return `
          <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3 hover:border-zinc-700 transition-colors">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-mono font-bold text-orange-400">${order.order_number || order.clientRequestId || 'TT3D-ORDER'}</span>
                <span class="text-[11px] text-zinc-400 ml-2">${formatDate(order.created_at || order.createdAt)}</span>
              </div>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                <i class="fa-solid ${meta.icon} text-orange-400"></i>
                <span>${meta.label}</span>
              </span>
            </div>

            <!-- 8-Stage Tracker Visual Bar -->
            ${this.renderProductionProgressBar(order.status)}

            <div class="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/80">
              <span class="text-zinc-400">${itemCount} sản phẩm in 3D</span>
              <span class="font-bold text-white">${formatMoney(order.total || (order.totals && order.totals.finalTotal))}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    renderProductionProgressBar(statusKey) {
      const activeIdx = PRODUCTION_STAGES.findIndex(s => s.key === statusKey);
      const idx = activeIdx >= 0 ? activeIdx : 0;

      return `
        <div class="space-y-1.5 py-1">
          <div class="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
            <span>Tiến độ in 3D:</span>
            <span class="text-orange-400">${PRODUCTION_STAGES[idx]?.desc || ''}</span>
          </div>
          <div class="w-full bg-zinc-800 rounded-full h-1.5 flex overflow-hidden">
            ${PRODUCTION_STAGES.slice(0, 7).map((s, i) => {
              const isPassed = i <= idx;
              const isCurrent = i === idx;
              return `<div class="flex-1 h-full border-r border-zinc-900 last:border-0 ${
                isCurrent ? 'bg-orange-500 animate-pulse' : isPassed ? 'bg-orange-600' : 'bg-zinc-800'
              }"></div>`;
            }).join('')}
          </div>
        </div>
      `;
    }
  }

  window.TTAccountManager = new TTAccountManager();
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => window.TTAccountManager.init());
    } else {
      window.TTAccountManager.init();
    }
  }
})(typeof window !== 'undefined' ? window : global);
