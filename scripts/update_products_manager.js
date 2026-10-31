const fs = require('fs');

let code = fs.readFileSync('js/products-manager.js', 'utf8');

// 1. Update buildProductCardHTML
const oldCardTarget = `  // 3. HTML TEMPLATE BUILDERS (XSS-Safe)
  function buildProductCardHTML(item) {
    const title = item.cleanTitle || getCleanTitle(item.title);
    const swatches = (Array.isArray(item.colors) ? item.colors : []).filter(color => isValidHex(color.hex));
    const category = CATEGORY_REGISTRY[item.category]?.shortName || 'Thiết kế T&T';
    const benefit = item.headlineBenefit || item.microSpecs || item.specLine || item.desc || '';
    const hasVariants = Array.isArray(item.materials) && item.materials.some(material => Number(material.priceModifier) > 0);
    const personalizable = item.type === 'monogram' || item.requiresCustomText || item.specs?.requireCustomText;
    const isNFC = /nfc|wifi/i.test(item.title || '') && item.category === 'Ca_Nhan_Hoa_NFC';
    const badge = personalizable ? 'Thêm tên riêng' : (isNFC ? 'NFC tích hợp' : '');
    const original = Number(item.originalPrice) > Number(item.price) ? formatMoney(item.originalPrice) : '';
    return \`
      <article class="catalog-product-card tt-product-card studio-product-card" data-product-id="\${escapeHTML(item.id)}">
        <button type="button" class="catalog-product-photo tt-product-media" data-action="open-detail" data-product-id="\${escapeHTML(item.id)}" aria-label="Xem ảnh và chi tiết \${escapeHTML(title)}">
          <img src="\${sanitizeImageUrl(item.image)}" width="600" height="600" loading="lazy" decoding="async" alt="\${escapeHTML(item.imageAlt || title)}" onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
          \${badge ? \`<span class="catalog-product-badge">\${badge}</span>\` : ''}
          <span class="catalog-photo-hint" aria-hidden="true"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
        </button>
        <div class="catalog-product-info">
          <p class="catalog-product-category">\${escapeHTML(category)}</p>
          <h3 class="catalog-product-title">\${escapeHTML(title)}</h3>`;

const newCardReplacement = `  // 3. HTML TEMPLATE BUILDERS (XSS-Safe)
  function buildProductCardHTML(item) {
    const view = (window.TTCatalogStore && typeof window.TTCatalogStore.getProductPresentation === 'function')
      ? window.TTCatalogStore.getProductPresentation(item)
      : {
          title: item.cleanTitle || getCleanTitle(item.title),
          categoryLabel: CATEGORY_REGISTRY[item.category]?.shortName || 'Thiết kế T&T'
        };
    const title = view.title;
    const category = view.categoryLabel;
    const swatches = (Array.isArray(item.colors) ? item.colors : []).filter(color => isValidHex(color.hex));
    const benefit = item.headlineBenefit || item.microSpecs || item.specLine || item.desc || '';
    const hasVariants = Array.isArray(item.materials) && item.materials.some(material => Number(material.priceModifier) > 0);
    const personalizable = item.type === 'monogram' || item.requiresCustomText || item.specs?.requireCustomText;
    const isNFC = /nfc|wifi/i.test(item.title || '') && item.category === 'Ca_Nhan_Hoa_NFC';
    const badge = personalizable ? 'Thêm tên riêng' : (isNFC ? 'NFC tích hợp' : '');
    const original = Number(item.originalPrice) > Number(item.price) ? formatMoney(item.originalPrice) : '';
    return \`
      <article class="catalog-product-card tt-product-card studio-product-card" data-product-id="\${escapeHTML(item.id)}">
        <button type="button" class="catalog-product-photo tt-product-media" data-action="open-detail" data-product-id="\${escapeHTML(item.id)}" aria-label="Xem ảnh và chi tiết \${escapeHTML(title)}">
          <img src="\${sanitizeImageUrl(item.image)}" width="600" height="600" loading="lazy" decoding="async" alt="\${escapeHTML(item.imageAlt || title)}" onerror="this.onerror=null; this.src='assets/images/logo-premium-mark.svg';">
          \${badge ? \`<span class="catalog-product-badge">\${badge}</span>\` : ''}
          <span class="catalog-photo-hint" aria-hidden="true"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
        </button>
        <div class="catalog-product-info">
          <p class="catalog-product-category">\${escapeHTML(category)}</p>
          <h3 class="catalog-product-title tt-product-name"><button type="button" class="catalog-title-button" data-action="open-detail" data-product-id="\${escapeHTML(item.id)}" aria-label="Xem chi tiết \${escapeHTML(title)}">\${escapeHTML(title)}</button></h3>`;

code = code.replace(oldCardTarget.replace(/\r\n/g, '\n'), newCardReplacement.replace(/\r\n/g, '\n'));

// 2. Update buildHeroSpotlightHTML
const oldHeroTarget = `    const safeImage = sanitizeImageUrl(item.image);
    const priceFormatted = formatMoney(item.price);
    const originalPriceFormatted = item.originalPrice ? formatMoney(item.originalPrice) : '';
    const cleanTitle = getCleanTitle(item.title);

    const sp = item.specs || {};
    const specTags = [
      sp.dimensions ? \`📐 \${sp.dimensions}\` : '📐 Kích thước chuẩn',
      sp.weight ? \`⚖️ \${sp.weight}\` : '⚖️ Nhẹ bền',
      item.materialRecommendation ? \`🌱 \${item.materialRecommendation}\` : '🌱 Bio-PLA Cao Cấp'
    ];`;

const newHeroReplacement = `    const safeImage = sanitizeImageUrl(item.image);
    const priceFormatted = formatMoney(item.price);
    const originalPriceFormatted = item.originalPrice ? formatMoney(item.originalPrice) : '';
    const view = (window.TTCatalogStore && typeof window.TTCatalogStore.getProductPresentation === 'function')
      ? window.TTCatalogStore.getProductPresentation(item)
      : { title: item.cleanTitle || getCleanTitle(item.title) };
    const cleanTitle = view.title;

    const sp = item.specs || {};
    const specTags = [];
    if (sp.dimensions) specTags.push(\`📐 \${sp.dimensions}\`);
    if (sp.weight) specTags.push(\`⚖️ \${sp.weight}\`);
    if (sp.layer) specTags.push(\`🖨️ \${sp.layer}\`);
    else if (item.materialRecommendation) specTags.push(\`🌱 \${item.materialRecommendation}\`);`;

code = code.replace(oldHeroTarget.replace(/\r\n/g, '\n'), newHeroReplacement.replace(/\r\n/g, '\n'));

// 3. Update openProductDetailModal
const oldModalTarget = `    if (imgEl) {
      imgEl.src = sanitizeImageUrl(item.image);
      imgEl.alt = item.imageAlt || getCleanTitle(item.title) || 'Ảnh sản phẩm';
      imgEl.onerror = function () {
        this.onerror = null;
        this.src = 'assets/images/logo-premium-mark.svg';
      };
    }`;

const newModalReplacement = `    const modalView = (window.TTCatalogStore && typeof window.TTCatalogStore.getProductPresentation === 'function')
      ? window.TTCatalogStore.getProductPresentation(item)
      : { title: item.cleanTitle || getCleanTitle(item.title) };
    if (imgEl) {
      imgEl.src = sanitizeImageUrl(item.image);
      imgEl.alt = item.imageAlt || modalView.title || 'Ảnh sản phẩm';
      imgEl.onerror = function () {
        this.onerror = null;
        this.src = 'assets/images/logo-premium-mark.svg';
      };
    }`;

code = code.replace(oldModalTarget.replace(/\r\n/g, '\n'), newModalReplacement.replace(/\r\n/g, '\n'));

code = code.replace(
  'if (titleEl) titleEl.textContent = getCleanTitle(item.title);',
  'if (titleEl) titleEl.textContent = modalView.title;'
);

fs.writeFileSync('js/products-manager.js', code, 'utf8');
console.log('Successfully updated js/products-manager.js.');
