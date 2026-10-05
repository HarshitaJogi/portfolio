"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };

/**
 * Mounts its children one per idle slice instead of all at once, so building a scene
 * never blocks the page for long. Each child gets its own Suspense boundary, so a texture
 * still loading never hides the rest. `done` renders once the last child is in.
 */
export function Progressive({ children, done }: { children: ReactNode[]; done?: ReactNode }) {
  const [count, setCount] = useState(1);
  const total = children.length;
  useEffect(() => {
    if (count >= total) return;
    const w = window as IdleWindow;
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setCount((c) => c + 1), { timeout: 250 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setCount((c) => c + 1), 16);
    return () => clearTimeout(t);
  }, [count, total]);
  return (
    <>
      {children.slice(0, count).map((c, i) => (
        <Suspense key={i} fallback={null}>
          {c}
        </Suspense>
      ))}
      {count >= total && done}
    </>
  );
}
