"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import BellToggle from "@/components/bits/BellToggle";

/** Theme switch as a ghungroo (ankle bells). Rings once on press. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <span className="inline-block h-8 w-[5.5rem]" aria-hidden="true" />;

  const dark = resolvedTheme === "dark";
  return (
    <BellToggle
      size="sm"
      offLabel="Light"
      onLabel="Dark"
      label="Dark theme"
      pressed={dark}
      onChange={(on) => setTheme(on ? "dark" : "light")}
      color="var(--ink)"
      background="transparent"
      onColor="var(--ink)"
      onBackground="transparent"
      badge={false}
      waves={false}
      ringAmplitude={12}
      ringPasses={4}
    />
  );
}
