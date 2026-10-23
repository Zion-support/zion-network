#!/usr/bin/env node
'use strict';

// Read-only catalog contract: local JSON only, no outbound calls or writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PARTS = Object.freeze(Array.from({ length: 5 }, (_, index) =>
  `network/apps-part${index + 1}.json`
));
const REVIEWED_FLOOR = 421; // Reviewed on 2026-10-08; reducing this needs source review.
const MAX_JSON_BYTES = 2_000_000;
const APP_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function readJson(root, relative) {
  const target = path.join(root, relative);
  const stat = fs.lstatSync(target);
  assert(stat.isFile(), `Registry input must be a regular file: ${relative}`);
  assert.equal(stat.mode & 0o111, 0, `Executable registry input is forbidden: ${relative}`);
  assert(stat.size <= MAX_JSON_BYTES, `Registry input exceeds size limit: ${relative}`);
  const data = fs.readFileSync(target, 'utf8');
  return JSON.parse(data);
}

function validateCatalog(root) {
  const manifest = readJson(root, 'network.json');
  assert(manifest && typeof manifest === 'object' && !Array.isArray(manifest),
    'network.json must contain an object');
  assert(!Object.hasOwn(manifest, 'apps'),
    'Inline apps are unsupported; list five explicit registry parts');
  assert(Array.isArray(manifest.apps_files) && manifest.apps_files.length === PARTS.length,
    'apps_files must list exactly five registry parts');
  assert.equal(new Set(manifest.apps_files).size, PARTS.length,
    'Duplicate registry part references');
  assert.deepEqual(manifest.apps_files, PARTS,
    'apps_files must name only the five canonical part files in order');
  assert(Number.isSafeInteger(manifest.apps_total) && manifest.apps_total > 0,
    'apps_total must be a positive integer');

  const baseline = readJson(root, 'catalog-integrity-baseline.json');
  assert(baseline && typeof baseline === 'object' && !Array.isArray(baseline),
    'Baseline must contain an object');
  assert(Number.isSafeInteger(baseline.minimum_catalog_records) &&
    baseline.minimum_catalog_records >= REVIEWED_FLOOR,
    'Baseline cannot be lower than the reviewed 421-record safety floor');
  assert(typeof baseline.source_commit === 'string' && /^[a-f0-9]{40}$/i.test(baseline.source_commit),
    'Baseline source_commit must be a full Git SHA');
  assert(typeof baseline.verified_at === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(baseline.verified_at),
    'Baseline verified_at must use YYYY-MM-DD');

  const ids = new Set();
  const categories = new Set();
  let count = 0;
  let shortDescriptions = 0;
  for (const part of manifest.apps_files) {
    const records = readJson(root, part);
    assert(Array.isArray(records) && records.length > 0,
      `Registry part must be a nonempty array: ${part}`);
    for (const app of records) {
      assert(app && typeof app === 'object' && !Array.isArray(app) &&
        typeof app.i === 'string' && APP_ID.test(app.i) && app.i.length <= 120,
      `Invalid app ID in ${part}`);
      assert(typeof app.d === 'string' && app.d.trim().length > 0 && app.d.length <= 1024,
        `Invalid or missing app description: ${app.i}`);
      if (app.c !== undefined) {
        assert(Number.isSafeInteger(app.c) && app.c >= 0,
          `Invalid category identifier: ${app.i}`);
        categories.add(app.c);
      }
      assert(!ids.has(app.i), `Duplicate app ID: ${app.i}`);
      ids.add(app.i);
      count++;
      if (app.d.trim().length < 24) shortDescriptions++;
    }
  }
  assert.equal(manifest.apps_total, count,
    'apps_total must equal the actual number of unique registry records');
  assert(count >= baseline.minimum_catalog_records,
    'Unexpected catalog truncation; baseline review required before reduction');

  return {
    status: 'pass',
    catalog_records: count,
    unique_ids: ids.size,
    parts: PARTS.length,
    baseline_minimum: baseline.minimum_catalog_records,
    quality_advisory: {
      short_descriptions_under_24_chars: shortDescriptions,
      distinct_category_codes: categories.size,
      category_code_range: categories.size
        ? [Math.min(...categories), Math.max(...categories)] : null,
    },
    live_functionality_verified: false,
    source_snapshot_equivalence_verified: false,
  };
}

if (require.main === module) {
  try {
    const result = validateCatalog(path.resolve(__dirname, '..'));
    console.log(JSON.stringify(result));
    if (process.env.GITHUB_STEP_SUMMARY) {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
        `## Zion catalog integrity\n\n` +
        `- Local registry: **PASS** (${result.catalog_records} unique records in ${result.parts} parts)\n` +
        `- Short descriptions (advisory, not a release gate): **${result.quality_advisory.short_descriptions_under_24_chars}**\n` +
        `- Actual app deployment/functionality: **NOT VERIFIED**\n` +
        `- Registry snapshot-to-live equivalence: **NOT VERIFIED**\n`);
    }
  } catch (error) {
    console.error(`Catalog integrity FAILED: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { validateCatalog, REVIEWED_FLOOR };
