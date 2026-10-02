"use client";

import { useSyncExternalStore } from "react";

export type View = "story" | "skim";
const listeners = new Set<() => void>();

const read = (): View =>
  typeof document !== "undefined" && document.documentElement.dataset.view === "skim" ? "skim" : "story";

/** Switch Story / Skim. Mirrored to html[data-view] and ?view= so the link is shareable. */
export function setView(view: View) {
  const html = document.documentElement;
  if (view === "skim") html.dataset.view = "skim";
  else delete html.dataset.view;
  const url = new URL(window.location.href);
  if (view === "skim") url.searchParams.set("view", "skim");
  else url.searchParams.delete("view");
  window.history.replaceState(null, "", url);
  window.scrollTo({ top: 0 });
  listeners.forEach((l) => l());
}

export function useView() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => "story" as View,
  );
}
