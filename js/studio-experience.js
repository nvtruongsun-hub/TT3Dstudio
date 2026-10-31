/* Studio motion: progressive enhancement, native observers, no animation dependency. */
(function () {
  'use strict';

  function init() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hero = document.getElementById('hero');
    const card = hero && hero.querySelector('.hero-showcase-card');
    const toggle = document.getElementById('studio-motion-toggle');
    const tickerToggle = document.getElementById('studio-ticker-toggle');
    const ticker = document.querySelector('.automation-marquee-bar');
    const counter = document.getElementById('studio-slide-count');
    const tabs = hero ? [...hero.querySelectorAll('[data-hero-tab]')] : [];
    let playing = !reduced.matches;
    try { if (localStorage.getItem('tt_studio_motion') === 'paused') playing = false; } catch (_) {}
    let hovered = false;
    let focused = false;
    let heroVisible = true;
    let tickerVisible = true;
    let timer = null;
    let revealObserver = null;
    const observed = new WeakSet();
    const cycleMs = 7000;

    function clearCycle() {
      window.clearTimeout(timer);
      timer = null;
      if (card) card.classList.remove('studio-cycling');
      document.body.dataset.studioRunning = 'false';
    }

    function schedule() {
      clearCycle();
      const dialogOpen = !!document.querySelector('#order-modal.active, #checkout-modal.active, #cart-slide-drawer.active');
      document.body.dataset.studioMotion = reduced.matches ? 'reduced' : playing ? 'playing' : 'paused';
      document.body.dataset.tickerRunning = String(playing && !reduced.matches && !document.hidden && tickerVisible && !dialogOpen);
      const activeView = typeof window.getActiveWorkspace === 'function' ? window.getActiveWorkspace() : 'view-store';
      if (!playing || reduced.matches || hovered || focused || !heroVisible || document.hidden || dialogOpen || activeView !== 'view-store' || tabs.length < 2) return;
      if (card) { void card.offsetWidth; card.classList.add('studio-cycling'); }
      document.body.dataset.studioRunning = 'true';
      timer = window.setTimeout(() => {
        const active = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
        const next = tabs[(active + 1) % tabs.length];
        if (next && typeof window.switchHeroShowcase === 'function') window.switchHeroShowcase(next.dataset.heroTab);
        schedule();
      }, cycleMs);
    }

    function updateToggle() {
      [toggle, tickerToggle].filter(Boolean).forEach(button => {
        button.setAttribute('aria-pressed', String(playing));
        const label = reduced.matches ? 'Hiệu ứng tự động đã tắt theo cài đặt giảm chuyển động' : playing ? 'Tạm dừng hiệu ứng và tự chuyển sản phẩm' : 'Bật hiệu ứng và tự chuyển sản phẩm';
        button.setAttribute('aria-label', label); button.title = label;
        const icon = button.querySelector('i');
        if (icon) icon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
        const text = button.querySelector('span');
        if (text) text.textContent = reduced.matches ? 'Giảm chuyển động' : playing ? 'Tạm dừng' : 'Tự chuyển';
        button.disabled = reduced.matches;
      });
    }

    function setPlaying(value) {
      playing = value && !reduced.matches;
      try { localStorage.setItem('tt_studio_motion', playing ? 'playing' : 'paused'); } catch (_) {}
      updateToggle(); schedule();
    }

    function syncSelection() {
      const index = Math.max(0, tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true'));
      if (counter) counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(tabs.length).padStart(2, '0')}`;
    }

    [toggle, tickerToggle].filter(Boolean).forEach(button => button.addEventListener('click', () => setPlaying(!playing)));
    if (card) {
      card.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; clearCycle(); } });
      card.addEventListener('pointerleave', () => { hovered = false; schedule(); });
      const keyboardFocusInCard = () => card.contains(document.activeElement) && document.activeElement !== toggle && document.activeElement.matches(':focus-visible');
      card.addEventListener('focusin', () => { focused = keyboardFocusInCard(); schedule(); });
      card.addEventListener('focusout', () => {
        requestAnimationFrame(() => { focused = keyboardFocusInCard(); schedule(); });
      });
      // A manual choice always pauses autoplay, including touch users.
      card.addEventListener('click', event => {
        if (event.target.closest('[data-hero-tab], .hero-swatch-dot, #hero-showcase-detail-btn')) setPlaying(false);
      });
      const selectionObserver = new MutationObserver(syncSelection);
      tabs.forEach(tab => selectionObserver.observe(tab, { attributes: true, attributeFilter: ['aria-selected'] }));
    }
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        heroVisible = entries[0].isIntersecting;
        schedule();
      }, { threshold: 0.08 }).observe(hero);
    }
    if (ticker && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => { tickerVisible = entries[0].isIntersecting; schedule(); }, { threshold: 0 }).observe(ticker);
    }
    document.addEventListener('visibilitychange', schedule);
    window.addEventListener('hashchange', schedule);
    // SPA uses pushState, so observe view visibility rather than patching its router.
    const view = document.getElementById('view-store');
    if (view) new MutationObserver(schedule).observe(view, { attributes: true, attributeFilter: ['class'] });
    ['order-modal', 'checkout-modal', 'cart-slide-drawer'].forEach(id => {
      const dialog = document.getElementById(id);
      if (dialog) new MutationObserver(schedule).observe(dialog, { attributes: true, attributeFilter: ['class'] });
    });

    function registerReveals(root) {
      if (!revealObserver || reduced.matches) return;
      root.querySelectorAll('.bento-card, .tt-product-card, .minimal-process li, .minimal-personalize-layout > div').forEach((element, index) => {
        if (observed.has(element)) return;
        observed.add(element);
        element.style.setProperty('--reveal-delay', `${index % 4 * 45}ms`);
        element.classList.add('studio-reveal-pending');
        revealObserver.observe(element);
      });
    }

    function setupReveals() {
      if (revealObserver) revealObserver.disconnect();
      document.querySelectorAll('.studio-reveal-pending').forEach(element => element.classList.remove('studio-reveal-pending'));
      if (reduced.matches || !('IntersectionObserver' in window)) { revealObserver = null; return; }
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove('studio-reveal-pending');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.05, rootMargin: '0px 0px 40px 0px' });
      registerReveals(document);
    }
    setupReveals();
    ['store-product-grid', 'curated-product-grid'].forEach(id => {
      const grid = document.getElementById(id);
      if (grid) new MutationObserver(() => registerReveals(grid)).observe(grid, { childList: true });
    });
    // Nested cards are inserted with innerHTML into a wrapper; registering the root finds them too.
    reduced.addEventListener('change', () => {
      if (reduced.matches) playing = false;
      updateToggle(); schedule(); setupReveals();
    });

    updateToggle(); syncSelection(); schedule();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
