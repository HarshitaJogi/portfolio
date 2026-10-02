import dynamic from "next/dynamic";
import { bitgig, drone, hackathons, projectOrder, scheduler, type ProjectId, type TrackOrDefault } from "@/content/profile";
import { Section, LineMark } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { CircleButton } from "@/components/ui/CircleButton";
const BitgigMedia = dynamic(() => import("@/components/projects/BitgigMedia").then((m) => m.BitgigMedia));
const BitgigPipeline = dynamic(() => import("@/components/projects/BitgigPipeline").then((m) => m.BitgigPipeline));
const DroneMedia = dynamic(() => import("@/components/projects/DroneMedia").then((m) => m.DroneMedia));
const Research = dynamic(() => import("@/components/projects/Research").then((m) => m.Research));
const HackathonTickets = dynamic(() => import("@/components/projects/HackathonTickets").then((m) => m.HackathonTickets));

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="text-body space-y-4">
      {items.map((b) => (
        <li key={b} className="measure relative pl-6 before:absolute before:top-[0.8em] before:left-0 before:h-px before:w-3 before:bg-rule">
          {b}
        </li>
      ))}
    </ul>
  );
}

function Bitgig() {
  return (
    <article id="project-bitgig" aria-labelledby="project-bitgig-name" className="relative border-t border-hairline pt-12">
      <LineMark node className="top-[4.2rem]" />
      <p className="text-label font-mono text-muted">
        {bitgig.event} · {bitgig.date}
      </p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <h3 id="project-bitgig-name" className="font-display text-title">
          {bitgig.name}
        </h3>
        <CircleButton href={bitgig.live} external variant="outline" size={92} sub="Live" arrow>
          Demo
        </CircleButton>
      </div>
      <p className="text-lead mt-4 max-w-[40ch]">{bitgig.tagline}</p>
      {bitgig.team && <p className="text-label mt-3 font-mono text-muted">Built with {bitgig.team}</p>}
      <div className="mt-10">
        <BitgigMedia />
      </div>
      <BitgigPipeline />
      <div className="mt-12 grid gap-8 md:grid-cols-12">
        <p className="text-label font-mono text-ink md:col-span-3">What I built</p>
        <div className="md:col-span-9">
          <Bullets items={bitgig.bullets} />
          <p className="text-label mt-6 font-mono text-muted">{bitgig.stack.join(" · ")}</p>
        </div>
      </div>
    </article>
  );
}

function Drone() {
  return (
    <article id="project-drone" aria-labelledby="project-drone-name" className="relative border-t border-hairline pt-12">
      <LineMark node className="top-[4.2rem]" />
      <p className="text-label font-mono text-muted">
        {drone.funding} · {drone.start} – {drone.end}
      </p>
      <div className="mt-4 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <h3 id="project-drone-name" className="font-display text-[clamp(2.5rem,1.6rem+3.2vw,4.5rem)] leading-[0.95]">
            {drone.name}
          </h3>
          <p className="text-lead mt-5">{drone.tagline}</p>
          <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <dt className="text-label font-mono text-muted">Grant</dt>
              <dd className="font-display text-[2.25rem] leading-none text-accent">{drone.grant}</dd>
            </div>
            <div>
              <dt className="text-label font-mono text-muted">Role</dt>
              <dd className="font-display text-[2.25rem] leading-none">{drone.role}</dd>
            </div>
          </dl>
          <div className="mt-8">
            <Bullets items={drone.bullets} />
          </div>
          <p className="mt-6 text-[0.9375rem] text-muted">{drone.fullName}</p>
        </div>
        <div className="md:col-span-6">
          <DroneMedia />
        </div>
      </div>
      <Research />
    </article>
  );
}

function Scheduler() {
  return (
    <article id="project-scheduler" aria-labelledby="project-scheduler-name" className="relative grid gap-8 border-t border-hairline pt-12 md:grid-cols-12">
      <LineMark node className="top-[4rem]" />
      <div className="md:col-span-4">
        <p className="text-label font-mono text-muted">
          {scheduler.meta} · {scheduler.start} – {scheduler.end}
        </p>
        <h3 id="project-scheduler-name" className="font-display mt-4 text-[clamp(2rem,1.5rem+1.6vw,3rem)] leading-tight">
          {scheduler.name}
        </h3>
        <p className="mt-6 flex flex-wrap gap-x-4 gap-y-2" aria-label="Design patterns">
          {scheduler.patterns.map((p, i) => (
            <span key={p} className="font-mono text-[0.875rem] text-ink">
              {p}
              {i < scheduler.patterns.length - 1 && <span className="ml-4 text-rule">/</span>}
            </span>
          ))}
        </p>
      </div>
      <div className="md:col-span-8">
        <Bullets items={scheduler.bullets} />
      </div>
    </article>
  );
}

function Hackathons() {
  return (
    <article id="project-hackathons" aria-labelledby="project-hackathons-name" className="relative border-t border-hairline pt-12">
      <LineMark node className="top-[4rem]" />
      <h3 id="project-hackathons-name" className="font-display text-[clamp(2rem,1.5rem+1.6vw,3rem)] leading-tight">
        {hackathons.title}
      </h3>
      <p className="text-label mt-3 font-mono text-muted">Tear a stub to stamp the ticket</p>
      <HackathonTickets />
    </article>
  );
}

const blocks: Record<ProjectId, () => React.ReactNode> = {
  bitgig: Bitgig,
  drone: Drone,
  scheduler: Scheduler,
  hackathons: Hackathons,
};

export function Projects({ track }: { track: TrackOrDefault }) {
  return (
    <Section id="projects">
      <SectionHeading id="projects" index="05" kicker="Selected work" title="Projects" margam="Varnam" />
      <div className="space-y-24 md:space-y-32">
        {projectOrder[track].map((id) => {
          const Block = blocks[id];
          return (
            <Reveal key={id}>
              <Block />
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
