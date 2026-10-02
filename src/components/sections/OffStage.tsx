import dynamic from "next/dynamic";
import { offstage } from "@/content/profile";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
const DanceRing = dynamic(() => import("@/components/offstage/DanceRing").then((m) => m.DanceRing));
const QuoteWave = dynamic(() => import("@/components/offstage/QuoteWave").then((m) => m.QuoteWave));
const MargamMap = dynamic(() => import("@/components/offstage/MargamMap").then((m) => m.MargamMap));
const StrokeText = dynamic(() => import("@/components/bits/StrokeText"));

/** Padam: slow, expressive, personal. Then the reveal. */
export function OffStage() {
  return (
    <Section id="offstage">
      <SectionHeading id="offstage" index="07" kicker="Beyond the work" title={offstage.title} margam="Padam" />
      <div className="grid gap-12 md:grid-cols-12 md:items-center">
        <div className="md:col-span-6">
          {offstage.paragraphs.map((p) => (
            <p key={p} className="text-lead measure mb-6">
              {p}
            </p>
          ))}
          <dl className="mt-8 space-y-4 border-t border-hairline pt-6">
            {offstage.credentials.map((c) => (
              <div key={c.label}>
                <dt className="font-display text-[1.5rem] leading-tight">{c.label}</dt>
                <dd className="text-label mt-1 font-mono text-muted">{c.org}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="md:col-span-6">
          <DanceRing />
        </div>
      </div>

      <div className="mt-24 md:mt-32">
        <QuoteWave />
      </div>

      <div id="margam" className="mt-24 grid items-center gap-12 md:mt-36 md:grid-cols-12">
        <div className="order-2 md:order-1 md:col-span-6">
          <MargamMap />
        </div>
        <div className="order-1 md:order-2 md:col-span-6">
          <p className="text-lead text-muted">{offstage.revealLead}</p>
          <h3 className="sr-only">{offstage.revealLine}</h3>
          <div aria-hidden="true" className="font-display mt-2">
            <StrokeText
              text={offstage.revealLine}
              trigger="scroll"
              fontSize={96}
              fontWeight={400}
              letterSpacing={-1}
              strokeColor="var(--ink)"
              fillColor="var(--accent)"
              strokeWidth={1}
              drawDuration={1.4}
              stagger={0.025}
              className="max-w-[40rem]"
            />
          </div>
          <p className="text-body measure mt-6">{offstage.revealSub}</p>
          <p className="text-label mt-6 font-mono text-muted">{offstage.mapHint}</p>
        </div>
      </div>
    </Section>
  );
}
