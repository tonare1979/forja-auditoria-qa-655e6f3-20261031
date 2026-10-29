// Real Worker + SQLite. Only the D1 transport is adapted; all data is synthetic.
// Catches a server allowlist rejecting weekend records accepted by the client.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash,randomBytes} from 'node:crypto';
import worker from '../src/index.js';
const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON');
const migrations=new URL('../migrations/',import.meta.url);
for(const file of readdirSync(migrations).filter(f=>/^(000[1-7]|0013)_.*\.sql$/.test(f)).sort())
 db.exec(readFileSync(new URL(file,migrations),'utf8'));
const token=randomBytes(32).toString('hex'),user='weekend-synthetic-member';
db.prepare("INSERT INTO users(id,username,display_name,role,password_salt,password_hash,created_at,status) VALUES(?,?,?,'member',?,?,?,'active')")
 .run(user,'weekend_synthetic','Synthetic',randomBytes(16).toString('hex'),randomBytes(32).toString('hex'),Math.floor(Date.now()/1000));
db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)')
 .run(createHash('sha256').update(token).digest('hex'),user,Math.floor(Date.now()/1000)+600,Math.floor(Date.now()/1000));
const statement=(sql,args=[])=>({
 bind(...p){return statement(sql,p)},
 async first(){return db.prepare(sql).get(...args)||null},
 async all(){return {results:db.prepare(sql).all(...args)}},
 async run(){return {success:true,meta:{changes:Number(db.prepare(sql).run(...args).changes)}}}
});
const DB={prepare:sql=>statement(sql),async batch(items){db.exec('BEGIN');try{const out=[];for(const s of items)out.push(await s.run());db.exec('COMMIT');return out}catch(e){db.exec('ROLLBACK');throw e}}};
const origin='https://synthetic.invalid';
async function call(method,data,authenticated=true){
 const r=await worker.fetch(new Request(origin+'/api/state',{method,headers:{origin,'content-type':'application/json',...(authenticated?{cookie:'__Host-forja_session='+token}:{})},body:data===undefined?undefined:JSON.stringify(data)}),{DB,FORJA_AUTH_PEPPER:randomBytes(32).toString('hex')});
 return {status:r.status,data:await r.json()};
}
let checks=0;const pass=(name,condition)=>{assert.ok(condition,name);checks++;console.log('PASS '+name)};
try{
 const empty={sessions:[],weights:[],checks:{},drafts:{},journal:[],exerciseChoices:{},profile:{},planOverrides:{}};
 const initial=await call('PUT',{baseRevision:0,data:empty});pass('CLEAN_ACCOUNT_SAVES_EMPTY_HISTORY',initial.status===200&&initial.data.revision===1);
 pass('CLEAN_ACCOUNT_HAS_NO_INVENTED_RESULTS',JSON.stringify((await call('GET')).data.data)===JSON.stringify(empty));
 let revision=1,state=structuredClone(empty);
 for(const code of ['SAT','SUN','A','B','CR','C','D']){
  state.sessions.push({id:'synthetic-'+code,code,date:'2026-10-29',status:'partial',exercises:[{name:'Synthetic exercise',sets:[{kg:20,reps:10}]}]});
  const saved=await call('PUT',{baseRevision:revision,data:state});
  pass(code+'_CLOUD_SAVE',saved.status===200&&saved.data.revision===revision+1);revision++;
  const read=await call('GET');pass(code+'_RELOAD_PRESERVES_RECORDS',read.data.revision===revision&&JSON.stringify(read.data.data)===JSON.stringify(state));
 }
 const before=db.prepare('SELECT revision,payload FROM snapshots WHERE user_id=?').get(user);
 const invalid=structuredClone(state);invalid.sessions[0].code='INVALID';
 pass('UNKNOWN_CODE_REJECTED',(await call('PUT',{baseRevision:revision,data:invalid})).status===400);
 pass('STALE_REVISION_REJECTED',(await call('PUT',{baseRevision:revision-1,data:empty})).status===409);
 pass('UNAUTHENTICATED_WRITE_REJECTED',(await call('PUT',{baseRevision:revision,data:empty},false)).status===401);
 pass('REJECTED_WRITES_PRESERVE_ALL_RECORDS',JSON.stringify(db.prepare('SELECT revision,payload FROM snapshots WHERE user_id=?').get(user))===JSON.stringify(before));
 pass('HISTORY_BACKUPS_RETAINED',db.prepare('SELECT count(*) n FROM snapshot_history WHERE user_id=?').get(user).n===7);
 pass('SQLITE_INTEGRITY',db.prepare('PRAGMA integrity_check').get().integrity_check==='ok'&&db.prepare('PRAGMA foreign_key_check').all().length===0);
 console.log('WEEKEND_CLOUD_SYNC_ALL_PASS checks='+checks);
}finally{db.close()}
