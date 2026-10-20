/**
 * T&T 3D Labs - Modern Minimalist Products Catalog & Store Renderer Manager
 * Benchmark: Bambu Lab & Teenage Engineering Industrial Standards
 * Tích hợp trực tiếp với TTCatalogStore tập trung
 */

(function (window) {
  'use strict';

  let currentCategoryFilter = 'all';

  function formatMoney(amount) {
    const num = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/\D/g, ''), 10) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
  }

  function getStoredProducts() {
    if (window.TTCatalogStore && typeof window.TTCatalogStore.getProductsSync === 'function') {
      return window.TTCatalogStore.getProductsSync(true);
    }
    return [];
  }

  // Render Product Card compliant with Tactile Minimalism & Bambu Lab standard
  function renderStoreProducts(filter = currentCategoryFilter) {
    currentCategoryFilter = filter;
    const grid = document.getElementById('store-product-grid');
    if (!grid) return;

    const products = getStoredProducts();
    const filtered = filter === 'all' 
      ? products 
      : products.filter(p => p.category === filter);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-20 text-center space-y-3">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-2xl text-secondary-color">
            <i class="fa-solid fa-box-open"></i>
          </div>
          <p class="text-sm font-medium text-secondary-color">Chưa có sản phẩm nào trong danh mục này.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(item => {
      const priceFormatted = formatMoney(item.price);
      const originalPriceFormatted = item.originalPrice ? formatMoney(item.originalPrice) : '';
      const swatches = (Array.isArray(item.colors) && item.colors.length > 0) ? item.colors : [
        { id: 'black', name: 'Đen Obsidian', hex: '#26282B' },
        { id: 'white', name: 'Trắng Sứ Nordic', hex: '#F5F2EB' },
        { id: 'terracotta', name: 'Cam Đất Mờ', hex: '#C85A32' }
      ];

      const specLine = item.specLine || (item.specs ? `📐 ${item.specs.dimensions || 'Chuẩn Xưởng'} | ${item.specs.material || 'Bio-PLA'}` : '📐 Tiêu chuẩn xưởng • Bio-PLA');

      return `
        <article class="studio-product-card group" data-product-id="${item.id}" onclick="window.openProductDetailModal('${item.id}')">
          <!-- Image Box with hover zoom & subtle 3D launcher -->
          <div class="product-image-box">
            <img src="${item.image || 'assets/images/logo-premium-mark.svg'}" 
                 width="600" 
                 height="600" 
                 loading="lazy" 
                 decoding="async" 
                 alt="${item.imageAlt || item.title}" 
                 id="img-${item.id}"
                 onerror="this.src='assets/images/logo-premium-mark.svg';">
            
            <!-- Frosted micro badge (top-left) -->
            ${item.badge ? `
              <span class="card-micro-badge">
                ${item.badge}
              </span>
            ` : ''}

            <!-- 3D Launcher Pill (top-right) -->
            <button type="button" 
                    class="card-3d-launcher" 
                    onclick="event.stopPropagation(); window.open3DViewerById('${item.id}')" 
                    title="Soi 3D tương tác 360°" 
                    aria-label="Soi 3D ${item.title}">
              <i class="fa-solid fa-cube text-xs"></i>
              <span>Soi 3D</span>
            </button>
          </div>

          <!-- Card Content Body -->
          <div class="p-5 flex flex-col flex-1 justify-between gap-4">
            <div class="space-y-2.5">
              
              <!-- Color Swatches Row (Interactive) -->
              <div class="flex items-center justify-between" onclick="event.stopPropagation()">
                <div class="swatch-group">
                  ${swatches.map((c, idx) => `
                    <button type="button" 
                            class="swatch-dot ${idx === 0 ? 'active' : ''}" 
                            style="background-color: ${c.hex};" 
                            title="${c.name}" 
                            onclick="window.selectCardSwatch('${item.id}', '${c.id}', '${c.name}', this)"></button>
                  `).join('')}
                </div>
                <span class="text-[11px] font-medium text-secondary-color truncate max-w-[120px]" id="swatch-name-${item.id}">
                  ${swatches[0].name}
                </span>
              </div>

              <!-- Product Title -->
              <h3 class="heading-3 line-clamp-1 group-hover:text-[#FF5C00] transition-colors">
                ${item.title}
              </h3>

              <!-- 1-Line Headline Benefit -->
              <p class="text-xs text-secondary-color line-clamp-2 leading-relaxed">
                ${item.headlineBenefit || item.desc}
              </p>

              <!-- Technical Spec Line (JetBrains Mono) -->
              <div class="text-spec pt-1">
                ${specLine}
              </div>
            </div>

            <!-- Price & Single CTA Button Row -->
            <div class="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3 mt-auto">
              <div>
                <div class="price-display leading-none">${priceFormatted}</div>
                ${originalPriceFormatted ? `<div class="text-[11px] text-muted line-through mt-0.5">${originalPriceFormatted}</div>` : ''}
              </div>

              <!-- 1 SINGLE PRIMARY CTA BUTTON -->
              <button type="button" 
                      class="btn-primary text-xs !py-2.5 !px-4" 
                      onclick="event.stopPropagation(); window.quickAddToCart('${item.id}')"
                      title="Thêm ngay vào giỏ hàng">
                <i class="fa-solid fa-bag-shopping text-xs"></i>
                <span>Thêm vào giỏ</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Swatch Click handler on card
  window.selectCardSwatch = function (prodId, swatchId, swatchName, dotEl) {
    const parentGroup = dotEl.parentElement;
    parentGroup.querySelectorAll('.swatch-dot').forEach(d => d.classList.remove('active'));
    dotEl.classList.add('active');

    window.cardSelectedColors = window.cardSelectedColors || {};
    window.cardSelectedColors[prodId] = swatchId;

    const nameLabel = document.getElementById(`swatch-name-${prodId}`);
    if (nameLabel) nameLabel.textContent = swatchName;
  };

  // Quick Add to Cart from Card button
  window.quickAddToCart = function (prodId) {
    const products = getStoredProducts();
    const item = products.find(p => p.id === prodId);
    if (!item) return;

    const defaultColor = (item.colors && item.colors[0]) || { id: 'default', name: 'Tiêu chuẩn', hex: '#26282B' };
    const defaultMat = (item.materials && item.materials[0]) || { id: 'pla_plus', name: 'PLA+ Nguyên Sinh', label: 'PLA+ Nguyên Sinh', priceModifier: 0 };

    if (window.TTCart && typeof window.TTCart.addToCart === 'function') {
      window.TTCart.addToCart({
        id: item.id,
        title: item.title,
        price: item.price + (defaultMat.priceModifier || 0),
        qty: 1,
        image: item.image,
        color: defaultColor,
        colorId: defaultColor.id,
        colorName: defaultColor.name,
        material: defaultMat,
        materialId: defaultMat.id,
        materialName: defaultMat.label || defaultMat.name,
        customText: null,
        category: item.category
      });
      window.TTCart.openCart();
      if (window.showToast) {
        window.showToast(`Đã thêm "${item.title}" vào giỏ hàng!`);
      }
    }
  };

  // Open Product Detail Modal
  window.openProductDetailModal = function (prodId) {
    const products = getStoredProducts();
    const item = products.find(p => p.id === prodId);
    if (!item) return;

    const modal = document.getElementById('order-modal');
    if (!modal) return;

    // Fill modal data
    const imgEl = document.getElementById('order-prod-img');
    const titleEl = document.getElementById('order-prod-title');
    const priceEl = document.getElementById('order-prod-price');
    const descEl = document.getElementById('order-prod-desc');
    const specsEl = document.getElementById('order-prod-specs-box');
    const swatchesEl = document.getElementById('order-swatches-box');
    const matsEl = document.getElementById('order-materials-box');
    const customInput = document.getElementById('order-custom-text-input');

    if (imgEl) {
      imgEl.src = item.image || 'assets/images/logo-premium-mark.svg';
      imgEl.onerror = () => { imgEl.src = 'assets/images/logo-premium-mark.svg'; };
    }
    if (titleEl) titleEl.textContent = item.title;
    if (priceEl) priceEl.textContent = formatMoney(item.price);
    if (descEl) descEl.textContent = item.desc;
    if (customInput) customInput.value = '';

    // Active state tracking
    window.modalActiveProduct = item;
    window.modalSelectedColor = (item.colors && item.colors[0]) || { id: 'default', name: 'Mặc định', hex: '#26282B' };
    window.modalSelectedMat = (item.materials && item.materials[0]) || { id: 'pla_plus', name: 'PLA+ Nguyên Sinh', label: 'PLA+ Nguyên Sinh', priceModifier: 0 };
    window.modalQty = 1;

    // Specs
    if (specsEl && item.specs) {
      specsEl.innerHTML = `
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div><span class="text-secondary-color">Kích thước:</span> <strong class="text-primary-color font-mono">${item.specs.dimensions || 'N/A'}</strong></div>
          <div><span class="text-secondary-color">Trọng lượng:</span> <strong class="text-primary-color font-mono">${item.specs.weight || 'N/A'}</strong></div>
          <div><span class="text-secondary-color">Độ mịn lớp:</span> <strong class="text-primary-color font-mono">${item.specs.layer || '0.16mm'}</strong></div>
          <div><span class="text-secondary-color">Bảo hành:</span> <strong class="text-primary-color font-mono">${item.specs.warranty || 'Đổi mới 1-1'}</strong></div>
          ${item.specs.nfc ? `<div class="col-span-2 pt-1 border-t border-[var(--border-subtle)]"><span class="text-secondary-color">NFC:</span> <strong class="text-[#FF5C00] font-mono">${item.specs.nfc}</strong></div>` : ''}
        </div>
      `;
    }

    // Render Modal Swatches
    if (swatchesEl && item.colors) {
      swatchesEl.innerHTML = `
        <div class="text-xs font-semibold text-secondary-color mb-2">Chọn màu sắc: <span id="modal-color-name" class="text-primary-color font-bold">${window.modalSelectedColor.name}</span></div>
        <div class="flex flex-wrap gap-2">
          ${item.colors.map((c, i) => `
            <button type="button" 
                    class="modal-color-btn px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${i === 0 ? 'border-[#FF5C00] bg-[rgba(255,92,0,0.12)] text-primary-color' : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-secondary-color'}" 
                    onclick="window.selectModalColor('${c.id}', '${c.name}', this)">
              <span class="w-3.5 h-3.5 rounded-full border border-black/20" style="background-color: ${c.hex}"></span>
              <span>${c.name}</span>
            </button>
          `).join('')}
        </div>
      `;
    }

    // Render Modal Materials
    if (matsEl && item.materials) {
      matsEl.innerHTML = `
        <div class="text-xs font-semibold text-secondary-color mb-2">Vật liệu in:</div>
        <div class="space-y-2">
          ${item.materials.map((m, i) => `
            <button type="button" 
                    class="modal-mat-btn w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${i === 0 ? 'border-[#FF5C00] bg-[var(--bg-surface-elevated)]' : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'}" 
                    onclick="window.selectModalMaterial('${m.id}', this)">
              <div>
                <div class="text-xs font-bold text-primary-color">${m.label || m.name}</div>
                <div class="text-[11px] text-secondary-color mt-0.5">${m.desc || ''}</div>
              </div>
              ${m.priceModifier > 0 ? `<span class="text-xs font-mono font-bold text-[#FF5C00] ml-2">+${formatMoney(m.priceModifier)}</span>` : ''}
            </button>
          `).join('')}
        </div>
      `;
    }

    window.updateModalPriceSummary();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.selectModalColor = function (colorId, colorName, btn) {
    if (!window.modalActiveProduct || !window.modalActiveProduct.colors) return;
    window.modalSelectedColor = window.modalActiveProduct.colors.find(c => c.id === colorId) || { id: colorId, name: colorName };
    const label = document.getElementById('modal-color-name');
    if (label) label.textContent = colorName;

    document.querySelectorAll('.modal-color-btn').forEach(b => {
      b.classList.remove('border-[#FF5C00]', 'bg-[rgba(255,92,0,0.12)]', 'text-primary-color');
      b.classList.add('border-[var(--border-subtle)]', 'bg-[var(--bg-surface-elevated)]', 'text-secondary-color');
    });
    btn.classList.add('border-[#FF5C00]', 'bg-[rgba(255,92,0,0.12)]', 'text-primary-color');
    btn.classList.remove('border-[var(--border-subtle)]', 'bg-[var(--bg-surface-elevated)]', 'text-secondary-color');
  };

  window.selectModalMaterial = function (matId, btn) {
    if (!window.modalActiveProduct || !window.modalActiveProduct.materials) return;
    window.modalSelectedMat = window.modalActiveProduct.materials.find(m => m.id === matId) || { id: matId, name: 'Tiêu chuẩn', priceModifier: 0 };

    document.querySelectorAll('.modal-mat-btn').forEach(b => {
      b.classList.remove('border-[#FF5C00]', 'bg-[var(--bg-surface-elevated)]');
      b.classList.add('border-[var(--border-subtle)]', 'bg-[var(--bg-surface)]');
    });
    btn.classList.add('border-[#FF5C00]', 'bg-[var(--bg-surface-elevated)]');
    btn.classList.remove('border-[var(--border-subtle)]', 'bg-[var(--bg-surface)]');

    window.updateModalPriceSummary();
  };

  window.updateModalPriceSummary = function () {
    if (!window.modalActiveProduct) return;
    const base = window.modalActiveProduct.price;
    const modifier = (window.modalSelectedMat && window.modalSelectedMat.priceModifier) || 0;
    const unitPrice = base + modifier;
    const total = unitPrice * (window.modalQty || 1);

    const priceEl = document.getElementById('order-prod-price');
    const submitBtnLabel = document.getElementById('modal-submit-price-label');

    if (priceEl) priceEl.textContent = formatMoney(unitPrice);
    if (submitBtnLabel) submitBtnLabel.textContent = `Thêm Vào Giỏ • ${formatMoney(total)}`;
  };

  window.changeModalQty = function (delta) {
    window.modalQty = Math.max(1, (window.modalQty || 1) + delta);
    const qtyVal = document.getElementById('modal-qty-val');
    if (qtyVal) qtyVal.textContent = window.modalQty;
    window.updateModalPriceSummary();
  };

  window.submitModalAddToCart = function () {
    if (!window.modalActiveProduct) return;
    const customInput = document.getElementById('order-custom-text-input');
    const customText = customInput ? customInput.value.trim() : null;

    const unitPrice = window.modalActiveProduct.price + (window.modalSelectedMat?.priceModifier || 0);

    if (window.TTCart && typeof window.TTCart.addToCart === 'function') {
      window.TTCart.addToCart({
        id: window.modalActiveProduct.id,
        title: window.modalActiveProduct.title,
        price: unitPrice,
        qty: window.modalQty || 1,
        image: window.modalActiveProduct.image,
        color: window.modalSelectedColor,
        colorId: window.modalSelectedColor?.id,
        colorName: window.modalSelectedColor?.name,
        material: window.modalSelectedMat,
        materialId: window.modalSelectedMat?.id,
        materialName: window.modalSelectedMat?.label || window.modalSelectedMat?.name,
        customText: customText || null,
        category: window.modalActiveProduct.category
      });

      window.closeProductDetailModal();
      window.TTCart.openCart();
      if (window.showToast) {
        window.showToast(`Đã thêm ${window.modalQty} sản phẩm vào giỏ hàng!`);
      }
    }
  };

  window.closeProductDetailModal = function () {
    const modal = document.getElementById('order-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  // Expose global methods
  window.renderStoreProducts = renderStoreProducts;
  window.getStoredProducts = getStoredProducts;

  // Lắng nghe sự kiện catalog cập nhật từ TTCatalogStore
  window.addEventListener('tt_products_updated', () => {
    renderStoreProducts(currentCategoryFilter);
  });

  // Khởi tạo khi DOM sẵn sàng
  async function init() {
    if (window.TTCatalogStore && typeof window.TTCatalogStore.init === 'function') {
      await window.TTCatalogStore.init();
    }
    renderStoreProducts('all');

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
