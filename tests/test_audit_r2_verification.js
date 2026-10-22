/**
 * T&T 3D Labs - Audit R2 Correct Behavior Verification Suite
 * Verifies the 5 catalog defects and 3 importer points identified in Codex R2 audit.
 */
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const catalogSource = fs.readFileSync(path.join(root, 'js/catalog-store.js'), 'utf8');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'products.json'), 'utf8'));
const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/category-registry.json'), 'utf8'));
const meta = () => ({ schemaVersion: 5, catalogRevision: 'mw-55-v2', tombstones: [] });

function env(data) {
  const writes = [];
  const w = {
    console: { log() {}, warn() {}, error() {} },
    TTCategoryRegistry: registry,
    localStorage: {
      getItem: k => data[k] ?? null,
      setItem(k, v) { writes.push(k); data[k] = String(v); },
      removeItem(k) { delete data[k]; }
    },
    fetch: async () => ({ ok: true, json: async () => catalog }),
    addEventListener() {},
    dispatchEvent() {},
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } }
  };
  w.window = w;
  vm.createContext(w);
  vm.runInContext(catalogSource, w);
  return { w, api: w.TTCatalogStore, data, writes };
}

function seeded() {
  return {
    tt_products: JSON.stringify(catalog.slice(0, 2)),
    tt_catalog_meta: JSON.stringify(meta())
  };
}

async function run() {
  console.log('--- RUNNING AUDIT R2 CORRECT BEHAVIOR SUITE ---');

  // Test 1: Crash before list write does NOT mark tombstone
  {
    const data = seeded();
    const target = { ...meta(), tombstones: [catalog[0].id] };
    data.tt_catalog_pending_commit = JSON.stringify({
      txId: 'crash-before-list',
      version: 1,
      beforeLength: 2,
      afterLength: 1,
      targetMetadata: target
    });
    const e = env(data);
    await e.api.initCatalog();
    const present = e.api.getProductsSync(false).some(p => p.id === catalog[0].id);
    const metaObj = JSON.parse(data.tt_catalog_meta);
    const tombstone = metaObj.tombstones.includes(catalog[0].id);
    assert.strictEqual(present, true, 'Product must still be present');
    assert.strictEqual(tombstone, false, 'Tombstone must NOT be applied when list write never occurred');
    assert.strictEqual(data.tt_catalog_pending_commit, undefined, 'Uncommitted journal should be discarded');
    console.log('[PASS] Test 1: Recovery correctly discards uncommitted journal when list was not written');
  }

  // Test 2: Second delete with list failure preserves first tombstone (either committed or pending)
  {
    const data = seeded();
    const e = env(data);
    await e.api.initCatalog();
    const originalSet = e.w.localStorage.setItem;

    // Fail metadata on first delete
    e.w.localStorage.setItem = (k, v) => {
      if (k === 'tt_catalog_meta') throw new Error('injected metadata failure');
      originalSet(k, v);
    };
    const a = await e.api.deleteProduct(catalog[0].id);
    assert.strictEqual(a.productsCommitted, true);
    assert.strictEqual(a.metadataPending, true);

    // Fail list on second delete
    e.w.localStorage.setItem = (k, v) => {
      if (k === 'tt_products') throw new Error('injected list failure');
      originalSet(k, v);
    };
    const b = await e.api.deleteProduct(catalog[1].id);
    assert.strictEqual(b.productsCommitted, false);

    // Tombstone of A must be preserved either in metadata or in pending journal
    const parsedMeta = JSON.parse(data.tt_catalog_meta || '{}');
    const hasTombstoneInMeta = parsedMeta.tombstones && parsedMeta.tombstones.includes(catalog[0].id);
    const hasTombstoneInJournal = data.tt_catalog_pending_commit && JSON.parse(data.tt_catalog_pending_commit).targetMetadata?.tombstones?.includes(catalog[0].id);
    assert.ok(hasTombstoneInMeta || hasTombstoneInJournal, 'Deleted product A must not lose its tombstone');

    // Simulate next revision: deleted A must NOT be resurrected!
    data.tt_catalog_meta = JSON.stringify({ ...parsedMeta, catalogRevision: 'previous-revision' });
    const next = env(data);
    await next.api.initCatalog();
    const resurrected = next.api.getProductsSync(false).some(p => p.id === catalog[0].id);
    assert.strictEqual(resurrected, false, 'Deleted product A must NOT be resurrected on new revision');
    console.log('[PASS] Test 2: Failed second mutation preserves first tombstone and prevents resurrection');
  }

  // Test 3: Upsert with negative price is rejected with error
  {
    const data = seeded();
    const e = env(data);
    await e.api.initCatalog();
    await assert.rejects(
      async () => {
        await e.api.upsertProduct({ id: catalog[0].id, price: -123 });
      },
      /Giá sản phẩm không được là số âm/,
      'Upsert must reject negative price'
    );
    console.log('[PASS] Test 3: Upsert rejects negative price without persisting 0');
  }

  // Test 4: Idempotent initialization produces no extra writes
  {
    const data = {
      tt_products: JSON.stringify(catalog),
      tt_catalog_meta: JSON.stringify(meta())
    };
    const first = env(data);
    await first.api.initCatalog();
    const second = env(data);
    await second.api.initCatalog();
    assert.strictEqual(second.writes.length, 0, 'Second initialization must make 0 writes to localStorage');
    console.log('[PASS] Test 4: Unchanged catalog produces 0 writes on subsequent initialization');
  }

  // Test 5: Public read API returns immutable clones
  {
    const data = seeded();
    const e = env(data);
    await e.api.initCatalog();
    const products = e.api.getProductsSync(false);
    const originalPrice = products[0].price;
    products[0].price = -999;
    const freshFetch = e.api.getProductByIdSync(products[0].id);
    assert.strictEqual(freshFetch.price, originalPrice, 'Cache must not be mutated by modifying returned object');
    console.log('[PASS] Test 5: Internal cache is immutable against external mutations');
  }

  console.log('\n--- ALL AUDIT R2 CORRECT BEHAVIOR TESTS PASSED (5/5) ---');
}

run().catch(err => {
  console.error('Audit R2 verification failed:', err);
  process.exit(1);
});
