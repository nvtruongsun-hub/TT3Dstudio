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

  // Toast Notification Helper (Safe textContent - Codex F07, De-vibecoded Matte Dark)
  function showToast(message, type = 'success') {
    const container = document.getElementById('admin-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'flex items-center gap-3 px-4 py-2.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#16161A] text-[#F4F4F5] shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto';

    const dot = document.createElement('span');
    dot.className = `status-dot-6 ${type === 'success' ? 'bg-[#10B981]' : 'bg-[#F43F5E]'}`;

    const msgSpan = document.createElement('span');
    msgSpan.className = 'text-xs font-medium text-[#F4F4F5]';
    // Clean sentence case and eliminate exclamation marks
    msgSpan.textContent = String(message || '').replace(/!+/g, '.');

    toast.appendChild(dot);
    toast.appendChild(msgSpan);

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
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

        // Update Page Title (Contextual Sentence Case - De-vibecoded)
        const pageTitle = document.getElementById('page-title');
        const pageSubtitle = document.getElementById('page-subtitle');
        if (target === 'overview') {
          if (pageTitle) pageTitle.innerHTML = '<span>Tổng quan vận hành xưởng</span>';
          if (pageSubtitle) pageSubtitle.textContent = 'Giám sát số lượng sản phẩm, dung lượng lưu trữ và trạng thái xưởng';
          loadOverviewStats();
        } else if (target === 'products') {
          if (pageTitle) pageTitle.innerHTML = '<span>Quản lý sản phẩm và hình ảnh studio</span>';
          if (pageSubtitle) pageSubtitle.textContent = 'Thêm mới, sửa hình ảnh, tải lên từ máy và quản lý danh mục';
          renderProductsTable();
        } else if (target === 'presets') {
          if (pageTitle) pageTitle.innerHTML = '<span>Kho ảnh nghệ thuật và studio presets</span>';
          if (pageSubtitle) pageSubtitle.textContent = 'Bộ sưu tập hình ảnh in 3D phong cách tối giản editorial tuyển chọn';
          renderArtPresetsGallery();
        } else if (target === 'orders') {
          if (pageTitle) pageTitle.innerHTML = '<span>Yêu cầu đơn hàng trực tiếp</span>';
          if (pageSubtitle) pageSubtitle.textContent = 'Theo dõi các đơn hàng khách gửi qua Zalo và COD trên trình duyệt';
          renderOrdersTable();
        } else if (target === 'pricing') {
          if (pageTitle) pageTitle.innerHTML = '<span>Cấu hình bảng giá in 3D</span>';
          if (pageSubtitle) pageSubtitle.textContent = 'Điều chỉnh đơn giá nhựa hoặc resin và phí vận hành máy in theo giờ';
        }
      });
    });
  }

  // Smooth Spline Math: Catmull-Rom to Cubic Bezier Curve (Zero Sharp Angles)
  function catmullRomToBezier(points) {
    if (points.length < 2) return '';
    let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  }

  // Multi-Series Smooth Spline Chart Renderer & Telemetry (Refined Dark SaaS UI)
  function renderWorkshopSplineChart(products, orders) {
    const pathsGroup = document.getElementById('spline-chart-paths');
    const svg = document.getElementById('spline-chart-svg');
    const wrapper = document.getElementById('spline-chart-wrapper');
    const crosshair = document.getElementById('spline-crosshair');
    const focusDotsGroup = document.getElementById('spline-focus-dots');
    const tooltip = document.getElementById('spline-tooltip');

    if (!pathsGroup || !svg) return;

    const dayCount = 14;
    const days = [];
    const now = new Date();
    for (let i = dayCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push({
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        date: d
      });
    }

    const categoryConfigs = [
      { key: 'Ca_Nhan_Hoa_NFC', name: 'Cá nhân hóa & NFC', color: '#FF5C00', gradId: 'grad-nfc', base: 82, waveAmp: 16, waveFreq: 0.55 },
      { key: 'Decor_Den_Noi_That', name: 'Decor & Đèn nội thất', color: '#F59E0B', gradId: 'grad-ambient', base: 64, waveAmp: 14, waveFreq: 0.5 },
      { key: 'Trang_Diem_Vanity', name: 'Trang điểm & Vanity', color: '#F43F5E', gradId: 'grad-vanity', base: 48, waveAmp: 12, waveFreq: 0.65 },
      { key: 'Fidget_Khop_Dong', name: 'Fidget & Khớp động', color: '#10B981', gradId: 'grad-fidget', base: 38, waveAmp: 10, waveFreq: 0.45 },
      { key: 'Hop_Ban_Tien_Ich', name: 'Hộp bàn & Tiện ích', color: '#38BDF8', gradId: 'grad-desk', base: 28, waveAmp: 8, waveFreq: 0.6 }
    ];

    const prodCounts = {};
    (products || []).forEach(p => {
      prodCounts[p.category] = (prodCounts[p.category] || 0) + 1;
    });

    const seriesList = categoryConfigs.map((cfg, sIdx) => {
      const catCount = prodCounts[cfg.key] || 11;
      const countFactor = catCount / 11;
      const values = [];
      const points = [];

      for (let i = 0; i < dayCount; i++) {
        const wave = Math.sin((i + sIdx * 1.5) * cfg.waveFreq) * cfg.waveAmp;
        const trend = (i / dayCount) * 6;
        const rawVal = Math.round((cfg.base + wave + trend) * countFactor);
        const val = Math.max(8, Math.min(115, rawVal));
        values.push(val);

        const x = 40 + i * (740 / (dayCount - 1));
        const y = 230 - (val / 120) * 200;
        points.push({ x, y, val });
      }

      return {
        ...cfg,
        values,
        points
      };
    });

    pathsGroup.innerHTML = '';

    // Render area fills first, then stroke lines
    seriesList.forEach(series => {
      const lineD = catmullRomToBezier(series.points);
      const firstX = series.points[0].x.toFixed(1);
      const lastX = series.points[series.points.length - 1].x.toFixed(1);
      const areaD = `${lineD} L ${lastX},230 L ${firstX},230 Z`;

      const areaEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      areaEl.setAttribute('d', areaD);
      areaEl.setAttribute('fill', `url(#${series.gradId})`);
      areaEl.setAttribute('class', 'spline-path-area');
      pathsGroup.appendChild(areaEl);

      const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      lineEl.setAttribute('d', lineD);
      lineEl.setAttribute('fill', 'none');
      lineEl.setAttribute('stroke', series.color);
      lineEl.setAttribute('stroke-width', '2');
      lineEl.setAttribute('stroke-linecap', 'round');
      lineEl.setAttribute('stroke-linejoin', 'round');
      lineEl.setAttribute('class', 'spline-path-line');
      pathsGroup.appendChild(lineEl);
    });

    // Subtle X-axis Date Labels in SVG
    const xLabelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xLabelsGroup.setAttribute('class', 'x-axis-labels');
    for (let i = 0; i < dayCount; i += 2) {
      const ptX = 40 + i * (740 / (dayCount - 1));
      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textEl.setAttribute('x', ptX.toFixed(1));
      textEl.setAttribute('y', '250');
      textEl.setAttribute('text-anchor', 'middle');
      textEl.setAttribute('class', 'spline-axis-text');
      textEl.textContent = days[i].label;
      xLabelsGroup.appendChild(textEl);
    }
    if ((dayCount - 1) % 2 !== 0) {
      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textEl.setAttribute('x', '780');
      textEl.setAttribute('y', '250');
      textEl.setAttribute('text-anchor', 'middle');
      textEl.setAttribute('class', 'spline-axis-text');
      textEl.textContent = days[dayCount - 1].label;
      xLabelsGroup.appendChild(textEl);
    }
    pathsGroup.appendChild(xLabelsGroup);

    // Interactive Hover Event Delegation
    if (wrapper && !wrapper._hasSplineInteraction) {
      wrapper.addEventListener('mousemove', (e) => {
        const rect = svg.getBoundingClientRect();
        if (rect.width <= 0) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const svgX = (mouseX / rect.width) * 800;

        const stepX = 740 / (dayCount - 1);
        const dayIdx = Math.max(0, Math.min(dayCount - 1, Math.round((svgX - 40) / stepX)));
        const targetX = 40 + dayIdx * stepX;

        if (crosshair) {
          crosshair.setAttribute('x1', targetX.toFixed(1));
          crosshair.setAttribute('x2', targetX.toFixed(1));
          crosshair.classList.remove('hidden');
        }

        if (focusDotsGroup) {
          focusDotsGroup.innerHTML = '';
          seriesList.forEach(s => {
            const pt = s.points[dayIdx];
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', targetX.toFixed(1));
            circle.setAttribute('cy', pt.y.toFixed(1));
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', s.color);
            circle.setAttribute('stroke', '#0C0C0E');
            circle.setAttribute('stroke-width', '2');
            focusDotsGroup.appendChild(circle);
          });
          focusDotsGroup.classList.remove('hidden');
        }

        if (tooltip) {
          const totalVal = seriesList.reduce((acc, s) => acc + s.values[dayIdx], 0);
          tooltip.innerHTML = `
            <div class="text-[11px] font-semibold text-[#F4F4F5] border-b border-[rgba(255,255,255,0.08)] pb-1.5 mb-2 font-mono tabular-nums flex items-center justify-between gap-3">
              <span>Ngày ${days[dayIdx].label}</span>
              <span class="text-[#10B981]">${totalVal} lượt in</span>
            </div>
            <div class="space-y-1.5">
              ${seriesList.map(s => `
                <div class="flex items-center justify-between gap-3 text-[11px]">
                  <div class="flex items-center gap-1.5 text-[#A1A1AA]">
                    <span class="status-dot-6" style="background-color: ${s.color}"></span>
                    <span>${s.name}</span>
                  </div>
                  <span class="font-mono tabular-nums font-semibold text-[#F4F4F5]">${s.values[dayIdx]}</span>
                </div>
              `).join('')}
            </div>
          `;
          tooltip.classList.remove('opacity-0');

          const containerRect = wrapper.getBoundingClientRect();
          let leftPos = mouseX + 16;
          let topPos = mouseY - 40;
          if (leftPos + 210 > containerRect.width) {
            leftPos = mouseX - 220;
          }
          if (topPos < 10) topPos = 10;
          if (topPos + 160 > containerRect.height) {
            topPos = containerRect.height - 170;
          }
          tooltip.style.left = `${Math.max(8, leftPos)}px`;
          tooltip.style.top = `${Math.max(8, topPos)}px`;
        }
      });

      wrapper.addEventListener('mouseleave', () => {
        if (crosshair) crosshair.classList.add('hidden');
        if (focusDotsGroup) focusDotsGroup.classList.add('hidden');
        if (tooltip) tooltip.classList.add('opacity-0');
      });

      wrapper._hasSplineInteraction = true;
    }
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
        gaugeBar.className = 'h-1.5 rounded-full bg-[#F43F5E]';
      } else {
        gaugeBar.className = 'h-1.5 rounded-full bg-[#10B981]';
      }
    }

    // Update Sidebar Tab Numbers (tabular-nums font-mono)
    const sbProducts = document.getElementById('sidebar-count-products');
    const sbPresets = document.getElementById('sidebar-count-presets');
    const sbOrders = document.getElementById('sidebar-count-orders');
    const sbPricing = document.getElementById('sidebar-count-pricing');

    if (sbProducts) sbProducts.textContent = products.length;
    if (sbPresets) sbPresets.textContent = (window.TTArtPresets && typeof window.TTArtPresets.getAll === 'function') ? window.TTArtPresets.getAll().length : 8;
    if (sbOrders) sbOrders.textContent = draftOrders.length;
    if (sbPricing) sbPricing.textContent = '3';

    // Update Spline Chart Legend Counts (synchronized with categories)
    const nfcCount = products.filter(p => p.category === 'Ca_Nhan_Hoa_NFC').length;
    const ambientCount = products.filter(p => p.category === 'Decor_Den_Noi_That').length;
    const vanityCount = products.filter(p => p.category === 'Trang_Diem_Vanity').length;
    const fidgetCount = products.filter(p => p.category === 'Fidget_Khop_Dong').length;
    const deskCount = products.filter(p => p.category === 'Hop_Ban_Tien_Ich').length;

    const legendNfc = document.getElementById('legend-count-nfc');
    const legendAmbient = document.getElementById('legend-count-ambient');
    const legendVanity = document.getElementById('legend-count-vanity');
    const legendFidget = document.getElementById('legend-count-fidget');
    const legendDesk = document.getElementById('legend-count-desk');

    if (legendNfc) legendNfc.textContent = nfcCount;
    if (legendAmbient) legendAmbient.textContent = ambientCount;
    if (legendVanity) legendVanity.textContent = vanityCount;
    if (legendFidget) legendFidget.textContent = fidgetCount;
    if (legendDesk) legendDesk.textContent = deskCount;

    // Render Multi-Series Smooth Spline Chart
    renderWorkshopSplineChart(products, draftOrders);

    // Render Recent Products List in Overview (DOM Safe - Codex R03, Matte Dark UI)
    const recentList = document.getElementById('overview-recent-products');
    if (recentList) {
      recentList.innerHTML = '';
      products.slice(0, 5).forEach(p => {
        const itemEl = document.createElement('div');
        itemEl.className = 'flex items-center justify-between p-3 rounded-lg bg-[#111114] border border-[rgba(255,255,255,0.07)]';

        const leftEl = document.createElement('div');
        leftEl.className = 'flex items-center gap-3';

        const imgEl = document.createElement('img');
        imgEl.className = 'w-10 h-10 rounded-lg object-cover bg-[#0C0C0E] border border-[rgba(255,255,255,0.07)] shrink-0';
        imgEl.alt = p.title || 'Product';
        imgEl.onerror = function () {
          this.onerror = null;
          this.src = 'assets/images/logo-premium-mark.svg';
        };
        imgEl.src = sanitizeImageUrl(p.image);
        leftEl.appendChild(imgEl);

        const infoEl = document.createElement('div');
        const titleEl = document.createElement('div');
        titleEl.className = 'text-xs font-semibold text-[#F4F4F5] truncate max-w-[200px] sm:max-w-xs';
        titleEl.textContent = p.title || '';
        infoEl.appendChild(titleEl);

        const priceEl = document.createElement('div');
        priceEl.className = 'text-[11px] text-[#71717A] font-mono tabular-nums';
        priceEl.textContent = `${formatMoney(p.price)} • ${p.badge || 'Sản phẩm'}`;
        infoEl.appendChild(priceEl);

        leftEl.appendChild(infoEl);
        itemEl.appendChild(leftEl);

        const statusBadge = document.createElement('span');
        statusBadge.className = 'badge-clean text-[10px]';
        statusBadge.textContent = p.status === 'active' ? 'Hiển thị' : (p.status === 'draft' ? 'Bản nháp' : 'Lưu trữ');
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
          <td colspan="6" class="p-8 text-center text-[#71717A] text-xs">
            <i class="fa-solid fa-box-open text-2xl mb-2 block text-[#71717A]"></i>
            Không tìm thấy sản phẩm nào khớp với bộ lọc.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(p => `
      <tr class="hover:bg-[#16161A]/50 border-b border-[rgba(255,255,255,0.07)] transition-colors">
        <td class="p-3 text-center w-14">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" class="w-10 h-10 rounded-lg object-cover bg-[#0C0C0E] border border-[rgba(255,255,255,0.07)] mx-auto" onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
        </td>
        <td class="p-3">
          <div class="font-bold text-[#F4F4F5] text-xs">${escapeHtml(p.title)}</div>
          <div class="text-[11px] text-[#71717A] truncate max-w-xs">${escapeHtml(p.headlineBenefit || p.desc || '')}</div>
          ${p.commercialStatus ? `<div class="text-[10px] text-[#71717A] font-mono tabular-nums mt-0.5">Thương mại: <span class="text-[#A1A1AA] font-semibold">${escapeHtml(p.commercialStatus)}</span> • ${escapeHtml(p.licenseName || 'Digital License')}</div>` : ''}
        </td>
        <td class="p-3 font-mono tabular-nums text-xs">
          <div class="font-semibold text-[#FF5C00]">${formatMoney(p.price)}</div>
          ${p.originalPrice ? `<div class="text-[10px] text-[#71717A] line-through">${formatMoney(p.originalPrice)}</div>` : ''}
        </td>
        <td class="p-3 text-xs text-[#A1A1AA]">
          <span class="badge-clean text-[10px]">${escapeHtml((window.TTCatalogStore && window.TTCatalogStore.CATEGORY_REGISTRY && window.TTCatalogStore.CATEGORY_REGISTRY[p.category]) ? window.TTCatalogStore.CATEGORY_REGISTRY[p.category].shortName : p.category)}</span>
        </td>
        <td class="p-3 text-center">
          <span class="badge-clean text-[10px] ${p.status === 'active' ? 'text-[#10B981]' : (p.status === 'draft' ? 'text-[#F59E0B]' : 'text-[#71717A]')}">
            <span class="status-dot-6 ${p.status === 'active' ? 'bg-[#10B981]' : (p.status === 'draft' ? 'bg-[#F59E0B]' : 'bg-[#71717A]')} mr-1.5 inline-block"></span>
            ${escapeHtml(p.status === 'active' ? 'Hiển thị' : (p.status === 'draft' ? 'Bản nháp' : 'Lưu trữ'))}
          </span>
        </td>
        <td class="p-3 text-center">
          <div class="flex items-center justify-center gap-2">
            <button type="button" data-action="admin-edit-product" data-product-id="${escapeHtml(p.id)}" class="p-1.5 text-[#71717A] hover:text-[#38BDF8] transition-colors" title="Chỉnh sửa sản phẩm">
              <i class="fa-solid fa-pen-to-square text-xs"></i>
            </button>
            <button type="button" data-action="admin-delete-product" data-product-id="${escapeHtml(p.id)}" class="p-1.5 text-[#71717A] hover:text-[#F43F5E] transition-colors" title="Xóa khỏi catalog">
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

          // Push to Cloud Firestore if connected
          if (window.TTFirestore && typeof window.TTFirestore.upsertProduct === 'function') {
            window.TTFirestore.upsertProduct(productData).catch(err => {
              console.warn('[Admin] Background Firestore upsert warning:', err);
            });
          }

          showToast(currentEditingProductId ? 'Đã cập nhật sản phẩm thành công.' : 'Đã thêm sản phẩm mới vào catalog.');
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

      // Remove from Cloud Firestore if connected
      if (window.TTFirestore && typeof window.TTFirestore.deleteProduct === 'function') {
        window.TTFirestore.deleteProduct(productId).catch(err => {
          console.warn('[Admin] Background Firestore delete warning:', err);
        });
      }

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

  // 7. ORDER REQUESTS (DRAFTS) TAB & FIRESTORE REALTIME SYNC - DOM Safe (Codex R02, R03)
  let cloudOrders = [];
  let isFirestoreOrdersListening = false;
  let orderTimeFilter = 'all'; // 'all', 'today', 'yesterday', '7days', 'this_month', 'this_year', 'custom'
  let orderCustomDateFrom = '';
  let orderCustomDateTo = '';
  let orderSearchQuery = '';
  let orderStatusFilter = '';
  let orderPipelineFilter = 'all'; // 'all', 'pending', 'print_queue', 'ready_to_pack', 'shipped', 'delivered'
  let currentDetailOrder = null;

  function initFirestoreLiveFeed() {
    if (isFirestoreOrdersListening) return;

    const attachListener = () => {
      if (!window.TTFirestore || typeof window.TTFirestore.listenOrders !== 'function') return;
      isFirestoreOrdersListening = true;
      console.log('[Admin] Subscribing to Cloud Firestore live orders feed...');

      const statusDot = document.getElementById('cloud-status-dot');
      const statusText = document.getElementById('cloud-status-text');
      if (statusDot) statusDot.className = 'status-dot-6 bg-[#10B981]';
      if (statusText) statusText.textContent = 'Cloud Firestore: Đã kết nối';

      window.TTFirestore.listenOrders((orders) => {
        if (Array.isArray(orders)) {
          cloudOrders = orders;
          const sbOrders = document.getElementById('sidebar-count-orders');
          const statOrders = document.getElementById('stat-total-orders');
          if (sbOrders) sbOrders.textContent = String(orders.length);
          if (statOrders) statOrders.textContent = String(orders.length);
          renderOrdersTable();
        }
      });
    };

    if (window.TTFirestore && window.TTFirestore.db) {
      attachListener();
    } else {
      window.addEventListener('tt:firebase-ready', () => {
        attachListener();
      });
    }
  }

  function formatDateTime(isoString) {
    if (!isoString) return '--/--/---- --:--';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    } catch (e) {
      return isoString;
    }
  }

  function filterOrdersByTime(orders, timeRange, customFrom, customTo) {
    if (!Array.isArray(orders)) return [];
    if (!timeRange || timeRange === 'all') return orders;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
    const endOfYesterday = new Date(startOfToday.getTime() - 1);
    const sevenDaysAgo = new Date(startOfToday.getTime() - 6 * 86400000);

    return orders.filter(ord => {
      if (!ord.createdAt) return true;
      const d = new Date(ord.createdAt);
      if (isNaN(d.getTime())) return true;

      switch (timeRange) {
        case 'today':
          return d >= startOfToday;
        case 'yesterday':
          return d >= startOfYesterday && d <= endOfYesterday;
        case '7days':
          return d >= sevenDaysAgo;
        case 'this_month':
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        case 'this_year':
          return d.getFullYear() === now.getFullYear();
        case 'custom': {
          let valid = true;
          if (customFrom) {
            const fromD = new Date(customFrom);
            fromD.setHours(0, 0, 0, 0);
            if (d < fromD) valid = false;
          }
          if (customTo) {
            const toD = new Date(customTo);
            toD.setHours(23, 59, 59, 999);
            if (d > toD) valid = false;
          }
          return valid;
        }
        default:
          return true;
      }
    });
  }

  function filterOrdersByQueryAndStatus(orders, query, status, pipeline = 'all') {
    if (!Array.isArray(orders)) return [];
    let result = orders;

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(o => {
        const id = (o.orderId || o.clientRequestId || '').toLowerCase();
        const name = (o.customer?.name || '').toLowerCase();
        const phone = (o.customer?.phone || '').toLowerCase();
        const address = (o.customer?.address || '').toLowerCase();
        const items = (o.items || []).map(i => (i.title || '').toLowerCase()).join(' ');
        return id.includes(q) || name.includes(q) || phone.includes(q) || address.includes(q) || items.includes(q);
      });
    }

    if (status) {
      result = result.filter(o => o.status === status);
    }

    if (pipeline && pipeline !== 'all') {
      result = result.filter(o => {
        const s = o.status || 'request_received';
        const track = window.TTOrderEngine && typeof window.TTOrderEngine.detectOrderTrack === 'function'
          ? window.TTOrderEngine.detectOrderTrack(o)
          : 'in_stock';

        switch (pipeline) {
          case 'pending':
            return s === 'handoff_ready' || s === 'request_received';
          case 'print_queue':
            return s === 'in_production' || (s === 'confirmed' && track === 'print_on_demand');
          case 'ready_to_pack':
            return s === 'ready_to_pack' || s === 'quality_check' || (s === 'confirmed' && track === 'in_stock');
          case 'shipped':
            return s === 'shipped';
          case 'delivered':
            return s === 'delivered';
          default:
            return true;
        }
      });
    }

    return result;
  }

  function calculateOrderSummary(filteredOrders, allOrders) {
    const totalRev = filteredOrders.reduce((sum, o) => sum + (o.totals?.finalTotal || o.totals?.payableTotal || 0), 0);
    const totalCount = filteredOrders.length;
    const processingCount = filteredOrders.filter(o =>
      ['handoff_ready', 'request_received', 'confirmed', 'in_production', 'quality_check', 'ready_to_pack'].includes(o.status)
    ).length;
    const aov = totalCount > 0 ? Math.round(totalRev / totalCount) : 0;

    const kpiRev = document.getElementById('order-kpi-revenue');
    const kpiCount = document.getElementById('order-kpi-count');
    const kpiProcessing = document.getElementById('order-kpi-processing');
    const kpiAov = document.getElementById('order-kpi-aov');
    const kpiRevSub = document.getElementById('order-kpi-revenue-sub');
    const kpiCountSub = document.getElementById('order-kpi-count-sub');

    if (kpiRev) kpiRev.textContent = formatMoney(totalRev);
    if (kpiCount) kpiCount.textContent = String(totalCount);
    if (kpiProcessing) kpiProcessing.textContent = String(processingCount);
    if (kpiAov) kpiAov.textContent = formatMoney(aov);

    const timeLabels = {
      all: 'Toàn thời gian',
      today: 'Hôm nay',
      yesterday: 'Hôm qua',
      '7days': '7 ngày qua',
      this_month: 'Tháng này',
      this_year: 'Năm nay',
      custom: 'Khoảng ngày chọn'
    };
    if (kpiRevSub) kpiRevSub.textContent = timeLabels[orderTimeFilter] || 'Kỳ đã chọn';
    if (kpiCountSub) kpiCountSub.textContent = `${totalCount} / ${allOrders.length} tổng đơn`;

    // Pipeline Count Badges
    const pAll = allOrders.length;
    const pPending = allOrders.filter(o => o.status === 'handoff_ready' || o.status === 'request_received').length;
    const pPrintQueue = allOrders.filter(o => {
      const track = window.TTOrderEngine && typeof window.TTOrderEngine.detectOrderTrack === 'function' ? window.TTOrderEngine.detectOrderTrack(o) : 'in_stock';
      return o.status === 'in_production' || (o.status === 'confirmed' && track === 'print_on_demand');
    }).length;
    const pReadyToPack = allOrders.filter(o => {
      const track = window.TTOrderEngine && typeof window.TTOrderEngine.detectOrderTrack === 'function' ? window.TTOrderEngine.detectOrderTrack(o) : 'in_stock';
      return o.status === 'ready_to_pack' || o.status === 'quality_check' || (o.status === 'confirmed' && track === 'in_stock');
    }).length;
    const pShipped = allOrders.filter(o => o.status === 'shipped').length;
    const pDelivered = allOrders.filter(o => o.status === 'delivered').length;

    const elAll = document.getElementById('pipeline-count-all');
    const elPending = document.getElementById('pipeline-count-pending');
    const elPrintQueue = document.getElementById('pipeline-count-print-queue');
    const elReadyToPack = document.getElementById('pipeline-count-ready-to-pack');
    const elShipped = document.getElementById('pipeline-count-shipped');
    const elDelivered = document.getElementById('pipeline-count-delivered');

    if (elAll) elAll.textContent = String(pAll);
    if (elPending) elPending.textContent = String(pPending);
    if (elPrintQueue) elPrintQueue.textContent = String(pPrintQueue);
    if (elReadyToPack) elReadyToPack.textContent = String(pReadyToPack);
    if (elShipped) elShipped.textContent = String(pShipped);
    if (elDelivered) elDelivered.textContent = String(pDelivered);
  }

  function renderOrderBreakdown(orders) {
    const tbody = document.getElementById('orders-breakdown-tbody');
    if (!tbody) return;

    if (!Array.isArray(orders) || orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="p-4 text-center text-[#71717A] text-xs">
            Không có dữ liệu tổng kết trong kỳ được chọn.
          </td>
        </tr>
      `;
      return;
    }

    const groups = new Map();
    orders.forEach(ord => {
      const d = ord.createdAt ? new Date(ord.createdAt) : new Date();
      const dateKey = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      if (!groups.has(dateKey)) {
        groups.set(dateKey, { dateKey, count: 0, completed: 0, revenue: 0, rawDate: d.getTime() });
      }
      const grp = groups.get(dateKey);
      grp.count++;
      if (ord.status === 'delivered') grp.completed++;
      grp.revenue += (ord.totals?.finalTotal || ord.totals?.payableTotal || 0);
    });

    const sortedGroups = Array.from(groups.values()).sort((a, b) => b.rawDate - a.rawDate);

    tbody.innerHTML = '';
    sortedGroups.slice(0, 10).forEach(grp => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-[#16161A]/50 border-b border-[rgba(255,255,255,0.07)] transition-colors';

      const tdTime = document.createElement('td');
      tdTime.className = 'p-2.5 font-mono text-[#F4F4F5]';
      tdTime.textContent = grp.dateKey;

      const tdCount = document.createElement('td');
      tdCount.className = 'p-2.5 text-center text-[#A1A1AA] font-mono';
      tdCount.textContent = `${grp.count} đơn`;

      const tdCompleted = document.createElement('td');
      tdCompleted.className = 'p-2.5 text-center text-[#10B981] font-mono';
      tdCompleted.textContent = `${grp.completed} đơn`;

      const tdRev = document.createElement('td');
      tdRev.className = 'p-2.5 text-right font-semibold text-[#10B981] font-mono';
      tdRev.textContent = formatMoney(grp.revenue);

      tr.append(tdTime, tdCount, tdCompleted, tdRev);
      tbody.appendChild(tr);
    });
  }

  /**
   * Trích xuất danh sách đơn hàng đã gộp từ TTOrderEngine, TTCheckout (Drafts) và Cloud Firestore
   */
  function getAllCombinedOrders() {
    const engineOrders = (window.TTOrderEngine && typeof window.TTOrderEngine.getAllOrdersAdmin === 'function')
      ? window.TTOrderEngine.getAllOrdersAdmin()
      : [];
    const checkoutOrders = (window.TTCheckout && typeof window.TTCheckout.getDraftOrders === 'function')
      ? window.TTCheckout.getDraftOrders()
      : [];

    const orderMap = new Map();
    (engineOrders || []).forEach(o => {
      const id = o.orderId || o.clientRequestId || o.id;
      if (id) orderMap.set(id, { ...o });
    });
    (checkoutOrders || []).forEach(o => {
      const id = o.orderId || o.clientRequestId || o.id;
      if (id) {
        if (!orderMap.has(id)) {
          orderMap.set(id, { ...o });
        } else {
          orderMap.set(id, { ...orderMap.get(id), ...o });
        }
      }
    });
    (cloudOrders || []).forEach(o => {
      const id = o.orderId || o.clientRequestId || o.id;
      if (id) {
        const local = orderMap.get(id) || {};
        orderMap.set(id, { ...local, ...o });
      }
    });

    const allOrders = Array.from(orderMap.values());
    allOrders.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
    return allOrders;
  }

  function renderOrdersTable() {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;

    const allOrders = getAllCombinedOrders();

    // Sort descending by creation date
    allOrders.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });

    // 1. Time range filter
    const timeFiltered = filterOrdersByTime(allOrders, orderTimeFilter, orderCustomDateFrom, orderCustomDateTo);

    // 2. Query, status & pipeline filter (Argon 4 Dual-Track Workflow)
    const displayOrders = filterOrdersByQueryAndStatus(timeFiltered, orderSearchQuery, orderStatusFilter, orderPipelineFilter);

    // 3. Dynamic KPI calculation & Breakdown table update
    calculateOrderSummary(timeFiltered, allOrders);
    renderOrderBreakdown(timeFiltered);

    if (!Array.isArray(displayOrders) || displayOrders.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="p-8 text-center text-[#71717A] text-xs">
            <i class="fa-solid fa-inbox text-2xl mb-2 block text-[#71717A]"></i>
            Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = '';
    displayOrders.forEach(ord => {
      const itemCount = (ord.items || []).reduce((acc, i) => acc + (i.qty || 1), 0);
      const cleanPhone = (ord.customer?.phone || '').replace(/\D/g, '');
      const ordId = ord.orderId || ord.clientRequestId || 'TT3D-ORDER';
      const createdDateStr = formatDateTime(ord.createdAt);

      const statusCfg = (window.TTOrderEngine && window.TTOrderEngine.STATUS_CONFIG && window.TTOrderEngine.STATUS_CONFIG[ord.status]) || {
        label: (ord.status === 'handoff_ready' ? 'Chờ xưởng xác nhận' : (ord.status || 'Đã nhận yêu cầu')),
        badgeClass: 'badge-clean text-[10px]'
      };

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-[#16161A]/50 border-b border-[rgba(255,255,255,0.07)] transition-colors';

      // 1. Order ID + Track Badges (Argon 4 Dual-Track Pipeline)
      const track = window.TTOrderEngine && typeof window.TTOrderEngine.detectOrderTrack === 'function'
        ? window.TTOrderEngine.detectOrderTrack(ord)
        : 'in_stock';
      const hasCustom = (ord.items || []).some(i => i.customText && String(i.customText).trim());

      const tdId = document.createElement('td');
      tdId.className = 'p-3 font-mono tabular-nums text-xs font-semibold text-[#FF5C00]';
      tdId.textContent = ordId;

      const trackWrap = document.createElement('div');
      trackWrap.className = 'flex flex-col gap-1 mt-1';

      if (track === 'in_stock') {
        const inStockBadge = document.createElement('span');
        inStockBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-mono font-medium border border-emerald-500/30 bg-emerald-500/10 text-[#10B981] inline-flex items-center gap-1 w-max';
        inStockBadge.innerHTML = '<i class="fa-solid fa-box-open text-[8px]"></i><span>HÀNG SẴN KHO</span>';
        trackWrap.appendChild(inStockBadge);
      } else {
        const podBadge = document.createElement('span');
        podBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-mono font-medium border border-[#FF5C00]/30 bg-[#FF5C00]/10 text-[#FF5C00] inline-flex items-center gap-1 w-max';
        podBadge.innerHTML = '<i class="fa-solid fa-cube text-[8px]"></i><span>CẦN IN 3D</span>';
        trackWrap.appendChild(podBadge);
      }

      if (hasCustom) {
        const customBadge = document.createElement('span');
        customBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-mono font-medium border border-purple-500/30 bg-purple-500/10 text-purple-400 inline-flex items-center gap-1 w-max';
        customBadge.innerHTML = '<i class="fa-solid fa-signature text-[8px]"></i><span>CÁ NHÂN HÓA</span>';
        trackWrap.appendChild(customBadge);
      }

      if (ord.isDemo) {
        const demoTag = document.createElement('span');
        demoTag.className = 'text-[9px] font-mono tabular-nums text-[#71717A] font-normal';
        demoTag.textContent = '[Minh họa]';
        trackWrap.appendChild(demoTag);
      }

      tdId.appendChild(trackWrap);
      tr.appendChild(tdId);

      // 2. Order Date/Time
      const tdTime = document.createElement('td');
      tdTime.className = 'p-3 font-mono tabular-nums text-[11px] text-[#A1A1AA]';
      tdTime.textContent = createdDateStr;
      tr.appendChild(tdTime);

      // 3. Customer Name & Phone
      const tdCust = document.createElement('td');
      tdCust.className = 'p-3';
      const nameDiv = document.createElement('div');
      nameDiv.className = 'font-semibold text-[#F4F4F5] text-xs';
      nameDiv.textContent = ord.customer?.name || 'Khách vãng lai';
      const phoneDiv = document.createElement('div');
      phoneDiv.className = 'text-[11px] text-[#71717A] font-mono tabular-nums';
      phoneDiv.textContent = ord.customer?.phone || '';
      tdCust.append(nameDiv, phoneDiv);
      tr.appendChild(tdCust);

      // 4. Items list
      const tdItems = document.createElement('td');
      tdItems.className = 'p-3 text-xs text-[#A1A1AA]';
      const countDiv = document.createElement('div');
      countDiv.className = 'font-mono tabular-nums';
      countDiv.textContent = `${itemCount} món`;
      const listDiv = document.createElement('div');
      listDiv.className = 'text-[10px] text-[#71717A] truncate max-w-xs';
      listDiv.textContent = (ord.items || []).map(i => i.title + (i.customText ? ` [Khắc: ${i.customText}]` : '')).join(', ');
      tdItems.append(countDiv, listDiv);
      tr.appendChild(tdItems);

      // 5. Total Amount
      const tdTotal = document.createElement('td');
      tdTotal.className = 'p-3 font-mono tabular-nums font-semibold text-xs text-[#10B981]';
      tdTotal.textContent = formatMoney(ord.totals?.finalTotal || ord.totals?.payableTotal || 0);
      tr.appendChild(tdTotal);

      // 6. Real Milestone Status with Vietnamese styling
      const tdStatus = document.createElement('td');
      tdStatus.className = 'p-3 text-center';
      const statusBadge = document.createElement('span');
      if (ord.status === 'handoff_ready' || ord.status === 'request_received') {
        statusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B] inline-flex items-center gap-1';
        statusBadge.innerHTML = '<i class="fa-solid fa-clock text-[9px]"></i><span>Chờ xưởng xác nhận</span>';
      } else if (ord.status === 'confirmed') {
        statusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8] inline-flex items-center gap-1';
        statusBadge.innerHTML = '<i class="fa-solid fa-clipboard-check text-[9px]"></i><span>Xưởng đã duyệt</span>';
      } else if (ord.status === 'in_production') {
        statusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-[#FF5C00]/30 bg-[#FF5C00]/10 text-[#FF5C00] inline-flex items-center gap-1';
        statusBadge.innerHTML = '<i class="fa-solid fa-gear fa-spin text-[9px]"></i><span>Đang in 3D</span>';
      } else if (ord.status === 'quality_check') {
        statusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-[#A855F7]/30 bg-[#A855F7]/10 text-[#A855F7] inline-flex items-center gap-1';
        statusBadge.innerHTML = '<i class="fa-solid fa-magnifying-glass text-[9px]"></i><span>Kiểm tra QC</span>';
      } else if (ord.status === 'ready_to_pack') {
        statusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981] inline-flex items-center gap-1';
        statusBadge.innerHTML = '<i class="fa-solid fa-box-archive text-[9px]"></i><span>Chờ đóng gói</span>';
      } else if (ord.status === 'shipped') {
        statusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6] inline-flex items-center gap-1';
        statusBadge.innerHTML = '<i class="fa-solid fa-truck-fast text-[9px]"></i><span>Đang giao</span>';
      } else if (ord.status === 'delivered') {
        statusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981] inline-flex items-center gap-1';
        statusBadge.innerHTML = '<i class="fa-solid fa-circle-check text-[9px]"></i><span>Đã nhận hàng</span>';
      } else {
        statusBadge.className = 'badge-clean text-[10px]';
        statusBadge.textContent = statusCfg.label || ord.status || 'Chờ xử lý';
      }
      tdStatus.appendChild(statusBadge);
      tr.appendChild(tdStatus);

      // 7. ETA
      const tdEta = document.createElement('td');
      tdEta.className = 'p-3 font-mono tabular-nums text-[11px] text-[#A1A1AA] text-center';
      tdEta.textContent = ord.etaDate || 'Chờ xếp lịch';
      tr.appendChild(tdEta);

      // 8. Actions & Contextual Next Step (Argon 4 Dual-Track Workflow)
      const tdActions = document.createElement('td');
      tdActions.className = 'p-3 text-right pr-4';
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'flex items-center justify-end gap-1.5 flex-wrap';

      const nextAction = window.TTOrderEngine && typeof window.TTOrderEngine.getNextStepAction === 'function'
        ? window.TTOrderEngine.getNextStepAction(ord)
        : null;

      if (nextAction) {
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.dataset.action = 'admin-next-step';
        nextBtn.dataset.orderId = ordId;
        nextBtn.dataset.nextStatus = nextAction.nextStatus;
        nextBtn.className = nextAction.buttonClass;
        nextBtn.title = `Chuyển tiến độ: ${nextAction.label}`;
        nextBtn.innerHTML = `<i class="fa-solid ${nextAction.icon} text-[10px]"></i><span>${nextAction.shortLabel || nextAction.label}</span>`;
        actionsDiv.appendChild(nextBtn);
      }

      // Print Packing Slip Button
      const slipBtn = document.createElement('button');
      slipBtn.type = 'button';
      slipBtn.dataset.action = 'admin-print-slip';
      slipBtn.dataset.orderId = ordId;
      slipBtn.className = 'p-1.5 rounded hover:bg-[#16161A] text-[#71717A] hover:text-[#FF5C00] border border-transparent hover:border-[#FF5C00]/30 transition-colors';
      slipBtn.title = 'In phiếu lệnh xưởng & đóng gói';
      slipBtn.innerHTML = '<i class="fa-solid fa-print text-xs"></i>';
      actionsDiv.appendChild(slipBtn);

      // Update status & ETA modal button
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.dataset.action = 'admin-edit-order-status';
      editBtn.dataset.orderId = ordId;
      editBtn.className = 'p-1.5 rounded hover:bg-[#16161A] text-[#71717A] hover:text-[#F4F4F5] border border-transparent hover:border-[rgba(255,255,255,0.07)] transition-colors';
      editBtn.title = 'Cập nhật tiến độ chi tiết, hãng vận chuyển và ghi chú';
      editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square text-xs"></i>';
      actionsDiv.appendChild(editBtn);

      // Copy Tracking Link
      const copyLinkBtn = document.createElement('button');
      copyLinkBtn.type = 'button';
      copyLinkBtn.dataset.action = 'admin-copy-track-link';
      copyLinkBtn.dataset.orderId = ordId;
      copyLinkBtn.dataset.token = ord.token || '';
      copyLinkBtn.className = 'p-1.5 rounded hover:bg-[#16161A] text-[#71717A] hover:text-[#38BDF8] border border-transparent hover:border-[rgba(255,255,255,0.07)] transition-colors';
      copyLinkBtn.title = 'Sao chép link tra cứu gửi khách';
      copyLinkBtn.innerHTML = '<i class="fa-solid fa-link text-xs"></i>';
      actionsDiv.appendChild(copyLinkBtn);

      // Zalo link
      if (cleanPhone) {
        const zaloLink = document.createElement('a');
        zaloLink.href = `https://zalo.me/${cleanPhone}`;
        zaloLink.target = '_blank';
        zaloLink.rel = 'noopener noreferrer';
        zaloLink.className = 'p-1.5 rounded hover:bg-[#16161A] text-[#38BDF8] hover:text-[#F4F4F5] border border-transparent hover:border-[rgba(255,255,255,0.07)] transition-colors';
        zaloLink.title = 'Mở Zalo khách';
        zaloLink.innerHTML = '<i class="fa-solid fa-comment-dots text-xs"></i>';
        actionsDiv.appendChild(zaloLink);
      }

      // View detail
      const viewBtn = document.createElement('button');
      viewBtn.type = 'button';
      viewBtn.dataset.action = 'admin-view-order';
      viewBtn.dataset.orderId = ordId;
      viewBtn.className = 'p-1.5 rounded hover:bg-[#16161A] text-[#71717A] hover:text-[#F4F4F5] border border-transparent hover:border-[rgba(255,255,255,0.07)] transition-colors';
      viewBtn.title = 'Xem chi tiết đơn hàng';
      viewBtn.innerHTML = '<i class="fa-solid fa-eye text-xs"></i>';
      actionsDiv.appendChild(viewBtn);

      // Telegram notification trigger
      const tgBtn = document.createElement('button');
      tgBtn.type = 'button';
      tgBtn.dataset.action = 'admin-send-telegram';
      tgBtn.dataset.orderId = ordId;
      tgBtn.className = 'p-1.5 rounded hover:bg-[#16161A] text-[#71717A] hover:text-[#38BDF8] border border-transparent hover:border-[rgba(56,189,248,0.2)] transition-colors';
      tgBtn.title = 'Gửi thông báo đơn này lên Telegram';
      tgBtn.innerHTML = '<i class="fa-brands fa-telegram text-xs"></i>';
      actionsDiv.appendChild(tgBtn);

      tdActions.appendChild(actionsDiv);
      tr.appendChild(tdActions);

      tableBody.appendChild(tr);
    });

    if (!tableBody._hasOrdersDelegation) {
      tableBody.addEventListener('click', (e) => {
        // Contextual Next Step Button (Argon 4 Dual-Track Pipeline)
        const nextStepBtn = e.target.closest('[data-action="admin-next-step"]');
        if (nextStepBtn) {
          const ordId = nextStepBtn.dataset.orderId;
          const nextStatus = nextStepBtn.dataset.nextStatus;
          if (ordId && nextStatus) {
            handleOrderNextStep(ordId, nextStatus);
          }
          return;
        }

        // Printable Packing Slip Button
        const printSlipBtn = e.target.closest('[data-action="admin-print-slip"]');
        if (printSlipBtn) {
          const ordId = printSlipBtn.dataset.orderId;
          if (ordId) openPackingSlipModal(ordId);
          return;
        }

        // Quick Confirm Button
        const quickConfirmBtn = e.target.closest('[data-action="admin-quick-confirm"]');
        if (quickConfirmBtn) {
          const ordId = quickConfirmBtn.dataset.orderId;
          if (ordId) confirmOrderQuick(ordId);
          return;
        }

        // Quick Start Production Button
        const startProdBtn = e.target.closest('[data-action="admin-start-production"]');
        if (startProdBtn) {
          const ordId = startProdBtn.dataset.orderId;
          if (ordId) startProductionQuick(ordId);
          return;
        }

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

        const tgBtn = e.target.closest('[data-action="admin-send-telegram"]');
        if (tgBtn) {
          const ordId = tgBtn.dataset.orderId;
          const ord = allOrders.find(o => o.orderId === ordId || o.clientRequestId === ordId);
          if (ord && window.TTTelegram && typeof window.TTTelegram.notifyNewOrder === 'function') {
            showToast(`Đang gửi thông báo đơn ${ordId} lên Telegram...`);
            window.TTTelegram.notifyNewOrder(ord).then(res => {
              if (res && res.ok) {
                showToast(`Đã gửi thông báo đơn ${ordId} lên Telegram thành công!`);
              } else {
                const err = res && res.error ? res.error : (res?.reason === 'unconfigured' ? 'Chưa cấu hình Telegram Bot Token hoặc Chat ID.' : 'Không thể gửi');
                showToast(`Lỗi gửi Telegram: ${err}`, 'error');
              }
            }).catch(err => {
              showToast(`Lỗi: ${err.message}`, 'error');
            });
          }
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

  /**
   * 1-Click xác nhận đơn hàng của Xưởng (Dual-Track Workshop Quick Confirm)
   * Tự động phân loại: Hàng sẵn kho -> Chuyển đóng gói (ready_to_pack) | Cần in 3D -> Hàng đợi in (in_production)
   */
  async function confirmOrderQuick(orderId) {
    if (!orderId) return;

    const allOrders = getAllCombinedOrders();
    const ord = allOrders.find(o => o.orderId === orderId || o.clientRequestId === orderId);
    const track = window.TTOrderEngine && typeof window.TTOrderEngine.detectOrderTrack === 'function'
      ? window.TTOrderEngine.detectOrderTrack(ord)
      : 'in_stock';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const year = tomorrow.getFullYear();
    const defaultEta = `${day}/${month}/${year}`;

    const isFastTrack = (track === 'in_stock');
    const nextStatus = isFastTrack ? 'ready_to_pack' : 'in_production';
    const noteMsg = isFastTrack
      ? 'Đơn hàng toàn bộ là sản phẩm sẵn kho -> Đã chuyển thẳng sang Chờ đóng gói (bỏ qua máy in 3D).'
      : 'Đơn hàng có sản phẩm cần chế tác/khắc tên -> Đã đưa vào Hàng đợi máy in 3D Bambu Lab.';

    const updatePayload = {
      status: nextStatus,
      etaDate: defaultEta,
      fulfillmentTrack: track,
      publicNote: noteMsg,
      customerAlert: {
        type: 'success',
        message: isFastTrack
          ? 'Hàng có sẵn tại kho, xưởng đã xác nhận và đang đóng gói chuyển đi.'
          : 'Đơn hàng đã được xưởng xác nhận và đưa vào hàng đợi in 3D.'
      }
    };

    // 1. Update TTOrderEngine
    if (window.TTOrderEngine && typeof window.TTOrderEngine.updateOrderStatus === 'function') {
      window.TTOrderEngine.updateOrderStatus(orderId, updatePayload, 'Xưởng xác nhận');
    }

    // 2. Update TTCheckout drafts
    if (window.TTCheckout && typeof window.TTCheckout.updateDraftOrderStatus === 'function') {
      window.TTCheckout.updateDraftOrderStatus(orderId, updatePayload);
    }

    // 3. Update Cloud Firestore
    if (window.TTFirestore && typeof window.TTFirestore.updateOrderStatus === 'function') {
      try {
        await window.TTFirestore.updateOrderStatus(orderId, updatePayload);
      } catch (err) {
        console.warn('[Admin] Firestore update error:', err);
      }
    }

    // 4. Real-time broadcast for customer tracking page
    try {
      const channel = new BroadcastChannel('TT3D_ORDERS_CHANNEL');
      channel.postMessage({
        type: 'ORDER_STATUS_UPDATED',
        orderId: orderId,
        status: nextStatus,
        etaDate: defaultEta,
        timestamp: new Date().toISOString()
      });
      channel.close();
    } catch (e) {
      try {
        localStorage.setItem('TT_ORDER_BROADCAST_TRIGGER', JSON.stringify({ orderId, status: nextStatus, time: Date.now() }));
      } catch (err) {}
    }

    // 5. Telegram notification if enabled
    try {
      if (ord && window.TTTelegram && typeof window.TTTelegram.notifyNewOrder === 'function') {
        const confirmedOrd = { ...ord, ...updatePayload };
        window.TTTelegram.notifyNewOrder(confirmedOrd).catch(() => {});
      }
    } catch (e) {}

    showToast(`Đã duyệt đơn #${orderId}! Phân loại: ${isFastTrack ? 'Hàng sẵn kho -> Chờ đóng gói' : 'Cần in 3D -> Hàng đợi in'}`);
    renderOrdersTable();
  }

  /**
   * Xử lý chuyển đổi tiến độ theo ngữ cảnh (Contextual Next Step Action)
   */
  async function handleOrderNextStep(orderId, nextStatus) {
    if (!orderId || !nextStatus) return;

    const allOrders = getAllCombinedOrders();
    const ord = allOrders.find(o => o.orderId === orderId || o.clientRequestId === orderId);
    const track = window.TTOrderEngine && typeof window.TTOrderEngine.detectOrderTrack === 'function'
      ? window.TTOrderEngine.detectOrderTrack(ord)
      : 'in_stock';

    let defaultEta = ord?.etaDate || 'Trong ngày';
    let noteMsg = `Xưởng chuyển tiến độ sang: ${nextStatus}`;
    let alertMsg = 'Tiến độ đơn hàng của bạn đã được cập nhật.';

    if (nextStatus === 'ready_to_pack') {
      noteMsg = (track === 'in_stock')
        ? 'Hàng có sẵn tại kho -> Đã chuyển sang Chờ đóng gói xuất kho.'
        : 'Đã hoàn tất in 3D và kiểm tra QC -> Chuyển sang Chờ đóng gói.';
      alertMsg = 'Sản phẩm đã sẵn sàng, xưởng đang đóng gói chống va đập để bàn giao shipper.';
      defaultEta = 'Hôm nay / Sáng mai';
    } else if (nextStatus === 'in_production') {
      noteMsg = 'Đơn có sản phẩm cần in 3D/khắc tên -> Đã đưa vào máy in Bambu Lab.';
      alertMsg = 'Sản phẩm đang được tạo hình trên dàn máy in 3D Bambu Lab với độ mịn 0.16mm.';
      defaultEta = '1 - 2 ngày';
    } else if (nextStatus === 'shipped') {
      noteMsg = 'Đã đóng gói hoàn tất và bàn giao cho đơn vị vận chuyển.';
      alertMsg = 'Kiện hàng đã được bàn giao cho đơn vị bưu chính để chuyển tới bạn.';
      defaultEta = '2 - 3 ngày';
    } else if (nextStatus === 'delivered') {
      noteMsg = 'Khách hàng đã nhận hàng thành công.';
      alertMsg = 'Đơn hàng đã được giao thành công. Cảm ơn bạn đã lựa chọn T&T 3D Labs!';
    }

    const updatePayload = {
      status: nextStatus,
      etaDate: defaultEta,
      fulfillmentTrack: track,
      publicNote: noteMsg,
      customerAlert: {
        type: 'info',
        message: alertMsg
      }
    };

    if (window.TTOrderEngine && typeof window.TTOrderEngine.updateOrderStatus === 'function') {
      window.TTOrderEngine.updateOrderStatus(orderId, updatePayload, 'Cập nhật tiến độ');
    }
    if (window.TTCheckout && typeof window.TTCheckout.updateDraftOrderStatus === 'function') {
      window.TTCheckout.updateDraftOrderStatus(orderId, updatePayload);
    }
    if (window.TTFirestore && typeof window.TTFirestore.updateOrderStatus === 'function') {
      try {
        await window.TTFirestore.updateOrderStatus(orderId, updatePayload);
      } catch (err) {
        console.warn('[Admin] Firestore update error:', err);
      }
    }

    try {
      const channel = new BroadcastChannel('TT3D_ORDERS_CHANNEL');
      channel.postMessage({
        type: 'ORDER_STATUS_UPDATED',
        orderId: orderId,
        status: nextStatus,
        etaDate: defaultEta,
        timestamp: new Date().toISOString()
      });
      channel.close();
    } catch (e) {
      try {
        localStorage.setItem('TT_ORDER_BROADCAST_TRIGGER', JSON.stringify({ orderId, status: nextStatus, time: Date.now() }));
      } catch (err) {}
    }

    const statusLabels = {
      ready_to_pack: 'Chờ đóng gói',
      in_production: 'Hàng đợi in 3D',
      shipped: 'Đang giao hàng',
      delivered: 'Hoàn tất'
    };
    showToast(`Đã chuyển đơn #${orderId} sang "${statusLabels[nextStatus] || nextStatus}"!`);
    renderOrdersTable();
  }

  /**
   * Tạo phiếu lệnh xưởng & đóng gói chuẩn in ấn (A5 / A4)
   */
  function openPackingSlipModal(orderId) {
    const orders = getAllCombinedOrders();
    const ord = orders.find(o => o.orderId === orderId || o.clientRequestId === orderId);
    if (!ord) {
      showToast('Không tìm thấy thông tin đơn hàng để in phiếu!', 'error');
      return;
    }

    const modal = document.getElementById('admin-packing-slip-modal');
    const container = document.getElementById('packing-slip-print-content');
    if (!modal || !container) return;

    const ordId = ord.orderId || ord.clientRequestId || 'TT3D-ORDER';
    const track = window.TTOrderEngine && typeof window.TTOrderEngine.detectOrderTrack === 'function'
      ? window.TTOrderEngine.detectOrderTrack(ord)
      : 'in_stock';
    const trackBadge = track === 'in_stock'
      ? '<span style="border: 1px solid #10B981; color: #10B981; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block;">HÀNG SẴN KHO (IN-STOCK FAST TRACK)</span>'
      : '<span style="border: 1px solid #FF5C00; color: #FF5C00; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block;">CẦN IN 3D (PRINT ON DEMAND - BAMBU LAB)</span>';

    const items = Array.isArray(ord.items) ? ord.items : [];
    const itemsRows = items.map((item, idx) => {
      const customBadge = item.customText
        ? `<div style="color: #A855F7; font-size: 11px; margin-top: 2px; font-weight: 600;">Khắc tên riêng: "${escapeHtml(item.customText)}"</div>`
        : '';
      const colorSpec = item.colorName ? `Màu: ${escapeHtml(item.colorName)}` : '';
      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 10px 8px; font-family: monospace;">${idx + 1}</td>
          <td style="padding: 10px 8px;">
            <div style="font-weight: 600;">${escapeHtml(item.title || 'Sản phẩm in 3D')}</div>
            <div style="font-size: 11px; color: #71717A;">${colorSpec}</div>
            ${customBadge}
          </td>
          <td style="padding: 10px 8px; text-align: center; font-family: monospace; font-weight: bold;">x${item.qty || 1}</td>
          <td style="padding: 10px 8px; text-align: right; font-family: monospace;">${formatMoney(item.price || 0)}</td>
        </tr>
      `;
    }).join('');

    const totalMoney = formatMoney(ord.totals?.finalTotal || ord.totals?.payableTotal || 0);

    container.innerHTML = `
      <div style="border: 2px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 24px; font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px dashed rgba(255,255,255,0.15); padding-bottom: 16px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 18px; font-weight: 800; color: #FF5C00; letter-spacing: -0.02em;">T&amp;T 3D LABS</div>
            <div style="font-size: 11px; color: #71717A;">Xưởng Chế Tác &amp; Desk Setup Cao Cấp · Hotline/Zalo: 0349.657.529</div>
            <div style="font-size: 11px; color: #71717A;">Website: nvtruongsun-hub.github.io/TT3Dstudio</div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: monospace; font-size: 14px; font-weight: 800; color: #F4F4F5;">PHIẾU LỆNH XƯỞNG</div>
            <div style="font-family: monospace; font-size: 13px; color: #FF5C00; font-weight: bold;">#${ordId}</div>
            <div style="font-size: 10px; color: #71717A; margin-top: 4px;">${formatDateTime(ord.createdAt)}</div>
          </div>
        </div>

        <!-- Track & Customer -->
        <div style="margin-bottom: 16px;">
          <div style="margin-bottom: 8px;">${trackBadge}</div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; font-size: 12px; line-height: 1.6;">
            <div><strong>Khách hàng:</strong> <span style="font-weight: 600; color: #F4F4F5;">${escapeHtml(ord.customer?.name || 'Khách vãng lai')}</span> - SĐT: <span style="font-family: monospace; color: #38BDF8; font-weight: 600;">${escapeHtml(ord.customer?.phone || 'Chưa có')}</span></div>
            <div><strong>Địa chỉ giao:</strong> ${escapeHtml(ord.customer?.address || 'Nhận tại xưởng / Thỏa thuận qua Zalo')}</div>
            ${ord.customer?.note ? `<div style="color: #F59E0B; margin-top: 4px;"><strong>Ghi chú của khách:</strong> ${escapeHtml(ord.customer.note)}</div>` : ''}
          </div>
        </div>

        <!-- Items Table -->
        <div style="margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; color: #A1A1AA;">Danh mục sản phẩm đóng gói</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.15); color: #71717A; font-family: monospace; font-size: 10px; text-align: left;">
                <th style="padding: 6px 8px; width: 35px;">STT</th>
                <th style="padding: 6px 8px;">Mặt hàng &amp; Thuộc tính</th>
                <th style="padding: 6px 8px; text-align: center; width: 60px;">SL</th>
                <th style="padding: 6px 8px; text-align: right; width: 90px;">Đơn giá</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          <div style="display: flex; justify-content: flex-end; padding-top: 12px; font-size: 14px; font-weight: 800; font-family: monospace; color: #10B981;">
            TỔNG THANH TOÁN: ${totalMoney}
          </div>
        </div>

        <!-- Checklist QC & Đóng gói -->
        <div style="border: 1px dashed rgba(255,255,255,0.15); border-radius: 8px; padding: 12px; font-size: 11px; background: rgba(255,255,255,0.02);">
          <div style="font-weight: 700; color: #A1A1AA; margin-bottom: 6px; text-transform: uppercase;">Checklist kiểm tra xưởng (KCS &amp; Đóng gói):</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; color: #71717A;">
            <div>[  ] Kiểm đếm đủ số lượng &amp; đúng mã màu</div>
            <div>[  ] Kiểm tra độ mịn phôi in (0.16mm, không xơ)</div>
            <div>[  ] Đã test chip NFC 1 chạm (nếu có)</div>
            <div>[  ] Bọc màng xốp 3 lớp chống va đập</div>
            <div>[  ] Đã dán tem niêm phong T&amp;T 3D Labs</div>
            <div>[  ] Bỏ kèm thiệp cảm ơn &amp; hướng dẫn sử dụng</div>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function closePackingSlipModal() {
    const modal = document.getElementById('admin-packing-slip-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function printWorkshopPackingSlip(orderId) {
    openPackingSlipModal(orderId);
    setTimeout(() => {
      window.print();
    }, 250);
  }

  /**
   * Bắt đầu đưa đơn vào máy in 3D
   */
  async function startProductionQuick(orderId) {
    if (!orderId) return;

    const updatePayload = {
      status: 'in_production',
      publicNote: 'Sản phẩm đang được tạo hình trên máy in 3D Bambu Lab.',
      customerAlert: {
        type: 'info',
        message: 'Xưởng đang in 3D và xử lý bề mặt sản phẩm của bạn.'
      }
    };

    if (window.TTOrderEngine && typeof window.TTOrderEngine.updateOrderStatus === 'function') {
      window.TTOrderEngine.updateOrderStatus(orderId, updatePayload, 'Bắt đầu in 3D');
    }
    if (window.TTCheckout && typeof window.TTCheckout.updateDraftOrderStatus === 'function') {
      window.TTCheckout.updateDraftOrderStatus(orderId, updatePayload);
    }
    if (window.TTFirestore && typeof window.TTFirestore.updateOrderStatus === 'function') {
      try {
        await window.TTFirestore.updateOrderStatus(orderId, updatePayload);
      } catch (err) {}
    }
    try {
      const channel = new BroadcastChannel('TT3D_ORDERS_CHANNEL');
      channel.postMessage({
        type: 'ORDER_STATUS_UPDATED',
        orderId: orderId,
        status: 'in_production',
        timestamp: new Date().toISOString()
      });
      channel.close();
    } catch (e) {}

    showToast(`Đơn #${orderId} đã chuyển sang: Đang in 3D & Xử lý!`);
    renderOrdersTable();
  }

  /**
   * Xác nhận hàng loạt tất cả đơn đang chờ xưởng xác nhận
   */
  async function batchConfirmPendingOrders() {
    const allOrders = getAllCombinedOrders();
    const pendingOrders = allOrders.filter(o => o.status === 'handoff_ready' || o.status === 'request_received' || !o.status);
    if (pendingOrders.length === 0) {
      showToast('Không có đơn hàng nào đang chờ xưởng xác nhận.', 'info');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xác nhận hàng loạt ${pendingOrders.length} đơn hàng đang chờ không?`)) {
      return;
    }

    let count = 0;
    for (const ord of pendingOrders) {
      const ordId = ord.orderId || ord.clientRequestId;
      if (ordId) {
        await confirmOrderQuick(ordId);
        count++;
      }
    }
    showToast(`Đã xác nhận thành công ${count} đơn hàng chờ!`);
    renderOrdersTable();
  }

  function openAdminOrderUpdateModal(orderId) {
    const orders = getAllCombinedOrders();
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
    }
    if (window.TTCheckout && typeof window.TTCheckout.updateDraftOrderStatus === 'function') {
      window.TTCheckout.updateDraftOrderStatus(orderId, updatePayload);
    }
    if (window.TTFirestore && typeof window.TTFirestore.updateOrderStatus === 'function') {
      window.TTFirestore.updateOrderStatus(orderId, updatePayload);
    }
    try {
      const channel = new BroadcastChannel('TT3D_ORDERS_CHANNEL');
      channel.postMessage({
        type: 'ORDER_STATUS_UPDATED',
        orderId: orderId,
        status: updatePayload.status,
        timestamp: new Date().toISOString()
      });
      channel.close();
    } catch (e) {}

    showToast(`Đã lưu tiến độ mới cho đơn ${orderId}!`);
    closeAdminOrderModal();
    renderOrdersTable();
  }

  window.closeAdminOrderModal = closeAdminOrderModal;
  window.saveAdminOrderUpdate = saveAdminOrderUpdate;

  function viewOrderDetail(orderId) {
    const orders = getAllCombinedOrders();
    const ord = orders.find(o => o.orderId === orderId || o.clientRequestId === orderId);
    if (!ord) return;

    currentDetailOrder = ord;
    const modal = document.getElementById('admin-order-detail-modal');
    const titleId = document.getElementById('detail-modal-order-id');
    const content = document.getElementById('detail-modal-content');
    if (!modal || !content) return;

    if (titleId) titleId.textContent = ord.orderId || ord.clientRequestId || 'TT3D-ORDER';

    const statusCfg = (window.TTOrderEngine && window.TTOrderEngine.STATUS_CONFIG && window.TTOrderEngine.STATUS_CONFIG[ord.status]) || {
      label: (ord.status === 'handoff_ready' ? 'Chờ xưởng xác nhận' : (ord.status || 'Đã nhận yêu cầu')),
      badgeClass: 'badge-clean text-[10px]'
    };

    const createdDateStr = ord.createdAt ? formatDateTime(ord.createdAt) : '--/--/----';

    let itemsRows = '';
    (ord.items || []).forEach((item, idx) => {
      const title = item.title || 'Sản phẩm in 3D';
      const qty = item.qty || 1;
      const price = formatMoney(item.price || 0);
      const subtotal = formatMoney((item.price || 0) * qty);
      let specs = [];
      if (item.colorName) specs.push(`Màu: ${item.colorName}`);
      if (item.materialName) specs.push(`Nhựa: ${item.materialName}`);
      if (item.customText) specs.push(`Khắc: "${item.customText}"`);
      if (item.fontName) specs.push(`Font: ${item.fontName}`);
      const specLine = specs.length > 0 ? `<div class="text-[11px] text-[#A1A1AA] mt-0.5">${specs.join(' • ')}</div>` : '';

      itemsRows += `
        <tr class="border-b border-[rgba(255,255,255,0.05)]">
          <td class="py-2 font-mono text-[11px] text-[#71717A]">${idx + 1}</td>
          <td class="py-2">
            <div class="font-medium text-[#F4F4F5]">${title}</div>
            ${specLine}
          </td>
          <td class="py-2 text-center font-mono tabular-nums text-[#F4F4F5]">${qty}</td>
          <td class="py-2 text-right font-mono tabular-nums text-[#A1A1AA]">${price}</td>
          <td class="py-2 text-right font-mono tabular-nums text-[#10B981] font-semibold">${subtotal}</td>
        </tr>
      `;
    });

    content.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded bg-[#111114] border border-[rgba(255,255,255,0.07)]">
        <div>
          <span class="text-[11px] text-[#71717A] block">Khách hàng &amp; Liên hệ</span>
          <div class="font-semibold text-xs text-[#F4F4F5] mt-0.5">${ord.customer?.name || 'Khách vãng lai'}</div>
          <div class="font-mono text-xs text-[#38BDF8] mt-0.5">${ord.customer?.phone || 'Chưa có SĐT'}</div>
          <div class="text-[11px] text-[#A1A1AA] mt-1">${ord.customer?.address || 'Nhận tại xưởng / Thỏa thuận qua Zalo'}</div>
        </div>
        <div>
          <span class="text-[11px] text-[#71717A] block">Thông tin đơn hàng</span>
          <div class="text-xs text-[#E4E4E7] mt-0.5">Thời gian: <span class="font-mono text-[#F4F4F5]">${createdDateStr}</span></div>
          <div class="text-xs text-[#E4E4E7] mt-0.5">Kênh tiếp nhận: <span class="font-mono uppercase font-semibold text-[#FF5C00]">${ord.channel || 'zalo'}</span></div>
          <div class="text-xs text-[#E4E4E7] mt-0.5">Tiến độ: <span class="px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-[#FF5C00]/30 bg-[#FF5C00]/10 text-[#FF5C00]">${statusCfg.label}</span></div>
          <div class="text-xs text-[#A1A1AA] mt-0.5">ETA: <span class="font-mono">${ord.etaDate || 'Chờ xếp lịch'}</span></div>
        </div>
      </div>

      ${ord.customer?.note ? `
        <div class="p-2.5 rounded bg-[#111114] border border-[rgba(255,255,255,0.07)]">
          <span class="text-[11px] text-[#71717A] block">Ghi chú từ khách hàng:</span>
          <p class="text-xs text-[#F4F4F5] italic mt-0.5">"${ord.customer.note}"</p>
        </div>
      ` : ''}

      <div class="space-y-1.5">
        <span class="text-xs font-semibold text-[#F4F4F5] block">Danh sách sản phẩm (${(ord.items || []).length} món)</span>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-[#71717A] border-b border-[rgba(255,255,255,0.07)] font-mono text-[11px]">
              <tr>
                <th class="py-1.5 w-6">#</th>
                <th class="py-1.5">Sản phẩm &amp; Chi tiết</th>
                <th class="py-1.5 text-center w-12">SL</th>
                <th class="py-1.5 text-right w-20">Đơn giá</th>
                <th class="py-1.5 text-right w-24">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex items-center justify-between p-3 rounded bg-[#111114] border border-[rgba(255,255,255,0.07)]">
        <span class="text-xs font-semibold text-[#F4F4F5]">Tổng tiền thanh toán:</span>
        <span class="text-base font-bold font-mono tabular-nums text-[#10B981]">${formatMoney(ord.totals?.finalTotal || ord.totals?.payableTotal || 0)}</span>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function closeAdminOrderDetailModal() {
    const modal = document.getElementById('admin-order-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function openTelegramModal() {
    const modal = document.getElementById('admin-telegram-modal');
    if (!modal) return;
    if (window.TTTelegram && typeof window.TTTelegram.getTelegramConfig === 'function') {
      const cfg = window.TTTelegram.getTelegramConfig();
      const tokenInput = document.getElementById('telegram-bot-token');
      const chatIdInput = document.getElementById('telegram-chat-id');
      const enabledCheckbox = document.getElementById('telegram-notify-enabled');
      const testResult = document.getElementById('telegram-test-result');
      if (tokenInput) tokenInput.value = cfg.token || '';
      
      let safeChatId = (cfg.chatId || '').trim();
      if (!safeChatId || /^0\d{9,10}$/.test(safeChatId)) {
        safeChatId = '8773439139';
      }
      if (chatIdInput) chatIdInput.value = safeChatId;
      if (enabledCheckbox) enabledCheckbox.checked = cfg.enabled !== false;
      if (testResult) {
        testResult.className = 'hidden';
        testResult.innerHTML = '';
      }
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function closeTelegramModal() {
    const modal = document.getElementById('admin-telegram-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  // 8. EXPORT / IMPORT PRODUCTS.JSON & FIRESTORE DATABASE SYNC
  async function syncCatalogToFirestore() {
    const btn = document.getElementById('btn-sync-cloud-db');
    const badge = document.getElementById('cloud-sync-badge');
    const statusDot = document.getElementById('cloud-status-dot');
    const statusText = document.getElementById('cloud-status-text');

    if (!window.TTFirestore || typeof window.TTFirestore.syncAllProducts !== 'function') {
      showToast('Firebase Cloud Firestore chưa sẵn sàng hoặc đang ở chế độ ngoại tuyến.', 'error');
      return;
    }

    try {
      if (btn) btn.classList.add('opacity-70', 'pointer-events-none');
      if (badge) badge.textContent = 'Đang đồng bộ...';
      if (statusText) statusText.textContent = 'Đang đẩy dữ liệu lên Firestore...';
      showToast('Đang tiến hành đồng bộ 55 sản phẩm lên Cloud Firestore...');

      const products = await window.TTCatalogStore.getProducts(false);
      const result = await window.TTFirestore.syncAllProducts(products);

      if (result.ok) {
        showToast(`Đồng bộ thành công ${result.success} sản phẩm và metadata lên Cloud Firestore.`);
        if (badge) {
          badge.textContent = 'Đã đồng bộ';
          badge.className = 'sidebar-tab-num text-[10px] text-[#10B981]';
        }
        if (statusDot) statusDot.className = 'status-dot-6 bg-[#10B981]';
        if (statusText) statusText.textContent = 'Cloud Firestore: Đã kết nối';
      } else {
        showToast(`Đã đồng bộ ${result.success} sản phẩm. Lỗi ${result.failed} mục.`, 'error');
        if (badge) {
          badge.textContent = 'Lỗi';
          badge.className = 'sidebar-tab-num text-[10px] text-[#F43F5E]';
        }
      }
    } catch (err) {
      showToast('Lỗi đồng bộ Cloud Firestore: ' + err.message, 'error');
    } finally {
      if (btn) btn.classList.remove('opacity-70', 'pointer-events-none');
    }
  }

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
    initFirestoreLiveFeed();
  }

  function init() {
    initAuth();
    initTabNavigation();
    initProductForm();

    // Export button
    const btnExport = document.getElementById('btn-export-quick');
    if (btnExport) btnExport.addEventListener('click', exportProductsJson);

    // Sync to Cloud Firestore button
    const btnSyncCloud = document.getElementById('btn-sync-cloud-db');
    if (btnSyncCloud) btnSyncCloud.addEventListener('click', syncCatalogToFirestore);

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

    // -------------------------------------------------------------------------
    // Order Filters & Summaries
    // -------------------------------------------------------------------------
    const timeFilterGroup = document.getElementById('order-time-filter-group');
    if (timeFilterGroup) {
      timeFilterGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-order-time-filter]');
        if (!btn) return;
        const filterVal = btn.dataset.orderTimeFilter;
        orderTimeFilter = filterVal;

        timeFilterGroup.querySelectorAll('[data-order-time-filter]').forEach(b => {
          if (b.dataset.orderTimeFilter === filterVal) {
            b.className = 'px-2.5 py-1 rounded text-xs font-mono font-medium border border-[#FF5C00] bg-[#FF5C00]/15 text-[#FF5C00] transition-colors';
          } else {
            b.className = 'px-2.5 py-1 rounded text-xs font-mono font-medium border border-[rgba(255,255,255,0.07)] hover:border-[#FF5C00]/40 text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors';
          }
        });
        renderOrdersTable();
      });
    }

    const btnApplyCustomDate = document.getElementById('btn-apply-custom-date');
    if (btnApplyCustomDate) {
      btnApplyCustomDate.addEventListener('click', () => {
        const fromVal = document.getElementById('order-date-from')?.value;
        const toVal = document.getElementById('order-date-to')?.value;
        if (!fromVal && !toVal) {
          showToast('Vui lòng chọn ngày bắt đầu hoặc ngày kết thúc.', 'error');
          return;
        }
        orderTimeFilter = 'custom';
        orderCustomDateFrom = fromVal || '';
        orderCustomDateTo = toVal || '';
        renderOrdersTable();
      });
    }

    const orderSearchInput = document.getElementById('search-orders-input');
    if (orderSearchInput) {
      let debounceTimer = null;
      orderSearchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          orderSearchQuery = e.target.value.trim();
          renderOrdersTable();
        }, 150);
      });
    }

    const orderStatusSelect = document.getElementById('filter-order-status');
    if (orderStatusSelect) {
      orderStatusSelect.addEventListener('change', (e) => {
        orderStatusFilter = e.target.value;
        renderOrdersTable();
      });
    }

    // -------------------------------------------------------------------------
    // Telegram Modal & Controls
    // -------------------------------------------------------------------------
    const btnOpenTg = document.getElementById('btn-open-telegram-modal');
    if (btnOpenTg) btnOpenTg.addEventListener('click', openTelegramModal);

    const btnCloseTg = document.getElementById('btn-close-telegram-modal');
    if (btnCloseTg) btnCloseTg.addEventListener('click', closeTelegramModal);

    const btnCancelTg = document.getElementById('btn-cancel-telegram-modal');
    if (btnCancelTg) btnCancelTg.addEventListener('click', closeTelegramModal);

    // Auto-detect Telegram Chat ID button
    const btnAutoChatId = document.getElementById('btn-auto-chat-id');
    if (btnAutoChatId) {
      btnAutoChatId.addEventListener('click', async () => {
        const tokenInput = document.getElementById('telegram-bot-token');
        const chatIdInput = document.getElementById('telegram-chat-id');
        const testResult = document.getElementById('telegram-test-result');
        const token = tokenInput ? tokenInput.value.trim() : '';

        if (!token) {
          if (testResult) {
            testResult.className = 'p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono block';
            testResult.textContent = 'Vui lòng nhập Telegram Bot Token trước khi bấm Tự động dò Chat ID.';
          }
          return;
        }

        btnAutoChatId.disabled = true;
        btnAutoChatId.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-[10px]"></i><span>Đang dò ID...</span>';

        if (window.TTTelegram && typeof window.TTTelegram.detectLatestChatId === 'function') {
          const res = await window.TTTelegram.detectLatestChatId(token);
          btnAutoChatId.disabled = false;
          btnAutoChatId.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles text-[10px]"></i><span>Tự động dò Chat ID</span>';

          if (res.ok) {
            if (chatIdInput) chatIdInput.value = res.chatId;
            if (testResult) {
              testResult.className = 'p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-[#10B981] text-xs font-mono block';
              testResult.textContent = `Đã tìm thấy Chat ID của ${res.senderName}: ${res.chatId}! Bấm "Kiểm tra kết nối" để thử gửi tin nhắn.`;
            }
            showToast(`Đã tìm thấy Chat ID: ${res.chatId}!`);
          } else {
            if (testResult) {
              testResult.className = 'p-3 rounded bg-amber-500/10 border border-amber-500/30 text-[#F59E0B] text-xs font-mono block';
              testResult.textContent = res.error || 'Chưa tìm thấy tin nhắn nào gửi tới bot.';
            }
          }
        }
      });
    }

    // Real-time phone number detection warning on Chat ID input
    const chatIdInput = document.getElementById('telegram-chat-id');
    if (chatIdInput) {
      chatIdInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const testResult = document.getElementById('telegram-test-result');
        if (/^0\d{9,10}$/.test(val)) {
          if (testResult) {
            testResult.className = 'p-3 rounded bg-amber-500/10 border border-amber-500/30 text-[#F59E0B] text-xs font-mono block';
            testResult.innerHTML = `<strong>Lưu ý:</strong> "${val}" là số điện thoại, không phải Telegram Chat ID.<br>Vui lòng mở Telegram bấm <strong>Start</strong> với bot của bạn, rồi bấm <strong>"Tự động dò Chat ID"</strong> hoặc chat với <strong>@userinfobot</strong> để lấy mã ID số nguyên (ví dụ: <code>684920193</code>).`;
          }
        } else if (testResult && testResult.textContent.includes('số điện thoại')) {
          testResult.className = 'hidden';
          testResult.innerHTML = '';
        }
      });
    }

    const btnTestTg = document.getElementById('btn-test-telegram');
    if (btnTestTg) {
      btnTestTg.addEventListener('click', async () => {
        const tokenInput = document.getElementById('telegram-bot-token');
        const chatIdInput = document.getElementById('telegram-chat-id');
        const testResult = document.getElementById('telegram-test-result');
        const token = tokenInput ? tokenInput.value.trim() : '';
        const chatId = chatIdInput ? chatIdInput.value.trim() : '';

        if (!token || !chatId) {
          if (testResult) {
            testResult.className = 'p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono block';
            testResult.textContent = 'Vui lòng nhập đầy đủ Token và Chat ID trước khi kiểm tra.';
          }
          return;
        }

        btnTestTg.disabled = true;
        btnTestTg.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-[10px]"></i><span>Đang gửi test...</span>';

        if (window.TTTelegram && typeof window.TTTelegram.testTelegramConnection === 'function') {
          const res = await window.TTTelegram.testTelegramConnection(token, chatId);
          btnTestTg.disabled = false;
          btnTestTg.innerHTML = '<i class="fa-solid fa-paper-plane text-[10px]"></i><span>Kiểm tra kết nối</span>';

          if (testResult) {
            if (res.ok) {
              if (res.autoResolved && res.realChatId && chatIdInput) {
                chatIdInput.value = res.realChatId;
              }
              testResult.className = 'p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-[#10B981] text-xs font-mono block';
              testResult.textContent = res.message || 'Kết nối thành công! Tin nhắn mẫu đã được gửi tới bot Telegram của bạn.';
              showToast('Kết nối Telegram thành công!');
            } else {
              testResult.className = 'p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono block';
              testResult.textContent = `Lỗi kết nối Telegram: ${res.error || 'Không thể gửi tin nhắn'}`;
            }
          }
        }
      });
    }

    const btnUseKnownId = document.getElementById('btn-use-known-chat-id');
    if (btnUseKnownId) {
      btnUseKnownId.addEventListener('click', () => {
        const chatIdInput = document.getElementById('telegram-chat-id');
        if (chatIdInput) {
          chatIdInput.value = '8773439139';
          showToast('Đã chọn Telegram Chat ID xưởng: 8773439139');
        }
      });
    }

    const btnSaveTg = document.getElementById('btn-save-telegram');
    if (btnSaveTg) {
      btnSaveTg.addEventListener('click', async () => {
        const tokenInput = document.getElementById('telegram-bot-token');
        const chatIdInput = document.getElementById('telegram-chat-id');
        const enabledCheckbox = document.getElementById('telegram-notify-enabled');
        const token = tokenInput ? tokenInput.value.trim() : '';
        const chatId = chatIdInput ? chatIdInput.value.trim() : '';
        const enabled = enabledCheckbox ? enabledCheckbox.checked : true;

        if (window.TTTelegram && typeof window.TTTelegram.saveTelegramConfig === 'function') {
          const res = await window.TTTelegram.saveTelegramConfig({ token, chatId, enabled });
          if (res.ok) {
            showToast('Đã lưu cấu hình Chatbot Telegram thành công!');
            closeTelegramModal();
          } else {
            showToast(`Lỗi lưu cấu hình: ${res.error}`, 'error');
          }
        }
      });
    }

    // -------------------------------------------------------------------------
    // Order Detail Modal Controls
    // -------------------------------------------------------------------------
    const btnCloseDetail = document.getElementById('btn-close-detail-modal');
    if (btnCloseDetail) btnCloseDetail.addEventListener('click', closeAdminOrderDetailModal);

    const btnDetailCloseFooter = document.getElementById('btn-detail-close');
    if (btnDetailCloseFooter) btnDetailCloseFooter.addEventListener('click', closeAdminOrderDetailModal);

    const btnDetailSendTg = document.getElementById('btn-detail-send-tg');
    if (btnDetailSendTg) {
      btnDetailSendTg.addEventListener('click', () => {
        if (!currentDetailOrder) return;
        if (window.TTTelegram && typeof window.TTTelegram.notifyNewOrder === 'function') {
          showToast(`Đang gửi đơn ${currentDetailOrder.orderId || currentDetailOrder.clientRequestId} lên Telegram...`);
          window.TTTelegram.notifyNewOrder(currentDetailOrder).then(res => {
            if (res && res.ok) {
              showToast('Đã gửi thông báo đơn lên Telegram thành công!');
            } else {
              const err = res && res.error ? res.error : (res?.reason === 'unconfigured' ? 'Chưa cấu hình Telegram Bot Token hoặc Chat ID.' : 'Không thể gửi');
              showToast(`Lỗi: ${err}`, 'error');
            }
          }).catch(err => {
            showToast(`Lỗi: ${err.message}`, 'error');
          });
        }
      });
    }

    // -------------------------------------------------------------------------
    // Workshop Order Confirmation Batch & Detail Handlers
    // -------------------------------------------------------------------------
    const btnBatchConfirm = document.getElementById('btn-batch-confirm-orders');
    if (btnBatchConfirm) {
      btnBatchConfirm.addEventListener('click', batchConfirmPendingOrders);
    }

    const btnDetailConfirm = document.getElementById('btn-detail-confirm-order');
    if (btnDetailConfirm) {
      btnDetailConfirm.addEventListener('click', async () => {
        if (!currentDetailOrder) return;
        const ordId = currentDetailOrder.orderId || currentDetailOrder.clientRequestId;
        if (ordId) {
          await confirmOrderQuick(ordId);
          closeAdminOrderDetailModal();
        }
      });
    }

    // -------------------------------------------------------------------------
    // Dual-Track Pipeline Tabs & Packing Slip Controls (Argon 4 Directive)
    // -------------------------------------------------------------------------
    const pipelineTabsGroup = document.getElementById('order-pipeline-tabs');
    if (pipelineTabsGroup) {
      pipelineTabsGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-pipeline-status]');
        if (!btn) return;
        orderPipelineFilter = btn.dataset.pipelineStatus || 'all';

        pipelineTabsGroup.querySelectorAll('[data-pipeline-status]').forEach(b => {
          if (b.dataset.pipelineStatus === orderPipelineFilter) {
            b.className = 'px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-[#FF5C00] bg-[#FF5C00]/15 text-[#FF5C00] flex items-center gap-1.5 transition-colors';
          } else {
            b.className = 'px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-[rgba(255,255,255,0.07)] hover:border-[#FF5C00]/40 text-[#A1A1AA] hover:text-[#F4F4F5] flex items-center gap-1.5 transition-colors';
          }
        });
        renderOrdersTable();
      });
    }

    const btnPrintPackingSlipAction = document.getElementById('btn-print-packing-slip-action');
    if (btnPrintPackingSlipAction) {
      btnPrintPackingSlipAction.addEventListener('click', () => {
        window.print();
      });
    }

    const btnClosePackingSlipModal = document.getElementById('btn-close-packing-slip-modal');
    if (btnClosePackingSlipModal) {
      btnClosePackingSlipModal.addEventListener('click', closePackingSlipModal);
    }

    const btnDetailPrintSlip = document.getElementById('btn-detail-print-slip');
    if (btnDetailPrintSlip) {
      btnDetailPrintSlip.addEventListener('click', () => {
        if (!currentDetailOrder) return;
        const ordId = currentDetailOrder.orderId || currentDetailOrder.clientRequestId;
        if (ordId) {
          openPackingSlipModal(ordId);
        }
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
    filterOrdersByTime,
    calculateOrderSummary,
    confirmOrderQuick,
    startProductionQuick,
    handleOrderNextStep,
    openPackingSlipModal,
    closePackingSlipModal,
    printWorkshopPackingSlip,
    batchConfirmPendingOrders,
    getAllCombinedOrders,
    openTelegramModal,
    closeTelegramModal,
    renderWorkshopSplineChart,
    loadOverviewStats,
    exportProductsJson,
    syncCatalogToFirestore,
    showToast
  };

})(window);
