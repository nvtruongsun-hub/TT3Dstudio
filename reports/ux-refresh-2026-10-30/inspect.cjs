const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const results = [];
  try {
    for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:8765', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#store-product-grid .tt-product-card');
      await page.waitForTimeout(2200);
      await page.screenshot({ path: path.join(__dirname, `${process.env.AUDIT_PHASE || 'before'}-${name}.png`) });
      if (name === 'mobile' && process.env.AUDIT_PHASE === 'final') {
        await page.evaluate(() => {
          const catalog = document.getElementById('store-catalog');
          const header = document.getElementById('floating-navbar').getBoundingClientRect().height;
          window.scrollTo({ top: catalog.getBoundingClientRect().top + scrollY - header, behavior: 'instant' });
        });
        await page.waitForTimeout(900);
        await page.screenshot({ path: path.join(__dirname, 'final-mobile-catalog.png') });
        console.log('Catalog media geometry', await page.locator('#store-product-grid .tt-product-media').first().evaluate(x => ({width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height})));
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      }
      results.push({ name, errors, ...await page.evaluate(() => ({
        title: document.title,
        viewport: innerWidth,
        pageWidth: document.documentElement.scrollWidth,
        headerHeight: document.querySelector('#floating-navbar').getBoundingClientRect().height,
        cards: document.querySelectorAll('.tt-product-card').length,
        hero: document.querySelector('#hero').getBoundingClientRect().toJSON(),
        hiddenSections: [...document.querySelectorAll('#view-store > section')].filter(x => getComputedStyle(x).display === 'none').map(x => x.id),
        brokenLoadedImages: [...document.images].filter(x => x.getAttribute('src') && x.complete && !x.naturalWidth).map(x => x.getAttribute('src')).slice(0,12),
        text: document.querySelector('#view-store').innerText.slice(0,1500)
      })) });
      await page.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(__dirname, `${process.env.AUDIT_PHASE || 'before'}-audit.json`), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
