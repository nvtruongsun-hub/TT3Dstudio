const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = 'http://127.0.0.1:8765/dist/';
const results = [];
async function check(name, fn) {
  try { await fn(); results.push({ name, pass: true }); console.log('PASS ' + name); }
  catch (error) { results.push({ name, pass: false, error: error.message }); console.error('FAIL ' + name + ': ' + error.message); }
}
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const cards = page.locator('#store-product-grid .catalog-product-card');
    await cards.first().waitFor({ state: 'visible' });
    const catalog = await page.evaluate(() => window.TTCatalogStore.getProductsSync(true));
    const byId = new Map(catalog.map(item => [item.id, item]));
    const ids = () => cards.evaluateAll(nodes => nodes.map(node => node.dataset.productId));
    async function reset() { if (await page.locator('#store-reset-filters').isVisible()) await page.locator('#store-reset-filters').click(); }
    async function filters() { if (await page.locator('#store-advanced-filters').isHidden()) await page.locator('#store-filters-toggle').click(); }
    async function allVisible() {
      while (await page.locator('[data-action="load-more"]').count()) await page.locator('[data-action="load-more"]').click();
      return ids();
    }
    await check('First 12 choices cover all five categories without duplicated products', async () => {
      const first = await ids();
      assert.equal(first.length, 12);
      assert.equal(new Set(first).size, 12);
      assert.equal(new Set(first.slice(0, 5).map(id => byId.get(id).category)).size, 5);
      assert.equal(await page.locator('#store-advanced-filters').isHidden(), true);
      assert.equal(await page.locator('#store-sub-filters').isHidden(), true);
    });
    await check('Advanced filters open by keyboard and Escape restores focus', async () => {
      await page.locator('#store-filters-toggle').focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#store-filters-toggle').getAttribute('aria-expanded'), 'true');
      await page.locator('#store-price-range').focus();
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#store-advanced-filters').isHidden(), true);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'store-filters-toggle');
    });
    for (const [range, min, max] of [['under-100', 0, 100000], ['100-200', 100000, 200000], ['over-200', 200000, Infinity]]) {
      await check('Budget ' + range + ' returns every matching product and no others', async () => {
        await reset(); await filters();
        await page.locator('#store-price-range').selectOption(range);
        const actual = await allVisible();
        const expected = catalog.filter(item => item.price >= min && item.price < max).map(item => item.id);
        assert.deepEqual([...actual].sort(), expected.sort());
        assert.ok(await page.locator('[data-remove-filter="price"]').isVisible());
      });
    }
    await check('Category, subtype, budget and text search combine; removing one preserves others', async () => {
      await reset(); await filters();
      const target = catalog.find(item => item.price >= 100000 && item.price < 200000 && item.subCategory);
      await page.locator('#store-category-filters [data-category="' + target.category + '"]').click();
      await page.locator('#store-sub-filters [data-sub-category="' + target.subCategory + '"]').click();
      await page.locator('#store-price-range').selectOption('100-200');
      await page.locator('#store-search-input').fill(target.id);
      await page.waitForTimeout(350);
      assert.deepEqual(await ids(), [target.id]);
      assert.equal(await page.locator('#store-active-filters button').count(), 4);
      await page.locator('[data-remove-filter="price"]').click();
      assert.equal(await page.locator('#store-price-range').inputValue(), 'all');
      assert.equal(await page.locator('#store-search-input').inputValue(), target.id);
      assert.equal(await page.locator('[data-remove-filter="category"]').count(), 1);
      assert.equal(await page.locator('[data-remove-filter="sub"]').count(), 1);
      assert.deepEqual(await ids(), [target.id]);
      await page.locator('[data-remove-filter="category"]').click();
      assert.equal(await page.locator('[data-remove-filter="sub"]').count(), 0);
      assert.equal(await page.locator('#store-search-input').inputValue(), target.id);
      assert.deepEqual(await ids(), [target.id]);
    });
    await check('Empty combination offers a complete reset including budget, search and sort', async () => {
      await reset(); await filters();
      await page.locator('#store-price-range').selectOption('under-100');
      await page.locator('#store-sort-input').selectOption('price-desc');
      await page.locator('#store-search-input').fill('no-matching-model-zzzz');
      await page.waitForTimeout(350);
      assert.equal(await cards.count(), 0);
      await page.locator('[data-action="reset-filters"]').click();
      assert.equal(await page.locator('#store-price-range').inputValue(), 'all');
      assert.equal(await page.locator('#store-sort-input').inputValue(), 'curated');
      assert.equal(await page.locator('#store-search-input').inputValue(), '');
      assert.equal(await page.locator('#store-active-filters').isHidden(), true);
      assert.equal(await cards.count(), 12);
    });
    await check('Loading more keeps existing order, focuses the next card and reaches all 55 choices', async () => {
      const first = await ids();
      await page.locator('[data-action="load-more"]').click();
      const second = await ids();
      assert.equal(second.length, 24);
      assert.deepEqual(second.slice(0, 12), first);
      assert.equal(await page.evaluate(() => document.activeElement.closest('.catalog-product-card')?.dataset.productId), second[12]);
      const all = await allVisible();
      assert.equal(new Set(all).size, catalog.length);
      assert.deepEqual([...all].sort(), catalog.map(item => item.id).sort());
    });
    await check('Images show the full photo and color legends reflect actual available colors', async () => {
      const rendered = await cards.evaluateAll(nodes => nodes.map(node => ({
        id: node.dataset.productId,
        fit: getComputedStyle(node.querySelector('img')).objectFit,
        colors: node.querySelector('.catalog-product-colors')?.textContent.trim(),
        dots: node.querySelectorAll('.catalog-color-dots > span').length,
        actions: [...node.querySelectorAll('button')].map(button => button.getAttribute('aria-label'))
      })));
      for (const item of rendered) {
        assert.equal(item.fit, 'contain');
        const colors = (byId.get(item.id).colors || []).filter(color => /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test((color.hex || '').trim()));
        assert.equal(item.dots, Math.min(3, colors.length));
        if (colors.length) assert.match(item.colors, new RegExp('^' + colors.length + ' màu'));
        assert.ok(item.actions.every(Boolean));
      }
    });
    await check('Small action labels retain a contrast ratio of at least 4.5 against their surfaces', async () => {
      const ratios = await page.evaluate(() => {
        const luminance = color => {
          const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => {
            value /= 255; return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
          });
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        };
        return [...document.querySelectorAll('.catalog-product-select, #product-view-controls [aria-pressed="true"]')].map(button => {
          const style = getComputedStyle(button);
          const a = luminance(style.color), b = luminance(style.backgroundColor);
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        });
      });
      assert.ok(ratios.length && ratios.every(ratio => ratio >= 4.5), JSON.stringify(ratios));
    });
    await check('Closing product details returns to the same filtered results and card focus', async () => {
      await page.locator('#store-search-input').fill('Washi');
      await page.waitForTimeout(350);
      const before = await ids();
      assert.ok(before.length);
      await cards.first().locator('[data-action="open-detail"]').click();
      await page.locator('#order-modal').waitFor({ state: 'visible' });
      assert.equal(await page.evaluate(() => window.modalActiveProduct.id), before[0]);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#order-modal').isHidden(), true);
      assert.deepEqual(await ids(), before);
      assert.equal(await page.locator('#store-search-input').inputValue(), 'Washi');
      assert.equal(await page.evaluate(() => document.activeElement.closest('.catalog-product-card')?.dataset.productId), before[0]);
    });
    await check('Xem & chọn opens the correct item and preserves selected color/material in cart', async () => {
      await reset();
      const id = await cards.first().getAttribute('data-product-id');
      await cards.first().locator('[data-action="configure-product"]').click();
      await page.locator('#order-modal').waitFor({ state: 'visible' });
      assert.equal(await page.evaluate(() => window.modalActiveProduct.id), id);
      await page.locator('#modal-swatches-list button').last().click();
      await page.locator('#modal-materials-list button').last().click();
      const selected = await page.evaluate(() => ({ color: window.modalSelectedColor.id, material: window.modalSelectedMat.id }));
      await page.locator('#modal-btn-add-cart').click();
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('tt3d_cart_items_v2') || '[]').length > 0);
      const item = await page.evaluate(() => JSON.parse(localStorage.getItem('tt3d_cart_items_v2'))[0]);
      assert.equal(item.id, id);
      assert.equal(item.colorId, selected.color);
      assert.equal(item.materialId, selected.material);
      await page.locator('#cart-drawer-close-btn').click();
    });
    for (const width of [320, 390, 768, 1440]) {
      await check('Catalog controls and product columns fit at ' + width + 'px', async () => {
        await page.setViewportSize({ width, height: 1000 });
        if (await page.locator('#store-advanced-filters').isVisible()) await page.locator('#store-filters-toggle').click();
        await page.locator('[data-product-layout="compact"]').click();
        let layout = await page.evaluate(() => ({
          page: document.documentElement.scrollWidth, viewport: innerWidth,
          columns: getComputedStyle(document.querySelector('#store-product-grid .minimal-product-grid')).gridTemplateColumns.split(' ').length,
          controls: document.querySelector('.catalog-controls').getBoundingClientRect().height,
          buttons: [...document.querySelectorAll('.catalog-toolbar-actions > *')].filter(node => !node.hidden).map(node => ({ left: node.getBoundingClientRect().left, right: node.getBoundingClientRect().right }))
        }));
        assert.ok(layout.page <= width + 1, JSON.stringify(layout));
        assert.equal(layout.columns, width > 1024 ? 3 : 2);
        assert.ok(layout.buttons.every(button => button.left >= 0 && button.right <= width), JSON.stringify(layout));
        assert.ok(layout.controls <= 145, JSON.stringify(layout));
        await page.locator('[data-product-layout="large"]').click();
        const columns = await page.locator('#store-product-grid .minimal-product-grid').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length);
        assert.equal(columns, width <= 640 ? 1 : 2);
        await filters();
        await page.locator('#store-price-range').selectOption('under-100');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await reset();
      });
    }
    await check('Saved photo layout survives a reload', async () => {
      await page.locator('[data-product-layout="large"]').click();
      await page.reload({ waitUntil: 'domcontentloaded' });
      await cards.first().waitFor({ state: 'visible' });
      assert.equal(await page.locator('#store-product-grid').getAttribute('data-layout'), 'large');
      assert.equal(await page.locator('[data-product-layout="large"]').getAttribute('aria-pressed'), 'true');
    });
    await check('Exact budget boundaries 100000 and 200000 belong to only one range', async () => {
      const fixture = catalog.slice(0, 4).map((item, i) => ({ ...item, price: [99999, 100000, 199999, 200000][i] }));
      const boundary = await browser.newPage({ reducedMotion: 'reduce' });
      try {
        await boundary.route('**/products.json*', route => route.fulfill({ json: fixture }));
        await boundary.goto(base, { waitUntil: 'domcontentloaded' });
        await boundary.locator('#store-product-grid .catalog-product-card').first().waitFor();
        await boundary.locator('#store-filters-toggle').click();
        for (const [range, expected] of [['under-100', [99999]], ['100-200', [100000, 199999]], ['over-200', [200000]]]) {
          await boundary.locator('#store-price-range').selectOption(range);
          const actual = await boundary.locator('#store-product-grid .product-price').allTextContents();
          assert.deepEqual(actual.map(value => Number(value.replace(/\D/g, ''))).sort((a, b) => a - b), expected);
        }
      } finally { await boundary.close(); }
    });
    await check('No browser runtime exceptions in the catalog buying flow', async () => assert.deepEqual(errors, []));
    await page.close();
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(__dirname, 'verification.json'), JSON.stringify(results, null, 2));
  console.log(results.filter(item => item.pass).length + '/' + results.length + ' passed');
  if (results.some(item => !item.pass)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
