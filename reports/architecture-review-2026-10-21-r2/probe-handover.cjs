// Audit only: synthetic data, isolated Node VM, no browser or external requests.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const key = 'TT_DIRECT_ORDER_DRAFTS_V1';
function env() {
  const data = {}, nodes = new Map(), writes = [], alerts = [], cartAdds = [];
  const ready = [];
  function element() {
    return { value: '', checked: false, textContent: '', innerHTML: '', href: '',
      children: [], classList: { add() {}, remove() {}, contains() { return false; } },
      appendChild(x) { this.children.push(x); }, addEventListener() {}, focus() {}, select() {} };
  }
  let fail = false, recipient = '0900000000', clears = 0;
  const win = {
    console: { log() {}, warn() {}, error() {} },
    alert: message => alerts.push(message),
    document: { body: { style: {} }, createElement: element, querySelectorAll: () => [],
      addEventListener(type, fn) { if (type === 'DOMContentLoaded') ready.push(fn); },
      getElementById(id) { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); } },
    localStorage: { getItem: k => data[k] ?? null,
      setItem(k, v) { writes.push(k); if (fail && k === key) { const e = new Error('synthetic quota'); e.name = 'QuotaExceededError'; throw e; } data[k] = String(v); },
      removeItem: k => { delete data[k]; } },
    TTStore: { getZaloPhone: () => recipient, addToCart: item => cartAdds.push(item) },
    TTCart: { clearCart() { clears++; }, openCart() {} },
    setTimeout() {}, open(url) { win.lastOpenedUrl = url; },
    TT_CONFIG: { checkout: { zaloHandoffPhone: '0900000000' } }
  };
  win.window = win;
  return { win, data, nodes, writes, alerts, cartAdds, ready,
    load(file) { vm.runInNewContext(read(file), win, { filename: file }); },
    set fail(value) { fail = value; }, set recipient(value) { recipient = value; },
    get clears() { return clears; } };
}
function fill(e) {
  for (const [id, value] of Object.entries({ 'checkout-cust-name': 'Synthetic User',
    'checkout-cust-phone': '0900000000', 'checkout-cust-address': 'Synthetic Address' })) {
    e.win.document.getElementById(id).value = value;
  }
}
function open(e) {
  e.win.TTCheckout.openCheckout([{ id: 'p1', title: 'Synthetic Item', qty: 1, price: 100000 }], 0, { source: 'cart' });
  fill(e);
}
function valid() {
  return { clientRequestId: 'TT3D-PROBE01', createdAt: '2026-10-21T05:00:00.000Z', channel: 'zalo',
    customer: { name: 'Synthetic Name', phone: '0900000000', address: 'SYNTHETIC_PRIVATE_ADDRESS' },
    items: [{ title: 'Synthetic item', price: 100000, qty: 1 }], totals: { finalTotal: 125000 } };
}
async function main() {
  const findings = {};
  const e = env(); e.load('js/checkout.js'); open(e); e.fail = true;
  const beforeId = e.win.TTCheckout.getCurrentContext().clientRequestId;
  await e.win.TTCheckout.submitCheckout('zalo');
  findings.quota = { actualDraftWriteAttempts: e.writes.filter(k => k === key).length,
    state: e.win.TTCheckout.getCurrentContext().state, cartClearCalls: e.clears,
    draftSaved: key in e.data, alertCount: e.alerts.length };
  assert.equal(findings.quota.actualDraftWriteAttempts, 1);
  assert.equal(findings.quota.state, 'editing'); assert.equal(e.clears, 0);
  e.fail = false; await e.win.TTCheckout.submitCheckout('zalo');
  findings.retry = { idRetained: e.win.TTCheckout.getCurrentContext().clientRequestId === beforeId,
    recordCount: JSON.parse(e.data[key]).length, state: e.win.TTCheckout.getCurrentContext().state,
    cartClearCalls: e.clears, recipient: e.nodes.get('checkout-btn-open-zalo').href.split('?')[0] };
  assert.equal(findings.retry.idRetained, true); assert.equal(findings.retry.recordCount, 1);
  findings.corruptStore = [];
  for (const raw of ['{bad', '{}', 'null', '']) {
    const c = env(); c.load('js/checkout.js'); c.data[key] = raw; open(c);
    await c.win.TTCheckout.submitCheckout('zalo');
    findings.corruptStore.push({ raw, preserved: c.data[key] === raw,
      state: c.win.TTCheckout.getCurrentContext().state,
      writeAttempts: c.writes.filter(k => k === key).length });
  }
  const l = env(); l.load('js/checkout.js'); l.data[key] = JSON.stringify([valid()]);
  const projection = l.win.TTCheckout.lookupOrder(' tt3d-probe01 ')[0];
  findings.lookup = { exactTrimmed: !!projection, partial: l.win.TTCheckout.lookupOrder('PROBE01').length,
    phone: l.win.TTCheckout.lookupOrder('0900000000').length,
    keys: Object.keys(projection), maskedPhone: projection.maskedPhone,
    hasPrivateAddress: JSON.stringify(projection).includes('SYNTHETIC_PRIVATE_ADDRESS') };
  findings.invalidSchema = [];
  for (const [label, mutate] of [
    ['null item', r => r.items = [null]], ['object phone', r => r.customer.phone = {}],
    ['markup qty', r => r.items[0].qty = '<img src=x>'], ['markup total', r => r.totals.finalTotal = '<img src=x>'],
    ['object channel', r => r.channel = { value: 'unexpected' }],
    ['unsafe subtotal', r => r.totals.subtotal = '<img src=x>']
  ]) {
    const record = valid(); mutate(record); l.data[key] = JSON.stringify([record]);
    findings.invalidSchema.push({ label, acceptedCount: l.win.TTCheckout.getDraftOrders().length });
  }
  const n = env(); n.load('js/checkout.js'); n.recipient = null; open(n);
  await n.win.TTCheckout.submitCheckout('zalo');
  findings.nullResolverRecipient = n.nodes.get('checkout-btn-open-zalo').href.split('?')[0];
  const c = env(); c.load('js/calculator.js'); c.win.addConfigQuoteToCart();
  findings.syntheticQuoteInCart = c.cartAdds.map(i => ({ id: i.id, title: i.title, price: i.price, qty: i.qty,
    storageApi: 'TTStore.addToCart' }));
  findings.calculatorDisplayedTotal = c.nodes.get('config-total-price').textContent;
  const config = env(); config.load('js/config.js');
  config.data.TT_STUDIO_CONFIG = JSON.stringify({ checkout: { zaloHandoffPhone: '+84900000000' }, shopInfo: { zaloPhone: '0911111111' } });
  findings.resolverPriority = config.win.TTStore.getZaloPhone();
  const app = read('js/app.js');
  const start = app.indexOf('  function initOrderTracker()');
  const end = app.indexOf('  function escapeHtmlApp', start);
  assert.ok(start >= 0 && end > start);
  const sinks = [], texts = []; let submit;
  function sinkNode() {
    const el = { children: [], classList: { add() {}, remove() {} }, appendChild(x) { this.children.push(x); },
      addEventListener() {}, href: '', value: '' };
    Object.defineProperty(el, 'innerHTML', { set(v) { sinks.push(String(v)); } });
    Object.defineProperty(el, 'textContent', { set(v) { texts.push(String(v)); } });
    return el;
  }
  const trackerNodes = { 'order-lookup-input': { value: 'TT3D-X' }, 'order-lookup-results': sinkNode(),
    'order-lookup-form': { addEventListener(type, fn) { submit = fn; } } };
  const sentinel = '<img src=x onerror="synthetic">';
  vm.runInNewContext(app.slice(start, end) + '\ninitOrderTracker();', {
    document: { getElementById: id => trackerNodes[id], createElement: sinkNode },
    window: { TTStore: { getZaloPhone: () => '0900000000' }, TTCheckout: { lookupOrder: () => [{
      clientRequestId: sentinel, createdAt: '2026-10-21T05:00:00Z', statusText: 'Draft', customerName: sentinel,
      maskedPhone: '090***000', channel: 'zalo', estimatedTotalVnd: 125000,
      items: [{ title: sentinel, price: 100000, qty: sentinel }]
    }] } }
  });
  submit({ preventDefault() {} });
  findings.trackerSink = { markupInInnerHTML: sinks.some(v => v.includes(sentinel)),
    markupInTextContent: texts.some(v => v.includes(sentinel)), scope: 'isolated controller; no browser payload execution' };
  function lum(hex) { const rgb = hex.match(/../g).map(x => parseInt(x, 16) / 255)
    .map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]; }
  findings.contrast = { whiteOnOrange: (lum('FFFFFF') + .05) / (lum('FF5C00') + .05),
    charcoalOnOrange: (lum('FF5C00') + .05) / (lum('0B0C0E') + .05),
    charcoalOnHover: (lum('E05200') + .05) / (lum('0B0C0E') + .05),
    charcoalOnActive: (lum('C44800') + .05) / (lum('0B0C0E') + .05),
    orangeOnLightCanvas: (lum('F8F9FA') + .05) / (lum('FF5C00') + .05) };
  console.log(JSON.stringify({ scope: 'read-only product audit; isolated VM; synthetic data; no network', findings }, null, 2));
}
main().catch(e => { console.error(e); process.exitCode = 1; });
