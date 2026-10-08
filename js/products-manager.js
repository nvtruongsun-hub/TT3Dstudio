/**
 * T&T 3D Studio - Products Catalog & Store Renderer Manager
 * Hỗ trợ Serverless Catalog qua localStorage & products.json
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'tt_products';
  const DEFAULT_ZALO_PHONE = '0986888333';

  // Danh mục sản phẩm mặc định chuẩn Modern Minimalist Studio
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
      desc: 'Khách đến quán cafe, homestay chỉ cần chạm nhẹ smartphone là kết nối WiFi tự động không cần hỏi mật khẩu. Nhựa PLA Matte cao cấp, đúc chip NFC chìm không dùng pin.'
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
      desc: 'Tạo hình nếp gấp dập ly hiện đại như gốm sứ Bắc Âu. Ứng dụng kỹ thuật ép lớp kín khít chống rò rỉ nước tuyệt đối, cắm được cả hoa tươi và cỏ lau khô pampas.'
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
      modelKey: 'nfc_wifi',
      desc: 'Tổ chức bàn làm việc gọn gàng chuẩn Pinterest: Tích hợp dock đứng điện thoại, khe sạc Apple Watch, hốc AirTag chống thất lạc, khay kính mắt và rãnh bút ký.'
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
      desc: 'Lấy cảm hứng từ những vòng xoắn ốc kem bồng bềnh Crème Atelier phong cách Pháp. Chóa đèn tán xạ ánh sáng dịu êm chống chói mắt, kèm bóng LED ánh vàng ấm.'
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
      modelKey: 'nfc_wifi',
      desc: 'Tự do sáng tạo phối màu Nordic pastel: Tặng kèm 2 móc khóa nam châm, 1 khay đựng điện thoại và 1 ống cắm bút mini. Lắp đặt dán tường siêu dính không cần khoan.'
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
      desc: 'Chọn chữ cái A-Z và in tên calligraphy sắc sảo kèm linh vật dễ thương (khủng long, phi hành gia). Thích hợp làm quà sinh nhật, decor bàn học và phòng ngủ.'
    }
  ];

  let currentCategoryFilter = 'all';

  // Lấy số điện thoại Zalo của xưởng
  function getZaloPhone() {
    const cfg = (window.TTStore && window.TTStore.getConfig()) || window.TT_DEFAULT_CONFIG;
    const phone = (cfg && cfg.shopInfo && cfg.shopInfo.zaloPhone) || DEFAULT_ZALO_PHONE;
    return phone.replace(/\D/g, '');
  }

  // Định dạng tiền tệ VND
  function formatMoney(amount) {
    const num = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/\D/g, '')) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
  }

  // Đọc danh sách sản phẩm từ LocalStorage / JSON / Default
  async function getStoredProducts() {
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Thử fetch products.json nếu có
      const resp = await fetch('products.json');
      if (resp.ok) {
        const json = await resp.json();
        if (Array.isArray(json) && json.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
          return json;
        }
      }
    } catch (e) {
      console.warn('Cannot load remote products.json, using fallback default catalog:', e);
    }

    // Fallback mặc định
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }

  // Render sản phẩm ra giao diện store (Modern Minimalist Studio Card)
  async function renderStoreProducts(filter = currentCategoryFilter) {
    currentCategoryFilter = filter;
    const grid = document.getElementById('store-product-grid');
    if (!grid) return;

    const products = await getStoredProducts();
    const filtered = filter === 'all' 
      ? products 
      : products.filter(p => p.category === filter);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400 space-y-3">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-2xl text-slate-500">
            <i class="fa-solid fa-box-open"></i>
          </div>
          <p class="text-sm">Chưa có sản phẩm nào trong danh mục này.</p>
        </div>
      `;
      return;
    }

    const zaloPhone = getZaloPhone();

    grid.innerHTML = filtered.map(item => {
      const priceFormatted = formatMoney(item.price);
      const originalPriceFormatted = item.originalPrice ? formatMoney(item.originalPrice) : '';
      const badgeHtml = item.badge ? `
        <span class="card-badge-single bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 backdrop-blur-md">
          ${item.badge}
        </span>
      ` : '';

      // Link Zalo tự động kèm chính xác tên và giá sản phẩm
      const zaloMessage = `Chào T&T 3D Studio, mình muốn đặt mua sản phẩm: ${item.title} (Giá: ${priceFormatted}). Vui lòng tư vấn giúp mình nhé!`;
      const zaloUrl = `https://zalo.me/${zaloPhone}?text=${encodeURIComponent(zaloMessage)}`;

      const modelKey = item.modelKey || 'nfc_wifi';

      return `
        <div data-product-category="${item.category || 'smart-nfc'}" 
             data-product-item 
             data-type="${item.type || 'standard'}" 
             data-title="${item.title}" 
             data-price="${priceFormatted}" 
             class="studio-product-card rounded-2xl glass-panel border border-slate-800/80 hover:border-cyan-400/60 transition-all duration-300 overflow-hidden flex flex-col group bg-slate-900/40">
          
          <!-- Image Box with hover zoom & subtle 3D Inspector trigger button -->
          <div class="relative aspect-[4/3] overflow-hidden img-skeleton bg-slate-950/60 cursor-pointer" data-lightbox-trigger>
            <img src="${item.image || 'assets/images/logo.jpg'}" 
                 width="800" 
                 height="600" 
                 loading="lazy" 
                 decoding="async" 
                 onload="this.classList.add('loaded')" 
                 onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80'; this.classList.add('loaded');" 
                 alt="${item.title}" 
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 product-img-fade">
            
            ${badgeHtml}

            <!-- 1 nút icon 3D nhỏ tinh tế ở góc ảnh để cuộn/mở viewer 3D -->
            <button type="button" 
                    data-action-open-3d="${modelKey}" 
                    title="Xem tương tác 3D 360°" 
                    class="absolute top-3.5 right-3.5 w-8 h-8 rounded-xl bg-slate-950/80 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 border border-white/10 hover:border-cyan-400 backdrop-blur-md flex items-center justify-center transition-all duration-200 z-10 shadow-lg">
              <i class="fa-solid fa-cube text-xs"></i>
            </button>
          </div>

          <!-- Card Content -->
          <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                <span>${item.category === 'smart-nfc' ? 'Smart NFC' : (item.category === 'decor-light' ? 'Lifestyle Decor' : 'Desk Setup')}</span>
                <span class="text-emerald-400 font-sans font-medium text-[10px]">Sẵn hàng 24h</span>
              </div>
              <h3 class="font-display font-bold text-base sm:text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                ${item.title}
              </h3>
              <p class="text-xs text-slate-400 leading-relaxed line-clamp-2">
                ${item.desc || 'Sản phẩm in 3D công nghệ cao, hoàn thiện thủ công tỉ mỉ.'}
              </p>
            </div>

            <div class="space-y-3 pt-3 border-t border-slate-800/80">
              <div class="flex items-baseline justify-between">
                <div>
                  <span class="text-xl sm:text-2xl font-display font-extrabold text-white">${priceFormatted}</span>
                  ${originalPriceFormatted ? `<span class="text-xs text-slate-500 line-through ml-2">${originalPriceFormatted}</span>` : ''}
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-2">
                <div class="grid grid-cols-2 gap-2">
                  <!-- Nút Đặt Mua Web (Mở Cart / Form Customizer) -->
                  <button data-order-trigger class="btn-cyan-glow text-slate-950 font-display font-bold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md">
                    <i class="fa-solid fa-cart-plus"></i> Đặt Mua
                  </button>
                  <!-- Nút Xem 3D dạng link phụ -->
                  <a href="#viewer-section" data-model="${modelKey}" class="py-2.5 px-3 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-900/80 text-slate-300 hover:text-white text-xs font-medium text-center flex items-center justify-center gap-1.5 transition-colors">
                    <i class="fa-solid fa-cube text-cyan-400"></i> Xem 3D
                  </a>
                </div>

                <!-- 1 nút chính Đặt Zalo: Tự động kích hoạt link có chứa chính xác tên và giá sản phẩm -->
                <a href="${zaloUrl}" target="_blank" class="w-full py-2.5 px-3 rounded-xl border border-blue-500/40 bg-blue-950/30 hover:bg-blue-600 hover:border-blue-500 text-blue-300 hover:text-white text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md">
                  <i class="fa-solid fa-comment-dots text-sm"></i>
                  <span>Đặt Nhanh Qua Zalo</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      `;
    }).join('');

    // Gắn sự kiện cho nút icon 3D nhỏ tinh tế ở góc ảnh
    grid.querySelectorAll('[data-action-open-3d]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const modelKey = btn.getAttribute('data-action-open-3d');
        if (typeof window.ensure3DViewerLoaded === 'function') {
          window.ensure3DViewerLoaded(modelKey);
        }
        const viewerSection = document.getElementById('viewer-section');
        if (viewerSection) {
          viewerSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Cập nhật lại các trình nghe sự kiện modal đặt hàng trong app.js
    if (window.initProductOrderTriggers) {
      window.initProductOrderTriggers();
    }
  }

  // Khởi tạo bộ lọc sản phẩm (Filter buttons)
  function initFilterButtons() {
    const filterBtns = document.querySelectorAll('[data-product-filter]');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('bg-primary/20', 'border-primary', 'text-cyan-300', 'font-bold');
          b.classList.add('border-white/10', 'text-slate-400');
        });
        btn.classList.add('bg-primary/20', 'border-primary', 'text-cyan-300', 'font-bold');
        btn.classList.remove('border-white/10', 'text-slate-400');

        const category = btn.getAttribute('data-product-filter') || 'all';
        renderStoreProducts(category);
      });
    });
  }

  // Lắng nghe thay đổi từ trang quản trị Admin qua localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      renderStoreProducts(currentCategoryFilter);
    }
  });

  window.addEventListener('tt_products_updated', () => {
    renderStoreProducts(currentCategoryFilter);
  });

  // Export APIs
  window.TTProducts = {
    getProducts: getStoredProducts,
    renderStoreProducts: renderStoreProducts,
    DEFAULT_PRODUCTS: DEFAULT_PRODUCTS,
    STORAGE_KEY: STORAGE_KEY
  };

  // Khởi chạy khi DOM sẵn sàng
  window.addEventListener('DOMContentLoaded', () => {
    renderStoreProducts('all');
    initFilterButtons();
  });

})();
