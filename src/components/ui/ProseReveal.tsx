"use client";

import { useEffect, useRef } from "react";

/**
 * Prose that resolves as you read it. Adapted from React Bits Scroll Reveal, with one
 * change that matters: words move from muted to ink, never from invisible or blurred,
 * so every word passes WCAG AA at every scroll position. No GSAP.
 */
export function ProseReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const words = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-w]"));
    const n = words.length;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the paragraph top hits 85% of the viewport, 1 when its bottom hits 50%.
      const start = vh * 0.85;
      const end = vh * 0.5;
      const progress = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
      const front = progress * (n + 6);
      for (let i = 0; i < n; i++) {
        const p = Math.min(1, Math.max(0, (front - i) / 6));
        words[i].style.setProperty("--p", p.toFixed(3));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [text]);

  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          data-w=""
          style={{ color: "color-mix(in srgb, var(--ink) calc(var(--p, 1) * 100%), var(--muted))" }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
