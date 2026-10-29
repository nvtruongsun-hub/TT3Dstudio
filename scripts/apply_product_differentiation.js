const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '..', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const TAXONOMY_MAP = {
  // Category 1: Trang_Diem_Vanity
  'mw-cn-2084928': {
    cleanTitle: 'Khay Đựng Son & Nước Hoa Nơ Lụa Sweet Silk',
    archetypeBadge: 'Ánh Lụa Silk Tuyển Chọn',
    badgeTheme: 'amber',
    useCaseEyebrow: 'BÀN TRANG ĐIỂM • DÁNG NƠ COQUETTE',
    subCategory: 'khay_dia',
    subCategoryName: 'Khay Đĩa Trưng Bày',
    microSpecs: 'Nhựa Bio-PLA Silk Ánh Lụa · 90g'
  },
  'mw-cn-2531095': {
    cleanTitle: 'Bình Cắm Cọ Deluxe Cánh Bướm Nơ Đôi',
    archetypeBadge: 'Dung Tích Lớn 20 Cọ',
    badgeTheme: 'rose',
    useCaseEyebrow: 'BÀN TRANG ĐIỂM • CẮM CỌ CHUYÊN NGHIỆP',
    subCategory: 'ong_cam_co',
    subCategoryName: 'Ống Cắm Cọ Mỹ Phẩm',
    microSpecs: 'Chứa 15-20 cọ mỹ phẩm · Nhựa Bio-PLA'
  },
  'mw-cn-1646129': {
    cleanTitle: 'Khay Nơ Lụa Đựng Trang Sức & Chìa Khóa',
    archetypeBadge: '✦ Lựa Chọn Tiêu Biểu',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'GÓC RA VÀO • TRANG SỨC & CHÌA KHÓA',
    subCategory: 'khay_dia',
    subCategoryName: 'Khay Đĩa Trưng Bày',
    microSpecs: 'Đĩa lụa mềm vát cong · Trưng bày đồng hồ'
  },
  'mw-cn-2053572': {
    cleanTitle: 'Hộp Trang Sức Nắp Quả Đào Nếp Lụa Thắt Nơ',
    archetypeBadge: 'Nắp Đậy Kín Chống Bụi',
    badgeTheme: 'rose',
    useCaseEyebrow: 'BÀN PHẤN • BẢO QUẢN KHUYÊN TAI',
    subCategory: 'hop_trang_suc',
    subCategoryName: 'Hộp Đựng Trang Sức',
    microSpecs: 'Ngăn chứa tròn sâu lòng · Nắp tháo rời'
  },
  'mw-cn-2332788': {
    cleanTitle: 'Ống Đựng Cọ Trang Điểm Satin Kem Tươi',
    archetypeBadge: 'Vân Xoắn Satin Mịn',
    badgeTheme: 'amber',
    useCaseEyebrow: 'BÀN PHẤN • ĐỰNG CỌ & BÚT KÝ',
    subCategory: 'ong_cam_co',
    subCategoryName: 'Ống Cắm Cọ Mỹ Phẩm',
    microSpecs: 'Chống nghiêng đổ · Đáy đầm trọng tâm'
  },
  'mw-cn-2332220': {
    cleanTitle: 'Hộp Vỏ Sò Lụa Thắt Nơ Đựng Nhẫn Cưới',
    archetypeBadge: 'Khóa Bản Lề Liền Khối',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'QUÀ TẶNG • CẦU HÔN & KỶ NIỆM',
    subCategory: 'hop_trang_suc',
    subCategoryName: 'Hộp Đựng Trang Sức',
    microSpecs: 'Khớp mở góc 90° · Lót nhung đáy khay'
  },
  'mw-cn-2510097': {
    cleanTitle: 'Đĩa Lụa Nếp Gấp Mỹ Thuật Trưng Bày Son',
    archetypeBadge: 'Dải Gợn Sóng Tự Nhiên',
    badgeTheme: 'amber',
    useCaseEyebrow: 'BÀN TRANG ĐIỂM • CHỤP ẢNH FLATLAY',
    subCategory: 'khay_dia',
    subCategoryName: 'Khay Đĩa Trưng Bày',
    microSpecs: 'Độ dày 1.6mm · Bề mặt chống bám vân'
  },
  'mw-cn-2771973': {
    cleanTitle: 'Chén Trang Sức Nếp Gấp Mây Ballet',
    archetypeBadge: 'Tạo Khối Bồng Bềnh 3D',
    badgeTheme: 'rose',
    useCaseEyebrow: 'TAB ĐẦU GIƯỜNG • ĐỰNG NHẪN NGỦ',
    subCategory: 'hop_trang_suc',
    subCategoryName: 'Hộp Đựng Trang Sức',
    microSpecs: 'Lòng chén vát sâu · Giữ nhẫn không trơn trượt'
  },
  'mw-cn-2615328': {
    cleanTitle: 'Hộp Đựng Mỹ Phẩm Vân Đan Len Nơ Hồng',
    archetypeBadge: 'Bề Mặt Giả Len Độc Đáo',
    badgeTheme: 'rose',
    useCaseEyebrow: 'BÀN TRANG ĐIỂM • DECOR AMBIENT',
    subCategory: 'hop_trang_suc',
    subCategoryName: 'Hộp Đựng Trang Sức',
    microSpecs: 'Texture dệt len 3D · Nhựa Bio-PLA mờ'
  },
  'mw-cn-2709441': {
    cleanTitle: 'Hộp Trang Sức 5 Ngăn Cánh Thiên Thần',
    archetypeBadge: '5 Ngăn Độc Lập Phân Loại',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'BỘ SƯU TẬP • TRANG SỨC CAO CẤP',
    subCategory: 'hop_trang_suc',
    subCategoryName: 'Hộp Đựng Trang Sức',
    microSpecs: 'Cánh mở bung 2 bên · Trữ hơn 30 món nữ trang'
  },
  'mw-cn-2761118': {
    cleanTitle: 'Tủ Mỹ Phẩm Rèm Cuốn 2 Tầng Chống Bụi Phô Mai',
    archetypeBadge: 'Cơ Chế Rèm Cuốn Trượt 3D',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'BÀN TRANG ĐIỂM • DUNG TÍCH KHỦNG',
    subCategory: 'hop_trang_suc',
    subCategoryName: 'Hộp Đựng Trang Sức',
    microSpecs: 'Cao 24cm · 2 tầng chứa trọn bộ Skincare & Serum'
  },

  // Category 2: Decor_Den_Noi_That
  'mw-cn-1954833': {
    cleanTitle: 'Đèn Ngủ Tam Giác Cấu Trúc Len Dệt Cổ Điển',
    archetypeBadge: 'Hiệu Ứng Ánh Sáng Len Ấm',
    badgeTheme: 'amber',
    useCaseEyebrow: 'PHÒNG NGỦ • ÁNH SÁNG THIỀN',
    subCategory: 'den_decor',
    subCategoryName: 'Đèn Ngủ Nghệ Thuật',
    microSpecs: 'LED 3000K Warm Light · Tiết kiệm điện'
  },
  'mw-cn-1438306': {
    cleanTitle: 'Đèn Đám Mây Phi Hành Gia Lơ Lửng Đa Năng',
    archetypeBadge: '✦ Lựa Chọn Tiêu Biểu',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'BÀN LÀM VIỆC • DECOR KHÔNG GIAN',
    subCategory: 'den_decor',
    subCategoryName: 'Đèn Ngủ Nghệ Thuật',
    microSpecs: 'Khối mây tán quang 360° · Dây cáp bọc dù'
  },
  'mw-cn-2327403': {
    cleanTitle: 'Đèn Nấm Bề Mặt Dệt Len Bắc Âu',
    archetypeBadge: 'Vòm Tán Sáng Hữu Cơ',
    badgeTheme: 'amber',
    useCaseEyebrow: 'KỆ SÁCH • PHONG CÁCH HYGGE',
    subCategory: 'den_decor',
    subCategoryName: 'Đèn Ngủ Nghệ Thuật',
    microSpecs: 'Chụp đèn tháo rời · Ánh sáng dịu mắt ban đêm'
  },
  'mw-cn-2235027': {
    cleanTitle: 'Đèn Bàn Giấy Washi KŌHAKU Tối Giản',
    archetypeBadge: 'Giấy Washi Xuyên Sáng',
    badgeTheme: 'amber',
    useCaseEyebrow: 'PHÒNG LÀM VIỆC • PHONG CÁCH NHẬT BẢN',
    subCategory: 'den_decor',
    subCategoryName: 'Đèn Ngủ Nghệ Thuật',
    microSpecs: 'Nếp gấp origami · Thân khung nhựa nhám cứng'
  },
  'mw-cn-2791883': {
    cleanTitle: 'Đèn Voan Mỏng Hữu Cơ Lunelle Thanh Lịch',
    archetypeBadge: 'Đường Cong Tham Số Parametric',
    badgeTheme: 'amber',
    useCaseEyebrow: 'PHÒNG KHÁCH • NGHỆ THUẬT NỘI THẤT',
    subCategory: 'den_decor',
    subCategoryName: 'Đèn Ngủ Nghệ Thuật',
    microSpecs: 'Vách in mỏng 0.8mm thấu quang tinh xảo'
  },
  'mw-cn-2768588': {
    cleanTitle: 'Đèn Nan Tre Đan Truyền Thống Đổ Bóng Nghệ Thuật',
    archetypeBadge: 'Hiệu Ứng Chiếu Bóng Họa Tiết',
    badgeTheme: 'amber',
    useCaseEyebrow: 'QUÁN TRÀ • KHÔNG GIAN HOÀI NIỆM',
    subCategory: 'den_decor',
    subCategoryName: 'Đèn Ngủ Nghệ Thuật',
    microSpecs: 'Nan đan xen kẽ · Tạo vệt bóng hoa văn trên tường'
  },
  'mw-cn-2050227': {
    cleanTitle: 'Đèn Thiền Zen Garden Phong Cách Tối Giản Bắc Âu',
    archetypeBadge: 'Đế Gỗ Kèm Đèn LED Module',
    badgeTheme: 'slate',
    useCaseEyebrow: 'BÀN THIỀN • GÓC TẬP TRUNG SÂU',
    subCategory: 'den_decor',
    subCategoryName: 'Đèn Ngủ Nghệ Thuật',
    microSpecs: 'Khay cát mini · Đèn thanh LED cảm ứng'
  },
  'mw-cn-1008515': {
    cleanTitle: 'Bình Hoa Túi Giấy Xi Măng Đánh Lừa Thị Giác',
    archetypeBadge: 'Kháng Nước Chống Thấm Tuyệt Đối',
    badgeTheme: 'forest',
    useCaseEyebrow: 'BÀN ĂN & KỆ • TẠO HÌNH TÚI NHĂN',
    subCategory: 'binh_hoa',
    subCategoryName: 'Bình Hoa Thị Giác',
    microSpecs: 'Lõi cắm nước thật · Không ố vàng theo thời gian'
  },
  'mw-cn-2600068': {
    cleanTitle: 'Bình Hoa Ảo Giác Túi Nilon Trong Suốt Phồng Nước',
    archetypeBadge: 'Tạo Khối Nếp Nhăn Trừu Tượng',
    badgeTheme: 'forest',
    useCaseEyebrow: 'QUẦY LỄ TÂN • ĐIỂM NHẤN HIỆN ĐẠI',
    subCategory: 'binh_hoa',
    subCategoryName: 'Bình Hoa Thị Giác',
    microSpecs: 'Nhựa PETG trong mờ · Cắm hoa cành khô & tươi'
  },
  'mw-cn-1151680': {
    cleanTitle: 'Bình Hoa Dáng Túi Vải Mềm Thắt Dây Độc Bản',
    archetypeBadge: 'Chất Liệu Giả Vải Mềm Mại',
    badgeTheme: 'forest',
    useCaseEyebrow: 'BÀN TRÀ • PHONG CÁCH TỐI GIẢN',
    subCategory: 'binh_hoa',
    subCategoryName: 'Bình Hoa Thị Giác',
    microSpecs: 'Miệng túi mở rộng · Thích hợp cành đào/tulip'
  },
  'mw-cn-475316': {
    cleanTitle: 'Bàn Trà Mini Phản Trọng Lực Tensegrity Huyền Bí',
    archetypeBadge: 'Cấu Trúc Tensegrity Vật Lý',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'BÀN LÀM VIỆC • VẬT LÝ BIỂU DIỄN',
    subCategory: 'ban_decor',
    subCategoryName: 'Bàn Trà Tensegrity',
    microSpecs: 'Dây cáp thép cân bằng · Chịu tải đến 1.5kg'
  },

  // Category 3: Do_Choi_Moc_Khoa
  'mw-cn-1702306': {
    cleanTitle: 'Mô Hình Rắn Gary Khớp Động Uốn Lượn 3D',
    archetypeBadge: '✦ Lựa Chọn Tiêu Biểu',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'BÀN LÀM VIỆC • ĐỒ CHƠI KHỚP ĐỘNG',
    subCategory: 'khop_dong',
    subCategoryName: 'Mô Hình Khớp Động',
    microSpecs: 'Print-in-place 28 đốt khớp cử động liền khối'
  },
  'mw-cn-1553726': {
    cleanTitle: 'Mô Hình Chuột Thiên Thần Có Cánh Mini Đáng Yêu',
    archetypeBadge: 'Tạo Hình Nhân Vật Hoạt Hình',
    badgeTheme: 'rose',
    useCaseEyebrow: 'BÀN HỌC & XE HƠI • LINH VẬT MAY MẮN',
    subCategory: 'art_toy',
    subCategoryName: 'Mascot & Art Toy',
    microSpecs: 'Kèm đế hít nam châm · Sơn vẽ chi tiết thủ công'
  },
  'mw-cn-1795991': {
    cleanTitle: 'Đá Cuội Fidget Phím Cơ ASMR Bỏ Túi',
    archetypeBadge: 'Switch Cơ Học Giòn Tan',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'BỎ TÚI • XẢ STRESS KHI HỌP & HỌC',
    subCategory: 'fidget_clicker',
    subCategoryName: 'Phím Bấm Fidget Clicker',
    microSpecs: 'Dáng đá cuội công thái học ôm trọn lòng bàn tay'
  },
  'mw-cn-2370777': {
    cleanTitle: 'Clicker Cơ Học 100% In 3D Liền Khối Không Switch',
    archetypeBadge: '100% Nhựa In Liền Khối',
    badgeTheme: 'forest',
    useCaseEyebrow: 'MÓC CHÌA KHÓA • GIẢI TỎA ÁP LỰC',
    subCategory: 'fidget_clicker',
    subCategoryName: 'Phím Bấm Fidget Clicker',
    microSpecs: 'Lò xo nhựa PLA đàn hồi vĩnh cửu · Độ bền >100.000 lần bấm'
  },
  'mw-cn-2331892': {
    cleanTitle: 'Fidget Kem Ốc Quế Switch Cơ Pastel',
    archetypeBadge: 'Switch Blue Clicky Vui Tai',
    badgeTheme: 'rose',
    useCaseEyebrow: 'TREO BALO • PHỤ KIỆN XINH XẮN',
    subCategory: 'fidget_clicker',
    subCategoryName: 'Phím Bấm Fidget Clicker',
    microSpecs: 'Kèm móc khóa bi kim loại · Phối 2 màu kem ngọt ngào'
  },
  'mw-cn-2415902': {
    cleanTitle: 'Fidget Chim Béo Nhảy Múa Khi Bấm Phím',
    archetypeBadge: 'Cơ Chế Bánh Răng Bật Nhảy',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'BÀN LÀM VIỆC • GÂY CƯỜI XẢ STRESS',
    subCategory: 'fidget_clicker',
    subCategoryName: 'Phím Bấm Fidget Clicker',
    microSpecs: 'Bấm nút chim tự động nhảy và vẫy cánh'
  },
  'mw-cn-1433737': {
    cleanTitle: 'Mèo Con Mini Khớp Động Uốn Lượn Trong Lòng Bàn Tay',
    archetypeBadge: 'Khớp Động Liền Khối In Liền',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'CẦM TAY • THÚ CƯNG ĐỂ BÀN',
    subCategory: 'khop_dong',
    subCategoryName: 'Mô Hình Khớp Động',
    microSpecs: 'Dài 8cm · Đốt sống uốn dẻo như mèo thật'
  },
  'mw-cn-125751': {
    cleanTitle: 'Móc Khóa Gấu Trúc Khớp Cử Động Linh Hoạt',
    archetypeBadge: 'Tay Chân Cử Động Đa Hướng',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'CHÌA KHÓA XE • PHONG CÁCH NĂNG ĐỘNG',
    subCategory: 'moc_khoa',
    subCategoryName: 'Móc Khóa Hoạt Hình',
    microSpecs: 'Nhựa 2 màu đen trắng in liền khối chuẩn xác'
  },
  'mw-cn-704003': {
    cleanTitle: 'Móc Khóa Gundam Mecha Khớp Cử Động Liền Khối',
    archetypeBadge: 'Chi Tiết Cơ Khí Mecha Sắc Nét',
    badgeTheme: 'slate',
    useCaseEyebrow: 'FAN ANIME & MECHA • SƯU TẦM',
    subCategory: 'moc_khoa',
    subCategoryName: 'Móc Khóa Hoạt Hình',
    microSpecs: 'Khớp vai, đầu gối xoay tự do không cần ốc vít'
  },
  'mw-cn-1360122': {
    cleanTitle: 'Bàn Phím Mini Fidget 4 Nút Tháo Rời Keycap',
    archetypeBadge: 'Hỗ Trợ Đổi Keycap Chuẩn Cherry',
    badgeTheme: 'slate',
    useCaseEyebrow: 'BÀN LÀM VIỆC • DÂN CÔNG NGHỆ & DEV',
    subCategory: 'fidget_clicker',
    subCategoryName: 'Phím Bấm Fidget Clicker',
    microSpecs: 'Tặng kèm 4 keycap artisan in 3D phong cách cyberpunk'
  },
  'mw-cn-1753199': {
    cleanTitle: 'Móc Khóa Fidget Quả Bơ Switch Cơ Hạt Tách Rời',
    archetypeBadge: 'Hạt Bơ Nhấn Nảy Đàn Hồi',
    badgeTheme: 'forest',
    useCaseEyebrow: 'TREO TÚI XÁCH • QUÀ TẶNG BẠN THÂN',
    subCategory: 'fidget_clicker',
    subCategoryName: 'Phím Bấm Fidget Clicker',
    microSpecs: 'Vỏ bơ xanh mướt · Hạt bơ xoay tròn và bấm clicky'
  },

  // Category 4: Hop_De_Ban_Tien_Ich
  'mw-cn-2936034': {
    cleanTitle: 'Giá Đỡ Điện Thoại Ghế Sofa Gấu Werwer Phong Cách Retro',
    archetypeBadge: 'Đế Dựng Góc Nghiêng 60° Chuẩn',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'BÀN LÀM VIỆC • XEM PHIM & LIVESTREAM',
    subCategory: 'gia_do_dien_thoai',
    subCategoryName: 'Giá Đỡ Điện Thoại',
    microSpecs: 'Giữ chắc điện thoại dọc/ngang · Đáy chống trượt'
  },
  'mw-cn-2996948': {
    cleanTitle: 'Giỏ Xếp Nếp Origami Co Giãn Đa Năng Xếp Gọn',
    archetypeBadge: 'Co Gọn Bằng 1/3 Kích Thước',
    badgeTheme: 'forest',
    useCaseEyebrow: 'BÀN LÀM VIỆC & PHÒNG KHÁCH • ĐỰNG ĐỒ',
    subCategory: 'hop_xoay',
    subCategoryName: 'Hộp Xoay Đa Tầng',
    microSpecs: 'Chuyển đổi linh hoạt từ đĩa nông sang giỏ sâu'
  },
  'mw-cn-1223355': {
    cleanTitle: 'Ống Cắm Bút Ống Nước Mario Có Ngăn Kéo Bí Mật Ẩn',
    archetypeBadge: 'Ngăn Đáy Kéo Giấu Kín',
    badgeTheme: 'forest',
    useCaseEyebrow: 'BÀN LÀM VIỆC • ĐỰNG BÚT & CỔNG USB',
    subCategory: 'hop_xoay',
    subCategoryName: 'Hộp Xoay Đa Tầng',
    microSpecs: 'Chứa 12 bút · Ngăn kéo dưới cất giữ thẻ nhớ/tiền lẻ'
  },
  'mw-cn-1404920': {
    cleanTitle: 'Hệ Module Ngăn Kéo Xếp Chồng Mini Để Bàn Pork3D',
    archetypeBadge: 'Ngàm Khóa Module Mở Rộng',
    badgeTheme: 'slate',
    useCaseEyebrow: 'BÀN LÀM VIỆC • PHÂN LOẠI LINH KIỆN',
    subCategory: 'hop_xoay',
    subCategoryName: 'Hộp Xoay Đa Tầng',
    microSpecs: 'Xếp chồng không giới hạn chiều cao · Ray trượt mượt mà'
  },
  'mw-cn-1827939': {
    cleanTitle: 'Hộp Xoay 3 Tầng Vòng Tròn Ma Thuật Sakura Mở Bung',
    archetypeBadge: 'Bung 3 Tầng Đồng Thì Khi Xoay',
    badgeTheme: 'rose',
    useCaseEyebrow: 'BÀN LÀM VIỆC • NGHỆ THUẬT CƠ HỌC',
    subCategory: 'co_cau_co_khi',
    subCategoryName: 'Cơ Cấu Bánh Răng & Khẩu Độ',
    microSpecs: 'Cơ cấu dẫn động bánh răng 3 cánh mở xòe 360°'
  },
  'mw-cn-1971424': {
    cleanTitle: 'Hộp Bánh Xe Đu Quay Ferris Xoay Cơ Học Lưu Trữ Mini',
    archetypeBadge: '✦ Lựa Chọn Tiêu Biểu',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'BÀN LÀM VIỆC • ĐU QUAY XOAY 360°',
    subCategory: 'co_cau_co_khi',
    subCategoryName: 'Cơ Cấu Bánh Răng & Khẩu Độ',
    microSpecs: '6 cabin nhỏ đựng kẹp giấy, tẩy, tai nghe · Quay êm ái'
  },
  'mw-cn-181548': {
    cleanTitle: 'Hộp Xoay Đa Tầng Cơ Học Tiện Ích Để Bàn Văn Phòng',
    archetypeBadge: 'Khay Trượt Xoay Quanh Trục',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'BÀN VĂN PHÒNG • GỌN GÀNG DÂY CÁP',
    subCategory: 'hop_xoay',
    subCategoryName: 'Hộp Xoay Đa Tầng',
    microSpecs: '3 tầng chứa đồ dùng văn phòng phẩm riêng biệt'
  },
  'mw-cn-1037659': {
    cleanTitle: 'Kẹp Giữ Cáp Sạc Kiểu Dáng Bậc Thang Chống Rơi Dây',
    archetypeBadge: 'Khe Giữ Cáp 4 Kích Cỡ',
    badgeTheme: 'slate',
    useCaseEyebrow: 'CẠNH BÀN LÀM VIỆC • CỐ ĐỊNH ĐẦU CÁP',
    subCategory: 'kep_cap',
    subCategoryName: 'Kẹp Cáp & Kệ Pegboard',
    microSpecs: 'Kèm băng dính 3M chuyên dụng · Giữ dây Type-C, Lightning'
  },
  'mw-cn-701384': {
    cleanTitle: 'Kẹp Giữ Dây Cáp Bảng Đục Lỗ IKEA Skadis Tối Giản',
    archetypeBadge: 'Tương Thích Chuẩn IKEA Skadis',
    badgeTheme: 'slate',
    useCaseEyebrow: 'BẢNG PEGBOARD • QUẢN LÝ DÂY NGUỒN',
    subCategory: 'kep_cap',
    subCategoryName: 'Kẹp Cáp & Kệ Pegboard',
    microSpecs: 'Chốt cài trực tiếp vào lỗ Skadis không cần ốc vít'
  },
  'mw-cn-176739': {
    cleanTitle: 'Hộp Khẩu Độ Máy Ảnh Cơ Chế Iris Xoay Mở 100% 3D',
    archetypeBadge: 'Cơ Khí Khẩu Độ Ống Kính Iris',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'BÀN LÀM VIỆC • ĐỒ CHƠI KỸ THUẬT',
    subCategory: 'co_cau_co_khi',
    subCategoryName: 'Cơ Cấu Bánh Răng & Khẩu Độ',
    microSpecs: '8 lá chắn cơ học đóng mở mượt mà khi xoay vòng ngoài'
  },
  'mw-cn-1012842': {
    cleanTitle: 'Hộp Mật Mã Xoay Cryptex Da Vinci Giải Đố Cơ Khí',
    archetypeBadge: 'Khóa Cơ Mật Mã 5 Ký Tự',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'QUÀ TẶNG BÍ MẬT • TRÒ CHƠI TRÍ TUỆ',
    subCategory: 'co_cau_co_khi',
    subCategoryName: 'Cơ Cấu Bánh Răng & Khẩu Độ',
    microSpecs: 'Đổi mật mã tùy ý · Lõi rỗng cất giữ nhẫn hoặc thư tay'
  },

  // Category 5: Ca_Nhan_Hoa_NFC
  'mw-cn-951495': {
    cleanTitle: 'Biển Số Đỗ Xe Taplo Cơ Chế Xoay Lật Ẩn Số Riêng Tư',
    archetypeBadge: 'Lật Ẩn Số Khi Không Cần Dùng',
    badgeTheme: 'forest',
    useCaseEyebrow: 'TAPLO Ô TÔ • BẢO MẬT SỐ ĐIỆN THOẠI',
    subCategory: 'bien_do_xe',
    subCategoryName: 'Biển Đỗ Xe Taplo',
    microSpecs: 'PETG Chịu Nhiệt Taplo 80°C · 6 dãy số từ tính tự gắn'
  },
  'mw-cn-2206348': {
    cleanTitle: 'Biển Đỗ Xe Ô Tô Cử Chỉ Tay Số Thể Thao Nổi Bật',
    archetypeBadge: 'Biểu Tượng Bàn Tay Năng Động',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'TAPLO Ô TÔ • CÁ TÍNH & HIỆN ĐẠI',
    subCategory: 'bien_do_xe',
    subCategoryName: 'Biển Đỗ Xe Taplo',
    microSpecs: 'Khay cắm số nổi 3D sắc nét · Chịu nắng hè không cong vênh'
  },
  'mw-cn-2719031': {
    cleanTitle: 'Thẻ Đỗ Xe Ô Tô Oval Góc Nghiêng 45° Tối Giản Kính Lái',
    archetypeBadge: 'Góc Nhìn Nghiêng Công Thái Học',
    badgeTheme: 'slate',
    useCaseEyebrow: 'KÍNH LÁI Ô TÔ • THIẾT KẾ SLIM TỐI GIẢN',
    subCategory: 'bien_do_xe',
    subCategoryName: 'Biển Đỗ Xe Taplo',
    microSpecs: 'Độ mỏng chỉ 4mm · Không cản trở tầm nhìn kính chắn gió'
  },
  'mw-cn-3060338': {
    cleanTitle: 'Biển Đỗ Xe Bồ Hóng Hoạt Hình Đổi Số Trang Trí Taplo',
    archetypeBadge: 'Mascot Bồ Hóng Đáng Yêu',
    badgeTheme: 'espresso',
    useCaseEyebrow: 'TAPLO Ô TÔ • DECOR DỄ THƯƠNG',
    subCategory: 'bien_do_xe',
    subCategoryName: 'Biển Đỗ Xe Taplo',
    microSpecs: 'Mắt tròn liếc linh hoạt · Bảng số rời dễ thay đổi'
  },
  'mw-cn-2808063': {
    cleanTitle: 'Biển Số Xe Bàn Phím Bấm Switch Cơ Học Clicky Độc Lạ',
    archetypeBadge: 'Bấm Phím Cơ Đổi Số Độc Bản',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'TAPLO Ô TÔ • DÂN MÊ PHÍM CƠ',
    subCategory: 'bien_do_xe',
    subCategoryName: 'Biển Đỗ Xe Taplo',
    microSpecs: '11 switch bấm nảy tanh tách · Chịu nhiệt độ cao trong cabin'
  },
  'mw-cn-1769352': {
    cleanTitle: 'Biển Mã QR Quầy Thu Ngân Thẻ Trượt Chuyển Khoản Nhanh',
    archetypeBadge: 'Quét QR Ngân Hàng Kép',
    badgeTheme: 'slate',
    useCaseEyebrow: 'QUẦY THU NGÂN • QUÁN CAFE & SHOP',
    subCategory: 'standee_qr_nfc',
    subCategoryName: 'Standee QR & NFC',
    microSpecs: 'Mã QR in nổi sắc nét bằng công nghệ in vi đa sắc'
  },
  'mw-cn-694992': {
    cleanTitle: 'Biển Đứng Mã QR Thanh Toán Gấp Gọn Quầy Cafe Vỉa Hè',
    archetypeBadge: 'Gấp Gọn Bỏ Túi Tiện Lợi',
    badgeTheme: 'slate',
    useCaseEyebrow: 'QUÁN TAKE-AWAY • DI CHUYỂN LINH HOẠT',
    subCategory: 'standee_qr_nfc',
    subCategoryName: 'Standee QR & NFC',
    microSpecs: 'Chân đế gập phẳng · Kháng nước mưa gió ngoài trời'
  },
  'mw-cn-558306': {
    cleanTitle: 'Standee Biển Đứng Logo 3D Đa Tầng Kèm Mã QR Mạng Xã Hội',
    archetypeBadge: 'Đúc Logo Nổi 3D Sống Động',
    badgeTheme: 'terracotta',
    useCaseEyebrow: 'CỬA HÀNG & TIỆM NAIL • QUẢNG BÁ THƯƠNG HIỆU',
    subCategory: 'standee_qr_nfc',
    subCategoryName: 'Standee QR & NFC',
    microSpecs: 'Tùy biến Logo thương hiệu + 2 mã QR thanh toán/Instagram'
  },
  'mw-cn-939925': {
    cleanTitle: 'Móc Khóa Đĩa Than Vinyl Gắn Chip NFC Quét Nhạc Spotify',
    archetypeBadge: 'Chạm NFC 1-Chạm Mở Bài Hát',
    badgeTheme: 'slate',
    useCaseEyebrow: 'MÓC CHÌA KHÓA • QUÀ TẶNG KỶ NIỆM',
    subCategory: 'the_ten',
    subCategoryName: 'Thẻ Tên & Móc Khóa NFC',
    microSpecs: 'Tích hợp chip NTAG215 chống nước · Chạm vào tự phát playlist'
  },
  'mw-cn-1836100': {
    cleanTitle: 'Đèn Tranh Thấu Quang Lithophane Ngọn Núi Vàng Phong Thủy',
    archetypeBadge: '✦ Lựa Chọn Tiêu Biểu',
    badgeTheme: 'amber',
    useCaseEyebrow: 'BÀN LÀM VIỆC • TRANH THẤU QUANG 3D',
    subCategory: 'standee_qr_nfc',
    subCategoryName: 'Standee QR & NFC',
    microSpecs: 'Bật đèn hiện ảnh núi vàng rực rỡ · Tùy biến ảnh cá nhân theo yêu cầu'
  },
  'mw-cn-1147539': {
    cleanTitle: 'Biển Tên Chức Danh Để Bàn Texture Cao Cấp Khắc Chữ',
    archetypeBadge: 'Khắc Tên Nổi 3D Tùy Biến',
    badgeTheme: 'espresso',
    useCaseEyebrow: 'BÀN LÀM VIỆC • CHỨC DANH & TÊN RIÊNG',
    subCategory: 'the_ten',
    subCategoryName: 'Thẻ Tên & Móc Khóa NFC',
    microSpecs: 'Xem trước chữ 2D trực quan · Khắc tên, slogan, phòng ban'
  }
};

let updatedCount = 0;
products.forEach(p => {
  const tax = TAXONOMY_MAP[p.id];
  if (tax) {
    p.cleanTitle = tax.cleanTitle;
    p.archetypeBadge = tax.archetypeBadge;
    p.badge = tax.archetypeBadge; // Update default badge
    p.badgeTheme = tax.badgeTheme;
    p.useCaseEyebrow = tax.useCaseEyebrow;
    p.subCategory = tax.subCategory;
    p.subCategoryName = tax.subCategoryName;
    p.microSpecs = tax.microSpecs;
    updatedCount++;
  }
});

console.log(`Updated ${updatedCount} / ${products.length} products with sharp differentiation taxonomy.`);
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
console.log('Saved updated products.json successfully.');
