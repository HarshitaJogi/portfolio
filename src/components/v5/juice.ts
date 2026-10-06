"use client";

/**
 * Game-feel effects for the interface: a burst of stars and dots, a ray flash, a shockwave
 * ring, and a screen shake. Plain DOM and the Web Animations API, so they cost nothing
 * until fired. Skipped under reduced motion (the sound still plays).
 */
const COLORS = ["#ff6b4a", "#ffc93c", "#2f5dff", "#3bb273", "#ff4f8b", "#16a3a3", "#fff8ec"];
const STAR = "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)";

const calm = () => typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function piece(css: string) {
  const d = document.createElement("span");
  d.setAttribute("aria-hidden", "true");
  d.style.cssText = `position:fixed;pointer-events:none;z-index:95;${css}`;
  document.body.appendChild(d);
  return d;
}

/** Stars, dots and a ray flash bursting from (x, y). `power` 1 is a button, 2.5 is a stamp. */
export function burst(x: number, y: number, power = 1) {
  if (calm()) return;
  // the ray flash
  const rays = piece(
    `left:${x}px;top:${y}px;width:${180 * power}px;height:${180 * power}px;transform:translate(-50%,-50%);border-radius:50%;background:repeating-conic-gradient(rgba(255,201,60,.85) 0 10deg,transparent 10deg 30deg);mask:radial-gradient(circle,#000 20%,transparent 70%);-webkit-mask:radial-gradient(circle,#000 20%,transparent 70%)`,
  );
  rays.animate(
    [
      { transform: "translate(-50%,-50%) scale(.2) rotate(0deg)", opacity: 1 },
      { transform: "translate(-50%,-50%) scale(1.15) rotate(40deg)", opacity: 0 },
    ],
    { duration: 520, easing: "cubic-bezier(.2,.8,.3,1)" },
  ).onfinish = () => rays.remove();
  // the shockwave ring
  const ring = piece(`left:${x}px;top:${y}px;width:${120 * power}px;height:${120 * power}px;transform:translate(-50%,-50%);border-radius:50%;border:${4 * Math.min(power, 1.6)}px solid #2b1e1a`);
  ring.animate(
    [
      { transform: "translate(-50%,-50%) scale(.15)", opacity: 0.9 },
      { transform: "translate(-50%,-50%) scale(1.2)", opacity: 0 },
    ],
    { duration: 480, easing: "cubic-bezier(.2,.8,.3,1)" },
  ).onfinish = () => ring.remove();
  // stars and dots
  const n = Math.round(14 * Math.min(power, 2.4));
  for (let i = 0; i < n; i++) {
    const star = i % 3 !== 2;
    const s = (star ? 16 : 10) * (0.8 + ((i * 37) % 10) / 20) * Math.min(1 + power * 0.2, 1.8);
    const d = piece(
      `left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:${COLORS[i % COLORS.length]};${star ? `clip-path:${STAR};filter:drop-shadow(2px 2px 0 #2b1e1a)` : "border-radius:50%;border:2.5px solid #2b1e1a"};transform:translate(-50%,-50%)`,
    );
    const a = (i / n) * Math.PI * 2 + (i % 2) * 0.35;
    const r = (60 + ((i * 53) % 50)) * power;
    d.animate(
      [
        { transform: "translate(-50%,-50%) scale(.3) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * r * 0.7}px), calc(-50% + ${Math.sin(a) * r * 0.7}px)) scale(1.15) rotate(${120 + i * 25}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * r}px), calc(-50% + ${Math.sin(a) * r + 30 * power}px)) scale(.2) rotate(${220 + i * 30}deg)`, opacity: 0 },
      ],
      { duration: 720 + (i % 4) * 60, easing: "cubic-bezier(.15,.75,.35,1)" },
    ).onfinish = () => d.remove();
  }
}

/** Confetti raining from the top of the screen, for the big moments. */
export function confettiRain(count = 70) {
  if (calm()) return;
  const w = window.innerWidth;
  for (let i = 0; i < count; i++) {
    const x = ((i * 97) % 100) / 100 * w;
    const s = 8 + (i % 5) * 3;
    const d = piece(`left:${x}px;top:-20px;width:${s}px;height:${s * 1.6}px;background:${COLORS[i % COLORS.length]};border:2px solid #2b1e1a;border-radius:2px`);
    const drift = ((i * 41) % 120) - 60;
    d.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${drift}px, ${window.innerHeight + 60}px) rotate(${360 + i * 40}deg)`, opacity: 1 },
      ],
      { duration: 1600 + (i % 7) * 180, delay: (i % 10) * 40, easing: "cubic-bezier(.3,.1,.6,1)" },
    ).onfinish = () => d.remove();
  }
}

/** A short screen shake, for stamps. */
export function shake(power = 1) {
  if (calm()) return;
  const el = document.getElementById("main");
  if (!el) return;
  const p = 6 * power;
  el.animate(
    [
      { transform: "translate(0,0)" },
      { transform: `translate(${-p}px,${p * 0.6}px)` },
      { transform: `translate(${p}px,${-p * 0.4}px)` },
      { transform: `translate(${-p * 0.6}px,${-p * 0.3}px)` },
      { transform: "translate(0,0)" },
    ],
    { duration: 320, easing: "ease-out" },
  );
}

/** Centre of an element, for bursting from it. */
export function centerOf(el: Element) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * The press: the element sinks (by `dx`, `dy`, squashing a little) then springs back with
 * an overshoot. Runs on top of any Tailwind translate, so it composes with hover lifts.
 */
export function pressBounce(el: HTMLElement, { dx = 2, dy = 2, squash = 0.96, dur = 420 }: { dx?: number; dy?: number; squash?: number; dur?: number } = {}) {
  if (calm()) return;
  el.animate(
    [
      { transform: "translate(0,0) scale(1)" },
      { transform: `translate(${dx}px,${dy}px) scale(${squash + 0.02},${squash})`, offset: 0.22 },
      { transform: `translate(0,${-dy * 0.35}px) scale(1.03,1.04)`, offset: 0.6 },
      { transform: "translate(0,0) scale(0.995)", offset: 0.82 },
      { transform: "translate(0,0) scale(1)" },
    ],
    { duration: dur, easing: "ease-out" },
  );
}

/** Hold the pressed-down pose while the pointer is down. Returns a release function. */
export function pressHold(el: HTMLElement, { dx = 2, dy = 2, squash = 0.96 } = {}) {
  if (calm()) return () => {};
  const a = el.animate([{ transform: "translate(0,0) scale(1)" }, { transform: `translate(${dx}px,${dy}px) scale(${squash + 0.02},${squash})` }], { duration: 70, easing: "ease-out", fill: "forwards" });
  return () => {
    a.cancel();
    el.animate(
      [
        { transform: `translate(${dx}px,${dy}px) scale(${squash + 0.02},${squash})` },
        { transform: `translate(0,${-dy * 0.35}px) scale(1.03,1.04)`, offset: 0.5 },
        { transform: "translate(0,0) scale(0.995)", offset: 0.78 },
        { transform: "translate(0,0) scale(1)" },
      ],
      { duration: 340, easing: "ease-out" },
    );
  };
}
