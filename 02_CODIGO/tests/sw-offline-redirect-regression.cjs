const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../public/sw.js'),'utf8');
const handlers={};let entries=new Map();let offline=false;
const origin='https://offline-qa.example';
const redirect={ok:true,redirected:true,url:origin+'/index.html',status:200,headers:new Headers({'content-type':'text/html'}),clone(){return this},text:async()=>'<html>FORJA</html>',body:'<html>FORJA</html>'};
const clean=()=>new Response('<html>FORJA</html>',{headers:{'content-type':'text/html'}});
const key=r=>new URL(typeof r==='string'?r:r.url,origin+'/').pathname;
const cache={addAll:async list=>{for(const p of list)entries.set(key(p),(p==='./'||p==='./index.html')?redirect:clean())},put:async(p,v)=>entries.set(key(p),v),match:async p=>{const v=entries.get(key(p));return v instanceof Response?v.clone():v}};
const caches={open:async()=>cache,match:async p=>cache.match(p),keys:async()=>['current'],delete:async()=>true};
const self={location:{origin},addEventListener:(name,cb)=>handlers[name]=cb,skipWaiting:async()=>{},clients:{claim:async()=>{}}};
const context={self,caches,Response,URL,fetch:async()=>{if(offline)throw Error('offline');return redirect},console};vm.runInNewContext(code,context,{filename:'sw.js'});
const dispatch=async(type,request)=>{let task;let pending=[];handlers[type]({request,waitUntil:p=>pending.push(p),respondWith:p=>task=p});if(task)return await task;await Promise.all(pending)};
(async()=>{await dispatch('install');assert(entries.has('/index.html'));offline=true;
for(const target of ['/','/index.html']){
const res=await dispatch('fetch',{method:'GET',url:origin+target,mode:'navigate'});
assert(res,'must serve offline document');assert.equal(res.redirected,false,'offline response must have no redirect chain at '+target);assert.equal(res.url,'','offline document must be a synthetic non-redirect response');assert.equal(await res.text(),'<html>FORJA</html>');
console.log('OFFLINE_REOPEN_NO_REDIRECT_PASS',target)}
console.log('OFFLINE_START_URL_MANIFEST_PASS')
})().catch(e=>{console.error(e.stack);process.exitCode=1});
