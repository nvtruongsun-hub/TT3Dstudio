const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '..', 'SCREENSHOT_AFTER');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const TARGET_ID = '4F6A54DC50E6D4B008C575DA3D6CE8E5';
const ws = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${TARGET_ID}`);

let reqId = 1;
const pending = new Map();

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++reqId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  if (data.id && pending.has(data.id)) {
    const { resolve, reject } = pending.get(data.id);
    pending.delete(data.id);
    if (data.error) reject(data.error);
    else resolve(data.result);
  }
};

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function setViewport(width, height, isMobile = false) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: isMobile
  });
  await delay(300);
}

async function evalInPage(expression) {
  return send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
}

async function capture(filename) {
  const res = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  console.log(`📸 Captured: ${filename}`);
  await delay(200);
}

ws.onopen = async () => {
  try {
    console.log('Connected to Chrome CDP. Navigating to local build...');
    await send('Page.navigate', { url: 'http://127.0.0.1:8089/#store' });
    await delay(1500);

    // 1. Desktop 1440px Hero (showing Hero slide 2 with new clean desk nameplate!)
    await setViewport(1440, 900, false);
    await evalInPage("window.switchHeroShowcase('mw-cn-1147539');");
    await delay(600);
    await capture('01_desktop_1440px_hero.png');

    // 2. Desktop 1440px Catalog
    await evalInPage("document.getElementById('store-catalog')?.scrollIntoView({ behavior: 'instant' });");
    await delay(500);
    await capture('02_desktop_1440px_catalog.png');

    // 3. Tablet 1024px Hero
    await evalInPage("window.scrollTo(0, 0);");
    await setViewport(1024, 768, false);
    await delay(400);
    await capture('03_tablet_1024px_hero.png');

    // 4. Tablet 768px Hero
    await setViewport(768, 1024, false);
    await delay(400);
    await capture('04_tablet_768px_hero.png');

    // 5. Mobile 390px Hero (showing clean slide 2 and 4-column dock)
    await setViewport(390, 844, true);
    await delay(500);
    await capture('05_mobile_390px_hero.png');

    // 6. Mobile 375px Hero
    await setViewport(375, 667, true);
    await delay(400);
    await capture('06_mobile_375px_hero.png');

    // 7. Desktop Product Modal
    await setViewport(1440, 900, false);
    await evalInPage("window.openProductDetailModal('mw-cn-1147539');");
    await delay(800);
    await capture('07_desktop_product_modal.png');
    await evalInPage("window.closeProductDetailModal();");
    await delay(300);

    // 8. Desktop Cart Drawer
    await evalInPage("window.TTCart.addItem({ id: 'mw-cn-1147539', title: 'Biển Tên Chức Danh Để Bàn Khắc Chữ', price: 99000, qty: 1 }); window.TTCart.openCart();");
    await delay(600);
    await capture('08_desktop_cart_drawer.png');

    // 9. Desktop Checkout / Auth
    await evalInPage("window.TTCart.closeCart(); if (window.TTAccountManager) window.TTAccountManager.openAuthModal('login');");
    await delay(600);
    await capture('09_desktop_checkout_or_auth.png');
    await evalInPage("if (window.TTAccountManager) window.TTAccountManager.closeAuthModal();");
    await delay(300);

    // 10. Desktop Tracking View
    await evalInPage("window.switchWorkspace('view-tracking');");
    await delay(500);
    await capture('10_desktop_tracking_view.png');

    // 11. Desktop Tracking Result (Order TT3D-DEMO-2026 - clean message without [object Object])
    await evalInPage("document.getElementById('tracking-input').value = 'TT3D-DEMO-2026'; document.getElementById('tracking-search-btn').click();");
    await delay(800);
    await capture('11_desktop_tracking_result.png');

    // Restore original remote URL
    console.log('Restoring production URL on page...');
    await send('Page.navigate', { url: 'https://nvtruongsun-hub.github.io/TT3Dstudio/#store' });
    await delay(1000);

    console.log('🎉 All 11 AFTER screenshots captured successfully!');
    ws.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during capture:', err);
    ws.close();
    process.exit(1);
  }
};

ws.onerror = (e) => {
  console.error('WebSocket error:', e);
  process.exit(1);
};
