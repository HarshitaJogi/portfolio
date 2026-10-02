"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export type ThemeColors = { paper: string; paperDeep: string; ink: string; muted: string; accent: string; rule: string };

/** Resolved token colours for canvas and WebGL components, which cannot read CSS variables. */
export function useThemeColors(): ThemeColors | null {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<ThemeColors | null>(null);
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const v = (n: string) => cs.getPropertyValue(n).trim();
    setColors({ paper: v("--paper"), paperDeep: v("--paper-deep"), ink: v("--ink"), muted: v("--muted"), accent: v("--accent"), rule: v("--rule-strong") });
  }, [resolvedTheme]);
  return colors;
}
