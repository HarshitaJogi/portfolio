"use client";

import { useEffect, useRef, useState } from "react";
import { worldNav } from "@/world/nav";
import { ui } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { burst, centerOf, pressBounce, pressHold } from "./juice";

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

/**
 * The one obvious thing to do next. Big, chunky, with a thick base it presses down into,
 * a pulsing ring, and a two-line label: what it is ("Next") and where it goes ("MSCI").
 * It sits in its own corner, apart from the card. If the visitor goes quiet it jumps and
 * a hand taps at it.
 */
export function BigCTA({ kicker, label, back, tone = "#ff6b4a", idleKey = "", inline, nudge, ...a }: Action & { kicker: string; label: string; back?: Action & { label: string }; tone?: string; idleKey?: string; inline?: boolean; nudge?: boolean }) {
  const idle = useIdle(4500, idleKey + label) || Boolean(nudge);
  const btn = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const face = useRef<HTMLSpanElement>(null);
  const release = useRef<(() => void) | null>(null);
  const down = () => {
    if (face.current) release.current = pressHold(face.current, { dx: 0, dy: 9, squash: 0.97 });
  };
  const up = () => {
    release.current?.();
    release.current = null;
  };
  const fire = (e: React.MouseEvent) => {
    // a keyboard press never went down: give it the full press now
    if (!release.current && face.current) pressBounce(face.current, { dx: 0, dy: 9, squash: 0.97, dur: 460 });
    up();
    ui.pop();
    ui.next();
    const c = btn.current ? centerOf(btn.current) : { x: e.clientX, y: e.clientY };
    burst(c.x, c.y, 1.7);
    const external = a.href && (a.href.startsWith("http") || a.href.startsWith("mailto:") || a.href.endsWith(".pdf"));
    if (a.href && !external && !e.metaKey && !e.ctrlKey) e.preventDefault();
    if (external || e.metaKey || e.ctrlKey) return act(a, e);
    window.setTimeout(() => act(a, { preventDefault() {}, metaKey: false, ctrlKey: false } as unknown as React.MouseEvent), 140);
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
          onPointerDown={down}
          onPointerUp={up}
          onPointerLeave={up}
          onPointerCancel={up}
          onMouseEnter={() => ui.tick()}
          data-press="custom"
          className="group relative block w-full rounded-[30px] bg-ink pb-[9px] text-left text-ink no-underline select-none focus-visible:outline-offset-8"
        >
          <span
            ref={face}
            className="relative flex -translate-y-[9px] items-center gap-4 rounded-[30px] border-[4px] border-ink px-6 py-3.5 transition-[translate] duration-100 group-hover:-translate-y-[12px] md:gap-5 md:px-8 md:py-4"
            style={{ background: tone }}
          >
            {/* gloss */}
            <span aria-hidden="true" className="absolute inset-x-4 top-1.5 h-[38%] rounded-full bg-white/30" />
            <span className="relative min-w-0 flex-1">
              <span className="block font-mono text-[0.9375rem] font-bold tracking-[0.12em] uppercase md:text-[1rem]">{kicker}</span>
              <span className="font-display block truncate text-[1.875rem] leading-[1.05] md:text-[2.75rem]">{label}</span>
            </span>
            <span aria-hidden="true" className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full border-[4px] border-ink bg-[#fff8ec] md:h-16 md:w-16">
              <svg viewBox="0 0 24 24" className="h-8 w-8 motion-safe:animate-[arrow-shimmy_0.9s_ease-in-out_infinite]">
                <path d="M4 12h14M12 5l7 7-7 7" fill="none" stroke="#2b1e1a" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
        </Tag>
      </div>
    </div>
  );
}

/** The way back: the same build as the big button, smaller and quieter. */
function BackButton({ label, ...a }: Action & { label: string }) {
  const Tag = a.href ? "a" : "button";
  const face = useRef<HTMLSpanElement>(null);
  const release = useRef<(() => void) | null>(null);
  const up = () => {
    release.current?.();
    release.current = null;
  };
  return (
    <Tag
      data-press="custom"
      onPointerDown={() => {
        if (face.current) release.current = pressHold(face.current, { dx: 0, dy: 7, squash: 0.96 });
      }}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
      {...(a.href ? { href: a.href } : { type: "button" as const })}
      aria-label={label}
      onClick={(e: React.MouseEvent) => {
        if (!release.current && face.current) pressBounce(face.current, { dx: 0, dy: 7, squash: 0.96 });
        up();
        ui.back();
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 0.7);
        if (a.href) e.preventDefault();
        window.setTimeout(() => act(a, { preventDefault() {}, metaKey: false, ctrlKey: false } as unknown as React.MouseEvent), 130);
      }}
      className="group pointer-events-auto relative block shrink-0 rounded-[24px] bg-ink pb-[7px] text-ink no-underline select-none"
    >
      <span ref={face} className="relative flex h-[4.75rem] min-w-[4.75rem] -translate-y-[7px] flex-col items-center justify-center rounded-[24px] border-[4px] border-ink bg-[#fff8ec] px-3 transition-[translate] duration-100 group-hover:-translate-y-[9px] md:h-[5.5rem] md:min-w-[5.5rem]">
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
          <path d="M20 12H6M12 5l-7 7 7 7" fill="none" stroke="#2b1e1a" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-mono text-[1rem] font-bold tracking-[0.08em] uppercase" aria-hidden="true">
          {label.length > 8 ? "Back" : label}
        </span>
      </span>
    </Tag>
  );
}
