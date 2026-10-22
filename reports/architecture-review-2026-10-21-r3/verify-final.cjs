// Independent review. Product files are read-only; all data is synthetic in VM memory.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const out = __dirname;
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const results = { timestamp: new Date().toISOString(), node: process.version, suites: [], checks: [], browser: { apps: [], browsers: [], status: 'UNVERIFIED: CUA inventory has no connected surfaces' } };
const commands = [
  ['audit-r2', process.execPath, ['tests/test_audit_r2_verification.js']],
  ['regressions', process.execPath, ['tests/test_audit_regressions.js']],
  ['behavior', process.execPath, ['tests/test_behavior.js']],
  ['tabs', 'powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'test_tab_architecture.ps1']],
  ['static-simulation', 'powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'test_e2e_simulation.ps1']],
  ['diagnostic-probe', process.execPath, ['reports/architecture-review-2026-10-21-r2/probe-handover.cjs']]
];
// Import actual tool-run evidence; do not pretend historical logs were executed here.
const runnerEvidence = JSON.parse(fs.readFileSync(path.join(out, 'runner-evidence.json'), 'utf8'));
results.runnerEvidenceTimestamp = runnerEvidence.recordedAt;
results.suites = commands.map(([name, command, args]) => {
  const r = runnerEvidence.results.find(r => r.name === name);
  return { name, command: [command, ...args], exitCode: r?.exit_code ?? null, log: name + '.log' };
});
results.syntax = JSON.parse(runnerEvidence.results.find(r => r.name === 'syntax').output);
async function check(scope, name, fn) {
  try { const detail = await fn(); results.checks.push({ scope, name, status: 'PASS', detail }); }
  catch (e) { results.checks.push({ scope, name, status: 'FAIL', detail: e.message }); }
}
function harness(targetRoot) {
  const prefix = read('reports/architecture-review-2026-10-21-r2/probe-handover.cjs').split('async function main()')[0]
    .replace("const read = name => fs.readFileSync(path.join(root, name), 'utf8');", "const read = name => fs.readFileSync(path.join(TARGET_ROOT, name), 'utf8');");
  const context = { require, __dirname: path.join(root, 'reports/architecture-review-2026-10-21-r2'), TARGET_ROOT: targetRoot };
  vm.runInNewContext(prefix + '\nthis.h = {env, fill, open, valid, key};', context);
  return context.h;
}
function tracker(targetRoot, matches) {
  const src = fs.readFileSync(path.join(targetRoot, 'js/app.js'), 'utf8');
  const start = src.indexOf('  function initOrderTracker()');
  const end = src.indexOf('  function escapeHtmlApp', start);
  assert.ok(start >= 0 && end > start);
  const created = [], notices = []; let submit;
  function element() {
    const e = { children: [], value: '', classList: {add(){}, remove(){}}, appendChild(x){this.children.push(x);},
      addEventListener(){}, setAttribute(k,v){this[k]=v;}, removeAttribute(k){delete this[k];} };
    created.push(e); return e;
  }
  const nodes = { 'order-lookup-input': { value: 'TT3D-SYNTHETIC' }, 'order-lookup-results': element(),
    'order-lookup-form': { addEventListener(type, fn){submit=fn;} } };
  vm.runInNewContext(src.slice(start,end) + '\ninitOrderTracker();', {
    document: { getElementById: id => nodes[id], createElement: element },
    window: {TTStore:{getZaloPhone:()=>null},TTCheckout:{lookupOrder:()=>matches},showToast:s=>notices.push(s)},
    navigator: { clipboard: { writeText: async () => {} } }
  });
  submit({preventDefault(){}});
  return created;
}
async function main() {
  for (const scope of ['source', 'artifact']) {
    const targetRoot = scope === 'source' ? root : path.join(root, 'dist');
    const h = harness(targetRoot);
    await check(scope, 'quota failure reaches storage and retry retains ID with one draft', async()=>{
      const e=h.env();e.load('js/checkout.js');h.open(e);const id=e.win.TTCheckout.getCurrentContext().clientRequestId;
      e.fail=true;await e.win.TTCheckout.submitCheckout('zalo');
      assert.equal(e.writes.filter(k=>k===h.key).length,1);assert.equal(e.win.TTCheckout.getCurrentContext().state,'editing');assert.equal(e.clears,0);assert.ok(e.alerts.length);
      e.fail=false;await e.win.TTCheckout.submitCheckout('zalo');assert.equal(e.win.TTCheckout.getCurrentContext().clientRequestId,id);assert.equal(JSON.parse(e.data[h.key]).length,1);assert.equal(e.clears,0);
    });
    await check(scope, 'absent key accepts one draft', async()=>{
      const e=h.env();e.load('js/checkout.js');h.open(e);await e.win.TTCheckout.submitCheckout('zalo');assert.equal(JSON.parse(e.data[h.key]).length,1);
    });
    await check(scope, 'five corrupted storage forms preserved with zero writes', async()=>{
      for(const raw of ['', '   ', '{bad', '{}', 'null']){
        const e=h.env();e.load('js/checkout.js');e.data[h.key]=raw;h.open(e);await e.win.TTCheckout.submitCheckout('zalo');
        assert.equal(e.data[h.key],raw);assert.equal(e.writes.filter(k=>k===h.key).length,0);assert.equal(e.win.TTCheckout.getCurrentContext().state,'editing');assert.equal(e.clears,0);
      }
    });
    await check(scope, 'SecurityError read and write preserve context', async()=>{
      for(const method of ['getItem','setItem']){
        const e=h.env();e.load('js/checkout.js');h.open(e);const id=e.win.TTCheckout.getCurrentContext().clientRequestId;
        const original=e.win.localStorage[method];e.win.localStorage[method]=function(k,...args){if(k===h.key){const ex=new Error('Synthetic denied');ex.name='SecurityError';throw ex;}return original(k,...args);};
        await e.win.TTCheckout.submitCheckout('zalo');assert.equal(e.win.TTCheckout.getCurrentContext().state,'editing');assert.equal(e.win.TTCheckout.getCurrentContext().clientRequestId,id);assert.equal(e.clears,0);assert.ok(e.alerts.length);
      }
    });
    await check(scope, 'lookup exact match returns only eight approved fields', ()=>{
      const e=h.env();e.load('js/checkout.js');e.data[h.key]=JSON.stringify([h.valid()]);const rows=e.win.TTCheckout.lookupOrder(' tt3d-probe01 ');
      assert.equal(rows.length,1);assert.deepEqual(Object.keys(rows[0]).sort(),['clientRequestId','createdAt','statusText','channel','maskedPhone','items','estimatedTotalVnd','isFreeShipping'].sort());
      for(const q of ['PROBE01','0900000000','Synthetic Name'])assert.equal(e.win.TTCheckout.lookupOrder(q).length,0);
      assert.equal(JSON.stringify(rows).includes('SYNTHETIC_PRIVATE_ADDRESS'),false);
    });
    await check(scope, 'invalid schema fixtures rejected', ()=>{
      const mutations=[r=>r.items=[null],r=>r.customer.phone={},r=>r.items[0].qty='<img>',r=>r.totals.finalTotal='<img>',r=>r.channel={},r=>r.totals.subtotal='<img>'];
      for(const mutate of mutations){const e=h.env();e.load('js/checkout.js');const r=h.valid();mutate(r);e.data[h.key]=JSON.stringify([r]);assert.equal(e.win.TTCheckout.getDraftOrders().length,0);}
    });
    await check(scope, 'null resolver checkout does not invent recipient', async()=>{
      const e=h.env();e.load('js/checkout.js');e.recipient=null;h.open(e);await e.win.TTCheckout.submitCheckout('zalo');assert.equal(e.nodes.get('checkout-btn-open-zalo').href,'');assert.equal(typeof e.nodes.get('checkout-btn-copy-msg').onclick,'function');
    });
    await check(scope, 'null resolver tracker no-match branch has no recipient', ()=>{
      const nodes=tracker(targetRoot,[]);const links=nodes.filter(n=>n.href?.startsWith('https://zalo.me/'));assert.equal(links.length,0,'Unexpected recipient: '+links.map(n=>n.href.split('?')[0]).join(', '));
    });
    await check(scope, 'compatibility CAD function never adds priced cart row', ()=>{
      const e=h.env();e.load('js/calculator.js');e.win.addConfigQuoteToCart();assert.equal(e.cartAdds.length,0);assert.equal(e.nodes.get('config-total-price').textContent,'Xưởng báo giá theo file');
    });
    await check(scope, 'legacy CAD entries blocked in both cart and direct', ()=>{
      for(const source of ['cart','direct']){const e=h.env();e.load('js/checkout.js');e.win.TTCheckout.openCheckout([{id:'print-quote-synthetic',title:'Synthetic CAD',price:115000,qty:1}],0,{source});assert.equal(e.win.TTCheckout.getCurrentContext(),null);assert.ok(e.alerts.length);assert.equal(e.clears,0);}
    });
    await check(scope, 'CAD clipboard rejection exposes preview/manual copy and truthful status', async()=>{
      const e=h.env();e.load('js/calculator.js');const texts=[],toasts=[];let copied;
      e.win.navigator={clipboard:{writeText(text){copied=text;return Promise.reject(new Error('Synthetic clipboard denied'));}}};e.win.showToast=s=>toasts.push(s);
      e.win.sendZaloConfigQuote();await Promise.resolve();await Promise.resolve();
      for(const n of e.nodes.values())texts.push(n.textContent||'',n.value||'');
      assert.ok(copied);assert.ok(texts.some(t=>t.includes('YÊU CẦU BÁO GIÁ')),'No visible preview/manual copy containing composed CAD request; observed toast(s): '+JSON.stringify(toasts));
      assert.equal(toasts.some(t=>t.includes('và sao chép')),false,'Success toast after failed clipboard');
    });
    await check(scope, 'artifact/source HTML free of Tailwind Play CDN runtime', ()=>{
      for(const file of ['index.html','admin.html']){const s=fs.readFileSync(path.join(targetRoot,file),'utf8');assert.equal(/cdn\.tailwindcss\.com|tailwind\.config\s*=/.test(s),false,file+' still contains Play CDN runtime');}
    });
  }
  await check('artifact','SHA-256 manifest exactly covers all payload files',()=>{
    const dist=path.join(root,'dist');const manifest=JSON.parse(read('dist/artifact-manifest.json'));const entries=Object.entries(manifest.files);const all=[];
    function walk(d,prefix=''){for(const ent of fs.readdirSync(d,{withFileTypes:true})){const rel=prefix+ent.name;if(ent.isDirectory())walk(path.join(d,ent.name),rel+'/');else if(rel!=='artifact-manifest.json')all.push(rel);}}
    walk(dist);assert.deepEqual(all.sort(),entries.map(([k])=>k).sort());
    for(const [name,item]of entries){assert.equal(hash(path.join(dist,name)),item.sha256,name);assert.equal(fs.statSync(path.join(dist,name)).size,item.sizeBytes,name);}
    assert.equal(all.some(p=>/^(reports|tests|src|\.git)\//.test(p)),false);return {payloadFiles:entries.length,manifestExcludedFromSelfHash:true};
  });
  const lum = hex => hex.match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
  const ratio = (a,b) => (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  results.colorMath={scope:'Opaque color tokens only; not computed browser styles',charcoalOnOrange:ratio('0B0C0E','FF5C00'),charcoalOnHoverAndActive:ratio('0B0C0E','E05200'),darkOrangeOnLightCanvas:ratio('C44800','F8F9FA')};
  results.sourceSnapshot={};
  for(const p of ['index.html','admin.html','README.md','HANDOVER_R2.md','CODEX_BRIDGE.md','package.json','tailwind.config.ts','scripts/build-static-artifact.js','tests/test_audit_r2_verification.js','tests/test_audit_regressions.js','tests/test_behavior.js','test_tab_architecture.ps1','test_e2e_simulation.ps1','reports/architecture-review-2026-10-21-r2/probe-handover.cjs',...fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.js')).map(x=>'js/'+x),'css/style.css','dist/artifact-manifest.json'])results.sourceSnapshot[p]=hash(path.join(root,p));
  results.expectedExitCode=results.checks.some(c=>c.status==='FAIL')||results.suites.some(s=>s.exitCode!==0)||results.syntax.some(s=>s.exitCode!==0)?1:0;
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({suites:results.suites.map(({name,exitCode})=>({name,exitCode})),syntax:results.syntax.length,checks:results.checks.map(({scope,name,status,detail})=>({scope,name,status,detail}))},null,2));
  process.exitCode=results.expectedExitCode;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
