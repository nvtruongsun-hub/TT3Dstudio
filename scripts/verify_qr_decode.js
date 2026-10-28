const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const jsQR = require('jsqr');

const qrPngPath = path.resolve(__dirname, '..', 'assets', 'images', 'qr-tt3d-website.png');

if (!fs.existsSync(qrPngPath)) {
  console.error('[FAIL] QR PNG file not found at:', qrPngPath);
  process.exit(1);
}

const buffer = fs.readFileSync(qrPngPath);
const png = PNG.sync.read(buffer);

const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

if (code) {
  console.log('==========================================================');
  console.log('   QR CODE DECODE VERIFICATION RESULT');
  console.log('==========================================================');
  console.log('Image dimensions:', `${png.width}x${png.height}`);
  console.log('Decoded content :', code.data);
  console.log('Decoded location:', code.location ? 'OK' : 'Unknown');
  
  if (code.data === 'https://tt3dlabs.vn/#store') {
    console.log('  [PASS] QR strictly decodes to expected target: https://tt3dlabs.vn/#store');
    process.exit(0);
  } else {
    console.error(`  [FAIL] Unexpected decoded URL: ${code.data}`);
    process.exit(1);
  }
} else {
  console.error('[FAIL] jsQR failed to detect/decode QR code from image');
  process.exit(1);
}
