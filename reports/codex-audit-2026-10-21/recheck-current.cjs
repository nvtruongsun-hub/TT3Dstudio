// Read-only probes of the reviewed application snapshot. EXPECT CURRENT DEFECTS.
const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const path = require('path');
const root = path.resolve(__dirname, '../..');
process.chdir(root);
const read = f => fs.readFileSync(f, 'utf8');
const harness = read('tests/test_audit_regressions.js').split('let passed = 0;')[0];
const context = {require, URLSearchParams, __dirname: path.join(root, 'tests')};
vm.createContext(context);
vm.runInContext(harness + '\nglobalThis.makeEnv=createEnvironment;', context);
let count = 0;
function probe(name, fn) { fn(); count++; console.log('[REPRODUCED] ' + name); }
probe('Cart +/- click throws ReferenceError: updateQty is not defined', () => {
  const e = context.makeEnv();
  let handler;
  e.nodes.get('cart-items-container').addEventListener = (type, fn) => { if(type === 'click') handler = fn; };
  e.load('js/cart.js');
  e.win.TTCart.addToCart({id:'probe', title:'Probe', price:100, qty:1});
  assert.equal(typeof handler, 'function');
  assert.throws(() => handler({target:{closest:s => s.includes('cart-qty-inc') ? {dataset:{lineId:encodeURIComponent(e.win.TTCart.getItems()[0].cartItemId)}} : null}}), /updateQty is not defined/);
});
probe('Cart renders attacker markup from title and customText into innerHTML', () => {
  const e = context.makeEnv();
  e.load('js/cart.js');
  const payload = '<img src=x onerror="window.auditInjected=1">';
  e.win.TTCart.addToCart({id:'probe', title:payload, customText:payload, price:100, qty:1});
  assert.ok(e.nodes.get('cart-items-container').innerHTML.includes(payload));
});
probe('Store tab re-click keeps selected category instead of resetting to all', () => {
  const e = context.makeEnv();
  e.win.TTCatalogStore = {getProductsSync:() => JSON.parse(read('products.json'))};
  e.load('js/products-manager.js'); e.load('js/app.js');
  e.win.navigateToCategory('Trang_Diem_Vanity');
  e.win.switchWorkspace('view-store');
  assert.equal(e.win.location.hash, '#store?cat=Trang_Diem_Vanity');
  assert.equal((e.nodes.get('store-product-grid').innerHTML.match(/class="studio-hero-spotlight /g)||[]).length, 1);
});
probe('Purchase builder accepts fractional/junk qty and fabricates empty options', () => {
  const e = context.makeEnv();
  e.win.TTCatalogStore = {getProductByIdSync:() => ({id:'p',title:'P',status:'active',price:0,colors:[],materials:[]})};
  e.load('js/purchase-config.js');
  assert.equal(e.win.TTPurchaseConfig.buildConfiguredLine('p',{qty:1.5}).qty, 1);
  assert.equal(e.win.TTPurchaseConfig.buildConfiguredLine('p',{qty:'2junk'}).qty, 2);
  assert.equal(e.win.TTPurchaseConfig.buildConfiguredLine('p',{}).materialId, 'default');
});
probe('Cart boundary accepts empty Product ID, negative price, and fractional qty', () => {
  const e = context.makeEnv(); e.load('js/cart.js');
  e.win.TTCart.addToCart({id:'', title:'Bad',price:-1,qty:1.5});
  assert.equal(e.win.TTCart.getItems()[0].price,-1);
  assert.equal(e.win.TTCart.getItems()[0].qty,1.5);
});
probe('Admin orders renderer throws ReferenceError: ordersBody is not defined', () => {
  const e = context.makeEnv();
  e.win.document.readyState = 'loading';
  e.nodes.set('orders-table-body',{innerHTML:''});
  e.win.TTCheckout = {getDraftOrders:() => [{clientRequestId:'probe',createdAt:'2026-10-21',items:[],customer:{}}]};
  // Expose the unchanged production function without running app initialization.
  const source = read('js/admin.js').replace('// Export Global API','window.__auditOrders = renderOrdersTable;\n  // Export Global API');
  vm.runInContext(source,e.win,{filename:'js/admin.js'});
  assert.throws(() => e.win.__auditOrders(), /ordersBody is not defined/);
});
async function checkSuiteExit() {
  const source = read('tests/test_audit_regressions.js').replace('async function test(name, fn) {', 'async function test(name, fn) { fn = () => { throw new Error("forced assertion failure"); };');
  const logs = [];
  const fakeProcess = {exitCode:0,exit(code){this.exitCode=code;}};
  const c = {require,__dirname:path.join(root,'tests'),process:fakeProcess,console:{log:s=>logs.push(s),error:s=>logs.push(String(s))}};
  vm.createContext(c); vm.runInContext(source,c);
  await new Promise(resolve=>setImmediate(resolve));
  assert.ok(logs.some(s=>s.includes('Passed 0 / 11')));
  assert.equal(fakeProcess.exitCode,0);
  console.log('[REPRODUCED] Regression suite reports 0/11 but leaves exitCode zero (VM process observation)');
  count++;
}
async function checkStorage() {
  const seed = JSON.parse(read('products.json'));
  function env(data={},offline=false) {
    const ctl={offline,failMeta:false};
    const e={console:{error(){},warn(){},log(){}},localStorage:{getItem:k=>data[k]??null,setItem:(k,v)=>{if(ctl.failMeta&&k==='tt_catalog_meta')throw Error('quota-meta');data[k]=v;}},fetch:async()=>{if(ctl.offline)throw Error('offline');return {ok:true,json:async()=>seed};},CustomEvent:class{},addEventListener(){},dispatchEvent(){}};
    e.window=e;vm.createContext(e);vm.runInContext(read('js/catalog-store.js'),e);return {data,ctl,s:e.TTCatalogStore};
  }
  let x=env();await x.s.init();x.ctl.failMeta=true;
  const a=seed[0].id,b=seed[1].id;
  assert.equal(await x.s.deleteProduct(a),true);
  x.ctl.failMeta=false;await x.s.deleteProduct(b);
  assert.ok(!JSON.parse(x.data.tt_catalog_meta).tombstones.includes(a));
  const future=x.s.buildMigration({storedProducts:JSON.parse(x.data.tt_products),incomingDefaults:seed,metadata:JSON.parse(x.data.tt_catalog_meta),currentRevision:'mw-55-v2',currentSchemaVersion:5,timestamp:'2026-10-21'});
  assert.ok(future.products.some(p=>p.id===a)); count++;
  console.log('[REPRODUCED] Metadata failure loses deleted tombstone; next revision resurrects first deleted seed');
  x=env({tt_products:JSON.stringify([{id:seed[0].id,title:'custom',price:100}]),tt_catalog_meta:JSON.stringify({catalogRevision:'old',tombstones:[]})},true);
  await x.s.init();await x.s.upsertProduct({id:seed[0].id,title:'edited'});await x.s.deleteProduct('not-existing');
  assert.equal(JSON.parse(x.data.tt_catalog_meta).catalogRevision,'mw-55-v1');
  x.ctl.offline=false;await x.s.init(true);
  assert.equal(x.s.getProductsSync(false).length,1); count++;
  console.log('[REPRODUCED] Offline mutation prematurely persists current revision; force retry online still leaves 1/55 products');
}
checkSuiteExit().then(checkStorage).then(()=>console.log(`Current snapshot: ${count} defects reproduced. These probes confirm defects; they are not release gates.`)).catch(error=>{console.error(error);process.exitCode=1;});
