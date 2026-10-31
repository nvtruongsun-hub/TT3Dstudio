/* Small native motion primitives. Business state and purchases stay with their owners. */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const easing = 'cubic-bezier(.22,1,.36,1)';
  const animations = new Set();
  const panels = new WeakMap();
  const dialogs = new WeakMap();
  const heroGhosts = new WeakMap();
  const canMove = element => !reduced.matches && !!element && typeof element.animate === 'function';

  function animate(element, frames, options) {
    if (!canMove(element)) return null;
    const animation = element.animate(frames, Object.assign({ duration: 260, easing }, options));
    animations.add(animation);
    const clean = () => animations.delete(animation);
    animation.finished.then(clean, clean);
    return animation;
  }

  function captureGrid(container) {
    const positions = new Map();
    if (reduced.matches || !container) return positions;
    container.querySelectorAll('.catalog-product-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) positions.set(card.dataset.productId, rect);
    });
    return positions;
  }

  function animateGrid(container, before) {
    if (reduced.matches || !container) return;
    container.querySelectorAll('.catalog-product-card').forEach((card, index) => {
      const next = card.getBoundingClientRect();
      if (next.bottom < 0 || next.top > innerHeight + 30) return;
      const previous = before && before.get(card.dataset.productId);
      const dx = previous ? previous.left - next.left : 0;
      const dy = previous ? previous.top - next.top : 10;
      const travel = previous && Math.abs(dx) < 700 && Math.abs(dy) < 400;
      animate(card, [
        { transform: 'translate(' + (travel ? dx : 0) + 'px,' + (travel ? dy : 10) + 'px)', opacity: previous ? 1 : .15 },
        { transform: 'none', opacity: 1 }
      ], { duration: 300, delay: previous ? 0 : Math.min(index % 3, 2) * 28 });
    });
  }

  function togglePanel(panel, open) {
    if (!panel) return;
    const from = panel.hidden ? 0 : panel.getBoundingClientRect().height;
    const previous = panels.get(panel);
    panels.delete(panel);
    if (previous) previous.animation.cancel();
    panel.inert = !open;
    const overflow = previous ? previous.overflow : panel.style.overflow;
    if (!canMove(panel)) { panel.hidden = !open; panel.style.overflow = overflow; return; }
    panel.hidden = false;
    panel.style.overflow = 'hidden';
    const animation = animate(panel, [{ height: from + 'px', opacity: open ? .25 : 1 }, { height: (open ? panel.scrollHeight : 0) + 'px', opacity: open ? 1 : 0 }], { duration: open ? 260 : 180 });
    panels.set(panel, { animation, overflow });
    animation.finished.then(() => {
      if (panels.get(panel)?.animation !== animation) return;
      panels.delete(panel); panel.hidden = !open; panel.style.overflow = overflow;
    }, () => {});
  }

  function openDialog(modal) {
    const previous = dialogs.get(modal);
    dialogs.delete(modal);
    if (previous) previous.cancel();
    delete modal.dataset.motionClosing;
    modal.inert = false;
    animate(modal, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
    const panel = modal.querySelector('#order-modal-container');
    if (panel) animate(panel, [{ transform: 'translateY(16px) scale(.987)' }, { transform: 'none' }], { duration: 330 });
  }

  function closeDialog(modal, finish) {
    if (!modal || modal.classList.contains('hidden') || !canMove(modal)) { finish(); return; }
    if (dialogs.has(modal)) return;
    modal.dataset.motionClosing = 'true';
    modal.inert = true;
    const animation = animate(modal, [{ opacity: 1 }, { opacity: 0 }], { duration: 160 });
    dialogs.set(modal, animation);
    animation.finished.then(() => {
      if (dialogs.get(modal) !== animation) return;
      dialogs.delete(modal); delete modal.dataset.motionClosing; modal.inert = false; finish();
    }, () => {});
  }

  function swapHeroImage(image, src, alt) {
    const oldGhost = heroGhosts.get(image);
    if (oldGhost) oldGhost.remove();
    let ghost = null;
    if (canMove(image) && image.complete && image.getAttribute('src') !== src && image.parentElement) {
      ghost = document.createElement('span'); ghost.className = 'atelier-image-ghost'; ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true;
      const copy = image.cloneNode(false); copy.removeAttribute('id'); copy.alt = '';
      copy.style.objectFit = getComputedStyle(image).objectFit;
      copy.style.objectPosition = getComputedStyle(image).objectPosition;
      ghost.appendChild(copy); image.parentElement.appendChild(ghost); heroGhosts.set(image, ghost);
    }
    image.src = src; image.alt = alt;
    if (ghost) {
      const animation = animate(ghost, [{ opacity: 1 }, { opacity: 0 }], { duration: 380 });
      animation.finished.then(() => { ghost.remove(); if (heroGhosts.get(image) === ghost) heroGhosts.delete(image); }, () => ghost.remove());
    }
  }

  function init() {
    const group = document.getElementById('store-category-filters');
    if (group) {
      const indicator = document.createElement('span'); indicator.className = 'motion-pill-indicator'; indicator.setAttribute('aria-hidden', 'true');
      group.prepend(indicator); group.classList.add('motion-pill-ready');
      let frame = 0;
      function syncIndicator() {
        frame = 0;
        if (!indicator.isConnected) group.prepend(indicator);
        const active = group.querySelector('[data-category][aria-pressed="true"]');
        if (!active || !active.getClientRects().length) { indicator.hidden = true; return; }
        indicator.hidden = false;
        const parent = group.getBoundingClientRect(), rect = active.getBoundingClientRect();
        indicator.style.width = rect.width + 'px'; indicator.style.height = rect.height + 'px';
        indicator.style.transform = 'translate(' + (rect.left - parent.left + group.scrollLeft) + 'px,' + (rect.top - parent.top + group.scrollTop) + 'px)';
      }
      const requestSync = () => { if (!frame) frame = requestAnimationFrame(syncIndicator); };
      new MutationObserver(requestSync).observe(group, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-pressed'] });
      window.addEventListener('resize', requestSync, { passive: true });
      window.addEventListener('hashchange', requestSync);
      const store = document.getElementById('view-store');
      if (store) new MutationObserver(requestSync).observe(store, { attributes: true, attributeFilter: ['class'] });
      document.fonts && document.fonts.ready.then(requestSync);
      group.addEventListener('click', event => {
        const button = event.target.closest('[data-category]');
        if (!button) return;
        const left = button.offsetLeft + button.offsetWidth / 2 - group.clientWidth / 2;
        group.scrollTo({ left: Math.max(0, left), behavior: reduced.matches ? 'auto' : 'smooth' });
        requestSync();
      });
      requestSync();
    }
    document.addEventListener('pointerdown', event => {
      if (reduced.matches || event.button !== 0) return;
      const button = event.target.closest('.btn-primary, .btn-secondary, .catalog-product-select, .dock-item, [data-product-layout]');
      if (!button || button.disabled) return;
      button.querySelectorAll('.atelier-ripple').forEach(node => node.remove());
      const rect = button.getBoundingClientRect(), size = Math.max(rect.width, rect.height) * 1.6;
      const ripple = document.createElement('span'); ripple.className = 'atelier-ripple'; ripple.setAttribute('aria-hidden', 'true');
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = event.clientX - rect.left - size / 2 + 'px'; ripple.style.top = event.clientY - rect.top - size / 2 + 'px';
      button.appendChild(ripple);
      const animation = animate(ripple, [{ transform: 'scale(0)', opacity: .15 }, { transform: 'scale(1)', opacity: 0 }], { duration: 440 });
      if (animation) animation.finished.then(() => ripple.remove(), () => ripple.remove()); else ripple.remove();
    }, { passive: true });
  }
  reduced.addEventListener('change', () => {
    if (reduced.matches) animations.forEach(animation => { try { animation.finish(); } catch (_) { animation.cancel(); } });
  });
  window.TTInterfaceMotion = { captureGrid, animateGrid, togglePanel, openDialog, closeDialog, swapHeroImage };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
