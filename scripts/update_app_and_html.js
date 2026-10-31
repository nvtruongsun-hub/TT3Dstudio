const fs = require('fs');

// 1. Update js/app.js
let appJs = fs.readFileSync('js/app.js', 'utf8');

const oldHeroTitle = `      if (titleEl) {
        titleEl.textContent = ({'mw-cn-1646129':'Khay trang sức Nơ Lụa','mw-cn-1147539':'Biển tên để bàn','mw-cn-2235027':'Đèn bàn Washi'})[product.id] || product.title || '';
        titleEl.title = product.title || '';
      }`;

const newHeroTitle = `      if (titleEl) {
        const presentation = (window.TTCatalogStore && typeof window.TTCatalogStore.getProductPresentation === 'function')
          ? window.TTCatalogStore.getProductPresentation(product)
          : { title: product.cleanTitle || product.title || '' };
        titleEl.textContent = presentation.title;
        titleEl.title = presentation.title;
      }`;

appJs = appJs.replace(oldHeroTitle.replace(/\r\n/g, '\n'), newHeroTitle.replace(/\r\n/g, '\n'));

// Add syncLookbookTitles to appJs if not present
const syncLookbookFn = `
  function syncLookbookTitles() {
    if (!window.TTCatalogStore || typeof window.TTCatalogStore.getProductByIdSync !== 'function') return;
    document.querySelectorAll('[data-product-title]').forEach(el => {
      const id = el.dataset.productTitle;
      const prod = window.TTCatalogStore.getProductByIdSync(id);
      if (prod && typeof window.TTCatalogStore.getProductPresentation === 'function') {
        const pres = window.TTCatalogStore.getProductPresentation(prod);
        el.textContent = pres.title;
      }
    });
  }
  window.syncLookbookTitles = syncLookbookTitles;
`;

if (!appJs.includes('function syncLookbookTitles')) {
  appJs = appJs.replace(
    'window.switchHeroShowcase = switchHeroShowcase;',
    'window.switchHeroShowcase = switchHeroShowcase;\n' + syncLookbookFn
  );
  // Also register event listener
  appJs = appJs.replace(
    "window.addEventListener('tt_products_updated', () => {",
    "window.addEventListener('tt_products_updated', () => {\n      syncLookbookTitles();"
  );
}

fs.writeFileSync('js/app.js', appJs, 'utf8');
console.log('Updated js/app.js successfully.');

// 2. Update index.html lookbook hotspots with data-product-title
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(
  '<div class="text-xs font-bold text-[#141413]">Hộp bánh xe Ferris 360°</div>',
  '<div class="text-xs font-bold text-[#141413]" data-product-title="mw-cn-1971424">Hộp lưu trữ Đu Quay Ferris Xoay Cơ Học</div>'
);
html = html.replace(
  '<div class="text-xs font-bold text-[#141413]">Module ngăn kéo Pork3D</div>',
  '<div class="text-xs font-bold text-[#141413]" data-product-title="mw-cn-1404920">Hệ ngăn kéo xếp chồng Pork3D Để Bàn</div>'
);
html = html.replace(
  '<div class="text-xs font-bold text-[#141413]">Kẹp giữ cáp Skadis</div>',
  '<div class="text-xs font-bold text-[#141413]" data-product-title="mw-cn-701384">Kẹp cáp bảng IKEA Skadis Tối Giản</div>'
);
html = html.replace(
  '<div class="text-xs font-bold text-[#20231F]">Hộp đu quay Ferris xoay cơ học</div>',
  '<div class="text-xs font-bold text-[#20231F]" data-product-title="mw-cn-1971424">Hộp lưu trữ Đu Quay Ferris Xoay Cơ Học</div>'
);
html = html.replace(
  '<div class="text-xs font-bold text-[#20231F]">Hệ module ngăn kéo xếp chồng Pork3D</div>',
  '<div class="text-xs font-bold text-[#20231F]" data-product-title="mw-cn-1404920">Hệ ngăn kéo xếp chồng Pork3D Để Bàn</div>'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Updated index.html successfully.');
