const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {webkit}=require('playwright');
(async()=>{
 const {createLab,credentials}=await import('../ops/lab-local.mjs');
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'forja-single-rest-'));let lab,browser;
 try{
  lab=await createLab({port:0,directory});browser=await webkit.launch();
  for(const width of [390,430]){
   const ctx=await browser.newContext({viewport:{width,height:844},ignoreHTTPSErrors:true});const page=await ctx.newPage();
   await ctx.route('**/*',r=>new URL(r.request().url()).hostname==='localhost'?r.continue():r.abort());
   await page.goto(lab.origin);await page.locator('[data-action="welcomeLogin"]').click();await page.locator('#welcomeCover').waitFor({state:'hidden'});
   await page.locator('#cloudUser').fill(credentials.username);await page.locator('#cloudPassword').fill(credentials.password);await page.locator('[data-action="cloudLogin"]').click();
   await page.waitForFunction(u=>cloud.user?.username===u,credentials.username);await page.locator('#nav [data-tab="treino"]').click();
   assert.equal(await page.locator('#restDockTime').count(),0,'no second counter exists in DOM');
   assert.equal(await page.locator('#restDock #restDisplay').count(),1,'single counter belongs to fixed panel');
   assert.equal(await page.locator('[role="timer"]').count(),1);
   assert.equal(await page.locator('#restDock').isVisible(),true,'idle counter visible');
   const first=await page.locator('#restDock').boundingBox();
   await page.locator('.exercise').last().scrollIntoViewIfNeeded();
   const last=await page.locator('#restDock').boundingBox();assert.ok(Math.abs(first.y-last.y)<1,'fixed position survives scrolling');
   assert.ok(last.x>=0&&last.x+last.width<=width,'fits mobile viewport');
   const nav=await page.locator('#nav').boundingBox();assert.ok(last.y+last.height<=nav.y,'counter above navigation');
   assert.ok(last.height<=90,'compact fixed panel');
   await page.locator('#restToggle').click();assert.equal(await page.evaluate(()=>rest.phase),'running');
   await page.locator('#restToggle').click();assert.equal(await page.evaluate(()=>rest.phase),'paused');
   const remaining=await page.evaluate(()=>rest.remaining);
   await page.reload();await page.waitForFunction(u=>cloud.user?.username===u,credentials.username);await page.locator('#nav [data-tab="treino"]').click();
   assert.equal(await page.evaluate(()=>rest.phase),'paused');assert.equal(await page.evaluate(()=>rest.remaining),remaining);
   await page.locator('#restToggle').click();assert.equal(await page.evaluate(()=>rest.phase),'running');
   await page.locator('[data-action="restReset"]').click();assert.equal(await page.evaluate(()=>rest.phase),'idle');
   await page.locator('#nav [data-tab="painel"]').click();assert.equal(await page.locator('[role="timer"]').count(),0,'timer belongs only to workout');
   console.log('SINGLE_FIXED_REST_WEBKIT_PASS',width);await ctx.close();
  }
 }finally{if(browser)await browser.close();if(lab)await lab.close();fs.rmSync(directory,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
