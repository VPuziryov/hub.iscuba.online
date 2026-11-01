/* Serve repository root on 8765; requires Playwright and CHROMIUM_PATH.
   External Facebook is stubbed. No real analytics or affiliate traffic is sent. */
const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'../..');const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const base=process.env.GEAR_TEST_URL||'http://127.0.0.1:8765';const langs=['ru','en','de','fr','it','lv','pl'];
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 async function context(viewport){const c=await b.newContext({viewport});await c.route('https://connect.facebook.net/**',r=>r.fulfill({body:''}));return c;}
 let count=0;
 for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:320,height:740}]){
  const c=await context(viewport);const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  for(const lang of langs){
   const q='?utm_source=facebook&fbclid=test&gear_preview=1';
   await p.goto(base+'/'+lang+'/gear/'+q+'#color');await p.waitForSelector('body[data-gear-ready=true]');
   assert.equal(await p.locator('.gear-card').count(),8);
   assert.equal(await p.locator('#gear-instructor-grid .gear-card').count(),5);assert.equal(await p.locator('#gear-color-grid .gear-card').count(),3);
   assert.equal(await p.locator('.gear-card .gear-draft').count(),8);assert.equal(await p.locator('.gear-card button:disabled').count(),8);
   assert.equal(await p.locator('.gear-card .gear-action a').count(),0);assert.equal(await p.locator('[data-category=kids]').count(),0);
   assert.equal(await p.evaluate(()=>typeof window.fbq),'undefined');
   assert.equal(await p.locator('#gear-translation').isVisible(),true);
   const old=await p.locator('#scubapro-go-sport img').getAttribute('src');
   await p.locator('[data-palette=pink]').click();
   assert.notEqual(await p.locator('#scubapro-go-sport img').getAttribute('src'),old);
   assert((await p.locator('#scubapro-go-sport img').getAttribute('src')).includes('-pink.svg'));
   assert.equal(await p.locator('[data-palette=pink]').getAttribute('aria-pressed'),'true');
   await p.locator('[data-category=safety]').click();assert.equal(await p.locator('.gear-card').count(),2);assert.equal(await p.locator('#color').isVisible(),false);
   await p.locator('[data-category=all]').click();assert.equal(await p.locator('.gear-card').count(),8);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await p.evaluate(()=>document.querySelectorAll('.gear-art').forEach(i=>i.loading='eager'));
   await p.waitForFunction(()=>[...document.querySelectorAll('.gear-art')].every(i=>i.complete&&i.naturalWidth>0));
   assert((await p.locator('[data-gear-back]').getAttribute('href')).endsWith(q+'#color'));
   if(lang==='ru'&&process.env.GEAR_SCREENSHOTS&&viewport.width!==320){
    await p.locator('[data-palette=teal]').click();await p.waitForFunction(()=>[...document.querySelectorAll('.gear-art')].every(i=>i.complete&&i.naturalWidth>0));await p.evaluate(()=>scrollTo(0,0));
    await p.screenshot({path:process.env.GEAR_SCREENSHOTS+'/gear-ru-'+viewport.width+'.png',fullPage:true});
    await p.locator('#gear-entry-color').click();await p.screenshot({path:process.env.GEAR_SCREENSHOTS+'/gear-color-'+viewport.width+'.png'});
   }
   const next=lang==='en'?'ru':'en';await p.selectOption('#language',next);await p.waitForURL('**/'+next+'/gear/'+q+'#color');count++;
  }
  assert.deepEqual(errors,[]);await c.close();
 }
 const c=await context({width:1440,height:1000});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const host of ['hub.iscuba.online','deploy-preview-1--hubiscubaonline.netlify.app','evil--hubiscubaonline.netlify.app','deploy-preview-9--anotherproject.netlify.app']){
  await c.route('https://'+host+'/**',async r=>{const u=new URL(r.request().url());const x=await fetch(base+u.pathname+u.search);await r.fulfill({status:x.status,body:Buffer.from(await x.arrayBuffer()),headers:{'content-type':x.headers.get('content-type')}});});
  await p.goto('https://'+host+'/ru/gear/?gear_preview=1');await p.waitForSelector('body[data-gear-ready=true]');
  const preview=host==='deploy-preview-1--hubiscubaonline.netlify.app';
  assert.equal(await p.locator('.gear-card').count(),preview?8:0);assert.equal(await p.locator('#gear-filters').isVisible(),preview);
  assert.equal(await p.evaluate(()=>typeof window.fbq),preview?'undefined':'function');
 }
 // Candidate content stays hidden at every public locale, even with a preview flag.
 for(const lang of langs){await p.goto('https://hub.iscuba.online/'+lang+'/gear/?gear_preview=1');await p.waitForSelector('body[data-gear-ready=true]');assert.equal(await p.locator('.gear-card').count(),0);}
 // A product cannot be made public without approval of both editorial copy and product.
 const catalog=json('assets/data/gear/products.json');catalog.products[0]={...catalog.products[0],status:'approved',personally_tested:false,approved_by:'test',approved_at:'2026-10-31'};
 const ui=json('assets/data/gear/i18n/en.json');
 await c.route('**/assets/data/gear/products.json*',r=>r.fulfill({json:catalog}));
 await c.route('**/assets/data/gear/i18n/en.json*',r=>r.fulfill({json:ui}));
 await p.goto(base+'/en/gear/');await p.waitForSelector('body[data-gear-ready=true]');assert.equal(await p.locator('.gear-card').count(),0);
 ui.editorial_status='approved';ui.products[catalog.products[0].product_id].status='approved';
 await p.reload();await p.waitForSelector('body[data-gear-ready=true]');assert.equal(await p.locator('.gear-card').count(),1);assert.equal(await p.locator('.gear-card button:disabled').count(),1);
 await c.route('**/assets/data/gear/products.json*',r=>r.fulfill({status:503,body:''}));await p.reload();await p.waitForSelector('body[data-gear-ready=error]');assert.equal(await p.locator('#gear-state').innerText(),ui.error);
 assert.deepEqual(errors,[]);await c.close();
 // Existing pages, routing and pixel.js timer stay unchanged.
 const rc=await context({width:390,height:844});const rp=await rc.newPage();
 for(const lang of langs){await rp.goto(base+'/'+lang+'/?utm_source=test#packing');assert.equal(await rp.locator('#packing').count(),1);await rp.selectOption('#language',lang==='en'?'ru':'en');await rp.waitForURL('**/'+(lang==='en'?'ru':'en')+'/?utm_source=test#packing');await rp.goto(base+'/'+lang+'/egypt/');assert.equal(await rp.locator('#routes').count(),1);}
 await rp.clock.install();
 for(const [route,event] of [['/en/','ViewContent_hub_7s'],['/en/egypt/','ViewContent_EgyptHub_7s'],['/en/gear/','ViewContent_hub_7s']]){await rp.goto(base+route);await rp.waitForFunction(()=>typeof fbq==='function');await rp.clock.runFor(7100);assert.equal(await rp.evaluate(e=>fbq.queue.filter(a=>a[1]===e).length,event),1);await rp.clock.runFor(8000);assert.equal(await rp.evaluate(e=>fbq.queue.filter(a=>a[1]===e).length,event),1);}
 await rc.close();await b.close();console.log('PASS: '+count+' language/viewport cases; 8 cards; palette/filter interactions; exact preview host gate; draft publication gates; seven Hub/Egypt locales; unchanged 7s events');
})().catch(e=>{console.error(e);process.exit(1)});
