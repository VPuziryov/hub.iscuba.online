# Instructor’s Gear Picks — Phase 2

Status: technical prototype, not a published recommendation list. Work belongs
only to `feature/gear-picks`; do not merge or publish without owner approval.
Scope excludes Safari Planner, Group Leader and exit-intent.

## Routes and preview

Seven pages: `/{ru,en,de,fr,it,lv,pl}/gear/`. No unlocalized `/gear/` route.
Existing base.js, ui.js, pixel.js, Hub/Egypt pages and hosting settings are unchanged.
No new links have been added to the live Hub navigation.

Run from the repository root:

```sh
python -m http.server 8765
```

Open `http://127.0.0.1:8765/en/gear/?gear_preview=1` (or another language).
The flag works ONLY on localhost, 127.0.0.1 or IPv6 loopback. Production and
external deploy previews ignore it. This is a rendering guard, not confidentiality:
candidate JSON files are public static assets if the branch is deployed.
Default mode shows an honest empty state, no candidates and no empty category filters.
The local demo has its own labelled section, three disabled buttons and CSS placeholders.
Candidates never populate recommendation filters, even in demo mode.

## Files

- `assets/data/gear/products.json`: permanent product identity, categories, editorial status, sources and image rights.
- `assets/data/gear/offers.json`: independent merchant offers and programme restrictions.
- `assets/data/gear/i18n/{lang}.json`: interface and editorial copy, keyed by stable product_id.
- `assets/css/gear.css`: styles scoped to .gear-page; existing base.css provides tokens.
- `assets/js/gear.js`: data loading, rendering and filters.
- `assets/js/gear-links.js`: fail-closed offer selection and optional Pixel click events.
- `tests/gear/validate.cjs`: dependency-free catalogue and link-policy tests.
- `tests/gear/browser.cjs`: Playwright interface, responsive and Hub regression checks.

No framework, package installation, build service, backend or account credentials
are required by the site. Playwright is a development/test dependency only.
New asset/data references use `?v=1`; increment VERSION and all matching script/style
references together when releasing changed data/assets under the existing long cache.
No global cache or indexing settings have been changed.

## Editorial publication gates

Candidates: Hollis ST Travel System Wing, Cressi F1 Junior Diving Mask and
Scubapro GO Travel Fins. The three historical source pages were retrieved on
2026-10-31 for identity checks only. Cached retrieval is not a current price,
stock, specification or suitability verification. `last_verified` stays null.
Source URLs are stored as provenance, not clickable sales buttons.
No manufacturer description, review, claimed benefit, measurement or price is copied.

Before publication set status=approved, approved_by, approved_at, last_verified,
and explicitly confirm personally_tested=true or false with the author. Unknown
experience is null. Each locale also requires nonempty purpose, advantages[]
and limitations[]; a missing translation excludes that product in that locale.
Do not approve a product solely to make its card visible.

An image may render only from `/assets/img/gear/` with rights_confirmed=true,
rights_evidence and an appropriate localized alt. Otherwise a CSS placeholder
is rendered. Obtain rights before adding a file. Product approval and partner
programme approval are independent.

## Offer activation — not performed

All shipped affiliate_url/sub_id/network/campaign fields are null; approved
locales/sites and links_by_locale are empty, approval_status=pending.
The historical 533805 identifier is not a Publisher ID and is not used.
No historical NO/SV approvals are inherited by the current seven languages.

For a future activation, record the actual verified network, campaign, approval
evidence, permitted_locales and permitted_sites including hub.iscuba.online.
`country_scope` must explicitly be `unrestricted` for this implementation. A
country-restricted campaign remains disabled: UI language does not establish
visitor country. Add a separately reviewed implementation if country gating is needed.

Store a network-issued HTTPS affiliate_url and its actual sub_id, either on the
offer for a single permitted locale or under links_by_locale[locale]. The latter
supports a separate URL/SubID for each locale. The card placement is `card`.
Future placements need their own mapping and review. Never append guessed
parameters to tracking URLs. Tentative internal naming convention:
`hub_gear_{product_id}_{locale}_{placement}`; network syntax/length still need
confirmation. SubIDs must contain no personal data.

A nonempty approved localized `activeDisclosure` is additionally required to
render commercial links. This replaces the prototype disclosure. The per-link
label is always shown and the link uses rel="sponsored noopener".
Without these approvals the UI shows a disabled button, even for an editorially
approved product. There is intentionally no ordinary merchant-link fallback in Phase 2.

## Routing and analytics

Existing language change preserves path/query/hash using base.js. Back-to-Hub
preserves exact current query/hash. A Gear-only product anchor may have no matching
section on the Hub, but is not silently discarded. No UTM/fbclid is appended to
merchant URLs or Pixel event parameters.

Existing pixel.js is loaded once and unchanged. It currently emits
ViewContent_hub_7s for all non-Egypt pages, including Gear; this existing behaviour
was explicitly retained. ViewContent_EgyptHub_7s remains unchanged.
An active approved offer click emits Gear_Product_Click and Gear_Affiliate_Click
with product_id, merchant, locale, placement and sub_id. Demo/disabled buttons
have no handlers and send neither event. Pixel failures do not block navigation.
These are outbound clicks, never checkout/purchase/commission confirmations.
Revenue must be reconciled with the affiliate network report.

## Validation

```sh
node tests/gear/validate.cjs
# In another terminal, serve repository root on 8765, then:
CHROMIUM_PATH=/path/to/chromium node tests/gear/browser.cjs
```

The browser suite intercepts the Facebook script and never sends real analytics.
Synthetic approved products and example.invalid offer URLs exist only as in-memory
test fixtures. They are not written to the shipped catalogue.
See `gear-picks-test-report.md` for results and remaining external checks.
