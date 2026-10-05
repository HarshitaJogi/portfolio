"use client";

import { useSyncExternalStore } from "react";

/** Island interaction state shared by the 3D scene and the HTML overlay. */
type State = { approved: boolean; bells: number; pumpkins: number };
let state: State = { approved: false, bells: 0, pumpkins: 0 };
const listeners = new Set<() => void>();

export const island = {
  get: () => state,
  set(patch: Partial<State>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};

export function useIsland() {
  return useSyncExternalStore(island.subscribe, island.get, island.get);
}
