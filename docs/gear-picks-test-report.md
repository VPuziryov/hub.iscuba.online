# Gear Picks Phase 3 — validation report

Date: 2026-10-31. Starting feature head: 50a1590bb99ad6d1e8765396f3a61cf81d10925a.
Production baseline: main 10bfdfd64c140a95e06373a47e2f6a159cb88591.
All implementation stays in feature/gear-picks and existing PR #1.

## Local checks passed

- Node validator: eight candidate cards in two collections (5 + 3), separate
  accessory/component provenance, null personal testing for current shop versions,
  null real photos, valid original SVG paths, all affiliate fields empty/pending.
- Seven routes and explicit draft-copy rules. RU/EN editorial drafts; other five
  locales disclose EN fallback. No fallback is eligible for public recommendations.
- Offer gate validation, including rejecting a component offer as a parent link.
  Gear_Product_Click/Gear_Affiliate_Click tested only with synthetic in-memory
  example.invalid fixtures. Disabled buttons send no click events.
- Chromium 153 / Playwright: 21 language/viewport cases: RU, EN, DE, FR, IT, LV, PL
  at 1440×1000, 390×844 and 320×740. No JS page errors or horizontal overflow.
- Eight complete cards and eight draft badges, five Instructor’s Choice cards,
  three Color & Travel cards, no active commercial CTA. All schematic images loaded.
- All three palette controls, image changes, category filters and hidden empty Kids
  category; hidden empty collections when a category filter excludes them.
- Language switching preserves /gear/, UTM/fbclid and #color. Back link retains
  exact query/hash. Anchors work after asynchronous catalogue rendering.
- Exact remote-preview hostname auto-shows drafts. Production and unrelated
  Netlify hostnames cannot reveal them, even with gear_preview=1.
- Preview does not load Pixel. Public/ordinary Gear loads the existing pixel.js once.
- Draft product content stays hidden even if product status alone becomes approved.
  Fully approved synthetic product + locale copy can render in public mode.
- Data-fetch failure gives localized error and removes cards/controls.
- Regression: all seven existing Hub/Egypt locales, packing/routes anchors, existing
  language switching and unchanged one-shot 7s event names on Hub, Egypt and Gear.
- Existing Hub/Egypt HTML, base.css, base.js, ui.js, pixel.js, _headers and
  netlify.toml remain byte-for-byte unchanged from the production baseline.

## Visual review

Screenshots rendered and inspected on desktop and mobile. Original category
illustrations are labelled and never described as exact product photos.

- [Russian desktop page](gear-screenshots/gear-ru-1440.webp)
- [Russian mobile page](gear-screenshots/gear-ru-390.webp)
- [Color & Travel desktop](gear-screenshots/gear-color-1440.webp)
- [Color & Travel mobile](gear-screenshots/gear-color-390.webp)

## Remote preview

https://deploy-preview-1--hubiscubaonline.netlify.app/ru/gear/

Netlify automatically rebuilds the existing PR preview after branch updates.
Remote cloud-browser verification completed: the live PR URL rendered eight
preliminary cards, both collections, draft notices and disabled store buttons.
The Color & Travel anchor and pink palette were clicked; the fin image source
changed to travel-fins-pink.svg and the new pink fin/mask artwork rendered visibly.
This resolves the previous Phase 2 remote-rendering limitation.
No production deployment or merge is performed.

## Still pending

- Owner approval of editorial explanations and translations; real-image publication
  permission. Schematics are an intentional substitute until permission exists.
- Exact stock/configuration/colour/delivery verification before purchases. G2
  listing shows Notify me; do not claim every candidate is presently in stock.
- Daisycon programme/site/locale/country terms and real network-issued URLs/SubIDs.
- Real Meta Test Events delivery and physical-device testing. Local browser tests
  block external Facebook traffic and emulate mobile viewports.


## Image URL correction — 2026-11-01

Supports external HTTPS photos from explicitly approved official Tradeinn/Daisycon
feed sources while retaining the existing local-image rights gate. Production
source registry remains empty; product images and affiliate URLs remain null.
No product photographs have been downloaded or added to GitHub.

Passed: policy unit tests for rights/evidence/source/feed-item/site/locale gates,
exact origin/port/path matching, malformed entries, unsafe schemes, credentials,
suffix-host tricks and encoded path ambiguities. Browser fixtures test direct
external rendering, lazy loading, no-referrer, failed-photo schematic fallback,
no outbound image request for unapproved rights/sources or an unavailable registry,
and retention of eight schematic cards with disabled sales. All fixture image
responses are in-memory SVG blocks at example.invalid-style domains, not product
photos or real feed URLs. The existing 21-case language/viewport regression suite
is rerun after the correction. Existing Hub/Egypt/Pixel and main remain unchanged.
