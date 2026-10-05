"use client";

import { useEffect, useRef, useState } from "react";
import { worldOrder, worlds, type WorldId } from "@/content/profile";
import { cn } from "@/lib/utils";
import { colorOf } from "./cards";
import { PopButton } from "./PopButton";
import { usePassport } from "./passportStore";
import { fanfare, thud } from "./sfx";

/** A small glyph for each world, drawn in the stamp's centre. */
function Glyph({ id }: { id: WorldId }) {
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (id) {
    case "education":
      return (
        <g {...s}>
          <path d="M20 44l30-14 30 14-30 14z" />
          <path d="M34 51v12c10 7 22 7 32 0V51" />
          <path d="M80 44v16" />
        </g>
      );
    case "skills":
      return (
        <g {...s}>
          <rect x="24" y="48" width="22" height="18" rx="3" />
          <rect x="54" y="48" width="22" height="18" rx="3" />
          <rect x="39" y="28" width="22" height="18" rx="3" />
        </g>
      );
    case "experience":
      return (
        <g {...s}>
          <path d="M18 54l64-16-10 12 6 12-12-4-8 10-4-12z" />
        </g>
      );
    case "projects":
      return (
        <g {...s}>
          <path d="M50 26c-10 0-17 8-17 17 0 7 4 11 7 14v6h20v-6c3-3 7-7 7-14 0-9-7-17-17-17z" />
          <path d="M42 70h16" />
        </g>
      );
    case "offstage":
      return (
        <g {...s}>
          <path d="M22 40c18 8 38 8 56 0" />
          {[30, 42, 54, 66].map((x) => (
            <circle key={x} cx={x} cy={52} r="5" />
          ))}
        </g>
      );
  }
}

/** A passport stamp: double ring, the world's name around it, its glyph, and the date. */
export function StampArt({ id, on, size = 120, faded }: { id: WorldId; on?: string; size?: number; faded?: boolean }) {
  const color = colorOf(worlds[id].margam);
  const label = worlds[id].label.toUpperCase();
  const pathId = `stamp-arc-${id}`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={cn(faded && "opacity-30")} style={{ color }} aria-hidden="true">
      <defs>
        <path id={pathId} d="M 50 50 m -36 0 a 36 36 0 1 1 72 0 a 36 36 0 1 1 -72 0" />
      </defs>
      <circle cx="50" cy="50" r="46" fill="#fff8ec" stroke="currentColor" strokeWidth="4" strokeDasharray={faded ? "6 5" : undefined} />
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <text fontFamily="var(--font-dela)" fontSize="9" fill="currentColor" letterSpacing="1.4">
        <textPath href={`#${pathId}`} startOffset="0">
          {label} · {label} ·
        </textPath>
      </text>
      <g transform="translate(14 8) scale(0.72)">
        <Glyph id={id} />
      </g>
      {on && (
        <text x="50" y="80" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="6.5" fill="currentColor">
          {on.toUpperCase()}
        </text>
      )}
    </svg>
  );
}

/** The moment a world is finished: the stamp comes down with a thud. */
export function StampMoment({ id, onDone }: { id: WorldId; onDone: () => void }) {
  const stamps = usePassport();
  const all = stamps.length >= worldOrder.length;
  const on = stamps.find((s) => s.id === id)?.on;
  useEffect(() => {
    const a = window.setTimeout(() => (thud(), all && window.setTimeout(fanfare, 300)), 330);
    const b = window.setTimeout(onDone, all ? 2600 : 1900);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [onDone, all]);
  return (
    <div className="pointer-events-auto fixed inset-0 z-[65] cursor-pointer" onClick={onDone} role="status" aria-live="polite">
      <div className="absolute top-1/2 left-1/2 flex flex-col items-center" style={{ animation: "stamp-in 0.55s cubic-bezier(.2,.9,.3,1.2) both" }}>
        <div className="rounded-full shadow-[8px_8px_0_var(--ink)]">
          <StampArt id={id} on={on} size={220} />
        </div>
        <p className="mt-5 rounded-full border-[3px] border-ink bg-[#fff8ec] px-5 py-2 font-display text-[1.125rem] shadow-[4px_4px_0_var(--ink)]">
          {all ? "Passport complete" : `${worlds[id].label} stamped · ${stamps.length} of ${worldOrder.length}`}
        </p>
      </div>
    </div>
  );
}

/** The passport pill in the nav, and the passport itself when opened. */
export function PassportPill() {
  const stamps = usePassport();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  const all = stamps.length >= worldOrder.length;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-full border-[3px] border-ink bg-[#fff8ec] px-3 font-display text-[0.875rem] text-ink shadow-[3px_3px_0_var(--ink)] transition-transform hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        aria-haspopup="dialog"
      >
        <span className="flex -space-x-1.5" aria-hidden="true">
          {worldOrder.map((w) => {
            const got = stamps.some((s) => s.id === w);
            return <span key={w} className={cn("h-3.5 w-3.5 rounded-full border-2 border-ink", !got && "bg-[#fff8ec]")} style={got ? { background: colorOf(worlds[w].margam) } : undefined} />;
          })}
        </span>
        <span className="hidden sm:inline">Passport</span>
        <span className="font-mono text-[0.75rem]">
          {stamps.length}/{worldOrder.length}
        </span>
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        className="m-auto w-[min(94vw,40rem)] rounded-[28px] border-[3px] border-ink bg-[#fff3d6] p-0 text-ink shadow-[8px_8px_0_var(--ink)] backdrop:bg-ink/40"
      >
        <div className="p-6 md:p-8">
          <p className="font-mono text-[0.8125rem] tracking-[0.06em] uppercase">Your passport</p>
          <h2 className="font-display mt-2 text-[2rem] leading-tight md:text-[2.5rem]">{all ? "Every world, stamped." : "Collect a stamp in every world."}</h2>
          <p className="mt-2 text-[1.0625rem]">{all ? "You have seen the whole resume. Thank you for walking it." : "Walk a world to its end and it gets stamped here."}</p>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {worldOrder.map((w) => {
              const got = stamps.find((s) => s.id === w);
              return (
                <li key={w} className="flex flex-col items-center gap-2 text-center">
                  <span className={cn(got && "-rotate-6")}>
                    <StampArt id={w} on={got?.on} size={104} faded={!got} />
                  </span>
                  {got ? (
                    <span className="font-display text-[0.9375rem]">{worlds[w].label}</span>
                  ) : (
                    <PopButton href={`/${w}`} size="sm" tone="secondary" icon="→" onClick={() => setOpen(false)}>
                      {worlds[w].label}
                    </PopButton>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            {all && (
              <PopButton href="/#contact" size="lg" icon="→" onClick={() => setOpen(false)}>
                Get in touch
              </PopButton>
            )}
            <PopButton onClick={() => setOpen(false)} size="md" tone="secondary" back>
              Close
            </PopButton>
          </div>
        </div>
      </dialog>
    </>
  );
}
