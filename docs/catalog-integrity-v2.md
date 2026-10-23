# Catalog integrity: fail-closed review gate (v2)

This is a source-registry audit, not a deployment check. The existing daily GitHub Actions schedule remains at 07:23 UTC; relevant PRs and main changes also trigger checks. All actions are SHA-pinned, the token is read-only, the checkout is sparse and does not persist credentials, and there is no npm install or paid service.

The validator checks the five canonical part files, the explicit manifest, unique IDs, descriptions, optional nonnegative integer category codes, bounded JSON size, regular files (no symlinks), declared total, and the reviewed count floor (currently 421). The baseline provenance must remain a full source commit SHA with a verification date. Reducing the baseline requires a separately reviewed provenance update, not an automatic rewrite.

Run locally: `node --test scripts/check-catalog-integrity.test.cjs && node scripts/check-catalog-integrity.cjs`.

Only count, part count, and aggregate quality advisories are reported. Missing functionality, broken live links and source-to-deployment drift are NOT verified or silently marked green. The existing October 8 registry reconciliation and historical part4 uncertainty remain separate investigation items. No auto-merge, deployment, content generation, or customer outreach is performed.
