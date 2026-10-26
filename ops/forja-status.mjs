// FORJA RC3: status gratuito, instantaneo, somente leitura de evidencias QA.
import {existsSync,readdirSync,readFileSync,writeFileSync,renameSync,mkdirSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {homedir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const reports=join(homedir(),'FORJA_PLAYWRIGHT_QA','reports');
const write=process.argv.includes('--write');
const json=process.argv.includes('--json');
const cmd=(args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',timeout:6000,windowsHide:true}).trim();
const latestName='forja-status-latest.json';
const now=new Date();
const safeJson=(file)=>{try{return JSON.parse(readFileSync(join(reports,file),'utf8'));}catch{return null}};
const reportsFound=(existsSync(reports)?readdirSync(reports):[]).filter(n=>/^forja-qa-batch-\d{4}-\d{2}-\d{2}T[\d-]+Z\.json$/.test(n))
 .map(name=>({name,data:safeJson(name)})).filter(x=>x.data?.app==='FORJA RC3'&&x.data?.kind==='local-nondestructive-qa'&&Array.isArray(x.data.results)&&Number.isInteger(x.data.total)&&Number.isInteger(x.data.passed)&&Number.isInteger(x.data.failed)&&x.data.total===x.data.results.length&&x.data.passed+x.data.failed===x.data.total&&Number.isFinite(Date.parse(x.data.finishedAt)))
 .sort((a,b)=>Date.parse(b.data.finishedAt)-Date.parse(a.data.finishedAt));
const latest=reportsFound[0]||null,previous=reportsFound[1]||null;
const sha=cmd(['rev-parse','HEAD']),branch=cmd(['branch','--show-current']);
const changedCode=(base)=>{if(!/^[0-9a-f]{40}$/.test(base))return null;try {
 const tracked=cmd(['diff','--name-only',base,'HEAD']).split(/\r?\n/);
 const local=cmd(['status','--porcelain']).split(/\r?\n/).map(s=>s.slice(3));
 return [...new Set([...tracked,...local].filter(s=>/^(public|src|tests)\//.test(s)))];
}catch{return null}};
const delta=latest?changedCode(latest.data.commit):null;
const ageMinutes=latest?Math.max(0,Math.floor((now-Date.parse(latest.data.finishedAt))/60000)):null;
const testStatus=!latest?'SEM_RELATORIO':latest.data.failed?'FALHA':delta===null?'BASE_NAO_VERIFICADA':delta.length?'CODIGO_ALTERADO':ageMinutes>150?'DESATUALIZADO':'APROVADO';
const prevFailed=previous?.data.failed??null;
const currFailed=latest?.data.failed??null;
const failures=latest?.data.results.filter(x=>!x.pass).map(x=>x.name)||[];
const pending=[
 {id:'D1_REMOTE_AUTH_CONFLICT',status:'PENDENTE',description:'Conflito de duas sessoes autenticadas contra o D1 remoto da RC3; nao foi homologado.'},
 {id:'PRODUCTION_RELEASE',status:'NAO_AUTORIZADA',description:'Aprovacao de producao V9.4.2 nao esta no escopo desta esteira.'}
];
const payload={product:'FORJA',environment:'RC3 isolada',generatedAt:now.toISOString(),branch,head:sha,source:'relatorios locais QA sem executar a bateria',qa:{
 status:testStatus,report:latest?.name||null,finishedAt:latest?.data.finishedAt||null,ageMinutes,passed:latest?.data.passed??null,total:latest?.data.total??null,
 failures,changedTestedCode:delta,previousFailures:prevFailed,currentFailures:currFailed,changeInFailures:prevFailed===null||currFailed===null?null:currFailed-prevFailed
},pending,limitations:['A consulta nao executa testes nem verifica o D1 remoto.','O horario da bateria automatica depende do notebook e da sessao Windows.','Evidencias de outros modulos do projeto nao sao certificadas por estes 14 testes.']};
const localTime=d=>d?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'medium',timeZone:'America/Sao_Paulo'}).format(new Date(d)):'indisponivel';
const summary=[
 'FORJA RC3 | STATUS DE EVIDENCIAS | '+localTime(payload.generatedAt),
 'Bateria: '+testStatus+' | '+(payload.qa.passed??'?')+'/'+(payload.qa.total??'?')+' | ultimo teste: '+localTime(payload.qa.finishedAt)+(ageMinutes===null?'':' ('+ageMinutes+' min atras)'),
 'Repositorio: '+branch+' @ '+sha.slice(0,8)+(delta?.length?' | codigo de teste alterado: '+delta.join(', '):''),
 'Falhas atuais: '+(failures.length?failures.join(', '):'nenhuma na ultima bateria')+(payload.qa.changeInFailures===null?'':' | variacao: '+payload.qa.changeInFailures),
 'Pendencia: conflito remoto autenticado com D1 (nao homologado).',
 'Limite: nao reexecuta testes, nao cobre a homologacao integral do FORJA.'
].join('\n');
if(write){
 mkdirSync(reports,{recursive:true});
 const target=join(reports,latestName),tmp=target+'.tmp-'+process.pid;
 writeFileSync(tmp,JSON.stringify(payload,null,2)+'\n',{flag:'wx'});
 renameSync(tmp,target);
}
if(json)console.log(JSON.stringify(payload,null,2));else console.log(summary);
