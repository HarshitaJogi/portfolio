"use client";

import { useEffect, useRef, useState } from "react";
import { margam } from "@/content/profile";
import { markMargamSeen } from "@/lib/margam";
import { cn } from "@/lib/utils";

const N = margam.length;
// Each part of the recital wears the colour of the band it was on this page.
const COLOR: Record<string, string> = {
  alarippu: "var(--ink)",
  jatiswaram: "var(--green)",
  shabdam: "var(--red)",
  varnam: "var(--pink)",
  padam: "var(--indigo)",
  tillana: "var(--marigold)",
  mangalam: "var(--teal)",
};
const TIP = 0.62;

/**
 * The payoff. The page line you have followed since the hero loops once around this
 * circle, and each part of the recital lights as the line passes it. Tillana and
 * Mangalam stay dashed until you actually reach Contact and the footer: still ahead.
 */
export function MargamMap() {
  const box = useRef<HTMLDivElement>(null);
  const [r, setR] = useState(200);
  const [f, setF] = useState(0);
  const [ahead, setAhead] = useState({ tillana: false, mangalam: false });
  const [active, setActive] = useState(0);
  const chosen = useRef(false);

  // Radius: the circle starts at the rail and must fit the column.
  useEffect(() => {
    const el = box.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setR(Math.round(Math.max(130, Math.min(210, el.clientWidth / 2 - 4))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Loop progress follows the page line's pen.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const cy = rect.top + rect.height / 2;
      const next = reduced ? 1 : Math.min(1, Math.max(0, (window.innerHeight * TIP - cy) / (2 * r)));
      setF(next);
      if (next > 0.25) markMargamSeen();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [r]);

  // The last two parts are only "seen" once the reader gets there.
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        if (e.target.id === "contact") setAhead((a) => ({ ...a, tillana: true }));
        if (e.target.id === "footer") setAhead((a) => ({ ...a, mangalam: true }));
      });
    });
    ["contact", "footer"].forEach((id) => {
      const t = document.getElementById(id);
      if (t) io.observe(t);
    });
    return () => io.disconnect();
  }, []);

  const lit = (i: number) => {
    const passed = f >= i / N + 0.01 || (i === 0 && f > 0.01);
    if (margam[i].id === "tillana") return passed && ahead.tillana;
    if (margam[i].id === "mangalam") return passed && ahead.mangalam;
    return passed;
  };

  // Follow the pen until the reader picks a point themselves.
  const litCount = margam.filter((_, i) => lit(i)).length;
  useEffect(() => {
    if (!chosen.current && litCount > 0) setActive(Math.min(litCount - 1, N - 1));
  }, [litCount]);

  const pick = (i: number) => {
    chosen.current = true;
    setActive(i);
  };

  const sel = margam[active];
  const d = 2 * r;
  const compact = r < 185;

  return (
    <div ref={box} className="relative shrink-0" style={{ width: d, height: d, marginBottom: compact ? "9.5rem" : undefined }}>
      {/* The tala circle draws itself, starting at Alarippu and moving through the recital. */}
      <svg aria-hidden="true" className="absolute inset-0 overflow-visible" width={d} height={d} viewBox={`0 0 ${d} ${d}`}>
        <path d={`M 0 ${r} A ${r} ${r} 0 1 0 ${d} ${r} A ${r} ${r} 0 1 0 0 ${r}`} fill="none" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="4 6" />
        <path
          d={`M 0 ${r} A ${r} ${r} 0 1 0 ${d} ${r} A ${r} ${r} 0 1 0 0 ${r}`}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.25"
          pathLength={1}
          strokeDasharray={`${f.toFixed(4)} 1`}
        />
      </svg>

      <ol aria-label="The margam, in order" className="absolute inset-0">
        {margam.map((m, i) => {
          const a = Math.PI + (i / N) * Math.PI * 2;
          // Rounded so server and browser serialise identical inline styles (WebKit trims precision).
          const q = (n: number) => Math.round(n * 10) / 10;
          const x = q(r + r * Math.cos(a));
          const y = q(r - r * Math.sin(a));
          const lx = q(r + (r - 26) * Math.cos(a));
          const ly = q(r - (r - 26) * Math.sin(a));
          // anchor each label on the side facing the centre, so it never sits on its point
          const tx = q(-50 - 50 * Math.cos(a));
          const ty = q(-50 + 50 * Math.sin(a));
          const on = lit(i);
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => pick(i)}
                onMouseEnter={() => pick(i)}
                onFocus={() => pick(i)}
                aria-pressed={active === i}
                aria-label={`${i + 1}. ${m.name}: ${m.meaning} On this page: ${m.section}.${on ? "" : " Still ahead."}`}
                className="absolute z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                style={{ left: x, top: y }}
              >
                <span
                  className={cn(
                    "block rounded-full border-2 transition-all duration-500",
                    active === i ? "h-7 w-7" : "h-5 w-5",
                    on ? "border-ink" : "border-dashed border-muted bg-paper",
                  )}
                  style={on ? { background: COLOR[m.id] } : undefined}
                />
              </button>
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute font-mono text-[0.6875rem] tracking-[0.06em] uppercase transition-colors duration-500 whitespace-nowrap",
                  active === i ? "text-ink font-bold" : on ? "text-ink" : "text-muted",
                )}
                style={{ left: lx, top: ly, transform: `translate(${tx}%, ${ty}%)` }}
              >
                {m.name}
              </span>
            </li>
          );
        })}
      </ol>

      <div
        className={cn(
          "pointer-events-none grid place-items-center",
          compact ? "absolute top-full right-0 left-0 mt-8 place-items-start" : "absolute inset-0",
        )}
      >
        <div className={cn(compact ? "text-left" : "max-w-[62%] text-center")} aria-live="polite">
          <p className="font-mono text-[0.6875rem] tracking-[0.08em] text-muted uppercase">
            {active + 1} of {N}
            {!lit(active) && " · still ahead"}
          </p>
          <p className="mt-1 text-[clamp(1.5rem,1.2rem+1vw,2rem)] leading-none font-semibold tracking-[-0.03em]">{sel.name}</p>
          <p className="mt-2 text-[0.875rem] leading-snug text-muted">{sel.meaning}</p>
          <a href={sel.href} className="link pointer-events-auto mt-3 inline-block text-[0.875rem]">
            On this page: {sel.section}
          </a>
        </div>
      </div>
    </div>
  );
}
