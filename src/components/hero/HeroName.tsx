"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useLayoutEffect, useRef, useState } from "react";
import { useFinePointer, useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/utils";

// Tech Text only loads for desktop pointers. Phones keep the plain heading.
const TechText = dynamic(() => import("@/components/bits/TechText"), { ssr: false });

const PAD = 48; // room around the name for Tech Text's glyph labels

type Fit = { x: number; baseline: number; size: number; family: string; weight: number; ink: string; accent: string };

/**
 * The name is a real <h1>, painted first (it is the LCP element). On desktop, Tech Text
 * takes over once its glyphs are ready: hover a letter and its dashed construction
 * lines and metrics show through. The engineering under the surface.
 */
export function HeroName({ name }: { name: string }) {
  const h1 = useRef<HTMLHeadingElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const [fit, setFit] = useState<Fit | null>(null);
  const [ready, setReady] = useState(false);

  const enabled = fine && !reduced;

  useLayoutEffect(() => {
    if (!enabled) {
      setFit(null);
      setReady(false);
      return;
    }
    const el = h1.current;
    const p = probe.current;
    if (!el || !p) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      const size = parseFloat(cs.fontSize);
      const root = getComputedStyle(document.documentElement);
      // Only take over when the name sits on one line.
      if (el.offsetHeight > size * 1.4) {
        setFit(null);
        return;
      }
      setFit({
        x: PAD,
        baseline: p.offsetTop + PAD,
        size,
        family: cs.fontFamily,
        weight: Number(cs.fontWeight) || 600,
        ink: root.getPropertyValue("--ink").trim(),
        accent: root.getPropertyValue("--accent").trim(),
      });
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [enabled, resolvedTheme]);

  const live = enabled && fit;

  return (
    <div className="relative">
      <h1
        ref={h1}
        id="hero-name"
        className={cn(
          "text-name text-ink transition-colors duration-300",
          live && ready && "text-transparent",
        )}
      >
        {name}
        <span ref={probe} className="inline-block h-0 w-0 align-baseline" aria-hidden="true" />
      </h1>
      {live && (
        <div
          aria-hidden="true"
          className="absolute transition-opacity duration-300"
          style={{ inset: -PAD, opacity: ready ? 1 : 0 }}
        >
          <TechText
            text={name}
            fontFamily={fit.family}
            fontWeight={fit.weight}
            fontSize={fit.size}
            letterSpacing={-0.045}
            color={fit.ink}
            accentColor={fit.accent}
            layout={{ x: fit.x, baseline: fit.baseline }}
            reveal="letter"
            labels
            selection
            specks={6}
            sweep={false}
            draggable={false}
            dashLength={4}
            dashGap={3}
            strokeWidth={0.9}
            onReady={() => setReady(true)}
          />
        </div>
      )}
    </div>
  );
}
