"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import StatusMark from "@/components/bits/StatusMark";
import CallChip from "@/components/bits/CallChip";
import LatticeLoader from "@/components/bits/LatticeLoader";
import HoldButton from "@/components/bits/HoldButton";
import { agentConsole } from "@/content/profile";
import { useReducedMotion } from "@/lib/device";
import { useThemeColors } from "@/lib/useThemeColors";
import { cn } from "@/lib/utils";

type Phase = "running" | "waiting" | "done";

const STEP_MS = 750;

/**
 * The hero's showstopper. The agent drafts and checks its own work step by step, then
 * stops at the human review gate. The visitor holds to approve: they are the human in
 * the loop. Dashed while it is a draft, solid once a human verifies it.
 */
export function AgentConsole() {
  const { steps, gate, status, title, caption } = agentConsole;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const colors = useThemeColors();
  const [done, setDone] = useState(0); // steps completed
  const [phase, setPhase] = useState<Phase>("running");
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDone(steps.length);
      setPhase("waiting");
      return;
    }
    setDone(0);
    setPhase("running");
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setDone(i);
      if (i >= steps.length) {
        clearInterval(t);
        setPhase("waiting");
      }
    }, STEP_MS);
    return () => clearInterval(t);
  }, [inView, reduced, steps.length, run]);

  const verified = phase === "done";
  const stepStatus = (i: number) => (i < done ? "done" : i === done && phase === "running" ? "running" : "pending");

  return (
    <div ref={ref} className="relative">
      <div
        className={cn(
          "relative overflow-hidden transition-[border-color,box-shadow] duration-500",
          verified ? "panel shadow-[0_0_0_1px_var(--accent),0_24px_80px_-32px_var(--accent)]" : "panel-draft",
        )}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <span className="font-mono text-[0.8125rem] text-ink">{title}</span>
          <span className="flex items-center gap-2 font-mono text-[0.75rem] text-muted" aria-live="polite">
            {phase === "running" && colors ? (
              <LatticeLoader label={status.running} status="working" showTimer={false} color={colors.muted} cellSize={3} gap={1.5} fontSize={12} />
            ) : (
              <>
                <span aria-hidden="true">
                  <StatusMark status={verified ? "done" : "pending"} size={14} strokeWidth={1.6} color="var(--muted)" doneColor="var(--accent)" />
                </span>
                <span className={verified ? "text-accent" : undefined}>{verified ? status.done : status.waiting}</span>
              </>
            )}
          </span>
        </div>

        {/* steps */}
        <ol className="relative px-4 py-3">
          <span aria-hidden="true" className="absolute top-6 bottom-[4.25rem] left-[1.6rem] w-px border-l border-dashed border-line-strong" />
          <span
            aria-hidden="true"
            className="absolute top-6 left-[1.6rem] w-px bg-ink transition-[height] duration-500 ease-out"
            style={{ height: `calc((100% - 6.5rem) * ${Math.min(done, steps.length) / steps.length})` }}
          />
          {steps.map((s, i) => {
            const st = stepStatus(i);
            return (
              <li key={s.id} className="relative flex items-center gap-3 py-2">
                <span aria-hidden="true" className="relative z-10 grid h-6 w-6 place-items-center rounded-full bg-surface">
                  <StatusMark status={st} size={16} strokeWidth={1.6} color="var(--muted)" doneColor="var(--ink)" />
                </span>
                <span className={cn("w-16 font-mono text-[0.8125rem]", st === "pending" ? "text-muted" : "text-ink")}>{s.label}</span>
                {s.id === "ground" ? (
                  <CallChip
                    icon="file"
                    name="tool call"
                    argument="internal docs"
                    status={st === "done" ? "done" : st === "running" ? "running" : "idle"}
                    showTimer={false}
                    size={26}
                    radius={8}
                    surfaceColor="var(--surface-2)"
                    doneColor="var(--ink)"
                  />
                ) : (
                  <span className={cn("font-mono text-[0.75rem] transition-colors", st === "done" ? "text-ink" : "text-muted")}>{s.detail}</span>
                )}
                <span className="sr-only">{st === "done" ? ", passed" : st === "running" ? ", running" : ", pending"}</span>
              </li>
            );
          })}

          {/* the human gate */}
          <li className="relative mt-1 flex items-center gap-3 border-t border-dashed border-line-strong pt-4 pb-1">
            <span aria-hidden="true" className="relative z-10 grid h-6 w-6 place-items-center rounded-full bg-surface">
              <StatusMark status={verified ? "done" : "pending"} size={16} strokeWidth={1.6} color="var(--accent)" doneColor="var(--accent)" />
            </span>
            <span className="w-16 font-mono text-[0.8125rem] text-accent">{gate.label}</span>
            {verified ? (
              <span className="font-mono text-[0.75rem] text-ink">{gate.verified}</span>
            ) : (
              <span className="font-mono text-[0.75rem] text-muted">{gate.waiting}</span>
            )}
          </li>
        </ol>

        {/* action */}
        <div className="flex items-center justify-between gap-3 px-4 pt-1 pb-4">
          {verified ? (
            <button
              type="button"
              onClick={() => {
                setPhase("running");
                setRun((r) => r + 1);
              }}
              className="font-mono text-[0.75rem] text-muted underline decoration-line-strong underline-offset-4 hover:text-ink"
            >
              {gate.replay}
            </button>
          ) : (
            <HoldButton
              size="sm"
              radius={8}
              holdTime={1100}
              resetAfter={0}
              disabled={phase !== "waiting"}
              backgroundColor={colors?.accent ?? "#f2554a"}
              fillColor={colors?.ink ?? "#ededef"}
              textColor={colors?.bg ?? "#0b0b0c"}
              fillTextColor={colors?.bg ?? "#0b0b0c"}
              doneLabel={gate.done}
              onHold={() => setPhase("done")}
            >
              {gate.hold}
            </HoldButton>
          )}
          <span className="hidden font-mono text-[0.6875rem] text-muted sm:inline">{caption}</span>
        </div>
      </div>
      <p className="mt-2 font-mono text-[0.6875rem] text-muted sm:hidden">{caption}</p>
    </div>
  );
}
