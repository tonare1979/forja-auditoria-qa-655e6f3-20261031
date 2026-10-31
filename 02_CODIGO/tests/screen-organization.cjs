const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),features=fs.readFileSync(root+'/public/features.js','utf8'),index=fs.readFileSync(root+'/public/index.html','utf8');
let checks=0;const check=(name,fn)=>{try{fn();checks++;console.log('PASS '+name)}catch(e){console.error('FAIL '+name+': '+e.message);process.exitCode=1}};
const nodes=new Map(),listeners={};const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',hidden:false,value:'',scrollIntoView(){},before(){},insertAdjacentHTML(){},querySelector(){return null},querySelectorAll(){return []}});return nodes.get(id)};
const state={sessions:[],weights:[],profile:{},drafts:{A:{entries:{'0-0':{kg:20,reps:10,done:true}}}},exerciseChoices:{A:{0:'Supino máquina'}},planOverrides:{},checks:{},journal:[]};
const context={window:{addEventListener(){}},document:{addEventListener(t,f){(listeners[t]??=[]).push(f)},getElementById:node,createElement(){return node('created')}},$:node,state,cloud:{user:null},console,Date,Set,Map,localStorage:{getItem(){return null}},getEx(){return []},progresso(){context.progressCalled=true;context.layout('<h2>RESULTADOS REAIS</h2>')},nuvem(){},painel(){},treino(){context.trainingCalled=true},nutricao(){},render(){},nav(){},esc:s=>String(s),fmt:String,today:()=> '2026-10-29',forjaWeightSummary:()=>({initial:null,target:null,current:null}),setTimeout(){},scrollTo(){},api:async()=>({lines:[],reviews:[],messages:[],media:[]})};
node('root').querySelector=sel=>sel==='footer'?node('footer'):null;
context.layout=html=>{context.markup=html};context.tab='nuvem';vm.createContext(context);vm.runInContext(features,context);
const run=code=>vm.runInContext(code,context);
const before=JSON.stringify(state);
check('quatro destinos com Perfil e sem Acompanhamento na barra',()=>{context.cloud.user={username:'synthetic',role:'member'};run('nav()');const h=node('nav').innerHTML;assert(h.includes('data-tab="nuvem"'));assert(!h.includes('data-tab="acompanhamento"'));assert(h.includes('Evolução'));assert.equal((h.match(/<button /g)||[]).length,4)});
check('revisão continua pertencendo ao Treino na barra',()=>{run("tab='acompanhamento';nav()");assert.match(node('nav').innerHTML,/<button class="active" data-tab="treino"/)});
check('convidado não recebe navegação autenticada',()=>{context.cloud.user=null;run('nav()');assert.equal(node('nav').hidden,true);assert.equal(node('nav').innerHTML,'')});
check('Evolução abre Scout e resultados, não formulário de foto',()=>{context.cloud.user={username:'synthetic',role:'member'};run("tab='progresso';evolution()");assert.equal(context.progressCalled,true);assert(!context.markup.includes('id="photoFile"'))});
check('fotos e avaliações possuem entrada própria',()=>{run("fx.evolutionView='media';evolution()");assert(context.markup.includes('FOTOS E MEDIDAS'));assert(!context.markup.includes('REVISÃO DA FICHA'))});
check('histórico vindo do Perfil ativa Evolução',()=>{run("tab='nuvem';trainingProgress()");assert.equal(context.tab,'progresso')});
check('revisão identificada sem chamar Chat dedicado',()=>{run("tab='acompanhamento';acompanhamento()");assert(context.markup.includes('REVISÃO DA FICHA'));assert(!context.markup.includes('Chat dedicado'))});
check('navegar não altera histórico, rascunho ou alternativas',()=>assert.equal(JSON.stringify(state),before));
check('frequência é por dias reais na semana vigente',()=>{const start=index.indexOf('function forjaWeekSummary('),end=index.indexOf('\nfunction ',start+1);assert(start>=0,'helper ausente');run(index.slice(start,end));context.state.sessions=[{date:'2026-10-26'},{date:'2026-10-26',status:'partial'},{date:'2026-10-29'},{date:'2026-10-25'},{date:'2026-10-30'},{date:'invalid'}];const m=run("forjaWeekSummary(state,'2026-10-29')");assert.equal(m.days,2);assert.equal(m.sessions,3);assert.equal(m.partial,1)});
check('backup fora do corpo de resultados',()=>{const p=index.slice(index.indexOf('function progresso(){'),index.indexOf('\nfunction nutricao(){'));assert(!p.includes("button('RESTAURAR CÓPIA DE SEGURANÇA'"));assert(index.includes('function backupPanel('));assert(index.includes('content+=backupPanel()'))});
check('resumo após salvar pede análise do treino exato',()=>{
 const start=index.indexOf('function showWorkoutSummary('),end=index.indexOf('\nfunction ',start+1);run(index.slice(start,end));
 let selected;const close={addEventListener(){},focus(){}};const overlay={setAttribute(){},querySelector(){return close},innerHTML:''};
 context.document.createElement=()=>overlay;context.document.body={appendChild(){}};
 context.window.forjaScoutWorkoutProgress=(snapshot,id)=>{selected=id;assert.equal(snapshot,context.state);return '<p>SCOUT DA SESSÃO</p>'};
 context.record={id:'synthetic-saved',code:'A',exercises:[]};run('showWorkoutSummary(record)');assert.equal(selected,'synthetic-saved');assert(overlay.innerHTML.includes('VER ANÁLISE DO SCOUT'));assert(overlay.innerHTML.includes('SCOUT DA SESSÃO'));
});
check('histórico pede Scout do treino escolhido sem alterar registros',()=>{
 const start=index.indexOf('function showWorkoutHistory('),end=index.indexOf('\nfunction ',start+1);run(index.slice(start,end));
 let selected;context.state.sessions=[{id:'synthetic-old',date:'2026-10-27',name:'A',exercises:[]},{id:'synthetic-new',date:'2026-10-29',exercises:[]}];const original=JSON.stringify(context.state);context.dateBR=x=>x;
 context.window.forjaScoutWorkoutProgress=(snapshot,id)=>{selected=id;return '<p>SCOUT HISTÓRICO</p>'};run("showWorkoutHistory('synthetic-old')");assert.equal(selected,'synthetic-old');assert.equal(JSON.stringify(context.state),original);
});
(async()=>{
 let calls=0,writes=0,resolve;const pending=new Promise(r=>resolve=r);context.api=()=>{calls++;return pending};
 context.state.sessions=[];run("tab='progresso';fx.evolutionView='scout'");await run('fxLoadEvolution()');check('Scout não solicita APIs de fotos',()=>assert.equal(calls,0));
 run("fx.evolutionView='media'");const request=run('fxLoadEvolution()');run("fx.evolutionView='scout'");const originalDollar=context.$;context.$=id=>{if(['photoGallery','bioHistory'].includes(id)){writes++;return null}return originalDollar(id)};
 resolve({media:[],records:[]});await request;check('resposta de fotos atrasada não escreve na tela Scout',()=>assert.equal(writes,0));
 console.log('SCREEN_ORGANIZATION checks='+checks+' exit='+(process.exitCode||0));
})().catch(e=>{console.error(e);process.exitCode=1});
