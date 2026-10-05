import { execSync } from "node:child_process";
import { footer, person } from "@/content/profile";
import { Monogram } from "@/components/ui/Monogram";

function buildSha() {
  const fromEnv = process.env.VERCEL_GIT_COMMIT_SHA;
  if (fromEnv) return fromEnv.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return null;
  }
}

/** Mangalam, the closing blessing. */
export function FooterV3({ updated }: { updated: string }) {
  const sha = buildSha();
  return (
    <footer id="footer" className="band-dark bg-teal text-cream">
      <div className="px-gutter mx-auto flex max-w-[100rem] flex-col gap-6 py-10 pb-28 md:flex-row md:items-center md:justify-between md:pb-10">
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-cream text-ink">
            <Monogram size={40} />
          </span>
          <p className="kicker text-[0.9375rem]" data-margam="Mangalam">
            {footer.builtWith}
          </p>
        </div>
        <p className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.8125rem]">
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
