/**
 * T&T 3D Labs - Central Catalog Store & Data Synchronization Engine
 * Quản lý kho dữ liệu sản phẩm tập trung cho Client và Admin Portal
 * Tuân thủ quy tắc kiến trúc Codex Master Controller (Directive 2026-10-21)
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'tt_products';
  const META_STORAGE_KEY = 'tt_catalog_meta';
  const STORAGE_KEY_JOURNAL = 'tt_catalog_pending_commit';
  const EVENT_NAME = 'tt_products_updated';
  const FALLBACK_URL = 'products.json';
  const CURRENT_SCHEMA_VERSION = 5;
  const CURRENT_CATALOG_REVISION = 'mw-55-v5-compact-tabs';

  // 6 Sản phẩm legacy chuẩn làm fixture làm giàu dữ liệu cũ (Codex Directive)
  const LEGACY_FIXTURE_PRODUCTS = [
    {
      id: 'prod-1',
      title: 'Đế WiFi 1 Chạm Thông Minh TapConnect™',
      category: 'Ca_Nhan_Hoa_NFC',
      type: 'nfc',
      price: 109000,
      originalPrice: 149000,
      badge: '⚡ NTAG215',
      image: 'assets/images/product-nfc-wifi.jpg',
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
      category: 'Decor_Den_Noi_That',
      type: 'standard',
      price: 125000,
      specs: { dimensions: '110 x 110 x 220 mm', weight: '160g', layer: '0.24mm Watertight Extrusion', warranty: 'Cam kết kín nước tuyệt đối' },
      colors: [{ id: 'terracotta', name: 'Đất Nung Thô', hex: '#C85A32' }, { id: 'white', name: 'Trắng Ngà Tối Giản', hex: '#EFEBE2' }],
      materials: [{ id: 'pla_matte', name: 'PLA+ Sinh Học', label: 'PLA+ Sinh Học Từ Ngô', priceModifier: 0 }]
    },
    {
      id: 'prod-3',
      title: 'Kệ Đa Năng BedSide & Desk Organizer Pro',
      category: 'Hop_De_Ban_Tien_Ich',
      type: 'standard',
      price: 199000,
      specs: { dimensions: '210 x 140 x 45 mm', weight: '220g', layer: '0.20mm High Precision', warranty: 'Bảo hành 12 tháng' },
      colors: [{ id: 'obsidian', name: 'Đen Obsidian', hex: '#1E293B' }, { id: 'white', name: 'Trắng Bắc Âu', hex: '#F8FAFC' }],
      materials: [{ id: 'pla_matte', name: 'PLA+ Matte Siêu Mịn', label: 'PLA+ Matte Siêu Mịn', priceModifier: 0 }]
    },
    {
      id: 'prod-4',
      title: 'Đèn Bàn Xoắn Kem Swirl Soft-Serve™',
      category: 'Decor_Den_Noi_That',
      type: 'standard',
      price: 320000,
      specs: { dimensions: '140 x 140 x 190 mm', weight: '210g', layer: '0.16mm Tán xạ quang học', warranty: 'Bảo hành 12 tháng' },
      colors: [{ id: 'cream', name: 'Vàng Bơ Mịn', hex: '#FFF3B0' }, { id: 'white', name: 'Trắng Sữa Xuyên Sáng', hex: '#FAF9F6' }],
      materials: [{ id: 'pla_trans', name: 'PLA Xuyên Sáng Tự Nhiên', label: 'PLA Xuyên Sáng Tự Nhiên', priceModifier: 0 }]
    },
    {
      id: 'prod-5',
      title: 'Hệ Bảng Treo Tường Module Hexa Pegboard',
      category: 'Hop_De_Ban_Tien_Ich',
      type: 'standard',
      price: 145000,
      specs: { dimensions: '200 x 175 x 12 mm', weight: '140g', layer: '0.20mm Cấu trúc lục giác tổ ong', warranty: 'Bảo hành 6 tháng' },
      colors: [{ id: 'white', name: 'Trắng Sứ Nordic', hex: '#F8FAFC' }, { id: 'gray', name: 'Xám Xi Măng', hex: '#94A3B8' }],
      materials: [{ id: 'pla_std', name: 'PLA+ Chịu Lực', label: 'PLA+ Chịu Lực Treo Đồ', priceModifier: 0 }]
    },
    {
      id: 'prod-6',
      title: 'Bảng Tên & Chữ Cái Monogram 3D Signature',
      category: 'Ca_Nhan_Hoa_NFC',
      type: 'monogram',
      price: 135000,
      specs: { dimensions: '120 x 85 x 42 mm', weight: '110g', layer: '0.12mm Hoàn thiện sắc nét', warranty: 'Bảo hành hoàn tiền' },
      colors: [{ id: 'orange', name: 'Cam Safety Orange', hex: '#FF5C00' }, { id: 'black', name: 'Đen Obsidian Mờ', hex: '#1E293B' }],
      materials: [{ id: 'pla_dual', name: 'PLA+ 2 Màu Tương Phản', label: 'PLA+ Đúc 2 Màu Liền Khối', priceModifier: 0 }]
    }
  ];

  // 5 Danh mục sản phẩm chuẩn hóa toàn hệ thống (Central Category Registry)
  
  // Baseline Seed Snapshot phục vụ 3-way merge an toàn (Codex Directive TT3D-STUDIO-TYPO-R1)
  const BASELINE_PRODUCT_SEED_MAP = {
  "mw-cn-2084928": {
    "title": "Ống cắm cọ trang điểm Nếp gấp lụa thắt nơ ngọt ngào (Sweet Silk Bow Vanity Pot)",
    "cleanTitle": "Khay Đựng Son & Nước Hoa Nơ Lụa Sweet Silk"
  },
  "mw-cn-2531095": {
    "title": "Bình cắm cọ trang điểm Nếp lụa thắt nơ cánh bướm lớn (Silk Bow Deluxe Caddy)",
    "cleanTitle": "Bình Cắm Cọ Deluxe Cánh Bướm Nơ Đôi"
  },
  "mw-cn-1646129": {
    "title": "Khay đĩa lụa mềm thắt nơ đựng trang sức & chìa khóa (Coquette Silk Ribbon Vanity Tray)",
    "cleanTitle": "Khay Nơ Lụa Đựng Trang Sức & Chìa Khóa"
  },
  "mw-cn-2053572": {
    "title": "Hộp trang sức nắp đậy nếp lụa quả đào thắt nơ (Silk Pleated Peach Jewelry Box)",
    "cleanTitle": "Hộp Trang Sức Nắp Quả Đào Nếp Lụa Thắt Nơ"
  },
  "mw-cn-2332788": {
    "title": "Ống đựng cọ trang điểm nơ lụa satin kem tươi (Cream Satin Ribbon Brush Holder)",
    "cleanTitle": "Ống Đựng Cọ Trang Điểm Satin Kem Tươi"
  },
  "mw-cn-2332220": {
    "title": "Hộp vỏ sò lụa thắt nơ ngọc trai đựng nhẫn & dây chuyền (Silk Seashell Bow Jewelry Box)",
    "cleanTitle": "Hộp Vỏ Sò Lụa Thắt Nơ Đựng Nhẫn Cưới"
  },
  "mw-cn-2510097": {
    "title": "Đĩa khay lụa nếp gấp mỹ thuật trưng bày nước hoa & son (Silk Pleated Material Pallet)",
    "cleanTitle": "Đĩa Lụa Nếp Gấp Mỹ Thuật Trưng Bày Son"
  },
  "mw-cn-2771973": {
    "title": "Chén trang sức Ballet nếp gấp mây bồng bềnh (Cloud Pleat Ballet Jewelry Pot)",
    "cleanTitle": "Chén Trang Sức Nếp Gấp Mây Ballet"
  },
  "mw-cn-2615328": {
    "title": "Hộp trang sức đan len nơ hồng cao cấp (Pink Bow Knit Cosmetic Box)",
    "cleanTitle": "Hộp Đựng Mỹ Phẩm Vân Đan Len Nơ Hồng"
  },
  "mw-cn-2709441": {
    "title": "Hộp trang sức 5 ngăn cánh đại thiên thần xa hoa (Archangel Wings 5-compartment Jewelry Box)",
    "cleanTitle": "Hộp Trang Sức 5 Ngăn Cánh Thiên Thần"
  },
  "mw-cn-2761118": {
    "title": "Hộp pho mát rèm cuốn chống bụi đựng mỹ phẩm & serum (Cheese Roller Shutter Vanity Box)",
    "cleanTitle": "Tủ Mỹ Phẩm Rèm Cuốn 2 Tầng Chống Bụi Phô Mai"
  },
  "mw-cn-1954833": {
    "title": "Đèn ngủ tam giác cấu trúc len dệt cổ điển (Triangle Retro Woven Lamp)",
    "cleanTitle": "Đèn Ngủ Tam Giác Cấu Trúc Len Dệt Cổ Điển"
  },
  "mw-cn-1438306": {
    "title": "Đế đèn đám mây phi hành gia lơ lửng đa năng (Astronaut Cloud Ambient Night Lamp)",
    "cleanTitle": "Đèn Đám Mây Phi Hành Gia Lơ Lửng Đa Năng"
  },
  "mw-cn-2327403": {
    "title": "Đèn cây nấm bề mặt dệt len ấm áp (Woven Texture Mushroom Lamp)",
    "cleanTitle": "Đèn Nấm Bề Mặt Dệt Len Bắc Âu"
  },
  "mw-cn-2235027": {
    "title": "Đèn bàn giấy Washi KŌHAKU tối giản Nhật Bản (KŌHAKU Washi Minimalist Lamp)",
    "cleanTitle": "Đèn Bàn Giấy Washi KŌHAKU Tối Giản"
  },
  "mw-cn-2791883": {
    "title": "Đèn voan mỏng hữu cơ Lunelle thanh lịch (Lunelle Organic Tulle Lamp)",
    "cleanTitle": "Đèn Voan Mỏng Hữu Cơ Lunelle Thanh Lịch"
  },
  "mw-cn-2768588": {
    "title": "Đèn nan tre đan truyền thống hiệu ứng bóng đổ (Traditional Bamboo Weaving Shadow Lamp)",
    "cleanTitle": "Đèn Nan Tre Đan Truyền Thống Đổ Bóng Nghệ Thuật"
  },
  "mw-cn-2050227": {
    "title": "Đèn thiền Zen Garden phong cách tối giản Bắc Âu (Zen Minimalist LED Kit 001 Lamp)",
    "cleanTitle": "Đèn Thiền Zen Garden Phong Cách Tối Giản Bắc Âu"
  },
  "mw-cn-1008515": {
    "title": "Bình hoa tạo hình túi giấy xi măng nhăn nghệ thuật (Crinkled Paper Bag Vase)",
    "cleanTitle": "Bình Hoa Túi Giấy Xi Măng Đánh Lừa Thị Giác"
  },
  "mw-cn-2600068": {
    "title": "Bình hoa ảo giác túi nilon trong suốt phồng nước (Illusion Plastic Bag Vase)",
    "cleanTitle": "Bình Hoa Ảo Giác Túi Nilon Trong Suốt Phồng Nước"
  },
  "mw-cn-1151680": {
    "title": "Bình hoa tạo hình túi vải mềm nhăn phồng tạo khối (Fabric Textured Soft Bag Vase)",
    "cleanTitle": "Bình Hoa Dáng Túi Vải Mềm Thắt Dây Độc Bản"
  },
  "mw-cn-475316": {
    "title": "Bàn trà mini phản trọng lực Tensegrity huyền bí (Tensegrity Anti-Gravity Floating Table)",
    "cleanTitle": "Bàn Trà Mini Phản Trọng Lực Tensegrity Huyền Bí"
  },
  "mw-cn-1702306": {
    "title": "Rắn Gary Zootopia khớp uốn lượn linh hoạt (Zootopia Articulated Gary the Snake)",
    "cleanTitle": "Mô Hình Rắn Gary Khớp Động Uốn Lượn 3D"
  },
  "mw-cn-1553726": {
    "title": "Chuột thiên thần có cánh mini đáng yêu (Cute Winged Angel Mouse Figurine)",
    "cleanTitle": "Mô Hình Chuột Thiên Thần Có Cánh Mini Đáng Yêu"
  },
  "mw-cn-1795991": {
    "title": "Đá cuội bấm phím cơ Clicker xả stress ASMR 3D (Stone Pebble Mechanical Fidget Clicker)",
    "cleanTitle": "Đá Cuội Fidget Phím Cơ ASMR Bỏ Túi"
  },
  "mw-cn-2370777": {
    "title": "Clicker cơ học 100% in 3D không cần linh kiện ngoài v2 (100% 3D Printed Fidget Clicker)",
    "cleanTitle": "Clicker Cơ Học 100% In 3D Liền Khối Không Switch"
  },
  "mw-cn-2331892": {
    "title": "Kem ốc quế bấm Clicker phím cơ xả stress mini (Ice Cream Fidget Clicker)",
    "cleanTitle": "Fidget Kem Ốc Quế Switch Cơ Pastel"
  },
  "mw-cn-2415902": {
    "title": "Chim béo tròn bấm phím nhảy múa xả stress (Chubby Bird Fidget Clicker)",
    "cleanTitle": "Fidget Chim Béo Nhảy Múa Khi Bấm Phím"
  },
  "mw-cn-1433737": {
    "title": "Mèo con mini khớp động uốn lượn trong lòng bàn tay (Mini Articulated Flexible Kitten)",
    "cleanTitle": "Mèo Con Mini Khớp Động Uốn Lượn Trong Lòng Bàn Tay"
  },
  "mw-cn-125751": {
    "title": "Gấu trúc khớp cử động móc khóa linh hoạt (Articulated Panda Keychain)",
    "cleanTitle": "Móc Khóa Gấu Trúc Khớp Cử Động Linh Hoạt"
  },
  "mw-cn-704003": {
    "title": "Gundam mecha khớp cử động in liền khối móc khóa (Print-in-Place Articulated Gundam Keychain)",
    "cleanTitle": "Móc Khóa Gundam Mecha Khớp Cử Động Liền Khối"
  },
  "mw-cn-1360122": {
    "title": "Bàn phím Bambu xả stress không cần trục kim loại (Bambu Lab Fidget Mechanical Keyboard)",
    "cleanTitle": "Bàn Phím Mini Fidget 4 Nút Tháo Rời Keycap"
  },
  "mw-cn-1753199": {
    "title": "Quả bơ bấm Clicker phím cơ xả stress dễ thương (Avocado Mechanical Fidget Clicker)",
    "cleanTitle": "Móc Khóa Fidget Quả Bơ Switch Cơ Hạt Tách Rời"
  },
  "mw-cn-2936034": {
    "title": "Ghế sofa gấu Werwer giá đỡ điện thoại phong cách Retro (Werwer Bear Sofa Phone Stand)",
    "cleanTitle": "Giá Đỡ Điện Thoại Ghế Sofa Gấu Werwer Phong Cách Retro"
  },
  "mw-cn-2996948": {
    "title": "Giỏ xếp nếp Origami co giãn thông minh đa năng (Collapsible Folding Basket)",
    "cleanTitle": "Giỏ Xếp Nếp Origami Co Giãn Đa Năng Xếp Gọn"
  },
  "mw-cn-1223355": {
    "title": "Ống bút ống nước Mario có ngăn kéo bí mật ẩn (Mario Pipe Pen Holder Hidden Drawer)",
    "cleanTitle": "Ống Cắm Bút Ống Nước Mario Có Ngăn Kéo Bí Mật Ẩn"
  },
  "mw-cn-1404920": {
    "title": "Hệ module ngăn kéo xếp chồng mini để bàn Pork3D (Pork3D Stackable Desk Drawers)",
    "cleanTitle": "Hệ Module Ngăn Kéo Xếp Chồng Mini Để Bàn Pork3D"
  },
  "mw-cn-1827939": {
    "title": "Hộp xoay 3 tầng vòng tròn ma thuật Sakura (Sakura Magic Circle 3-Tier Rotating Box)",
    "cleanTitle": "Hộp Xoay 3 Tầng Vòng Tròn Ma Thuật Sakura Mở Bung"
  },
  "mw-cn-1971424": {
    "title": "Hộp bánh xe đu quay Ferris xoay cơ học lưu trữ mini (Ferris Wheel Mechanical Carousel Box)",
    "cleanTitle": "Hộp Bánh Xe Đu Quay Ferris Xoay Cơ Học Lưu Trữ Mini"
  },
  "mw-cn-181548": {
    "title": "Hộp xoay đa tầng cơ học tiện ích để bàn (Multi-tier Swivel Desktop Storage Box)",
    "cleanTitle": "Hộp Xoay Đa Tầng Cơ Học Tiện Ích Để Bàn Văn Phòng"
  },
  "mw-cn-1037659": {
    "title": "Kẹp giữ cáp sạc kiểu dáng bậc thang decor (Stepped Cable Organizer Clip)",
    "cleanTitle": "Kẹp Giữ Cáp Sạc Kiểu Dáng Bậc Thang Chống Rơi Dây"
  },
  "mw-cn-701384": {
    "title": "Kẹp cáp bàn IKEA Skadis phong cách tối giản (IKEA Skadis Cable Clip)",
    "cleanTitle": "Kẹp Giữ Dây Cáp Bảng Đục Lỗ IKEA Skadis Tối Giản"
  },
  "mw-cn-176739": {
    "title": "Hộp khẩu độ máy ảnh cơ chế Iris xoay mở 100% 3D (Mechanical Iris Aperture Box)",
    "cleanTitle": "Hộp Khẩu Độ Máy Ảnh Cơ Chế Iris Xoay Mở 100% 3D"
  },
  "mw-cn-1012842": {
    "title": "Hộp mật mã xoay Cryptex Da Vinci giải đố (Da Vinci Mechanical Cryptex Puzzle Box)",
    "cleanTitle": "Hộp Mật Mã Xoay Cryptex Da Vinci Giải Đố Cơ Khí"
  },
  "mw-cn-951495": {
    "title": "Biển số điện thoại đỗ xe ô tô xoay giấu số tùy biến (Custom Rotating Car Parking Phone Plate)",
    "cleanTitle": "Biển Số Đỗ Xe Taplo Cơ Chế Xoay Lật Ẩn Số Riêng Tư"
  },
  "mw-cn-2206348": {
    "title": "Biển đỗ xe ô tô cử chỉ tay số phong cách trẻ trung (Hand Gesture Temporary Car Parking Plate)",
    "cleanTitle": "Biển Đỗ Xe Ô Tô Cử Chỉ Tay Số Thể Thao Nổi Bật"
  },
  "mw-cn-2719031": {
    "title": "Biển đỗ xe oval nghiêng tối giản không cần AMS (Minimalist Oval Angled Parking Plate)",
    "cleanTitle": "Thẻ Đỗ Xe Ô Tô Oval Góc Nghiêng 45° Tối Giản Kính Lái"
  },
  "mw-cn-3060338": {
    "title": "Biển đỗ xe bồ hóng đen mini đổi số trang trí taplo (Black Soot Sprite Car Parking Plate)",
    "cleanTitle": "Biển Đỗ Xe Bồ Hóng Hoạt Hình Đổi Số Trang Trí Taplo"
  },
  "mw-cn-2808063": {
    "title": "Biển số xe bàn phím bấm số Clicky cơ học (Clicky Mechanical Car Parking Number Display)",
    "cleanTitle": "Biển Số Xe Bàn Phím Bấm Switch Cơ Học Clicky Độc Lạ"
  },
  "mw-cn-1769352": {
    "title": "Biển mã QR quầy thu ngân không cần AMS thẻ trượt (WeChat/Bank QR Code Stand No-AMS)",
    "cleanTitle": "Biển Mã QR Quầy Thu Ngân Thẻ Trượt Chuyển Khoản Nhanh"
  },
  "mw-cn-694992": {
    "title": "Biển đứng mã QR quầy vỉa hè/cà phê gấp gọn (Street Vendor Payment QR Stand)",
    "cleanTitle": "Biển Đứng Mã QR Thanh Toán Gấp Gọn Quầy Cafe Vỉa Hè"
  },
  "mw-cn-558306": {
    "title": "Biển đứng Logo 3D & mã QR mạng xã hội cá nhân (Custom 3D Logo & QR Stand)",
    "cleanTitle": "Standee Biển Đứng Logo 3D Đa Tầng Kèm Mã QR Mạng Xã Hội"
  },
  "mw-cn-939925": {
    "title": "Móc khóa đĩa than Vinyl gắn chip NFC phát nhạc Spotify (Vinyl Record NFC Spotify Keychain)",
    "cleanTitle": "Móc Khóa Đĩa Than Vinyl Gắn Chip NFC Quét Nhạc Spotify"
  },
  "mw-cn-1836100": {
    "title": "Đèn tranh thấu quang Lithophane ngọn núi vàng phát sáng phong thủy (Lithophane Golden Mountain Night Lamp)",
    "cleanTitle": "Đèn Tranh Thấu Quang Lithophane Ngọn Núi Vàng Phong Thủy"
  },
  "mw-cn-1147539": {
    "title": "Biển tên/biển hiệu để bàn texture cao cấp tùy biến chữ (Creative Customizable 3D Sign / Nameplate)",
    "cleanTitle": "Biển Tên Chức Danh Để Bàn Texture Cao Cấp Khắc Chữ"
  }
};

  const CATEGORY_REGISTRY = (window.TTCategoryRegistry && typeof window.TTCategoryRegistry === 'object')
    ? window.TTCategoryRegistry
    : {
    Trang_Diem_Vanity: {
      id: 'Trang_Diem_Vanity',
      shortName: 'Trang Điểm & Nơ Lụa',
      title: 'Hộp Đựng Đồ Trang Điểm, Cọ Mỹ Phẩm & Trang Sức Lụa Thắt Nơ',
      accentColor: '#E11D48',
      accentBg: '#FFF1F2',
      icon: 'fa-wand-magic-sparkles',
      badgeText: '✦ Coquette Chic'
    },
    Decor_Den_Noi_That: {
      id: 'Decor_Den_Noi_That',
      shortName: 'Đèn & Bình Hoa Decor',
      title: 'Đèn Ngủ Nghệ Thuật, Bình Hoa Đánh Lừa Thị Giác & Tượng Decor',
      accentColor: '#D97706',
      accentBg: '#FEF3C7',
      icon: 'fa-lightbulb',
      badgeText: '✦ Ambient Craft'
    },
    Do_Choi_Moc_Khoa: {
      id: 'Do_Choi_Moc_Khoa',
      shortName: 'Khớp Động & Fidget',
      title: 'Đồ Chơi Khớp Động, Móc Khóa Hoạt Hình & Fidget Xả Stress',
      accentColor: '#0284C7',
      accentBg: '#E0F2FE',
      icon: 'fa-gamepad',
      badgeText: '✦ Viral Fidget'
    },
    Hop_De_Ban_Tien_Ich: {
      id: 'Hop_De_Ban_Tien_Ich',
      shortName: 'Hộp Bàn & Bánh Răng',
      title: 'Hộp Để Bàn Thông Minh, Cơ Cấu Bánh Răng & Tiện Ích Đa Năng',
      accentColor: '#16A34A',
      accentBg: '#DCFCE7',
      icon: 'fa-gears',
      badgeText: '✦ Mechanical Desk'
    },
    Ca_Nhan_Hoa_NFC: {
      id: 'Ca_Nhan_Hoa_NFC',
      shortName: 'Cá Nhân Hóa & NFC',
      title: 'Sản Phẩm Cá Nhân Hóa, Biển Số Xe, Mã QR & Móc Khóa NFC',
      accentColor: '#7C3AED',
      accentBg: '#F3E8FF',
      icon: 'fa-fingerprint',
      badgeText: '✦ Smart Custom'
    }
  };

  let cachedProducts = null;
  let cachedMetadata = null;
  let initPromise = null;
  let isWritingStorage = false;

  /**
   * Phân loại trạng thái dữ liệu lưu trữ trong localStorage (Codex Section 5.1)
   */
  function readStoredCatalog(storage = localStorage) {
    let raw;
    try {
      raw = storage.getItem(STORAGE_KEY);
    } catch (error) {
      return { kind: 'unavailable', error };
    }
    if (raw === null) return { kind: 'absent' };
    try {
      const products = JSON.parse(raw);
      return Array.isArray(products)
        ? { kind: 'array', raw, products }
        : { kind: 'invalid', raw, reason: 'wrong-type' };
    } catch (error) {
      return { kind: 'invalid', raw, reason: 'invalid-json', error };
    }
  }

  /**
   * Đọc metadata lưu trữ (revision, tombstones, version)
   */
  function readMetadata(storage = localStorage) {
    try {
      const raw = storage.getItem(META_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            schemaVersion: parsed.schemaVersion || 0,
            catalogRevision: parsed.catalogRevision || null,
            tombstones: Array.isArray(parsed.tombstones) ? parsed.tombstones : [],
            migratedAt: parsed.migratedAt || null,
            metadataPending: Boolean(parsed.metadataPending)
          };
        }
      }
    } catch (e) {
      console.warn('[CatalogStore] Lỗi đọc metadata:', e);
    }
    return {
      schemaVersion: 0,
      catalogRevision: null,
      tombstones: [],
      migratedAt: null,
      metadataPending: false
    };
  }

  /**
   * Ghi metadata lưu trữ an toàn, trả về trạng thái rõ ràng
   */
  function writeMetadata(meta, storage = localStorage) {
    try {
      storage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
      cachedMetadata = meta;
      return { ok: true };
    } catch (e) {
      console.warn('[CatalogStore] Lỗi ghi metadata:', e);
      return { ok: false, error: e };
    }
  }

  /**
   * Kiểm tra toàn vẹn toàn bộ mảng catalog (validateWholeCatalog - Codex Section 5.1)
   */
  function validateWholeCatalog(raw) {
    if (!Array.isArray(raw)) {
      throw new Error('Catalog phải là một mảng.');
    }
    const seenIds = new Set();
    const validated = [];
    for (let i = 0; i < raw.length; i++) {
      const p = raw[i];
      if (!p || typeof p !== 'object') {
        throw new Error(`Bản ghi ở vị trí ${i} không phải object hợp lệ.`);
      }
      const id = String(p.id || '').trim();
      if (!id) {
        throw new Error(`Bản ghi ở vị trí ${i} thiếu ID hợp lệ.`);
      }
      if (seenIds.has(id)) {
        throw new Error(`Phát hiện trùng lặp ID sản phẩm: ${id}`);
      }
      seenIds.add(id);

      const title = String(p.title || '').trim();
      if (!title) {
        throw new Error(`Sản phẩm ${id} thiếu tiêu đề.`);
      }

      const price = p.price;
      if (typeof price !== 'number' || !Number.isSafeInteger(price) || price < 0) {
        throw new Error(`Sản phẩm ${id} có giá không hợp lệ: ${price}`);
      }

      // Validate colors if present
      if (p.colors !== undefined && !Array.isArray(p.colors)) {
        throw new Error(`Sản phẩm ${id} có danh sách colors không phải mảng.`);
      }
      if (Array.isArray(p.colors)) {
        const colorIds = new Set();
        for (const c of p.colors) {
          if (!c || typeof c !== 'object' || !c.id) {
            throw new Error(`Sản phẩm ${id} chứa màu không hợp lệ.`);
          }
          if (colorIds.has(c.id)) {
            throw new Error(`Sản phẩm ${id} có mã màu trùng lặp: ${c.id}`);
          }
          colorIds.add(c.id);
        }
      }

      // Validate materials if present
      if (p.materials !== undefined && !Array.isArray(p.materials)) {
        throw new Error(`Sản phẩm ${id} có danh sách materials không phải mảng.`);
      }
      if (Array.isArray(p.materials)) {
        const matIds = new Set();
        for (const m of p.materials) {
          if (!m || typeof m !== 'object' || !m.id) {
            throw new Error(`Sản phẩm ${id} chứa vật liệu không hợp lệ.`);
          }
          if (matIds.has(m.id)) {
            throw new Error(`Sản phẩm ${id} có mã vật liệu trùng lặp: ${m.id}`);
          }
          matIds.add(m.id);
          const mod = m.priceModifier ?? 0;
          if (typeof mod !== 'number' || !Number.isSafeInteger(mod) || mod < 0) {
            throw new Error(`Sản phẩm ${id} có phụ phí vật liệu không hợp lệ: ${mod}`);
          }
        }
      }

      // Validate specs
      if (p.specs !== undefined && (typeof p.specs !== 'object' || p.specs === null || Array.isArray(p.specs))) {
        throw new Error(`Sản phẩm ${id} có specs không hợp lệ.`);
      }

      validated.push(p);
    }
    return validated;
  }

  /**
   * Tải và xác thực catalog mặc định từ file products.json
   */
  async function fetchDefaultCatalogResult(url = FALLBACK_URL) {
    try {
      const fetchUrl = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
      const raw = await response.json();
      const products = validateWholeCatalog(raw);
      return { ok: true, products };
    } catch (error) {
      return { ok: false, error };
    }
  }

  /**
   * Chuẩn hóa và làm sạch dữ liệu sản phẩm đầy đủ 55 thuộc tính
   * Không tự ý chế tạo điểm 5/5 hay selectionScore 100 nếu dữ liệu gốc không có
   */
  function sanitizeProduct(p, index) {
    const idx = (typeof index === 'number') ? index + 1 : 1;
    const cat = String(p.category || 'Hop_De_Ban_Tien_Ich').trim();
    const fallbackBadge = CATEGORY_REGISTRY[cat]?.badgeText || '✦ 3D Print';

    // Xử lý an toàn selectionScore & rating
    const safeSelectionScore = (typeof p.selectionScore === 'number' && Number.isFinite(p.selectionScore))
      ? p.selectionScore
      : null;

    const safeAesthetic = (typeof p.aestheticScore === 'number' && p.aestheticScore >= 1 && p.aestheticScore <= 5)
      ? p.aestheticScore
      : (p.aestheticScore ? parseInt(p.aestheticScore, 10) : null);

    const safeUniqueness = (typeof p.uniquenessScore === 'number' && p.uniquenessScore >= 1 && p.uniquenessScore <= 5)
      ? p.uniquenessScore
      : (p.uniquenessScore ? parseInt(p.uniquenessScore, 10) : null);

    const safeFeasibility = (typeof p.feasibilityScore === 'number' && p.feasibilityScore >= 1 && p.feasibilityScore <= 5)
      ? p.feasibilityScore
      : (p.feasibilityScore ? parseInt(p.feasibilityScore, 10) : null);

    return {
      id: String(p.id || 'prod-' + idx).trim(),
      modelId: p.modelId ? String(p.modelId).trim() : null,
      title: String(p.title || 'Sản phẩm ' + idx).trim(),
      originalTitle: p.originalTitle ? String(p.originalTitle).trim() : null,
      category: cat,
      type: String(p.type || 'standard').trim(),
      price: Math.max(0, parseInt(p.price, 10) || 0),
      originalPrice: p.originalPrice ? Math.max(0, parseInt(p.originalPrice, 10) || 0) : null,
      badge: String(p.badge || fallbackBadge).trim(),
      image: String(p.image || 'assets/images/logo-premium-mark.svg').trim(),
      imageAlt: String(p.imageAlt || p.title || 'Sản phẩm in 3D').trim(),
      imageSource: ['upload', 'url', 'preset'].includes(p.imageSource) ? p.imageSource : 'preset',
      presetId: p.presetId ? String(p.presetId).trim() : null,
      modelKey: p.modelKey ? String(p.modelKey).trim() : null,
      author: p.author ? String(p.author).trim() : 'T&T 3D Labs',
      makerworldUrl: p.makerworldUrl ? String(p.makerworldUrl).trim() : null,
      downloads: Math.max(0, parseInt(p.downloads, 10) || 0),
      likes: Math.max(0, parseInt(p.likes, 10) || 0),
      prints: Math.max(0, parseInt(p.prints, 10) || 0),
      weightGrams: Math.max(0, parseInt(p.weightGrams, 10) || 0),
      printTimeSeconds: Math.max(0, parseInt(p.printTimeSeconds, 10) || 0),
      aestheticScore: safeAesthetic,
      uniquenessScore: safeUniqueness,
      feasibilityScore: safeFeasibility,
      selectionScore: safeSelectionScore,
      materialRecommendation: String(p.materialRecommendation || '').trim(),
      headlineBenefit: String(p.headlineBenefit || '').trim(),
      desc: String(p.desc || '').trim(),
      videoScript: String(p.videoScript || '').trim(),
      productionNotes: String(p.productionNotes || '').trim(),
      licenseName: String(p.licenseName || 'Standard Digital File License').trim(),
      commercialStatus: String(p.commercialStatus || 'Chua_ro').trim(),
      isHero: Boolean(p.isHero),
      specLine: String(p.specLine || '').trim(),
      cleanTitle: p.cleanTitle ? String(p.cleanTitle).trim() : null,
      archetypeBadge: p.archetypeBadge ? String(p.archetypeBadge).trim() : null,
      badgeTheme: p.badgeTheme ? String(p.badgeTheme).trim() : 'default',
      useCaseEyebrow: p.useCaseEyebrow ? String(p.useCaseEyebrow).trim() : null,
      subCategory: p.subCategory ? String(p.subCategory).trim() : null,
      subCategoryName: p.subCategoryName ? String(p.subCategoryName).trim() : null,
      microSpecs: p.microSpecs ? String(p.microSpecs).trim() : null,
      specs: (p.specs && typeof p.specs === 'object' && !Array.isArray(p.specs)) ? { ...p.specs } : {},
      colors: Array.isArray(p.colors) ? p.colors.map(c => ({
        id: String(c.id || 'c_default').trim(),
        name: String(c.name || 'Mặc định').trim(),
        hex: String(c.hex || '#26282B').trim()
      })) : [],
      materials: Array.isArray(p.materials) ? p.materials.map(m => ({
        id: String(m.id || 'm_default').trim(),
        name: String(m.name || m.label || 'Tiêu chuẩn').trim(),
        label: String(m.label || m.name || 'Tiêu chuẩn').trim(),
        desc: String(m.desc || '').trim(),
        priceModifier: Math.max(0, parseInt(m.priceModifier, 10) || 0)
      })) : [],
      status: ['active', 'draft', 'archived'].includes(p.status) ? p.status : 'active',
      updatedAt: p.updatedAt || new Date().toISOString()
    };
  }

  /**
   * Hợp nhất thô (Raw Merge) trước khi Sanitize để bảo toàn toàn bộ trường seed bị thiếu
   * và bảo tồn dữ liệu tùy chỉnh của Admin (Codex Section 5.1 F06)
   */
  
  // Presentation API helpers (Codex Section 4 - WP-1)
  function presentationText(value) {
    return typeof value === 'string'
      ? value.normalize('NFC').replace(/\s+/gu, ' ').trim()
      : '';
  }

  function fallbackProductTitle(value) {
    const original = presentationText(value);
    const withoutImporterId = original
      .replace(/\s*#MW-\d+\s*$/iu, '')
      .trim();
    return withoutImporterId || original;
  }

  function getProductPresentation(product) {
    const p = product && typeof product === 'object' ? product : {};
    const title = presentationText(p.cleanTitle)
      || fallbackProductTitle(p.title)
      || 'Sản phẩm T&T';
    const categoryLabel = presentationText(
      CATEGORY_REGISTRY[p.category]?.shortName
    ) || 'Thiết kế T&T';
    const sourceSpecs = p.specs && typeof p.specs === 'object'
      && !Array.isArray(p.specs) ? p.specs : {};
    const specs = [...new Set(
      ['material', 'layer', 'dimensions', 'weight']
        .map(key => presentationText(sourceSpecs[key]))
        .filter(Boolean)
    )].slice(0, 2);
    return {
      title,
      subtitle: presentationText(p.headlineBenefit),
      categoryLabel,
      specs
    };
  }

  function mergeRawBeforeSanitize(storedRaw, baseSeed) {
    if (!baseSeed) return { item: storedRaw, changed: false };
    const merged = { ...baseSeed };
    let changed = false;

    // Three-way merge for cleanTitle (Codex WP-1B Directive)
    // Nếu storedRaw khớp baseline seed cũ (chưa bị Admin sửa), cho phép seed mới cập nhật cleanTitle
    const baseline = storedRaw.id ? BASELINE_PRODUCT_SEED_MAP[storedRaw.id] : null;
    const isUnmodifiedSeed = baseline &&
      storedRaw.title === baseline.title &&
      (storedRaw.cleanTitle || '') === (baseline.cleanTitle || '');

    for (const key of Object.keys(storedRaw)) {
      const val = storedRaw[key];
      if (val === undefined) continue;

      if (key === 'specs' && val && typeof val === 'object' && !Array.isArray(val)) {
        merged.specs = { ...(baseSeed.specs || {}), ...val };
        changed = true;
        continue;
      }

      if (key === 'cleanTitle' && isUnmodifiedSeed && baseSeed.cleanTitle) {
        merged.cleanTitle = baseSeed.cleanTitle;
        changed = true;
        continue;
      }

      // Giữ nguyên các mảng hoặc giá trị người dùng đã định nghĩa
      merged[key] = val;
      changed = true;
    }

    // Bảo toàn modelKey:null có chủ ý (không tự phục hồi model khác)
    if ('modelKey' in storedRaw) {
      merged.modelKey = storedRaw.modelKey;
    }

    return { item: merged, changed };
  }

  /**
   * Hợp nhất an toàn các trường được cung cấp (Partial Update)
   */
  function mergeProvidedFields(existing, patch) {
    if (!existing) return patch;
    const merged = { ...existing };
    for (const key of Object.keys(patch)) {
      if (patch[key] === undefined) continue;

      if (key === 'specs' && patch.specs && typeof patch.specs === 'object' && !Array.isArray(patch.specs)) {
        merged.specs = { ...(existing.specs || {}), ...patch.specs };
      } else {
        merged[key] = patch[key];
      }
    }
    merged.updatedAt = new Date().toISOString();
    return merged;
  }

  /**
   * Hàm thuần thực hiện di trú Catalog (Pure Migration Algorithm)
   * Nhận đầy đủ tham số, không đọc global state, trả về { products, metadata, changed, report }
   */
  function buildMigration({
    storedProducts,
    previousDefaults,
    incomingDefaults,
    metadata,
    currentRevision = CURRENT_CATALOG_REVISION,
    currentSchemaVersion = CURRENT_SCHEMA_VERSION,
    timestamp = new Date().toISOString()
  }) {
    if (storedProducts === null) {
      const seeded = (incomingDefaults || []).map((p, idx) => sanitizeProduct(p, idx));
      return {
        products: seeded,
        metadata: {
          schemaVersion: currentSchemaVersion,
          catalogRevision: currentRevision,
          tombstones: [],
          migratedAt: timestamp,
          metadataPending: false
        },
        changed: true,
        report: { action: 'seeded_initial', count: seeded.length }
      };
    }

    if (!Array.isArray(storedProducts)) {
      return {
        products: [],
        metadata: metadata || {
          schemaVersion: currentSchemaVersion,
          catalogRevision: currentRevision,
          tombstones: [],
          migratedAt: timestamp,
          metadataPending: false
        },
        changed: false,
        report: { action: 'invalid_type', count: 0 }
      };
    }

    // Tôn trọng mảng rỗng [] nếu người dùng đã xóa hết sản phẩm có chủ ý
    if (storedProducts.length === 0) {
      return {
        products: [],
        metadata: metadata || {
          schemaVersion: currentSchemaVersion,
          catalogRevision: currentRevision,
          tombstones: [],
          migratedAt: timestamp,
          metadataPending: false
        },
        changed: false,
        report: { action: 'preserve_empty', count: 0 }
      };
    }

    const tombstones = new Set(metadata?.tombstones || []);

    // Danh sách toàn bộ các bản mẫu chuẩn đã biết
    const allKnownBases = [...(incomingDefaults || []), ...(previousDefaults || []), ...LEGACY_FIXTURE_PRODUCTS];
    const baseMap = new Map();
    for (const b of allKnownBases) {
      if (b && b.id && !baseMap.has(b.id)) {
        baseMap.set(b.id, b);
      }
    }

    // 1. Raw merge trước khi sanitize cho từng sản phẩm lưu trữ
    const enrichedExisting = storedProducts.map((rawItem, idx) => {
      const baseSeed = rawItem && rawItem.id ? baseMap.get(rawItem.id) : null;
      const { item: rawMerged } = mergeRawBeforeSanitize(rawItem, baseSeed);
      return sanitizeProduct(rawMerged, idx);
    });

    const existingIdSet = new Set(enrichedExisting.map(p => p.id));
    const finalProducts = [...enrichedExisting];

    // 2. Bổ sung các seed sản phẩm mới từ incomingDefaults nếu revision thay đổi VÀ incomingDefaults có dữ liệu thực tế (Codex R05)
    let addedSeed = false;
    const hasIncoming = Array.isArray(incomingDefaults) && incomingDefaults.length > 0;
    if (metadata?.catalogRevision !== currentRevision && hasIncoming) {
      for (const def of incomingDefaults) {
        if (!existingIdSet.has(def.id) && !tombstones.has(def.id)) {
          finalProducts.push(sanitizeProduct(def, finalProducts.length));
          addedSeed = true;
        }
      }
    }

    // Chỉ coi là thay đổi khi danh sách sản phẩm sau merge khác với storedProducts ban đầu hoặc có seed mới (Codex Ca 4)
    let productsActuallyChanged = addedSeed;
    if (!productsActuallyChanged) {
      if (storedProducts.length !== finalProducts.length) {
        productsActuallyChanged = true;
      } else {
        for (let i = 0; i < storedProducts.length; i++) {
          if (JSON.stringify(storedProducts[i]) !== JSON.stringify(finalProducts[i])) {
            productsActuallyChanged = true;
            break;
          }
        }
      }
    }

    const revisionChanged = (metadata?.catalogRevision !== currentRevision) && hasIncoming;
    const hasChanged = productsActuallyChanged || revisionChanged;

    // Chỉ nâng catalogRevision khi incomingDefaults thực sự được nạp thành công (Codex R05)
    const effectiveRevision = hasIncoming ? currentRevision : (metadata?.catalogRevision || null);

    const nextMeta = {
      schemaVersion: currentSchemaVersion,
      catalogRevision: effectiveRevision,
      tombstones: Array.from(tombstones),
      migratedAt: hasChanged ? timestamp : (metadata?.migratedAt || timestamp),
      metadataPending: Boolean(metadata?.metadataPending)
    };

    return {
      products: finalProducts,
      metadata: nextMeta,
      changed: hasChanged,
      report: { action: 'migrated', count: finalProducts.length, changed: hasChanged }
    };
  }

  /**
   * Khởi tạo và đọc catalog với 5 quy tắc trạng thái của Codex (Section 5.1)
   */
  async function initCatalog(forceRetry = false) {
    if (initPromise && !forceRetry) return initPromise;

    initPromise = (async () => {
      try {
        // Khôi phục journal đang chờ xử lý nếu có (Codex R04, R05)
        try {
          const rawJournal = localStorage.getItem(STORAGE_KEY_JOURNAL);
          if (rawJournal) {
            const jEntry = JSON.parse(rawJournal);
            if (jEntry && jEntry.targetMetadata) {
              const currentRawList = localStorage.getItem(STORAGE_KEY);
              if (currentRawList) {
                let currentParsed = [];
                try { currentParsed = JSON.parse(currentRawList); } catch (_) {}
                if (Array.isArray(currentParsed)) {
                  if (currentParsed.length === jEntry.afterLength) {
                    // Bước ghi list đã hoàn tất trước crash -> Hoàn tất bước ghi metadata
                    const writeRes = writeMetadata(jEntry.targetMetadata, localStorage);
                    if (writeRes.ok) {
                      localStorage.removeItem(STORAGE_KEY_JOURNAL);
                    }
                  } else if (currentParsed.length === jEntry.beforeLength) {
                    // Bước ghi list chưa từng diễn ra trước crash -> Hủy transaction chưa commit
                    localStorage.removeItem(STORAGE_KEY_JOURNAL);
                  }
                }
              }
            }
          }
        } catch (jRecoveryErr) {
          console.warn('[CatalogStore] Lỗi khôi phục journal:', jRecoveryErr);
        }

        const storageState = readStoredCatalog(localStorage);
        const meta = readMetadata(localStorage);
        cachedMetadata = meta;

        // Quy tắc 4: Absent + fetch lỗi -> Báo lỗi/cho retry; KHÔNG ghi tt_products=[] và KHÔNG ghi marker!
        if (storageState.kind === 'absent') {
          const fetchRes = await fetchDefaultCatalogResult();
          if (!fetchRes.ok) {
            console.error('[CatalogStore] Storage rỗng và fetch catalog lỗi:', fetchRes.error);
            cachedProducts = [];
            initPromise = null; // Cho phép lần sau thử lại
            return cachedProducts;
          }
          // Quy tắc 1: Absent + fetch thành công -> Seed đầy đủ catalog đã xác thực
          const sanitized = fetchRes.products.map(sanitizeProduct);
          cachedProducts = sanitized;
          cachedMetadata = {
            schemaVersion: CURRENT_SCHEMA_VERSION,
            catalogRevision: CURRENT_CATALOG_REVISION,
            tombstones: [],
            migratedAt: new Date().toISOString(),
            metadataPending: false
          };
          try {
            isWritingStorage = true;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedProducts));
            const metaRes = writeMetadata(cachedMetadata, localStorage);
            if (!metaRes.ok) cachedMetadata.metadataPending = true;
          } catch (saveErr) {
            console.warn('[CatalogStore] Lỗi ghi seed ban đầu vào localStorage:', saveErr);
          } finally {
            isWritingStorage = false;
          }
          return cachedProducts;
        }

        // Quy tắc 2: Mảng rỗng [] -> Giữ rỗng có chủ ý
        if (storageState.kind === 'array' && storageState.products.length === 0) {
          cachedProducts = [];
          return cachedProducts;
        }

        // Quy tắc 5: Invalid hoặc unavailable -> Giữ raw, chuyển recovery; KHÔNG ghi đè dữ liệu hỏng
        if (storageState.kind === 'invalid' || storageState.kind === 'unavailable') {
          console.error('[CatalogStore] Dữ liệu trong localStorage không hợp lệ (hỏng JSON hoặc sai kiểu):', storageState);
          const fetchRes = await fetchDefaultCatalogResult();
          cachedProducts = fetchRes.ok ? fetchRes.products.map(sanitizeProduct) : [];
          return cachedProducts;
        }

        // Quy tắc 3: Array có dữ liệu:
        // Cố gắng tải defaults để làm giàu/di trú nếu có mạng. Nếu fetch lỗi, dùng catalog đã lưu, không nâng revision.
        const fetchRes = await fetchDefaultCatalogResult();
        const defaults = fetchRes.ok ? fetchRes.products : [];

        const migrationResult = buildMigration({
          storedProducts: storageState.products,
          incomingDefaults: defaults,
          metadata: meta,
          currentRevision: CURRENT_CATALOG_REVISION,
          currentSchemaVersion: CURRENT_SCHEMA_VERSION,
          timestamp: new Date().toISOString()
        });

        cachedProducts = migrationResult.products;
        cachedMetadata = migrationResult.metadata;

        // Chỉ ghi vào storage khi có thay đổi thực tế so với dữ liệu bền vững hiện có (Codex Ca 4)
        const currentStoredJson = localStorage.getItem(STORAGE_KEY);
        const nextProductsJson = JSON.stringify(cachedProducts);
        const productsActuallyChanged = currentStoredJson !== nextProductsJson;

        const currentMetaJson = localStorage.getItem(META_STORAGE_KEY);
        const nextMetaJson = JSON.stringify(cachedMetadata);
        const metaActuallyChanged = currentMetaJson !== nextMetaJson;

        if ((productsActuallyChanged || metaActuallyChanged) && fetchRes.ok) {
          try {
            isWritingStorage = true;
            if (productsActuallyChanged) {
              localStorage.setItem(STORAGE_KEY, nextProductsJson);
            }
            if (metaActuallyChanged) {
              const metaRes = writeMetadata(cachedMetadata, localStorage);
              if (!metaRes.ok) cachedMetadata.metadataPending = true;
            }
          } catch (saveErr) {
            console.warn('[CatalogStore] Không thể lưu migration vào localStorage:', saveErr);
          } finally {
            isWritingStorage = false;
          }
        }

        return cachedProducts;
      } catch (err) {
        console.error('[CatalogStore] Lỗi đọc dữ liệu localStorage:', err);
        const fetchRes = await fetchDefaultCatalogResult();
        cachedProducts = fetchRes.ok ? fetchRes.products.map(sanitizeProduct) : [];
        return cachedProducts;
      }
    })();

    return initPromise;
  }

  /**
   * Clone sâu an toàn đối tượng sản phẩm để ngăn chặn việc sửa đổi trực tiếp vào bộ nhớ cache (Codex Ca 5)
   */
  function cloneProduct(p) {
    if (!p || typeof p !== 'object') return p;
    return {
      ...p,
      colors: Array.isArray(p.colors) ? p.colors.map(c => ({ ...c })) : [],
      materials: Array.isArray(p.materials) ? p.materials.map(m => ({ ...m })) : [],
      specs: (p.specs && typeof p.specs === 'object' && !Array.isArray(p.specs)) ? { ...p.specs } : {}
    };
  }

  /**
   * Lấy danh sách sản phẩm đồng bộ (sau khi init hoàn tất, trả về immutable clone)
   */
  function getProductsSync(onlyActive = true) {
    const list = cachedProducts || [];
    const filtered = onlyActive ? list.filter(p => p.status === 'active') : list;
    return filtered.map(cloneProduct);
  }

  /**
   * Lấy danh sách sản phẩm bất đồng bộ
   */
  async function getProducts(onlyActive = true) {
    await initCatalog();
    return getProductsSync(onlyActive);
  }

  /**
   * Lấy danh sách sản phẩm theo Category (đồng bộ)
   */
  function getProductsByCategorySync(categoryId, onlyActive = true) {
    const list = getProductsSync(onlyActive);
    if (!categoryId || categoryId === 'all') {
      return list;
    }
    return list.filter(p => p.category === categoryId);
  }

  /**
   * Lấy danh sách sản phẩm theo Category (bất đồng bộ)
   */
  async function getProductsByCategory(categoryId, onlyActive = true) {
    await initCatalog();
    return getProductsByCategorySync(categoryId, onlyActive);
  }

  /**
   * Lấy Hero Item của 1 Category (đồng bộ)
   */
  function getCategoryHeroSync(categoryId) {
    const prods = getProductsByCategorySync(categoryId, true);
    if (prods.length === 0) return null;
    const hero = prods.find(p => p.isHero);
    if (hero) return hero;
    return prods.slice().sort((a, b) => {
      const sa = (typeof a.selectionScore === 'number') ? a.selectionScore : -1;
      const sb = (typeof b.selectionScore === 'number') ? b.selectionScore : -1;
      if (sb !== sa) return sb - sa;
      return (b.prints || 0) - (a.prints || 0);
    })[0];
  }

  /**
   * Lấy 1 sản phẩm theo ID (đồng bộ, trả về immutable clone - Codex Ca 5)
   */
  function getProductByIdSync(id) {
    const list = cachedProducts || [];
    const item = list.find(p => p.id === id);
    return item ? cloneProduct(item) : null;
  }

  /**
   * Lấy 1 sản phẩm theo ID (bất đồng bộ)
   */
  async function getProductById(id) {
    await initCatalog();
    return getProductByIdSync(id);
  }

  /**
   * Lưu toàn bộ catalog mới (Validate toàn bộ, ghi list trước, kiểm tra trạng thái lưu trữ - Codex R04)
   */
  function saveProducts(productsList) {
    if (!Array.isArray(productsList)) {
      throw new Error('Catalog phải là một mảng!');
    }
    const storageState = readStoredCatalog(localStorage);
    if (storageState.kind === 'invalid' || storageState.kind === 'unavailable') {
      throw new Error('Không thể ghi đè vì kho lưu trữ đang ở trạng thái lỗi/hỏng dữ liệu.');
    }

    // Validate whole catalog trước khi lưu (Codex Section 6.3)
    validateWholeCatalog(productsList);

    const sanitized = productsList.map(sanitizeProduct);
    const jsonStr = JSON.stringify(sanitized);

    try {
      isWritingStorage = true;
      localStorage.setItem(STORAGE_KEY, jsonStr);
      cachedProducts = sanitized;
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { products: sanitized } }));
      return true;
    } catch (err) {
      console.error('[CatalogStore] Lỗi ghi localStorage (có thể đầy quota):', err);
      throw err;
    } finally {
      isWritingStorage = false;
    }
  }

  /**
   * Thêm hoặc Cập nhật 1 sản phẩm (Partial Merge bảo vệ trường không truyền vào)
   */
  async function upsertProduct(patch) {
    await initCatalog();
    if (!patch || typeof patch !== 'object' || !patch.id) {
      throw new Error('Cần cung cấp dữ liệu sản phẩm với id hợp lệ!');
    }
    if (patch.price !== undefined) {
      if (typeof patch.price !== 'number' || !Number.isSafeInteger(patch.price) || patch.price < 0) {
        throw new Error('Giá sản phẩm không được là số âm hoặc sai định dạng!');
      }
    }

    const list = [...(cachedProducts || [])];
    const existingIndex = list.findIndex(p => p.id === patch.id);

    if (existingIndex >= 0) {
      const merged = mergeProvidedFields(list[existingIndex], patch);
      const clean = sanitizeProduct(merged, existingIndex);
      list[existingIndex] = clean;
    } else {
      const clean = sanitizeProduct(patch, list.length);
      list.push(clean);
    }

    saveProducts(list);
    return getProductByIdSync(patch.id);
  }

  /**
   * Xóa 1 sản phẩm và ghi nhận tombstone có journal phục hồi (Codex R04, Section 6.3)
   */
  async function deleteProduct(productId) {
    await initCatalog();
    const currentList = cachedProducts || [];
    if (!currentList.some(p => p.id === productId)) {
      // ID không tồn tại -> no-op, không ghi marker mới (Codex Section 6.3)
      return {
        productsCommitted: false,
        metadataCommitted: true,
        metadataPending: Boolean(cachedMetadata?.metadataPending),
        notFound: true,
        products: currentList
      };
    }

    const nextProducts = currentList.filter(p => p.id !== productId);
    const currentMeta = cachedMetadata || readMetadata(localStorage);
    const nextTombstones = Array.isArray(currentMeta.tombstones) ? [...currentMeta.tombstones] : [];
    if (!nextTombstones.includes(productId)) {
      nextTombstones.push(productId);
    }
    const nextMeta = {
      ...currentMeta,
      tombstones: nextTombstones
    };

    // Nếu có metadata đang pending từ transaction trước, thử commit trước khi nhận mutation mới (Codex Section 6.3)
    if (cachedMetadata && cachedMetadata.metadataPending) {
      const flushRes = writeMetadata(cachedMetadata, localStorage);
      if (!flushRes.ok) {
        return {
          productsCommitted: false,
          metadataCommitted: false,
          metadataPending: true,
          error: new Error('Không thể xóa sản phẩm mới khi metadata của transaction trước chưa hoàn tất.'),
          products: currentList
        };
      }
      try { localStorage.removeItem(STORAGE_KEY_JOURNAL); } catch (_) {}
      cachedMetadata.metadataPending = false;
    }

    const previousJournal = localStorage.getItem(STORAGE_KEY_JOURNAL);
    const txId = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const journalEntry = {
      txId,
      version: 1,
      action: 'delete',
      productId,
      beforeLength: currentList.length,
      afterLength: nextProducts.length,
      targetMetadata: nextMeta
    };

    try {
      localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(journalEntry));
    } catch (jErr) {
      console.warn('[CatalogStore] Lỗi ghi journal trước delete:', jErr);
      return {
        productsCommitted: false,
        metadataCommitted: false,
        metadataPending: Boolean(cachedMetadata && cachedMetadata.metadataPending),
        error: jErr,
        products: currentList
      };
    }

    // 1. Ghi list sản phẩm trước
    try {
      saveProducts(nextProducts);
    } catch (saveErr) {
      console.warn('[CatalogStore] Ghi list sản phẩm thất bại:', saveErr);
      // Khôi phục lại journal trước đó nếu có, không xóa sạch pending journal cũ (Codex Ca 2)
      if (previousJournal) {
        try { localStorage.setItem(STORAGE_KEY_JOURNAL, previousJournal); } catch (_) {}
      } else {
        try { localStorage.removeItem(STORAGE_KEY_JOURNAL); } catch (_) {}
      }
      return {
        productsCommitted: false,
        metadataCommitted: false,
        metadataPending: Boolean(cachedMetadata && cachedMetadata.metadataPending),
        error: saveErr,
        products: currentList
      };
    }

    // 2. Ghi metadata sau
    const metaRes = writeMetadata(nextMeta, localStorage);
    if (metaRes.ok) {
      try { localStorage.removeItem(STORAGE_KEY_JOURNAL); } catch (_) {}
      cachedMetadata = nextMeta;
      cachedMetadata.metadataPending = false;
      return {
        productsCommitted: true,
        metadataCommitted: true,
        metadataPending: false,
        transactionId: txId,
        products: nextProducts
      };
    } else {
      // BẮT BUỘC giữ nguyên nextMeta (đã gồm tombstone của productId) trong cachedMetadata (Codex R04)
      nextMeta.metadataPending = true;
      cachedMetadata = nextMeta;
      journalEntry.pending = true;
      try {
        localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(journalEntry));
      } catch (_) {}
      console.warn('[CatalogStore] Ghi metadata thất bại sau khi xóa sản phẩm. Đánh dấu metadataPending và bảo toàn tombstone.');
      return {
        productsCommitted: true,
        metadataCommitted: false,
        metadataPending: true,
        transactionId: txId,
        products: nextProducts,
        error: metaRes.error
      };
    }
  }

  /**
   * Khôi phục về danh mục gốc từ products.json (Quy tắc 6)
   */
  async function resetToDefaults() {
    const fetchRes = await fetchDefaultCatalogResult();
    if (!fetchRes.ok) {
      throw new Error('Không thể tải catalog gốc để khôi phục: ' + (fetchRes.error?.message || 'Lỗi mạng'));
    }
    const defaults = fetchRes.products.map(sanitizeProduct);
    saveProducts(defaults);
    const meta = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      catalogRevision: CURRENT_CATALOG_REVISION,
      tombstones: [],
      migratedAt: new Date().toISOString(),
      metadataPending: false
    };
    writeMetadata(meta, localStorage);
    return defaults;
  }

  /**
   * Lắng nghe sự kiện thay đổi từ các tab khác (storage event)
   */
  window.addEventListener('storage', function (e) {
    if (isWritingStorage) return;
    if (e.key === STORAGE_KEY) {
      try {
        if (e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            cachedProducts = parsed.map(sanitizeProduct);
            window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { products: cachedProducts, fromStorageEvent: true } }));
          }
        }
      } catch (err) {
        console.warn('[CatalogStore] Lỗi đồng bộ từ tab khác:', err);
      }
    } else if (e.key === META_STORAGE_KEY) {
      try {
        if (e.newValue) {
          cachedMetadata = JSON.parse(e.newValue);
        }
      } catch (err) {
        // Ignored
      }
    }
  });

  // Export API
  window.TTCatalogStore = {
    init: initCatalog,
    initCatalog,
    getProducts,
    getProductsSync,
    getProductsByCategory,
    getProductsByCategorySync,
    getCategoryHeroSync,
    getProductById,
    getProductByIdSync,
    getProductPresentation,
    saveProducts,
    upsertProduct,
    deleteProduct,
    resetToDefaults,
    buildMigration,
    readStoredCatalog,
    fetchDefaultCatalogResult,
    validateWholeCatalog,
    CATEGORY_REGISTRY,
    EVENT_NAME,
    STORAGE_KEY,
    META_STORAGE_KEY,
    CURRENT_SCHEMA_VERSION,
    CURRENT_CATALOG_REVISION
  };

  // Khởi động sẵn sàng ngầm
  initCatalog();

})(typeof window !== 'undefined' ? window : this);
