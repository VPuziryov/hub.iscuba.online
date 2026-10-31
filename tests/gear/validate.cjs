// No dependencies: node tests/gear/validate.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const json = p => JSON.parse(read(p));
const langs = ['ru','en','de','fr','it','lv','pl'];
const products = json('assets/data/gear/products.json').products;
const offers = json('assets/data/gear/offers.json').offers;
assert.equal(new Set(products.map(p => p.product_id)).size, products.length);
assert.equal(products.length, 3);
for (const p of products) {
  assert.equal(p.status, 'candidate'); assert.equal(p.personally_tested, null);
  assert.equal(p.image, null); assert.equal(p.last_verified, null);
  assert.match(p.source_url, /^https:\/\/www\.tradeinn\.com\/diveinn\/en\/.+\/\d+\/p$/);
}
for (const o of offers) {
  assert.equal(o.affiliate_url, null); assert.equal(o.sub_id, null);
  assert.equal(o.approval_status, 'pending'); assert.deepEqual(o.permitted_locales, []);
  assert.equal(o.network, null); assert.equal(o.campaign, null);
  assert.deepEqual(o.links_by_locale, {});
}
const referenceKeys = Object.keys(json('assets/data/gear/i18n/en.json')).sort();
for (const lang of langs) {
  const t = json('assets/data/gear/i18n/'+lang+'.json');
  assert.deepEqual(Object.keys(t).sort(), referenceKeys);
  const page = read(lang+'/gear/index.html');
  assert(page.includes('<html lang="'+lang+'">'));
  assert(page.includes('href="/'+lang+'/"'));
  assert(page.includes('data-error='));
  for(const other of langs) assert(page.includes('hreflang="'+other+'"'));
  for(const p of products) {
    assert(t.products[p.product_id].purpose);
    assert.deepEqual(t.products[p.product_id].advantages, []);
    assert.deepEqual(t.products[p.product_id].limitations, []);
  }
}
const w = {}; vm.runInNewContext(read('assets/js/gear-links.js'), {window:w,URL});
const api=w.GearLinks;
assert.equal(api.resolveOffer(products[0],offers,'ru'),null);
// Synthetic data below never ships as catalogue content or actual tracking URLs.
const approved={...products[0],status:'approved',approved_by:'test',approved_at:'2026-10-31',last_verified:'2026-10-31',personally_tested:false};
const offer={...offers[0],approval_status:'approved',approval_evidence:'test fixture',network:'test',campaign:'test',permitted_locales:['ru'],permitted_sites:['hub.iscuba.online'],country_scope:'unrestricted',affiliate_url:'https://example.invalid/test',sub_id:'test_p001_ru_card'};
assert(api.resolveOffer(approved,[offer],'ru'));
for(const patch of [{approval_status:'pending'},{affiliate_url:null},{affiliate_url:'javascript:alert(1)'},{permitted_locales:[]},{permitted_sites:[]},{country_scope:'restricted'},{approval_evidence:null},{sub_id:null}])
 assert.equal(api.resolveOffer(approved,[{...offer,...patch}],'ru'),null);
assert.equal(api.resolveOffer(approved,[offer],'de'),null);
assert.equal(api.httpsURL('https://user:pass@example.invalid'),null);
const calls=[];w.fbq=(...args)=>calls.push(args);
api.trackClick(products[0],null,'ru','card'); assert.equal(calls.length,0);
api.trackClick(approved,api.resolveOffer(approved,[offer],'ru'),'ru','card');
assert.deepEqual(calls.map(c=>c[1]),['Gear_Product_Click','Gear_Affiliate_Click']);
w.fbq=()=>{throw Error('blocked')};api.trackClick(approved,offer,'ru','card');
console.log('PASS: 7 locales, 3 candidates, empty affiliate fields, approval gates, click semantics');
