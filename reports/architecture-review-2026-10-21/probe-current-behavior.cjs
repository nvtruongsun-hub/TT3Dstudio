// Read-only audit probes. Observed findings are defects, not release acceptance.
// Uses synthetic data and isolated Node VM DOM stubs; does not execute a browser.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const checkoutSource = fs.readFileSync(path.join(root, 'js/checkout.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const findings = {};

function element() {
  return {
    value: '', checked: false, textContent: '', innerHTML: '', href: '',
    classList: { add() {}, remove() {} },
    appendChild() {}, addEventListener() {}, focus() {}, select() {}
  };
}

function checkoutEnvironment({ failWrites = false } = {}) {
  const storage = {};
  const nodes = new Map();
  let clears = 0;
  const win = {
    console: { warn() {}, log() {}, error() {} },
    document: {
      body: { style: {} }, addEventListener() {}, createElement: element,
      getElementById(id) {
        if (!nodes.has(id)) nodes.set(id, element());
        return nodes.get(id);
      }
    },
    localStorage: {
      getItem: key => storage[key] ?? null,
      setItem(key, value) {
        if (failWrites) throw new Error('Synthetic QuotaExceededError');
        storage[key] = String(value);
      },
      removeItem: key => { delete storage[key]; }
    },
    TT_CONFIG: {
      shopInfo: { hotline: '0900.000.000', zaloPhone: '0900000000' },
      checkout: { mode: 'manual', orderEndpoint: null, zaloHandoffPhone: '0900000000' }
    },
    TTCart: { clearCart() { clears++; } }
  };
  win.window = win;
  vm.runInNewContext(checkoutSource, win);
  return { win, storage, nodes, get clears() { return clears; } };
}

function trackerEnvironment(order) {
  const start = appSource.indexOf('  function initOrderTracker()');
  const end = appSource.indexOf('  function escapeHtmlApp', start);
  assert.ok(start >= 0 && end > start, 'Tracker controller must be locatable');
  const sinks = [];
  let submit;
  function sinkElement() {
    const el = element();
    Object.defineProperty(el, 'innerHTML', { set: html => sinks.push(String(html)) });
    return el;
  }
  const nodes = {
    'order-lookup-form': { addEventListener(type, fn) { if (type === 'submit') submit = fn; } },
    'order-lookup-input': { value: 'TT3D-TEST01' },
    'order-lookup-results': sinkElement()
  };
  const env = {
    document: { getElementById: id => nodes[id], createElement: sinkElement },
    window: { TTCheckout: { lookupOrder: () => [order] } },
    escapeHtmlApp(value) {
      return String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[ch]));
    }
  };
  vm.runInNewContext(appSource.slice(start, end) + '\ninitOrderTracker();', env);
  return { sinks, submit: () => submit({ preventDefault() {} }) };
}

async function main() {
  const order = {
    clientRequestId: 'TT3D-TEST01', status: 'handoff_ready',
    customer: { name: 'Synthetic Customer', phone: '0900001234', address: 'SYNTHETIC_PRIVATE_ADDRESS' },
    items: [{ title: 'Synthetic item', price: 1000, qty: 1 }],
    totals: { finalTotal: 1000 }
  };
  const e = checkoutEnvironment();
  e.storage.TT_DIRECT_ORDER_DRAFTS_V1 = JSON.stringify([order]);
  findings.partialPhoneMatches = e.win.TTCheckout.lookupOrder('1234').length;
  findings.customerNameMatches = e.win.TTCheckout.lookupOrder('Synthetic Customer').length;
  findings.lookupReturnsRawAddress = e.win.TTCheckout.lookupOrder('TT3D-TEST01')[0].customer.address === order.customer.address;

  const injected = JSON.parse(JSON.stringify(order));
  injected.totals.finalTotal = '<img src=x onerror=alert(111)>';
  injected.items[0].qty = '<img src=x onerror=alert(222)>';
  const tracker = trackerEnvironment(injected);
  tracker.submit();
  findings.totalMarkupReachesInnerHTML = tracker.sinks.some(html => html.includes('<img src=x onerror=alert(111)>'));
  findings.quantityMarkupReachesInnerHTML = tracker.sinks.some(html => html.includes('<img src=x onerror=alert(222)>'));
  findings.handoffReadyShownAsProducing = tracker.sinks.some(html => html.includes('Đang Gia Công'));

  for (const [name, mutate] of [
    ['nullItemError', row => { row.items = [null]; }],
    ['objectPhoneError', row => { row.customer.phone = { length: 10 }; }]
  ]) {
    const row = JSON.parse(JSON.stringify(order));
    mutate(row);
    try { trackerEnvironment(row).submit(); findings[name] = null; }
    catch (error) { findings[name] = error.name + ': ' + error.message; }
  }

  const failedSave = checkoutEnvironment({ failWrites: true });
  failedSave.win.TTCheckout.openCheckout([{ id: 'probe', title: 'Synthetic item', price: 1000, qty: 1 }], 0, { source: 'cart' });
  failedSave.win.document.getElementById('checkout-cust-name').value = 'Synthetic Customer';
  failedSave.win.document.getElementById('checkout-cust-phone').value = '0900000000';
  failedSave.win.document.getElementById('checkout-cust-address').value = 'Synthetic Address';
  await failedSave.win.TTCheckout.submitCheckout('cod');
  findings.failedSaveDraftCount = Object.keys(failedSave.storage).length;
  findings.failedSaveContextState = failedSave.win.TTCheckout.getCurrentContext().state;
  findings.failedSaveCartClears = failedSave.clears;
  findings.generatedZaloRecipient = failedSave.nodes.get('checkout-btn-open-zalo').href.split('?')[0];
  findings.expectedSyntheticZaloRecipient = 'https://zalo.me/0900000000';

  function luminance(hex) {
    const c = hex.match(/../g).map(part => parseInt(part, 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
  }
  findings.whiteOnOrangeContrast = Number(((luminance('FFFFFF') + 0.05) / (luminance('FF5C00') + 0.05)).toFixed(2));
  findings.charcoalOnOrangeContrast = Number(((luminance('FF5C00') + 0.05) / (luminance('0B0C0E') + 0.05)).toFixed(2));
  console.log(JSON.stringify({ scope: 'isolated VM; no browser execution or external messages', findings }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
