/**
 * T&T 3D Labs - Category Hub Showcase & Modern Products Manager
 * Tuân thủ bản chỉ thị phê duyệt GPT-6.1-Sol (Codex Master Controller)
 * Hỗ trợ 55 sản phẩm phân bổ 5 danh mục, 5 Hero Spotlight, bảo mật XSS tuyệt đối
 */

(function (window) {
  'use strict';

  // 1. SHARED CATEGORY REGISTRY
  const CATEGORY_REGISTRY = {
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

  let currentCategoryFilter = 'all';
  let currentSearchKeyword = '';
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
    return typeof hex === 'string' && /^#[0-9A-Fa-f]{3,8}$/.test(hex.trim());
  }

  function sanitizeImageUrl(url) {
    if (!url || typeof url !== 'string') return 'assets/images/logo-premium-mark.svg';
    const trimmed = url.trim();
    if (trimmed.startsWith('javascript:')) return 'assets/images/logo-premium-mark.svg';
    if (
      trimmed.startsWith('data:image/') ||
      trimmed.startsWith('assets/') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('./') ||
      trimmed.startsWith('/')
    ) {
      return escapeHTML(trimmed);
    }
    return 'assets/images/logo-premium-mark.svg';
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

    const specLine = item.specLine || (item.specs ? `📐 ${item.specs.dimensions || 'Chuẩn Xưởng'} • ${item.specs.weight || item.specs.material || 'Bio-PLA'}` : '📐 Tiêu chuẩn xưởng • Bio-PLA');

    const has3D = Boolean(item.modelKey && String(item.modelKey).trim() !== '');

    return `
      <article class="studio-product-card group cursor-pointer" data-product-id="${escapeHTML(item.id)}">
        <!-- Image Box with hover zoom & subtle 3D launcher -->
        <div class="product-image-box">
          <img src="${safeImage}" 
               width="600" 
               height="600" 
               loading="lazy" 
               decoding="async" 
               alt="${escapeHTML(item.imageAlt || item.title)}" 
               id="img-${escapeHTML(item.id)}"
               onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
          
          <!-- Frosted micro badge (top-left) -->
          ${item.badge ? `
            <span class="card-micro-badge">
              ${escapeHTML(item.badge)}
            </span>
          ` : ''}

          <!-- 3D Launcher Pill (top-right, only if modelKey is valid) -->
          ${has3D ? `
            <button type="button" 
                    class="card-3d-launcher" 
                    data-action="open-3d"
                    data-product-id="${escapeHTML(item.id)}"
                    title="Soi 3D tương tác 360°" 
                    aria-label="Soi 3D ${escapeHTML(item.title)}">
              <i class="fa-solid fa-cube text-xs pointer-events-none"></i>
              <span class="pointer-events-none">Soi 3D</span>
            </button>
          ` : ''}
        </div>

        <!-- Card Content Body -->
        <div class="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 sm:gap-4">
          <div class="space-y-2">
            
            <!-- Color Swatches Row (Interactive) -->
            <div class="flex items-center justify-between" onclick="event.stopPropagation()">
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
                            data-swatch-name="${escapeHTML(c.name)}"></button>
                  `;
                }).join('')}
              </div>
              <span class="text-[11px] font-medium text-secondary-color truncate max-w-[120px]" id="swatch-name-${escapeHTML(item.id)}">
                ${escapeHTML(currentSwatch.name)}
              </span>
            </div>

            <!-- Product Title -->
            <h3 class="text-xs sm:text-sm font-bold text-primary-color line-clamp-1 group-hover:text-[#FF5C00] transition-colors">
              ${escapeHTML(item.title)}
            </h3>

            <!-- 1-Line Headline Benefit -->
            <p class="text-[11px] sm:text-xs text-secondary-color line-clamp-2 leading-relaxed">
              ${escapeHTML(item.headlineBenefit || item.desc || '')}
            </p>

            <!-- Technical Spec Line (JetBrains Mono) -->
            <div class="text-[10px] sm:text-[11px] font-mono text-muted pt-1 truncate">
              ${escapeHTML(specLine)}
            </div>
          </div>

          <!-- Price & Single CTA Button Row -->
          <div class="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 mt-auto">
            <div>
              <div class="price-display leading-none text-xs sm:text-sm font-bold font-mono text-[#FF5C00]">${priceFormatted}</div>
              ${originalPriceFormatted ? `<div class="text-[10px] sm:text-[11px] text-muted line-through mt-0.5">${originalPriceFormatted}</div>` : ''}
            </div>

            <!-- Single Add to Cart Action -->
            <button type="button" 
                    class="btn-primary text-[11px] sm:text-xs !py-2 !px-3 sm:!px-4 shrink-0" 
                    data-action="quick-add-cart"
                    data-product-id="${escapeHTML(item.id)}"
                    title="Thêm ngay vào giỏ hàng">
              <i class="fa-solid fa-bag-shopping text-xs pointer-events-none"></i>
              <span class="pointer-events-none">Thêm vào giỏ</span>
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
    const has3D = Boolean(item.modelKey && String(item.modelKey).trim() !== '');

    const roundedScore = Math.round(item.selectionScore || 92);
    const printStats = (item.prints ? item.prints.toLocaleString('vi-VN') + ' lượt in' : '') +
                       (item.downloads ? ' • ' + item.downloads.toLocaleString('vi-VN') + ' lượt tải' : '');

    const sp = item.specs || {};
    const specTags = [
      sp.dimensions ? `📐 ${sp.dimensions}` : '📐 Chuẩn Xưởng',
      sp.weight ? `⚖️ ${sp.weight}` : '⚖️ Chuẩn Trọng Lượng',
      item.materialRecommendation ? `🌱 ${item.materialRecommendation}` : '🌱 Bio-PLA Cao Cấp'
    ];

    return `
      <div class="studio-hero-spotlight p-5 sm:p-7 lg:p-8" data-product-id="${escapeHTML(item.id)}">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          <!-- Left Packshot Image (Desktop 5 cols) -->
          <div class="lg:col-span-5 relative">
            <div class="hero-spotlight-image-box cursor-pointer" data-action="open-detail" data-product-id="${escapeHTML(item.id)}">
              <img src="${safeImage}" 
                   alt="${escapeHTML(item.imageAlt || item.title)}" 
                   width="700" 
                   height="700" 
                   loading="lazy" 
                   class="w-full h-full object-cover"
                   onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">

              <!-- Badge Curation Score Top Left -->
              <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                <span class="hero-score-badge">
                  <i class="fa-solid fa-star text-xs"></i>
                  <span>${roundedScore}/100 Điểm tuyển chọn</span>
                </span>
                ${item.badge ? `
                  <span class="card-micro-badge !relative !top-0 !left-0">
                    ${escapeHTML(item.badge)}
                  </span>
                ` : ''}
              </div>

              <!-- 3D Launcher Button Top Right -->
              ${has3D ? `
                <button type="button" 
                        class="card-3d-launcher" 
                        data-action="open-3d"
                        data-product-id="${escapeHTML(item.id)}"
                        title="Soi 3D 360°">
                  <i class="fa-solid fa-cube text-xs pointer-events-none"></i>
                  <span class="pointer-events-none">Soi 3D 360°</span>
                </button>
              ` : ''}

              <!-- Bottom Stats Gradient Bar -->
              ${printStats ? `
                <div class="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-[rgba(11,12,14,0.85)] border border-white/10 backdrop-blur-md text-[11px] font-mono text-slate-300 flex items-center justify-between">
                  <span>✦ Thống kê MakerWorld</span>
                  <span class="text-[#FF5C00] font-bold">${escapeHTML(printStats)}</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Right Content & Actions (Desktop 7 cols) -->
          <div class="lg:col-span-7 flex flex-col justify-between space-y-4 text-left">
            
            <div class="space-y-3">
              <!-- Category Micro Tagline -->
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[#FF5C00]">
                  <i class="fa-solid ${categoryMeta ? categoryMeta.icon : 'fa-sparkles'} text-xs"></i>
                  <span>${escapeHTML(categoryMeta ? categoryMeta.badgeText : '✦ Spotlight Hero')}</span>
                </span>
                <span class="text-xs font-mono text-muted">Model ID #${escapeHTML(item.modelId || item.id)}</span>
              </div>

              <!-- Title -->
              <h3 class="text-lg sm:text-2xl font-extrabold text-primary-color leading-tight hover:text-[#FF5C00] transition-colors cursor-pointer" data-action="open-detail" data-product-id="${escapeHTML(item.id)}">
                ${escapeHTML(item.title)}
              </h3>

              <!-- Headline Benefit -->
              <p class="text-xs sm:text-sm text-secondary-color leading-relaxed">
                ${escapeHTML(item.headlineBenefit || item.desc || '')}
              </p>

              <!-- Technical Specs Row -->
              <div class="flex flex-wrap items-center gap-2 pt-1">
                ${specTags.map(tag => `
                  <span class="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-mono text-[11px] text-secondary-color">
                    ${escapeHTML(tag)}
                  </span>
                `).join('')}
              </div>
            </div>

            <!-- Price & Action Buttons Row -->
            <div class="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4 mt-auto">
              <div>
                <div class="text-[11px] uppercase tracking-wider text-muted font-mono font-medium">Giá hoàn thiện xưởng</div>
                <div class="text-xl sm:text-2xl font-extrabold font-mono text-[#FF5C00] leading-none mt-1">
                  ${priceFormatted}
                </div>
                ${originalPriceFormatted ? `<div class="text-xs text-muted line-through mt-1">${originalPriceFormatted}</div>` : ''}
              </div>

              <!-- Action CTAs -->
              <div class="flex flex-wrap items-center gap-3">
                <button type="button" 
                        class="btn-primary text-xs sm:text-sm !py-2.5 !px-5" 
                        data-action="hero-buy-now"
                        data-product-id="${escapeHTML(item.id)}">
                  <i class="fa-solid fa-bolt pointer-events-none"></i>
                  <span class="pointer-events-none">Đặt Hàng Ngay</span>
                </button>

                <button type="button" 
                        class="btn-secondary text-xs sm:text-sm !py-2.5 !px-4" 
                        data-action="hero-add-cart"
                        data-product-id="${escapeHTML(item.id)}">
                  <i class="fa-solid fa-bag-shopping pointer-events-none text-secondary-color"></i>
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
  function renderStoreProducts(filter = currentCategoryFilter) {
    currentCategoryFilter = filter;
    const container = document.getElementById('store-product-grid');
    if (!container) return;

    const allProducts = getStoredProducts();
    const activeProducts = allProducts.filter(p => (p.status || 'active') === 'active');

    // Case A: SEARCH QUERY ACTIVE
    if (currentSearchKeyword) {
      const kw = removeVietnameseDiacritics(currentSearchKeyword);
      let searchResults = activeProducts.filter(p => {
        const titleMatch = removeVietnameseDiacritics(p.title).includes(kw);
        const descMatch = removeVietnameseDiacritics(p.desc || '').includes(kw);
        const idMatch = String(p.modelId || p.id).includes(kw);
        return titleMatch || descMatch || idMatch;
      });

      if (filter !== 'all') {
        searchResults = searchResults.filter(p => p.category === filter);
      }

      if (searchResults.length === 0) {
        container.innerHTML = `
          <div class="py-20 text-center space-y-4">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-2xl text-secondary-color">
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-bold text-primary-color">Không tìm thấy sản phẩm nào khớp với từ khóa "${escapeHTML(currentSearchKeyword)}"</p>
              <p class="text-xs text-secondary-color">Thử tìm theo tên tiếng Việt hoặc mã Model ID MakerWorld (ví dụ: 1646129)</p>
            </div>
            <button type="button" 
                    data-action="clear-search" 
                    class="btn-secondary text-xs !py-2 !px-4 mx-auto">
              <i class="fa-solid fa-xmark mr-1.5"></i> Xóa bộ lọc tìm kiếm
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="space-y-6">
          <div class="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div class="flex items-center gap-2 text-xs font-mono text-secondary-color">
              <i class="fa-solid fa-magnifying-glass text-[#FF5C00]"></i>
              <span>Kết quả tìm kiếm cho <strong class="text-primary-color">"${escapeHTML(currentSearchKeyword)}"</strong>:</span>
              <span class="px-2 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] text-[#FF5C00] font-bold">${searchResults.length} sản phẩm</span>
            </div>
            <button type="button" data-action="clear-search" class="text-xs text-secondary-color hover:text-primary-color flex items-center gap-1 font-mono">
              <i class="fa-solid fa-xmark"></i> Xóa tìm kiếm
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            ${searchResults.map(buildProductCardHTML).join('')}
          </div>
        </div>
      `;
      return;
    }

    // Case B: CHẾ ĐỘ TẤT CẢ (ALL CATEGORIES - CATEGORY HUB OVERVIEW)
    if (filter === 'all') {
      const categories = Object.keys(CATEGORY_REGISTRY);

      container.innerHTML = categories.map(catId => {
        const catMeta = CATEGORY_REGISTRY[catId];
        const catProducts = activeProducts.filter(p => p.category === catId);
        if (catProducts.length === 0) return '';

        const hero = getCategoryHero(catId, catProducts);
        // Exclude hero from the grid to avoid duplicate rendering (Codex Directive)
        const gridProducts = hero ? catProducts.filter(p => p.id !== hero.id) : catProducts;

        return `
          <div class="category-showcase-block space-y-6" id="category-block-${escapeHTML(catId)}">
            
            <!-- Category Header Bar -->
            <div class="category-header-bar">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-sm" style="background-color: ${catMeta.accentColor}20; color: ${catMeta.accentColor};">
                  <i class="fa-solid ${catMeta.icon}"></i>
                </div>
                <div>
                  <h3 class="text-sm sm:text-base font-extrabold text-primary-color flex items-center gap-2">
                    <span>${escapeHTML(catMeta.shortName)}</span>
                    <span class="text-[11px] font-mono font-medium text-secondary-color">(${catProducts.length} mẫu)</span>
                  </h3>
                  <p class="text-[11px] sm:text-xs text-secondary-color line-clamp-1 max-w-xl">
                    ${escapeHTML(catMeta.title)}
                  </p>
                </div>
              </div>

              <!-- View All Category Button -->
              <button type="button" 
                      class="shrink-0 text-xs font-semibold text-[#FF5C00] hover:text-[#E05200] flex items-center gap-1.5 transition-colors" 
                      data-action="view-category" 
                      data-category="${escapeHTML(catId)}"
                      title="Xem toàn bộ sản phẩm danh mục này">
                <span>Xem tất cả ${catProducts.length} mẫu</span>
                <i class="fa-solid fa-arrow-right text-[10px] pointer-events-none"></i>
              </button>
            </div>

            <!-- Spotlight Hero Item for this Category -->
            ${hero ? buildHeroSpotlightHTML(hero, catMeta) : ''}

            <!-- 10 Remaining Products in Category Grid -->
            ${gridProducts.length > 0 ? `
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                ${gridProducts.map(buildProductCardHTML).join('')}
              </div>
            ` : ''}

          </div>
        `;
      }).join('');
      return;
    }

    // Case C: CHẾ ĐỘ MỘT DANH MỤC (SINGLE CATEGORY HUB)
    const catMeta = CATEGORY_REGISTRY[filter];
    const catProducts = activeProducts.filter(p => p.category === filter);

    if (catProducts.length === 0) {
      container.innerHTML = `
        <div class="py-20 text-center space-y-4">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-2xl text-secondary-color">
            <i class="fa-solid fa-box-open"></i>
          </div>
          <p class="text-sm font-medium text-secondary-color">Chưa có sản phẩm nào trong danh mục này.</p>
          <button type="button" data-action="view-category" data-category="all" class="btn-secondary text-xs !py-2 !px-4 mx-auto">
            <i class="fa-solid fa-arrow-left mr-1.5"></i> Quay lại Tất Cả Danh Mục
          </button>
        </div>
      `;
      return;
    }

    const hero = getCategoryHero(filter, catProducts);
    const gridProducts = hero ? catProducts.filter(p => p.id !== hero.id) : catProducts;

    container.innerHTML = `
      <div class="category-showcase-block space-y-8">
        
        <!-- Navigation Breadcrumb & Category Title -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <button type="button" 
                    data-action="view-category" 
                    data-category="all" 
                    class="text-xs font-semibold text-secondary-color hover:text-primary-color flex items-center gap-2 transition-colors">
              <i class="fa-solid fa-arrow-left pointer-events-none"></i>
              <span class="pointer-events-none">Quay lại Tất Cả Danh Mục</span>
            </button>
            <span class="text-xs font-mono text-secondary-color font-medium">
              Đang hiển thị <strong class="text-primary-color">${catProducts.length}</strong> sản phẩm
            </span>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-lg shadow-sm" style="background-color: ${catMeta ? catMeta.accentColor : '#FF5C00'}20; color: ${catMeta ? catMeta.accentColor : '#FF5C00'};">
                <i class="fa-solid ${catMeta ? catMeta.icon : 'fa-shapes'}"></i>
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-extrabold text-primary-color">
                  ${escapeHTML(catMeta ? catMeta.shortName : filter)}
                </h3>
                <p class="text-xs text-secondary-color max-w-xl">
                  ${escapeHTML(catMeta ? catMeta.title : '')}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FF5C00]/15 text-[#FF5C00]">
                ${escapeHTML(catMeta ? catMeta.badgeText : '✦ Curated 2026')}
              </span>
            </div>
          </div>
        </div>

        <!-- Spotlight Hero Item -->
        ${hero ? buildHeroSpotlightHTML(hero, catMeta) : ''}

        <!-- 10 Remaining Products in Category Grid -->
        ${gridProducts.length > 0 ? `
          <div class="space-y-4">
            <h4 class="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
              Các thiết kế khác trong danh mục (${gridProducts.length} mẫu)
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              ${gridProducts.map(buildProductCardHTML).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;
  }

  // 5. EVENT DELEGATION ON CONTAINER (Zero Inline Onclick XSS Vulnerability)
  function initEventDelegation() {
    const container = document.getElementById('store-product-grid');
    if (!container) return;

    container.addEventListener('click', (e) => {
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
          parentGroup.querySelectorAll('.swatch-dot').forEach(d => d.classList.remove('active'));
          swatchBtn.classList.add('active');
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
    if (!item) return;

    const cardPreSelectedColorId = window.cardSelectedColors ? window.cardSelectedColors[prodId] : null;
    let selectedColor = null;
    if (Array.isArray(item.colors) && item.colors.length > 0) {
      if (cardPreSelectedColorId) {
        selectedColor = item.colors.find(c => c.id === cardPreSelectedColorId) || item.colors[0];
      } else {
        selectedColor = item.colors[0];
      }
    } else {
      selectedColor = { id: 'default', name: 'Tiêu chuẩn', hex: '#26282B' };
    }

    const defaultMat = (item.materials && item.materials[0]) || { id: 'pla_matte', name: 'PLA Matte', label: 'PLA Matte', priceModifier: 0 };

    if (window.TTCart && typeof window.TTCart.addToCart === 'function') {
      window.TTCart.addToCart({
        id: item.id,
        title: item.title,
        price: item.price + (defaultMat.priceModifier || 0),
        qty: 1,
        image: item.image,
        color: selectedColor,
        colorId: selectedColor.id,
        colorName: selectedColor.name,
        material: defaultMat,
        materialId: defaultMat.id,
        materialName: defaultMat.label || defaultMat.name,
        customText: null,
        category: item.category
      });
      window.TTCart.openCart();
      if (window.showToast) {
        window.showToast(`Đã thêm "${item.title}" (${selectedColor.name}) vào giỏ hàng!`);
      }
    }
  };

  // 7. PRODUCT DETAIL MODAL CONTROLLER
  window.openProductDetailModal = function (prodId) {
    const products = getStoredProducts();
    const item = products.find(p => p.id === prodId);
    if (!item) return;

    const modal = document.getElementById('order-modal');
    if (!modal) return;

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
    const btnModal3D = document.getElementById('btn-modal-open-3d');

    if (imgEl) {
      imgEl.src = sanitizeImageUrl(item.image);
      imgEl.onerror = () => { imgEl.src = 'assets/images/logo-premium-mark.svg'; };
    }
    if (badgeEl) {
      badgeEl.textContent = item.badge || '✦ Studio Craft';
    }
    if (titleEl) titleEl.textContent = item.title;
    if (descEl) descEl.textContent = item.desc || item.headlineBenefit || '';
    if (customInput) {
      customInput.value = '';
      customInput.oninput = () => {
        if (customCount) customCount.textContent = `${customInput.value.length}/100`;
      };
    }
    if (customCount) customCount.textContent = '0/100';
    if (qtyVal) qtyVal.textContent = '1';

    // Show or hide Modal 3D Viewer button based on modelKey
    if (btnModal3D) {
      if (item.modelKey && String(item.modelKey).trim() !== '') {
        btnModal3D.classList.remove('hidden');
      } else {
        btnModal3D.classList.add('hidden');
      }
    }

    // Technical Specs Grid
    if (specsEl) {
      const sp = item.specs || {};
      const specsList = [
        { label: 'Kích thước', val: sp.dimensions || 'Tiêu chuẩn xưởng' },
        { label: 'Trọng lượng', val: sp.weight || 'Tiêu chuẩn xưởng' },
        { label: 'Độ mịn lớp', val: sp.layer || '0.16mm High-Detail' },
        { label: 'Bảo hành', val: sp.warranty || 'Đổi mới 1-1' }
      ];

      if (sp.nfc) {
        specsList.push({ label: 'Chip NFC', val: sp.nfc, isAccent: true });
      }

      specsEl.innerHTML = specsList.map(s => `
        <div class="space-y-0.5">
          <dt class="text-[11px] uppercase tracking-wider text-secondary-color font-medium">${escapeHTML(s.label)}</dt>
          <dd class="font-mono font-semibold ${s.isAccent ? 'text-[#FF5C00]' : 'text-primary-color'} truncate">${escapeHTML(s.val)}</dd>
        </div>
      `).join('');
    }

    // Swatches in Modal
    if (swatchesEl) {
      const colors = (Array.isArray(item.colors) && item.colors.length > 0) ? item.colors : [initialColor];

      swatchesEl.innerHTML = `
        <div class="flex items-center justify-between text-xs font-semibold text-secondary-color mb-1.5">
          <span>Chọn màu sắc:</span>
          <span id="modal-color-name" class="text-primary-color font-bold">${escapeHTML(initialColor.name)}</span>
        </div>
        <div class="flex flex-wrap gap-2.5">
          ${colors.map((c) => {
            const safeHex = isValidHex(c.hex) ? c.hex : '#26282B';
            return `
              <button type="button" 
                      class="modal-color-btn px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${c.id === initialColor.id ? 'border-[#FF5C00] bg-[rgba(255,92,0,0.12)] text-primary-color ring-2 ring-[#FF5C00]/30' : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-secondary-color hover:border-slate-500'}" 
                      onclick="window.selectModalColor('${escapeHTML(c.id)}', '${escapeHTML(c.name)}', this)">
                <span class="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0" style="background-color: ${safeHex}"></span>
                <span>${escapeHTML(c.name)}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    }

    // Materials in Modal
    if (matsEl) {
      const materials = (Array.isArray(item.materials) && item.materials.length > 0) ? item.materials : [initialMat];

      matsEl.innerHTML = `
        <div class="text-xs font-semibold text-secondary-color mb-1.5">Vật liệu in:</div>
        <div class="space-y-2">
          ${materials.map((m, i) => `
            <button type="button" 
                    class="modal-mat-btn w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${i === 0 ? 'border-[#FF5C00] bg-[var(--bg-surface-elevated)] ring-1 ring-[#FF5C00]/40' : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-slate-600'}" 
                    onclick="window.selectModalMaterial('${escapeHTML(m.id)}', this)">
              <div>
                <div class="text-xs font-bold text-primary-color flex items-center gap-2">
                  <span>${escapeHTML(m.label || m.name)}</span>
                  ${i === 0 ? '<span class="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-[#FF5C00]/15 text-[#FF5C00]">Khuyên dùng</span>' : ''}
                </div>
                <div class="text-[11px] text-secondary-color mt-0.5">${escapeHTML(m.desc || '')}</div>
              </div>
              ${m.priceModifier > 0 ? `<span class="text-xs font-mono font-bold text-[#FF5C00] ml-3 shrink-0">+${formatMoney(m.priceModifier)}</span>` : ''}
            </button>
          `).join('')}
        </div>
      `;
    }

    window.updateModalPriceSummary();
    modal.classList.remove('hidden');
    modal.classList.add('flex', 'active');
  };

  window.selectModalColor = function (colorId, colorName, btn) {
    if (!window.modalActiveProduct || !window.modalActiveProduct.colors) return;
    window.modalSelectedColor = window.modalActiveProduct.colors.find(c => c.id === colorId) || { id: colorId, name: colorName };
    const label = document.getElementById('modal-color-name');
    if (label) label.textContent = colorName;

    document.querySelectorAll('.modal-color-btn').forEach(b => {
      b.classList.remove('border-[#FF5C00]', 'bg-[rgba(255,92,0,0.12)]', 'text-primary-color', 'ring-2', 'ring-[#FF5C00]/30');
      b.classList.add('border-[var(--border-subtle)]', 'bg-[var(--bg-surface-elevated)]', 'text-secondary-color');
    });
    btn.classList.add('border-[#FF5C00]', 'bg-[rgba(255,92,0,0.12)]', 'text-primary-color', 'ring-2', 'ring-[#FF5C00]/30');
    btn.classList.remove('border-[var(--border-subtle)]', 'bg-[var(--bg-surface-elevated)]', 'text-secondary-color');
  };

  window.selectModalMaterial = function (matId, btn) {
    if (!window.modalActiveProduct || !window.modalActiveProduct.materials) return;
    window.modalSelectedMat = window.modalActiveProduct.materials.find(m => m.id === matId) || { id: matId, name: 'Tiêu chuẩn', priceModifier: 0 };

    document.querySelectorAll('.modal-mat-btn').forEach(b => {
      b.classList.remove('border-[#FF5C00]', 'bg-[var(--bg-surface-elevated)]', 'ring-1', 'ring-[#FF5C00]/40');
      b.classList.add('border-[var(--border-subtle)]', 'bg-[var(--bg-surface)]');
    });
    btn.classList.add('border-[#FF5C00]', 'bg-[var(--bg-surface-elevated)]', 'ring-1', 'ring-[#FF5C00]/40');
    btn.classList.remove('border-[var(--border-subtle)]', 'bg-[var(--bg-surface)]');

    window.updateModalPriceSummary();
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
    if (directBtnLabel) directBtnLabel.textContent = `Đặt Hàng Ngay • ${formatMoney(total)}`;

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

    const selectedColor = window.modalSelectedColor || ((prod.colors && prod.colors[0]) || { id: 'default', name: 'Tiêu chuẩn' });
    const selectedMat = window.modalSelectedMat || ((prod.materials && prod.materials[0]) || { id: 'default', name: 'Tiêu chuẩn', priceModifier: 0 });
    const qty = Math.min(99, Math.max(1, parseInt(window.modalQty, 10) || 1));

    const customInput = document.getElementById('order-custom-text-input');
    const customText = customInput ? customInput.value.trim().normalize('NFC').slice(0, 100) : null;

    const unitPrice = prod.price + (selectedMat.priceModifier || 0);

    return {
      id: prod.id,
      title: prod.title,
      price: unitPrice,
      qty: qty,
      image: prod.image,
      category: prod.category,
      color: selectedColor,
      colorId: selectedColor.id,
      colorName: selectedColor.name,
      material: selectedMat,
      materialId: selectedMat.id,
      materialName: selectedMat.label || selectedMat.name,
      customText: customText || null
    };
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

  window.open3DFromModal = function () {
    if (!window.modalActiveProduct) return;
    const prodId = window.modalActiveProduct.id;
    window.closeProductDetailModal();
    if (typeof window.open3DViewerById === 'function') {
      window.open3DViewerById(prodId);
    }
  };

  window.closeProductDetailModal = function () {
    const modal = document.getElementById('order-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex', 'active');
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

  // 9. INITIALIZATION LIFECYCLE
  window.renderStoreProducts = renderStoreProducts;
  window.getStoredProducts = getStoredProducts;
  window.CATEGORY_REGISTRY = CATEGORY_REGISTRY;

  window.addEventListener('tt_products_updated', () => {
    renderStoreProducts(currentCategoryFilter);
  });

  async function init() {
    if (window.TTCatalogStore && typeof window.TTCatalogStore.init === 'function') {
      await window.TTCatalogStore.init();
    }

    // Đọc category từ URL thay vì ghi đè 'all' (Codex Directive)
    const initialParsed = window.parseStoreHash ? window.parseStoreHash(window.location.hash) : { category: 'all' };
    currentCategoryFilter = initialParsed.category || 'all';

    renderStoreProducts(currentCategoryFilter);
    initEventDelegation();
    initSearchHandler();

    const orderModal = document.getElementById('order-modal');
    if (orderModal) {
      orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) {
          window.closeProductDetailModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
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