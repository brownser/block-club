import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const SCRIPT=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const ROOT='https://owner.github.io/block-club/';
function createMock({offline=false}={}) {
  const handlers={};const cacheMap=new Map();const events=[];
  const caches={
    open:async key=>{
      if(!cacheMap.has(key))cacheMap.set(key,new Map());
      const map=cacheMap.get(key);
      return {addAll:async files=>files.forEach(file=>map.set(file,{status:200,from:'precache',url:file})),
        put:async (req,resp)=>map.set(req.url||req,resp)};
    },
    keys:async()=>[...cacheMap.keys()],
    match:async req=>{for(const map of cacheMap.values()){const v=map.get(req.url||req);if(v)return v;}},
    delete:async key=>cacheMap.delete(key)
  };
  const globals={URL,caches,Response:{error:()=>({status:0})},self:{
    registration:{scope:ROOT},location:{origin:new URL(ROOT).origin},
    clients:{claim:async()=>{}},skipWaiting:async()=>{},
    addEventListener:(key,fn)=>{handlers[key]=fn;}
  },fetch:async req=>{if(offline)throw new Error('offline');return {status:200,from:'network',url:req.url||req};}};
  vm.runInNewContext(SCRIPT,globals,{filename:'sw.js'});
  function fire(kind,req){let pending;const e={request:req,
    waitUntil:p=>{pending=p},respondWith:p=>{pending=p}};
    handlers[kind](e);return pending;
  }
  return {fire,caches,cacheMap,setOffline:v=>{globals.fetch=async req=>{if(v)throw new Error('offline');return {status:200,from:'network',url:req.url||req};};}};
}
test('install precaches a full app shell relative to repo subdirectory',async()=>{
  const s=createMock();await s.fire('install');
  const names=await s.caches.keys();assert.equal(names.length,1);
  assert.ok(names[0].startsWith('blockclub:/block-club/:'),'cache namespace must contain app path');
  const shell=s.cacheMap.get(names[0]);
  for(const name of ['index.html','app.mjs','engine.mjs','styles.css','manifest.webmanifest','icon-512.png'])
    assert.ok(shell.has(ROOT+name),`missing offline file ${name}`);
});
test('activate removes previous versions only within own app namespace',async()=>{
  const s=createMock();await s.fire('install');
  s.cacheMap.set('blockclub:/block-club/:0.9.0',new Map());
  s.cacheMap.set('blockclub:/another-game/:0.9.0',new Map());
  await s.fire('activate');
  const keys=await s.caches.keys();
  assert.ok(!keys.includes('blockclub:/block-club/:0.9.0'));
  assert.ok(keys.includes('blockclub:/another-game/:0.9.0'));
});
test('offline navigation returns cached home page',async()=>{
  const s=createMock({offline:true});await s.fire('install');
  const result=await s.fire('fetch',{method:'GET',mode:'navigate',url:ROOT});
  assert.equal(result.from,'precache');
  assert.equal(result.url,ROOT+'index.html');
});
test('offline same-origin game JavaScript comes from cache',async()=>{
  const s=createMock({offline:true});await s.fire('install');
  const result=await s.fire('fetch',{method:'GET',mode:'same-origin',url:ROOT+'engine.mjs'});
  assert.equal(result.from,'precache');
});
test('unknown paths, other subdirectories, and non-GET requests are not intercepted',async()=>{
  const s=createMock();await s.fire('install');
  assert.equal(s.fire('fetch',{method:'POST',mode:'same-origin',url:ROOT+'engine.mjs'}),undefined);
  assert.equal(s.fire('fetch',{method:'GET',mode:'same-origin',url:ROOT+'api/private.json'}),undefined);
  assert.equal(s.fire('fetch',{method:'GET',mode:'same-origin',url:'https://owner.github.io/other-site/engine.mjs'}),undefined);
  assert.equal(s.fire('fetch',{method:'GET',mode:'same-origin',url:'https://elsewhere.example/engine.mjs'}),undefined);
});
