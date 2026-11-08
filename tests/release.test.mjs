import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=new URL('../site/',import.meta.url);
const root=fileURLToPath(dir);
const html=readFileSync(join(root,'index.html'),'utf8');
const manifest=JSON.parse(readFileSync(join(root,'manifest.webmanifest'),'utf8'));
const expected=['index.html','app.mjs','engine.mjs','styles.css','manifest.webmanifest',
  'sw.js','icon.svg','icon-192.png','icon-512.png','apple-icon.png','.nojekyll'];
test('only approved files reach the public artifact',()=>{
  assert.deepEqual(readdirSync(root).sort(),expected.sort());
  assert.ok(!existsSync(join(root,'play.html')));
  assert.ok(!existsSync(join(root,'tests')));
});
test('hosted HTML has strict script CSP, no third-party resources, and no inline scripts',()=>{
  assert.match(html,/<meta http-equiv="Content-Security-Policy"/);
  assert.match(html,/script-src 'self'/);
  assert.match(html,/object-src 'none'/);
  assert.doesNotMatch(html,/<script[^>]*>(?!\s*<\/script>)/);
  assert.match(html,/<script type="module" src="\.\/app\.mjs"><\/script>/);
  assert.doesNotMatch(html,/https?:\/\//i);
});
test('PWA metadata is path-relative and has compatible PNG icons',()=>{
  assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
  assert.equal(manifest.display,'standalone');
  for(const size of ['192x192','512x512']){
    const icon=manifest.icons.find(i=>i.sizes===size && i.type==='image/png');
    assert.ok(icon,`missing ${size} PNG icon`);
    assert.ok(existsSync(join(root,icon.src.replace('./',''))));
  }
});
