# Catalog integrity: fail-closed review gate (v2)

This is a source-registry audit, not a deployment check. The existing daily GitHub Actions schedule remains at **07:23 UTC**; relevant PRs and main changes also trigger checks. All actions are SHA-pinned, the token is read-only, the checkout is sparse and does not persist credentials, and there is no npm install or paid service.

The validator checks the five canonical part files, the explicit manifest, unique IDs, descriptions, optional nonnegative integer category codes, bounded JSON size, regular files (no symlinks/executables), declared total, and the reviewed 421-record safety floor. Baseline provenance must be a full source commit SHA with a verification date. Reducing the count floor requires a separately reviewed code and provenance update, not only a baseline JSON rewrite.

## PR change intelligence (no new schedule or write permissions)

On pull requests, after source integrity passes, `scripts/catalog-change-intelligence.cjs` compares the **checked-out merge commit's first parent** against the checked-out registry. It verifies `BASE_SHA` equals the first parent and fails closed if the parent is unavailable. Checkout retains the two commits necessary for this comparison. The report classifies additions, removals, edited descriptions, changed categories, and baseline provenance changes. Bounded 15-ID samples (never description contents) appear in CI output; aggregate metrics and explicit **NOT VERIFIED** live-readiness labels appear in the GitHub job summary.

Removing an ID, changing baseline provenance or modifying at least the larger of 20 IDs and 10% of the previous registry emits **owner review required**. The diff score is *advisory* and must not be mistaken for automated publication approval; the core structural audit remains fail-closed. A valid app count cannot prove route availability, forms, delivery, pricing accuracy, or a working deployed application. This first-parent comparison is not a global historical deletion audit or an assurance of compatibility.

Run offline:

```
node --check scripts/check-catalog-integrity.cjs
node --check scripts/catalog-change-intelligence.cjs
node --test scripts/check-catalog-integrity.test.cjs
node --test scripts/catalog-change-intelligence.test.cjs
node scripts/check-catalog-integrity.cjs
```

For an exact merge-commit PR checkout with `fetch-depth: 2`, set `BASE_SHA` to the PR's base SHA before running the change-intelligence CLI. If the checkout contains only a branch tip or a shallow single commit, intentionally fail rather than generate an incomplete comparison. GitHub Actions does not run comparison on scheduled or main-push jobs; those still perform the source audit and both offline test suites.

The October 8 registry membership reconciliation and historical part4 reduction remain separate evidence gaps. No auto-merge, new cron, deployment, content generation or client outreach is performed.

## New or modified catalog-description quality (advisory)

The PR comparison now analyzes only added app entries and descriptions edited in the PR, not old unchanged catalog debt. It recommends owner review for descriptions shorter than 24 characters, known placeholder-only text, or copy identical to another current app after Unicode/whitespace/case normalization. It records counts and up to 15 public app IDs per finding; it **does not include description text** in CI output or claim a quality model, translation check, deployment check, or verified app behavior. Existing unchanged legacy short/duplicate descriptions are not repeatedly flagged. Each review finding is advisory; catalog-structure failures remain hard blockers.

A synthetic two-parent Git merge regression case also exercises the same first-parent semantics used by GitHub's pull-request merge checkout. This is offline contract evidence, not a claim of hosted Actions completion.
