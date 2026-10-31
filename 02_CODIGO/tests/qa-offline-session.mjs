import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync('public/index.html','utf8');
const section=(a,b)=>html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)));
const source=section('function cmRead()', 'function nuvem()')+section('// Local session continuity is not server authorization.', 'async function cloudProof(')+section('async function cloudLogin(){','async function cloudLogout(){')+section('async function cloudLogout()', 'async function cloudCreateMember(')+section('async function cloudSync(', "window.addEventListener('online'");
function fixture(){const store=new Map(),calls=[];const c={cloudTimer:null,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},CLOUD_KEY:'meta',SESSION_KEY:'session',cloud:{user:null,linked:false,dirty:false,conflict:false,working:false},navigator:{onLine:true},state:{sessions:[{id:'cached'}]},emptyState:()=>({}),tab:'painel',render(){},nuvem(){},welcomeCover(){c.cover=true},setTimeout(){},clearTimeout(){},cloudBaselineSave(){},cloudBaselineRead:()=>null,flushReviewOutbox:async()=>{},api:async(path,method)=>{calls.push([path,method]);if(c.offline)throw new TypeError('Load failed');if(path==='/api/auth/me')return {user:c.remoteUser||{username:'athlete',displayName:'Atleta',role:'member'}};return {needsSetup:false,revision:3}},calls,store};vm.createContext(c);const api=c.api;vm.runInContext(source,c);c.api=api;return c}
async function authenticated(){const c=fixture();c.cloudLoginOK({username:'athlete',displayName:'Atleta',role:'member'});c.cloud.linked=true;c.cloud.revision=2;c.cmSave();return c}
{
 const c=await authenticated();c.cloud.user=null;c.offline=true;await c.cloudAutoBoot();assert.equal(c.cloud.user?.username,'athlete','network failure must retain authenticated offline athlete');assert.equal(c.state.sessions[0].id,'cached');c.cloudDirty();assert.equal(JSON.parse(c.store.get('meta')).dirty,true);c.offline=false;await c.cloudSync();assert(c.calls.some(([p,m])=>p==='/api/state'&&m==='PUT'),'queued local changes sync after reconnect');assert(c.calls.findIndex(([p])=>p==='/api/auth/me')<c.calls.findIndex(([p])=>p==='/api/state'));console.log('OFFLINE_BOOT_LOCAL_SAVE_RECONNECT_PASS');
}
{
 const c=await authenticated();c.offline=true;await c.cloudLogout();assert.equal(c.cloud.user,null,'offline logout must close local session');c.cloud.user=null;await c.cloudAutoBoot();assert.equal(c.cloud.user,null,'offline logout cannot reopen cached account');c.offline=false;await c.cloudAutoBoot();assert.equal(c.cloud.user,null,'remaining cookie must not reopen explicitly logged-out account');assert(c.calls.some(([p])=>p==='/api/auth/logout'));console.log('EXPLICIT_OFFLINE_LOGOUT_PASS');
}
{
 const c=await authenticated();c.cloud.user=null;c.api=async p=>{if(p==='/api/auth/me')throw Object.assign(new Error('expired'),{status:401});return {needsSetup:false}};await c.cloudAutoBoot();assert.equal(c.cloud.user,null);c.offline=true;c.api=async()=>{throw new TypeError('offline')};await c.cloudAutoBoot();assert.equal(c.cloud.user,null,'401 must invalidate offline session');console.log('AUTHORITATIVE_401_PASS');
}
{
 const c=await authenticated();c.offline=true;c.cloud.user=null;await c.cloudAutoBoot();c.offline=false;c.remoteUser={username:'other'};c.cloud.dirty=true;await c.cloudSync();assert(!c.calls.some(([p])=>p==='/api/state'),'different cookie account must never receive local athlete data');assert.equal(c.state.sessions[0].id,'cached');console.log('RECONNECT_ACCOUNT_ISOLATION_PASS');
}
{
 const c=fixture();c.store.set('meta',JSON.stringify({username:'athlete',linked:true}));c.offline=true;await c.cloudAutoBoot();assert.equal(c.cloud.user,null,'sync metadata alone is not an authenticated offline session');console.log('NO_SESSION_MARKER_STAYS_LOGGED_OUT_PASS');
}
{
 const c=fixture();c.cloudLoginOK({username:'athlete'});c.cloud.user=null;c.offline=true;await c.cloudAutoBoot();assert.equal(c.cloud.user.username,'athlete');assert.equal(c.cloud.linked,false);console.log('UNLINKED_AUTHENTICATED_OFFLINE_PASS');
}
{
 const c=await authenticated();c.cloud.user=null;let resolveMe;c.api=p=>p==='/api/auth/me'?new Promise(r=>resolveMe=r):Promise.resolve({});const boot=c.cloudAutoBoot();const logout=c.cloudLogout();resolveMe({user:{username:'athlete'}});await boot;assert.equal(c.cloud.user,null,'late me response cannot revive logged out athlete');console.log('LATE_ME_AFTER_LOGOUT_PASS');
}
{
 const c=await authenticated();let resolveLogout;c.api=()=>new Promise(r=>resolveLogout=r);const logout=c.cloudLogout();c.cloudLoginOK({username:'athlete'});resolveLogout({});await logout;assert.equal(JSON.parse(c.store.get('session')).user?.username,'athlete','late logout result cannot overwrite a fresh login marker');console.log('LATE_LOGOUT_AFTER_LOGIN_PASS');
}

{
 const c=await authenticated();let release;const calls=[];c.$=id=>({value:id==='cloudUser'?'athlete':'password'});c.cloudProof=async()=> 'proof';c.cloudMessage=()=>{};c.api=async p=>{calls.push(p);if(p==='/api/auth/logout')await new Promise(r=>release=r);if(p.includes('/salt'))return {salt:'qa'};return {user:{username:'athlete'}}};const logout=c.cloudLogout();const login=c.cloudLogin();await Promise.resolve();assert.deepEqual(calls,['/api/auth/logout'],'new login must wait for pending server logout');release();await logout;await login;assert(calls.indexOf('/api/auth/login')>calls.indexOf('/api/auth/logout'));assert.equal(JSON.parse(c.store.get('session')).user.username,'athlete');console.log('LOGIN_SERIALIZES_PENDING_LOGOUT_PASS');
}
{
 const c=await authenticated();c.api=async p=>{if(p==='/api/auth/logout')throw Object.assign(Error('expired'),{status:401});return {user:{username:'athlete'}}};await c.cloudLogout();assert.equal(JSON.parse(c.store.get('session')).pendingLogout,false,'logout 401 confirms cookie no longer authenticates');console.log('LOGOUT_401_ALREADY_SIGNED_OUT_PASS');
}
{
 const c=await authenticated();c.navigator.onLine=false;c.cloud.message='existing status';await c.cloudSync();assert.equal(c.cloud.message,'existing status','automatic offline retry must stay silent');await c.cloudSync(true);assert.match(c.cloud.message,/Sem conexão agora/);console.log('AUTOMATIC_OFFLINE_SILENT_MANUAL_MESSAGE_PASS');
}
{
 const c=await authenticated();c.cloud.message='existing status';let renders=0;c.nuvem=()=>renders++;c.tab='nuvem';c.api=async()=>{throw Object.assign(Error('server unavailable'),{status:503,code:'DB_AUSENTE'})};await c.cloudSync();assert.equal(c.cloud.message,'existing status');assert.equal(renders,0);console.log('AUTOMATIC_503_NO_MESSAGE_OR_REDRAW_PASS');
}
{
 const c=fixture();c.cloudLoginOK({username:'athlete'});await c.cloudLogout();assert.throws(()=>c.cloudLoginOK({username:'other'}),e=>e.code==='PERFIL_DIFERENTE','unlinked athlete records must remain account-bound after logout');assert.equal(c.state.sessions[0].id,'cached');console.log('UNLINKED_LOGOUT_ACCOUNT_ISOLATION_PASS');
}
{
 const features=fs.readFileSync('public/features.js','utf8');const get=(a,b)=>features.slice(features.indexOf(a),features.indexOf(b,features.indexOf(a)));let messages=0,writes=0;const fx={media:[{id:'cached-photo'}],records:[{id:'cached-body'}],messages:[{id:'cached-chat'}]};const ctx={navigator:{onLine:false},fx,fxMessage:()=>messages++,document:{getElementById:()=>({set innerHTML(v){writes++}})},api:async()=>{throw new TypeError('Load failed')},tab:'progresso'};vm.createContext(ctx);vm.runInContext(get('async function fxLoadEvolution()', 'async function compactImage(')+get('async function fxLoadChat()', 'function sharePanel('),ctx);await ctx.fxLoadEvolution();await ctx.fxLoadChat();assert.equal(messages,0,'automatic feature loads must never announce offline');assert.equal(writes,0);ctx.navigator.onLine=true;await ctx.fxLoadEvolution();await ctx.fxLoadChat();assert.equal(messages,0);assert.equal(fx.media[0].id,'cached-photo');assert.equal(fx.messages[0].id,'cached-chat');console.log('AUTOMATIC_FEATURE_LOADS_SILENT_PRESERVE_CACHE_PASS');
}
{
 const features=fs.readFileSync('public/features.js','utf8');const slice=(a,b)=>features.slice(features.indexOf(a),features.indexOf(b,features.indexOf(a)));let history=0,login=0,handler;const ctx={cloud:{user:null},fx:{busy:false},tab:'painel',progresso:()=>history++,nuvem:()=>login++,render(){},painel(){},treino(){},evolution(){},nutricao(){},acompanhamento(){},fxField:()=>'<input>',state:{},forjaWeightSummary:()=>({initial:63,target:73}),document:{addEventListener:(_,f)=>handler=f}};vm.createContext(ctx);vm.runInContext(slice('const oldProgress=progresso;', 'progresso=function()')+slice('render=function()', 'nav=function()')+slice('function accountPanels()', 'function showRecovery(')+slice("document.addEventListener('click',async e=>", '\nrender();'),ctx);await handler({target:{closest:()=>({dataset:{fx:'trainingProgress'}})}});assert.equal(history,0,'guest history click cannot expose cached athlete');assert(login>0);const panel=ctx.accountPanels();assert(!panel.includes('Meu plano'));assert(!panel.includes('HISTÓRICO DE TREINOS'));assert(panel.includes('SOLICITAR UMA CONTA'));assert(panel.includes('ESQUECI MINHA SENHA'));ctx.tab='painel';ctx.render();assert.equal(ctx.tab,'nuvem');console.log('GUEST_FEATURE_HISTORY_BLOCKED_REGISTRATION_PRESERVED_PASS');
}
{
 const c=await authenticated(),features=fs.readFileSync('public/features.js','utf8');let handler;c.document={addEventListener:(_,f)=>handler=f};c.fx={busy:false};c.$=()=>({value:'new-password'});c.cloudSalt=()=> 'salt';c.cloudProof=async()=> 'proof';c.showRecovery=()=>{};c.fxMessage=()=>{};c.api=async()=>({salt:'salt',recoveryKey:'key'});vm.runInContext(features.slice(features.indexOf("document.addEventListener('click',async e=>"),features.indexOf('\nrender();')),c);await handler({target:{closest:()=>({dataset:{fx:'password'}})}});assert.equal(c.cloud.user,null);c.offline=true;c.api=async()=>{throw new TypeError('Load failed')};await c.cloudAutoBoot();assert.equal(c.cloud.user,null,'password rotation must invalidate local offline session marker');console.log('PASSWORD_ROTATION_INVALIDATES_OFFLINE_SESSION_PASS');
}
