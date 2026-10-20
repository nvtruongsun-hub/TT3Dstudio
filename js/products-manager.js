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

  // Open Product Detail Modal
  window.openProductDetailModal = function (prodId) {
    const products = getStoredProducts();
    const item = products.find(p => p.id === prodId);
    if (!item) return;

    const modal = document.getElementById('order-modal');
    if (!modal) return;

    // Active state tracking
    window.modalActiveProduct = item;
    window.modalQty = 1;

    // Kiểm tra màu đã chọn trước trên card
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

    // Vật liệu mặc định
    const initialMat = (Array.isArray(item.materials) && item.materials.length > 0)
      ? item.materials[0]
      : { id: 'pla_matte', name: 'PLA Matte', label: 'PLA Matte Thẩm Mỹ', desc: 'Bề mặt mờ mịn cao cấp', priceModifier: 0 };
    window.modalSelectedMat = initialMat;

    // Fill Visuals
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

    if (imgEl) {
      imgEl.src = item.image || 'assets/images/logo-premium-mark.svg';
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

    // Technical Specs Grid (Semantic <dl>)
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
          <dt class="text-[11px] uppercase tracking-wider text-secondary-color font-medium">${s.label}</dt>
          <dd class="font-mono font-semibold ${s.isAccent ? 'text-[#FF5C00]' : 'text-primary-color'} truncate">${s.val}</dd>
        </div>
      `).join('');
    }

    // Render Modal Swatches
    if (swatchesEl) {
      const colors = (Array.isArray(item.colors) && item.colors.length > 0)
        ? item.colors
        : [initialColor];

      swatchesEl.innerHTML = `
        <div class="flex items-center justify-between text-xs font-semibold text-secondary-color mb-1.5">
          <span>Chọn màu sắc:</span>
          <span id="modal-color-name" class="text-primary-color font-bold">${initialColor.name}</span>
        </div>
        <div class="flex flex-wrap gap-2.5">
          ${colors.map((c) => `
            <button type="button" 
                    class="modal-color-btn px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${c.id === initialColor.id ? 'border-[#FF5C00] bg-[rgba(255,92,0,0.12)] text-primary-color ring-2 ring-[#FF5C00]/30' : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-secondary-color hover:border-slate-500'}" 
                    onclick="window.selectModalColor('${c.id}', '${c.name}', this)">
              <span class="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0" style="background-color: ${c.hex}"></span>
              <span>${c.name}</span>
            </button>
          `).join('')}
        </div>
      `;
    }

    // Render Modal Materials
    if (matsEl) {
      const materials = (Array.isArray(item.materials) && item.materials.length > 0)
        ? item.materials
        : [initialMat];

      matsEl.innerHTML = `
        <div class="text-xs font-semibold text-secondary-color mb-1.5">Vật liệu in:</div>
        <div class="space-y-2">
          ${materials.map((m, i) => `
            <button type="button" 
                    class="modal-mat-btn w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${i === 0 ? 'border-[#FF5C00] bg-[var(--bg-surface-elevated)] ring-1 ring-[#FF5C00]/40' : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-slate-600'}" 
                    onclick="window.selectModalMaterial('${m.id}', this)">
              <div>
                <div class="text-xs font-bold text-primary-color flex items-center gap-2">
                  <span>${m.label || m.name}</span>
                  ${i === 0 ? '<span class="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-[#FF5C00]/15 text-[#FF5C00]">Khuyên dùng</span>' : ''}
                </div>
                <div class="text-[11px] text-secondary-color mt-0.5">${m.desc || ''}</div>
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

  /**
   * Tạo dòng sản phẩm đã cấu hình (Contract chung duy nhất cho Giỏ Hàng và Mua Ngay)
   */
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

  // Action 1: Thêm Vào Giỏ
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

  // Action 2: Đặt Hàng Ngay (Direct Checkout - Không động tới Giỏ Hàng)
  window.submitModalDirectCheckout = function () {
    const line = buildConfiguredLine();
    if (!line) return;

    window.closeProductDetailModal();

    if (window.TTCheckout && typeof window.TTCheckout.openCheckout === 'function') {
      window.TTCheckout.openCheckout([line], 0, { source: 'direct' });
    }
  };

  // Soi 3D từ Modal
  window.open3DFromModal = function () {
    if (!window.modalActiveProduct) return;
    const prodId = window.modalActiveProduct.id;
    window.closeProductDetailModal();
    if (window.open3DViewerById) {
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
