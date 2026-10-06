"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { worldNav } from "@/world/nav";
import { cn } from "@/lib/utils";
import { media, person } from "@/content/profile";
import { Monogram } from "./Monogram";
import { CommandTrigger } from "./CommandTrigger";
import { PassportPill } from "@/components/v5/Passport";
import { SoundToggle } from "@/components/v5/SoundToggle";

const links = [
  { href: "/education", label: "Education" },
  { href: "/skills", label: "Skills" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/offstage", label: "Off-stage" },
];

/** Links fly through the clouds (worldNav) unless the visitor asked for a new tab. */
const fly = (href: string) => (e: React.MouseEvent) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  worldNav.go(href);
};

/** Floats over the island. Links sit in a cream pill so they read over any scene. Resume is always one tap away. */
export function Nav() {
  const pathname = usePathname();
  const inWorld = pathname !== "/";
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="px-gutter mx-auto flex h-[4.5rem] max-w-[110rem] items-center justify-between gap-3 md:h-[5.5rem]">
        <div className="flex items-center gap-2">
          <Link href="/" onClick={fly("/")} className={cn("flex items-center rounded-full text-ink no-underline", inWorld && "max-sm:hidden")} aria-label={`${person.name}, the island`}>
            <Monogram size={48} />
          </Link>
          {inWorld && (
            <Link
              href="/"
              onClick={fly("/")}
              className="inline-flex h-12 items-center gap-1.5 rounded-full border-[3px] border-ink bg-[#fff8ec] px-4 font-display text-[1.125rem] text-ink no-underline shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              <span aria-hidden="true">←</span> <span className="max-sm:sr-only">Island</span>
            </Link>
          )}
        </div>
        <nav aria-label="Primary" className="flex items-center gap-1.5 sm:gap-2">
          <ul className="mr-1 hidden h-[3.25rem] items-center gap-0.5 rounded-full border-[3px] border-ink bg-[#fff8ec] px-1.5 shadow-[4px_4px_0_var(--ink)] xl:flex">
            {links.map((l) => {
              const on = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={fly(l.href)}
                    aria-current={on ? "page" : undefined}
                    className={cn("rounded-full px-3.5 py-1.5 text-[1.125rem] font-extrabold no-underline transition-colors", on ? "bg-ink text-[#fff8ec]" : "text-ink hover:bg-ink/10")}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href="/skim" className="rounded-full px-3.5 py-1.5 text-[1.125rem] font-extrabold text-ink no-underline transition-colors hover:bg-ink/10">
                Text version
              </Link>
            </li>
          </ul>
          <SoundToggle />
          <PassportPill />
          <CommandTrigger />
          <a href={media.resumePdf} target="_blank" rel="noopener" className="pill h-12 border-[3px] border-ink bg-[#ff6b4a] px-5 font-display text-[1.125rem] max-sm:hidden! text-ink no-underline shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5">
            Resume <span aria-hidden="true">↓</span>
            <span className="sr-only">, PDF, opens in a new tab</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
