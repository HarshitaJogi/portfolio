"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { isLowPower } from "./device";

/**
 * One WebGL context at a time.
 * Every <GLSlot> reports how visible it is. Only the most visible slot mounts its
 * canvas. Everything else shows its static fallback. Leaving the viewport unmounts,
 * which destroys the GL context.
 */
const ratios = new Map<string, number>();
const listeners = new Set<() => void>();
let active: string | null = null;

function elect() {
  let best: string | null = null;
  let bestRatio = 0;
  for (const [id, r] of ratios) {
    if (r > bestRatio) {
      best = id;
      bestRatio = r;
    }
  }
  if (best !== active) {
    active = best;
    listeners.forEach((l) => l());
  }
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function GLSlot({
  id,
  children,
  fallback,
  className,
}: {
  id: string;
  /** The live WebGL piece. Only rendered while this slot holds the context. */
  children: ReactNode;
  /** Static stand-in, always rendered underneath so layout never shifts. */
  fallback: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [allowed, setAllowed] = useState(false);
  const current = useSyncExternalStore(subscribe, () => active, () => null);

  useEffect(() => {
    setAllowed(!isLowPower());
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !allowed) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        ratios.set(id, entry.isIntersecting ? Math.max(entry.intersectionRatio, 0.001) : 0);
        elect();
      },
      { rootMargin: "200px 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      ratios.delete(id);
      elect();
    };
  }, [id, allowed]);

  const live = allowed && current === id;
  return (
    <div ref={ref} className={className} style={{ position: "relative" }}>
      {fallback}
      {live ? <div style={{ position: "absolute", inset: 0 }}>{children}</div> : null}
    </div>
  );
}
