import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(readFileSync(new URL('../public/scout-progress.js',import.meta.url),'utf8'),context);
const calculate=context.window.forjaScoutMetrics;
const session=(date,kg)=>({date,status:'partial',exercises:[{name:'Remada',sets:[{kg,reps:10}]}]});
const sessions=[session('2026-10-10',20),session('2026-10-20',25),session('2026-10-20',10)];
const before=JSON.stringify(sessions);
const now=new Date('2026-10-27T12:00:00Z');
for(const input of [sessions,[...sessions].reverse(),[sessions[0],sessions[2],sessions[1]]]){
 const result=calculate({sessions:input},now);
 assert.equal(result.improved,1,'a melhor carga diária aumentou de 20 para 25 kg');
 assert.equal(result.reduced,0,'uma série mais leve no mesmo dia não implica redução entre dias');
 assert.equal(result.volume,550,'todo volume continua contado');
 assert.equal(result.validSets,3);
 assert.equal(result.sessions,3);
 assert.equal(result.days,2);
 assert.equal(result.partial,3);
}
assert.equal(JSON.stringify(sessions),before,'Scout permanece somente leitura');
const sameDay=calculate({sessions:[session('2026-10-20',25),session('2026-10-20',10)]},now);
assert.equal(sameDay.improved+sameDay.stable+sameDay.reduced,0,'um dia não permite tendência');
for(const [last,metric] of [[15,'reduced'],[20,'stable']]){
 const result=calculate({sessions:[session('2026-10-10',20),session('2026-10-20',last)]},now);
 assert.equal(result[metric],1,'comparação entre dias distintos permanece válida');
}
console.log('SCOUT_DAILY_ORDER_INDEPENDENCE_READONLY_PASS');
