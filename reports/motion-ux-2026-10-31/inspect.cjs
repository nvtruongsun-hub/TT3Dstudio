const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const records=[];
  try {
    for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
      const page=await browser.newPage({viewport:{width,height}});
      const errors=[];page.on('pageerror',error=>errors.push(error.message));
      await page.goto(process.env.MOTION_BASE || 'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
      await page.locator('#store-product-grid .catalog-product-card').first().waitFor({timeout:12000}).catch(async error=>{
        console.log(JSON.stringify({errors,state:await page.evaluate(()=>({catalog:typeof window.TTCatalogStore,grid:document.querySelector('#store-product-grid')?.innerText.slice(0,300),html:document.querySelector('#store-product-grid')?.innerHTML.slice(0,400)}))}));
        throw error;
      });
      await page.evaluate(()=>document.fonts.ready);
      await page.waitForTimeout(600);
      await page.screenshot({path:path.join(__dirname,(process.env.MOTION_PHASE || 'before')+'-'+name+'.png')});
      records.push(await page.evaluate(({name,errors})=>({name,errors,viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,products:window.TTCatalogStore.getProductsSync(true).length,heroHeight:document.querySelector('#hero').getBoundingClientRect().height,headerHeight:document.querySelector('#floating-navbar').getBoundingClientRect().height,cardCount:document.querySelectorAll('#store-product-grid .catalog-product-card').length,motion:document.body.dataset.studioMotion || null}),{name,errors}));
      await page.close();
    }
  }finally{await browser.close()}
  fs.writeFileSync(path.join(__dirname,(process.env.MOTION_PHASE || 'before')+'-measurements.json'),JSON.stringify(records,null,2));
  console.log(JSON.stringify(records));
})().catch(error=>{console.error(error);process.exitCode=1});
