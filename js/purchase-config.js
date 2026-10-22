/**
 * T&T 3D Labs - Unified Purchase Configuration Builder
 * Central Contract for Modal, Store Cards, and 3D Studio Viewport
 * Complies with Codex Master Controller Directive (Section 5.3)
 */

(function (window) {
  'use strict';

  /**
   * Validate user-selected or default configuration against product catalog definition
   * @param {Object} product - Product record from catalog store
   * @param {Object} config - { colorId, materialId, qty, customText }
   * @returns {Object} { color, material, qty, customText }
   */
  function validateConfiguration(product, config = {}) {
    if (!product || typeof product !== 'object') {
      throw new Error('Sản phẩm không hợp lệ.');
    }

    // 1. Validate quantity strictly (no parseInt, must be safe integer 1-99 - Codex R06)
    const qty = config.qty !== undefined ? config.qty : 1;
    if (typeof qty !== 'number' || !Number.isInteger(qty) || !Number.isSafeInteger(qty) || qty < 1 || qty > 99) {
      throw new Error('Số lượng sản phẩm phải là số nguyên từ 1 đến 99.');
    }

    // 2. Validate Color - không tự bịa biến thể khi mảng rỗng (Codex R06)
    const colors = Array.isArray(product.colors) ? product.colors : [];
    if (colors.length === 0) {
      throw new Error('Sản phẩm chưa có cấu hình màu sắc bán hợp lệ.');
    }
    let color = null;
    if (config.colorId) {
      color = colors.find(c => c.id === config.colorId);
      if (!color) {
        throw new Error(`Màu sắc "${config.colorId}" không thuộc tùy chọn của sản phẩm.`);
      }
    } else {
      color = colors[0];
    }

    // 3. Validate Material - không tự bịa vật liệu khi mảng rỗng (Codex R06)
    const materials = Array.isArray(product.materials) ? product.materials : [];
    if (materials.length === 0) {
      throw new Error('Sản phẩm chưa có cấu hình vật liệu bán hợp lệ.');
    }
    let material = null;
    if (config.materialId) {
      material = materials.find(m => m.id === config.materialId);
      if (!material) {
        throw new Error(`Vật liệu "${config.materialId}" không thuộc tùy chọn của sản phẩm.`);
      }
    } else {
      material = materials[0];
    }

    // Validate material price modifier
    const priceMod = material.priceModifier ?? 0;
    if (!Number.isSafeInteger(priceMod) || priceMod < 0) {
      throw new Error('Phụ phí vật liệu không hợp lệ.');
    }

    // 4. Validate Customization / Personalization requirements
    let customText = (typeof config.customText === 'string') ? config.customText.trim().normalize('NFC').slice(0, 100) : '';
    const requiresCustomText = product.type === 'monogram' || (product.specs && product.specs.requireCustomText) || (product.requiresCustomText === true);
    if (requiresCustomText && !customText) {
      throw new Error('Sản phẩm yêu cầu nhập nội dung cá nhân hóa trước khi đặt hàng.');
    }

    return {
      color: {
        id: color.id,
        name: color.name,
        hex: color.hex || '#26282B'
      },
      material: {
        id: material.id,
        name: material.name || material.label || 'Tiêu chuẩn',
        label: material.label || material.name || 'Tiêu chuẩn',
        priceModifier: priceMod
      },
      qty,
      customText: customText || null
    };
  }

  /**
   * Build unified configured line item for cart or direct checkout
   * @param {string} productId - Product ID
   * @param {Object} configuration - Configuration options
   * @returns {Object} Line item
   */
  function buildConfiguredLine(productId, configuration = {}) {
    let product = null;
    if (window.TTCatalogStore && typeof window.TTCatalogStore.getProductByIdSync === 'function') {
      product = window.TTCatalogStore.getProductByIdSync(productId);
    } else if (typeof window.getStoredProducts === 'function') {
      const list = window.getStoredProducts();
      product = list.find(p => p.id === productId);
    }

    if (!product || product.status !== 'active') {
      throw new Error('Sản phẩm không còn khả dụng.');
    }

    const { color, material, qty, customText } = validateConfiguration(product, configuration);

    const basePrice = product.price;
    if (!Number.isSafeInteger(basePrice) || basePrice < 0) {
      throw new Error('Giá gốc sản phẩm không hợp lệ.');
    }

    const unitPrice = basePrice + material.priceModifier;
    if (!Number.isSafeInteger(unitPrice) || unitPrice < 0) {
      throw new Error('Giá cấu hình không hợp lệ.');
    }

    return {
      id: product.id,
      title: product.title,
      image: product.image,
      category: product.category,
      price: unitPrice,
      qty,
      color,
      colorId: color.id,
      colorName: color.name,
      material,
      materialId: material.id,
      materialName: material.label || material.name,
      customText: customText || null,
      specs: product.specs || {}
    };
  }

  window.TTPurchaseConfig = {
    validateConfiguration,
    buildConfiguredLine
  };

})(typeof window !== 'undefined' ? window : this);
