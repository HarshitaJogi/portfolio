import dynamic from "next/dynamic";
import { toolkit } from "@/content/profile";
import { Band, BandLabel } from "./Band";

const ToolkitPile = dynamic(() => import("./ToolkitPile").then((m) => m.ToolkitPile));

export function ToolkitBand() {
  return (
    <Band id="toolkit" tone="cream" labelledBy="toolkit-title">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <BandLabel index="01" margam="Jatiswaram">
            Toolkit
          </BandLabel>
          <h2 id="toolkit-title" className="text-title mt-5">
            My toolkit. Throw it around.
          </h2>
        </div>
        <p className="font-mono text-[0.8125rem] text-muted">
          {toolkit.alsoLabel}: {toolkit.alsoFamiliar.join(", ")}
        </p>
      </div>
      <div className="mt-8 rounded-[2rem] border-2 border-dashed border-ink/25">
        <ToolkitPile />
      </div>
    </Band>
  );
}
