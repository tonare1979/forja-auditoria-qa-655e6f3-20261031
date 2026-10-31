const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {webkit,devices}=require(process.env.FORJA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('public');
let posted=null,requests=0;
const csp=fs.readFileSync('public/_headers','utf8').match(/Content-Security-Policy: ([^\r\n]+)/)?.[1];
const json=(res,status,obj)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(obj))};
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 if(url.pathname.startsWith('/api/')){
  if(url.pathname==='/api/health')return json(res,200,{ok:true});
  if(url.pathname==='/api/bootstrap/status')return json(res,200,{needsSetup:false});
  if(url.pathname==='/api/auth/me')return json(res,401,{error:'NAO_AUTENTICADO'});
  if(url.pathname==='/api/accounts/register'&&req.method==='POST'){
    let raw='';for await(const chunk of req)raw+=chunk;
    posted=JSON.parse(raw);requests++;
    return json(res,201,{ok:true,status:'pending',message:'Solicitacao recebida; aguarde aprovacao do administrador.',recoveryKey:'a'.repeat(48)});
  }
  return json(res,404,{error:'NOT_FOUND'});
 }
 const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end()}
 if(csp)res.setHeader('Content-Security-Policy',csp);
 res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':file.endsWith('.webmanifest')?'application/manifest+json':'application/octet-stream');
 res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await webkit.launch();
  const context=await browser.newContext({...devices['iPhone 13'],serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>cloud.available===true&&!cloud.user,null,{timeout:15000});
  await page.locator('[data-action="welcomeLogin"]').click();
  await page.locator('#welcomeCover').waitFor({state:'hidden',timeout:8000});
  const disclosure=page.locator('summary').filter({hasText:'SOLICITAR UMA CONTA'}).first();
  await disclosure.click();
  const sample='52998224725'; // Apenas vetor matematico de teste; jamais pessoa cadastrada.
  await page.locator('#registerName').fill('Pessoa QA');
  await page.locator('#registerUser').fill('qa_teste_aluno');
  await page.locator('#registerEmail').fill('qa.teste.aluno@example.invalid');
  await page.locator('#registerCpf').fill(sample);
  await page.locator('#registerPassword').fill('TesteQa-2026!');
  await page.locator('[data-fx="register"]').click();
  await page.waitForFunction(()=>document.body.textContent.includes('Solicitacao recebida'),null,{timeout:18000});
  assert.equal(requests,1,'deve enviar uma unica inscricao');
  assert.equal(posted.cpf,sample,'CPF obrigatorio encaminhado a API');
  assert.equal(posted.username,'qa_teste_aluno');
  assert.match(posted.proof,/^[0-9a-f]{64}$/);
  assert.equal(posted.password,undefined,'senha nao sai em texto aberto');
  assert.equal(await page.evaluate(()=>cloud.user),null,'inscricao pendente nao autentica');
  assert.deepEqual(errors,[],'sem erros JS');
  console.log('RC3_GUEST_SIGNUP_WEBKIT_PENDING_CPF_PASS');
  await context.close();
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
