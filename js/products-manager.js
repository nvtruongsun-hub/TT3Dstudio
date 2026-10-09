/**
 * T&T 3D Studio - Modern Minimalist Products Catalog & Store Renderer Manager
 * Benchmark: Bambu Lab & Grovemade E-Commerce Standards
 * (Sheet 3: ID-13, ID-14, ID-15, ID-16, ID-18, ID-19, ID-34, ID-35)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'tt_products';
  const DEFAULT_ZALO_PHONE = '0986888333';

  // Danh mục 6 sản phẩm chủ lực chuẩn Modern Industrial Craft
  const DEFAULT_PRODUCTS = [
    {
      id: 'prod-1',
      title: 'Đế WiFi 1 Chạm Thông Minh TapConnect™',
      category: 'smart-nfc',
      type: 'nfc',
      price: 109000,
      originalPrice: 149000,
      badge: '⚡ NTAG215',
      image: 'assets/images/product-nfc-wifi.jpg',
      modelKey: 'nfc_wifi',
      desc: 'Chạm smartphone kết nối WiFi & mở Menu tự động không cần hỏi mật khẩu. Nhựa Bio-PLA Matte cao cấp đúc chìm chip NFC chống nước tuyệt đối, không dùng pin.',
      headlineBenefit: 'Tăng trải nghiệm khách gọi món & kết nối chỉ với 1 cú chạm điện thoại',
      specLine: '📐 82 x 64 x 95 mm | 90g | Bio-PLA Matte',
      specs: {
        dimensions: '82 x 64 x 95 mm',
        weight: '90g',
        layer: '0.16mm (Lớp in siêu mịn)',
        material: 'Bio-PLA Matte nguyên sinh',
        nfc: 'Chip NTAG215 đúc chìm (iOS & Android)',
        warranty: '12 tháng đổi mới 1-1'
      },
      colors: [
        { id: 'obsidian', name: 'Đen Obsidian', hex: '#26282B' },
        { id: 'white', name: 'Trắng Sứ Nordic', hex: '#F5F2EB' },
        { id: 'terracotta', name: 'Cam Đất Mờ', hex: '#C85A32' },
        { id: 'walnut', name: 'Gỗ Walnut Sẫm', hex: '#4A3525' }
      ],
      materials: [
        { id: 'pla_plus', name: 'PLA+ Nguyên Sinh', label: 'PLA+ Nguyên Sinh (Mờ mịn)', priceModifier: 0, desc: 'Bề mặt mờ nhám siêu mịn, chống bám vân tay' },
        { id: 'wood_pla', name: 'Wood Composite', label: 'Wood Composite (Mộc ấm cúng)', priceModifier: 20000, desc: 'Chứa 30% bột gỗ tự nhiên, cảm giác thớ gỗ thật' },
        { id: 'petg', name: 'PETG Ngoài Trời', label: 'PETG Chịu Nhiệt Ngoài Trời', priceModifier: 15000, desc: 'Chịu nhiệt và nắng mưa bàn cafe ngoài trời' }
      ]
    },
    {
      id: 'prod-2',
      title: 'Bình Hoa Dập Ly Origami Watertight',
      category: 'decor-light',
      type: 'standard',
      price: 125000,
      originalPrice: 165000,
      badge: '💧 Watertight 100%',
      image: 'assets/images/product-pleated-vase.jpg',
      modelKey: 'pleated_vase',
      desc: 'Nếp gấp dập ly hiện đại lấy cảm hứng từ gốm sứ Bắc Âu. Ứng dụng kỹ thuật ép lớp kín khít chống rò rỉ nước tuyệt đối, an toàn cắm hoa tươi và cỏ lau khô.',
      headlineBenefit: 'Độ kín nước 100%, chống rơi vỡ an toàn cho gia đình có trẻ nhỏ',
      specLine: '📐 110 x 110 x 220 mm | 160g | Bio-PLA Watertight',
      specs: {
        dimensions: '110 x 110 x 220 mm',
        weight: '160g',
        layer: '0.24mm Watertight Extrusion',
        material: 'Bio-PLA Sinh Học Từ Ngô',
        nfc: 'Không tích hợp',
        warranty: 'Cam kết kín nước tuyệt đối'
      },
      colors: [
        { id: 'terracotta', name: 'Đất Nung Thô', hex: '#C85A32' },
        { id: 'white', name: 'Trắng Ngà Tối Giản', hex: '#EFEBE2' },
        { id: 'slate', name: 'Xám Xi Măng', hex: '#6D727B' }
      ],
      materials: [
        { id: 'pla_matte', name: 'PLA+ Sinh Học', label: 'PLA+ Sinh Học Từ Ngô', priceModifier: 0, desc: 'Phân hủy sinh học, không mùi nhựa độc hại' },
        { id: 'petg_water', name: 'PETG Ép Nước', label: 'PETG Ép Nước Gia Cường', priceModifier: 15000, desc: 'Thích hợp cắm hoa tươi thay nước thường xuyên' }
      ]
    },
    {
      id: 'prod-3',
      title: 'Kệ Đa Năng BedSide & Desk Organizer Pro',
      category: 'desk-setup',
      type: 'standard',
      price: 199000,
      originalPrice: 260000,
      badge: '⚡ 5-in-1 Dock',
      image: 'assets/images/product-desk-dock.jpg',
      modelKey: 'desk_dock',
      desc: 'Tổ chức bàn làm việc chuẩn Pinterest: Tích hợp dock đứng iPhone góc 60°, khe sạc Apple Watch, hốc AirTag chống thất lạc, khay kính mắt và rãnh bút ký.',
      headlineBenefit: 'Góc nghiêng 60° chuẩn công thái học cho cuộc gọi video & StandBy mode',
      specLine: '📐 190 x 115 x 35 mm | 210g | Bio-PLA Silk-Matte',
      specs: {
        dimensions: '190 x 115 x 35 mm',
        weight: '210g',
        layer: '0.16mm Bề mặt nhám mờ Silk-Matte',
        material: 'PLA+ Đầm Chắc Chống Trượt',
        nfc: 'Thẻ NFC phím tắt Pomodoro / Focus',
        warranty: '12 tháng chính hãng'
      },
      colors: [
        { id: 'graphite', name: 'Xám Than Chì', hex: '#2B2D31' },
        { id: 'terracotta', name: 'Cam Gốm Terracotta', hex: '#C85A32' },
        { id: 'white', name: 'Trắng Bắc Âu', hex: '#F3EFE8' }
      ],
      materials: [
        { id: 'pla_heavy', name: 'PLA+ Đầm Chắc', label: 'PLA+ Đầm Chắc Chống Trượt', priceModifier: 0, desc: 'Phân bổ trọng lượng đầm đáy, kèm mút chống xước bàn' },
        { id: 'petg_tough', name: 'PETG Kỹ Thuật', label: 'PETG Kỹ Thuật Bền Cao', priceModifier: 20000, desc: 'Chống va đập và chịu lực tì tay chắc chắn' }
      ]
    },
    {
      id: 'prod-4',
      title: 'Đèn Bàn Xoắn Kem Swirl Soft-Serve™',
      category: 'decor-light',
      type: 'standard',
      price: 320000,
      originalPrice: 420000,
      badge: '✨ LED 3000K Warm',
      image: 'assets/images/product-soft-serve-lamp.jpg',
      modelKey: 'soft_lamp',
      desc: 'Lấy cảm hứng từ vòng xoắn ốc kem bồng bềnh Crème Atelier phong cách Pháp. Chóa đèn tán xạ ánh sáng dịu êm không chói mắt, kèm bóng LED ánh vàng ấm 3000K.',
      headlineBenefit: 'Ánh sáng tán xạ êm dịu, tạo góc thư giãn Scandinavian cho phòng ngủ',
      specLine: '📐 160 x 160 x 210 mm | 240g | Spiral Vase Mode',
      specs: {
        dimensions: '160 x 160 x 210 mm',
        weight: '240g',
        layer: '0.20mm Spiral Vase Mode (Liền khối)',
        material: 'PLA+ Tán Xạ Quang Học',
        nfc: 'Không tích hợp',
        warranty: '12 tháng hệ thống điện & LED'
      },
      colors: [
        { id: 'cream', name: 'Kem Sữa (Warm Cream)', hex: '#F7EFE2' },
        { id: 'terracotta', name: 'Đất Nung Terracotta', hex: '#BD5338' },
        { id: 'sage', name: 'Xanh Rêu Mộc', hex: '#5B684E' }
      ],
      materials: [
        { id: 'pla_optic', name: 'PLA+ Quang Học', label: 'PLA+ Tán Xạ Quang Học', priceModifier: 0, desc: 'Độ dày thành tính toán quang sai giúp ánh sáng tán xạ êm dịu' },
        { id: 'petg_trans', name: 'PETG Trong Mờ', label: 'PETG Trong Mờ Chịu Nhiệt', priceModifier: 30000, desc: 'Chịu nhiệt đèn LED hoạt động liên tục nhiều ngày' }
      ]
    },
    {
      id: 'prod-5',
      title: 'Hệ Bảng Treo Tường Module Hexa Pegboard',
      category: 'desk-setup',
      type: 'standard',
      price: 145000,
      originalPrice: 195000,
      badge: '🧩 Modular System',
      image: 'assets/images/product-pegboard.jpg',
      modelKey: 'pegboard',
      desc: 'Tự do sáng tạo mở rộng không gian bàn làm việc: Tặng kèm 2 móc khóa nam châm, 1 khay đựng smartphone và 1 ống cắm bút mini. Lắp đặt dán tường siêu dính không cần khoan.',
      headlineBenefit: 'Mở rộng không gian làm việc theo module, tải trọng 3kg dán tường',
      specLine: '📐 200 x 175 x 12 mm | 140g | Modular Interlock',
      specs: {
        dimensions: '200 x 175 x 12 mm',
        weight: '140g',
        layer: '0.20mm Cấu trúc lục giác tổ ong',
        material: 'Bio-PLA Gia Cường Độ Cứng',
        nfc: 'Tùy chọn gắn thẻ NFC ở module trung tâm',
        warranty: 'Bảo hành dính keo 6 tháng'
      },
      colors: [
        { id: 'white', name: 'Trắng Sứ Nordic', hex: '#F8FAFC' },
        { id: 'gray', name: 'Xám Xi Măng', hex: '#94A3B8' },
        { id: 'sage', name: 'Xanh Olive Mộc', hex: '#606C38' }
      ],
      materials: [
        { id: 'pla_std', name: 'PLA+ Chịu Lực', label: 'PLA+ Chịu Lực Treo Đồ', priceModifier: 0, desc: 'Khả năng chịu tải lên tới 3kg mỗi tấm module' },
        { id: 'petg_stiff', name: 'PETG Siêu Bền', label: 'PETG Siêu Cứng', priceModifier: 25000, desc: 'Kháng ẩm mốc hoàn toàn cho tường phòng tắm, bếp' }
      ]
    },
    {
      id: 'prod-6',
      title: 'Bảng Tên & Chữ Cái Monogram 3D Signature',
      category: 'desk-setup',
      type: 'monogram',
      price: 135000,
      originalPrice: 180000,
      badge: '🎁 Monogram Custom',
      image: 'assets/images/product-monogram.jpg',
      modelKey: 'monogram',
      desc: 'Khắc tên và chữ cái Typography nghệ thuật kèm linh vật mini (phi hành gia, khủng long). Tặng kèm chân đế để bàn hoặc móc khóa tiện lợi.',
      headlineBenefit: 'Cá nhân hóa độc bản theo tên riêng, quà tặng ý nghĩa cho bạn bè & đồng nghiệp',
      specLine: '📐 120 x 85 x 42 mm | 110g | Custom Monogram',
      specs: {
        dimensions: '120 x 85 x 42 mm (Tùy chữ cái)',
        weight: '110g',
        layer: '0.12mm Hoàn thiện sắc nét',
        material: 'Bio-PLA 2 Lớp Màu Phối Tương Phản',
        nfc: 'Có thể tích hợp chip NFC danh thiếp số',
        warranty: 'Bảo hành hoàn tiền nếu sai tên'
      },
      colors: [
        { id: 'orange', name: 'Cam Safety Orange', hex: '#FF5C00' },
        { id: 'black', name: 'Đen Obsidian Mờ', hex: '#1E293B' },
        { id: 'white', name: 'Trắng Sứ Nordic', hex: '#F8FAFC' }
      ],
      materials: [
        { id: 'pla_dual', name: 'PLA+ 2 Màu Tương Phản', label: 'PLA+ Đúc 2 Màu Liền Khối', priceModifier: 0, desc: 'Chữ nổi sắc nét không bị nhòe màu' }
      ]
    }
  ];

  let currentCategoryFilter = 'all';

  function formatMoney(amount) {
    const num = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/\D/g, '')) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
  }

  function getStoredProducts() {
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with specs & colors from default catalog to ensure rich visual data
          return DEFAULT_PRODUCTS.map(def => {
            const found = parsed.find(p => p.id === def.id || p.modelKey === def.modelKey);
            return found ? { ...def, ...found } : def;
          });
        }
      }
    } catch (e) {
      console.warn('LocalStorage error in products manager:', e);
    }
    return DEFAULT_PRODUCTS;
  }

  // Render Product Card compliant with Bambu Lab / Grovemade benchmark
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
          <div class="w-16 h-16 mx-auto rounded-2xl bg-surface-elevated flex items-center justify-center text-2xl text-secondary-color">
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
      const swatches = item.colors || [
        { id: 'black', name: 'Đen Obsidian', hex: '#26282B' },
        { id: 'white', name: 'Trắng Sứ', hex: '#F5F2EB' },
        { id: 'orange', name: 'Cam Đất', hex: '#C85A32' }
      ];

      const modelKey = item.modelKey || 'nfc_wifi';
      const specLine = item.specLine || '📐 Tiêu chuẩn xưởng • Bio-PLA';

      return `
        <article class="studio-product-card group" data-product-id="${item.id}" onclick="window.openProductDetailModal('${item.id}')">
          <!-- Image Box with hover zoom & subtle 3D launcher -->
          <div class="product-image-box">
            <img src="${item.image}" 
                 width="600" 
                 height="600" 
                 loading="lazy" 
                 decoding="async" 
                 alt="${item.title}" 
                 id="img-${item.id}">
            
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
                    aria-label="Soi 3D">
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

              <!-- 1 SINGLE PRIMARY CTA BUTTON (Bambu Lab Standard) -->
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

    if (window.TTStore && typeof window.TTStore.addToCart === 'function') {
      window.TTStore.addToCart({
        id: `${item.id}-${defaultColor.id}-${defaultMat.id}`,
        title: item.title,
        price: item.price,
        qty: 1,
        image: item.image,
        color: defaultColor,
        material: defaultMat,
        customText: null,
        category: item.category
      });
      if (window.TTCart && typeof window.TTCart.openCart === 'function') {
        window.TTCart.openCart();
      }
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

    if (imgEl) imgEl.src = item.image;
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
          <div><span class="text-secondary-color">Kích thước:</span> <strong class="text-primary-color font-mono">${item.specs.dimensions}</strong></div>
          <div><span class="text-secondary-color">Trọng lượng:</span> <strong class="text-primary-color font-mono">${item.specs.weight}</strong></div>
          <div><span class="text-secondary-color">Độ mịn lớp:</span> <strong class="text-primary-color font-mono">${item.specs.layer}</strong></div>
          <div><span class="text-secondary-color">Bảo hành:</span> <strong class="text-primary-color font-mono">${item.specs.warranty}</strong></div>
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
                <div class="text-xs font-bold text-primary-color">${m.label}</div>
                <div class="text-[11px] text-secondary-color mt-0.5">${m.desc}</div>
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
    if (!window.modalActiveProduct) return;
    window.modalSelectedColor = window.modalActiveProduct.colors.find(c => c.id === colorId);
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
    if (!window.modalActiveProduct) return;
    window.modalSelectedMat = window.modalActiveProduct.materials.find(m => m.id === matId);

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

    if (window.TTStore && typeof window.TTStore.addToCart === 'function') {
      window.TTStore.addToCart({
        id: `${window.modalActiveProduct.id}-${window.modalSelectedColor.id}-${window.modalSelectedMat.id}-${customText || 'none'}`,
        title: window.modalActiveProduct.title,
        price: unitPrice,
        qty: window.modalQty || 1,
        image: window.modalActiveProduct.image,
        color: window.modalSelectedColor,
        material: window.modalSelectedMat,
        customText: customText || null,
        category: window.modalActiveProduct.category
      });

      window.closeProductDetailModal();
      if (window.TTCart && typeof window.TTCart.openCart === 'function') {
        window.TTCart.openCart();
      }
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

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    renderStoreProducts('all');

    // Close order modal when clicking backdrop
    const orderModal = document.getElementById('order-modal');
    if (orderModal) {
      orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) {
          window.closeProductDetailModal();
        }
      });
    }

    // Accessible Escape key listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.closeProductDetailModal();
      }
    });
  });

})();
