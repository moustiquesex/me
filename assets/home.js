const english=document.documentElement.lang==='en';
const track=document.getElementById('publication-track'),shell=track.closest('.carousel-shell'),previous=shell.querySelector('.previous'),next=shell.querySelector('.next');
const originals=[...track.children],count=originals.length,loop=count>3;
shell.classList.toggle('has-carousel',loop);
if(loop){const copy=article=>{const node=article.cloneNode(true);node.setAttribute('aria-hidden','true');node.querySelectorAll('a,button').forEach(el=>el.tabIndex=-1);return node;};for(const article of originals)track.append(copy(article));for(const article of originals.toReversed())track.prepend(copy(article));}
const likes=new Set();
track.addEventListener('click',e=>{if(track.dataset.reactionsApi)return;const button=e.target.closest('.heart');if(!button)return;const slug=button.closest('article').dataset.slug;likes.has(slug)?likes.delete(slug):likes.add(slug);for(const card of track.children){if(card.dataset.slug!==slug)continue;const b=card.querySelector('.heart');b.setAttribute('aria-pressed',String(likes.has(slug)));b.querySelector('span').textContent=likes.has(slug)?'1':'0';}document.getElementById('status').textContent=english?(likes.has(slug)?'Like added.':'Like removed.'):(likes.has(slug)?'Appréciation ajoutée.':'Appréciation retirée.');});
function step(){return track.children[1].offsetLeft-track.children[0].offsetLeft;}
function jump(left){track.classList.add('repositioning');track.scrollLeft=left;requestAnimationFrame(()=>track.classList.remove('repositioning'));}
function normalize(){if(!loop)return;const cycle=step()*count;if(track.scrollLeft<cycle-2)jump(track.scrollLeft+cycle);else if(track.scrollLeft>=cycle*2-2)jump(track.scrollLeft-cycle);}
function move(direction){if(!loop)return;normalize();track.scrollBy({left:direction*step(),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
let timer;track.addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(normalize,160);},{passive:true});track.addEventListener('scrollend',normalize);
window.addEventListener('resize',()=>{if(loop)jump(step()*count);});
track.addEventListener('keydown',e=>{if(e.target===track&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});

if(loop)requestAnimationFrame(()=>jump(step()*count));
const languagePopup=document.querySelector('.language-banner');
languagePopup?.querySelector('.language-close')?.addEventListener('click',()=>{languagePopup.hidden=true;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&languagePopup&&!languagePopup.hidden){const focused=languagePopup.contains(document.activeElement);languagePopup.hidden=true;if(focused)document.querySelector('.languages a[lang="fr"]')?.focus();}});
if(languagePopup){setTimeout(()=>{if(languagePopup.hidden)return;languagePopup.classList.add('is-dismissing');setTimeout(()=>{languagePopup.hidden=true;},450);},10000);}


const portrait=document.querySelector('.banner figure');
if(portrait){portrait.tabIndex=0;portrait.setAttribute('role','button');portrait.setAttribute('aria-label',english?'Enlarge portrait':'Agrandir le portrait');const dialog=document.createElement('dialog');dialog.className='portrait-dialog';const photo=document.createElement('img');photo.src=portrait.querySelector('img').src;photo.alt=english?'Portrait of Idriss Bouhière':'Portrait d’Idriss Bouhière';const close=document.createElement('button');close.className='portrait-close';close.textContent='×';close.setAttribute('aria-label',english?'Close':'Fermer');dialog.append(photo,close);document.body.append(dialog);const open=()=>dialog.showModal();portrait.addEventListener('click',open);portrait.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});close.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});}
