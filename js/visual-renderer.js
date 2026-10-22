/**
 * ============================================================================
 * T&T 3D LABS - HIGH-DPI STUDIO VISUAL RENDERER & CAD HUD ENGINE
 * Architecture: 2-Layer Studio Visual Frame
 * Layer 1: Crisp Daylight Physical Visual + Dynamic 2.5D Retina Vector Fallback
 * Layer 2: 100% Crisp Vietnamese CAD HUD Overlay & Dimension Measurements
 * ============================================================================
 */

(function () {
  'use strict';

  // Palette tiêu chuẩn xưởng T&T 3D Labs
  const STUDIO_PALETTE = {
    nordic_white: { name: 'Trắng Sứ Nordic', hex: '#F5F2EB', darkHex: '#D5D1C7', spec: 'Bio-PLA Matte' },
    obsidian_black: { name: 'Đen Obsidian', hex: '#1C1D1F', darkHex: '#121315', spec: 'Bio-PLA Matte' },
    terracotta: { name: 'Cam Đất Mờ', hex: '#C85A32', darkHex: '#9E3E1C', spec: 'Bio-PLA Matte' },
    matcha_green: { name: 'Xanh Matcha', hex: '#5B7052', darkHex: '#3F5238', spec: 'Bio-PLA Matte' },
    champagne_gold: { name: 'Vàng Đồng Silk', hex: '#EED9A7', darkHex: '#CBB075', spec: 'PLA Silk Óng Ánh' },
    accent_orange: { name: 'Safety Orange', hex: '#FF5C00', darkHex: '#CC4A00', spec: 'Signature T&T' }
  };

  // Tra cứu thông số & huy hiệu chuẩn theo danh mục
  const CATEGORY_TECH_DATA = {
    Ca_Nhan_Hoa_NFC: {
      badge: '⚡ CHIP NTAG215 ĐÚC CHÌM',
      dimensionText: '├── 100.0 mm ──┤',
      layerHeight: '0.16MM BAMBU LAB',
      wallThickness: '1.6mm (4 Perimeters)',
      infill: '20% Gyroid',
      tolerance: '±0.05mm',
      shape: 'nfc_stand'
    },
    Decor_Den_Noi_That: {
      badge: '💡 XUYÊN SÁNG ẤM 3000K',
      dimensionText: '├── 185.0 mm ──┤',
      layerHeight: '0.16MM BAMBU LAB',
      wallThickness: '1.2mm (Translucent)',
      infill: '10% Spiral Vase',
      tolerance: '±0.10mm',
      shape: 'swirl_lamp'
    },
    Trang_Diem_Vanity: {
      badge: '✦ NÉT KHẮC SILK 0.12MM',
      dimensionText: '├── 140.0 mm ──┤',
      layerHeight: '0.12MM HI-RES',
      wallThickness: '1.6mm (4 Perimeters)',
      infill: '15% Adaptive Cubic',
      tolerance: '±0.08mm',
      shape: 'coquette_tray'
    },
    Hop_De_Ban_Tien_Ich: {
      badge: '📐 KHỚP CHUẨN SAI SỐ ±0.05MM',
      dimensionText: '├── 155.0 mm ──┤',
      layerHeight: '0.16MM BAMBU LAB',
      wallThickness: '2.0mm (5 Perimeters)',
      infill: '25% Grid',
      tolerance: '±0.05mm',
      shape: 'desk_tray'
    },
    Do_Choi_Moc_Khoa: {
      badge: '⚙️ KHỚP CẦU ĐÚC LIỀN KHÔNG GHÉP',
      dimensionText: '├── 120.0 mm ──┤',
      layerHeight: '0.16MM BAMBU LAB',
      wallThickness: '1.6mm (4 Perimeters)',
      infill: '20% Gyroid',
      tolerance: '±0.05mm',
      shape: 'articulated_joint'
    }
  };

  /**
   * Tạo Vector Blueprint / Studio 2.5D độ phân giải vô hạn
   * @param {Object} options
   * @param {string} options.category
   * @param {string} options.colorHex
   * @param {string} options.mode - 'studio' hoặc 'cad'
   * @param {string} options.productId
   * @param {string} options.title
   */
  function renderProductVectorSvg(options) {
    const opt = options || {};
    const cat = opt.category || 'Decor_Den_Noi_That';
    const tech = CATEGORY_TECH_DATA[cat] || CATEGORY_TECH_DATA.Decor_Den_Noi_That;
    const mode = opt.mode || 'studio'; // 'studio' hoặc 'cad'
    const colorHex = opt.colorHex || '#F5F2EB';
    const productId = opt.productId || 'TT3D-ITEM';
    const title = opt.title || 'Sản phẩm chế tác T&T 3D';

    const isCad = mode === 'cad';
    const bgFill = isCad ? '#090B0E' : 'url(#daylight-studio-gradient)';
    const gridStroke = isCad ? 'rgba(0, 195, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)';
    const cadLineColor = '#00E5FF';
    const cadAccent = '#FF5C00';

    // Tính toán màu bóng đổ và highlight
    const primaryColor = colorHex;
    const shadowColor = adjustBrightness(colorHex, -35);
    const highlightColor = adjustBrightness(colorHex, 25);

    // Sinh hình dạng theo từng dòng sản phẩm
    let shapeSvg = '';
    let cadAnnotations = '';

    if (tech.shape === 'nfc_stand') {
      // 1. Đế WiFi NFC 1-Chạm: Khối L công thái học 60 độ
      shapeSvg = `
        <!-- Shadow base -->
        <ellipse cx="300" cy="460" rx="190" ry="24" fill="rgba(0,0,0,0.35)" filter="url(#studio-blur-shadow)" />
        
        <!-- Chân đế L nghiêng 60 độ -->
        <path d="M 170 380 L 260 440 L 430 380 L 340 320 Z" fill="${shadowColor}" />
        <path d="M 170 380 L 170 350 L 340 290 L 340 320 Z" fill="${adjustBrightness(colorHex, -20)}" />
        <path d="M 170 350 L 260 410 L 430 350 L 340 290 Z" fill="${primaryColor}" />
        
        <!-- Thân dựng nghiêng chứa chip NFC & mặt điện thoại -->
        <path d="M 230 330 L 340 180 L 390 200 L 280 350 Z" fill="${shadowColor}" />
        <path d="M 230 330 L 220 325 L 330 175 L 340 180 Z" fill="${highlightColor}" />
        <path d="M 220 325 L 330 175 L 380 195 L 270 345 Z" fill="${primaryColor}" />

        <!-- Biểu tượng WiFi & NFC đúc nổi 2 màu -->
        <g transform="translate(295, 255) rotate(-28)">
          <circle cx="0" cy="0" r="28" fill="${cadAccent}" opacity="0.9" />
          <path d="M -14 -6 A 18 18 0 0 1 14 -6" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M -9 0 A 11 11 0 0 1 9 0" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <circle cx="0" cy="7" r="3" fill="#FFFFFF" />
          <text x="0" y="20" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">NFC 1-CHẠM</text>
        </g>
      `;

      cadAnnotations = `
        <!-- CAD Dimension lines -->
        <g stroke="${cadLineColor}" stroke-width="1.2" opacity="0.85">
          <!-- Width 100mm -->
          <line x1="160" y1="460" x2="440" y2="460" stroke-dasharray="4,2"/>
          <line x1="160" y1="450" x2="160" y2="470" />
          <line x1="440" y1="450" x2="440" y2="470" />
          <text x="300" y="475" fill="${cadLineColor}" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="middle" font-weight="bold">├─ 100.0 mm (RỘNG ĐẾ) ─┤</text>

          <!-- Height 135mm -->
          <line x1="455" y1="175" x2="455" y2="410" stroke-dasharray="4,2"/>
          <line x1="445" y1="175" x2="465" y2="175" />
          <line x1="445" y1="410" x2="465" y2="410" />
          <text x="470" y="295" fill="${cadLineColor}" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" transform="rotate(90, 470, 295)">135.0 mm (CHIỀU CAO)</text>

          <!-- Angle 60 deg -->
          <path d="M 220 325 A 35 35 0 0 0 255 350" fill="none" stroke="${cadAccent}" stroke-width="1.5" />
          <text x="260" y="335" fill="${cadAccent}" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold">60° CÔNG THÁI HỌC</text>
        </g>
      `;
    } else if (tech.shape === 'swirl_lamp') {
      // 2. Đèn bàn xoắn kem Soft Serve uốn lượn đa tầng
      shapeSvg = `
        <!-- Vầng sáng ấm 3000K sau đèn -->
        <circle cx="300" cy="270" r="170" fill="url(#ambient-lamp-glow)" opacity="${isCad ? '0.3' : '0.85'}" />
        <ellipse cx="300" cy="480" rx="160" ry="22" fill="rgba(0,0,0,0.4)" filter="url(#studio-blur-shadow)" />

        <!-- Chân đế đèn than chì -->
        <path d="M 230 460 C 230 450, 370 450, 370 460 L 360 480 C 360 490, 240 490, 240 480 Z" fill="#1C1D1F" />
        <ellipse cx="300" cy="460" rx="65" ry="10" fill="#2B2D31" />

        <!-- Thân đèn xoắn ốc Soft Serve lượn sóng 4 tầng -->
        <!-- Tầng 4 (Đỉnh) -->
        <path d="M 285 140 C 290 120, 310 120, 315 140 C 330 170, 270 170, 285 140 Z" fill="${highlightColor}" />
        <!-- Tầng 3 -->
        <path d="M 260 200 C 240 160, 360 160, 340 200 C 360 230, 240 230, 260 200 Z" fill="${primaryColor}" />
        <!-- Tầng 2 -->
        <path d="M 235 270 C 210 220, 390 220, 365 270 C 390 310, 210 310, 235 270 Z" fill="${adjustBrightness(colorHex, -8)}" />
        <!-- Tầng 1 (Đáy) -->
        <path d="M 210 360 C 180 300, 420 300, 390 360 C 420 420, 180 420, 210 360 Z" fill="${shadowColor}" />
        <ellipse cx="300" cy="410" rx="100" ry="24" fill="${adjustBrightness(colorHex, -18)}" />

        <!-- Hiệu ứng đường vân xoắn ốc 0.16mm -->
        <g stroke="${highlightColor}" stroke-width="1.2" opacity="0.6" fill="none">
          <path d="M 280 150 C 320 180, 280 230, 330 260 C 270 300, 340 350, 290 400" />
          <path d="M 265 220 C 345 250, 255 310, 365 350" />
        </g>
      `;

      cadAnnotations = `
        <g stroke="${cadLineColor}" stroke-width="1.2" opacity="0.85">
          <!-- Height 185mm -->
          <line x1="435" y1="130" x2="435" y2="480" stroke-dasharray="4,2"/>
          <line x1="425" y1="130" x2="445" y2="130"/>
          <line x1="425" y1="480" x2="445" y2="480"/>
          <text x="450" y="310" fill="${cadLineColor}" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" transform="rotate(90, 450, 310)">185.0 mm (CHIỀU CAO)</text>

          <!-- Diameter 160mm -->
          <line x1="190" y1="425" x2="410" y2="425" stroke-dasharray="4,2"/>
          <text x="300" y="440" fill="${cadLineColor}" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle" font-weight="bold">Ø 160.0 mm (ĐƯỜNG KÍNH)</text>
          
          <!-- Note -->
          <text x="300" y="105" fill="${cadAccent}" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="middle" font-weight="bold">✦ CHAO ĐÈN VÁT XOẮN KHÔNG CẦN SUPPORT</text>
        </g>
      `;
    } else if (tech.shape === 'coquette_tray') {
      // 3. Khay lụa thắt nơ Coquette Chic & Ống cắm cọ
      shapeSvg = `
        <ellipse cx="300" cy="460" rx="180" ry="24" fill="rgba(0,0,0,0.35)" filter="url(#studio-blur-shadow)" />

        <!-- Đĩa lụa mềm mại viền nếp sóng -->
        <ellipse cx="300" cy="380" rx="170" ry="70" fill="${shadowColor}" />
        <ellipse cx="300" cy="370" rx="165" ry="65" fill="${adjustBrightness(colorHex, -15)}" />
        <ellipse cx="300" cy="360" rx="150" ry="55" fill="${primaryColor}" />
        <ellipse cx="300" cy="358" rx="140" ry="48" fill="${highlightColor}" />

        <!-- Chi tiết Nơ phồng 3D phong cách Coquette -->
        <g transform="translate(300, 315)">
          <!-- Cánh nơ trái -->
          <path d="M 0 0 C -50 -35, -70 20, -10 12 Z" fill="${primaryColor}" stroke="${highlightColor}" stroke-width="1.5"/>
          <path d="M 0 0 C -40 -20, -55 10, -5 8 Z" fill="${shadowColor}" opacity="0.4"/>
          <!-- Cánh nơ phải -->
          <path d="M 0 0 C 50 -35, 70 20, 10 12 Z" fill="${primaryColor}" stroke="${highlightColor}" stroke-width="1.5"/>
          <path d="M 0 0 C 40 -20, 55 10, 5 8 Z" fill="${shadowColor}" opacity="0.4"/>
          <!-- Nút thắt tâm -->
          <ellipse cx="0" cy="3" rx="11" ry="9" fill="${cadAccent}" />
          <!-- Dải ruy băng rủ -->
          <path d="M -5 10 C -25 40, -15 65, -30 85" stroke="${primaryColor}" stroke-width="8" stroke-linecap="round" fill="none"/>
          <path d="M 5 10 C 25 40, 15 65, 30 85" stroke="${primaryColor}" stroke-width="8" stroke-linecap="round" fill="none"/>
        </g>
      `;

      cadAnnotations = `
        <g stroke="${cadLineColor}" stroke-width="1.2" opacity="0.85">
          <line x1="130" y1="465" x2="470" y2="465" stroke-dasharray="4,2"/>
          <text x="300" y="480" fill="${cadLineColor}" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle" font-weight="bold">├── 140.0 mm (CHIỀU DÀI ĐĨA) ──┤</text>
          <text x="300" y="255" fill="${cadAccent}" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="middle" font-weight="bold">✦ ĐỘ DÀY THÀNH 1.6MM • ĐÚC NƠ LIỀN KHỐI</text>
        </g>
      `;
    } else if (tech.shape === 'desk_tray') {
      // 4. Khay để bàn công thái học EDC / Đu quay mini
      shapeSvg = `
        <ellipse cx="300" cy="460" rx="190" ry="24" fill="rgba(0,0,0,0.35)" filter="url(#studio-blur-shadow)" />

        <!-- Khay bàn đa giác bo góc R6 3 ngăn -->
        <!-- Đáy khay -->
        <path d="M 130 380 L 270 440 L 470 360 L 330 300 Z" fill="${shadowColor}" />
        <path d="M 130 380 L 130 345 L 330 265 L 330 300 Z" fill="${adjustBrightness(colorHex, -22)}" />
        <path d="M 470 360 L 470 325 L 330 265 L 330 300 Z" fill="${adjustBrightness(colorHex, -15)}" />
        <path d="M 130 345 L 270 405 L 470 325 L 330 265 Z" fill="${primaryColor}" />

        <!-- Vách ngăn trong khay -->
        <!-- Ngăn bút bên trái -->
        <path d="M 155 345 L 250 385 L 270 375 L 175 335 Z" fill="${shadowColor}" opacity="0.7"/>
        <!-- Ngăn tai nghe / chìa khóa -->
        <path d="M 285 370 L 390 330 L 440 350 L 335 390 Z" fill="${shadowColor}" opacity="0.6"/>

        <!-- Đệm lót nhung/da vi mô trong ngăn -->
        <path d="M 160 348 L 245 385 L 260 378 L 175 341 Z" fill="#202226" />
        <path d="M 290 368 L 385 332 L 430 349 L 335 385 Z" fill="#202226" />
      `;

      cadAnnotations = `
        <g stroke="${cadLineColor}" stroke-width="1.2" opacity="0.85">
          <line x1="120" y1="455" x2="480" y2="455" stroke-dasharray="4,2"/>
          <text x="300" y="470" fill="${cadLineColor}" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle" font-weight="bold">├── 155.0 mm (RỘNG) ──┤ • RÃNH BÚT GÓC 15°</text>
          <text x="300" y="235" fill="${cadAccent}" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="middle" font-weight="bold">✦ CHÂN ĐỆM SILICONE CHỐNG TRƯỢT TÍCH HỢP</text>
        </g>
      `;
    } else {
      // 5. Khớp nối cơ khí / Rắn Gary uốn lượn Articulated
      shapeSvg = `
        <ellipse cx="300" cy="460" rx="190" ry="24" fill="rgba(0,0,0,0.35)" filter="url(#studio-blur-shadow)" />

        <!-- 5 Đốt khớp cầu uốn lượn liên hoàn dạng Print-In-Place -->
        <!-- Đốt 1 (Đầu) -->
        <g transform="translate(190, 370)">
          <path d="M 0 0 C 20 -25, 60 -15, 65 15 C 65 35, 20 40, 0 0 Z" fill="${primaryColor}" />
          <circle cx="45" cy="12" r="4" fill="#1C1D1F" />
          <circle cx="46" cy="11" r="1.5" fill="#FFFFFF" />
        </g>

        <!-- Đốt 2 (Khớp cầu) -->
        <g transform="translate(240, 385)">
          <circle cx="15" cy="10" r="18" fill="${shadowColor}" />
          <circle cx="15" cy="10" r="14" fill="${highlightColor}" />
          <path d="M 15 -4 L 45 10 L 45 25 L 15 25 Z" fill="${primaryColor}" />
        </g>

        <!-- Đốt 3 (Thân giữa) -->
        <g transform="translate(290, 375)">
          <circle cx="15" cy="10" r="16" fill="${shadowColor}" />
          <circle cx="15" cy="10" r="12" fill="${highlightColor}" />
          <path d="M 15 -2 L 50 15 L 50 30 L 15 25 Z" fill="${primaryColor}" />
        </g>

        <!-- Đốt 4 (Đuôi) -->
        <g transform="translate(345, 390)">
          <circle cx="15" cy="10" r="14" fill="${shadowColor}" />
          <path d="M 15 0 L 55 20 L 55 30 L 15 20 Z" fill="${adjustBrightness(colorHex, -15)}" />
        </g>

        <!-- Đốt 5 (Chóp đuôi) -->
        <path d="M 400 410 Q 435 425 450 415" stroke="${cadAccent}" stroke-width="6" stroke-linecap="round" fill="none"/>
      `;

      cadAnnotations = `
        <g stroke="${cadLineColor}" stroke-width="1.2" opacity="0.85">
          <line x1="170" y1="465" x2="460" y2="465" stroke-dasharray="4,2"/>
          <text x="315" y="480" fill="${cadLineColor}" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle" font-weight="bold">├── 120.0 mm ──┤ • DUNG SAI KHỚP: ±0.05MM</text>
          <text x="300" y="325" fill="${cadAccent}" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="middle" font-weight="bold">✦ KHỚP CẦU ĐÚC LIỀN KHÔNG CẦN LẮP RÁP</text>
        </g>
      `;
    }

    // Tổ hợp toàn bộ tài liệu SVG hoàn chỉnh
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%" class="studio-crisp-svg" style="display: block; width: 100%; height: 100%;">
        <defs>
          <!-- Gradient nền Studio Daylight tự nhiên -->
          <radialGradient id="daylight-studio-gradient" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#24272D" />
            <stop offset="60%" stop-color="#14161A" />
            <stop offset="100%" stop-color="#0B0C0E" />
          </radialGradient>

          <!-- Vầng sáng ấm cho đèn -->
          <radialGradient id="ambient-lamp-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FF9D42" stop-opacity="0.8" />
            <stop offset="50%" stop-color="#FF6B00" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#FF5C00" stop-opacity="0" />
          </radialGradient>

          <!-- Bóng đổ đa tầng mềm mại -->
          <filter id="studio-blur-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
          </filter>

          <!-- Pattern lưới kỹ thuật CAD -->
          <pattern id="cad-grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="${gridStroke}" stroke-width="0.8" />
          </pattern>
        </defs>

        <!-- 1. Nền Studio / Blueprint -->
        <rect width="600" height="600" fill="${bgFill}" />
        <rect width="600" height="600" fill="url(#cad-grid-pattern)" />

        <!-- Điểm giao trục tọa độ CAD nếu ở mode CAD -->
        ${isCad ? `
          <g stroke="rgba(0, 229, 255, 0.25)" stroke-width="1">
            <line x1="300" y1="40" x2="300" y2="560" stroke-dasharray="6,4"/>
            <line x1="40" y1="300" x2="560" y2="300" stroke-dasharray="6,4"/>
            <circle cx="300" cy="300" r="4" fill="#00E5FF" />
            <text x="310" y="315" fill="#00E5FF" font-family="'JetBrains Mono', monospace" font-size="9" opacity="0.7">GỐC TỌA ĐỘ IN (0,0,0)</text>
          </g>
        ` : ''}

        <!-- 2. Khối sản phẩm 2.5D Retina -->
        <g id="product-geometry" filter="url(#crisp-unsharp)">
          ${shapeSvg}
        </g>

        <!-- 3. Lớp CAD Annotations nếu bật mode CAD -->
        ${isCad ? cadAnnotations : ''}

        <!-- 4. Tầng 2: 100% Crisp Vietnamese CAD HUD Overlay -->
        <!-- Góc trên trái: Tem xác thực xưởng Hà Nội -->
        <g transform="translate(24, 28)">
          <rect x="0" y="0" width="180" height="26" rx="6" fill="rgba(11, 12, 14, 0.82)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
          <circle cx="12" cy="13" r="3.5" fill="#FF5C00" />
          <text x="22" y="17" fill="#F5F2EB" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" letter-spacing="0.5">✦ T&T 3D • HÀ NỘI</text>
        </g>

        <!-- Góc trên phải: Huy hiệu kỹ thuật -->
        <g transform="translate(400, 28)">
          <rect x="0" y="0" width="176" height="26" rx="6" fill="rgba(11, 12, 14, 0.82)" stroke="rgba(255, 92, 0, 0.35)" stroke-width="1" />
          <text x="88" y="17" fill="#FF5C00" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="900" text-anchor="middle" letter-spacing="0.4">${escapeXml(tech.badge)}</text>
        </g>

        <!-- Cạnh dưới ảnh: Thước đo CAD -->
        <g transform="translate(24, 552)">
          <rect x="0" y="0" width="552" height="26" rx="6" fill="rgba(11, 12, 14, 0.85)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
          <text x="16" y="17" fill="#9CA3AF" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold">
            ${escapeXml(tech.dimensionText)} • LỚP IN: ${escapeXml(tech.layerHeight)}
          </text>
          <text x="536" y="17" fill="#FF5C00" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" text-anchor="end">
            ${isCad ? 'CHẾ ĐỘ CAD' : 'STUDIO 2.5D'}
          </text>
        </g>
      </svg>
    `;
  }

  /**
   * Helper điều chỉnh độ sáng màu Hex
   */
  function adjustBrightness(col, percent) {
    if (!col || typeof col !== 'string' || !col.startsWith('#')) return '#888888';
    let num = parseInt(col.slice(1), 16);
    if (isNaN(num)) return '#888888';
    let r = (num >> 16) + Math.round(255 * (percent / 100));
    let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
    let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function escapeXml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe).replace(/[<>&'"]/g, function (c) {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  /**
   * Khởi tạo Macro Loupe (Kính lúp soi chi tiết 0.16mm) trên container
   */
  function attachMacroLoupe(containerEl, imgEl, options) {
    if (!containerEl || !imgEl) return;

    // Kiểm tra xem đã có loupe chưa
    let loupeEl = containerEl.querySelector('.macro-loupe-glass');
    let tooltipEl = containerEl.querySelector('.macro-loupe-tooltip');

    if (!loupeEl) {
      loupeEl = document.createElement('div');
      loupeEl.className = 'macro-loupe-glass';
      loupeEl.innerHTML = `
        <div class="macro-loupe-micro-lines"></div>
        <div class="macro-loupe-crosshair"></div>
      `;
      containerEl.appendChild(loupeEl);
    }

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'macro-loupe-tooltip';
      tooltipEl.innerHTML = `
        <span class="text-[#FF5C00] font-bold">✦ KÍNH LÚP SOI VÂN IN 0.16MM:</span>
        Bề mặt nhựa sinh học Bio-PLA Matte mịn màng, chữ đúc nổi đa màu từ máy Bambu Lab AMS — không dùng decal dán.
      `;
      containerEl.appendChild(tooltipEl);
    }

    const LOUPE_SIZE = 150;
    const ZOOM_FACTOR = 2.4;

    function onMouseMove(e) {
      const rect = containerEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        loupeEl.style.opacity = '0';
        tooltipEl.style.opacity = '0';
        return;
      }

      loupeEl.style.opacity = '1';
      tooltipEl.style.opacity = '1';

      loupeEl.style.left = `${x - LOUPE_SIZE / 2}px`;
      loupeEl.style.top = `${y - LOUPE_SIZE / 2}px`;

      // Cập nhật vị trí nền phóng to
      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;

      // Đồng bộ background image từ imgEl.src hoặc SVG
      if (imgEl.tagName.toLowerCase() === 'img' && imgEl.src) {
        loupeEl.style.backgroundImage = `url("${imgEl.src}")`;
      } else {
        loupeEl.style.backgroundColor = 'rgba(28, 29, 31, 0.9)';
      }
      loupeEl.style.backgroundSize = `${rect.width * ZOOM_FACTOR}px ${rect.height * ZOOM_FACTOR}px`;
      loupeEl.style.backgroundPosition = `${bgX}% ${bgY}%`;
    }

    function onMouseLeave() {
      loupeEl.style.opacity = '0';
      tooltipEl.style.opacity = '0';
    }

    containerEl.removeEventListener('mousemove', onMouseMove);
    containerEl.removeEventListener('mouseleave', onMouseLeave);

    containerEl.addEventListener('mousemove', onMouseMove);
    containerEl.addEventListener('mouseleave', onMouseLeave);
  }

  // Xuất API toàn cục
  window.TT3DVisualRenderer = {
    renderProductVectorSvg,
    attachMacroLoupe,
    getTechData: (cat) => CATEGORY_TECH_DATA[cat] || CATEGORY_TECH_DATA.Decor_Den_Noi_That,
    palette: STUDIO_PALETTE
  };

})();
