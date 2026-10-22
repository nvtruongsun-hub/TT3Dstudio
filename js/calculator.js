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
    const infillObj = INFILL_FACTORS[selectedInfill] || INFILL_FACTORS['15'];

    // Update UI elements - Chuyển hoàn toàn sang Cổng Yêu Cầu Báo Giá (Codex R2-01)
    // Không tự tính giá giả định từ mẫu 75g; xưởng báo giá sau khi cắt lớp thật
    const elTotalPrice = document.getElementById('config-total-price');
    const elUnitPrice = document.getElementById('config-unit-price');
    const elSubtotal = document.getElementById('config-subtotal');
    const elDiscountBadge = document.getElementById('config-discount-badge');
    const elDiscountAmt = document.getElementById('config-discount-amt');
    const elWeightSummary = document.getElementById('config-weight-summary');

    if (elTotalPrice) elTotalPrice.textContent = 'Xưởng báo giá theo file';
    if (elUnitPrice) elUnitPrice.textContent = 'Xưởng báo giá sau khi cắt lớp';
    if (elSubtotal) elSubtotal.textContent = 'Chờ kỹ thuật viên phân tích slicer';

    if (elDiscountAmt) {
      elDiscountAmt.textContent = 'Áp dụng theo số lượng khi báo giá';
    }

    if (elDiscountBadge) {
      elDiscountBadge.classList.add('hidden');
    }

    if (elWeightSummary) {
      elWeightSummary.textContent = `${currentQty} chiếc • ${mat.name} (${infillObj.label})`;
    }

    const notesInput = document.getElementById('config-custom-notes');
    const customNotes = notesInput ? String(notesInput.value || '').trim().slice(0, 500) : '';

    return {
      kind: 'cad_quote_request',
      requestMode: configStep1Choice || 'upload',
      materialId: mat.id || selectedMaterial,
      materialName: mat.name,
      infill: selectedInfill,
      infillLabel: infillObj.label,
      qty: currentQty,
      notes: customNotes,
      fileName: uploadedFileMeta ? uploadedFileMeta.name : (configStep1Choice === 'idea' ? 'Gửi ảnh ý tưởng qua Zalo' : 'Chưa đính kèm file'),
      fileSizeBytes: uploadedFileMeta ? uploadedFileMeta.size : 0,
      fileSelectedLocally: !!uploadedFileMeta
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

  // Set Step 3 Quantity - Parse an toàn số nguyên 1-100 (Codex R2-01)
  window.onConfigQtyChange = function (val) {
    const parsed = Number(val);
    currentQty = (Number.isSafeInteger(parsed) && parsed >= 1 && parsed <= 100) ? parsed : 1;
    const rangeInput = document.getElementById('config-qty-slider');
    const numberInput = document.getElementById('config-qty-input');

    if (rangeInput) rangeInput.value = currentQty;
    if (numberInput) numberInput.value = currentQty;

    calculateConfigurator();
  };

  // Pure helper to build formatted CAD Quote Message (Codex R4-01 & R5-01)
  function buildCadQuoteMessage(data) {
    if (!data || typeof data !== 'object') return '';
    const requestMode = data.requestMode || 'upload';
    const fileStatus = data.fileSelectedLocally
      ? `Đã chọn file tại máy (${data.fileName || 'model.stl'})`
      : (requestMode === 'idea' ? 'Chưa có file CAD (Gửi ảnh phác thảo/ý tưởng)' : 'Chưa đính kèm file');

    // Bảo toàn nguyên văn nội dung khách sau giới hạn trim/length; không tự lọc cụm từ (Codex R5-01)
    const cleanNotes = String(data.notes ?? '').trim().slice(0, 500);

    return `🔥 YÊU CẦU BÁO GIÁ IN 3D - T&T 3D LABS 🔥
----------------------------------------
- Trạng thái file: ${fileStatus}
- Vật liệu mong muốn: ${data.materialName || 'Bio-PLA Matte'}
- Mật độ đặc (Infill): ${data.infillLabel || '15% - Tiêu chuẩn Decor'}
- Số lượng: ${data.qty || 1} chiếc
- Ghi chú: ${cleanNotes || 'Không'}
----------------------------------------
* File mới được chọn trên thiết bị. Quý khách vui lòng gửi kèm file CAD trong khung chat Zalo để kỹ thuật viên cắt lớp (slice) và báo giá chính xác!`;
  }

  // Refresh CAD prepared contact link when config updates (Codex R5-02)
  window.refreshPreparedCadContact = function () {
    const previewEl = document.getElementById('config-quote-preview');
    const openZaloBtn = document.getElementById('config-quote-open-zalo');
    if (!openZaloBtn) return;

    const message = (previewEl && ('value' in previewEl ? previewEl.value : previewEl.textContent)) || '';
    const cleanZalo = (window.TTStore && typeof window.TTStore.getZaloPhone === 'function')
      ? window.TTStore.getZaloPhone()
      : null;

    if (cleanZalo && message) {
      openZaloBtn.href = `https://zalo.me/${cleanZalo}?text=${encodeURIComponent(message)}`;
      openZaloBtn.target = '_blank';
      openZaloBtn.rel = 'noopener noreferrer';
      if (typeof openZaloBtn.removeAttribute === 'function') {
        openZaloBtn.removeAttribute('aria-disabled');
      } else {
        delete openZaloBtn['aria-disabled'];
      }
      openZaloBtn.onclick = null;
    } else {
      if (typeof openZaloBtn.removeAttribute === 'function') {
        openZaloBtn.removeAttribute('href');
      } else {
        delete openZaloBtn.href;
      }
      if (typeof openZaloBtn.setAttribute === 'function') {
        openZaloBtn.setAttribute('aria-disabled', 'true');
      } else {
        openZaloBtn['aria-disabled'] = 'true';
      }
      openZaloBtn.onclick = event => {
        if (event && event.preventDefault) event.preventDefault();
        const notice = 'Chưa cấu hình kênh Zalo hợp lệ. Vui lòng liên hệ hotline xưởng hoặc sao chép nội dung yêu cầu báo giá.';
        if (typeof window.showToast === 'function') window.showToast(notice);
        else if (typeof alert === 'function') alert(notice);
      };
    }
    return { ok: true, recipient: cleanZalo };
  };

  // Prepare CAD Quote Request and display in dedicated readonly preview (Codex R4-01 & R5-01)
  window.prepareCadQuoteRequest = function () {
    const data = calculateConfigurator();
    const message = buildCadQuoteMessage(data);

    // Dedicated preview element ONLY - NEVER overwrite customer's input notes (Codex R4-01)
    const previewEl = document.getElementById('config-quote-preview');
    if (previewEl) {
      if ('value' in previewEl) previewEl.value = message;
      previewEl.textContent = message;
    }

    if (typeof window.refreshPreparedCadContact === 'function') {
      window.refreshPreparedCadContact();
    }

    const cleanZalo = (window.TTStore && typeof window.TTStore.getZaloPhone === 'function')
      ? window.TTStore.getZaloPhone()
      : null;

    const statusEl = document.getElementById('config-quote-status');
    if (statusEl) {
      statusEl.textContent = 'Đã chuẩn bị nội dung yêu cầu báo giá. Bạn có thể sao chép hoặc mở Zalo.';
    }

    return { ok: true, message, recipient: cleanZalo };
  };

  // Copy CAD Quote Request to Clipboard (Codex R4-01)
  window.copyCadQuoteRequest = async function () {
    const previewEl = document.getElementById('config-quote-preview');
    const statusEl = document.getElementById('config-quote-status');

    if (!previewEl || !previewEl.value) {
      const notice = 'Hãy chuẩn bị yêu cầu trước khi sao chép.';
      if (statusEl) statusEl.textContent = notice;
      if (typeof window.showToast === 'function') window.showToast(notice);
      return { ok: false, code: 'NO_PREVIEW' };
    }

    const message = previewEl.value;

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        throw new Error('CLIPBOARD_UNAVAILABLE');
      }
      await navigator.clipboard.writeText(message);
      const okMsg = 'Đã sao chép nội dung yêu cầu.';
      if (statusEl) statusEl.textContent = okMsg;
      if (typeof window.showToast === 'function') {
        window.showToast('Đã sao chép nội dung yêu cầu báo giá!');
      }
      return { ok: true };
    } catch (err) {
      if (previewEl.focus) previewEl.focus();
      if (previewEl.select) previewEl.select();
      const failMsg = 'Chưa sao chép tự động; hãy sao chép nội dung bên dưới.';
      if (statusEl) statusEl.textContent = failMsg;
      if (typeof window.showToast === 'function') {
        window.showToast(failMsg);
      } else if (typeof window.alert === 'function') {
        window.alert(failMsg);
      }
      return { ok: false, code: 'MANUAL_COPY_REQUIRED' };
    }
  };

  // Backwards compatibility alias: prepares and copies without auto-opening window (Codex R4-01)
  window.sendZaloConfigQuote = async function () {
    const prep = window.prepareCadQuoteRequest();
    if (typeof window.copyCadQuoteRequest === 'function') {
      await window.copyCadQuoteRequest();
    }
    return prep;
  };

  // Add Custom 3D Print Service directly to Cart (Codex R2-01)
  // Biến configurator thành request-only: không tạo đơn hàng định giá mẫu chưa slice
  window.addConfigQuoteToCart = function () {
    const data = calculateConfigurator();
    const msg = 'Yêu cầu in 3D theo file CAD cần xưởng cắt lớp (slicer) để báo giá chính xác. Vui lòng bấm "Mở Zalo Gửi Yêu Cầu Báo Giá" để kỹ thuật viên tiếp nhận file và phản hồi chi phí.';
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    } else if (typeof alert === 'function') {
      alert(msg);
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
      if (!file) return;

      // Reject file rỗng (Codex R2-01)
      if (typeof file.size === 'number' && file.size <= 0) {
        const msg = 'File không có dữ liệu (0 byte). Vui lòng chọn file 3D hợp lệ.';
        if (window.showToast) window.showToast(msg);
        else if (typeof alert === 'function') alert(msg);
        return;
      }

      // Kiểm tra định dạng hợp lệ (Codex F05 & R2-01)
      const validExts = ['.stl', '.step', '.stp', '.3mf', '.obj'];
      const lastDot = file.name ? file.name.lastIndexOf('.') : -1;
      const ext = lastDot >= 0 ? file.name.slice(lastDot).toLowerCase() : '';
      if (!validExts.includes(ext)) {
        const msg = 'Định dạng file không hỗ trợ. Vui lòng chọn file .STL, .STEP, .3MF hoặc .OBJ';
        if (window.showToast) window.showToast(msg);
        else if (typeof alert === 'function') alert(msg);
        return;
      }

      // Giới hạn dung lượng đề xuất 25 MiB
      const maxBytes = 25 * 1024 * 1024;
      if (file.size > maxBytes) {
        const msg = 'Dung lượng file vượt quá giới hạn 25MB. Vui lòng nén file hoặc gửi trực tiếp qua Zalo.';
        if (window.showToast) window.showToast(msg);
        else if (typeof alert === 'function') alert(msg);
        return;
      }

      uploadedFileMeta = file;
      if (fileNameEl) fileNameEl.textContent = file.name;
      if (fileSizeEl) fileSizeEl.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB • Đã chọn file tại máy (Chưa phân tích hình học & Chưa gửi tới xưởng)`;
      if (filePreview) filePreview.classList.remove('hidden');
      dropzone.classList.add('hidden');
      calculateConfigurator();
      if (window.showToast) {
        window.showToast(`Đã chọn file: ${file.name}. Vui lòng bấm "Mở Zalo Gửi Yêu Cầu Báo Giá" để xưởng cắt lớp.`);
      }
    }
  }

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initFileUpload();
    calculateConfigurator();
  });

})();
