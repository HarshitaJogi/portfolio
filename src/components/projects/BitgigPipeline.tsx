"use client";

import { useInView } from "motion/react";
import { useReducedMotion } from "@/lib/device";
import { useEffect, useRef, useState } from "react";
import StatusMark from "@/components/bits/StatusMark";
import { bitgig } from "@/content/profile";
import { cn } from "@/lib/utils";

/** Upload → draft → correct → agree → verified. Each stage goes from dashed to solid. */
export function BitgigPipeline() {
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reduced = useReducedMotion();
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (reduced) return setDone(bitgig.stages.length);
    if (!inView) return;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setDone(i);
      if (i >= bitgig.stages.length) clearInterval(t);
    }, 650);
    return () => clearInterval(t);
  }, [inView, reduced]);

  return (
    <div className="mt-12">
      <ol ref={ref} className="grid gap-6 md:grid-cols-5 md:gap-4">
        {bitgig.stages.map((s, i) => {
          const passed = i < done;
          return (
            <li key={s.name} className="relative flex gap-4 md:flex-col md:gap-3">
              {i < bitgig.stages.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-[11px] left-[calc(22px+0.75rem)] hidden h-px w-[calc(100%-22px-1.5rem+1rem)] md:block",
                    passed ? "bg-ink" : "rule-dashed",
                  )}
                  style={{ transition: "background-color 400ms" }}
                />
              )}
              <span aria-hidden="true" className="shrink-0">
                <StatusMark status={passed ? "done" : "pending"} size={22} strokeWidth={1.6} color="var(--muted)" doneColor="var(--ink)" />
              </span>
              <span>
                <span className={cn("text-label block font-mono", passed ? "text-ink" : "text-muted")}>
                  {String(i + 1).padStart(2, "0")} {s.name}
                </span>
                <span className="mt-1 block text-[1rem] leading-snug">{s.text}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-label mt-6 flex gap-6 font-mono text-muted" aria-hidden="true">
        <span className="flex items-center gap-2">
          <span className="rule-dashed inline-block w-8" /> {bitgig.legend.draft}
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-px w-8 bg-ink" /> {bitgig.legend.verified}
        </span>
      </p>
    </div>
  );
}
