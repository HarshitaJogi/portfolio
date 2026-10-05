import { execSync } from "node:child_process";
import { footer, person } from "@/content/profile";
import { Monogram } from "@/components/ui/Monogram";

// Resolved once at build time: the commit this page was built from.
function buildSha() {
  const fromEnv = process.env.VERCEL_GIT_COMMIT_SHA;
  if (fromEnv) return fromEnv.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return null;
  }
}

/** Mangalam, the closing blessing. One line, plus the build it came from. */
export function Footer({ updated }: { updated: string }) {
  const sha = buildSha();
  return (
    <footer id="footer" className="px-gutter mx-auto max-w-[84rem] pt-4 pb-28 md:pb-12">
      <div className="flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Monogram size={32} />
          <p className="kicker text-[0.875rem] text-muted" data-margam="Mangalam">
            {footer.builtWith}
          </p>
        </div>
        <p className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.75rem] text-muted">
          <a href={person.links.source} className="link" target="_blank" rel="noopener noreferrer">
            {footer.source}
          </a>
          <a href="/resume" className="link">
            /resume
          </a>
          <span>
            {sha ? `build ${sha} · ` : ""}
            {updated}
          </span>
        </p>
      </div>
    </footer>
  );
}
