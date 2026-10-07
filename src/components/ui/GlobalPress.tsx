"use client";

import { useEffect } from "react";
import { pressBounce, pressHold } from "@/components/v5/juice";

const PRESSABLE = 'a, button, [role="button"], [role="radio"], [role="option"], summary';

/** How hard to press: big things (a whole card) barely move, small pills sink properly. */
function pose(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const big = r.width > 320 || r.height > 160;
  return big ? { dx: 1, dy: 2, squash: 0.99 } : { dx: 2, dy: 2, squash: 0.94 };
}

/**
 * Every button and link on the site presses down and springs back, so a click always feels
 * like a click. Components with their own deeper press opt out with data-press="custom"; an
 * element that must keep its own transform opts out alone with data-press="none".
 */
export function GlobalPress() {
  useEffect(() => {
    let release: (() => void) | null = null;
    const target = (e: Event) => {
      const el = (e.target as HTMLElement | null)?.closest?.(PRESSABLE) as HTMLElement | null;
      // data-press="none" opts out just that element (a flip card face, whose transform is its rotation)
      if (!el || el.dataset.press === "none" || el.closest('[data-press="custom"]') || el.closest("canvas")) return null;
      return el;
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const el = target(e);
      if (el) release = pressHold(el, pose(el));
    };
    const up = () => {
      release?.();
      release = null;
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = target(e);
      if (el) pressBounce(el, pose(el));
    };
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", up, true);
    window.addEventListener("keydown", key, true);
    return () => {
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", up, true);
      window.removeEventListener("keydown", key, true);
    };
  }, []);
  return null;
}
