// Review-only acceptance probes: synthetic VM, HTML-derived IDs, no network.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const checks = [];
async function check(scope, name, fn) {
  try { const detail = await fn(); checks.push({scope, name, status:'PASS', detail}); }
  catch (e) { checks.push({scope, name, status:'FAIL', detail:e.message}); }
}
function setup(base, mode = 'reject', recipient = '0900000000') {
  const html = fs.readFileSync(path.join(base,'index.html'),'utf8');
  const nodes = new Map();
  for (const m of html.matchAll(/<([a-z][\w-]*)\b[^>]*\bid="([^"]+)"[^>]*>/gi)) {
    nodes.set(m[2], { tagName:m[1].toUpperCase(), value:'', textContent:'', href:'',
      classList:{add(){},remove(){},contains(){return false;}}, addEventListener(){},
      focus(){},select(){},setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];} });
  }
  const messages=[], toasts=[], opens=[], cartAdds=[];
  const win = {document:{getElementById:id=>nodes.get(id)||null, querySelectorAll:()=>[], addEventListener(){}},
    TTStore:{getZaloPhone:()=>recipient,addToCart:r=>cartAdds.push(r)},
    showToast:s=>toasts.push(s), alert:s=>toasts.push(s),
    open:(...args)=>{opens.push(args);return null;}, console};
  if(mode!=='absent') win.navigator={clipboard:{writeText:async s=>{messages.push(s);if(mode==='reject')throw new Error('Synthetic denied');}}};
  win.window=win;
  vm.runInNewContext(fs.readFileSync(path.join(base,'js/calculator.js'),'utf8'),win);
  nodes.get('config-custom-notes').value='SYNTHETIC_NOTES_KEEP';
  return {win,nodes,messages,toasts,opens,cartAdds,html};
}
async function main(){
  async function prepareAndCopy(e){
    await (e.win.prepareCadQuoteRequest || e.win.sendZaloConfigQuote)();
    if(typeof e.win.copyCadQuoteRequest==='function') await e.win.copyCadQuoteRequest();
  }
  for(const scope of ['source','artifact']){
    const base=scope==='source'?root:path.join(root,'dist');
    await check(scope,'Dedicated readonly textarea exists in actual HTML',()=>{
      const e=setup(base);assert.ok(/<textarea\b(?=[^>]*\bid="config-quote-preview")(?=[^>]*\breadonly)[^>]*>/i.test(e.html),'No dedicated readonly preview textarea in actual HTML');
    });
    await check(scope,'Clipboard rejection preserves original notes',async()=>{
      const e=setup(base);await prepareAndCopy(e);
      assert.equal(e.nodes.get('config-custom-notes').value,'SYNTHETIC_NOTES_KEEP');
    });
    await check(scope,'Repeated preparation does not nest prior generated request',async()=>{
      const e=setup(base);await prepareAndCopy(e);await prepareAndCopy(e);
      const count=(e.messages[1].match(/YÊU CẦU BÁO GIÁ/g)||[]).length;
      assert.equal(count,1,`Second request contains ${count} generated headings`);
    });
    await check(scope,'Clipboard rejection explicitly offers manual copy',async()=>{
      const e=setup(base);await prepareAndCopy(e);
      assert.ok(e.toasts.some(s=>/sao chép thủ công|chưa sao chép tự động/i.test(s)),'No explicit manual-copy notice');
    });
    await check(scope,'Preparing request does not auto-open Zalo after awaiting clipboard',async()=>{
      const e=setup(base,'success');await prepareAndCopy(e);
      assert.equal(e.opens.length,0,'Open was called by combined prepare/copy handler');
    });
    await check(scope,'No opened-success assertion when open returns no handle',async()=>{
      const e=setup(base,'reject');await prepareAndCopy(e);
      assert.equal(e.toasts.some(s=>/đã mở Zalo/i.test(s)),false,'Unconditional opened-success toast; null is ambiguous with noopener');
    });
    await check(scope,'Null resolver prevents CAD external navigation',async()=>{
      const e=setup(base,'absent',null);await prepareAndCopy(e);assert.equal(e.opens.length,0);
    });
    await check(scope,'Compatibility CAD action never adds priced cart item',()=>{
      const e=setup(base);e.win.addConfigQuoteToCart();assert.equal(e.cartAdds.length,0);
    });
    await check(scope,'Public HTML has no hardcoded shop Zalo recipient',()=>{
      const e=setup(base);const urls=[...e.html.matchAll(/href="https:\/\/zalo\.me\/\d+[^" ]*"/g)];
      assert.equal(urls.length,0,`Found ${urls.length} fixed shop recipient URLs; no global binder found in app.js/config.js during review`);
    });
  }
  const manifest=fs.readFileSync(path.join(root,'dist/artifact-manifest.json'));
  const output={recordedAt:new Date().toISOString(),scope:'HTML-derived DOM simulation, not browser E2E; no actual popup/clipboard exercised',
    manifestSha256:require('node:crypto').createHash('sha256').update(manifest).digest('hex'),checks};
  fs.writeFileSync(path.join(__dirname,'r4-findings.json'),JSON.stringify(output,null,2));
  console.log(JSON.stringify({summary:{pass:checks.filter(c=>c.status==='PASS').length,fail:checks.filter(c=>c.status==='FAIL').length},checks:checks.map(c=>({...c,detail:c.detail?.length>240?c.detail.slice(0,240):c.detail}))},null,2));
  process.exitCode=checks.some(c=>c.status==='FAIL')?1:0;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
