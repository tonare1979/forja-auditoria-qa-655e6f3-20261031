// FORJA RC3: prova de cadastro publico pendente com CPF obrigatório.
// Primeiro executar antes da correção: deve FALHAR, mostrando autenticação 401.
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import worker from '../src/index.js';
const origin='https://qa.invalid';
const pepper=randomBytes(48).toString('hex');
const inserted=[];
const ipLimit=[];
const db={prepare(sql){let v=[];const q={
 bind(...args){v=args;return q},
 async first(){
  if(sql.includes('FROM sessions JOIN users'))return null;
  if(sql.includes('SELECT id FROM users WHERE'))return inserted.some(u=>u.username===v[0]||u.email===v[1]||u.cpf===v[2])?{id:'existing'}:null;
  if(sql.includes('SELECT * FROM users WHERE'))return inserted.find(u=>u.username===v[0]||u.email===v[1])||null;
  if(sql.includes('FROM login_ip_throttle'))return null;
  throw Error('UNEXPECTED_SQL_FIRST '+sql);
 },
 async run(){
  if(sql.startsWith('INSERT INTO registration_limits')){ipLimit.push(v[0]);return {meta:{changes:1}};}
  if(sql.includes('INSERT INTO users')){inserted.push({username:v[1],displayName:v[2],cpf:v.at(-1),email:v[7],status:'pending',role:'member'});return {meta:{changes:1}};}
  if(sql.startsWith('INSERT INTO login_ip_throttle'))return {meta:{changes:1}};
  throw Error('UNEXPECTED_SQL_RUN '+sql);
 }
 };return q;}};
const env={DB:db,FORJA_AUTH_PEPPER:pepper};
const registerBody={username:'qa_signup01',displayName:'Atleta QA',email:'qa_signup01@example.invalid',salt:'a'.repeat(32),proof:'b'.repeat(64),cpf:'52998224725'};
async function call(path,body,ip='203.0.113.7'){
 const r=await worker.fetch(new Request(origin+path,{method:'POST',headers:{origin,'content-type':'application/json',...(ip?{'CF-Connecting-IP':ip}:{})},body:JSON.stringify(body)}),env);
 return {status:r.status,body:await r.json()};
}
const missing=await call('/api/accounts/register',{...registerBody,cpf:undefined});
assert.equal(missing.status,400,'CPF ausente deve ser recusado antes de gravar');
assert.equal(inserted.length,0);
const invalid=await call('/api/accounts/register',{...registerBody,cpf:'11111111111'});
assert.equal(invalid.status,400,'CPF matematicamente invalido deve ser recusado');
assert.equal(inserted.length,0);
const success=await call('/api/accounts/register',registerBody);
assert.equal(success.status,201,'Visitante deve conseguir solicitar cadastro SEM ser administrador: '+JSON.stringify(success.body));
assert.equal(success.body.status,'pending');
assert.match(success.body.recoveryKey,/^[a-f0-9]{48}$/);
assert.equal(inserted.length,1);
assert.equal(inserted[0].cpf,'52998224725');
const duplicate=await call('/api/accounts/register',registerBody);
assert.equal(duplicate.status,409,'duplicacao de CPF, email ou username deve ser bloqueada');
const missingIp=await call('/api/accounts/register',{...registerBody,username:'qa_noip'},'');
assert.equal(missingIp.status,400,'sem IP de origem verificado nao permitir cadastro');
console.log('RC3_GUEST_REGISTRATION_PENDING_CPF_SECURITY_PASS');
