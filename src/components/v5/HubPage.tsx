"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { chooserCopy, hubStops, margamParts, media, person, type HubStop } from "@/content/profile";
import { island, useIsland } from "@/world/state";
import { chime } from "@/world/bits";
import { findEgg } from "@/world/eggs";
import { ABOVE, hubView, useHubView } from "@/world/hub/view";
import { chooser, useTraveler } from "@/world/traveler";
import { AVATARS } from "@/world/avatars/meta";
import { ui } from "@/lib/audio";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/utils";
import { CardShell, Hud } from "./cards";
import { PopButton } from "./PopButton";
import { BigCTA } from "./BigCTA";
import { AvatarIcon } from "./avatarIcons";
import { arrive } from "./sfx";
import { PassportStrip } from "./Passport";

const DISTRICTS = hubStops.slice(1, 7); // education .. contact, indexes 1..6 on the ring
const indexOf = (id: string) => hubStops.findIndex((s) => s.id === id);
const SHORT: Record<string, string> = { education: "Education", skills: "Skills", experience: "Experience", projects: "Projects", offstage: "Off-stage", contact: "Contact" };

function Lines({ lines }: { lines: string[] }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {lines.map((l) => (
        <li key={l} className="flex gap-3 text-[1.125rem] leading-snug font-bold md:text-[1.3125rem]">
          <span className="mt-[0.45em] h-3 w-3 shrink-0 rotate-45 border-[3px] border-ink bg-[#ffc93c]" aria-hidden="true" />
          <span>{l}</span>
        </li>
      ))}
    </ul>
  );
}

/** Who is traveling with you, and a way to change it. */
function TravelerChip() {
  const { kind, picked } = useTraveler();
  const me = AVATARS.find((a) => a.id === kind) ?? AVATARS[0];
  return (
    <button
      type="button"
      onClick={() => {
        ui.pop();
        chooser.open();
      }}
      className="group mt-5 inline-flex items-center gap-3 rounded-full border-[3px] border-ink bg-white py-1 pr-4 pl-1 text-left shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5 active:shadow-none"
    >
      <span className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-ink" style={{ background: me.color }}>
        <AvatarIcon kind={kind} className="h-10 w-10" />
      </span>
      <span>
        <span className="block font-mono text-[0.875rem] font-bold tracking-[0.08em] uppercase">{picked ? `Traveling with ${me.name}` : "Pick a traveler"}</span>
        <span className="block font-display text-[0.9375rem] underline decoration-2 underline-offset-2">{chooserCopy.change}</span>
      </span>
    </button>
  );
}

/** The map: who this is, and the way in. */
function WelcomeCard({ stop }: { stop: HubStop }) {
  return (
    <div className="card-scroll min-h-0 flex-1 overflow-y-auto p-6 md:p-9">
      <Hud margam={stop.margam}>{stop.hud}</Hud>
      <h1 className="font-display mt-3 text-[clamp(3.2rem,7.2vw,7.5rem)] leading-[0.9] tracking-[-0.02em]">
        Harshita
        <br />
        Jogi
      </h1>
      <p className="mt-3 text-[1.25rem] leading-snug font-extrabold md:text-[1.75rem]">{stop.stat}</p>
      <p className="mt-2 font-mono text-[0.9375rem] font-bold md:text-[1rem]">{stop.lines?.[0]}</p>
      <div className="flex flex-wrap items-end gap-x-4">
        <p className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border-[3px] border-ink bg-[#3bb273] px-4 py-1.5 text-[0.9375rem] leading-tight font-extrabold md:text-[1rem]">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-ink" aria-hidden="true" />
          {person.availability}
        </p>
        <TravelerChip />
      </div>
      <PassportStrip />
      <p className="mt-4 hidden font-mono text-[1rem] font-bold md:block">Drag to turn the island. Tap any place to visit it.</p>
    </div>
  );
}

/** The back of the name card: the resume itself, right there, and a big way to keep it. */
function WelcomeBack({ shown }: { shown: boolean }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-5 md:p-7">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media.headshot.src} alt={media.headshot.alt} width={80} height={120} className="h-16 w-16 shrink-0 rounded-full border-[3px] border-ink object-cover object-top shadow-[3px_3px_0_var(--ink)] md:h-20 md:w-20" />
        <div className="min-w-0">
          <p className="font-mono text-[0.9375rem] font-bold tracking-[0.08em] uppercase">My resume</p>
          <p className="font-display truncate text-[1.75rem] leading-[1] md:text-[2.25rem]">{person.name}</p>
        </div>
      </div>
      {/* the PDF, live in the card; only loaded once the card is turned over */}
      <div className="mt-4 min-h-[16rem] flex-1 overflow-hidden rounded-[18px] border-[3px] border-ink bg-white shadow-[4px_4px_0_var(--ink)] md:min-h-[20rem]">
        {shown ? (
          <iframe src={`${media.resumePdf}#view=FitH&toolbar=0&navpanes=0`} title={`${person.name}, resume (PDF)`} className="h-full min-h-[16rem] w-full md:min-h-[20rem]" />
        ) : (
          <div className="grid h-full place-items-center font-mono text-[1rem] font-bold">Resume</div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <PopButton href={media.resumePdf} download="Harshita_Jogi_Resume.pdf" size="lg" tone="primary" icon="↓">
          Download PDF
        </PopButton>
        <PopButton href={media.resumePdf} size="md" tone="sun">
          Open full size ↗
        </PopButton>
        <PopButton href={person.links.linkedin} size="md" tone="secondary">
          LinkedIn ↗
        </PopButton>
        <PopButton href={person.links.github} size="md" tone="secondary">
          GitHub ↗
        </PopButton>
        <PopButton href={`mailto:${person.email}`} size="md" tone="secondary">
          Email
        </PopButton>
      </div>
    </div>
  );
}

/**
 * The name card flips. Tap it (anywhere that is not a button) and it turns over to the
 * photo and the links, with a whoosh. A sticker in the corner says so.
 */
function FlipWelcome({ stop }: { stop: HubStop }) {
  const [back, setBack] = useState(false);
  const reduced = useReducedMotion();
  const flip = (e: React.MouseEvent | React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("button, a") && !(e.target as HTMLElement).closest("[data-flip]")) return;
    ui.flip();
    setBack((b) => !b);
  };
  const face = "col-start-1 row-start-1 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";
  return (
    <div className="[perspective:1600px]">
      <motion.div
        className="grid [transform-style:preserve-3d]"
        animate={{ rotateY: back ? 180 : 0 }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 16 }}
      >
        <div
          role="button"
          tabIndex={back ? -1 : 0}
          aria-label="Flip the card to see the resume"
          onClick={flip}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), flip(e))}
          className={cn(face, "cursor-pointer", back && "pointer-events-none")}
        >
          <CardShell className="flex max-h-[min(54svh,46rem)] flex-col transition-transform hover:-translate-y-1 md:max-h-[calc(100svh-15rem)]">
            <span data-flip aria-hidden="true" className="absolute -top-4 right-3 z-10 flex rotate-6 md:-right-4 items-center gap-1.5 rounded-full border-[3px] border-ink bg-[#ff4f8b] px-3.5 py-1.5 font-display text-[1rem] text-ink shadow-[3px_3px_0_var(--ink)] motion-safe:animate-[cta-nudge_3s_ease-in-out_2s_infinite]">
              ↻ Tap for my resume
            </span>
            <WelcomeCard stop={stop} />
          </CardShell>
        </div>
        <div
          role="button"
          tabIndex={back ? 0 : -1}
          aria-label="Flip the card back"
          onClick={flip}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), flip(e))}
          className={cn(face, "cursor-pointer [transform:rotateY(180deg)]", !back && "pointer-events-none")}
        >
          <CardShell className="flex max-h-[min(54svh,46rem)] flex-col md:max-h-[calc(100svh-15rem)]">
            <span data-flip aria-hidden="true" className="absolute -top-4 right-3 z-10 flex -rotate-6 md:-right-4 items-center gap-1.5 rounded-full border-[3px] border-ink bg-[#3bb273] px-3.5 py-1.5 font-display text-[1rem] text-ink shadow-[3px_3px_0_var(--ink)]">
              ↻ Flip back
            </span>
            <WelcomeBack shown={back} />
          </CardShell>
        </div>
      </motion.div>
    </div>
  );
}

/** One district: what is in this part of the resume. The big button is the door in. */
function DistrictCard({ stop }: { stop: HubStop }) {
  const { bells } = useIsland();
  const pos = DISTRICTS.findIndex((d) => d.id === stop.id);
  const prev = DISTRICTS[(pos - 1 + DISTRICTS.length) % DISTRICTS.length];
  const next = DISTRICTS[(pos + 1) % DISTRICTS.length];
  const others = stop.links?.filter((l) => !l.primary) ?? [];
  return (
    <div className="card-scroll min-h-0 flex-1 overflow-y-auto p-6 md:p-9">
      <Hud margam={stop.margam} right={`${pos + 1} / ${DISTRICTS.length}`}>
        {stop.hud}
      </Hud>
      <h2 id={`${stop.id}-title`} className="font-display mt-3 text-[clamp(2.6rem,4.8vw,4.8rem)] leading-[0.95] tracking-[-0.015em]">
        {stop.headline}
      </h2>
      {stop.stat && <p className="mt-3 text-[1.1875rem] leading-snug font-bold md:text-[1.5rem]">{stop.stat}</p>}
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
        <div className="mt-5">
          <PopButton
            size="md"
            tone="sun"
            onClick={() => {
              chime(1500);
              setTimeout(() => chime(1850), 90);
              island.set({ bells: bells + 1 });
              findEgg("bells");
            }}
          >
            Ring the bells
          </PopButton>
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t-[3px] border-dashed border-ink/40 pt-4">
        <span className="font-mono text-[0.9375rem] font-bold uppercase">Other places</span>
        <PopButton onClick={() => hubView.focus(indexOf(prev.id))} size="sm" tone="secondary" back iconLeft="‹">
          {SHORT[prev.id]}
        </PopButton>
        <PopButton onClick={() => hubView.focus(indexOf(next.id))} size="sm" tone="secondary" icon="›">
          {SHORT[next.id]}
        </PopButton>
      </div>
    </div>
  );
}

/** The view from above: the path wears all seven colours of the recital. */
function AboveCard({ stop }: { stop: HubStop }) {
  return (
    <div className="card-scroll min-h-0 flex-1 overflow-y-auto p-6 md:p-9">
      <Hud margam={stop.margam}>{stop.hud}</Hud>
      <h2 className="font-display mt-3 text-[clamp(2.6rem,4.8vw,4.8rem)] leading-[0.95] tracking-[-0.015em]">{stop.headline}</h2>
      <p className="mt-3 text-[1.1875rem] leading-snug font-bold md:text-[1.5rem]">{stop.stat}</p>
      <ol className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5" aria-label="The seven parts of a margam">
        {margamParts.map((m, n) => (
          <li key={m.id} className="flex items-center gap-2.5 text-[1.0625rem] font-semibold md:text-[1.125rem]">
            <span className="h-5 w-5 shrink-0 rounded-full border-[3px] border-ink" style={{ background: m.color }} aria-hidden="true" />
            <span>
              <span className="font-extrabold">
                {n + 1}. {m.name}
              </span>{" "}
              {m.meaning}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * The hub. The island is the map: drag it, tap a district (or its label) and the card
 * beside it changes. In every state one big button, in its own corner, says what to do next.
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
    history.replaceState(null, "", window.location.pathname + window.location.search + (id ? `#${id}` : ""));
  }, [focus]);

  // arrows walk the districts, Escape goes back to the map
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, dialog, [cmdk-root], [role=dialog]")) return;
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
  const enter = stop.links?.find((l) => l.primary);

  const cta =
    focus === -1 || focus === ABOVE
      ? { kicker: "Start here", label: "Start the tour", href: "/education" }
      : stop.id === "contact" && enter
        ? { kicker: "Say hello", label: "Email me", href: enter.href }
        : { kicker: "Go inside", label: "Enter", href: enter?.href ?? "/" };
  const back = focus === -1 ? undefined : { label: "Map", onClick: () => hubView.focus(-1) };

  return (
    <>
      <main id="main" className="pointer-events-none fixed inset-0 z-10 flex items-end px-[var(--gutter)] pt-32 pb-[8.5rem] md:items-center md:pt-28 md:pb-0">
        <div className={cn("pointer-events-auto w-full", focus === -1 ? "md:w-[min(44vw,42rem)]" : "md:w-[min(46vw,43rem)]")}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={key}
              initial={reduced || !moved ? false : { opacity: 0, y: 60, rotate: -2.5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -90, rotate: -5, scale: 0.88, transition: { duration: 0.2, ease: "easeIn" } }}
              transition={{ type: "spring", stiffness: 260, damping: 17 }}
              onAnimationComplete={(def) => {
                if (moved && typeof def === "object" && "opacity" in def && (def as { opacity: number }).opacity === 1) arrive();
              }}
            >
              {focus === -1 ? (
                <FlipWelcome stop={stop} />
              ) : (
                <CardShell className="flex max-h-[min(54svh,44rem)] flex-col md:max-h-[calc(100svh-15rem)]">{focus === ABOVE ? <AboveCard stop={stop} /> : <DistrictCard stop={stop} />}</CardShell>
              )}
            </motion.div>
          </AnimatePresence>
          {focus === -1 && (
            <div className="mt-4 hidden md:flex">
              <PopButton onClick={() => hubView.focus(ABOVE)} size="sm" tone="secondary">
                See the island from above
              </PopButton>
            </div>
          )}
        </div>
        {/* every resume section, in reach on phones */}
        <nav aria-label="Island districts" className="pointer-events-auto fixed inset-x-0 top-[5rem] z-30 flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 md:hidden">
          {DISTRICTS.map((d) => {
            const i = indexOf(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => (ui.pop(), hubView.focus(i))}
                aria-current={focus === i ? "true" : undefined}
                className={cn("shrink-0 rounded-full border-[3px] border-ink px-3 py-1 font-display text-[1rem] shadow-[2px_2px_0_var(--ink)]", focus === i ? "bg-ink text-[#fff8ec]" : "bg-[#fff8ec] text-ink")}
              >
                {SHORT[d.id]}
              </button>
            );
          })}
        </nav>
      </main>
      <BigCTA {...cta} back={back} idleKey={key} />
    </>
  );
}
