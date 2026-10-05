import dynamic from "next/dynamic";
import { about } from "@/content/profile";
import { SectionHeader } from "@/components/v2/SectionHeader";
import { HeroPortrait } from "@/components/hero/HeroPortrait";

const MargamMap = dynamic(() => import("@/components/offstage/MargamMap").then((m) => m.MargamMap));
const StrokeText = dynamic(() => import("@/components/bits/StrokeText"));

/** Padam: the personal part. Two lines, one photo, one quote. Then the reveal. */
export function About() {
  return (
    <section id="offstage" aria-labelledby="offstage-title" className="px-gutter mx-auto max-w-[84rem] py-20 md:py-28">
      <SectionHeader id="offstage" index="04" label="OFF THE CLOCK" title="The other discipline" margam="Padam" />
      <div className="grid items-center gap-10 md:grid-cols-12">
        <div className="mx-auto w-full max-w-[16rem] md:col-span-4 md:max-w-[18rem]">
          <HeroPortrait />
        </div>
        <div className="md:col-span-8">
          <blockquote className="text-headline max-w-[24ch]">&ldquo;{about.quote}&rdquo;</blockquote>
          <p className="mt-3 font-mono text-[0.8125rem] text-muted">{about.quoteNote}</p>
          <ul className="mt-8 space-y-2 text-[0.9375rem] text-muted">
            {about.lines.map((l) => (
              <li key={l} className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.6em] h-px w-3 shrink-0 bg-line-strong" />
                {l}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div id="margam" className="panel mt-16 grid items-center gap-10 p-6 md:mt-20 md:grid-cols-12 md:p-10">
        <div className="order-2 md:order-1 md:col-span-6">
          <MargamMap />
        </div>
        <div className="order-1 md:order-2 md:col-span-6">
          <p className="font-mono text-[0.8125rem] text-muted">{about.revealLead}</p>
          <h3 className="sr-only">{about.revealLine}</h3>
          <div aria-hidden="true" className="mt-3">
            <StrokeText
              text={about.revealLine}
              trigger="scroll"
              fontSize={84}
              fontWeight={600}
              letterSpacing={-3}
              strokeColor="var(--ink)"
              fillColor="var(--accent)"
              strokeWidth={1}
              drawDuration={1.3}
              stagger={0.02}
              className="max-w-[36rem]"
            />
          </div>
          <p className="mt-4 font-mono text-[0.8125rem] text-muted">Each point is one part of the recital, and one section of this page.</p>
        </div>
      </div>
    </section>
  );
}
