import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const html=fs.readFileSync(new URL('public/index.html',root),'utf8');
const fixture=JSON.parse(fs.readFileSync(new URL('tests/fixtures/compat-fixture-legacy.json',root),'utf8'));
const original=JSON.stringify(fixture);
const cut=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i);assert.ok(i>=0&&j>i);return html.slice(i,j)};
const compat=html.match(/const FORJA_COMPAT_ALIASES=.*?;const forjaCompatName=.*?;/)?.[0]||'';
const ctx={window:{},state:structuredClone(fixture),sel:'SAT',wk:{SAT:{name:'Sábado',focus:'',ex:[]},SUN:{name:'Domingo',focus:'',ex:[]}},SESSION_CODES:['SAT','SUN'],Date,structuredClone,
 esc:String,fmt:String,button:()=>'',restPanel:()=>'',musicPanel:()=>'',bonusPanel:()=>'',forjaEquipmentPhoto:()=>'',forjaAlternativeLabel:x=>x,forjaDemoAction:()=>'',alternativesPicker:()=>'',dateBR:x=>x,
 initDraft:()=>({entries:{}}),layout:markup=>{ctx.markup=markup}};
ctx.getEx=code=>ctx.wk[code].ex;
vm.createContext(ctx);
vm.runInContext(compat+cut('function treino(){','function quickStep(')+cut('function forjaWeightSummary(data){','function nutricao(){'),ctx);
const tests=[];
const check=(name,fn)=>{try{fn();console.log('PASS',name)}catch(e){tests.push(name);console.error('FAIL',name,e.message)}};
check('Scout: 4 sessões, 2 aumentos, zero reduções',()=>{vm.runInContext(fs.readFileSync(new URL('public/scout-progress.js',root),'utf8'),ctx);const m=ctx.window.forjaScoutMetrics(ctx.state,new Date('2026-10-28T12:00:00Z'));assert.equal(m.sessions,4);assert.equal(m.improved,2);assert.equal(m.reduced,0)});
const pairs=[['Elevação lateral com halteres',10,'SAT'],['Crucifixo inverso máquina',35,'SAT'],['Tríceps corda',25,'SAT'],['Panturrilha em pé',55,'SAT'],['Tríceps francês leve',12,'SUN']];
for(const [name,kg,code] of pairs)check('treino real: '+name,()=>{ctx.sel=code;ctx.wk[code].ex=[[name,1,'12','']];ctx.treino();assert.ok(ctx.markup.includes('Anterior: '+kg+' kg'),ctx.markup.match(/Anterior:.*?kg|Sem histórico/)?.[0]);});
check('treino real: legado sem sessão corrigida',()=>{const saved=ctx.state.sessions;try{ctx.state.sessions=saved.filter(s=>s.id!=='corrected-sat-02');ctx.sel='SAT';ctx.wk.SAT.ex=[['Tríceps corda',1,'12','']];ctx.treino();assert.ok(ctx.markup.includes('Anterior: 20 kg'));}finally{ctx.state.sessions=saved}});
check('progresso real: linhas consolidadas e cargas máximas',()=>{ctx.progresso();const table=ctx.markup.split('<h2>Evolução de cargas</h2>')[1].split('<h2>Últimos treinos</h2>')[0];for(const [name,kg] of pairs){assert.equal(table.split('<td>'+name+'</td>').length-1,1);assert.ok(table.includes('<td>'+name+'</td><td>'+kg+' kg'));}assert.ok(!table.includes('├'))});
check('identidade estrita: nomes distintos e IDs estáveis',()=>{const snap={sessions:[{date:'2026-10-17',exercises:[{id:'stable-1',name:'Tr├¡ceps corda',sets:[{kg:20,reps:12}]},{name:'Triceps corda',sets:[{kg:99,reps:12}]}]},{date:'2026-10-24',exercises:[{id:'stable-1',name:'Tríceps corda',sets:[{kg:25,reps:12}]}]}]};const m=ctx.window.forjaScoutMetrics(snap,new Date('2026-10-28T12:00:00Z'));assert.equal(m.improved,1);if(compat){assert.equal(vm.runInContext('forjaCompatName("Triceps corda")',ctx),'Triceps corda');assert.equal(vm.runInContext('forjaCompatName("toString")',ctx),'toString')}});
check('snapshot efetivamente lido permanece idêntico',()=>{assert.equal(JSON.stringify(ctx.state),original);assert.equal(JSON.stringify(fixture),original)});
if(tests.length)process.exitCode=1;else console.log('COMPAT_READ_REGRESSIONS_PASS');
