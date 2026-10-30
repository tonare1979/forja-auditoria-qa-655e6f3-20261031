import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const ctx={window:{}};
vm.runInNewContext(readFileSync(new URL('../public/scout-progress.js',import.meta.url),'utf8'),ctx);
const {forjaScoutPeriodSummary:period,forjaScoutProgress:render}=ctx.window;
const today=new Date('2026-10-30T12:00:00Z');
const snapshot={sessions:[
 {date:'2026-10-30',code:'A',status:'partial',exercises:[{name:'Remada',sets:[{kg:20,reps:10}]}]},
 {date:'2026-10-15',code:'CR',status:'complete',distance:3,minutes:25,exercises:[]},
 {date:'2026-09-20',code:'D',status:'complete',exercises:[]},
 {date:'2026-09-05',code:'B',status:'complete',exercises:[]},
 {date:'2026-10-31',code:'A',status:'complete',exercises:[]},
 {date:'2026-10-00',code:'A',status:'complete',exercises:[]}
 ],weights:[{date:'2026-10-28',weight:65},{date:'2026-11-01',weight:100},{date:'2026-09-15',weight:64}]};
const original=JSON.stringify(snapshot);
assert.equal(period(snapshot,today,30).sessions,2);
assert.equal(period(snapshot,today,45).sessions,3);
assert.equal(period(snapshot,today,60).sessions,4);
assert.equal(period(snapshot,today,30).partial,1);
assert.equal(period(snapshot,today,30).distribution.A,1);
assert.equal(period(snapshot,today,30).distribution.CR,1);
assert.equal(period(snapshot,today,30).weights.at(-1).kg,65);
assert.equal(period(snapshot,today,45).weights.length,1);
assert.throws(()=>period(snapshot,today,28),/Período permitido/);
const html=render(snapshot,today);
for(const d of ['30','45','60']) assert.match(html,new RegExp(`Últimos ${d} dias`));
assert.match(html,/Treino parcial reconhecido/);
assert.ok(!html.includes('100 kg'));
assert.ok(!html.includes('inatividade comprovada'));
assert.equal(JSON.stringify(snapshot),original);
console.log('SCOUT_PROFESSIONAL_PERIODS_PASS');
