/* Product photography and selection clarity. No synthetic angles or recolouring. */
(function () {
  'use strict';
  const byId = id => document.getElementById(id);
  let currentProduct = null;
  let zoom = 1;
  let fitWidth = 0;
  let returnFocus = null;

  function updateSelection() {
    const product = window.modalActiveProduct || currentProduct;
    if (!product) return;
    const color = window.modalSelectedColor;
    const material = window.modalSelectedMat;
    const quantity = window.modalQty || 1;
    const summary = byId('product-selection-summary');
    if (summary) summary.textContent = 'Bạn chọn: ' + [color && color.name, material && (material.label || material.name), `${quantity} sản phẩm`].filter(Boolean).join(' · ');
    const materialSpec = document.querySelector('[data-spec-kind="material"]');
    if (materialSpec && material) materialSpec.textContent = material.label || material.name;
    const note = byId('product-photo-note');
    if (note) note.textContent = 'Ảnh tham khảo mẫu. Chưa có ảnh riêng cho từng màu và vật liệu; xưởng sẽ xác nhận phiên bản bạn chọn.';
  }

  function refresh(product) {
    currentProduct = product;
    const benefit = byId('product-use-case-text');
    if (benefit) benefit.textContent = product.headlineBenefit || product.desc || 'Liên hệ xưởng để được tư vấn công dụng phù hợp.';
    const sizeNote = byId('product-size-note');
    if (sizeNote) sizeNote.textContent = product.specs && product.specs.dimensions
      ? 'Đối chiếu số đo với vị trí bạn định đặt sản phẩm trước khi chọn.'
      : 'Mẫu này chưa có số đo dài × rộng × cao. Hãy xác nhận kích thước với xưởng trước khi đặt.';
    const photoButton = byId('product-photo-open');
    if (photoButton) photoButton.setAttribute('aria-label', `Phóng to ảnh ${product.title || 'sản phẩm'}`);
    updateSelection();
  }

  function setZoom(value) {
    const viewport = byId('product-image-viewport');
    const image = byId('product-image-large');
    const stage = byId('product-image-stage');
    if (!viewport || !image || !stage) return;
    const oldZoom = zoom;
    const centreX = (viewport.scrollLeft + viewport.clientWidth / 2) / oldZoom;
    const centreY = (viewport.scrollTop + viewport.clientHeight / 2) / oldZoom;
    zoom = Math.max(1, Math.min(3, value));
    image.style.width = `${fitWidth * zoom}px`;
    stage.style.minWidth = '100%';
    viewport.dataset.zoomed = String(zoom > 1);
    viewport.scrollLeft = Math.max(0, centreX * zoom - viewport.clientWidth / 2);
    viewport.scrollTop = Math.max(0, centreY * zoom - viewport.clientHeight / 2);
    byId('product-image-scale').textContent = Math.round(zoom * 100) + '%';
    byId('product-image-minus').disabled = zoom === 1;
    byId('product-image-plus').disabled = zoom === 3;
  }

  function fitImage() {
    const viewport = byId('product-image-viewport');
    const image = byId('product-image-large');
    if (!viewport || !image) return;
    const ratio = image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : 1;
    fitWidth = Math.min(viewport.clientWidth - 32, (viewport.clientHeight - 32) * ratio, image.naturalWidth || Infinity);
    fitWidth = Math.max(80, fitWidth);
    setZoom(1);
    viewport.scrollTo(0, 0);
  }

  function openPhoto() {
    const original = byId('order-prod-img');
    const dialog = byId('product-image-dialog');
    const enlarged = byId('product-image-large');
    if (!original || !dialog || !enlarged || dialog.open || !original.getAttribute('src')) return;
    returnFocus = byId('product-photo-open') || document.activeElement;
    enlarged.src = original.currentSrc || original.src;
    enlarged.alt = original.alt;
    byId('product-image-title').textContent = currentProduct ? currentProduct.title.replace(/\s*\([^)]*\)\s*$/, '') : 'Xem ảnh sản phẩm';
    enlarged.onload = () => { if (dialog.open) fitImage(); };
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    requestAnimationFrame(fitImage);
    byId('product-image-close').focus();
  }

  function closePhoto() {
    const dialog = byId('product-image-dialog');
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else { dialog.removeAttribute('open'); restorePhotoFocus(); }
  }

  function restorePhotoFocus() {
    if (returnFocus && returnFocus.getClientRects().length) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  }

  function init() {
    const grid = byId('store-product-grid');
    const controls = document.querySelectorAll('[data-product-layout]');
    function setLayout(layout, remember) {
      const selected = layout === 'compact' ? 'compact' : 'large';
      if (grid) grid.dataset.layout = selected;
      controls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.productLayout === selected)));
      if (remember) { try { localStorage.setItem('tt_product_layout', selected); } catch (_) {} }
    }
    let saved = 'compact';
    try { saved = localStorage.getItem('tt_product_layout') || 'compact'; } catch (_) {}
    setLayout(saved, false);
    controls.forEach(button => button.addEventListener('click', () => setLayout(button.dataset.productLayout, true)));
    const dialog = byId('product-image-dialog');
    if (!dialog) return;
    byId('product-photo-open').addEventListener('click', openPhoto);
    byId('product-image-close').addEventListener('click', closePhoto);
    byId('product-image-plus').addEventListener('click', () => setZoom(zoom + 0.5));
    byId('product-image-minus').addEventListener('click', () => setZoom(zoom - 0.5));
    byId('product-image-reset').addEventListener('click', fitImage);
    dialog.addEventListener('close', restorePhotoFocus);
    dialog.addEventListener('click', event => { if (event.target === dialog) closePhoto(); });
    dialog.addEventListener('keydown', event => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(zoom + 0.5); }
      if (event.key === '-') { event.preventDefault(); setZoom(zoom - 0.5); }
      if (event.key === '0') { event.preventDefault(); fitImage(); }
    });
    // Touch uses native scrolling/pinch; mouse users may also drag a zoomed image.
    const viewport = byId('product-image-viewport');
    let drag = null;
    viewport.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || zoom === 1) return;
      drag = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener('pointermove', event => {
      if (!drag) return;
      viewport.scrollLeft = drag.left - (event.clientX - drag.x);
      viewport.scrollTop = drag.top - (event.clientY - drag.y);
    });
    const stopDrag = () => { drag = null; };
    viewport.addEventListener('pointerup', stopDrag);
    viewport.addEventListener('pointercancel', stopDrag);
    window.addEventListener('resize', () => { if (dialog.open) fitImage(); });
  }
  window.TTProductExperience = { refresh, updateSelection, openPhoto, closePhoto };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
