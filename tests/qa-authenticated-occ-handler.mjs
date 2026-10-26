// Authenticated two-session conflict test against the actual Worker handler,
// with a disposable in-memory D1 adapter. Never contacts or mutates remote D1.
import assert from 'node:assert/strict';
import {pbkdf2Sync,createHmac,randomBytes} from 'node:crypto';
import worker from '../src/index.js';
const origin='https://qa.invalid';
const password='disposable-qa-password', salt=randomBytes(16).toString('hex'),pepper=randomBytes(48).toString('hex');
const proof=pbkdf2Sync(password,Buffer.from(salt,'hex'),210000,32,'sha256').toString('hex');
const user={id:'synthetic-u1',username:'qa_two_session',email:'qa_two_session@example.invalid',password_salt:salt,password_hash:createHmac('sha256',pepper).update(proof).digest('hex'),display_name:'QA Two Session',role:'member',status:'active'};
const sessions=new Map(),snapshots=new Map(),history=[];
const db={prepare(sql){let a=[];const q={
 bind(...v){a=v;return q},
 async first(){
  if(sql.includes('FROM login_ip_throttle'))return null;
  if(sql.includes('SELECT * FROM users WHERE'))return a[0]===user.username||a[1]===user.email?user:null;
  if(sql.includes('FROM sessions JOIN users'))return sessions.get(a[0])===user.id?{id:user.id,username:user.username,display_name:user.display_name,role:user.role}:null;
  if(sql.includes('FROM snapshots WHERE user_id'))return snapshots.get(a[0])||null;
  throw Error('UNEXPECTED_FIRST '+sql);
 },
 async run(){
  if(sql.startsWith('INSERT INTO sessions')){sessions.set(a[0],a[1]);return {meta:{changes:1}};}
  if(sql.startsWith('DELETE FROM login_ip_throttle'))return {meta:{changes:1}};
  if(sql.startsWith('INSERT OR IGNORE INTO snapshots')){if(snapshots.has(a[0]))return {meta:{changes:0}};snapshots.set(a[0],{revision:1,payload:a[1],updated_at:a[2]});return {meta:{changes:1}};}
  if(sql.startsWith('UPDATE snapshots SET revision=')){const x=snapshots.get(a[2]);if(!x||x.revision!==a[3])return {meta:{changes:0}};snapshots.set(a[2],{revision:x.revision+1,payload:a[0],updated_at:a[1]});return {meta:{changes:1}};}
  if(sql.startsWith('INSERT OR IGNORE INTO snapshot_history')){history.push({user_id:a[0],revision:a[1],payload:a[2],created_at:a[3]});return {meta:{changes:1}};}
  if(sql.startsWith('DELETE FROM snapshot_history'))return {meta:{changes:0}};
  throw Error('UNEXPECTED_RUN '+sql);
 }
};return q}};
const env={DB:db,FORJA_AUTH_PEPPER:pepper};
async function call(path,method='GET',data,cookie=''){
 const res=await worker.fetch(new Request(origin+path,{method,headers:{...(method==='PUT'||method==='POST'?{origin,'content-type':'application/json'}:{}),...(cookie?{cookie}:{})},body:data===undefined?undefined:JSON.stringify(data)}),env);
 return {status:res.status,json:await res.json(),cookie:res.headers.get('set-cookie')?.split(';')[0]};
}
function pass(name,condition){assert(condition,name);console.log('PASS '+name)}
const loginA=await call('/api/auth/login','POST',{username:user.username,proof});
const loginB=await call('/api/auth/login','POST',{username:user.username,proof});
pass('TWO_AUTHENTICATED_SESSIONS',loginA.status===200&&loginB.status===200&&loginA.cookie!==loginB.cookie);
const a=loginA.cookie,b=loginB.cookie;
pass('UNAUTHENTICATED_CLOUD_READ_REJECTED',(await call('/api/state')).status===401);
const a0=await call('/api/state','GET',undefined,a),b0=await call('/api/state','GET',undefined,b);
pass('INDEPENDENT_SESSIONS_START_SAME_BASE',a0.json.revision===0&&b0.json.revision===0&&a0.json.data===null);
const initial={sessions:[{id:'s0',date:'2026-10-26',code:'A',exercises:[{name:'QA',sets:[{kg:20,reps:10}]}]}],weights:[],journal:[]};
const clone=x=>JSON.parse(JSON.stringify(x));
const put=(cookie,revision,data)=>call('/api/state','PUT',{baseRevision:revision,data},cookie);
const first=await put(a,0,initial);
pass('FIRST_SESSION_WRITE_SUCCEEDED',first.status===200&&first.json.revision===1);
const staleInit=clone(initial);staleInit.sessions[0].exercises[0].sets[0].kg=22;
const stale=await put(b,0,staleInit);
pass('STALE_SECOND_SESSION_FIRST_UPLOAD_BLOCKED',stale.status===409&&stale.json.error==='REVISAO_DIVERGENTE');
const read=await call('/api/state','GET',undefined,b);
pass('CLOUD_DATA_PRESERVED_AFTER_409',read.json.revision===1&&read.json.data.sessions[0].exercises[0].sets[0].kg===20);
const replay=await put(b,0,initial);
pass('IDEMPOTENT_REPLAY_ACCEPTED',replay.status===200&&replay.json.replayed===true&&replay.json.revision===1);
const left=clone(read.json.data),right=clone(read.json.data);
left.sessions.push({id:'sa',code:'B',date:'2026-10-27',exercises:[{name:'QA2',sets:[{kg:25,reps:8}]}]});
right.sessions.push({id:'sb',code:'C',date:'2026-10-28',exercises:[{name:'QA3',sets:[{kg:26,reps:9}]}]});
const wa=await put(a,1,left),wb=await put(b,1,right);
pass('CONCURRENT_APPENDS_RETURN_SUCCESS_AND_CONFLICT',wa.status===200&&wa.json.revision===2&&wb.status===409);
const latest=await call('/api/state','GET',undefined,b);
const merged=clone(latest.json.data);merged.sessions.push(right.sessions[1]);
const res=await put(b,2,merged);
const after=await call('/api/state','GET',undefined,a);
pass('SAFE_MANUAL_MERGE_RETAINS_BOTH_SESSIONS',res.status===200&&res.json.revision===3&&new Set(after.json.data.sessions.map(s=>s.id)).size===3);
const pc=clone(after.json.data),phone=clone(after.json.data);
pc.sessions[0].exercises[0].sets[0].kg=31;phone.sessions[0].exercises[0].sets[0].kg=32;
const pcWrite=await put(a,3,pc),phoneWrite=await put(b,3,phone);
const preserved=await call('/api/state','GET',undefined,b);
pass('SAME_RECORD_STALE_EDIT_REJECTED_NO_OVERWRITE',pcWrite.status===200&&phoneWrite.status===409&&preserved.json.data.sessions[0].exercises[0].sets[0].kg===31);
pass('SNAPSHOT_HISTORY_RETAINED',history.map(h=>h.revision).join(',')==='1,2,3');
console.log('AUTHENTICATED_OCC_REAL_WORKER_HANDLER_DISPOSABLE_D1_PASS');
