// Audit evidence only: assertions below confirm observed defects, NOT release gates.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'js/catalog-store.js'), 'utf8');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'products.json'), 'utf8'));
const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/category-registry.json'), 'utf8'));
const meta = () => ({ schemaVersion: 5, catalogRevision: 'mw-55-v2', tombstones: [] });
function env(data) {
  const writes = [];
  const w = { console: { log() {}, warn() {}, error() {} }, TTCategoryRegistry: registry,
    localStorage: { getItem: k => data[k] ?? null, setItem(k, v) { writes.push(k); data[k] = String(v); }, removeItem(k) { delete data[k]; } },
    fetch: async () => ({ ok: true, json: async () => catalog }),
    addEventListener() {}, dispatchEvent() {}, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } }
  };
  w.window = w; vm.createContext(w); vm.runInContext(source, w);
  return { w, api: w.TTCatalogStore, data, writes };
}
function seeded() { return { tt_products: JSON.stringify(catalog.slice(0, 2)), tt_catalog_meta: JSON.stringify(meta()) }; }
async function run() {
  let observed = 0;
  function record(name, evidence) { observed++; console.log(JSON.stringify({ name, evidence })); }
  {
    const data = seeded();
    const target = { ...meta(), tombstones: [catalog[0].id] };
    data.tt_catalog_pending_commit = JSON.stringify({ txId: 'crash-before-list', version: 1, beforeLength: 2, afterLength: 1, targetMetadata: target });
    const e = env(data); await e.api.initCatalog();
    const present = e.api.getProductsSync(false).some(p => p.id === catalog[0].id);
    const tombstone = JSON.parse(data.tt_catalog_meta).tombstones.includes(catalog[0].id);
    assert.ok(present && tombstone);
    record('Recovery applies target metadata while original product still exists', { present, tombstone, journalRemoved: !data.tt_catalog_pending_commit });
  }
  {
    const data = seeded(); const e = env(data); await e.api.initCatalog();
    const originalSet = e.w.localStorage.setItem;
    e.w.localStorage.setItem = (k, v) => { if (k === 'tt_catalog_meta') throw Error('injected metadata failure'); originalSet(k, v); };
    const a = await e.api.deleteProduct(catalog[0].id);
    assert.equal(a.metadataPending, true);
    e.w.localStorage.setItem = (k, v) => { if (k === 'tt_products') throw Error('injected list failure'); originalSet(k, v); };
    const b = await e.api.deleteProduct(catalog[1].id);
    assert.equal(b.productsCommitted, false);
    assert.equal(data.tt_catalog_pending_commit, undefined);
    assert.ok(!JSON.parse(data.tt_catalog_meta).tombstones.includes(catalog[0].id));
    // Simulate subsequent seed revision: deleted A is resurrected without its lost marker.
    data.tt_catalog_meta = JSON.stringify({ ...meta(), catalogRevision: 'previous-revision' });
    const next = env(data); await next.api.initCatalog();
    const resurrected = next.api.getProductsSync(false).some(p => p.id === catalog[0].id);
    assert.ok(resurrected);
    record('Second failed delete removes first pending journal; next revision resurrects A', { firstPending: a.metadataPending, secondProductsCommitted: b.productsCommitted, resurrected });
  }
  {
    const data = seeded(); const e = env(data); await e.api.initCatalog();
    const p = await e.api.upsertProduct({ id: catalog[0].id, price: -123 });
    assert.equal(p.price, 0);
    record('Upsert sanitizes negative price before validation and persists zero', { input: -123, persisted: JSON.parse(data.tt_products).find(x => x.id === catalog[0].id).price });
  }
  {
    const data = { tt_products: JSON.stringify(catalog), tt_catalog_meta: JSON.stringify(meta()) };
    const first = env(data); await first.api.initCatalog();
    const second = env(data); await second.api.initCatalog();
    assert.ok(first.writes.includes('tt_products') && second.writes.includes('tt_products'));
    record('Unchanged seed catalog is written on both fresh initializations', { firstWrites: first.writes, secondWrites: second.writes });
  }
  {
    const data = seeded(); const e = env(data); await e.api.initCatalog();
    const same = e.api.getProductsSync(false);
    // The export exposes the actual cache array and objects.
    same[0].price = -999;
    assert.equal(e.api.getProductByIdSync(same[0].id).price, -999);
    record('Public read API exposes mutable cached objects', { cachedPriceAfterExternalMutation: -999 });
  }
  console.log(`Observed ${observed} catalog defects; this is a reproduction probe, not acceptance.`);
}
run().catch(err => { console.error(err); process.exitCode = 1; });
