import Link from "next/link";
import { person } from "@/content/profile";
import { Monogram } from "./Monogram";
import { ViewToggle } from "./ViewToggle";
import { ThemeToggle } from "./ThemeToggle";
import { CommandTrigger } from "./CommandTrigger";

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-paper/95 supports-[backdrop-filter]:bg-paper/85 supports-[backdrop-filter]:backdrop-blur-[2px]">
      <div className="px-gutter mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 rounded-full text-ink no-underline" aria-label={`${person.name}, home`}>
          <Monogram size={36} />
          <span className="hidden font-mono text-[0.8125rem] tracking-[0.04em] text-muted sm:inline">{person.name}</span>
        </Link>
        <nav aria-label="Site controls" className="flex items-center gap-2 sm:gap-3">
          <CommandTrigger />
          <ViewToggle />
          <ThemeToggle />
        </nav>
      </div>
      <div className="rule-solid" />
    </header>
  );
}
