// Diagnostic only: run the unmodified behavior assertions with a missing VM timer supplied.
// This result never replaces the original failing test command.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const target=path.join(root,'tests/test_behavior.js');
const timerQueue=[];
const mockVm={...vm,createContext(context,...args){
  context.setTimeout=(fn,delay)=>{timerQueue.push({fn,delay});return timerQueue.length;};
  context.clearTimeout=()=>{};
  return vm.createContext(context,...args);
}};
const lines=[];
let exitCode=0;
const source=fs.readFileSync(target,'utf8').replace(/runTests\(\);\s*$/,'runTests();');
const pending=vm.runInNewContext(source,{__dirname:path.join(root,'tests'),URLSearchParams,
  require:name=>name==='vm'?mockVm:require(name),
  process:{exit:code=>{exitCode=code;}},
  console:{log:(...a)=>lines.push(a.join(' ')),error:(...a)=>lines.push(a.join(' '))}});
Promise.resolve(pending).then(()=>{
  const result={recordedAt:new Date().toISOString(),scope:'Diagnostic: assertions unchanged; adds queued setTimeout/clearTimeout to mock browser only. Focus callbacks are not executed; not browser acceptance.',
    exitCode,queuedTimers:timerQueue.length,output:lines.join('\n')};
  fs.writeFileSync(path.join(__dirname,'fixture-diagnostic.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));process.exitCode=exitCode;
}).catch(e=>{console.error(e);process.exitCode=1;});
