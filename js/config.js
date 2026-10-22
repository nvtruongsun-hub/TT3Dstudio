/**
 * T&T 3D STUDIO - CENTRAL WORKSHOP & STORE CONFIGURATION
 * Hệ thống cấu hình tập trung kết nối Front-end & Admin Studio OS
 */

const TT_DEFAULT_CONFIG = {
  shopInfo: {
    brandName: "T&T 3D Labs",
    slogan: "Smart Living & Aesthetic 3D Crafts",
    hotline: "0986.888.333",
    zaloPhone: "0986888333",
    email: "contact@tt3dlabs.vn",
    address: "Số 175 Tây Sơn, Phường Trung Liệt, Quận Đống Đa, Hà Nội",
    workingHours: "Thứ 2 - Chủ Nhật: 08:00 - 21:00 (Dàn máy in chạy 24/7)",
    shopeeUrl: "https://shopee.vn",
    tiktokUrl: "https://tiktok.com",
    facebookUrl: "https://facebook.com"
  },

  // Cấu hình đặt hàng & thanh toán trực tiếp (Không dùng VietQR tự động)
  checkout: {
    mode: 'manual', // 'manual' (xác thực trực tiếp qua Zalo/Hotline hoặc COD)
    orderEndpoint: null,
    paymentMethods: ['cod', 'zalo'],
    zaloHandoffPhone: "0986888333",
    allowCustomerNotes: true
  },

  // Cấu hình biểu giá động (Dynamic Pricing Engine)
  pricing: {
    materialRates: {
      pla_plus: 1200,    // 1.200 đ/g (PLA+ Matte)
      petg: 1500,        // 1.500 đ/g (PETG Chống nước)
      abs: 1700,         // 1.700 đ/g (ABS Chịu nhiệt)
      tpu: 2200,         // 2.200 đ/g (TPU Dẻo đàn hồi)
      cf_petg: 3200,     // 3.200 đ/g (Carbon Fiber PETG)
      resin_std_8k: 2400,// 2.400 đ/g (Resin SLA 8K)
      resin_tough: 3500, // 3.500 đ/g (Resin Kỹ thuật)
      sls_pa12: 5500     // 5.500 đ/g (Nylon PA12 SLS)
    },
    // Aliases cho Admin Dashboard
    rates: {
      fdm_pla: 1200,
      fdm_petg: 1500,
      sla_resin: 2400,
      sls_nylon: 5500
    },
    machineHourlyFee: 15000, // Phí máy: 15.000 đ/giờ máy in
    machineRatePerHour: {
      fdm: 15000,
      sla: 35000
    },
    layerMultipliers: {
      "0.12": 1.30,      // Siêu nét FDM
      "0.16": 1.15,      // Cân bằng
      "0.20": 1.00,      // Tiêu chuẩn cơ sở
      "0.28": 0.85,      // In thô nhanh
      "0.05": 1.50       // Tiêu chuẩn SLA 8K
    },
    addonFees: {
      nfcChip: 35000,    // Nạp & đúc chip NFC NTAG215
      smoothFinish: 35000,// Xử lý làm mịn & phun cát
      paintedFinish: 85000,// Sơn lót & sơn màu hoàn thiện
      cadDesign: 150000   // Phí vẽ / tối ưu hóa file CAD 3D
    },
    addons: {
      nfc_chip: 35000,
      cad_edit: 150000
    },
    densityMap: {
      pla_plus: 1.24,
      petg: 1.27,
      abs: 1.05,
      tpu: 1.21,
      cf_petg: 1.29,
      resin_std_8k: 1.12,
      sls_pa12: 1.01
    }
  },

  // Dàn máy in 3D xưởng (Fleet of 3D Printers)
  printers: [
    { id: "p-01", name: "Bambu Lab A1-01", type: "FDM", bed: "256×256×256 mm", nozzle: "0.4 Hardened", status: "printing", currentOrder: "TT3D-1089", etaMinutes: 85 },
    { id: "p-02", name: "Bambu Lab A1-02", type: "FDM", bed: "256×256×256 mm", nozzle: "0.4 Hardened", status: "available", currentOrder: null, etaMinutes: 0 },
    { id: "p-03", name: "Bambu Lab P1S-01", type: "FDM Enclosure", bed: "256×256×256 mm", nozzle: "0.4 Stainless", status: "printing", currentOrder: "TT3D-1092", etaMinutes: 140 },
    { id: "p-04", name: "Anycubic Resin 8K-01", type: "SLA", bed: "165×89×200 mm", nozzle: "8K Mono LCD", status: "maintenance", currentOrder: null, etaMinutes: 0 }
  ],

  // Quản lý kho cuộn nhựa & hao phí (Spools Inventory)
  spools: [
    { id: "SPL-01", material: "PLA+ Matte", color: "Trắng Sứ (White Matte)", colorName: "Trắng Sứ (White Matte)", colorHex: "#f8fafc", brand: "Bambu Lab", manufacturer: "Bambu Lab", initialGrams: 1000, remainingGrams: 740, minAlertGrams: 150 },
    { id: "SPL-02", material: "PLA+ Matte", color: "Cam Đất (Terracotta)", colorName: "Cam Đất (Terracotta)", colorHex: "#bc6c25", brand: "eSun", manufacturer: "eSun", initialGrams: 1000, remainingGrams: 320, minAlertGrams: 150 },
    { id: "SPL-03", material: "PLA+ Matte", color: "Xanh Rêu (Sage Green)", colorName: "Xanh Rêu (Sage Green)", colorHex: "#606c38", brand: "Sunlu", manufacturer: "Sunlu", initialGrams: 1000, remainingGrams: 120, minAlertGrams: 150 }, // Cảnh báo vàng
    { id: "SPL-04", material: "PLA+ Matte", color: "Đen Mờ (Obsidian Black)", colorName: "Đen Mờ (Obsidian Black)", colorHex: "#1e293b", brand: "eSun", manufacturer: "eSun", initialGrams: 1000, remainingGrams: 890, minAlertGrams: 150 },
    { id: "SPL-05", material: "PETG Pro", color: "Trong Suốt (Translucent)", colorName: "Trong Suốt (Translucent)", colorHex: "#e2e8f0", brand: "Bambu Lab", manufacturer: "Bambu Lab", initialGrams: 1000, remainingGrams: 510, minAlertGrams: 150 },
    { id: "SPL-06", material: "Resin SLA 8K", color: "Xám T&T Gray", colorName: "Xám T&T Gray", colorHex: "#94a3b8", brand: "Anycubic", manufacturer: "Anycubic", initialGrams: 1000, remainingGrams: 450, minAlertGrams: 150 }
  ],

  // 6 Sản phẩm cốt lõi
  products: [
    {
      id: "prod-1",
      category: "smart-nfc",
      type: "nfc",
      title: "Đế WiFi 1 Chạm Thông Minh (T&T TapConnect™ Stand)",
      price: 109000,
      originalPrice: 149000,
      tag: "🔥 VIRAL TIKTOK",
      badgeType: "hot",
      badgeSub: "Chip NTAG215",
      image: "assets/images/product-nfc-wifi.jpg",
      model3d: "nfc_wifi",
      desc: "Khách đến quán cafe, homestay chỉ cần chạm nhẹ smartphone là kết nối WiFi tự động không cần hỏi mật khẩu. Nhựa PLA Matte cao cấp, đúc chip NFC chìm không dùng pin."
    },
    {
      id: "prod-2",
      category: "decor-light",
      type: "standard",
      title: "Bình Hoa Dập Ly Origami (Pleated Fluted Vase - Watertight)",
      price: 125000,
      originalPrice: 165000,
      tag: "💧 Chống thấm 100%",
      badgeType: "eco",
      badgeSub: "Vase Mode Cao Cấp",
      image: "assets/images/product-pleated-vase.jpg",
      model3d: "pleated_vase",
      desc: "Tạo hình nếp gấp dập ly hiện đại như gốm sứ Bắc Âu. Ứng dụng kỹ thuật ép lớp kín khít chống rò rỉ nước tuyệt đối, cắm được cả hoa tươi và cỏ lau khô pampas."
    },
    {
      id: "prod-3",
      category: "desk-setup",
      type: "standard",
      title: "Kệ Đa Năng BedSide & Desk Organizer Pro",
      price: 199000,
      originalPrice: 260000,
      tag: "⚡ 5-IN-1 DOCK",
      badgeType: "indigo",
      badgeSub: "Two-Tone Matte",
      image: "assets/images/product-desk-dock.jpg",
      model3d: "gear",
      desc: "Tổ chức bàn làm việc gọn gàng chuẩn Pinterest: Tích hợp dock đứng điện thoại, khe sạc Apple Watch, hốc AirTag chống thất lạc, khay kính mắt và rãnh bút ký."
    },
    {
      id: "prod-4",
      category: "decor-light",
      type: "standard",
      title: "Đèn Bàn Xoắn Kem Swirl Soft-Serve™",
      price: 320000,
      originalPrice: 420000,
      tag: "✨ BEST SELLER",
      badgeType: "hot",
      badgeSub: "Kèm Bóng LED 3000K",
      image: "assets/images/product-soft-serve-lamp.jpg",
      model3d: "soft_lamp",
      desc: "Lấy cảm hứng từ những vòng xoắn ốc kem bồng bềnh Crème Atelier phong cách Pháp. Chóa đèn tán xạ ánh sáng dịu êm chống chói mắt, đế đất nung vân rãnh cổ điển."
    },
    {
      id: "prod-5",
      category: "desk-setup",
      type: "standard",
      title: "Hệ Bảng Treo Tường Module Hexa Pegboard",
      price: 145000,
      originalPrice: 195000,
      tag: "🧩 MODULAR SYSTEM",
      badgeType: "purple",
      badgeSub: "Ghép Nối Đa Sắc",
      image: "assets/images/product-pegboard.jpg",
      model3d: "gear",
      desc: "Tự do sáng tạo phối màu Nordic pastel: Tặng kèm 2 móc khóa nam châm, 1 khay đựng điện thoại và 1 ống cắm bút mini. Lắp đặt dán tường siêu dính không cần khoan."
    },
    {
      id: "prod-6",
      category: "desk-setup",
      type: "monogram",
      title: "Bảng Tên & Chữ Cái Monogram 3D Signature",
      price: 135000,
      originalPrice: 180000,
      tag: "🎁 QUÀ TẶNG Ý NGHĨA",
      badgeType: "eco",
      badgeSub: "Khắc Tên Theo Yêu Cầu",
      image: "assets/images/product-monogram.jpg",
      model3d: "monogram",
      desc: "Chọn chữ cái A-Z và in tên calligraphy sắc sảo kèm linh vật dễ thương (khủng long, phi hành gia). Thích hợp làm quà sinh nhật, decor bàn học và phòng em bé."
    }
  ],

  // Danh sách đơn hàng sản xuất ban đầu (Cold state sạch cho bản phát hành - Codex Directive R4-05)
  sampleOrders: []
};

// Storage helper functions for reactive sync
window.TTStore = {
  getConfig: function () {
    try {
      const saved = localStorage.getItem('TT_STUDIO_CONFIG');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Lỗi đọc TT_STUDIO_CONFIG:', e);
    }
    return TT_DEFAULT_CONFIG;
  },

  saveConfig: function (cfg) {
    try {
      localStorage.setItem('TT_STUDIO_CONFIG', JSON.stringify(cfg));
      window.dispatchEvent(new CustomEvent('tt_config_updated', { detail: cfg }));
      return true;
    } catch (e) {
      console.error('Lỗi lưu TT_STUDIO_CONFIG:', e);
      return false;
    }
  },

  getOrders: function () {
    try {
      const saved = localStorage.getItem('TT_STUDIO_ORDERS');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Lỗi đọc TT_STUDIO_ORDERS:', e);
    }
    // Return sample orders if empty
    const defaults = TT_DEFAULT_CONFIG.sampleOrders;
    localStorage.setItem('TT_STUDIO_ORDERS', JSON.stringify(defaults));
    return defaults;
  },

  saveOrders: function (orders) {
    try {
      localStorage.setItem('TT_STUDIO_ORDERS', JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent('tt_orders_updated', { detail: orders }));
      return true;
    } catch (e) {
      console.error('Lỗi lưu TT_STUDIO_ORDERS:', e);
      return false;
    }
  },

  addOrder: function (newOrder) {
    const orders = this.getOrders();
    orders.unshift(newOrder);
    this.saveOrders(orders);

    // Tự động trừ khối lượng cuộn nhựa tương ứng trong kho
    if (newOrder.weightGrams && newOrder.spoolId) {
      this.deductSpool(newOrder.spoolId, newOrder.weightGrams);
    }
    return newOrder;
  },

  updateOrderStatus: function (orderId, newStage, printerId) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const oldStage = order.stage;
      order.stage = newStage;
      if (printerId !== undefined) order.assignedPrinter = printerId;
      this.saveOrders(orders);

      // Nếu chuyển từ 'new' hoặc 'sliced' sang 'printing', trừ nhựa nếu chưa trừ
      if ((oldStage === 'new' || oldStage === 'sliced') && newStage === 'printing') {
        if (order.weightGrams && order.spoolId) {
          this.deductSpool(order.spoolId, order.weightGrams);
        }
      }
      return order;
    }
    return null;
  },

  deleteOrder: function (orderId) {
    let orders = this.getOrders();
    orders = orders.filter(o => o.id !== orderId);
    this.saveOrders(orders);
    return orders;
  },

  getSpools: function () {
    try {
      const saved = localStorage.getItem('TT_STUDIO_SPOOLS');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Lỗi đọc TT_STUDIO_SPOOLS:', e);
    }
    const defaults = TT_DEFAULT_CONFIG.spools;
    localStorage.setItem('TT_STUDIO_SPOOLS', JSON.stringify(defaults));
    return defaults;
  },

  saveSpools: function (spools) {
    try {
      localStorage.setItem('TT_STUDIO_SPOOLS', JSON.stringify(spools));
      window.dispatchEvent(new CustomEvent('tt_spools_updated', { detail: spools }));
      return true;
    } catch (e) {
      console.error('Lỗi lưu TT_STUDIO_SPOOLS:', e);
      return false;
    }
  },

  deductSpool: function (spoolId, productWeightGrams) {
    const spools = this.getSpools();
    const spool = spools.find(s => s.id === spoolId) || spools[0];
    if (spool) {
      // Công thức hao phí thực tế: Khối lượng sản phẩm * (1 + 10% support/purge waste)
      const wasteRate = 0.10;
      const consumedGrams = Math.round(productWeightGrams * (1 + wasteRate));
      spool.remainingGrams = Math.max(0, spool.remainingGrams - consumedGrams);
      this.saveSpools(spools);
      console.log(`[Workshop Inventory] Đã trừ ${consumedGrams}g vào cuộn ${spool.id} (${spool.color}). Còn lại: ${spool.remainingGrams}g`);
      return spool;
    }
    return null;
  },

  getPrinters: function () {
    try {
      const saved = localStorage.getItem('TT_STUDIO_PRINTERS');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Lỗi đọc TT_STUDIO_PRINTERS:', e);
    }
    const defaults = TT_DEFAULT_CONFIG.printers;
    localStorage.setItem('TT_STUDIO_PRINTERS', JSON.stringify(defaults));
    return defaults;
  },

  savePrinters: function (printers) {
    try {
      localStorage.setItem('TT_STUDIO_PRINTERS', JSON.stringify(printers));
      window.dispatchEvent(new CustomEvent('tt_printers_updated', { detail: printers }));
      return true;
    } catch (e) {
      console.error('Lỗi lưu TT_STUDIO_PRINTERS:', e);
      return false;
    }
  },

  // Cart Management
  getCart: function () {
    try {
      const saved = localStorage.getItem('TT_STUDIO_CART');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  },

  saveCart: function (cart) {
    try {
      localStorage.setItem('TT_STUDIO_CART', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('tt_cart_updated', { detail: cart }));
      return true;
    } catch (e) {
      return false;
    }
  },

  addToCart: function (item) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(i => i.id === item.id && JSON.stringify(i.customOptions) === JSON.stringify(item.customOptions));
    if (existingIndex > -1) {
      cart[existingIndex].qty += (item.qty || 1);
    } else {
      cart.push({
        ...item,
        qty: item.qty || 1,
        cartItemId: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
      });
    }
    this.saveCart(cart);
    return cart;
  },

  removeFromCart: function (cartItemId) {
    let cart = this.getCart();
    cart = cart.filter(i => i.cartItemId !== cartItemId);
    this.saveCart(cart);
    return cart;
  },

  updateCartQty: function (cartItemId, newQty) {
    const cart = this.getCart();
    const item = cart.find(i => i.cartItemId !== cartItemId);
    if (item) {
      item.qty = Math.max(1, newQty);
      this.saveCart(cart);
    }
    return cart;
  },

  clearCart: function () {
    this.saveCart([]);
  },

  getZaloPhone: function () {
    const cfg = this.getConfig();
    const candidates = [
      cfg?.checkout?.zaloHandoffPhone,
      cfg?.shopInfo?.zaloPhone,
      cfg?.shopInfo?.hotline
    ];
    for (const raw of candidates) {
      if (typeof raw !== 'string') continue;
      let phone = raw.replace(/[\s.()-]/g, '');
      if (/^\+84\d{9}$/.test(phone)) phone = '0' + phone.slice(3);
      if (/^0[35789]\d{8}$/.test(phone)) return phone;
    }
    return null;
  }
};

// Global reference
window.TT_CONFIG = window.TTStore.getConfig();
