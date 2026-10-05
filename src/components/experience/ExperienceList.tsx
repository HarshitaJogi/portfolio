"use client";

import { useEffect, useRef, useState } from "react";
import { work, type Role } from "@/content/profile";
import { RoleVisual } from "./RoleVisual";
import { cn } from "@/lib/utils";

function RoleRow({
  role,
  current,
  last,
  active,
  onActivate,
}: {
  role: Role;
  current: boolean;
  last: boolean;
  active: boolean;
  onActivate: () => void;
}) {
  return (
    <li className="relative grid grid-cols-[1.5rem_1fr] gap-x-4 md:grid-cols-[2rem_1fr] md:gap-x-6" data-role={role.id}>
      {/* the branch: dashed while in progress, solid once shipped */}
      <div aria-hidden="true" className="relative flex justify-center">
        <span
          className={cn(
            "relative z-10 mt-1.5 grid h-4 w-4 place-items-center rounded-full border transition-shadow",
            current ? "border-dashed border-accent bg-bg" : "border-ink bg-ink",
            active && "shadow-[0_0_0_4px_var(--accent-soft)]",
          )}
        >
          {current && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
        </span>
        {!last && (
          <span className={cn("absolute top-6 bottom-[-1.5rem] w-px", current ? "border-l border-dashed border-line-strong" : "bg-line-strong")} />
        )}
      </div>

      <article
        id={`role-${role.id}`}
        aria-labelledby={`role-${role.id}-name`}
        onMouseEnter={onActivate}
        onFocus={onActivate}
        className={cn("-mx-3 mb-6 rounded-xl px-3 pt-0.5 pb-5 transition-colors lg:cursor-default", active && "lg:bg-surface")}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 id={`role-${role.id}-name`} className="text-[1.375rem] leading-tight font-semibold tracking-[-0.02em] md:text-[1.5rem]">
            {role.company}
            <span className="ml-3 text-[0.9375rem] font-normal tracking-normal text-muted">{role.title}</span>
          </h3>
          <p className="font-mono text-[0.8125rem] text-muted">
            {role.start} – {role.end}
            {current && <span className="chip ml-3 h-6 border-accent/40 bg-accent-soft text-accent">now</span>}
          </p>
        </div>
        <p className="mt-2 max-w-[60ch] text-[1.0625rem] text-ink">{role.oneLiner}</p>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Highlights">
          {role.chips.map((c) => (
            <li key={c} className="chip">
              {c}
            </li>
          ))}
        </ul>
        <details className="group mt-4">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 font-mono text-[0.8125rem] text-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
            <span className="inline-block transition-transform group-open:rotate-90" aria-hidden="true">
              ▸
            </span>
            <span className="group-open:hidden">Details</span>
            <span className="hidden group-open:inline">Hide details</span>
          </summary>
          <div className="mt-4 max-w-[68ch]">
            <ul className="space-y-2.5 text-[0.9375rem] leading-relaxed text-muted">
              {role.bullets.map((b) => (
                <li key={b} className="relative pl-5 before:absolute before:top-[0.7em] before:left-0 before:h-px before:w-2.5 before:bg-line-strong">
                  {b}
                </li>
              ))}
            </ul>
            {role.note && (
              <a href={role.note.href} target="_blank" rel="noopener noreferrer" className="link mt-4 inline-block font-mono text-[0.8125rem] text-muted">
                {role.note.text} ↗
              </a>
            )}
            {/* On small screens the proof visual lives here; on desktop it is in the side panel. */}
            <div className="mt-6 border-t border-line pt-6 lg:hidden">
              <RoleVisual id={role.id} />
            </div>
          </div>
        </details>
      </article>
    </li>
  );
}

/**
 * Roles on the left, proof on the right. The panel follows whichever role you hover,
 * focus, or scroll to, so the evidence is always next to the claim.
 */
export function ExperienceList() {
  const roles = work.roles;
  const [active, setActive] = useState(roles[0].id);
  const list = useRef<HTMLOListElement>(null);
  const hovering = useRef(false);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (hovering.current) return;
        const hit = entries.find((e) => e.isIntersecting);
        const id = hit?.target.getAttribute("data-role");
        if (id) setActive(id);
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    el.querySelectorAll("[data-role]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const role = roles.find((r) => r.id === active)!;

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <ol
        ref={list}
        className="lg:col-span-7"
        onMouseEnter={() => (hovering.current = true)}
        onMouseLeave={() => (hovering.current = false)}
      >
        {roles.map((r, i) => (
          <RoleRow key={r.id} role={r} current={r.end === "Present"} last={i === roles.length - 1} active={active === r.id} onActivate={() => setActive(r.id)} />
        ))}
      </ol>
      <aside className="hidden lg:col-span-5 lg:block" aria-label="Proof for the selected role">
        <div className="panel sticky top-24 p-6">
          <p className="text-label flex items-center justify-between text-muted">
            <span>Proof</span>
            <span className="text-ink">{role.company}</span>
          </p>
          <div key={role.id} className="mt-6 animate-[fadeIn_400ms_var(--ease-settle)]">
            <RoleVisual id={role.id} />
          </div>
        </div>
      </aside>
    </div>
  );
}
