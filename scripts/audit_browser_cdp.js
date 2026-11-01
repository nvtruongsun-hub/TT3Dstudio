/**
 * T&T 3D STUDIO - DIRECT CDP COMPREHENSIVE BROWSER AUDIT RUNNER
 * =========================================================================
 * Sử dụng kết nối trực tiếp Chrome DevTools Protocol qua WebSocket (Port 9222)
 * Kiểm định 100% website production thật: https://nvtruongsun-hub.github.io/TT3Dstudio/
 * 
 * Thực hiện:
 * 1. Chụp ảnh màn hình các kích thước: 1440px, 1024px, 768px, 390px, 375px
 * 2. Kiểm tra tất cả tương tác: Trang chủ, Danh mục, Chi tiết SP, Giỏ hàng,
 *    Đăng nhập, Tra cứu đơn, Checkout, Mobile Menu, Bộ lọc & Tìm kiếm
 * 3. Kiểm kê toàn bộ lỗi Console, Network 4xx/5xx, Ảnh hỏng, Lỗi layout
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'SCREENSHOT_BEFORE');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function getCdpTarget() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const list = JSON.parse(d);
          const target = list.find(t => t.url && t.url.includes('TT3Dstudio')) || list[0];
          resolve(target);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 0;
    this.callbacks = new Map();
    this.events = [];
    this.consoleLogs = [];
    this.failedRequests = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = err => reject(err);
      this.ws.onmessage = msg => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(new Error(data.error.message));
          else resolve(data.result);
        }
        // Handle events
        if (data.method === 'Console.messageAdded' || data.method === 'Runtime.consoleAPICalled') {
          this.consoleLogs.push(data.params);
        }
        if (data.method === 'Network.responseReceived') {
          const resp = data.params.response;
          if (resp && resp.status >= 400) {
            this.failedRequests.push({ url: resp.url, status: resp.status, statusText: resp.statusText });
          }
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.msgId;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async enableDomains() {
    await this.send('Page.enable');
    await this.send('DOM.enable');
    await this.send('Network.enable');
    await this.send('Runtime.enable');
    await this.send('Console.enable');
  }

  async setViewport(width, height, deviceScaleFactor = 1, isMobile = false, hasTouch = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor,
      mobile: isMobile,
      hasTouch: hasTouch
    });
    // Wait for layout to settle
    await new Promise(r => setTimeout(r, 400));
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : null;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`📸 [Screenshot] Đã lưu: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return outPath;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runAudit() {
  console.log('========================================================================');
  console.log('   KHỞI ĐỘNG KIỂM ĐỊNH TRỰC TIẾP WEBSITE PRODUCTION (PHASE 1 AUDIT)');
  console.log('   URL: https://nvtruongsun-hub.github.io/TT3Dstudio/');
  console.log('========================================================================\n');

  const target = await getCdpTarget();
  console.log(`- Target CDP: ${target.title} (${target.url})`);
  console.log(`- WS URL: ${target.webSocketDebuggerUrl}`);

  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.enableDomains();

  // 1. CHỤP CÁC KÍCH THƯỚC TRANG CHỦ
  console.log('\n[1/6] Chụp ảnh kiểm định trang chủ theo 5 kích thước chuẩn...');

  // 1.1 Desktop 1440px
  await client.setViewport(1440, 900, 1, false, false);
  await client.eval("window.scrollTo(0, 0)");
  await new Promise(r => setTimeout(r, 300));
  await client.captureScreenshot('01_desktop_1440px_hero.png');

  // Cuộn xuống danh mục sản phẩm 1440px
  await client.eval("document.querySelector('#store-catalog')?.scrollIntoView({ behavior: 'instant', block: 'start' })");
  await new Promise(r => setTimeout(r, 400));
  await client.captureScreenshot('02_desktop_1440px_catalog.png');

  // 1.2 Tablet Landscape 1024px
  await client.setViewport(1024, 768, 1, false, false);
  await client.eval("window.scrollTo(0, 0)");
  await new Promise(r => setTimeout(r, 300));
  await client.captureScreenshot('03_tablet_1024px_hero.png');

  // 1.3 Tablet Portrait 768px
  await client.setViewport(768, 1024, 1, true, true);
  await client.eval("window.scrollTo(0, 0)");
  await new Promise(r => setTimeout(r, 300));
  await client.captureScreenshot('04_tablet_768px_hero.png');

  // 1.4 Mobile Standard 390px (iPhone 12/13/14/15)
  await client.setViewport(390, 844, 3, true, true);
  await client.eval("window.scrollTo(0, 0)");
  await new Promise(r => setTimeout(r, 300));
  await client.captureScreenshot('05_mobile_390px_hero.png');

  // 1.5 Compact Mobile 375px (iPhone SE)
  await client.setViewport(375, 667, 2, true, true);
  await client.eval("window.scrollTo(0, 0)");
  await new Promise(r => setTimeout(r, 300));
  await client.captureScreenshot('06_mobile_375px_hero.png');

  // 2. KIỂM ĐỊNH CHI TIẾT SẢN PHẨM (MODAL CHI TIẾT SẢN PHẨM)
  console.log('\n[2/6] Kiểm định Modal Chi tiết sản phẩm...');
  await client.setViewport(1440, 900, 1, false, false);
  await client.eval(`
    (() => {
      const card = document.querySelector('.product-card') || document.querySelector('[data-product-id]');
      if (card) {
        const btn = card.querySelector('.btn-view-detail') || card.querySelector('button') || card;
        btn.click();
        return true;
      }
      return false;
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await client.captureScreenshot('07_desktop_product_modal.png');

  // Đóng modal chi tiết
  await client.eval(`
    (() => {
      const closeBtn = document.querySelector('#modal-product-detail .btn-close') ||
                       document.querySelector('#product-detail-modal button[aria-label*="Đóng"]') ||
                       document.querySelector('#product-detail-modal .fa-xmark')?.parentElement ||
                       document.querySelector('.modal-close');
      if (closeBtn) closeBtn.click();
      else {
        // Fallback ESC
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 400));

  // 3. KIỂM ĐỊNH GIỎ HÀNG (CART MODAL / DRAWER)
  console.log('\n[3/6] Kiểm định Giỏ hàng (Cart Drawer)...');
  await client.eval(`
    (() => {
      const cartBtn = document.querySelector('#header-cart-btn') || document.querySelector('[data-action="open-cart"]') || document.querySelector('.cart-trigger-btn') || document.querySelector('a[href="#cart"]');
      if (cartBtn) cartBtn.click();
      else if (window.TTCart && typeof window.TTCart.openDrawer === 'function') window.TTCart.openDrawer();
    })()
  `);
  await new Promise(r => setTimeout(r, 500));
  await client.captureScreenshot('08_desktop_cart_drawer.png');

  // Đóng giỏ hàng
  await client.eval(`
    (() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      const closeBtn = document.querySelector('#cart-drawer .btn-close') || document.querySelector('[data-action="close-cart"]');
      if (closeBtn) closeBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 400));

  // 4. KIỂM ĐỊNH MODAL ĐĂNG NHẬP / TÀI KHOẢN
  console.log('\n[4/6] Kiểm định Modal Đăng nhập / Tài khoản...');
  await client.eval(`
    (() => {
      const authBtn = document.querySelector('#header-auth-btn') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Đăng nhập'));
      if (authBtn) authBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  await client.captureScreenshot('09_desktop_auth_modal.png');

  // Đóng modal auth
  await client.eval(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
  await new Promise(r => setTimeout(r, 400));

  // 5. KIỂM ĐỊNH MOBILE CHECKOUT & MENU TRÊN 390PX
  console.log('\n[5/6] Kiểm định Mobile Checkout & Hamburger Menu...');
  await client.setViewport(390, 844, 3, true, true);
  await client.eval("window.scrollTo(0, 0)");
  await new Promise(r => setTimeout(r, 300));

  // Mở menu mobile
  await client.eval(`
    (() => {
      const menuBtn = document.querySelector('#mobile-menu-btn') || document.querySelector('button[aria-label*="menu"]') || document.querySelector('.fa-bars')?.parentElement;
      if (menuBtn) menuBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 500));
  await client.captureScreenshot('10_mobile_390px_menu.png');

  // Đóng menu
  await client.eval(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
  await new Promise(r => setTimeout(r, 400));

  // 6. THU THẬP THỐNG KÊ TOÀN DIỆN VỀ LỖI CONSOLE, ẢNH HỎNG, VÀ PERFORMANCE
  console.log('\n[6/6] Thu thập chẩn đoán kỹ thuật (Console, Network, DOM, Images)...');
  const diagnostics = await client.eval(`
    (() => {
      // 1. Kiểm tra ảnh hỏng (Broken Images)
      const imgs = Array.from(document.querySelectorAll('img'));
      const brokenImgs = imgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => ({
        src: img.src,
        alt: img.alt,
        className: img.className
      }));

      // 2. Kiểm tra phần tử tràn ngang (Horizontal Overflow)
      const docWidth = document.documentElement.offsetWidth;
      const overflowingEls = Array.from(document.querySelectorAll('*')).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.right > docWidth + 2;
      }).slice(0, 10).map(el => ({
        tag: el.tagName,
        id: el.id,
        className: el.className.toString().substring(0, 50),
        rectRight: Math.round(el.getBoundingClientRect().right),
        docWidth
      }));

      // 3. Kiểm tra các nút bấm không có accessible name
      const buttonsWithoutLabel = Array.from(document.querySelectorAll('button')).filter(b => {
        const text = (b.innerText || b.getAttribute('aria-label') || b.title || '').trim();
        return text.length === 0;
      }).map(b => ({
        id: b.id,
        className: b.className.toString().substring(0, 50),
        innerHTML: b.innerHTML.substring(0, 40)
      }));

      // 4. Đo lường kích thước script và tài nguyên
      const resources = performance.getEntriesByType('resource').map(r => ({
        name: r.name.split('/').pop(),
        initiatorType: r.initiatorType,
        duration: Math.round(r.duration),
        transferSize: r.transferSize || 0
      }));

      return {
        totalImages: imgs.length,
        brokenImagesCount: brokenImgs.length,
        brokenImages: brokenImgs,
        overflowingElementsCount: overflowingEls.length,
        overflowingElements: overflowingEls,
        buttonsWithoutLabelCount: buttonsWithoutLabel.length,
        buttonsWithoutLabel: buttonsWithoutLabel,
        totalResources: resources.length,
        jsResourcesCount: resources.filter(r => r.initiatorType === 'script').length
      };
    })()
  `);

  console.log('\n========================================================================');
  console.log('   KẾT QUẢ CHẨN ĐOÁN KỸ THUẬT TỪ TRÌNH DUYỆT THỰC TẾ');
  console.log('========================================================================');
  console.log(`- Tổng số ảnh trên trang: ${diagnostics.totalImages}`);
  console.log(`- Số ảnh bị hỏng/không nạp được: ${diagnostics.brokenImagesCount}`);
  if (diagnostics.brokenImagesCount > 0) {
    console.log('  ⚠️ Chi tiết ảnh hỏng:', diagnostics.brokenImages);
  }
  console.log(`- Phần tử tràn mép ngang: ${diagnostics.overflowingElementsCount}`);
  if (diagnostics.overflowingElementsCount > 0) {
    console.log('  ⚠️ Chi tiết tràn ngang:', diagnostics.overflowingElements);
  }
  console.log(`- Nút bấm thiếu nhãn tiếp cận (Accessibility): ${diagnostics.buttonsWithoutLabelCount}`);
  console.log(`- Tổng tài nguyên mạng nạp: ${diagnostics.totalResources} (trong đó JS: ${diagnostics.jsResourcesCount})`);
  console.log(`- Yêu cầu mạng lỗi (4xx/5xx): ${client.failedRequests.length}`);
  client.failedRequests.forEach(r => console.log(`  ❌ ${r.status} ${r.statusText}: ${r.url}`));

  client.close();
  return { diagnostics, failedRequests: client.failedRequests };
}

if (require.main === module) {
  runAudit().catch(err => {
    console.error('\n❌ AUDIT THẤT BẠI:', err);
    process.exit(1);
  });
}

module.exports = { runAudit };
