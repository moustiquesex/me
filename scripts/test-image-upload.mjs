import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import './editor.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const origin='http://127.0.0.1:4174';
let uploaded='',fixture='';let passed=false;
try{
 const page=await (await fetch(origin)).text();const token=page.match(/name="editor-token" content="([^"]+)"/)[1];
 const send=(route,body,type='image/png',extra={})=>fetch(origin+route,{method:'POST',headers:{'X-Editor-Token':token,Origin:origin,'Content-Type':type,...extra},body});
 const png=await sharp({create:{width:640,height:400,channels:3,background:'#174a80'}}).png().toBuffer();
 assert.equal((await send('/api/image',png,'image/svg+xml')).status,400);
 assert.equal((await send('/api/image',png,'image/jpeg')).status,400);
 assert.equal((await send('/api/image',Buffer.from('<svg/>'))).status,400);
 assert.equal((await send('/api/image',Buffer.alloc(5*1024*1024+1))).status,400);
 assert.equal((await send('/api/image',png,'image/png',{Origin:'https://example.com'})).status,403);
 const result=await send('/api/image',png);assert.equal(result.status,200);uploaded=(await result.json()).image;assert.match(uploaded,/^\/media\/[a-f0-9-]{36}\.webp$/);
 const bytes=await fs.readFile(path.join(root,uploaded));const meta=await sharp(bytes).metadata();assert.equal(meta.format,'webp');assert(!meta.exif);
 const post={slug:'image-test-fixture',date:'2026-11-18',type:'note',discipline:'History',access:'none',published:false,image:uploaded,imageAlt:'Test bleu',imageOwnership:'third-party',tags:['Political Science','Taiwan'],fr:{title:'Test',summary:'Test'}};
 assert.equal((await send('/api/save',JSON.stringify(post),'application/json')).status,400);
 post.imageCredit='Titulaire';post.imageSource='https://example.com/source';
 assert.equal((await send('/api/save',JSON.stringify(post),'application/json')).status,200);fixture=path.join(root,'content/publications/image-test-fixture.json');
 const saved=JSON.parse(await fs.readFile(fixture,'utf8'));assert.deepEqual(saved.tags,post.tags);assert.equal(saved.image,uploaded);
 assert.equal((await fetch(origin+'/api/publish',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}'})).status,403);
 passed=true;console.log('PASS: MIME mismatch, SVG, invalid bytes, >5MiB and cross-origin rejected; valid upload re-encoded WebP with UUID; rights/credits required; image and tags saved; unauthenticated publishing blocked.');
}finally{
 if(uploaded)await fs.unlink(path.join(root,uploaded));if(fixture)await fs.unlink(fixture);
 process.exit(passed?0:1);
}
