import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
const src=fs.readFileSync(new URL('../public/forja-history-records.js',import.meta.url),'utf8');
const ctx={};ctx.globalThis=ctx;vm.runInNewContext(src,ctx);const api=ctx.forjaHistoryRecords;
const ex=(name,id,tag)=>({name,equipment:'maquina',id,tag,sets:[{kg:20,reps:10,note:'nota',id:id+'-s1',tag:tag+'-s1'},{kg:25,reps:8,note:'nota2',id:id+'-s2',tag:tag+'-s2'}]});
const a=ex('Supino','sup','SUPINO'),b=ex('Remada','rem','REMADA');
const session={id:'s1',date:'2026-10-10',code:'A',status:'complete',exercises:[a,b]};
const state={sessions:[session],drafts:{live:'untouched'}};
const submit=(exercises)=>api.apply(state,{...session,exercises},true,'2026-10-30').sessions[0].exercises;
// REMOVE FIRST EXERCISE: original remada metadata persists, supino never migrates.
let out=submit([{name:'Remada',equipment:'maquina',__originEx:1,sets:[{kg:30,reps:10,note:'ok',__originSet:0}]}]);
assert.equal(out.length,1);assert.equal(out[0].id,'rem');assert.equal(out[0].tag,'REMADA');assert.equal(out[0].sets[0].id,'rem-s1');
// REMOVE FIRST SET: second series owns its own metadata.
out=submit([{name:'Remada',equipment:'maquina',__originEx:1,sets:[{kg:26,reps:8,note:'2',__originSet:1}]}]);
assert.equal(out[0].sets[0].id,'rem-s2');assert.equal(out[0].sets[0].tag,'REMADA-s2');
// NEW EXERCISE/SET: no inherited id, metadata, or tag.
out=submit([{name:'Novo',equipment:'maquina',__originEx:-1,sets:[{kg:10,reps:10,note:'nova',__originSet:-1}]}]);
assert.equal(out[0].id,undefined);assert.equal(out[0].tag,undefined);assert.equal(out[0].sets[0].id,undefined);
// REPLACE EXERCISE: even if marker points at supino, different name cannot retain metadata.
out=submit([{name:'Remada',equipment:'maquina',__originEx:0,sets:[{kg:25,reps:10,note:'',__originSet:0}]}]);
assert.equal(out[0].id,undefined);assert.equal(out[0].tag,undefined);
// ORIGINAL STATE AND DRAFT NEVER CHANGED.
assert.equal(state.sessions[0].exercises[0].id,'sup');assert.equal(state.drafts.live,'untouched');
console.log('HISTORY_ORIGIN_PASS');
