import { hero } from "@/content/profile";
import { DraftText } from "@/components/ui/DraftText";

/**
 * "AI writes the first draft. I make it right." The sentence performs its own claim:
 * "first draft" is dashed construction lines, "right" resolves to solid.
 * Punctuation right after a styled phrase is kept on the same line as it.
 */
export function Headline() {
  const segs = hero.headline;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    if (!seg.mode) {
      out.push(<span key={i}>{seg.text}</span>);
      continue;
    }
    const next = segs[i + 1];
    const glue = next && !next.mode ? (/^[^\s\w]+/.exec(next.text)?.[0] ?? "") : "";
    out.push(
      <span key={i} className="whitespace-nowrap">
        <DraftText text={seg.text} mode={seg.mode} />
        {glue}
      </span>,
    );
    if (glue && next) {
      const rest = next.text.slice(glue.length);
      if (rest) out.push(<span key={`${i}-rest`}>{rest}</span>);
      i += 1;
    }
  }
  return <p className="text-headline text-balance text-ink">{out}</p>;
}
