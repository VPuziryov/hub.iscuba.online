# Instructor’s Gear Picks — Phase 3

Editorial reference: owner’s final decision in section 15 of Notion page
40a85694bb3281d19b09d8c530003c77 (read on 2026-10-31).
Continue PR #1, feature/gear-picks. Never merge or deploy production without approval.

## Review

https://deploy-preview-1--hubiscubaonline.netlify.app/ru/gear/

The exact Netlify PR-host pattern `deploy-preview-<number>--hubiscubaonline.netlify.app`
shows preliminary cards automatically, without a query flag. Local review:

```sh
python -m http.server 8765
# http://127.0.0.1:8765/ru/gear/?gear_preview=1
```

No other external hostname, including production, can enable candidates through
query parameters. Preview is not an access-control or confidentiality mechanism:
JSON is a public static asset if the branch is deployed. All eight cards and both
RU/EN copy sets remain candidate/draft. No sales are active.

## Contents

Instructor’s Choice: M1 (with an independent neoprene-strap accessory note),
standard F1, ST Travel/ST22, a Compact SMB plus finger-spool editorial pairing,
and Galileo G2. Color & Travel: GO Sport, Trinidad 3, Navigator Lite.
The buoy/spool pairing is not a seller bundle. There are eight editorial cards,
with individual source URLs for the two additional component products.

M1/F1 model ownership is confirmed in the owner’s account, not a fresh test of
current shop SKUs. Personally_tested remains null for current retail versions.
Other modern candidates use confirmed selection criteria, not invented experience.
Galileo Sol is the author’s computer; G2 is a distinct modern catalogue candidate.
This is recreational equipment selection. K6, old S25 identification, historical
photographs, unrelated Safari Planner, Group Leader and exit-intent are excluded.

See gear-picks-research.md for facts, source URLs, availability caveats and image rights.

## Data and rendering

- products.json: stable IDs, collection/category, exact provenance URLs, optional
  component products, experience scope, verification scope, retail availability
  caveats and artwork/image metadata.
- offers.json: independent merchant offers; component_id prevents a component
  offer being selected as the parent product’s purchase link.
- i18n/ru.json and en.json: complete editorial DRAFTS, not approved recommendations.
- DE/FR/IT/LV/PL: seven routes and existing translated interface remain; editorial
  product copy falls back explicitly to EN with a localized notice. These locales
  have no silently approved translations and cannot publish fallback copy.
- gear-env.js: exact hostname preview detection and analytics isolation.
- gear.js: safe DOM rendering, sections, category filters, collapsible provenance,
  palette controls, error handling and approval gates.
- gear-links.js: verified-URL policy; never fabricates a tracking URL.
- gear-images.js + image-sources.json: independent photo-rights and official-feed
  source policy. The source registry is empty until permissions are confirmed.
- gear.css: additive styles scoped to .gear-page. base.css is unchanged.
- assets/img/gear/*.svg: original category schematics, explicitly not exact product photos.

Only populated categories appear for the current visible dataset. Production
uses only approved products and copy. Preview uses candidates and shows a draft
badge on every card. Palette choices change schematic colours, not real SKU
selection, shopping stock or compatibility. Colours are approximate screen swatches.
All sources are revealed in preview disclosures: manufacturer references are
clickable; retailer URLs are copyable text, not commercial buttons.

## Public publication gate

A product needs status=approved, approved_by, approved_at, last_verified and
explicit boolean personally_tested. Each locale needs editorial_status=approved,
no content_fallback, and product copy.status=approved with purpose, advantages
and limitations. `last_verified` only records the stated research scope; it does
not approve a recommendation, confirm stock or confirm personal testing.

Real images require rights_confirmed=true and nonempty rights_evidence.
Both existing local assets and external HTTPS URLs from officially permitted
Tradeinn/Daisycon feeds are supported. The renderer does not download external
photos into the repository: the browser loads the approved URL directly.

For an external image, the product image record must supply source_id and
feed_item_id. Its source_id must match an approved entry in image-sources.json:
provider is tradeinn or daisycon; rights_evidence documents official feed/image
publication permission; permitted_sites includes hub.iscuba.online and
permitted_locales includes the current page language. image_rules specifies exact
HTTPS origins plus directory path_prefix values (ending in /). No wildcard or
substring hostname matching is used. These permissions cover images independently
of affiliate-link approval. Do not infer a permitted CDN from the provider name.
No source is pre-approved: the shipped registry contains sources=[].

Example schema ONLY (reserved .invalid domain, not an actual authorised source):

```json
{
  "source_id": "example-approved-feed",
  "provider": "daisycon",
  "approval_status": "approved",
  "rights_evidence": "Reference to the actual written image-use permission",
  "permitted_sites": ["hub.iscuba.online"],
  "permitted_locales": ["ru"],
  "image_rules": [{"origin": "https://approved-cdn.example.invalid", "path_prefix": "/product-images/"}]
}
```

The corresponding image record uses src, rights_confirmed, rights_evidence,
source_id, feed_item_id and localized alt. Add a real source only after confirming
that its feed URLs and delivery/redirect behaviour fall within that permission.
HTTP, protocol-relative/data/JavaScript URLs, URL credentials, unapproved
origins/ports/paths and encoded path ambiguities are rejected. Invalid or
unavailable source policy disables external photos without hiding the catalogue.
All images retain lazy loading and reserved dimensions; external requests use
no-referrer. Failed photo loading falls back to a labelled original schematic.
If the schematic also fails, a localized pending-image message replaces it.
Existing product image fields remain null. No photos were downloaded or committed.

## Affiliate activation: still disabled

Every affiliate_url/sub_id/network/campaign is null. Programme approval is pending;
permitted_locales/sites and links_by_locale are empty. Historical NO/SV approvals
and Advertising Space ID 533805 are not reused.

A future root product offer needs real programme/site/locale approval, evidence,
network/campaign, HTTPS URL issued by the network, individual SubID and localized
activeDisclosure. Country_scope must be explicitly unrestricted; restricted
countries need a separately reviewed implementation. UI language is not geography.
Root links and component links must remain independent. No ordinary merchant-link
fallback is provided. Preview never renders commercial links, even if approved
offers are introduced later. Future component purchase UI is out of this phase.

Proposed internal SubID convention: hub_gear_{product_id}_{locale}_{placement}.
Actual Daisycon parameter syntax/limits are not confirmed. Never append guessed
parameters or forward incoming UTM/fbclid to a merchant tracking URL.

## Routing, cache and analytics

Existing base.js/ui.js are unchanged. Language switching retains path, query,
UTM/fbclid and hash. Back-to-Hub retains query/hash even if a product-only anchor
has no equivalent Hub section. No universal /gear/ language router was added.
New assets/data use ?v=4; bump data VERSION and matching script/style references
when updating files under the current long cache. Global hosting/indexing settings
were not changed; new Gear pages retain noindex,nofollow.

Preview does not load pixel.js at all, avoiding false audience accumulation.
Ordinary public Gear loads the existing pixel.js once, unchanged; its existing
ViewContent_hub_7s behaviour is retained. Existing Hub/Egypt pages and their 7s
logic are untouched. Active approved root links can queue Gear_Product_Click and
Gear_Affiliate_Click. Disabled preview buttons queue nothing. Clicks are not purchases.

## Tests

```sh
node tests/gear/validate.cjs
GEAR_UNIT_ONLY=1 node tests/gear/images.cjs
# Serve repository root; Playwright and Chromium are development tools only.
CHROMIUM_PATH=/path/to/chromium node tests/gear/browser.cjs
CHROMIUM_PATH=/path/to/chromium node tests/gear/images.cjs
```

No runtime framework/build dependencies. Read gear-picks-test-report.md for results.
