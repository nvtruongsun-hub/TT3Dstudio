/**
 * TEST SUITE: POSTER & BANNER VERIFICATION R4 (Codex Master Controller TT3D-POSTER-R4 & Argon 4)
 * Strict Verification of Contemporary Studio Craft Design System, Zero Unverified Claims,
 * Physical PDF MediaBox Dimensions, QR Code Quiet Zone, Ground Truth Pricing & Sale Campaign.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { PNG } = require('pngjs');
const jsQR = require('jsqr');

const ROOT_DIR = path.resolve(__dirname, '..');
const POSTER_HTML_PATH = path.join(ROOT_DIR, 'poster-artisan-stall.html');
const QR_SVG_PATH = path.join(ROOT_DIR, 'assets', 'images', 'qr-tt3d-website.svg');
const QR_PNG_PATH = path.join(ROOT_DIR, 'assets', 'images', 'qr-tt3d-website.png');

const CLICKER_HERO_PATH = path.join(ROOT_DIR, 'assets', 'images', 'poster-r4', 'clicker-hero.png');
const TRAY_HERO_PATH = path.join(ROOT_DIR, 'assets', 'images', 'poster-r4', 'tray-hero.png');
const BANNER_PDF_PATH = path.join(ROOT_DIR, 'reports', 'poster-r4', 'tt3d-banner-r4-1200x600.pdf');
const A2_PDF_PATH = path.join(ROOT_DIR, 'reports', 'poster-r4', 'tt3d-poster-r4-a2-420x594.pdf');

console.log('==========================================================');
console.log('   POSTER & BANNER TT3D-POSTER-R4 ACCEPTANCE TEST SUITE');
console.log('==========================================================\n');

let passCount = 0;
let failCount = 0;

function runCheck(id, description, fn) {
  try {
    fn();
    console.log(`  [PASS] ${id}: ${description}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${id}: ${description}`);
    console.error(`         Error: ${err.message}`);
    failCount++;
  }
}

const posterContent = fs.readFileSync(POSTER_HTML_PATH, 'utf8');

// T01: Structure & Preview-Stage Architecture & prepareForPrint
runCheck('T01', 'Implements preview-stage, preview-frame with ResizeObserver auto-fit and prepareForPrint()', () => {
  assert.ok(posterContent.includes('class="preview-stage"'), 'Missing preview-stage container');
  assert.ok(posterContent.includes('class="preview-frame"'), 'Missing preview-frame container');
  assert.ok(posterContent.includes('function fitPreview()'), 'Missing fitPreview calculation function');
  assert.ok(posterContent.includes('new ResizeObserver(fitPreview)'), 'Missing ResizeObserver integration');
  assert.ok(posterContent.includes('async function prepareForPrint(format)'), 'Missing prepareForPrint contract function');
});

// T02: Physical Page Size declarations (@page CSS)
runCheck('T02', 'CSS @page rules declare physical print dimensions 1200x600mm and 420x594mm with zero margin', () => {
  assert.ok(
    /size:\s*1200mm\s+600mm/i.test(posterContent),
    'Missing banner @page physical dimension 1200mm 600mm'
  );
  assert.ok(
    /size:\s*420mm\s+594mm/i.test(posterContent),
    'Missing A2 @page physical dimension 420mm 594mm'
  );
});

// T03: Truth in Advertising & Disallowed Claims
runCheck('T03', 'Prohibits unverified claims (no "lấy ngay", "an toàn tuyệt đối", "55+") and specifies Bio-PLA', () => {
  assert.ok(!posterContent.toLowerCase().includes('lấy ngay'), 'Contains prohibited claim "lấy ngay"');
  assert.ok(!posterContent.toLowerCase().includes('an toàn tuyệt đối'), 'Contains prohibited claim "an toàn tuyệt đối"');
  assert.ok(!posterContent.includes('55+'), 'Contains outdated hardcoded "55+" in text');
  assert.ok(posterContent.includes('Bio-PLA') || posterContent.includes('BIO-PLA'), 'Accurately specifies Bio-PLA');
});

// T04: Ground Truth Pricing & Special 49K -> 35K Campaign
runCheck('T04', 'Matches catalog prices (39K for clicker, 119K for tray) and 49K -> 35K campaign deal', () => {
  assert.ok(posterContent.includes('39.000₫'), 'Must contain clicker price 39.000₫');
  assert.ok(posterContent.includes('119.000₫'), 'Must contain coquette tray price 119.000₫');
  assert.ok(posterContent.includes('39K'), 'Must contain bold 39K price');
  assert.ok(posterContent.includes('119K'), 'Must contain bold 119K price');
  assert.ok(posterContent.includes('49.000₫'), 'Must contain original campaign price 49.000₫');
  assert.ok(posterContent.includes('35.000₫') || posterContent.includes('35K'), 'Must contain sale price 35.000₫ / 35K');
  assert.ok(posterContent.includes('ƯU ĐÃI ĐỒNG GIÁ'), 'Must state campaign name clearly');
});

// T05: Studio Layout Architecture & High-Resolution Assets
runCheck('T05', 'Enforces Contemporary Studio layout and ensures product assets exist on disk', () => {
  assert.ok(!posterContent.includes('class="card-img-box"'), 'Must not contain old .card-img-box');
  assert.ok(!posterContent.includes('class="card-price-pill"'), 'Must not contain old .card-price-pill');
  assert.ok(posterContent.includes('studio-showcase-column'), 'Must use .studio-showcase-column');
  assert.ok(posterContent.includes('hero-product-row'), 'Must use .hero-product-row');
  assert.ok(posterContent.includes('compact-qr-hub'), 'Must use .compact-qr-hub');
  assert.ok(fs.existsSync(CLICKER_HERO_PATH), 'clicker-hero.png exists on disk');
  assert.ok(fs.existsSync(TRAY_HERO_PATH), 'tray-hero.png exists on disk');
});

// T06: QR Code Decoding & 4-Module Quiet Zone Measurement
runCheck('T06', 'QR Code exists, decodes to https://tt3dlabs.vn/#store with 4-module quiet zone in SVG', () => {
  assert.ok(fs.existsSync(QR_SVG_PATH), 'qr-tt3d-website.svg exists');
  assert.ok(fs.existsSync(QR_PNG_PATH), 'qr-tt3d-website.png exists');

  // Verify SVG quiet zone = 4 modules (viewBox 33x33 for 25x25 matrix)
  const svgContent = fs.readFileSync(QR_SVG_PATH, 'utf8');
  assert.ok(svgContent.includes('viewBox="0 0 33 33"'), 'SVG must have 33x33 viewBox for 25x25 matrix + 4 module quiet zone');

  // Verify decoded URL
  const buffer = fs.readFileSync(QR_PNG_PATH);
  const png = PNG.sync.read(buffer);
  const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  assert.ok(code, 'jsQR failed to decode QR PNG');
  assert.strictEqual(code.data, 'https://tt3dlabs.vn/#store', 'QR does not decode to exact target URL');
});

// T07: Format Switcher Contract & ARIA State
runCheck('T07', 'Dual Layout Structure with ARIA accessibility states (Banner & A2)', () => {
  assert.ok(posterContent.includes('id="sheet-banner"'), 'Missing #sheet-banner');
  assert.ok(posterContent.includes('id="sheet-a2"'), 'Missing #sheet-a2');
  assert.ok(posterContent.includes('aria-pressed="true"'), 'Missing aria-pressed state on active button');
  assert.ok(posterContent.includes('switchFormat('), 'Missing switchFormat function');
  assert.ok(posterContent.includes('handlePrint('), 'Missing handlePrint function');
});

// T08: Physical PDF Export Dimensions & Page Count Verification
runCheck('T08', 'R4 PDF exports exist, have exactly 1 page, and physical dimensions within 0.5mm margin', () => {
  assert.ok(fs.existsSync(BANNER_PDF_PATH), 'Banner R4 PDF missing in reports/poster-r4/');
  assert.ok(fs.existsSync(A2_PDF_PATH), 'A2 R4 PDF missing in reports/poster-r4/');

  const bannerPdf = fs.readFileSync(BANNER_PDF_PATH, 'latin1');
  const a2Pdf = fs.readFileSync(A2_PDF_PATH, 'latin1');

  const matchBanner = bannerPdf.match(/\/MediaBox\s*\[\s*([\d\.\s]+)\s*\]/);
  const matchA2 = a2Pdf.match(/\/MediaBox\s*\[\s*([\d\.\s]+)\s*\]/);
  assert.ok(matchBanner, 'Banner PDF MediaBox not found');
  assert.ok(matchA2, 'A2 PDF MediaBox not found');

  const bannerParts = matchBanner[1].trim().split(/\s+/).map(Number);
  const wBannerMm = (bannerParts[2] - bannerParts[0]) * 25.4 / 72;
  const hBannerMm = (bannerParts[3] - bannerParts[1]) * 25.4 / 72;
  assert.ok(Math.abs(wBannerMm - 1200) <= 0.5, `Banner width error: ${wBannerMm}mm`);
  assert.ok(Math.abs(hBannerMm - 600) <= 0.5, `Banner height error: ${hBannerMm}mm`);

  const a2Parts = matchA2[1].trim().split(/\s+/).map(Number);
  const wA2Mm = (a2Parts[2] - a2Parts[0]) * 25.4 / 72;
  const hA2Mm = (a2Parts[3] - a2Parts[1]) * 25.4 / 72;
  assert.ok(Math.abs(wA2Mm - 420) <= 0.5, `A2 width error: ${wA2Mm}mm`);
  assert.ok(Math.abs(hA2Mm - 594) <= 0.5, `A2 height error: ${hA2Mm}mm`);

  const bannerPages = (bannerPdf.match(/\/Type\s*\/Page\b/g) || []).length;
  const a2Pages = (a2Pdf.match(/\/Type\s*\/Page\b/g) || []).length;
  assert.strictEqual(bannerPages, 1, 'Banner PDF must have exactly 1 page');
  assert.strictEqual(a2Pages, 1, 'A2 PDF must have exactly 1 page');
});

// T09: Contemporary Studio Lookbook Palette & Clean Typography
runCheck('T09', 'Adheres to R4 palette (--paper: #FAFAF9, --ink: #0F172A, --accent: #EA580C, --sale: #E11D48) and eliminates brutalist fonts', () => {
  assert.ok(posterContent.includes('--paper: #FAFAF9'), 'Missing Warm Alabaster paper token');
  assert.ok(posterContent.includes('--ink: #0F172A'), 'Missing Deep Slate ink token');
  assert.ok(posterContent.includes('--accent: #EA580C'), 'Missing Warm Terracotta accent token');
  assert.ok(posterContent.includes('--sale: #E11D48'), 'Missing Crimson Rose sale token');
  assert.ok(!posterContent.includes('Space Mono'), 'Must eliminate Space Mono');
  assert.ok(!posterContent.includes('Playfair Display'), 'Must eliminate Playfair Display');
  assert.ok(!posterContent.includes('#FF3B1D'), 'Eliminated old harsh vermilion');
  assert.ok(!posterContent.includes('#D9F99D'), 'Eliminated old harsh matcha');
});

console.log('\n==========================================================');
if (failCount === 0) {
  console.log(`   ALL ${passCount} R4 ACCEPTANCE TESTS PASSED (${passCount}/${passCount})`);
  console.log('==========================================================');
  process.exit(0);
} else {
  console.error(`   FAILED ${failCount} CHECKS (${passCount} PASSED)`);
  console.log('==========================================================');
  process.exit(1);
}
