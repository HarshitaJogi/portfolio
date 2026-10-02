import { education } from "@/content/profile";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Education() {
  return (
    <Section id="education">
      <SectionHeading id="education" index="04" kicker="Study" title={education.title} margam="Varnam" />
      <div className="border-t border-hairline">
        {education.schools.map((s) => (
          <article key={s.id} className="grid gap-x-12 gap-y-4 border-b border-hairline py-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <h3 className="font-display text-[clamp(2rem,1.5rem+1.6vw,3rem)] leading-none">{s.school}</h3>
              <p className="text-label mt-3 font-mono text-muted">
                {s.start} – {s.end} · {s.location}
              </p>
            </div>
            <div className="md:col-span-8">
              <p className="text-lead">{s.degree}</p>
              <p className="font-display mt-2 text-[1.75rem] text-accent">{s.gpa}</p>
              {s.details.length > 0 && (
                <p className="text-body mt-4 text-muted">
                  <span className="text-label mr-3 font-mono">Coursework</span>
                  {s.details.join(", ")}
                </p>
              )}
              {s.awards.length > 0 && (
                <p className="text-body mt-2 text-muted">
                  <span className="text-label mr-3 font-mono">Awards</span>
                  {s.awards.join(", ")}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
