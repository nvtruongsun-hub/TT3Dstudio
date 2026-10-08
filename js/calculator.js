/**
 * T&T 3D Studio - Instant Online 3D Print Quote Calculator
 * Động cơ tính giá gia công in 3D thời gian thực tích hợp Giỏ hàng & VietQR
 */

(function () {
  'use strict';

  // State
  let currentTech = 'fdm';
  let currentMaterialKey = 'pla_plus';
  let currentInfill = 20;
  let currentLayer = '0.20';
  let currentFinish = 'raw';
  let currentWeight = 85;
  let currentQty = 1;
  let synced3dModelName = null;

  // Lấy biểu giá từ TTStore / TT_CONFIG
  function getPricingConfig() {
    const cfg = (window.TTStore && window.TTStore.getConfig()) || window.TT_DEFAULT_CONFIG;
    return cfg.pricing || window.TT_DEFAULT_CONFIG.pricing;
  }

  // Khởi tạo cơ sở dữ liệu vật liệu với giá động
  function getMaterialsDatabase() {
    const pricing = getPricingConfig();
    const rates = pricing.materialRates || {};

    return {
      fdm: {
        pla_plus: {
          name: 'PLA+ Cao Cấp (Khuyên dùng)',
          desc: 'Bền, ít cong vênh, chi tiết sắc nét, thân thiện môi trường',
          pricePerGram: rates.pla_plus || 1200,
          density: 1.24,
          setupFee: 20000,
          speedFactor: 1.0,
          defaultLayer: '0.20'
        },
        petg: {
          name: 'PETG Chịu Lực & Chống Nước',
          desc: 'Độ dẻo dai cao, chống tia UV, kháng hóa chất, dùng ngoài trời',
          pricePerGram: rates.petg || 1500,
          density: 1.27,
          setupFee: 25000,
          speedFactor: 1.1,
          defaultLayer: '0.20'
        },
        abs: {
          name: 'ABS Kỹ Thuật Chịu Nhiệt',
          desc: 'Chịu nhiệt tới 95°C, gia công cơ khí, dễ chà nhám sơn phủ',
          pricePerGram: rates.abs || 1700,
          density: 1.05,
          setupFee: 35000,
          speedFactor: 1.2,
          defaultLayer: '0.16'
        },
        tpu: {
          name: 'TPU Dẻo Đàn Hồi 95A',
          desc: 'Co giãn, chống va đập, ốp bảo vệ, bánh xe robot, gioăng đệm',
          pricePerGram: rates.tpu || 2200,
          density: 1.21,
          setupFee: 40000,
          speedFactor: 1.6,
          defaultLayer: '0.20'
        },
        cf_petg: {
          name: 'Carbon Fiber PETG (Siêu Cứng)',
          desc: 'Gia cường sợi Carbon 20%, siêu cứng, nhẹ, bề mặt mờ nhám đỉnh cao',
          pricePerGram: rates.cf_petg || 3200,
          density: 1.29,
          setupFee: 50000,
          speedFactor: 1.35,
          defaultLayer: '0.16'
        }
      },
      sla: {
        resin_std_8k: {
          name: 'Resin 8K Siêu Chi Tiết',
          desc: 'Độ phân giải siêu cao 8K/12K, mịn màng không thấy vân in, mô hình figure',
          pricePerGram: rates.resin_std_8k || 2400,
          density: 1.12,
          setupFee: 45000,
          speedFactor: 1.25,
          defaultLayer: '0.05'
        },
        resin_tough: {
          name: 'Resin Kỹ Thuật Tough (Chịu Lực)',
          desc: 'Bền dẻo tương đương nhựa ABS, vặn ốc và chịu va đập tốt',
          pricePerGram: rates.resin_tough || 3500,
          density: 1.15,
          setupFee: 60000,
          speedFactor: 1.4,
          defaultLayer: '0.05'
        }
      },
      sls: {
        sls_pa12: {
          name: 'Nylon PA12 Laser SLS',
          desc: 'In bột laser công nghiệp, cơ tính đẳng hướng, không cần support, chịu tải cực lớn',
          pricePerGram: rates.sls_pa12 || 5500,
          density: 1.01,
          setupFee: 150000,
          speedFactor: 1.8,
          defaultLayer: '0.10'
        }
      }
    };
  }

  function initCalculator() {
    setupTechTabs();
    populateMaterials();
    updateLayerOptions();
    setupInputs();
    calculateQuote();

    // Lắng nghe sự kiện đồng bộ từ 3D Viewer
    window.addEventListener('tt_sync_3d_to_calc', (e) => {
      const stats = e.detail;
      if (stats) {
        synced3dModelName = stats.name;
        if (stats.weight) {
          currentWeight = stats.weight;
          const weightInput = document.getElementById('calc-weight');
          const weightSlider = document.getElementById('calc-weight-slider');
          if (weightInput) weightInput.value = currentWeight;
          if (weightSlider) weightSlider.value = Math.min(500, currentWeight);
        }
        if (stats.recommendedLayer) {
          currentLayer = stats.recommendedLayer;
          const layerSelect = document.getElementById('calc-layer-height');
          if (layerSelect) layerSelect.value = currentLayer;
        }
        calculateQuote();
      }
    });

    // Lắng nghe sự kiện Admin cập nhật biểu giá
    window.addEventListener('tt_config_updated', () => {
      populateMaterials();
      calculateQuote();
    });
  }

  // Switch Technology Tabs (FDM / SLA / SLS)
  function setupTechTabs() {
    const tabs = document.querySelectorAll('[data-tech-tab]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active', 'border-primary', 'bg-primary/20', 'text-white');
          t.classList.add('border-white/10', 'text-slate-400');
        });
        tab.classList.add('active', 'border-primary', 'bg-primary/20', 'text-white');
        tab.classList.remove('border-white/10', 'text-slate-400');

        currentTech = tab.getAttribute('data-tech-tab');
        const materials = getMaterialsDatabase();
        
        // Chọn vật liệu đầu tiên trong nhóm
        const firstKey = Object.keys(materials[currentTech])[0];
        currentMaterialKey = firstKey;
        
        populateMaterials();
        updateLayerOptions();
        calculateQuote();
      });
    });
  }

  // Populate Material Dropdown & Descriptions
  function populateMaterials() {
    const select = document.getElementById('calc-material-select');
    const descEl = document.getElementById('calc-material-desc');
    if (!select) return;

    select.innerHTML = '';
    const materials = getMaterialsDatabase();
    const group = materials[currentTech];

    Object.entries(group).forEach(([key, mat]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${mat.name} (${mat.pricePerGram.toLocaleString('vi-VN')} đ/g)`;
      if (key === currentMaterialKey) opt.selected = true;
      select.appendChild(opt);
    });

    if (descEl && group[currentMaterialKey]) {
      descEl.textContent = group[currentMaterialKey].desc;
    }

    select.onchange = (e) => {
      currentMaterialKey = e.target.value;
      if (descEl && group[currentMaterialKey]) {
        descEl.textContent = group[currentMaterialKey].desc;
      }
      calculateQuote();
    };
  }

  // Update Layer height options based on technology
  function updateLayerOptions() {
    const layerSelect = document.getElementById('calc-layer-height');
    if (!layerSelect) return;

    layerSelect.innerHTML = '';
    let options = [];

    if (currentTech === 'sla') {
      options = [
        { val: '0.03', label: '0.03 mm - Vi sai cực đại (Figure / Kim hoàn)' },
        { val: '0.05', label: '0.05 mm - Tiêu chuẩn SLA sắc nét (Khuyên dùng)' },
        { val: '0.10', label: '0.10 mm - Mẫu nhanh tiết kiệm' }
      ];
      if (currentLayer !== '0.03' && currentLayer !== '0.05' && currentLayer !== '0.10') {
        currentLayer = '0.05';
      }
    } else if (currentTech === 'sls') {
      options = [
        { val: '0.10', label: '0.10 mm - Tiêu chuẩn công nghiệp SLS PA12' },
        { val: '0.12', label: '0.12 mm - Mẫu chức năng cơ khí' }
      ];
      currentLayer = '0.10';
    } else {
      // FDM
      options = [
        { val: '0.12', label: '0.12 mm - Siêu mịn (Khuyên dùng chi tiết nhỏ)' },
        { val: '0.16', label: '0.16 mm - Cân bằng độ nét & Tốc độ' },
        { val: '0.20', label: '0.20 mm - Tiêu chuẩn cơ khí (Khuyên dùng)' },
        { val: '0.28', label: '0.28 mm - In nhanh / Mẫu kích thước lớn' }
      ];
      if (!['0.12', '0.16', '0.20', '0.28'].includes(currentLayer)) {
        currentLayer = '0.20';
      }
    }

    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.val;
      o.textContent = opt.label;
      if (opt.val === currentLayer) o.selected = true;
      layerSelect.appendChild(o);
    });

    layerSelect.onchange = (e) => {
      currentLayer = e.target.value;
      calculateQuote();
    };
  }

  // Setup Weight, Infill, Finish, Quantity inputs
  function setupInputs() {
    // Weight
    const weightInput = document.getElementById('calc-weight');
    const weightSlider = document.getElementById('calc-weight-slider');
    if (weightInput && weightSlider) {
      weightInput.addEventListener('input', (e) => {
        currentWeight = Math.max(1, parseInt(e.target.value) || 1);
        weightSlider.value = Math.min(500, currentWeight);
        calculateQuote();
      });
      weightSlider.addEventListener('input', (e) => {
        currentWeight = parseInt(e.target.value);
        weightInput.value = currentWeight;
        calculateQuote();
      });
    }

    // Infill Slider
    const infillSlider = document.getElementById('calc-infill-slider');
    const infillVal = document.getElementById('calc-infill-val');
    if (infillSlider && infillVal) {
      infillSlider.addEventListener('input', (e) => {
        currentInfill = parseInt(e.target.value);
        infillVal.textContent = `${currentInfill}%`;
        calculateQuote();
      });
    }

    // Post-processing / Finishing options
    const finishRadios = document.querySelectorAll('input[name="calc-finish"]');
    finishRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        currentFinish = e.target.value;
        calculateQuote();
      });
    });

    // Quantity Counter
    const qtyInput = document.getElementById('calc-qty');
    const btnMinus = document.getElementById('calc-qty-minus');
    const btnPlus = document.getElementById('calc-qty-plus');

    if (qtyInput) {
      qtyInput.addEventListener('input', (e) => {
        currentQty = Math.max(1, parseInt(e.target.value) || 1);
        calculateQuote();
      });
    }
    if (btnMinus) {
      btnMinus.addEventListener('click', () => {
        if (currentQty > 1) {
          currentQty--;
          if (qtyInput) qtyInput.value = currentQty;
          calculateQuote();
        }
      });
    }
    if (btnPlus) {
      btnPlus.addEventListener('click', () => {
        currentQty++;
        if (qtyInput) qtyInput.value = currentQty;
        calculateQuote();
      });
    }

    // Add to Cart Button (Báo giá in theo yêu cầu)
    const btnAddToCart = document.getElementById('btn-add-calc-to-cart');
    if (btnAddToCart) {
      btnAddToCart.addEventListener('click', () => {
        addQuoteToCart();
      });
    }

    // Zalo Order Button
    const btnZalo = document.getElementById('btn-order-zalo');
    if (btnZalo) {
      btnZalo.addEventListener('click', () => {
        triggerZaloQuote();
      });
    }

    // Copy Quote Button
    const btnCopy = document.getElementById('btn-copy-quote');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        copyQuoteText();
      });
    }
  }

  // Calculate Instant Price
  function calculateQuote() {
    const materials = getMaterialsDatabase();
    const pricing = getPricingConfig();
    const mat = materials[currentTech][currentMaterialKey];
    if (!mat) return;

    // 1. Raw Material Cost (Khối lượng * đơn giá/gram)
    const materialCost = currentWeight * mat.pricePerGram;

    // 2. Machine Run Time estimation & Machine hourly fee
    const multipliers = pricing.layerMultipliers || {};
    const layerMultiplier = multipliers[currentLayer] || 1.0;

    const baseHours = (currentWeight / 25) * mat.speedFactor * layerMultiplier;
    const estHours = Math.max(0.8, Math.round(baseHours * 10) / 10);
    const hourlyFee = pricing.machineHourlyFee || 15000;
    const machineFee = Math.round(estHours * hourlyFee);

    // 3. Post-Processing Fee (Hậu kỳ)
    const addonFees = pricing.addonFees || {};
    let finishFee = 0;
    let finishName = 'Để thô nguyên bản';
    if (currentFinish === 'smooth') {
      finishFee = addonFees.smoothFinish || 35000;
      finishName = 'Xử lý làm mịn & Phun cát';
    } else if (currentFinish === 'painted') {
      finishFee = addonFees.paintedFinish || 85000;
      finishName = 'Sơn lót & Sơn màu hoàn thiện';
    }

    // 4. Base Unit Price
    const unitPriceRaw = materialCost + machineFee + mat.setupFee + finishFee;
    const unitPrice = Math.max(currentTech === 'sla' ? 70000 : 45000, unitPriceRaw);

    // 5. Quantity Discount
    let discountPercent = 0;
    if (currentQty >= 100) discountPercent = 25;
    else if (currentQty >= 50) discountPercent = 20;
    else if (currentQty >= 20) discountPercent = 15;
    else if (currentQty >= 5) discountPercent = 10;

    const subtotal = unitPrice * currentQty;
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const totalPrice = subtotal - discountAmount;

    // 6. Turnaround Time
    let deliveryDays = '24 giờ (Hỏa tốc)';
    if (estHours * currentQty > 48 || currentQty > 30) {
      deliveryDays = '2 - 3 ngày làm việc';
    } else if (estHours * currentQty > 100 || currentQty > 100) {
      deliveryDays = '4 - 6 ngày làm việc';
    }

    const quoteData = {
      techName: currentTech.toUpperCase(),
      matName: mat.name,
      weight: currentWeight,
      infill: currentInfill,
      layer: currentLayer,
      finishName,
      unitPrice,
      qty: currentQty,
      subtotal,
      discountPercent,
      discountAmount,
      totalPrice,
      estHours: Math.round(estHours * currentQty * 10) / 10,
      deliveryDays,
      syncedModelName: synced3dModelName
    };

    updatePriceUI(quoteData);
    window.lastCalculatedQuote = quoteData;
    return quoteData;
  }

  function updatePriceUI(data) {
    const elTotal = document.getElementById('calc-total-price');
    const elUnitPrice = document.getElementById('calc-unit-price');
    const elSubtotal = document.getElementById('calc-subtotal');
    const elDiscount = document.getElementById('calc-discount-badge');
    const elDiscountAmt = document.getElementById('calc-discount-amount');
    const elTime = document.getElementById('calc-est-time');
    const elDelivery = document.getElementById('calc-est-delivery');

    if (elTotal) elTotal.textContent = `${data.totalPrice.toLocaleString('vi-VN')} đ`;
    if (elUnitPrice) elUnitPrice.textContent = `${Math.round(data.totalPrice / data.qty).toLocaleString('vi-VN')} đ/chi tiết`;
    if (elSubtotal) elSubtotal.textContent = `${data.subtotal.toLocaleString('vi-VN')} đ`;
    
    if (elDiscountAmt) {
      elDiscountAmt.textContent = data.discountAmount > 0 
        ? `-${data.discountAmount.toLocaleString('vi-VN')} đ` 
        : '0 đ';
    }

    if (elDiscount) {
      if (data.discountPercent > 0) {
        elDiscount.textContent = `Tiết kiệm ${data.discountPercent}%`;
        elDiscount.classList.remove('hidden');
      } else {
        elDiscount.classList.add('hidden');
      }
    }

    if (elTime) elTime.textContent = `~${data.estHours} giờ máy`;
    if (elDelivery) elDelivery.textContent = data.deliveryDays;
  }

  // Thêm gói báo giá này vào giỏ hàng
  function addQuoteToCart() {
    const quote = calculateQuote();
    if (!quote) return;

    const itemName = quote.syncedModelName 
      ? `Bản in 3D: ${quote.syncedModelName}` 
      : `Dịch vụ gia công in 3D (${quote.techName} - ${quote.matName})`;

    const cartItem = {
      id: 'custom_print_' + Date.now(),
      title: itemName,
      price: Math.round(quote.totalPrice / quote.qty),
      qty: quote.qty,
      image: 'assets/images/eng-parts.jpg',
      category: 'custom-print',
      customOptions: {
        'Công nghệ': quote.techName,
        'Vật liệu': quote.matName,
        'Khối lượng': quote.weight + 'g',
        'Độ dày lớp': quote.layer + ' mm',
        'Infill': quote.infill + '%',
        'Hậu kỳ': quote.finishName,
        'Thời gian dự kiến': quote.deliveryDays
      },
      weightGrams: quote.weight * quote.qty
    };

    if (window.TTStore) {
      window.TTStore.addToCart(cartItem);
      if (window.TTCart && typeof window.TTCart.openCart === 'function') {
        window.TTCart.openCart();
      }
      if (window.showToast) {
        window.showToast(`Đã thêm ${quote.qty} bản in 3D vào giỏ hàng thành công!`);
      }
    }
  }

  // Format message for Zalo Direct Quote
  function getQuoteSummaryString() {
    const quote = window.lastCalculatedQuote || calculateQuote();
    const elTotal = document.getElementById('calc-total-price')?.textContent || '';
    const cloudLink = document.getElementById('calc-cloud-link')?.value.trim() || '';

    let linkStr = '';
    if (cloudLink) {
      linkStr = `\n- Link file/bản vẽ: ${cloudLink}`;
    }

    return `🔥 YÊU CẦU BÁO GIÁ IN 3D - T&T 3D STUDIO 🔥
----------------------------------------
- File/Mẫu: ${quote.syncedModelName || 'File khách tự thiết kế'}${linkStr}
- Công nghệ: ${quote.techName}
- Vật liệu: ${quote.matName}
- Trọng lượng ước tính: ${quote.weight}g
- Độ đặc ruột (Infill): ${quote.infill}%
- Độ phân giải lớp: ${quote.layer} mm
- Xử lý bề mặt: ${quote.finishName}
- Số lượng: ${quote.qty} chiếc
- TỔNG CHI PHÍ DỰ KIẾN: ${elTotal}
----------------------------------------
Xin chào T&T 3D Studio, tôi muốn gửi file 3D để xưởng kiểm tra file và in ngay!`;
  }

  function triggerZaloQuote() {
    const msg = getQuoteSummaryString();
    const cfg = (window.TTStore && window.TTStore.getConfig()) || window.TT_DEFAULT_CONFIG;
    const phoneZalo = (cfg.shopInfo && cfg.shopInfo.zaloPhone) || '0986888333';
    const cleanZalo = phoneZalo.replace(/\D/g, '');
    const encoded = encodeURIComponent(msg);
    const zaloUrl = `https://zalo.me/${cleanZalo}?text=${encoded}`;
    window.open(zaloUrl, '_blank');
  }

  function copyQuoteText() {
    const msg = getQuoteSummaryString();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg).then(() => {
        if (window.showToast) {
          window.showToast('Đã sao chép chi tiết báo giá vào Clipboard!');
        } else {
          alert('Đã sao chép chi tiết báo giá!');
        }
      });
    }
  }

  // Expose global API
  window.recalculateQuote = calculateQuote;

  // Init on DOM ready
  window.addEventListener('DOMContentLoaded', () => {
    initCalculator();
  });

})();
