/**
 * cyber-matrix-rain.js
 * Matrix-style falling glyph rain with depth (z) layering.
 * Multiple columns at different speeds/sizes simulate 3D depth.
 */
(function () {
  "use strict";

  const canvas = document.getElementById("matrixRain");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Glyph pool — katakana + digits + symbols for cyber vibe
  const GLYPHS =
    "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789#$%*+-=<>{}[]/";

  const DEPTH_LAYERS = [
    { fontSize: 10, alpha: 0.35, speed: 0.45, color: "#0ef0ff" }, // far
    { fontSize: 14, alpha: 0.7, speed: 0.75, color: "#00ffd1" }, // mid
    { fontSize: 18, alpha: 1, speed: 1.1, color: "#d8faff" }, // near
  ];

  let W, H, DPR;
  let columns = [];
  let lastFrame = 0;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth = window.innerWidth;
    H = canvas.clientHeight = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildColumns();
  }

  function buildColumns() {
    columns = [];
    // Budget ~90 columns across all layers, throttled on mobile.
    const budget = Math.min(90, Math.floor(W / 14));
    for (let i = 0; i < budget; i++) {
      const layer = DEPTH_LAYERS[i % DEPTH_LAYERS.length];
      columns.push({
        x: Math.random() * W,
        y: Math.random() * -H,
        len: 8 + Math.floor(Math.random() * 22),
        tick: Math.random() * 60,
        layer,
      });
    }
  }

  function draw(ts) {
    if (prefersReduced) return;
    // Throttle to ~40fps for perf.
    if (ts - lastFrame < 24) {
      requestAnimationFrame(draw);
      return;
    }
    lastFrame = ts;

    // Trail fade — deep void tint.
    ctx.fillStyle = "rgba(5, 8, 20, 0.22)";
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < columns.length; i++) {
      const c = columns[i];
      const { fontSize, alpha, speed, color } = c.layer;
      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;
      ctx.globalAlpha = alpha;

      // Head glyph (brighter)
      const headChar = GLYPHS.charAt(
        Math.floor(Math.random() * GLYPHS.length)
      );
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.fillText(headChar, c.x, c.y);

      // Trail glyphs
      ctx.fillStyle = color;
      ctx.shadowBlur = 2;
      for (let j = 1; j < c.len; j++) {
        const char = GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
        const fade = 1 - j / c.len;
        ctx.globalAlpha = alpha * fade * 0.9;
        ctx.fillText(char, c.x, c.y - j * fontSize * 1.02);
      }

      c.y += fontSize * speed;

      // Reset when past bottom with some randomness.
      if (c.y - c.len * fontSize > H && Math.random() > 0.975) {
        c.y = Math.random() * -H * 0.6;
        c.x = Math.random() * W;
        c.len = 8 + Math.floor(Math.random() * 22);
      }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  if (!prefersReduced) requestAnimationFrame(draw);

  // --- HUD live values (latency + clock) ---
  const hudLatency = document.getElementById("hudLatency");
  const hudTime = document.getElementById("hudTime");

  function tickHud() {
    if (hudTime) {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      hudTime.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
        d.getSeconds()
      )}`;
    }
    if (hudLatency) {
      // Fake ping jitter — adds life without real network calls.
      const ping = 9 + Math.floor(Math.random() * 18);
      hudLatency.textContent = `PING ${String(ping).padStart(3, "0")} ms`;
    }
  }
  tickHud();
  setInterval(tickHud, 1000);
})();
