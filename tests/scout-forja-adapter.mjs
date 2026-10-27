import assert from 'node:assert/strict';
import {analyzeForjaSnapshot} from '../src/scout-forja-adapter.mjs';
const data={sessions:[
 {date:'2026-10-09',status:'partial',exercises:[{id:'supino',sets:[{kg:20,reps:10}]}]},
 {date:'2026-10-19',status:'complete',exercises:[{id:'supino',sets:[{kg:25,reps:10}]}]},
 ],weights:[{date:'2026-10-14',weight:63},{date:'2026-10-24',weight:64}]};
const copy=structuredClone(data);
const x=analyzeForjaSnapshot(data,{today:'2026-10-27',windowDays:21});
assert.equal(x.partialSessions,1);assert.equal(x.sessions,2);assert.equal(x.volumeKgReps,450);
assert.equal(x.exerciseProgression[0].deltaKg,5);assert.equal(x.latestWeightKg,64);
assert.equal(x.runningDataStatus,'not_mapped');assert.deepEqual(data,copy);
assert.throws(()=>analyzeForjaSnapshot({sessions:[]}),TypeError);
console.log('SCOUT_FORJA_SNAPSHOT_ADAPTER_PASS');
