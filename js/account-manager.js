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
        // Auto-resume pending checkout intent if user just authenticated
        let intent = this.pendingIntent;
        if (!intent && typeof window !== 'undefined' && window.sessionStorage) {
          try {
            intent = window.sessionStorage.getItem('tt3d_pending_intent');
            window.sessionStorage.removeItem('tt3d_pending_intent');
          } catch (e) {}
        }
        if (intent === 'checkout' || intent === 'direct_checkout') {
          this.pendingIntent = null;
          this.closeAuthModal();
          setTimeout(() => {
            if (window.TTCheckout && typeof window.TTCheckout.openCheckout === 'function') {
              const cart = (window.TTCart && window.TTCart.getCart) ? window.TTCart.getCart() : [];
              if (cart.length > 0) {
                window.TTCheckout.openCheckout(cart, 0, { source: 'cart' });
              }
            }
          }, 150);
        }
        // Clean up URL fragment if redirected back from OAuth
        if (typeof window !== 'undefined' && window.location && window.location.hash && window.location.hash.includes('access_token')) {
          if (window.history && typeof window.history.replaceState === 'function') {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }
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

      // Social OAuth Buttons (Google & Facebook)
      const btnGoogle = document.getElementById('auth-btn-google');
      if (btnGoogle) {
        btnGoogle.addEventListener('click', async () => {
          if (window.TTSupabase && typeof window.TTSupabase.signInWithOAuth === 'function') {
            const res = await window.TTSupabase.signInWithOAuth('google');
            if (!res.ok) {
              const errBox = document.getElementById('auth-error-alert');
              if (errBox) {
                errBox.textContent = res.error;
                errBox.classList.remove('hidden');
              }
            } else if (res.user) {
              this.closeAuthModal();
              if (window.showToast) window.showToast('Đăng nhập Google thành công!', 'success');
              if (this.pendingIntent === 'checkout' && window.TTCheckout) {
                const cart = (window.TTCart && window.TTCart.getCart) ? window.TTCart.getCart() : [];
                window.TTCheckout.openCheckout(cart, 0, { source: 'cart' });
              }
            }
          }
        });
      }

      const btnFacebook = document.getElementById('auth-btn-facebook');
      if (btnFacebook) {
        btnFacebook.addEventListener('click', async () => {
          if (window.TTSupabase && typeof window.TTSupabase.signInWithOAuth === 'function') {
            const res = await window.TTSupabase.signInWithOAuth('facebook');
            if (!res.ok) {
              const errBox = document.getElementById('auth-error-alert');
              if (errBox) {
                errBox.textContent = res.error;
                errBox.classList.remove('hidden');
              }
            } else if (res.user) {
              this.closeAuthModal();
              if (window.showToast) window.showToast('Đăng nhập Facebook thành công!', 'success');
              if (this.pendingIntent === 'checkout' && window.TTCheckout) {
                const cart = (window.TTCart && window.TTCart.getCart) ? window.TTCart.getCart() : [];
                window.TTCheckout.openCheckout(cart, 0, { source: 'cart' });
              }
            }
          }
        });
      }

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

      // Address Book Form Modal Events
      const btnAddAddr = document.getElementById('account-btn-add-address');
      if (btnAddAddr) {
        btnAddAddr.addEventListener('click', () => this.openAddressModal('add'));
      }

      const closeAddrBtn = document.getElementById('account-address-form-close');
      if (closeAddrBtn) {
        closeAddrBtn.addEventListener('click', () => this.closeAddressModal());
      }

      const cancelAddrBtn = document.getElementById('account-addr-cancel-btn');
      if (cancelAddrBtn) {
        cancelAddrBtn.addEventListener('click', () => this.closeAddressModal());
      }

      const submitAddrBtn = document.getElementById('account-addr-submit-btn');
      if (submitAddrBtn) {
        submitAddrBtn.addEventListener('click', () => this.handleAddressFormSubmit());
      }

      const provSelect = document.getElementById('account-addr-province');
      if (provSelect) {
        provSelect.addEventListener('change', () => this.handleProvinceChange());
      }

      const saveProfileBtn = document.getElementById('profile-save-btn');
      if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => this.handleProfileUpdate());
      }
    }

    openAuthModal(tab = 'login', intent = null) {
      this.pendingIntent = intent;
      if (intent && typeof window !== 'undefined' && window.sessionStorage) {
        try { window.sessionStorage.setItem('tt3d_pending_intent', intent); } catch (e) {}
      }
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
      const socialBox = document.getElementById('auth-social-container');
      if (socialBox) {
        if (tab === 'forgot') socialBox.classList.add('hidden');
        else socialBox.classList.remove('hidden');
      }

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

      if (tab === 'profile') {
        this.loadUserProfile();
        this.renderAddressBook();
      } else if (tab === 'orders') {
        this.loadCustomerOrders();
      }
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


    initAddressSelectors() {
      const provSelect = document.getElementById('account-addr-province');
      if (!provSelect) return;
      const optLen = provSelect.options ? provSelect.options.length : 0;
      if (optLen <= 1 && window.VNAdmin && Array.isArray(window.VNAdmin.ALL_PROVINCES)) {
        provSelect.innerHTML = '<option value="">-- Chọn Tỉnh / Thành phố --</option>';
        window.VNAdmin.ALL_PROVINCES.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.code;
          opt.textContent = p.name;
          provSelect.appendChild(opt);
        });
      }
    }

    handleProvinceChange() {
      const provSelect = document.getElementById('account-addr-province');
      const wardSelect = document.getElementById('account-addr-ward');
      if (!provSelect || !wardSelect) return;

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
    }

    openAddressModal(mode = 'add', addressId = null) {
      this.initAddressSelectors();
      const modal = document.getElementById('account-address-form-modal');
      const title = document.getElementById('account-address-form-title');
      const editIdInput = document.getElementById('account-addr-edit-id');
      const nameInput = document.getElementById('account-addr-name');
      const phoneInput = document.getElementById('account-addr-phone');
      const provSelect = document.getElementById('account-addr-province');
      const wardSelect = document.getElementById('account-addr-ward');
      const lineInput = document.getElementById('account-addr-line');
      const noteInput = document.getElementById('account-addr-note');
      const defaultChk = document.getElementById('account-addr-default');
      const errBox = document.getElementById('account-addr-error');

      if (errBox) errBox.classList.add('hidden');

      if (mode === 'edit' && addressId && window.TTAddressBook) {
        const addr = window.TTAddressBook.getAddressById(addressId);
        if (!addr) return;
        if (title) title.textContent = 'Chỉnh sửa địa chỉ giao hàng';
        if (editIdInput) editIdInput.value = addr.id;
        if (nameInput) nameInput.value = addr.recipient_name || '';
        if (phoneInput) phoneInput.value = addr.recipient_phone || '';
        if (lineInput) lineInput.value = addr.address_line || '';
        if (noteInput) noteInput.value = addr.delivery_note || '';
        if (defaultChk) defaultChk.checked = !!addr.is_default;

        // Label radio
        const labelRadio = document.querySelector(`input[name="account-addr-label"][value="${addr.label || 'home'}"]`);
        if (labelRadio) labelRadio.checked = true;

        // Populate province & ward
        if (provSelect && addr.province_code) {
          provSelect.value = addr.province_code;
          this.handleProvinceChange();
          if (wardSelect && addr.ward_code) {
            wardSelect.value = addr.ward_code;
          }
        }
      } else {
        if (title) title.textContent = 'Thêm địa chỉ giao hàng';
        if (editIdInput) editIdInput.value = '';
        if (lineInput) lineInput.value = '';
        if (noteInput) noteInput.value = '';
        if (defaultChk) defaultChk.checked = false;

        const homeRadio = document.querySelector('input[name="account-addr-label"][value="home"]');
        if (homeRadio) homeRadio.checked = true;

        // Prefill from current user profile
        const user = (window.TTSupabase && typeof window.TTSupabase.getUser === 'function') ? window.TTSupabase.getUser() : null;
        if (nameInput) nameInput.value = (user && user.user_metadata && user.user_metadata.full_name) || '';
        if (phoneInput) phoneInput.value = (user && user.user_metadata && user.user_metadata.phone) || '';

        if (provSelect) provSelect.value = '';
        if (wardSelect) {
          wardSelect.innerHTML = '<option value="">-- Chọn Tỉnh trước --</option>';
          wardSelect.disabled = true;
        }
      }

      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    }

    closeAddressModal() {
      const modal = document.getElementById('account-address-form-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    async handleAddressFormSubmit() {
      const editId = document.getElementById('account-addr-edit-id')?.value;
      const name = document.getElementById('account-addr-name')?.value.trim();
      const rawPhone = document.getElementById('account-addr-phone')?.value.trim();
      const provSelect = document.getElementById('account-addr-province');
      const wardSelect = document.getElementById('account-addr-ward');
      const line = document.getElementById('account-addr-line')?.value.trim();
      const note = document.getElementById('account-addr-note')?.value.trim();
      const defaultChk = document.getElementById('account-addr-default');
      const isDefault = defaultChk ? defaultChk.checked : false;
      const labelRadio = document.querySelector('input[name="account-addr-label"]:checked');
      const label = labelRadio ? labelRadio.value : 'home';
      const errBox = document.getElementById('account-addr-error');

      const showError = (msg) => {
        if (errBox) {
          errBox.textContent = msg;
          errBox.classList.remove('hidden');
        } else if (typeof alert === 'function') {
          alert(msg);
        }
      };

      if (!name) return showError('Vui lòng nhập họ và tên người nhận.');
      const cleanPhone = (rawPhone || '').replace(/[\s.-]/g, '');
      const phoneRegex = /^(?:0|\+84)(?:3|5|7|8|9)\d{8}$/;
      if (!phoneRegex.test(cleanPhone)) return showError('Vui lòng nhập số điện thoại hợp lệ (10 chữ số).');
      if (!provSelect || !provSelect.value) return showError('Vui lòng chọn Tỉnh / Thành phố.');
      if (!wardSelect || !wardSelect.value) return showError('Vui lòng chọn Phường / Xã.');
      if (!line) return showError('Vui lòng nhập số nhà, tên đường, thôn/xóm.');

      const pCode = provSelect.value;
      const pName = provSelect.options[provSelect.selectedIndex]?.textContent || '';
      const wCode = wardSelect.value;
      const wName = wardSelect.options[wardSelect.selectedIndex]?.textContent || '';

      const payload = {
        label,
        recipient_name: name,
        recipient_phone: cleanPhone,
        province_code: pCode,
        province_name: pName,
        ward_code: wCode,
        ward_name: wName,
        address_line: line,
        delivery_note: note,
        is_default: isDefault
      };

      if (!window.TTAddressBook) return;

      const submitBtn = document.getElementById('account-addr-submit-btn');
      if (submitBtn) submitBtn.disabled = true;

      try {
        let res;
        if (editId) {
          res = await window.TTAddressBook.updateAddress(editId, payload);
        } else {
          res = await window.TTAddressBook.addAddress(payload);
        }

        if (res.ok) {
          this.closeAddressModal();
          await this.renderAddressBook();
          if (window.showToast) window.showToast('Lưu địa chỉ thành công!', 'success');
        } else {
          showError(res.error || 'Lỗi khi lưu địa chỉ.');
        }
      } catch (err) {
        showError(err.message || 'Lỗi xử lý địa chỉ.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    }

    async renderAddressBook() {
      const container = document.getElementById('account-address-list');
      if (!container || !window.TTAddressBook) return;

      container.innerHTML = '<div class="text-zinc-500 text-xs py-2">Đang tải sổ địa chỉ...</div>';
      const addresses = await window.TTAddressBook.loadAddresses();

      if (!Array.isArray(addresses) || addresses.length === 0) {
        container.innerHTML = `
          <div class="p-6 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl space-y-2">
            <i class="fa-solid fa-map-location-dot text-2xl text-zinc-600"></i>
            <p class="text-xs">Bạn chưa lưu địa chỉ giao hàng nào.</p>
            <p class="text-[11px] text-zinc-400">Thêm địa chỉ ngay để được tự động điền khi mua hàng 1-chạm!</p>
          </div>
        `;
        return;
      }

      container.innerHTML = addresses.map(addr => {
        const meta = window.TTAddressBook.getLabelMeta(addr.label);
        const fullAddr = window.TTAddressBook.formatFullAddress(addr);
        return `
          <div class="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-2 hover:border-zinc-600 transition-colors">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${meta.badgeClass}">
                  <i class="fa-solid ${meta.icon}"></i>
                  <span>${meta.name}</span>
                </span>
                ${addr.is_default ? '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Mặc định</span>' : ''}
              </div>
              <div class="flex items-center gap-1.5">
                ${!addr.is_default ? `
                  <button type="button" onclick="window.TTAccountManager.handleSetDefaultAddress('${addr.id}')" class="px-2 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-[10px] text-zinc-300 transition-colors">
                    Đặt mặc định
                  </button>
                ` : ''}
                <button type="button" onclick="window.TTAccountManager.openAddressModal('edit', '${addr.id}')" class="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors" title="Chỉnh sửa">
                  <i class="fa-solid fa-pen-to-square text-xs"></i>
                </button>
                <button type="button" onclick="window.TTAccountManager.handleDeleteAddress('${addr.id}')" class="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Xóa">
                  <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>

            <div class="space-y-0.5 text-xs text-white">
              <div class="flex items-center gap-2">
                <span class="font-bold">${addr.recipient_name}</span>
                <span class="text-zinc-400 font-mono text-[11px]">${addr.recipient_phone}</span>
              </div>
              <div class="text-zinc-300 text-[11px] leading-relaxed">${fullAddr}</div>
              ${addr.delivery_note ? `<div class="text-[10px] text-zinc-400 italic pt-0.5"><i class="fa-solid fa-note-sticky mr-1 text-orange-400"></i>${addr.delivery_note}</div>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    async handleSetDefaultAddress(id) {
      if (!window.TTAddressBook) return;
      const res = await window.TTAddressBook.setDefault(id);
      if (res.ok) {
        await this.renderAddressBook();
        if (window.showToast) window.showToast('Đã đặt làm địa chỉ mặc định!', 'success');
      } else {
        if (window.showToast) window.showToast(res.error || 'Lỗi khi đặt mặc định', 'error');
      }
    }

    async handleDeleteAddress(id) {
      if (typeof confirm === 'function' && !confirm('Bạn có chắc chắn muốn xóa địa chỉ giao hàng này?')) {
        return;
      }
      if (!window.TTAddressBook) return;
      const res = await window.TTAddressBook.deleteAddress(id);
      if (res.ok) {
        await this.renderAddressBook();
        if (window.showToast) window.showToast('Đã xóa địa chỉ thành công!', 'info');
      } else {
        if (window.showToast) window.showToast(res.error || 'Lỗi khi xóa địa chỉ', 'error');
      }
    }

    loadUserProfile() {
      const user = (window.TTSupabase && typeof window.TTSupabase.getUser === 'function') ? window.TTSupabase.getUser() : null;
      const nameInput = document.getElementById('profile-name');
      const phoneInput = document.getElementById('profile-phone');
      if (user && user.user_metadata) {
        if (nameInput) nameInput.value = user.user_metadata.full_name || '';
        if (phoneInput) phoneInput.value = user.user_metadata.phone || '';
      }
    }

    async handleProfileUpdate() {
      const nameInput = document.getElementById('profile-name');
      const phoneInput = document.getElementById('profile-phone');
      const fullName = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';

      if (window.TTSupabase && typeof window.TTSupabase.updateProfile === 'function') {
        const res = await window.TTSupabase.updateProfile({ fullName, phone });
        if (res.ok) {
          if (window.showToast) window.showToast('Cập nhật hồ sơ cá nhân thành công!', 'success');
        } else {
          if (window.showToast) window.showToast(res.error || 'Lỗi khi cập nhật hồ sơ', 'error');
        }
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
