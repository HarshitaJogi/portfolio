import dynamic from "next/dynamic";
import { toolkit } from "@/content/profile";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
const ToolkitCards = dynamic(() => import("@/components/toolkit/ToolkitCards").then((m) => m.ToolkitCards));

export function Toolkit() {
  return (
    <Section id="toolkit">
      <SectionHeading id="toolkit" index="06" kicker="Technique" title={toolkit.title} margam="Varnam" intro={toolkit.intro} />
      <ToolkitCards />
      <p className="text-body mt-10 text-muted">
        <span className="text-label mr-3 font-mono">{toolkit.alsoLabel}</span>
        {toolkit.alsoFamiliar.join(", ")}
      </p>
    </Section>
  );
}
