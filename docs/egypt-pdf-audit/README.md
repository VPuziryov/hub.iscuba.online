# Egypt giveaway links audit — 2026-11-01

Review branch only. Production Hub/main and Gear Picks PR #1 are unchanged.

## Funnel

Hub/PDF offer → https://egypt.iscuba.online/ → full safari form or Telegram bot. Bot → schedule-only /schedule/. Explicit existing schedule/form references retain /safari/ru/ or /safari/en/. No PDF or Hub CTA is forced directly into Messenger/Telegram.

## Inventory and changes

- Seven Egypt Hub pages: RU/EN/DE/FR/IT/LV/PL. Other language pages reuse EN PDFs.
- Ten repository Egypt/safari PDFs plus two current 30-page route PDFs served via Drive redirects: 12 source files, 242 pages, 987 URI annotations.
- 701 URI annotations corrected. Source PDF page layout, text, page sizes, annotation rectangles/counts, and unrelated links retained. All 242 pages rendered pixel-identically at 72 dpi before/after. Files reopened successfully. Physical page 22 of 25_Sovetov_RU_hub.pdf (printed page 21) checked visually; Egypt link now points at main Egypt landing.
- All external annotations, page number and text under their rectangles: [all-links.csv](all-links.csv). Repeated annotations are retained individually, not deduplicated.
- `changes.json`: exact 701 edits. `validation.json`: per-file validation. `inventory.json` and `annotations.json`: original sources. `http-checks.json`: original URI redirect chains/statuses. `new-target-checks.json`: new destination checks.
- Six additional root 7rules_50Plus RU/EN/DE/FR/IT/LV PDFs inspected: only iscuba.online and groups.iscuba.online links; outside Egypt distribution, unchanged.
- Packing lists are PNG files, not PDFs or HTML image maps; no embedded clickable links to replace. ZIP wallpapers unchanged.

| Old reference | New destination | Reason |
|---|---|---|
| /dive/egypt-ru/, /dive/egypt-en/, /dive/safari-egypt/, /dive/eg-safari-ru/, /dive/eg-safari-en/ | https://egypt.iscuba.online/ | General Egypt offer |
| /dive/sadko-ru/, /dive/sadko-en/ on route content | https://egypt.iscuba.online/ | Route/offer entry; main landing introduces safari |
| /dive/eg-timetable/ and old direct WordPress timetable URLs | https://egypt.iscuba.online/safari/ru/ or /en/ | Existing schedule/form purpose; PDF language retained |
| https://scuba.online/ behind iScuba wordmark | https://iscuba.online/ | Typo in RU routes, 90 annotations across 3 editions |
| Hub old bot and eg-timetable CTAs | https://egypt.iscuba.online/ | Agreed Hub entry point; bot lives downstream |

The current Drive route editions differ in binary size from archived repository editions. They are preserved as separate `egypt-routes-current-ru.pdf` / `egypt-routes-current-en.pdf`; stable `/assets/downloads/red-sea-routes-ru|en` redirect aliases now serve those corrected copies. Drive originals and public permissions are untouched. Existing archived PDF paths are also corrected. Cache revalidation added for downloads; direct PDF links in Egypt Hub pages carry a version query to avoid the prior year-long cache.

## Redirect verification and limits

Owner's WordPress changes independently confirmed: safari-egypt and eg-safari-ru|en → main Egypt; eg-schedule-form-ru|en → respective new full form; eg-timetable → /safari/. These are WordPress plugin redirects outside this GitHub repository. No global redirect was changed by this PR.

Several unrelated informational/affiliate URLs returned HTTP 403/503 or timeouts to this audit client. Those responses do not prove the links are broken for visitors; they are recorded and left unchanged. Divebooker, gear, other countries, author contacts and Gamma credits are outside this correction. No replacement destinations were invented.

## Separate WordPress follow-up

For already downloaded old PDF copies: /dive/egypt-ru/ and /dive/egypt-en/ still redirect to old egypt-iso landings; /dive/sadko-ru/ and /dive/sadko-en/ still lead to old WP timetables. Review external uses before changing these globally. Recommended main Egypt for generic Egypt offers; retain explicit form purpose where applicable. Old direct WordPress timetable pages remain reachable; no deletion or global redirect proposed without reviewing inbound uses. Partner /dive/safari-egypt-2/ must remain untouched.

## Reproducibility

Only URI action dictionaries are edited (including indirect /A actions), using incremental PDF updates. For each pair: reopen, compare page count/rectangles/text, count/link rectangles and all URI destinations, render each page and compare raw pixels. New current editions compared to their downloaded Drive originals. Duplicate archived editions have byte-identical originals and share the corrected binary. No document reflow.
