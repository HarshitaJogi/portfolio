"use client";

import { useSyncExternalStore } from "react";

/**
 * Which traveler the visitor picked, and a "cheer" signal the 3D avatar reacts to.
 * The pick is remembered in this browser only.
 */
export type TravelerKind = "robot" | "cat" | "duck" | "elephant" | "peacock";
const KINDS: TravelerKind[] = ["robot", "cat", "duck", "elephant", "peacock"];
const KEY = "hj-traveler";

let kind: TravelerKind = "robot";
let picked = false;
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const v = localStorage.getItem(KEY) as TravelerKind | null;
    if (v && KINDS.includes(v)) {
      kind = v;
      picked = true;
    }
  } catch {
    /* storage blocked: the robot it is */
  }
}

/** When the avatar last had something to cheer about (performance.now ms). */
export const cheer = { at: -1e9 };
export function travelerCheer() {
  cheer.at = performance.now();
}

export function pickTraveler(k: TravelerKind) {
  load();
  kind = k;
  picked = true;
  try {
    localStorage.setItem(KEY, k);
  } catch {
    /* fine */
  }
  travelerCheer();
  emit();
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

let snap: { kind: TravelerKind; picked: boolean } = { kind, picked };
export function useTraveler() {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      if (snap.kind !== kind || snap.picked !== picked) snap = { kind, picked };
      return snap;
    },
    () => SERVER,
  );
}
const SERVER = { kind: "robot" as TravelerKind, picked: false };
export const travelerKinds = KINDS;

/* ---------- the chooser, and what the traveler says ---------- */

let chooserOpen = false;
const chooserListeners = new Set<() => void>();
export const chooser = {
  open() {
    chooserOpen = true;
    chooserListeners.forEach((l) => l());
  },
  close() {
    chooserOpen = false;
    chooserListeners.forEach((l) => l());
  },
};
export function useChooser() {
  return useSyncExternalStore(
    (cb) => {
      chooserListeners.add(cb);
      return () => chooserListeners.delete(cb);
    },
    () => chooserOpen,
    () => false,
  );
}

/** A line for the traveler's speech bubble, shown until `until` (performance.now ms). */
export const speech = { text: "", until: 0 };
const speechListeners = new Set<() => void>();
export function travelerSay(text: string, ms = 5000) {
  speech.text = text;
  speech.until = performance.now() + ms;
  speechListeners.forEach((l) => l());
}
let speechSnap = { text: "", until: 0 };
export function useSpeech() {
  return useSyncExternalStore(
    (cb) => {
      speechListeners.add(cb);
      return () => speechListeners.delete(cb);
    },
    () => {
      if (speechSnap.text !== speech.text || speechSnap.until !== speech.until) speechSnap = { ...speech };
      return speechSnap;
    },
    () => speechSnap,
  );
}
