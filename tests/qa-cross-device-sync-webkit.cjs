const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {webkit,devices}=require(process.env.FORJA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('public'),copy=x=>JSON.parse(JSON.stringify(x));
const initial={sessions:[{id:'qa-base-s1',date:'2026-10-15',code:'A',name:'Treino QA base',exercises:[{name:'Supino QA',sets:[{kg:20,reps:10}]}],minutes:40}],weights:[],checks:{},drafts:{},journal:[],skipRunAfterB:false,extraExercises:{},exerciseChoices:{},deezerPlaylist:'',profile:{},planOverrides:{}};
let revision=1,remote=copy(initial);let gets=0,puts=0,conflicts=0;
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');let status=200,obj={};
 if(url.pathname.startsWith('/api/')){
  const authed=(req.headers.cookie||'').includes('qa-cross=ok');
  if(url.pathname==='/api/health')obj={ok:true};
  else if(url.pathname==='/api/bootstrap/status')obj={needsSetup:false};
  else if(url.pathname==='/api/auth/me'){status=authed?200:401;obj=authed?{user:{username:'qa_crossdevice',displayName:'Atleta QA',role:'member'}}:{error:'NAO_AUTENTICADO'};}
  else if(url.pathname==='/api/state'){
   if(!authed){status=401;obj={error:'NAO_AUTENTICADO'};}
   else if(req.method==='GET'){gets++;obj={revision,data:copy(remote)};}
   else if(req.method==='PUT'){
    puts++;let raw='';for await(const chunk of req)raw+=chunk;
    const payload=JSON.parse(raw);
    if(payload.baseRevision!==revision){conflicts++;status=409;obj={error:'REVISAO_DIVERGENTE',message:'Outro aparelho já atualizou os registros.'};}
    else{revision++;remote=copy(payload.data);obj={revision};}
   }else{status=405;obj={error:'METODO_INVALIDO'}}
  }else{status=404;obj={error:'NOT_FOUND'}}
  res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});return res.end(JSON.stringify(obj));
 }
 const f=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
 if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end('not found')}
 res.setHeader('content-type',f.endsWith('.html')?'text/html':f.endsWith('.js')?'application/javascript':f.endsWith('.png')?'image/png':'application/octet-stream');
 res.end(fs.readFileSync(f));
});
async function launchContext(browser,url,name){
 const ctx=await browser.newContext({...devices['iPhone 13'],serviceWorkers:'block'});
 await ctx.addCookies([{name:'qa-cross',value:'ok',url}]);
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>typeof cloud!=='undefined'&&cloud.user?.username==='qa_crossdevice',{timeout:18000});
 assert.equal(await page.evaluate(()=>cloud.linked),false,'new device must require explicit first migration '+name);
 await page.locator('[data-action="cloudFirstDownload"]').click();
 await page.waitForFunction(()=>cloud.linked&&cloud.revision===1&&state.sessions.length===1,{timeout:13000});
 return {ctx,page,errors,name};
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function snapshot(page){return page.evaluate(()=>({revision:cloud.revision,linked:cloud.linked,dirty:cloud.dirty,conflict:cloud.conflict,verified:cloud.verified,lastSync:cloud.lastSync,message:cloud.message,data:structuredClone(state),status:cloudStatus()}))}
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 let browser;const url='http://127.0.0.1:'+server.address().port;
 try{
  browser=await webkit.launch();const phone=await launchContext(browser,url,'PWA'),pc=await launchContext(browser,url,'PC');
  assert.equal(gets,2);assert.equal(puts,0);console.log('TWO_DEVICE_EXPLICIT_BASELINE_RECOVERY_PASS');
  await phone.page.evaluate(()=>{state.sessions.push({id:'qa-phone-s2',date:'2026-10-25',code:'A',name:'Treino do celular QA',exercises:[{name:'Puxada QA',sets:[{kg:25,reps:10}]}]});if(!save())throw Error('could not save phone')});
  await phone.page.evaluate(()=>cloudSync());
  assert.equal(revision,2);assert.equal(remote.sessions.length,2);assert.equal((await snapshot(phone.page)).dirty,false);
  console.log('PHONE_NEW_WORKOUT_SAVED_CLOUD_PASS');
  await pc.page.evaluate(()=>cloudSync());
  const pcAfter=await snapshot(pc.page);assert.equal(pcAfter.revision,2);assert.equal(pcAfter.data.sessions.length,2);
  assert.equal(pcAfter.data.sessions[1].id,'qa-phone-s2');console.log('PC_AUTO_PULL_NONCONFLICTING_WORKOUT_PASS');
  await pc.page.evaluate(()=>{state.journal.push({date:'2026-10-25',sleep:'7',energy:'8',note:'QA PC'});if(!save())throw Error('could not save PC')});
  await phone.page.evaluate(()=>{state.weights.push({date:'2026-10-25',weight:64});if(!save())throw Error('could not save phone weight')});
  await pc.page.evaluate(()=>cloudSync());
  assert.equal(revision,3);assert.equal(remote.journal.length,1);assert.equal(remote.weights.length,0);
  await phone.page.evaluate(()=>cloudSync());
  const clash=await snapshot(phone.page);
  assert(clash.conflict&&clash.dirty&&clash.data.weights.length===1&&clash.status.includes('🔴'),JSON.stringify(clash).slice(0,1500));
  assert.equal(remote.weights.length,0);assert.equal(conflicts,1);
  console.log('STALE_PHONE_REVISION_REJECTED_PRESERVES_LOCAL_PASS');
  await phone.page.evaluate(()=>{tab='nuvem';render()});
  await phone.page.locator('[data-action="cloudResolveMerge"]').click();
  await phone.page.waitForFunction(()=>cloud.working===false&&cloud.conflict===false&&cloud.revision===4,{timeout:15000});
  assert.equal(remote.weights.length,1);assert.equal(remote.journal.length,1);assert.equal(remote.sessions.length,2);
  assert.equal((await snapshot(phone.page)).dirty,false);
  console.log('TWO_DEVICE_NONOVERLAPPING_MERGE_PASS');
  await pc.page.evaluate(()=>cloudSync());const pulled=await snapshot(pc.page);
  assert.equal(pulled.revision,4);assert.equal(pulled.data.weights.length,1);assert.equal(pulled.data.journal.length,1);
  console.log('PC_RECEIVES_MERGED_WORKOUT_WEIGHT_JOURNAL_PASS');
  // Both now share the same base, then make conflicting modifications to the exact same record.
  await pc.page.evaluate(()=>{state.sessions[0].exercises[0].sets[0].kg=21;if(!save())throw Error('save PC conflicting exercise failed')});
  await phone.page.evaluate(()=>{state.sessions[0].exercises[0].sets[0].kg=22;if(!save())throw Error('save phone conflicting exercise failed')});
  await pc.page.evaluate(()=>cloudSync());assert.equal(revision,5);
  await phone.page.evaluate(()=>cloudSync());assert((await snapshot(phone.page)).conflict);
  const putsBefore=puts;await phone.page.evaluate(()=>{tab='nuvem';render()});await phone.page.locator('[data-action="cloudResolveMerge"]').click();await sleep(300);
  const refusal=await snapshot(phone.page);
  assert(refusal.conflict&&refusal.data.sessions[0].exercises[0].sets[0].kg===22&&remote.sessions[0].exercises[0].sets[0].kg===21);
  assert.equal(puts,putsBefore,'conflicting same-record merge must not write');
  console.log('SAME_SESSION_ID_CONFLICT_BLOCKED_NO_DATA_LOSS_PASS');
  assert.deepEqual([...phone.errors,...pc.errors],[]);
  console.log('TWO_DEVICE_WEBKIT_SYNTHETIC_E2E_PASS',JSON.stringify({finalRevision:revision,reads:gets,writes:puts,conflicts,jsErrors:0}));
  await phone.ctx.close();await pc.ctx.close();
 }finally{if(browser)await browser.close();await new Promise(ok=>server.close(ok))}
})().catch(e=>{console.error(e);process.exitCode=1});

