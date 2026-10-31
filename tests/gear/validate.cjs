const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');const json=p=>JSON.parse(read(p));
const langs=['ru','en','de','fr','it','lv','pl'];
const products=json('assets/data/gear/products.json').products,offers=json('assets/data/gear/offers.json').offers;
assert.equal(products.length,8);assert.equal(new Set(products.map(p=>p.product_id)).size,8);
assert.equal(products.filter(p=>p.collection==='instructor').length,5);assert.equal(products.filter(p=>p.collection==='color').length,3);
for(const p of products){
 assert.equal(p.status,'candidate');assert.equal(p.personally_tested,null);assert.equal(p.image,null);
 assert(p.last_verified);assert(p.availability.status.startsWith('listing_found'));
 assert.match(p.source_url,/^https:\/\/www\.tradeinn\.com\/diveinn\/en\//);
 const svg=read(p.artwork.src.slice(1));assert(svg.includes('Original equipment category schematic'));
 assert(!/https?:\/\//.test(svg.replace('http://www.w3.org/2000/svg','')));
 if(p.artwork.palette_variants)for(const src of Object.values(p.artwork.palette_variants))assert(read(src.slice(1)));
}
for(const o of offers){
 for(const key of ['affiliate_url','sub_id','network','campaign','approval_evidence'])assert.equal(o[key],null);
 assert.equal(o.approval_status,'pending');assert.deepEqual(o.permitted_locales,[]);
 assert.deepEqual(o.permitted_sites,[]);assert.deepEqual(o.links_by_locale,{});
}
for(const lang of langs){
 const t=json('assets/data/gear/i18n/'+lang+'.json');const page=read(lang+'/gear/index.html');
 assert.equal(t.editorial_status,'draft');assert(page.includes('<html lang="'+lang+'">'));
 assert(page.includes('gear-env.js?v=4'));assert(!page.includes('src="/assets/js/pixel.js"'));
 for(const other of langs)assert(page.includes('hreflang="'+other+'"'));
 const content=t.content_fallback?json('assets/data/gear/i18n/'+t.content_fallback+'.json'):t;
 for(const p of products){const c=content.products[p.product_id];assert.equal(c.status,'draft');assert(c.purpose&&c.experience);assert(c.advantages.length&&c.limitations.length&&c.facts.length);}
 if(!['ru','en'].includes(lang)){assert.equal(t.content_fallback,'en');assert.deepEqual(t.products,{});}
}
const w={};vm.runInNewContext(read('assets/js/gear-links.js'),{window:w,URL});
const p={...products[0],status:'approved',personally_tested:false,approved_by:'fixture',approved_at:'2026-10-31'};
const o={...offers[0],approval_status:'approved',approval_evidence:'fixture',network:'fixture',campaign:'fixture',permitted_locales:['ru'],permitted_sites:['hub.iscuba.online'],country_scope:'unrestricted',affiliate_url:'https://example.invalid/fixture',sub_id:'test_ru_card'};
assert.equal(w.GearLinks.resolveOffer(p,[{...o,component_id:'1'}],'ru'),null);
assert(w.GearLinks.resolveOffer(p,[o],'ru'));assert.equal(w.GearLinks.resolveOffer(products[0],[o],'ru'),null);
for(const patch of [{approval_status:'pending'},{permitted_locales:[]},{permitted_sites:[]},{country_scope:null},{affiliate_url:'javascript:alert(1)'},{sub_id:null}])assert.equal(w.GearLinks.resolveOffer(p,[{...o,...patch}],'ru'),null);
const calls=[];w.fbq=(...a)=>calls.push(a);w.GearLinks.trackClick(p,null,'ru','card');assert.equal(calls.length,0);
w.GearLinks.trackClick(p,o,'ru','card');assert.deepEqual(calls.map(a=>a[1]),['Gear_Product_Click','Gear_Affiliate_Click']);
console.log('PASS: 8 draft cards, 2 collections, 7 routes, explicit language fallback, original art, no affiliate URLs, offer gates');
