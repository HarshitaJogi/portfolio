"use client";

import { useSyncExternalStore } from "react";

/**
 * The cloud wipe between scenes.
 * idle → cover (clouds close, then the route changes) → reveal (the new scene is built, clouds part) → idle.
 */
export type Phase = "idle" | "cover" | "reveal";
type State = { phase: Phase; to: string };

let state: State = { phase: "idle", to: "" };
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
