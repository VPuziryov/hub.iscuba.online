/* External image fixtures are intercepted in memory. No product photographs
   or actual feed URLs are downloaded or stored. Run with local HTTP server. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');const json=p=>JSON.parse(read(p));
const w={};vm.runInNewContext(read('assets/js/gear-images.js'),{window:w,URL});
const image={src:'https://images.fixture.invalid/feed/m1.svg',rights_confirmed:true,rights_evidence:'Test-only licence evidence',source_id:'fixture-feed',feed_item_id:'fixture-m1',alt:{ru:'Test image'}};
const source={source_id:'fixture-feed',provider:'daisycon',approval_status:'approved',rights_evidence:'Test-only official feed permission',permitted_sites:['hub.iscuba.online'],permitted_locales:['ru'],image_rules:[{origin:'https://images.fixture.invalid',path_prefix:'/feed/'}]};
const policy={schema_version:1,sources:[source]};
assert(w.GearImages.resolve(image,policy,'ru'));
assert.equal(w.GearImages.resolve(image,{schema_version:1,sources:[null]},'ru'),null);
assert.equal(w.GearImages.resolve(image,{schema_version:1,sources:[]},'ru'),null);
assert.equal(w.GearImages.resolve(image,policy,'de'),null);
for(const patch of [{rights_confirmed:false},{rights_evidence:''},{feed_item_id:''},{source_id:'other'},
 {src:'http://images.fixture.invalid/feed/m1.svg'}, {src:'https://images.fixture.invalid.evil.invalid/feed/m1.svg'},
 {src:'https://user:pass@images.fixture.invalid/feed/m1.svg'},{src:'https://images.fixture.invalid:8443/feed/m1.svg'},
 {src:'//images.fixture.invalid/feed/m1.svg'},{src:'data:image/png;base64,AA=='},{src:'javascript:alert(1)'},
 {src:'https://images.fixture.invalid/other/m1.svg'}, {src:'https://images.fixture.invalid/feed/%2f../other.svg'},
 {src:'https://images.fixture.invalid/feed/%252e%252e/other.svg'}, {src:'https://images.fixture.invalid/feed/m1.svg#fragment'}])
 assert.equal(w.GearImages.resolve({...image,...patch},policy,'ru'),null,JSON.stringify(patch));
for(const patch of [{approval_status:'pending'},{rights_evidence:''},{provider:'unknown'},{permitted_sites:[]},{permitted_locales:[]},
 {permitted_sites:'hub.iscuba.online'}, {image_rules:[null]},
 {image_rules:[{origin:'https://images.fixture.invalid/other',path_prefix:'/feed/'}]},
 {image_rules:[{origin:'https://images.fixture.invalid',path_prefix:'/feed'}]}])
 assert.equal(w.GearImages.resolve(image,{schema_version:1,sources:[{...source,...patch}]},'ru'),null,JSON.stringify(patch));
assert(w.GearImages.resolve({...image,src:'/assets/img/gear/mask.svg'},null,'ru'));
assert.equal(w.GearImages.resolve({...image,src:'/assets/img/gear/mask.svg',rights_confirmed:false},null,'ru'),null);
assert.deepEqual(json('assets/data/gear/image-sources.json'),{schema_version:1,sources:[]});
console.log('PASS: external image source/rights/site/locale/URL gates; empty production registry; existing local rights gate');
if(process.env.GEAR_UNIT_ONLY==='1')process.exit(0);
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const c=await browser.newContext({viewport:{width:1440,height:1000}});const page=await c.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));const catalogue=json('assets/data/gear/products.json');catalogue.products[0].image={...image};
 let registry=policy,requests=0,fail=false,policyFails=false;
 await c.route('**/products.json*',r=>r.fulfill({json:catalogue}));
 await c.route('**/image-sources.json*',r=>policyFails?r.fulfill({status:503,body:''}):r.fulfill({json:registry}));
 await c.route('https://images.fixture.invalid/**',r=>{requests++;return fail?r.fulfill({status:503,body:''}):r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="teal"/></svg>'});});
 const base=process.env.GEAR_TEST_URL||'http://127.0.0.1:8765';
 async function load(){await page.goto(base+'/ru/gear/?gear_preview=1');await page.waitForSelector('body[data-gear-ready=true]');assert.equal(await page.locator('#hollis-m1 img').getAttribute('loading'),'lazy');await page.locator('#hollis-m1 img').evaluate(i=>i.loading='eager');await page.waitForFunction(()=>{const i=document.querySelector('#hollis-m1 img');return i&&i.complete&&i.naturalWidth>0;});}
 await load();let img=page.locator('#hollis-m1 img');
 assert.equal(await img.getAttribute('src'),image.src);assert.equal(await img.getAttribute('alt'),'Test image');
 assert.equal(await img.getAttribute('referrerpolicy'),'no-referrer');
 assert.equal(await page.locator('#hollis-m1 figcaption').count(),0);assert.equal(requests,1);
 fail=true;await load();
 assert((await page.locator('#hollis-m1 img').getAttribute('src')).startsWith('/assets/img/gear/'));
 assert.equal(await page.locator('#hollis-m1 figcaption').count(),1);
 const prior=requests;registry={schema_version:1,sources:[]};fail=false;await load();assert.equal(requests,prior);
 assert((await page.locator('#hollis-m1 img').getAttribute('src')).startsWith('/assets/img/gear/'));
 registry=policy;catalogue.products[0].image.rights_confirmed=false;await load();assert.equal(requests,prior);
 catalogue.products[0].image.rights_confirmed=true;policyFails=true;await load();assert.equal(requests,prior);
 assert.equal(await page.locator('.gear-card').count(),8);assert.equal(await page.locator('.gear-action a').count(),0);
 assert.deepEqual(errors,[]);await browser.close();
 console.log('PASS: approved remote image renders; lazy setting/referrer policy; load-error schematic fallback; unapproved and unavailable policy make no external requests; no sales');
})().catch(e=>{console.error(e);process.exit(1)});
