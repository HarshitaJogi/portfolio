"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import RefineFrame, { type RefineFrameStatus } from "@/components/bits/RefineFrame";
import StatusMark from "@/components/bits/StatusMark";
import { bitgig, media } from "@/content/profile";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/utils";

const FRAME: RefineFrameStatus[] = ["queued", "generating", "refining", "refining", "complete"];
const STEP_MS = 900;

/**
 * Bitgig's pipeline, played once: the screenshot goes from raw to verified while the
 * five stages tick in step. Then it stays clear, so the demo is readable.
 */
export function BitgigCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(-1);
  const [run, setRun] = useState(0);
  const last = bitgig.stages.length - 1;

  useEffect(() => {
    if (!inView) return;
    if (reduced) return setStage(last);
    setStage(0);
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setStage(i);
      if (i >= last) clearInterval(t);
    }, STEP_MS);
    return () => clearInterval(t);
  }, [inView, reduced, last, run]);

  const status: RefineFrameStatus = stage < 0 ? "complete" : FRAME[stage];

  return (
    <div ref={ref}>
      <RefineFrame
        status={status}
        aspectRatio="16 / 10"
        radius={10}
        background="var(--surface-2)"
        labels={{ queued: "Raw footage", generating: "Gemini draft", refining: "Expert review", complete: "Verified" }}
        className="w-full"
      >
        <Image src={media.bitgig.src} alt={media.bitgig.alt} width={media.bitgig.width} height={media.bitgig.height} sizes="(min-width: 1024px) 640px, 100vw" />
      </RefineFrame>

      <ol className="mt-5 grid grid-cols-5 gap-1" aria-label="Bitgig pipeline">
        {bitgig.stages.map((s, i) => {
          const passed = stage >= i;
          return (
            <li key={s.name} className="relative flex flex-col items-center gap-2 text-center">
              {i < last && (
                <span
                  aria-hidden="true"
                  className={cn("absolute top-[9px] left-[calc(50%+14px)] h-px w-[calc(100%-28px)]", stage > i ? "bg-ink" : "rule-dashed")}
                />
              )}
              <span aria-hidden="true">
                <StatusMark status={passed ? "done" : "pending"} size={18} strokeWidth={1.6} color="var(--muted)" doneColor={i === last ? "var(--accent)" : "var(--ink)"} />
              </span>
              <span className={cn("font-mono text-[0.6875rem] tracking-[0.04em] uppercase sm:text-[0.75rem]", passed ? "text-ink" : "text-muted")}>{s.name}</span>
              <span className="sr-only">{s.text}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex items-center justify-between font-mono text-[0.75rem] text-muted">
        <span className="flex items-center gap-4" aria-hidden="true">
          <span className="flex items-center gap-1.5">
            <span className="rule-dashed inline-block w-5" /> draft
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-px w-5 bg-ink" /> verified
          </span>
        </span>
        <button type="button" onClick={() => setRun((r) => r + 1)} className="underline decoration-line-strong underline-offset-4 hover:text-ink">
          Replay
        </button>
      </div>
    </div>
  );
}
