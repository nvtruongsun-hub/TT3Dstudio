/**
 * T&T 3D Studio - Visual 3-Step Configurator & Pricing Engine
 * Benchmark: Craftcloud / PCBWay Visual E-Commerce Standards
 * (Sheet 3: ID-23, ID-24, ID-25)
 */

(function () {
  'use strict';

  // Configurator State
  let configStep1Choice = 'upload'; // 'upload' | 'idea'
  let uploadedFileMeta = null;
  let selectedMaterial = 'pla_matte';
  let selectedInfill = '15'; // 15 | 40 | 100
  let currentQty = 1;
  let estimatedWeight = 75; // in grams

  // Material Database (Benchmark Rates from Central Config)
  const MATERIALS = {
    pla_matte: {
      id: 'pla_matte',
      name: 'Bio-PLA Matte',
      badge: 'Thân thiện môi trường',
      ratePerGram: 1200,
      desc: 'Bề mặt mờ mịn cao cấp, không bám vân tay, độ sắc nét cao, lý tưởng cho đồ decor & khay kệ.',
      image: 'assets/images/product-pleated-vase.jpg',
      tag: 'Phổ biến nhất'
    },
    petg_water: {
      id: 'petg_water',
      name: 'PETG Kỹ Thuật Kín Nước',
      badge: 'Kháng UV & Kín Nước',
      ratePerGram: 1500,
      desc: 'Dẻo dai chịu va đập, kháng tia UV ngoài trời, kín nước tuyệt đối cho bình hoa & chi tiết kỹ thuật.',
      image: 'assets/images/eng-parts.jpg',
      tag: 'Bền cơ học'
    },
    resin_8k: {
      id: 'resin_8k',
      name: 'Resin SLA 8K Siêu Nét',
      badge: 'Độ phân giải 0.05mm',
      ratePerGram: 2400,
      desc: 'Công nghệ quang trùng hợp độ nét siêu vi, bề mặt láng bóng không thấy vân in, thích hợp cho mô hình figure & trang sức.',
      image: 'assets/images/resin-figure.jpg',
      tag: 'Siêu chi tiết'
    }
  };

  const INFILL_FACTORS = {
    '15': { label: '15% - Tiêu chuẩn Decor', factor: 1.0 },
    '40': { label: '40% - Gia cường Chịu lực', factor: 1.35 },
    '100': { label: '100% - Đặc nguyên khối', factor: 2.1 }
  };

  function formatMoney(amount) {
    const num = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/\D/g, '')) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
  }

  function calculateConfigurator() {
    const mat = MATERIALS[selectedMaterial] || MATERIALS.pla_matte;
    const infillFactor = INFILL_FACTORS[selectedInfill]?.factor || 1.0;

    // Weight estimate based on upload or standard
    let weight = estimatedWeight;
    if (uploadedFileMeta) {
      const mb = uploadedFileMeta.size / (1024 * 1024);
      weight = Math.max(30, Math.min(650, Math.round(mb * 24 + 35)));
    }

    // Material cost + Machine fixed fee
    const rawCost = weight * mat.ratePerGram * infillFactor;
    const machineFee = 25000;
    const baseUnitPrice = Math.round((rawCost + machineFee) / 1000) * 1000;

    // Volume discount tiers (ID-24)
    let discountPercent = 0;
    let discountBadgeText = '';

    if (currentQty >= 30) {
      discountPercent = 25;
      discountBadgeText = '🎉 Tiết kiệm 25% • Tặng mẫu thử (Sample) & Freeship toàn quốc';
    } else if (currentQty >= 10) {
      discountPercent = 15;
      discountBadgeText = '🎉 Tiết kiệm 15% • Miễn phí nạp chip NFC & In logo thương hiệu';
    } else if (currentQty >= 5) {
      discountPercent = 8;
      discountBadgeText = '🎉 Tiết kiệm 8% khi đặt theo combo';
    }

    const subtotal = baseUnitPrice * currentQty;
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const totalPrice = subtotal - discountAmount;
    const finalUnitPrice = Math.round(totalPrice / currentQty);

    // Update UI elements
    const elTotalPrice = document.getElementById('config-total-price');
    const elUnitPrice = document.getElementById('config-unit-price');
    const elSubtotal = document.getElementById('config-subtotal');
    const elDiscountBadge = document.getElementById('config-discount-badge');
    const elDiscountAmt = document.getElementById('config-discount-amt');
    const elWeightSummary = document.getElementById('config-weight-summary');

    if (elTotalPrice) elTotalPrice.textContent = formatMoney(totalPrice);
    if (elUnitPrice) elUnitPrice.textContent = `${formatMoney(finalUnitPrice)}/chiếc`;
    if (elSubtotal) elSubtotal.textContent = formatMoney(subtotal);

    if (elDiscountAmt) {
      elDiscountAmt.textContent = discountAmount > 0 ? `-${formatMoney(discountAmount)}` : '0 đ';
    }

    if (elDiscountBadge) {
      if (discountBadgeText) {
        elDiscountBadge.textContent = discountBadgeText;
        elDiscountBadge.classList.remove('hidden');
      } else {
        elDiscountBadge.classList.add('hidden');
      }
    }

    if (elWeightSummary) {
      elWeightSummary.textContent = `~${weight * currentQty}g (${currentQty} chiếc • ${mat.name})`;
    }

    return {
      material: mat,
      weight,
      infill: INFILL_FACTORS[selectedInfill]?.label,
      qty: currentQty,
      unitPrice: finalUnitPrice,
      totalPrice,
      discountPercent,
      fileName: uploadedFileMeta ? uploadedFileMeta.name : (configStep1Choice === 'idea' ? 'Gửi ảnh ý tưởng qua Zalo' : 'Chưa đính kèm file')
    };
  }

  // Set Step 1 Choice (Upload vs Idea)
  window.setConfigStep1 = function (choice) {
    configStep1Choice = choice;
    const uploadBox = document.getElementById('config-upload-box');
    const ideaBox = document.getElementById('config-idea-box');
    const btnUpload = document.getElementById('config-btn-tab-upload');
    const btnIdea = document.getElementById('config-btn-tab-idea');

    if (choice === 'upload') {
      if (uploadBox) uploadBox.classList.remove('hidden');
      if (ideaBox) ideaBox.classList.add('hidden');
      if (btnUpload) {
        btnUpload.classList.add('active');
        btnUpload.classList.remove('text-secondary-color');
      }
      if (btnIdea) {
        btnIdea.classList.remove('active');
        btnIdea.classList.add('text-secondary-color');
      }
    } else {
      if (uploadBox) uploadBox.classList.add('hidden');
      if (ideaBox) ideaBox.classList.remove('hidden');
      if (btnIdea) {
        btnIdea.classList.add('active');
        btnIdea.classList.remove('text-secondary-color');
      }
      if (btnUpload) {
        btnUpload.classList.remove('active');
        btnUpload.classList.add('text-secondary-color');
      }
    }
    calculateConfigurator();
  };

  // Set Step 2 Material
  window.selectConfigMaterial = function (matKey) {
    selectedMaterial = matKey;
    document.querySelectorAll('.config-mat-card').forEach(card => {
      if (card.dataset.matKey === matKey) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
    calculateConfigurator();
  };

  // Set Step 2 Infill
  window.selectConfigInfill = function (infillKey, btn) {
    selectedInfill = infillKey;
    document.querySelectorAll('.config-infill-btn').forEach(b => {
      b.classList.remove('border-[#FF5C00]', 'bg-[rgba(255,92,0,0.12)]', 'text-primary-color');
      b.classList.add('border-[var(--border-subtle)]', 'bg-[var(--bg-surface-elevated)]', 'text-secondary-color');
    });
    btn.classList.add('border-[#FF5C00]', 'bg-[rgba(255,92,0,0.12)]', 'text-primary-color');
    btn.classList.remove('border-[var(--border-subtle)]', 'bg-[var(--bg-surface-elevated)]', 'text-secondary-color');
    calculateConfigurator();
  };

  // Set Step 3 Quantity
  window.onConfigQtyChange = function (val) {
    currentQty = Math.max(1, parseInt(val) || 1);
    const rangeInput = document.getElementById('config-qty-slider');
    const numberInput = document.getElementById('config-qty-input');

    if (rangeInput) rangeInput.value = Math.min(100, currentQty);
    if (numberInput) numberInput.value = currentQty;

    calculateConfigurator();
  };

  // Send Direct Zalo Quote with Prefilled Structured Data (ID-25)
  window.sendZaloConfigQuote = function () {
    const data = calculateConfigurator();
    const notesInput = document.getElementById('config-custom-notes');
    const customNotes = notesInput ? notesInput.value.trim() : 'Không';

    const message = `🔥 YÊU CẦU BÁO GIÁ IN 3D - T&T 3D STUDIO 🔥
----------------------------------------
- Hình thức: ${configStep1Choice === 'upload' ? 'Đã có file 3D (' + data.fileName + ')' : 'Chưa có file (Gửi ảnh ý tưởng để xưởng dựng CAD)'}
- Vật liệu chọn: ${data.material.name}
- Độ đặc (Infill): ${data.infill}
- Số lượng: ${data.qty} chiếc
- Khối lượng ước tính: ~${data.weight * data.qty}g
- Đơn giá tạm tính: ${formatMoney(data.unitPrice)}/chiếc
${data.discountPercent > 0 ? `- Ưu đãi: Giảm ${data.discountPercent}%\n` : ''}👉 TỔNG TIỀN DỰ KIẾN: ${formatMoney(data.totalPrice)}
- Ghi chú: ${customNotes}
----------------------------------------
Xin chào Kỹ thuật viên T&T 3D Studio, mình muốn kiểm tra file và nhận báo giá chính xác!`;

    const cleanZalo = '0986888333';
    window.open(`https://zalo.me/${cleanZalo}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Add Custom 3D Print Service directly to Cart
  window.addConfigQuoteToCart = function () {
    const data = calculateConfigurator();
    const cleanFileName = (data.fileName || 'custom').replace(/[^a-zA-Z0-9_-]/g, '_');
    const cartItem = {
      id: `print-quote-${data.material.id}-${selectedInfill}-${cleanFileName}`,
      title: `Gia Công In 3D: ${data.fileName}`,
      price: data.unitPrice,
      qty: data.qty,
      image: data.material.image,
      category: 'custom-print',
      color: { id: 'custom', name: 'Mặc định xưởng', hex: '#26282B' },
      material: { id: data.material.id, name: data.material.name, label: data.material.name },
      customText: `Infill: ${data.infill}`,
      specs: {
        dimensions: 'Theo file thiết kế',
        weight: `~${data.weight}g / chiếc`,
        layer: '0.16mm - 0.20mm',
        warranty: 'Đổi mới 1-1 nếu lỗi in'
      }
    };

    if (window.TTStore && typeof window.TTStore.addToCart === 'function') {
      window.TTStore.addToCart(cartItem);
      if (window.TTCart && typeof window.TTCart.openCart === 'function') {
        window.TTCart.openCart();
      }
      if (window.showToast) {
        window.showToast(`Đã thêm dịch vụ in ${data.qty} sản phẩm vào giỏ hàng!`);
      }
    }
  };

  // Handle Drag & Drop File Upload
  function initFileUpload() {
    const fileInput = document.getElementById('config-file-input');
    const dropzone = document.getElementById('config-dropzone');
    const filePreview = document.getElementById('config-file-preview');
    const fileNameEl = document.getElementById('config-file-name');
    const fileSizeEl = document.getElementById('config-file-size');
    const btnRemove = document.getElementById('config-remove-file-btn');

    if (!fileInput || !dropzone) return;

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleSelectedFile(file);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('border-[#FF5C00]');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-[#FF5C00]');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt.files[0];
      if (file) handleSelectedFile(file);
    });

    if (btnRemove) {
      btnRemove.addEventListener('click', () => {
        uploadedFileMeta = null;
        fileInput.value = '';
        if (filePreview) filePreview.classList.add('hidden');
        dropzone.classList.remove('hidden');
        calculateConfigurator();
      });
    }

    function handleSelectedFile(file) {
      uploadedFileMeta = file;
      if (fileNameEl) fileNameEl.textContent = file.name;
      if (fileSizeEl) fileSizeEl.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB • Sẵn sàng tính giá`;
      if (filePreview) filePreview.classList.remove('hidden');
      dropzone.classList.add('hidden');
      calculateConfigurator();
      if (window.showToast) {
        window.showToast(`Đã tải lên: ${file.name}`);
      }
    }
  }

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initFileUpload();
    calculateConfigurator();
  });

})();
