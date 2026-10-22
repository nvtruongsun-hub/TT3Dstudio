/**
 * T&T 3D Labs - 2D Personalization Studio Controller
 * Enables interactive 2D text, color, and font live preview on custom 3D products.
 */

(function (window) {
  'use strict';

  const CUSTOM_PRODUCTS = [
    {
      id: 'mw-cn-2084928',
      title: 'Khay Trang Sức Nơ Lụa Sweet Silk',
      category: 'Trang_Diem_Vanity',
      price: 139000,
      image: 'assets/images/products/thumb_2084928.png',
      headlineBenefit: 'Khắc tên riêng hoặc ngày kỷ niệm lên nếp lụa thắt nơ.',
      defaultText: 'Trường & Lan',
      colors: [
        { id: 'silk_pastel_pink', name: 'Hồng Lụa Pastel', hex: '#F7C6D0' },
        { id: 'silk_pearl_white', name: 'Trắng Ngọc Trai', hex: '#F5F2EB' },
        { id: 'silk_champagne', name: 'Vàng Champagne', hex: '#EED9A7' },
        { id: 'silk_matte_black', name: 'Đen Obsidian', hex: '#26282B' }
      ]
    },
    {
      id: 'mw-cn-1836100',
      title: 'Đế WiFi NFC 1 Chạm TapConnect',
      category: 'Ca_Nhan_Hoa_NFC',
      price: 109000,
      image: 'assets/images/product-nfc-wifi.jpg',
      headlineBenefit: 'In tên quán cafe hoặc logo, chạm lưng điện thoại tự vào WiFi.',
      defaultText: 'WiFi: Kafe_5G • 8888',
      colors: [
        { id: 'wood_vintage', name: 'Gỗ Vintage Sồi', hex: '#8C6239' },
        { id: 'matte_black', name: 'Đen Nhám Obsidian', hex: '#20231F' },
        { id: 'nordic_white', name: 'Trắng Sứ Bắc Âu', hex: '#F7F6F2' },
        { id: 'craft_orange', name: 'Cam Craft T&T', hex: '#FF5C00' }
      ]
    },
    {
      id: 'mw-cn-1971424',
      title: 'Hộp Để Bàn & Bảng Tên Khắc Chữ',
      category: 'Hop_De_Ban_Tien_Ich',
      price: 149000,
      image: 'assets/images/products/thumb_1971424.png',
      headlineBenefit: 'Bảng tên chức danh để bàn làm việc in nổi 3D sắc sảo.',
      defaultText: 'NGUYỄN VĂN TRƯỜNG',
      colors: [
        { id: 'slate_black', name: 'Đen Khói Than Chì', hex: '#22252A' },
        { id: 'pearl_white', name: 'Trắng Tuyết', hex: '#F8F9FA' },
        { id: 'safety_orange', name: 'Cam Công Nghệ', hex: '#FF5C00' }
      ]
    },
    {
      id: 'mw-cn-1702306',
      title: 'Móc Khóa Monogram Khắc Tên 3D',
      category: 'Do_Choi_Moc_Khoa',
      price: 89000,
      image: 'assets/images/product-monogram.jpg',
      headlineBenefit: 'Móc chìa khóa, balo in chữ lồng 3D cá tính chống thất lạc.',
      defaultText: 'MINH ANH',
      colors: [
        { id: 'craft_orange', name: 'Cam Signature', hex: '#FF5C00' },
        { id: 'cyan_blue', name: 'Xanh Mint Pastel', hex: '#6EE7B7' },
        { id: 'neon_pink', name: 'Hồng Phấn', hex: '#F472B6' },
        { id: 'obsidian', name: 'Đen Huyền', hex: '#18181B' }
      ]
    }
  ];

  let selectedProduct = CUSTOM_PRODUCTS[0];
  let selectedColor = selectedProduct.colors[0];
  let selectedFont = 'sans'; // 'serif', 'sans', 'script'
  let customText = selectedProduct.defaultText;

  function renderPersonalizeUI() {
    const root = document.getElementById('personalize-studio-container');
    if (!root) return;

    root.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left: Live 2D Canvas & Spec Card (7 cols) -->
        <div class="lg:col-span-7 space-y-6">
          <div class="personalize-canvas-box p-6 sm:p-8 flex flex-col items-center justify-center relative min-h-[380px] sm:min-h-[440px]">
            
            <!-- Live Preview Badge -->
            <div class="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-xs font-semibold shadow-sm">
              <span class="w-2 h-2 rounded-full bg-[#FF5C00] animate-pulse"></span>
              <span>Minh Họa Chữ &amp; Màu 2D</span>
            </div>

            <div class="absolute top-4 right-4 z-10">
              <span class="text-xs font-mono font-bold text-[#FF5C00] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                Duyệt demo trước khi in
              </span>
            </div>

            <!-- Canvas Element -->
            <canvas id="personalize-preview-canvas" width="600" height="420" class="max-w-full h-auto rounded-xl shadow-md border border-slate-100"></canvas>

            <p class="text-[11px] text-slate-400 font-mono mt-4 text-center">
              ✦ Mô phỏng hiệu ứng in nổi 3D lớp mịn 0.16mm. Kỹ thuật viên sẽ gửi bản render chính xác qua Zalo trước khi chạy máy.
            </p>
          </div>

          <!-- Product Specs & Guarantees -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 rounded-2xl bg-white border border-[#DCDDD5] space-y-1">
              <div class="text-xs font-bold text-[#20231F] flex items-center gap-1.5">
                <i class="fa-solid fa-layer-group text-[#FF5C00]"></i>
                <span>Chữ Nổi Liền Khối</span>
              </div>
              <p class="text-[11px] text-[#586057]">Không dán decal, in nổi liền khối từ phôi nhựa sinh học.</p>
            </div>
            <div class="p-4 rounded-2xl bg-white border border-[#DCDDD5] space-y-1">
              <div class="text-xs font-bold text-[#20231F] flex items-center gap-1.5">
                <i class="fa-solid fa-palette text-[#FF5C00]"></i>
                <span>Màu Đúc Nguyên Sinh</span>
              </div>
              <p class="text-[11px] text-[#586057]">Hạt nhựa bóng mịn, không phai màu hay bong tróc khi cọ rửa.</p>
            </div>
            <div class="p-4 rounded-2xl bg-white border border-[#DCDDD5] space-y-1">
              <div class="text-xs font-bold text-[#20231F] flex items-center gap-1.5">
                <i class="fa-solid fa-clock-rotate-left text-[#FF5C00]"></i>
                <span>Làm Nhanh 24H</span>
              </div>
              <p class="text-[11px] text-[#586057]">Xác nhận mẫu sáng, chiều lên dàn máy in, gửi ngay ngày hôm sau.</p>
            </div>
          </div>
        </div>

        <!-- Right: Customization Controls (5 cols) -->
        <div class="lg:col-span-5 bg-white border border-[#DCDDD5] rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
          
          <!-- Step 1: Select Model -->
          <div class="space-y-2.5">
            <label class="text-xs font-bold uppercase tracking-wider text-[#20231F] flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-[#FF5C00] text-white flex items-center justify-center text-[10px]">1</span>
              <span>Chọn Mẫu Cần Cá Nhân Hóa:</span>
            </label>
            <div class="grid grid-cols-2 gap-2" id="personalize-product-selector">
              ${CUSTOM_PRODUCTS.map((prod, idx) => `
                <button type="button" 
                        data-prod-idx="${idx}"
                        class="personalize-model-btn p-3 rounded-2xl border text-left transition-all ${prod.id === selectedProduct.id ? 'border-[#FF5C00] bg-orange-50/60 ring-2 ring-[#FF5C00]/20' : 'border-[#DCDDD5] hover:border-slate-400 bg-white'}">
                  <div class="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-slate-50">
                    <img src="${prod.image}" alt="${prod.title}" class="w-full h-full object-cover">
                  </div>
                  <div class="text-xs font-bold text-[#20231F] line-clamp-1">${prod.title}</div>
                  <div class="text-[11px] font-mono font-bold text-[#FF5C00] mt-0.5">${prod.price.toLocaleString('vi-VN')} đ</div>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Step 2: Custom Text -->
          <div class="space-y-2.5">
            <label for="personalize-text-input" class="text-xs font-bold uppercase tracking-wider text-[#20231F] flex items-center justify-between">
              <span class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-[#FF5C00] text-white flex items-center justify-center text-[10px]">2</span>
                <span>Nội Dung Khắc / In Nổi:</span>
              </span>
              <span id="personalize-char-count" class="text-[11px] font-mono text-[#586057]">0/40 ký tự</span>
            </label>
            <input type="text" 
                   id="personalize-text-input" 
                   maxlength="40" 
                   value="${escapeHtml(customText)}"
                   placeholder="Nhập tên, ngày kỷ niệm hoặc WiFi quán..." 
                   class="w-full px-4 py-3 rounded-2xl border border-[#DCDDD5] focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 text-sm font-medium text-[#20231F] outline-none transition-all">
          </div>

          <!-- Step 3: Choose Font Style -->
          <div class="space-y-2.5">
            <label class="text-xs font-bold uppercase tracking-wider text-[#20231F] flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-[#FF5C00] text-white flex items-center justify-center text-[10px]">3</span>
              <span>Kiểu Chữ Thiết Kế:</span>
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button type="button" data-font="sans" class="personalize-font-btn py-2.5 px-3 rounded-xl border text-xs text-center transition-all ${selectedFont === 'sans' ? 'border-[#FF5C00] bg-orange-50 font-bold text-[#FF5C00]' : 'border-[#DCDDD5] text-[#20231F]'}">
                <span class="custom-font-sans block text-sm">Aa Tối Giản</span>
                <span class="text-[10px] text-slate-500">Sans-serif</span>
              </button>
              <button type="button" data-font="serif" class="personalize-font-btn py-2.5 px-3 rounded-xl border text-xs text-center transition-all ${selectedFont === 'serif' ? 'border-[#FF5C00] bg-orange-50 font-bold text-[#FF5C00]' : 'border-[#DCDDD5] text-[#20231F]'}">
                <span class="custom-font-serif block text-sm">Aa Cổ Điển</span>
                <span class="text-[10px] text-slate-500">Serif</span>
              </button>
              <button type="button" data-font="script" class="personalize-font-btn py-2.5 px-3 rounded-xl border text-xs text-center transition-all ${selectedFont === 'script' ? 'border-[#FF5C00] bg-orange-50 font-bold text-[#FF5C00]' : 'border-[#DCDDD5] text-[#20231F]'}">
                <span class="custom-font-script block text-sm">Aa Mềm Mại</span>
                <span class="text-[10px] text-slate-500">Script</span>
              </button>
            </div>
          </div>

          <!-- Step 4: Color Palette -->
          <div class="space-y-2.5">
            <label class="text-xs font-bold uppercase tracking-wider text-[#20231F] flex items-center justify-between">
              <span class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-[#FF5C00] text-white flex items-center justify-center text-[10px]">4</span>
                <span>Màu Sắc Phôi Nhựa:</span>
              </span>
              <span id="personalize-selected-color-name" class="text-xs font-semibold text-[#FF5C00]">${selectedColor.name}</span>
            </label>
            <div class="flex items-center gap-2.5 flex-wrap" id="personalize-swatches-row">
              ${selectedProduct.colors.map(c => `
                <button type="button" 
                        data-color-id="${c.id}" 
                        title="${c.name}" 
                        style="background-color: ${c.hex};"
                        class="personalize-swatch-dot w-8 h-8 rounded-full border-2 transition-transform active:scale-95 ${c.id === selectedColor.id ? 'border-[#FF5C00] scale-110 shadow-md ring-2 ring-[#FF5C00]/30' : 'border-white shadow-sm'}"></button>
              `).join('')}
            </div>
          </div>

          <!-- Price & Order Action -->
          <div class="pt-5 border-t border-[#DCDDD5] space-y-3">
            <div class="flex items-baseline justify-between">
              <div>
                <span class="text-xs text-[#586057] block">Đơn giá đã gồm khắc tên:</span>
                <span class="text-2xl font-black font-mono text-[#FF5C00]">${selectedProduct.price.toLocaleString('vi-VN')} đ</span>
              </div>
              <span class="text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                Miễn phí công khắc
              </span>
            </div>

            <button type="button" 
                    id="btn-personalize-submit" 
                    class="w-full btn-primary !py-3.5 !rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg">
              <i class="fa-solid fa-sparkles text-amber-300"></i>
              <span>Gửi Yêu Cầu Chế Tác Mẫu Này</span>
            </button>
            <p class="text-[11px] text-center text-[#586057]">
              Chưa trừ mã giảm giá (nếu có). Bạn sẽ được xem lại đơn và duyệt demo trước khi xưởng tiến hành in.
            </p>
          </div>

        </div>

      </div>
    `;

    bindPersonalizeEvents();
    draw2DPreview();
  }

  function bindPersonalizeEvents() {
    // Model selection
    document.querySelectorAll('.personalize-model-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.prodIdx, 10);
        if (CUSTOM_PRODUCTS[idx]) {
          selectedProduct = CUSTOM_PRODUCTS[idx];
          selectedColor = selectedProduct.colors[0];
          customText = selectedProduct.defaultText;
          renderPersonalizeUI();
        }
      });
    });

    // Text Input
    const txtInput = document.getElementById('personalize-text-input');
    const charCount = document.getElementById('personalize-char-count');
    if (txtInput) {
      txtInput.addEventListener('input', () => {
        customText = txtInput.value;
        if (charCount) charCount.textContent = `${customText.length}/40 ký tự`;
        draw2DPreview();
      });
    }

    // Font selection
    document.querySelectorAll('.personalize-font-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedFont = btn.dataset.font;
        document.querySelectorAll('.personalize-font-btn').forEach(b => {
          b.classList.remove('border-[#FF5C00]', 'bg-orange-50', 'font-bold', 'text-[#FF5C00]');
          b.classList.add('border-[#DCDDD5]', 'text-[#20231F]');
        });
        btn.classList.add('border-[#FF5C00]', 'bg-orange-50', 'font-bold', 'text-[#FF5C00]');
        btn.classList.remove('border-[#DCDDD5]', 'text-[#20231F]');
        draw2DPreview();
      });
    });

    // Swatches
    document.querySelectorAll('.personalize-swatch-dot').forEach(btn => {
      btn.addEventListener('click', () => {
        const colId = btn.dataset.colorId;
        const matched = selectedProduct.colors.find(c => c.id === colId);
        if (matched) {
          selectedColor = matched;
          const label = document.getElementById('personalize-selected-color-name');
          if (label) label.textContent = matched.name;

          document.querySelectorAll('.personalize-swatch-dot').forEach(b => {
            b.classList.remove('border-[#FF5C00]', 'scale-110', 'ring-2', 'ring-[#FF5C00]/30');
            b.classList.add('border-white');
          });
          btn.classList.add('border-[#FF5C00]', 'scale-110', 'ring-2', 'ring-[#FF5C00]/30');
          btn.classList.remove('border-white');
          draw2DPreview();
        }
      });
    });

    // Submit Action -> Direct Checkout Handoff
    const submitBtn = document.getElementById('btn-personalize-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const itemPayload = {
          id: selectedProduct.id,
          title: selectedProduct.title,
          price: selectedProduct.price,
          qty: 1,
          colorId: selectedColor.id,
          colorName: selectedColor.name,
          materialId: 'pla_matte',
          materialName: 'PLA Matte Tiêu Chuẩn',
          customText: customText.trim()
        };

        if (window.TTCheckout && typeof window.TTCheckout.openDirectCheckout === 'function') {
          window.TTCheckout.openDirectCheckout(itemPayload);
        } else if (window.TTCart && typeof window.TTCart.addItem === 'function') {
          window.TTCart.addItem(itemPayload);
          window.TTCart.openCart();
        } else {
          alert('Đã sẵn sàng chuyển tiếp! Kỹ thuật viên sẽ hỗ trợ bạn.');
        }
      });
    }
  }

  function draw2DPreview() {
    const canvas = document.getElementById('personalize-preview-canvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Clear background (Clean warm studio table)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#FAF9F6');
    bgGrad.addColorStop(1, '#EDECE8');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle Grid Texture
    ctx.strokeStyle = 'rgba(0,0,0,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Draw Stylized 3D Product Base Plaque
    const plaqueX = w * 0.15;
    const plaqueY = h * 0.22;
    const plaqueW = w * 0.7;
    const plaqueH = h * 0.56;
    const radius = 24;

    // Plaque Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 12;

    // Base Color Fill
    ctx.fillStyle = selectedColor.hex || '#F5F2EB';
    roundRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, radius, true, false);

    // Reset shadow
    ctx.shadowColor = 'transparent';

    // 3D Layer Thickness Line (Simulate Bambu 3D Print layers)
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    roundRect(ctx, plaqueX + 2, plaqueY + 2, plaqueW - 4, plaqueH - 4, radius - 2, false, true);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    roundRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, radius, false, true);

    // Product Title Watermark on Top
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`T&T 3D LABS • ${selectedProduct.title.toUpperCase()}`, w / 2, plaqueY + 36);

    // Draw Subtle Inset Frame for Engraving Zone
    const frameX = plaqueX + 24;
    const frameY = plaqueY + 54;
    const frameW = plaqueW - 48;
    const frameH = plaqueH - 80;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    roundRect(ctx, frameX, frameY, frameW, frameH, 14, true, false);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    roundRect(ctx, frameX, frameY, frameW, frameH, 14, false, true);

    // Custom Text Embossed / Engraved Rendering
    const displayText = customText.trim() || 'HỌ & TÊN CỦA BẠN';

    // Choose font family
    let fontName = '"Plus Jakarta Sans", sans-serif';
    if (selectedFont === 'serif') fontName = 'Georgia, "Playfair Display", serif';
    if (selectedFont === 'script') fontName = '"Dancing Script", cursive, "Brush Script MT", sans-serif';

    // Calculate font size according to length
    let fontSize = 28;
    if (displayText.length > 20) fontSize = 20;
    if (displayText.length > 30) fontSize = 16;

    ctx.font = `700 ${fontSize}px ${fontName}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerY = frameY + frameH / 2;

    // Embossed 3D Shadow (Light from top-left)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(displayText, w / 2 + 1, centerY + 1.5);

    // Debossed Depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillText(displayText, w / 2 - 0.5, centerY - 0.5);

    // Primary Text Color
    const isDarkBase = isColorDark(selectedColor.hex);
    ctx.fillStyle = isDarkBase ? '#F8F9FA' : '#1E2024';
    ctx.fillText(displayText, w / 2, centerY);

    // Dimension indicators
    ctx.fillStyle = '#8A8F98';
    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.fillText(`├── 0.16mm High-Detail Bambu Print • Bio-PLA ──┤`, w / 2, plaqueY + plaqueH - 14);
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function isColorDark(hex) {
    if (!hex || !hex.startsWith('#')) return false;
    const c = hex.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma < 128;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.TTPersonalizeStudio = {
    init: renderPersonalizeUI,
    CUSTOM_PRODUCTS,
    drawPreview: draw2DPreview
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.TTPersonalizeStudio;
  }
})(typeof window !== 'undefined' ? window : globalThis);
