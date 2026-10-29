/**
 * T&T 3D Labs - Category Hub Showcase & Modern Products Manager
 * Tuân thủ bản chỉ thị phê duyệt GPT-6.1-Sol (Codex Master Controller)
 * Hỗ trợ 55 sản phẩm phân bổ 5 danh mục, 5 Hero Spotlight, bảo mật XSS tuyệt đối
 */

(function (window) {
  'use strict';

  // 1. SHARED CATEGORY REGISTRY (Linked to Central Registry - Codex R10)
  const DEFAULT_CATEGORY_METADATA = {
    Trang_Diem_Vanity: {
      id: 'Trang_Diem_Vanity',
      shortName: 'Trang Điểm & Nơ Lụa',
      title: 'Hộp Đựng Đồ Trang Điểm, Cọ Mỹ Phẩm & Trang Sức Lụa Thắt Nơ',
      accentColor: '#E11D48',
      icon: 'fa-wand-magic-sparkles',
      badgeText: '✦ Coquette Chic'
    },
    Decor_Den_Noi_That: {
      id: 'Decor_Den_Noi_That',
      shortName: 'Đèn & Bình Hoa Decor',
      title: 'Đèn Ngủ Nghệ Thuật, Bình Hoa Đánh Lừa Thị Giác & Tượng Decor',
      accentColor: '#D97706',
      icon: 'fa-lightbulb',
      badgeText: '✦ Ambient Craft'
    },
    Do_Choi_Moc_Khoa: {
      id: 'Do_Choi_Moc_Khoa',
      shortName: 'Khớp Động & Fidget',
      title: 'Đồ Chơi Khớp Động, Móc Khóa Hoạt Hình & Fidget Xả Stress',
      accentColor: '#0284C7',
      icon: 'fa-gamepad',
      badgeText: '✦ Viral Fidget'
    },
    Hop_De_Ban_Tien_Ich: {
      id: 'Hop_De_Ban_Tien_Ich',
      shortName: 'Hộp Bàn & Bánh Răng',
      title: 'Hộp Để Bàn Thông Minh, Cơ Cấu Bánh Răng & Tiện Ích Đa Năng',
      accentColor: '#16A34A',
      icon: 'fa-gears',
      badgeText: '✦ Mechanical Desk'
    },
    Ca_Nhan_Hoa_NFC: {
      id: 'Ca_Nhan_Hoa_NFC',
      shortName: 'Cá Nhân Hóa & NFC',
      title: 'Sản Phẩm Cá Nhân Hóa, Biển Số Xe, Mã QR & Móc Khóa NFC',
      accentColor: '#7C3AED',
      icon: 'fa-fingerprint',
      badgeText: '✦ Smart Custom'
    }
  };

  function getCategoryRegistry() {
    const central = (window.TTCatalogStore && window.TTCatalogStore.CATEGORY_REGISTRY) || window.TTCategoryRegistry;
    if (central && typeof central === 'object') {
      const merged = { ...DEFAULT_CATEGORY_METADATA };
      Object.keys(central).forEach(k => {
        merged[k] = { ...(DEFAULT_CATEGORY_METADATA[k] || {}), ...central[k] };
      });
      return merged;
    }
    return DEFAULT_CATEGORY_METADATA;
  }

  const CATEGORY_REGISTRY = getCategoryRegistry();

  let currentCategoryFilter = 'all';
  let currentSubCategoryFilter = 'all';

  function getBadgeThemeClass(theme) {
    switch (theme) {
      case 'terracotta': return 'badge-theme-terracotta';
      case 'amber': return 'badge-theme-amber';
      case 'rose': return 'badge-theme-rose';
      case 'slate': return 'badge-theme-slate';
      case 'forest': return 'badge-theme-forest';
      case 'sky': return 'badge-theme-sky';
      case 'purple': return 'badge-theme-purple';
      default: return 'badge-theme-default';
    }
  }

  function getBadgeDotClass(theme) {
    switch (theme) {
      case 'terracotta': return 'bg-[#C84B24]';
      case 'amber': return 'bg-[#8C6218]';
      case 'rose': return 'bg-[#E11D48]';
      case 'slate': return 'bg-[#475569]';
      case 'forest': return 'bg-[#166534]';
      case 'sky': return 'bg-[#0369A1]';
      case 'purple': return 'bg-[#6B21A8]';
      default: return 'bg-[#FF5C00]';
    }
  }
  let currentSearchKeyword = '';
  let visibleProductLimit = 8;
  let currentSortMode = 'curated';
  window.cardSelectedColors = window.cardSelectedColors || {};

  // 2. HELPER FUNCTIONS & SANITIZERS
  function formatMoney(amount) {
    const num = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/\D/g, ''), 10) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
  }

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isValidHex(hex) {
    return typeof hex === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex.trim());
  }

  function sanitizeImageUrl(url) {
    if (!url || typeof url !== 'string') return 'assets/images/logo-premium-mark.svg';
    const trimmed = url.trim();
    if (trimmed.startsWith('javascript:')) return 'assets/images/logo-premium-mark.svg';
    // Chặn SVG data URL (nguy cơ XSS payload), chỉ nhận raster images
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

  const MODEL_REGISTRY = new Set(['nfc_wifi', 'pleated_vase', 'soft_lamp', 'desk_dock', 'pegboard', 'monogram']);

  function isSupported3DModel(modelKey) {
    if (!modelKey || typeof modelKey !== 'string') return false;
    const reg = window.TT_3D_MODEL_REGISTRY || MODEL_REGISTRY;
    return reg.has(modelKey.trim());
  }

  function removeVietnameseDiacritics(str) {
    if (!str) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  }

  /**
   * Trích xuất tên ngắn gọn, dễ nhớ (Rebuild Spec F05)
   * Loại bỏ tên tiếng Anh trong ngoặc và mã Model ID #MW-XXXXXX khỏi tiêu đề bán hàng
   */
  function getCleanTitle(rawTitle) {
    if (!rawTitle) return '';
    return String(rawTitle).replace(/\s*\([^)]*\)/g, '').replace(/#MW-\d+/g, '').trim();
  }

  function getStoredProducts() {
    if (window.TTCatalogStore && typeof window.TTCatalogStore.getProductsSync === 'function') {
      return window.TTCatalogStore.getProductsSync(true);
    }
    return [];
  }

  /**
   * Chọn sản phẩm Hero đại diện danh mục theo thứ tự Codex phê duyệt
   */
  function getCategoryHero(catId, products) {
    const catProducts = products.filter(p => p.category === catId && (p.status || 'active') === 'active');
    if (catProducts.length === 0) return null;

    const explicit = catProducts.find(p => p.isHero === true);
    if (explicit) return explicit;

    return [...catProducts].sort((a, b) => {
      if ((b.selectionScore || 0) !== (a.selectionScore || 0)) {
        return (b.selectionScore || 0) - (a.selectionScore || 0);
      }
      if ((b.prints || 0) !== (a.prints || 0)) {
        return (b.prints || 0) - (a.prints || 0);
      }
      if ((b.downloads || 0) !== (a.downloads || 0)) {
        return (b.downloads || 0) - (a.downloads || 0);
      }
      if ((b.likes || 0) !== (a.likes || 0)) {
        return (b.likes || 0) - (a.likes || 0);
      }
      return String(a.modelId || a.id).localeCompare(String(b.modelId || b.id));
    })[0];
  }

  // 3. HTML TEMPLATE BUILDERS (XSS-Safe)
  function buildProductCardHTML(item) {
    const safeImage = sanitizeImageUrl(item.image);
    const priceFormatted = formatMoney(item.price);
    const originalPriceFormatted = item.originalPrice ? formatMoney(item.originalPrice) : '';

    const swatches = (Array.isArray(item.colors) && item.colors.length > 0) ? item.colors : [
      { id: 'black', name: 'Đen Obsidian', hex: '#26282B' },
      { id: 'white', name: 'Trắng Sứ Nordic', hex: '#F5F2EB' },
      { id: 'terracotta', name: 'Cam Đất Mờ', hex: '#C85A32' }
    ];

    const currentSwatchId = window.cardSelectedColors[item.id] || swatches[0].id;
    const currentSwatch = swatches.find(s => s.id === currentSwatchId) || swatches[0];

    const cleanTitle = item.cleanTitle || getCleanTitle(item.title);
    const sp = item.specs || {};
    const specLine = item.microSpecs || item.specLine || (sp.dimensions ? `📐 ${sp.dimensions} • ${sp.material || 'Bio-PLA'}` : '🌱 Nhựa Bio-PLA • 0.16mm');

    const badgeText = item.archetypeBadge || item.badge;
    const badgeTheme = item.badgeTheme || 'default';
    const isNFC = item.category === 'Ca_Nhan_Hoa_NFC' && (item.type === 'nfc' || (item.title && (item.title.toLowerCase().includes('nfc') || item.title.toLowerCase().includes('wifi'))));

    return `
      <article class="minimal-product-card studio-product-card group cursor-pointer" data-product-id="${escapeHTML(item.id)}">
        <!-- Clean Product Visual Frame -->
        <button type="button" aria-label="Xem ${escapeHTML(cleanTitle)}" data-action="open-detail" data-product-id="${escapeHTML(item.id)}" class="product-image-box relative overflow-hidden group">
          <img src="${safeImage}" 
               width="600" 
               height="600" 
               loading="lazy" 
               decoding="async" 
               alt="${escapeHTML(item.imageAlt || cleanTitle)}" 
               id="img-${escapeHTML(item.id)}"
               class="studio-crisp-img w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
          
          <!-- Archetype & Engineering Badge (Unique per item) -->
          ${badgeText ? `
            <div class="absolute top-2.5 left-2.5 pointer-events-none z-10">
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold ${getBadgeThemeClass(badgeTheme)} shadow-xs flex items-center gap-1.5 border">
                <span class="w-1.5 h-1.5 rounded-full ${getBadgeDotClass(badgeTheme)}"></span>
                <span>${escapeHTML(badgeText)}</span>
              </span>
            </div>
          ` : (isNFC ? `
            <div class="absolute top-2.5 left-2.5 pointer-events-none z-10">
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#FAF5FF] text-[#6B21A8] border border-[#E9D5FF] shadow-xs flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#6B21A8]"></span>
                <span>Chip NFC 1-Chạm</span>
              </span>
            </div>
          ` : '')}
        </button>

        <!-- Card Content Body -->
        <div class="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 sm:gap-4">
          <div class="space-y-1.5">
            
            <!-- Color Swatches Row (Interactive) -->
            <div class="product-card-colors flex items-center justify-between">
              <div class="swatch-group">
                ${swatches.map((c) => {
                  const safeHex = isValidHex(c.hex) ? c.hex : '#26282B';
                  const isActive = c.id === currentSwatch.id;
                  return `
                    <button type="button" 
                            class="swatch-dot ${isActive ? 'active' : ''}" 
                            style="background-color: ${safeHex};" 
                            title="${escapeHTML(c.name)}" 
                            data-action="swatch-select"
                            data-product-id="${escapeHTML(item.id)}"
                            data-swatch-id="${escapeHTML(c.id)}"
                            data-swatch-name="${escapeHTML(c.name)}"
                            aria-label="Chọn màu ${escapeHTML(c.name)}" aria-pressed="${isActive}"></button>
                  `;
                }).join('')}
              </div>
              <span class="text-[11px] font-medium text-secondary-color truncate max-w-[120px]" id="swatch-name-${escapeHTML(item.id)}">
                ${escapeHTML(currentSwatch.name)}
              </span>
            </div>

            <!-- Micro-Eyebrow Context (Use Case & Placement) -->
            ${item.useCaseEyebrow ? `
              <div class="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase text-[#8C6218] truncate pt-1">
                ${escapeHTML(item.useCaseEyebrow)}
              </div>
            ` : ''}

            <!-- Product Title (Clean, short, readable) -->
            <h3 class="product-card-title text-xs sm:text-sm font-bold font-display text-primary-color line-clamp-2 group-hover:text-[#FF5C00] transition-colors" title="${escapeHTML(cleanTitle)}">
              ${escapeHTML(cleanTitle)}
            </h3>

            <!-- 1-Line Headline Benefit -->
            <p class="product-card-benefit text-secondary-color line-clamp-2 leading-relaxed text-xs">
              ${escapeHTML(item.headlineBenefit || item.desc || '')}
            </p>

            <!-- Micro-Specs Line -->
            <div class="text-[10px] sm:text-[11px] font-mono text-muted pt-0.5 truncate">
              ${escapeHTML(specLine)}
            </div>
          </div>

          <!-- Price & Action Button Row -->
          <div class="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 mt-auto">
            <div>
              <div class="price-display leading-none text-xs sm:text-sm font-bold font-mono text-[#FF5C00]">${priceFormatted}</div>
              ${originalPriceFormatted ? `<div class="text-[10px] sm:text-[11px] text-muted line-through mt-0.5">${originalPriceFormatted}</div>` : ''}
            </div>

            <!-- Quick Add to Cart Button -->
            <button type="button" 
                    class="btn-primary text-[11px] sm:text-xs !py-2 !px-3 sm:!px-4 shrink-0" 
                    data-action="configure-product"
                    data-product-id="${escapeHTML(item.id)}"
                    title="Xem và chọn phiên bản">
              <i class="fa-solid fa-arrow-right text-xs pointer-events-none"></i>
              <span class="pointer-events-none">Xem &amp; chọn</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function buildHeroSpotlightHTML(item, categoryMeta) {
    if (!item) return '';

    const safeImage = sanitizeImageUrl(item.image);
    const priceFormatted = formatMoney(item.price);
    const originalPriceFormatted = item.originalPrice ? formatMoney(item.originalPrice) : '';
    const cleanTitle = getCleanTitle(item.title);

    const sp = item.specs || {};
    const specTags = [
      sp.dimensions ? `📐 ${sp.dimensions}` : '📐 Kích thước chuẩn',
      sp.weight ? `⚖️ ${sp.weight}` : '⚖️ Nhẹ bền',
      item.materialRecommendation ? `🌱 ${item.materialRecommendation}` : '🌱 Bio-PLA Cao Cấp'
    ];

    return `
      <div class="studio-hero-spotlight p-5 sm:p-7 lg:p-8" data-product-id="${escapeHTML(item.id)}">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          <!-- Left Packshot Image (Desktop 5 cols) -->
          <div class="lg:col-span-5 relative">
            <div class="hero-spotlight-image-box cursor-pointer relative overflow-hidden group rounded-2xl border border-[var(--border-subtle)]" data-action="open-detail" data-product-id="${escapeHTML(item.id)}">
              <img src="${safeImage}" 
                   alt="${escapeHTML(item.imageAlt || cleanTitle)}" 
                   width="700" 
                   height="700" 
                   loading="lazy" 
                   class="studio-crisp-img w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                   onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">

              <!-- Subtle clean badge -->
              <div class="absolute top-3 left-3 z-10 pointer-events-none">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-[#20231F] border border-[#DCDDD5] shadow-sm flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-[#FF5C00]"></span>
                  <span>${escapeHTML(categoryMeta ? categoryMeta.shortName : '✦ Nổi Bật')}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Right Content & Actions (Desktop 7 cols) -->
          <div class="lg:col-span-7 flex flex-col justify-between space-y-4 text-left">
            
            <div class="space-y-3">
              <!-- Category Micro Tagline -->
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-50 border border-orange-200 text-[#C44800]">
                  <i class="fa-solid ${categoryMeta ? categoryMeta.icon : 'fa-sparkles'} text-xs"></i>
                  <span>${escapeHTML(categoryMeta ? categoryMeta.badgeText : '✦ Spotlight')}</span>
                </span>
              </div>

              <!-- Title -->
              <h3 class="text-lg sm:text-2xl font-extrabold font-display text-primary-color leading-tight hover:text-[#FF5C00] transition-colors cursor-pointer" data-action="open-detail" data-product-id="${escapeHTML(item.id)}">
                ${escapeHTML(cleanTitle)}
              </h3>

              <!-- Headline Benefit -->
              <p class="text-xs sm:text-sm text-secondary-color leading-relaxed">
                ${escapeHTML(item.headlineBenefit || item.desc || '')}
              </p>

              <!-- Spec Chips -->
              <div class="flex flex-wrap gap-2 pt-1">
                ${specTags.map(tag => `
                  <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-secondary-color">
                    ${escapeHTML(tag)}
                  </span>
                `).join('')}
              </div>
            </div>

            <!-- Price & Actions Row -->
            <div class="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-[11px] text-secondary-color block font-mono">Đơn giá hoàn thiện:</span>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl sm:text-2xl font-black font-mono text-[#FF5C00]">${priceFormatted}</span>
                  ${originalPriceFormatted ? `<span class="text-xs font-mono text-muted line-through">${originalPriceFormatted}</span>` : ''}
                </div>
              </div>

              <div class="flex items-center gap-2.5">
                <button type="button" 
                        class="btn-secondary text-xs !py-2.5 !px-4" 
                        data-action="open-detail" 
                        data-product-id="${escapeHTML(item.id)}">
                  <span>Xem Chi Tiết</span>
                </button>

                <button type="button" 
                        class="btn-primary text-xs !py-2.5 !px-5 shadow-sm" 
                        data-action="quick-add-cart" 
                        data-product-id="${escapeHTML(item.id)}">
                  <i class="fa-solid fa-bag-shopping mr-1.5 pointer-events-none"></i>
                  <span class="pointer-events-none">Thêm Vào Giỏ</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  // 4. MAIN STORE RENDER DISPATCHER
  function renderSubCategoryFilters(currentCategory) {
    const subFilterContainer = document.getElementById('store-sub-filters');
    if (!subFilterContainer) return;

    const allProducts = getStoredProducts().filter(p => (p.status || 'active') === 'active');
    const relevantProducts = currentCategory === 'all' 
      ? allProducts 
      : allProducts.filter(p => p.category === currentCategory);

    // Collect distinct subCategories with count
    const subCatMap = new Map();
    relevantProducts.forEach(p => {
      if (p.subCategory && p.subCategoryName) {
        if (!subCatMap.has(p.subCategory)) {
          subCatMap.set(p.subCategory, { name: p.subCategoryName, count: 0 });
        }
        subCatMap.get(p.subCategory).count++;
      }
    });

    if (subCatMap.size <= 1 && currentCategory !== 'all') {
      subFilterContainer.innerHTML = '';
      subFilterContainer.classList.add('hidden');
      return;
    }
    subFilterContainer.classList.remove('hidden');

    const totalCount = relevantProducts.length;
    let html = `
      <button type="button" 
              class="sub-filter-pill ${currentSubCategoryFilter === 'all' ? 'active' : ''}" 
              data-sub-category="all" 
              aria-pressed="${currentSubCategoryFilter === 'all'}">
        <span>Tất Cả</span>
        <span class="sub-pill-count">${totalCount}</span>
      </button>
    `;

    subCatMap.forEach((meta, subId) => {
      const isActive = currentSubCategoryFilter === subId;
      html += `
        <button type="button" 
                class="sub-filter-pill ${isActive ? 'active' : ''}" 
                data-sub-category="${escapeHTML(subId)}" 
                aria-pressed="${isActive}">
          <span>${escapeHTML(meta.name)}</span>
          <span class="sub-pill-count">${meta.count}</span>
        </button>
      `;
    });

    subFilterContainer.innerHTML = html;
  }

  function renderStoreProducts(filter = currentCategoryFilter, keepPage = false, updateSubFilters = true) {
    if (filter !== currentCategoryFilter) {
      currentCategoryFilter = filter;
      currentSubCategoryFilter = 'all';
    } else {
      currentCategoryFilter = filter;
    }

    if (!keepPage) visibleProductLimit = 8;
    if (updateSubFilters) {
      renderSubCategoryFilters(currentCategoryFilter);
    }

    const container = document.getElementById('store-product-grid');
    if (!container) return;
    const keyword = removeVietnameseDiacritics(currentSearchKeyword).trim();
    let matches = getStoredProducts().filter(product => {
      if ((product.status || 'active') !== 'active') return false;
      if (currentCategoryFilter !== 'all' && product.category !== currentCategoryFilter) return false;
      if (currentSubCategoryFilter !== 'all' && product.subCategory !== currentSubCategoryFilter) return false;
      return !keyword || removeVietnameseDiacritics([
        product.title, product.cleanTitle, product.desc, product.modelId, product.id,
        product.useCaseEyebrow, product.archetypeBadge, product.subCategoryName
      ].filter(Boolean).join(' ')).includes(keyword);
    });
    if (currentSortMode === 'price-asc') matches.sort((a,b) => a.price - b.price);
    if (currentSortMode === 'price-desc') matches.sort((a,b) => b.price - a.price);
    const count = document.getElementById('store-results-count');
    const visible = matches.slice(0, visibleProductLimit);
    if (count) count.textContent = matches.length ? `${matches.length} sản phẩm · Đang hiển thị ${visible.length}` : 'Không có sản phẩm phù hợp';
    if (!matches.length) {
      container.innerHTML = `<div class="minimal-empty"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><h3>Chưa tìm thấy món bạn cần.</h3><p>Thử một tên khác hoặc bỏ bớt bộ lọc.</p><button type="button" data-action="clear-search" class="btn-secondary">Xóa tìm kiếm</button><button type="button" data-action="view-category" data-category="all" class="minimal-text-action">Xem tất cả danh mục</button></div>`;
      return;
    }
    const extra = matches.length - visible.length;
    container.innerHTML = `<div class="minimal-product-grid">${visible.map(buildProductCardHTML).join('')}</div><div class="minimal-pagination">${extra > 0 ? `<button type="button" class="btn-secondary" data-action="load-more">Xem thêm ${Math.min(8, extra)} sản phẩm <span aria-hidden="true">↓</span></button>` : '<span>Bạn đã xem hết các sản phẩm phù hợp.</span>'}</div>`;
  }

  // 5. EVENT DELEGATION ON CONTAINER (Zero Inline Onclick XSS Vulnerability)
  function initEventDelegation() {
    const container = document.getElementById('store-product-grid');
    if (!container) return;
    const subFilterContainer = document.getElementById('store-sub-filters');
    if (subFilterContainer && !subFilterContainer.dataset.bound) {
      subFilterContainer.dataset.bound = 'true';
      subFilterContainer.addEventListener('click', (e) => {
        const pill = e.target.closest('.sub-filter-pill');
        if (!pill) return;
        const subCat = pill.dataset.subCategory || 'all';
        currentSubCategoryFilter = subCat;
        visibleProductLimit = 8;
        renderStoreProducts(currentCategoryFilter, false, false);
        subFilterContainer.querySelectorAll('.sub-filter-pill').forEach(p => {
          const isActive = (p.dataset.subCategory || 'all') === subCat;
          p.classList.toggle('active', isActive);
          p.setAttribute('aria-pressed', String(isActive));
        });
      });
    }


    const sortInput = document.getElementById('store-sort-input');
    if (sortInput) sortInput.addEventListener('change', () => {
      currentSortMode = ['price-asc', 'price-desc'].includes(sortInput.value) ? sortInput.value : 'curated';
      renderStoreProducts(currentCategoryFilter);
    });
    container.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="load-more"]')) {
        const previousCount = visibleProductLimit;
        visibleProductLimit += 8;
        renderStoreProducts(currentCategoryFilter, true);
        // Re-render replaces the clicked button: place focus on the first new card.
        const nextCard = container.querySelectorAll('.studio-product-card')[previousCount];
        const target = nextCard && nextCard.querySelector('[data-action="open-detail"]');
        if (target) target.focus({ preventScroll: true });
        return;
      }

      const configureButton = e.target.closest('[data-action="configure-product"]');
      if (configureButton) {
        e.stopPropagation();
        if (configureButton.dataset.productId) window.openProductDetailModal(configureButton.dataset.productId);
        return;
      }
      // 1. Swatch selection on card
      const swatchBtn = e.target.closest('[data-action="swatch-select"]');
      if (swatchBtn) {
        e.stopPropagation();
        const prodId = swatchBtn.dataset.productId;
        const swatchId = swatchBtn.dataset.swatchId;
        const swatchName = swatchBtn.dataset.swatchName;

        window.cardSelectedColors[prodId] = swatchId;

        const parentGroup = swatchBtn.parentElement;
        if (parentGroup) {
          parentGroup.querySelectorAll('.swatch-dot').forEach(d => { d.classList.remove('active'); d.setAttribute('aria-pressed', 'false'); });
          swatchBtn.classList.add('active');
          swatchBtn.setAttribute('aria-pressed', 'true');
        }

        const nameLabel = document.getElementById(`swatch-name-${prodId}`);
        if (nameLabel) nameLabel.textContent = swatchName;
        return;
      }

      // 2. View Category click
      const viewCatBtn = e.target.closest('[data-action="view-category"]');
      if (viewCatBtn) {
        e.preventDefault();
        const cat = viewCatBtn.dataset.category || 'all';
        if (typeof window.navigateToCategory === 'function') {
          window.navigateToCategory(cat, true);
        } else {
          renderStoreProducts(cat);
        }
        return;
      }

      // 3. Quick Add to Cart button
      const quickAddBtn = e.target.closest('[data-action="quick-add-cart"]');
      if (quickAddBtn) {
        e.stopPropagation();
        const prodId = quickAddBtn.dataset.productId;
        if (prodId) window.quickAddToCart(prodId);
        return;
      }

      // 4. Hero Add to Cart button
      const heroAddBtn = e.target.closest('[data-action="hero-add-cart"]');
      if (heroAddBtn) {
        e.stopPropagation();
        const prodId = heroAddBtn.dataset.productId;
        if (prodId) window.quickAddToCart(prodId);
        return;
      }

      // 5. Hero Buy Now button (Direct Order)
      const heroBuyBtn = e.target.closest('[data-action="hero-buy-now"]');
      if (heroBuyBtn) {
        e.stopPropagation();
        const prodId = heroBuyBtn.dataset.productId;
        if (prodId) window.openProductDetailModal(prodId);
        return;
      }

      // 6. 3D Viewer launcher button
      const viewerBtn = e.target.closest('[data-action="open-3d"]');
      if (viewerBtn) {
        e.stopPropagation();
        const prodId = viewerBtn.dataset.productId;
        if (prodId && typeof window.open3DViewerById === 'function') {
          window.open3DViewerById(prodId);
        }
        return;
      }

      // 7. Clear search button
      const clearSearchBtn = e.target.closest('[data-action="clear-search"]');
      if (clearSearchBtn) {
        e.stopPropagation();
        const searchInput = document.getElementById('store-search-input');
        const clearBtn = document.getElementById('store-search-clear');
        if (searchInput) searchInput.value = '';
        if (clearBtn) clearBtn.classList.add('hidden');
        currentSearchKeyword = '';
        renderStoreProducts(currentCategoryFilter);
        return;
      }

      // 8. Open Detail from card click
      const card = e.target.closest('.studio-product-card');
      if (card) {
        const prodId = card.dataset.productId;
        if (prodId) window.openProductDetailModal(prodId);
        return;
      }

      // 9. Open Detail from Hero Card title/image
      const heroDetailTarget = e.target.closest('[data-action="open-detail"]');
      if (heroDetailTarget) {
        const prodId = heroDetailTarget.dataset.productId;
        if (prodId) window.openProductDetailModal(prodId);
        return;
      }
    });
  }

  // 6. QUICK ADD TO CART
  window.quickAddToCart = function (prodId) {
    const products = getStoredProducts();
    const item = products.find(p => p.id === prodId);
    if (!item || item.status !== 'active') return;

    // Nếu sản phẩm yêu cầu cá nhân hóa: mở modal để người dùng nhập thông tin
    if (item.type === 'monogram' || (item.specs && item.specs.requireCustomText)) {
      window.openProductDetailModal(prodId);
      if (window.showToast) {
        window.showToast('Vui lòng chọn cấu hình và nhập nội dung cá nhân hóa.');
      }
      return;
    }

    const cardPreSelectedColorId = window.cardSelectedColors ? window.cardSelectedColors[prodId] : null;
    let line = null;
    if (window.TTPurchaseConfig && typeof window.TTPurchaseConfig.buildConfiguredLine === 'function') {
      try {
        line = window.TTPurchaseConfig.buildConfiguredLine(prodId, {
          colorId: cardPreSelectedColorId,
          materialId: (item.materials && item.materials[0]) ? item.materials[0].id : null,
          qty: 1
        });
      } catch (err) {
        window.openProductDetailModal(prodId);
        return;
      }
    } else {
      console.warn('[ProductsManager] TTPurchaseConfig chưa sẵn sàng.');
      window.openProductDetailModal(prodId);
      return;
    }

    if (window.TTCart && typeof window.TTCart.addToCart === 'function') {
      window.TTCart.addToCart(line);
      window.TTCart.openCart();
      if (window.showToast) {
        window.showToast(`Đã thêm "${item.title}" (${line.colorName}) vào giỏ hàng!`);
      }
    }
  };

  // 7. PRODUCT DETAIL MODAL CONTROLLER
  let productModalPreviousActiveElement = null;

  window.openProductDetailModal = function (prodId) {
    const products = getStoredProducts();
    const item = products.find(p => p.id === prodId);
    if (!item) return;

    const modal = document.getElementById('order-modal');
    if (!modal) return;

    if (typeof document !== 'undefined' && document.activeElement) {
      productModalPreviousActiveElement = document.activeElement;
    }

    window.modalActiveProduct = item;
    window.modalQty = 1;

    const cardPreSelectedColorId = window.cardSelectedColors ? window.cardSelectedColors[prodId] : null;
    let initialColor = null;
    if (Array.isArray(item.colors) && item.colors.length > 0) {
      if (cardPreSelectedColorId) {
        initialColor = item.colors.find(c => c.id === cardPreSelectedColorId) || item.colors[0];
      } else {
        initialColor = item.colors[0];
      }
    } else {
      initialColor = { id: 'c_default', name: 'Đen Mờ Nhám', hex: '#1E2022' };
    }
    window.modalSelectedColor = initialColor;

    const initialMat = (Array.isArray(item.materials) && item.materials.length > 0)
      ? item.materials[0]
      : { id: 'pla_matte', name: 'PLA Matte', label: 'PLA Matte Thẩm Mỹ', desc: 'Bề mặt mờ mịn cao cấp', priceModifier: 0 };
    window.modalSelectedMat = initialMat;

    // Fill Visuals with Safe Text / DOM API
    const imgEl = document.getElementById('order-prod-img');
    const badgeEl = document.getElementById('order-prod-badge');
    const titleEl = document.getElementById('order-prod-title');
    const descEl = document.getElementById('order-prod-desc');
    const specsEl = document.getElementById('order-prod-specs-box');
    const swatchesEl = document.getElementById('order-swatches-box');
    const matsEl = document.getElementById('order-materials-box');
    const customInput = document.getElementById('order-custom-text-input');
    const customCount = document.getElementById('order-custom-text-count');
    const qtyVal = document.getElementById('modal-qty-val');
    const btnModal3D = document.getElementById('order-modal-3d-btn') || document.getElementById('btn-modal-open-3d');

    if (imgEl) {
      imgEl.src = sanitizeImageUrl(item.image);
      imgEl.alt = item.imageAlt || getCleanTitle(item.title) || 'Ảnh sản phẩm';
      imgEl.onerror = function () {
        this.onerror = null;
        this.src = 'assets/images/logo-premium-mark.svg';
      };
    }
    if (badgeEl) {
      badgeEl.textContent = item.badge || '✦ Studio Craft';
    }

    // Tầng 2: Điền thông số CAD HUD tiếng Việt sắc nét cho Modal
    const techData = (typeof window !== 'undefined' && window.TT3DVisualRenderer && window.TT3DVisualRenderer.getTechData)
      ? window.TT3DVisualRenderer.getTechData(item.category)
      : { badge: '⚡ CHIP NTAG215 ĐÚC CHÌM', dimensionText: '├── 120.0 mm ──┤', layerHeight: '0.16MM BAMBU LAB' };

    const hudBadge = document.getElementById('order-hud-badge-text');
    if (hudBadge) hudBadge.textContent = techData.badge;

    const hudRulerDim = document.getElementById('order-hud-ruler-dim');
    if (hudRulerDim) hudRulerDim.textContent = techData.dimensionText;

    const hudRulerLayer = document.getElementById('order-hud-ruler-layer');
    if (hudRulerLayer) hudRulerLayer.textContent = `LỚP IN: ${techData.layerHeight}`;

    // Khởi tạo chế độ xem mặc định Studio
    if (typeof window.setModalImageViewMode === 'function') {
      window.setModalImageViewMode('studio');
    }

    if (titleEl) titleEl.textContent = getCleanTitle(item.title);
    if (descEl) descEl.textContent = item.desc || item.headlineBenefit || '';

    // Per-SKU Option Schema (Audited Standard F15: Tùy chọn riêng theo từng sản phẩm)
    const customContainer = document.getElementById('order-custom-text-container') || (customInput ? customInput.closest('.space-y-1\\.5') : null);
    const customLabel = document.getElementById('order-custom-text-label');

    const isNFC = item.category === 'Ca_Nhan_Hoa_NFC' && (item.type === 'nfc' || (item.title && (item.title.toLowerCase().includes('nfc') || item.title.toLowerCase().includes('wifi') || item.title.toLowerCase().includes('qr'))));
    const isCustomText = item.category === 'Ca_Nhan_Hoa_NFC' && (item.type === 'monogram' || (item.title && (item.title.includes('Biển số') || item.title.includes('Biển tên') || item.title.includes('Logo') || item.title.includes('tùy biến') || item.title.includes('Khắc'))));

    if (customContainer) {
      if (isNFC) {
        customContainer.classList.remove('hidden');
        if (customLabel) customLabel.innerHTML = '<i class="fa-solid fa-wifi text-[#FF5C00]"></i><span>Cài đặt chip NFC 1-chạm (WiFi / Link quán / Trang cá nhân):</span>';
        if (customInput) customInput.placeholder = 'Ví dụ: WiFi: T&T Coffee / Pass: 88888888 hoặc https://menu.quan.vn';
      } else if (isCustomText) {
        customContainer.classList.remove('hidden');
        if (customLabel) customLabel.innerHTML = '<i class="fa-solid fa-pen-nib text-[#FF5C00]"></i><span>Nội dung chữ / Số điện thoại khắc lên sản phẩm:</span>';
        if (customInput) customInput.placeholder = 'Ví dụ: Số ĐT 0986xxxxxx hoặc Tên "Quân & Trang"';
      } else {
        // Không hỗ trợ cá nhân hóa -> Ẩn hoàn toàn trường này (Khay trang sức, bình hoa, đèn...) (Fix F15)
        customContainer.classList.add('hidden');
      }
    }

    if (customInput) {
      customInput.value = '';
      customInput.oninput = () => {
        if (customCount) customCount.textContent = `${customInput.value.length}/100`;
      };
    }
    if (customCount) customCount.textContent = '0/100';
    if (qtyVal) qtyVal.textContent = '1';

    // Show or hide Modal 3D Viewer button based on modelRegistry (Codex Section 5.4 F01)
    const hasValidModel = isSupported3DModel(item.modelKey);

    if (btnModal3D) {
      if (hasValidModel) {
        btnModal3D.hidden = false;
        btnModal3D.disabled = false;
        btnModal3D.classList.remove('hidden');
      } else {
        btnModal3D.hidden = true;
        btnModal3D.disabled = true;
        btnModal3D.classList.add('hidden');
      }
    }

    // Technical Specs Grid (Safe markup)
    if (specsEl) {
      const sp = item.specs || {};
      const specsList = [
        { label: 'Dài × rộng × cao', val: sp.dimensions || 'Chưa có số đo — cần xác nhận với xưởng' },
        { label: 'Khối lượng', val: sp.weight || 'Xưởng xác nhận theo mẫu' },
        { label: 'Vật liệu đang chọn', val: initialMat.label || initialMat.name, kind: 'material' },
        { label: 'Đổi trả', val: sp.warranty || 'Theo chính sách của xưởng' }
      ];

      if (sp.nfc) {
        specsList.push({ label: 'Chip NFC', val: sp.nfc, isAccent: true });
      }

      specsEl.innerHTML = '';
      specsList.forEach(s => {
        const wrap = document.createElement('div');
        wrap.className = 'space-y-0.5';

        const dt = document.createElement('dt');
        dt.className = 'text-[11px] uppercase tracking-wider text-secondary-color font-medium';
        dt.textContent = s.label;

        const dd = document.createElement('dd');
        dd.className = `font-mono font-semibold ${s.isAccent ? 'text-[#FF5C00]' : 'text-primary-color'} truncate`;
        dd.textContent = s.val;
        if (s.kind) dd.dataset.specKind = s.kind;

        wrap.appendChild(dt);
        wrap.appendChild(dd);
        specsEl.appendChild(wrap);
      });
    }

    // Swatches in Modal (Dùng createElement & textContent, loại bỏ inline onclick XSS - Codex F07)
    if (swatchesEl) {
      const colors = (Array.isArray(item.colors) && item.colors.length > 0) ? item.colors : [initialColor];

      swatchesEl.innerHTML = `
        <div class="flex items-center justify-between text-xs font-semibold text-secondary-color mb-1.5">
          <span>Chọn màu sắc:</span>
          <span id="modal-color-name" class="text-primary-color font-bold"></span>
        </div>
        <div class="flex flex-wrap gap-2.5" id="modal-swatches-list"></div>
      `;
      const colorLabel = document.getElementById('modal-color-name');
      if (colorLabel) colorLabel.textContent = initialColor.name;

      const swatchesListEl = document.getElementById('modal-swatches-list');
      if (swatchesListEl) {
        colors.forEach(c => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `modal-color-btn px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${c.id === initialColor.id ? 'border-[#FF5C00] bg-[rgba(255,92,0,0.12)] text-primary-color ring-2 ring-[#FF5C00]/30' : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-secondary-color hover:border-slate-500'}`;
          btn.dataset.action = 'modal-select-color';
          btn.dataset.colorId = c.id;
          btn.setAttribute('aria-pressed', String(c.id === initialColor.id));

          const dot = document.createElement('span');
          dot.className = 'w-3.5 h-3.5 rounded-full border border-black/20 shrink-0';
          dot.style.backgroundColor = isValidHex(c.hex) ? c.hex : '#26282B';

          const nameSpan = document.createElement('span');
          nameSpan.textContent = c.name;

          btn.appendChild(dot);
          btn.appendChild(nameSpan);
          swatchesListEl.appendChild(btn);
        });
      }
    }

    // Materials in Modal (Dùng createElement & textContent - Codex F07)
    if (matsEl) {
      const materials = (Array.isArray(item.materials) && item.materials.length > 0) ? item.materials : [initialMat];

      matsEl.innerHTML = `
        <div class="text-xs font-semibold text-secondary-color mb-1.5">Vật liệu in:</div>
        <div class="space-y-2" id="modal-materials-list"></div>
      `;
      const matsListEl = document.getElementById('modal-materials-list');
      if (matsListEl) {
        materials.forEach((m, i) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `modal-mat-btn w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${i === 0 ? 'border-[#FF5C00] bg-[var(--bg-surface-elevated)] ring-1 ring-[#FF5C00]/40' : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-slate-600'}`;
          btn.dataset.action = 'modal-select-material';
          btn.dataset.matId = m.id;
          btn.setAttribute('aria-pressed', String(i === 0));

          const left = document.createElement('div');
          const header = document.createElement('div');
          header.className = 'text-xs font-bold text-primary-color flex items-center gap-2';

          const labelSpan = document.createElement('span');
          labelSpan.textContent = m.label || m.name;
          header.appendChild(labelSpan);

          if (i === 0) {
            const badge = document.createElement('span');
            badge.className = 'text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-[#FF5C00]/15 text-[#FF5C00]';
            badge.textContent = 'Khuyên dùng';
            header.appendChild(badge);
          }

          const descDiv = document.createElement('div');
          descDiv.className = 'text-[11px] text-secondary-color mt-0.5';
          descDiv.textContent = m.desc || '';

          left.appendChild(header);
          left.appendChild(descDiv);
          btn.appendChild(left);

          if (m.priceModifier > 0) {
            const modSpan = document.createElement('span');
            modSpan.className = 'text-xs font-mono font-bold text-[#FF5C00] ml-3 shrink-0';
            modSpan.textContent = `+${formatMoney(m.priceModifier)}`;
            btn.appendChild(modSpan);
          }

          matsListEl.appendChild(btn);
        });
      }
    }

    // Đăng ký event delegation một lần cho swatches và materials trong modal
    if (!modal._hasDelegation) {
      modal.addEventListener('click', (e) => {
        const colorBtn = e.target.closest('[data-action="modal-select-color"]');
        if (colorBtn) {
          const colorId = colorBtn.dataset.colorId;
          window.selectModalColorById(colorId, colorBtn);
          return;
        }
        const matBtn = e.target.closest('[data-action="modal-select-material"]');
        if (matBtn) {
          const matId = matBtn.dataset.matId;
          window.selectModalMaterialById(matId, matBtn);
          return;
        }
      });
      modal._hasDelegation = true;
    }

    window.updateModalPriceSummary();
    modal.classList.remove('hidden');
    modal.classList.add('flex', 'active');
    if (window.TTProductExperience) window.TTProductExperience.refresh(item);
    if (document.body && document.body.style) {
      document.body.style.overflow = 'hidden';
    }
    setTimeout(() => {
      const closeBtn = document.getElementById('order-modal-close-btn');
      if (closeBtn && typeof closeBtn.focus === 'function') {
        try { closeBtn.focus(); } catch (_) {}
      }
    }, 50);
  };

  window.selectModalColorById = function (colorId, btn) {
    if (!window.modalActiveProduct || !window.modalActiveProduct.colors) return;
    const colors = window.modalActiveProduct.colors || [];
    const matched = colors.find(c => c.id === colorId) || { id: colorId, name: 'Tùy chọn' };
    window.modalSelectedColor = matched;
    const label = document.getElementById('modal-color-name');
    if (label) label.textContent = matched.name;
    if (window.TTProductExperience) window.TTProductExperience.updateSelection();

    document.querySelectorAll('.modal-color-btn').forEach(b => {
      b.classList.remove('border-[#FF5C00]', 'bg-[rgba(255,92,0,0.12)]', 'text-primary-color', 'ring-2', 'ring-[#FF5C00]/30');
      b.classList.add('border-[var(--border-subtle)]', 'bg-[var(--bg-surface-elevated)]', 'text-secondary-color');
      b.setAttribute('aria-pressed', 'false');
    });
    if (btn) {
      btn.setAttribute('aria-pressed', 'true');
      btn.classList.add('border-[#FF5C00]', 'bg-[rgba(255,92,0,0.12)]', 'text-primary-color', 'ring-2', 'ring-[#FF5C00]/30');
      btn.classList.remove('border-[var(--border-subtle)]', 'bg-[var(--bg-surface-elevated)]', 'text-secondary-color');
    }

    // Nếu đang ở chế độ CAD hoặc chuyển màu, cập nhật bản vẽ Vector Retina tương ứng
    if (window.modalImageViewMode === 'cad' && typeof window.setModalImageViewMode === 'function') {
      window.setModalImageViewMode('cad');
    }
  };

  /**
   * Dual-View Controller: Chuyển đổi giữa [📸 Ảnh Thực Tế Studio] và [📐 Bản Vẽ Cấu Tạo CAD]
   */
  window.setModalImageViewMode = function (mode) {
    window.modalImageViewMode = mode;
    const btnStudio = document.getElementById('modal-toggle-view-studio');
    const btnCad = document.getElementById('modal-toggle-view-cad');
    const imgEl = document.getElementById('order-prod-img');
    const vectorEl = document.getElementById('order-prod-vector');
    const rulerLayer = document.getElementById('order-hud-ruler-layer');
    const item = window.modalActiveProduct;
    const currentColor = window.modalSelectedColor || (item && item.colors ? item.colors[0] : { hex: '#F5F2EB' });

    if (mode === 'cad') {
      if (btnCad) {
        btnCad.className = 'flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all bg-[#00E5FF] text-black shadow-sm';
      }
      if (btnStudio) {
        btnStudio.className = 'flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all text-secondary-color hover:text-white';
      }
      if (imgEl) imgEl.classList.add('hidden');
      if (vectorEl) {
        vectorEl.classList.remove('hidden');
        if (typeof window !== 'undefined' && window.TT3DVisualRenderer && item) {
          vectorEl.innerHTML = window.TT3DVisualRenderer.renderProductVectorSvg({
            category: item.category,
            colorHex: currentColor.hex,
            mode: 'cad',
            productId: item.id,
            title: item.title
          });
        }
      }
      if (rulerLayer) rulerLayer.textContent = 'BẢN VẼ KỸ THUẬT CAD 2.5D';
    } else {
      if (btnStudio) {
        btnStudio.className = 'flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all bg-[#FF5C00] text-black shadow-sm';
      }
      if (btnCad) {
        btnCad.className = 'flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all text-secondary-color hover:text-white';
      }
      if (imgEl) imgEl.classList.remove('hidden');
      if (vectorEl) vectorEl.classList.add('hidden');
      if (rulerLayer) {
        const techData = (typeof window !== 'undefined' && window.TT3DVisualRenderer && item)
          ? window.TT3DVisualRenderer.getTechData(item.category)
          : null;
        rulerLayer.textContent = techData ? `LỚP IN: ${techData.layerHeight}` : 'LỚP IN: 0.16MM BAMBU LAB';
      }
    }
  };

  window.selectModalColor = function (colorId, colorName, btn) {
    window.selectModalColorById(colorId, btn);
  };

  window.selectModalMaterialById = function (matId, btn) {
    if (!window.modalActiveProduct || !window.modalActiveProduct.materials) return;
    const mats = window.modalActiveProduct.materials || [];
    const matched = mats.find(m => m.id === matId) || { id: matId, name: 'Tiêu chuẩn', label: 'Tiêu chuẩn', priceModifier: 0 };
    window.modalSelectedMat = matched;

    document.querySelectorAll('.modal-mat-btn').forEach(b => {
      b.classList.remove('border-[#FF5C00]', 'bg-[var(--bg-surface-elevated)]', 'ring-1', 'ring-[#FF5C00]/40');
      b.classList.add('border-[var(--border-subtle)]', 'bg-[var(--bg-surface)]');
      b.setAttribute('aria-pressed', 'false');
    });
    if (btn) {
      btn.setAttribute('aria-pressed', 'true');
      btn.classList.add('border-[#FF5C00]', 'bg-[var(--bg-surface-elevated)]', 'ring-1', 'ring-[#FF5C00]/40');
      btn.classList.remove('border-[var(--border-subtle)]', 'bg-[var(--bg-surface)]');
    }

    window.updateModalPriceSummary();
  };

  window.selectModalMaterial = function (matId, btn) {
    window.selectModalMaterialById(matId, btn);
  };

  window.updateModalPriceSummary = function () {
    if (!window.modalActiveProduct) return;
    const base = window.modalActiveProduct.price;
    const modifier = (window.modalSelectedMat && window.modalSelectedMat.priceModifier) || 0;
    const unitPrice = base + modifier;
    const qty = Math.min(99, Math.max(1, window.modalQty || 1));
    const total = unitPrice * qty;

    const priceEl = document.getElementById('order-prod-price');
    const subtotalEl = document.getElementById('modal-summary-subtotal');
    const directBtnLabel = document.getElementById('modal-submit-direct-label');
    const shippingNoteEl = document.getElementById('modal-summary-shipping-note');

    if (priceEl) priceEl.textContent = formatMoney(unitPrice);
    if (subtotalEl) subtotalEl.textContent = formatMoney(total);
    if (window.TTProductExperience) window.TTProductExperience.updateSelection();
    if (directBtnLabel) directBtnLabel.textContent = 'Đặt hàng ngay';

    if (shippingNoteEl) {
      if (total >= 300000) {
        shippingNoteEl.textContent = '(🎉 Đủ điều kiện Freeship!)';
        shippingNoteEl.className = 'text-[10px] text-emerald-400 font-mono font-bold';
      } else {
        shippingNoteEl.textContent = `(Freeship đơn ≥ 300K)`;
        shippingNoteEl.className = 'text-[10px] text-slate-400 font-mono';
      }
    }
  };

  window.changeModalQty = function (delta) {
    window.modalQty = Math.min(99, Math.max(1, (window.modalQty || 1) + delta));
    const qtyVal = document.getElementById('modal-qty-val');
    if (qtyVal) qtyVal.textContent = window.modalQty;
    window.updateModalPriceSummary();
  };

  function buildConfiguredLine() {
    const prod = window.modalActiveProduct;
    if (!prod || prod.status !== 'active') {
      if (window.showToast) window.showToast('Sản phẩm không khả dụng.', 'error');
      return null;
    }

    const customInput = document.getElementById('order-custom-text-input');
    const customText = customInput ? customInput.value.trim().normalize('NFC').slice(0, 100) : '';

    if (window.TTPurchaseConfig && typeof window.TTPurchaseConfig.buildConfiguredLine === 'function') {
      try {
        const qtyNum = typeof window.modalQty === 'number' ? window.modalQty : (parseInt(window.modalQty, 10) || 1);
        return window.TTPurchaseConfig.buildConfiguredLine(prod.id, {
          colorId: window.modalSelectedColor ? window.modalSelectedColor.id : null,
          materialId: window.modalSelectedMat ? window.modalSelectedMat.id : null,
          qty: qtyNum,
          customText
        });
      } catch (err) {
        if (window.showToast) window.showToast(err.message || 'Cấu hình không hợp lệ.', 'error');
        return null;
      }
    }

    if (window.showToast) window.showToast('Hệ thống cấu hình chưa sẵn sàng.', 'error');
    return null;
  }

  window.submitModalAddToCart = function () {
    const line = buildConfiguredLine();
    if (!line) return;

    if (window.TTCart && typeof window.TTCart.addToCart === 'function') {
      window.TTCart.addToCart(line);
      window.closeProductDetailModal();
      window.TTCart.openCart();
      if (window.showToast) {
        window.showToast(`Đã thêm "${line.title}" vào giỏ hàng!`);
      }
    }
  };

  window.submitModalDirectCheckout = function () {
    const line = buildConfiguredLine();
    if (!line) return;

    window.closeProductDetailModal();

    if (window.TTCheckout && typeof window.TTCheckout.openCheckout === 'function') {
      window.TTCheckout.openCheckout([line], 0, { source: 'direct' });
    }
  };

  // Mở không gian 3D từ Modal chi tiết (Codex Section 5.2 F01)
  window.open3DFromModal = function () {
    if (!window.modalActiveProduct) return;
    const item = window.modalActiveProduct;
    const hasValidModel = isSupported3DModel(item.modelKey);

    if (!hasValidModel) {
      if (typeof window.showToast === 'function') {
        window.showToast('Sản phẩm hiện chưa có mô hình 3D tương tác.');
      }
      return;
    }

    const prodId = item.id;
    if (typeof window.open3DViewerById === 'function') {
      const success = window.open3DViewerById(prodId);
      if (success !== false) {
        window.closeProductDetailModal();
      }
    }
  };

  window.closeProductDetailModal = function () {
    const imageDialog = document.getElementById('product-image-dialog');
    if (imageDialog && imageDialog.open) imageDialog.close();
    const modal = document.getElementById('order-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex', 'active');
    }
    if (document.body && document.body.style) {
      document.body.style.overflow = '';
    }
    if (productModalPreviousActiveElement && typeof productModalPreviousActiveElement.focus === 'function') {
      try {
        productModalPreviousActiveElement.focus();
      } catch (_) {}
      productModalPreviousActiveElement = null;
    }
  };

  // 8. SEARCH INPUT HANDLER
  function initSearchHandler() {
    const searchInput = document.getElementById('store-search-input');
    const clearBtn = document.getElementById('store-search-clear');
    if (!searchInput) return;

    let searchTimer = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        currentSearchKeyword = searchInput.value.trim();
        if (clearBtn) {
          if (currentSearchKeyword) {
            clearBtn.classList.remove('hidden');
          } else {
            clearBtn.classList.add('hidden');
          }
        }
        renderStoreProducts(currentCategoryFilter);
      }, 160);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.add('hidden');
        currentSearchKeyword = '';
        renderStoreProducts(currentCategoryFilter);
      });
    }
  }

  // 9. CURATED PRODUCTS (HOMEPAGE 6-8 HIGHLIGHTS)
  function renderCuratedProducts() {
    const container = document.getElementById('curated-product-grid');
    if (!container) return;

    const allProducts = getStoredProducts();
    const activeProducts = allProducts.filter(p => (p.status || 'active') === 'active');

    // 8 sản phẩm tiêu biểu cho trang chủ rút gọn
    const curatedIds = [
      'mw-cn-2084928', // Khay trang sức nơ lụa
      'mw-cn-1836100', // Đế WiFi NFC 1-chạm
      'mw-cn-1438306', // Đèn bàn xoắn kem
      'mw-cn-1971424', // Hộp để bàn tiện ích
      'mw-cn-1702306', // Móc khóa cá nhân hóa
      'mw-cn-1646129', // Ống cắm cọ Coquette
      'mw-cn-2332220', // Bình hoa dập ly xếp nếp
      'mw-cn-2531095'  // Khay nơ lụa cánh bướm
    ];

    const curatedList = [];
    curatedIds.forEach(id => {
      const item = activeProducts.find(p => p.id === id);
      if (item) curatedList.push(item);
    });

    if (curatedList.length < 8) {
      for (const p of activeProducts) {
        if (!curatedList.some(c => c.id === p.id)) {
          curatedList.push(p);
          if (curatedList.length >= 8) break;
        }
      }
    }

    container.innerHTML = curatedList.map(buildProductCardHTML).join('');
  }

  // 10. INITIALIZATION LIFECYCLE
  window.renderStoreProducts = renderStoreProducts;
  window.renderCuratedProducts = renderCuratedProducts;
  window.getStoredProducts = getStoredProducts;
  window.CATEGORY_REGISTRY = CATEGORY_REGISTRY;

  window.addEventListener('tt_products_updated', () => {
    renderStoreProducts(currentCategoryFilter);
    renderCuratedProducts();
  });

  async function init() {
    if (window.TTCatalogStore && typeof window.TTCatalogStore.init === 'function') {
      await window.TTCatalogStore.init();
    }

    // Đọc category từ URL thay vì ghi đè 'all' (Codex Directive)
    const initialParsed = window.parseStoreHash ? window.parseStoreHash(window.location.hash) : { category: 'all' };
    currentCategoryFilter = initialParsed.category || 'all';

    renderStoreProducts(currentCategoryFilter);
    renderCuratedProducts();
    initEventDelegation();
    initSearchHandler();

    const orderModal = document.getElementById('order-modal');
    if (orderModal) {
      orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) {
          window.closeProductDetailModal();
        }
      });

      // Trap Tab key inside order modal (Codex B07 Focus Isolation)
      orderModal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const selectors = [
          'button:not([disabled]):not([aria-hidden="true"])',
          '[href]:not([aria-disabled="true"]):not([aria-hidden="true"])',
          'input:not([disabled]):not([aria-hidden="true"])',
          'select:not([disabled]):not([aria-hidden="true"])',
          '[tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])'
        ];
        const focusables = Array.from(orderModal.querySelectorAll(selectors.join(','))).filter(el => {
          return el.offsetParent !== null || (typeof el.offsetWidth === 'number' && el.offsetWidth > 0) || (typeof el.offsetHeight === 'number' && el.offsetHeight > 0);
        });
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first || !orderModal.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !orderModal.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const imageDialog = document.getElementById('product-image-dialog');
        if (imageDialog && imageDialog.open) return;
        window.closeProductDetailModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);
