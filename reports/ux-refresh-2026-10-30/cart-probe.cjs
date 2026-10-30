const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    await page.goto('http://127.0.0.1:8765', {waitUntil:'domcontentloaded'});
    await page.waitForSelector('#curated-product-grid .tt-product-card');
    await page.locator('#curated-product-grid [data-action="configure-product"]').first().click();
    await page.locator('#order-modal').waitFor({state:'visible'});
    console.log('BEFORE', await page.evaluate(() => ({product:window.modalActiveProduct?.id,status:window.modalActiveProduct?.status,color:window.modalSelectedColor?.id,material:window.modalSelectedMat?.id})));
    await page.locator('#modal-btn-add-cart').click();
    await page.waitForTimeout(400);
    console.log('AFTER', await page.evaluate(() => {
      let validation = 'ok';
      try { window.TTPurchaseConfig.buildConfiguredLine(window.modalActiveProduct?.id,{colorId:window.modalSelectedColor?.id,materialId:window.modalSelectedMat?.id,qty:window.modalQty}); } catch(e) { validation=e.message; }
      return {validation,toast:document.querySelector('#toast-container')?.innerText,badge:document.querySelector('.cart-badge-count')?.textContent,modal:document.querySelector('#order-modal').className,selected:window.modalActiveProduct?.id,cart:window.TTCart.getCartItems?.().length};
    }));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
