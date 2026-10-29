const fs = require('fs');
const path = require('path');
const http = require('http');
const { PNG } = require('pngjs');
const jsQR = require('jsqr');

const CDP_PORT = process.env.CDP_PORT || 9222;

async function getCDPPage() {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${CDP_PORT}/json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find(p => p.url && p.url.includes('poster-artisan-stall.html'));
          if (page) resolve(page);
          else reject(new Error('Page poster-artisan-stall.html not found in CDP list'));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function sendCDPCommand(ws, method, params = {}, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    let timer = null;

    const handler = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          clearTimeout(timer);
          ws.removeEventListener('message', handler);
          if (msg.error) {
            reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          } else {
            resolve(msg.result);
          }
        }
      } catch (e) {
        // ignore other messages
      }
    };

    timer = setTimeout(() => {
      ws.removeEventListener('message', handler);
      reject(new Error(`CDP command ${method} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function captureScreenshots() {
  const page = await getCDPPage();
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  try {
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    const outDir = path.resolve(__dirname, '..', 'reports', 'poster-r6');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Bring tab to front
    await sendCDPCommand(ws, 'Page.bringToFront');
    await new Promise(r => setTimeout(r, 400));

    // 1. Capture Banner
    await sendCDPCommand(ws, 'Runtime.evaluate', {
      expression: 'switchFormat("banner"); fitPreview();',
      awaitPromise: true
    });
    await new Promise(r => setTimeout(r, 600));

    const bannerShot = await sendCDPCommand(ws, 'Page.captureScreenshot', { format: 'png' });
    const bannerShotPath = path.join(outDir, 'banner-r6-preview.png');
    fs.writeFileSync(bannerShotPath, Buffer.from(bannerShot.data, 'base64'));
    console.log('[OK] Captured Banner R6 screenshot:', bannerShotPath);

    // 2. Capture A2
    await sendCDPCommand(ws, 'Runtime.evaluate', {
      expression: 'switchFormat("a2"); fitPreview();',
      awaitPromise: true
    });
    await new Promise(r => setTimeout(r, 600));

    const a2Shot = await sendCDPCommand(ws, 'Page.captureScreenshot', { format: 'png' });
    const a2ShotPath = path.join(outDir, 'a2-r6-preview.png');
    fs.writeFileSync(a2ShotPath, Buffer.from(a2Shot.data, 'base64'));
    console.log('[OK] Captured A2 R6 screenshot:', a2ShotPath);

    // 3. QR Code Decode Verification
    const qrPngPath = path.resolve(__dirname, '..', 'assets', 'images', 'qr-tt3d-website.png');
    const qrBuf = fs.readFileSync(qrPngPath);
    const png = PNG.sync.read(qrBuf);
    const qrDecoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    if (qrDecoded && qrDecoded.data === 'https://tt3dlabs.vn/#store') {
      console.log('[PASS] QR strictly decodes to expected target: https://tt3dlabs.vn/#store');
    } else {
      throw new Error('QR failed to decode: ' + (qrDecoded ? qrDecoded.data : 'null'));
    }

  } finally {
    if (ws.readyState === WebSocket.OPEN) ws.close();
  }
}

captureScreenshots().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
