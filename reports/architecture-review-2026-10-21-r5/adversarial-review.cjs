// Review only: synthetic VM and confined build fixtures; no product writes/network/UI.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const sha = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const findings = [];
function record(scope, id, actual, expected, detail) {
  findings.push({ scope, id, status: actual === expected ? 'PASS' : 'FAIL', actual, expected, detail });
}
function node() {
  return { value: '', textContent: '', children: [], href: '',
    classList: { add(){}, remove(){}, contains(){return false;} },
    setAttribute(k,v){this[k]=v;}, removeAttribute(k){delete this[k];},
    addEventListener(){}, focus(){}, select(){}, appendChild(n){this.children.push(n);} };
}
for (const scope of ['source','artifact']) {
  const base = scope === 'source' ? root : path.join(root,'dist');
  const code = p => fs.readFileSync(path.join(base,p),'utf8');
  const nodes = new Map();
  const listeners = {};
  const links = [node(),node()];
  const storage = {};
  const w = { console, document: {getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},
    querySelectorAll: s => s === '[data-zalo-contact="true"]' ? links : [], addEventListener(){}},
    localStorage: {getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v},
    CustomEvent: class {constructor(type,opts){this.type=type;this.detail=opts?.detail;}},
    addEventListener(type,fn){(listeners[type]??=[]).push(fn);},
    dispatchEvent(e){for(const fn of listeners[e.type]||[])fn(e);}, showToast(){} };
  w.window=w;
  vm.createContext(w);
  vm.runInContext(code('js/config.js'), w);
  vm.runInContext(code('js/app.js'), w);
  vm.runInContext(code('js/calculator.js'), w);
  const cfg = { checkout:{zaloHandoffPhone:'0900000000'},shopInfo:{} };
  w.TTStore.saveConfig(cfg);
  w.bindAllShopZaloLinks();
  w.prepareCadQuoteRequest();
  w.TTStore.saveConfig({checkout:{},shopInfo:{}});
  record(scope,'same-tab config removal disables existing shop links',!!links[0].href,false,
    {event:'tt_config_updated',registeredHandlers:(listeners.tt_config_updated||[]).length});
  record(scope,'config removal disables prepared CAD link',!!nodes.get('config-quote-open-zalo').href,false,
    'Prepared CAD link must follow current resolver without dropping preview text.');
  w.bindAllShopZaloLinks();
  record(scope,'manual global rebind disables shop links',!!links[0].href,false);
  const note='SYNTHETIC: khắc chữ YÊU CẦU BÁO GIÁ IN 3D trên bảng';
  nodes.get('config-custom-notes').value=note;
  w.prepareCadQuoteRequest();
  record(scope,'legitimate note containing request heading survives in message',nodes.get('config-quote-preview').value.includes(note),true,
    {inputPreserved:nodes.get('config-custom-notes').value===note});

  // Inject only a renderer-construction failure; this does not emulate a real browser.
  const ready=[];
  const canvas={parentElement:{clientWidth:800,clientHeight:500}};
  const v={console,document:{addEventListener:(t,fn)=>{if(t==='DOMContentLoaded')ready.push(fn);},
    getElementById:id=>id==='viewer-canvas'?canvas:null,body:{classList:{contains:()=>false}}},
    addEventListener(){}, THREE:{Scene:class{},Color:class{},
      PerspectiveCamera:class{constructor(){this.position={set(){}};}},
      WebGLRenderer:class{constructor(){throw new Error('SYNTHETIC_WEBGL_UNAVAILABLE');}}}};
  v.window=v;
  vm.runInNewContext(code('js/viewer3d.js'),v);
  let uncaught=null;
  try {for(const fn of ready)fn();} catch(e){uncaught=e.message;}
  record(scope,'WebGL init failure contained by viewer',uncaught,null,
    'No browser exercised. Production DOMContentLoaded handler propagates renderer exception.');
}

// Builder failure cases use real confined fixture FS and a fake successful CSS compiler.
// They verify preflight/copy transaction behavior, not a complete Tailwind build.
const builder=read('scripts/build-static-artifact.js');
const required = [...builder.match(/const REQUIRED_PREFLIGHT_FILES = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
const runtime = [...new Set([...read('index.html').matchAll(/<script\b[^>]*src="(js\/[^"?]+)(?:\?[^" ]*)?"/g),
  ...read('admin.html').matchAll(/<script\b[^>]*src="(js\/[^"?]+)(?:\?[^" ]*)?"/g)].map(m=>m[1]))];
record('build','every referenced runtime JS is preflighted',runtime.every(p=>required.includes(p)),true,
  {unprotected:runtime.filter(p=>!required.includes(p))});
const fixtureBase=fs.mkdtempSync(path.join(__dirname,'build-fixtures-'));
function buildFixture(name,{missingRuntime=false,copyFail=false}={}) {
  const fixture=path.join(fixtureBase,name);
  function put(rel,value='fixture') {const p=path.join(fixture,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,value);}
  for(const f of [...new Set([...required,...runtime])])if(!(missingRuntime&&f==='js/products-manager.js'))put(f);
  put('node_modules/tailwindcss/lib/cli.js');put('assets/fixture.txt');put('dist/known-good.txt','KNOWN_GOOD');
  const fakeFs=Object.create(fs);
  if(copyFail)fakeFs.copyFileSync=(src,dst)=>{if(src.endsWith('fixture.txt'))throw new Error('SYNTHETIC_COPY_FAILURE');return fs.copyFileSync(src,dst);};
  const logs=[];
  const p={execPath:process.execPath,exit(n){const e=new Error('EXIT');e.exitCode=n;throw e;}};
  let exit=0,error=null;
  try {vm.runInNewContext(builder,{__dirname:path.join(fixture,'scripts'),
    require:n=>n==='fs'?fakeFs:n==='child_process'?{execFileSync(){put('css/tailwind.css','/* FAKE COMPILED CSS */');}}:require(n),
    process:p,console:{log:(...a)=>logs.push(a.join(' ')),error:(...a)=>logs.push(a.join(' ')),warn(){}}});}
  catch(e){exit=e.exitCode??1;error=e.message;}
  return {exit,error,knownGoodPreserved:fs.existsSync(path.join(fixture,'dist/known-good.txt')),
    missingRuntimePublished:!fs.existsSync(path.join(fixture,'dist/js/products-manager.js')),
    manifestExists:fs.existsSync(path.join(fixture,'dist/artifact-manifest.json')),logs};
}
const missing=buildFixture('missing-runtime',{missingRuntime:true});
record('build','missing products-manager runtime fails before replacing dist',missing.exit!==0&&missing.knownGoodPreserved,true,missing);
const failed=buildFixture('copy-failure',{copyFail:true});
record('build','copy failure preserves known-good dist',failed.knownGoodPreserved,true,failed);
const output={recordedAt:new Date().toISOString(),scope:'Synthetic VM and fixture build control flow; not browser E2E or real compiler execution',
  manifestSha256:sha(path.join(root,'dist/artifact-manifest.json')),findings};
fs.writeFileSync(path.join(__dirname,'adversarial-findings.json'),JSON.stringify(output,null,2));
console.log(JSON.stringify(output,null,2));
process.exitCode=findings.some(f=>f.status==='FAIL')?1:0;
