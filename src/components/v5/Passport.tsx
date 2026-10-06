"use client";

import { useEffect, useRef, useState } from "react";
import { worldOrder, worlds, type WorldId } from "@/content/profile";
import { cn } from "@/lib/utils";
import { colorOf } from "./cards";
import { PopButton } from "./PopButton";
import { usePassport } from "./passportStore";
import { fanfare, thud } from "./sfx";
import { ui } from "@/lib/audio";
import { burst, confettiRain, shake } from "./juice";

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
    <svg viewBox="0 0 100 100" width={size} height={size} className={cn(faded && "opacity-75 saturate-[.55]")} style={{ color }} aria-hidden="true">
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
    // the stamp lands at 330 ms: sound, rays, shake and confetti all on that beat
    const a = window.setTimeout(() => {
      thud();
      burst(window.innerWidth / 2, window.innerHeight / 2, 2.8);
      shake(1.4);
      if (all) {
        window.setTimeout(fanfare, 250);
        confettiRain(110);
      }
    }, 330);
    const b = window.setTimeout(onDone, all ? 2600 : 1900);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [onDone, all]);
  return (
    <div className="pointer-events-auto fixed inset-0 z-[65] cursor-pointer bg-ink/35 motion-safe:animate-[overlay-in_0.25s_ease-out_both]" onClick={onDone} role="status" aria-live="polite">
      <div className="absolute top-1/2 left-1/2 flex flex-col items-center" style={{ animation: "stamp-in 0.55s cubic-bezier(.2,.9,.3,1.2) both" }}>
        <div className="rounded-full shadow-[8px_8px_0_var(--ink)]">
          <StampArt id={id} on={on} size={280} />
        </div>
        <p className="mt-6 rounded-full border-[4px] border-ink bg-[#ffc93c] px-6 py-2.5 font-display text-[1.375rem] shadow-[5px_5px_0_var(--ink)]">
          {all ? "Passport complete" : `${worlds[id].label} stamped · ${stamps.length} of ${worldOrder.length}`}
        </p>
      </div>
    </div>
  );
}

// the passport dialog can be opened from anywhere: the nav, the home card, a world
let openPassport: () => void = () => {};
export const passportUI = { open: () => openPassport() };

/** All five stamp slots in a row: earned ones in colour, the rest dashed. Opens the passport. */
export function PassportStrip({ compact }: { compact?: boolean }) {
  const stamps = usePassport();
  return (
    <button
      type="button"
      onClick={() => {
        ui.pop();
        passportUI.open();
      }}
      className="group mt-5 flex w-full items-center gap-4 rounded-[22px] border-[3px] border-ink bg-[#fff3d6] p-3 pr-4 text-left shadow-[5px_5px_0_var(--ink)] transition-transform hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
    >
      <span className="flex shrink-0 -space-x-3">
        {worldOrder.map((w, i) => {
          const got = stamps.find((x) => x.id === w);
          return (
            <span key={w} className={cn("rounded-full bg-[#fff8ec] transition-transform group-hover:-translate-y-1", got && "-rotate-6")} style={{ transitionDelay: `${i * 40}ms` }}>
              <StampArt id={w} on={got?.on} size={compact ? 44 : 54} faded={!got} />
            </span>
          );
        })}
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[0.875rem] font-bold tracking-[0.08em] uppercase">Your passport · {stamps.length} of {worldOrder.length}</span>
        <span className="block font-display text-[1.0625rem] leading-tight md:text-[1.1875rem]">{stamps.length >= worldOrder.length ? "Every world stamped" : "Finish a world to earn its stamp"}</span>
      </span>
    </button>
  );
}

/** The first time you walk into a world: there is a stamp here for you. */
export function StampWaiting({ id, onClose }: { id: WorldId; onClose: () => void }) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-[66] grid place-items-center bg-ink/40 px-4 motion-safe:animate-[overlay-in_0.25s_ease-out_both]" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="stamp-waiting">
      <div className="w-full max-w-[30rem] rounded-[30px] border-[4px] border-ink bg-[#fff3d6] p-7 text-center text-ink shadow-[10px_10px_0_var(--ink)] motion-safe:animate-[pop-in_0.5s_cubic-bezier(.2,.9,.3,1.3)_both]" onClick={(e) => e.stopPropagation()}>
        <p className="font-mono text-[0.9375rem] font-bold tracking-[0.12em] uppercase">Your passport</p>
        <div className="mt-4 flex justify-center motion-safe:animate-[cta-nudge_1.8s_ease-in-out_0.6s_infinite]">
          <StampArt id={id} size={170} faded />
        </div>
        <h2 id="stamp-waiting" className="font-display mt-4 text-[2rem] leading-tight md:text-[2.4rem]">
          A stamp to collect
        </h2>
        <p className="mt-2 text-[1.125rem] font-bold md:text-[1.25rem]">Walk {worlds[id].label} to the end and this stamp is yours. Collect all five.</p>
        <div className="mt-6 flex justify-center">
          <PopButton size="lg" icon="→" onClick={onClose}>
            Let&apos;s go
          </PopButton>
        </div>
      </div>
    </div>
  );
}

/** The passport pill in the nav, and the passport itself when opened. */
export function PassportPill() {
  const stamps = usePassport();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    openPassport = () => setOpen(true);
    return () => {
      openPassport = () => {};
    };
  }, []);
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
        aria-label={`Passport, ${stamps.length} of ${worldOrder.length} stamps`}
        className="inline-flex h-12 items-center gap-2 rounded-full border-[3px] border-ink bg-[#fff8ec] px-3 font-display sm:px-4 text-[1.125rem] text-ink shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        aria-haspopup="dialog"
      >
        <span className="flex -space-x-1.5 max-sm:-space-x-2.5" aria-hidden="true">
          {worldOrder.map((w) => {
            const got = stamps.some((s) => s.id === w);
            return <span key={w} className={cn("h-4 w-4 rounded-full border-2 border-ink", !got && "bg-[#fff8ec]")} style={got ? { background: colorOf(worlds[w].margam) } : undefined} />;
          })}
        </span>
        <span className="hidden sm:inline">Passport</span>
        <span className="font-mono text-[1rem] font-bold">
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
          <p className="font-mono text-[0.9375rem] tracking-[0.06em] uppercase">Your passport</p>
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
