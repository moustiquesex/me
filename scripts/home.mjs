import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function tagPills(post){return post.tags?.length?`<ul class="article-tags" aria-label="Tags" lang="en">${post.tags.map(tag=>`<li>${escape(tag)}</li>`).join('')}</ul>`:'';}
export function imageFigure(post,lang){
 if(!post.image)return '';
 const fr=lang==='fr',third=post.imageOwnership==='third-party';
 const credit=escape(post.imageCredit||'');
 return `<figure class="article-figure"><div class="image blue"><img src="${escape(post.image)}" alt="${escape(post.imageAlt)}" loading="lazy" width="800" height="500"></div><figcaption>${credit?(post.imageSource?`${fr?'Source':'Source'} : <a href="${escape(post.imageSource)}">${credit}</a>. `:credit+'. '):''}${third?(fr?'Image de tiers, non détenue par l’auteur de ce site. Droits réservés à son titulaire.':'Third-party image, not owned by this site’s author. Rights reserved by its owner.'):''}</figcaption></figure>`;
}
function introText(text){const i=text.indexOf('. ');return i<0?escape(text):escape(text.slice(0,i+1))+'<span class="intro-scope">'+escape(text.slice(i+2))+'</span>';}
export function homePage(language,site,posts,head,context){
 const fr=language==='fr';
 const cards=posts.map(post=>{
  const content=post[language],link=`/${language}/publications/${post.slug}/`;
  const date=new Intl.DateTimeFormat(fr?'fr-BE':'en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(post.date+'T12:00:00Z'));
  return `<article data-slug="${escape(post.slug)}">${imageFigure(post,language)}<div class="article-copy"><div class="meta"><time datetime="${post.date}">${date}</time>${post.publisher?' · '+escape(post.publisher):''}</div><h3><a href="${link}">${escape(content.title)}</a></h3><p>${escape(content.summary)}</p>${tagPills(post)}<div class="article-bottom"><a href="${link}">${fr?'Lire la publication':'Read publication'} ↗</a><button class="heart" aria-pressed="false" aria-label="${fr?'Apprécier cette publication':'Like this publication'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-9-5.5-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-9 12-9 12Z"/></svg><span>0</span></button></div></div></article>`;
 }).join('');
 const template=fs.readFileSync(path.join(root,'templates',`home-${language}.html`),'utf8');
 const body=template.replace('{{ARTICLES}}',cards).replace('{{INTRO}}',introText(site[language].intro)).replace('{{CONTEXT}}',`<p class="publication-context">${escape(context)}</p>`);
 const version=name=>createHash('sha256').update(fs.readFileSync(path.join(root,'assets',name))).digest('hex').slice(0,12);
 return head.split('<body>')[0].replace('/assets/site.css','/assets/home.css?v='+version('home.css')).replace('/assets/site.js','/assets/home.js?v='+version('home.js'))+'<body>'+body+'</body></html>';
}
