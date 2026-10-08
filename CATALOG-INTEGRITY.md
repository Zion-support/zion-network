# Catalog integrity and honest verification

The manifest lists explicit `apps_files`. Load every referenced part and deduplicate by `i`; do not treat file names or placeholder tokens as app records.

Run `node scripts/check-catalog-integrity.cjs`. The guard rejects invalid paths, missing or empty parts, placeholder records, duplicate ids, missing descriptions, mismatched totals and reductions below the reviewed baseline. It runs on relevant pushes, pull requests and daily.

On 8 October 2026, commit 398eb55b569739b503867ddd2b2b4f3b3004de46 contained 421 unique records: part1 140, part2 140, part3 14, part4 21, part5 106. An older session saw 540 records with a larger part4; the reason for the reduction needs provenance review. Do not blindly restore a stale draft or declare either number to be all deployed apps.

Catalog presence, HTTP reachability, functioning interactions and production readiness are separate checks. Keep source commit, live URL, exact content marker, interaction results and verification time for each release.

## Shared Discovery journey

- [Free Discovery](https://ziontechgroup.com/discovery/)
- [Local-only process preview and next-step guide](https://ziontechgroup.com/apps/discovery-next-step-guide.html)
- [App Network](https://ziontechgroup.com/apps/)
- [Network map](https://ziontechgroup.com/apps/network.html)

Discovery is free. The questionnaire displays its report before email completes; provider acceptance does not prove receipt in both inboxes. Copy/download and manual fallback must remain available. Never create a purchase or site dispatch without formal client confirmation, an applicable PO and Zion authorization.
