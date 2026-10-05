"use client";

import { motion } from "motion/react";
import { hubStops, margamParts, person, type HubStop } from "@/content/profile";
import { island, useIsland } from "@/world/state";
import { chime } from "@/world/bits";
import { findEgg } from "@/world/eggs";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/utils";
import { CardShell, Hud, LinkRow } from "./cards";
import { useStepProgress } from "./useStepProgress";

function HubCard({ stop }: { stop: HubStop }) {
  const { bells } = useIsland();
  const welcome = stop.id === "welcome";
  return (
    <CardShell className={welcome ? "p-7 md:p-10" : "p-6 md:p-9"}>
      <Hud margam={stop.margam}>{stop.hud}</Hud>
      {welcome ? (
        <h1 className="font-display mt-4 text-[clamp(3rem,7.4vw,7.25rem)] leading-[0.92] tracking-[-0.02em]">
          Harshita
          <br />
          Jogi
        </h1>
      ) : (
        <h2 id={`${stop.id}-title`} className="font-display mt-4 text-[clamp(2.1rem,4.3vw,4.4rem)] leading-[0.98] tracking-[-0.015em]">
          {stop.headline}
        </h2>
      )}
      {stop.stat && <p className={cn("mt-4 text-[1.0625rem] leading-snug md:mt-5 md:text-[1.375rem]", welcome && "font-semibold md:text-[1.625rem]")}>{stop.stat}</p>}

      {stop.lines &&
        (welcome ? (
          <p className="mt-3 font-mono text-[0.8125rem] md:text-[0.875rem]">{stop.lines[0]}</p>
        ) : (
          <ul className="mt-5 space-y-2 text-[1rem] leading-snug md:text-[1.125rem]">
            {stop.lines.map((l) => (
              <li key={l} className="flex gap-3">
                <span className="mt-[0.55em] h-2 w-2 shrink-0 rotate-45 border-2 border-ink" aria-hidden="true" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        ))}

      {welcome && (
        <p className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border-[3px] border-ink bg-[#3bb273] px-5 py-1.5 text-[0.9375rem] leading-tight font-semibold md:text-[1rem]">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-ink" aria-hidden="true" />
          {person.availability}
        </p>
      )}

      {stop.links && <LinkRow links={stop.links} className="mt-6" />}

      {stop.id === "offstage" && (
        <button
          type="button"
          onClick={() => {
            chime(1500);
            setTimeout(() => chime(1850), 90);
            island.set({ bells: bells + 1 });
            findEgg("bells");
          }}
          className="mt-4 font-mono text-[0.8125rem] underline decoration-2 underline-offset-4"
        >
          Or ring the bells from here
        </button>
      )}

      {stop.hint && (
        <p className="mt-5 flex items-center gap-2 font-mono text-[0.8125rem]">
          <span aria-hidden="true" className={welcome ? "inline-block animate-bounce" : undefined}>
            {welcome ? "↓" : "↳"}
          </span>
          {stop.hint}
        </p>
      )}

      {stop.id === "outro" && (
        <ol className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4" aria-label="The seven parts of a margam">
          {margamParts.map((m, i) => (
            <li key={m.id} className="flex items-center gap-2 text-[0.9375rem]">
              <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-ink" style={{ background: m.color }} aria-hidden="true" />
              <span className="font-semibold">
                {i + 1}. {m.name}
              </span>
            </li>
          ))}
        </ol>
      )}
    </CardShell>
  );
}

/**
 * The hub: a scroll around the island, one card per district. Each district card is a
 * short summary of one resume section, with a door into its world.
 */
export function HubPage() {
  const { bind } = useStepProgress();
  const reduced = useReducedMotion();
  return (
    <main id="main" className="relative">
      {hubStops.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          ref={bind(i)}
          aria-labelledby={s.id === "welcome" ? undefined : `${s.id}-title`}
          className="pointer-events-none relative flex min-h-[100svh] snap-center items-end px-[var(--gutter)] pt-24 pb-6 md:items-center md:pb-0"
        >
          <motion.div
            className={cn("pointer-events-auto w-full md:w-[min(44vw,40rem)]", s.id === "welcome" && "md:w-[min(46vw,44rem)]")}
            // transform only, so the text is readable with or without JS
            initial={i === 0 || reduced ? false : { y: 70, rotate: i % 2 ? 2.5 : -2.5, scale: 0.94 }}
            whileInView={{ y: 0, rotate: 0, scale: 1 }}
            viewport={{ amount: 0.35 }}
            transition={{ type: "spring", stiffness: 170, damping: 17 }}
          >
            <HubCard stop={s} />
          </motion.div>
        </section>
      ))}
    </main>
  );
}
