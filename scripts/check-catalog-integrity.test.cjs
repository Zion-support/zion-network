'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {validateCatalog}=require('./check-catalog-integrity.cjs');
function fixture(mutate=()=>{}){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'zion-catalog-'));
 fs.mkdirSync(path.join(root,'network'));
 const paths=Array.from({length:5},(_,i)=>`network/apps-part${i+1}.json`);
 const manifest={apps_files:paths,apps_total:5};
 const baseline={minimum_catalog_records:5,source_commit:'a'.repeat(40),verified_at:'2026-10-08'};
 const rows=paths.map((_,i)=>[{i:`safe-app-${i+1}`,d:'An example application description long enough',c:i}]);
 const model={manifest,baseline,rows};mutate(model,root);
 fs.writeFileSync(path.join(root,'network.json'),JSON.stringify(manifest));
 fs.writeFileSync(path.join(root,'catalog-integrity-baseline.json'),JSON.stringify(baseline));
 paths.forEach((p,i)=>{if(!fs.existsSync(path.join(root,p)))fs.writeFileSync(path.join(root,p),JSON.stringify(rows[i]));});
 return root;
}
function check(mutator,regex){const root=fixture(mutator);try{assert.throws(()=>validateCatalog(root),regex);}finally{fs.rmSync(root,{recursive:true,force:true});}}
test('valid catalog produces accurate bounded evidence',()=>{const root=fixture();try{const result=validateCatalog(root);assert.equal(result.catalog_records,5);assert.equal(result.unique_ids,5);assert.equal(result.live_functionality_verified,false);}finally{fs.rmSync(root,{recursive:true,force:true});}});
test('rejects duplicate part name',()=>check(m=>{m.manifest.apps_files[1]=m.manifest.apps_files[0]},/Duplicate registry part/));
test('rejects traversal in part name',()=>check(m=>{m.manifest.apps_files[0]='../secrets.json'},/canonical/));
test('rejects invalid total',()=>check(m=>{m.manifest.apps_total=3},/equal the actual/));
test('rejects reduced baseline',()=>check(m=>{m.baseline.minimum_catalog_records=6},/truncation/));
test('rejects duplicate app ID',()=>check(m=>{m.rows[1][0].i=m.rows[0][0].i},/Duplicate app ID/));
test('rejects missing description',()=>check(m=>{m.rows[2][0].d=' '},/description/));
test('rejects invalid app ID',()=>check(m=>{m.rows[2][0].i='../bad'},/Invalid app ID/));
test('rejects negative category',()=>check(m=>{m.rows[2][0].c=-1},/category/));
test('rejects non-integer category',()=>check(m=>{m.rows[2][0].c=3.5},/category/));
test('rejects invalid baseline provenance',()=>check(m=>{m.baseline.source_commit='short'},/source_commit/));
test('rejects inline registry',()=>check(m=>{m.manifest.apps=[]},/Inline apps/));
test('rejects oversized descriptions',()=>check(m=>{m.rows[4][0].d='x'.repeat(1025)},/description/));
test('rejects invalid part-array',()=>check(m=>{m.rows[1]=[]},/nonempty/));
test('rejects non-object app rows',()=>check(m=>{m.rows[1]=['bad']},/Invalid app ID/));
test('rejects symlinked registry input',()=>{const root=fixture();try{const p=path.join(root,'network/apps-part1.json');fs.rmSync(p);fs.symlinkSync('apps-part2.json',p);assert.throws(()=>validateCatalog(root),/regular file/);}finally{fs.rmSync(root,{recursive:true,force:true});}});
