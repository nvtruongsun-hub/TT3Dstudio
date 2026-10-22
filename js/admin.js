/**
 * T&T 3D Labs - Admin Studio OS Main Controller
 * Phân tách theo chỉ thị Codex Master Controller (Directive 2026-10-20)
 * Quản lý CRUD sản phẩm, Uploader Base64, Thư viện ảnh nghệ thuật & Lịch sử đơn hàng
 */

(function (window) {
  'use strict';

  const SESSION_KEY_AUTH = 'tt_admin_authenticated';
  const DEFAULT_PIN = '2026';

  let currentEditingProductId = null;
  let activeFilterCategory = 'all';
  let activeFilterStatus = 'all';
  let searchQuery = '';
  let activeImageSource = 'upload'; // 'upload' | 'url' | 'preset'
  let currentImageDataUrl = '';

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

  // Toast Notification Helper (Safe textContent - Codex F07)
  function showToast(message, type = 'success') {
    const container = document.getElementById('admin-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-4 opacity-0 pointer-events-auto ${
      type === 'success' 
        ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10' 
        : 'bg-slate-900/95 border-rose-500/40 text-rose-300 shadow-rose-500/10'
    }`;

    const icon = document.createElement('i');
    icon.className = `fa-solid ${type === 'success' ? 'fa-circle-check text-emerald-400' : 'fa-circle-exclamation text-rose-400'} text-base`;

    const msgSpan = document.createElement('span');
    msgSpan.className = 'text-xs font-medium text-slate-100';
    msgSpan.textContent = String(message || '');

    toast.appendChild(icon);
    toast.appendChild(msgSpan);

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // 1. PIN AUTHENTICATION
  function initAuth() {
    const lockScreen = document.getElementById('admin-lock-screen');
    const adminApp = document.getElementById('admin-app');
    const pinForm = document.getElementById('pin-form');
    const pinInput = document.getElementById('admin-pin-input');
    const pinError = document.getElementById('pin-error');
    const btnLogout = document.getElementById('btn-logout');

    const isAuth = sessionStorage.getItem(SESSION_KEY_AUTH) === 'true';

    if (isAuth) {
      if (lockScreen) lockScreen.classList.add('hidden');
      if (adminApp) adminApp.classList.remove('hidden');
      loadAllDashboardData();
    } else {
      if (lockScreen) lockScreen.classList.remove('hidden');
      if (adminApp) adminApp.classList.add('hidden');
      if (pinInput && typeof pinInput.focus === 'function') pinInput.focus();
    }

    if (pinForm) {
      pinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = pinInput.value.trim();
        if (pin === DEFAULT_PIN) {
          sessionStorage.setItem(SESSION_KEY_AUTH, 'true');
          lockScreen.classList.add('hidden');
          adminApp.classList.remove('hidden');
          if (pinError) pinError.classList.add('hidden');
          pinInput.value = '';
          showToast('Xác thực thành công! Chào mừng Quản trị viên T&T 3D Labs.');
          loadAllDashboardData();
        } else {
          if (pinError) pinError.classList.remove('hidden');
          pinInput.select();
          pinInput.focus();
        }
      });
    }

    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn đăng xuất phiên quản trị?')) {
          sessionStorage.removeItem(SESSION_KEY_AUTH);
          adminApp.classList.add('hidden');
          lockScreen.classList.remove('hidden');
          showToast('Đã đăng xuất phiên làm việc an toàn.');
        }
      });
    }
  }

  // 2. TAB NAVIGATION
  function initTabNavigation() {
    const links = document.querySelectorAll('.sidebar-link[data-tab-target]');
    const tabPanels = document.querySelectorAll('.tab-panel');

    links.forEach(link => {
      link.addEventListener('click', () => {
        const target = link.dataset.tabTarget;

        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        tabPanels.forEach(panel => {
          if (panel.id === `tab-${target}`) {
            panel.classList.remove('hidden');
          } else {
            panel.classList.add('hidden');
          }
        });

        // Update Page Title
        const pageTitle = document.getElementById('page-title');
        const pageSubtitle = document.getElementById('page-subtitle');
        if (target === 'overview') {
          if (pageTitle) pageTitle.innerHTML = '<span>Tổng Quan Hệ Thống Studio</span>';
          if (pageSubtitle) pageSubtitle.textContent = 'Giám sát số lượng sản phẩm, dung lượng lưu trữ và trạng thái xưởng';
          loadOverviewStats();
        } else if (target === 'products') {
          if (pageTitle) pageTitle.innerHTML = '<span>Quản Lý Sản Phẩm &amp; Media Studio</span>';
          if (pageSubtitle) pageSubtitle.textContent = 'Thêm mới, sửa hình ảnh, upload từ máy và quản lý danh mục';
          renderProductsTable();
        } else if (target === 'presets') {
          if (pageTitle) pageTitle.innerHTML = '<span>Kho Ảnh Nghệ Thuật &amp; Studio Presets</span>';
          if (pageSubtitle) pageSubtitle.textContent = 'Bộ sưu tập hình ảnh in 3D phong cách tối giản editorial tuyển chọn';
          renderArtPresetsGallery();
        } else if (target === 'orders') {
          if (pageTitle) pageTitle.innerHTML = '<span>Yêu Cầu Đơn Hàng (Direct Orders)</span>';
          if (pageSubtitle) pageSubtitle.textContent = 'Theo dõi các đơn hàng khách gửi qua Zalo / COD trên trình duyệt';
          renderOrdersTable();
        } else if (target === 'pricing') {
          if (pageTitle) pageTitle.innerHTML = '<span>Cấu Hình Bảng Giá In 3D (Báo Giá Tự Động)</span>';
          if (pageSubtitle) pageSubtitle.textContent = 'Điều chỉnh đơn giá nhựa/resin và phí vận hành máy in theo giờ';
        }
      });
    });
  }

  // 3. OVERVIEW STATS & STORAGE GAUGE
  async function loadOverviewStats() {
    const products = await window.TTCatalogStore.getProducts(false);
    const totalEl = document.getElementById('stat-total-products');
    const activeEl = document.getElementById('stat-active-products');
    const ordersEl = document.getElementById('stat-total-orders');

    if (totalEl) totalEl.textContent = products.length;
    if (activeEl) activeEl.textContent = products.filter(p => p.status === 'active').length;

    const draftOrders = (window.TTCheckout && typeof window.TTCheckout.getDraftOrders === 'function') 
      ? window.TTCheckout.getDraftOrders() 
      : [];
    if (ordersEl) ordersEl.textContent = draftOrders.length;

    // Storage gauge
    const usageBytes = window.TTImageUploader ? window.TTImageUploader.getStorageUsageBytes() : 0;
    const usageKb = Math.round(usageBytes / 1024);
    const gaugeEl = document.getElementById('stat-storage-gauge');
    const gaugeBar = document.getElementById('stat-storage-bar');
    if (gaugeEl) {
      gaugeEl.textContent = `${usageKb} KB / 3.5 MB`;
    }
    if (gaugeBar) {
      const pct = Math.min(100, Math.round((usageBytes / (3.5 * 1024 * 1024)) * 100));
      gaugeBar.style.width = `${pct}%`;
      if (pct > 80) {
        gaugeBar.className = 'h-1.5 rounded-full bg-rose-500';
      } else {
        gaugeBar.className = 'h-1.5 rounded-full bg-emerald-500';
      }
    }

    // Render Recent Products List in Overview (DOM Safe - Codex R03)
    const recentList = document.getElementById('overview-recent-products');
    if (recentList) {
      recentList.innerHTML = '';
      products.slice(0, 5).forEach(p => {
        const itemEl = document.createElement('div');
        itemEl.className = 'flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800';

        const leftEl = document.createElement('div');
        leftEl.className = 'flex items-center gap-3';

        const imgEl = document.createElement('img');
        imgEl.className = 'w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0';
        imgEl.alt = p.title || 'Product';
        imgEl.onerror = function () {
          this.onerror = null;
          this.src = 'assets/images/logo-premium-mark.svg';
        };
        imgEl.src = sanitizeImageUrl(p.image);
        leftEl.appendChild(imgEl);

        const infoEl = document.createElement('div');
        const titleEl = document.createElement('div');
        titleEl.className = 'text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs';
        titleEl.textContent = p.title || '';
        infoEl.appendChild(titleEl);

        const priceEl = document.createElement('div');
        priceEl.className = 'text-[11px] text-slate-400 font-mono';
        priceEl.textContent = `${formatMoney(p.price)} • ${p.badge || 'Sản phẩm'}`;
        infoEl.appendChild(priceEl);

        leftEl.appendChild(infoEl);
        itemEl.appendChild(leftEl);

        const statusBadge = document.createElement('span');
        statusBadge.className = `px-2 py-0.5 rounded text-[10px] font-mono ${p.status === 'active' ? 'badge-active' : 'badge-draft'}`;
        statusBadge.textContent = p.status || 'active';
        itemEl.appendChild(statusBadge);

        recentList.appendChild(itemEl);
      });
    }
  }

  // 4. PRODUCTS CRUD TABLE & FILTERING
  async function renderProductsTable() {
    const tableBody = document.getElementById('products-table-body');
    if (!tableBody) return;

    const allProducts = await window.TTCatalogStore.getProducts(false);

    let filtered = allProducts;
    if (activeFilterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeFilterCategory);
    }
    if (activeFilterStatus !== 'all') {
      filtered = filtered.filter(p => (p.status || 'active') === activeFilterStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || (p.desc && p.desc.toLowerCase().includes(q)));
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="p-8 text-center text-slate-500 text-xs">
            <i class="fa-solid fa-box-open text-2xl mb-2 block"></i>
            Không tìm thấy sản phẩm nào khớp với bộ lọc.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(p => `
      <tr class="hover:bg-slate-900/60 border-b border-slate-800/60 transition-colors">
        <td class="p-3 text-center w-14">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" class="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800 mx-auto" onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
        </td>
        <td class="p-3">
          <div class="font-bold text-white text-xs">${escapeHtml(p.title)}</div>
          <div class="text-[11px] text-slate-400 truncate max-w-xs">${escapeHtml(p.headlineBenefit || p.desc || '')}</div>
          ${p.commercialStatus ? `<div class="text-[10px] text-slate-500 font-mono mt-0.5">Thương mại: <span class="text-slate-300 font-bold">${escapeHtml(p.commercialStatus)}</span> • ${escapeHtml(p.licenseName || 'Digital License')}</div>` : ''}
        </td>
        <td class="p-3 font-mono text-xs">
          <div class="font-bold text-[#FF5C00]">${formatMoney(p.price)}</div>
          ${p.originalPrice ? `<div class="text-[10px] text-slate-500 line-through">${formatMoney(p.originalPrice)}</div>` : ''}
        </td>
        <td class="p-3 text-xs text-slate-400">
          <span class="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono">${escapeHtml((window.TTCatalogStore && window.TTCatalogStore.CATEGORY_REGISTRY && window.TTCatalogStore.CATEGORY_REGISTRY[p.category]) ? window.TTCatalogStore.CATEGORY_REGISTRY[p.category].shortName : p.category)}</span>
        </td>
        <td class="p-3 text-center">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${p.status === 'active' ? 'badge-active' : (p.status === 'draft' ? 'badge-draft' : 'badge-archived')}">
            ${escapeHtml(p.status || 'active')}
          </span>
        </td>
        <td class="p-3 text-center">
          <div class="flex items-center justify-center gap-2">
            <button type="button" data-action="admin-edit-product" data-product-id="${escapeHtml(p.id)}" class="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors" title="Chỉnh sửa sản phẩm">
              <i class="fa-solid fa-pen-to-square text-xs"></i>
            </button>
            <button type="button" data-action="admin-delete-product" data-product-id="${escapeHtml(p.id)}" class="p-1.5 text-slate-400 hover:text-rose-400 transition-colors" title="Xóa khỏi catalog">
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Event delegation an toàn cho bảng sản phẩm Admin (Codex F07)
    if (!tableBody._hasProductTableDelegation) {
      tableBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('[data-action="admin-edit-product"]');
        if (editBtn) {
          const pId = editBtn.dataset.productId;
          if (pId) window.TTAdmin.editProduct(pId);
          return;
        }
        const deleteBtn = e.target.closest('[data-action="admin-delete-product"]');
        if (deleteBtn) {
          const pId = deleteBtn.dataset.productId;
          if (pId) window.TTAdmin.deleteProduct(pId);
          return;
        }
      });
      tableBody._hasProductTableDelegation = true;
    }
  }

  // 5. PRODUCT FORM & IMAGE UPLOADER COMPONENT
  function initProductForm() {
    const form = document.getElementById('product-crud-form');
    const btnReset = document.getElementById('btn-form-reset');

    // Image Source Switching (Upload / URL / Preset)
    const tabBtnUpload = document.getElementById('img-tab-upload');
    const tabBtnUrl = document.getElementById('img-tab-url');
    const tabBtnPreset = document.getElementById('img-tab-preset');

    const paneUpload = document.getElementById('img-pane-upload');
    const paneUrl = document.getElementById('img-pane-url');
    const panePreset = document.getElementById('img-pane-preset');

    function switchImageTab(source) {
      activeImageSource = source;
      [tabBtnUpload, tabBtnUrl, tabBtnPreset].forEach(b => {
        if (b) b.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors';
      });
      [paneUpload, paneUrl, panePreset].forEach(p => {
        if (p) p.classList.add('hidden');
      });

      if (source === 'upload') {
        if (tabBtnUpload) tabBtnUpload.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF5C00] text-white shadow-sm';
        if (paneUpload) paneUpload.classList.remove('hidden');
      } else if (source === 'url') {
        if (tabBtnUrl) tabBtnUrl.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF5C00] text-white shadow-sm';
        if (paneUrl) paneUrl.classList.remove('hidden');
      } else if (source === 'preset') {
        if (tabBtnPreset) tabBtnPreset.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF5C00] text-white shadow-sm';
        if (panePreset) panePreset.classList.remove('hidden');
        renderPresetSelectorGrid();
      }
    }

    if (tabBtnUpload) tabBtnUpload.addEventListener('click', () => switchImageTab('upload'));
    if (tabBtnUrl) tabBtnUrl.addEventListener('click', () => switchImageTab('url'));
    if (tabBtnPreset) tabBtnPreset.addEventListener('click', () => switchImageTab('preset'));

    // Drag and Drop & File Input
    const dropzone = document.getElementById('image-dropzone');
    const fileInput = document.getElementById('image-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleSelectedFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleSelectedFile(e.target.files[0]);
        }
      });
    }

    async function handleSelectedFile(file) {
      try {
        const statusEl = document.getElementById('upload-status-text');
        if (statusEl) statusEl.textContent = 'Đang tối ưu & nén ảnh...';

        const result = await window.TTImageUploader.processImageFile(file);
        currentImageDataUrl = result.dataUrl;
        updateFormImagePreview(result.dataUrl, `Tải từ máy: ${(result.sizeBytes / 1024).toFixed(0)} KB (WebP)`);
        if (statusEl) statusEl.textContent = `✓ Đã nén thành công (${result.width}x${result.height}px, ${(result.sizeBytes / 1024).toFixed(0)} KB)`;
        showToast('Đã xử lý & nén ảnh thành công!');
      } catch (err) {
        showToast(err.message, 'error');
        const statusEl = document.getElementById('upload-status-text');
        if (statusEl) statusEl.textContent = 'Kéo thả ảnh vào đây hoặc bấm để chọn tệp';
      }
    }

    // URL input preview
    const urlInput = document.getElementById('prod-image-url');
    const btnTestUrl = document.getElementById('btn-test-url');
    if (btnTestUrl && urlInput) {
      btnTestUrl.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (window.TTImageUploader.isValidImageUrl(url)) {
          currentImageDataUrl = url;
          updateFormImagePreview(url, 'Nguồn URL ngoại vi');
          showToast('Đã cập nhật ảnh từ URL!');
        } else {
          showToast('Đường dẫn URL ảnh không hợp lệ!', 'error');
        }
      });
    }

    // Form Submit
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('prod-title').value.trim();
        const category = document.getElementById('prod-category').value;
        const type = document.getElementById('prod-type').value;
        const price = parseInt(document.getElementById('prod-price').value, 10);
        const originalPrice = document.getElementById('prod-original-price').value ? parseInt(document.getElementById('prod-original-price').value, 10) : null;
        const badge = document.getElementById('prod-badge').value.trim();
        const status = document.getElementById('prod-status').value;
        const modelKey = document.getElementById('prod-model-key').value;
        const desc = document.getElementById('prod-desc').value.trim();
        const headlineBenefit = document.getElementById('prod-headline').value.trim();

        if (!title || isNaN(price)) {
          showToast('Vui lòng điền đầy đủ tên và giá sản phẩm.', 'error');
          return;
        }

        const finalImage = currentImageDataUrl || 'assets/images/product-nfc-wifi.jpg';
        const existingProd = currentEditingProductId ? window.TTCatalogStore.getProductByIdSync(currentEditingProductId) : null;

        const productData = {
          id: currentEditingProductId || ('prod-' + Date.now()),
          title,
          category,
          type,
          price,
          originalPrice,
          badge: badge || '✦ 3D Print',
          image: finalImage,
          imageSource: activeImageSource,
          modelKey: modelKey ? modelKey : (existingProd ? existingProd.modelKey : null),
          desc,
          headlineBenefit,
          status: status || 'active',
          ...(existingProd ? {
            specs: existingProd.specs,
            colors: existingProd.colors,
            materials: existingProd.materials,
            specLine: existingProd.specLine
          } : {})
        };

        try {
          await window.TTCatalogStore.upsertProduct(productData);
          showToast(currentEditingProductId ? 'Đã cập nhật sản phẩm thành công!' : 'Đã thêm sản phẩm mới vào catalog!');
          resetProductForm();
          renderProductsTable();
          loadOverviewStats();
        } catch (err) {
          showToast('Lỗi lưu sản phẩm: ' + err.message, 'error');
        }
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', resetProductForm);
    }
  }

  function updateFormImagePreview(src, label) {
    const previewImg = document.getElementById('form-img-preview');
    const labelEl = document.getElementById('form-img-label');
    if (previewImg) previewImg.src = src;
    if (labelEl && label) labelEl.textContent = label;
  }

  function renderPresetSelectorGrid() {
    const grid = document.getElementById('preset-selector-grid');
    if (!grid) return;

    const presets = window.TTArtPresets ? window.TTArtPresets.getAll() : [];
    grid.innerHTML = presets.map(p => `
      <div class="preset-art-card p-2 cursor-pointer" data-action="admin-select-preset" data-preset-id="${escapeHtml(p.id)}">
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="w-full h-20 object-cover rounded-md mb-1.5" onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
        <div class="text-[10px] font-bold text-white truncate">${escapeHtml(p.name)}</div>
        <div class="text-[9px] text-slate-400 truncate">${escapeHtml(p.badge)}</div>
      </div>
    `).join('');

    if (!grid._hasPresetGridDelegation) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('[data-action="admin-select-preset"]');
        if (card) {
          const pId = card.dataset.presetId;
          const matched = (window.TTArtPresets ? window.TTArtPresets.getAll() : []).find(x => x.id === pId);
          if (matched) {
            selectPresetImage(matched.id, matched.image, matched.name);
          }
        }
      });
      grid._hasPresetGridDelegation = true;
    }
  }

  function selectPresetImage(presetId, imageUrl, presetName) {
    currentImageDataUrl = imageUrl;
    activeImageSource = 'preset';
    updateFormImagePreview(imageUrl, `Preset: ${presetName}`);
    showToast(`Đã chọn ảnh mẫu: ${presetName}`);
  }

  async function editProduct(productId) {
    const p = await window.TTCatalogStore.getProductById(productId);
    if (!p) return;

    currentEditingProductId = p.id;
    currentImageDataUrl = p.image;
    activeImageSource = p.imageSource || 'url';

    document.getElementById('prod-title').value = p.title || '';
    document.getElementById('prod-category').value = p.category || 'Trang_Diem_Vanity';
    document.getElementById('prod-type').value = p.type || 'standard';
    document.getElementById('prod-price').value = p.price || '';
    document.getElementById('prod-original-price').value = p.originalPrice || '';
    document.getElementById('prod-badge').value = p.badge || '';
    document.getElementById('prod-status').value = p.status || 'active';
    document.getElementById('prod-model-key').value = p.modelKey || '';
    document.getElementById('prod-headline').value = p.headlineBenefit || '';
    document.getElementById('prod-desc').value = p.desc || '';

    updateFormImagePreview(p.image, `Đang dùng (${p.imageSource || 'URL'})`);

    const heading = document.getElementById('form-heading');
    if (heading) heading.textContent = `Chỉnh Sửa: ${p.title}`;

    const submitBtn = document.getElementById('btn-form-submit');
    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Cập Nhật Sản Phẩm</span>';

    // Cuộn tới form
    const formSection = document.getElementById('product-crud-form');
    if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });
  }

  async function deleteProduct(productId) {
    const p = await window.TTCatalogStore.getProductById(productId);
    if (!p) return;

    if (confirm(`Bạn có chắc chắn muốn xóa "${p.title}" khỏi catalog?`)) {
      await window.TTCatalogStore.deleteProduct(productId);
      showToast(`Đã xóa "${p.title}" thành công.`);
      renderProductsTable();
      loadOverviewStats();
    }
  }

  function resetProductForm() {
    currentEditingProductId = null;
    currentImageDataUrl = '';
    const form = document.getElementById('product-crud-form');
    if (form) form.reset();

    const heading = document.getElementById('form-heading');
    if (heading) heading.textContent = 'Thêm Sản Phẩm Mới';

    const submitBtn = document.getElementById('btn-form-submit');
    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> <span>Lưu Vào Catalog</span>';

    updateFormImagePreview('assets/images/product-nfc-wifi.jpg', 'Ảnh mặc định');
  }

  // 6. ART PRESETS GALLERY TAB
  function renderArtPresetsGallery() {
    const grid = document.getElementById('art-presets-full-gallery');
    if (!grid) return;

    const presets = window.TTArtPresets ? window.TTArtPresets.getAll() : [];
    grid.innerHTML = presets.map(p => `
      <div class="admin-card p-4 space-y-3">
        <div class="relative rounded-xl overflow-hidden aspect-square bg-slate-950 border border-slate-800">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.alt)}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
          <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-white/10">
            ${escapeHtml(p.badge)}
          </span>
        </div>
        <div>
          <h4 class="text-xs font-bold text-white">${escapeHtml(p.name)}</h4>
          <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">${escapeHtml(p.description)}</p>
        </div>
        <button type="button" data-action="admin-apply-preset" data-preset-id="${escapeHtml(p.id)}" class="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-[#FF5C00] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
          <i class="fa-solid fa-image"></i>
          <span>Gán Vào Form Sản Phẩm</span>
        </button>
      </div>
    `).join('');

    if (!grid._hasGalleryDelegation) {
      grid.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="admin-apply-preset"]');
        if (btn) {
          const pId = btn.dataset.presetId;
          const matched = (window.TTArtPresets ? window.TTArtPresets.getAll() : []).find(x => x.id === pId);
          if (matched) {
            applyPresetToCurrentForm(matched.id, matched.image, matched.name);
          }
        }
      });
      grid._hasGalleryDelegation = true;
    }
  }

  function applyPresetToCurrentForm(presetId, imageUrl, presetName) {
    selectPresetImage(presetId, imageUrl, presetName);
    // Chuyển sang tab sản phẩm
    const prodTabLink = document.querySelector('.sidebar-link[data-tab-target="products"]');
    if (prodTabLink) prodTabLink.click();
    showToast(`Đã gán ảnh "${presetName}" vào Form soạn thảo!`);
  }

  // 7. ORDER REQUESTS (DRAFTS) TAB - DOM Safe (Codex R02, R03)
  function renderOrdersTable() {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;

    const engineOrders = (window.TTOrderEngine && typeof window.TTOrderEngine.getAllOrdersAdmin === 'function')
      ? window.TTOrderEngine.getAllOrdersAdmin()
      : null;
    const checkoutOrders = (window.TTCheckout && typeof window.TTCheckout.getDraftOrders === 'function')
      ? window.TTCheckout.getDraftOrders()
      : [];

    const orders = engineOrders || checkoutOrders;

    if (!Array.isArray(orders) || orders.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="p-8 text-center text-slate-500 text-xs">
            <i class="fa-solid fa-inbox text-2xl mb-2 block"></i>
            Chưa có yêu cầu đặt hàng nào trong hệ thống.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = '';
    orders.forEach(ord => {
      const itemCount = (ord.items || []).reduce((acc, i) => acc + (i.qty || 1), 0);
      const cleanPhone = (ord.customer?.phone || '').replace(/\D/g, '');
      const ordId = ord.orderId || ord.clientRequestId || 'TT3D-ORDER';
      const statusCfg = (window.TTOrderEngine && window.TTOrderEngine.STATUS_CONFIG && window.TTOrderEngine.STATUS_CONFIG[ord.status]) || {
        label: ord.status || 'Đã nhận yêu cầu',
        badgeClass: 'bg-slate-800 text-slate-300'
      };

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-900/60 border-b border-slate-800/60 transition-colors';

      // 1. Order ID + Demo badge
      const tdId = document.createElement('td');
      tdId.className = 'p-3 font-mono text-xs font-bold text-[#FF5C00]';
      tdId.textContent = ordId;
      if (ord.isDemo) {
        const demoTag = document.createElement('span');
        demoTag.className = 'block text-[9px] font-mono text-slate-500 font-normal mt-0.5';
        demoTag.textContent = '[Minh họa]';
        tdId.appendChild(demoTag);
      }
      tr.appendChild(tdId);

      // 2. Customer Name & Phone
      const tdCust = document.createElement('td');
      tdCust.className = 'p-3';
      const nameDiv = document.createElement('div');
      nameDiv.className = 'font-bold text-white text-xs';
      nameDiv.textContent = ord.customer?.name || 'Khách vãng lai';
      const phoneDiv = document.createElement('div');
      phoneDiv.className = 'text-[11px] text-slate-400 font-mono';
      phoneDiv.textContent = ord.customer?.phone || '';
      tdCust.append(nameDiv, phoneDiv);
      tr.appendChild(tdCust);

      // 3. Items list
      const tdItems = document.createElement('td');
      tdItems.className = 'p-3 text-xs text-slate-300';
      const countDiv = document.createElement('div');
      countDiv.textContent = `${itemCount} món`;
      const listDiv = document.createElement('div');
      listDiv.className = 'text-[10px] text-slate-400 font-mono truncate max-w-xs';
      listDiv.textContent = (ord.items || []).map(i => i.title + (i.customText ? ` [Khắc: ${i.customText}]` : '')).join(', ');
      tdItems.append(countDiv, listDiv);
      tr.appendChild(tdItems);

      // 4. Total Amount
      const tdTotal = document.createElement('td');
      tdTotal.className = 'p-3 font-mono font-bold text-xs text-emerald-400';
      tdTotal.textContent = formatMoney(ord.totals?.finalTotal || ord.totals?.payableTotal || 0);
      tr.appendChild(tdTotal);

      // 5. Real Milestone Status
      const tdStatus = document.createElement('td');
      tdStatus.className = 'p-3 text-center';
      const statusBadge = document.createElement('span');
      statusBadge.className = `px-2 py-0.5 rounded-full text-[10px] font-mono border ${statusCfg.badgeClass || 'bg-slate-800 text-slate-300'}`;
      statusBadge.textContent = statusCfg.label;
      tdStatus.appendChild(statusBadge);
      tr.appendChild(tdStatus);

      // 6. ETA
      const tdEta = document.createElement('td');
      tdEta.className = 'p-3 font-mono text-[11px] text-slate-300 text-center';
      tdEta.textContent = ord.etaDate || 'Chờ xếp lịch';
      tr.appendChild(tdEta);

      // 7. Actions
      const tdActions = document.createElement('td');
      tdActions.className = 'p-3 text-center';
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'flex items-center justify-center gap-1.5';

      // Update status button
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.dataset.action = 'admin-edit-order-status';
      editBtn.dataset.orderId = ordId;
      editBtn.className = 'px-2 py-1 rounded bg-[#FF5C00]/15 hover:bg-[#FF5C00] text-[#FF5C00] hover:text-black font-semibold text-[11px] transition-all flex items-center gap-1';
      editBtn.title = 'Cập nhật tiến độ & ETA';
      editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square text-[10px]"></i><span>Cập nhật</span>';
      actionsDiv.appendChild(editBtn);

      // Copy Tracking Link
      const copyLinkBtn = document.createElement('button');
      copyLinkBtn.type = 'button';
      copyLinkBtn.dataset.action = 'admin-copy-track-link';
      copyLinkBtn.dataset.orderId = ordId;
      copyLinkBtn.dataset.token = ord.token || '';
      copyLinkBtn.className = 'p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors';
      copyLinkBtn.title = 'Sao chép link tra cứu gửi khách';
      copyLinkBtn.innerHTML = '<i class="fa-solid fa-link text-xs"></i>';
      actionsDiv.appendChild(copyLinkBtn);

      // Zalo link
      if (cleanPhone) {
        const zaloLink = document.createElement('a');
        zaloLink.href = `https://zalo.me/${cleanPhone}`;
        zaloLink.target = '_blank';
        zaloLink.rel = 'noopener noreferrer';
        zaloLink.className = 'p-1.5 rounded hover:bg-slate-800 text-cyan-400 hover:text-white transition-colors';
        zaloLink.title = 'Mở Zalo khách';
        zaloLink.innerHTML = '<i class="fa-solid fa-comment-dots text-xs"></i>';
        actionsDiv.appendChild(zaloLink);
      }

      // View detail
      const viewBtn = document.createElement('button');
      viewBtn.type = 'button';
      viewBtn.dataset.action = 'admin-view-order';
      viewBtn.dataset.orderId = ordId;
      viewBtn.className = 'p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors';
      viewBtn.title = 'Xem chi tiết';
      viewBtn.innerHTML = '<i class="fa-solid fa-eye text-xs"></i>';
      actionsDiv.appendChild(viewBtn);

      tdActions.appendChild(actionsDiv);
      tr.appendChild(tdActions);

      tableBody.appendChild(tr);
    });

    if (!tableBody._hasOrdersDelegation) {
      tableBody.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('[data-action="admin-view-order"]');
        if (viewBtn) {
          const ordId = viewBtn.dataset.orderId;
          if (ordId) viewOrderDetail(ordId);
          return;
        }

        const editBtn = e.target.closest('[data-action="admin-edit-order-status"]');
        if (editBtn) {
          const ordId = editBtn.dataset.orderId;
          if (ordId) openAdminOrderUpdateModal(ordId);
          return;
        }

        const copyBtn = e.target.closest('[data-action="admin-copy-track-link"]');
        if (copyBtn) {
          const ordId = copyBtn.dataset.orderId;
          const token = copyBtn.dataset.token;
          const origin = window.location.origin + window.location.pathname.replace(/admin\.html.*$/, 'index.html');
          const trackingUrl = `${origin}#tracking?id=${encodeURIComponent(ordId)}${token ? '&token=' + encodeURIComponent(token) : ''}`;
          
          if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(trackingUrl).then(() => {
              showToast(`Đã sao chép link tra cứu cho đơn ${ordId}! Gửi link này cho khách.`);
            }).catch(() => {
              prompt('Sao chép link tra cứu:', trackingUrl);
            });
          } else {
            prompt('Sao chép link tra cứu:', trackingUrl);
          }
          return;
        }
      });
      tableBody._hasOrdersDelegation = true;
    }
  }

  function openAdminOrderUpdateModal(orderId) {
    const orders = (window.TTOrderEngine && typeof window.TTOrderEngine.getAllOrdersAdmin === 'function')
      ? window.TTOrderEngine.getAllOrdersAdmin()
      : [];
    const ord = orders.find(o => o.orderId === orderId || o.clientRequestId === orderId);
    if (!ord) {
      showToast('Không tìm thấy đơn hàng cần sửa!', 'error');
      return;
    }

    const modal = document.getElementById('admin-order-modal');
    if (!modal) {
      // Fallback simple prompt
      const newStatus = prompt(`Cập nhật trạng thái cho ${orderId} (request_received, confirmed, in_production, quality_check, shipped, delivered, awaiting_customer):`, ord.status);
      if (newStatus && window.TTOrderEngine) {
        window.TTOrderEngine.updateOrderStatus(orderId, { status: newStatus });
        showToast(`Đã cập nhật trạng thái đơn ${orderId}!`);
        renderOrdersTable();
      }
      return;
    }

    // Populate modal fields
    const idEl = document.getElementById('admin-modal-order-id');
    const statusSel = document.getElementById('admin-modal-status-select');
    const etaInput = document.getElementById('admin-modal-eta-input');
    const carrierSel = document.getElementById('admin-modal-carrier-select');
    const codeInput = document.getElementById('admin-modal-carrier-code');
    const alertInput = document.getElementById('admin-modal-alert-input');
    const publicNoteInput = document.getElementById('admin-modal-public-note');
    const privateNoteInput = document.getElementById('admin-modal-private-note');
    const historyList = document.getElementById('admin-modal-history-list');

    if (idEl) idEl.textContent = ord.orderId;
    if (statusSel) statusSel.value = ord.status || 'request_received';
    if (etaInput) etaInput.value = ord.etaDate || '';
    if (carrierSel) carrierSel.value = ord.carrier?.name || '';
    if (codeInput) codeInput.value = ord.carrier?.trackingCode || '';
    if (alertInput) alertInput.value = ord.customerAlert?.message || '';
    if (publicNoteInput) publicNoteInput.value = ord.publicNote || '';
    if (privateNoteInput) privateNoteInput.value = ord.privateNote || '';

    // Render history
    if (historyList) {
      historyList.innerHTML = (ord.history || []).map(h => `
        <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
          <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span class="text-[#FF5C00] font-bold">${h.status}</span>
            <span>${new Date(h.timestamp).toLocaleString('vi-VN')}</span>
          </div>
          <p class="text-slate-200 text-xs">${h.note}</p>
        </div>
      `).join('');
    }

    modal.dataset.currentOrderId = ord.orderId;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function closeAdminOrderModal() {
    const modal = document.getElementById('admin-order-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function saveAdminOrderUpdate() {
    const modal = document.getElementById('admin-order-modal');
    if (!modal) return;
    const orderId = modal.dataset.currentOrderId;
    if (!orderId) return;

    const statusSel = document.getElementById('admin-modal-status-select');
    const etaInput = document.getElementById('admin-modal-eta-input');
    const carrierSel = document.getElementById('admin-modal-carrier-select');
    const codeInput = document.getElementById('admin-modal-carrier-code');
    const alertInput = document.getElementById('admin-modal-alert-input');
    const publicNoteInput = document.getElementById('admin-modal-public-note');
    const privateNoteInput = document.getElementById('admin-modal-private-note');

    const updatePayload = {
      status: statusSel ? statusSel.value : undefined,
      etaDate: etaInput ? etaInput.value.trim() : undefined,
      publicNote: publicNoteInput ? publicNoteInput.value.trim() : undefined,
      privateNote: privateNoteInput ? privateNoteInput.value.trim() : undefined
    };

    const carrierName = carrierSel ? carrierSel.value.trim() : '';
    const carrierCode = codeInput ? codeInput.value.trim() : '';
    if (carrierName || carrierCode) {
      updatePayload.carrier = {
        name: carrierName || 'Bưu chính',
        trackingCode: carrierCode,
        trackingUrl: carrierName.includes('GHTK')
          ? `https://i.ghtk.vn/${carrierCode}`
          : (carrierName.includes('Viettel') ? `https://viettelpost.com.vn/tra-cuu-hanh-trinh-don-hang?code=${carrierCode}` : '')
      };
    } else {
      updatePayload.carrier = null;
    }

    const alertMsg = alertInput ? alertInput.value.trim() : '';
    if (alertMsg) {
      updatePayload.customerAlert = {
        type: 'info',
        message: alertMsg
      };
    } else {
      updatePayload.customerAlert = null;
    }

    if (window.TTOrderEngine && typeof window.TTOrderEngine.updateOrderStatus === 'function') {
      window.TTOrderEngine.updateOrderStatus(orderId, updatePayload, 'KTV Quản Trị');
      showToast(`Đã lưu tiến độ mới cho đơn ${orderId}!`);
      closeAdminOrderModal();
      renderOrdersTable();
    }
  }

  window.closeAdminOrderModal = closeAdminOrderModal;
  window.saveAdminOrderUpdate = saveAdminOrderUpdate;

  function viewOrderDetail(orderId) {
    const orders = (window.TTOrderEngine && typeof window.TTOrderEngine.getAllOrdersAdmin === 'function')
      ? window.TTOrderEngine.getAllOrdersAdmin()
      : ((window.TTCheckout && typeof window.TTCheckout.getDraftOrders === 'function') ? window.TTCheckout.getDraftOrders() : []);
    const ord = orders.find(o => o.orderId === orderId || o.clientRequestId === orderId);
    if (!ord) return;

    alert(
      `CHI TIẾT ĐƠN HÀNG: ${ord.orderId || ord.clientRequestId}\n` +
      `Trạng thái: ${ord.status}\n` +
      `Thời gian: ${new Date(ord.createdAt).toLocaleString('vi-VN')}\n` +
      `Khách: ${ord.customer?.name} - SĐT: ${ord.customer?.phone}\n` +
      `Địa chỉ: ${ord.customer?.address}\n` +
      `Ghi chú: ${ord.customer?.note || 'Không có'}\n` +
      `Tổng tiền: ${formatMoney(ord.totals?.finalTotal || ord.totals?.payableTotal || 0)}\n` +
      `Dự kiến (ETA): ${ord.etaDate || 'Chưa có'}`
    );
  }

  // 8. EXPORT / IMPORT PRODUCTS.JSON
  function exportProductsJson() {
    const products = window.TTCatalogStore.getProductsSync(false);
    const jsonStr = JSON.stringify(products, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống products.json. Hãy cập nhật tệp này lên hosting/GitHub để áp dụng cho khách!');
  }

  function importProductsJson(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed)) {
          if (confirm(`Tệp chứa ${parsed.length} sản phẩm. Bạn có muốn thay thế catalog hiện tại không?`)) {
            window.TTCatalogStore.saveProducts(parsed);
            showToast(`Đã nhập thành công ${parsed.length} sản phẩm!`);
            renderProductsTable();
            loadOverviewStats();
          }
        } else {
          showToast('Tệp JSON không hợp lệ (phải là danh sách sản phẩm)!', 'error');
        }
      } catch (err) {
        showToast('Lỗi đọc cú pháp tệp JSON: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  // Khởi động toàn bộ
  async function loadAllDashboardData() {
    await window.TTCatalogStore.init();
    loadOverviewStats();
    renderProductsTable();
  }

  function init() {
    initAuth();
    initTabNavigation();
    initProductForm();

    // Export button
    const btnExport = document.getElementById('btn-export-quick');
    if (btnExport) btnExport.addEventListener('click', exportProductsJson);

    // Import file picker
    const fileImport = document.getElementById('input-import-json');
    if (fileImport) {
      fileImport.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importProductsJson(e.target.files[0]);
        }
      });
    }

    // Filter Listeners
    const searchInput = document.getElementById('prod-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderProductsTable();
      });
    }

    const filterCategory = document.getElementById('filter-category-select');
    if (filterCategory) {
      filterCategory.addEventListener('change', (e) => {
        activeFilterCategory = e.target.value;
        renderProductsTable();
      });
    }

    const filterStatus = document.getElementById('filter-status-select');
    if (filterStatus) {
      filterStatus.addEventListener('change', (e) => {
        activeFilterStatus = e.target.value;
        renderProductsTable();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export Global API
  window.TTAdmin = {
    editProduct,
    deleteProduct,
    selectPresetImage,
    applyPresetToCurrentForm,
    viewOrderDetail,
    renderOrdersTable,
    loadOverviewStats,
    exportProductsJson,
    showToast
  };

})(window);
