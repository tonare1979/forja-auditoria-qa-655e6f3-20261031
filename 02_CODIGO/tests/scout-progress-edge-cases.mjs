import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context={window:{},Date,Number,Set,Array};
vm.runInNewContext(readFileSync(new URL('../public/scout-progress.js',import.meta.url),'utf8'),context);
const calculate=context.window.forjaScoutMetrics;
const now=new Date('2026-10-27T00:00:00Z');
const base={sessions:[
 {date:'2026-10-10',status:'partial',exercises:[{id:'remada',sets:[{kg:20,reps:10},{kg:'',reps:8}]}]},
 {date:'2026-10-20',status:'complete',exercises:[{id:'remada',sets:[{kg:25,reps:10}]}]},
 {date:'2026-10-27',status:'partial',exercises:[]},
 {date:'2026-10-28',status:'complete',exercises:[{id:'remada',sets:[{kg:500,reps:10}]}]},
 {date:'2026-10-00',status:'partial',exercises:[]}
]};
const before=JSON.stringify(base);
const result=calculate(base,now);
assert.equal(result.sessions,3);assert.equal(result.partial,2);
assert.equal(result.volume,450);assert.equal(result.validSets,2);
assert.equal(result.improved,1);assert.equal(result.reduced,0);
assert.equal(JSON.stringify(base),before);
const empty=calculate({sessions:[]},now);assert.equal(empty.sessions,0);assert.equal(empty.improved,0);
console.log('SCOUT_PROGRESS_EDGE_CASES_PASS');
