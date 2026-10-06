"use client";

import { useSyncExternalStore } from "react";

/**
 * The scene transition: idle → cover (a solid circle grows from where you clicked, the
 * route changes underneath) → reveal (the new scene is built, the circle closes away) → idle.
 */
export type Phase = "idle" | "cover" | "reveal";
type State = { phase: Phase; to: string; target: string; x: number; y: number };

let state: State = { phase: "idle", to: "", target: "hub", x: 0, y: 0 };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const wipe = {
  get: () => state,
  set(patch: Partial<State>) {
    state = { ...state, ...patch };
    emit();
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
};

export function useWipe() {
  return useSyncExternalStore(wipe.subscribe, wipe.get, wipe.get);
}

/** Where the last press happened, so the circle grows from the thing you clicked. */
export const lastPress = { x: -1, y: -1 };
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    (e) => {
      lastPress.x = e.clientX;
      lastPress.y = e.clientY;
    },
    { passive: true, capture: true },
  );
}
