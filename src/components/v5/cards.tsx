"use client";

import { useEffect, useState, type ReactNode } from "react";
import { margamParts, places, type Link, type MargamId, type PlaceId } from "@/content/profile";
import { worldNav } from "@/world/nav";
import { cn } from "@/lib/utils";

const margamColor = new Map(margamParts.map((m) => [m.id, m.color]));
export const colorOf = (m: MargamId) => margamColor.get(m) ?? "#ff6b4a";

/** The cream card with a hard ink shadow. Everything readable on the island sits in one. */
export function CardShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("relative w-full rounded-[30px] border-[4px] border-ink bg-[#fff8ec] text-ink shadow-[10px_10px_0_var(--ink)]", className)}>{children}</div>;
}

export function Hud({ margam, children, right }: { margam: MargamId; children: ReactNode; right?: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 font-mono text-[0.9375rem] font-bold tracking-[0.08em] uppercase md:text-[1rem]">
      <span className="h-4 w-4 shrink-0 rounded-full border-[3px] border-ink" style={{ background: colorOf(margam) }} aria-hidden="true" />
      <span className="min-w-0 flex-1">{children}</span>
      {right && <span className="shrink-0 rounded-full border-[2.5px] border-ink bg-[#ffc93c] px-2.5 py-0.5">{right}</span>}
    </p>
  );
}

const isInternal = (href: string) => href.startsWith("/") && !href.endsWith(".pdf");

/** Pill buttons. Internal routes fly there through the clouds, everything else is a plain link. */
export function LinkRow({ links, className }: { links: Link[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {links.map((l) => {
        const external = l.href.startsWith("http");
        return (
          <a
            key={l.href + l.label}
            href={l.href}
            onClick={(e) => {
              if (!isInternal(l.href) || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              worldNav.go(l.href);
            }}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={cn(
              "inline-flex min-h-12 items-center rounded-full border-[3px] border-ink px-5 py-2 font-display text-[0.9375rem] leading-tight no-underline shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 md:px-6 md:text-[1rem]",
              l.primary ? "bg-[#ff6b4a] text-ink" : "bg-[#fff8ec] text-ink",
            )}
          >
            {l.label}
            {external && <span className="sr-only">, opens in a new tab</span>}
          </a>
        );
      })}
    </div>
  );
}

// Numbers that carry the claim: 98%, 1M+, 50K+, 15+, $25,000, 5TB, 15m, 18+, 2nd
const NUM = /(\$[\d,]+|\d+(?:\.\d+)?\s?(?:%|TB|K\+|M\+|\+|m\b)|\b\d+(?:st|nd|rd|th)\b)/g;

/** A sentence with its numbers set in bold with a marker underline, so a skim finds them. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(NUM);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <strong key={i} className="font-extrabold [background:linear-gradient(transparent_55%,#ffc93c_55%)] px-0.5">
            {p}
          </strong>
        ) : (
          p
        ),
      )}
    </>
  );
}

/** "9:41 PM in Boston", live. Client-only, so the server never guesses a time. */
export function LocalTime({ place }: { place: PlaceId }) {
  const { city, tz } = places[place];
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" });
    const tick = () => setNow(f.format(new Date()));
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, [tz]);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white/70 px-2.5 py-0.5 font-mono text-[0.875rem]" title={`Local time in ${city}`}>
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 4.5V8l2.4 1.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className={cn(!now && "invisible")}>{now ?? "00:00 AM"}</span>
      <span>in {city}</span>
    </span>
  );
}

export function Chips({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((c) => (
        <li key={c} className="rounded-full border-[2.5px] border-ink bg-white px-3 py-0.5 text-[1rem] font-bold md:text-[0.9375rem]">
          {c}
        </li>
      ))}
    </ul>
  );
}
