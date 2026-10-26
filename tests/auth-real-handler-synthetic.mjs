import assert from 'node:assert/strict';
import {pbkdf2Sync,createHmac,createHash,randomBytes} from 'node:crypto';
import worker from '../src/index.js';
const origin='https://qa.invalid',salt=randomBytes(16).toString('hex'),password='qa-real-handler-2026';
const pepper=randomBytes(48).toString('hex');
const proof=pbkdf2Sync(password,Buffer.from(salt,'hex'),210000,32,'sha256').toString('hex');
const user={id:'synthetic-admin-id',username:'qa_admin',email:'qa-admin@example.invalid',password_salt:salt,password_hash:createHmac('sha256',pepper).update(proof).digest('hex'),display_name:'QA Manual',role:'admin',status:'active'};
const sessions=new Map();
const db={prepare(sql){return {bind(...args){return {
 async first(){
  if(sql.includes('FROM login_ip_throttle'))return null;
  if(sql.includes('SELECT password_salt FROM users'))return args[0]===user.username||args[1]===user.email?{password_salt:user.password_salt}:null;
  if(sql.includes('SELECT * FROM users WHERE'))return args[0]===user.username||args[1]===user.email?user:null;
  if(sql.includes('FROM sessions JOIN users')){const v=sessions.get(args[0]);return v?{id:user.id,username:user.username,display_name:user.display_name,role:user.role}:null;}
  throw Error('Unexpected SQL first: '+sql);
 },
 async run(){
  if(sql.startsWith('INSERT INTO sessions')){sessions.set(args[0],true);return {meta:{changes:1}};}
  if(sql.startsWith('DELETE FROM login_ip_throttle')||sql.startsWith('INSERT INTO login_ip_throttle'))return {meta:{changes:1}};
  throw Error('Unexpected SQL run: '+sql);
 }
  };
  }};
}};
const env={DB:db,FORJA_AUTH_PEPPER:pepper};
async function call(path,method='GET',body,cookie=''){const r=await worker.fetch(new Request(origin+path,{method,headers:{...(method==='POST'?{origin,'content-type':'application/json'}:{}),...(cookie?{cookie}:{})},body:body?JSON.stringify(body):undefined}),env);return {status:r.status,json:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
const check=(name,ok)=>{assert(ok,name);console.log(name+'_PASS')};
const bad=await call('/api/auth/login','POST',{username:user.email,proof:'0'.repeat(64)});
check('BAD_PASSWORD_REJECTED',bad.status===401);
for(const identifier of [user.username,user.email]){
 const saltResponse=await call('/api/auth/salt?username='+encodeURIComponent(identifier));
 check('SALT_BY_'+(identifier.includes('@')?'EMAIL':'USERNAME'),saltResponse.status===200&&saltResponse.json.salt===salt);
 const login=await call('/api/auth/login','POST',{username:identifier,proof});
 check('LOGIN_BY_'+(identifier.includes('@')?'EMAIL':'USERNAME'),login.status===200&&login.json.user.username===user.username&&login.cookie?.startsWith('__Host-forja_session='));
 const me=await call('/api/auth/me','GET',undefined,login.cookie);
 check('COOKIE_SESSION_BY_'+(identifier.includes('@')?'EMAIL':'USERNAME'),me.status===200&&me.json.user.username===user.username);
}
console.log('REAL_AUTH_HANDLER_SYNTHETIC_PASS');
