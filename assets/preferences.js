const preferenceTheme=document.getElementById('theme');
let selectedTheme='light';try{selectedTheme=localStorage.getItem('bouhiere-theme')==='dark'?'dark':'light';}catch{}
function applyPreference(){document.documentElement.dataset.theme=selectedTheme;if(preferenceTheme){preferenceTheme.innerHTML=selectedTheme==='dark'?'☀':'☾';preferenceTheme.setAttribute('aria-label',document.documentElement.lang==='fr'?'Changer le thème':'Switch theme');}}
applyPreference();preferenceTheme?.addEventListener('click',()=>{selectedTheme=selectedTheme==='dark'?'light':'dark';applyPreference();try{localStorage.setItem('bouhiere-theme',selectedTheme);}catch{}});
document.querySelectorAll('.languages a').forEach(a=>a.addEventListener('click',()=>{try{localStorage.setItem('bouhiere-language',a.lang||a.dataset.language);}catch{}}));
if(location.pathname==='/'){try{if(localStorage.getItem('bouhiere-language')==='fr')location.replace('/fr/');}catch{}}
