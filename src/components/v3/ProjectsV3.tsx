import dynamic from "next/dynamic";
import { bitgig, education, projectCards, scheduler } from "@/content/profile";
import { Band, BandLabel } from "./Band";

const BitgigCard = dynamic(() => import("@/components/projects/BitgigCard").then((m) => m.BitgigCard));
const HackathonTickets = dynamic(() => import("@/components/projects/HackathonTickets").then((m) => m.HackathonTickets));

/** Varnam, the centerpiece. Bitgig on its own band, then the smaller things. */
export function ProjectsV3() {
  const c = projectCards.bitgig;
  return (
    <div id="projects" aria-labelledby="projects-title">
      <h2 id="projects-title" className="sr-only">
        Projects
      </h2>

      <Band id="project-bitgig" tone="pink" labelledBy="project-bitgig-name">
        <BandLabel index="03" margam="Varnam">
          Projects · {bitgig.event}
        </BandLabel>
        <div className="mt-10 grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h3 id="project-bitgig-name" className="text-display">
              {bitgig.name}
            </h3>
            <p className="text-lead mt-6 max-w-[30ch]">{c.oneLiner}</p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {c.chips.map((x) => (
                <li key={x} className="chip">
                  {x}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href={bitgig.live} target="_blank" rel="noopener noreferrer" className="pill h-12 bg-cream px-6 text-[1rem] text-ink no-underline shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5">
                Try the live demo ↗<span className="sr-only">, opens in a new tab</span>
              </a>
              <span className="font-mono text-[0.8125rem]">{bitgig.date}</span>
            </div>
            <details className="group mt-8">
              <summary className="inline-flex cursor-pointer list-none items-center gap-2 font-mono text-[0.8125rem] font-medium [&::-webkit-details-marker]:hidden">
                <span className="grid h-6 w-6 place-items-center rounded-full border-[1.5px] border-current text-[0.75rem] transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
                What I built
              </summary>
              <ul className="mt-4 space-y-2.5 text-[0.9375rem] leading-relaxed">
                {bitgig.bullets.map((b) => (
                  <li key={b} className="relative pl-5 before:absolute before:top-[0.7em] before:left-0 before:h-[2px] before:w-2.5 before:bg-current">
                    {b}
                  </li>
                ))}
              </ul>
            </details>
          </div>
          <div className="card p-4 md:p-6 lg:col-span-7 lg:-rotate-1">
            <BitgigCard />
          </div>
        </div>
      </Band>

      <Band id="project-hackathons" tone="indigo" labelledBy="more-title">
        <h3 id="more-title" className="text-title">
          Also built, also learned.
        </h3>
        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-label">Hackathons · tear a stub</p>
            <div className="text-ink">
              <HackathonTickets />
            </div>
          </div>
          <div className="space-y-6 lg:col-span-5">
            <article id="project-scheduler" className="card p-6">
              <p className="text-label text-muted">
                {scheduler.meta} · {scheduler.start} – {scheduler.end}
              </p>
              <h4 className="mt-3 text-[1.375rem] leading-tight font-bold">{scheduler.name}</h4>
              <p className="mt-2 text-[0.9375rem] text-muted">{projectCards.scheduler.oneLiner}</p>
            </article>
            <div id="education" className="card p-6">
              <p className="text-label text-muted">Education</p>
              <ul className="mt-4 space-y-4">
                {education.schools.map((s) => (
                  <li key={s.id}>
                    <p className="text-[1.125rem] leading-tight font-bold">{s.school}</p>
                    <p className="mt-1 text-[0.9375rem] text-muted">{s.degree}</p>
                    <p className="mt-2 flex flex-wrap gap-2">
                      <span className="chip bg-marigold">{s.gpa}</span>
                      <span className="chip">
                        {s.start} – {s.end}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Band>
    </div>
  );
}
