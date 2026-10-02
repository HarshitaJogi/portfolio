import { Kicker } from "./Kicker";
import { cn } from "@/lib/utils";

/** Section title with a masked line-rise (CSS, see [data-reveal="rise"]). The text is always in the DOM. */
export function SectionHeading({
  id,
  index,
  kicker,
  title,
  margam,
  intro,
  className,
}: {
  id: string;
  index: string;
  kicker: string;
  title: string;
  margam: string;
  intro?: string;
  className?: string;
}) {
  return (
    <header className={cn("mb-14 md:mb-20", className)}>
      <Kicker index={index} margam={margam}>
        {kicker}
      </Kicker>
      <h2 id={`${id}-title`} className="font-display text-title mt-5 overflow-hidden pb-[0.08em]" data-reveal="rise">
        <span className="block">{title}</span>
      </h2>
      {intro && <p className="text-lead text-muted mt-6 measure">{intro}</p>}
    </header>
  );
}
