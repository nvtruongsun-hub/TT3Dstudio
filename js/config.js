/**
 * T&T 3D STUDIO - CENTRAL WORKSHOP & STORE CONFIGURATION
 * Hệ thống cấu hình tập trung kết nối Front-end & Admin Studio OS
 */

const TT_DEFAULT_CONFIG = {
  shopInfo: {
    brandName: "T&T 3D Studio",
    slogan: "Smart Living & Aesthetic 3D Crafts",
    hotline: "0986.888.333",
    zaloPhone: "0986888333",
    email: "contact@tt3dstudio.vn",
    address: "Số 175 Tây Sơn, Phường Trung Liệt, Quận Đống Đa, Hà Nội",
    workingHours: "Thứ 2 - Chủ Nhật: 08:00 - 21:00 (Dàn máy in chạy 24/7)",
    shopeeUrl: "https://shopee.vn",
    tiktokUrl: "https://tiktok.com",
    facebookUrl: "https://facebook.com"
  },

  // Cấu hình tài khoản nhận thanh toán VietQR NAPAS & Mã QR Tùy Chỉnh
  banking: {
    bankId: "MB", // Ngân hàng Quân Đội (MB Bank)
    bankName: "MB Bank (Ngân hàng Quân Đội)",
    accountNo: "0349657529", // Số tài khoản MB Bank của chủ xưởng
    accountName: "NGUYEN VAN TRUONG",
    branch: "Hà Nội",
    qrMode: "dynamic", // 'dynamic' (mã VietQR tự động theo số tiền & mã đơn) hoặc 'custom' (ảnh QR của shop tải lên)
    customQrImage: ""  // Base64 Data URL hoặc link ảnh QR của chủ shop
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

  // Danh sách đơn hàng sản xuất ban đầu (5 cột Kanban xưởng)
  sampleOrders: [
    {
      id: "TT3D-1089",
      createdAt: "2026-10-06 09:15",
      stage: "printing", // 1. new | 2. sliced | 3. printing | 4. postprocess | 5. completed
      customerName: "Nguyễn Tuấn Anh (Cafe The Morning)",
      phone: "0912.345.678",
      address: "Số 45 Ngõ 12 Đặng Tiến Đông, Đống Đa, Hà Nội",
      productName: "Đế WiFi 1 Chạm TapConnect™",
      color: "Trắng Sứ Matte",
      spoolId: "SPL-01",
      weightGrams: 32,
      material: "PLA+ Matte",
      nfcData: { type: "wifi", ssid: "TheMorning_Coffee", pass: "morning2026", auth: "WPA" },
      assignedPrinter: "p-01",
      estTimeHours: 1.8,
      statusPayment: "paid",
      totalPrice: 109000,
      notes: "In logo The Morning ở mặt trước, nạp sẵn WiFi khách quét thử"
    },
    {
      id: "TT3D-1090",
      createdAt: "2026-10-06 10:30",
      stage: "new",
      customerName: "Trần Mai Phương",
      phone: "0987.654.321",
      address: "Chung cư Vinhomes Smart City, Tây Mỗ, Nam Từ Liêm",
      productName: "Bình Hoa Dập Ly Origami Watertight",
      color: "Cam Đất (Terracotta)",
      spoolId: "SPL-02",
      weightGrams: 110,
      material: "PLA+ Matte",
      nfcData: null,
      assignedPrinter: null,
      estTimeHours: 4.2,
      statusPayment: "paid",
      totalPrice: 125000,
      notes: "Yêu cầu test ngâm nước kỹ trước khi đóng gói"
    },
    {
      id: "TT3D-1091",
      createdAt: "2026-10-06 11:00",
      stage: "sliced",
      customerName: "Lê Minh Quân",
      phone: "0904.112.233",
      address: "128 Nguyễn Thị Minh Khai, P.6, Q.3, TP.HCM",
      productName: "Bảng Tên Monogram 3D Chữ M",
      color: "Trắng Sứ (White Matte)",
      spoolId: "SPL-01",
      weightGrams: 65,
      material: "PLA+ Matte",
      nfcData: null,
      assignedPrinter: "p-02",
      estTimeHours: 2.5,
      statusPayment: "paid",
      totalPrice: 135000,
      notes: "Khắc tên Quân Lê, đính kèm linh vật Phi Hành Gia"
    },
    {
      id: "TT3D-1092",
      createdAt: "2026-10-06 08:00",
      stage: "printing",
      customerName: "Vũ Hải Đăng (Tech Studio)",
      phone: "0936.789.012",
      address: "24 Bà Triệu, Hoàn Kiếm, Hà Nội",
      productName: "Kệ Đa Năng BedSide 5-in-1 Pro",
      color: "Đen Mờ (Obsidian Black)",
      spoolId: "SPL-04",
      weightGrams: 185,
      material: "PLA+ Matte",
      nfcData: null,
      assignedPrinter: "p-03",
      estTimeHours: 6.5,
      statusPayment: "paid",
      totalPrice: 199000,
      notes: "Giao hỏa tốc trong ngày nếu kịp"
    },
    {
      id: "TT3D-1088",
      createdAt: "2026-10-05 16:40",
      stage: "postprocess",
      customerName: "Phạm Thùy Linh",
      phone: "0978.899.112",
      address: "15 Lê Thánh Tông, Ngô Quyền, Hải Phòng",
      productName: "Đèn Bàn Xoắn Kem Swirl Soft-Serve",
      color: "Xanh Rêu (Sage Green)",
      spoolId: "SPL-03",
      weightGrams: 230,
      material: "PLA+ Matte",
      nfcData: null,
      assignedPrinter: "p-01",
      estTimeHours: 7.2,
      statusPayment: "paid",
      totalPrice: 320000,
      notes: "Kèm bóng LED 3000K, test sáng chóa đèn"
    },
    {
      id: "TT3D-1085",
      createdAt: "2026-10-05 10:20",
      stage: "completed",
      customerName: "Hoàng Gia Huy",
      phone: "0945.667.889",
      address: "Số 8 Chùa Láng, Đống Đa, Hà Nội",
      productName: "Hệ Bảng Hexa Pegboard Combo 4",
      color: "Trắng Sứ (White Matte)",
      spoolId: "SPL-01",
      weightGrams: 140,
      material: "PLA+ Matte",
      nfcData: null,
      assignedPrinter: "p-02",
      estTimeHours: 4.8,
      statusPayment: "paid",
      totalPrice: 145000,
      notes: "Đã giao thành công cho khách lấy tại xưởng"
    }
  ]
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
  }
};

// Global reference
window.TT_CONFIG = window.TTStore.getConfig();
