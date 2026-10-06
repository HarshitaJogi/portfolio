"use client";

import { useEffect, useRef, useState } from "react";
import { eggCopy } from "@/content/profile";
import { EGGS, findEgg, useEggs, type EggId } from "@/world/eggs";
import { startParty } from "@/world/party";
import { ui } from "@/lib/audio";
import { burst, confettiRain } from "./juice";
import { cn } from "@/lib/utils";

const ALL = Object.keys(EGGS) as EggId[];
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/** A small egg, drawn, so it never looks like an emoji. */
function EggIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 24" className="h-4 w-3.5 shrink-0" aria-hidden="true">
      <path d="M10 1.5C5.5 1.5 2 9 2 14.5a8 8 0 0 0 16 0C18 9 14.5 1.5 10 1.5z" fill={filled ? "#ffc93c" : "none"} stroke="currentColor" strokeWidth="2" strokeDasharray={filled ? undefined : "3 2.5"} />
    </svg>
  );
}

/**
 * The easter-egg layer: a toast when one is found, a tracker with hints for the rest,
 * the letter from the bottle, and the cheat code.
 */
export function Eggs() {
  const found = useEggs();
  const [toast, setToast] = useState<EggId | null>(null);
  const [open, setOpen] = useState(false);
  const [letter, setLetter] = useState(false);
  const [party, setParty] = useState(false);
  const seen = useRef<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  // A new find shows a toast. The first render only records what was already found.
  useEffect(() => {
    if (seen.current === null) {
      seen.current = found.length;
      return;
    }
    if (found.length > seen.current) {
      seen.current = found.length;
      const id = found[found.length - 1];
      const show = window.setTimeout(() => {
        setToast(id);
        ui.coin();
        ui.sparkle();
        burst(window.innerWidth / 2, 110, 1.6);
      }, 0);
      const hide = window.setTimeout(() => setToast(null), 3600);
      return () => {
        window.clearTimeout(show);
        window.clearTimeout(hide);
      };
    }
  }, [found]);

  // The bottle in the hub's sea opens the letter.
  useEffect(() => {
    const on = () => setLetter(true);
    window.addEventListener("open-bottle", on);
    return () => window.removeEventListener("open-bottle", on);
  }, []);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (letter && !d.open) d.showModal();
    if (!letter && d.open) d.close();
  }, [letter]);

  // ↑ ↑ ↓ ↓ ← → ← → B A
  useEffect(() => {
    let i = 0;
    let off = 0;
    const on = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = k === KONAMI[i] ? i + 1 : k === KONAMI[0] ? 1 : 0;
      if (i === KONAMI.length) {
        i = 0;
        startParty();
        ui.fanfare();
        confettiRain(90);
        findEgg("konami");
        setParty(true);
        window.clearTimeout(off);
        off = window.setTimeout(() => setParty(false), 2600);
      }
    };
    window.addEventListener("keydown", on);
    return () => {
      window.removeEventListener("keydown", on);
      window.clearTimeout(off);
    };
  }, []);

  return (
    <>
      {/* toast */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4">
        <div
          className={cn(
            "flex items-center gap-3 rounded-full border-[4px] border-ink bg-[#ffc93c] px-5 py-2.5 text-ink shadow-[5px_5px_0_var(--ink)] transition-all duration-300",
            toast || party ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0",
          )}
        >
          {party ? (
            <span className="font-display text-[0.9375rem]">{eggCopy.konami}</span>
          ) : (
            toast && (
              <>
                <EggIcon filled />
                <span className="font-mono text-[0.75rem] tracking-[0.06em] uppercase">{eggCopy.toast}</span>
                <span className="font-display text-[0.9375rem]">{EGGS[toast]}</span>
                <span className="font-mono text-[0.75rem]">
                  {found.length}/{ALL.length}
                </span>
              </>
            )
          )}
        </div>
      </div>

      {/* tracker: appears once the first egg is found */}
      {found.length > 0 && (
        <div className="fixed bottom-5 left-5 z-40 hidden lg:block">
          {open && (
            <div id="egg-list" className="mb-3 w-[19rem] rounded-[20px] border-[3px] border-ink bg-[#fff8ec] p-4 text-ink shadow-[5px_5px_0_var(--ink)]">
              <p className="font-mono text-[0.75rem] tracking-[0.06em] uppercase">
                {eggCopy.label} · {found.length} of {ALL.length}
              </p>
              <ul className="mt-3 space-y-1.5 text-[0.875rem] leading-snug">
                {ALL.map((id) => {
                  const got = found.includes(id);
                  return (
                    <li key={id} className="flex gap-2.5">
                      <span className="mt-0.5">
                        <EggIcon filled={got} />
                      </span>
                      <span className={cn(got ? "font-semibold" : "text-ink/70")}>{got ? EGGS[id] : eggCopy.hints[id]}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="egg-list"
            className="inline-flex h-10 items-center gap-2 rounded-full border-[3px] border-ink bg-[#fff8ec] px-3.5 font-mono text-[0.8125rem] text-ink shadow-[3px_3px_0_var(--ink)] transition-transform hover:-translate-y-0.5"
          >
            <EggIcon filled />
            {found.length}/{ALL.length}
            <span className="sr-only">easter eggs found, show the list</span>
          </button>
        </div>
      )}

      {/* the letter from the bottle */}
      <dialog
        ref={dialog}
        onClose={() => setLetter(false)}
        onClick={(e) => e.target === e.currentTarget && setLetter(false)}
        className="m-auto w-[min(92vw,30rem)] rounded-[24px] border-[3px] border-ink bg-[#fff3d6] p-0 text-ink shadow-[8px_8px_0_var(--ink)] backdrop:bg-ink/40"
      >
        <div className="p-7">
          <p className="font-mono text-[0.75rem] tracking-[0.06em] uppercase">{eggCopy.bottle.title}</p>
          <div className="mt-4 space-y-3 text-[1.0625rem] leading-relaxed">
            {eggCopy.bottle.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
          <p className="mt-5 font-display text-[1.25rem]">{eggCopy.bottle.sign}</p>
          <button
            type="button"
            onClick={() => setLetter(false)}
            className="mt-6 inline-flex h-11 items-center rounded-full border-[3px] border-ink bg-[#ff6b4a] px-5 font-display text-[0.9375rem] shadow-[3px_3px_0_var(--ink)]"
          >
            Back in the sea
          </button>
        </div>
      </dialog>
    </>
  );
}
