/**
 * cyber-3d-parallax.js
 * Mouse/gyro-driven 3D parallax for layered scene elements
 * + 3D tilt-on-hover for country node cards.
 */
(function () {
  "use strict";

  const scene = document.getElementById("scene");
  if (!scene) return;

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const layers = document.querySelectorAll("[data-depth]");
  const nodes = document.querySelectorAll(".node");
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;

  // --- Scene-wide parallax (mouse move) ---
  let targetX = 0;
  let targetY = 0;
  let curX = 0;
  let curY = 0;
  let rafId = null;

  function onMove(x, y) {
    // Normalize to [-1, 1]
    targetX = (x / window.innerWidth) * 2 - 1;
    targetY = (y / window.innerHeight) * 2 - 1;
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;

    layers.forEach((el) => {
      const depth = parseFloat(el.dataset.depth) || 1;
      const tx = -curX * depth * 8;
      const ty = -curY * depth * 6;
      const rx = curY * depth * 2.5;
      const ry = -curX * depth * 3;
      el.style.transform =
        `translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    if (
      Math.abs(targetX - curX) > 0.001 ||
      Math.abs(targetY - curY) > 0.001
    ) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  if (!prefersReduced && !isCoarse) {
    window.addEventListener(
      "mousemove",
      (e) => onMove(e.clientX, e.clientY),
      { passive: true }
    );
  }

  // Device orientation → parallax on mobile (gentle)
  if (!prefersReduced && isCoarse && window.DeviceOrientationEvent) {
    window.addEventListener(
      "deviceorientation",
      (e) => {
        // beta: front-back [-180,180], gamma: left-right [-90,90]
        const gx = (e.gamma || 0) / 45; // -2..2
        const gy = (e.beta || 0) / 45;
        onMove(
          window.innerWidth / 2 + gx * window.innerWidth * 0.15,
          window.innerHeight / 2 + gy * window.innerHeight * 0.1
        );
      },
      { passive: true }
    );
  }

  // --- Per-card 3D tilt on hover (desktop only) ---
  if (!prefersReduced && !isCoarse) {
    nodes.forEach((card) => {
      let raf = null;
      card.addEventListener(
        "mousemove",
        (e) => {
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width;
          const py = (e.clientY - rect.top) / rect.height;
          // Map [0..1] to tilt range
          const tiltY = (px - 0.5) * 18; // rotateY
          const tiltX = -(py - 0.5) * 14; // rotateX
          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            card.style.setProperty("--tilt-x", `${tiltX}deg`);
            card.style.setProperty("--tilt-y", `${tiltY}deg`);
          });
        },
        { passive: true }
      );
      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  // --- Subtle press feedback for touch devices ---
  nodes.forEach((card) => {
    card.addEventListener(
      "touchstart",
      () => {
        card.style.setProperty("--tilt-x", "-4deg");
        card.style.setProperty("--tilt-y", "4deg");
      },
      { passive: true }
    );
    card.addEventListener("touchend", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
})();
