// Prova de que "status" consulta evidencias sem executar a bateria.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readdirSync,writeFileSync,unlinkSync,existsSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {homedir} from 'node:os';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dir=join(homedir(),'FORJA_PLAYWRIGHT_QA','reports');
const latest=()=>existsSync(dir)?readdirSync(dir).filter(n=>/^forja-qa-batch-/.test(n)).length:0;
const status=()=>{const p=spawnSync(process.execPath,['ops/forja-status.mjs','--json'],{cwd:root,encoding:'utf8',timeout:12000});
 assert.equal(p.status,0,p.stderr);return JSON.parse(p.stdout)};
const before=latest();
let s=status();
assert.equal(s.source,'relatorios locais QA sem executar a bateria');
assert(s.qa.total===null||s.qa.total>=14,'Relatorio QA fora do escopo esperado');
assert(s.pending.some(x=>x.id==='D1_REMOTE_AUTH_CONFLICT'&&x.status==='PENDENTE'));
assert.equal(latest(),before,'status gerou novo relatorio de testes');
console.log('STATUS_NO_QA_RERUN_PASS');
const probe=join(root,'tests','__forja_status_transient_probe__.txt');
assert(!existsSync(probe),'Arquivo de teste deve estar ausente no inicio');
try{
 writeFileSync(probe,'qa-status-probe\n',{flag:'wx'});
 s=status();
 if(s.qa.report){
  assert.equal(s.qa.status,'CODIGO_ALTERADO','mudanca de arquivo de teste deve invalidar selo de bateria');
  assert(s.qa.changedTestedCode.some(p=>p.includes('__forja_status_transient_probe__')));
 }else assert.equal(s.qa.status,'SEM_RELATORIO','uma instalacao nova nao tem selo de QA');
 console.log('STATUS_DIRTY_TEST_CODE_DETECTED_PASS');
}finally{if(existsSync(probe))unlinkSync(probe)}
assert.equal(latest(),before,'status gerou novo relatorio apos o ensaio');
console.log('STATUS_READONLY_REGRESSION_PASS');
