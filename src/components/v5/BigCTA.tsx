"use client";

import { useEffect, useRef, useState } from "react";
import { worldNav } from "@/world/nav";
import { ui } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { burst, centerOf } from "./juice";

type Action = { href?: string; onClick?: () => void };

function act(a: Action, e: React.MouseEvent) {
  a.onClick?.();
  if (!a.href) return;
  const external = a.href.startsWith("http") || a.href.startsWith("mailto:") || a.href.endsWith(".pdf");
  if (external || e.metaKey || e.ctrlKey) return;
  e.preventDefault();
  worldNav.go(a.href);
}

/** Notices when the visitor has gone quiet, so the button can wave at them. */
function useIdle(ms: number, key: string) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let t = window.setTimeout(() => setIdle(true), ms);
    const reset = () => {
      setIdle(false);
      window.clearTimeout(t);
      t = window.setTimeout(() => setIdle(true), ms);
    };
    const evs = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    evs.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      window.clearTimeout(t);
      evs.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [ms, key]);
  return idle;
}

/** A pointing hand, tapping toward the button. */
function Hand() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute -top-14 -left-10 hidden animate-[hand-tap_0.9s_ease-in-out_infinite] md:block">
      <svg viewBox="0 0 64 64" className="h-16 w-16 drop-shadow-[3px_3px_0_#2b1e1a]">
        <path
          d="M26 8c3 0 5 2 5 5v17l3-1c3-1 5 0 6 2l1 1c3-1 5 0 6 2 3-1 6 1 6 4v9c0 9-6 14-14 14h-6c-5 0-8-2-11-6l-9-12c-2-3-1-6 2-7 2-1 4 0 6 2l1 2V13c0-3 2-5 4-5z"
          fill="#fff8ec"
          stroke="#2b1e1a"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/**
 * The one obvious thing to do next. Big, chunky, with a thick base it presses down into,
 * a pulsing ring, and a two-line label: what it is ("Next") and where it goes ("MSCI").
 * It sits in its own corner, apart from the card. If the visitor goes quiet it jumps and
 * a hand taps at it.
 */
export function BigCTA({ kicker, label, back, tone = "#ff6b4a", idleKey = "", inline, nudge, ...a }: Action & { kicker: string; label: string; back?: Action & { label: string }; tone?: string; idleKey?: string; inline?: boolean; nudge?: boolean }) {
  const idle = useIdle(4500, idleKey + label) || Boolean(nudge);
  const btn = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const fire = (e: React.MouseEvent) => {
    ui.pop();
    ui.next();
    const c = btn.current ? centerOf(btn.current) : { x: e.clientX, y: e.clientY };
    burst(c.x, c.y, 1.7);
    act(a, e);
  };
  const Tag = a.href ? "a" : "button";
  return (
    <div className={cn("pointer-events-none flex items-end gap-3 md:gap-4", inline ? "relative w-full" : "fixed inset-x-[var(--gutter)] bottom-4 z-40 md:inset-x-auto md:right-10 md:bottom-9")}>
      {back && (
        <BackButton {...back} />
      )}
      <div className={cn("pointer-events-auto relative flex-1 md:flex-none", idle && "motion-safe:animate-[cta-nudge_1.6s_ease-in-out_infinite]")}>
        {/* the ping ring that keeps saying "here" */}
        <span aria-hidden="true" className="absolute inset-0 rounded-[30px] border-[5px] max-md:hidden motion-safe:animate-[cta-ping_1.9s_ease-out_infinite]" style={{ borderColor: tone }} />
        <Tag
          ref={btn}
          {...(a.href ? { href: a.href } : { type: "button" as const })}
          onClick={fire}
          onMouseEnter={() => ui.tick()}
          className="group relative block w-full rounded-[30px] bg-ink pb-[9px] text-left text-ink no-underline select-none focus-visible:outline-offset-8"
        >
          <span
            className="relative flex -translate-y-[9px] items-center gap-4 rounded-[30px] border-[4px] border-ink px-6 py-3.5 transition-[translate] duration-100 group-hover:-translate-y-[12px] group-active:translate-y-0 md:gap-5 md:px-8 md:py-4"
            style={{ background: tone }}
          >
            {/* gloss */}
            <span aria-hidden="true" className="absolute inset-x-4 top-1.5 h-[38%] rounded-full bg-white/30" />
            <span className="relative min-w-0 flex-1">
              <span className="block font-mono text-[0.8125rem] font-bold tracking-[0.14em] uppercase md:text-[0.875rem]">{kicker}</span>
              <span className="font-display block truncate text-[1.5rem] leading-[1.05] sm:text-[1.75rem] md:text-[2.5rem]">{label}</span>
            </span>
            <span aria-hidden="true" className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full border-[4px] border-ink bg-[#fff8ec] md:h-16 md:w-16">
              <svg viewBox="0 0 24 24" className="h-8 w-8 motion-safe:animate-[arrow-shimmy_0.9s_ease-in-out_infinite]">
                <path d="M4 12h14M12 5l7 7-7 7" fill="none" stroke="#2b1e1a" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
        </Tag>
        {idle && <Hand />}
      </div>
    </div>
  );
}

/** The way back: the same build as the big button, smaller and quieter. */
function BackButton({ label, ...a }: Action & { label: string }) {
  const Tag = a.href ? "a" : "button";
  return (
    <Tag
      {...(a.href ? { href: a.href } : { type: "button" as const })}
      aria-label={label}
      onClick={(e: React.MouseEvent) => {
        ui.back();
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 0.7);
        act(a, e);
      }}
      className="group pointer-events-auto relative block shrink-0 rounded-[24px] bg-ink pb-[7px] text-ink no-underline select-none"
    >
      <span className="relative flex h-[4.75rem] min-w-[4.75rem] -translate-y-[7px] flex-col items-center justify-center rounded-[24px] border-[4px] border-ink bg-[#fff8ec] px-3 transition-[translate] duration-100 group-hover:-translate-y-[9px] group-active:translate-y-0 md:h-[5.5rem] md:min-w-[5.5rem]">
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
          <path d="M20 12H6M12 5l-7 7 7 7" fill="none" stroke="#2b1e1a" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-mono text-[0.6875rem] font-bold tracking-[0.1em] uppercase" aria-hidden="true">
          {label.length > 8 ? "Back" : label}
        </span>
      </span>
    </Tag>
  );
}
