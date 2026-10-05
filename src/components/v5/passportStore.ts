"use client";

import { useSyncExternalStore } from "react";
import { worldOrder, type WorldId } from "@/content/profile";

/**
 * The passport: one stamp per world, earned by walking it to the end.
 * Remembered in this browser only.
 */
export type Stamp = { id: WorldId; on: string };
const KEY = "hj-passport";
let stamps: Stamp[] = [];
let loaded = false;
const EMPTY: Stamp[] = [];
const listeners = new Set<() => void>();
/** The stamp just earned, for the big thud animation. */
export const fresh = { id: null as WorldId | null };

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (Array.isArray(raw)) stamps = raw.filter((s) => s && worldOrder.includes(s.id));
  } catch {
    /* start empty */
  }
}

export function stamp(id: WorldId) {
  load();
  if (stamps.some((s) => s.id === id)) return false;
  const on = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  stamps = [...stamps, { id, on }];
  fresh.id = id;
  try {
    localStorage.setItem(KEY, JSON.stringify(stamps));
  } catch {
    /* fine */
  }
  listeners.forEach((l) => l());
  return true;
}

export function usePassport() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => {
      load();
      return stamps;
    },
    () => EMPTY,
  );
}

/** Non-React read, for the 3D scene's per-frame code. */
export function getStamps() {
  load();
  return stamps;
}
