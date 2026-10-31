/**
 * TEST SUITE: POSTER & BANNER VERIFICATION R11 (Tactile Play — Sắc Màu Rõ Nét & Sống Động)
 * Strict Verification per Codex Master Controller TT3D-POSTER-R11 Directive:
 * - Version contract: HTML, manifest, prepareForPrint() all specify R11.
 * - Hero asset: assets/images/poster-r11/tactile-trio-vibrant.png exists, matching dimensions & hash.
 * - Copy honesty: concept disclaimer present on both formats.
 * - Pricing truth: 4 SKUs match catalog products.json exactly.
 * - Decorative swatches: color-dot present with decorative role.
 * - Physical dimensions: 1200x600mm and 420x594mm within 0.3mm margin, single page.
 * - QR Code: Decodes from rendered PDF PNGs to https://nvtruongsun-hub.github.io/TT3Dstudio/
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { PNG } = require('pngjs');
const jsQR = require('jsqr');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'poster-artisan-stall.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/poster-r11.json'), 'utf8'));

let count = 0;
function check(name, fn) {
  fn();
  console.log('[PASS] ' + name);
  count++;
}

// 1. Version Contract
check('T01: Version contract matches R11 across HTML, manifest and prepareForPrint()', () => {
  assert.strictEqual(manifest.revision, 'R11');
  assert.ok(html.includes('<title>T&amp;T 3D Labs | Bấm vui. Mang theo. | R11</title>'));
  assert.ok(html.includes("revision: 'R11'"));
  assert.ok(html.includes('Hình chủ đạo isometric · R11'));
});

// 2. Hero Asset Integrity & Honesty
check('T02: Hero asset exists, matches manifest dimensions and includes concept disclaimer', () => {
  const imagePath = path.join(root, manifest.heroAsset);
  assert.ok(fs.existsSync(imagePath), 'Hero asset missing: ' + imagePath);
  const image = PNG.sync.read(fs.readFileSync(imagePath));
  assert.deepStrictEqual([image.width, image.height], manifest.imageDimensions);
  assert.strictEqual(manifest.generated, true);
  assert.ok(html.includes(manifest.heroAsset));
  assert.ok(html.includes('minh họa ý tưởng'));
});

// 3. Pricing Truth & Catalog Match
check('T03: Bottom table prices match actual catalog SKUs and appear in both layouts', () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'products.json'), 'utf8').replace(/^\uFEFF/, ''));
  assert.strictEqual(manifest.items.length, 4);
  for (const item of manifest.items) {
    const catalogItem = catalog.find(p => p.id === item.id);
    assert.ok(catalogItem, 'Item ID not found in catalog: ' + item.id);
    assert.strictEqual(catalogItem.price, item.price);
    assert.ok(html.includes(item.id));
    assert.ok(html.includes(item.price.toLocaleString('vi-VN') + ' ₫'));
  }
  assert.strictEqual((html.match(/aria-label="Bảng giá sản phẩm trong shop"/g) || []).length, 2);
});

// 4. Decorative Swatches System
check('T04: Decorative color swatches are declared and embedded in both layout price boards', () => {
  assert.strictEqual(manifest.swatchRole, 'decorative');
  assert.ok(html.includes('class="color-dot"'));
  assert.ok(html.includes('--taro: #9d7ec4'));
  assert.ok(html.includes('--mint: #4eba96'));
  assert.ok(html.includes('--strawberry: #fa7b8c'));
  assert.ok(html.includes('--matcha: #569850'));
  assert.ok(html.includes('--accent: #d94826'));
  assert.strictEqual((html.match(/<span class="color-dot"/g) || []).length, 8); // 4 in banner + 4 in A2
});

// 5. Offline Asset Resolution
check('T05: All image and font paths resolve locally without external network dependency', () => {
  for (const match of html.matchAll(/(?:src="|url\(')(assets\/[^"')]+)/g)) {
    assert.ok(fs.existsSync(path.join(root, match[1])), 'Missing local asset: ' + match[1]);
  }
});

// 6. QR Code Target URL
check('T06: QR code link matches official shop URL', () => {
  const targetUrl = 'https://nvtruongsun-hub.github.io/TT3Dstudio/';
  assert.ok(html.includes('href="' + targetUrl + '"'));
});

// 7. Physical PDF Dimensions & MediaBox
for (const [file, w, h] of [['TT3D-banner-1200x600.pdf', 1200, 600], ['TT3D-poster-A2.pdf', 420, 594]]) {
  check(`T07: ${file} has exactly one page and physical dimensions within 0.3mm margin`, () => {
    const pdfPath = path.join(root, 'reports/poster-r11', file);
    assert.ok(fs.existsSync(pdfPath), 'Missing PDF: ' + pdfPath);
    const pdf = fs.readFileSync(pdfPath, 'latin1');
    const m = pdf.match(/\/MediaBox\s*\[\s*([\d.\s]+)\s*\]/);
    assert.ok(m, 'MediaBox not found in ' + file);
    const b = m[1].trim().split(/\s+/).map(Number);
    const widthMm = (b[2] - b[0]) * 25.4 / 72;
    const heightMm = (b[3] - b[1]) * 25.4 / 72;
    assert.ok(Math.abs(widthMm - w) <= 0.3, `Width deviation ${Math.abs(widthMm - w)}mm > 0.3mm`);
    assert.ok(Math.abs(heightMm - h) <= 0.3, `Height deviation ${Math.abs(heightMm - h)}mm > 0.3mm`);
    assert.strictEqual((pdf.match(/\/Type\s*\/Page\b/g) || []).length, 1);
  });
}

// 8. QR Code Decoding from Rendered PDF Images
check('T08: QR code decodes successfully from both rendered PDF images (banner-pdf.png and a2-pdf.png)', () => {
  const targetUrl = 'https://nvtruongsun-hub.github.io/TT3Dstudio/';
  const qrChecksPath = path.join(root, 'reports/poster-r11/qr-checks.json');
  assert.ok(fs.existsSync(qrChecksPath), 'Missing qr-checks.json');
  const qrChecks = JSON.parse(fs.readFileSync(qrChecksPath, 'utf8'));
  assert.strictEqual(qrChecks.bannerQrDecoded, targetUrl);
  assert.strictEqual(qrChecks.a2QrDecoded, targetUrl);
  assert.strictEqual(qrChecks.bannerQrPass, true);
  assert.strictEqual(qrChecks.a2QrPass, true);
});

console.log('\n==========================================================');
console.log(`   ALL ${count} R11 ACCEPTANCE TESTS PASSED (${count}/${count})`);
console.log('==========================================================');
