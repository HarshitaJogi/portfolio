"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { margamParts, person, stops, type Stop } from "@/content/profile";
import { setJourney } from "@/world/scroll";
import { island, useIsland } from "@/world/state";
import { chime } from "@/world/bits";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/device";

const World = dynamic(() => import("@/world/World"), { ssr: false });

const color = new Map(margamParts.map((m) => [m.id, m.color]));

function StopCard({ stop, index }: { stop: Stop; index: number }) {
  const { approved, bells } = useIsland();
  const welcome = stop.id === "welcome";
  const outro = stop.id === "outro";
  return (
    <div
      className={cn(
        "relative w-full rounded-[28px] border-[3px] border-ink bg-[#fff8ec] text-ink shadow-[8px_8px_0_var(--ink)]",
        welcome ? "p-7 md:p-10" : "p-6 md:p-9",
      )}
    >
      <p className="flex items-center gap-2.5 font-mono text-[0.75rem] font-medium tracking-[0.06em] uppercase md:text-[0.8125rem]">
        <span className="h-3 w-3 rounded-full border-2 border-ink" style={{ background: color.get(stop.margam) }} aria-hidden="true" />
        {stop.hud}
      </p>
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

      {welcome && (
        <>
          <p className="mt-3 font-mono text-[0.8125rem] md:text-[0.875rem]">SWE Co-op at Nokia · MS CS at Northeastern, May 2027</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border-[3px] border-ink bg-[#3bb273] px-5 py-1.5 text-[0.9375rem] leading-tight font-semibold text-ink md:text-[1rem]">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-ink" aria-hidden="true" />
              {person.availability}
            </span>
          </div>
        </>
      )}

      {stop.id === "nokia" && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              island.set({ approved: !approved });
              if (!approved) chime(880);
            }}
            className={cn(
              "inline-flex h-12 items-center rounded-full border-[3px] border-ink px-6 font-display text-[1rem] shadow-[4px_4px_0_var(--ink)] transition-transform active:translate-y-0.5",
              approved ? "bg-[#3bb273] text-ink" : "bg-[#c8102e] text-[#fff8ec]",
            )}
            aria-pressed={approved}
          >
            {approved ? "Approved ✓" : "APPROVE"}
          </button>
          <span className="font-mono text-[0.8125rem]">{approved ? "Verified. Thanks, human." : stop.hint}</span>
        </div>
      )}

      {stop.id === "stage" && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              chime(1500);
              setTimeout(() => chime(1850), 90);
              island.set({ bells: bells + 1 });
            }}
            className="inline-flex h-12 items-center rounded-full border-[3px] border-ink bg-[#ffc93c] px-6 font-display text-[1rem] shadow-[4px_4px_0_var(--ink)] active:translate-y-0.5"
          >
            Ring the bells
          </button>
          <span className="font-mono text-[0.8125rem]">Kovida degree, Nalanda Dance Research Center</span>
        </div>
      )}

      {stop.hint && !["nokia", "stage"].includes(stop.id) && (
        <p className="mt-5 flex items-center gap-2 font-mono text-[0.8125rem]">
          <span aria-hidden="true" className={welcome ? "inline-block animate-bounce" : undefined}>
            {welcome ? "↓" : "↳"}
          </span>
          {stop.hint}
        </p>
      )}

      {stop.links && (
        <div className="mt-6 flex flex-wrap gap-3">
          {stop.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={cn(
                "inline-flex h-12 items-center rounded-full border-[3px] border-ink px-6 font-display text-[1rem] no-underline shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5",
                l.primary ? "bg-[#ff6b4a] text-ink" : "bg-[#fff8ec] text-ink",
              )}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}

      {outro && (
        <ol className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4" aria-label="The seven parts of a margam">
          {margamParts.map((m, i) => (
            <li key={m.id} className="flex items-center gap-2 text-[0.9375rem]">
              <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-ink" style={{ background: m.color }} aria-hidden="true" />
              <span>
                <span className="font-semibold">{i + 1}. {m.name}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
      <span className="sr-only">Stop {index + 1} of {stops.length}</span>
    </div>
  );
}

/**
 * The page is a scroll through the island. Each stop is a full-height section with one
 * card; scroll position becomes camera progress. The 3D world loads after first paint.
 */
export function Journey() {
  const [mount, setMount] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const reduced = useReducedMotion();
  const sections = useRef<HTMLElement[]>([]);

  // Load the world once the page is idle, so text and LCP never wait for WebGL.
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => setMount(true), { timeout: 1500 });
    else setTimeout(() => setMount(true), 800);
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.scrollY + window.innerHeight / 2;
      const list = sections.current;
      let p = 0;
      for (let i = 0; i < list.length; i++) {
        const top = list[i].offsetTop;
        const h = list[i].offsetHeight;
        if (mid >= top && mid < top + h) {
          p = i + (mid - top) / h - 0.5;
          break;
        }
        if (i === list.length - 1 && mid >= top + h) p = i;
      }
      setJourney(Math.min(Math.max(p, 0), list.length - 1));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* the sky, the poster, and the world */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,#ffe3b3_0%,#ffcdb2_45%,#ffd6b8_100%)]">
        {/* a still of the opening shot, so the island is there before WebGL is */}
        <div
          className={cn(
            "absolute inset-0 bg-[url(/world/poster-m.webp)] bg-cover bg-center transition-opacity duration-1000 min-[900px]:bg-[url(/world/poster-d.webp)]",
            ready && "opacity-0",
          )}
        />
        <div className={cn("absolute inset-0 transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}>{mount && <World onReady={onReady} />}</div>
      </div>

      <main id="main" className="relative">
        {stops.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            ref={(el) => {
              if (el) sections.current[i] = el;
            }}
            aria-labelledby={s.id === "welcome" ? undefined : `${s.id}-title`}
            className="pointer-events-none relative flex h-[100svh] snap-center items-end px-[var(--gutter)] pb-6 md:items-center md:pb-0"
          >
            <motion.div
              className={cn("pointer-events-auto w-full md:w-[min(44vw,40rem)]", s.id === "welcome" && "md:w-[min(46vw,44rem)]")}
              // transform only, so the text is readable with or without JS
              initial={i === 0 || reduced ? false : { y: 70, rotate: i % 2 ? 2.5 : -2.5, scale: 0.94 }}
              whileInView={{ y: 0, rotate: 0, scale: 1 }}
              viewport={{ amount: 0.35 }}
              transition={{ type: "spring", stiffness: 170, damping: 17 }}
            >
              <StopCard stop={s} index={i} />
            </motion.div>
          </section>
        ))}
      </main>
    </>
  );
}
