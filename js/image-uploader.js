/**
 * T&T 3D Labs - Intelligent Client-Side Image Uploader & Optimizer
 * Xử lý kiểm tra định dạng, nén ảnh client-side bằng Canvas, chống tràn Quota LocalStorage
 * Tuân thủ quy chuẩn kỹ thuật Codex Master Controller (Directive 2026-10-20)
 */

(function (window) {
  'use strict';

  const MAX_INPUT_BYTES = 6 * 1024 * 1024; // 6 MiB
  const MAX_PIXELS = 24 * 1000 * 1000;    // 24 Megapixels
  const MAX_LONG_EDGE = 1200;              // 1200px
  const TARGET_QUALITY = 0.82;             // 82% WebP / JPEG quality
  const STORAGE_SAFETY_LIMIT = 3.5 * 1024 * 1024; // Ngưỡng an toàn 3.5MB localStorage

  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  /**
   * Tính toán dung lượng hiện tại trong localStorage
   */
  function getStorageUsageBytes() {
    let total = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key);
        if (val) {
          total += (key.length + val.length) * 2; // UTF-16
        }
      }
    } catch (e) {
      console.warn('[ImageUploader] Không thể đọc dung lượng storage:', e);
    }
    return total;
  }

  /**
   * Kiểm tra tính hợp lệ của URL ảnh
   */
  function isValidImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('file:') || trimmed.startsWith('vbscript:')) {
      return false;
    }
    if (trimmed.startsWith('data:image/')) {
      return trimmed.startsWith('data:image/jpeg') || 
             trimmed.startsWith('data:image/png') || 
             trimmed.startsWith('data:image/webp');
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('assets/')) {
      return true;
    }
    return false;
  }

  /**
   * Nén và resize ảnh từ File bằng Canvas
   * @param {File} file 
   * @returns {Promise<{ dataUrl: string, width: number, height: number, sizeBytes: number }>}
   */
  function processImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error('Vui lòng chọn một tệp hình ảnh.'));
      }

      // 1. Kiểm tra kích thước file gốc
      if (file.size > MAX_INPUT_BYTES) {
        return reject(new Error(`Ảnh gốc quá lớn (${(file.size / (1024 * 1024)).toFixed(1)}MB). Vui lòng chọn ảnh dưới 6MB.`));
      }

      // 2. Kiểm tra MIME type
      const mime = file.type.toLowerCase();
      if (!ALLOWED_MIME_TYPES.includes(mime)) {
        if (mime.includes('svg') || mime.includes('gif') || mime.includes('heic') || mime.includes('heif')) {
          return reject(new Error('Hệ thống chỉ hỗ trợ định dạng ảnh tĩnh JPG, PNG, WEBP (không hỗ trợ SVG, GIF, HEIC).'));
        }
        return reject(new Error('Định dạng ảnh không được hỗ trợ. Vui lòng dùng JPG, PNG hoặc WEBP.'));
      }

      // 3. Kiểm tra hạn mức bộ nhớ trình duyệt
      const currentUsage = getStorageUsageBytes();
      if (currentUsage > STORAGE_SAFETY_LIMIT) {
        return reject(new Error('Bộ nhớ trình duyệt (localStorage) đã gần đầy. Vui lòng dùng đường dẫn URL ảnh hoặc ảnh mẫu Preset.'));
      }

      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = function () {
        URL.revokeObjectURL(objectUrl);

        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;

        // 4. Kiểm tra độ phân giải quá cao
        if (w * h > MAX_PIXELS) {
          return reject(new Error(`Độ phân giải ảnh quá cao (${w}x${h} = ${(w * h / 1e6).toFixed(1)}MP). Giới hạn tối đa 24MP.`));
        }

        // 5. Tính kích thước resize giữ tỉ lệ
        let targetW = w;
        let targetH = h;
        if (w > MAX_LONG_EDGE || h > MAX_LONG_EDGE) {
          if (w >= h) {
            targetW = MAX_LONG_EDGE;
            targetH = Math.round((h * MAX_LONG_EDGE) / w);
          } else {
            targetH = MAX_LONG_EDGE;
            targetW = Math.round((w * MAX_LONG_EDGE) / h);
          }
        }

        // 6. Vẽ lên Canvas và xuất Data URL
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Trình duyệt không hỗ trợ Canvas 2D.'));
        }

        // Khử răng cưa chất lượng cao
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Xuất WebP trước, fallback sang JPEG
        let dataUrl = canvas.toDataURL('image/webp', TARGET_QUALITY);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', TARGET_QUALITY);
        }

        // Ước tính kích thước byte của chuỗi Base64
        const estimatedBytes = Math.round((dataUrl.length * 3) / 4);

        resolve({
          dataUrl,
          width: targetW,
          height: targetH,
          sizeBytes: estimatedBytes,
          source: 'upload'
        });
      };

      img.onerror = function () {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Tệp hình ảnh bị hỏng hoặc không thể giải mã.'));
      };

      img.src = objectUrl;
    });
  }

  window.TTImageUploader = {
    processImageFile,
    isValidImageUrl,
    getStorageUsageBytes
  };

})(window);
