"use client";

import { useEffect, useMemo, useState } from "react";
import { aiDraft } from "@/content/profile";
import { useReducedMotion } from "@/lib/device";
import { Sparkle } from "./Icons";
import { cn } from "@/lib/utils";

const TYPE_MS = 22;
const STRIKE_GAP = 420;

// A wobbly, hand-drawn strike. Stretched to the phrase width.
const SCRIBBLE = "M2 58 C 14 44, 26 70, 40 52 S 64 38, 78 56 S 92 64, 98 46";

/**
 * The hero's story in one shot. An AI types a confident, wrong bio. A human crosses
 * out the hallucinations in red pen. Only then does the real line turn solid:
 * "AI writes the first draft. I make it right."
 *
 * The verified line is in the DOM and readable from the first frame; it starts
 * faded ("awaiting review") and settles to solid ink once the edits land.
 */
export function DraftCorrection() {
  const reduced = useReducedMotion();
  const full = useMemo(() => aiDraft.parts.map((p) => p.text).join(""), []);
  const notes = aiDraft.parts.filter((p) => p.note).length;
  const [typed, setTyped] = useState(0);
  const [struck, setStruck] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (reduced) {
      setTyped(full.length);
      setStruck(notes);
      return;
    }
    setStarted(true);
    let i = 0;
    const t = setInterval(() => {
      i += 2;
      setTyped(Math.min(i, full.length));
      if (i >= full.length) clearInterval(t);
    }, TYPE_MS * 2);
    return () => clearInterval(t);
  }, [reduced, full.length, notes]);

  useEffect(() => {
    if (!started || typed < full.length || struck >= notes) return;
    const t = setTimeout(() => setStruck((s) => s + 1), struck === 0 ? 350 : STRIKE_GAP);
    return () => clearTimeout(t);
  }, [started, typed, full.length, struck, notes]);

  const verified = struck >= notes && typed >= full.length;

  // Render the draft, revealing `typed` characters.
  let left = typed;
  let noteIndex = -1;
  const rendered = aiDraft.parts.map((p, i) => {
    const shown = p.text.slice(0, Math.max(0, left));
    left -= p.text.length;
    if (!p.note) return <span key={i}>{shown}</span>;
    noteIndex += 1;
    const isStruck = noteIndex < struck;
    return (
      <span key={i} className="relative inline-block whitespace-nowrap">
        <span className={cn("transition-colors duration-300", isStruck && "text-muted")}>{shown}</span>
        {isStruck && (
          <>
            <svg className="pointer-events-none absolute inset-x-[-4%] top-[-20%] h-[140%] w-[108%] overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path
                d={SCRIBBLE}
                fill="none"
                stroke="var(--red)"
                strokeWidth="3"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                className="[stroke-dasharray:1] [animation:draw_380ms_var(--ease-settle)_forwards] motion-reduce:[animation:none]"
                style={{ strokeDashoffset: reduced || !started ? 0 : 1 }}
              />
            </svg>
            <span
              className="font-hand pointer-events-none absolute -top-[1.35rem] left-1/2 -translate-x-1/2 -rotate-6 text-[1.25rem] leading-none whitespace-nowrap text-red [animation:fadeIn_300ms_var(--ease-settle)_both] motion-reduce:[animation:none]"
              aria-hidden="true"
            >
              {p.note}
            </span>
          </>
        )}
      </span>
    );
  });

  return (
    <div className="relative grid items-center gap-y-6 lg:grid-cols-12 lg:gap-x-6">
      {/* the AI draft, a little crooked, like a sticky note */}
      <div className="lg:col-span-5">
      <div className="relative inline-block -rotate-[1.5deg] rounded-2xl border-2 border-dashed border-ink/25 bg-paper px-5 pt-4 pb-5 shadow-[0_18px_40px_-24px_rgb(26_26_58/0.45)]" aria-hidden="true">
        <span className="text-label flex items-center gap-2 text-muted">
          <Sparkle /> {aiDraft.label}
        </span>
        <p className="mt-3 font-mono text-[1rem] leading-[3.1] whitespace-pre-line text-ink md:text-[1.125rem]">
          {rendered}
          {typed < full.length && <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-ink" />}
        </p>
      </div>
      </div>
      <p className="sr-only">{aiDraft.srSummary}</p>

      {/* the red pen's arrow, from the draft to the verified line */}
      <div aria-hidden="true" className="flex justify-center lg:col-span-2">
        <svg viewBox="0 0 120 80" className="h-16 w-24 rotate-90 text-red lg:h-20 lg:w-32 lg:rotate-0">
          <path
            d="M6 50 C 30 10, 70 10, 104 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            pathLength={1}
            style={{ strokeDasharray: 1, strokeDashoffset: verified ? 0 : 1, transition: "stroke-dashoffset 500ms var(--ease-settle)" }}
          />
          <path
            d="M92 26 L106 41 L88 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: verified ? 1 : 0, transition: "opacity 200ms 400ms" }}
          />
        </svg>
      </div>

      {/* the human-verified line */}
      <div className="lg:col-span-5">
        <p className={cn("text-label flex items-center gap-2 transition-colors duration-500", verified ? "text-teal" : "text-muted")}>
          <span
            className={cn(
              "grid h-5 w-5 place-items-center rounded-full border-2 text-[0.6875rem] transition-all duration-500",
              verified ? "border-teal bg-teal text-cream" : "border-dashed border-muted",
            )}
            aria-hidden="true"
          >
            {verified ? "✓" : ""}
          </span>
          {verified ? aiDraft.verified : aiDraft.pending}
        </p>
        <p className={cn("verified-line text-headline mt-3 max-w-[16ch] transition-opacity duration-700", verified ? "opacity-100" : "opacity-40")}>
          {aiDraft.headline.first} {aiDraft.headline.second}{" "}
          <span className="relative inline-block whitespace-nowrap text-red">
            {aiDraft.headline.last}
            <svg className="pointer-events-none absolute -bottom-2 left-0 h-3 w-full overflow-visible" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
              <path
                d="M2 8 C 30 2, 60 12, 98 4"
                fill="none"
                stroke="var(--red)"
                strokeWidth="3"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                style={{ strokeDasharray: 1, strokeDashoffset: verified ? 0 : 1, transition: "stroke-dashoffset 600ms var(--ease-settle) 200ms" }}
              />
            </svg>
          </span>
        </p>
      </div>

    </div>
  );
}
