/**
 * T&T 3D Studio - Main Application Controller & Multi-View Workspace Router
 * Benchmark: Linear / Nomad / Bambu Lab / Apple Workspace Standards
 * (Sheet 3: ID-01, ID-07, ID-09, ID-13, ID-36, Tab-Architecture R1-R3)
 */

(function () {
  'use strict';

  // --- 1. GLOBAL WORKSPACE ROUTER & STATE ENGINE ---
  const WORKSPACE_VIEWS = [
    'view-store',
    'view-personalize',
    'view-inspiration',
    'view-tracking',
    'view-support',
    // Compatibility IDs for existing regression suites
    'view-studio3d',
    'view-configurator',
    'view-standards'
  ];

  function getAllowedCategories() {
    const reg = (window.TTCatalogStore && window.TTCatalogStore.CATEGORY_REGISTRY) || window.TTCategoryRegistry;
    if (reg && typeof reg === 'object') {
      return new Set(Object.keys(reg));
    }
    return new Set([
      'Trang_Diem_Vanity',
      'Decor_Den_Noi_That',
      'Do_Choi_Moc_Khoa',
      'Hop_De_Ban_Tien_Ich',
      'Ca_Nhan_Hoa_NFC'
    ]);
  }

  const ALLOWED_CATEGORIES = getAllowedCategories();

  /**
   * Phân tách URL hash thành route path và category query (Codex Directive)
   * Không lowercase toàn bộ hash vì ID danh mục có chữ hoa
   */
  function parseStoreHash(hash, allowedCategories = getAllowedCategories()) {
    const raw = String(hash || '#store').replace(/^#/, '');
    const separator = raw.indexOf('?');

    const path = (
      separator < 0 ? raw : raw.slice(0, separator)
    ).toLowerCase();

    const query = separator < 0 ? '' : raw.slice(separator + 1);
    const params = new URLSearchParams(query);
    const requested = params.get('cat');

    return {
      path,
      category: (allowedCategories && allowedCategories.has(requested)) ? requested : 'all',
      params
    };
  }
  window.parseStoreHash = parseStoreHash;

  const VIEW_HASH_MAP = {
    'view-store': '#store',
    'view-personalize': '#personalize',
    'view-inspiration': '#inspiration',
    'view-tracking': '#tracking',
    'view-support': '#support',
    'view-studio3d': '#store',
    'view-configurator': '#personalize',
    'view-standards': '#support'
  };

  const HASH_VIEW_MAP = {
    '#store': 'view-store',
    '#personalize': 'view-personalize',
    '#inspiration': 'view-inspiration',
    '#tracking': 'view-tracking',
    '#support': 'view-support',
    '#studio3d': 'view-store',
    '#viewer': 'view-store',
    '#viewer-section': 'view-store',
    '#calculator': 'view-personalize',
    '#configurator': 'view-personalize',
    '#standards': 'view-support',
    '#quality': 'view-support',
    '#social-proof': 'view-store',
    '#store-catalog': 'view-store',
    '#faq': 'view-support'
  };

  let currentActiveView = 'view-store';

  /**
   * Switches the active discrete workspace view
   * @param {string} targetViewId - ID of view element ('view-store', 'view-studio3d', etc.)
   * @param {boolean} pushHash - Whether to push new hash to browser history
   * @param {boolean} scrollReset - Whether to reset scroll position to top
   */
  function switchWorkspace(targetViewId, pushHash = true, scrollReset = true) {
    if (!WORKSPACE_VIEWS.includes(targetViewId)) {
      targetViewId = 'view-store';
    }

    const isSameView = (currentActiveView === targetViewId);
    currentActiveView = targetViewId;

    if (targetViewId === 'view-store') {
      // Khi chuyển sang hoặc click lại Store tab: bắt buộc đồng bộ về 'all', 5 khối Hero và URL #store (Codex F09, R09)
      const catToRender = 'all';

      document.querySelectorAll('#view-store .segmented-pill').forEach(pill => {
        const pCat = pill.dataset.category || 'all';
        if (pCat === catToRender) {
          pill.classList.add('active');
          pill.setAttribute('aria-pressed', 'true');
        } else {
          pill.classList.remove('active');
          pill.setAttribute('aria-pressed', 'false');
        }
      });

      if (typeof window.renderStoreProducts === 'function') {
        window.renderStoreProducts(catToRender);
      }

      if (pushHash && history.pushState && window.location.hash !== '#store') {
        history.pushState({ viewId: 'view-store', category: 'all' }, '', '#store');
      }
    }

    // If clicking same active tab, smoothly scroll to top
    if (isSameView && scrollReset) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 1. Instant swap with micro-transition
    WORKSPACE_VIEWS.forEach(vId => {
      const el = document.getElementById(vId);
      if (!el) return;

      if (vId === targetViewId) {
        el.classList.remove('hidden');
        el.classList.add('workspace-fade-in');
      } else {
        el.classList.add('hidden');
        el.classList.remove('workspace-fade-in');
      }
    });

    // 2. Synchronize active tab visual highlights across Desktop Navbar and Mobile Bottom Dock
    document.querySelectorAll('[data-nav-view]').forEach(btn => {
      if (btn.dataset.navView === targetViewId) {
        btn.classList.add('active');
        if (btn.getAttribute('role') === 'tab') btn.setAttribute('aria-selected', 'true');
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.classList.remove('active');
        btn.removeAttribute('aria-selected');
        btn.removeAttribute('aria-current');
      }
    });

    // 3. Client-side routing with hash synchronisation (no page jumping or reload)
    const targetHash = VIEW_HASH_MAP[targetViewId] || '#store';
    if (pushHash && history.pushState) {
      if (window.location.hash !== targetHash) {
        history.pushState({ viewId: targetViewId }, '', targetHash);
      }
    }

    // 4. Smooth zero-jump scroll reset
    if (scrollReset) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // 5. Preserved 3D interactive viewport rendering upon activation (compatibility)
    if (targetViewId === 'view-studio3d') {
      if (typeof window.onResize3DViewer === 'function') {
        window.onResize3DViewer();
        requestAnimationFrame(() => {
          if (typeof window.onResize3DViewer === 'function') window.onResize3DViewer();
        });
        setTimeout(() => {
          if (typeof window.onResize3DViewer === 'function') window.onResize3DViewer();
        }, 60);
      }
      if (typeof window.update3DActionBar === 'function') {
        window.update3DActionBar();
      }
    }

    // 6. Personalize Studio initialization
    if (targetViewId === 'view-personalize') {
      if (window.TTPersonalizeStudio && typeof window.TTPersonalizeStudio.init === 'function') {
        window.TTPersonalizeStudio.init();
      }
    } else if (targetViewId === 'view-store') {
      if (window.heroSimulator && typeof window.heroSimulator.resize === 'function') {
        setTimeout(() => window.heroSimulator.resize(), 50);
      }
    }

    // Close mobile dropdown drawer if open
    const drawer = document.getElementById('mobile-nav-drawer');
    const toggleBtn = document.getElementById('mobile-menu-toggle-btn');
    if (drawer && !drawer.classList.contains('hidden')) {
      drawer.classList.add('hidden');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fa-solid fa-bars text-sm"></i>';
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('aria-label', 'Mở menu');
      }
    }
  }

  window.switchWorkspace = switchWorkspace;
  window.getActiveWorkspace = () => currentActiveView;

  /**
   * Chuyển danh mục sản phẩm mượt mà và đồng bộ URL hash duy nhất (Codex Directive)
   * @param {string} category - Category ID hoặc 'all'
   * @param {boolean} pushHistory - Có ghi vào browser history không
   */
  window.navigateToCategory = function (category, pushHistory = true) {
    const validCat = ALLOWED_CATEGORIES.has(category) ? category : 'all';
    const targetHash = validCat === 'all' ? '#store' : `#store?cat=${validCat}`;

    // Luôn đảm bảo đang ở view-store
    switchWorkspace('view-store', false, false);

    // Cập nhật trạng thái pills
    document.querySelectorAll('#view-store .segmented-pill').forEach(pill => {
      const pCat = pill.dataset.category || 'all';
      if (pCat === validCat) {
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');
      } else {
        pill.classList.remove('active');
        pill.setAttribute('aria-pressed', 'false');
      }
    });

    // Render store
    if (typeof window.renderStoreProducts === 'function') {
      window.renderStoreProducts(validCat);
    }

    // Đồng bộ URL hash
    if (pushHistory && history.pushState && window.location.hash !== targetHash) {
      history.pushState({ viewId: 'view-store', category: validCat }, '', targetHash);
    }
  };

  // Initialize router navigation listeners
  function initRouter() {
    function navigateToHash(hash, pushState = true) {
      const normalizedHash = (!hash || hash === '#') ? '#store' : hash;
      const parsed = parseStoreHash(normalizedHash, ALLOWED_CATEGORIES);
      const routePath = parsed.path ? '#' + parsed.path : '#store';
      const targetView = HASH_VIEW_MAP[routePath] || 'view-store';
      const targetId = parsed.path;
      const targetEl = targetId ? document.getElementById(targetId) : null;
      const isSubAnchor = targetEl && !['store', 'studio3d', 'calculator', 'standards'].includes(targetId);

      // A. Nếu đích là STORE (hỗ trợ hash query ?cat=...)
      if (targetView === 'view-store') {
        switchWorkspace('view-store', false, false);

        // Đồng bộ category render
        if (typeof window.renderStoreProducts === 'function') {
          window.renderStoreProducts(parsed.category);
        }

        // Cập nhật giao diện Pills
        document.querySelectorAll('#view-store .segmented-pill').forEach(pill => {
          const pCat = pill.dataset.category || 'all';
          if (pCat === parsed.category) {
            pill.classList.add('active');
            pill.setAttribute('aria-pressed', 'true');
          } else {
            pill.classList.remove('active');
            pill.setAttribute('aria-pressed', 'false');
          }
        });

        const targetHash = parsed.category === 'all'
          ? (routePath === '#store-catalog' ? '#store-catalog' : '#store')
          : `#store?cat=${parsed.category}`;

        if (pushState && history.pushState && window.location.hash !== targetHash) {
          history.pushState({ viewId: 'view-store', category: parsed.category }, '', targetHash);
        }

        if (isSubAnchor && targetEl) {
          setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }, 60);
        }
        return;
      }

      // B. Nếu đích là Tracking (#tracking?id=...&token=...)
      if (targetView === 'view-tracking') {
        switchWorkspace('view-tracking', pushState, true);
        const orderId = parsed.params ? parsed.params.get('id') : null;
        const token = parsed.params ? parsed.params.get('token') : null;
        if (orderId) {
          const input = document.getElementById('order-lookup-input');
          if (input) {
            input.value = orderId;
            if (typeof window.lookupOrderProgress === 'function') {
              window.lookupOrderProgress(orderId, token);
            }
          }
        }
        return;
      }

      // C. Nếu đích là các View khác (Personalize, Inspiration, Support)
      if (isSubAnchor) {
        switchWorkspace(targetView, false, false);
        if (pushState && history.pushState && window.location.hash !== hash) {
          history.pushState({ viewId: targetView, anchor: targetId }, '', hash);
        }
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      } else {
        switchWorkspace(targetView, pushState, true);
      }
    }

    // Intercept clicks on any element with data-nav-view or hash anchor
    document.addEventListener('click', (e) => {
      const navBtn = e.target.closest('[data-nav-view]');
      if (navBtn) {
        e.preventDefault();
        const targetView = navBtn.dataset.navView;
        if (targetView) {
          switchWorkspace(targetView, true, true);
        }
        return;
      }

      // In-page internal hash links
      const anchor = e.target.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href) {
          const parsed = parseStoreHash(href, ALLOWED_CATEGORIES);
          const routePath = parsed.path ? '#' + parsed.path : '#store';
          if (HASH_VIEW_MAP[routePath] || routePath === '#store') {
            e.preventDefault();
            navigateToHash(href, true);
          }
        }
      }
    });

    // Browser back / forward button handling with deduplication
    let isHandlingHistory = false;
    function handleHistoryChange() {
      if (isHandlingHistory) return;
      isHandlingHistory = true;
      // KHÔNG toLowerCase() toàn bộ hash để bảo tồn chữ hoa trong category ID
      const hash = window.location.hash;
      navigateToHash(hash, false);
      setTimeout(() => { isHandlingHistory = false; }, 50);
    }

    window.addEventListener('popstate', handleHistoryChange);
    window.addEventListener('hashchange', handleHistoryChange);

    // Initial direct URL routing on page load (KHÔNG toLowerCase)
    const initialHash = window.location.hash;
    if (initialHash) {
      navigateToHash(initialHash, false);
    } else {
      switchWorkspace('view-store', false, true);
    }
  }

  // --- 2. GLOBAL TOAST NOTIFICATION HELPER ---
  window.showToast = function (message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-24 sm:bottom-6 right-6 z-[200] flex flex-col gap-2.5 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-msg pointer-events-auto ${type === 'error' ? 'border-red-500/40' : 'border-[var(--border-subtle)]'}`;

    const icon = document.createElement('i');
    icon.className = type === 'error'
      ? 'fa-solid fa-circle-exclamation text-red-500'
      : 'fa-solid fa-circle-check text-[#FF5C00]';

    const msgSpan = document.createElement('span');
    msgSpan.textContent = String(message || '');

    toast.appendChild(icon);
    toast.appendChild(msgSpan);

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 300);
    }, 3500);
  };

  // --- 3. FLOATING FROSTED GLASS NAVBAR SCROLL EFFECT (ID-07) ---
  function initFloatingNavbar() {
    const navbar = document.getElementById('floating-navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // --- 4. THEME SYSTEM: PRECISION CRAFT DUAL-THEME (OBSIDIAN TITANIUM / CERAMIC MIST) ---
  // --- 4. THEME SWITCHER CONTROLLER (Tactile Linen Light & Roast Espresso Dark) ---
  function initThemeSwitcher() {
    // One coherent light storefront, including visitors with a saved dark preference.
    function applyLightTheme() {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      try { localStorage.setItem('tt_theme', 'light'); } catch (_) {}
    }
    function applyTheme(theme = 'light') { applyLightTheme(); }
    applyLightTheme();
    window.applyTheme = applyTheme;
    window.TTTheme = { getTheme: () => 'light', setTheme: applyLightTheme, applyTheme: applyTheme };
  }

  // --- 4.1 ARTISAN HERO PRODUCT SHOWCASE CONTROLLER (Codex TT3D-HERO-20261024-R1) ---
  const HERO_CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  });

  // Approved catalog product IDs for Hero Spotlight with verified authentic imagery
  const HERO_APPROVED_ITEMS = [
    {
      id: 'mw-cn-1646129',
      tag: '✦ Best-seller Bàn Trang Điểm',
      material: 'Bio-PLA Lụa Hữu Cơ'
    },
    {
      id: 'mw-cn-1147539',
      tag: '✦ Dấu Ấn Bàn Làm Việc',
      material: 'Bio-PLA Đen Nhám & Vàng Đồng'
    },
    {
      id: 'mw-cn-2235027',
      tag: '✦ Tinh Hoa Tối Giản Washi',
      material: 'Bio-PLA Trắng Ngà Ánh Sáng Ấm'
    }
  ];

  let showcaseRequestCounter = 0;
  let activeShowcaseProductId = 'mw-cn-1646129';

  function getShowcaseProduct(productId) {
    if (!window.TTCatalogStore || typeof window.TTCatalogStore.getProductByIdSync !== 'function') {
      return null;
    }
    const product = window.TTCatalogStore.getProductByIdSync(productId);
    if (!product || product.status !== 'active') {
      return null;
    }
    return product;
  }

  function switchHeroShowcase(productId) {
    const product = getShowcaseProduct(productId);
    if (!product) return;

    const approvedConfig = HERO_APPROVED_ITEMS.find(item => item.id === productId) || {
      id: product.id,
      tag: '✦ Chế Tác Thủ Công Hà Nội',
      material: 'Bio-PLA Hữu Cơ 0.16mm'
    };

    const targetSrc = product.image || `assets/images/products/thumb_${product.id.replace('mw-cn-', '')}.png`;
    const requestId = ++showcaseRequestCounter;

    // Pre-load image to prevent broken visuals or race conditions
    const preloader = new Image();
    preloader.onload = () => {
      if (requestId !== showcaseRequestCounter) return;

      activeShowcaseProductId = product.id;

      // Update Roving Tabindex & ARIA on tabs
      const tabs = Array.from(document.querySelectorAll('#hero .hero-showcase-tab'));
      tabs.forEach(tab => {
        const isTarget = tab.dataset.heroTab === product.id;
        tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        tab.setAttribute('tabindex', isTarget ? '0' : '-1');
        tab.classList.toggle('active', isTarget);
        tab.classList.toggle('bg-white', isTarget);
        tab.classList.toggle('text-[#D45B34]', isTarget);
        tab.classList.toggle('shadow-xs', isTarget);
        tab.classList.toggle('text-[var(--text-secondary)]', !isTarget);
      });

      // Update DOM elements using textContent to prevent XSS
      const imgEl = document.getElementById('hero-showcase-img');
      const mediaEl = document.getElementById('hero-showcase-panel');
      const titleEl = document.getElementById('hero-showcase-title');
      const tagEl = document.getElementById('hero-showcase-tag');
      const matEl = document.getElementById('hero-showcase-mat');
      const priceEl = document.getElementById('hero-showcase-price');
      const detailBtn = document.getElementById('hero-showcase-detail-btn');

      if (imgEl) {
        imgEl.src = targetSrc;
        imgEl.alt = product.title || 'Sản phẩm chế tác T&T 3D';
      }

      if (mediaEl) {
        mediaEl.setAttribute('aria-labelledby', `hero-tab-${product.id.replace('mw-cn-', '')}`);
        mediaEl.classList.remove('is-entering');
        void mediaEl.offsetWidth; // Trigger reflow for smooth fade
        mediaEl.classList.add('is-entering');
      }

      if (titleEl) {
        titleEl.textContent = ({'mw-cn-1646129':'Khay trang sức Nơ Lụa','mw-cn-1147539':'Biển tên để bàn','mw-cn-2235027':'Đèn bàn Washi'})[product.id] || product.title || '';
        titleEl.title = product.title || '';
      }
      if (tagEl) tagEl.textContent = 'Lựa chọn từ xưởng';
      if (matEl) matEl.textContent = 'Chọn mẫu · Chọn màu';
      if (priceEl) {
        priceEl.textContent = HERO_CURRENCY_FORMATTER.format(Number(product.price) || 0);
      }

      if (detailBtn) {
        detailBtn.dataset.productId = product.id;
      }
    };

    preloader.onerror = () => {
      console.warn(`[T&T Hero] Failed to load image for showcase item ${productId}`);
    };

    preloader.src = targetSrc;
  }
  window.switchHeroShowcase = switchHeroShowcase;

  function initHeroArtisanShowcase() {
    const detailBtn = document.getElementById('hero-showcase-detail-btn');
    if (detailBtn && !detailBtn.dataset.listenerAttached) {
      detailBtn.dataset.listenerAttached = 'true';
      detailBtn.addEventListener('click', () => {
        const id = detailBtn.dataset.productId || activeShowcaseProductId;
        const product = getShowcaseProduct(id);

        if (!product) {
          refreshHeroShowcase();
          return;
        }

        if (typeof window.openProductDetailModal === 'function') {
          window.openProductDetailModal(product.id);
        }
      });
    }

    // Keyboard navigation with roving tabindex for tablist
    const tabList = document.querySelector('#hero [role="tablist"]');
    if (tabList && !tabList.dataset.keysAttached) {
      tabList.dataset.keysAttached = 'true';
      const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));

      tabList.addEventListener('keydown', (e) => {
        const currentIdx = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
        if (currentIdx === -1) return;

        let nextIdx = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          nextIdx = (currentIdx + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          nextIdx = (currentIdx - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          nextIdx = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          nextIdx = tabs.length - 1;
        }

        if (nextIdx !== -1) {
          const nextTab = tabs[nextIdx];
          nextTab.focus();
          const targetId = nextTab.dataset.heroTab;
          if (targetId) switchHeroShowcase(targetId);
        }
      });

      tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = tab.dataset.heroTab;
          if (targetId) switchHeroShowcase(targetId);
        });
      });
    }

    refreshHeroShowcase();
  }

  function refreshHeroShowcase() {
    for (const item of HERO_APPROVED_ITEMS) {
      const prod = getShowcaseProduct(item.id);
      if (prod) {
        switchHeroShowcase(prod.id);
        return;
      }
    }
    if (window.TTCatalogStore && typeof window.TTCatalogStore.getProductsSync === 'function') {
      const allActive = window.TTCatalogStore.getProductsSync(true);
      if (allActive && allActive.length > 0) {
        switchHeroShowcase(allActive[0].id);
      }
    }
  }
  window.refreshHeroShowcase = refreshHeroShowcase;
  window.initHeroArtisanShowcase = initHeroArtisanShowcase;

  // --- 5. SEGMENTED FILTER CONTROLS FOR STORE (ID-13) ---
  function initSegmentedFilters() {
    document.querySelectorAll('#view-store .segmented-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        const category = pill.dataset.category || 'all';
        if (typeof window.navigateToCategory === 'function') {
          window.navigateToCategory(category, true);
        } else if (typeof window.renderStoreProducts === 'function') {
          window.renderStoreProducts(category);
        }
      });
    });
  }

  // --- 6. MOBILE NAVIGATION MENU DRAWER ---
  function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-toggle-btn');
    const drawer = document.getElementById('mobile-nav-drawer');
    if (!btn || !drawer) return;

    btn.addEventListener('click', () => {
      const isHidden = drawer.classList.contains('hidden');
      btn.setAttribute('aria-expanded', String(isHidden));
      btn.setAttribute('aria-label', isHidden ? 'Đóng menu' : 'Mở menu');
      if (isHidden) {
        drawer.classList.remove('hidden');
        btn.innerHTML = '<i class="fa-solid fa-xmark text-sm"></i>';
      } else {
        drawer.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Mở menu');
        btn.innerHTML = '<i class="fa-solid fa-bars text-sm"></i>';
      }
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Mở menu');
        btn.innerHTML = '<i class="fa-solid fa-bars text-sm"></i>';
      });
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !drawer.classList.contains('hidden')) {
        drawer.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Mở menu');
        btn.innerHTML = '<i class="fa-solid fa-bars text-sm"></i>';
        btn.focus();
      }
    });
  }

  // --- 7. ACCORDION FAQ LOGIC ---
  function initFaqAccordion() {
    document.querySelectorAll('.faq-accordion-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const answer = item.querySelector('.faq-answer');
        const chevron = btn.querySelector('.fa-chevron-down');
        const isHidden = answer.classList.contains('hidden');

        // Close all others
        document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
        document.querySelectorAll('.faq-accordion-toggle .fa-chevron-down').forEach(c => {
          c.parentElement.classList.remove('rotate-180', 'text-[#FF5C00]');
        });

        if (isHidden) {
          answer.classList.remove('hidden');
          if (chevron) {
            chevron.parentElement.classList.add('rotate-180', 'text-[#FF5C00]');
          }
        }
      });
    });
  }

  // --- 7.5. ORDER TRACKER CONTROLLER (REAL WORKSHOP & DRAFT PROJECTION) ---
  function initOrderTracker() {
    const form = document.getElementById('order-lookup-form');
    const input = document.getElementById('order-lookup-input');
    const resultsContainer = document.getElementById('order-lookup-results');
    if (!form || !input || !resultsContainer) return;

    function renderOrderProjectionCard(res) {
      resultsContainer.innerHTML = '';
      const card = document.createElement('div');
      card.className = 'p-6 sm:p-7 rounded-3xl bg-white border border-[#DCDDD5] space-y-6 shadow-sm';

      // 1. Header: ID, Date, Badge, Demo indicator
      const header = document.createElement('div');
      header.className = 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCDDD5]';

      const leftHead = document.createElement('div');
      leftHead.className = 'space-y-1';

      const idWrap = document.createElement('div');
      idWrap.className = 'flex items-center gap-2';

      const idSpan = document.createElement('span');
      idSpan.className = 'font-mono text-base font-extrabold text-[#FF5C00] tracking-wide';
      idSpan.textContent = res.orderId || 'TT3D-ORDER';

      idWrap.appendChild(idSpan);

      if (res.isDemo) {
        const demoBadge = document.createElement('span');
        demoBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300';
        demoBadge.textContent = 'Đơn mẫu minh họa';
        idWrap.appendChild(demoBadge);
      }

      const dateP = document.createElement('p');
      dateP.className = 'text-xs text-[#586057] font-mono';
      const createdStr = res.createdAt ? new Date(res.createdAt).toLocaleString('vi-VN') : 'Mới tạo';
      dateP.textContent = `Khởi tạo: ${createdStr}`;

      leftHead.appendChild(idWrap);
      leftHead.appendChild(dateP);

      const statusBadge = document.createElement('span');
      statusBadge.className = `inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border ${res.statusInfo?.badgeClass || 'bg-slate-100 text-slate-800 border-slate-300'} w-fit`;
      statusBadge.innerHTML = `<i class="fa-solid ${res.statusInfo?.icon || 'fa-circle-notch'}"></i><span>${res.statusInfo?.label || 'Đang cập nhật'}</span>`;

      header.appendChild(leftHead);
      header.appendChild(statusBadge);
      card.appendChild(header);

      // 2. Customer Alert (if present)
      if (res.customerAlert) {
        const alertBox = document.createElement('div');
        alertBox.className = 'p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3';
        alertBox.innerHTML = `<i class="fa-solid fa-bell text-amber-600 mt-0.5 shrink-0"></i><div><strong class="font-bold">Cần bạn xác nhận:</strong> ${escapeHtmlApp(res.customerAlert)}</div>`;
        card.appendChild(alertBox);
      }

      // 3. 6-Milestone Timeline Progress Indicator
      const timelineBox = document.createElement('div');
      timelineBox.className = 'p-5 sm:p-6 rounded-2xl bg-[#F7F6F2] border border-[#DCDDD5] space-y-4';

      const timelineTitle = document.createElement('div');
      timelineTitle.className = 'flex items-center justify-between text-xs font-mono font-bold text-[#586057] uppercase tracking-wider';
      timelineTitle.innerHTML = `<span><i class="fa-solid fa-timeline text-[#FF5C00] mr-1.5"></i>Tiến Độ Chế Tác Tại Xưởng</span><span>Mốc: ${res.statusInfo?.shortLabel || ''}</span>`;
      timelineBox.appendChild(timelineTitle);

      const STEPS = [
        { key: 'request_received', label: '1. Tiếp nhận' },
        { key: 'confirmed', label: '2. Xưởng duyệt' },
        { key: 'in_production', label: '3. Đang in 3D' },
        { key: 'quality_check', label: '4. Kiểm tra QC' },
        { key: 'shipped', label: '5. Đang giao' },
        { key: 'delivered', label: '6. Hoàn tất' }
      ];

      const currentStepIndex = res.statusInfo?.stepIndex || 1;

      const stepsGrid = document.createElement('div');
      stepsGrid.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2';

      STEPS.forEach((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStepIndex;
        const isCurrent = stepNum === currentStepIndex;

        const stepCard = document.createElement('div');
        stepCard.className = `p-3 rounded-xl border text-center transition-all ${
          isCurrent 
            ? 'bg-white border-[#FF5C00] shadow-sm ring-2 ring-[#FF5C00]/20' 
            : isCompleted 
              ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800' 
              : 'bg-white/60 border-[#DCDDD5] text-slate-400 opacity-70'
        }`;

        const iconDiv = document.createElement('div');
        iconDiv.className = `w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs mb-1.5 ${
          isCurrent 
            ? 'bg-[#FF5C00] text-white font-bold' 
            : isCompleted 
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-200 text-slate-500'
        }`;
        iconDiv.innerHTML = isCompleted ? '<i class="fa-solid fa-check"></i>' : `${stepNum}`;

        const labelDiv = document.createElement('div');
        labelDiv.className = `text-[11px] font-bold ${isCurrent ? 'text-[#20231F]' : isCompleted ? 'text-emerald-900' : 'text-slate-400'}`;
        labelDiv.textContent = step.label;

        stepCard.appendChild(iconDiv);
        stepCard.appendChild(labelDiv);
        stepsGrid.appendChild(stepCard);
      });

      timelineBox.appendChild(stepsGrid);

      // Description of current status
      const statusDescP = document.createElement('p');
      statusDescP.className = 'text-xs text-[#586057] leading-relaxed pt-2 border-t border-[#DCDDD5]';
      statusDescP.textContent = res.statusInfo?.description || '';
      timelineBox.appendChild(statusDescP);

      card.appendChild(timelineBox);

      // 4. Metadata Grid: ETA, Updated, Carrier, Customer
      const metaGrid = document.createElement('div');
      metaGrid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs';

      const leftMeta = document.createElement('div');
      leftMeta.className = 'p-4 rounded-2xl bg-[#F7F6F2] border border-[#DCDDD5] space-y-2';
      leftMeta.innerHTML = `
        <div class="font-bold text-[#20231F] font-mono uppercase tracking-wider text-[11px] mb-1">
          <i class="fa-solid fa-clock text-[#FF5C00] mr-1"></i>Thời Gian &amp; Vận Chuyển
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[#586057]">Dự kiến nhận hàng:</span>
          <strong class="font-mono text-[#FF5C00] font-bold">${escapeHtmlApp(res.etaDate || 'Đang cập nhật')}</strong>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[#586057]">Cập nhật lần cuối:</span>
          <span class="font-mono text-[#586057]">${res.updatedAt ? new Date(res.updatedAt).toLocaleString('vi-VN') : '—'}</span>
        </div>
      `;

      if (res.carrier && res.carrier.trackingCode) {
        const carrierRow = document.createElement('div');
        carrierRow.className = 'pt-2 mt-2 border-t border-[#DCDDD5] flex items-center justify-between';
        carrierRow.innerHTML = `
          <div>
            <span class="text-[#586057] block text-[10px]">Đơn vị vận chuyển:</span>
            <strong class="font-mono text-[#20231F]">${escapeHtmlApp(res.carrier.name || 'Bưu điện')}</strong>
          </div>
          <a href="${res.carrier.trackingUrl || '#'}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[11px] font-bold hover:bg-indigo-100 transition-colors">
            ${escapeHtmlApp(res.carrier.trackingCode)} <i class="fa-solid fa-arrow-up-right-from-square text-[9px] ml-1"></i>
          </a>
        `;
        leftMeta.appendChild(carrierRow);
      }

      const rightMeta = document.createElement('div');
      rightMeta.className = 'p-4 rounded-2xl bg-[#F7F6F2] border border-[#DCDDD5] space-y-2';
      rightMeta.innerHTML = `
        <div class="font-bold text-[#20231F] font-mono uppercase tracking-wider text-[11px] mb-1">
          <i class="fa-solid fa-shield-cat text-blue-600 mr-1"></i>Thông Tin Nhận Hàng (Bảo Mật)
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[#586057]">Người nhận:</span>
          <span class="font-bold text-[#20231F]">${escapeHtmlApp(res.customer?.name || 'Khách hàng')}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[#586057]">Số điện thoại:</span>
          <span class="font-mono text-[#20231F]">${escapeHtmlApp(res.customer?.maskedPhone || '—')}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[#586057]">Khu vực giao:</span>
          <span class="text-[#20231F] text-right truncate max-w-[180px]">${escapeHtmlApp(res.customer?.maskedAddress || '—')}</span>
        </div>
      `;

      metaGrid.appendChild(leftMeta);
      metaGrid.appendChild(rightMeta);
      card.appendChild(metaGrid);

      // 5. Items Table
      if (Array.isArray(res.items) && res.items.length > 0) {
        const itemsBox = document.createElement('div');
        itemsBox.className = 'p-4 rounded-2xl bg-[#F7F6F2] border border-[#DCDDD5] space-y-3';
        
        const itemsTitle = document.createElement('div');
        itemsTitle.className = 'font-bold text-[#20231F] font-mono uppercase tracking-wider text-[11px]';
        itemsTitle.innerHTML = '<i class="fa-solid fa-box-open text-[#FF5C00] mr-1"></i>Danh Sách Sản Phẩm Đang Chế Tác';
        itemsBox.appendChild(itemsTitle);

        res.items.forEach(item => {
          const itemRow = document.createElement('div');
          itemRow.className = 'p-3 rounded-xl bg-white border border-[#DCDDD5] flex items-center justify-between gap-3 text-xs';

          const leftItem = document.createElement('div');
          leftItem.className = 'space-y-0.5';

          const titleP = document.createElement('p');
          titleP.className = 'font-bold text-[#20231F]';
          titleP.textContent = item.title || 'Sản phẩm in 3D';

          const detailsP = document.createElement('p');
          detailsP.className = 'text-[11px] text-[#586057] font-mono';
          const opts = [];
          if (item.colorName) opts.push('Màu: ' + item.colorName);
          if (item.materialName) opts.push(item.materialName);
          if (item.customText) opts.push('Khắc: "' + item.customText + '"');
          detailsP.textContent = opts.length > 0 ? opts.join(' • ') : 'Tiêu chuẩn xưởng';

          leftItem.appendChild(titleP);
          leftItem.appendChild(detailsP);

          const rightItem = document.createElement('div');
          rightItem.className = 'text-right shrink-0';

          const qtySpan = document.createElement('span');
          qtySpan.className = 'text-[11px] text-[#586057] font-mono block';
          qtySpan.textContent = `Số lượng: x${item.qty || 1}`;

          const priceSpan = document.createElement('strong');
          priceSpan.className = 'font-mono text-[#FF5C00] text-xs';
          priceSpan.textContent = ((item.price || 0) * (item.qty || 1)).toLocaleString('vi-VN') + ' đ';

          rightItem.appendChild(qtySpan);
          rightItem.appendChild(priceSpan);

          itemRow.appendChild(leftItem);
          itemRow.appendChild(rightItem);
          itemsBox.appendChild(itemRow);
        });

        // Totals row
        const totalRow = document.createElement('div');
        totalRow.className = 'flex items-center justify-between pt-2 border-t border-[#DCDDD5] text-xs';
        totalRow.innerHTML = `
          <span class="text-[#586057]">Tổng giá trị đơn hàng:</span>
          <strong class="font-mono text-base font-extrabold text-[#FF5C00]">
            ${(res.totals?.finalTotal || 0).toLocaleString('vi-VN')} đ
          </strong>
        `;
        itemsBox.appendChild(totalRow);

        card.appendChild(itemsBox);
      }

      // 6. Public Note from Workshop
      if (res.publicNote) {
        const noteBox = document.createElement('div');
        noteBox.className = 'p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5';
        noteBox.innerHTML = `<i class="fa-solid fa-message text-blue-600 mt-0.5 shrink-0"></i><div><strong class="font-bold">Ghi chú từ xưởng:</strong> ${escapeHtmlApp(res.publicNote)}</div>`;
        card.appendChild(noteBox);
      }

      // 7. Actions: Copy Link, Ask Zalo
      const actionsRow = document.createElement('div');
      actionsRow.className = 'pt-2 flex flex-wrap items-center gap-3';

      const copyLinkBtn = document.createElement('button');
      copyLinkBtn.type = 'button';
      copyLinkBtn.className = 'btn-secondary text-xs !py-2.5 !px-4 flex items-center gap-1.5 font-bold';
      copyLinkBtn.innerHTML = '<i class="fa-regular fa-copy"></i><span>Sao Chép Link Tra Cứu</span>';
      copyLinkBtn.addEventListener('click', async () => {
        const fullUrl = `${window.location.origin}${window.location.pathname}#tracking?id=${encodeURIComponent(res.orderId)}&token=${encodeURIComponent(res.token || '')}`;
        try {
          if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(fullUrl);
            copyLinkBtn.innerHTML = '<i class="fa-solid fa-check text-emerald-600"></i><span class="text-emerald-700">Đã Sao Chép Link!</span>';
            setTimeout(() => {
              copyLinkBtn.innerHTML = '<i class="fa-regular fa-copy"></i><span>Sao Chép Link Tra Cứu</span>';
            }, 2500);
          }
        } catch (_) {}
      });

      const zaloBtn = document.createElement('a');
      const hotlinePhone = (window.TTStore && typeof window.TTStore.getZaloPhone === 'function')
        ? window.TTStore.getZaloPhone()
        : null;

      if (hotlinePhone) {
        zaloBtn.href = `https://zalo.me/${hotlinePhone}?text=${encodeURIComponent('Chào xưởng T&T 3D Labs, tôi muốn hỏi tiến độ đơn hàng mã: ' + res.orderId)}`;
        zaloBtn.target = '_blank';
        zaloBtn.rel = 'noopener noreferrer';
      } else {
        zaloBtn.setAttribute('aria-disabled', 'true');
        zaloBtn.onclick = (e) => {
          if (e && e.preventDefault) e.preventDefault();
          const msg = 'Chưa cấu hình kênh Zalo hỗ trợ. Vui lòng liên hệ hotline xưởng.';
          if (window.showToast) window.showToast(msg);
          else if (typeof alert === 'function') alert(msg);
          return false;
        };
      }
      zaloBtn.className = 'btn-primary text-xs !py-2.5 !px-4 flex items-center gap-1.5 font-bold';
      zaloBtn.innerHTML = '<i class="fa-solid fa-comment-dots"></i><span>Nhắn Zalo Với Kỹ Thuật</span>';

      actionsRow.appendChild(copyLinkBtn);
      actionsRow.appendChild(zaloBtn);
      card.appendChild(actionsRow);

      resultsContainer.appendChild(card);
    }

    function doLookup(val, tokenOrPhone = '') {
      resultsContainer.innerHTML = '';

      if (!val) {
        const warnBox = document.createElement('div');
        warnBox.className = 'p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 flex items-center gap-2';
        warnBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-amber-600"></i><span>Vui lòng nhập chính xác Mã đơn hàng (VD: TT3D-XXXX) để xem tiến độ thực tế.</span>';
        resultsContainer.appendChild(warnBox);
        return;
      }

      // 1. Try real workshop order engine first
      if (window.TTOrderEngine && typeof window.TTOrderEngine.getOrderProjection === 'function') {
        const projection = window.TTOrderEngine.getOrderProjection(val, tokenOrPhone);
        if (projection && projection.ok) {
          renderOrderProjectionCard(projection);
          return;
        }

        if (projection && projection.needsPhoneAuth) {
          const authBox = document.createElement('div');
          authBox.className = 'p-6 rounded-3xl bg-white border border-amber-300 shadow-sm space-y-4';
          authBox.innerHTML = `
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <i class="fa-solid fa-lock text-sm"></i>
              </div>
              <div class="space-y-1">
                <h4 class="text-xs font-bold text-[#20231F]">Yêu Cầu Xác Thực Quyền Xem Đơn</h4>
                <p class="text-xs text-[#586057] leading-relaxed">
                  Đơn hàng <strong>${escapeHtmlApp(val)}</strong> đã được ghi nhận. Để bảo vệ thông tin cá nhân và địa chỉ, vui lòng nhập số điện thoại hoặc 4 số cuối số điện thoại đặt hàng của bạn.
                </p>
              </div>
            </div>
            <div class="flex gap-2 max-w-sm pt-2">
              <input type="tel" id="auth-phone-input" placeholder="Nhập số điện thoại..." class="flex-1 px-3 py-2 rounded-xl bg-[#F7F6F2] border border-[#DCDDD5] text-xs font-mono outline-none focus:border-[#FF5C00]">
              <button type="button" id="auth-phone-submit" class="btn-primary text-xs !py-2 !px-4 font-bold">Xác Nhận</button>
            </div>
          `;
          resultsContainer.appendChild(authBox);
          const pInput = authBox.querySelector('#auth-phone-input');
          const pBtn = authBox.querySelector('#auth-phone-submit');
          if (pBtn && pInput) {
            pBtn.addEventListener('click', () => {
              doLookup(val, pInput.value.trim());
            });
            pInput.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') doLookup(val, pInput.value.trim());
            });
          }
          return;
        }
      }

      // 2. Fall back to local draft storage in TTCheckout
      const lookupFn = (window.TTCheckout && typeof window.TTCheckout.lookupOrder === 'function')
        ? window.TTCheckout.lookupOrder
        : null;

      const results = lookupFn ? lookupFn(val) : [];

      if (results.length === 0) {
        const noMatchBox = document.createElement('div');
        noMatchBox.className = 'p-5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3';

        const topRow = document.createElement('div');
        topRow.className = 'flex items-start gap-3';
        const iconWrap = document.createElement('div');
        iconWrap.className = 'w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0';
        iconWrap.innerHTML = '<i class="fa-solid fa-file-circle-question text-sm"></i>';

        const textWrap = document.createElement('div');
        textWrap.className = 'space-y-1';
        const titleH4 = document.createElement('h4');
        titleH4.className = 'text-xs font-bold text-primary-color';
        titleH4.textContent = 'Không tìm thấy bản nháp trên thiết bị này';
        const pDesc = document.createElement('p');
        pDesc.className = 'text-xs text-secondary-color leading-relaxed';
        pDesc.textContent = `Mã "${val}" không khớp với bản nháp nào được lưu trên trình duyệt của bạn. Lưu ý: Bản nháp chỉ lưu cục bộ trên thiết bị bạn đã đặt hàng và chưa đồng bộ tiến độ máy in trực tiếp.`;
        textWrap.appendChild(titleH4);
        textWrap.appendChild(pDesc);

        topRow.appendChild(iconWrap);
        topRow.appendChild(textWrap);
        noMatchBox.appendChild(topRow);

        const hotlinePhone = (window.TTStore && typeof window.TTStore.getZaloPhone === 'function')
          ? window.TTStore.getZaloPhone()
          : null;

        const helpRow = document.createElement('div');
        helpRow.className = 'p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] text-secondary-color flex flex-col sm:flex-row sm:items-center justify-between gap-3';
        const helpSpan = document.createElement('span');
        helpSpan.textContent = 'Đã đặt hàng qua thiết bị khác hoặc cần xác nhận tiến độ với xưởng?';
        const helpLink = document.createElement('a');
        if (hotlinePhone) {
          helpLink.href = `https://zalo.me/${hotlinePhone}?text=${encodeURIComponent('Chào xưởng T&T 3D Labs, tôi cần kiểm tra tiến độ đơn hàng mã: ' + val)}`;
          helpLink.target = '_blank';
          helpLink.rel = 'noopener noreferrer';
        } else {
          // Khi resolver trả null: bỏ href, không sinh số dự phòng hardcoded (Codex R2-04 & R3-02)
          helpLink.removeAttribute('href');
          helpLink.setAttribute('aria-disabled', 'true');
          helpLink.onclick = (e) => {
            if (e && e.preventDefault) e.preventDefault();
            const msg = 'Chưa cấu hình kênh Zalo hỗ trợ. Vui lòng liên hệ hotline xưởng.';
            if (window.showToast) window.showToast(msg);
            else if (typeof alert === 'function') alert(msg);
            return false;
          };
        }
        helpLink.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5C00] text-[#0B0C0E] font-bold text-xs shrink-0 hover:opacity-90 transition-opacity';
        helpLink.innerHTML = '<i class="fa-solid fa-comment-dots"></i><span>Hỏi Kỹ Thuật Zalo</span>';

        helpRow.appendChild(helpSpan);
        helpRow.appendChild(helpLink);
        noMatchBox.appendChild(helpRow);

        resultsContainer.appendChild(noMatchBox);
        return;
      }

      // Render orders safely with pure DOM methods (F02)
      results.forEach(ord => {
        const card = document.createElement('div');
        card.className = 'p-5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-4 shadow-sm';

        // Header info
        const header = document.createElement('div');
        header.className = 'flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]';

        const idWrap = document.createElement('div');
        idWrap.className = 'flex items-center gap-2';

        const idSpan = document.createElement('span');
        idSpan.className = 'font-mono text-xs font-bold text-[#FF5C00]';
        idSpan.textContent = ord.clientRequestId || 'TT3D-DRAFT';

        const dateSpan = document.createElement('span');
        dateSpan.className = 'text-[10px] text-secondary-color font-mono';
        dateSpan.textContent = ord.createdAt ? '• ' + new Date(ord.createdAt).toLocaleDateString('vi-VN') : '';

        idWrap.appendChild(idSpan);
        idWrap.appendChild(dateSpan);

        const badge = document.createElement('span');
        badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 w-fit';
        badge.textContent = ord.statusText || 'Bản nháp trên thiết bị · Chưa gửi tới xưởng';

        header.appendChild(idWrap);
        header.appendChild(badge);
        card.appendChild(header);

        // Customer & Totals Grid
        const metaGrid = document.createElement('div');
        metaGrid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs';

        const leftCol = document.createElement('div');
        leftCol.className = 'space-y-1 text-secondary-color';

        const custRow = document.createElement('div');
        const custLabel = document.createElement('span');
        custLabel.className = 'text-primary-color font-semibold';
        custLabel.textContent = 'Khách hàng: ';
        const custVal = document.createElement('span');
        custVal.textContent = ord.customerName || 'Khách hàng';
        custRow.appendChild(custLabel);
        custRow.appendChild(custVal);

        const phoneRow = document.createElement('div');
        const phoneLabel = document.createElement('span');
        phoneLabel.className = 'text-primary-color font-semibold';
        phoneLabel.textContent = 'Số điện thoại: ';
        const phoneVal = document.createElement('span');
        phoneVal.className = 'font-mono';
        phoneVal.textContent = ord.maskedPhone || 'Chưa cung cấp';
        phoneRow.appendChild(phoneLabel);
        phoneRow.appendChild(phoneVal);

        const channelRow = document.createElement('div');
        const channelLabel = document.createElement('span');
        channelLabel.className = 'text-primary-color font-semibold';
        channelLabel.textContent = 'Kênh chuẩn bị: ';
        const channelVal = document.createElement('span');
        channelVal.textContent = ord.channel === 'cod' ? 'Thanh toán nhận hàng (COD)' : 'Chuyển tiếp Zalo';
        channelRow.appendChild(channelLabel);
        channelRow.appendChild(channelVal);

        leftCol.appendChild(custRow);
        leftCol.appendChild(phoneRow);
        leftCol.appendChild(channelRow);

        const rightCol = document.createElement('div');
        rightCol.className = 'space-y-1 text-secondary-color sm:text-right';

        const totalRow = document.createElement('div');
        const totalLabel = document.createElement('span');
        totalLabel.className = 'text-primary-color font-semibold';
        totalLabel.textContent = 'Tổng dự tính: ';
        const totalVal = document.createElement('span');
        totalVal.className = 'font-mono text-sm font-bold text-[#FF5C00] ml-1';
        totalVal.textContent = (ord.estimatedTotalVnd || 0).toLocaleString('vi-VN') + ' đ';
        totalRow.appendChild(totalLabel);
        totalRow.appendChild(totalVal);

        const shipNote = document.createElement('div');
        shipNote.className = 'text-[11px] text-secondary-color';
        shipNote.textContent = ord.isFreeShipping ? '✓ Miễn phí vận chuyển (đơn ≥300k)' : '+ Phí vận chuyển tiêu chuẩn 25k';

        const localNote = document.createElement('div');
        localNote.className = 'text-[11px] text-amber-400/90';
        localNote.textContent = '• Bản nháp lưu cục bộ tại máy';

        rightCol.appendChild(totalRow);
        rightCol.appendChild(shipNote);
        rightCol.appendChild(localNote);

        metaGrid.appendChild(leftCol);
        metaGrid.appendChild(rightCol);
        card.appendChild(metaGrid);

        // Items list safely built via DOM
        if (Array.isArray(ord.items) && ord.items.length > 0) {
          const itemsBox = document.createElement('div');
          itemsBox.className = 'p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2';

          ord.items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'flex items-center justify-between text-xs py-1 border-b border-[var(--border-subtle)]/40 last:border-b-0';

            const leftItem = document.createElement('div');
            leftItem.className = 'flex items-center gap-2';

            const itemTitle = document.createElement('span');
            itemTitle.className = 'font-medium text-primary-color';
            itemTitle.textContent = item.title || 'Sản phẩm in 3D';

            const itemQty = document.createElement('span');
            itemQty.className = 'text-secondary-color font-mono text-[11px]';
            itemQty.textContent = 'x' + (item.qty || 1);

            leftItem.appendChild(itemTitle);
            leftItem.appendChild(itemQty);

            const itemPrice = document.createElement('span');
            itemPrice.className = 'font-mono text-secondary-color ml-auto';
            itemPrice.textContent = ((item.price || 0) * (item.qty || 1)).toLocaleString('vi-VN') + ' đ';

            row.appendChild(leftItem);
            row.appendChild(itemPrice);
            itemsBox.appendChild(row);
          });
          card.appendChild(itemsBox);
        }

        // Action Buttons
        const actions = document.createElement('div');
        actions.className = 'pt-2 flex flex-wrap gap-2';

        const hotlinePhone = (window.TTStore && typeof window.TTStore.getZaloPhone === 'function')
          ? window.TTStore.getZaloPhone()
          : null;

        const supportBtn = document.createElement('a');
        if (hotlinePhone) {
          supportBtn.href = `https://zalo.me/${hotlinePhone}?text=${encodeURIComponent('Chào xưởng T&T, tôi cần hỗ trợ thông tin bản nháp đơn hàng mã: ' + (ord.clientRequestId || ''))}`;
          supportBtn.target = '_blank';
          supportBtn.rel = 'noopener noreferrer';
        } else {
          supportBtn.setAttribute('aria-disabled', 'true');
          supportBtn.onclick = (e) => {
            if (e && e.preventDefault) e.preventDefault();
            const msg = 'Chưa cấu hình kênh Zalo hỗ trợ. Vui lòng liên hệ hotline xưởng.';
            if (window.showToast) window.showToast(msg);
            else if (typeof alert === 'function') alert(msg);
            return false;
          };
        }
        supportBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5C00] text-[#0B0C0E] font-bold text-xs hover:opacity-90 transition-all';
        supportBtn.innerHTML = '<i class="fa-solid fa-headset mr-1"></i><span>Yêu Cầu Hỗ Trợ Qua Zalo</span>';

        const copyIdBtn = document.createElement('button');
        copyIdBtn.type = 'button';
        copyIdBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] hover:border-[#FF5C00] text-secondary-color hover:text-primary-color border border-[var(--border-subtle)] text-xs font-semibold transition-all';
        copyIdBtn.innerHTML = '<i class="fa-regular fa-copy mr-1"></i><span>Sao Chép Mã Nháp</span>';
        copyIdBtn.addEventListener('click', async () => {
          try {
            if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
              await navigator.clipboard.writeText(ord.clientRequestId || '');
              copyIdBtn.innerHTML = '<i class="fa-solid fa-check text-emerald-400 mr-1"></i><span class="text-emerald-400">Đã Sao Chép!</span>';
              setTimeout(() => {
                copyIdBtn.innerHTML = '<i class="fa-regular fa-copy mr-1"></i><span>Sao Chép Mã Nháp</span>';
              }, 2500);
            }
          } catch (e) {
            copyIdBtn.innerHTML = '<span>' + (ord.clientRequestId || '') + '</span>';
          }
        });

        actions.appendChild(supportBtn);
        actions.appendChild(copyIdBtn);
        card.appendChild(actions);

        resultsContainer.appendChild(card);
      });
    }

    window.lookupOrderProgress = doLookup;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      doLookup(val);
    });
  }

  function escapeHtmlApp(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- 8. SYNC WITH CENTRAL CONFIG (CONFIG.JS) ---
  // Central Shop Zalo Link Binder (Codex Directive R4-02)
  function bindShopZaloLink(link, message = '') {
    const phone = window.TTStore?.getZaloPhone?.() ?? null;
    link.removeAttribute('href');
    link.removeAttribute('target');
    link.setAttribute('aria-disabled', String(!phone));
    link.onclick = phone ? null : event => { if (event && event.preventDefault) event.preventDefault(); };
    if (!phone) return;
    const query = message ? '?text=' + encodeURIComponent(message) : '';
    link.href = 'https://zalo.me/' + phone + query;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.removeAttribute('aria-disabled');
  }

  function bindAllShopZaloLinks() {
    document.querySelectorAll('[data-zalo-contact="true"]').forEach(link => {
      bindShopZaloLink(link);
    });
  }

  window.bindShopZaloLink = bindShopZaloLink;
  window.bindAllShopZaloLinks = bindAllShopZaloLinks;

  function refreshShopContacts() {
    bindAllShopZaloLinks();
    if (typeof window.refreshPreparedCadContact === 'function') {
      window.refreshPreparedCadContact();
    }
    if (typeof window.refreshPreparedCheckoutContact === 'function') {
      window.refreshPreparedCheckoutContact();
    }
  }

  window.refreshShopContacts = refreshShopContacts;

  function syncCentralConfig() {
    let cfg = null;
    try {
      const local = localStorage.getItem('TT_STUDIO_CONFIG');
      if (local) cfg = JSON.parse(local);
    } catch (e) {}

    if (!cfg && typeof TT_DEFAULT_CONFIG !== 'undefined') {
      cfg = TT_DEFAULT_CONFIG;
    }

    if (cfg && cfg.shopInfo) {
      const hotline = cfg.shopInfo.hotline || '0986.888.333';
      const zalo = cfg.shopInfo.zaloPhone || '0986888333';

      document.querySelectorAll('.dynamic-hotline-text').forEach(el => {
        el.textContent = hotline;
      });

      document.querySelectorAll('a[href^="tel:"]').forEach(a => {
        a.href = `tel:${zalo}`;
      });
    }

    refreshShopContacts();
  }

  // Initialize all components
  document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    initFloatingNavbar();
    initThemeSwitcher();
    initSegmentedFilters();
    initMobileMenu();
    initFaqAccordion();
    initOrderTracker();
    syncCentralConfig();
    if (typeof initHeroArtisanShowcase === 'function') {
      initHeroArtisanShowcase();
    }

    // Initialize Hero Layercraft 2.5D Automation Simulator (Codex WP3)
    if (window.TTAutomationSimulator && document.getElementById('hero-layercraft-simulator')) {
      const currentTheme = window.TTTheme ? window.TTTheme.getTheme() : 'dark';
      window.heroSimulator = window.TTAutomationSimulator.create('#hero-layercraft-simulator', {
        totalLayers: 120,
        cycleDurationMs: 12000,
        defaultColor: '#64E8F5',
        defaultTheme: currentTheme,
        autoPlay: true
      });
    }
  });

  // Lắng nghe thay đổi Theme để cập nhật Simulator
  window.addEventListener('tt_theme_changed', (e) => {
    if (window.heroSimulator && typeof window.heroSimulator.setTheme === 'function' && e.detail) {
      window.heroSimulator.setTheme(e.detail.theme);
    }
  });

  // Lắng nghe sự kiện cập nhật cấu hình cùng trang (Codex R5-02)
  window.addEventListener('tt_config_updated', () => {
    syncCentralConfig();
  });

  // Lắng nghe sự kiện storage liên tab (Codex R5-02)
  window.addEventListener('storage', (e) => {
    if (!e || e.key === 'TT_STUDIO_CONFIG' || e.key === null) {
      syncCentralConfig();
    }
  });

  // Lắng nghe cập nhật catalog để đồng bộ Hero Showcase (Codex TT3D-HERO-20261024-R1)
  window.addEventListener('tt_products_updated', () => {
    if (typeof refreshHeroShowcase === 'function') {
      refreshHeroShowcase();
    }
  });

})();
