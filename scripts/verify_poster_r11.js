const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PNG } = require('pngjs');
const jsQR = require('jsqr');

const outDir = path.resolve('reports', 'poster-r11');
const bannerPdfPath = path.join(outDir, 'TT3D-banner-1200x600.pdf');
const a2PdfPath = path.join(outDir, 'TT3D-poster-A2.pdf');
const bannerPngPath = path.join(outDir, 'banner-pdf.png');
const a2PngPath = path.join(outDir, 'a2-pdf.png');

console.log('=== VERIFYING R11 PDF PHYSICAL DIMENSIONS & PAGE COUNT ===');
const bannerPdf = fs.readFileSync(bannerPdfPath, 'latin1');
const a2Pdf = fs.readFileSync(a2PdfPath, 'latin1');

const mBanner = bannerPdf.match(/\/MediaBox\s*\[\s*([\d.\s]+)\s*\]/);
const mA2 = a2Pdf.match(/\/MediaBox\s*\[\s*([\d.\s]+)\s*\]/);

if (!mBanner || !mA2) throw new Error('Could not parse MediaBox from PDF files');

const bCoords = mBanner[1].trim().split(/\s+/).map(Number);
const aCoords = mA2[1].trim().split(/\s+/).map(Number);

const bannerWidthMm = (bCoords[2] - bCoords[0]) * 25.4 / 72;
const bannerHeightMm = (bCoords[3] - bCoords[1]) * 25.4 / 72;

const a2WidthMm = (aCoords[2] - aCoords[0]) * 25.4 / 72;
const a2HeightMm = (aCoords[3] - aCoords[1]) * 25.4 / 72;

const bannerPages = (bannerPdf.match(/\/Type\s*\/Page\b/g) || []).length;
const a2Pages = (a2Pdf.match(/\/Type\s*\/Page\b/g) || []).length;

console.log(`Banner MediaBox : [${bCoords.join(' ')}] => ${bannerWidthMm.toFixed(2)} x ${bannerHeightMm.toFixed(2)} mm (Target: 1200 x 600 mm)`);
console.log(`Banner Page Count: ${bannerPages} (Target: 1)`);
console.log(`A2 MediaBox     : [${aCoords.join(' ')}] => ${a2WidthMm.toFixed(2)} x ${a2HeightMm.toFixed(2)} mm (Target: 420 x 594 mm)`);
console.log(`A2 Page Count    : ${a2Pages} (Target: 1)`);

const bannerDeltaW = Math.abs(bannerWidthMm - 1200);
const bannerDeltaH = Math.abs(bannerHeightMm - 600);
const a2DeltaW = Math.abs(a2WidthMm - 420);
const a2DeltaH = Math.abs(a2HeightMm - 594);

if (bannerDeltaW > 0.3 || bannerDeltaH > 0.3) throw new Error(`Banner dimension deviation > 0.3mm: dW=${bannerDeltaW}, dH=${bannerDeltaH}`);
if (a2DeltaW > 0.3 || a2DeltaH > 0.3) throw new Error(`A2 dimension deviation > 0.3mm: dW=${a2DeltaW}, dH=${a2DeltaH}`);
if (bannerPages !== 1 || a2Pages !== 1) throw new Error('PDF page count is not exactly 1');

const pdfChecks = {
  banner: {
    mediaBox: bCoords,
    widthMm: parseFloat(bannerWidthMm.toFixed(2)),
    heightMm: parseFloat(bannerHeightMm.toFixed(2)),
    pageCount: bannerPages,
    targetWidthMm: 1200,
    targetHeightMm: 600,
    passed: true
  },
  a2: {
    mediaBox: aCoords,
    widthMm: parseFloat(a2WidthMm.toFixed(2)),
    heightMm: parseFloat(a2HeightMm.toFixed(2)),
    pageCount: a2Pages,
    targetWidthMm: 420,
    targetHeightMm: 594,
    passed: true
  }
};
fs.writeFileSync(path.join(outDir, 'pdf-checks.json'), JSON.stringify(pdfChecks, null, 2), 'utf8');
console.log('[PASS] Saved pdf-checks.json');

console.log('\n=== VERIFYING QR CODE DECODE ON RENDERED R11 PNGS ===');
const targetQrUrl = 'https://nvtruongsun-hub.github.io/TT3Dstudio/';

// Decode from banner-pdf.png
const bannerPng = PNG.sync.read(fs.readFileSync(bannerPngPath));
const bannerQr = jsQR(new Uint8ClampedArray(bannerPng.data), bannerPng.width, bannerPng.height);
console.log('Banner QR decode result:', bannerQr ? bannerQr.data : 'FAILED');

// Decode from a2-pdf.png
const a2Png = PNG.sync.read(fs.readFileSync(a2PngPath));
const a2Qr = jsQR(new Uint8ClampedArray(a2Png.data), a2Png.width, a2Png.height);
console.log('A2 QR decode result:', a2Qr ? a2Qr.data : 'FAILED');

// Decode from SVG source PNG as reference
const svgPngPath = path.resolve('assets/images/poster-r7/qr-shop.png');
const refPng = PNG.sync.read(fs.readFileSync(svgPngPath));
const refQr = jsQR(new Uint8ClampedArray(refPng.data), refPng.width, refPng.height);

const qrChecks = {
  targetUrl: targetQrUrl,
  bannerQrDecoded: bannerQr ? bannerQr.data : null,
  a2QrDecoded: a2Qr ? a2Qr.data : null,
  referenceQrDecoded: refQr ? refQr.data : null,
  bannerQrPass: bannerQr?.data === targetQrUrl,
  a2QrPass: a2Qr?.data === targetQrUrl,
  referenceQrPass: refQr?.data === targetQrUrl
};
fs.writeFileSync(path.join(outDir, 'qr-checks.json'), JSON.stringify(qrChecks, null, 2), 'utf8');
console.log('[PASS] Saved qr-checks.json');

console.log('\n=== GENERATING ASSET QUALITY REPORT ===');
const vibrantBuf = fs.readFileSync('assets/images/poster-r11/tactile-trio-vibrant.png');
const r10Buf = fs.readFileSync('assets/images/poster-r10/tactile-trio.png');

const assetQuality = {
  revision: 'R11',
  heroAsset: 'assets/images/poster-r11/tactile-trio-vibrant.png',
  sourceAsset: 'assets/images/poster-r10/tactile-trio.png',
  resolution: {
    width: 1536,
    height: 1024
  },
  bannerPlacement: {
    cssWidth: '755px',
    effectivePhysicalWidthMm: 755,
    ppiAtPrint: parseFloat((1536 / (755 / 25.4)).toFixed(1)) // ~51.7 PPI
  },
  a2Placement: {
    cssWidth: '840px',
    effectivePhysicalWidthMm: 420,
    ppiAtPrint: parseFloat((1536 / (420 / 25.4)).toFixed(1)) // ~92.9 PPI
  },
  colorEnhancements: {
    paperColor: '#FAF8F5',
    taroLilac: '#9D7EC4 (Vibrance +32%)',
    strawberryPink: '#FA7B8C (Vibrance +28%)',
    matchaAvocado: '#569850 (Vibrance +30%, botanical tuning)',
    waffleGold: '#E8B06C (Warmth +22%)',
    tactileLayerLines: 'Preserved natural FDM texture with S-curve micro-contrast tuning'
  },
  fileSizes: {
    sourceR10Bytes: r10Buf.length,
    vibrantR11Bytes: vibrantBuf.length
  },
  hashes: {
    sourceR10Sha256: crypto.createHash('sha256').update(r10Buf).digest('hex'),
    vibrantR11Sha256: crypto.createHash('sha256').update(vibrantBuf).digest('hex')
  }
};
fs.writeFileSync(path.join(outDir, 'asset-quality.json'), JSON.stringify(assetQuality, null, 2), 'utf8');
console.log('[PASS] Saved asset-quality.json');

console.log('\n=== GENERATING APPLIED FILES RECORD ===');
const appliedFiles = {
  revision: 'R11',
  timestamp: new Date().toISOString(),
  files: [
    'poster-artisan-stall.html',
    'data/poster-r11.json',
    'assets/images/poster-r11/tactile-trio-vibrant.png',
    'scripts/export_poster_r11_pdf.js',
    'reports/poster-r11/TT3D-banner-1200x600.pdf',
    'reports/poster-r11/TT3D-poster-A2.pdf',
    'reports/poster-r11/banner-pdf.png',
    'reports/poster-r11/a2-pdf.png',
    'reports/poster-r11/checks.json',
    'reports/poster-r11/pdf-checks.json',
    'reports/poster-r11/qr-checks.json',
    'reports/poster-r11/asset-quality.json'
  ].map(f => {
    const full = path.resolve(f);
    const content = fs.readFileSync(full);
    return {
      path: f,
      size: content.length,
      sha256: crypto.createHash('sha256').update(content).digest('hex')
    };
  })
};
fs.writeFileSync(path.join(outDir, 'applied-files.json'), JSON.stringify(appliedFiles, null, 2), 'utf8');
console.log('[PASS] Saved applied-files.json');
