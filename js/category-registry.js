/**
 * T&T 3D Labs - Central Category Registry
 * Generated from data/category-registry.json
 * Single Source of Truth for Storefront, Router, and Admin
 */
(function (window) {
  'use strict';

  const CATEGORY_REGISTRY = {
    Trang_Diem_Vanity: {
      id: 'Trang_Diem_Vanity',
      name: 'Trang Điểm & Nơ Lụa',
      shortName: 'Trang Điểm & Nơ Lụa',
      title: 'Hộp Đựng Đồ Trang Điểm, Cọ Mỹ Phẩm & Trang Sức Lụa Thắt Nơ',
      heroId: 'mw-cn-1646129',
      desc: 'Ống cắm cọ Coquette, khay son nơ lụa, giá treo trang sức ribbon sang trọng.',
      accentColor: '#E11D48',
      accentBg: '#FFF1F2',
      icon: 'fa-wand-magic-sparkles',
      badgeText: '✦ Coquette Chic'
    },
    Decor_Den_Noi_That: {
      id: 'Decor_Den_Noi_That',
      name: 'Decor & Đèn Nội Thất',
      shortName: 'Decor & Đèn',
      title: 'Đèn Ngủ Nghệ Thuật, Bình Hoa Đánh Lừa Thị Giác & Tượng Decor',
      heroId: 'mw-cn-1438306',
      desc: 'Đèn ngủ nấm phát quang, bình hoa xếp nếp spiral, tranh phù điêu nghệ thuật.',
      accentColor: '#D97706',
      accentBg: '#FEF3C7',
      icon: 'fa-lightbulb',
      badgeText: '✦ Ambient Craft'
    },
    Do_Choi_Moc_Khoa: {
      id: 'Do_Choi_Moc_Khoa',
      name: 'Móc Khóa & Art Toy',
      shortName: 'Đồ Chơi & Móc Khóa',
      title: 'Đồ Chơi Khớp Động, Móc Khóa Hoạt Hình & Fidget Xả Stress',
      heroId: 'mw-cn-1702306',
      desc: 'Rồng khớp xoay flexi, móc khóa capybara đùn mông, fidget spinner giải tỏa stress.',
      accentColor: '#0284C7',
      accentBg: '#E0F2FE',
      icon: 'fa-gamepad',
      badgeText: '✦ Viral Fidget'
    },
    Hop_De_Ban_Tien_Ich: {
      id: 'Hop_De_Ban_Tien_Ich',
      name: 'Hộp Để Bàn & Tiện Ích',
      shortName: 'Hộp Bàn & Bánh Răng',
      title: 'Hộp Để Bàn Thông Minh, Cơ Cấu Bánh Răng & Tiện Ích Đa Năng',
      heroId: 'mw-cn-1971424',
      desc: 'Hộp ngăn kéo module mini, kệ pegboard xoay, khay cắm bút vát góc công thái học.',
      accentColor: '#16A34A',
      accentBg: '#DCFCE7',
      icon: 'fa-gears',
      badgeText: '✦ Mechanical Desk'
    },
    Ca_Nhan_Hoa_NFC: {
      id: 'Ca_Nhan_Hoa_NFC',
      name: 'Cá Nhân Hóa & NFC',
      shortName: 'Cá Nhân Hóa & NFC',
      title: 'Sản Phẩm Cá Nhân Hóa, Biển Số Xe, Mã QR & Móc Khóa NFC',
      heroId: 'mw-cn-1836100',
      desc: 'Bảng số điện thoại ô tô tạm thời, biển tên đèn LED để bàn, móc khóa khắc tên 3D.',
      accentColor: '#7C3AED',
      accentBg: '#F3E8FF',
      icon: 'fa-fingerprint',
      badgeText: '✦ Smart Custom'
    }
  };

  window.TTCategoryRegistry = CATEGORY_REGISTRY;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CATEGORY_REGISTRY;
  }
})(typeof window !== 'undefined' ? window : globalThis);
