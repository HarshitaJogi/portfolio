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
