import { hero, media, person, type TrackOrDefault } from "@/content/profile";
import { Greeting } from "@/components/ui/Greeting";
import { HeroName } from "@/components/hero/HeroName";
import { Headline } from "@/components/hero/Headline";
import { HeroGrid } from "@/components/hero/HeroGrid";
import { AgentConsole } from "@/components/hero/AgentConsole";
import { MetricsBar } from "@/components/hero/MetricsBar";
import { HeroActions } from "@/components/hero/HeroActions";

/** Alarippu, the opening. Name, claim, proof, and a console you can operate. */
export function Hero({ track }: { track: TrackOrDefault }) {
  return (
    <section id="top" aria-labelledby="hero-name" className="relative overflow-x-clip">
      <HeroGrid />
      <div className="px-gutter relative mx-auto max-w-[84rem] pt-20 pb-10 md:pt-32">
        <div className="grid items-center gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="chip border-accent/40 bg-accent-soft text-ink">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                {person.availability}
              </span>
              <Greeting />
            </div>
            <div className="mt-5 md:mt-6">
              <HeroName name={person.name} />
            </div>
            <div className="mt-5">
              <Headline />
            </div>
            <p className="text-lead mt-4 max-w-[44ch] text-muted md:mt-5">{hero.subline}</p>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-8 md:mt-7">
              {hero.meta.map((m) => (
                <div key={m.label}>
                  <dt className="text-label text-muted">{m.label}</dt>
                  <dd className="mt-1 text-[0.9375rem] font-medium">{m.text}</dd>
                </div>
              ))}
            </dl>
            <HeroActions resume={media.resumePdf} />
          </div>
          <div className="lg:col-span-5">
            <AgentConsole />
          </div>
        </div>
        <div id="metrics" className="mt-14 scroll-mt-24 md:mt-20">
          <MetricsBar track={track} />
        </div>
      </div>
    </section>
  );
}
