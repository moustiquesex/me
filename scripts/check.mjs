import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const dist=path.join(root,'dist');
const files=fs.readdirSync(dist,{recursive:true}).filter(f=>String(f).endsWith('.html'));
assert(files.length>=12,'Missing bilingual pages');
let links=0;
for(const f of files){const html=fs.readFileSync(path.join(dist,f),'utf8');assert.equal((html.match(/<h1\b/g)||[]).length,1,`Heading: ${f}`);assert.match(html,/<html lang="(fr|en)">/);assert.match(html,/<link rel="canonical" href="https:\/\/bouhiere.eu\//);assert(!/camille-bouhiere|VOTRE_|VOTRE-|0000-0000/.test(html),`Old placeholder: ${f}`);
 for(const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){const p=match[1];let target=path.join(dist,p);if(p.endsWith('/'))target=path.join(target,'index.html');assert(fs.existsSync(target),`Broken link ${p} in ${f}`);links++;}
 for(const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))JSON.parse(match[1]);
 if(String(f).includes('admin'))assert.match(html,/noindex, follow/);
}
const config=JSON.parse(fs.readFileSync(path.join(root,'.pages.yml'),'utf8'));assert.equal(config.content[1].format,'json');
for(const field of config.content[1].fields.filter(f=>f.type==='select'))assert(field.options.values.every(v=>typeof v === 'string' || (v.name && v.label)),'Select option schema');
console.log(`PASS: ${files.length} HTML pages; ${links} local links/assets; headings, language, canonical metadata, JSON-LD and CMS config.`);
