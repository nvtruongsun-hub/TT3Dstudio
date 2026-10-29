const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'catalog-store.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Bump revision
code = code.replace("const CURRENT_CATALOG_REVISION = 'mw-55-v2';", "const CURRENT_CATALOG_REVISION = 'mw-55-v3';");

// 2. Add differentiation fields to sanitizeProduct
const target = `      specLine: String(p.specLine || '').trim(),`;
const replacement = `      specLine: String(p.specLine || '').trim(),
      cleanTitle: p.cleanTitle ? String(p.cleanTitle).trim() : null,
      archetypeBadge: p.archetypeBadge ? String(p.archetypeBadge).trim() : null,
      badgeTheme: p.badgeTheme ? String(p.badgeTheme).trim() : 'default',
      useCaseEyebrow: p.useCaseEyebrow ? String(p.useCaseEyebrow).trim() : null,
      subCategory: p.subCategory ? String(p.subCategory).trim() : null,
      subCategoryName: p.subCategoryName ? String(p.subCategoryName).trim() : null,
      microSpecs: p.microSpecs ? String(p.microSpecs).trim() : null,`;

if (!code.includes('cleanTitle: p.cleanTitle')) {
  code = code.replace(target, replacement);
  console.log('Added differentiation fields to sanitizeProduct in js/catalog-store.js');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated js/catalog-store.js!');
