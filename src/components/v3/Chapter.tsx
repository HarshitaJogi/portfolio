import type { Role } from "@/content/profile";
import { cn } from "@/lib/utils";

/**
 * One role on its colour band: when, who, one line, three chips, details on demand.
 * The visual (a card) sits beside it and does the explaining.
 */
export function Chapter({
  role,
  when,
  visual,
  flip = false,
  extra,
}: {
  role: Role;
  when: string;
  visual: React.ReactNode;
  flip?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <article id={`role-${role.id}`} aria-labelledby={`role-${role.id}-name`} className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
      <div className={cn("lg:col-span-6", flip && "lg:order-2")}>
        <p className="text-label">{when}</p>
        <h3 id={`role-${role.id}-name`} className="text-display mt-4">
          {role.company}
        </h3>
        <p className="mt-4 text-[1.0625rem] font-semibold md:text-[1.25rem]">{role.title}</p>
        <p className="text-lead mt-6 max-w-[34ch]">{role.oneLiner}</p>
        <ul className="mt-7 flex flex-wrap gap-2" aria-label="Highlights">
          {role.chips.map((c) => (
            <li key={c} className="chip">
              {c}
            </li>
          ))}
        </ul>
        {extra}
        <details className="group mt-7">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 font-mono text-[0.8125rem] font-medium [&::-webkit-details-marker]:hidden">
            <span className="grid h-6 w-6 place-items-center rounded-full border-[1.5px] border-current text-[0.75rem] transition-transform group-open:rotate-45" aria-hidden="true">
              +
            </span>
            The details
          </summary>
          <ul className="mt-4 max-w-[60ch] space-y-2.5 text-[0.9375rem] leading-relaxed">
            {role.bullets.map((b) => (
              <li key={b} className="relative pl-5 before:absolute before:top-[0.7em] before:left-0 before:h-[2px] before:w-2.5 before:bg-current">
                {b}
              </li>
            ))}
          </ul>
        </details>
      </div>
      <div className={cn("lg:col-span-6", flip && "lg:order-1")}>{visual}</div>
    </article>
  );
}
