"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Geo = { w: number; h: number; baseline: number; size: number };

/**
 * Text that acts out the site's rule. `draft` renders as dashed construction outlines.
 * `resolve` starts dashed, then solid ink wipes in as it lands.
 *
 * Progressive: the real text renders normally on the server and stays in the DOM for
 * screen readers. The SVG outline layer replaces it visually only after measuring.
 */
export function DraftText({
  text,
  mode = "draft",
  delay = 0.9,
  className,
  strokeColor = "var(--ink)",
  fillColor = "var(--accent)",
}: {
  text: string;
  mode?: "draft" | "resolve";
  delay?: number;
  className?: string;
  strokeColor?: string;
  fillColor?: string;
}) {
  const wrap = useRef<HTMLSpanElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const reduced = useReducedMotion();
  const inView = useInView(wrap, { once: true, margin: "0px 0px -10% 0px" });

  useLayoutEffect(() => {
    const el = wrap.current;
    const p = probe.current;
    if (!el || !p) return;
    const measure = () => {
      const size = parseFloat(getComputedStyle(el).fontSize) || 16;
      setGeo({ w: el.offsetWidth, h: el.offsetHeight, baseline: p.offsetTop, size });
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  const dash = geo ? `${(geo.size * 0.06).toFixed(2)} ${(geo.size * 0.045).toFixed(2)}` : undefined;
  const sw = geo ? Math.max(0.8, geo.size * 0.018) : 1;
  const solid = mode === "resolve" && (reduced || inView);

  return (
    <span ref={wrap} className={cn("relative inline-block whitespace-nowrap", className)}>
      <span className={geo ? "text-transparent" : undefined}>{text}</span>
      <span ref={probe} className="inline-block h-0 w-0 align-baseline" aria-hidden="true" />
      {geo && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 overflow-visible"
          width={geo.w}
          height={geo.h}
          viewBox={`0 0 ${geo.w} ${geo.h}`}
        >
          <defs>
            <clipPath id={`wipe-${text.replace(/\W/g, "")}`}>
              <motion.rect
                x={-geo.size * 0.2}
                y={-geo.h}
                height={geo.h * 3}
                initial={false}
                animate={{ width: solid ? geo.w + geo.size * 0.4 : 0 }}
                transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
              />
            </clipPath>
          </defs>
          <motion.text
            x={0}
            y={geo.baseline}
            fill="none"
            stroke={mode === "resolve" ? fillColor : strokeColor}
            strokeWidth={sw}
            strokeDasharray={dash}
            strokeLinejoin="round"
            initial={false}
            animate={{ opacity: mode === "resolve" && solid ? 0 : 1 }}
            transition={{ duration: 0.5, delay: reduced ? 0 : delay + 0.6 }}
          >
            {text}
          </motion.text>
          {mode === "resolve" && (
            <text x={0} y={geo.baseline} fill={fillColor} clipPath={`url(#wipe-${text.replace(/\W/g, "")})`}>
              {text}
            </text>
          )}
        </svg>
      )}
    </span>
  );
}
