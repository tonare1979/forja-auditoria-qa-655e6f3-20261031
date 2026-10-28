const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {webkit,devices}=require(process.env.FORJA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('public');
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://127.0.0.1');if(u.pathname.startsWith('/api/')){let status=u.pathname==='/api/health'?200:401;res.writeHead(status,{'content-type':'application/json'});return res.end(JSON.stringify(status===200?{ok:true}:{error:'NAO_AUTENTICADO'}))}
 const file=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname)));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('not found')}
 res.setHeader('content-type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'application/javascript':file.endsWith('.png')?'image/png':'application/octet-stream');
 res.end(fs.readFileSync(file))
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let b;
 try{b=await webkit.launch();const ctx=await b.newContext({...devices['iPhone 13'],serviceWorkers:'allow'}),page=await ctx.newPage();
 const origin='http://127.0.0.1:'+server.address().port;
 await page.goto(origin,{waitUntil:'load'});
 const reg=await page.evaluate(async()=>{const reg=await navigator.serviceWorker.ready;for(let i=0;i<100&&reg.active?.state!=='activated';i++)await new Promise(r=>setTimeout(r,50));return {scope:reg.scope,state:reg.active?.state}});
 console.log('PWA_SERVICE_WORKER_STATE',JSON.stringify({scope:reg.scope,state:reg.state,origin}));assert(reg.scope===origin+'/'&&reg.state==='activated');console.log('PWA_SERVICE_WORKER_ACTIVE_PASS');
 const names=await page.evaluate(async()=>await caches.keys());const version=fs.readFileSync(path.join(root,'sw.js'),'utf8').match(/const CACHE='([^']+)'/)[1];assert(names.includes(version));console.log('PWA_SW_VERSIONED_CACHE_PASS');
 for(const icon of ['forja-icon-rc3-180.png','forja-icon-rc3-192.png','forja-icon-rc3-512.png']){
  const ok=await page.evaluate(async icon=>!!(await caches.match('./'+icon)),icon);
  assert(ok,'cache icon '+icon);
 }
 console.log('PWA_OFFLINE_ICON_CACHE_PASS');
 await ctx.setOffline(true);
 await page.reload({waitUntil:'domcontentloaded',timeout:12000});
 assert((await page.title()).startsWith('FORJA'));console.log('PWA_OFFLINE_APP_SHELL_PASS');
 await ctx.close();
 }finally{if(b)await b.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});

