/**
 * T&T 3D Labs - Central Catalog Store & Data Synchronization Engine
 * Quản lý kho dữ liệu sản phẩm tập trung cho Client và Admin Portal
 * Tuân thủ quy tắc kiến trúc Codex Master Controller (Directive 2026-10-20)
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'tt_products';
  const EVENT_NAME = 'tt_products_updated';
  const FALLBACK_URL = 'products.json';

  let cachedProducts = null;
  let initPromise = null;

  /**
   * Kiểm tra schema tối thiểu của 1 sản phẩm
   */
  function isValidProduct(p) {
    return p && typeof p === 'object' &&
      typeof p.id === 'string' && p.id.trim() !== '' &&
      typeof p.title === 'string' && p.title.trim() !== '' &&
      typeof p.price === 'number' && Number.isSafeInteger(p.price) && p.price >= 0;
  }

  /**
   * Chuẩn hóa và làm sạch dữ liệu sản phẩm
   */
  function sanitizeProduct(p, index) {
    return {
      id: String(p.id || 'prod-' + (index + 1)).trim(),
      title: String(p.title || 'Sản phẩm ' + (index + 1)).trim(),
      category: String(p.category || 'desk-setup').trim(),
      type: String(p.type || 'standard').trim(),
      price: Math.max(0, parseInt(p.price, 10) || 0),
      originalPrice: p.originalPrice ? Math.max(0, parseInt(p.originalPrice, 10) || 0) : null,
      badge: String(p.badge || '✦ 3D Print').trim(),
      image: String(p.image || 'assets/images/product-nfc-wifi.jpg').trim(),
      imageAlt: String(p.imageAlt || p.title || 'Sản phẩm in 3D').trim(),
      imageSource: ['upload', 'url', 'preset'].includes(p.imageSource) ? p.imageSource : 'url',
      presetId: p.presetId ? String(p.presetId).trim() : null,
      modelKey: String(p.modelKey || 'nfc_wifi').trim(),
      desc: String(p.desc || '').trim(),
      headlineBenefit: String(p.headlineBenefit || '').trim(),
      specLine: String(p.specLine || '').trim(),
      specs: (p.specs && typeof p.specs === 'object') ? p.specs : {},
      colors: Array.isArray(p.colors) ? p.colors : [],
      materials: Array.isArray(p.materials) ? p.materials : [],
      status: ['active', 'draft', 'archived'].includes(p.status) ? p.status : 'active',
      updatedAt: p.updatedAt || new Date().toISOString()
    };
  }

  /**
   * Tải catalog nền từ products.json
   */
  async function fetchDefaultCatalog() {
    try {
      const res = await fetch(FALLBACK_URL + '?t=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.filter(isValidProduct).map(sanitizeProduct);
      }
    } catch (err) {
      console.warn('[CatalogStore] Không thể tải products.json nền:', err);
    }
    return [];
  }

  /**
   * Khởi tạo và đọc catalog
   * - Nếu chưa có khóa trong localStorage: tải products.json và lưu.
   * - Nếu có mảng hợp lệ (kể cả []): tôn trọng tuyệt đối danh sách đó.
   * - Nếu dữ liệu hỏng: báo lỗi, không tự ghi đè làm mất dữ liệu của người dùng.
   */
  async function initCatalog() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
          // Lần đầu mở: Tải products.json
          const defaults = await fetchDefaultCatalog();
          cachedProducts = defaults;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
          } catch (e) {
            console.warn('[CatalogStore] Không thể ghi cache khởi đầu vào localStorage:', e);
          }
          return cachedProducts;
        }

        // Đã có trong localStorage
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Tôn trọng mảng lưu trữ, kể cả khi rỗng []
          cachedProducts = parsed.filter(isValidProduct).map(sanitizeProduct);
          return cachedProducts;
        } else {
          console.error('[CatalogStore] Dữ liệu trong localStorage không phải mảng!');
          cachedProducts = [];
          return cachedProducts;
        }
      } catch (err) {
        console.error('[CatalogStore] Lỗi đọc dữ liệu localStorage:', err);
        // Không tự ghi đè để bảo vệ dữ liệu hỏng cần khôi phục
        cachedProducts = await fetchDefaultCatalog();
        return cachedProducts;
      }
    })();

    return initPromise;
  }

  /**
   * Lấy danh sách sản phẩm đồng bộ (sau khi init hoàn tất)
   */
  function getProductsSync(onlyActive = true) {
    const list = cachedProducts || [];
    if (onlyActive) {
      return list.filter(p => p.status === 'active');
    }
    return list;
  }

  /**
   * Lấy danh sách sản phẩm bất đồng bộ
   */
  async function getProducts(onlyActive = true) {
    await initCatalog();
    return getProductsSync(onlyActive);
  }

  /**
   * Lấy 1 sản phẩm theo ID
   */
  async function getProductById(id) {
    const list = await getProducts(false);
    return list.find(p => p.id === id) || null;
  }

  /**
   * Lưu toàn bộ catalog mới
   */
  function saveProducts(productsList) {
    if (!Array.isArray(productsList)) {
      throw new Error('Catalog phải là một mảng!');
    }
    const sanitized = productsList.map(sanitizeProduct);
    const jsonStr = JSON.stringify(sanitized);

    // Kiểm tra quota trước khi lưu
    try {
      localStorage.setItem(STORAGE_KEY, jsonStr);
      cachedProducts = sanitized;
      // Phát sự kiện trong cùng window
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { products: sanitized } }));
      return true;
    } catch (err) {
      console.error('[CatalogStore] Lỗi ghi localStorage (có thể đầy quota):', err);
      throw err;
    }
  }

  /**
   * Thêm hoặc Cập nhật 1 sản phẩm
   */
  async function upsertProduct(productData) {
    await initCatalog();
    const list = [...(cachedProducts || [])];
    const clean = sanitizeProduct(productData, list.length);
    const existingIndex = list.findIndex(p => p.id === clean.id);

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...clean, updatedAt: new Date().toISOString() };
    } else {
      list.push(clean);
    }

    saveProducts(list);
    return clean;
  }

  /**
   * Xóa 1 sản phẩm
   */
  async function deleteProduct(productId) {
    await initCatalog();
    const list = (cachedProducts || []).filter(p => p.id !== productId);
    saveProducts(list);
    return true;
  }

  /**
   * Khôi phục về danh mục gốc từ products.json
   */
  async function resetToDefaults() {
    const defaults = await fetchDefaultCatalog();
    saveProducts(defaults);
    return defaults;
  }

  /**
   * Lắng nghe sự kiện thay đổi từ các tab khác (storage event)
   */
  window.addEventListener('storage', function (e) {
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
    }
  });

  // Export API
  window.TTCatalogStore = {
    init: initCatalog,
    getProducts,
    getProductsSync,
    getProductById,
    saveProducts,
    upsertProduct,
    deleteProduct,
    resetToDefaults,
    EVENT_NAME,
    STORAGE_KEY
  };

  // Khởi động sẵn sàng ngầm
  initCatalog();

})(window);
