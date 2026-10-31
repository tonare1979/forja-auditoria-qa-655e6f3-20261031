'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');const scout=fs.readFileSync(path.join(root,'public/scout-progress.js'),'utf8');
function extract(name){const tag='function '+name+'(';let pos=html.indexOf(tag);assert(pos>=0,`funcao ausente ${name}`);let begin=html.indexOf('{',pos),depth=0,inS='',escaped=false,template=false;for(let i=begin;i<html.length;i++){const c=html[i];if(inS){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===inS)inS='';continue}if(c==='"'||c==="'"||c==='`'){inS=c;continue}if(c==='{')depth++;else if(c==='}'&&!--depth)return html.slice(pos,i+1)}throw Error('falha extraindo '+name)}
let checks=0;function check(v,msg){assert.ok(v,msg);checks++;console.log('PASS '+msg)}
function runScenario({failure=false,second=false,legacy=false}={}){
 let persisted=null,saveCalls=0,alerts=[],summaries=[],panels=0;
 const entries={'0-0':{done:true,kg:'22',reps:'8',note:'real'},'0-1':{done:false,kg:'',reps:''},'1-0':{done:false,kg:'80',reps:'12'}};
 const draft={id:'treino-sintetico-001',started:'2026-10-28T12:00:00Z',entries,effort:'5'};
 const historical={id:'legado',code:'A',status:'complete',date:'2026-10-27',exercises:[{name:'Supino máquina',sets:[{kg:20,reps:10}]}]};
 const state={sessions:[historical],drafts:{A:draft},weights:[{weight:60,date:'2026-10-27'}],exerciseChoices:{A:{'1':'Remada articulada'}}};
 const before=JSON.stringify({sessions:state.sessions,weights:state.weights,exerciseChoices:state.exerciseChoices});
 const context={state,sel:'A',tab:'treino',window:{},Object,Number,String,Array,Date,Math,JSON,Map,Set,console,alert:t=>alerts.push(t),confirm:()=>false,bonusRemaining:()=>0,bonusReady:()=>false,BONUS_CATALOG:{},wk:{A:{name:'SUPERIORES'}},getEx:()=>[['Supino máquina',2,'8',''],['Remada articulada',2,'10','']],initDraft:code=>state.drafts[code],today:()=> '2026-10-28',painel:()=>panels++,showWorkoutSummary:r=>summaries.push(r),save:()=>{saveCalls++;if(failure)return false;persisted=JSON.stringify(state);return true}};
 vm.createContext(context);vm.runInContext(extract('finish'),context);context.finish();
 check(saveCalls===1,'finalizacao aciona persistencia uma vez');
 if(failure){check(state.sessions.length===1,'falha nao cria sessao definitiva');check(state.drafts.A===draft,'falha restaura mesmo rascunho');check(panels===0&&summaries.length===0,'falha nao exibe sucesso');check(JSON.stringify({sessions:state.sessions,weights:state.weights,exerciseChoices:state.exerciseChoices})===before,'falha preserva historico, pesos, alternativas');return}
 check(state.sessions.length===2,'historico legado preservado e novo treino adicionado');const recorded=state.sessions[1];
 check(recorded.status==='partial','sessao classificada parcial');check(recorded.exercises[0].sets.length===1,'apenas uma serie realizada');check(recorded.exercises[1].sets.length===0,'exercicio nao realizado permanece sem series');check(recorded.exercises[0].sets[0].kg===22&&recorded.exercises[0].sets[0].reps===8,'carga e repeticoes realmente declaradas');check(state.drafts.A===undefined,'rascunho retirado apos persistencia');check(persisted!==null,'estado persistido');check(summaries.length===1,'resumo gerado somente apos sucesso');
 context.sel='A';context.initDraft=()=>draft;context.finish();check(state.sessions.length===2,'repeticao nao duplica sessao');check(alerts.some(t=>t.includes('já foi salva')),'duplicacao detectada pelo ID');
 const parsed=JSON.parse(persisted);check(parsed.sessions.length===2&&parsed.sessions[0].id==='legado','recarregamento preserva sessao antiga');check(parsed.weights.length===1&&parsed.exerciseChoices.A['1']==='Remada articulada','recarregamento preserva peso e alternativa');check(parsed.sessions[1].status==='partial','recarregamento preserva status parcial');
 const ctx={window:{}};vm.createContext(ctx);vm.runInContext(scout,ctx);const metrics=ctx.window.forjaScoutMetrics(parsed,new Date('2026-10-28T22:00:00Z'));
 check(metrics.partial===1,'Scout reconhece treino parcial');check(metrics.sessions===2,'Scout considera treino parcial entre sessoes');check(metrics.validSets===2,'Scout computa apenas series reais');check(metrics.volume===376,'Scout nao cria volume de series vazias');check(ctx.window.forjaScoutProgress(parsed,new Date('2026-10-28')).includes('1 treino(s) parcial(is)'), 'texto Scout informa parcial');
}
runScenario();runScenario({failure:true});console.log('RESULTADO '+checks+'/'+checks+' PASS');
