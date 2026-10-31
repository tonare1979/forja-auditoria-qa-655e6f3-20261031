const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {webkit,devices}=require(process.env.FORJA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('public');
const csp=fs.readFileSync('public/_headers','utf8').match(/Content-Security-Policy: ([^\r\n]+)/)?.[1];
const users=[{id:'p',username:'qa_pending',displayName:'Pendente QA',status:'pending',role:'member'},{id:'a',username:'qa_active',displayName:'Ativo QA',status:'active',role:'member'},{id:'b',username:'qa_blocked',displayName:'Bloqueado QA',status:'blocked',role:'member'},{id:'ad',username:'qa_admin',displayName:'Admin QA',status:'active',role:'admin'}];
let posts=0,gets=0;
function json(res,s,obj){res.writeHead(s,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(obj))}
const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://127.0.0.1');
 if(u.pathname.startsWith('/api/')){
  if(u.pathname==='/api/health')return json(res,200,{ok:true});
  if(u.pathname==='/api/bootstrap/status')return json(res,200,{needsSetup:false});
  if(u.pathname==='/api/auth/me')return json(res,200,{user:{username:'qa_admin',displayName:'Admin QA',role:'admin'}});
  if(u.pathname==='/api/admin/users'&&req.method==='GET'){gets++;return json(res,200,{users:users.map(x=>({...x}))})}
  if(u.pathname==='/api/admin/users'&&req.method==='POST'){
   let raw='';for await(const c of req)raw+=c;const data=JSON.parse(raw),target=users.find(x=>x.id===data.id);
   if(!target||target.role!=='member')return json(res,400,{error:'PROTEGIDO'});
   posts++;target.status=data.status;return json(res,200,{ok:true});
  }
  return json(res,404,{error:'NAO_ENCONTRADO'});
 }
 const file=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('missing')}
 if(csp)res.setHeader('Content-Security-Policy',csp);
 res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');
 res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));let browser;
 try{
  browser=await webkit.launch();
  const ctx=await browser.newContext({...devices['iPhone 13'],serviceWorkers:'block'}),page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>cloud.available===true&&cloud.user?.role==='admin',null,{timeout:14000});
  await page.evaluate(()=>{const cover=document.querySelector('#welcomeCover');if(cover)cover.style.display='none';});
  await page.evaluate(()=>{tab='nuvem';render()});
  const row=name=>page.locator('#adminUsers .person-row[data-username="'+name+'"]');
  await row('qa_active').waitFor({timeout:10000});
  assert.equal(await row('qa_active').locator('[data-fx="approve"]').count(),0);
  assert.equal(await row('qa_active').locator('[data-fx="block"]').count(),1);
  assert.equal(await row('qa_pending').locator('[data-fx="approve"]').count(),1);
  assert.equal((await row('qa_blocked').locator('[data-fx="approve"]').textContent()).trim(),'REATIVAR');
  assert.equal(await row('qa_blocked').locator('[data-fx="block"]').count(),0);
  assert.equal(await row('qa_admin').locator('[data-fx]').count(),0);
  users[0].status='active';
  await row('qa_pending').locator('[data-fx="approve"]').click();
  await page.waitForFunction(()=>!document.querySelector('#adminUsers .person-row[data-username="qa_pending"] [data-fx="approve"]'));
  assert.equal(posts,0,'stale approval ignored');
  await row('qa_active').locator('[data-fx="block"]').click();
  await page.waitForFunction(()=>document.querySelector('#adminUsers .person-row[data-username="qa_active"] [data-fx="approve"]')?.textContent==='REATIVAR');
  assert.equal(posts,1);assert.equal(users[1].status,'blocked');
  assert.deepEqual(errors,[]);
  console.log('RC3_ADMIN_PEOPLE_WEBKIT_ACTIONS_PASS',JSON.stringify({gets,posts,errors:errors.length}));
  await ctx.close();
 }finally{if(browser)await browser.close();await new Promise(ok=>server.close(ok))}
})().catch(e=>{console.error(e);process.exitCode=1});
