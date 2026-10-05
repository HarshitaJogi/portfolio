"use client";

import * as THREE from "three";
import type { WorldStep } from "@/content/profile";

/**
 * The air of the current scene: sky gradient, fog, and how much night there is.
 * Blended between steps from the scroll progress, so the sky changes as you travel.
 * Written once per frame by <Atmosphere>, read by lights, fog, and the CSS sky.
 */
export const atmo = {
  top: new THREE.Color("#ffe3b3"),
  bottom: new THREE.Color("#ffd6b8"),
  night: 0,
};

const a = new THREE.Color();
const b = new THREE.Color();

export function blendSky(steps: Pick<WorldStep, "sky" | "night">[], progress: number) {
  const p = Math.min(Math.max(progress, 0), steps.length - 1);
  const i = Math.min(Math.floor(p), steps.length - 2);
  const f = steps.length < 2 ? 0 : p - Math.max(i, 0);
  const s0 = steps[Math.max(i, 0)];
  const s1 = steps[Math.min(i + 1, steps.length - 1)];
  atmo.top.copy(a.set(s0.sky[0])).lerp(b.set(s1.sky[0]), f);
  atmo.bottom.copy(a.set(s0.sky[1])).lerp(b.set(s1.sky[1]), f);
  atmo.night = (s0.night ? 1 : 0) * (1 - f) + (s1.night ? 1 : 0) * f;
}

/** Paint the CSS sky behind the transparent canvas. */
export function paintSky() {
  const el = document.getElementById("sky");
  if (!el) return;
  el.style.setProperty("--sky-top", `#${atmo.top.getHexString()}`);
  el.style.setProperty("--sky-bottom", `#${atmo.bottom.getHexString()}`);
}
