"use client";

import { useSyncExternalStore } from "react";
import { ui } from "@/lib/audio";

/**
 * What the hub camera is doing: the whole island (focus -1, turnable by dragging),
 * one district (focus 0..6), or the view from above (focus 7).
 */
export const ABOVE = 7;
/** `n` counts changes, so the page can tell a first view from a move. */
type View = { focus: number; n: number };
let view: View = { focus: -1, n: 0 };
const listeners = new Set<() => void>();

/** Drag state, read by the rig every frame. Not React state. */
export const orbit = { azimuth: 0.35, lastInput: 0, suppressClick: false };

export const hubView = {
  get: () => view,
  focus(i: number) {
    if (view.focus === i) return;
    // the camera is about to fly: let it be heard
    if (view.n > 0) ui.whoosh();
    view = { focus: i, n: view.n + 1 };
    listeners.forEach((l) => l());
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
};

export function useHubView() {
  return useSyncExternalStore(hubView.subscribe, hubView.get, hubView.get);
}
