const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {webkit,devices}=require('C:/Users/renat/FORJA_PLAYWRIGHT_QA/node_modules/playwright');
const root=path.resolve('public');
const localData={sessions:[],weights:[],checks:{},drafts:{},journal:[],skipRunAfterB:false,extraExercises:{},exerciseChoices:{},deezerPlaylist:'',profile:{},planOverrides:{}};
const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://127.0.0.1');
 if(u.pathname.startsWith('/api/')){
  const authorized=(req.headers.cookie||'').includes('test-forja-session=ok');
  let status=200,body={};
  if(u.pathname==='/api/health')body={ok:true};
  else if(u.pathname==='/api/bootstrap/status')body={needsSetup:false};
  else if(u.pathname==='/api/auth/me'){status=authorized?200:401;body=authorized?{user:{username:'qa_return',displayName:'QA Perfil',role:'admin'}}:{error:'NAO_AUTENTICADO',message:'Entre na sua conta'};}
  else if(u.pathname==='/api/state'){status=authorized?200:401;body=authorized?{revision:34,data:localData}:{error:'NAO_AUTENTICADO'};}
  else {status=404;body={error:'NOT_FOUND'};}
  res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});return res.end(JSON.stringify(body));
 }
 const f=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname)));
 if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}
 res.setHeader('content-type',f.endsWith('.html')?'text/html;charset=utf-8':f.endsWith('.js')?'application/javascript':'application/octet-stream');
 res.end(fs.readFileSync(f));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await webkit.launch();
  const context=await browser.newContext({...devices['iPhone 13'],serviceWorkers:'block'});
  await context.addCookies([{name:'test-forja-session',value:'ok',url:origin}]);
  await context.addInitScript(({data})=>{localStorage.setItem('forja73-v1',JSON.stringify(data));localStorage.setItem('forja73-cloud-meta-v1',JSON.stringify({username:'qa_return',revision:34,linked:true,dirty:false,lastSync:'2026-10-25T07:00:24.000Z'}));},{data:localData});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(let round=0;round<2;round++){
   await page.goto(origin,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>typeof cloud!=='undefined'&&cloud.user?.username==='qa_return'&&tab==='nuvem'&&cloud.verified===true,null,{timeout:15000});
   assert.equal(await page.locator('#welcomeCover').count(),0,'valid session must not trigger welcome cover on reload');
   assert.equal(await page.evaluate(()=>tab),'nuvem');
   assert((await page.evaluate(()=>cloudStatus())).includes('Nuvem sincronizada'));
   console.log('WEBKIT_PROFILE_DIRECT_ON_LOAD_'+(round?'RELOAD':'INITIAL')+'_PASS');
  }
  assert.deepEqual(errors,[]);await context.close();
  const guest=await browser.newContext({...devices['iPhone 13'],serviceWorkers:'block'}),visitor=await guest.newPage();
  await visitor.goto(origin,{waitUntil:'domcontentloaded'});
  await visitor.locator('[data-action="welcomeLogin"]').waitFor({state:'visible',timeout:15000});
  assert.equal((await visitor.locator('[data-action="welcomeLogin"]').textContent()).trim(),'CONTINUAR');
  await visitor.locator('[data-action="welcomeLogin"]').click();
  await visitor.locator('#cloudUser').waitFor({state:'visible',timeout:10000});
  console.log('WEBKIT_GUEST_WELCOME_LOGIN_REQUIRED_PASS');
  await guest.close();
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1});
