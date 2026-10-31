const fs = require('fs');
let code = fs.readFileSync('js/products-manager.js', 'utf8');

code = code.replace(
  '// Fill Visuals with Safe Text / DOM API',
  `// Fill Visuals with Safe Text / DOM API
    const modalView = (window.TTCatalogStore && typeof window.TTCatalogStore.getProductPresentation === 'function')
      ? window.TTCatalogStore.getProductPresentation(item)
      : { title: item.cleanTitle || getCleanTitle(item.title) };`
);

code = code.replace(
  "imgEl.alt = item.imageAlt || getCleanTitle(item.title) || 'Ảnh sản phẩm';",
  "imgEl.alt = item.imageAlt || modalView.title || 'Ảnh sản phẩm';"
);

fs.writeFileSync('js/products-manager.js', code, 'utf8');
console.log('Fixed modalView in products-manager.js');
