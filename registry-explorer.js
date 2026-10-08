'use strict';
(() => {
 const SHA='0416c7057cea0ff26a5412a0e813224705de32da';
 const BASE='https://raw.githubusercontent.com/Zion-support/zion-network/'+SHA+'/';
 const $=id=>document.getElementById(id);
 const valid=id=>typeof id==='string'&&/^[a-z0-9][a-z0-9-]*$/.test(id);
 // Keep bounded search state in shareable links; never place report answers here.
 const searchQuery=()=>new URLSearchParams(location.search).get('q')?.slice(0,200)||'';
 function appUrl(id){const u=new URL(location.href);const q=$('search').value.trim().slice(0,200);if(q)u.searchParams.set('q',q);else u.searchParams.delete('q');u.searchParams.set('app',id);u.hash='detail';return u.pathname+u.search+u.hash;}
 const stop=new Set('zion tech group ai app apps network batch the and for with from into this that tool tools services'.split(' '));
 const words=a=>new Set((a.i+' '+a.d).toLowerCase().match(/[a-z]{3,}/g)?.filter(w=>!stop.has(w))||[]);
 let apps=[],filtered=[],limit=24,busy=false;
 const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 function link(text,url){const a=node('a',text);a.href=url;return a;}
 function detail(id){
  const a=apps.find(x=>x.i===id);const d=$('detail');d.replaceChildren();d.hidden=!a;if(!a)return;
  d.append(node('h2',a.i.replace(/-/g,' ')),node('p',a.d),node('p','Registry entry; app-route availability and production readiness not verified.'));
  const p=node('p');p.append(link('Source repository','https://github.com/Zion-support/'+a.i),document.createTextNode(' · '),link('Try suggested app route','https://ziontechgroup.com/'+a.i+'/'));d.append(p);
  d.append(node('h3','Related registered tools'));
  const w=words(a);
  const related=apps.filter(x=>x.i!==a.i).map(x=>({a:x,score:[...words(x)].filter(v=>w.has(v)).length})).filter(x=>x.score>0).sort((x,y)=>y.score-x.score||x.a.i.localeCompare(y.a.i)).slice(0,6);
  d.append(node('p','Suggestions use shared words in registry descriptions, not a compatibility assessment. Validate each tool before combining them.'));
  const list=node('ul');for(const x of related){const li=node('li');li.append(link(x.a.i,appUrl(x.a.i)));list.append(li);}d.append(list);
  if(!related.length)d.append(node('p','No description-based match. Use the search field or network hub.'));
  d.append(link('Start free Discovery','https://ziontechgroup.com/discovery/'));
 }
 function render(){
  const q=$('search').value.trim().toLowerCase();filtered=apps.filter(a=>(a.i+' '+a.d).toLowerCase().includes(q));
  $('results').replaceChildren();for(const a of filtered.slice(0,limit)){
   const card=node('article');card.className='card';const h=node('h2');h.append(link(a.i.replace(/-/g,' '),appUrl(a.i)));card.append(h,node('p',a.d));
   const state=node('p','Registered · availability not verified');state.className='muted';card.append(state);
   const p=node('p');p.append(link('Source','https://github.com/Zion-support/'+a.i),document.createTextNode(' · '),link('Related tools',appUrl(a.i)));card.append(p);$('results').append(card);
  }
  $('status').textContent=filtered.length+' matching entries of '+apps.length+' audited IDs. Showing '+Math.min(limit,filtered.length)+'.';
  $('more').hidden=limit>=filtered.length;
  if(!filtered.length)$('results').append(node('p','No match. Try a broader process or keyword.'));
 }
 async function read(path){
  const c=new AbortController();const timer=setTimeout(()=>c.abort(),15000);
  try{const r=await fetch(BASE+path,{signal:c.signal});if(!r.ok)throw new Error('Registry file unavailable');return await r.json();}finally{clearTimeout(timer);}
 }
 async function load(){
  if(busy)return;busy=true;$('retry').hidden=true;$('status').textContent='Loading immutable audited registry…';
  try{
   const m=await read('network.json');if(!Array.isArray(m.apps_files)||m.apps_files.length!==5||!m.apps_files.every(p=>/^network\/apps-part[1-5]\.json$/.test(p))||new Set(m.apps_files).size!==5)throw new Error('Invalid manifest');
   const parts=await Promise.all(m.apps_files.map(read));if(!parts.every(Array.isArray))throw new Error('Invalid registry');
   const records=parts.flat();if(records.some(a=>!a||!valid(a.i)||typeof a.d!=='string'))throw new Error('Invalid app ID');
   const unique=new Map(records.map(a=>[a.i,{i:a.i,d:a.d}]));if(unique.size!==records.length||unique.size!==m.apps_total)throw new Error('Count or duplicate mismatch');
   apps=[...unique.values()].sort((a,b)=>a.i.localeCompare(b.i));$('search').value=searchQuery();render();detail(new URLSearchParams(location.search).get('app'));
  }catch(e){$('status').textContent='The registry could not be verified or loaded. No partial or inflated app count is shown. Use the source index or Free Discovery links above, or retry.';$('retry').hidden=false;}
  finally{busy=false;}
 }
 $('search').addEventListener('input',()=>{limit=24;const u=new URL(location.href);const q=$('search').value.trim().slice(0,200);if(q)u.searchParams.set('q',q);else u.searchParams.delete('q');u.searchParams.delete('app');u.hash='';history.replaceState({},'',u);detail(null);render();});$('more').addEventListener('click',()=>{limit+=24;render();});$('retry').addEventListener('click',load);
 document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const u=new URL(a.href);if(u.origin!==location.origin||u.pathname!==location.pathname||!u.searchParams.has('app'))return;e.preventDefault();history.pushState({},'',u);$('search').value=searchQuery();render();detail(u.searchParams.get('app'));$('detail').scrollIntoView({behavior:'smooth'});});
 window.addEventListener('popstate',()=>{$('search').value=searchQuery();limit=24;render();detail(new URLSearchParams(location.search).get('app'));});load();
})();
