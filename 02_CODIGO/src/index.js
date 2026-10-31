import {passwordReset} from './password-reset.js';
import {adminRecovery} from './admin-recovery.js';
import {features} from './features.js';
import {normalizeCpf} from './cpf.js';
import {bootstrap} from './bootstrap.js';
// FORJA 73 V9 — Workers + D1; sem dependências externas.
// Este arquivo NÃO deve ser colocado em public/ ou exposto como estático.
const enc = new TextEncoder();
const jsonHeaders = {'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','x-frame-options':'DENY'};
const TTL = 30*24*3600;
// A derivação PBKDF2 (210k) acontece no navegador, preservando o limite de CPU do Workers Free.
const MAX_BODY = 650000;
const now = () => Math.floor(Date.now()/1000);
const reply = (o,status=200,headers={}) => new Response(JSON.stringify(o),{status,headers:{...jsonHeaders,...headers}});
const hex = buf=>[...new Uint8Array(buf)].map(v=>v.toString(16).padStart(2,'0')).join('');
const randomHex = n=>hex(crypto.getRandomValues(new Uint8Array(n)));
const sha256 = async value => hex(await crypto.subtle.digest('SHA-256', enc.encode(value)));
const isHex = (s,n) => typeof s==='string' && new RegExp(`^[a-f0-9]{${n}}$`).test(s);
async function verifier(env,proof){if(!env.FORJA_AUTH_PEPPER||env.FORJA_AUTH_PEPPER.length<32)throw Error('Segredo de autenticação não configurado');const key=await crypto.subtle.importKey('raw',enc.encode(env.FORJA_AUTH_PEPPER),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,enc.encode(proof)))}
const okName = s=>typeof s==='string'&&/^[a-z0-9_.-]{3,32}$/.test(s);
// O acesso aceita o identificador pessoal ou o e-mail cadastrado; cadastro continua exigindo username.
const okLoginIdentity = s=>okName(s)||(typeof s==='string'&&s.length<=200&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
const noop = () => undefined;
function err(status,code,message){return reply({error:code,message},status)}
async function body(req){if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new Error('JSON obrigatório');const cl=Number(req.headers.get('content-length')||0);if(cl>MAX_BODY)throw new Error('Corpo muito grande');const text=await req.text();if(text.length>MAX_BODY)throw new Error('Corpo muito grande');return JSON.parse(text)}
function sameOrigin(req){const o=req.headers.get('origin');return !!o && o === new URL(req.url).origin}
function cookie(token){return `__Host-forja_session=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${TTL}`}
function clearCookie(){return '__Host-forja_session=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0'}
function cleanUser(u){return {username:u.username,displayName:u.display_name,role:u.role}}
async function who(req,db){const val=req.headers.get('cookie')?.match(/(?:^|;\s*)__Host-forja_session=([a-f0-9]{64})(?:;|$)/)?.[1];if(!val)return null;const h=await sha256(val);return db.prepare('SELECT users.id,users.username,users.display_name,users.role FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=? AND expires_at>? AND users.status=\'active\'').bind(h,now()).first()}
async function addSession(db,userId){const token=randomHex(32),h=await sha256(token),t=now();await db.prepare('INSERT INTO sessions (token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?)').bind(h,userId,t+TTL,t).run();return token}
async function ipKey(req){
 const ip=req.headers.get('CF-Connecting-IP')||'unknown';
 return sha256('forja-login-ip-v1:'+ip);
}
async function rate(db,key){
 const row=await db.prepare('SELECT blocked_until FROM login_ip_throttle WHERE ip_hash=?').bind(key).first();
 return !!row&&row.blocked_until>now();
}
async function fail(db,key){
 const t=now();
 // One atomic UPSERT, no read/modify/write race. 15-minute rolling approximation;
 // throttles caller IP, never the athlete account itself.
 await db.prepare(`INSERT INTO login_ip_throttle(ip_hash,failed_count,window_start,blocked_until)
 VALUES (?,1,?,0) ON CONFLICT(ip_hash) DO UPDATE SET
 failed_count=CASE WHEN ?-window_start>=900 THEN 1 ELSE failed_count+1 END,
 window_start=CASE WHEN ?-window_start>=900 THEN ? ELSE window_start END,
 blocked_until=CASE WHEN ?-window_start>=900 THEN 0
 WHEN failed_count+1>=12 THEN ?+MIN(900,15*(1 << MIN(6,failed_count-11))) ELSE blocked_until END`).bind(key,t,t,t,t,t,t).run();
}
async function login(req,db,env){
 const {username,proof}=await body(req),name=String(username||'').trim().toLowerCase();
 if(!okLoginIdentity(name)||!isHex(proof,64))return err(401,'LOGIN_INVALIDO','Credenciais inválidas.');
 const key=await ipKey(req);
 if(await rate(db,key))return err(429,'TEMPORARIAMENTE_BLOQUEADO','Muitas tentativas desta conexão. Tente mais tarde.');
 const u=await db.prepare('SELECT * FROM users WHERE username=? OR email=?').bind(name,name).first();
 // Uniform response avoids revealing pending or blocked usernames via login.
 const h=await verifier(env,proof);
 const matched=!!(u&&u.status==='active'&&h===u.password_hash);
 if(!matched){await fail(db,key);return err(401,'LOGIN_INVALIDO','Credenciais inválidas.');}
 await db.prepare('DELETE FROM login_ip_throttle WHERE ip_hash=?').bind(key).run();
 const token=await addSession(db,u.id);
 return reply({ok:true,user:cleanUser(u)},200,{'set-cookie':cookie(token)});
}
async function setup(req,env){const db=env.DB,p=await body(req);if(!env.FORJA_SETUP_KEY||typeof env.FORJA_SETUP_KEY!=='string'||env.FORJA_SETUP_KEY.length<20)return err(503,'CONFIGURACAO_PENDENTE','Chave de instalação não configurada no Worker.');const any=await db.prepare('SELECT id FROM users LIMIT 1').first();if(any)return err(403,'CONFIGURACAO_ENCERRADA','A primeira conta já foi criada.');if(p.setupKey!==env.FORJA_SETUP_KEY)return err(403,'CHAVE_INVALIDA','Chave de instalação incorreta.');const username=String(p.username||'').toLowerCase(),displayName=String(p.displayName||'').trim();if(!okName(username)||!isHex(p.proof,64)||!isHex(p.salt,32)||!displayName||displayName.length>70)return err(400,'DADOS_INVALIDOS','Usuário (3–32 caracteres), nome e senha com pelo menos 6 caracteres obrigatórios.');const salt=p.salt,hash=await verifier(env,p.proof),id=crypto.randomUUID(),t=now();await db.prepare('INSERT INTO users (id,username,display_name,role,password_salt,password_hash,created_at) VALUES (?,?,?,?,?,?,?)').bind(id,username,displayName,'admin',salt,hash,t).run();const token=await addSession(db,id);return reply({ok:true,user:{username,displayName,role:'admin'}},201,{'set-cookie':cookie(token)})}
async function newUser(req,db,env){const p=await body(req),username=String(p.username||'').toLowerCase(),displayName=String(p.displayName||'').trim();if(!okName(username)||!isHex(p.proof,64)||!isHex(p.salt,32)||!displayName||displayName.length>70)return err(400,'DADOS_INVALIDOS','Nome de usuário, nome de exibição e senha de 6 ou mais caracteres necessários.');if(await db.prepare('SELECT id FROM users WHERE username=?').bind(username).first())return err(409,'USUARIO_EXISTENTE','Nome de usuário indisponível.');const email=String(p.email||'').trim().toLowerCase(),cpf=normalizeCpf(p.cpf);if(!cpf)return err(400,'CPF_INVALIDO','CPF obrigatório: confira os 11 números.');if(!/^\S+@\S+\.\S+$/.test(email)||email.length>200)return err(400,'EMAIL_INVALIDO','Informe o e-mail do atleta para recuperação de acesso.');if(await db.prepare('SELECT id FROM users WHERE email=?').bind(email).first())return err(409,'EMAIL_EXISTENTE','E-mail já cadastrado.');if(await db.prepare('SELECT id FROM users WHERE cpf=?').bind(cpf).first())return err(409,'CPF_EXISTENTE','CPF já cadastrado.');const salt=p.salt,hash=await verifier(env,p.proof),recoveryKey=randomHex(24);const inserted=await db.prepare("INSERT INTO users (id,username,display_name,role,password_salt,password_hash,created_at,status,email,recovery_hash,cpf) SELECT ?,?,?,'member',?,?,?,'active',?,?,? WHERE (SELECT COUNT(*) FROM users WHERE role='member' AND status IN ('active','blocked'))<11").bind(crypto.randomUUID(),username,displayName,salt,hash,now(),email,await sha256(recoveryKey),cpf).run();if(inserted.meta.changes!==1)return err(409,'LIMITE_ATLETAS','Limite de 11 atletas atingido.');return reply({ok:true,username,recoveryKey},201)}
const validState=s=>!!(s&&typeof s==='object'&&!Array.isArray(s)&&Array.isArray(s.sessions)&&Array.isArray(s.weights)&&s.sessions.length<10000&&s.weights.length<10000&&s.sessions.every(x=>x&&typeof x.id==='string'&&['A','B','CR','C','D','SAT','SUN'].includes(x.code)&&typeof x.date==='string'&&Array.isArray(x.exercises)&&x.exercises.length<=60&&x.exercises.every(e=>e&&typeof e.name==='string'&&Array.isArray(e.sets)&&e.sets.every(v=>v&&Number.isFinite(Number(v.kg))&&Number(v.kg)>=0&&Number.isFinite(Number(v.reps))&&Number(v.reps)>0)))&&s.weights.every(w=>w&&typeof w.date==='string'&&Number.isFinite(Number(w.weight))&&Number(w.weight)>=20&&Number(w.weight)<=300)&&(s.journal===undefined||Array.isArray(s.journal))&&(s.checks===undefined||s.checks&&typeof s.checks==='object'&&!Array.isArray(s.checks))&&(s.drafts===undefined||s.drafts&&typeof s.drafts==='object'&&!Array.isArray(s.drafts))&&(s.extraExercises===undefined||s.extraExercises&&typeof s.extraExercises==='object'&&!Array.isArray(s.extraExercises))&&(s.deezerPlaylist===undefined||(typeof s.deezerPlaylist==='string'&&s.deezerPlaylist.length<=600))&&(s.exerciseChoices===undefined||(s.exerciseChoices&&typeof s.exerciseChoices==='object'&&!Array.isArray(s.exerciseChoices))));
async function getState(db,u){const r=await db.prepare('SELECT revision,payload,updated_at FROM snapshots WHERE user_id=?').bind(u.id).first();return reply({revision:r?.revision||0,updatedAt:r?.updated_at||null,data:r?JSON.parse(r.payload):null})}
async function putState(req,db,u){const p=await body(req);if(!Number.isSafeInteger(p.baseRevision)||p.baseRevision<0||!validState(p.data))return err(400,'DADOS_INVALIDOS','Revisão ou dados inválidos.');const payload=JSON.stringify(p.data);if(payload.length>MAX_BODY)return err(413,'LIMITE_DE_DADOS','Limite de dados excedido.');const t=now();if(p.baseRevision===0){const r=await db.prepare('INSERT OR IGNORE INTO snapshots (user_id,revision,payload,updated_at) VALUES (?,1,?,?)').bind(u.id,payload,t).run();if(r.meta.changes===1)return reply({ok:true,revision:1,updatedAt:t});}
else {
 const prev=await db.prepare('SELECT revision FROM snapshots WHERE user_id=?').bind(u.id).first();
 if(prev?.revision===p.baseRevision){
  // D1 batch is transactional: NEVER confirm a new workout revision without its recovery snapshot.
  // The plain INSERT deliberately fails on an existing (user_id,revision), rolling back the batch.
  const results=await db.batch([
   db.prepare('INSERT INTO snapshot_history (user_id,revision,payload,created_at) SELECT user_id,revision,payload,? FROM snapshots WHERE user_id=? AND revision=?').bind(t,u.id,p.baseRevision),
   db.prepare('UPDATE snapshots SET revision=revision+1,payload=?,updated_at=? WHERE user_id=? AND revision=?').bind(payload,t,u.id,p.baseRevision),
   db.prepare('DELETE FROM snapshot_history WHERE user_id=? AND revision NOT IN (SELECT revision FROM snapshot_history WHERE user_id=? ORDER BY revision DESC LIMIT 15)').bind(u.id,u.id)
  ]);
  if(results[0]?.meta?.changes===1&&results[1]?.meta?.changes===1)return reply({ok:true,revision:p.baseRevision+1,updatedAt:t});
 }
}
const latest=await db.prepare('SELECT revision,payload,updated_at FROM snapshots WHERE user_id=?').bind(u.id).first();if(latest&&latest.payload===payload)return reply({ok:true,revision:latest.revision,updatedAt:latest.updated_at,replayed:true});return reply({error:'REVISAO_DIVERGENTE',message:'A nuvem foi alterada por outro dispositivo. Seus registros locais não foram descartados.',revision:latest?.revision||0},409)}
export default {async fetch(req,env){const url=new URL(req.url),path=url.pathname;try{
 if(!path.startsWith('/api/'))return env.ASSETS.fetch(req);
 if(!env.DB)return err(503,'DB_AUSENTE','Banco D1 não configurado.');
 if(req.method!=='GET' && !sameOrigin(req))return err(403,'ORIGEM_INVALIDA','Requisição de outra origem bloqueada.');
 if(path==='/api/health'&&req.method==='GET')return reply({ok:true,app:'FORJA',api:1});
 if(path==='/api/bootstrap/status'&&req.method==='GET'){const one=await env.DB.prepare('SELECT id FROM users LIMIT 1').first();return reply({needsSetup:!one,approvalSupported:true});}
 if(path.startsWith('/api/bootstrap/'))return await bootstrap(req,env,{body,verifier,reply,err,okName,isHex,randomHex,now,sha256,addSession,cookie});
 if(path.startsWith('/api/auth/reset/'))return await passwordReset(req,env,{body,reply,err,sha256,verifier,isHex,randomHex,now});
 if(path.startsWith('/api/admin-recovery/'))return await adminRecovery(req,env,{body,verifier,reply,err,isHex,randomHex,now,sha256});
 if(path==='/api/auth/salt'&&req.method==='GET'){const name=String(url.searchParams.get('username')||'').toLowerCase();if(!okLoginIdentity(name))return err(400,'DADOS_INVALIDOS','Usuário ou e-mail inválido.');const row=await env.DB.prepare('SELECT password_salt FROM users WHERE username=? OR email=?').bind(name,name).first();const dummy=(await verifier(env,'fake-salt:'+name)).slice(0,32);return reply({salt:row?.password_salt||dummy});}
 if(path==='/api/auth/setup'&&req.method==='POST')return await setup(req,env);
 if(path==='/api/auth/login'&&req.method==='POST')return await login(req,env.DB,env);
 const helpers={body,reply,err,sha256,verifier,isHex,okName,now,randomHex,addSession,cookie};if(path.startsWith('/api/accounts/recover')||(path==='/api/accounts/register'&&req.method==='POST')){const publicResult=await features(req,env,null,helpers);if(publicResult)return publicResult;}const u=await who(req,env.DB);
 if(!u)return err(401,'NAO_AUTENTICADO','Entre na sua conta para usar a nuvem.');
 const featureResult=await features(req,env,u,helpers);if(featureResult)return featureResult;
 if(path==='/api/auth/me'&&req.method==='GET')return reply({user:cleanUser(u)});
 if(path==='/api/auth/logout'&&req.method==='POST'){const val=req.headers.get('cookie')?.match(/__Host-forja_session=([a-f0-9]{64})/)?.[1];if(val)await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256(val)).run();return reply({ok:true},200,{'set-cookie':clearCookie()})}
 if(path==='/api/users'&&req.method==='POST'&&u.role==='admin')return await newUser(req,env.DB,env);
 if(path==='/api/state'&&req.method==='GET')return await getState(env.DB,u);
 if(path==='/api/state'&&req.method==='PUT')return await putState(req,env.DB,u);
 return err(404,'NAO_ENCONTRADO','Rota não encontrada.');
 }catch(e){if(e instanceof SyntaxError||e?.message==='JSON obrigatório'||e?.message==='Corpo muito grande')return err(400,'REQUISICAO_INVALIDA','JSON inválido ou muito grande.');console.error('FORJA API',path,String(e));return err(500,'FALHA_INTERNA','Não foi possível concluir a operação. Os dados locais permanecem no aparelho.')}}};
