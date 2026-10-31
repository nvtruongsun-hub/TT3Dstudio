const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s, v];
}

function hsvToRgb(h, s, v) {
  let r, g, b;
  const i = Math.floor((h / 60) % 6);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function processImage() {
  const srcPath = path.resolve('assets/images/poster-r10/tactile-trio.png');
  const outDir = path.resolve('assets/images/poster-r11');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'tactile-trio-vibrant.png');

  const buf = fs.readFileSync(srcPath);
  const png = PNG.sync.read(buf);
  const { width, height, data } = png;

  // Target paper color: #FAF8F5 => [250, 248, 245]
  const targetBgR = 250;
  const targetBgG = 248;
  const targetBgB = 245;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];

      const [h, s, v] = rgbToHsv(r, g, b);
      const diff = Math.max(r, g, b) - Math.min(r, g, b);
      const minVal = Math.min(r, g, b);
      const maxVal = Math.max(r, g, b);

      // Check if pure background (bright & almost neutral)
      // Original background is roughly R:246, G:242, B:235 (diff=11, minVal=235)
      const isPureBg = (minVal >= 225 && diff <= 16 && s <= 0.07);
      // Soft shadow: under the items, luminance drops but still relatively low saturation
      const isSoftShadow = (minVal >= 140 && minVal < 225 && s <= 0.12);

      if (isPureBg) {
        // Blend directly to target paper #FAF8F5
        // Edge gradient factor: ensures smooth transition
        const factor = Math.min(1.0, Math.max(0.0, (minVal - 225) / 15.0));
        r = Math.round(r * (1 - factor) + targetBgR * factor);
        g = Math.round(g * (1 - factor) + targetBgG * factor);
        b = Math.round(b * (1 - factor) + targetBgB * factor);
      } else if (isSoftShadow) {
        // Soft contact shadow: shift tint toward warm paper
        // Calculate shadow depth (0 = deep shadow, 1 = faint shadow)
        const shadowDepth = (minVal - 140) / 85.0; // 0..1
        // Base shadow color on #FAF8F5
        const targetShadowR = Math.round(targetBgR * (0.68 + 0.32 * shadowDepth));
        const targetShadowG = Math.round(targetBgG * (0.68 + 0.32 * shadowDepth));
        const targetShadowB = Math.round(targetBgB * (0.68 + 0.32 * shadowDepth));

        const blendW = 0.55;
        r = Math.round(r * (1 - blendW) + targetShadowR * blendW);
        g = Math.round(g * (1 - blendW) + targetShadowG * blendW);
        b = Math.round(b * (1 - blendW) + targetShadowB * blendW);
      } else {
        // Product pixel!
        let newS = s;
        let newV = v;
        let newH = h;

        // 1. Lilac Taro Cat (Hue 240° - 295°, e.g., lavender purple)
        if (h >= 240 && h <= 295 && s > 0.08) {
          newS = Math.min(0.92, s * 1.32 + 0.06); // +32% vibrance
          newV = Math.min(0.98, v * 1.04);       // clean, bright pastel
        }
        // 2. Strawberry Cream Swirl (Hue 335° - 360° or 0° - 22°)
        else if ((h >= 335 || h <= 22) && s > 0.08) {
          newS = Math.min(0.92, s * 1.28 + 0.05); // +28% vibrance
          newV = Math.min(0.98, v * 1.03);       // delicious cream pop
        }
        // 3. Matcha / Avocado Green (Hue 70° - 150°)
        else if (h >= 70 && h <= 150 && s > 0.10) {
          newS = Math.min(0.92, s * 1.30 + 0.06); // +30% fresh botanical green
          if (h >= 75 && h <= 95) newH = h + 2;  // perfect matcha tone
          newV = Math.min(0.98, v * 1.02);
        }
        // 4. Waffle Cone (Hue 25° - 55°)
        else if (h >= 25 && h <= 55 && s > 0.15) {
          newS = Math.min(0.92, s * 1.22 + 0.03); // golden waffle warmth
        }
        // 5. Sprinkles & Switch Accents: highly saturated spots
        else if (s > 0.25) {
          newS = Math.min(0.98, s * 1.20);
        }

        // Tactile micro-contrast (S-curve on Value)
        if (newV > 0.15 && newV < 0.88) {
          const normV = (newV - 0.5) * 2; // -0.7 to 0.7
          const curvedV = 0.5 + Math.sign(normV) * Math.pow(Math.abs(normV), 0.92) * 0.5;
          newV = Math.max(0.05, Math.min(0.98, curvedV));
        }

        const [nr, ng, nb] = hsvToRgb(newH, newS, newV);
        r = nr;
        g = ng;
        b = nb;
      }

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }
  }

  const outBuf = PNG.sync.write(png);
  fs.writeFileSync(outPath, outBuf);
  console.log(`[OK] Created vibrant asset: ${outPath} (${(outBuf.length / 1024).toFixed(1)} KB)`);
}

processImage();
