import { hero, media, person } from "@/content/profile";
import { Greeting } from "@/components/ui/Greeting";
import { Kicker } from "@/components/ui/Kicker";
import { CircleButton } from "@/components/ui/CircleButton";
import { HeroName } from "@/components/hero/HeroName";
import { Headline } from "@/components/hero/Headline";
import { HeroPortrait } from "@/components/hero/HeroPortrait";
import ShinyText from "@/components/bits/ShinyText";

/** Alarippu: the invocation. Everything a recruiter needs before the first scroll. */
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-name" className="px-gutter relative mx-auto max-w-[90rem] overflow-x-clip pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="absolute top-[4.75rem] md:top-[5.5rem]">
        <Greeting />
      </div>
      <Kicker margam="Alarippu">{hero.kicker}</Kicker>
      <div className="mt-3 md:mt-4">
        <HeroName name={person.name} />
      </div>

      <div className="mt-5 grid gap-x-10 gap-y-8 md:mt-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8 lg:col-span-7">
          <Headline />
          <p className="text-lead mt-4 max-w-[34ch] text-ink md:mt-6">{hero.subline}</p>

          <dl className="mt-5 space-y-1.5 md:hidden">
            {hero.now.map((n) => (
              <div key={n.label} className="flex gap-3 text-[1rem] leading-snug">
                <dt className="text-label w-12 shrink-0 pt-0.5 font-mono text-muted">{n.label}</dt>
                <dd>{n.text}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 flex items-center gap-3 text-[1.0625rem] font-medium md:mt-8">
            <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
            <ShinyText text={person.availability} />
          </p>

          <div className="mt-6 flex items-center gap-5 md:mt-8 md:gap-7">
            <CircleButton href={media.resumePdf} sub="PDF" size={96} external>
              Resume
            </CircleButton>
            <div className="w-24 md:hidden">
              <HeroPortrait />
            </div>
            <a href={`mailto:${person.email}`} className="link hidden text-[1.25rem] break-all md:inline">
              {person.email}
            </a>
          </div>
          <a href={`mailto:${person.email}`} className="link mt-4 inline-block text-[1.0625rem] md:hidden">
            {person.email}
          </a>
        </div>

        <div className="hidden md:col-span-4 md:col-start-9 md:block lg:col-span-4 lg:col-start-9">
          <div className="ml-auto w-full max-w-[18.5rem]">
            <HeroPortrait lineStart />
          </div>
          <dl className="mt-8 space-y-3 border-t border-hairline pt-5">
            {hero.now.map((n) => (
              <div key={n.label} className="flex gap-4 text-[1rem] leading-snug">
                <dt className="text-label w-14 shrink-0 pt-0.5 font-mono text-muted">{n.label}</dt>
                <dd>{n.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      {/* Below lg the line starts at the foot of the hero, on the rail. */}
      <span className="line-mark !top-auto bottom-4 !left-[calc(var(--gutter)+var(--rail-x))] lg:hidden" aria-hidden="true" />
    </section>
  );
}
