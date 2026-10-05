import { education } from "@/content/profile";
import { SectionHeader } from "@/components/v2/SectionHeader";
import { ExperienceList } from "@/components/experience/ExperienceList";

/** Shabdam, the story. Reverse chronological, one line each, proof beside it, details on demand. */
export function Experience() {
  return (
    <section id="work" aria-labelledby="work-title" className="px-gutter mx-auto max-w-[84rem] py-20 md:py-28">
      <SectionHeader id="work" index="01" label="EXPERIENCE" title="Where I have shipped" margam="Shabdam" />
      <ExperienceList />

      <div id="education" className="mt-6 border-t border-line pt-8">
        <h3 className="text-label text-muted">Education</h3>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {education.schools.map((s) => (
            <li key={s.id} className="panel p-5">
              <p className="font-semibold">{s.school}</p>
              <p className="mt-1 text-[0.9375rem] text-muted">{s.degree}</p>
              <p className="mt-3 flex flex-wrap gap-2">
                <span className="chip">{s.gpa}</span>
                <span className="chip">
                  {s.start} – {s.end}
                </span>
                {s.awards.map((a) => (
                  <span key={a} className="chip">
                    {a}
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
