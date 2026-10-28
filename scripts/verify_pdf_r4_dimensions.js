const fs = require('fs');
const path = require('path');

const bannerPath = path.resolve(__dirname, '..', 'reports', 'poster-r4', 'tt3d-banner-r4-1200x600.pdf');
const a2Path = path.resolve(__dirname, '..', 'reports', 'poster-r4', 'tt3d-poster-r4-a2-420x594.pdf');

if (!fs.existsSync(bannerPath) || !fs.existsSync(a2Path)) {
  console.error('[FAIL] Missing PDF files in reports/poster-r4');
  process.exit(1);
}

const bannerPdf = fs.readFileSync(bannerPath, 'latin1');
const a2Pdf = fs.readFileSync(a2Path, 'latin1');

const matchBanner = bannerPdf.match(/\/MediaBox\s*\[\s*([\d\.\s]+)\s*\]/);
const matchA2 = a2Pdf.match(/\/MediaBox\s*\[\s*([\d\.\s]+)\s*\]/);

if (!matchBanner || !matchA2) {
  console.error('[FAIL] Could not parse MediaBox from PDF files');
  process.exit(1);
}

// Đo MediaBox bằng hiệu hai tọa độ [x1, y1, x2, y2]
const bannerCoords = matchBanner[1].trim().split(/\s+/).map(Number);
const a2Coords = matchA2[1].trim().split(/\s+/).map(Number);

const bannerWidthMm = (bannerCoords[2] - bannerCoords[0]) * 25.4 / 72;
const bannerHeightMm = (bannerCoords[3] - bannerCoords[1]) * 25.4 / 72;

const a2WidthMm = (a2Coords[2] - a2Coords[0]) * 25.4 / 72;
const a2HeightMm = (a2Coords[3] - a2Coords[1]) * 25.4 / 72;

console.log('==========================================================');
console.log('   R4 PDF PHYSICAL DIMENSIONS & PAGE COUNT VERIFICATION');
console.log('==========================================================');
console.log(`Banner MediaBox : [${bannerCoords.join(' ')}]`);
console.log(`Banner Size (mm): ${bannerWidthMm.toFixed(2)} x ${bannerHeightMm.toFixed(2)} mm (Target: 1200 x 600 mm)`);

console.log(`A2 MediaBox     : [${a2Coords.join(' ')}]`);
console.log(`A2 Size (mm)    : ${a2WidthMm.toFixed(2)} x ${a2HeightMm.toFixed(2)} mm (Target: 420 x 594 mm)`);

const bannerPages = (bannerPdf.match(/\/Type\s*\/Page\b/g) || []).length;
const a2Pages = (a2Pdf.match(/\/Type\s*\/Page\b/g) || []).length;

console.log(`Banner Page Count: ${bannerPages} (Target: 1)`);
console.log(`A2 Page Count    : ${a2Pages} (Target: 1)`);

const bannerDeltaW = Math.abs(bannerWidthMm - 1200);
const bannerDeltaH = Math.abs(bannerHeightMm - 600);
const a2DeltaW = Math.abs(a2WidthMm - 420);
const a2DeltaH = Math.abs(a2HeightMm - 594);

const errors = [];
if (bannerDeltaW > 0.5) errors.push(`Banner width error ${bannerDeltaW.toFixed(2)}mm > 0.5mm`);
if (bannerDeltaH > 0.5) errors.push(`Banner height error ${bannerDeltaH.toFixed(2)}mm > 0.5mm`);
if (a2DeltaW > 0.5) errors.push(`A2 width error ${a2DeltaW.toFixed(2)}mm > 0.5mm`);
if (a2DeltaH > 0.5) errors.push(`A2 height error ${a2DeltaH.toFixed(2)}mm > 0.5mm`);
if (bannerPages !== 1) errors.push(`Banner has ${bannerPages} pages (expected 1)`);
if (a2Pages !== 1) errors.push(`A2 has ${a2Pages} pages (expected 1)`);

if (errors.length > 0) {
  console.error('\n[FAIL] Dimension or page count violations:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}

console.log('\n[PASS] All R4 PDF dimension and page count checks passed within 0.5mm margin!');
process.exit(0);
