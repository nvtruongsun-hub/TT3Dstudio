const {chromium} = require('playwright');
(async()=>{
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page = await browser.newPage({reducedMotion:'reduce'});
    const events=[];
    page.on('pageerror', e=>events.push({error:e.message}));
    page.on('console', message=>{if(message.type()==='error')events.push({console:message.text()})});
    page.on('requestfailed',request=>events.push({url:request.url(),failed:request.failure()?.errorText}));
    page.on('response',response=>{if(response.status()>=400)events.push({url:response.url(),status:response.status()})});
    await page.goto('http://127.0.0.1:8765/dist/',{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
    console.log(JSON.stringify({events,state:await page.evaluate(()=>({ready:document.readyState,store:typeof window.TTCatalogStore,products:window.TTCatalogStore?.getProductsSync(true)?.length,cards:document.querySelectorAll('.catalog-product-card').length,grid:document.getElementById('store-product-grid')?.innerText.slice(0,350),workspace:document.querySelector('#view-store')?.className,errors:document.getElementById('store-product-grid')?.getAttribute('aria-busy')}))},null,2));
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
