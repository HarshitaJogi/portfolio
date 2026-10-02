"use client";

import { useEffect, useState } from "react";

/** Index of the section whose band crosses the middle of the viewport. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = ids.indexOf(e.target.id);
            if (i >= 0) setActive(i);
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}
