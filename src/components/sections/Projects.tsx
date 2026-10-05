import dynamic from "next/dynamic";
import Image from "next/image";
import { bitgig, drone, media, patent, projectCards, projectOrder, publications, scheduler, type ProjectId, type TrackOrDefault } from "@/content/profile";
import { SectionHeader } from "@/components/v2/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { StackIcons } from "@/components/v2/StackIcons";

const BitgigCard = dynamic(() => import("@/components/projects/BitgigCard").then((m) => m.BitgigCard));
const HackathonTickets = dynamic(() => import("@/components/projects/HackathonTickets").then((m) => m.HackathonTickets));

function Chips({ items, accentFirst = false }: { items: readonly string[]; accentFirst?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((c, i) => (
        <li key={c} className={accentFirst && i === 0 ? "chip border-accent/40 bg-accent-soft" : "chip"}>
          {c}
        </li>
      ))}
    </ul>
  );
}

function MoreDetails({ items }: { items: string[] }) {
  return (
    <details className="group mt-5">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 font-mono text-[0.8125rem] text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
        <span className="inline-block transition-transform group-open:rotate-90" aria-hidden="true">
          ▸
        </span>
        What I built
      </summary>
      <ul className="mt-3 space-y-2 text-[0.9375rem] leading-relaxed text-muted">
        {items.map((b) => (
          <li key={b} className="relative pl-5 before:absolute before:top-[0.7em] before:left-0 before:h-px before:w-2.5 before:bg-line-strong">
            {b}
          </li>
        ))}
      </ul>
    </details>
  );
}

function Bitgig() {
  const c = projectCards.bitgig;
  return (
    <article id="project-bitgig" aria-labelledby="project-bitgig-name" className="panel grid gap-8 p-5 md:p-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-7">
        <BitgigCard />
      </div>
      <div className="flex flex-col lg:col-span-5">
        <p className="text-label text-muted">
          {bitgig.event} · {bitgig.date}
        </p>
        <h3 id="project-bitgig-name" className="mt-3 text-[2rem] leading-none font-semibold tracking-[-0.035em] md:text-[2.5rem]">
          {bitgig.name}
        </h3>
        <p className="mt-3 text-[1.0625rem]">{c.oneLiner}</p>
        <div className="mt-5">
          <Chips items={c.chips} />
        </div>
        <StackIcons slugs={c.icons} className="mt-5" />
        <MoreDetails items={bitgig.bullets} />
        <div className="mt-auto flex gap-3 pt-6">
          <a href={bitgig.live} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-[0.875rem] font-medium text-bg hover:bg-accent">
            Live demo ↗<span className="sr-only">, opens in a new tab</span>
          </a>
          {bitgig.repo && (
            <a href={bitgig.repo} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-[0.875rem] hover:border-ink">
              Code ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function Drone() {
  const c = projectCards.drone;
  return (
    <article id="project-drone" aria-labelledby="project-drone-name" className="panel grid gap-8 p-5 md:p-8 lg:grid-cols-12 lg:gap-10">
      <div className="flex flex-col lg:col-span-5">
        <p className="text-label text-muted">
          {drone.funding} · {drone.start} – {drone.end}
        </p>
        <h3 id="project-drone-name" className="mt-3 text-[2rem] leading-[1.02] font-semibold tracking-[-0.035em] md:text-[2.5rem]">
          {drone.name}
        </h3>
        <p className="mt-3 text-[1.0625rem]">{c.oneLiner}</p>
        <div className="mt-5">
          <Chips items={c.chips} accentFirst />
        </div>
        <p className="mt-4 font-mono text-[0.8125rem] text-muted">{c.specs.join("  ·  ")}</p>
        <ul className="mt-6 space-y-2 border-t border-line pt-5 text-[0.9375rem]">
          {publications.map((p) => (
            <li key={p.id}>
              <a href={p.href} target="_blank" rel="noopener noreferrer" className="link">
                {p.title}
              </a>
              <span className="ml-2 font-mono text-[0.75rem] text-muted">IEEE SPACE {p.year}</span>
            </li>
          ))}
          <li className="text-muted">
            {patent.status}: {patent.title}
          </li>
        </ul>
      </div>
      <figure className="lg:col-span-7">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-surface-2">
          <Image src={media.drone.src} alt={media.drone.alt} fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
        </div>
      </figure>
    </article>
  );
}

function Small() {
  return (
    <div id="project-hackathons" className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <h3 className="text-label text-muted">Hackathons · tear a stub</h3>
        <HackathonTickets />
      </div>
      <article id="project-scheduler" aria-labelledby="project-scheduler-name" className="panel flex flex-col p-6 lg:col-span-4">
        <p className="text-label text-muted">
          {scheduler.meta} · {scheduler.start} – {scheduler.end}
        </p>
        <h3 id="project-scheduler-name" className="mt-3 text-[1.375rem] leading-tight font-semibold tracking-[-0.02em]">
          {scheduler.name}
        </h3>
        <p className="mt-2 text-[0.9375rem] text-muted">{projectCards.scheduler.oneLiner}</p>
        <div className="mt-4">
          <Chips items={scheduler.patterns} />
        </div>
      </article>
    </div>
  );
}

const blocks: Record<ProjectId, () => React.ReactNode> = { bitgig: Bitgig, drone: Drone, scheduler: () => null, hackathons: Small };

export function Projects({ track }: { track: TrackOrDefault }) {
  return (
    <section id="projects" aria-labelledby="projects-title" className="px-gutter mx-auto max-w-[84rem] py-20 md:py-28">
      <SectionHeader id="projects" index="02" label="PROJECTS" title="Things I built" margam="Varnam" />
      <div className="space-y-6">
        {projectOrder[track].filter((id) => id !== "scheduler").map((id) => {
          const Block = blocks[id];
          return (
            <Reveal key={id}>
              <Block />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
