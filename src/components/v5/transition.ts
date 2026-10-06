"use client";

import { useSyncExternalStore } from "react";

/**
 * The scene transition: idle → cover (a solid circle grows from where you clicked, the
 * route changes underneath) → reveal (the new scene is built, the circle closes away) → idle.
 */
export type Phase = "idle" | "cover" | "reveal";
type State = { phase: Phase; to: string; target: string; x: number; y: number; verb?: string };

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

/**
 * A door with no route change (the first visit's welcome into the island): cover, run
 * `during` while covered, then reveal. The shell's route logic stays out of it.
 */
export const door = {
  local: false,
  play({ to, target, during, hold = 900, verb }: { to: string; target: string; during?: () => void; hold?: number; verb?: string }) {
    door.local = true;
    const x = lastPress.x >= 0 ? lastPress.x : window.innerWidth / 2;
    const y = lastPress.y >= 0 ? lastPress.y : window.innerHeight / 2;
    wipe.set({ phase: "cover", to, target, x, y, verb });
    window.setTimeout(() => during?.(), 640);
    window.setTimeout(() => {
      wipe.set({ phase: "reveal" });
      window.setTimeout(() => {
        wipe.set({ phase: "idle" });
        door.local = false;
      }, 760);
    }, 640 + hold);
  },
};

// dev only: lets the UX test suite see the transition state
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") Object.assign(window, { __wipe: wipe });
