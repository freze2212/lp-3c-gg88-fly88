// Cloudflare Pages / Workers handler — GG88 landing page
import DOMAIN_MAPPINGS from "./domains.json";

const DEFAULT_REDIRECT = "https://gg8858.com/?id=400665646";

function resolveTargetUrl(cleanHost) {
  if (DOMAIN_MAPPINGS && DOMAIN_MAPPINGS[cleanHost]) {
    const entry = DOMAIN_MAPPINGS[cleanHost];
    if (typeof entry === "string") return entry;
    if (entry && entry.main_url) return entry.main_url;
    if (entry && entry.target_url) return entry.target_url;
  }
  return DEFAULT_REDIRECT;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const rawHost = request.headers.get("host") || url.hostname || "";
    const cleanHost = rawHost.replace(/^www\./i, "").split(":")[0].toLowerCase();
    const targetUrl = resolveTargetUrl(cleanHost);

    if (path === "/api/domain-config") {
      return new Response(
        JSON.stringify({
          success: true,
          host: cleanHost,
          targetUrl: targetUrl,
        }),
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (path === "/config.js") {
      const configJs =
        `/* Dynamically generated for host: ${cleanHost} */\n` +
        `window.REDIRECT_URL = ${JSON.stringify(targetUrl)};\n`;
      return new Response(configJs, {
        headers: {
          "Content-Type": "application/javascript;charset=UTF-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    return env.ASSETS ? env.ASSETS.fetch(request) : fetch(request);
  },
};
