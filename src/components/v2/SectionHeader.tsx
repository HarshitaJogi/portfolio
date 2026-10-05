import DecryptedText from "@/components/bits/DecryptedText";
import { cn } from "@/lib/utils";

/** Mono index label that decodes once on view, then a short title. */
export function SectionHeader({
  id,
  index,
  label,
  title,
  margam,
  aside,
  className,
}: {
  id: string;
  index: string;
  label: string;
  title: string;
  margam: string;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14", className)}>
      <div>
        <p className="kicker text-label flex gap-3 text-muted" data-margam={margam}>
          <span className="text-accent">{index}</span>
          <DecryptedText text={label} animateOn="view" sequential speed={35} revealDirection="start" characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_" />
        </p>
        <h2 id={`${id}-title`} className="text-title mt-3">
          {title}
        </h2>
      </div>
      {aside}
    </header>
  );
}
