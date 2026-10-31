/**
 * T&T 3D Labs - Firebase & Google Analytics Integration
 * Project: tt3dlabs
 * Measurement ID: G-GWCNJ0W537
 * Initialized with modern Firebase JS SDK v11 (ES Modules) & Graceful Fallback
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics, isSupported, logEvent } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  writeBatch,
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDq99rkCb_I8WeeG-qc_uhBnfAPep1emls",
  authDomain: "tt3dlabs.firebaseapp.com",
  projectId: "tt3dlabs",
  storageBucket: "tt3dlabs.firebasestorage.app",
  messagingSenderId: "851317729039",
  appId: "1:851317729039:web:96c5e9f91be1246442c07a",
  measurementId: "G-GWCNJ0W537"
};

// State holders
let app = null;
let analytics = null;
let db = null;
const eventQueue = [];

// 1. Initialize Firebase App & Firestore
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('[Firebase] Initialized App & Cloud Firestore for project:', firebaseConfig.projectId);
} catch (err) {
  console.warn('[Firebase] App initialization error:', err.message);
}

// 2. Check if Analytics is supported (handles file://, restricted storage, adblockers, offline)
isSupported().then((supported) => {
  if (supported && app) {
    try {
      analytics = getAnalytics(app);
      console.log('[Firebase Analytics] Connected with Measurement ID:', firebaseConfig.measurementId);
      
      // Flush queued events
      while (eventQueue.length > 0) {
        const { eventName, params } = eventQueue.shift();
        logEvent(analytics, eventName, params);
      }
    } catch (err) {
      console.warn('[Firebase Analytics] Initialization warning:', err.message);
    }
  } else {
    console.info('[Firebase Analytics] Running in offline or local mode (analytics muted).');
  }
}).catch((err) => {
  console.warn('[Firebase Analytics] Support check error:', err.message);
});

/**
 * Universal Analytics Helper for T&T 3D Labs
 */
export const TTAnalytics = {
  /**
   * Log generic event
   */
  log(eventName, params = {}) {
    if (!eventName) return;
    try {
      if (analytics) {
        logEvent(analytics, eventName, params);
      } else {
        eventQueue.push({ eventName, params });
        if (eventQueue.length > 50) eventQueue.shift();
      }
    } catch (e) {
      console.debug('[Analytics] Log event skipped:', eventName, e.message);
    }
  },

  /**
   * Log Page View
   */
  pageView(pageTitle, pagePath) {
    this.log('page_view', {
      page_title: pageTitle || document.title,
      page_location: window.location.href,
      page_path: pagePath || window.location.pathname + window.location.hash
    });
  },

  /**
   * Log Product View (Quick View or 3D Modal)
   */
  viewItem(product) {
    if (!product) return;
    this.log('view_item', {
      currency: 'VND',
      value: product.price || 0,
      items: [{
        item_id: product.id,
        item_name: product.title,
        item_category: product.category,
        price: product.price || 0,
        quantity: 1
      }]
    });
  },

  /**
   * Log Add to Cart
   */
  addToCart(item) {
    if (!item) return;
    this.log('add_to_cart', {
      currency: 'VND',
      value: (item.price || 0) * (item.qty || 1),
      items: [{
        item_id: item.id,
        item_name: item.title,
        item_category: item.category || '3D_Craft',
        price: item.price || 0,
        quantity: item.qty || 1,
        item_variant: item.colorName || item.colorId || ''
      }]
    });
  },

  /**
   * Log Remove from Cart
   */
  removeFromCart(item) {
    if (!item) return;
    this.log('remove_from_cart', {
      currency: 'VND',
      value: (item.price || 0) * (item.qty || 1),
      items: [{
        item_id: item.id,
        item_name: item.title,
        price: item.price || 0,
        quantity: item.qty || 1
      }]
    });
  },

  /**
   * Log Begin Checkout
   */
  beginCheckout(cartItems, totalValue) {
    this.log('begin_checkout', {
      currency: 'VND',
      value: totalValue || 0,
      items: (cartItems || []).map(i => ({
        item_id: i.id,
        item_name: i.title,
        price: i.price,
        quantity: i.qty || 1
      }))
    });
  },

  /**
   * Log Purchase / Direct Order Submission
   */
  purchase(order) {
    if (!order) return;
    const finalTotal = order.totals?.finalTotal || order.totals?.payableTotal || order.total || 0;
    this.log('purchase', {
      transaction_id: order.orderId || order.clientRequestId || ('ORD-' + Date.now()),
      currency: 'VND',
      value: finalTotal,
      tax: 0,
      shipping: order.totals?.shippingFee || 0,
      items: (order.items || []).map(i => ({
        item_id: i.id,
        item_name: i.title,
        price: i.price,
        quantity: i.qty || 1
      }))
    });
  },

  /**
   * Custom Event: 3D Product Personalization
   */
  personalize3D(productId, colorId, materialId, hasCustomText) {
    this.log('customize_3d_product', {
      product_id: productId,
      color: colorId,
      material: materialId,
      has_custom_text: !!hasCustomText
    });
  },

  /**
   * Custom Event: Gift Quiz Completed
   */
  giftQuizComplete(recipient, occasion, budget, matchedProductCount) {
    this.log('gift_quiz_complete', {
      recipient,
      occasion,
      budget,
      matched_count: matchedProductCount
    });
  }
};

/**
 * Cloud Firestore Realtime Engine for T&T 3D Labs
 */
export const TTFirestore = {
  get db() { return db; },

  /**
   * Save an order to Cloud Firestore collection "orders"
   */
  async saveOrder(orderRecord) {
    if (!db || !orderRecord) return { ok: false, error: 'Database not initialized' };
    try {
      const orderId = orderRecord.orderId || orderRecord.clientRequestId || ('ORD-' + Date.now());
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, {
        ...orderRecord,
        syncedToCloud: true,
        cloudUpdatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('[Firestore] Order synchronized to cloud:', orderId);
      return { ok: true, orderId };
    } catch (err) {
      console.warn('[Firestore] Failed to save order to cloud:', err.message);
      return { ok: false, error: err.message };
    }
  },

  /**
   * Realtime Listener for Orders (Admin Dashboard Live Feed)
   */
  listenOrders(callback, maxCount = 50) {
    if (!db || typeof callback !== 'function') return () => {};
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(maxCount));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const orders = [];
        snapshot.forEach(docSnap => {
          orders.push({ id: docSnap.id, ...docSnap.data() });
        });
        callback(orders);
      }, (err) => {
        console.warn('[Firestore] Orders listener warning:', err.message);
      });
      return unsubscribe;
    } catch (err) {
      console.warn('[Firestore] Failed to attach orders listener:', err.message);
      return () => {};
    }
  },

  /**
   * Update Order Status in Cloud Firestore
   */
  async updateOrderStatus(orderId, updatePayload) {
    if (!db || !orderId) return false;
    try {
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, {
        ...updatePayload,
        cloudUpdatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('[Firestore] Failed to update order status:', err.message);
      return false;
    }
  },

  /**
   * Fetch All Products from Cloud Firestore
   */
  async getProducts() {
    if (!db) return null;
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const prods = [];
      snapshot.forEach(d => prods.push(d.data()));
      return prods;
    } catch (err) {
      console.warn('[Firestore] Failed to fetch products:', err.message);
      return null;
    }
  },

  /**
   * Upsert a Single Product in Cloud Firestore
   */
  async upsertProduct(product) {
    if (!db || !product || !product.id) return { ok: false, error: 'Invalid product or database' };
    try {
      const prodRef = doc(db, 'products', product.id);
      await setDoc(prodRef, {
        ...product,
        cloudUpdatedAt: new Date().toISOString()
      }, { merge: true });
      return { ok: true, id: product.id };
    } catch (err) {
      console.warn('[Firestore] Failed to upsert product:', err.message);
      return { ok: false, error: err.message };
    }
  },

  /**
   * Delete a Single Product from Cloud Firestore
   */
  async deleteProduct(productId) {
    if (!db || !productId) return false;
    try {
      const prodRef = doc(db, 'products', productId);
      await deleteDoc(prodRef);
      return true;
    } catch (err) {
      console.warn('[Firestore] Failed to delete product:', err.message);
      return false;
    }
  },

  /**
   * Batch Sync All Products to Cloud Firestore
   */
  async syncAllProducts(productsList) {
    if (!db) return { ok: false, error: 'Database not initialized' };
    const list = Array.isArray(productsList) ? productsList : [];
    if (list.length === 0) return { ok: false, error: 'Empty products list' };

    let success = 0;
    let failed = 0;
    const errors = [];

    const CHUNK_SIZE = 10;
    for (let i = 0; i < list.length; i += CHUNK_SIZE) {
      const chunk = list.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(async (p) => {
        try {
          const prodRef = doc(db, 'products', p.id);
          await setDoc(prodRef, {
            ...p,
            cloudUpdatedAt: new Date().toISOString()
          }, { merge: true });
          success++;
        } catch (err) {
          failed++;
          errors.push(`${p.id}: ${err.message}`);
        }
      }));
    }

    // Update catalog metadata
    try {
      const currentRevision = (window.TTCatalogStore && window.TTCatalogStore.CURRENT_CATALOG_REVISION) || 'mw-105-v1-full';
      const metaRef = doc(db, 'metadata', 'catalog');
      await setDoc(metaRef, {
        totalProducts: success,
        revision: currentRevision,
        lastSync: new Date().toISOString(),
        source: 'T&T 3D Labs Studio Admin Portal'
      }, { merge: true });
    } catch (metaErr) {
      console.warn('[Firestore] Metadata sync warning:', metaErr.message);
    }

    return { ok: failed === 0, success, failed, errors };
  },

  /**
   * Save Telegram Bot Configuration to Cloud Firestore
   */
  async saveTelegramConfig(config) {
    if (!db || !config) return { ok: false, error: 'Database not initialized or invalid config' };
    try {
      const docRef = doc(db, 'system_configs', 'telegram');
      await setDoc(docRef, {
        token: (config.token || '').trim(),
        chatId: (config.chatId || '').trim(),
        enabled: config.enabled !== false,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return { ok: true };
    } catch (err) {
      console.warn('[Firestore] Failed to save telegram config:', err.message);
      return { ok: false, error: err.message };
    }
  },

  /**
   * Get Telegram Bot Configuration from Cloud Firestore
   */
  async getTelegramConfig() {
    if (!db) return null;
    try {
      const docRef = doc(db, 'system_configs', 'telegram');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (err) {
      console.warn('[Firestore] Failed to get telegram config:', err.message);
      return null;
    }
  }
};

// 3. Expose globally for classic scripts
if (typeof window !== 'undefined') {
  window.TTFirebase = {
    app,
    get db() { return db; },
    get analytics() { return analytics; },
    config: firebaseConfig,
    isAnalyticsSupported: isSupported
  };
  window.TTAnalytics = TTAnalytics;
  window.TTFirestore = TTFirestore;

  // Auto-sync Telegram Bot configuration into localStorage
  try {
    TTFirestore.getTelegramConfig().then(cloudCfg => {
      if (cloudCfg && cloudCfg.token && cloudCfg.chatId) {
        localStorage.setItem('TT_TELEGRAM_CONFIG_V1', JSON.stringify(cloudCfg));
      }
    }).catch(() => {});
  } catch (_) {}

  // Dispatch global ready event
  window.dispatchEvent(new CustomEvent('tt:firebase-ready', {
    detail: { app, db, config: firebaseConfig }
  }));

  // Automatic Initial Page View Tracking
  if (document.readyState === 'complete') {
    TTAnalytics.pageView();
  } else {
    window.addEventListener('load', () => TTAnalytics.pageView());
  }

  // Track Hash Change Navigation (SPA Storefront)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash || '#store';
    TTAnalytics.pageView(`T&T 3D Labs - ${hash.replace('#', '').toUpperCase()}`, hash);
  });
}
