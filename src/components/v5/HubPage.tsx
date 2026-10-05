"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { hubStops, margamParts, person, type HubStop } from "@/content/profile";
import { island, useIsland } from "@/world/state";
import { chime } from "@/world/bits";
import { findEgg } from "@/world/eggs";
import { ABOVE, hubView, useHubView } from "@/world/hub/view";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/utils";
import { CardShell, Hud } from "./cards";
import { PopButton } from "./PopButton";
import { TravelerPicker } from "./TravelerPicker";

const DISTRICTS = hubStops.slice(1, 7); // education .. contact, indexes 1..6 on the ring
const indexOf = (id: string) => hubStops.findIndex((s) => s.id === id);
const SHORT: Record<string, string> = { education: "Education", skills: "Skills", experience: "Experience", projects: "Projects", offstage: "Off-stage", contact: "Contact" };

function Lines({ lines }: { lines: string[] }) {
  return (
    <ul className="mt-5 space-y-2">
      {lines.map((l) => (
        <li key={l} className="flex gap-3 text-[1.0625rem] leading-snug md:text-[1.25rem]">
          <span className="mt-[0.5em] h-2.5 w-2.5 shrink-0 rotate-45 border-[2.5px] border-ink" aria-hidden="true" />
          <span>{l}</span>
        </li>
      ))}
    </ul>
  );
}

/** The map: who this is, pick a traveler, start the tour. */
function WelcomeCard({ stop }: { stop: HubStop }) {
  return (
    <>
      <div className="card-scroll min-h-0 flex-1 overflow-y-auto p-6 pb-4 md:p-9 md:pb-5">
        <Hud margam={stop.margam}>{stop.hud}</Hud>
        <h1 className="font-display mt-3 text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.02em]">
          Harshita
          <br />
          Jogi
        </h1>
        <p className="mt-3 text-[1.1875rem] leading-snug font-semibold md:text-[1.625rem]">{stop.stat}</p>
        <p className="mt-2 font-mono text-[0.875rem] md:text-[0.9375rem]">{stop.lines?.[0]}</p>
        <p className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border-[3px] border-ink bg-[#3bb273] px-4 py-1.5 text-[0.9375rem] leading-tight font-semibold md:text-[1rem]">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-ink" aria-hidden="true" />
          {person.availability}
        </p>
        <TravelerPicker />
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t-[3px] border-dashed border-ink/40 px-5 py-4 md:px-9 md:py-5">
        <p className="hidden max-w-[15rem] font-mono text-[0.8125rem] leading-snug md:block">Drag to turn the island. Tap any place to visit it.</p>
        <div className="ml-auto flex items-center gap-3">
          <PopButton href="/education" size="xl" icon="→">
            Start the tour
          </PopButton>
        </div>
      </div>
    </>
  );
}

/** One district: what is in this part of the resume, and the door into it. */
function DistrictCard({ stop, i }: { stop: HubStop; i: number }) {
  const { bells } = useIsland();
  const pos = DISTRICTS.findIndex((d) => d.id === stop.id);
  const prev = DISTRICTS[(pos - 1 + DISTRICTS.length) % DISTRICTS.length];
  const next = DISTRICTS[(pos + 1) % DISTRICTS.length];
  const enter = stop.links?.find((l) => l.primary);
  const others = stop.links?.filter((l) => !l.primary) ?? [];
  return (
    <>
      <div className="card-scroll min-h-0 flex-1 overflow-y-auto p-6 pb-4 md:p-9 md:pb-5">
        <Hud margam={stop.margam} right={`${pos + 1} / ${DISTRICTS.length}`}>
          {stop.hud}
        </Hud>
        <h2 id={`${stop.id}-title`} className="font-display mt-3 text-[clamp(2.5rem,4.6vw,4.6rem)] leading-[0.96] tracking-[-0.015em]">
          {stop.headline}
        </h2>
        {stop.stat && <p className="mt-3 text-[1.125rem] leading-snug md:text-[1.375rem]">{stop.stat}</p>}
        {stop.lines && <Lines lines={stop.lines} />}
        {others.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2.5">
            {others.map((l) => (
              <PopButton key={l.href} href={l.href} size="md" tone="secondary">
                {l.label}
              </PopButton>
            ))}
          </div>
        )}
        {stop.id === "offstage" && (
          <button
            type="button"
            onClick={() => {
              chime(1500);
              setTimeout(() => chime(1850), 90);
              island.set({ bells: bells + 1 });
              findEgg("bells");
            }}
            className="mt-4 font-mono text-[0.875rem] underline decoration-2 underline-offset-4"
          >
            Or ring the bells from here
          </button>
        )}
      </div>
      <div className="flex items-center gap-2.5 border-t-[3px] border-dashed border-ink/40 px-5 py-4 md:gap-3 md:px-9 md:py-5">
        <PopButton onClick={() => hubView.focus(-1)} size="md" tone="secondary" back iconLeft="←" label="Back to the map">
          <span className="hidden sm:inline">Map</span>
        </PopButton>
        <span className="hidden gap-2.5 sm:flex">
          <PopButton onClick={() => hubView.focus(indexOf(prev.id))} size="md" tone="secondary" back label={`Previous: ${prev.headline}`}>
            ‹
          </PopButton>
          <PopButton onClick={() => hubView.focus(indexOf(next.id))} size="md" tone="secondary" label={`Next: ${next.headline}`}>
            ›
          </PopButton>
        </span>
        <div className="ml-auto">
          {enter && (
            <PopButton href={enter.href} size="xl" icon={enter.href.startsWith("mailto:") ? undefined : "→"}>
              {enter.label.replace(/ →$/, "").replace(/^Enter /, i === 6 ? "" : "Enter ")}
            </PopButton>
          )}
        </div>
      </div>
    </>
  );
}

/** The view from above: the path wears all seven colours of the recital. */
function AboveCard({ stop }: { stop: HubStop }) {
  return (
    <>
      <div className="card-scroll min-h-0 flex-1 overflow-y-auto p-6 pb-4 md:p-9 md:pb-5">
        <Hud margam={stop.margam}>{stop.hud}</Hud>
        <h2 className="font-display mt-3 text-[clamp(2.5rem,4.6vw,4.6rem)] leading-[0.96] tracking-[-0.015em]">{stop.headline}</h2>
        <p className="mt-3 text-[1.125rem] leading-snug md:text-[1.375rem]">{stop.stat}</p>
        <ol className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2" aria-label="The seven parts of a margam">
          {margamParts.map((m, n) => (
            <li key={m.id} className="flex items-center gap-2.5 text-[1rem] md:text-[1.0625rem]">
              <span className="h-4 w-4 shrink-0 rounded-full border-2 border-ink" style={{ background: m.color }} aria-hidden="true" />
              <span>
                <span className="font-semibold">
                  {n + 1}. {m.name}
                </span>{" "}
                <span className="text-ink/80">{m.meaning}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex items-center gap-3 border-t-[3px] border-dashed border-ink/40 px-5 py-4 md:px-9 md:py-5">
        <PopButton onClick={() => hubView.focus(-1)} size="md" tone="secondary" back iconLeft="←">
          Map
        </PopButton>
        <div className="ml-auto">
          <PopButton href="/education" size="xl" icon="→">
            Start the tour
          </PopButton>
        </div>
      </div>
    </>
  );
}

/**
 * The hub. No scrolling: the island is the map. Drag it, tap a district (or its label),
 * and the card beside it changes. Every card has one big obvious way forward.
 */
export function HubPage() {
  const { focus, n } = useHubView();
  // the opening card (and a deep-linked one) is there at once; later ones spring in
  const moved = n > 1;
  const reduced = useReducedMotion();

  // /#contact and friends open straight onto that district; plain / opens the map
  const synced = useRef(false);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    const i = id ? indexOf(id) : -1;
    hubView.focus(i > 0 && i < 7 ? i : id === "above" ? ABOVE : -1);
    synced.current = true;
  }, []);
  // ...and the hash follows the district, once the first one has been read
  useEffect(() => {
    // skip a stale render: the store may already be ahead of this commit
    if (!synced.current || hubView.get().focus !== focus) return;
    const id = focus === -1 ? "" : focus === ABOVE ? "above" : hubStops[focus]?.id;
    history.replaceState(null, "", id ? `#${id}` : window.location.pathname);
  }, [focus]);

  // arrows walk the districts, Escape goes back to the map
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, dialog, [cmdk-root]")) return;
      const f = hubView.get().focus;
      if (e.key === "Escape") hubView.focus(-1);
      if (e.key === "ArrowRight") hubView.focus(f < 1 || f >= 6 ? 1 : f + 1);
      if (e.key === "ArrowLeft") hubView.focus(f <= 1 || f > 6 ? 6 : f - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const key = focus === -1 ? "map" : focus === ABOVE ? "above" : hubStops[focus].id;
  const stop = focus === -1 ? hubStops[0] : focus === ABOVE ? hubStops[7] : hubStops[focus];

  return (
    <main id="main" className="pointer-events-none fixed inset-0 z-10 flex items-end px-[var(--gutter)] pt-24 pb-3 md:items-center md:pb-0">
      <div className={cn("pointer-events-auto w-full", focus === -1 ? "md:w-[min(44vw,42rem)]" : "md:w-[min(46vw,43rem)]")}>
        <motion.div
          key={key}
          // the first card is there at once (it is the LCP); later ones spring in
          initial={reduced || !moved ? false : { opacity: 0, y: 40, rotate: -1.5, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
        >
          <CardShell className="flex max-h-[min(64svh,42rem)] flex-col md:max-h-[calc(100svh-8.5rem)]">
            {focus === -1 ? <WelcomeCard stop={stop} /> : focus === ABOVE ? <AboveCard stop={stop} /> : <DistrictCard stop={stop} i={focus} />}
          </CardShell>
        </motion.div>
        {focus === -1 && (
          <div className="mt-3 flex justify-end">
            <button type="button" onClick={() => hubView.focus(ABOVE)} className="pointer-events-auto rounded-full border-[3px] border-ink bg-[#fff8ec] px-4 py-1.5 font-mono text-[0.8125rem] shadow-[3px_3px_0_var(--ink)] transition-transform hover:-translate-y-0.5">
              See the island from above
            </button>
          </div>
        )}
      </div>
      {/* every resume section, in reach on phones */}
      <nav aria-label="Island districts" className="pointer-events-auto fixed inset-x-0 top-[4.4rem] z-30 flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 md:hidden">
        {DISTRICTS.map((d) => {
          const i = indexOf(d.id);
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => hubView.focus(i)}
              aria-current={focus === i ? "true" : undefined}
              className={cn("shrink-0 rounded-full border-[2.5px] border-ink px-3 py-1 font-display text-[0.8125rem] shadow-[2px_2px_0_var(--ink)]", focus === i ? "bg-ink text-[#fff8ec]" : "bg-[#fff8ec] text-ink")}
            >
              {SHORT[d.id]}
            </button>
          );
        })}
      </nav>
    </main>
  );
}
