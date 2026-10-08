const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const source=fs.readFileSync(process.argv[2]||'registry-explorer.js','utf8');
async function run(initial,mode='ok'){
 let url=new URL(initial);const handlers={},elements={};
 class Element{constructor(tag){this.tag=tag;this.children=[];this.hidden=false;this.value='';this.events={};this.textContent='';}append(...x){this.children.push(...x);}replaceChildren(...x){this.children=x;}addEventListener(n,f){this.events[n]=f;}scrollIntoView(){}set href(v){this._href=new URL(v,url).href;}get href(){return this._href;}}
 const document={getElementById:id=>elements[id]||(elements[id]=new Element(id)),createElement:t=>new Element(t),createTextNode:t=>({textContent:t}),addEventListener:(n,f)=>handlers[n]=f};
 const records=[{i:'ticket-triage',d:'Support ticket triage'},{i:'ticket-audit',d:'Support ticket audit'},{i:'finance-watch',d:'Finance forecasting'}];
 const files=Array.from({length:5},(_,i)=>`network/apps-part${i+1}.json`);
 const location={get href(){return url.href;},get search(){return url.search;},get origin(){return url.origin;},get pathname(){return url.pathname;}};
 const history={pushState:(_a,_b,u)=>url=new URL(u,url),replaceState:(_a,_b,u)=>url=new URL(u,url)};
 const context={document,location,history,URL,URLSearchParams,AbortController,setTimeout,clearTimeout,window:{addEventListener:(n,f)=>handlers[n]=f},fetch:async u=>({ok:mode!=='offline',json:async()=>u.endsWith('network.json')?{apps_files:files,apps_total:3}:u.endsWith('part1.json')?(mode==='duplicate'?[...records,records[0]]:records):[]})};
 vm.runInNewContext(source,context);for(let i=0;i<8;i++)await new Promise(r=>setImmediate(r));
 return {elements,handlers,url:()=>url,go:u=>url=new URL(u,url)};
}
(async()=>{
 const c=await run('https://example.test/registry-explorer.html?q=ticket&app=ticket-triage');
 assert.equal(c.elements.search.value,'ticket');assert.match(c.elements.status.textContent,/2 matching entries of 3/);assert.equal(c.elements.detail.hidden,false);
 const titleLink=c.elements.results.children[0].children[0].children[0];assert.equal(new URL(titleLink.href).searchParams.get('q'),'ticket');
 const target=c.elements.detail.children.find(x=>x.tag==='ul').children[0].children[0];let prevented=false;c.handlers.click({target:{closest:()=>target},preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.equal(c.url().searchParams.get('q'),'ticket');assert.equal(c.url().searchParams.get('app'),'ticket-audit');
 c.elements.search.value='finance';c.elements.search.events.input();assert.equal(c.url().searchParams.get('q'),'finance');assert.equal(c.url().searchParams.has('app'),false);assert.equal(c.elements.detail.hidden,true);assert.match(c.elements.status.textContent,/1 matching/);
 c.go('https://example.test/registry-explorer.html?q=ticket&app=ticket-triage');c.handlers.popstate();assert.equal(c.elements.search.value,'ticket');assert.equal(c.elements.detail.hidden,false);assert.match(c.elements.status.textContent,/2 matching/);
 c.elements.search.value='';c.elements.search.events.input();assert.equal(c.url().searchParams.has('q'),false);assert.match(c.elements.status.textContent,/3 matching/);
 const bounded=await run('https://example.test/registry-explorer.html?q='+('x'.repeat(250)));assert.equal(bounded.elements.search.value.length,200);
 for(const mode of ['duplicate','offline']){const e=await run('https://example.test/registry-explorer.html',mode);assert.equal(e.elements.retry.hidden,false);assert.match(e.elements.status.textContent,/could not be verified or loaded/);assert.equal((e.elements.results?.children.length||0),0);}
 console.log('PASS: initial search, shared links, app navigation, search reset, Back/Forward, clear, bounded query, duplicate and offline fallback');
})().catch(e=>{console.error(e);process.exitCode=1;});
