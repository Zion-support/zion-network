#!/usr/bin/env node
'use strict';
// Inspect the checked-out Git commit against its first parent (PR merge base).
// Read-only: no network access, no repository write, no secrets, no runtime claims.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const PARTS = Array.from({ length: 5 }, (_, i) => `network/apps-part${i + 1}.json`);
const ALLOWED_FILES = ['network.json', ...PARTS, 'catalog-integrity-baseline.json'];
const MAX_BYTES = 2_000_000;
const APP_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8', maxBuffer: MAX_BYTES + 200_000, stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}
function json(value, location) {
  assert(Buffer.byteLength(value, 'utf8') <= MAX_BYTES, `Oversized registry input: ${location}`);
  try { return JSON.parse(value); }
  catch { throw new Error(`Invalid JSON in ${location}`); }
}
function workingRead(root, relative) {
  assert(ALLOWED_FILES.includes(relative), 'Unapproved registry path');
  const filename = path.join(root, relative);
  const stat = fs.lstatSync(filename);
  assert(stat.isFile(), `Invalid local file type: ${relative}`);
  assert(stat.size <= MAX_BYTES, `Oversized local file: ${relative}`);
  return json(fs.readFileSync(filename, 'utf8'), relative);
}
function snapshot(read) {
  const manifest = read('network.json');
  assert(manifest && typeof manifest === 'object' && !Array.isArray(manifest), 'Invalid registry manifest');
  assert.deepEqual(manifest.apps_files, PARTS, 'Registry part manifest drift');
  const ids = new Map();
  for (const part of PARTS) {
    const records = read(part);
    assert(Array.isArray(records) && records.length > 0, `Invalid registry part: ${part}`);
    for (const app of records) {
      assert(app && typeof app === 'object' && !Array.isArray(app) &&
        typeof app.i === 'string' && app.i.length <= 120 && APP_ID.test(app.i), 'Invalid app ID');
      assert(typeof app.d === 'string' && app.d.trim() && app.d.length <= 1024,
        `Invalid app description: ${app.i}`);
      assert(app.c === undefined || (Number.isSafeInteger(app.c) && app.c >= 0),
        `Invalid app category: ${app.i}`);
      assert(!ids.has(app.i), `Duplicate app ID: ${app.i}`);
      ids.set(app.i, { description: app.d, category: app.c ?? null });
    }
  }
  assert.equal(manifest.apps_total, ids.size, 'Declared registry total mismatch');
  const baseline = read('catalog-integrity-baseline.json');
  assert(baseline && Number.isSafeInteger(baseline.minimum_catalog_records) &&
    baseline.minimum_catalog_records > 0, 'Invalid baseline minimum');
  return { ids, baseline };
}
function analyze(root, expectedBase = '') {
  const head = git(root, 'rev-parse', '--verify', 'HEAD^{commit}');
  let base;
  try { base = git(root, 'rev-parse', '--verify', 'HEAD^1'); }
  catch { throw new Error('Git first-parent evidence unavailable; cannot compare catalogs'); }
  if (expectedBase) {
    assert(/^[a-f0-9]{40}$/i.test(expectedBase), 'Invalid BASE_SHA');
    assert.equal(base.toLowerCase(), expectedBase.toLowerCase(),
      'PR base SHA does not match the checked-out first parent');
  }
  const previous = snapshot(file => json(git(root, 'show', `${base}:${file}`), `base:${file}`));
  const current = snapshot(file => workingRead(root, file));
  const before = previous.ids, after = current.ids;
  const added = [...after.keys()].filter(id => !before.has(id)).sort();
  const removed = [...before.keys()].filter(id => !after.has(id)).sort();
  const shared = [...after.keys()].filter(id => before.has(id));
  const descriptionEdited = shared.filter(id => before.get(id).description !== after.get(id).description).sort();
  const categoryEdited = shared.filter(id => before.get(id).category !== after.get(id).category).sort();
  const baselineEdited = JSON.stringify(previous.baseline) !== JSON.stringify(current.baseline);
  // Only inspect newly introduced/edited descriptions. Existing legacy copy debt
  // stays visible in the core catalog report but must not create repeat noise.
  const candidateIds = [...new Set([...added, ...descriptionEdited])].sort();
  const normalizeDescription = value => value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
  const ownersByDescription = new Map();
  for (const [id, entry] of after) {
    const normalized = normalizeDescription(entry.description);
    const owners = ownersByDescription.get(normalized) || [];
    owners.push(id);
    ownersByDescription.set(normalized, owners);
  }
  const newShortDescriptions = [];
  const newPlaceholderDescriptions = [];
  const newDuplicateDescriptions = [];
  const PLACEHOLDER = /^(?:zion app network app|tbd|to be determined|lorem ipsum(?: dolor sit amet)?|placeholder(?: description| text)?)\.?$/i;
  for (const id of candidateIds) {
    const description = after.get(id).description;
    const normalized = normalizeDescription(description);
    if (description.trim().length < 24) newShortDescriptions.push(id);
    if (PLACEHOLDER.test(normalized)) newPlaceholderDescriptions.push(id);
    if (ownersByDescription.get(normalized).length > 1) newDuplicateDescriptions.push(id);
  }
  const changedIds = new Set([...added, ...removed, ...descriptionEdited, ...categoryEdited]);
  // A ten-percent mutation may indicate generated catalog churn even when the record count is unchanged.
  const broadChurn = changedIds.size >= Math.max(20, Math.ceil(before.size * 0.10));
  const reviewReasons = [
    ...(removed.length ? ['removed-app-ids'] : []),
    ...(baselineEdited ? ['catalog-baseline-edited'] : []),
    ...(broadChurn ? ['broad-catalog-churn'] : []),
    ...(newShortDescriptions.length ? ['new-or-edited-short-description'] : []),
    ...(newPlaceholderDescriptions.length ? ['new-or-edited-placeholder-description'] : []),
    ...(newDuplicateDescriptions.length ? ['new-or-edited-duplicate-description'] : []),
  ];
  const sample = arr => arr.slice(0, 15); // bounded public IDs only; never print descriptions.
  return {
    comparison: 'checked-out-first-parent-vs-worktree',
    head_sha: head, base_sha: base,
    previous_count: before.size, current_count: after.size,
    added_count: added.length, removed_count: removed.length,
    descriptions_edited_count: descriptionEdited.length,
    categories_edited_count: categoryEdited.length,
    unique_ids_touched: changedIds.size,
    sample_added_ids: sample(added), sample_removed_ids: sample(removed),
    sample_description_edited_ids: sample(descriptionEdited),
    sample_category_edited_ids: sample(categoryEdited),
    description_quality: {
      candidate_count: candidateIds.length,
      short_count: newShortDescriptions.length,
      placeholder_count: newPlaceholderDescriptions.length,
      duplicate_count: newDuplicateDescriptions.length,
      sample_short_ids: sample(newShortDescriptions),
      sample_placeholder_ids: sample(newPlaceholderDescriptions),
      sample_duplicate_ids: sample(newDuplicateDescriptions),
    },
    review_required: reviewReasons.length > 0,
    review_reasons: reviewReasons,
    ci_policy: 'advisory-change-risk; core catalog integrity remains a separate fail-closed gate',
    deployment_or_live_functionality_verified: false,
  };
}

if (require.main === module) {
  try {
    const report = analyze(path.resolve(__dirname, '..'), process.env.BASE_SHA || '');
    console.log(JSON.stringify(report, null, 2));
    if (process.env.GITHUB_STEP_SUMMARY) {
      const lines = [
        '## Zion catalog change intelligence', '',
        `- Source comparison: \`${report.base_sha}\` to \`${report.head_sha}\``,
        `- Records: **${report.previous_count} → ${report.current_count}**`,
        `- Added: **${report.added_count}**; removed: **${report.removed_count}**`,
        `- Description changes: **${report.descriptions_edited_count}**; category changes: **${report.categories_edited_count}**`,
        `- New/edited copy quality advisories: **${report.description_quality.short_count} short**, **${report.description_quality.placeholder_count} placeholder**, **${report.description_quality.duplicate_count} duplicated**`,
        `- Owner review advised: **${report.review_required ? 'YES' : 'NO'}** (${report.review_reasons.join(', ') || 'no flagged changes'})`,
        '- Live app functionality and deployed source equivalence: **NOT VERIFIED**',
        '- Diff is advisory; green CI does not authorize publication or catalog membership changes.', '',
      ];
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n'));
    }
    if (report.review_required)
      console.log('::warning title=Catalog owner review required::Catalog removals, provenance/churn, or new description quality regressions found.');
  } catch (error) {
    console.error(`Catalog change comparison FAILED: ${error.message}`);
    process.exitCode = 1;
  }
}
module.exports = { analyze };
