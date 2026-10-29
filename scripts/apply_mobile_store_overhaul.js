const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');
const cssPath = path.join(rootDir, 'css', 'style.css');
const productsJsPath = path.join(rootDir, 'js', 'products-manager.js');

let indexHtml = fs.readFileSync(indexPath, 'utf8');
let cssStyle = fs.readFileSync(cssPath, 'utf8');
let productsJs = fs.readFileSync(productsJsPath, 'utf8');

// =========================================================================
// 1. INSERT ARTISAN TRUST STRIP AT TOP OF #view-store
// =========================================================================
const trustStripHtml = `
      <!-- ARTISAN TRUST STRIP (ZERO EMOJI • MONOLINE SVG • STUDIO VERIFIED) -->
      <div id="artisan-trust-strip" class="artisan-trust-strip bg-[#EFECE6] border-b border-[#E5E4DE] py-2 px-3 sm:px-6">
        <div class="max-w-7xl mx-auto flex items-center justify-between sm:justify-center gap-3 sm:gap-8 overflow-x-auto scrollbar-none text-[10.5px] font-mono text-[#586057] uppercase tracking-wider whitespace-nowrap">
          <div class="flex items-center gap-1.5 shrink-0">
            <svg class="w-3.5 h-3.5 text-[#D45B34]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span class="font-bold text-[#20231F]">IN 3D CHUẨN 0.1MM</span>
          </div>
          <span class="text-[#D45B34] hidden sm:inline">•</span>
          <div class="flex items-center gap-1.5 shrink-0">
            <svg class="w-3.5 h-3.5 text-[#D45B34]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
            <span>NHỰA SINH HỌC BIO-PLA</span>
          </div>
          <span class="text-[#D45B34] hidden sm:inline">•</span>
          <div class="flex items-center gap-1.5 shrink-0">
            <svg class="w-3.5 h-3.5 text-[#D45B34]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>BẢO HÀNH LỖI IN 1:1</span>
          </div>
          <span class="text-[#D45B34] hidden sm:inline">•</span>
          <div class="flex items-center gap-1.5 shrink-0">
            <svg class="w-3.5 h-3.5 text-[#D45B34]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.948c0-.621-.504-1.125-1.125-1.125H4.875c-.621 0-1.125.504-1.125 1.125v10.328c0 .621.504 1.125 1.125 1.125h.375m11.25-10.428h2.625c.621 0 1.125.504 1.125 1.125v3.188c0 .621-.504 1.125-1.125 1.125H16.5" />
            </svg>
            <span>GIAO HOẢ TỐC 24/7</span>
          </div>
        </div>
      </div>
`;

if (!indexHtml.includes('id="artisan-trust-strip"')) {
  const storeViewTarget = '<div id="view-store" class="app-workspace active" role="tabpanel" tabindex="0" aria-label="Cửa Hàng">';
  indexHtml = indexHtml.replace(storeViewTarget, storeViewTarget + trustStripHtml);
  console.log('Inserted #artisan-trust-strip into index.html');
}

// =========================================================================
// 2. INSERT STORE BIRDS-EYE HUB (5 SQUIRLE CATEGORIES WITH LIVE COUNTS)
// =========================================================================
const birdsEyeHubHtml = `
      <!-- STORE BIRDS-EYE HUB (5 SQUIRCLE CATEGORIES • 1-TOUCH STORE OVERVIEW) -->
      <section id="store-birdseye-hub" class="py-3 sm:py-4 bg-white border-b border-[#E5E4DE]">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between pb-2">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-[#D45B34]"></span>
              <span class="text-[11px] sm:text-xs font-bold font-mono text-[#20231F] uppercase tracking-wider">KHÁM PHÁ 55 THIẾT KẾ ĐỘC BẢN</span>
            </div>
            <span class="text-[10px] sm:text-[11px] font-mono text-[#8A847C]">5 Danh Mục Chế Tác</span>
          </div>

          <div class="grid grid-cols-5 gap-1.5 sm:gap-3 overflow-x-auto scrollbar-none pb-0.5">
            <!-- 1. Trang Điểm & Nơ Lụa -->
            <button type="button" 
                    onclick="window.navigateToCategory('Trang_Diem_Vanity')" 
                    class="group flex flex-col items-center p-1.5 sm:p-2 rounded-xl bg-[#F7F6F2] hover:bg-rose-50/60 border border-[#E5E4DE] hover:border-rose-300 transition-all text-center relative cursor-pointer">
              <span class="absolute top-1 right-1 px-1 rounded-full bg-white text-[8.5px] font-mono font-bold text-rose-500 border border-rose-200">11</span>
              <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-white border border-[#E5E4DE] flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform overflow-hidden p-0.5">
                <img src="assets/images/products/thumb_2084928.png" alt="Trang Điểm" class="w-full h-full object-cover rounded-md" onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
              </div>
              <span class="mt-1 text-[9.5px] sm:text-xs font-bold text-[#20231F] group-hover:text-rose-600 truncate w-full">Trang Điểm</span>
            </button>

            <!-- 2. Đèn & Decor -->
            <button type="button" 
                    onclick="window.navigateToCategory('Decor_Den_Noi_That')" 
                    class="group flex flex-col items-center p-1.5 sm:p-2 rounded-xl bg-[#F7F6F2] hover:bg-amber-50/60 border border-[#E5E4DE] hover:border-amber-300 transition-all text-center relative cursor-pointer">
              <span class="absolute top-1 right-1 px-1 rounded-full bg-white text-[8.5px] font-mono font-bold text-amber-600 border border-amber-200">11</span>
              <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-white border border-[#E5E4DE] flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform overflow-hidden p-0.5">
                <img src="assets/images/products/thumb_1438306.png" alt="Đèn Decor" class="w-full h-full object-cover rounded-md" onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
              </div>
              <span class="mt-1 text-[9.5px] sm:text-xs font-bold text-[#20231F] group-hover:text-amber-700 truncate w-full">Đèn Decor</span>
            </button>

            <!-- 3. Hộp Bàn Tiện Ích -->
            <button type="button" 
                    onclick="window.navigateToCategory('Hop_De_Ban_Tien_Ich')" 
                    class="group flex flex-col items-center p-1.5 sm:p-2 rounded-xl bg-[#F7F6F2] hover:bg-emerald-50/60 border border-[#E5E4DE] hover:border-emerald-300 transition-all text-center relative cursor-pointer">
              <span class="absolute top-1 right-1 px-1 rounded-full bg-white text-[8.5px] font-mono font-bold text-emerald-600 border border-emerald-200">11</span>
              <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-white border border-[#E5E4DE] flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform overflow-hidden p-0.5">
                <img src="assets/images/products/thumb_1971424.png" alt="Hộp Bàn" class="w-full h-full object-cover rounded-md" onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
              </div>
              <span class="mt-1 text-[9.5px] sm:text-xs font-bold text-[#20231F] group-hover:text-emerald-700 truncate w-full">Hộp Bàn</span>
            </button>

            <!-- 4. Ô Tô & NFC -->
            <button type="button" 
                    onclick="window.navigateToCategory('Ca_Nhan_Hoa_NFC')" 
                    class="group flex flex-col items-center p-1.5 sm:p-2 rounded-xl bg-[#F7F6F2] hover:bg-sky-50/60 border border-[#E5E4DE] hover:border-sky-300 transition-all text-center relative cursor-pointer">
              <span class="absolute top-1 right-1 px-1 rounded-full bg-white text-[8.5px] font-mono font-bold text-sky-600 border border-sky-200">11</span>
              <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-white border border-[#E5E4DE] flex items-center justify-center text-sky-500 group-hover:scale-105 transition-transform overflow-hidden p-0.5">
                <img src="assets/images/products/thumb_1896792.png" alt="Ô Tô & NFC" class="w-full h-full object-cover rounded-md" onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
              </div>
              <span class="mt-1 text-[9.5px] sm:text-xs font-bold text-[#20231F] group-hover:text-sky-700 truncate w-full">Ô Tô &amp; NFC</span>
            </button>

            <!-- 5. Fidget & Toy -->
            <button type="button" 
                    onclick="window.navigateToCategory('Do_Choi_Moc_Khoa')" 
                    class="group flex flex-col items-center p-1.5 sm:p-2 rounded-xl bg-[#F7F6F2] hover:bg-indigo-50/60 border border-[#E5E4DE] hover:border-indigo-300 transition-all text-center relative cursor-pointer">
              <span class="absolute top-1 right-1 px-1 rounded-full bg-white text-[8.5px] font-mono font-bold text-indigo-600 border border-indigo-200">11</span>
              <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-white border border-[#E5E4DE] flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-transform overflow-hidden p-0.5">
                <img src="assets/images/products/thumb_1795991.png" alt="Fidget" class="w-full h-full object-cover rounded-md" onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
              </div>
              <span class="mt-1 text-[9.5px] sm:text-xs font-bold text-[#20231F] group-hover:text-indigo-700 truncate w-full">Fidget Cơ</span>
            </button>
          </div>
        </div>
      </section>
`;

if (!indexHtml.includes('id="store-birdseye-hub"')) {
  const heroEndTarget = '</section>\r\n\r\n      <section id="shop-by-need"';
  const heroEndTargetLf = '</section>\n\n      <section id="shop-by-need"';
  if (indexHtml.includes(heroEndTarget)) {
    indexHtml = indexHtml.replace(heroEndTarget, '</section>\r\n' + birdsEyeHubHtml + '\r\n      <section id="shop-by-need"');
    console.log('Inserted #store-birdseye-hub into index.html (CRLF)');
  } else if (indexHtml.includes(heroEndTargetLf)) {
    indexHtml = indexHtml.replace(heroEndTargetLf, '</section>\n' + birdsEyeHubHtml + '\n      <section id="shop-by-need"');
    console.log('Inserted #store-birdseye-hub into index.html (LF)');
  }
}

// =========================================================================
// 3. TIGHTEN CURATED GRID & SECTIONS PADDING ON MOBILE
// =========================================================================
indexHtml = indexHtml.replace(
  'id="curated-product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"',
  'id="curated-product-grid" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6"'
);
indexHtml = indexHtml.replace(
  'id="curated-product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"',
  'id="curated-product-grid" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6"'
);

// Reduce section padding on mobile
indexHtml = indexHtml.replace('class="py-12 sm:py-16 border-b border-[#DCDDD5]"', 'class="py-6 sm:py-12 border-b border-[#DCDDD5]"');
indexHtml = indexHtml.replace('class="py-16 border-b border-[#DCDDD5] bg-white"', 'class="py-6 sm:py-12 border-b border-[#DCDDD5] bg-white"');

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('Updated index.html with Birds-Eye Hub, Trust Strip, and 2-column curated grid!');

// =========================================================================
// 4. UPDATE PRODUCT CARD IN js/products-manager.js
// =========================================================================
const oldCardRegex = /function buildProductCardHTML\(item\) \{[\s\S]+?return `\s*<article class="minimal-product-card studio-product-card group cursor-pointer"[\s\S]+?<\/article>\s*`;\s*\}/;

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
      <article class="minimal-product-card studio-product-card group cursor-pointer flex flex-col justify-between" data-product-id="\${escapeHTML(item.id)}" onclick="if(!event.target.closest('[data-action]')) window.openProductDetailModal('\${escapeHTML(item.id)}')">
        <!-- Clean Product Visual Frame (Aspect 1:1) -->
        <button type="button" aria-label="Xem \${escapeHTML(cleanTitle)}" data-action="open-detail" data-product-id="\${escapeHTML(item.id)}" class="product-image-box relative overflow-hidden group aspect-square block w-full bg-[#F2F0EA]">
          <img src="\${safeImage}" 
               width="400" 
               height="400" 
               loading="lazy" 
               decoding="async" 
               alt="\${escapeHTML(item.imageAlt || cleanTitle)}" 
               id="img-\${escapeHTML(item.id)}"
               class="studio-crisp-img w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
          
          <!-- Archetype & Engineering Badge (Compact Studio Pill) -->
          \${badgeText ? \`
            <div class="absolute top-1.5 left-1.5 pointer-events-none z-10 max-w-[85%]">
              <span class="px-1.5 py-0.5 rounded-md text-[9px] font-bold \${getBadgeThemeClass(badgeTheme)} shadow-xs flex items-center gap-1 border backdrop-blur-xs bg-opacity-95 truncate">
                <span class="w-1.5 h-1.5 rounded-full shrink-0 \${getBadgeDotClass(badgeTheme)}"></span>
                <span class="truncate">\${escapeHTML(badgeText)}</span>
              </span>
            </div>
          \` : (isNFC ? \`
            <div class="absolute top-1.5 left-1.5 pointer-events-none z-10">
              <span class="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#FAF5FF]/95 text-[#6B21A8] border border-[#E9D5FF] shadow-xs flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-[#6B21A8] shrink-0"></span>
                <span>NFC 1-Chạm</span>
              </span>
            </div>
          \` : '')}
        </button>

        <!-- Card Content Body (Compact Ergonomic Padding) -->
        <div class="p-2 sm:p-3.5 flex flex-col flex-1 justify-between gap-1.5">
          <div class="space-y-1">
            
            <!-- Micro-Eyebrow Context (Truncated 1 line) -->
            \${item.useCaseEyebrow ? \`
              <div class="text-[9px] sm:text-[9.5px] font-mono font-bold tracking-wider uppercase text-[#8C6218] truncate">
                \${escapeHTML(item.useCaseEyebrow)}
              </div>
            \` : ''}

            <!-- Product Title (Clean, short, readable, 2-line uniform height) -->
            <h3 class="product-card-title text-xs sm:text-sm font-bold font-display text-primary-color line-clamp-2 min-h-[32px] sm:min-h-[38px] group-hover:text-[#FF5C00] transition-colors leading-snug" title="\${escapeHTML(cleanTitle)}">
              \${escapeHTML(cleanTitle)}
            </h3>

            <!-- Micro-Specs Line (Compact 1 line) -->
            <div class="text-[9.5px] sm:text-[10.5px] font-mono text-[#78736A] truncate">
              \${escapeHTML(specLine)}
            </div>
          </div>

          <!-- Price & Action Row -->
          <div class="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-1 mt-auto">
            <div class="truncate">
              <div class="price-display leading-none text-xs sm:text-sm font-bold font-mono text-[#D45B34]">\${priceFormatted}</div>
              \${originalPriceFormatted ? \`<div class="text-[9px] sm:text-[10px] text-muted line-through mt-0.5">\${originalPriceFormatted}</div>\` : ''}
            </div>

            <!-- Sleek Action Button -->
            <button type="button" 
                    class="w-7 h-7 sm:w-auto sm:h-auto sm:py-1.5 sm:px-2.5 rounded-lg bg-[#F7F6F2] hover:bg-[#D45B34] text-[#20231F] hover:text-white border border-[#E5E4DE] hover:border-[#D45B34] flex items-center justify-center text-xs font-bold transition-all relative shrink-0 cursor-pointer" 
                    data-action="configure-product"
                    data-product-id="\${escapeHTML(item.id)}"
                    title="Xem &amp; chọn">
              <i class="fa-solid fa-arrow-right text-[10px] pointer-events-none"></i>
              <span class="hidden sm:inline pointer-events-none ml-1 text-[11px]">Xem</span>
            </button>
          </div>
        </div>
      </article>
    \`;
  }`;

if (oldCardRegex.test(productsJs)) {
  productsJs = productsJs.replace(oldCardRegex, newCardFunc);
  fs.writeFileSync(productsJsPath, productsJs, 'utf8');
  console.log('Updated buildProductCardHTML in js/products-manager.js with 178px micro-proportions!');
} else {
  console.error('Could not match buildProductCardHTML regex in js/products-manager.js');
}

// =========================================================================
// 5. UPDATE CSS GRID & STICKY FILTER BAR IN css/style.css
// =========================================================================
const mobileGridCss = `
/* ==========================================================================
   MOBILE STOREFRONT 2-COLUMN GRID & BIRDS-EYE HUB (ARGON 4 SPEC)
   ========================================================================== */
@media (max-width: 639px) {
  .minimal-product-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
    padding: 0 !important;
  }

  .minimal-storefront #store-product-grid[data-layout="large"] .minimal-product-grid,
  .minimal-storefront #store-product-grid[data-layout="compact"] .minimal-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
  }

  .studio-product-card {
    border-radius: 12px !important;
    border: 1px solid #E5E4DE !important;
    background: #FFFFFF !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02) !important;
  }

  .studio-product-card .product-card-title {
    min-height: 32px !important;
    font-size: 12px !important;
    line-height: 1.3 !important;
  }
}

@media (min-width: 640px) and (max-width: 1023px) {
  .minimal-product-grid {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 16px !important;
  }
}

@media (min-width: 1024px) {
  .minimal-product-grid {
    display: grid !important;
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    gap: 24px !important;
  }
}

/* Sticky Filter Bar on Scroll */
.store-filters-sticky-wrapper {
  position: sticky;
  top: 0;
  z-index: 25;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding-top: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(229, 228, 222, 0.8);
}
`;

if (!cssStyle.includes('MOBILE STOREFRONT 2-COLUMN GRID')) {
  cssStyle += mobileGridCss;
  fs.writeFileSync(cssPath, cssStyle, 'utf8');
  console.log('Appended Mobile Storefront 2-Column Grid CSS to css/style.css');
}
