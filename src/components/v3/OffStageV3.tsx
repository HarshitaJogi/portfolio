import dynamic from "next/dynamic";
import { about } from "@/content/profile";
import { Band, BandLabel } from "./Band";
import { HeroPortrait } from "@/components/hero/HeroPortrait";

const CircularText = dynamic(() => import("@/components/bits/CircularText"));
const MargamMap = dynamic(() => import("@/components/offstage/MargamMap").then((m) => m.MargamMap));
const StrokeText = dynamic(() => import("@/components/bits/StrokeText"));

/** Padam: the personal part. A photo that turns into a performance, one line, then the reveal. */
export function OffStageV3() {
  return (
    <Band id="offstage" tone="cream" labelledBy="offstage-title">
      <BandLabel index="04" margam="Padam">
        Off-stage
      </BandLabel>
      <h2 id="offstage-title" className="sr-only">
        Off-stage
      </h2>
      <div className="mt-10 grid items-center gap-14 lg:grid-cols-12">
        <div className="relative mx-auto grid h-[19rem] w-[19rem] place-items-center md:h-[24rem] md:w-[24rem] lg:col-span-5">
          <div aria-hidden="true" className="absolute inset-0 text-ink">
            <CircularText
              text="BHARATANATYAM · KOVIDA DEGREE · NALANDA · "
              spinDuration={40}
              onHover="slowDown"
              className="!h-full !w-full font-mono !font-medium !text-ink [&>span]:!text-[0.9375rem] md:[&>span]:!text-[1.0625rem]"
            />
          </div>
          <div className="w-[13rem] md:w-[16.5rem]">
            <HeroPortrait caption={false} />
          </div>
        </div>
        <div className="lg:col-span-7">
          <blockquote className="text-headline max-w-[20ch]">
            &ldquo;The hard work stays <span className="text-red">invisible</span>. What reaches people feels <span className="text-teal">effortless</span>.&rdquo;
          </blockquote>
          <p className="mt-5 font-mono text-[0.875rem] text-muted">{about.quoteNote}</p>
          <ul className="mt-8 space-y-2 text-[1rem]">
            {about.lines.map((l) => (
              <li key={l} className="flex items-center gap-3">
                <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-marigold ring-2 ring-ink" />
                {l}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div id="margam" className="card mt-20 grid items-center gap-10 p-6 md:mt-28 md:p-12 lg:grid-cols-12">
        <div className="order-2 lg:order-1 lg:col-span-6">
          <MargamMap />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-6">
          <p className="font-mono text-[0.875rem] text-muted">{about.revealLead}</p>
          <h3 className="sr-only">{about.revealLine}</h3>
          <div aria-hidden="true" className="mt-3">
            <StrokeText text={about.revealLine} trigger="scroll" fontSize={84} fontWeight={750} letterSpacing={-3} strokeColor="#1a1a3a" fillColor="#c81d35" strokeWidth={1.2} drawDuration={1.3} stagger={0.02} className="max-w-[36rem]" />
          </div>
          <p className="mt-4 text-[1rem] text-muted">Every colour you scrolled through was one part of it. Hover the ring.</p>
        </div>
      </div>
    </Band>
  );
}
