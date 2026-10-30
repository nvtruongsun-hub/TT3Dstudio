const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const results = [];
async function check(name, fn) {
  try { await fn(); results.push({ name, pass: true }); console.log('PASS ' + name); }
  catch (error) { results.push({ name, pass: false, error: error.message }); console.error('FAIL ' + name + ': ' + error.message); }
}
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:8765', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#curated-product-grid .tt-product-card');
    await check('Four selected products and 55 searchable catalog records', async () => {
      assert.equal(await page.locator('#curated-product-grid .tt-product-card').count(), 4);
      assert.match(await page.locator('#store-results-count').innerText(), /55/);
    });
    await check('Autoplay advances without stealing focus', async () => {
      await page.mouse.move(0,0);
      const initial = await page.locator('[data-hero-tab][aria-selected="true"]').getAttribute('data-hero-tab');
      const active = await page.evaluate(() => document.activeElement.tagName);
      await page.waitForFunction(id => document.querySelector('[data-hero-tab][aria-selected="true"]').dataset.heroTab !== id, initial, { timeout: 10000 });
      assert.equal(await page.evaluate(() => document.activeElement.tagName), active);
    });
    await check('Pause control and manual selection stop automatic rotation', async () => {
      await page.locator('#studio-motion-toggle').click();
      assert.equal(await page.locator('#studio-motion-toggle').getAttribute('aria-pressed'), 'false');
      await page.locator('[data-hero-tab]').first().click();
      await page.waitForTimeout(250);
      assert.equal(await page.locator('.studio-cycling').count(), 0);
    });
    await check('Search returns matches and has a usable empty/reset state', async () => {
      await page.locator('#store-search-input').fill('Washi');
      await page.waitForTimeout(400);
      assert.ok(await page.locator('#store-product-grid .tt-product-card').count() > 0);
      await page.locator('#store-search-input').fill('zzzz-not-a-product-20261030');
      await page.waitForTimeout(400);
      assert.equal(await page.locator('#store-product-grid .tt-product-card').count(), 0);
      await page.locator('#store-product-grid [data-action="clear-search"]').click();
      assert.match(await page.locator('#store-results-count').innerText(), /55/);
    });
    await check('Ascending price sorting uses actual rendered prices', async () => {
      await page.locator('#store-sort-input').selectOption('price-asc');
      const prices = await page.locator('#store-product-grid .price-display').allTextContents();
      const values = prices.map(x => Number(x.replace(/\D/g,'')));
      assert.ok(values.length > 1);
      assert.deepEqual(values, [...values].sort((a,b) => a-b));
    });
    await check('Category tiles activate with Enter and filter 11 records', async () => {
      const category = page.locator('.bento-card').nth(2);
      assert.equal(await category.evaluate(x => x.tagName), 'BUTTON');
      await category.focus(); await category.press('Enter');
      await page.waitForTimeout(300);
      assert.match(await page.locator('#store-results-count').innerText(), /11/);
    });
    await check('Product configuration still adds an item to the cart', async () => {
      try {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.locator('#curated-product-grid [data-action="configure-product"]').first().click();
        await page.locator('#order-modal').waitFor({ state: 'visible' });
        assert.equal(await page.evaluate(() => window.modalActiveProduct.id), 'mw-cn-1646129');
        await page.locator('#modal-btn-add-cart').click();
        await page.waitForFunction(() => Number(document.querySelector('.cart-badge-count').textContent.trim()) > 0, null, { timeout: 2000 });
        await page.locator('#cart-drawer-close-btn').click();
      } catch (error) {
        console.log('Cart diagnostic', await page.evaluate(() => ({ selected: window.modalActiveProduct?.id, color: window.modalSelectedColor?.id, material: window.modalSelectedMat?.id, toast: document.querySelector('#toast-container')?.innerText })));
        throw error;
      } finally {
        await page.evaluate(() => { window.closeProductDetailModal?.(); window.TTCart.closeCart?.(); });
      }
    });
    for (const width of [1440, 768, 390, 320]) {
      await check(`Responsive layout at ${width}px`, async () => {
        await page.setViewportSize({ width, height: width < 800 ? 844 : 1000 });
        await page.evaluate(() => { window.switchWorkspace('view-store'); window.scrollTo(0,0); });
        await page.waitForTimeout(250);
        const dimensions = await page.evaluate(() => ({
          width: document.documentElement.scrollWidth,
          viewport: innerWidth,
          header: document.querySelector('#floating-navbar').getBoundingClientRect().height,
          dock: document.querySelector('.mobile-bottom-dock').getBoundingClientRect().height,
          columns: getComputedStyle(document.querySelector('.mobile-bottom-dock > div')).gridTemplateColumns.split(' ').length
        }));
        assert.ok(dimensions.width <= width + 1, JSON.stringify(dimensions));
        assert.ok(dimensions.header <= 80, JSON.stringify(dimensions));
        if (width < 1100) { assert.ok(dimensions.dock <= 74, JSON.stringify(dimensions)); assert.equal(dimensions.columns,5); }
        if (width === 390) {
          await page.locator('#mobile-menu-toggle-btn').click();
          assert.equal(await page.locator('#mobile-menu-toggle-btn').getAttribute('aria-expanded'), 'true');
          await page.locator('#mobile-nav-drawer [data-nav-view="view-support"]').click();
          assert.equal(await page.locator('#mobile-menu-toggle-btn').getAttribute('aria-expanded'), 'false');
          await page.evaluate(() => window.switchWorkspace('view-store'));
          await page.locator('#store-catalog').scrollIntoViewIfNeeded();
          await page.screenshot({ path: path.join(__dirname, 'after-mobile-catalog.png') });
          const columns = await page.locator('#store-product-grid .minimal-product-grid').evaluate(x => getComputedStyle(x).gridTemplateColumns.split(' ').length);
          assert.equal(columns,2);
          await page.locator('[data-product-layout="large"]').click();
          assert.equal(await page.locator('#store-product-grid .minimal-product-grid').evaluate(x => getComputedStyle(x).gridTemplateColumns.split(' ').length), 1);
          await page.locator('[data-product-layout="compact"]').click();
        }
      });
    }
    await check('Reduced motion stops autoplay and reveals content immediately', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(100);
      assert.ok(await page.locator('#studio-motion-toggle').isDisabled());
      assert.equal(await page.locator('.studio-cycling').count(), 0);
      assert.equal(await page.locator('.studio-reveal-pending').count(), 0);
      assert.equal(await page.locator('.workspace-fade-in').first().evaluate(x => getComputedStyle(x).animationName), 'none');
    });
    await check('No browser runtime exceptions through the buying flow', async () => assert.deepEqual(errors, []));
    await page.close();
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(__dirname, 'verification.json'), JSON.stringify(results,null,2));
  console.log(`${results.filter(x=>x.pass).length}/${results.length} passed`);
  if (results.some(x=>!x.pass)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
