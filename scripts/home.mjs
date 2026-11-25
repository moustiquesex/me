import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function tagPills(post){return post.tags?.length?`<ul class="article-tags" aria-label="Tags" lang="en">${post.tags.map(tag=>`<li>${escape(tag)}</li>`).join('')}</ul>`:'';}
export function imageFigure(post,lang){
 const localized = post[lang];
 if(localized?.image) post = {...post, image:localized.image, imageAlt:localized.imageAlt};
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
 });
 const mapUrl=fr?'/observatory/':'/observatory/?lang=en';
 const mapTitle=fr?'Observatoire du détroit de Taïwan':'Taiwan Strait Observatory';
 cards.splice(1,0,`<article><figure class="article-figure"><div class="image blue"><img src="/assets/taiwan-observatory.webp" alt="" loading="lazy" width="1000" height="563"></div></figure><div class="article-copy"><div class="meta">${fr?'Projet en cours':'Work in progress'}</div><h3><a href="${mapUrl}">${mapTitle}</a></h3><p>${fr?'Explorez sur la carte les relevés historiques d’activité aérienne autour de Taïwan en août 2022.':'Explore historical records of air activity around Taiwan in August 2022 on the interactive map.'}</p><div class="article-bottom"><a href="${mapUrl}">${fr?'Explorer la carte':'Explore the map'} →</a></div></div></article>`);
 const template=fs.readFileSync(path.join(root,'templates',`home-${language}.html`),'utf8');
 let body=template.replace('{{ARTICLES}}',cards.join('')).replace('{{INTRO}}',introText(site[language].intro)).replace('{{CONTEXT}}',`<p class="publication-context">${escape(context)}</p>`);
 const version=name=>createHash('sha256').update(fs.readFileSync(path.join(root,'assets',name))).digest('hex').slice(0,12);
 let pageHead=head.split('<body>')[0].replace('/assets/site.css?v=20261119d','/assets/home.css?v='+version('home.css')).replace('/assets/site.js','/assets/home.js?v='+version('home.js'));
 if(site.reactionsApi){
  const endpoint=new URL(site.reactionsApi);
  if(endpoint.protocol!=='https:'||endpoint.username||endpoint.password||endpoint.search||endpoint.hash||endpoint.pathname!=='/v1/reactions')throw Error('Invalid reactions API URL');
  body=body.replace('id="publication-track"',`id="publication-track" data-reactions-api="${escape(endpoint.href)}"`);
  pageHead=pageHead.replace("frame-src 'self';",`connect-src 'self' ${endpoint.origin}; frame-src 'self';`).replace('</head>',`<script src="/assets/reactions.js?v=${version('reactions.js')}" defer></script></head>`);
 }
 return pageHead+'<body>'+body+'</body></html>';
}
