const theme=document.getElementById('theme');
const system=matchMedia('(prefers-color-scheme: dark)');let manual=false;
const sun='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></svg>';
const moon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 14A9 9 0 0 1 10 3.2 9 9 0 1 0 20.8 14Z"/></svg>';
function updateTheme(dark){document.documentElement.dataset.theme=dark?'dark':'light';theme.innerHTML=dark?sun:moon;const label=dark?'Activer le mode clair':'Activer le mode sombre';theme.setAttribute('aria-label',label);theme.title=label;}
updateTheme(system.matches);system.addEventListener('change',e=>{if(!manual)updateTheme(e.matches);});theme.addEventListener('click',()=>{manual=true;updateTheme(document.documentElement.dataset.theme!=='dark');});

const english=document.documentElement.lang==='en';

if(english){const labelTheme=()=>{theme.title=document.documentElement.dataset.theme==='dark'?'Switch to light mode':'Switch to dark mode';theme.setAttribute('aria-label',theme.title);};new MutationObserver(labelTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});labelTheme();}
const track=document.getElementById('publication-track'),shell=track.closest('.carousel-shell'),previous=shell.querySelector('.previous'),next=shell.querySelector('.next');
const originals=[...track.children],count=originals.length,loop=count>3;
shell.classList.toggle('has-carousel',loop);
if(loop){const copy=article=>{const node=article.cloneNode(true);node.setAttribute('aria-hidden','true');node.querySelectorAll('a,button').forEach(el=>el.tabIndex=-1);return node;};for(const article of originals)track.append(copy(article));for(const article of originals.toReversed())track.prepend(copy(article));}
const likes=new Set();
track.addEventListener('click',e=>{const button=e.target.closest('.heart');if(!button)return;const slug=button.closest('article').dataset.slug;likes.has(slug)?likes.delete(slug):likes.add(slug);for(const card of track.children){if(card.dataset.slug!==slug)continue;const b=card.querySelector('.heart');b.setAttribute('aria-pressed',String(likes.has(slug)));b.querySelector('span').textContent=likes.has(slug)?'1':'0';}document.getElementById('status').textContent=english?(likes.has(slug)?'Like added.':'Like removed.'):(likes.has(slug)?'Appréciation ajoutée.':'Appréciation retirée.');});
function step(){return track.children[1].offsetLeft-track.children[0].offsetLeft;}
function jump(left){track.classList.add('repositioning');track.scrollLeft=left;requestAnimationFrame(()=>track.classList.remove('repositioning'));}
function normalize(){if(!loop)return;const cycle=step()*count;if(track.scrollLeft<cycle-2)jump(track.scrollLeft+cycle);else if(track.scrollLeft>=cycle*2-2)jump(track.scrollLeft-cycle);}
function move(direction){if(!loop)return;normalize();track.scrollBy({left:direction*step(),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
let timer;track.addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(normalize,160);},{passive:true});track.addEventListener('scrollend',normalize);
window.addEventListener('resize',()=>{if(loop)jump(step()*count);});
track.addEventListener('keydown',e=>{if(e.target===track&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
track.addEventListener('wheel',e=>{if(!loop||e.ctrlKey)return;e.preventDefault();const delta=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*(e.deltaMode===1?20:e.deltaMode===2?track.clientWidth:1);normalize();track.scrollLeft+=delta;},{passive:false});
if(loop)requestAnimationFrame(()=>jump(step()*count));
