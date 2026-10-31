const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const results = [];
  try {
    for (const [name,width,height] of [['desktop',1440,1000],['tablet',768,1024],['mobile',390,844],['small-mobile',320,844]]) {
      const page = await browser.newPage({viewport:{width,height}});
      await page.goto(process.env.CATALOG_BASE_URL || 'http://127.0.0.1:8765/dist/',{waitUntil:'domcontentloaded'});
      await page.locator('#store-product-grid .tt-product-card').first().waitFor({state:'visible'});
      await page.evaluate(async()=>{await document.fonts.ready;const catalog=document.getElementById('store-catalog');const header=document.getElementById('floating-navbar');window.scrollTo({top:catalog.getBoundingClientRect().top+scrollY-header.getBoundingClientRect().height,behavior:'instant'});});
      await page.waitForTimeout(900);
      await page.screenshot({path:path.join(__dirname,`${process.env.CATALOG_PHASE || 'before'}-${name}.png`)});
      const measurement = await page.evaluate(name=>({name,viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,firstCard:document.querySelector('#store-product-grid .tt-product-card').getBoundingClientRect().toJSON(),controls:document.querySelector('.catalog-controls, .sticky-catalog-header').getBoundingClientRect().toJSON(),sortFont:getComputedStyle(document.querySelector('#store-sort-input')).fontSize,catalogCss:document.querySelector('link[href*="catalog.css"]')?.getAttribute('href'),toolbarBounds:[...document.querySelectorAll('.catalog-toolbar-actions > *')].filter(node=>!node.hidden).map(node=>({left:node.getBoundingClientRect().left,right:node.getBoundingClientRect().right}))}),name);
      assert.ok(measurement.pageWidth <= width + 1, JSON.stringify(measurement));
      assert.match(measurement.catalogCss, /choice-v2/);
      assert.ok(measurement.toolbarBounds.every(item=>item.left>=0 && item.right<=width), JSON.stringify(measurement));
      if(width<768) assert.equal(measurement.sortFont,'16px');
      results.push(measurement);
      await page.close();
    }
  }finally{await browser.close();}
  fs.writeFileSync(path.join(__dirname,`${process.env.CATALOG_PHASE || 'before'}-measurements.json`),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results));
})().catch(e=>{console.error(e);process.exitCode=1});
