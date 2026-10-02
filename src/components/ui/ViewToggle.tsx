"use client";

import RubberSegment from "@/components/bits/RubberSegment";
import { setView, useView } from "@/lib/view";

/** Story = the full page. Skim = a single-screen summary for people short on time. */
export function ViewToggle() {
  const view = useView();
  return (
    <RubberSegment
      aria-label="Page view"
      items={[
        { value: "story", label: "Story" },
        { value: "skim", label: "Skim" },
      ]}
      value={view}
      onChange={(v) => setView(v as "story" | "skim")}
      size="sm"
      trackColor="var(--paper-deep)"
      thumbColor="var(--ink)"
      textColor="var(--muted)"
      activeTextColor="var(--paper)"
    />
  );
}
