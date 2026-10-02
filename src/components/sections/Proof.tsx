import { proof, type Stat, type TrackOrDefault } from "@/content/profile";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DraftText } from "@/components/ui/DraftText";
import { Reveal } from "@/components/ui/Reveal";
import CountUp from "@/components/bits/CountUp";

function StatValue({ s }: { s: Stat }) {
  const animate = s.value >= 10;
  return (
    <span className="font-display text-stat whitespace-nowrap text-ink">
      {s.before && (
        <>
          <DraftText text={s.before} mode="draft" strokeColor="var(--muted)" />
          <span className="mx-[0.18em] text-[0.5em] align-middle text-muted" aria-label="to">
            →
          </span>
        </>
      )}
      {s.prefix}
      {animate ? <CountUp to={s.value} from={s.from ?? 0} separator={s.separator} duration={1.4} /> : s.value}
      {s.suffix}
    </span>
  );
}

/** Jatiswaram: pure technique. Six numbers, each tied to the work behind it. */
export function Proof({ track }: { track: TrackOrDefault }) {
  const byId = new Map(proof.stats.map((s) => [s.id, s]));
  const stats = proof.order[track].map((id) => byId.get(id)!).filter(Boolean);
  return (
    <Section id="proof">
      <SectionHeading id="proof" index="01" kicker="In numbers" title={proof.title} margam="Jatiswaram" intro={proof.intro} />
      <ol className="border-t border-hairline">
        {stats.map((s, i) => (
          <Reveal as="li" key={s.id} delay={i * 0.04} className="grid gap-x-10 gap-y-3 border-b border-hairline py-8 md:py-10 lg:grid-cols-12 lg:items-baseline">
            <div className="lg:col-span-5">
              <StatValue s={s} />
            </div>
            <p className="text-body measure lg:col-span-5">{s.caption}</p>
            <a href={s.href} className="text-label font-mono text-muted no-underline transition-colors hover:text-accent lg:col-span-2 lg:text-right">
              {s.source}
            </a>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
