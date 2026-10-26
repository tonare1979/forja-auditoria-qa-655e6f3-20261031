const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {randomBytes,pbkdf2Sync}=require('node:crypto');
const {webkit,devices}=require(process.env.FORJA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('public'),username='qalocal_'+randomBytes(3).toString('hex');
const email=username+'@qa.invalid';
const password='qa-'+randomBytes(16).toString('hex'),salt=randomBytes(16).toString('hex');
const expectedProof=pbkdf2Sync(password,Buffer.from(salt,'hex'),210000,32,'sha256').toString('hex');
const headers=fs.readFileSync('public/_headers','utf8');
const csp=headers.match(/Content-Security-Policy: ([^\r\n]+)/)?.[1];
let authenticated=false,authAttempts=0;
const events=[];
const json=(res,status,obj,cookie)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store',...(cookie?{'set-cookie':cookie}:{})});res.end(JSON.stringify(obj))};
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 if(url.pathname.startsWith('/api/')){
  if(url.pathname==='/api/health')return json(res,200,{ok:true});
  if(url.pathname==='/api/bootstrap/status')return json(res,200,{needsSetup:false});
  if(url.pathname==='/api/auth/me')return json(res,authenticated&&req.headers.cookie?.includes('qalocalsession')?200:401,authenticated&&req.headers.cookie?.includes('qalocalsession')?{user:{username,role:'member',displayName:'QA Frontend'}}:{error:'SEM_SESSAO'});
  if(url.pathname==='/api/auth/salt')return json(res,url.searchParams.get('username')===email?200:404,{salt});
  if(url.pathname==='/api/auth/login'&&req.method==='POST'){
   let body='';for await(const chunk of req)body+=chunk;
   let data;try{data=JSON.parse(body)}catch{return json(res,400,{error:'BAD_JSON'})}
   authAttempts++;
   if(data.username!==email||data.proof!==expectedProof)return json(res,401,{error:'CREDENCIAIS_INVALIDAS'});
   authenticated=true;return json(res,200,{user:{username,role:'member',displayName:'QA Frontend'}},'qalocalsession=ok; Path=/; HttpOnly; SameSite=Lax');
  }
  return json(res,404,{error:'NOT_FOUND'});
 }
 const resource=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!resource.startsWith(root+path.sep)||!fs.existsSync(resource)||!fs.statSync(resource).isFile()){res.writeHead(404);return res.end()}
 if(csp)res.setHeader('Content-Security-Policy',csp);
 res.setHeader('Content-Type',resource.endsWith('.js')?'application/javascript':resource.endsWith('.css')?'text/css':resource.endsWith('.html')?'text/html; charset=utf-8':resource.endsWith('.json')?'application/json':resource.endsWith('.webmanifest')?'application/manifest+json':'application/octet-stream');
 res.end(fs.readFileSync(resource));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await webkit.launch();
  const context=await browser.newContext({...devices['iPhone 13'],serviceWorkers:'block'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().includes('/api/auth/'))events.push({path:new URL(r.url()).pathname,status:r.status()})});
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>cloud.available===true&&!cloud.user,null,{timeout:12000});
  assert.equal((await page.locator('[data-action="welcomeLogin"]').textContent()).trim(),'CONTINUAR');
  await page.locator('[data-action="welcomeLogin"]').click();
  await page.locator('#welcomeCover').waitFor({state:'hidden',timeout:8000});
  await page.locator('#cloudUser').fill(email);
  await page.locator('#cloudPassword').fill(password);
  await page.locator('[data-action="cloudLogin"]').click();
  try{await page.waitForFunction(u=>cloud.user?.username===u,username,{timeout:15000})}
  catch(e){const state=await page.evaluate(()=>({message:cloud.message,available:cloud.available,user:cloud.user?.username||null}));throw Error('WEBKIT_LOCAL_LOGIN_FAIL '+JSON.stringify({state,events,errors}))}
  assert.equal(authAttempts,1,'one login request');
  assert.deepEqual(errors,[],'no JS errors');
  assert(events.some(e=>e.path==='/api/auth/salt'&&e.status===200),'salt read');
  assert(events.some(e=>e.path==='/api/auth/login'&&e.status===200),'login accepted');
  console.log('WEBKIT_LOGIN_FORM_LOCAL_PASS',JSON.stringify({events,authAttempts,errors:errors.length}));
  await context.close();
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
