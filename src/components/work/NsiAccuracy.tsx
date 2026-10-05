"use client";

import { animate, useInView } from "motion/react";
import { useReducedMotion } from "@/lib/device";
import { useEffect, useRef, useState } from "react";
import RubberSegment from "@/components/bits/RubberSegment";
import { DraftText } from "@/components/ui/DraftText";
import { nsiAccuracy } from "@/content/profile";

// 20 of 50 marks wrong before (60%), 1 of 50 after (98%). Positions are fixed so
// the strip reads the same every time. Each mark is 2%.
const WRONG_BEFORE = new Set([2, 5, 7, 11, 13, 16, 19, 22, 24, 27, 29, 31, 34, 36, 38, 41, 43, 45, 47, 49]);
const WRONG_AFTER = new Set([31]);

/** Before and after error analysis. The marks are the illustration, the numbers are the brief's. */
export function NsiAccuracy({ className = "mt-8 border-t border-line pt-6" }: { className?: string }) {
  const { before, after, marks, caption } = nsiAccuracy;
  const [state, setState] = useState<"before" | "after">("before");
  const [shown, setShown] = useState(before.value);
  const touched = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -25% 0px" });
  const reduced = useReducedMotion();

  // Play the change once when it scrolls into view, unless the reader already chose.
  useEffect(() => {
    if (!inView || touched.current) return;
    const t = setTimeout(() => !touched.current && setState("after"), 1400);
    return () => clearTimeout(t);
  }, [inView]);

  useEffect(() => {
    const target = state === "after" ? after.value : before.value;
    if (reduced) {
      setShown(target);
      return;
    }
    const c = animate(shown, target, { duration: 1, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, reduced]);

  const wrong = state === "after" ? WRONG_AFTER : WRONG_BEFORE;
  const isAfter = state === "after";

  return (
    <div ref={ref} className={className}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h4 className="text-label font-mono text-ink">Annotation accuracy</h4>
        <RubberSegment
          aria-label="Prompt version"
          items={[
            { value: "before", label: before.label },
            { value: "after", label: after.label },
          ]}
          value={state}
          onChange={(v) => {
            touched.current = true;
            setState(v as "before" | "after");
          }}
          size="sm"
          trackColor="var(--paper-deep)"
          thumbColor="var(--ink)"
          textColor="var(--muted)"
          activeTextColor="var(--paper)"
        />
      </div>

      <p className="mt-6 flex items-baseline gap-4" aria-live="polite">
        <span className="text-stat">
          {!isAfter && shown === before.value ? (
            <DraftText text={`${shown}%`} mode="draft" strokeColor="var(--muted)" />
          ) : (
            <span style={{ color: isAfter ? "var(--ink)" : "var(--muted)" }}>{shown}%</span>
          )}
        </span>
        <span className="text-body text-muted">{isAfter ? after.label : before.label}</span>
      </p>

      <div className="mt-6 flex h-9 items-end gap-[3px]" aria-hidden="true">
        {Array.from({ length: marks }, (_, i) => {
          const bad = wrong.has(i);
          return (
            <span
              key={i}
              className="h-full flex-1 transition-[background-color,border-color,transform] duration-500"
              style={{
                transitionDelay: reduced ? "0ms" : `${i * 14}ms`,
                backgroundColor: bad ? "transparent" : "var(--ink)",
                border: bad ? "1px dashed var(--accent)" : "1px solid var(--ink)",
                transform: bad ? "scaleY(0.72)" : "none",
                transformOrigin: "bottom",
              }}
            />
          );
        })}
      </div>
      <p className="mt-3 flex flex-wrap justify-between gap-2 font-mono text-[0.75rem] text-muted">
        <span>{caption}</span>
        <span>
          <span className="inline-block h-2.5 w-1.5 bg-ink align-middle" /> correct{"  "}
          <span className="ml-3 inline-block h-2.5 w-1.5 border border-dashed border-accent align-middle" /> wrong
        </span>
      </p>
    </div>
  );
}
