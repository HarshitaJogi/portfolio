"use client";

import { useState } from "react";
import Stepper, { Step } from "@/components/bits/Stepper";
import StatusMark from "@/components/bits/StatusMark";
import CallChip from "@/components/bits/CallChip";
import { nokiaAgent } from "@/content/profile";
import { cn } from "@/lib/utils";

/**
 * How the Nokia agent is designed, one stage at a time. Each stage is a dashed ring
 * until you reach it, then a solid check. It ends at a person, on purpose.
 * Described at the level of the brief only.
 */
export function NokiaAgent() {
  const steps = nokiaAgent.steps;
  const [current, setCurrent] = useState(1);
  return (
    <div className="mt-12 border-t border-hairline pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h4 className="text-label font-mono text-ink">{nokiaAgent.title}</h4>
        <p className="text-[0.875rem] text-muted">{nokiaAgent.disclaimer}</p>
      </div>
      <Stepper
        initialStep={1}
        onStepChange={setCurrent}
        stepContainerClassName="mt-8"
        contentClassName="mt-8"
        nextButtonText="Next stage"
        backButtonText="Back"
        renderStepIndicator={({ step, currentStep, onStepClick }) => {
          const s = steps[step - 1];
          const status = step < currentStep ? "done" : step === currentStep ? "running" : "pending";
          return (
            <button
              type="button"
              onClick={() => onStepClick(step)}
              aria-current={step === currentStep ? "step" : undefined}
              aria-label={`Stage ${step}: ${s.name}${step < currentStep ? ", passed" : ""}`}
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              <span aria-hidden="true">
                <StatusMark
                  status={status}
                  progress={status === "running" ? 0.62 : undefined}
                  size={22}
                  strokeWidth={1.6}
                  color="var(--muted)"
                  doneColor="var(--ink)"
                />
              </span>
              <span
                className={cn(
                  "font-mono text-[0.75rem] tracking-[0.06em] uppercase transition-colors",
                  step === currentStep ? "text-accent" : step < currentStep ? "text-ink" : "text-muted group-hover:text-ink",
                )}
              >
                {s.name}
              </span>
            </button>
          );
        }}
      >
        {steps.map((s, i) => (
          <Step key={s.name}>
            <div className="min-h-[9.5rem] pb-1">
              <p className="font-display text-[clamp(1.75rem,1.3rem+1.2vw,2.375rem)] leading-tight">{s.title}</p>
              <p className="text-body mt-3 max-w-[56ch] text-ink">{s.body}</p>
              {"chip" in s && s.chip && (
                <div className="mt-5">
                  <CallChip
                    icon="file"
                    name={s.chip.name}
                    argument={s.chip.argument}
                    status={current === i + 1 ? "done" : "idle"}
                    showTimer={false}
                    size={32}
                    surfaceColor="var(--paper-deep)"
                    doneColor="var(--ink)"
                  />
                </div>
              )}
            </div>
          </Step>
        ))}
      </Stepper>
    </div>
  );
}
