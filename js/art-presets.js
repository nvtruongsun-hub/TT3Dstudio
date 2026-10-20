/**
 * T&T 3D Labs - Curated Art Presets & Studio Editorial Gallery
 * Thư viện hình ảnh sản phẩm phong cách nghệ thuật tối giản (Tactile Minimalism / Editorial Studio)
 * Cung cấp cho Admin và Client các lựa chọn visual cao cấp
 */

(function (window) {
  'use strict';

  const ART_PRESETS = [
    {
      id: 'art-nfc-01',
      name: 'Đế WiFi NFC Studio Dark (Chữ Ký)',
      category: 'smart-nfc',
      image: 'assets/images/product-nfc-wifi.jpg',
      alt: 'Đế WiFi 1 chạm thông minh studio lighting trên bàn gỗ sồi tối giản',
      badge: '⚡ Chữ Ký Studio',
      description: 'Góc chụp nghiêng 45 độ làm nổi bật bề mặt mờ nhám Bio-PLA và biểu tượng WiFi sắc nét'
    },
    {
      id: 'art-nfc-02',
      name: 'Thẻ Chạm NFC Minimalist Card',
      category: 'smart-nfc',
      image: 'assets/images/product-nfc-card.jpg',
      alt: 'Thẻ NFC thông minh để bàn phong cách danh thiếp số công nghệ',
      badge: '⚡ Card Edition',
      description: 'Thiết kế dạng phẳng siêu mỏng 3mm, phong cách Bauhaus tối giản cho quầy thu ngân'
    },
    {
      id: 'art-vase-01',
      name: 'Bình Hoa Origami Đất Nung Terracotta',
      category: 'decor-light',
      image: 'assets/images/product-pleated-vase.jpg',
      alt: 'Bình hoa dập ly Origami kín nước màu cam đất nung phong cách Bắc Âu',
      badge: '💧 Watertight Studio',
      description: 'Nếp gấp đa giác sắc sảo, cắm hoa tươi nghệ thuật với hiệu ứng ánh sáng tự nhiên dịu êm'
    },
    {
      id: 'art-dock-01',
      name: 'Khay Kệ Desk Dock 5-trong-1 Editorial',
      category: 'desk-setup',
      image: 'assets/images/product-desk-dock.jpg',
      alt: 'Khay kệ tổ chức bàn làm việc đa năng 5-in-1 màu đen than chì',
      badge: '📐 Ergonomic Dock',
      description: 'Góc chụp bàn làm việc tối giản chuẩn Pinterest, phối cùng phụ kiện công nghệ cao cấp'
    },
    {
      id: 'art-lamp-01',
      name: 'Đèn Xoắn Kem Swirl Soft-Serve Warm Glow',
      category: 'decor-light',
      image: 'assets/images/product-soft-serve-lamp.jpg',
      alt: 'Đèn xoắn kem phong cách Crème Atelier Pháp ánh sáng vàng ấm 3000K',
      badge: '✨ Warm Ambient',
      description: 'Chụp trong không gian tối dịu nhẹ làm nổi bật đường vân xoắn ốc tán xạ ánh sáng xuyên thấu'
    },
    {
      id: 'art-pegboard-01',
      name: 'Hệ Bảng Pegboard Hexa Modular',
      category: 'desk-setup',
      image: 'assets/images/product-pegboard.jpg',
      alt: 'Bảng pegboard lục giác treo tường module phối màu xám xi măng và trắng',
      badge: '🧩 Modular Wall',
      description: 'Góc chụp tường tối giản hiện đại trưng bày móc khóa nam châm và khay đựng công nghệ'
    },
    {
      id: 'art-monogram-01',
      name: 'Bảng Chữ Monogram Typo 3D Signature',
      category: 'desk-setup',
      image: 'assets/images/product-monogram.jpg',
      alt: 'Bảng tên chữ cái in 3D Typography nổi 2 màu tương phản',
      badge: '🎁 Custom Monogram',
      description: 'Chữ nổi typography sắc nét với chân đế đầm chắc, quà tặng độc bản cá nhân hóa'
    },
    {
      id: 'art-eng-01',
      name: 'Chi Tiết Kỹ Thuật Độ Chính Xác Cao (Macro)',
      category: 'industrial',
      image: 'assets/images/eng-parts.jpg',
      alt: 'Chi tiết cơ khí in 3D kỹ thuật chuẩn lớp in 0.16mm sắc nét',
      badge: '⚙️ Precision Macro',
      description: 'Ảnh chụp macro siêu cận cảnh chứng minh dung sai ±0.1mm của dàn máy in Bambu Lab'
    },
    {
      id: 'art-archi-01',
      name: 'Mô Hình Kiến Trúc Tối Giản',
      category: 'industrial',
      image: 'assets/images/archi-model.jpg',
      alt: 'Mô hình khối kiến trúc in 3D màu trắng ngà tối giản',
      badge: '🏛️ Architectural',
      description: 'Đường nét hình khối thanh thoát, thể hiện tính ứng dụng cao cho thiết kế không gian'
    }
  ];

  window.TTArtPresets = {
    getAll: () => ART_PRESETS,
    getById: (id) => ART_PRESETS.find(p => p.id === id) || null,
    getByCategory: (cat) => cat === 'all' ? ART_PRESETS : ART_PRESETS.filter(p => p.category === cat)
  };

})(window);
