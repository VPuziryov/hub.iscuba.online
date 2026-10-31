# Gear Picks Phase 2 — validation report

Date: 2026-10-31. Baseline: GitHub main 10bfdfd64c140a95e06373a47e2f6a159cb88591.
No production publication, merge, real affiliate requests or live Pixel events were performed.

## Passed

- Dependency-free validator: seven locales with matching translation keys, three
  candidate identities, unknown personal experience, no copied images, all affiliate
  fields null, no permitted locales/sites and pending programme status.
- Syntax checks: gear.js and gear-links.js.
- Chromium 153 with Playwright: 14 language/viewport combinations (1440×1000 and
  390×844), default and local demonstration modes, no JavaScript page errors and
  no horizontal overflow. Rendered desktop/mobile screenshots visually inspected.
- Default mode: zero candidate cards, zero empty category buttons, localized empty state.
- Local demo: three labelled cards, neutral CSS placeholders, three disabled buttons,
  no outgoing product anchors and no Gear click events.
- Production hostname simulation: gear_preview=1 does not reveal candidates.
- Existing language handler: Gear subpath, UTM, fbclid and hash survive switching
  languages. Back-to-Hub href retains the exact query and hash.
- In-memory approved fixture: only categories containing approved translated products
  appear; filter selection updates aria-pressed and cards. Candidate categories stay hidden.
- Future offer policy: missing programme approval, evidence, locale/site permission,
  SubID, valid HTTPS URL or unrestricted country scope disables the offer. Missing
  localized active disclosure also keeps the button disabled.
- In-memory active offer click: Gear_Product_Click and Gear_Affiliate_Click queued
  once each. Null/disabled offers produce neither. Tracking failures do not throw.
- Data load failure: localized error message, no recommendation cards.
- Existing Hub and Egypt routes across all seven languages, current packing/routes
  anchors and existing language switching.
- Existing 7s one-shot events on Hub, Egypt and Gear using a controlled browser clock.
  Gear retains the existing ViewContent_hub_7s behaviour.
- Existing tracked baseline files unchanged, including pixel.js/base.js/ui.js/base.css,
  all Hub/Egypt HTML pages, _headers and netlify.toml.

## Review screenshots

- [Russian desktop demo](gear-screenshots/gear-ru-1440.webp)
- [Russian mobile demo](gear-screenshots/gear-ru-390.webp)

## External checks deliberately pending

- Netlify automatically created an isolated PR preview:
  https://deploy-preview-1--hubiscubaonline.netlify.app/ru/gear/
  GitHub reports Deploy Preview ready. Direct remote browser access from this
  execution environment returned ERR_EMPTY_RESPONSE, so remote rendering is not
  independently verified. Candidate demonstrations remain loopback-only; the
  external preview shows the default empty state.
- Meta Test Events delivery was not tested against the real account. Browser tests
  stub the external Facebook script to prevent polluting production audiences.
- Product suitability, current specifications/availability, image rights and the
  author's personal experience still require verification and editorial approval.
- Daisycon account, programme, geographic/language permissions and real tracking
  links/SubID format remain unconfirmed. No affiliate links are active.
- No physical phone testing; mobile checks use Chromium viewport emulation.
- Existing download binaries were not downloaded; existing markup/script preservation
  and navigation were checked. Upstream assets and external booking services were not changed.
