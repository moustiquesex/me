// Public endpoint only. No Cloudflare account credentials are sent to the browser.
const reactionTrack=document.getElementById('publication-track');
const api=reactionTrack?.dataset.reactionsApi;
if(api){
 const english=document.documentElement.lang==='en';
 const key='bouhiere-reactions-v1';
 const slugs=[...new Set([...reactionTrack.children].map(card=>card.dataset.slug))];
 const states=new Map();const pending=new Set();let token='';
 const status=document.getElementById('status');
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.expires>Date.now()&&/^[a-f0-9-]{36}$/i.test(saved.token))token=saved.token;else if(saved)localStorage.removeItem(key);}catch{}
 function announce(message,error=false){status.textContent=message;status.className=error?'reaction-feedback':'sr-only';}
 function draw(slug){for(const card of reactionTrack.children){if(card.dataset.slug!==slug)continue;const button=card.querySelector('.heart'),state=states.get(slug);button.disabled=pending.has(slug);button.setAttribute('aria-busy',String(pending.has(slug)));button.setAttribute('aria-pressed',String(!!state?.liked));button.querySelector('span').textContent=state?String(state.count):'…';button.setAttribute('aria-label',english?(state?.liked?'Remove appreciation':'Appreciate this publication'):(state?.liked?'Retirer mon appréciation':'Apprécier cette publication'));}}
 async function request(url,options={}){const headers={...options.headers};if(token)headers['X-Reaction-Token']=token;const result=await fetch(url,{...options,headers,credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(10000)});if(!result.ok)throw Error(String(result.status));return result.json();}
 async function load(){const result=await request(api+'?slugs='+encodeURIComponent(slugs.join(',')));for(const slug of slugs){const state=result.reactions[slug];if(state&&Number.isSafeInteger(state.count)&&state.count>=0){states.set(slug,state);draw(slug);}}}
 for(const slug of slugs)draw(slug);
 load().catch(()=>announce(english?'Reactions are temporarily unavailable. Try again shortly.':'Les réactions sont temporairement indisponibles. Réessayez dans un instant.',true));
 reactionTrack.addEventListener('click',async event=>{
  const button=event.target.closest('.heart');if(!button)return;const slug=button.closest('article').dataset.slug;if(pending.has(slug))return;
  pending.add(slug);draw(slug);
  try{
   if(!states.has(slug))await load();
   if(!token){token=crypto.randomUUID();try{localStorage.setItem(key,JSON.stringify({token,expires:Date.now()+365*86400000}));}catch{}}
   const result=await request(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug,liked:!states.get(slug)?.liked})});
   states.set(slug,{count:result.count,liked:result.liked});if(result.liked){for(const card of reactionTrack.children){if(card.dataset.slug!==slug)continue;const heart=card.querySelector('.heart');heart.classList.remove('just-liked');void heart.offsetWidth;heart.classList.add('just-liked');setTimeout(()=>heart.classList.remove('just-liked'),600);}}announce(english?(result.liked?'Appreciation recorded.':'Appreciation removed.'):(result.liked?'Appréciation enregistrée.':'Appréciation retirée.'));
  }catch(error){announce(error.message==='429'?(english?'Too many requests. Please try again later.':'Trop de demandes. Réessayez plus tard.'):(english?'The reaction could not be saved. Please try again.':'La réaction n’a pas pu être enregistrée. Réessayez.'),true);}
  finally{pending.delete(slug);draw(slug);}
 });
}


