import type { Metadata } from "next";
import Link from "next/link";
import { bitgig, drone, education, hackathons, media, patent, person, publications, scheduler, toolkit, work } from "@/content/profile";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${person.name}, ${person.role}.`,
  alternates: { canonical: "/resume" },
};

const h2 = "font-mono text-[0.75rem] tracking-[0.1em] uppercase text-accent print:text-black border-b border-hairline pb-1.5 mb-3 mt-7";

/** A clean, printable resume. Same content file as the site. */
export default function ResumePage() {
  return (
    <div className="relative z-10 mx-auto max-w-[52rem] px-5 py-10 text-[0.9375rem] leading-[1.5] print:max-w-none print:p-0 print:text-[10pt] md:py-16">
      <nav className="mb-10 flex items-center justify-between gap-4 print:hidden" aria-label="Resume actions">
        <Link href="/" className="link font-mono text-[0.8125rem]">
          ← Back to the site
        </Link>
        <div className="flex gap-3">
          <PrintButton />
          <a href={media.resumePdf} download className="rounded-full bg-ink px-4 py-2 text-[0.875rem] text-paper hover:bg-accent">
            Download PDF
          </a>
        </div>
      </nav>

      <main id="main">
        <header>
          <h1 className="font-display text-[3rem] leading-none print:text-[28pt]">{person.name}</h1>
          <p className="mt-2">
            {person.role} · {person.location} ·{" "}
            <a className="link" href={`mailto:${person.email}`}>
              {person.email}
            </a>{" "}
            ·{" "}
            <a className="link" href={person.links.linkedin}>
              linkedin.com/in/harshita-jogi-563227215
            </a>{" "}
            ·{" "}
            <a className="link" href={person.links.github}>
              github.com/HarshitaJogi
            </a>
          </p>
          <p className="mt-1 text-muted print:text-black">{person.availability}. Graduating {person.graduation}.</p>
        </header>

        <section aria-labelledby="r-edu">
          <h2 id="r-edu" className={h2}>
            Education
          </h2>
          {education.schools.map((s) => (
            <div key={s.id} className="mb-3">
              <p className="flex flex-wrap justify-between gap-x-4">
                <span>
                  <b>{s.school}</b>, {s.location}
                </span>
                <span>
                  {s.start} – {s.end}
                </span>
              </p>
              <p>
                {s.degree} · {s.gpa}
              </p>
              {s.details.length > 0 && <p className="text-muted print:text-black">Coursework: {s.details.join(", ")}</p>}
              {s.awards.length > 0 && <p className="text-muted print:text-black">Awards: {s.awards.join(", ")}</p>}
            </div>
          ))}
        </section>

        <section aria-labelledby="r-work">
          <h2 id="r-work" className={h2}>
            Experience
          </h2>
          {work.roles.map((r) => (
            <div key={r.id} className="mb-4 break-inside-avoid">
              <p className="flex flex-wrap justify-between gap-x-4">
                <span>
                  <b>{r.company}</b>
                  {r.companyLong ? `, ${r.companyLong}` : ""} · {r.location}
                </span>
                <span>
                  {r.start} – {r.end}
                </span>
              </p>
              <p className="italic">{r.title}</p>
              <ul className="mt-1 list-disc pl-5">
                {r.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section aria-labelledby="r-proj">
          <h2 id="r-proj" className={h2}>
            Projects
          </h2>
          <div className="mb-4 break-inside-avoid">
            <p className="flex flex-wrap justify-between gap-x-4">
              <span>
                <b>{bitgig.name}</b>, {bitgig.event} ·{" "}
                <a className="link" href={bitgig.live}>
                  live demo
                </a>
              </span>
              <span>{bitgig.date}</span>
            </p>
            <ul className="mt-1 list-disc pl-5">
              {bitgig.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4 break-inside-avoid">
            <p className="flex flex-wrap justify-between gap-x-4">
              <span>
                <b>{drone.fullName}</b>, {drone.funding} ({drone.grant}), {drone.role}
              </span>
              <span>
                {drone.start} – {drone.end}
              </span>
            </p>
            <ul className="mt-1 list-disc pl-5">
              {drone.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4 break-inside-avoid">
            <p className="flex flex-wrap justify-between gap-x-4">
              <span>
                <b>{scheduler.name}</b>, {scheduler.meta}
              </span>
              <span>
                {scheduler.start} – {scheduler.end}
              </span>
            </p>
            <ul className="mt-1 list-disc pl-5">
              {scheduler.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <p>
            <b>{hackathons.tickets[1].project}</b>, {hackathons.tickets[1].event}, {hackathons.tickets[1].date}.{" "}
            {hackathons.tickets[1].line}. {hackathons.tickets[1].stub}, {hackathons.tickets[1].stamp}.
          </p>
        </section>

        <section aria-labelledby="r-pub">
          <h2 id="r-pub" className={h2}>
            Publications and patent
          </h2>
          <ul className="space-y-1.5">
            {publications.map((p) => (
              <li key={p.id}>
                {p.authors}, &ldquo;
                <a className="link" href={p.href}>
                  {p.title}
                </a>
                ,&rdquo; <i>{p.venue}</i>, {p.pages}, {p.year}.
              </li>
            ))}
            <li>
              {patent.status}: {patent.title}.
            </li>
          </ul>
        </section>

        <section aria-labelledby="r-skills">
          <h2 id="r-skills" className={h2}>
            Skills
          </h2>
          <ul className="space-y-0.5">
            {toolkit.cards.map((c) => (
              <li key={c.id}>
                <b>{c.title}:</b> {c.skills.join(", ")}
              </li>
            ))}
            {toolkit.alsoFamiliar.length > 0 && (
              <li>
                <b>{toolkit.alsoLabel}:</b> {toolkit.alsoFamiliar.join(", ")}
              </li>
            )}
          </ul>
        </section>

        <section aria-labelledby="r-more">
          <h2 id="r-more" className={h2}>
            Also
          </h2>
          <p>Kovida degree in Bharatanatyam, Nalanda Dance Research Center. Trinity College London, Communication Skills Grade 5 with Distinction.</p>
        </section>
      </main>
    </div>
  );
}
