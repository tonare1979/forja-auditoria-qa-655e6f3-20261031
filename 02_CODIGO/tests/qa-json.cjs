'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const file=path.resolve(__dirname,'../public/index.html');let html=fs.readFileSync(file,'utf8');let checks=0;const out=(x)=>{checks++;console.log('PASS '+x)};
function extract(name){const p=html.indexOf('function '+name+'(');assert(p>=0,name);let start=html.indexOf('{',p),depth=0,quote=null,escape=false;for(let i=start;i<html.length;i++){let c=html[i];if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote=null;continue;}if(c==='"'||c==="'"||c==='`'){quote=c;continue}if(c==='{')depth++;if(c==='}'&&!--depth)return html.slice(p,i+1)}throw Error(name)}
const code=['emptyState','validForjaData','backup','restore'].map(extract).join('\n');
const legacy={sessions:[{id:'old',code:'A',date:'2026-10-23',exercises:[{name:'Supino',sets:[{kg:20,reps:8}]}]}],weights:[{date:'2026-10-23',weight:66}]};
const full={...legacy,profile:{initialWeight:65,targetWeight:72},drafts:{A:{id:'draft1',entries:{}}},exerciseChoices:{A:{0:'Supino reto com halteres'}},planOverrides:{A:{0:{sets:3,reps:'8'}}},journal:[{date:'2026-10-23',sleep:'7'}],checks:{A:true},extraExercises:{},deezerPlaylist:'abc',skipRunAfterB:false};
const prior={...full,sessions:[...full.sessions,{id:'partial',code:'B',status:'partial',date:'2026-10-28',exercises:[{name:'Leg press',sets:[{kg:40,reps:10}]}]}]};
let pth=path.resolve(__dirname,'../fixtures');fs.writeFileSync(path.join(pth,'synthetic-full.json'),JSON.stringify({app:'FORJA',version:1,data:prior},null,2));fs.writeFileSync(path.join(pth,'synthetic-legacy.json'),JSON.stringify({app:'FORJA',version:1,data:legacy},null,2));
function run(input,{cancel=false,fail=false}={}){let alerts=[],downloads=[],renders=0,store=JSON.stringify(full),saveCalls=0,confirmCalls=0,readErr='original',ctx;
 class FileReader{readAsText(){this.result=typeof input==='string'?input:JSON.stringify(input);this.onload()}}
 ctx={window:{__forjaLoadError:readErr},state:structuredClone(full),tab:'treino',FileReader,validPreferences:()=>true,SESSION_CODES:['A','B','C','D','CR','SAT','SUN'],order:['A','B','CR','C','D'],alert:x=>alerts.push(x),confirm:()=>{confirmCalls++;return !cancel},render:()=>renders++,today:()=> '2026-10-28',dl:(...args)=>downloads.push(args),localStorage:{getItem:()=>store,setItem:(k,v)=>{if(!fail)store=v}},KEY:'forja-test',cloudDirty:()=>{},JSON,Number,String,Object,Array,Date,console,Blob};
 ctx.save=()=>{saveCalls++;let next=JSON.stringify(ctx.state);if(fail){ctx.alert('Falha de persistencia');return false;}store=next;return true};
 vm.createContext(ctx);vm.runInContext(code,ctx);let before=JSON.stringify(ctx.state),beforeStore=store;ctx.restore({});return {ctx,alerts,downloads,renders,store,saveCalls,confirmCalls,before,beforeStore};}
function yes(v,m){assert.ok(v,m);out(m)}
let a=run({app:'FORJA',version:1,data:prior});yes(a.alerts.includes('Backup importado.'),'restauracao comunica sucesso');yes(require('node:util').isDeepStrictEqual(JSON.parse(JSON.stringify(a.ctx.state)),prior),'restauracao preserva todas as colecoes, perfil e meta');yes(require('node:util').isDeepStrictEqual(JSON.parse(a.store),prior),'restauracao persistiu bytes equivalentes ao objeto');yes(a.ctx.state.sessions[1].status==='partial','sessao parcial preservada');
let b=run({app:'FORJA',version:1,data:legacy});yes(b.ctx.state.sessions.length===1,'backup legado aceito');yes(b.ctx.state.profile&&Object.keys(b.ctx.state.profile).length===0,'perfil antigo compatibilizado');
for(let input of ['{bad','{"app":"FORJA","data":{}}',JSON.stringify({app:'FORJA',data:{...prior,weights:[{date:'x',weight:700}]}})]){let r=run(input);yes(r.store===r.beforeStore&&JSON.stringify(r.ctx.state)===r.before,'entrada invalida mantem estado e armazenamento');yes(!r.alerts.includes('Backup importado.'),'entrada invalida nao anuncia sucesso')}
let invalidProfile=run({app:'FORJA',version:1,data:{...prior,profile:{initialWeight:65,targetWeight:999}}});yes(invalidProfile.store===invalidProfile.beforeStore&&JSON.stringify(invalidProfile.ctx.state)===invalidProfile.before,'meta de peso invalida rejeitada sem mudar dados');
let c=run({app:'FORJA',version:1,data:prior},{cancel:true});yes(c.store===c.beforeStore&&JSON.stringify(c.ctx.state)===c.before,'cancelamento preserva dados');yes(c.saveCalls===0,'cancelamento nao grava');
let f=run({app:'FORJA',version:1,data:prior},{fail:true});yes(f.store===f.beforeStore,'falha simulada conserva armazenamento');yes(JSON.stringify(f.ctx.state)===f.before,'falha reverte memoria');yes(!f.alerts.includes('Backup importado.'),'falha nao anuncia sucesso');
let e=run({app:'FORJA',version:1,data:prior});e.ctx.state=structuredClone(prior);e.ctx.backup();yes(e.downloads.length===1,'exportacao chama download uma vez');yes(require('node:util').isDeepStrictEqual(JSON.parse(e.downloads[0][1]).data,prior),'exportacao inclui sessao parcial e todos os campos');let d=run({app:'FORJA',version:1,data:prior});let second=run({app:'FORJA',version:1,data:prior});yes(second.ctx.state.sessions.length===2,'importacao repetida substitui, nao duplica');

// Prova complementar: duas chamadas consecutivas no MESMO contexto VM e armazenamento.
// `run()` executa a primeira restauração; a segunda acontece na mesma ctx,
// sem criar VM, FileReader, storage ou estado novos.
const same=run({app:'FORJA',version:1,data:prior});
const copy=x=>JSON.parse(JSON.stringify(x));
const snapshot=()=>({state:copy(same.ctx.state),persisted:JSON.parse(same.ctx.localStorage.getItem('forja-test'))});
const first=snapshot();
const firstIds=first.state.sessions.map(s=>s.id);
const firstWeights=first.state.weights.map(w=>[w.date,w.weight]);
const firstDrafts=copy(first.state.drafts);
const firstAlternatives=copy(first.state.exerciseChoices);
const oldAlerts=same.alerts.length,oldConfirm=same.confirmCalls;
same.ctx.restore({});
const secondSnapshot=snapshot();
yes(require('node:util').isDeepStrictEqual(secondSnapshot.state,first.state),'mesma VM: segunda importacao preserva conteudo integral');
yes(require('node:util').isDeepStrictEqual(secondSnapshot.persisted,first.persisted),'mesma VM: armazenamento persistido identico nas duas importacoes');
yes(require('node:util').isDeepStrictEqual(secondSnapshot.state.sessions.map(s=>s.id),firstIds),'mesma VM: IDs e quantidade de sessoes sem duplicacao');
yes(require('node:util').isDeepStrictEqual(secondSnapshot.state.weights.map(w=>[w.date,w.weight]),firstWeights),'mesma VM: pesos e suas quantidades intactos');
yes(require('node:util').isDeepStrictEqual(secondSnapshot.state.drafts,firstDrafts),'mesma VM: rascunhos intactos');
yes(require('node:util').isDeepStrictEqual(secondSnapshot.state.exerciseChoices,firstAlternatives),'mesma VM: alternativas intactas');
yes(same.alerts.slice(oldAlerts).includes('Backup importado.')&&same.ctx.state.sessions.length===2,'mesma VM: segunda restauracao completou sem mesclagem');
console.log('PROVA_MESMA_VM '+JSON.stringify({sessions:secondSnapshot.state.sessions.length,sessionIds:secondSnapshot.state.sessions.map(s=>s.id),weights:secondSnapshot.state.weights.length,drafts:Object.keys(secondSnapshot.state.drafts).length,alternatives:Object.keys(secondSnapshot.state.exerciseChoices).length,persistedBytes:same.ctx.localStorage.getItem('forja-test').length,confirmCalls:oldConfirm+' + segunda confirmacao'}));

console.log('RESULTADO '+checks+'/'+checks+' PASS');
