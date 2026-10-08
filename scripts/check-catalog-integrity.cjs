'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'network.json'),'utf8'));
assert(Array.isArray(manifest.apps_files)&&manifest.apps_files.length>0,'apps_files must explicitly list registry parts');
assert.equal(new Set(manifest.apps_files).size,manifest.apps_files.length,'Duplicate part references');
assert(!manifest.apps||manifest.apps.every(x=>typeof x==='object'&&x!==null),'Literal placeholder apps are forbidden');
const ids=new Set();let count=0;
for(const part of manifest.apps_files){
 assert(/^network\/[a-zA-Z0-9._-]+\.json$/.test(part),'Unsafe registry path: '+part);
 const apps=JSON.parse(fs.readFileSync(path.join(root,part),'utf8'));
 assert(Array.isArray(apps)&&apps.length>0,'Part must be a nonempty array: '+part);
 for(const app of apps){
  assert(app&&typeof app==='object'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(app.i),'Invalid app id in '+part);
  assert(typeof app.d==='string'&&app.d.trim(),'Missing app description: '+app.i);
  assert(!ids.has(app.i),'Duplicate app id: '+app.i);ids.add(app.i);count++;
 }
}
assert.equal(manifest.apps_total,count,'apps_total must equal unique records across all part files');
// A deliberate reduction needs a reviewed baseline update with provenance, not a silent overwrite.
const baseline=JSON.parse(fs.readFileSync(path.join(root,'catalog-integrity-baseline.json'),'utf8'));
assert(count>=baseline.minimum_catalog_records,'Unexpected catalog truncation; document intentional removal before changing the baseline');
console.log(JSON.stringify({catalog_records:count,unique_ids:ids.size,parts:manifest.apps_files.length,live_functionality_verified:false}));
