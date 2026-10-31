import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(readFileSync(new URL('../public/scout-progress.js',import.meta.url),'utf8'),context);
const now=new Date('2026-10-29T12:00:00Z');
const feedback=context.window.forjaScoutSessionFeedback;
assert.equal(typeof feedback,'function','Scout precisa analisar a sessão mais recente, além de carga máxima');
const exercise=(name,kg,reps,note='')=>({name,equipment:'máquina',sets:[{kg,reps,note}]});
const session=(date,exercises,more={})=>({date,status:'complete',exercises,...more});
const snapshot={sessions:[
 session('2026-09-01',[exercise('Remada',20,10)]),
 session('2026-10-28',[exercise('Remada',25,6,'perdi amplitude'),exercise('Alternativa',15,8)],{status:'partial'}),
 session('2026-10-30',[exercise('Remada',100,20)])
]};
const before=JSON.stringify(snapshot);
const result=feedback(snapshot,now);
assert.equal(result.date,'2026-10-28');
assert.equal(result.partial,true);
assert.equal(result.validSets,2);
assert.equal(result.exercises[0].trend,'mixed','mais carga com menos reps não demonstra evolução');
assert.equal(result.exercises[0].previousDate,'2026-09-01','histórico anterior pode estar fora dos 28 dias');
assert.equal(result.exercises[1].trend,'reference','alternativa distinta tem sua própria referência');
assert.match(result.exercises[0].evidence,/20 kg × 10/);
assert.match(result.exercises[0].evidence,/25 kg × 6/);
const markup=context.window.forjaScoutProgress(snapshot,now);
assert.match(markup,/Resumo do treino/);
assert.match(markup,/Comparações concretas/);
assert.match(markup,/Foco no próximo treino/);
assert.match(markup,/perdi amplitude/);
assert.match(markup,/parcial/);
assert.match(markup,/menos repetições/);
assert.equal(JSON.stringify(snapshot),before,'feedback somente leitura');
for(const [kg,reps,trend] of [[20,12,'more_reps'],[25,10,'more_load'],[20,10,'same'],[15,8,'lower']]){
 const r=feedback({sessions:[session('2026-10-27',[exercise('Agachar',20,10)]),session('2026-10-28',[exercise('Agachar',kg,reps)])]},now);
 assert.equal(r.exercises[0].trend,trend);
}
const mismatch=feedback({sessions:[session('2026-10-27',[exercise('A',20,10)]),session('2026-10-28',[{name:'A',equipment:'máquina',sets:[{kg:20,reps:10},{kg:20,reps:10}]}])]},now);
assert.equal(mismatch.exercises[0].trend,'different_sets','quantidade de séries diferente impede inferência de evolução');
const unsafe={sessions:[session('2026-10-28',[exercise('<img src=x onerror=alert(1)>',0,10,'<script>bad</script>')])]};
const safe=context.window.forjaScoutProgress(unsafe,now);
assert.ok(!safe.includes('<img'));assert.ok(!safe.includes('<script>'));
assert.match(safe,/&lt;img/);assert.match(safe,/&lt;script/);
assert.equal(feedback({sessions:[]},now),null);
const empty=feedback({sessions:[session('2026-10-28',[{name:'Sem dados',sets:[null,{kg:'',reps:10},{kg:true,reps:8},{kg:10,reps:0}]}],{status:'partial'})]},now);
assert.equal(empty.validSets,0);assert.equal(empty.exercises.length,0);
const running=context.window.forjaScoutProgress({sessions:[session('2026-10-28',[],{code:'CR',distance:3,minutes:25,effort:6})]},now);
assert.match(running,/3 km/);assert.match(running,/25 min/);
const ordered={sessions:[session('2026-10-28',[exercise('A',20,10)],{finished:'2026-10-28T12:00:00Z'}),session('2026-10-28',[exercise('A',20,12)],{finished:'2026-10-28T14:00:00Z'})]};
assert.equal(feedback({sessions:[...ordered.sessions].reverse()},now).exercises[0].trend,'more_reps');
// IDs reused for distinct named alternatives must not connect their histories.
const alternative=feedback({sessions:[session('2026-10-27',[{...exercise('Original',20,10),id:'slot-1'}]),session('2026-10-28',[{...exercise('Alternativa',25,10),id:'slot-1'}])]},now);
assert.equal(alternative.exercises[0].trend,'reference');
// A higher maximum must not conceal a drop elsewhere in the session.
const uneven=feedback({sessions:[
 session('2026-10-27',[{name:'Remada',equipment:'máquina',sets:[{kg:20,reps:10},{kg:20,reps:10}]}]),
 session('2026-10-28',[{name:'Remada',equipment:'máquina',sets:[{kg:25,reps:10},{kg:15,reps:10}]}])
]},now);
assert.equal(uneven.exercises[0].trend,'mixed');
const reference=context.window.forjaScoutProgress({sessions:[session('2026-10-28',[exercise('Novo',10,8)],{status:'partial'})]},now);
assert.match(reference,/Primeiro registro comparável/);
assert.match(reference,/treino parcial reconhecido/);
assert.ok(!reference.includes('Mais carga sem menos repetições'));
const invalidDates=feedback({sessions:[session('2026-10-00',[exercise('A',100,50)]),session('2026-10-28',[exercise('A',10,8)])]},now);
assert.equal(invalidDates.exercises[0].trend,'reference');
const failures=[];
function check(name,fn){try{fn();}catch(error){failures.push(name+': '+error.message);}}
check('duplicidade atual sem tendências conflitantes',()=>{
 const duplicate=feedback({sessions:[session('2026-10-27',[exercise('Remada',20,10)]),session('2026-10-28',[exercise('Remada',25,10),exercise('Remada',15,10)])]},now);
 assert.ok(duplicate.exercises.every(e=>e.trend==='ambiguous'));
 assert.match(duplicate.exercises[0].evidence,/25 kg × 10/);
 assert.match(duplicate.exercises[1].evidence,/15 kg × 10/);
});
check('texto descreve só variáveis alteradas',()=>{
 assert.match(uneven.exercises[0].interpretation,/Cargas variaram entre séries/);
 assert.ok(!uneven.exercises[0].interpretation.includes('repetições variaram'));
});
check('histórico por ID sem futuro nem mutação',()=>{
 const workout=context.window.forjaScoutWorkoutProgress;
 assert.equal(typeof workout,'function');
 const historical={sessions:[
  session('2026-10-29',[exercise('Remada',999,99,'FUTURO_NAO_EXIBIR')],{id:'future'}),
  session('2026-10-27',[exercise('Remada',25,10)],{id:'target'}),
  session('2026-10-26',[exercise('Remada',20,10)],{id:'first'})
 ]};
 const saved=JSON.stringify(historical);
 const target=workout(historical,'target',now);
 assert.match(target,/2026-10-27/);assert.match(target,/20 kg × 10/);assert.match(target,/25 kg × 10/);
 assert.ok(!target.includes('999'));assert.ok(!target.includes('FUTURO_NAO_EXIBIR'));
 assert.ok(!target.includes('ULTIMOS 28 DIAS'));assert.ok(!target.includes('SESSÃO MAIS RECENTE'));
 const first=workout(historical,'first',now);
 assert.match(first,/Primeiro registro comparável/);assert.ok(!first.includes('25 kg'));
 for(const id of ['missing','',undefined])assert.match(workout(historical,id,now),/sem comparação/i);
 const duplicated={sessions:[...historical.sessions,{...historical.sessions[1]}]};
 assert.match(workout(duplicated,'target',now),/sem comparação/i);
 assert.ok(!workout(duplicated,'target',now).includes('25 kg'));
 assert.equal(JSON.stringify(historical),saved);
});
assert.deepEqual(failures,[]);
console.log('SCOUT_SESSION_FEEDBACK_PASS');
