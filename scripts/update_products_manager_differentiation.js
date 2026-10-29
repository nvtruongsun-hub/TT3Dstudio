const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'products-manager.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add currentSubCategoryFilter and badge theme helpers
const varTarget = `let currentCategoryFilter = 'all';`;
const varReplacement = `let currentCategoryFilter = 'all';
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
  }`;

if (!code.includes('let currentSubCategoryFilter')) {
  code = code.replace(varTarget, varReplacement);
}

// 2. Update buildProductCardHTML
const oldCardRegex = /function buildProductCardHTML\(item\) \{[\s\S]+?return `\s*<article class="minimal-product-card studio-product-card group cursor-pointer" data-product-id="\${escapeHTML\(item\.id\)}">[\s\S]+?<\/article>\s*`;\s*\}/;

const newCardFunc = `function buildProductCardHTML(item) {
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
    const specLine = item.microSpecs || item.specLine || (sp.dimensions ? \`📐 \${sp.dimensions} • \${sp.material || 'Bio-PLA'}\` : '🌱 Nhựa Bio-PLA • 0.16mm');

    const badgeText = item.archetypeBadge || item.badge;
    const badgeTheme = item.badgeTheme || 'default';
    const isNFC = item.category === 'Ca_Nhan_Hoa_NFC' && (item.type === 'nfc' || (item.title && (item.title.toLowerCase().includes('nfc') || item.title.toLowerCase().includes('wifi'))));

    return \`
      <article class="minimal-product-card studio-product-card group cursor-pointer" data-product-id="\${escapeHTML(item.id)}">
        <!-- Clean Product Visual Frame -->
        <button type="button" aria-label="Xem \${escapeHTML(cleanTitle)}" data-action="open-detail" data-product-id="\${escapeHTML(item.id)}" class="product-image-box relative overflow-hidden group">
          <img src="\${safeImage}" 
               width="600" 
               height="600" 
               loading="lazy" 
               decoding="async" 
               alt="\${escapeHTML(item.imageAlt || cleanTitle)}" 
               id="img-\${escapeHTML(item.id)}"
               class="studio-crisp-img w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
          
          <!-- Archetype & Engineering Badge (Unique per item) -->
          \${badgeText ? \`
            <div class="absolute top-2.5 left-2.5 pointer-events-none z-10">
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold \${getBadgeThemeClass(badgeTheme)} shadow-xs flex items-center gap-1.5 border">
                <span class="w-1.5 h-1.5 rounded-full \${getBadgeDotClass(badgeTheme)}"></span>
                <span>\${escapeHTML(badgeText)}</span>
              </span>
            </div>
          \` : (isNFC ? \`
            <div class="absolute top-2.5 left-2.5 pointer-events-none z-10">
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#FAF5FF] text-[#6B21A8] border border-[#E9D5FF] shadow-xs flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#6B21A8]"></span>
                <span>Chip NFC 1-Chạm</span>
              </span>
            </div>
          \` : '')}
        </button>

        <!-- Card Content Body -->
        <div class="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 sm:gap-4">
          <div class="space-y-1.5">
            
            <!-- Color Swatches Row (Interactive) -->
            <div class="product-card-colors flex items-center justify-between">
              <div class="swatch-group">
                \${swatches.map((c) => {
                  const safeHex = isValidHex(c.hex) ? c.hex : '#26282B';
                  const isActive = c.id === currentSwatch.id;
                  return \`
                    <button type="button" 
                            class="swatch-dot \${isActive ? 'active' : ''}" 
                            style="background-color: \${safeHex};" 
                            title="\${escapeHTML(c.name)}" 
                            data-action="swatch-select"
                            data-product-id="\${escapeHTML(item.id)}"
                            data-swatch-id="\${escapeHTML(c.id)}"
                            data-swatch-name="\${escapeHTML(c.name)}"
                            aria-label="Chọn màu \${escapeHTML(c.name)}" aria-pressed="\${isActive}"></button>
                  \`;
                }).join('')}
              </div>
              <span class="text-[11px] font-medium text-secondary-color truncate max-w-[120px]" id="swatch-name-\${escapeHTML(item.id)}">
                \${escapeHTML(currentSwatch.name)}
              </span>
            </div>

            <!-- Micro-Eyebrow Context (Use Case & Placement) -->
            \${item.useCaseEyebrow ? \`
              <div class="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase text-[#8C6218] truncate pt-1">
                \${escapeHTML(item.useCaseEyebrow)}
              </div>
            \` : ''}

            <!-- Product Title (Clean, short, readable) -->
            <h3 class="product-card-title text-xs sm:text-sm font-bold font-display text-primary-color line-clamp-2 group-hover:text-[#FF5C00] transition-colors" title="\${escapeHTML(cleanTitle)}">
              \${escapeHTML(cleanTitle)}
            </h3>

            <!-- 1-Line Headline Benefit -->
            <p class="product-card-benefit text-secondary-color line-clamp-2 leading-relaxed text-xs">
              \${escapeHTML(item.headlineBenefit || item.desc || '')}
            </p>

            <!-- Micro-Specs Line -->
            <div class="text-[10px] sm:text-[11px] font-mono text-muted pt-0.5 truncate">
              \${escapeHTML(specLine)}
            </div>
          </div>

          <!-- Price & Action Button Row -->
          <div class="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 mt-auto">
            <div>
              <div class="price-display leading-none text-xs sm:text-sm font-bold font-mono text-[#FF5C00]">\${priceFormatted}</div>
              \${originalPriceFormatted ? \`<div class="text-[10px] sm:text-[11px] text-muted line-through mt-0.5">\${originalPriceFormatted}</div>\` : ''}
            </div>

            <!-- Quick Add to Cart Button -->
            <button type="button" 
                    class="btn-primary text-[11px] sm:text-xs !py-2 !px-3 sm:!px-4 shrink-0" 
                    data-action="configure-product"
                    data-product-id="\${escapeHTML(item.id)}"
                    title="Xem và chọn phiên bản">
              <i class="fa-solid fa-arrow-right text-xs pointer-events-none"></i>
              <span class="pointer-events-none">Xem &amp; chọn</span>
            </button>
          </div>
        </div>
      </article>
    \`;
  }`;

if (oldCardRegex.test(code)) {
  code = code.replace(oldCardRegex, newCardFunc);
  console.log('Replaced buildProductCardHTML');
} else {
  console.error('Could not match buildProductCardHTML regex');
}

// 3. Add renderSubCategoryFilters function and update renderStoreProducts
const renderStoreOldRegex = /function renderStoreProducts\(filter = currentCategoryFilter, keepPage = false\) \{[\s\S]+?container\.innerHTML = `<div class="minimal-product-grid">[\s\S]+?<\/div>`;\s*\}/;

const renderStoreNewFunc = `function renderSubCategoryFilters(currentCategory) {
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
    let html = \`
      <button type="button" 
              class="sub-filter-pill \${currentSubCategoryFilter === 'all' ? 'active' : ''}" 
              data-sub-category="all" 
              aria-pressed="\${currentSubCategoryFilter === 'all'}">
        <span>Tất Cả</span>
        <span class="sub-pill-count">\${totalCount}</span>
      </button>
    \`;

    subCatMap.forEach((meta, subId) => {
      const isActive = currentSubCategoryFilter === subId;
      html += \`
        <button type="button" 
                class="sub-filter-pill \${isActive ? 'active' : ''}" 
                data-sub-category="\${escapeHTML(subId)}" 
                aria-pressed="\${isActive}">
          <span>\${escapeHTML(meta.name)}</span>
          <span class="sub-pill-count">\${meta.count}</span>
        </button>
      \`;
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
    if (count) count.textContent = matches.length ? \`\${matches.length} sản phẩm · Đang hiển thị \${visible.length}\` : 'Không có sản phẩm phù hợp';
    if (!matches.length) {
      container.innerHTML = \`<div class="minimal-empty"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><h3>Chưa tìm thấy món bạn cần.</h3><p>Thử một tên khác hoặc bỏ bớt bộ lọc.</p><button type="button" data-action="clear-search" class="btn-secondary">Xóa tìm kiếm</button><button type="button" data-action="view-category" data-category="all" class="minimal-text-action">Xem tất cả danh mục</button></div>\`;
      return;
    }
    const extra = matches.length - visible.length;
    container.innerHTML = \`<div class="minimal-product-grid">\${visible.map(buildProductCardHTML).join('')}</div><div class="minimal-pagination">\${extra > 0 ? \`<button type="button" class="btn-secondary" data-action="load-more">Xem thêm \${Math.min(8, extra)} sản phẩm <span aria-hidden="true">↓</span></button>\` : '<span>Bạn đã xem hết các sản phẩm phù hợp.</span>'}</div>\`;
  }`;

if (renderStoreOldRegex.test(code)) {
  code = code.replace(renderStoreOldRegex, renderStoreNewFunc);
  console.log('Replaced renderStoreProducts & added renderSubCategoryFilters');
} else {
  console.error('Could not match renderStoreProducts regex');
}

// 4. In initEventDelegation, attach listener to #store-sub-filters
const subFilterDelegation = `
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
`;

const initEventTarget = `function initEventDelegation() {
    const container = document.getElementById('store-product-grid');
    if (!container) return;`;

if (code.includes(initEventTarget)) {
  code = code.replace(initEventTarget, initEventTarget + subFilterDelegation);
  console.log('Added sub-filter delegation');
} else {
  console.error('Could not find initEventDelegation target');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated js/products-manager.js with 3-tier micro-taxonomy & dynamic sub-filters!');
