const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'js', 'products-manager.js');
let c = fs.readFileSync(file, 'utf8');

const subFilterDelegation = `
    const subFilterContainer = document.getElementById('store-sub-filters');
    if (subFilterContainer && !subFilterContainer.dataset.bound) {
      subFilterContainer.dataset.bound = 'true';
      subFilterContainer.addEventListener('click', (e) => {
        const pill = e.target.closest('.sub-filter-pill');
        if (!pill) return;
        const subCat = pill.dataset.subCategory || 'all';
        currentSubCategoryFilter = subCat;
        visibleProductLimit = 8;
        renderStoreProducts(currentCategoryFilter, false, false);
        subFilterContainer.querySelectorAll('.sub-filter-pill').forEach(p => {
          const isActive = (p.dataset.subCategory || 'all') === subCat;
          p.classList.toggle('active', isActive);
          p.setAttribute('aria-pressed', String(isActive));
        });
      });
    }
`;

const needle = "const container = document.getElementById('store-product-grid');\n    if (!container) return;";
const needleCrlf = "const container = document.getElementById('store-product-grid');\r\n    if (!container) return;";

if (c.includes(needleCrlf)) {
  c = c.replace(needleCrlf, needleCrlf + subFilterDelegation);
  fs.writeFileSync(file, c, 'utf8');
  console.log('Sub-filter delegation added (CRLF)');
} else if (c.includes(needle)) {
  c = c.replace(needle, needle + subFilterDelegation);
  fs.writeFileSync(file, c, 'utf8');
  console.log('Sub-filter delegation added (LF)');
} else {
  console.error('Target needle not found in js/products-manager.js');
}
