"use client";

import { useEffect, useRef, useState } from "react";
import FlipCard from "@/components/bits/FlipCard";
import { toolkit } from "@/content/profile";
import { useThemeColors } from "@/lib/useThemeColors";

type Card = (typeof toolkit.cards)[number];

function Front({ card, i }: { card: Card; i: number }) {
  return (
    <div className="flex h-full flex-col p-5">
      <span className="font-mono text-[0.75rem] text-accent">{String(i + 1).padStart(2, "0")}</span>
      <span className="font-display mt-2 text-[1.75rem] leading-[1.02]">{card.title}</span>
      <ul className="mt-5 space-y-1.5 text-[0.9375rem] leading-snug">
        {card.skills.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <span className="mt-auto font-mono text-[0.6875rem] tracking-[0.08em] uppercase opacity-60">{toolkit.flipHint} ↻</span>
    </div>
  );
}

function Back({ card }: { card: Card }) {
  return (
    <div className="flex h-full flex-col p-5">
      <span className="font-mono text-[0.6875rem] tracking-[0.08em] uppercase opacity-70">Where I used it</span>
      <dl className="mt-4 space-y-4">
        {card.used.map((u) => (
          <div key={u.where}>
            <dt className="font-mono text-[0.75rem] tracking-[0.06em] uppercase" style={{ color: "var(--accent)" }}>
              {u.where}
            </dt>
            <dd className="mt-1 text-[0.9375rem] leading-snug">{u.what}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Skills as proof, not a tag cloud. Front: the tool. Back: where it was used.
 * Fanned along a shallow arc on wide screens, a snap row everywhere else.
 */
export function ToolkitCards() {
  const colors = useThemeColors();
  const ref = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false);
  const [w, setW] = useState(240);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const cw = el.clientWidth;
      const fan = window.innerWidth >= 1440;
      setWide(fan);
      setW(fan ? Math.min(212, Math.floor((cw - 5 * 14) / 6)) : 248);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = toolkit.cards.length;
  const h = 400;

  return (
    <div ref={ref}>
      {/* Screen readers get both faces as plain text. */}
      <ul className="sr-only">
        {toolkit.cards.map((c) => (
          <li key={c.id}>
            {c.title}: {c.skills.join(", ")}. Where used: {c.used.map((u) => `${u.where}, ${u.what}`).join(". ")}.
          </li>
        ))}
      </ul>
      <div
        className={wide ? "flex justify-between pt-6 pb-10" : "-mx-[var(--gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-6 [scrollbar-width:none]"}
      >
        {toolkit.cards.map((c, i) => {
          const k = i - (n - 1) / 2;
          return (
            <div
              key={c.id}
              className="shrink-0 snap-start"
              style={wide ? { transform: `translateY(${(k * k * 7).toFixed(1)}px) rotate(${(k * 2.6).toFixed(2)}deg)` } : undefined}
            >
              <FlipCard
                width={w}
                height={h}
                radius={10}
                background={colors?.paperDeep ?? "#efe8da"}
                color={colors?.ink ?? "#16130f"}
                tilt={wide}
                tiltMax={6}
                glareOpacity={0.12}
                shadowOpacity={0.12}
                front={<Front card={c} i={i} />}
                back={<Back card={c} />}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
