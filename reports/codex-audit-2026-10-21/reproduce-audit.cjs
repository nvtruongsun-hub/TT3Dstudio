// Read-only source audit. These assertions confirm defects on the reviewed snapshot.
// This is a Node VM probe, not a browser E2E or a post-fix regression suite.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const catalog = JSON.parse(read('products.json'));
function environment(initial = {}) {
  const data = { ...initial }, nodes = new Map(), events = {};
  const html = read('index.html');
  for (const match of html.matchAll(/\bid="([^"]+)"/g)) {
    const classes = new Set();
    nodes.set(match[1], {
      id: match[1], value: '', textContent: '', innerHTML: '', style: {},
      classList: {
        add: (...a) => a.forEach(x => classes.add(x)),
        remove: (...a) => a.forEach(x => classes.delete(x)),
        contains: x => classes.has(x), toggle: () => {}
      },
      setAttribute() {}, removeAttribute() {}, appendChild() {},
      addEventListener() {}, querySelectorAll: () => []
    });
  }
  const document = {
    readyState: 'loading', getElementById: id => nodes.get(id) || null,
    querySelectorAll: () => [], addEventListener() {},
    body: { style: {}, classList: { contains: () => false }, appendChild() {} }
  };
  const win = {
    document, console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: k => data[k] ?? null, setItem: (k,v) => { data[k] = String(v); } },
    fetch: async () => ({ ok: true, json: async () => catalog }),
    addEventListener: (k, fn) => { (events[k] ||= []).push(fn); },
    dispatchEvent() {}, CustomEvent: class { constructor(type, detail) { this.type = type; this.detail = detail; } },
    location: { hash: '#store' }, URLSearchParams,
    requestAnimationFrame() {}, setTimeout() {}, clearTimeout() {},
    scrollTo() {}, history: { pushState(_s,_t,url) { win.location.hash = url; } }
  };
  win.window = win;
  vm.createContext(win);
  return { win, data, nodes, events, load: f => vm.runInContext(read(f), win, { filename: f }) };
}
async function run() {
  console.log('READ-ONLY AUDIT: assertions below confirm current defects, not fixes.');
  {
    const e = environment({ tt_products: '{"custom":"preserve"}' });
    e.load('js/catalog-store.js'); await e.win.TTCatalogStore.initCatalog();
    assert.equal(JSON.parse(e.data.tt_products).length, 55);
    console.log('REPRO A: valid JSON of wrong type was overwritten with 55 seeds.');
  }
  {
    const e = environment(); e.win.fetch = async () => { throw Error('offline'); };
    e.load('js/catalog-store.js'); await e.win.TTCatalogStore.initCatalog();
    assert.equal(e.data.tt_products, '[]');
    const next = environment(e.data); next.load('js/catalog-store.js');
    await next.win.TTCatalogStore.initCatalog();
    assert.equal(next.win.TTCatalogStore.getProductsSync(false).length, 0);
    console.log('REPRO B: first-load fetch failure persisted []; online reload still has 0 products.');
  }
  {
    const e = environment({ tt_products: JSON.stringify([{ id: catalog[0].id, title: 'Admin title', price: 123 }]) });
    e.load('js/catalog-store.js'); await e.win.TTCatalogStore.initCatalog();
    const p = e.win.TTCatalogStore.getProductByIdSync(catalog[0].id);
    assert.notEqual(p.category, catalog[0].category);
    assert.notEqual(p.image, catalog[0].image);
    assert.notEqual(p.downloads, catalog[0].downloads);
    console.log('REPRO C: sanitize-before-merge loses seed category/image/downloads: ' + JSON.stringify({ category: p.category, image: p.image, downloads: p.downloads }));
  }
  {
    const e = environment();
    e.win.TTCatalogStore = { getProductsSync: () => catalog };
    e.load('js/products-manager.js');
    e.win.openProductDetailModal(catalog[0].id);
    assert.equal(catalog[0].modelKey, null);
    assert.equal(e.nodes.get('order-modal-3d-btn').classList.contains('hidden'), false);
    let launched = null; e.win.open3DViewerById = id => { launched = id; };
    e.win.open3DFromModal(); assert.equal(launched, catalog[0].id);
    console.log('REPRO D: null-model modal leaves real 3D button visible and forwards launch.');
  }
  {
    const e = environment();
    e.win.getStoredProducts = () => catalog;
    e.load('js/cart.js'); e.load('js/viewer3d.js');
    assert.equal(e.win.TTStore.addToCart, e.win.TTCart.addToCart);
    e.win.addActive3DModelToCart();
    const line = e.win.TTCart.getItems()[0];
    assert.ok(line.id.startsWith(catalog[0].id + '-'));
    assert.notEqual(line.id, catalog[0].id);
    console.log('REPRO E: TTStore alias EXISTS; default viewer buys first null-model seed using fabricated id=' + line.id);
  }
  {
    const e = environment();
    const base = { ...catalog[0], modelKey: 'nfc_wifi' };
    const a = { ...base, id: 'audit-a' }, b = { ...base, id: 'audit-b' };
    e.win.getStoredProducts = () => [a,b];
    let chosen; e.win.TTStore = { addToCart: item => { chosen = item; } };
    e.load('js/viewer3d.js');
    // Avoid GPU/THREE in this VM. Both products share the already active nfc_wifi key.
    e.win.switch3DModel = () => {};
    e.win.open3DViewerById('audit-b'); e.win.addActive3DModelToCart();
    assert.equal(chosen.productId, 'audit-a');
    console.log('REPRO F: open product B sharing modelKey with A -> purchase productId=A.');
  }
  {
    const e = environment();
    e.win.TTCatalogStore = { getProductsSync: () => catalog };
    e.load('js/products-manager.js'); e.load('js/app.js');
    e.win.navigateToCategory('Trang_Diem_Vanity');
    e.win.switchWorkspace('view-studio3d'); e.win.switchWorkspace('view-store');
    assert.equal(e.win.location.hash, '#store');
    // State remained a single category: exactly one Hero, despite URL #store meaning all.
    const heroCount = (e.nodes.get('store-product-grid').innerHTML.match(/class="studio-hero-spotlight /g) || []).length;
    assert.equal(heroCount, 1);
    console.log('REPRO G: category -> studio -> Store tab gives URL #store but still 1 Hero/category.');
  }
  {
    const e = environment();
    e.win.TTCatalogStore = { getProductsSync: () => catalog };
    const custom = { ...catalog[0], colors: [{ id: "x');window.auditInjected=1;//", name: 'Audit', hex: '#000000' }] };
    e.win.TTCatalogStore.getProductsSync = () => [custom];
    e.load('js/products-manager.js'); e.win.openProductDetailModal(custom.id);
    const markup = e.nodes.get('order-swatches-box').innerHTML;
    const handler = markup.match(/onclick="([^"]+)"/)[1].replace(/&#39;/g,"'");
    e.win.selectModalColor = () => {};
    vm.runInContext(handler, e.win);
    assert.equal(e.win.auditInjected, 1);
    console.log('REPRO H: HTML entity decoding turns escaped color id into executable inline-handler injection (VM proof; browser pending).');
  }
  const manifest = JSON.parse(read('assets/manifest.json'));
  const hashErrors = catalog.filter(p => crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p.image))).digest('hex') !== manifest.imageHashes[path.basename(p.image)]);
  assert.equal(hashErrors.length,0);
  console.log('DATA: 55 products; all 55 image hashes match manifest.');
  console.log('SOURCE SHA256:');
  for (const f of ['index.html','js/catalog-store.js','js/products-manager.js','js/viewer3d.js','js/cart.js','js/app.js','js/admin.js','scripts/import_makerworld_catalog.py']) {
    console.log(crypto.createHash('sha256').update(read(f)).digest('hex') + '  ' + f);
  }
}
run().catch(err => { console.error(err); process.exitCode = 1; });
