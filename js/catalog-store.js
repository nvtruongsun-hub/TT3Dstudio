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
  const SCHEMA_VERSION_KEY = 'tt_schema_version';
  const CURRENT_SCHEMA_VERSION = 4;

  let cachedProducts = null;
  let initPromise = null;
  let isWritingStorage = false;

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
    const idx = (typeof index === 'number') ? index + 1 : 1;
    return {
      id: String(p.id || 'prod-' + idx).trim(),
      title: String(p.title || 'Sản phẩm ' + idx).trim(),
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
      specs: (p.specs && typeof p.specs === 'object' && !Array.isArray(p.specs)) ? { ...p.specs } : {},
      colors: Array.isArray(p.colors) ? p.colors.map(c => ({
        id: String(c.id || 'c_default').trim(),
        name: String(c.name || 'Mặc định').trim(),
        hex: String(c.hex || '#26282B').trim()
      })) : [],
      materials: Array.isArray(p.materials) ? p.materials.map(m => ({
        id: String(m.id || 'm_default').trim(),
        name: String(m.name || m.label || 'Tiêu chuẩn').trim(),
        label: String(m.label || m.name || 'Tiêu chuẩn').trim(),
        desc: String(m.desc || '').trim(),
        priceModifier: Math.max(0, parseInt(m.priceModifier, 10) || 0)
      })) : [],
      status: ['active', 'draft', 'archived'].includes(p.status) ? p.status : 'active',
      updatedAt: p.updatedAt || new Date().toISOString()
    };
  }

  /**
   * Hợp nhất an toàn các trường được cung cấp (Partial Update)
   */
  function mergeProvidedFields(existing, patch) {
    if (!existing) return patch;
    const merged = { ...existing };
    for (const key of Object.keys(patch)) {
      if (patch[key] === undefined) continue;

      if (key === 'specs' && patch.specs && typeof patch.specs === 'object' && !Array.isArray(patch.specs)) {
        merged.specs = { ...(existing.specs || {}), ...patch.specs };
      } else {
        merged[key] = patch[key];
      }
    }
    merged.updatedAt = new Date().toISOString();
    return merged;
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
   * Làm giàu dữ liệu sản phẩm cũ (Enrichment) từ bản gốc chuẩn
   * Bảo tồn tuyệt đối dữ liệu tùy chỉnh của người dùng (ảnh upload, trọng lượng riêng, v.v.)
   */
  function enrichWithBaseProduct(storedItem, baseDefaults) {
    if (!baseDefaults || !Array.isArray(baseDefaults) || baseDefaults.length === 0) {
      return storedItem;
    }
    const base = baseDefaults.find(b => b.id === storedItem.id);
    if (!base) {
      // Sản phẩm tự tạo không có bản chuẩn: không chế tạo tùy chọn giả
      return storedItem;
    }

    const enriched = { ...storedItem };
    let hasChanged = false;

    // 1. Phục hồi màu nếu thiếu hoặc rỗng
    if (!Array.isArray(enriched.colors) || enriched.colors.length === 0) {
      if (Array.isArray(base.colors) && base.colors.length > 0) {
        enriched.colors = JSON.parse(JSON.stringify(base.colors));
        hasChanged = true;
      }
    }

    // 2. Phục hồi vật liệu nếu thiếu hoặc rỗng
    if (!Array.isArray(enriched.materials) || enriched.materials.length === 0) {
      if (Array.isArray(base.materials) && base.materials.length > 0) {
        enriched.materials = JSON.parse(JSON.stringify(base.materials));
        hasChanged = true;
      }
    }

    // 3. Phục hồi từng thông số kỹ thuật thiếu (giữ nguyên thông số người dùng đã sửa, ví dụ 101g)
    enriched.specs = (enriched.specs && typeof enriched.specs === 'object' && !Array.isArray(enriched.specs))
      ? { ...enriched.specs }
      : {};

    if (base.specs && typeof base.specs === 'object') {
      for (const [k, v] of Object.entries(base.specs)) {
        if (enriched.specs[k] === undefined || enriched.specs[k] === null || enriched.specs[k] === '' || enriched.specs[k] === 'N/A') {
          enriched.specs[k] = v;
          hasChanged = true;
        }
      }
    }

    // 4. Phục hồi modelKey, headlineBenefit, specLine nếu bị thiếu
    if (!enriched.modelKey && base.modelKey) {
      enriched.modelKey = base.modelKey;
      hasChanged = true;
    }
    if (!enriched.headlineBenefit && base.headlineBenefit) {
      enriched.headlineBenefit = base.headlineBenefit;
      hasChanged = true;
    }
    if (!enriched.specLine && base.specLine) {
      enriched.specLine = base.specLine;
      hasChanged = true;
    }

    return { item: enriched, changed: hasChanged };
  }

  /**
   * Khởi tạo và đọc catalog với cơ chế Auto-Migration
   */
  async function initCatalog() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
          // Lần đầu mở: Tải products.json và lưu
          const defaults = await fetchDefaultCatalog();
          cachedProducts = defaults;
          try {
            isWritingStorage = true;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
            localStorage.setItem(SCHEMA_VERSION_KEY, String(CURRENT_SCHEMA_VERSION));
          } catch (e) {
            console.warn('[CatalogStore] Không thể ghi cache khởi đầu vào localStorage:', e);
          } finally {
            isWritingStorage = false;
          }
          return cachedProducts;
        }

        // Đã có trong localStorage
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch (jsonErr) {
          console.error('[CatalogStore] Dữ liệu trong localStorage không hợp lệ (hỏng JSON):', jsonErr);
          // Giữ nguyên dữ liệu thô bị hỏng để người dùng khôi phục, không tự ghi đè []
          cachedProducts = await fetchDefaultCatalog();
          return cachedProducts;
        }

        if (Array.isArray(parsed)) {
          // Tôn trọng mảng rỗng [] nếu người dùng đã xóa hết sản phẩm
          if (parsed.length === 0) {
            cachedProducts = [];
            return cachedProducts;
          }

          // Kiểm tra và thực hiện làm giàu dữ liệu (Enrichment Migration)
          const defaults = await fetchDefaultCatalog();
          let needsUpdate = false;
          const enrichedList = parsed.filter(isValidProduct).map((p, idx) => {
            const sanitized = sanitizeProduct(p, idx);
            const res = enrichWithBaseProduct(sanitized, defaults);
            if (res.changed) needsUpdate = true;
            return res.item || res;
          });

          cachedProducts = enrichedList;

          // Nếu có bổ sung thông tin thiếu, lưu lại bản đã làm giàu an toàn
          if (needsUpdate) {
            try {
              isWritingStorage = true;
              localStorage.setItem(STORAGE_KEY, JSON.stringify(enrichedList));
              localStorage.setItem(SCHEMA_VERSION_KEY, String(CURRENT_SCHEMA_VERSION));
            } catch (saveErr) {
              console.warn('[CatalogStore] Không thể lưu migration vào localStorage:', saveErr);
            } finally {
              isWritingStorage = false;
            }
          }

          return cachedProducts;
        } else {
          console.error('[CatalogStore] Dữ liệu trong localStorage không phải mảng!');
          cachedProducts = [];
          return cachedProducts;
        }
      } catch (err) {
        console.error('[CatalogStore] Lỗi đọc dữ liệu localStorage:', err);
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
   * Lấy 1 sản phẩm theo ID (đồng bộ)
   */
  function getProductByIdSync(id) {
    const list = cachedProducts || [];
    return list.find(p => p.id === id) || null;
  }

  /**
   * Lấy 1 sản phẩm theo ID (bất đồng bộ)
   */
  async function getProductById(id) {
    await initCatalog();
    return getProductByIdSync(id);
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

    try {
      isWritingStorage = true;
      localStorage.setItem(STORAGE_KEY, jsonStr);
      cachedProducts = sanitized;
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { products: sanitized } }));
      return true;
    } catch (err) {
      console.error('[CatalogStore] Lỗi ghi localStorage (có thể đầy quota):', err);
      throw err;
    } finally {
      isWritingStorage = false;
    }
  }

  /**
   * Thêm hoặc Cập nhật 1 sản phẩm (Partial Merge bảo vệ trường không truyền vào)
   */
  async function upsertProduct(patch) {
    await initCatalog();
    if (!patch || typeof patch !== 'object' || !patch.id) {
      throw new Error('Cần cung cấp dữ liệu sản phẩm với id hợp lệ!');
    }

    const list = [...(cachedProducts || [])];
    const existingIndex = list.findIndex(p => p.id === patch.id);

    if (existingIndex >= 0) {
      const merged = mergeProvidedFields(list[existingIndex], patch);
      const clean = sanitizeProduct(merged, existingIndex);
      list[existingIndex] = clean;
    } else {
      const clean = sanitizeProduct(patch, list.length);
      list.push(clean);
    }

    saveProducts(list);
    return getProductByIdSync(patch.id);
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
   * Tránh lặp vô hạn bằng kiểm tra nguồn phát
   */
  window.addEventListener('storage', function (e) {
    if (isWritingStorage) return;
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
    initCatalog,
    getProducts,
    getProductsSync,
    getProductById,
    getProductByIdSync,
    saveProducts,
    upsertProduct,
    deleteProduct,
    resetToDefaults,
    EVENT_NAME,
    STORAGE_KEY
  };

  // Khởi động sẵn sàng ngầm
  initCatalog();

})(typeof window !== 'undefined' ? window : this);
