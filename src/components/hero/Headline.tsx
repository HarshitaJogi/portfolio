import { hero } from "@/content/profile";
import { DraftText } from "@/components/ui/DraftText";

/** "AI writes the first draft. I make it right." The sentence performs its own claim. */
export function Headline() {
  return (
    <p className="font-display text-headline text-ink">
      {hero.headline.map((seg, i) =>
        seg.mode ? (
          <DraftText key={i} text={seg.text} mode={seg.mode} className={seg.mode === "resolve" ? "italic" : undefined} />
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </p>
  );
}
