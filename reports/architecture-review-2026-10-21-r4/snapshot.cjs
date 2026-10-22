const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const files={};
function add(rel){const b=fs.readFileSync(path.join(root,rel));files[rel]={sha256:hash(b),sizeBytes:b.length};}
for(const rel of ['CODEX_BRIDGE.md','HANDOVER_R3.md','README.md','index.html','admin.html','package.json','tailwind.static.config.cjs','scripts/build-static-artifact.js','css/tailwind.css','css/style.css','css/admin.css','dist/artifact-manifest.json'])add(rel);
for(const dir of ['js','dist/js','tests'])for(const name of fs.readdirSync(path.join(root,dir)))if(/\.(js|cjs)$/.test(name))add(dir+'/'+name);
const m=JSON.parse(fs.readFileSync(path.join(root,'dist/artifact-manifest.json')));
const sourceDrift=[];
for(const [rel,item]of Object.entries(m.files)){
  const source=path.join(root,rel);if(!fs.existsSync(source)||hash(fs.readFileSync(source))!==item.sha256)sourceDrift.push(rel);
}
const config=fs.readFileSync(path.join(root,'js/config.js'),'utf8');
const output={recordedAt:new Date().toISOString(),node:process.version,manifestSha256:files['dist/artifact-manifest.json'].sha256,
  payloadFiles:Object.keys(m.files).length,sourceArtifactDrift:sourceDrift,
  lockfiles:{rootPackageLock:fs.existsSync(path.join(root,'package-lock.json')),rootNpmShrinkwrap:fs.existsSync(path.join(root,'npm-shrinkwrap.json')),staticToolingLock:fs.existsSync(path.join(root,'tooling/static/package-lock.json'))},
  tailwindInstalled:JSON.parse(fs.readFileSync(path.join(root,'node_modules/tailwindcss/package.json'))).version,
  declaredTailwind:JSON.parse(fs.readFileSync(path.join(root,'package.json'))).devDependencies.tailwindcss,
  bundledDemoData:{sampleOrderBlock:config.includes('sampleOrders:'),containsNfcPasswordField:/nfcData:.*\bpass:/.test(config),scope:'Field presence only. Data authenticity unknown; values intentionally omitted.'},
  browser:{apps:[],browsers:[],status:'UNVERIFIED: live cua.getState returned no surfaces during this review'},files};
fs.writeFileSync(path.join(__dirname,'snapshot.json'),JSON.stringify(output,null,2));
console.log(JSON.stringify({manifestSha256:output.manifestSha256,payloadFiles:output.payloadFiles,sourceArtifactDrift:sourceDrift,lockfiles:output.lockfiles,tailwindInstalled:output.tailwindInstalled,declaredTailwind:output.declaredTailwind,bundledDemoData:output.bundledDemoData},null,2));
