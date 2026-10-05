"use client";

import { useEffect, useRef, useState } from "react";
import { resetJourney, setJourney } from "@/world/scroll";

/**
 * Maps the scroll position to a fractional step: the viewport centre inside section i
 * gives i - 0.5 .. i + 0.5. Feeds the camera, and returns the step in view for the UI.
 */
export function useStepProgress() {
  const sections = useRef<HTMLElement[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      const list = sections.current.filter(Boolean);
      let p = 0;
      for (let i = 0; i < list.length; i++) {
        const top = list[i].offsetTop;
        const h = list[i].offsetHeight;
        if (mid >= top && mid < top + h) {
          p = i + (mid - top) / h - 0.5;
          break;
        }
        if (i === list.length - 1 && mid >= top + h) p = i;
      }
      return Math.min(Math.max(p, 0), Math.max(list.length - 1, 0));
    };
    const update = () => {
      raf = 0;
      const p = measure();
      setJourney(p);
      setActive(Math.round(p));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // a new page starts its camera where the page is, with no glide from the last scene
    const first = measure();
    resetJourney(first);
    setActive(Math.round(first));
    // the browser may still restore scroll or jump to a #hash after mount
    const late = window.setTimeout(on, 120);
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.clearTimeout(late);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  const bind = (i: number) => (el: HTMLElement | null) => {
    if (el) sections.current[i] = el;
  };
  return { bind, active };
}
