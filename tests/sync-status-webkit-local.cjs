const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {webkit,devices}=require(process.env.FORJA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('public'),user='qa_sync',lastSync='2026-10-25T10:00:24.000Z';
const state={sessions:[],weights:[],checks:{},drafts:{},journal:[],skipRunAfterB:false,extraExercises:{},exerciseChoices:{},deezerPlaylist:'',profile:{},planOverrides:{}};
function serverFor(kind){
 return http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  if(url.pathname.startsWith('/api/')){
   let status=200,body={};
   if(url.pathname==='/api/health')body={ok:true};
   else if(url.pathname==='/api/bootstrap/status')body={needsSetup:false};
   else if(url.pathname==='/api/auth/me')body={user:{username:user,displayName:'QA Sync',role:'admin'}};
   else if(url.pathname==='/api/state'){status=kind==='error'?503:200;body=kind==='error'?{message:'Falha simulada'}:{revision:34,data:kind==='diverge'?{...state,weights:[{date:'2026-10-25',weight:68}]}:state};}
   else {status=404;body={error:'NOT_FOUND'};}
   res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify(body));
  }
  const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'application/javascript':file.endsWith('.json')?'application/json':'application/octet-stream');
  return res.end(fs.readFileSync(file));
 });
}
(async()=>{const b=await webkit.launch();try{
 for(const kind of ['same','diverge','error']){
  const srv=serverFor(kind);await new Promise(resolve=>srv.listen(0,'127.0.0.1',resolve));
  const context=await b.newContext({...devices['iPhone 13'],serviceWorkers:'block'});
  await context.addInitScript(({state,user,lastSync})=>{localStorage.setItem('forja73-v1',JSON.stringify(state));localStorage.setItem('forja73-cloud-meta-v1',JSON.stringify({username:user,revision:34,linked:true,dirty:false,lastSync}));},{state,user,lastSync});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto('http://127.0.0.1:'+srv.address().port+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>typeof cloud!=='undefined'&&cloud.working===false&&cloud.available===true&&cloud.message==='Nuvem verificada agora.' || (typeof cloud!=='undefined'&&cloud.working===false&&(cloud.conflict===true||cloud.message==='Falha simulada')),null,{timeout:16000}).catch(()=>{});
   await page.waitForTimeout(500);
   const o=await page.evaluate(()=>({status:cloudStatus(),lastSync:cloud.lastSync,verified:cloud.verified,conflict:cloud.conflict,message:cloud.message,sessions:state.sessions.length,weights:state.weights.length}));
   if(kind==='same'){assert(o.status.includes('🟢'),JSON.stringify(o));assert.notEqual(o.lastSync,lastSync);}
   else if(kind==='diverge'){assert(o.status.includes('🔴')&&o.conflict&&o.weights===0,JSON.stringify(o));}
   else assert(!o.status.includes('🟢'),JSON.stringify(o));
   assert.deepEqual(errors,[],JSON.stringify(errors));
   console.log('WEBKIT_'+kind.toUpperCase()+'_STATUS_PASS',JSON.stringify(o));
  }finally{await context.close();await new Promise(resolve=>srv.close(resolve));}
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});

