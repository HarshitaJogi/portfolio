"use client";

import { NsiAccuracy } from "@/components/work/NsiAccuracy";
import { MsciMigration } from "@/components/work/MsciMigration";
import StatusMark from "@/components/bits/StatusMark";
import { agentConsole } from "@/content/profile";

function Chain({ nodes, accentLast = true }: { nodes: string[]; accentLast?: boolean }) {
  return (
    <ol className="flex items-start">
      {nodes.map((n, i) => (
        <li key={n} className="relative flex flex-1 flex-col items-center gap-2 text-center">
          {i < nodes.length - 1 && <span aria-hidden="true" className="absolute top-[9px] left-[calc(50%+14px)] h-px w-[calc(100%-28px)] bg-ink" />}
          <span aria-hidden="true">
            <StatusMark status="done" size={18} strokeWidth={1.6} color="var(--muted)" doneColor={accentLast && i === nodes.length - 1 ? "var(--accent)" : "var(--ink)"} />
          </span>
          <span className="font-mono text-[0.75rem] text-ink">{n}</span>
        </li>
      ))}
    </ol>
  );
}

/** The proof for each role, as a picture instead of a paragraph. */
export function RoleVisual({ id }: { id: string }) {
  if (id === "nsi") return <NsiAccuracy className="" />;
  if (id === "msci") return <MsciMigration className="" />;
  if (id === "nokia")
    return (
      <div>
        <h4 className="text-label text-ink">Agent pipeline</h4>
        <div className="mt-6">
          <Chain nodes={[...agentConsole.steps.map((s) => s.label), agentConsole.gate.label]} />
        </div>
        <p className="mt-6 flex items-baseline gap-3">
          <span className="text-stat">50K+</span>
          <span className="text-muted">line Python test framework, extended</span>
        </p>
        <a href="#top" className="link mt-5 inline-block font-mono text-[0.8125rem] text-muted">
          Run the agent console at the top ↑
        </a>
      </div>
    );
  if (id === "iitp")
    return (
      <div>
        <h4 className="text-label text-ink">Detection, at the edge</h4>
        <div className="mt-6">
          <Chain nodes={["YOLOv9", "Multi-scale fusion", "Quantize", "Jetson"]} />
        </div>
        <p className="mt-6 flex items-baseline gap-3">
          <span className="text-stat">86%</span>
          <span className="text-muted">detection accuracy</span>
        </p>
      </div>
    );
  return null;
}
