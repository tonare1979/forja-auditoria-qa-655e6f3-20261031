const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {webkit,devices}=require('C:/Users/renat/FORJA_PLAYWRIGHT_QA/node_modules/playwright');
const root=path.resolve('public');
const state={sessions:[{id:'qa-synthetic-session',code:'A',date:'2026-10-15',name:'Superior QA',exercises:[{name:'Supino',sets:[{kg:40,reps:10}]}]}],weights:[{date:'2026-10-15',weight:63}],checks:{},drafts:{},journal:[],skipRunAfterB:false,extraExercises:{},exerciseChoices:{},deezerPlaylist:'',profile:{},planOverrides:{}};
let writes=0,reads=0;
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://127.0.0.1');let status=200,result={};
 if(u.pathname.startsWith('/api/')){
  const auth=(req.headers.cookie||'').includes('qa-pwa-cookie=ok');
  if(u.pathname==='/api/health')result={ok:true};
  else if(u.pathname==='/api/bootstrap/status')result={needsSetup:false};
  else if(u.pathname==='/api/auth/me'){status=auth?200:401;result=auth?{user:{username:'qa_pwa',displayName:'QA PWA',role:'member'}}:{error:'NAO_AUTENTICADO'};}
  else if(u.pathname==='/api/state'){if(!auth){status=401;result={error:'NAO_AUTENTICADO'}}else if(req.method==='GET'){reads++;result={revision:34,data:state}}else{writes++;status=409;result={error:'REVISAO_DIVERGENTE'}}}
  else {status=404;result={error:'NAO_ENCONTRADO'};}
  res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});return res.end(JSON.stringify(result));
 }
 let f=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname)));
 if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}
 res.setHeader('content-type',f.endsWith('.html')?'text/html;charset=utf-8':f.endsWith('.js')?'application/javascript':f.endsWith('.webmanifest')?'application/manifest+json':f.endsWith('.json')?'application/json':'application/octet-stream');
 res.end(fs.readFileSync(f));
});
async function open(ctx,origin){const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin,{waitUntil:'domcontentloaded'});return {page,errors}}
(async()=>{await new Promise(ok=>server.listen(0,'127.0.0.1',ok));let b;
 try{
  const origin='http://127.0.0.1:'+server.address().port;
  b=await webkit.launch();
  const safari=await b.newContext({...devices['iPhone 13'],serviceWorkers:'block'});
  await safari.addCookies([{name:'qa-pwa-cookie',value:'ok',url:origin}]);
  await safari.addInitScript(({data})=>{localStorage.setItem('forja73-v1',JSON.stringify(data))},{data:state});
  const old=await open(safari,origin);
  await old.page.waitForFunction(()=>typeof cloud!=='undefined'&&cloud.user?.username==='qa_pwa');
  assert.equal(await old.page.evaluate(()=>state.sessions.length),1);
  const cookies=await safari.cookies();
  console.log('SAFARI_HAS_SYNTHETIC_WORKOUT_PASS');
  const app=await b.newContext({...devices['iPhone 13'],serviceWorkers:'block'});
  await app.addCookies(cookies);
  await app.addInitScript(()=>Object.defineProperty(navigator,'standalone',{configurable:true,value:true}));
  const first=await open(app,origin);
  await first.page.waitForFunction(()=>typeof cloud!=='undefined'&&cloud.user?.username==='qa_pwa');
  assert.equal(await first.page.evaluate(()=>state.sessions.length),0,'Safari localStorage must not be assumed copied to installed PWA');
  assert.equal(await first.page.evaluate(()=>cloud.linked),false);
  assert.equal(await first.page.locator('#welcomeCover').count(),0);
  assert(await first.page.getByRole('heading',{name:'Primeira sincronização'}).isVisible());
  console.log('STANDALONE_COOKIE_ONLY_FIRST_LAUNCH_PASS');
  first.page.on('dialog',d=>d.accept());
  await first.page.locator('[data-action="cloudFirstDownload"]').click();
  await first.page.waitForFunction(()=>state.sessions.length===1&&cloud.linked&&cloud.revision===34);
  assert.equal(await first.page.evaluate(()=>state.sessions[0].id),'qa-synthetic-session');
  const ls=await first.page.evaluate(()=>JSON.parse(localStorage.getItem('forja73-v1')));
  assert.equal(ls.sessions[0].id,'qa-synthetic-session');
  console.log('STANDALONE_EXPLICIT_CLOUD_RECOVERY_PASS');
  await first.page.reload({waitUntil:'domcontentloaded'});
  await first.page.waitForFunction(()=>cloud.verified&&cloud.user?.username==='qa_pwa');
  assert.equal(await first.page.evaluate(()=>state.sessions[0].id),'qa-synthetic-session');
  assert.equal(await first.page.locator('#welcomeCover').count(),0);
  console.log('STANDALONE_RELOAD_SESSION_AND_TRAINING_PASS');
  const persisted=await app.storageState();
  await app.close();
  const reopened=await b.newContext({...devices['iPhone 13'],serviceWorkers:'block',storageState:persisted});
  await reopened.addInitScript(()=>Object.defineProperty(navigator,'standalone',{configurable:true,value:true}));
  const again=await open(reopened,origin);
  await again.page.waitForFunction(()=>typeof cloud!=='undefined'&&cloud.user?.username==='qa_pwa'&&cloud.verified);
  assert.equal(await again.page.evaluate(()=>state.sessions[0].id),'qa-synthetic-session');
  assert.equal(await again.page.locator('#welcomeCover').count(),0);
  assert.deepEqual(first.errors,[]);assert.deepEqual(again.errors,[]);
  console.log('STANDALONE_SIMULATED_FORCE_CLOSE_REOPEN_PASS');
  assert.equal(writes,0,'No cloud overwrite during read-only migration');
  console.log('PWA_SYNTHETIC_NO_REMOTE_WRITE_PASS',JSON.stringify({cloudReads:reads,cloudWrites:writes}));
  await reopened.close();
  const expiredState=structuredClone(persisted);expiredState.cookies=[];
  const expired=await b.newContext({...devices['iPhone 13'],serviceWorkers:'block',storageState:expiredState});
  const locked=await open(expired,origin);
  await locked.page.locator('[data-action="welcomeLogin"]').waitFor({state:'visible',timeout:12000});
  assert.equal(await locked.page.evaluate(()=>state.sessions[0].id),'qa-synthetic-session');
  assert.equal(await locked.page.evaluate(()=>cloud.user),null);
  console.log('STANDALONE_SESSION_EXPIRED_LOCAL_WORKOUT_PRESERVED_PASS');
  await expired.close();await safari.close();
 }finally{if(b)await b.close();await new Promise(ok=>server.close(ok));}
})().catch(e=>{console.error(e);process.exitCode=1});
