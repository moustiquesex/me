const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const tokenPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const encoder=new TextEncoder();
const hex=bytes=>[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
async function hash(text){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(text)));}
async function networkKey(ip,secret){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(ip)));}
function response(data,status,origin){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Reaction-Token','Access-Control-Max-Age':'600','Vary':'Origin','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});}
async function readSmallJson(request){
 if(Number(request.headers.get('content-length')||0)>1024)throw Error('body');
 const reader=request.body?.getReader();if(!reader)throw Error('body');let length=0;const parts=[];
 while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>1024){await reader.cancel();throw Error('body');}parts.push(value);}
 const bytes=new Uint8Array(length);let offset=0;for(const value of parts){bytes.set(value,offset);offset+=value.length;}return JSON.parse(new TextDecoder().decode(bytes));
}
async function published(slug,origin){
 const key=new Request(origin+'/en/publications/'+slug+'/');
 const cache=caches.default;if(await cache.match(key))return true;
 for(const lang of ['en','fr']){
  const result=await fetch(origin+'/'+lang+'/publications/'+slug+'/',{method:'HEAD',redirect:'manual',signal:AbortSignal.timeout(5000)});
  if(result.ok){await cache.put(key,new Response('published',{headers:{'Cache-Control':'max-age=300'}}));return true;}
 }return false;
}
async function rateLimit(env,request,now){
 const ip=request.headers.get('CF-Connecting-IP');if(!ip||!env.RATE_SECRET)throw Error('configuration');
 const digest=await networkKey(ip,env.RATE_SECRET);
 const windows=[[60,15],[86400,100]];
 const results=await env.DB.batch(windows.map(([seconds])=>env.DB.prepare('INSERT INTO limits(key,n,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET n=n+1 RETURNING n').bind(digest+':'+seconds+':'+Math.floor(now/seconds),Math.floor(now/seconds)*seconds+seconds)));
 return results.every((r,i)=>r.results[0].n<=windows[i][1]);
}
export default {
 async fetch(request,env){
  const origin=env.SITE_ORIGIN;
  const supplied=request.headers.get('Origin');
  if(supplied&&supplied!==origin)return response({error:'origin'},403,origin);
  const url=new URL(request.url);
  if(url.pathname!=='/v1/reactions')return response({error:'not_found'},404,origin);
  if(request.method==='OPTIONS')return response({},200,origin);
  const rawToken=request.headers.get('X-Reaction-Token');
  if(rawToken&&!tokenPattern.test(rawToken))return response({error:'token'},400,origin);
  try{
   const voter=rawToken?await hash(rawToken):'';
   if(request.method==='GET'){
    const slugs=[...new Set((url.searchParams.get('slugs')||'').split(','))];
    if(!slugs.length||slugs.length>100||slugs.some(s=>s.length>100||!slugPattern.test(s)))return response({error:'slugs'},400,origin);
    const rows=await env.DB.prepare(`SELECT c.slug,c.total,EXISTS(SELECT 1 FROM reactions r WHERE r.slug=c.slug AND r.voter=?) AS liked FROM counts c WHERE c.slug IN (${slugs.map(()=>'?').join(',')})`).bind(voter,...slugs).all();
    const found=new Map(rows.results.map(row=>[row.slug,{count:row.total,liked:!!row.liked}]));
    return response({reactions:Object.fromEntries(slugs.map(slug=>[slug,found.get(slug)||{count:0,liked:false}]))},200,origin);
   }
   if(request.method!=='POST')return response({error:'method'},405,origin);
   if(supplied!==origin)return response({error:'origin'},403,origin);
   if(!rawToken)return response({error:'token'},400,origin);
   if(request.headers.get('content-type')?.split(';')[0]!=='application/json')return response({error:'type'},415,origin);
   let data;try{data=await readSmallJson(request);}catch{return response({error:'body'},400,origin);}
   const {slug,liked}=data;
   if(typeof slug!=='string'||slug.length>100||!slugPattern.test(slug)||typeof liked!=='boolean')return response({error:'body'},400,origin);
   const now=Math.floor(Date.now()/1000);
   if(!await rateLimit(env,request,now))return response({error:'rate_limit'},429,origin);
   if(!await published(slug,origin))return response({error:'publication'},404,origin);
   const result=await env.DB.batch([
    env.DB.prepare('INSERT INTO counts(slug,total) VALUES(?,0) ON CONFLICT(slug) DO NOTHING').bind(slug),
    liked?env.DB.prepare('INSERT INTO reactions(slug,voter,expires) VALUES(?,?,?) ON CONFLICT(slug,voter) DO NOTHING').bind(slug,voter,now+365*86400):env.DB.prepare('DELETE FROM reactions WHERE slug=? AND voter=?').bind(slug,voter),
    env.DB.prepare('SELECT total FROM counts WHERE slug=?').bind(slug)
   ]);
   return response({slug,count:result[2].results[0].total,liked},200,origin);
  }catch(error){if(url.hostname==='127.0.0.1')console.error(error.message);return response({error:'unavailable'},503,origin);}
 },
 async scheduled(_event,env){const now=Math.floor(Date.now()/1000);await env.DB.batch([env.DB.prepare('DELETE FROM reactions WHERE expires<?').bind(now),env.DB.prepare('DELETE FROM limits WHERE expires<?').bind(now)]);}
};


