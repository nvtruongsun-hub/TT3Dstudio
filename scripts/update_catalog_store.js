const fs = require('fs');

const baselineData = JSON.parse(fs.readFileSync('reports/typography-r1/baseline_seed.json', 'utf8'));
const baselineMap = {};
baselineData.forEach(p => {
  baselineMap[p.id] = { title: p.title, cleanTitle: p.cleanTitle || '' };
});

let storeJs = fs.readFileSync('js/catalog-store.js', 'utf8');

// 1. Insert BASELINE_PRODUCT_SEED_MAP after CATEGORY_REGISTRY
const baselineMapStr = `
  // Baseline Seed Snapshot phục vụ 3-way merge an toàn (Codex Directive TT3D-STUDIO-TYPO-R1)
  const BASELINE_PRODUCT_SEED_MAP = ${JSON.stringify(baselineMap, null, 2)};
`;

if (!storeJs.includes('const BASELINE_PRODUCT_SEED_MAP')) {
  storeJs = storeJs.replace(
    'const CATEGORY_REGISTRY = (window.TTCategoryRegistry',
    baselineMapStr + '\n  const CATEGORY_REGISTRY = (window.TTCategoryRegistry'
  );
}

// 2. Insert Presentation helpers
const presentationHelpers = `
  // Presentation API helpers (Codex Section 4 - WP-1)
  function presentationText(value) {
    return typeof value === 'string'
      ? value.normalize('NFC').replace(/\\s+/gu, ' ').trim()
      : '';
  }

  function fallbackProductTitle(value) {
    const original = presentationText(value);
    const withoutImporterId = original
      .replace(/\\s*#MW-\\d+\\s*$/iu, '')
      .trim();
    return withoutImporterId || original;
  }

  function getProductPresentation(product) {
    const p = product && typeof product === 'object' ? product : {};
    const title = presentationText(p.cleanTitle)
      || fallbackProductTitle(p.title)
      || 'Sản phẩm T&T';
    const categoryLabel = presentationText(
      CATEGORY_REGISTRY[p.category]?.shortName
    ) || 'Thiết kế T&T';
    const sourceSpecs = p.specs && typeof p.specs === 'object'
      && !Array.isArray(p.specs) ? p.specs : {};
    const specs = [...new Set(
      ['material', 'layer', 'dimensions', 'weight']
        .map(key => presentationText(sourceSpecs[key]))
        .filter(Boolean)
    )].slice(0, 2);
    return {
      title,
      subtitle: presentationText(p.headlineBenefit),
      categoryLabel,
      specs
    };
  }
`;

if (!storeJs.includes('function getProductPresentation')) {
  storeJs = storeJs.replace(
    'function mergeRawBeforeSanitize(storedRaw, baseSeed) {',
    presentationHelpers + '\n  function mergeRawBeforeSanitize(storedRaw, baseSeed) {'
  );
}

// 3. Update mergeRawBeforeSanitize to implement three-way merge
const oldMergeRawRegex = /function mergeRawBeforeSanitize\(storedRaw, baseSeed\) \{[\s\S]*?return \{ item: merged, changed \};\s*\}/;
const newMergeRaw = `function mergeRawBeforeSanitize(storedRaw, baseSeed) {
    if (!baseSeed) return { item: storedRaw, changed: false };
    const merged = { ...baseSeed };
    let changed = false;

    // Three-way merge for cleanTitle (Codex WP-1B Directive)
    // Nếu storedRaw khớp baseline seed cũ (chưa bị Admin sửa), cho phép seed mới cập nhật cleanTitle
    const baseline = storedRaw.id ? BASELINE_PRODUCT_SEED_MAP[storedRaw.id] : null;
    const isUnmodifiedSeed = baseline &&
      storedRaw.title === baseline.title &&
      (storedRaw.cleanTitle || '') === (baseline.cleanTitle || '');

    for (const key of Object.keys(storedRaw)) {
      const val = storedRaw[key];
      if (val === undefined) continue;

      if (key === 'specs' && val && typeof val === 'object' && !Array.isArray(val)) {
        merged.specs = { ...(baseSeed.specs || {}), ...val };
        changed = true;
        continue;
      }

      if (key === 'cleanTitle' && isUnmodifiedSeed && baseSeed.cleanTitle) {
        merged.cleanTitle = baseSeed.cleanTitle;
        changed = true;
        continue;
      }

      // Giữ nguyên các mảng hoặc giá trị người dùng đã định nghĩa
      merged[key] = val;
      changed = true;
    }

    // Bảo toàn modelKey:null có chủ ý (không tự phục hồi model khác)
    if ('modelKey' in storedRaw) {
      merged.modelKey = storedRaw.modelKey;
    }

    return { item: merged, changed };
  }`;

storeJs = storeJs.replace(oldMergeRawRegex, newMergeRaw);

// 4. Export getProductPresentation
if (!storeJs.includes('getProductPresentation,')) {
  storeJs = storeJs.replace(
    'getProductByIdSync,',
    'getProductByIdSync,\n    getProductPresentation,'
  );
}

fs.writeFileSync('js/catalog-store.js', storeJs, 'utf8');
console.log('Successfully updated js/catalog-store.js with getProductPresentation and 3-way merge.');
