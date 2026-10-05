"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

export type ThemeColors = { bg: string; surface: string; surface2: string; paper: string; paperDeep: string; ink: string; muted: string; accent: string; rule: string };

/** Resolved token colours for canvas and WebGL components, which cannot read CSS variables. */
const noop = () => () => {};
let cache: { key: string; colors: ThemeColors } | null = null;

function read(theme: string | undefined): ThemeColors {
  const key = theme ?? "";
  if (cache?.key === key) return cache.colors; // a stable snapshot, as useSyncExternalStore requires
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  const colors = { bg: v("--bg"), surface: v("--surface"), surface2: v("--surface-2"), paper: v("--bg"), paperDeep: v("--surface-2"), ink: v("--ink"), muted: v("--muted"), accent: v("--accent"), rule: v("--line-strong") };
  cache = { key, colors };
  return colors;
}

/** Resolved token colours for canvas and WebGL components, which cannot read CSS variables. */
export function useThemeColors(): ThemeColors | null {
  const { resolvedTheme } = useTheme();
  return useSyncExternalStore(noop, () => read(resolvedTheme), () => null);
}
