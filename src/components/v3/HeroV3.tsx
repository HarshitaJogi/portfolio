import { person } from "@/content/profile";
import { Greeting } from "@/components/ui/Greeting";
import { HeroName } from "./HeroName";
import { DraftCorrection } from "./DraftCorrection";
import { CareerPipeline } from "./CareerPipeline";

/**
 * Alarippu, the opening. The whole story in one screen:
 * who (the name), the pitch (an AI draft, corrected by a human), the trajectory and
 * proof (the pipeline), and what's next (your team).
 */
export function HeroV3() {
  return (
    <section id="top" aria-labelledby="hero-name" className="relative flex min-h-[100svh] flex-col overflow-x-clip">
      {/* colour, kept to the edges so the middle can breathe */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0">
        <span className="absolute -top-40 -right-40 h-[26rem] w-[26rem] rounded-full bg-marigold md:-top-56 md:-right-32 md:h-[34rem] md:w-[34rem]" />
        <span className="absolute top-[16rem] right-[22rem] hidden h-28 w-28 rounded-full border-[10px] border-pink lg:block" />
      </div>

      <div className="px-gutter relative mx-auto flex w-full max-w-[100rem] flex-1 flex-col pt-24 pb-10 md:pt-28">
        <div className="flex flex-wrap items-center gap-3">
          <span className="pill bg-ink text-cream">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-marigold opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-marigold" />
            </span>
            {person.availability}
          </span>
          <Greeting />
        </div>

        <div className="mt-6 md:mt-8">
          <HeroName name={person.name} />
        </div>

        <div className="mt-10 flex-1 md:mt-14">
          <DraftCorrection />
        </div>

        <div className="mt-12 md:mt-14">
          <CareerPipeline />
        </div>
      </div>
    </section>
  );
}
