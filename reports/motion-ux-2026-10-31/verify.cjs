const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const results=[];
async function check(name,run){try{await run();results.push({name,pass:true});console.log('PASS '+name)}catch(error){results.push({name,pass:false,error:error.message});console.error('FAIL '+name+': '+error.message)}}
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:8765/dist/',{waitUntil:'domcontentloaded'});
    await page.locator('#store-product-grid .catalog-product-card').first().waitFor();
    const count=await page.evaluate(()=>window.TTCatalogStore.getProductsSync(true).length);
    await check('Existing full catalog loads with motion enhancement',async()=>{
      assert.equal(count,105);
      assert.equal(await page.locator('#store-product-grid .catalog-product-card').count(),12);
      assert.equal(await page.evaluate(()=>typeof window.TTInterfaceMotion.animateGrid),'function');
    });
    await check('Hero workflow, photograph and ticker animate while visible',async()=>{
      await page.waitForFunction(()=>document.body.dataset.studioRunning==='true');
      const states=await page.evaluate(()=>[...document.querySelectorAll('.atelier-orb,.atelier-step-icon,#hero-showcase-img,.automation-loop-track')].map(node=>({name:getComputedStyle(node).animationName,state:getComputedStyle(node).animationPlayState})));
      assert.ok(states.length>=7);
      assert.ok(states.every(item=>item.name!=='none'&&item.state==='running'),JSON.stringify(states));
    });
    await check('Shared pause stops every ambient loop and is remembered on reload',async()=>{
      await page.locator('#studio-ticker-toggle').click();
      assert.equal(await page.locator('#studio-motion-toggle').getAttribute('aria-pressed'),'false');
      const states=await page.evaluate(()=>[...document.querySelectorAll('.atelier-orb,.atelier-step-icon,#hero-showcase-img,.automation-loop-track')].map(node=>getComputedStyle(node).animationPlayState));
      assert.ok(states.every(state=>state==='paused'));
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('#store-product-grid .catalog-product-card').first().waitFor();
      assert.equal(await page.evaluate(()=>document.body.dataset.studioMotion),'paused');
      assert.equal(await page.locator('#studio-ticker-toggle').getAttribute('aria-pressed'),'false');
    });
    await check('Autoplay switches products without moving keyboard focus',async()=>{
      await page.locator('#studio-ticker-toggle').click();
      await page.keyboard.press('Tab');await page.mouse.move(0,400);
      const before=await page.locator('[data-hero-tab][aria-selected="true"]').getAttribute('data-hero-tab');
      const focus=await page.evaluate(()=>document.activeElement.outerHTML.slice(0,150));
      await page.waitForFunction(id=>document.querySelector('[data-hero-tab][aria-selected="true"]').dataset.heroTab!==id,before,{timeout:11000});
      assert.equal(await page.evaluate(()=>document.activeElement.outerHTML.slice(0,150)),focus);
    });
    await check('Manual hero choice pauses autoplay and cleans up crossfade copies',async()=>{
      await page.locator('[data-hero-tab]').first().click();
      await page.waitForTimeout(550);
      assert.equal(await page.locator('#studio-motion-toggle').getAttribute('aria-pressed'),'false');
      assert.equal(await page.locator('.atelier-image-ghost').count(),0);
      assert.equal(await page.locator('#hero-showcase-img').count(),1);
    });
    await check('Scrolling away suspends hero and ticker loops',async()=>{
      await page.locator('#studio-ticker-toggle').click();
      await page.mouse.move(0,400);
      await page.locator('#store-product-grid').scrollIntoViewIfNeeded();
      await page.waitForTimeout(450);
      assert.equal(await page.evaluate(()=>document.body.dataset.studioRunning),'false');
      assert.equal(await page.evaluate(()=>document.body.dataset.tickerRunning),'false');
      assert.equal(await page.locator('#hero-showcase-img').evaluate(node=>getComputedStyle(node).animationPlayState),'paused');
    });
    await check('Rapid filter open/close settles on the final choice',async()=>{
      await page.locator('#store-filters-toggle').scrollIntoViewIfNeeded();
      await page.evaluate(()=>{for(let i=0;i<7;i++)document.getElementById('store-filters-toggle').click()});
      await page.waitForTimeout(320);
      assert.equal(await page.locator('#store-advanced-filters').isVisible(),true);
      assert.equal(await page.locator('#store-advanced-filters').evaluate(node=>node.inert),false);
      assert.equal(await page.locator('#store-advanced-filters').evaluate(node=>node.style.overflow),'');
      await page.evaluate(()=>{for(let i=0;i<3;i++)document.getElementById('store-filters-toggle').click()});
      await page.waitForTimeout(230);
      assert.equal(await page.locator('#store-advanced-filters').isHidden(),true);
    });
    await check('Category changes move the indicator and preserve correct matching cards',async()=>{
      const button=page.locator('#store-category-filters [data-category]').nth(1);
      const category=await button.getAttribute('data-category');await button.click();
      await page.waitForTimeout(360);
      const state=await page.evaluate(()=>{
        const active=document.querySelector('#store-category-filters [aria-pressed="true"]'),indicator=document.querySelector('.motion-pill-indicator');
        return {delta:Math.abs(active.getBoundingClientRect().left-indicator.getBoundingClientRect().left),ids:[...document.querySelectorAll('#store-product-grid .catalog-product-card')].map(node=>node.dataset.productId)};
      });
      assert.ok(state.delta<2,JSON.stringify(state));
      const products=await page.evaluate(()=>window.TTCatalogStore.getProductsSync(true));
      assert.ok(state.ids.length&&state.ids.every(id=>products.find(item=>item.id===id)?.category===category));
      await page.locator('#store-reset-filters').click();
    });
    await check('Opening and closing details keeps the clicked item and returns focus',async()=>{
      const button=page.locator('#store-product-grid [data-action="configure-product"]').first();
      const id=await button.getAttribute('data-product-id');await button.click();
      assert.equal(await page.evaluate(()=>window.modalActiveProduct.id),id);
      await page.locator('#order-modal-close-btn').click();
      await page.waitForTimeout(230);
      assert.equal(await page.locator('#order-modal').isHidden(),true);
      assert.equal(await page.evaluate(()=>document.activeElement.dataset.productId),id);
      assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
    });
    await check('Reopening during close cancels the stale close callback',async()=>{
      const ids=await page.locator('#store-product-grid .catalog-product-card').evaluateAll(nodes=>nodes.slice(0,2).map(node=>node.dataset.productId));
      await page.evaluate(ids=>{window.openProductDetailModal(ids[0]);window.closeProductDetailModal();window.openProductDetailModal(ids[1])},ids);
      await page.waitForTimeout(400);
      assert.equal(await page.locator('#order-modal').isVisible(),true);
      assert.equal(await page.locator('#order-modal').evaluate(node=>node.inert),false);
      assert.equal(await page.evaluate(()=>window.modalActiveProduct.id),ids[1]);
      await page.locator('#order-modal-close-btn').click();await page.waitForTimeout(200);
    });
    await check('Cart handoff preserves variant, focus and scroll lock; closing returns to the card',async()=>{
      const button=page.locator('#store-product-grid [data-action="configure-product"]').first();
      const id=await button.getAttribute('data-product-id');await button.click();
      await page.locator('#modal-swatches-list button').last().click();
      const color=await page.evaluate(()=>window.modalSelectedColor.id);
      await page.locator('#modal-btn-add-cart').click();await page.waitForTimeout(400);
      const state=await page.evaluate(()=>({cart:JSON.parse(localStorage.getItem('tt3d_cart_items_v2')||'[]'),overflow:document.body.style.overflow,focus:document.activeElement.id}));
      assert.equal(state.cart[0].id,id);assert.equal(state.cart[0].colorId,color);
      assert.equal(state.overflow,'hidden');assert.equal(state.focus,'cart-drawer-close-btn');
      await page.locator('#cart-drawer-close-btn').click();await page.waitForTimeout(380);
      assert.equal(await page.evaluate(()=>document.activeElement.dataset.productId),id);
    });
    for(const width of [320,390,768,1440])await check('Responsive motion at '+width+'px has no horizontal overflow',async()=>{
      await page.setViewportSize({width,height:width<800?844:1000});
      await page.evaluate(()=>{window.switchWorkspace('view-store');window.scrollTo({top:0,behavior:'instant'})});
      await page.waitForTimeout(450);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await page.locator('#store-filters-toggle').scrollIntoViewIfNeeded();
      await page.locator('#store-filters-toggle').click();await page.waitForTimeout(320);
      await page.locator('#store-price-range').selectOption('under-100');
      await page.waitForTimeout(320);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await page.locator('#store-reset-filters').click();
      await page.locator('#store-filters-toggle').click();await page.waitForTimeout(250);
    });
    await check('Reduced motion immediately ends transitions and disables automatic loops',async()=>{
      await page.locator('#store-product-grid [data-action="configure-product"]').first().click();
      await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
      await page.evaluate(()=>window.closeProductDetailModal());
      assert.equal(await page.locator('#order-modal').isHidden(),true);
      assert.equal(await page.locator('#studio-motion-toggle').isDisabled(),true);
      assert.equal(await page.locator('#studio-ticker-toggle').isDisabled(),true);
      assert.equal(await page.locator('.studio-reveal-pending').count(),0);
      assert.equal(await page.evaluate(()=>document.body.dataset.studioMotion),'reduced');
      const names=await page.evaluate(()=>[...document.querySelectorAll('.atelier-orb,.atelier-step-icon,#hero-showcase-img')].map(node=>getComputedStyle(node).animationName));
      assert.ok(names.every(name=>name==='none'));
    });
    await check('No runtime exceptions through animated browsing and cart flow',async()=>assert.deepEqual(errors,[]));
    await page.close();
    await check('Touch resume starts immediately and ambient motion pauses behind product details',async()=>{
      const touch=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
      try{
        await touch.goto('http://127.0.0.1:8765/dist/',{waitUntil:'domcontentloaded'});
        await touch.locator('#store-product-grid .catalog-product-card').first().waitFor();
        await touch.tap('#studio-motion-toggle');await touch.tap('#studio-motion-toggle');
        await touch.waitForFunction(()=>document.body.dataset.studioRunning==='true');
        await touch.evaluate(()=>window.openProductDetailModal(window.TTCatalogStore.getProductsSync(true)[0].id));
        await touch.waitForTimeout(100);
        assert.equal(await touch.evaluate(()=>document.body.dataset.studioRunning),'false');
        assert.equal(await touch.evaluate(()=>document.body.dataset.tickerRunning),'false');
        await touch.evaluate(()=>window.closeProductDetailModal());
        await touch.waitForTimeout(250);
        assert.equal(await touch.locator('#order-modal').isHidden(),true);
      }finally{await touch.close()}
    });
  }finally{await browser.close()}
  fs.writeFileSync(path.join(__dirname,'verification.json'),JSON.stringify(results,null,2));
  console.log(results.filter(item=>item.pass).length+'/'+results.length+' passed');
  if(results.some(item=>!item.pass))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
