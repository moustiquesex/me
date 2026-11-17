import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID, timingSafeEqual} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {PDFDocument} from 'pdf-lib';
import sanitizeHtml from 'sanitize-html';
const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'http://127.0.0.1:4174';
const token = randomUUID();
const maximum = 10 * 1024 * 1024;
let publishing = false;
const safeSlug = slug => typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 100;
const htmlOptions = {
  allowedTags:['p','br','h2','h3','h4','strong','em','u','s','ul','ol','li','blockquote','a','span','sub','sup','hr'],
  allowedAttributes:{a:['href','title'],p:['class'],span:['class'],h2:['class'],h3:['class'],h4:['class']},
  allowedClasses:{'*':['align-left','align-center','align-right','align-justify','text-small','text-normal','text-large']},
  allowedSchemes:['https','http','mailto'],allowProtocolRelative:false
};
async function body(req, limit) {
  const buffers = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('Taille maximale dépassée.');
    buffers.push(chunk);
  }
  return Buffer.concat(buffers);
}
async function atomicWrite(file, value) {
  const temporary = file + '.' + randomUUID() + '.tmp';
  await fs.writeFile(temporary, value, {flag:'wx'});
  await fs.rename(temporary, file);
}
function respond(res, status, value) {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8'});
  res.end(JSON.stringify(value));
}
const server = http.createServer(async (req,res) => {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  if (req.headers.host !== '127.0.0.1:4174') return respond(res,403,{error:'Hôte refusé.'});
  const url = new URL(req.url,origin);
  try {
    if (req.method === 'GET' && url.pathname === '/') {
      let html = await fs.readFile(path.join(root,'editor/index.html'),'utf8');
      html = html.replace('EDITOR_TOKEN',token);
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); return res.end(html);
    }
    if (req.method === 'GET' && ['/editor.js','/editor.css'].includes(url.pathname)) {
      const file = path.join(root,'editor',url.pathname.slice(1));
      res.writeHead(200,{'Content-Type':url.pathname.endsWith('.js')?'text/javascript; charset=utf-8':'text/css; charset=utf-8'});
      return res.end(await fs.readFile(file));
    }
    const supplied = Buffer.from(req.headers['x-editor-token'] || '');
    const expected = Buffer.from(token);
    if (supplied.length !== expected.length || !timingSafeEqual(supplied,expected)) return respond(res,403,{error:'Session refusée.'});
    if (req.method === 'POST' && req.headers.origin !== origin) return respond(res,403,{error:'Origine refusée.'});
    if (req.method === 'GET' && url.pathname === '/api/posts') {
      const names = await fs.readdir(path.join(root,'content/publications'));
      const posts = await Promise.all(names.filter(n=>n.endsWith('.json')).map(async name=>JSON.parse(await fs.readFile(path.join(root,'content/publications',name),'utf8'))));
      for (const post of posts) for (const language of ['fr','en']) if (post[language]?.bodyFormat === 'html') post[language].body = sanitizeHtml(post[language].body || '', htmlOptions);
      return respond(res,200,posts.sort((a,b)=>b.date.localeCompare(a.date)));
    }
    if (publishing && req.method === 'POST') return respond(res,409,{error:'Publication en cours. Réessayez après sa fin.'});
    if (req.method === 'POST' && url.pathname === '/api/upload') {
      if (req.headers['content-type'] !== 'application/pdf') return respond(res,415,{error:'Type MIME attendu : application/pdf.'});
      const bytes = await body(req,maximum);
      if (bytes.length < 10 || bytes.subarray(0,5).toString() !== '%PDF-') throw new Error('Le contenu reçu n’est pas un PDF.');
      const document = await PDFDocument.load(bytes, {ignoreEncryption:false});
      if (!document.getPageCount()) throw new Error('PDF sans page.');
      for (const [,object] of document.context.enumerateIndirectObjects()) {
        if (/\/(JavaScript|JS|Launch|EmbeddedFile|RichMedia|OpenAction|AA|XFA)\b/.test(object.toString())) throw new Error('Contenu PDF actif refusé.');
      }
      const name = randomUUID()+'.pdf';
      await fs.mkdir(path.join(root,'uploads'),{recursive:true});
      await fs.writeFile(path.join(root,'uploads',name),bytes,{flag:'wx'});
      return respond(res,200,{pdf:'/uploads/'+name});
    }
    if (req.method === 'POST' && url.pathname === '/api/save') {
      const input = JSON.parse((await body(req,1024*1024)).toString());
      if (!safeSlug(input.slug)) throw new Error('Identifiant invalide. Utilisez des lettres minuscules et des tirets.');
      const file = path.join(root,'content/publications',input.slug+'.json');
      let previous = {};
      try { previous = JSON.parse(await fs.readFile(file,'utf8')); } catch(error) { if(error.code !== 'ENOENT') throw error; }
      const post = {...previous};
      for (const key of ['slug','date','type','discipline','access','pdf','source','publisher']) post[key] = String(input[key] || '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date) || Number.isNaN(Date.parse(post.date))) throw new Error('Date invalide.');
      if (!['analysis','research','note'].includes(post.type) || !['none','request','public'].includes(post.access)) throw new Error('Format invalide.');
      if (post.source && new URL(post.source).protocol !== 'https:') throw new Error('Le lien original doit utiliser HTTPS.');
      if (post.access === 'public' && !/^\/uploads\/[a-f0-9-]{36}\.pdf$/.test(post.pdf)) throw new Error('Sélectionnez un PDF téléversé dans cet éditeur.');
      if (post.access !== 'public') post.pdf = '';
      post.published = Boolean(input.published);
      for (const language of ['fr','en']) {
        const content = input[language] || {};
        post[language] = {title:String(content.title||''),summary:String(content.summary||''),bodyFormat:'html',body:sanitizeHtml(content.body||'',htmlOptions)};
      }
      if (!['fr','en'].some(l=>post[l].title && post[l].summary)) throw new Error('Titre et résumé requis dans au moins une langue.');
      await atomicWrite(file,JSON.stringify(post,null,2)+'\n');
      return respond(res,200,{message:'Texte enregistré sur cet ordinateur.'});
    }
    if (req.method === 'POST' && url.pathname === '/api/publish') {
      publishing = true;
      try {
        await run('git',['add','--','content/publications','uploads'],{cwd:root});
        const {stdout} = await run('git',['diff','--cached','--name-only'],{cwd:root});
        if (stdout.trim()) await run('git',['commit','-m','Update publications from private editor'],{cwd:root});
        await run('git',['push','origin','main'],{cwd:root,timeout:120000});
        return respond(res,200,{message:'Envoi terminé. GitHub Actions vérifie les PDF et déploie le site. Consultez le suivi de publication.'});
      } finally { publishing = false; }
    }
    respond(res,404,{error:'Page introuvable.'});
  } catch(error) {
    respond(res,400,{error: String(error.message || 'Opération échouée.').slice(0,500)});
  }
});
server.listen(4174,'127.0.0.1',()=>console.log('Éditeur privé : '+origin));
