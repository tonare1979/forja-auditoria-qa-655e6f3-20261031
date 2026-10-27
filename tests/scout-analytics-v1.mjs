import assert from 'node:assert/strict';
import {scoutAnalytics} from '../src/scout-analytics.mjs';
const rows=[
 {date:'2026-10-01',exercises:[{id:'supino',sets:[{kg:200,reps:10}]}]},
 {date:'2026-10-10',partial:true,exercises:[{id:'supino',sets:[{kg:30,reps:8}]}],runs:[{km:3}]},
 {date:'2026-10-10',exercises:[{id:'supino',sets:[{kg:32,reps:8}]}]},
 {date:'2026-10-17',exercises:[{id:'supino',sets:[{kg:37,reps:8}]}],runs:[{km:4}],weightKg:65},
 {date:'2026-10-28',exercises:[{id:'supino',sets:[{kg:500,reps:8}]}]}
];
const r=scoutAnalytics(rows,{today:'2026-10-27',windowDays:21});
assert.equal(r.sessions,3);assert.equal(r.activeDays,2);assert.equal(r.partialSessions,1);
assert.equal(r.volumeKgReps,30*8+32*8+37*8);
assert.equal(r.exerciseProgression[0].trend,'evolucao');
assert.equal(r.exerciseProgression[0].deltaKg,7);assert.equal(r.averageRunKm,3.5);
assert.equal(r.latestWeightKg,65);assert.equal(r.effortRecognized,true);
assert.equal(scoutAnalytics([],{}).interpretation,'sem_dados');
assert.throws(()=>scoutAnalytics(null),TypeError);
console.log('SCOUT_ANALYTICS_V1_PASS',JSON.stringify(r));

