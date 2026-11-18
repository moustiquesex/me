let token = document.querySelector('meta[name="editor-token"]').content;
const byId = id => document.getElementById(id);
let posts = [];
let current = {};
let language = 'fr';
let pdf = '';
let image='';
let savedSelection;
const metadata = ['slug','date','type','discipline','access','source','publisher','imageAlt','imageCredit','imageSource','imageOwnership'];
async function api(route, value, contentType='application/json') {
  const options = {headers:{'X-Editor-Token':token}};
  if (value !== undefined) {
    options.method = 'POST'; options.headers['Content-Type'] = contentType;
    options.body = contentType === 'application/json' ? JSON.stringify(value) : value;
  }
  let response;try{response=await fetch(route,options);}catch{throw Error('Éditeur local arrêté ou inaccessible. Votre saisie reste dans le formulaire. Relancez npm run editor.');}
  if(response.status===403){const html=await(await fetch('/')).text();const fresh=html.match(/name="editor-token" content="([^"]+)"/);if(fresh){token=fresh[1];options.headers['X-Editor-Token']=token;response=await fetch(route,options);}}
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Requête échouée.');
  return result;
}
function status(message) { byId('status').textContent = message; byId('status').hidden=!message; }
function storeLanguage() {
  current[language] = {title:byId('title').value, summary:byId('summary').value, body:byId('body').innerHTML, bodyFormat:'html'};
}
function showLanguage() {
  const content = current[language] || {};
  byId('title').value = content.title || '';
  byId('summary').value = content.summary || '';
  byId('body').innerHTML = '';
  if (content.bodyFormat === 'html') byId('body').innerHTML = content.body || '';
  else (content.body || '').split(/\n\s*\n/).filter(Boolean).forEach(text => {
    const paragraph = document.createElement('p'); paragraph.textContent = text; byId('body').append(paragraph);
  });
  document.querySelectorAll('[data-lang]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lang===language)));
}
function load(post={}) {
  current = structuredClone(post); language='fr'; pdf=post.pdf || '';image=post.image||'';byId('tags').value=(post.tags||[]).join(', ');byId('image-upload').value='';showImage();showTags();
  metadata.forEach(key=>byId(key).value=post[key] || ({date:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'}).format(new Date()),imageOwnership:'own',type:'analysis',discipline:'International relations',access:'none'}[key] || ''));
  byId('slug').readOnly=Boolean(post.slug);
  byId('published').checked=Boolean(post.published);
  byId('pdf-name').textContent=pdf;
  byId('upload').value=''; showLanguage(); status('');
}
async function refresh() {
  posts=await api('/api/posts'); const select=byId('posts'); select.replaceChildren(new Option('Choisir',''));
  posts.forEach(post=>select.add(new Option(`${post.date} - ${post.fr?.title || post.en?.title}`,post.slug)));
}
byId('new').addEventListener('click',()=>load());
byId('posts').addEventListener('change',()=>load(posts.find(post=>post.slug===byId('posts').value)));
document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>{storeLanguage();language=button.dataset.lang;showLanguage();}));
byId('body').addEventListener('keyup',rememberSelection);
byId('body').addEventListener('mouseup',rememberSelection);
function rememberSelection() {const selection=getSelection();if(selection.rangeCount && byId('body').contains(selection.anchorNode)) savedSelection=selection.getRangeAt(0).cloneRange();}
function selectedBlock() {
  const selection=getSelection();
  let element=selection.anchorNode?.nodeType===1?selection.anchorNode:selection.anchorNode?.parentElement;
  let block=element?.closest('p,h2,h3,h4,li,blockquote');
  if(!block || !byId('body').contains(block)) {
    document.execCommand('formatBlock',false,'p');
    element=getSelection().anchorNode;
    block=(element?.nodeType===1?element:element?.parentElement)?.closest('p,h2,h3,h4,li,blockquote');
  }
  return block;
}
function restoreSelection() {byId('body').focus();if(savedSelection){const selection=getSelection();selection.removeAllRanges();selection.addRange(savedSelection);}}
document.querySelectorAll('[data-command]').forEach(button=>{
 button.addEventListener('mousedown',event=>event.preventDefault());
 button.addEventListener('click',()=>{
  restoreSelection();const command=button.dataset.command;
  if(command.startsWith('justify')) {
    const element=selectedBlock();
    if(element && byId('body').contains(element)){element.classList.remove('align-left','align-center','align-right','align-justify');element.classList.add({justifyLeft:'align-left',justifyCenter:'align-center',justifyRight:'align-right',justifyFull:'align-justify'}[command]);}
  } else document.execCommand(command,false);
  rememberSelection();
 });
});
byId('block').addEventListener('change',()=>{restoreSelection();document.execCommand('formatBlock',false,byId('block').value);rememberSelection();});
byId('size').addEventListener('change',()=>{
 restoreSelection();const element=selectedBlock();
 if(element && byId('body').contains(element)){element.classList.remove('text-small','text-normal','text-large');element.classList.add(byId('size').value);}
 rememberSelection();
});
byId('link').addEventListener('mousedown',event=>event.preventDefault());
byId('link').addEventListener('click',()=>{const value=prompt('Adresse HTTPS du lien');if(value && /^https:\/\//i.test(value)){restoreSelection();document.execCommand('createLink',false,value);rememberSelection();}});
byId('body').addEventListener('paste',event=>{
 event.preventDefault();document.execCommand('insertText',false,event.clipboardData.getData('text/plain'));
});
byId('upload').addEventListener('change',async()=>{
 const file=byId('upload').files[0];if(!file)return;
 try {status('Vérification du PDF en cours.');const result=await api('/api/upload',file,'application/pdf');pdf=result.pdf;byId('pdf-name').textContent=pdf;byId('access').value='public';status('PDF contrôlé et enregistré sur cet ordinateur.');}
 catch(error){status(error.message);byId('upload').value='';}
});
async function save() {
 if(!byId('slug').value.trim()){byId('slug').value=byId('title').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100).replace(/-$/,'');}
 status('Enregistrement en cours.');
 storeLanguage();metadata.forEach(key=>current[key]=byId(key).value);current.pdf=pdf;current.image=image;current.tags=byId('tags').value.split(',').map(t=>t.trim()).filter(Boolean);current.published=byId('published').checked;
 const result=await api('/api/save',current);byId('slug').readOnly=true;await refresh();status(result.message);
}
byId('save').addEventListener('click',()=>save().catch(error=>status(error.message)));
byId('publish').addEventListener('click',async()=>{
 try {await save();if(!confirm('Envoyer les textes enregistrés et les PDF vers le dépôt GitHub public ?'))return;
 byId('publish').disabled=true;status('Envoi vers GitHub en cours.');const result=await api('/api/publish',{});status(result.message);
 }catch(error){status(error.message);}finally{byId('publish').disabled=false;}
});
refresh().then(()=>{let draft;try{draft=JSON.parse(localStorage.getItem('bouhiere-editor-draft')||'null');}catch{}if(draft&&confirm('Restaurer la saisie de secours conservée dans ce navigateur ?')){load(draft);status('Saisie restaurée. Enregistrez-la pour la conserver dans le dossier du site.');}else load();}).catch(error=>status(error.message));

function showImage(){byId('image-name').textContent=image;const preview=byId('image-preview');preview.hidden=!image;if(image)preview.src=image;else preview.removeAttribute('src');}
function showTags(){byId('tag-preview').replaceChildren(...byId('tags').value.split(',').map(t=>t.trim()).filter(Boolean).map(t=>{const span=document.createElement('span');span.textContent=t;return span;}));}
byId('tags').addEventListener('input',showTags);
byId('remove-image').addEventListener('click',()=>{image='';byId('image-upload').value='';showImage();});
byId('image-upload').addEventListener('change',async()=>{const file=byId('image-upload').files[0];if(!file)return;try{if(file.size>5*1024*1024)throw Error('Image limitée à 5 Mio.');status('Vérification et réencodage de l’image.');const result=await api('/api/image',file,file.type);image=result.image;showImage();status('Image contrôlée, métadonnées retirées et nom aléatoire attribué.');}catch(e){status(e.message);byId('image-upload').value='';}});

document.querySelectorAll('[data-tag]').forEach(button=>button.addEventListener('click',()=>{const tags=byId('tags').value.split(',').map(t=>t.trim()).filter(Boolean);if(!tags.includes(button.dataset.tag)&&tags.length<8)tags.push(button.dataset.tag);byId('tags').value=tags.join(', ');showTags();}));

let draftTimer;document.querySelector('main').addEventListener('input',()=>{clearTimeout(draftTimer);draftTimer=setTimeout(()=>{storeLanguage();const draft=structuredClone(current);metadata.forEach(k=>draft[k]=byId(k).value);draft.pdf=pdf;draft.image=image;draft.tags=byId('tags').value.split(',').map(t=>t.trim()).filter(Boolean);draft.published=byId('published').checked;for(const l of ['fr','en'])if(draft[l]){const parsed=new DOMParser().parseFromString(draft[l].body||'','text/html');draft[l].body=parsed.body.textContent;draft[l].bodyFormat='text';}try{localStorage.setItem('bouhiere-editor-draft',JSON.stringify(draft));}catch{}},400);});
