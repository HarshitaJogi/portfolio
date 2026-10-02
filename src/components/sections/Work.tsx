import dynamic from "next/dynamic";
import { work, type Role } from "@/content/profile";
import { Section, LineMark } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
const NokiaAgent = dynamic(() => import("@/components/work/NokiaAgent").then((m) => m.NokiaAgent));
const NsiAccuracy = dynamic(() => import("@/components/work/NsiAccuracy").then((m) => m.NsiAccuracy));
const MsciMigration = dynamic(() => import("@/components/work/MsciMigration").then((m) => m.MsciMigration));

const moments: Record<string, React.ReactNode> = {
  nokia: <NokiaAgent />,
  nsi: <NsiAccuracy />,
  msci: <MsciMigration />,
};

function RoleEntry({ role }: { role: Role }) {
  return (
    <article id={`role-${role.id}`} aria-labelledby={`role-${role.id}-name`} className="relative grid gap-x-12 gap-y-6 border-t border-hairline pt-10 md:pt-14 lg:grid-cols-12">
      <header className="relative lg:col-span-4">
        <LineMark node className="top-[1.4rem] md:top-[2rem]" />
        <div className="lg:sticky lg:top-24">
          <h3 id={`role-${role.id}-name`} className="font-display text-company">
            {role.company}
          </h3>
          {role.companyLong && <p className="mt-2 text-[1rem] text-muted">{role.companyLong}</p>}
          <p className="mt-4 text-[1.0625rem] leading-snug font-medium">{role.title}</p>
          <p className="text-label mt-3 font-mono text-muted">
            {role.start} – {role.end} · {role.location}
          </p>
          {role.note && (
            <a href={role.note.href} className="link mt-3 inline-block text-[0.9375rem] text-muted" target="_blank" rel="noopener noreferrer">
              {role.note.text} ↗
            </a>
          )}
        </div>
      </header>
      <div className="lg:col-span-8">
        <Reveal>
          <p className="font-display text-[clamp(1.625rem,1.2rem+1.3vw,2.375rem)] leading-[1.2]">{role.framing}</p>
        </Reveal>
        <ul className="text-body mt-8 space-y-4">
          {role.bullets.map((b) => (
            <li key={b} className="measure relative pl-6 before:absolute before:top-[0.8em] before:left-0 before:h-px before:w-3 before:bg-rule">
              {b}
            </li>
          ))}
        </ul>
        {role.stack && <p className="text-label mt-6 font-mono text-muted">{role.stack.join(" · ")}</p>}
        {moments[role.id]}
        {role.id === "iitp" && (
          <a href="#project-drone" className="link text-label mt-8 inline-block font-mono text-muted">
            Continues in Projects: drone research ↓
          </a>
        )}
      </div>
    </article>
  );
}

/** Varnam: the centerpiece. Reverse chronological. */
export function Work() {
  return (
    <Section id="work">
      <SectionHeading id="work" index="03" kicker="Experience" title={work.title} margam="Varnam" />
      <div className="space-y-20 md:space-y-28">
        {work.roles.map((r) => (
          <RoleEntry key={r.id} role={r} />
        ))}
      </div>
    </Section>
  );
}
