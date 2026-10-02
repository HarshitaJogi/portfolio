import { bitgig, drone, education, hackathons, media, patent, person, publications, scheduler, toolkit, work } from "@/content/profile";

/**
 * Skim: everything a recruiter needs on one screen. Roles, dates, numbers, links,
 * resume. Served at /skim.
 */
export function SkimView() {
  const label = "text-label font-mono text-muted";
  return (
    <section aria-labelledby="skim-title" className="px-gutter mx-auto max-w-[90rem] pt-24 pb-16 md:pt-28">
      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h1 id="skim-title" className="font-display text-[clamp(3rem,2rem+3vw,4.5rem)] leading-[0.92]">
            {person.name}
          </h1>
          <p className="mt-3 text-[1.0625rem]">
            {person.role}, {person.focus}. {person.location}.
          </p>
          <p className="mt-2 flex items-center gap-2 text-[1rem] font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true" /> {person.availability}
          </p>
          <ul className="mt-5 space-y-1.5 text-[1rem]">
            <li>
              <a className="link" href={`mailto:${person.email}`}>
                {person.email}
              </a>
            </li>
            <li>
              <a className="link" href={person.links.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <span className="mx-2 text-rule">/</span>
              <a className="link" href={person.links.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
          </ul>
          <a
            href={media.resumePdf}
            target="_blank"
            rel="noopener"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-6 text-[0.9375rem] font-medium text-paper hover:bg-accent"
          >
            Resume PDF
          </a>

          <h2 className={`${label} mt-10`}>Education</h2>
          <ul className="mt-3 space-y-3 text-[0.9375rem] leading-snug">
            {education.schools.map((s) => (
              <li key={s.id}>
                <span className="font-medium">{s.school}</span>, {s.degree}
                <br />
                <span className="text-muted">
                  {s.start} – {s.end} · {s.gpa}
                </span>
              </li>
            ))}
          </ul>

          <h2 className={`${label} mt-8`}>Skills</h2>
          <ul className="mt-3 space-y-1.5 text-[0.9375rem] leading-snug">
            {toolkit.cards.map((c) => (
              <li key={c.id}>
                <span className="font-medium">{c.title}:</span> {c.skills.join(", ")}
              </li>
            ))}
            <li>
              <span className="font-medium">{toolkit.alsoLabel}:</span> {toolkit.alsoFamiliar.join(", ")}
            </li>
          </ul>
        </div>

        <div className="lg:col-span-8">
          <h2 className={label}>Experience</h2>
          <ol className="mt-3 divide-y divide-hairline border-y border-hairline">
            {work.roles.map((r) => (
              <li key={r.id} className="grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[11rem_1fr]">
                <div>
                  <p className="font-display text-[1.625rem] leading-none">{r.company}</p>
                  <p className="mt-1 font-mono text-[0.75rem] text-muted">
                    {r.start} – {r.end}
                  </p>
                </div>
                <div>
                  <p className="text-[1rem] font-medium">{r.title}</p>
                  <p className="mt-1 text-[0.9375rem] leading-snug text-muted">{r.bullets[r.id === "nokia" ? 1 : 0]}</p>
                  {r.id !== "nokia" && r.bullets[1] && <p className="mt-1 text-[0.9375rem] leading-snug text-muted">{r.bullets[1]}</p>}
                  {r.id === "nokia" && <p className="mt-1 text-[0.9375rem] leading-snug text-muted">{r.bullets[2]}</p>}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className={label}>Projects</h2>
              <ul className="mt-3 space-y-3 text-[0.9375rem] leading-snug">
                <li>
                  <a className="link font-medium" href={bitgig.live} target="_blank" rel="noopener noreferrer">
                    {bitgig.name}
                  </a>{" "}
                  · {bitgig.event}, {bitgig.date}
                  <br />
                  <span className="text-muted">{bitgig.tagline}</span>
                </li>
                <li>
                  <span className="font-medium">{drone.fullName}</span> · {drone.grant} {drone.funding}, {drone.role}
                </li>
                <li>
                  <span className="font-medium">{scheduler.name}</span> · {scheduler.meta}
                </li>
                <li>
                  <span className="font-medium">{hackathons.tickets[1].project}</span> · {hackathons.tickets[1].event},{" "}
                  {hackathons.tickets[1].stub}, {hackathons.tickets[1].stamp}
                </li>
              </ul>
            </div>
            <div>
              <h2 className={label}>Research</h2>
              <ul className="mt-3 space-y-3 text-[0.9375rem] leading-snug">
                {publications.map((p) => (
                  <li key={p.id}>
                    <a className="link" href={p.href} target="_blank" rel="noopener noreferrer">
                      {p.title}
                    </a>
                    <span className="text-muted">, IEEE SPACE {p.year}</span>
                  </li>
                ))}
                <li>
                  {patent.status}: <span className="text-muted">{patent.title}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
