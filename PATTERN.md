# 🎨 Zion Content Pattern — canonical design & navigation (v1, 2026-10-07)

All new published content (homepage showcases, batch pages, spotlights, discovery pages) MUST follow this single pattern so the network looks and navigates consistently.

## Page structure (in order)
1. **Top nav line**: `Zion Tech Group · Apps · App Network · Free Discovery` (+ GitHub hub on showcase pages).
2. **Banner** (`h1` + one-line lead): what the page is, batch number, "free, open-source, interlinked".
3. **Card grid**: one card per app — name, one-line value prop, links: live app (`https://ziontechgroup.com/<slug>/`) + GitHub repo.
4. **Discovery CTA banner**: free, always online, instant results emailed to the client and commercial@ziontechgroup.com → https://ziontechgroup.com/discovery/
5. **Footer links**: category page, spotlight, INTERLINKS doc, network hub (https://zion-support.github.io/zion-network/).

## Styles
- Use the shared stylesheet: `https://ziontechgroup.com/assets/css/apps-pattern.css` (repo: zion-support.github.io `assets/css/apps-pattern.css`).
- Palette: bg `#0b1220`, card `#121a2b`, ink `#e8eef8`, muted `#9aa8bd`, accent `#7dd3fc`.
- Classes: `.wrap .topnav .banner .grid .card .btn .btn.alt .muted`.
- Pages must be self-contained enough to render if the CSS CDN fails (critical inline styles allowed, but do not invent new palettes).

## Rules
- Discovery is **always free, always online** — never price it.
- Every app card links both the live app AND the GitHub repo (interlinking requirement).
- Every page links back to the network hub and the Discovery questionnaire.
- Batch pages are named `apps/october-2026-batch<N>[-theme].html`; check APPS_NETWORK.md + War Room for the next free batch number before shipping.
- Language: homepage sections pt-BR, showcase/batch pages EN.

_Reference implementation: [apps/october-2026-batch90-sports-fitness.html](https://ziontechgroup.com/apps/october-2026-batch90-sports-fitness.html)_
