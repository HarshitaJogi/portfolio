"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { worlds, type World, type WorldId, type WorldStep } from "@/content/profile";
import { island, useIsland } from "@/world/state";
import { chime } from "@/world/bits";
import { findEgg } from "@/world/eggs";
import { resetJourney, setJourney } from "@/world/scroll";
import { ui } from "@/lib/audio";
import { travelerCheer } from "@/world/traveler";
import { cardUI } from "@/world/cardUI";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/utils";
import { CardShell, Chips, colorOf, Hud, LocalTime, Rich } from "./cards";
import { PopButton } from "./PopButton";
import { getStamps, stamp, usePassport } from "./passportStore";
import { passportUI, StampArt, StampMoment, StampWaiting } from "./Passport";
import { BigCTA } from "./BigCTA";
import { arrive } from "./sfx";

const yearOf = (s: WorldStep) => /\b(20\d\d)\b/.exec(s.kicker)?.[1] ?? "";
const shortOf = (s: WorldStep) => s.short ?? s.title.replace(/\.$/, "");

/** One-line highlights, numbers marked, with a coloured tick. */
function Highlights({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="space-y-1.5">
      {items.map((h) => (
        <li key={h} className="flex items-center gap-2.5 text-[1rem] leading-snug font-bold md:text-[1.0625rem]">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-[2.5px] border-ink" style={{ background: color }} aria-hidden="true">
            <svg viewBox="0 0 12 12" className="h-3 w-3">
              <path d="M2.5 6.2l2.3 2.3 4.7-5" fill="none" stroke="#2b1e1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            <Rich text={h} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The full bullets, folded away behind an obvious button. */
function Details({ items, label }: { items: string[]; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          ui.pop();
        }}
        aria-expanded={open}
        className="group inline-flex items-center gap-2.5 rounded-full border-[3px] border-dashed border-ink bg-white px-4 py-2 text-[1rem] font-extrabold shadow-[3px_3px_0_var(--ink)] transition-colors hover:border-solid hover:bg-[#ffc93c] active:shadow-none"
      >
        <span className={cn("grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-[#fff8ec] text-[1rem] leading-none transition-transform", open && "rotate-45")} aria-hidden="true">
          +
        </span>
        {open ? "Hide the details" : label}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <ul className="space-y-2 pt-3">
              {items.map((b) => (
                <li key={b} className="relative pl-5 text-[1rem] leading-relaxed font-medium before:absolute before:top-[0.7em] before:left-0 before:h-[3px] before:w-2.5 before:rounded-full before:bg-ink md:text-[1.0625rem]">
                  <Rich text={b} />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Small interactive extras some steps have: the review gate, the bells, the pumpkins. */
function Extra({ step }: { step: WorldStep }) {
  const { approved, bells, pumpkins } = useIsland();
  if (step.id === "nokia")
    return (
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <PopButton
          tone={approved ? "green" : "primary"}
          size="md"
          className={approved ? "" : "bg-[#c8102e]! text-[#fff8ec]!"}
          onClick={() => {
            island.set({ approved: !approved });
            if (!approved) {
              chime(880);
              findEgg("approve");
              travelerCheer();
            }
          }}
        >
          {approved ? "Approved ✓" : "APPROVE"}
        </PopButton>
        <span className="font-mono text-[1rem]">{approved ? "Verified. Thanks, human." : step.hint}</span>
      </div>
    );
  if (step.id === "dance")
    return (
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <PopButton
          tone="sun"
          size="md"
          onClick={() => {
            chime(1500);
            setTimeout(() => chime(1850), 90);
            island.set({ bells: bells + 1 });
            findEgg("bells");
          }}
        >
          Ring the bells
        </PopButton>
        {bells > 0 && (
          <span className="font-mono text-[1rem]">
            Rung {bells} {bells === 1 ? "time" : "times"}
          </span>
        )}
      </div>
    );
  if (step.id === "trybud")
    return (
      <p className="mt-5 font-mono text-[1rem]" aria-live="polite">
        {pumpkins >= 5 ? "All five lit. Happy Hack-o-Ween." : `↳ ${step.hint} · ${pumpkins} of 5 lit`}
      </p>
    );
  return step.hint ? <p className="mt-5 font-mono text-[1rem]">↳ {step.hint}</p> : null;
}

function StepBody({ world, step, go, items, copy }: { world: World; step: WorldStep; go: (i: number) => void; items: { s: WorldStep; i: number }[]; copy?: boolean }) {
  const color = colorOf(world.margam);
  const hid = copy ? undefined : `${step.id}-title`;

  if (step.kind === "intro")
    return (
      <>
        <h1 className="font-display mt-3 text-[clamp(2.4rem,4.4vw,4.2rem)] leading-[0.95] tracking-[-0.02em]">{step.title}</h1>
        {step.lede && <p className="mt-3 text-[1.0625rem] leading-snug font-bold md:text-[1.25rem]">{step.lede}</p>}
        <StampSlot world={world} />
        <ol className="mt-6 grid gap-1.5">
          {items.map(({ s, i }, n) => (
            <li key={s.id}>
              <button type="button" onClick={() => (ui.pop(), go(i))} className="group flex w-full items-center gap-3 rounded-2xl border-[2.5px] border-transparent px-2 py-1.5 text-left transition-colors hover:border-ink hover:bg-white/60">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-[2.5px] border-ink font-mono text-[0.9375rem] font-semibold" style={{ background: color }}>
                  {n + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[1rem] font-extrabold md:text-[1.0625rem]">{s.title}</span>
                  {s.subtitle && world.id !== "skills" && <span className="block truncate text-[0.9375rem] font-semibold">{s.subtitle}</span>}
                </span>
                {yearOf(s) && <span className="shrink-0 font-mono text-[1rem]">{yearOf(s)}</span>}
                <span className="shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </button>
            </li>
          ))}
        </ol>
      </>
    );

  if (step.kind === "next")
    return (
      <>
        <h2 id={hid} className="font-display mt-3 text-[clamp(2.2rem,3.8vw,3.6rem)] leading-[0.96] tracking-[-0.02em]">
          {step.title}
        </h2>
        {step.lede && <p className="mt-3 text-[1.0625rem] leading-snug font-semibold md:text-[1.25rem]">{step.lede}</p>}
      </>
    );

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        {step.kicker !== world.label && <p className="font-mono text-[1rem] font-bold md:text-[1.0625rem]">{step.kicker}</p>}
        {step.place && <LocalTime place={step.place} />}
      </div>
      <h2 id={hid} className="font-display mt-2 text-[clamp(1.9rem,3vw,3rem)] leading-[0.98] tracking-[-0.015em]">
        {step.title}
      </h2>
      {step.subtitle && <p className="mt-1.5 text-[1.0625rem] leading-snug font-extrabold md:text-[1.1875rem]">{step.subtitle}</p>}

      {step.facts && (
        <dl className="mt-3 flex flex-wrap gap-2">
          {step.facts.map((f) => (
            <div key={f.label} className="rounded-xl border-[3px] border-ink bg-[#ffc93c] px-3 py-1 shadow-[3px_3px_0_var(--ink)]">
              <dt className="font-mono text-[0.875rem] tracking-[0.06em] uppercase">{f.label}</dt>
              <dd className="font-display text-[1.125rem] leading-tight md:text-[1.25rem]">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {step.lede && (
        <p className="mt-3 text-[1rem] leading-snug font-semibold md:text-[1.0625rem]">
          <Rich text={step.lede} />
        </p>
      )}

      {step.highlights && (
        <div className="mt-3">
          <Highlights items={step.highlights} color={color} />
        </div>
      )}

      {step.used && (
        <div className="mt-4">
          <p className="font-mono text-[0.9375rem] tracking-[0.06em] uppercase">Where I used it</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {step.used.map((u) =>
              u.href ? (
                <PopButton key={u.where} href={u.href} size="sm" tone="secondary" icon="↗">
                  {u.where}
                </PopButton>
              ) : (
                <span key={u.where} className="rounded-full border-2 border-ink px-3 py-1 font-semibold">
                  {u.where}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      {step.chips && <Chips items={step.chips} className="mt-3" />}

      {step.bullets && <Details items={step.bullets} label={step.highlights ? "Read the full details" : "Show the details"} />}
      {step.used && <Details items={step.used.map((u) => `${u.where}: ${u.what}`)} label="How I used each one" />}

      {step.links && (
        <div className="mt-4 flex flex-wrap gap-2.5">
          {step.links.map((l) => (
            <PopButton key={l.href} href={l.href} size="sm" tone={l.primary ? "sun" : "secondary"}>
              {l.label}
            </PopButton>
          ))}
        </div>
      )}
      <Extra step={step} />
    </>
  );
}

/**
 * A step, collapsed: just where and what, as a small card in the middle with an obvious
 * way to open it. Opening it sends the card to the side with everything in it.
 */
function Collapsed({ world, step, n, total, onOpen }: { world: World; step: WorldStep; n: number; total: number; onOpen: () => void }) {
  return (
    <div className="group relative flex w-full items-center gap-4 rounded-[24px] border-[4px] border-ink bg-[#fff8ec] p-4 text-ink shadow-[7px_7px_0_var(--ink)] transition-transform hover:-translate-y-1 md:p-5">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-mono text-[0.875rem] font-bold tracking-[0.06em] uppercase">
          <span className="h-3.5 w-3.5 shrink-0 rounded-full border-[2.5px] border-ink" style={{ background: colorOf(world.margam) }} aria-hidden="true" />
          {world.label} · {n} of {total}
        </p>
        <p className="mt-1 truncate font-mono text-[0.875rem] font-bold md:text-[0.9375rem]">{step.kicker !== world.label ? step.kicker : step.subtitle}</p>
        <h2 id={`${step.id}-title`} className="font-display mt-1 text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1]">
          {step.title}
        </h2>
        {step.subtitle && step.kicker !== world.label && <p className="mt-1 line-clamp-2 text-[0.9375rem] leading-snug font-extrabold md:text-[1rem]">{step.subtitle}</p>}
      </div>
      {/* the whole card is the button; it sits over everything so a tap anywhere opens it */}
      <button type="button" onClick={onOpen} aria-expanded={false} aria-label={`Open the details for ${step.title}`} className="flex shrink-0 flex-col items-center gap-1 rounded-[20px] after:absolute after:inset-0 after:rounded-[20px]">
        <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-ink bg-[#ffc93c] font-display text-[1.6rem] leading-none shadow-[3px_3px_0_var(--ink)] transition-transform group-hover:rotate-90 md:h-14 md:w-14">
          +
        </span>
        <span aria-hidden="true" className="font-mono text-[0.8125rem] font-bold uppercase">Details</span>
      </button>
    </div>
  );
}

/** The stamp this world gives: waiting (dashed) until the last step, then earned. */
function StampSlot({ world }: { world: World }) {
  const stamps = usePassport();
  const got = stamps.find((x) => x.id === world.id);
  return (
    <button
      type="button"
      onClick={() => {
        ui.pop();
        passportUI.open();
      }}
      className={cn(
        "mt-5 flex w-full items-center gap-4 rounded-[22px] border-[3px] border-ink p-3 text-left shadow-[5px_5px_0_var(--ink)] transition-transform hover:-translate-y-0.5 active:shadow-none",
        got ? "bg-[#3bb273]" : "border-dashed bg-[#fff3d6]",
      )}
    >
      <span className={cn("shrink-0 rounded-full bg-[#fff8ec]", got && "-rotate-6")}>
        <StampArt id={world.id} on={got?.on} size={76} faded={!got} />
      </span>
      <span>
        <span className="block font-mono text-[0.875rem] font-bold tracking-[0.08em] uppercase">Passport stamp</span>
        <span className="block font-display text-[1.125rem] leading-tight md:text-[1.3125rem]">{got ? `Stamped ${got.on}` : `Finish ${world.label} to earn it`}</span>
      </span>
    </button>
  );
}

/** The path as dots on a dashed line, on the right. Click any stop to fly there. */
function Rail({ world, active, go }: { world: World; active: number; go: (i: number) => void }) {
  const color = colorOf(world.margam);
  return (
    <>
      <nav aria-label={`${world.label}, steps`} className="fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 lg:block">
        <ol className="relative flex flex-col items-end gap-1">
          <span aria-hidden="true" className="absolute top-3 right-[13px] bottom-3 w-0 border-r-[3px] border-dashed border-ink/60" />
          {world.steps.map((s, i) => {
            const on = i === active;
            const label = s.kind === "intro" ? "Start" : s.kind === "next" ? "Next world" : shortOf(s);
            return (
              <li key={s.id} className="relative">
                <button type="button" onClick={() => go(i)} aria-current={on ? "step" : undefined} aria-label={label} className="group flex items-center gap-2 py-0.5">
                  <span
                    className={cn(
                      "rounded-full border-[3px] border-ink px-2.5 py-0.5 font-mono text-[0.9375rem] font-bold whitespace-nowrap shadow-[2px_2px_0_var(--ink)] transition-all",
                      on ? "bg-ink text-[#fff8ec]" : "bg-[#fff8ec] text-ink opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                    )}
                  >
                    {label}
                  </span>
                  <span
                    className={cn("relative h-[29px] w-[29px] shrink-0 rounded-full border-[3px] border-ink transition-transform", on ? "scale-100" : i < active ? "scale-[0.62]" : "scale-[0.62] bg-[#fff8ec]")}
                    style={on || i < active ? { background: color } : undefined}
                    aria-hidden="true"
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      {/* phones: a segmented strip under the nav, each segment a stop */}
      <div className="fixed inset-x-[var(--gutter)] top-[5rem] z-40 flex gap-1 lg:hidden">
        {world.steps.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => go(i)}
            aria-label={s.kind === "intro" ? "Start" : s.kind === "next" ? "Next world" : shortOf(s)}
            className={cn("h-2.5 flex-1 rounded-full border-2 border-ink transition-colors", i <= active ? "" : "bg-[#fff8ec]/90")}
            style={i <= active ? { background: color } : undefined}
          />
        ))}
      </div>
    </>
  );
}

/**
 * A world, one step at a time. Big Next and Back buttons, arrow keys, swipes, the rail,
 * and the URL hash all move the same step. Nothing depends on scrolling.
 */
export function WorldPage({ id }: { id: WorldId }) {
  const world = worlds[id];
  const steps = world.steps;
  const [active, setActive] = useState(0);
  const [nudge, setNudge] = useState(false);
  const [stamped, setStamped] = useState(false);
  const [moved, setMoved] = useState(false);
  const [open, setOpen] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const reduced = useReducedMotion();
  const activeRef = useRef(0);
  const items = steps.map((s, i) => ({ s, i })).filter(({ s }) => s.kind === "item");
  const total = items.length;

  const go = useCallback(
    (i: number) => {
      const n = Math.min(Math.max(i, 0), steps.length - 1);
      if (n === activeRef.current) return;
      activeRef.current = n;
      setActive(n);
      setMoved(true);
      setJourney(n);
      const s = steps[n];
      history.replaceState(null, "", window.location.pathname + window.location.search + (n === 0 ? "" : `#${s.id}`));
      if (s.kind === "next" && stamp(world.id)) {
        setStamped(true);
        travelerCheer();
      }
    },
    [steps, world.id],
  );

  // Start where the hash says (/experience#nokia), with no flight to get there.
  useEffect(() => {
    const i = steps.findIndex((s) => `#${s.id}` === window.location.hash);
    const start = i > 0 ? i : 0;
    activeRef.current = start;
    resetJourney(start);
    if (start) {
      const r = requestAnimationFrame(() => setActive(start));
      return () => cancelAnimationFrame(r);
    }
  }, [steps]);

  // First time in a world without its stamp: say there is one to collect, once the door opens.
  useEffect(() => {
    const key = `hj-seen-${world.id}`;
    let seen = false;
    try {
      seen = localStorage.getItem(key) === "1";
    } catch {
      /* fine */
    }
    if (seen || getStamps().some((x) => x.id === world.id)) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(key, "1");
      } catch {
        /* fine */
      }
      setWaiting(true);
      ui.sparkle();
    }, 1900);
    return () => window.clearTimeout(t);
  }, [world.id]);

  // Keys, swipes, and a nudge toward the Next button for anyone who tries to scroll.
  useEffect(() => {
    let nudgeOff = 0;
    let lastWheel = 0;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, [contenteditable], dialog, [cmdk-root]")) return;
      if (["ArrowRight", "ArrowDown", "PageDown"].includes(e.key)) {
        e.preventDefault();
        go(activeRef.current + 1);
      }
      if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(activeRef.current - 1);
      }
      if (e.key === "Home") go(0);
      if (e.key === "End") go(steps.length - 1);
    };
    let sx = 0;
    let sy = 0;
    const onStart = (e: TouchEvent) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 70 && Math.abs(dy) < 60) go(activeRef.current + (dx < 0 ? 1 : -1));
    };
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest(".card-scroll")) return;
      const now = performance.now();
      if (Math.abs(e.deltaY) < 20 || now - lastWheel < 1200) return;
      lastWheel = now;
      setNudge(true);
      window.clearTimeout(nudgeOff);
      nudgeOff = window.setTimeout(() => setNudge(false), 1600);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("wheel", onWheel);
      window.clearTimeout(nudgeOff);
    };
  }, [go, steps.length]);

  const step = steps[active];
  const nextStep = steps[active + 1];
  const nItem = items.findIndex((x) => x.i === active) + 1;
  const nextLink = step.kind === "next" ? step.links?.find((l) => l.primary) : undefined;

  // what the big button says and does, at every step: one word, never the next section's name
  const cta =
    step.kind === "intro"
      ? { kicker: `${total} stops ahead`, label: "Start", onClick: () => go(1) }
      : step.kind === "next" && nextLink
        ? { kicker: nextLink.href === "/#contact" ? "Tour complete" : "Next world", label: nextLink.href === "/#contact" ? "Say hello" : "Continue", href: nextLink.href }
        : nextStep?.kind === "next"
          ? { kicker: `Stop ${nItem} of ${total}`, label: "Finish", onClick: () => go(active + 1) }
          : { kicker: `Stop ${nItem} of ${total}`, label: "Next", onClick: () => go(active + 1) };
  const back = active === 0 ? { label: "Island", href: "/" } : { label: "Back", onClick: () => go(active - 1) };
  // intro and finish cards are always open; a stop opens on request and stays open for the rest of the walk
  const side = step.kind !== "item" || open;
  useEffect(() => {
    cardUI.open = side;
  }, [side]);
  useEffect(
    () => () => {
      cardUI.open = false;
    },
    [],
  );
  const toggle = (o: boolean) => {
    ui.pop();
    if (o) ui.whoosh();
    setMoved(true);
    setOpen(o);
  };

  return (
    <>
      <main
        id="main"
        className={cn(
          "pointer-events-none fixed inset-0 z-10 flex px-[var(--gutter)] pt-32 pb-[8.5rem] md:pb-0",
          side ? "items-end md:items-center md:pt-28" : "items-end justify-center md:items-start md:pt-[7.5rem]",
        )}
      >
        <motion.div layout transition={{ type: "spring", stiffness: 210, damping: 24 }} className={cn("pointer-events-auto w-full", side ? "md:w-[min(40vw,36rem)]" : "md:w-[min(44vw,34rem)]")}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={step.id + (side ? ":open" : ":closed")}
              id={step.id}
              aria-labelledby={step.kind === "intro" ? undefined : `${step.id}-title`}
              initial={reduced || !moved ? false : { opacity: 0, y: 40, rotate: active % 2 ? 2 : -2, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, transition: { duration: 0.16, ease: "easeIn" } }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              onAnimationComplete={(def) => {
                if (moved && typeof def === "object" && "opacity" in def && (def as { opacity: number }).opacity === 1) arrive();
              }}
            >
              {side ? (
                <CardShell className="flex max-h-[min(50svh,36rem)] flex-col md:max-h-[calc(100svh-16rem)]">
                  <div className="card-scroll min-h-0 flex-1 overflow-y-auto p-5 md:p-7">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <Hud margam={world.margam} right={step.kind === "item" ? `${nItem} / ${total}` : undefined}>
                          {step.kind === "intro" || step.kind === "next" ? step.kicker : world.label}
                        </Hud>
                      </div>
                      {step.kind === "item" && (
                        <button
                          type="button"
                          onClick={() => toggle(false)}
                          aria-label="Collapse the details"
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-[#fff8ec] font-display text-[1.4rem] leading-none shadow-[3px_3px_0_var(--ink)]"
                        >
                          −
                        </button>
                      )}
                    </div>
                    <StepBody world={world} step={step} go={go} items={items} />
                  </div>
                </CardShell>
              ) : (
                <Collapsed world={world} step={step} n={nItem} total={total} onOpen={() => toggle(true)} />
              )}
            </motion.section>
          </AnimatePresence>
          {/* every step in the HTML, for search engines and the text-only crowd */}
          <div hidden>
            {steps.map((s) => (
              <StepBody key={s.id} world={world} step={s} go={go} items={items} copy />
            ))}
          </div>
        </motion.div>
      </main>
      <BigCTA {...cta} back={back} idleKey={step.id} nudge={nudge} />
      <Rail world={world} active={active} go={go} />
      {stamped && <StampMoment id={world.id} onDone={() => setStamped(false)} />}
      {waiting && (
        <StampWaiting
          id={world.id}
          onClose={() => {
            ui.pop();
            setWaiting(false);
          }}
        />
      )}
    </>
  );
}
