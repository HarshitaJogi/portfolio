"use client";

import { useSyncExternalStore } from "react";

const stores = new Map<string, { subscribe: (cb: () => void) => () => void; get: () => boolean }>();

function mediaStore(query: string) {
  const cached = stores.get(query);
  if (cached) return cached;
  const store = {
    subscribe(cb: () => void) {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    get: () => window.matchMedia(query).matches,
  };
  stores.set(query, store);
  return store;
}

/** SSR-safe media query hook. Server snapshot is `fallback`. */
export function useMedia(query: string, fallback = false) {
  const store = mediaStore(query);
  return useSyncExternalStore(store.subscribe, store.get, () => fallback);
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/**
 * Low-power heuristic. When true, no WebGL is mounted and static fallbacks are shown.
 * Called only on the client, after hydration.
 */
export function isLowPower(): boolean {
  if (typeof window === "undefined") return true;
  const nav = navigator as NavigatorExtras;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return true;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4) return true;
  try {
    const c = document.createElement("canvas");
    if (!(c.getContext("webgl2") || c.getContext("webgl"))) return true;
  } catch {
    return true;
  }
  return false;
}
