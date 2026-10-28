/**
 * T&T 3D Labs - Studio State Manager (Single Source of Truth)
 * Architecture: Codex Master Controller (Directive TT3D-ARCH-20261023)
 * Audited by: Codex Code-Review-Pro-Max
 * Implemented by: Antigravity Lead Executor
 *
 * Centralizes Studio configuration, deep-immutable state isolation,
 * validation & pricing synchronization via TTPurchaseConfig.
 */

(function (window) {
  'use strict';

  const DEFAULT_STATE = {
    productId: null,
    product: null,
    colorId: null,
    colorName: '',
    materialId: 'pla_matte',
    materialName: 'PLA Matte Tiêu Chuẩn',
    customText: '',
    fontId: 'sans',
    quantity: 1,
    revision: 1,
    isValid: false,
    validationError: null,
    calculatedPrice: 0,
    priceSummary: {
      basePrice: 0,
      materialModifier: 0,
      customTextFee: 0,
      unitPrice: 0,
      totalPrice: 0
    }
  };

  let currentState = Object.assign({}, DEFAULT_STATE);
  const listeners = new Set();

  /**
   * Deep recursive clone and freeze - guarantees complete immutability
   * across nested arrays, specs, and objects.
   */
  function deepCloneAndFreeze(val) {
    if (val === null || typeof val !== 'object') {
      return val;
    }
    if (Array.isArray(val)) {
      const copyArr = val.map(item => deepCloneAndFreeze(item));
      return Object.freeze(copyArr);
    }
    const copyObj = {};
    for (const key of Object.keys(val)) {
      copyObj[key] = deepCloneAndFreeze(val[key]);
    }
    return Object.freeze(copyObj);
  }

  /**
   * Deep recursive mutable clone - isolates internal state from input references.
   */
  function deepCloneMutable(val) {
    if (val === null || typeof val !== 'object') {
      return val;
    }
    if (Array.isArray(val)) {
      return val.map(item => deepCloneMutable(item));
    }
    const copyObj = {};
    for (const key of Object.keys(val)) {
      copyObj[key] = deepCloneMutable(val[key]);
    }
    return copyObj;
  }

  function deepCloneState(s) {
    return Object.freeze({
      productId: s.productId,
      product: s.product ? deepCloneAndFreeze(s.product) : null,
      colorId: s.colorId,
      colorName: s.colorName,
      materialId: s.materialId,
      materialName: s.materialName,
      customText: s.customText,
      fontId: s.fontId,
      quantity: s.quantity,
      revision: s.revision,
      isValid: s.isValid,
      validationError: s.validationError,
      calculatedPrice: s.calculatedPrice,
      priceSummary: deepCloneAndFreeze(s.priceSummary)
    });
  }

  function notify() {
    currentState.revision++;
    const stateSnapshot = deepCloneState(currentState);
    listeners.forEach(fn => {
      try {
        fn(stateSnapshot);
      } catch (err) {
        console.error('[StudioState] Listener error:', err);
      }
    });
  }

  function validateAndRecalculate() {
    if (!currentState.product) {
      currentState.isValid = false;
      currentState.validationError = 'Chưa chọn sản phẩm.';
      currentState.calculatedPrice = 0;
      currentState.priceSummary = {
        basePrice: 0,
        materialModifier: 0,
        customTextFee: 0,
        unitPrice: 0,
        totalPrice: 0
      };
      return;
    }

    const prod = currentState.product;
    const basePrice = Number.isSafeInteger(prod.price) && prod.price >= 0 ? prod.price : 0;

    let isValid = false;
    let validationError = null;
    let matMod = 0;

    // Validate with TTPurchaseConfig using strict contract
    if (window.TTPurchaseConfig && typeof window.TTPurchaseConfig.validateConfiguration === 'function') {
      try {
        const validated = window.TTPurchaseConfig.validateConfiguration(prod, {
          colorId: currentState.colorId,
          materialId: currentState.materialId,
          qty: currentState.quantity,
          customText: currentState.customText
        });
        isValid = true;
        if (validated && validated.material && Number.isSafeInteger(validated.material.priceModifier)) {
          matMod = validated.material.priceModifier;
          currentState.materialName = validated.material.name;
        }
        if (validated && validated.color) {
          currentState.colorName = validated.color.name;
        }
      } catch (err) {
        isValid = false;
        validationError = err.message;
      }
    } else {
      // Basic fallback when TTPurchaseConfig is unavailable
      const colors = Array.isArray(prod.colors) ? prod.colors : [];
      const materials = Array.isArray(prod.materials) ? prod.materials : [];
      const hasColor = colors.length === 0 || colors.some(c => c.id === currentState.colorId);
      const matchedMat = materials.find(m => m.id === currentState.materialId);
      const requiresText = prod.type === 'monogram' || (prod.specs && prod.specs.requireCustomText) || (prod.requiresCustomText === true);
      const hasText = !requiresText || (typeof currentState.customText === 'string' && currentState.customText.trim().length > 0);

      if (hasColor && (materials.length === 0 || matchedMat) && hasText && basePrice > 0) {
        isValid = true;
        matMod = (matchedMat && Number.isSafeInteger(matchedMat.priceModifier)) ? matchedMat.priceModifier : 0;
      } else {
        isValid = false;
        validationError = 'Cấu hình không hợp lệ.';
      }
    }

    const textFee = 0;
    const unitPrice = isValid ? Math.max(0, basePrice + matMod + textFee) : 0;
    const qty = Math.max(1, Math.min(99, Math.floor(currentState.quantity) || 1));
    const totalPrice = unitPrice * qty;

    currentState.priceSummary = {
      basePrice: basePrice,
      materialModifier: matMod,
      customTextFee: textFee,
      unitPrice: unitPrice,
      totalPrice: totalPrice
    };
    currentState.calculatedPrice = unitPrice;
    currentState.isValid = isValid && (unitPrice > 0);
    currentState.validationError = validationError;
  }

  const StudioState = {
    getState: function () {
      return deepCloneState(currentState);
    },

    subscribe: function (listener) {
      if (typeof listener === 'function') {
        listeners.add(listener);
        listener(deepCloneState(currentState));
        return () => listeners.delete(listener);
      }
      return () => {};
    },

    setProduct: function (product) {
      if (!product) return;
      currentState.productId = product.id;
      // Deep clone product to completely isolate from external caller mutations
      currentState.product = deepCloneMutable(product);

      // Select default color if available
      if (Array.isArray(product.colors) && product.colors.length > 0) {
        currentState.colorId = product.colors[0].id;
        currentState.colorName = product.colors[0].name;
      } else {
        currentState.colorId = 'default';
        currentState.colorName = 'Tiêu chuẩn';
      }

      // Select default material if available
      if (Array.isArray(product.materials) && product.materials.length > 0) {
        currentState.materialId = product.materials[0].id;
        currentState.materialName = product.materials[0].name || product.materials[0].label || 'Tiêu chuẩn';
      } else {
        currentState.materialId = 'pla_matte';
        currentState.materialName = 'PLA Matte Tiêu Chuẩn';
      }

      validateAndRecalculate();
      notify();
    },

    setColor: function (colorId, colorName) {
      currentState.colorId = colorId;
      currentState.colorName = colorName || colorId;
      validateAndRecalculate();
      notify();
    },

    setMaterial: function (materialId, materialName) {
      currentState.materialId = materialId;
      currentState.materialName = materialName || materialId;
      validateAndRecalculate();
      notify();
    },

    setCustomText: function (text) {
      const clean = (typeof text === 'string') ? text.slice(0, 40).normalize('NFC') : '';
      currentState.customText = clean;
      validateAndRecalculate();
      notify();
    },

    setFont: function (fontId) {
      currentState.fontId = fontId || 'sans';
      notify();
    },

    setQuantity: function (qty) {
      currentState.quantity = Math.max(1, Math.min(99, Math.floor(qty) || 1));
      validateAndRecalculate();
      notify();
    },

    createSnapshot: function () {
      if (!currentState.isValid || !currentState.product || currentState.calculatedPrice <= 0) {
        return null;
      }

      return Object.freeze({
        id: currentState.productId,
        title: currentState.product.title,
        price: currentState.priceSummary.unitPrice,
        unitPrice: currentState.priceSummary.unitPrice,
        qty: currentState.quantity,
        colorId: currentState.colorId,
        colorName: currentState.colorName,
        materialId: currentState.materialId,
        materialName: currentState.materialName,
        customText: currentState.customText ? currentState.customText.trim() : '',
        fontId: currentState.fontId,
        snapshotRevision: currentState.revision,
        createdAt: new Date().toISOString()
      });
    },

    reset: function () {
      currentState = Object.assign({}, DEFAULT_STATE);
      notify();
    }
  };

  window.TTStudioState = StudioState;

})(typeof window !== 'undefined' ? window : globalThis);
