"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { chooserCopy } from "@/content/profile";
import { AVATARS } from "@/world/avatars/meta";
import { chooser, pickTraveler, travelerSay, useChooser, useTraveler, type TravelerKind } from "@/world/traveler";
import { ui, voices } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { AvatarIcon } from "./avatarIcons";
import { BigCTA } from "./BigCTA";
import { burst, centerOf, confettiRain } from "./juice";

/**
 * The first thing a new visitor sees: pick a traveler. Cards fly in, each one speaks when
 * you hover it, picking one makes it jump and cheer, and the big button takes you to the
 * island with your traveler waving. Comes back from the nav any time.
 */
export function Chooser() {
  const pathname = usePathname();
  const { kind, picked } = useTraveler();
  const open = useChooser();
  const [sel, setSel] = useState<TravelerKind | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const lastVoice = useRef<Record<string, number>>({});
  const first = useRef<HTMLButtonElement>(null);

  const show = open || (pathname === "/" && !picked && !skipped);
  const current = sel ?? (open ? kind : null);
  const meta = AVATARS.find((a) => a.id === current);

  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => first.current?.focus(), 400);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
    // close is stable enough for a key handler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  const speak = (k: TravelerKind) => {
    const now = performance.now();
    if (now - (lastVoice.current[k] ?? 0) < 900) return;
    lastVoice.current[k] = now;
    voices[k]();
  };

  function close(go: boolean) {
    if (go && current) {
      ui.fanfare();
      confettiRain(80);
      pickTraveler(current);
      const name = AVATARS.find((a) => a.id === current)?.name ?? "Bolt";
      setTimeout(() => travelerSay(chooserCopy.hello(name), 7000), 700);
    } else if (!picked) {
      setSkipped(true);
    }
    setLeaving(true);
    setTimeout(() => {
      setLeaving(false);
      setSel(null);
      chooser.close();
    }, 380);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chooser-title"
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#155e6c]/75 px-4 py-6 backdrop-blur-[6px] transition-opacity duration-300 motion-safe:animate-[overlay-in_0.35s_ease-out_0.25s_both]",
        leaving && "opacity-0",
      )}
    >
      <div className={cn("w-full max-w-[64rem] transition-transform duration-300", leaving && "scale-105")}>
        <div className="text-center motion-safe:animate-[pop-in_0.55s_cubic-bezier(.2,.9,.3,1.3)_0.3s_both]">
          <p className="inline-block rounded-full border-[3px] border-ink bg-[#ffc93c] px-4 py-1 font-mono text-[0.8125rem] font-bold tracking-[0.12em] text-ink uppercase shadow-[3px_3px_0_var(--ink)]">{chooserCopy.kicker}</p>
          <h2 id="chooser-title" className="font-display mt-3 text-[clamp(2.1rem,6vw,5rem)] md:mt-4 leading-[0.95] text-[#fff8ec] [text-shadow:4px_4px_0_#2b1e1a,-2px_-2px_0_#2b1e1a,2px_-2px_0_#2b1e1a,-2px_2px_0_#2b1e1a]">
            {chooserCopy.title}
          </h2>
          <p className="mx-auto mt-2 max-w-[36rem] text-[0.9375rem] leading-snug font-semibold text-[#fff8ec] sm:text-[1.0625rem] md:mt-3 md:text-[1.25rem]">{chooserCopy.sub}</p>
        </div>

        <div role="radiogroup" aria-label="Travelers" className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3 md:mt-9 md:grid-cols-5 md:gap-4">
          {AVATARS.map((a, i) => {
            const on = current === a.id;
            return (
              <button
                key={a.id}
                ref={i === 0 ? first : undefined}
                type="button"
                role="radio"
                aria-checked={on}
                onMouseEnter={() => speak(a.id)}
                onFocus={() => speak(a.id)}
                onClick={(e) => {
                  setSel(a.id);
                  voices[a.id]();
                  ui.coin();
                  const c = centerOf(e.currentTarget);
                  burst(c.x, c.y, 1.5);
                }}
                className={cn(
                  "group relative flex flex-col items-center rounded-[22px] border-[4px] border-ink px-2 pt-3 pb-3 text-center md:rounded-[26px] md:px-3 md:pt-5 md:pb-4 text-ink transition-[transform,background-color,box-shadow] duration-150 motion-safe:animate-[pop-in_0.5s_cubic-bezier(.2,.9,.3,1.3)_both] hover:-translate-y-2 hover:-rotate-2 md:pt-5",
                  on ? "-translate-y-2 bg-[#ffc93c] shadow-[8px_8px_0_var(--ink)]" : "bg-[#fff8ec] shadow-[5px_5px_0_var(--ink)]",

                )}
                style={{ animationDelay: `${450 + i * 90}ms` }}
              >
                {on && (
                  <span aria-hidden="true" className="absolute -top-3 -right-3 grid h-10 w-10 place-items-center rounded-full border-[3px] border-ink bg-[#3bb273] text-[1.25rem] font-black motion-safe:animate-[pop-in_0.35s_cubic-bezier(.2,.9,.3,1.4)_both]">
                    ✓
                  </span>
                )}
                <span className="grid h-16 w-16 place-items-center rounded-full border-[4px] border-ink transition-transform duration-200 group-hover:scale-110 sm:h-24 sm:w-24 md:h-28 md:w-28" style={{ background: a.color }}>
                  <AvatarIcon kind={a.id} className="h-13 w-13 sm:h-20 sm:w-20 md:h-24 md:w-24" />
                </span>
                <span className="font-display mt-2 text-[1.125rem] leading-none sm:text-[1.5rem] md:mt-3 md:text-[1.75rem]">{a.name}</span>
                <span className="mt-1 font-mono text-[0.625rem] font-bold tracking-[0.06em] uppercase sm:text-[0.75rem]">{a.species}</span>
                <span className="mt-2 hidden text-[0.875rem] leading-snug font-medium sm:block md:text-[0.9375rem]">{a.line}</span>
              </button>
            );
          })}
        </div>

        <div className="sticky bottom-0 mt-5 flex flex-col items-center gap-3 pt-2 pb-1 md:static md:mt-9 md:gap-4">
          {meta ? (
            <div className="w-full max-w-[30rem] motion-safe:animate-[pop-in_0.4s_cubic-bezier(.2,.9,.3,1.3)_both]">
              <BigCTA inline kicker="Ready" label={`${chooserCopy.go} ${meta.name}`} onClick={() => close(true)} idleKey="chooser" />
            </div>
          ) : (
            <p className="rounded-full border-[3px] border-ink bg-[#fff8ec] px-5 py-2 font-display text-[1.0625rem] text-ink shadow-[4px_4px_0_var(--ink)]">Tap one to pick</p>
          )}
          <button type="button" onClick={() => close(false)} className="font-mono text-[0.875rem] font-bold text-[#fff8ec] underline decoration-2 underline-offset-4">
            {chooserCopy.skip}
          </button>
        </div>
      </div>
    </div>
  );
}
