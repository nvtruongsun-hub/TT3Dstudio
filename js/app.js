/**
 * T&T 3D Studio - Main Application & Product Store Logic
 * Tích hợp Live NFC/QR Preview, Monogram Generator, Swatches & Cart
 */

(function () {
  'use strict';

  // Global Toast Notification Helper
  window.showToast = function (message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-6 left-6 z-[100] flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-5 py-3 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-4 opacity-0 pointer-events-auto ${
      type === 'success' 
        ? 'bg-slate-900/95 border-cyan-500/40 text-cyan-400 shadow-cyan-500/10' 
        : 'bg-slate-900/95 border-orange-500/40 text-orange-400 shadow-orange-500/10'
    }`;

    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check text-cyan-400' : 'fa-circle-info text-orange-400'} text-lg"></i>
      <span class="text-sm font-medium text-slate-100">${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 300);
    }, 3500);
  };

  // 1. Mobile Menu Toggle
  function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const links = document.querySelectorAll('.mobile-nav-link');

    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
      const icon = btn.querySelector('i');
      if (menu.classList.contains('hidden')) {
        icon.className = 'fa-solid fa-bars text-xl';
      } else {
        icon.className = 'fa-solid fa-xmark text-xl text-primary';
      }
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('hidden');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars text-xl';
      });
    });
  }

  // 2. Sticky Navbar Blur Effect
  function initStickyNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        nav.classList.add('bg-slate-950/95', 'backdrop-blur-md', 'border-b', 'border-white/10', 'shadow-2xl');
        nav.classList.remove('bg-transparent');
      } else {
        nav.classList.remove('bg-slate-950/95', 'backdrop-blur-md', 'border-b', 'border-white/10', 'shadow-2xl');
        nav.classList.add('bg-transparent');
      }
    });
  }

  // 3. Store Product Catalog Filter
  function initProductFilter() {
    const filterBtns = document.querySelectorAll('[data-product-filter]');
    const items = document.querySelectorAll('[data-product-category]');

    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-product-filter');

        filterBtns.forEach(b => {
          b.classList.remove('bg-primary/20', 'border-primary', 'text-cyan-300');
          b.classList.add('border-white/10', 'text-slate-400');
        });
        btn.classList.add('bg-primary/20', 'border-primary', 'text-cyan-300');
        btn.classList.remove('border-white/10', 'text-slate-400');

        items.forEach(item => {
          const category = item.getAttribute('data-product-category');
          if (filter === 'all' || category === filter) {
            item.style.display = 'flex';
            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            });
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.96)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 200);
          }
        });
      });
    });
  }

  // 4. Product Quick Order & Customizer Modal với Live Previews & Swatches
  function initProductOrderModal() {
    const modal = document.getElementById('order-modal');
    const closeBtn = document.getElementById('order-modal-close');
    
    // Modal fields
    const modalProdTitle = document.getElementById('order-prod-title');
    const modalProdPrice = document.getElementById('order-prod-price');
    const modalProdImg = document.getElementById('order-prod-img');
    const customOptionsContainer = document.getElementById('order-custom-fields');
    let currentSelectedProduct = null;

    if (!modal) return;

    document.querySelectorAll('[data-order-trigger]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('[data-product-item]');
        if (!card) return;

        const title = card.getAttribute('data-title') || 'Sản phẩm T&T 3D';
        const priceStr = card.getAttribute('data-price') || '129,000 đ';
        const priceNum = parseInt(priceStr.replace(/\D/g, '')) || 129000;
        const img = card.querySelector('img')?.src || '';
        const prodType = card.getAttribute('data-type') || 'standard';
        const prodCategory = card.getAttribute('data-product-category') || '';

        currentSelectedProduct = {
          id: 'prod_' + Math.random().toString(36).substr(2, 6),
          title,
          price: priceNum,
          img,
          type: prodType,
          category: prodCategory
        };

        if (modalProdTitle) modalProdTitle.textContent = title;
        if (modalProdPrice) modalProdPrice.textContent = `${priceNum.toLocaleString('vi-VN')} đ`;
        if (modalProdImg) modalProdImg.src = img;

        // Populate Customization Fields depending on product type
        if (customOptionsContainer) {
          if (prodType === 'nfc') {
            renderNfcCustomizer(customOptionsContainer);
          } else if (prodType === 'monogram') {
            renderMonogramCustomizer(customOptionsContainer);
          } else {
            renderStandardCustomizer(customOptionsContainer);
          }
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Realistic Swatch Listeners
    setupSwatchListeners();

    // Action 1: Thêm vào giỏ hàng
    const btnAddToCart = document.getElementById('btn-modal-add-cart');
    if (btnAddToCart) {
      btnAddToCart.addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentSelectedProduct) return;
        const customData = collectModalCustomData();

        window.TTStore.addToCart({
          id: currentSelectedProduct.id,
          title: currentSelectedProduct.title,
          price: currentSelectedProduct.price,
          qty: 1,
          image: currentSelectedProduct.img,
          customOptions: customData.options,
          weightGrams: 45
        });

        closeModal();
        if (window.TTCart) window.TTCart.openCart();
        window.showToast(`Đã thêm ${currentSelectedProduct.title} vào giỏ hàng!`);
      });
    }

    // Action 2: Thanh toán VietQR ngay
    const btnPayVietQR = document.getElementById('btn-modal-pay-vietqr');
    if (btnPayVietQR) {
      btnPayVietQR.addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentSelectedProduct) return;
        const customData = collectModalCustomData();

        window.TTStore.addToCart({
          id: currentSelectedProduct.id,
          title: currentSelectedProduct.title,
          price: currentSelectedProduct.price,
          qty: 1,
          image: currentSelectedProduct.img,
          customOptions: customData.options,
          weightGrams: 45
        });

        closeModal();
        if (window.TTCart) window.TTCart.openCheckoutModal();
      });
    }

    // Action 3: Chat Zalo chốt đơn
    const btnZalo = document.getElementById('btn-modal-zalo');
    if (btnZalo) {
      btnZalo.addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentSelectedProduct) return;
        const customData = collectModalCustomData();
        const cfg = window.TTStore.getConfig();
        const phone = cfg.shopInfo?.zaloPhone || '0986888333';

        let msg = `👋 ĐẶT HÀNG T&T 3D STUDIO:\n- Sản phẩm: ${currentSelectedProduct.title}\n- Giá: ${currentSelectedProduct.price.toLocaleString('vi-VN')} đ`;
        Object.entries(customData.options).forEach(([k, v]) => {
          msg += `\n- ${k}: ${v}`;
        });
        msg += `\nXin chào xưởng, tôi muốn đặt mua mẫu này!`;

        closeModal();
        window.open(`https://zalo.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
      });
    }
  }

  // Realistic Swatch change event listener
  function setupSwatchListeners() {
    document.querySelectorAll('input[name="order-color"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const hex = radio.getAttribute('data-hex') || '#f8fafc';
        const isClear = radio.value.toLowerCase().includes('trong suốt');
        if (typeof window.updateViewerColor === 'function') {
          window.updateViewerColor(hex, isClear);
        }
      });
    });
  }

  // Render NFC Customizer with live NDEF & QR Preview
  function renderNfcCustomizer(container) {
    container.innerHTML = `
      <div class="space-y-4 p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 text-xs">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2 text-cyan-400 font-bold">
            <i class="fa-solid fa-wifi text-sm"></i>
            <span>Cấu hình nạp Chip NFC 1-Chạm:</span>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Chip NTAG215</span>
        </div>

        <!-- Chọn loại dữ liệu -->
        <div class="space-y-1.5">
          <label class="block font-mono text-slate-400 text-[11px] uppercase">Loại dữ liệu muốn nạp:</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button type="button" data-nfc-mode="wifi" class="nfc-mode-btn active p-2 rounded-lg border border-primary bg-primary/20 text-cyan-300 font-medium text-[11px] text-center">
              <i class="fa-solid fa-wifi block mb-1"></i> WiFi Tự Động
            </button>
            <button type="button" data-nfc-mode="review" class="nfc-mode-btn p-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-300 font-medium text-[11px] text-center hover:border-cyan-400">
              <i class="fa-solid fa-star block mb-1 text-amber-400"></i> Google Review
            </button>
            <button type="button" data-nfc-mode="menu" class="nfc-mode-btn p-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-300 font-medium text-[11px] text-center hover:border-cyan-400">
              <i class="fa-solid fa-utensils block mb-1 text-emerald-400"></i> Link Menu
            </button>
            <button type="button" data-nfc-mode="vcard" class="nfc-mode-btn p-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-300 font-medium text-[11px] text-center hover:border-cyan-400">
              <i class="fa-solid fa-address-card block mb-1 text-purple-400"></i> Bio / vCard
            </button>
          </div>
        </div>

        <!-- Input fields -->
        <div id="nfc-mode-inputs" class="space-y-2">
          <!-- Rendered dynamically -->
        </div>

        <!-- Live NDEF & QR Preview Box -->
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>XEM TRƯỚC MÃ NẠP (NDEF URI & QR CODE):</span>
            <span class="text-cyan-400 font-bold">Live Preview</span>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 bg-white p-1.5 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden shadow-md">
              <img id="nfc-live-qr-img" src="" alt="Live QR Preview" class="w-full h-full object-contain">
            </div>
            <div class="flex-1 min-w-0 space-y-1">
              <div class="text-[10px] text-slate-400 font-sans">Chuỗi NDEF ghi vào chip:</div>
              <div id="nfc-live-ndef-string" class="font-mono text-cyan-300 text-[11px] break-all bg-slate-900 p-1.5 rounded border border-slate-800">
                WIFI:S:MyWiFi;T:WPA;P:Password123;;
              </div>
              <p class="text-[10px] text-emerald-400"><i class="fa-solid fa-mobile-screen-button mr-1"></i> Có thể quét camera thử ngay trên màn hình!</p>
            </div>
          </div>
        </div>
      </div>
    `;

    setupNfcModeSwitching(container);
  }

  function setupNfcModeSwitching(container) {
    const inputArea = container.querySelector('#nfc-mode-inputs');
    const qrImg = container.querySelector('#nfc-live-qr-img');
    const ndefEl = container.querySelector('#nfc-live-ndef-string');
    let currentMode = 'wifi';

    function updatePreview() {
      let payload = '';
      if (currentMode === 'wifi') {
        const ssid = container.querySelector('#nfc-input-ssid')?.value.trim() || 'T&T_3D_Studio';
        const pass = container.querySelector('#nfc-input-pass')?.value.trim() || 'tt3d2026';
        const auth = container.querySelector('#nfc-input-auth')?.value || 'WPA';
        payload = `WIFI:S:${ssid};T:${auth};P:${pass};;`;
      } else if (currentMode === 'review') {
        payload = container.querySelector('#nfc-input-url')?.value.trim() || 'https://maps.app.goo.gl/TT3DStudio';
      } else if (currentMode === 'menu') {
        payload = container.querySelector('#nfc-input-url')?.value.trim() || 'https://tt3dstudio.vn/menu';
      } else {
        const name = container.querySelector('#nfc-input-name')?.value.trim() || 'Nguyen Van A';
        const phone = container.querySelector('#nfc-input-phone')?.value.trim() || '0986888333';
        payload = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEND:VCARD`;
      }

      if (ndefEl) ndefEl.textContent = payload;
      if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(payload)}`;
      }
    }

    function renderInputs(mode) {
      currentMode = mode;
      if (mode === 'wifi') {
        inputArea.innerHTML = `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input type="text" id="nfc-input-ssid" placeholder="Tên mạng WiFi (SSID)..." value="Coffee_TheMorning" class="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none">
            <input type="text" id="nfc-input-pass" placeholder="Mật khẩu WiFi..." value="morning2026" class="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none">
          </div>
          <div class="grid grid-cols-2 gap-2">
            <select id="nfc-input-auth" class="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none">
              <option value="WPA" selected>Bảo mật: WPA / WPA2 (Phổ biến)</option>
              <option value="WEP">Bảo mật: WEP</option>
              <option value="nopass">Không có mật khẩu</option>
            </select>
            <input type="text" id="nfc-input-label" placeholder="Tên quán khắc trên mặt đế..." class="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none">
          </div>
        `;
      } else {
        inputArea.innerHTML = `
          <div class="space-y-2">
            <input type="url" id="nfc-input-url" placeholder="Nhập đường dẫn URL (${mode === 'review' ? 'Link Google Maps' : 'Link Menu'})..." value="${mode === 'review' ? 'https://g.page/r/TT3DReview' : 'https://menu.tt3d.vn'}" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none">
            <input type="text" id="nfc-input-label" placeholder="Tên thương hiệu khắc trên đế..." class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none">
          </div>
        `;
      }

      inputArea.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', updatePreview);
      });
      updatePreview();
    }

    container.querySelectorAll('.nfc-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.nfc-mode-btn').forEach(b => {
          b.classList.remove('active', 'border-primary', 'bg-primary/20', 'text-cyan-300');
          b.classList.add('border-slate-700', 'bg-slate-950', 'text-slate-300');
        });
        btn.classList.add('active', 'border-primary', 'bg-primary/20', 'text-cyan-300');
        btn.classList.remove('border-slate-700', 'bg-slate-950', 'text-slate-300');

        const mode = btn.getAttribute('data-nfc-mode');
        renderInputs(mode);
      });
    });

    renderInputs('wifi');
  }

  // Render Monogram Customizer with Live Typography Preview
  function renderMonogramCustomizer(container) {
    container.innerHTML = `
      <div class="space-y-4 p-4 rounded-2xl bg-slate-900 border border-secondary/30 text-xs">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2 text-secondary font-bold">
            <i class="fa-solid fa-font text-sm"></i>
            <span>Cá nhân hóa Chữ Cái Monogram & Tên:</span>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">Khắc Nổi 3D</span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block font-mono text-slate-400 text-[10px] mb-1">CHỮ CÁI A-Z:</label>
            <input type="text" id="mono-letter-input" maxlength="2" value="T" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-secondary text-base font-bold text-center focus:border-orange-400 focus:outline-none uppercase">
          </div>
          <div class="col-span-2">
            <label class="block font-mono text-slate-400 text-[10px] mb-1">TÊN RIÊNG KHẮC NỔI:</label>
            <input type="text" id="mono-name-input" value="Trường An" placeholder="Nhập tên riêng (vd: Bảo Trâm)..." class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-orange-400 focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block font-mono text-slate-400 text-[10px] mb-1">LINH VẬT ĐÍNH KÈM:</label>
          <select id="mono-decor-select" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-orange-400 focus:outline-none">
            <option value="Khủng Long Xanh">🦖 Chú Khủng Long Dễ Thương</option>
            <option value="Phi Hành Gia">🧑‍🚀 Phi Hành Gia Khám Phá Vũ Trụ</option>
            <option value="Trái Tim Yêu">❤️ Trái Tim Tình Yêu</option>
            <option value="Tối Giản">✨ Tối Giản (Chỉ chữ & tên)</option>
          </select>
        </div>

        <!-- Typography Live Preview Box -->
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1 relative overflow-hidden">
          <div class="text-[10px] font-mono text-slate-500 uppercase tracking-widest">XEM TRƯỚC TẠO HÌNH 3D</div>
          <div id="mono-preview-letter" class="text-6xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 drop-shadow-md">
            T
          </div>
          <div id="mono-preview-name" class="font-display font-bold text-sm text-white tracking-widest uppercase">
            TRƯỜNG AN
          </div>
          <div id="mono-preview-decor" class="text-xs text-cyan-400 font-mono mt-1">
            🦖 Kèm Khủng Long Xanh
          </div>
        </div>
      </div>
    `;

    const letterIn = container.querySelector('#mono-letter-input');
    const nameIn = container.querySelector('#mono-name-input');
    const decorSel = container.querySelector('#mono-decor-select');
    const pLetter = container.querySelector('#mono-preview-letter');
    const pName = container.querySelector('#mono-preview-name');
    const pDecor = container.querySelector('#mono-preview-decor');

    function syncMono() {
      if (pLetter) pLetter.textContent = (letterIn?.value || 'T').toUpperCase();
      if (pName) pName.textContent = (nameIn?.value || 'TÊN CỦA BẠN').toUpperCase();
      if (pDecor) pDecor.textContent = `Kèm ${decorSel?.value || 'Trang trí'}`;
    }

    if (letterIn) letterIn.addEventListener('input', syncMono);
    if (nameIn) nameIn.addEventListener('input', syncMono);
    if (decorSel) decorSel.addEventListener('change', syncMono);
    syncMono();
  }

  // Render Standard Decor details
  function renderStandardCustomizer(container) {
    container.innerHTML = `
      <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
        <div class="flex items-center gap-2 text-emerald-400 font-bold">
          <i class="fa-solid fa-leaf"></i>
          <span>Tiêu Chuẩn Sản Xuất T&T 3D Studio:</span>
        </div>
        <p class="text-[11px] text-slate-400 leading-relaxed">
          100% sử dụng nhựa sinh học PLA+ / PETG cao cấp chiết xuất bắp ngô, hoàn thiện thủ công mịn màng, kiểm định test kín nước 100% trước khi xuất kho.
        </p>
      </div>
    `;
  }

  // Collect customization data from modal
  function collectModalCustomData() {
    const colorEl = document.querySelector('input[name="order-color"]:checked');
    const color = colorEl ? colorEl.value : 'Trắng Sứ Matte';
    const options = { 'Màu sắc': color };

    // NFC fields
    const ssid = document.getElementById('nfc-input-ssid')?.value.trim();
    const pass = document.getElementById('nfc-input-pass')?.value.trim();
    const url = document.getElementById('nfc-input-url')?.value.trim();
    const label = document.getElementById('nfc-input-label')?.value.trim();

    if (ssid) {
      options['WiFi'] = `${ssid} (Pass: ${pass || 'Không'})`;
    } else if (url) {
      options['URL'] = url;
    }
    if (label) options['Khắc tên'] = label;

    // Monogram fields
    const letter = document.getElementById('mono-letter-input')?.value.trim();
    const name = document.getElementById('mono-name-input')?.value.trim();
    const decor = document.getElementById('mono-decor-select')?.value;

    if (letter) options['Chữ cái'] = letter.toUpperCase();
    if (name) options['Tên khắc'] = name;
    if (decor) options['Linh vật'] = decor;

    return { options };
  }

  // 5. Image Lightbox Modal
  function initLightbox() {
    const modal = document.getElementById('image-lightbox');
    const modalImg = document.getElementById('lightbox-img');
    const modalTitle = document.getElementById('lightbox-title');
    const modalDesc = document.getElementById('lightbox-desc');
    const closeBtn = document.getElementById('lightbox-close');

    if (!modal) return;

    document.querySelectorAll('[data-lightbox-trigger]').forEach(card => {
      card.addEventListener('click', () => {
        const img = card.querySelector('img');
        const title = card.querySelector('h4')?.textContent || card.querySelector('h3')?.textContent || 'Dự án T&T 3D Studio';
        const desc = card.querySelector('.portfolio-details')?.innerHTML || '';

        if (img && modalImg) {
          modalImg.src = img.src;
          modalImg.alt = title;
        }
        if (modalTitle) modalTitle.textContent = title;
        if (modalDesc) modalDesc.innerHTML = desc;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // 6. Material Specification Tab Switcher
  function initMaterialTabs() {
    const tabBtns = document.querySelectorAll('[data-mat-tab]');
    const tabPanes = document.querySelectorAll('[data-mat-pane]');

    if (!tabBtns.length) return;

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-mat-tab');

        tabBtns.forEach(b => {
          b.classList.remove('text-primary', 'border-primary', 'bg-primary/10');
          b.classList.add('text-slate-400', 'border-transparent');
        });
        btn.classList.add('text-primary', 'border-primary', 'bg-primary/10');
        btn.classList.remove('text-slate-400', 'border-transparent');

        tabPanes.forEach(pane => {
          if (pane.getAttribute('data-mat-pane') === target) {
            pane.classList.remove('hidden');
          } else {
            pane.classList.add('hidden');
          }
        });
      });
    });
  }

  // 7. FAQ Accordion
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const header = item.querySelector('.faq-trigger');
      const body = item.querySelector('.faq-content');

      if (header && body) {
        header.addEventListener('click', () => {
          const isOpen = item.classList.contains('active');

          faqItems.forEach(other => {
            other.classList.remove('active');
            const otherBody = other.querySelector('.faq-content');
            if (otherBody) otherBody.style.maxHeight = null;
          });

          if (!isOpen) {
            item.classList.add('active');
            body.style.maxHeight = body.scrollHeight + 'px';
          }
        });
      }
    });
  }

  // 8. Contact Form Handler with Validation
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name')?.value.trim();
      const phone = document.getElementById('contact-phone')?.value.trim();

      if (!name || !phone) {
        window.showToast('Vui lòng nhập họ tên và số điện thoại liên hệ!', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang gửi yêu cầu...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        form.reset();
        window.showToast(`Cảm ơn bạn ${name}! T&T 3D Studio đã nhận thông tin và sẽ phản hồi trong 15 phút.`);
      }, 1200);
    });
  }

  // 9. Scroll To Top Floating Button
  function initScrollToTop() {
    const topBtn = document.getElementById('btn-scroll-top');
    if (!topBtn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        topBtn.style.opacity = '1';
        topBtn.style.pointerEvents = 'auto';
      } else {
        topBtn.style.opacity = '0';
        topBtn.style.pointerEvents = 'none';
      }
    });

    topBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 10. Sync Config Data from TT_CONFIG (Live Admin Sync)
  function syncConfigToPage() {
    const cfg = (window.TTStore && window.TTStore.getConfig()) || window.TT_DEFAULT_CONFIG;
    const info = cfg.shopInfo;
    if (!info) return;

    // Hotline & Phone links
    if (info.hotline) {
      const cleanPhone = info.hotline.replace(/\D/g, '');
      document.querySelectorAll('a[href^="tel:"]').forEach(a => {
        a.href = `tel:${cleanPhone}`;
        const span = a.querySelector('span');
        if (span) span.textContent = info.hotline;
      });
    }

    // Zalo links
    if (info.zaloPhone) {
      const cleanZalo = info.zaloPhone.replace(/\D/g, '');
      document.querySelectorAll('a[href*="zalo.me"]').forEach(a => {
        a.href = `https://zalo.me/${cleanZalo}`;
      });
    }

    // Shopee & TikTok links
    if (info.shopeeUrl) {
      document.querySelectorAll('a[href*="shopee.vn"]').forEach(a => {
        a.href = info.shopeeUrl;
      });
    }
    if (info.tiktokUrl) {
      document.querySelectorAll('a[href*="tiktok.com"]').forEach(a => {
        a.href = info.tiktokUrl;
      });
    }

    // Sync Product prices and titles if customized
    if (cfg.products && cfg.products.length) {
      const cards = document.querySelectorAll('[data-product-item]');
      cards.forEach((card, idx) => {
        const p = cfg.products[idx];
        if (p) {
          card.setAttribute('data-title', p.title);
          card.setAttribute('data-price', `${p.price.toLocaleString('vi-VN')} đ`);

          const titleEl = card.querySelector('h3');
          if (titleEl) titleEl.textContent = p.title;

          const priceEl = card.querySelector('.font-extrabold.text-white');
          if (priceEl) priceEl.textContent = `${p.price.toLocaleString('vi-VN')} đ`;

          const origPriceEl = card.querySelector('.line-through');
          if (origPriceEl && p.originalPrice) {
            origPriceEl.textContent = `${p.originalPrice.toLocaleString('vi-VN')} đ`;
          }

          const tagEl = card.querySelector('.badge-hot, .badge-eco, .bg-indigo-600, .bg-purple-600, .bg-emerald-600');
          if (tagEl && p.tag) {
            tagEl.textContent = p.tag;
          }
        }
      });
    }
  }

  // 11. Light / Dark Scandinavian Theme Toggle
  function initThemeToggle() {
    const savedTheme = localStorage.getItem('tt_theme');
    const isLight = savedTheme === 'light';
    
    if (isLight) {
      document.body.classList.add('light-theme');
    }

    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    const updateIcons = (light) => {
      toggleBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = light ? 'fa-solid fa-moon text-slate-700' : 'fa-solid fa-sun text-amber-400';
        }
        btn.setAttribute('title', light ? 'Chuyển sang giao diện Dark Tech' : 'Chuyển sang tone sáng dịu nhẹ (Nordic Studio)');
      });
    };

    updateIcons(isLight);

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentlyLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('tt_theme', currentlyLight ? 'light' : 'dark');
        updateIcons(currentlyLight);
        if (window.updateViewerTheme) {
          window.updateViewerTheme(currentlyLight);
        }
        window.showToast(currentlyLight ? 'Đã bật tone màu sáng ấm dịu nhẹ phong cách Bắc Âu!' : 'Đã chuyển về giao diện Dark Tech!');
      });
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    syncConfigToPage();
    initMobileMenu();
    initStickyNav();
    initProductFilter();
    initProductOrderModal();
    initLightbox();
    initMaterialTabs();
    initFAQ();
    initContactForm();
    initScrollToTop();
  });

})();
