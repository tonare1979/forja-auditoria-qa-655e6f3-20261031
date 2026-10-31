// Regressao D1 atomica: falha de historico nao pode atualizar snapshot.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import worker from '../src/index.js';
const sqlite=new DatabaseSync(':memory:');sqlite.exec('PRAGMA foreign_keys=ON');
const migrations=new URL('../migrations/',import.meta.url);
for(const file of readdirSync(migrations).filter(f=>/^(000[1-7]|0013)_.*\.sql$/.test(f)).sort())
 sqlite.exec(readFileSync(new URL(file,migrations),'utf8'));
const user='atomic-qa-member',token='e'.repeat(64);
const hash=createHash('sha256').update(token).digest('hex');
sqlite.prepare("INSERT INTO users(id,username,display_name,role,password_salt,password_hash,created_at,status,email) VALUES (?,?,?,'member',?,?,?,'active',?)")
 .run(user,'atomic_qa','Atleta QA Atomico','a'.repeat(32),'b'.repeat(64),1761500000,'atomic-qa@example.invalid');
sqlite.prepare('INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)').run(hash,user,1999999999,1761500000);
const statement=(sql,args=[])=>({
 bind(...params){return statement(sql,params)},
 async first(){return sqlite.prepare(sql).get(...args)||null},
 async all(){return {results:sqlite.prepare(sql).all(...args)}},
 async run(){const x=sqlite.prepare(sql).run(...args);return {success:true,meta:{changes:x.changes}}}
});
const DB={
 prepare:sql=>statement(sql),
 async batch(items){
  sqlite.exec('BEGIN');
  try{
   const out=[];
   for(const item of items)out.push(await item.run());
   sqlite.exec('COMMIT');
   return out;
  }catch(e){sqlite.exec('ROLLBACK');throw e}
 }
};
const env={DB,FORJA_AUTH_PEPPER:'pepper-qa-very-long-private-string-123456789'};
const origin='https://qa.invalid';
const snap=i=>({sessions:[{id:'s1',date:'2026-10-15',code:'A',exercises:[{name:'QA supino',sets:[{kg:20+i,reps:10}]}]}],weights:[]});
async function put(rev,data){
 const res=await worker.fetch(new Request(origin+'/api/state',{method:'PUT',headers:{origin,'content-type':'application/json',cookie:'__Host-forja_session='+token},body:JSON.stringify({baseRevision:rev,data})}),env);
 return {status:res.status,data:await res.json()};
}
const state=()=>sqlite.prepare('SELECT revision,payload FROM snapshots WHERE user_id=?').get(user);
const history=()=>sqlite.prepare('SELECT revision,payload FROM snapshot_history WHERE user_id=? ORDER BY revision').all(user);
const a=await put(0,snap(0));assert.equal(a.status,200);assert.equal(state().revision,1);
const b=await put(1,snap(1));assert.equal(b.status,200);assert.equal(state().revision,2);
assert.equal(history().length,1);assert.equal(history()[0].payload,JSON.stringify(snap(0)));
sqlite.prepare('INSERT INTO snapshot_history(user_id,revision,payload,created_at) VALUES(?,?,?,?)').run(user,2,'{"synthetic":"already-present"}',1761500010);
const collision=await put(2,snap(2));
assert.equal(collision.status,500,'history collision must fail closed');
assert.equal(state().revision,2,'failed backup must NOT advance snapshot revision');
assert.equal(state().payload,JSON.stringify(snap(1)),'failed backup must preserve last good workout');
assert.equal(history().length,2);
console.log('ATOMIC_HISTORY_COLLISION_ROLLBACK_PASS');
sqlite.prepare('DELETE FROM snapshot_history WHERE user_id=? AND revision=2').run(user);
const recover=await put(2,snap(2));assert.equal(recover.status,200);
assert.equal(history()[1].payload,JSON.stringify(snap(1)));
const stale=await put(1,snap(55));assert.equal(stale.status,409);
assert.equal(state().revision,3);
console.log('ATOMIC_HISTORY_SUCCESS_AND_STALE_409_PASS');
for(let revision=3;revision<21;revision++){
 const v=await put(revision,snap(revision));assert.equal(v.status,200,'revision '+revision);
}
assert.equal(state().revision,21);
assert.equal(history().length,15,'retain exactly latest 15 revisions');
assert.equal(history()[0].revision,6);
assert.equal(history().at(-1).revision,20);
assert.equal(JSON.parse(state().payload).sessions[0].exercises[0].sets[0].kg,40);
assert.equal(sqlite.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
console.log('ATOMIC_HISTORY_RETENTION_15_AND_INTEGRITY_PASS');
sqlite.close();
