"use client";

import { useSyncExternalStore } from "react";
import { travelerCheer } from "./traveler";

/**
 * Easter eggs hidden around the island and its worlds. Found ones are remembered in this
 * browser only (a per-viewer nicety, so it fails quietly in private windows).
 */
export const EGGS = {
  approve: "Approved the agent's tests",
  bells: "Rang the ghungroo",
  pumpkins: "Lit every pumpkin",
  husky: "Met the husky",
  trolley: "Rang the trolley bell",
  taxi: "Honked a kaali-peeli",
  chai: "Took a chai break",
  bottle: "Found the message in a bottle",
  lamp: "Lit the lamp",
  konami: "Entered the cheat code",
} as const;
export type EggId = keyof typeof EGGS;

const KEY = "hj-eggs";
let found: EggId[] = [];
let loaded = false;
const listeners = new Set<() => void>();
const EMPTY: EggId[] = [];

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (Array.isArray(raw)) found = raw.filter((x): x is EggId => x in EGGS);
  } catch {
    /* storage blocked: start empty */
  }
}

/** The latest find, for the toast. */
export let lastFound: EggId | null = null;

export function findEgg(id: EggId) {
  load();
  if (found.includes(id)) return;
  found = [...found, id];
  lastFound = id;
  travelerCheer();
  try {
    localStorage.setItem(KEY, JSON.stringify(found));
  } catch {
    /* fine */
  }
  listeners.forEach((l) => l());
}

export function useEggs() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => {
      load();
      return found;
    },
    () => EMPTY,
  );
}
