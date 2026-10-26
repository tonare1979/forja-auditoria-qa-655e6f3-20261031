// FORJA RC3 — lote de QA reutilizável, gratuito e não destrutivo.
// Só executa testes previamente auditados; sem deploy, publicação, D1 ou produção.
import {spawnSync,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {homedir} from 'node:os';
import {dirname,resolve,join} from 'node:path';
import {mkdirSync,writeFileSync} from 'node:fs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const allowedOrigin='https://forja-v11-rc3-preview-isolada.renatodesouza79.workers.dev';
const origin=process.env.FORJA_QA_ORIGIN;
if(origin&&origin.replace(/\/$/,'')!==allowedOrigin){
  console.error('BLOQUEADO: FORJA_QA_ORIGIN não corresponde à RC3 isolada.');
  process.exit(2);
}
const mode=process.env.FORJA_QA_MODE==='candidate'?'candidate':'full';
const tests=[
  'auth-login-safari-regression.mjs',
  'auth-real-handler-synthetic.mjs',
  'ios-pwa-assets-contract.mjs',
  'ios-pwa-offline-shell.cjs',
  'ios-standalone-homologation.cjs',
  'qa-cross-device-sync-webkit.cjs',
  'qa-profile-only-sync-guard.mjs',
  'qa-webkit-login-local.cjs',
  'rc3-profile-reload-webkit.cjs',
  'remote-base-parity.mjs',
  'remote-email-salt-smoke.mjs',
  'sync-status-proof.mjs',
  'sync-status-webkit-local.cjs',
  'qa-authenticated-occ-handler.mjs',
  'qa-member-public-signup-cpf.mjs',
  'qa-cpf-migration.mjs',
  'qa-guest-signup-webkit.cjs',
  'qa-admin-people-status.mjs',
  'qa-admin-people-webkit.cjs',
  'qa-status-readonly.mjs',
];
const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',timeout:15000}).trim();
const branch=execFileSync('git',['branch','--show-current'],{cwd:root,encoding:'utf8',timeout:15000}).trim();
const skipped=mode==='candidate'?['remote-base-parity.mjs']:[];
const selected=tests.filter(name=>!skipped.includes(name));
const start=new Date();
const results=[];
const fallbackNodeModules=join(homedir(),'FORJA_PLAYWRIGHT_QA','node_modules');
const env={...process.env,NODE_PATH:process.env.NODE_PATH||fallbackNodeModules,FORJA_QA_ORIGIN:allowedOrigin};
console.log('FORJA QA LOTE | branch '+branch+' | commit '+sha.slice(0,12)+' | mode '+mode+' | testes: '+selected.length+' | ignorados declarados: '+skipped.join(','));
for(const name of selected){
  const started=Date.now();
  const child=spawnSync(process.execPath,[join(root,'tests',name)],{
    cwd:root,env,encoding:'utf8',maxBuffer:5_000_000,timeout:90_000,
    windowsHide:true
  });
  const pass=child.status===0&&!child.error;
  results.push({name,pass,exitCode:child.status,errorCode:child.error?.code||null,seconds:Math.round((Date.now()-started)/1000)});
  console.log((pass?'PASS ':'FAIL ')+name+' ('+results.at(-1).seconds+'s)');
  if(!pass){
    const lines=String(child.stderr||child.stdout||child.error?.message||'Sem saída').split(/\r?\n/).filter(Boolean);
    console.log('MOTIVO: '+lines.slice(-6).join(' | ').slice(0,1400));
  }
}
const ok=results.filter(x=>x.pass).length;
const report={app:'FORJA RC3',kind:'local-nondestructive-qa',startedAt:start.toISOString(),finishedAt:new Date().toISOString(),commit:sha,branch,mode,skipped,liveOrigin:allowedOrigin,total:results.length,passed:ok,failed:results.length-ok,results,limitations:['Não comprova conflito autenticado no D1 remoto','Não substitui teste físico iPhone','Nenhum deploy ou escrita remota realizada',...(mode==='candidate'?['Paridade de assets remotos não executada: versão candidata ainda não publicada']:[])]};
const reportDir=join(homedir(),'FORJA_PLAYWRIGHT_QA','reports');
mkdirSync(reportDir,{recursive:true});
const file=join(reportDir,'forja-qa-batch-'+start.toISOString().replace(/[:.]/g,'-')+'.json');
writeFileSync(file,JSON.stringify(report,null,2)+'\n',{flag:'wx',encoding:'utf8'});
console.log('BATCH_RESULT '+ok+'/'+results.length+' FAILED='+(results.length-ok));
console.log('EVIDENCIA_LOCAL '+file);
if(ok!==results.length)process.exitCode=1;
