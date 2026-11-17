# Taiwan historical observatory

Public route: `/observatory/`, with an English UI available through `?lang=en` or the language switch. This is a bounded adaptation of the supplied unfinished observatory, not the full original application.

The published version includes pan/zoom, indicative ADIZ and median-line layers, daily zone counts, a date range, playback, a clickable timeline, sources and CSV export. It contains the August 2022 sample only (31 days, 119 underlying records, 446 reported sorties). Counts are not unique aircraft; no flight tracks or military coordinates are inferred. Symbol centres are schematic.

Data: daily aggregates from the public `ADIZ Data` tab of Gerald C. Brown and Benjamin Lewis, *Taiwan ADIZ Violations*, PLATracker, 2024. Source: https://docs.google.com/spreadsheets/d/1qbfYF0VgDBJoFZN5elpZwNTiKZ4nvCUcs5a7oYwm52g/edit . Retrieved 2026-11-18. Source URLs are retained for each day. This limited sample does not imply a licence to redistribute the whole database; consult its maintainers before expanding to a full archive.

Geography: Natural Earth 1:50m admin-0 country outlines for the surrounding region, public domain: https://www.naturalearthdata.com/about/terms-of-use/ . Geometry is generalised, not suitable for navigation. The indicative ADIZ and median line derive from the supplied prototype and are labelled as approximate.

Build: run `npm ci` at the repository root, `npm --prefix observatory ci`, then `npm run build` and `npm run check`. CI builds the static pages first and the application second. No backend, keys, cookies, browser storage, external fonts or external map requests are required. The browser fetches only the same-origin history.json. Source links open only on demand.

Verification: aggregation checks (total 446; 5 August 49 including 30 median-line crossings), build and local links, UI date navigation/zoom/layers/language, date range 5–6 August gives 69, CSV output, and dependency audit. The original application's unimplemented live feeds are not exposed here.
