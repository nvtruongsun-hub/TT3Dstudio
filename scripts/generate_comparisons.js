const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function createSideBySide(img1Path, img2Path, outPath, label) {
  const img1 = PNG.sync.read(fs.readFileSync(img1Path));
  const img2 = PNG.sync.read(fs.readFileSync(img2Path));

  // Scale if needed to match height
  const targetH = Math.min(img1.height, img2.height);
  const targetW1 = Math.round(img1.width * (targetH / img1.height));
  const targetW2 = Math.round(img2.width * (targetH / img2.height));

  const gap = 16;
  const outW = targetW1 + targetW2 + gap;
  const outH = targetH;

  const outPng = new PNG({ width: outW, height: outH });
  // Fill background with #E5E3DC
  outPng.data.fill(229);

  // Copy img1 (R10 on left)
  for (let y = 0; y < targetH; y++) {
    const srcY = Math.min(img1.height - 1, Math.round(y * (img1.height / targetH)));
    for (let x = 0; x < targetW1; x++) {
      const srcX = Math.min(img1.width - 1, Math.round(x * (img1.width / targetW1)));
      const srcIdx = (img1.width * srcY + srcX) << 2;
      const outIdx = (outW * y + x) << 2;
      outPng.data[outIdx] = img1.data[srcIdx];
      outPng.data[outIdx + 1] = img1.data[srcIdx + 1];
      outPng.data[outIdx + 2] = img1.data[srcIdx + 2];
      outPng.data[outIdx + 3] = img1.data[srcIdx + 3];
    }
  }

  // Draw vertical divider gap
  for (let y = 0; y < targetH; y++) {
    for (let x = targetW1; x < targetW1 + gap; x++) {
      const outIdx = (outW * y + x) << 2;
      outPng.data[outIdx] = 200;
      outPng.data[outIdx + 1] = 195;
      outPng.data[outIdx + 2] = 188;
      outPng.data[outIdx + 3] = 255;
    }
  }

  // Copy img2 (R11 on right)
  for (let y = 0; y < targetH; y++) {
    const srcY = Math.min(img2.height - 1, Math.round(y * (img2.height / targetH)));
    for (let x = 0; x < targetW2; x++) {
      const srcX = Math.min(img2.width - 1, Math.round(x * (img2.width / targetW2)));
      const srcIdx = (img2.width * srcY + srcX) << 2;
      const outIdx = (outW * y + (targetW1 + gap + x)) << 2;
      outPng.data[outIdx] = img2.data[srcIdx];
      outPng.data[outIdx + 1] = img2.data[srcIdx + 1];
      outPng.data[outIdx + 2] = img2.data[srcIdx + 2];
      outPng.data[outIdx + 3] = img2.data[srcIdx + 3];
    }
  }

  fs.writeFileSync(outPath, PNG.sync.write(outPng));
  console.log(`[OK] Created side-by-side comparison: ${outPath} (${outW}x${outH})`);
}

const r10Banner = path.resolve('reports', 'poster-r10', 'banner-pdf.png');
const r11Banner = path.resolve('reports', 'poster-r11', 'banner-pdf.png');
const outBannerComp = path.resolve('reports', 'poster-r11', 'comparison-banner-r10-r11.png');

const r10A2 = path.resolve('reports', 'poster-r10', 'a2-pdf.png');
const r11A2 = path.resolve('reports', 'poster-r11', 'a2-pdf.png');
const outA2Comp = path.resolve('reports', 'poster-r11', 'comparison-a2-r10-r11.png');

createSideBySide(r10Banner, r11Banner, outBannerComp, 'Banner R10 vs R11');
createSideBySide(r10A2, r11A2, outA2Comp, 'A2 Poster R10 vs R11');
