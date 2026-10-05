"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useInView } from "motion/react";
import WarmTooltip, { WarmTooltipGroup } from "@/components/bits/WarmTooltip";
import { metricOrder, metrics, type Metric, type TrackOrDefault } from "@/content/profile";
import { useThemeColors } from "@/lib/useThemeColors";

const Counter = dynamic(() => import("@/components/bits/Counter"), { ssr: false });

// "98%" → { prefix: "", digits: 98, suffix: "%" }, "$25,000" → { prefix: "$", digits: 25, suffix: ",000" }
function parse(value: string) {
  const m = /^(\D*)(\d+)(.*)$/.exec(value)!;
  return { prefix: m[1], digits: Number(m[2]), suffix: m[3] };
}

function placesFor(n: number) {
  return [...String(n)].map((_, i, a) => 10 ** (a.length - i - 1));
}

/**
 * Plain text on the server and until the strip is on screen. Only then does the
 * Counter (about 30 animated elements per number) mount and roll from its start value.
 */
function MetricValue({ m, roll }: { m: Metric; roll: boolean }) {
  const { prefix, digits, suffix } = parse(m.value);
  const from = m.from ? parse(m.from).digits : 0;
  const [live, setLive] = useState(false);
  const [v, setV] = useState(from);

  useEffect(() => {
    if (!roll) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setLive(true);
    const t = setTimeout(() => setV(digits), 60);
    return () => clearTimeout(t);
  }, [roll, digits]);

  return (
    <span className="text-stat flex h-[2.4rem] items-center leading-none text-ink" aria-hidden="true">
      {prefix}
      {live ? (
        <Counter
          value={v}
          places={placesFor(digits)}
          fontSize={36}
          padding={2}
          gap={0}
          horizontalPadding={0}
          gradientHeight={0}
          fontWeight={600}
          textColor="inherit"
          counterStyle={{ letterSpacing: "-0.04em" }}
        />
      ) : (
        <span className="tabular-nums">{digits}</span>
      )}
      {suffix}
    </span>
  );
}

/** Six numbers, read in one glance. Hover or focus any of them for the one-line story. */
export function MetricsBar({ track }: { track: TrackOrDefault }) {
  const colors = useThemeColors();
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { once: true, margin: "0px 0px -15% 0px" });
  const byId = new Map(metrics.map((m) => [m.id, m]));
  const list = metricOrder[track].map((id) => byId.get(id)!).filter(Boolean);

  return (
    <div ref={box} className="panel grid grid-cols-2 gap-px overflow-hidden bg-line md:grid-cols-3 xl:grid-cols-6">
      <WarmTooltipGroup>
        {list.map((m) => (
          <WarmTooltip key={m.id} content={m.tip} side="top" size="md" surfaceColor={colors?.ink} inkColor={colors?.bg}>
            <a
              href={m.href}
              className="group flex flex-col gap-2 bg-surface p-5 no-underline transition-colors hover:bg-surface-2 md:p-6"
            >
              <MetricValue m={m} roll={inView} />
              <span className="text-[0.875rem] leading-snug text-muted">
                {m.label}
                {m.from && <span className="ml-1.5 font-mono text-[0.75rem] text-muted">from {m.from}</span>}
              </span>
              <span className="text-label text-muted transition-colors group-hover:text-accent">{m.source}</span>
              <span className="sr-only">
                {m.value} {m.label}. {m.tip}
              </span>
            </a>
          </WarmTooltip>
        ))}
      </WarmTooltipGroup>
    </div>
  );
}
