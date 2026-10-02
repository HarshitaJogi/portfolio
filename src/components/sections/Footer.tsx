import { footer, person } from "@/content/profile";
import { Monogram } from "@/components/ui/Monogram";

/** Mangalam: the closing blessing. The line ends where a circle closes. */
export function Footer({ updated }: { updated: string }) {
  return (
    <footer id="footer" className="px-gutter relative mx-auto max-w-[90rem] pt-10 pb-28 md:pb-16">
      <div className="rail relative border-t border-hairline pt-10">
        <span className="line-mark top-[3.6rem]" data-node="ring" aria-hidden="true" />
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <Monogram size={44} />
            <p className="kicker text-[1rem] leading-snug" data-margam="Mangalam">
              {footer.builtWith}
            </p>
          </div>
          <p className="text-label flex flex-wrap gap-x-6 gap-y-2 font-mono text-muted">
            <a href={person.links.source} className="link" target="_blank" rel="noopener noreferrer">
              {footer.source}
            </a>
            <a href="/resume" className="link">
              Printable resume
            </a>
            <span>
              {footer.updated} {updated}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
