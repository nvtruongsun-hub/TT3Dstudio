/**
 * T&T 3D Studio - Main Application Controller & Multi-View Workspace Router
 * Benchmark: Linear / Nomad / Bambu Lab / Apple Workspace Standards
 * (Sheet 3: ID-01, ID-07, ID-09, ID-13, ID-36, Tab-Architecture R1-R3)
 */

(function () {
  'use strict';

  // --- 1. GLOBAL WORKSPACE ROUTER & STATE ENGINE ---
  const WORKSPACE_VIEWS = ['view-store', 'view-studio3d', 'view-configurator', 'view-standards'];

  const VIEW_HASH_MAP = {
    'view-store': '#store',
    'view-studio3d': '#studio3d',
    'view-configurator': '#calculator',
    'view-standards': '#standards'
  };

  const HASH_VIEW_MAP = {
    '#store': 'view-store',
    '#studio3d': 'view-studio3d',
    '#viewer': 'view-studio3d',
    '#viewer-section': 'view-studio3d',
    '#calculator': 'view-configurator',
    '#configurator': 'view-configurator',
    '#standards': 'view-standards',
    '#quality': 'view-standards',
    '#social-proof': 'view-store',
    '#store-catalog': 'view-store',
    '#faq': 'view-standards'
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
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.removeAttribute('aria-selected');
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

    // 5. Preserved 3D interactive viewport rendering upon activation
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

    // Close mobile dropdown drawer if open
    const drawer = document.getElementById('mobile-nav-drawer');
    const toggleBtn = document.getElementById('mobile-menu-toggle-btn');
    if (drawer && !drawer.classList.contains('hidden')) {
      drawer.classList.add('hidden');
      if (toggleBtn) toggleBtn.innerHTML = '<i class="fa-solid fa-bars text-sm"></i>';
    }
  }

  window.switchWorkspace = switchWorkspace;
  window.getActiveWorkspace = () => currentActiveView;

  // Initialize router navigation listeners
  function initRouter() {
    function navigateToHash(hash, pushState = true) {
      const normalizedHash = (!hash || hash === '#') ? '#store' : hash;
      const targetView = HASH_VIEW_MAP[normalizedHash] || 'view-store';
      const targetId = normalizedHash.replace(/^#/, '');
      const targetEl = targetId ? document.getElementById(targetId) : null;
      const isSubAnchor = targetEl && !['store', 'studio3d', 'calculator', 'standards'].includes(targetId);

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

      // In-page internal hash links (e.g. href="#calculator", href="#studio3d", href="#store")
      const anchor = e.target.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && HASH_VIEW_MAP[href]) {
          e.preventDefault();
          navigateToHash(href, true);
        }
      }
    });

    // Browser back / forward button handling with deduplication
    let isHandlingHistory = false;
    function handleHistoryChange() {
      if (isHandlingHistory) return;
      isHandlingHistory = true;
      const hash = window.location.hash.toLowerCase();
      navigateToHash(hash, false);
      setTimeout(() => { isHandlingHistory = false; }, 50);
    }

    window.addEventListener('popstate', handleHistoryChange);
    window.addEventListener('hashchange', handleHistoryChange);

    // Initial direct URL routing on page load
    const initialHash = window.location.hash.toLowerCase();
    if (initialHash && HASH_VIEW_MAP[initialHash]) {
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

    const iconHtml = type === 'error'
      ? `<i class="fa-solid fa-circle-exclamation text-red-500"></i>`
      : `<i class="fa-solid fa-circle-check text-[#FF5C00]"></i>`;

    toast.innerHTML = `
      ${iconHtml}
      <span>${message}</span>
    `;

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

  // --- 4. THEME SYSTEM: MATTE OBSIDIAN DARK & NORDIC LIGHT (ID-01) ---
  function initThemeSwitcher() {
    const THEME_KEY = 'tt_theme';
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';

    function applyTheme(theme) {
      if (theme === 'light') {
        document.body.classList.add('light-theme');
        document.documentElement.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
        document.documentElement.classList.remove('light-theme');
      }
      localStorage.setItem(THEME_KEY, theme);

      // Update theme toggle icons
      document.querySelectorAll('.theme-toggle-icon').forEach(icon => {
        if (theme === 'light') {
          icon.className = 'fa-solid fa-moon theme-toggle-icon text-sm';
        } else {
          icon.className = 'fa-solid fa-sun theme-toggle-icon text-sm';
        }
      });

      // Notify other components (like 3D viewer)
      window.dispatchEvent(new CustomEvent('tt_theme_changed', { detail: theme }));
    }

    applyTheme(savedTheme);

    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        if (window.showToast) {
          window.showToast(next === 'light' ? 'Đã chuyển sang giao diện Nordic Light (Ban ngày)' : 'Đã chuyển sang giao diện Matte Obsidian (Tối mặc định)');
        }
      });
    });
  }

  // --- 5. SEGMENTED FILTER CONTROLS FOR STORE (ID-13) ---
  function initSegmentedFilters() {
    document.querySelectorAll('#view-store .segmented-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#view-store .segmented-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const category = pill.dataset.category || 'all';
        if (window.renderStoreProducts) {
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
      if (isHidden) {
        drawer.classList.remove('hidden');
        btn.innerHTML = '<i class="fa-solid fa-xmark text-sm"></i>';
      } else {
        drawer.classList.add('hidden');
        btn.innerHTML = '<i class="fa-solid fa-bars text-sm"></i>';
      }
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.add('hidden');
        btn.innerHTML = '<i class="fa-solid fa-bars text-sm"></i>';
      });
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

  // --- 8. SYNC WITH CENTRAL CONFIG (CONFIG.JS) ---
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
  }

  // Initialize all components
  document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    initFloatingNavbar();
    initThemeSwitcher();
    initSegmentedFilters();
    initMobileMenu();
    initFaqAccordion();
    syncCentralConfig();
  });

})();
