// Actual WebKit service-worker transition, loopback only; no account or cloud.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {webkit}=require('playwright');
const root=path.resolve(__dirname,'../public');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const current=sw.match(/const CACHE='([^']+)'/)[1];
const previous='forja73-static-v11-rc3-compat-20261028';
const oldFeatures=execFileSync('git',['show','c9a48e753d495a0fab2f38773ae4cc42d30062e4:public/features.js'],{cwd:path.dirname(root)});
const newFeatures=fs.readFileSync(path.join(root,'features.js'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
let upgraded=false;
const server=http.createServer((req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname;
  if(name==='/sw.js'){
    res.writeHead(200,{'content-type':'application/javascript','cache-control':'no-store'});
    return res.end(upgraded?sw:sw.replace(current,previous));
  }
  if(name==='/features.js'){
    res.writeHead(200,{'content-type':'application/javascript','cache-control':'no-store'});
    return res.end(upgraded?newFeatures:oldFeatures);
  }
  const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    res.writeHead(404);return res.end('not found');
  }
  const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
  res.end(fs.readFileSync(file));
});
(async()=>{
  let browser;
  try{
    await new Promise(r=>server.listen(0,'127.0.0.1',r));
    browser=await webkit.launch({headless:true});
    const context=await browser.newContext({viewport:{width:390,height:844}});
    const page=await context.newPage();
    // Block all non-loopback page traffic, including optional external assets.
    await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
    const origin='http://127.0.0.1:'+server.address().port;
    await page.goto(origin);
    await page.evaluate(async()=>{await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;});
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await page.waitForFunction(async key=>(await caches.keys()).includes(key),previous);
    const cached=key=>page.evaluate(async k=>{const c=await caches.open(k);return (await c.match('/features.js')).text();},key);
    assert.equal(sha(await cached(previous)),sha(oldFeatures));
    await page.evaluate(()=>localStorage.setItem('forja-cache-test','synthetic-preserved'));
    upgraded=true;
    await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});
    const deadline=Date.now()+30000;
    let transitioned=false;
    while(Date.now()<deadline){
      transitioned=await page.evaluate(async({current,previous})=>{
        const keys=await caches.keys();
        if(!keys.includes(current)||keys.includes(previous))return false;
        return !!await (await caches.open(current)).match('/features.js');
      },{current,previous});
      if(transitioned)break;
      await new Promise(r=>setTimeout(r,100));
    }
    assert.equal(transitioned,true,'new worker populated its cache and removed the previous cache');
    assert.ok(!(await page.evaluate(()=>caches.keys())).includes(previous));
    assert.equal(sha(await cached(current)),sha(newFeatures));
    assert.equal(await page.evaluate(()=>localStorage.getItem('forja-cache-test')),'synthetic-preserved');
    await context.setOffline(true);
    await page.reload({waitUntil:'domcontentloaded'});
    assert.ok(await page.locator('#root').count());
    assert.equal(await page.evaluate(()=>localStorage.getItem('forja-cache-test')),'synthetic-preserved');
    console.log('WEBKIT_CACHE_UPDATE_LOCAL_PASS',JSON.stringify({previous,current,featuresSha256:sha(newFeatures),oldCacheDeleted:true,offlineReload:true,syntheticStoragePreserved:true}));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
