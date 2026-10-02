"use client";

import { useSyncExternalStore } from "react";

/**
 * Has the reader reached the margam reveal? Persisted for the session and mirrored
 * to html[data-margam="seen"] (set before paint by the inline script in layout).
 */
const listeners = new Set<() => void>();

function read() {
  return typeof document !== "undefined" && document.documentElement.dataset.margam === "seen";
}

export function markMargamSeen() {
  if (read()) return;
  document.documentElement.dataset.margam = "seen";
  try {
    sessionStorage.setItem("margam", "seen");
  } catch {}
  listeners.forEach((l) => l());
}

export function useMargamSeen() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => false,
  );
}
