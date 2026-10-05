"use client";

import { motion } from "motion/react";
import { worlds, type World, type WorldId, type WorldStep } from "@/content/profile";
import { island, useIsland } from "@/world/state";
import { chime } from "@/world/bits";
import { findEgg } from "@/world/eggs";
import { worldNav } from "@/world/nav";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/utils";
import { CardShell, Chips, colorOf, Hud, LinkRow, LocalTime, Rich } from "./cards";
import { useStepProgress } from "./useStepProgress";

const yearOf = (s: WorldStep) => /\b(20\d\d)\b/.exec(s.kicker)?.[1] ?? "";
const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 text-[0.9688rem] leading-relaxed md:text-[1.0313rem]">
      {items.map((b) => (
        <li key={b} className="relative pl-5 before:absolute before:top-[0.72em] before:left-0 before:h-[3px] before:w-2.5 before:rounded-full before:bg-ink">
          <Rich text={b} />
        </li>
      ))}
    </ul>
  );
}

/** Small interactive extras some steps have: the review gate, the bells, the pumpkins. */
function Extra({ step }: { step: WorldStep }) {
  const { approved, bells, pumpkins } = useIsland();
  if (step.id === "nokia")
    return (
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            island.set({ approved: !approved });
            if (!approved) {
              chime(880);
              findEgg("approve");
            }
          }}
          className={cn(
            "inline-flex h-12 items-center rounded-full border-[3px] border-ink px-6 font-display text-[1rem] shadow-[4px_4px_0_var(--ink)] transition-transform active:translate-y-0.5",
            approved ? "bg-[#3bb273] text-ink" : "bg-[#c8102e] text-[#fff8ec]",
          )}
          aria-pressed={approved}
        >
          {approved ? "Approved ✓" : "APPROVE"}
        </button>
        <span className="font-mono text-[0.8125rem]">{approved ? "Verified. Thanks, human." : step.hint}</span>
      </div>
    );
  if (step.id === "dance")
    return (
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            chime(1500);
            setTimeout(() => chime(1850), 90);
            island.set({ bells: bells + 1 });
            findEgg("bells");
          }}
          className="inline-flex h-12 items-center rounded-full border-[3px] border-ink bg-[#ffc93c] px-6 font-display text-[1rem] shadow-[4px_4px_0_var(--ink)] active:translate-y-0.5"
        >
          Ring the bells
        </button>
        {bells > 0 && <span className="font-mono text-[0.8125rem]">Rung {bells} {bells === 1 ? "time" : "times"}</span>}
      </div>
    );
  if (step.id === "trybud")
    return (
      <p className="mt-5 font-mono text-[0.8125rem]" aria-live="polite">
        {pumpkins >= 5 ? "All five lit. Happy Hack-o-Ween." : `↳ ${step.hint} · ${pumpkins} of 5 lit`}
      </p>
    );
  return step.hint ? <p className="mt-5 font-mono text-[0.8125rem]">↳ {step.hint}</p> : null;
}

function StepCard({ world, step, n, total }: { world: World; step: WorldStep; n: number; total: number }) {
  const items = world.steps.filter((s) => s.kind === "item");

  if (step.kind === "intro")
    return (
      <CardShell className="p-7 md:p-10">
        <Hud margam={world.margam}>{step.kicker}</Hud>
        <h1 className="font-display mt-4 text-[clamp(2.8rem,6vw,5.75rem)] leading-[0.95] tracking-[-0.02em]">{step.title}</h1>
        {step.lede && <p className="mt-4 text-[1.125rem] leading-snug font-semibold md:text-[1.375rem]">{step.lede}</p>}
        <ol className="mt-6 space-y-1.5">
          {items.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => (e.preventDefault(), scrollTo(s.id))}
                className="group flex items-baseline gap-3 rounded-lg py-1 text-[1rem] no-underline md:text-[1.0625rem]"
              >
                <span className="w-6 shrink-0 font-mono text-[0.8125rem] text-ink/80">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-semibold underline decoration-transparent decoration-2 underline-offset-4 transition-colors group-hover:decoration-ink">{s.title}</span>
                {s.subtitle && world.id !== "skills" && <span className="hidden truncate text-ink/70 sm:inline">{s.subtitle}</span>}
                {yearOf(s) && <span className="ml-auto shrink-0 font-mono text-[0.8125rem]">{yearOf(s)}</span>}
              </a>
            </li>
          ))}
        </ol>
        {step.hint && (
          <p className="mt-6 flex items-center gap-2 font-mono text-[0.8125rem]">
            <span aria-hidden="true" className="inline-block animate-bounce">
              ↓
            </span>
            {step.hint}
          </p>
        )}
      </CardShell>
    );

  if (step.kind === "next")
    return (
      <CardShell className="p-7 md:p-10">
        <Hud margam={world.margam}>{step.kicker}</Hud>
        <h2 id={`${step.id}-title`} className="font-display mt-4 text-[clamp(2.4rem,5vw,4.75rem)] leading-[0.96] tracking-[-0.02em]">
          {step.title}
        </h2>
        {step.lede && <p className="mt-4 text-[1.0625rem] leading-snug md:text-[1.25rem]">{step.lede}</p>}
        {step.links && <LinkRow links={step.links} className="mt-7" />}
      </CardShell>
    );

  return (
    <CardShell className="p-6 md:p-8">
      <Hud margam={world.margam} right={`${n} / ${total}`}>
        {world.label}
      </Hud>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="font-mono text-[0.8125rem] font-medium md:text-[0.875rem]">{step.kicker}</p>
        {step.place && <LocalTime place={step.place} />}
      </div>
      <h2 id={`${step.id}-title`} className="font-display mt-3 text-[clamp(2rem,3.6vw,3.4rem)] leading-[0.98] tracking-[-0.015em]">
        {step.title}
      </h2>
      {step.subtitle && <p className="mt-2 text-[1.0625rem] leading-snug font-semibold md:text-[1.25rem]">{step.subtitle}</p>}

      {step.facts && (
        <dl className="mt-4 flex flex-wrap gap-2.5">
          {step.facts.map((f) => (
            <div key={f.label} className="rounded-2xl border-[3px] border-ink bg-[#ffc93c] px-3.5 py-1.5 shadow-[3px_3px_0_var(--ink)]">
              <dt className="font-mono text-[0.6875rem] tracking-[0.06em] uppercase">{f.label}</dt>
              <dd className="font-display text-[1.25rem] leading-tight md:text-[1.5rem]">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {step.lede && (
        <p className="mt-4 text-[1.0313rem] leading-snug md:text-[1.1875rem]">
          <Rich text={step.lede} />
        </p>
      )}

      {step.bullets && (
        <>
          <div className="mt-4 hidden md:block">
            <Bullets items={step.bullets} />
          </div>
          <details className="group mt-4 md:hidden">
            <summary className="inline-flex cursor-pointer list-none items-center gap-2 font-mono text-[0.8125rem] font-medium [&::-webkit-details-marker]:hidden">
              <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-ink text-[0.75rem] transition-transform group-open:rotate-45" aria-hidden="true">
                +
              </span>
              {world.id === "experience" ? "What I did" : world.id === "education" ? "Awards" : "Details"}
            </summary>
            <div className="mt-3">
              <Bullets items={step.bullets} />
            </div>
          </details>
        </>
      )}

      {step.used && (
        <div className="mt-4">
          <p className="font-mono text-[0.75rem] tracking-[0.06em] uppercase">Where I used it</p>
          <ul className="mt-2 space-y-1.5 text-[0.9688rem] leading-snug md:text-[1.0313rem]">
            {step.used.map((u) => (
              <li key={u.where}>
                {u.href ? (
                  <a
                    href={u.href}
                    className="font-semibold underline decoration-2 underline-offset-4"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey) return;
                      e.preventDefault();
                      worldNav.go(u.href!);
                    }}
                  >
                    {u.where}
                  </a>
                ) : (
                  <span className="font-semibold">{u.where}</span>
                )}
                <span className="text-ink/80">: {u.what}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.chips && <Chips items={step.chips} className="mt-4" />}
      {step.links && <LinkRow links={step.links} className="mt-5" />}
      <Extra step={step} />
    </CardShell>
  );
}

/** The path, as a list: where you are, what is next. Click any stop to go there. */
function Rail({ world, active }: { world: World; active: number }) {
  const color = colorOf(world.margam);
  return (
    <>
      <nav aria-label={`${world.label}, steps`} className="fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 lg:block">
        <ol className="relative flex flex-col items-end gap-1">
          {/* the path line behind the dots */}
          <span aria-hidden="true" className="absolute top-3 right-[13px] bottom-3 w-0 border-r-[3px] border-dashed border-ink/60" />
          {world.steps.map((s, i) => {
            const on = i === active;
            const label = s.kind === "intro" ? "Start" : s.kind === "next" ? "Next" : s.title;
            const year = yearOf(s);
            return (
              <li key={s.id} className="relative">
                <button
                  type="button"
                  onClick={() => scrollTo(s.id)}
                  aria-current={on ? "step" : undefined}
                  aria-label={label}
                  className="group flex items-center gap-2 py-0.5"
                >
                  <span
                    className={cn(
                      "rounded-full border-[3px] border-ink px-2.5 py-0.5 font-mono text-[0.75rem] whitespace-nowrap shadow-[2px_2px_0_var(--ink)] transition-all",
                      on ? "bg-ink text-[#fff8ec]" : "bg-[#fff8ec] text-ink opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                    )}
                  >
                    {on ? label : year || label}
                  </span>
                  <span
                    className={cn("relative h-[29px] w-[29px] shrink-0 rounded-full border-[3px] border-ink transition-transform", on ? "scale-100" : "scale-[0.62] bg-[#fff8ec]")}
                    style={on ? { background: color } : undefined}
                    aria-hidden="true"
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      {/* phones: a thin segmented strip under the nav */}
      <div aria-hidden="true" className="fixed inset-x-[var(--gutter)] top-[4.25rem] z-40 flex gap-1 lg:hidden">
        {world.steps.map((s, i) => (
          <span key={s.id} className={cn("h-1.5 flex-1 rounded-full border border-ink transition-colors", i <= active ? "" : "bg-[#fff8ec]/80")} style={i <= active ? { background: color } : undefined} />
        ))}
      </div>
    </>
  );
}

/** A world: an intro, one card per entry in time order, and the way on. */
export function WorldPage({ id }: { id: WorldId }) {
  const world = worlds[id];
  const { bind, active } = useStepProgress();
  const reduced = useReducedMotion();
  const total = world.steps.filter((s) => s.kind === "item").length;
  let n = 0;
  return (
    <>
      <main id="main" className="relative">
        {world.steps.map((s, i) => {
          if (s.kind === "item") n++;
          return (
            <section
              key={s.id}
              id={s.id}
              ref={bind(i)}
              aria-labelledby={s.kind === "intro" ? undefined : `${s.id}-title`}
              className="pointer-events-none relative flex min-h-[100svh] snap-center items-end px-[var(--gutter)] pt-24 pb-6 md:items-center md:pb-0"
            >
              <motion.div
                className="pointer-events-auto w-full md:w-[min(46vw,42rem)]"
                initial={i === 0 || reduced ? false : { y: 70, rotate: i % 2 ? 2 : -2, scale: 0.95 }}
                whileInView={{ y: 0, rotate: 0, scale: 1 }}
                viewport={{ amount: 0.3 }}
                transition={{ type: "spring", stiffness: 170, damping: 18 }}
              >
                <StepCard world={world} step={s} n={n} total={total} />
              </motion.div>
            </section>
          );
        })}
      </main>
      <Rail world={world} active={active} />
    </>
  );
}

