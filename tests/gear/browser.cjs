/* Requires Playwright + a Chromium executable. No production requests or events.
   python -m http.server 8765 --directory .
   CHROMIUM_PATH=/path/to/chromium node tests/gear/browser.cjs
*/
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const base=process.env.GEAR_TEST_URL || 'http://127.0.0.1:8765';
const langs=['ru','en','de','fr','it','lv','pl'];
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 let checks=0;
 async function context(viewport){
  const c=await browser.newContext({viewport});
  await c.route('https://connect.facebook.net/**',r=>r.fulfill({body:'',contentType:'application/javascript'}));
  await c.route('https://www.facebook.com/**',r=>r.abort());
  return c;
 }
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const c=await context(viewport);const page=await c.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const lang of langs){
   const query='?utm_source=facebook&utm_campaign=gear&fbclid=test';
   await page.goto(base+'/'+lang+'/gear/'+query+'#packing');
   await page.waitForSelector('body[data-gear-ready=true]');
   assert.equal(await page.locator('#gear-grid article').count(),0);
   assert.equal(await page.locator('#gear-demo').isVisible(),false);
   assert.equal(await page.locator('#gear-filters').isVisible(),false);
   assert((await page.locator('[data-gear-back]').getAttribute('href')).endsWith(query+'#packing'));
   await page.selectOption('#language',lang==='en'?'ru':'en');
   await page.waitForURL('**/'+(lang==='en'?'ru':'en')+'/gear/'+query+'#packing');
   await page.goto(base+'/'+lang+'/gear/'+query+'&gear_preview=1#packing');
   await page.waitForSelector('body[data-gear-ready=true]');
   assert.equal(await page.locator('#gear-demo article').count(),3);
   assert.equal(await page.locator('#gear-demo button:disabled').count(),3);
   assert.equal(await page.locator('#gear-demo a').count(),0);
   assert.equal(await page.locator('#gear-filters').isVisible(),false);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.equal(await page.evaluate(()=>fbq.queue.filter(a=>String(a[1]).startsWith('Gear_')).length),0);
   if(process.env.GEAR_SCREENSHOTS && lang==='ru'){await page.screenshot({path:process.env.GEAR_SCREENSHOTS+'/gear-ru-'+viewport.width+'.png',fullPage:true});}
   checks++;
  }
  assert.deepEqual(errors,[]);
  await c.close();
 }
 const c=await context({width:1440,height:1000});const page=await c.newPage();
 // Public hostname cannot expose candidates through a query parameter.
 await c.route('https://hub.iscuba.online/**',async route=>{
  const url=new URL(route.request().url());const local=await fetch(base+url.pathname+url.search);
  await route.fulfill({status:local.status,body:Buffer.from(await local.arrayBuffer()),headers:{'content-type':local.headers.get('content-type')}});
 });
 await page.goto('https://hub.iscuba.online/ru/gear/?gear_preview=1');
 await page.waitForSelector('body[data-gear-ready=true]');
 assert.equal(await page.locator('#gear-demo').isVisible(),false);
 // Approved fixture checks real filters and fail-closed button behavior.
 const catalog=read('assets/data/gear/products.json');
 catalog.products[0]={...catalog.products[0],status:'approved',approved_by:'test',approved_at:'2026-10-31',last_verified:'2026-10-31',personally_tested:false};
 const t=read('assets/data/gear/i18n/en.json');
 t.products[catalog.products[0].product_id]={purpose:'Test fixture',advantages:['Test benefit'],limitations:['Test limitation']};
 await c.route('**/assets/data/gear/products.json*',r=>r.fulfill({json:catalog}));
 await c.route('**/assets/data/gear/i18n/en.json*',r=>r.fulfill({json:t}));
 await page.goto(base+'/en/gear/');await page.waitForSelector('body[data-gear-ready=true]');
 assert.equal(await page.locator('#gear-grid article').count(),1);
 assert.equal(await page.locator('#gear-filters button').count(),2);
 assert.equal(await page.locator('[data-category=kids]').count(),0);
 await page.locator('[data-category=safari]').click();
 assert.equal(await page.locator('[data-category=safari]').getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('#gear-grid button:disabled').count(),1);
 // Active future offers require explicit disclosure and all approval gates.
 const offers=read('assets/data/gear/offers.json');
 offers.offers[0]={...offers.offers[0],approval_status:'approved',approval_evidence:'fixture',network:'fixture',campaign:'fixture',permitted_locales:['en'],permitted_sites:['hub.iscuba.online'],country_scope:'unrestricted',affiliate_url:'https://example.invalid/test',sub_id:'test_product_en_card'};
 await c.route('**/assets/data/gear/offers.json*',r=>r.fulfill({json:offers}));
 await page.reload();await page.waitForSelector('body[data-gear-ready=true]');
 assert.equal(await page.locator('#gear-grid a').count(),0);
 t.activeDisclosure='Synthetic test disclosure';
 await page.reload();await page.waitForSelector('body[data-gear-ready=true]');
 assert.equal(await page.locator('#gear-grid a').count(),1);
 await page.evaluate(()=>document.querySelector('#gear-grid a').dispatchEvent(new MouseEvent('click')));
 const events=await page.evaluate(()=>fbq.queue.filter(a=>String(a[1]).startsWith('Gear_')).map(a=>a[1]));
 assert.deepEqual(events,['Gear_Product_Click','Gear_Affiliate_Click']);
 // Fetch failure has a localized recovery message and no cards/buttons.
 await c.route('**/assets/data/gear/products.json*',r=>r.fulfill({status:503,body:''}));
 await page.reload();await page.waitForSelector('body[data-gear-ready=error]');
 assert.equal(await page.locator('#gear-grid article').count(),0);
 assert.equal(await page.locator('#gear-state').innerText(),t.error);
 await c.close();
 // Existing Hub routes and timer: unchanged scripts; real page initialization.
 const regression=await context({width:390,height:844});const hub=await regression.newPage();
 for(const lang of langs){
  await hub.goto(base+'/'+lang+'/?utm_source=test#packing');
  assert.equal(await hub.locator('#packing').count(),1);
  await hub.selectOption('#language',lang==='en'?'ru':'en');
  await hub.waitForURL('**/'+(lang==='en'?'ru':'en')+'/?utm_source=test#packing');
  await hub.goto(base+'/'+lang+'/egypt/');assert.equal(await hub.locator('#routes').count(),1);
 }
 await hub.clock.install();
 for(const [url,event] of [['/en/','ViewContent_hub_7s'],['/en/egypt/','ViewContent_EgyptHub_7s'],['/en/gear/','ViewContent_hub_7s']]){
  await hub.goto(base+url);await hub.clock.runFor(7100);
  assert.equal(await hub.evaluate(e=>fbq.queue.filter(a=>a[1]===e).length,event),1);
  await hub.clock.runFor(8000);assert.equal(await hub.evaluate(e=>fbq.queue.filter(a=>a[1]===e).length,event),1);
 }
 await regression.close();await browser.close();
 console.log('PASS: '+checks+' locale/viewport cases; public preview guard; approved filters; disclosure/offer gating; click events; fetch failure; 7 Hub/Egypt locales; 7s one-shot events');
})().catch(e=>{console.error(e);process.exit(1)});
