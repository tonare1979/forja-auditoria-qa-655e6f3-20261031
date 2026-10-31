'use strict';
// Explicit local-only suite list. Do not replace with tests/*: other suites access remote services.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const out=fs.mkdtempSync(path.join(os.tmpdir(),'forja-organizacao-scout-'));
const names=['screen-organization.cjs','integral-profile.cjs','profile-weight-real.mjs','qa-json.cjs','test-compat-cumulative.mjs','test-sat-sun-alternatives.cjs','test-partial-real.cjs','save-real.cjs','alternative-switch-restore.mjs','qa-weekend-cloud-sync.mjs','forja-music-weekend-ui.mjs','scout-analytics-v1.mjs','scout-forja-adapter.mjs','scout-progress-ui.mjs','scout-progress-edge-cases.mjs','scout-progress-daily.mjs','scout-session-feedback.mjs'];
const results=[];
for(const name of names){
 const run=spawnSync(process.execPath,['tests/'+name],{cwd:root,encoding:'utf8',timeout:60000,maxBuffer:4*1024*1024,windowsHide:true});
 const pass=run.status===0&&!run.error;
 fs.writeFileSync(path.join(out,name+'.log'),String(run.stdout||'')+String(run.stderr||'')+'\nEXIT='+run.status+'\nERROR='+String(run.error?.message||'')+'\n');
 results.push({test:name,pass,exit:run.status});console.log((pass?'PASS ':'FAIL ')+name);
}
fs.writeFileSync(path.join(out,'RESULTADO.json'),JSON.stringify({node:process.version,results,scope:'Node VM and synthetic SQLite; no real browser or remote services'},null,2));
console.log('SUITES_PASS='+results.filter(x=>x.pass).length+'/'+names.length);console.log('LOGS='+out);
process.exitCode=results.every(x=>x.pass)?0:1;
