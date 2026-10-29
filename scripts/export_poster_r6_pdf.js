const fs = require('fs');
const path = require('path');
const http = require('http');

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

async function exportPDFs() {
  console.log(`Connecting to Chrome CDP on port ${CDP_PORT}...`);
  const page = await getCDPPage();
  console.log(`Found target page: ${page.title} (${page.id})`);

  const ws = new WebSocket(page.webSocketDebuggerUrl);

  try {
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });
    console.log('Connected to WebSocket!');

    const outDir = path.resolve(__dirname, '..', 'reports', 'poster-r6');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // 0. Reload page to load new R6 HTML & Assets
    console.log('Reloading page to ensure latest R6 code...');
    await sendCDPCommand(ws, 'Page.reload', { ignoreCache: true });
    await new Promise(r => setTimeout(r, 2000));

    // 1. Prepare and Export Banner (1200x600mm)
    console.log('1. Calling prepareForPrint("banner")...');
    const bannerReady = await sendCDPCommand(ws, 'Runtime.evaluate', {
      expression: 'prepareForPrint("banner")',
      awaitPromise: true,
      returnByValue: true
    });
    if (bannerReady.exceptionDetails) {
      throw new Error('Poster chưa sẵn sàng để xuất Banner PDF: ' + JSON.stringify(bannerReady.exceptionDetails));
    }
    console.log('  [OK] Banner ready for print:', bannerReady.result ? bannerReady.result.value : 'ready');

    console.log('Generating Banner PDF (1200x600mm)...');
    const bannerPdfResult = await sendCDPCommand(ws, 'Page.printToPDF', {
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: false,
      paperWidth: 47.244, // 1200mm in inches = 1200 / 25.4
      paperHeight: 23.622, // 600mm in inches = 600 / 25.4
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      scale: 1
    });

    const bannerPdfPath = path.join(outDir, 'tt3d-banner-r6-1200x600.pdf');
    fs.writeFileSync(bannerPdfPath, Buffer.from(bannerPdfResult.data, 'base64'));
    const bannerStat = fs.statSync(bannerPdfPath);
    console.log(`  [OK] Exported Banner R6 PDF: ${bannerPdfPath} (${(bannerStat.size / 1024).toFixed(1)} KB)`);

    // 2. Prepare and Export A2 Poster (420x594mm)
    console.log('2. Calling prepareForPrint("a2")...');
    const a2Ready = await sendCDPCommand(ws, 'Runtime.evaluate', {
      expression: 'prepareForPrint("a2")',
      awaitPromise: true,
      returnByValue: true
    });
    if (a2Ready.exceptionDetails) {
      throw new Error('Poster chưa sẵn sàng để xuất A2 PDF: ' + JSON.stringify(a2Ready.exceptionDetails));
    }
    console.log('  [OK] A2 ready for print:', a2Ready.result ? a2Ready.result.value : 'ready');

    console.log('Generating A2 PDF (420x594mm)...');
    const a2PdfResult = await sendCDPCommand(ws, 'Page.printToPDF', {
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: false,
      paperWidth: 16.535, // 420mm in inches = 420 / 25.4
      paperHeight: 23.386, // 594mm in inches = 594 / 25.4
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      scale: 1
    });

    const a2PdfPath = path.join(outDir, 'tt3d-poster-r6-a2-420x594.pdf');
    fs.writeFileSync(a2PdfPath, Buffer.from(a2PdfResult.data, 'base64'));
    const a2Stat = fs.statSync(a2PdfPath);
    console.log(`  [OK] Exported A2 R6 PDF: ${a2PdfPath} (${(a2Stat.size / 1024).toFixed(1)} KB)`);

    console.log('\nBoth R6 PDFs exported successfully!');
  } finally {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  }
}

exportPDFs().catch(err => {
  console.error('[FAIL] Error exporting PDFs:', err);
  process.exit(1);
});
