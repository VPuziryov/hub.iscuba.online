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

Real images require rights_confirmed=true, rights_evidence and a local asset URL.
Otherwise an original schematic is used and labelled. No image has been downloaded
from a manufacturer/store, and no photo licence has been invented.

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
New assets/data use ?v=3; bump data VERSION and matching script/style references
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
# Serve repository root; Playwright and Chromium are development tools only.
CHROMIUM_PATH=/path/to/chromium node tests/gear/browser.cjs
```

No runtime framework/build dependencies. Read gear-picks-test-report.md for results.
