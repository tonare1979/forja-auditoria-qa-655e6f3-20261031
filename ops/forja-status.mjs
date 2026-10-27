// FORJA RC3: consultar o estado do QA sem reexecutar os testes.
import {existsSync,readdirSync,readFileSync,writeFileSync,renameSync,mkdirSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {homedir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const reports=join(homedir(),'FORJA_PLAYWRIGHT_QA','reports');
const write=process.argv.includes('--write'),json=process.argv.includes('--json');
const cmd=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',timeout:6000,windowsHide:true}).trim();
const sha=cmd(['rev-parse','HEAD']),branch=cmd(['branch','--show-current']),now=new Date();
const safeJson=name=>{try{return JSON.parse(readFileSync(join(reports,name),'utf8'));}catch{return null}};
const all=(existsSync(reports)?readdirSync(reports):[]).filter(n=>/^forja-qa-batch-\d{4}-\d{2}-\d{2}T[\d-]+Z\.json$/.test(n))
 .map(name=>({name,data:safeJson(name)}))
 .filter(x=>x.data?.app==='FORJA RC3'&&x.data?.kind==='local-nondestructive-qa'&&x.data.branch===branch&&
 Array.isArray(x.data.results)&&Number.isInteger(x.data.total)&&Number.isInteger(x.data.passed)&&Number.isInteger(x.data.failed)&&
 x.data.total===x.data.results.length&&x.data.passed+x.data.failed===x.data.total&&Number.isFinite(Date.parse(x.data.finishedAt)))
 .sort((a,b)=>Date.parse(b.data.finishedAt)-Date.parse(a.data.finishedAt));
const latest=all[0]||null,previous=all[1]||null;
const changedCode=base=>{if(!/^[0-9a-f]{40}$/.test(base))return null;try{
 const diff=cmd(['diff','--name-only',base,'HEAD']).split(/\r?\n/);
 const dirty=cmd(['status','--porcelain']).split(/\r?\n/).map(s=>s.slice(3));
 return [...new Set([...diff,...dirty].filter(s=>/^(public|src|tests|migrations)\//.test(s)))];
}catch{return null}};
const delta=latest?changedCode(latest.data.commit):null;
const ageMinutes=latest?Math.max(0,Math.floor((now-Date.parse(latest.data.finishedAt))/60000)):null;
const qaStatus=!latest?'SEM_RELATORIO':latest.data.failed?'FALHA':delta===null?'BASE_NAO_VERIFICADA':delta.length?'CODIGO_ALTERADO':ageMinutes>150?'DESATUALIZADO':latest.data.mode==='candidate'?'APROVADO_LOCAL':'APROVADO';
const failures=latest?.data.results.filter(x=>!x.pass).map(x=>x.name)||[];
const prevFailed=previous?.data.failed??null,currFailed=latest?.data.failed??null;
const pending=[
 {id:'RC3_PUBLICACAO',status:'PENDENTE',description:'Paridade entre commit de codigo publicado e Worker deve ser verificada separadamente; commits apenas documentais ou de QA nao exigem novo deploy.'},
 {id:'D1_REMOTE_AUTH_CONFLICT',status:'PENDENTE',description:'Revalidar fluxo autenticado completo no D1 da versao publicada; testes historicos de OCC existem, mas nao comprovam a versao atual.'},
 {id:'PRODUCTION_RELEASE',status:'NAO_AUTORIZADA',description:'Nao publicar V9.4.2 sem aprovacao do proprietario.'}
];
const payload={product:'FORJA',environment:'RC3 isolada',generatedAt:now.toISOString(),branch,head:sha,source:'relatorios locais QA sem executar a bateria',
 qa:{status:qaStatus,mode:latest?.data.mode||null,report:latest?.name||null,finishedAt:latest?.data.finishedAt||null,ageMinutes,
 passed:latest?.data.passed??null,total:latest?.data.total??null,skipped:latest?.data.skipped||[],failures,changedTestedCode:delta,
 previousFailures:prevFailed,currentFailures:currFailed,changeInFailures:prevFailed===null||currFailed===null?null:currFailed-prevFailed},
 pending,limitations:['Nao executa testes ou verifica deploy por si mesma.','Testes de candidato excluem paridade com a versao antiga publicada e nao comprovam D1 remoto.','Teste WebKit simulado nao substitui iPhone fisico.']};
const pt=d=>d?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'medium',timeZone:'America/Sao_Paulo'}).format(new Date(d)):'indisponivel';
const summary=[
 'FORJA RC3 | STATUS DE EVIDENCIAS | '+pt(payload.generatedAt),
 'QA '+qaStatus+' | '+(payload.qa.passed??'?')+'/'+(payload.qa.total??'?')+' | ultima bateria: '+pt(payload.qa.finishedAt),
 'Branch '+branch+' @ '+sha.slice(0,8)+' | modalidade '+(payload.qa.mode||'indisponivel'),
 'Paridade remota: '+(payload.qa.skipped.includes('remote-base-parity.mjs')?'NAO VERIFICADA nesta bateria (nao implica app nao publicado)':'consultar prova de paridade do teste'),
 'Falhas: '+(failures.length?failures.join(', '):'nenhuma na ultima bateria'),
 'Pendencias: paridade do Worker atual, E2E autenticado atual e Safari fisico (separar status de QA de status de deploy).'
].join('\n');
if(write){
 mkdirSync(reports,{recursive:true});
 const target=join(reports,'forja-status-latest.json'),tmp=target+'.tmp-'+process.pid;
 writeFileSync(tmp,JSON.stringify(payload,null,2)+'\n',{flag:'wx'});
 renameSync(tmp,target);
}
console.log(json?JSON.stringify(payload,null,2):summary);
