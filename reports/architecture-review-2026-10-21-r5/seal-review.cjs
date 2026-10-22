const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const doc=fs.readFileSync(path.join(__dirname,'ARCHITECTURE_DIRECTIVE_R5.md'),'utf8');
const verification=JSON.parse(fs.readFileSync(path.join(__dirname,'verification.json')));
const changes=Object.entries(verification.sourceSnapshot).filter(([p,h])=>hash(path.join(root,p))!==h).map(([p])=>p);
const brokenLinks=[...doc.matchAll(/\]\(([^)]+)\)/g)].map(m=>m[1]).filter(p=>!/^https?:/.test(p)&&!fs.existsSync(path.resolve(__dirname,p)));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'dist/artifact-manifest.json')));
const drift=Object.entries(manifest.files).filter(([p,f])=>hash(path.join(root,'dist',p))!==f.sha256||hash(path.join(root,p))!==f.sha256).map(([p])=>p);
const result={recordedAt:new Date().toISOString(),decision:'APPROVED FOR COMPLETION — NOT READY FOR HANDOVER',
  directive:'ARCHITECTURE_DIRECTIVE_R5.md',directiveSha256:hash(path.join(__dirname,'ARCHITECTURE_DIRECTIVE_R5.md')),
  directiveLines:doc.split('\n').length,brokenLinks,productSnapshotChangesDuringReview:changes,
  manifestSha256:hash(path.join(root,'dist/artifact-manifest.json')),payloadFiles:Object.keys(manifest.files).length,payloadDrift:drift,
  r4:{'R4-01':'PARTIAL_OPEN','R4-02':'PARTIAL_OPEN','R4-03':'PARTIAL_OPEN','R4-04':'UNVERIFIED_OPEN','R4-05':'SEED_PASS_DOSSIER_OPEN'},
  browser:{inventory:{apps:[],browsers:[]},hiddenIabAttempt:'Browser is not available: iab',
    cases:Object.fromEntries(Array.from({length:10},(_,i)=>['B'+String(i+1).padStart(2,'0'),i===9?'STATIC_INTEGRITY_PASS_BROWSER_BINDING_UNVERIFIED':'BROWSER_UNVERIFIED']))},
  verification:{baselinePass:69,baselineTotal:71,r4ProbePass:18,r4ProbeTotal:18,
    inheritedChecksPass:verification.checks.filter(c=>c.status==='PASS').length,inheritedVerifierExpectedExitCode:verification.expectedExitCode,
    syntaxPass:verification.syntax.filter(s=>s.exitCode===0).length,syntaxTotal:verification.syntax.length},
  evidenceHashes:{}};
for(const name of fs.readdirSync(__dirname))if(/\.(cjs|json|log|md)$/.test(name)&&name!=='decision.json')result.evidenceHashes[name]=hash(path.join(__dirname,name));
fs.writeFileSync(path.join(__dirname,'decision.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({directiveLines:result.directiveLines,brokenLinks,productSnapshotChangesDuringReview:changes,payloadDrift:drift,
  manifestSha256:result.manifestSha256,verification:result.verification},null,2));
process.exitCode=brokenLinks.length||changes.length||drift.length?1:0;
