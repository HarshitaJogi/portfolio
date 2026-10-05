"use client";

import Link from "next/link";
import { media, person } from "@/content/profile";
import { Monogram } from "./Monogram";
import { CommandTrigger } from "./CommandTrigger";

const links = [
  { href: "/#drone", label: "Work" },
  { href: "/#quests", label: "Projects" },
  { href: "/#you", label: "Contact" },
];

/** Floats over the island. Links sit in a cream pill so they read over any scene. Resume is always one tap away. */
export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="px-gutter mx-auto flex h-16 max-w-[100rem] items-center justify-between gap-4 md:h-[4.5rem]">
        <Link href="/" className="flex items-center gap-3 rounded-full text-ink no-underline" aria-label={`${person.name}, home`}>
          <Monogram size={38} />
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <ul className="mr-2 hidden h-10 items-center gap-0.5 rounded-full border-[3px] border-ink bg-[#fff8ec] px-1.5 shadow-[3px_3px_0_var(--ink)] md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="rounded-full px-3 py-1 text-[0.9375rem] font-semibold text-ink no-underline transition-colors hover:bg-ink/10">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/skim" className="rounded-full px-3 py-1 text-[0.9375rem] font-semibold text-ink no-underline transition-colors hover:bg-ink/10">
                Text version
              </Link>
            </li>
          </ul>
          <CommandTrigger />
          <a href={media.resumePdf} target="_blank" rel="noopener" className="pill h-10 border-[3px] border-ink bg-[#ff6b4a] font-display text-ink no-underline shadow-[3px_3px_0_var(--ink)] transition-transform hover:-translate-y-0.5">
            Resume <span aria-hidden="true">↓</span>
            <span className="sr-only">, PDF, opens in a new tab</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
