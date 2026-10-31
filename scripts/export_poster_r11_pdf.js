const fs = require('fs');
const path = require('path');
const http = require('http');

const CDP_PORT = process.env.CDP_PORT || 9222;

function createCDPPage(url) {
  return new Promise((resolve, reject) => {
    const encodedUrl = encodeURIComponent(url);
    const req = http.request({
      hostname: '127.0.0.1',
      port: CDP_PORT,
      path: '/json/new?' + encodedUrl,
      method: 'PUT'
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const page = JSON.parse(data);
          resolve(page);
        } catch (e) {
          reject(new Error('Failed to parse new page response: ' + data));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function closeCDPPage(pageId) {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:${CDP_PORT}/json/close/${pageId}`, res => {
      resolve(res.statusCode);
    }).on('error', () => resolve(null));
  });
}

function sendCDPCommand(ws, method, params = {}, timeoutMs = 30000) {
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
        // ignore
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

async function exportPDFs() {
  const htmlPath = path.resolve(__dirname, '..', 'poster-artisan-stall.html');
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  console.log(`Connecting to Chrome CDP on port ${CDP_PORT}...`);
  console.log(`Opening dedicated tab for: ${fileUrl}`);

  const page = await createCDPPage(fileUrl);
  console.log(`Created dedicated page: ${page.id}`);

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  const outDir = path.resolve(__dirname, '..', 'reports', 'poster-r11');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const checks = [];

  try {
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    await sendCDPCommand(ws, 'Page.enable');
    await sendCDPCommand(ws, 'Runtime.enable');
    await sendCDPCommand(ws, 'DOM.enable');

    // Wait for page to be ready
    await new Promise(r => setTimeout(r, 2000));

    // =========================================================================
    // 1. BANNER EXPORT (1200 x 600 mm)
    // =========================================================================
    console.log('\n--- 1. PREPARING BANNER (1200x600mm) ---');
    const bannerEval = await sendCDPCommand(ws, 'Runtime.evaluate', {
      expression: 'prepareForPrint("banner")',
      awaitPromise: true,
      returnByValue: true
    });

    if (bannerEval.exceptionDetails) {
      throw new Error('prepareForPrint("banner") threw an error: ' + JSON.stringify(bannerEval.exceptionDetails));
    }

    const bannerResult = bannerEval.result ? bannerEval.result.value : null;
    console.log('Banner prepare result:', bannerResult);

    if (!bannerResult || !bannerResult.success || bannerResult.revision !== 'R11' || bannerResult.format !== 'banner') {
      throw new Error('Contract violation: prepareForPrint("banner") must return success=true, revision=R11, format=banner');
    }
    checks.push(bannerResult);

    // Set viewport for clean 1:1 render capture
    await sendCDPCommand(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 1200,
      height: 600,
      deviceScaleFactor: 2,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 600));

    // Capture Banner Preview Screenshot
    console.log('Capturing banner preview screenshot...');
    const bannerShot = await sendCDPCommand(ws, 'Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });
    const bannerShotPath = path.join(outDir, 'banner-pdf.png');
    fs.writeFileSync(bannerShotPath, Buffer.from(bannerShot.data, 'base64'));
    console.log(`[OK] Saved banner-pdf.png: ${bannerShotPath}`);

    // Print to PDF: 1200 x 600 mm = 47.244 x 23.622 inches
    console.log('Exporting Banner PDF (1200x600mm)...');
    const bannerPdfResult = await sendCDPCommand(ws, 'Page.printToPDF', {
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: false,
      paperWidth: 47.244,
      paperHeight: 23.622,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      scale: 1
    });

    const bannerPdfPath = path.join(outDir, 'TT3D-banner-1200x600.pdf');
    fs.writeFileSync(bannerPdfPath, Buffer.from(bannerPdfResult.data, 'base64'));
    const bannerPdfStat = fs.statSync(bannerPdfPath);
    console.log(`[OK] Exported Banner PDF: ${bannerPdfPath} (${(bannerPdfStat.size / 1024).toFixed(1)} KB)`);

    // =========================================================================
    // 2. A2 POSTER EXPORT (420 x 594 mm)
    // =========================================================================
    console.log('\n--- 2. PREPARING A2 POSTER (420x594mm) ---');
    const a2Eval = await sendCDPCommand(ws, 'Runtime.evaluate', {
      expression: 'prepareForPrint("a2")',
      awaitPromise: true,
      returnByValue: true
    });

    if (a2Eval.exceptionDetails) {
      throw new Error('prepareForPrint("a2") threw an error: ' + JSON.stringify(a2Eval.exceptionDetails));
    }

    const a2Result = a2Eval.result ? a2Eval.result.value : null;
    console.log('A2 prepare result:', a2Result);

    if (!a2Result || !a2Result.success || a2Result.revision !== 'R11' || a2Result.format !== 'a2') {
      throw new Error('Contract violation: prepareForPrint("a2") must return success=true, revision=R11, format=a2');
    }
    checks.push(a2Result);

    // Set viewport for clean A2 render capture (840 x 1188)
    await sendCDPCommand(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 840,
      height: 1188,
      deviceScaleFactor: 2,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 600));

    // Capture A2 Preview Screenshot
    console.log('Capturing A2 preview screenshot...');
    const a2Shot = await sendCDPCommand(ws, 'Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });
    const a2ShotPath = path.join(outDir, 'a2-pdf.png');
    fs.writeFileSync(a2ShotPath, Buffer.from(a2Shot.data, 'base64'));
    console.log(`[OK] Saved a2-pdf.png: ${a2ShotPath}`);

    // Print to PDF: 420 x 594 mm = 16.535 x 23.386 inches
    console.log('Exporting A2 PDF (420x594mm)...');
    const a2PdfResult = await sendCDPCommand(ws, 'Page.printToPDF', {
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: false,
      paperWidth: 16.535,
      paperHeight: 23.386,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      scale: 1
    });

    const a2PdfPath = path.join(outDir, 'TT3D-poster-A2.pdf');
    fs.writeFileSync(a2PdfPath, Buffer.from(a2PdfResult.data, 'base64'));
    const a2PdfStat = fs.statSync(a2PdfPath);
    console.log(`[OK] Exported A2 PDF: ${a2PdfPath} (${(a2PdfStat.size / 1024).toFixed(1)} KB)`);

    // =========================================================================
    // 3. VIEWPORT RESPONSIVENESS CHECKS (375, 768, 1280, 1920)
    // =========================================================================
    console.log('\n--- 3. CHECKING VIEWPORTS (375, 768, 1280, 1920) ---');
    const viewports = [375, 768, 1280, 1920];
    for (const vp of viewports) {
      await sendCDPCommand(ws, 'Emulation.setDeviceMetricsOverride', {
        width: vp,
        height: 800,
        deviceScaleFactor: 1,
        mobile: vp < 768
      });
      await sendCDPCommand(ws, 'Runtime.evaluate', { expression: 'fitPreview();' });
      await new Promise(r => setTimeout(r, 200));

      for (const fmt of ['banner', 'a2']) {
        await sendCDPCommand(ws, 'Runtime.evaluate', { expression: `switchFormat("${fmt}"); fitPreview();` });
        const overflowCheck = await sendCDPCommand(ws, 'Runtime.evaluate', {
          expression: `({
            viewport: ${vp},
            format: "${fmt}",
            noHorizontalOverflow: document.documentElement.scrollWidth <= ${vp} + 1,
            visibleSheets: document.querySelectorAll('.print-sheet:not([hidden])').length,
            selected: document.getElementById('btn-show-${fmt}').getAttribute('aria-pressed')
          })`,
          returnByValue: true
        });
        checks.push(overflowCheck.result.value);
      }
    }

    fs.writeFileSync(path.join(outDir, 'checks.json'), JSON.stringify(checks, null, 2), 'utf8');
    console.log('[OK] Saved checks.json');

  } finally {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    console.log(`Closing dedicated page: ${page.id}`);
    await closeCDPPage(page.id);
  }
}

exportPDFs().catch(err => {
  console.error('[FAIL] Error exporting PDFs:', err);
  process.exit(1);
});
