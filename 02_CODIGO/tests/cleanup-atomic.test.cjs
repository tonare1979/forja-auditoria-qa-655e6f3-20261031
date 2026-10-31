'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite');
const {buildBatch,empty,sha}=require('../limpeza/cleanup-batch.cjs');
function fixture(){
 const sqlite=new DatabaseSync(':memory:');sqlite.exec(`PRAGMA foreign_keys=ON;
CREATE TABLE users (id TEXT PRIMARY KEY,username TEXT,role TEXT,password_salt TEXT,password_hash TEXT,status TEXT);
CREATE TABLE sessions (token_hash TEXT PRIMARY KEY,user_id TEXT);
CREATE TABLE privacy_acceptances(user_id TEXT,notice_version TEXT);
CREATE TABLE snapshots (user_id TEXT PRIMARY KEY,revision INTEGER,payload TEXT,updated_at INTEGER);
CREATE TABLE snapshot_history (user_id TEXT,revision INTEGER,payload TEXT,created_at INTEGER,PRIMARY KEY(user_id,revision));
CREATE TABLE athlete_profiles (user_id TEXT PRIMARY KEY,payload TEXT,updated_at INTEGER);
CREATE TABLE media(id TEXT PRIMARY KEY,user_id TEXT,object_key TEXT,bytes INTEGER,deleted_at INTEGER);
CREATE TABLE body_records(id TEXT);CREATE TABLE reviews(id TEXT);CREATE TABLE messages(id TEXT);`);
 const insert=(sql,...p)=>sqlite.prepare(sql).run(...p);
 for(let n=0;n<5;n++){const u='qa-'+n;insert('INSERT INTO users VALUES(?,?,?,?,?,?)',u,'synthetic-'+n,n===0?'admin':'member','qa-salt-'+n,'qa-verifier-'+n,'active');insert('INSERT INTO sessions VALUES(?,?)','token-hash-'+n,u);insert('INSERT INTO privacy_acceptances VALUES(?,?)',u,'synthetic');}
 for(let n=0;n<3;n++){const u='qa-'+n;insert('INSERT INTO snapshots VALUES(?,?,?,?)',u,6,JSON.stringify({...empty,sessions:[{id:'fictitious',code:'A'}]}),100);insert('INSERT INTO athlete_profiles VALUES(?,?,?)',u,JSON.stringify({tag:'synthetic'}),100)}
 for(let n=0;n<17;n++)insert('INSERT INTO snapshot_history VALUES(?,?,?,?)','qa-'+n%3,n+1,JSON.stringify({fictionalRevision:n}),100);
 insert('INSERT INTO media VALUES(?,?,?,?,?)','qa-media','qa-1','qa-object-must-remain',123,null);
 const tbl=['users','sessions','privacy_acceptances','snapshots','snapshot_history','athlete_profiles','media','body_records','reviews','messages'];
 const rows=t=>sqlite.prepare('SELECT * FROM '+t+' ORDER BY rowid').all();
 const manifest={kind:'RC3_SIGNED_LOCAL_REVIEW_ONLY',candidate:'bdac1a3d2657d9680459e37d91933cd0717e274b',manualIdentityReviewConfirmed:true,remoteAuthorized:false,now:1793290000,rows:Object.fromEntries(tbl.filter(t=>!['sessions','privacy_acceptances'].includes(t)).map(t=>[t,rows(t)]))};
 const db={prepare(sql){return{bind(...args){return {sql,args}}}},async batch(batch,{failAt}={}){sqlite.exec('BEGIN IMMEDIATE');try{for(let i=0;i<batch.length;i++){if(i===failAt)throw Error('INJECTED_FAILURE');sqlite.prepare(batch[i].sql).run(...batch[i].args)}sqlite.exec('COMMIT');return true}catch(e){sqlite.exec('ROLLBACK');throw e}}};
 const take=()=>Object.fromEntries(tbl.map(t=>[t,rows(t)]));return {sqlite,db,manifest,take};
}
let count=0;const T=(name,fn)=>test(name,async()=>{await fn();count++});
T('limpeza atomicamente em transação e histórico zerado',async()=>{const x=fixture(),before=x.take();await x.db.batch(buildBatch(x.db,x.manifest));const after=x.take();assert.equal(after.snapshot_history.length,0);assert(after.snapshots.every(s=>s.revision===7&&sha(JSON.parse(s.payload))===sha(empty)));assert(after.athlete_profiles.every(p=>p.payload==='{}'));assert.equal(after.media[0].deleted_at,x.manifest.now);for(const t of ['users','sessions','privacy_acceptances'])assert.equal(sha(after[t]),sha(before[t]));assert.equal(x.sqlite.prepare('PRAGMA integrity_check').get().integrity_check,'ok')});
T('divergência de contagem aborta sem alterações',async()=>{const x=fixture(),before=x.take();x.manifest.rows.snapshot_history.pop();assert.throws(()=>buildBatch(x.db,x.manifest),/SCOPE_DIVERGENCE/);assert.equal(sha(x.take()),sha(before))});
T('alteração concorrente de histórico aborta e faz rollback',async()=>{const x=fixture();x.sqlite.prepare('UPDATE snapshot_history SET payload=? WHERE revision=2').run('{"changed":true}');const before=x.take();await assert.rejects(()=>x.db.batch(buildBatch(x.db,x.manifest)),/CHECK constraint failed/);assert.equal(sha(x.take()),sha(before))});
T('alteração concorrente da senha aborta',async()=>{const x=fixture();x.sqlite.prepare('UPDATE users SET password_hash=? WHERE id=?').run('changed','qa-1');const before=x.take();await assert.rejects(()=>x.db.batch(buildBatch(x.db,x.manifest)),/CHECK constraint failed/);assert.equal(sha(x.take()),sha(before))});
T('falha durante updates faz rollback de todos os dados',async()=>{const x=fixture(),before=x.take();await assert.rejects(()=>x.db.batch(buildBatch(x.db,x.manifest),{failAt:15}),/INJECTED_FAILURE/);assert.equal(sha(x.take()),sha(before))});
T('manifesto exige revisão humana e bloqueia escopo remoto',async()=>{const x=fixture();x.manifest.manualIdentityReviewConfirmed=false;assert.throws(()=>buildBatch(x.db,x.manifest),/REVIEW_ABSENT/);x.manifest.manualIdentityReviewConfirmed=true;x.manifest.remoteAuthorized=true;assert.throws(()=>buildBatch(x.db,x.manifest),/REMOTE_SCOPE_FORBIDDEN/)});
T('mídia existente alterada aborta',async()=>{const x=fixture();x.sqlite.prepare('UPDATE media SET bytes=999 WHERE id=?').run('qa-media');const before=x.take();await assert.rejects(()=>x.db.batch(buildBatch(x.db,x.manifest)),/CHECK constraint failed/);assert.equal(sha(x.take()),sha(before))});
T('nenhum endpoint, secret ou comunicação remota',async()=>{const x=fixture();const sql=buildBatch(x.db,x.manifest).map(x=>x.sql).join('\n');assert(!/fetch\(|DELETE FROM users|DELETE FROM sessions|DELETE FROM privacy_acceptances|DROP TABLE users|DROP TABLE media/i.test(sql));assert(/CREATE TABLE __forja_rc3_scope_guard_20261029/.test(sql));assert(/DROP TABLE __forja_rc3_scope_guard_20261029/.test(sql));assert(!/CREATE TEMP TABLE/.test(sql))});
process.on('exit',()=>{console.log('ATOMIC_CLEANUP_TESTS_COMPLETED count='+count)});
