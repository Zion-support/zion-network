'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { analyze } = require('./catalog-change-intelligence.cjs');
const PARTS = Array.from({ length: 5 }, (_, i) => `network/apps-part${i + 1}.json`);
function git(root, ...args) { return execFileSync('git', ['-C', root, ...args], {encoding:'utf8'}).trim(); }
function write(root, relative, data) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), {recursive:true});
  fs.writeFileSync(file, JSON.stringify(data));
}
function fixture(mutator = ()=>{}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zion-registry-diff-'));
  git(root, 'init', '-q');
  git(root, 'config', 'user.name', 'Zion Test');
  git(root, 'config', 'user.email', 'ci-test@example.invalid');
  const manifest = {apps_files:PARTS,apps_total:25};
  const baseline = {minimum_catalog_records:25,source_commit:'a'.repeat(40),verified_at:'2026-10-08'};
  const rows = PARTS.map((_,i)=>Array.from({length:5},(_,j)=>({i:`app-${i+1}-${j+1}`,d:`Description for app ${i+1}-${j+1}`,c:i})));
  write(root,'network.json',manifest);write(root,'catalog-integrity-baseline.json',baseline);
  PARTS.forEach((p,i)=>write(root,p,rows[i]));
  git(root,'add','.');git(root,'commit','-qm','base');
  const base = git(root,'rev-parse','HEAD');
  mutator({manifest,baseline,rows,root});
  write(root,'network.json',manifest);write(root,'catalog-integrity-baseline.json',baseline);
  PARTS.forEach((p,i)=>write(root,p,rows[i]));
  fs.writeFileSync(path.join(root,'stamp.txt'), 'next commit');
  git(root,'add','.');git(root,'commit','-qm','changed');
  return {root,base};
}
function run(mutator, expectedBase, check) {
  const f=fixture(mutator);
  try{return check(f.root,expectedBase?f.base:'');}
  finally {fs.rmSync(f.root,{recursive:true,force:true});}
}
test('clean no-op source comparison',()=>run(()=>{},true,(root,base)=>{const r=analyze(root,base);assert.equal(r.previous_count,25);assert.equal(r.added_count,0);assert.equal(r.removed_count,0);assert.equal(r.review_required,false);assert.equal(r.deployment_or_live_functionality_verified,false);}));
test('single new app is informational',()=>run(m=>{m.rows[0].push({i:'app-new',d:'A valid new app entry',c:1});m.manifest.apps_total++;},true,(root,base)=>{const r=analyze(root,base);assert.deepEqual(r.sample_added_ids,['app-new']);assert.equal(r.review_required,false);}));
test('balanced addition and deletion still needs review',()=>run(m=>{m.rows[0].shift();m.rows[0].push({i:'replacement-app',d:'Valid replacement app'});},true,(root,base)=>{const r=analyze(root,base);assert.equal(r.previous_count,r.current_count);assert.equal(r.removed_count,1);assert.deepEqual(r.review_reasons,['removed-app-ids']);}));
test('description change is counted without leaking body',()=>run(m=>{m.rows[1][0].d='Better description';},true,(root,base)=>{const r=analyze(root,base);assert.equal(r.descriptions_edited_count,1);assert.equal(r.categories_edited_count,0);assert.equal(r.sample_description_edited_ids[0],'app-2-1');}));
test('category change is counted independently',()=>run(m=>{m.rows[1][0].c=120;},true,(root,base)=>{const r=analyze(root,base);assert.equal(r.categories_edited_count,1);assert.equal(r.review_required,false);}));
test('baseline source provenance edit requires owner review',()=>run(m=>{m.baseline.source_commit='b'.repeat(40);},true,(root,base)=>{const r=analyze(root,base);assert.deepEqual(r.review_reasons,['catalog-baseline-edited']);}));
test('broad churn requires owner review',()=>run(m=>{m.rows[0].forEach((r,i)=>r.d+=' updated '+i);m.rows[1].forEach((r,i)=>r.d+=' updated '+i);m.rows[2].forEach((r,i)=>r.d+=' updated '+i);m.rows[3].forEach((r,i)=>r.d+=' updated '+i);},true,(root,base)=>{const r=analyze(root,base);assert.equal(r.unique_ids_touched,20);assert(r.review_reasons.includes('broad-catalog-churn'));}));
test('incorrect event-provided base SHA fails closed',()=>run(()=>{},false,(root)=>assert.throws(()=>analyze(root,'c'.repeat(40)),/PR base SHA/)));
test('invalid base SHA format fails closed',()=>run(()=>{},false,(root)=>assert.throws(()=>analyze(root,'not-a-sha'),/Invalid BASE_SHA/)));
test('invalid current manifest fails closed',()=>run(m=>{m.manifest.apps_files=['network/apps-part1.json'];},true,(root,base)=>assert.throws(()=>analyze(root,base),/manifest drift/)));
test('missing IDs in one part fails closed even with declared count',()=>run(m=>{m.rows[0][0].i=m.rows[0][1].i;},true,(root,base)=>assert.throws(()=>analyze(root,base),/Duplicate app ID/)));
test('only first 15 example IDs are reported',()=>run(m=>{for(let i=0;i<18;i++)m.rows[0].push({i:`new-app-${i+1}`,d:'A valid new app'});m.manifest.apps_total+=18;},true,(root,base)=>{const r=analyze(root,base);assert.equal(r.added_count,18);assert.equal(r.sample_added_ids.length,15);}));
test('missing git parent fails closed',()=>{const f=fixture();try{git(f.root,'checkout','-q',f.base);assert.throws(()=>analyze(f.root),/first-parent evidence unavailable/);}finally{fs.rmSync(f.root,{recursive:true,force:true});}});
test('source report does not contain app descriptions',()=>run(m=>{m.rows[0][0].d='Sensitive placeholder not for output';},true,(root,base)=>{assert(!JSON.stringify(analyze(root,base)).includes('Sensitive placeholder'));}));
