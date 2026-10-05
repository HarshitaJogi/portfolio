"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { media, person } from "@/content/profile";
import { Monogram } from "./Monogram";
import { CommandTrigger } from "./CommandTrigger";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/#projects", label: "Projects" },
  { href: "/#offstage", label: "Off-stage" },
  { href: "/#contact", label: "Contact" },
];

/** Transparent over the hero, cream once you scroll. Resume is always one tap away. */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300",
        scrolled ? "bg-cream/92 shadow-[0_1px_0_var(--line)] backdrop-blur-sm" : "bg-transparent",
      )}
    >
      <div className="px-gutter mx-auto flex h-16 max-w-[100rem] items-center justify-between gap-4 md:h-[4.5rem]">
        <Link href="/" className="flex items-center gap-3 rounded-full text-ink no-underline" aria-label={`${person.name}, home`}>
          <Monogram size={38} />
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <ul className="mr-2 hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="rounded-full px-3 py-2 text-[0.9375rem] font-semibold text-ink no-underline transition-colors hover:bg-ink/5">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/skim" className="rounded-full px-3 py-2 text-[0.9375rem] font-semibold text-ink no-underline transition-colors hover:bg-ink/5">
                1-page
              </Link>
            </li>
          </ul>
          <CommandTrigger />
          <a href={media.resumePdf} target="_blank" rel="noopener" className="pill bg-red text-cream no-underline transition-transform hover:-translate-y-0.5">
            Resume <span aria-hidden="true">↓</span>
            <span className="sr-only">, PDF, opens in a new tab</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
