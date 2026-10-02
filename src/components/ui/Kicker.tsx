import { cn } from "@/lib/utils";

/**
 * Small mono label above a section title. `margam` is revealed on hover only after the
 * reader reaches the margam reveal (html[data-margam="seen"], see globals.css).
 */
export function Kicker({
  index,
  children,
  margam,
  className,
}: {
  index?: string;
  children: React.ReactNode;
  margam?: string;
  className?: string;
}) {
  return (
    <p className={cn("kicker text-label font-mono text-muted flex items-baseline gap-3", className)} data-margam={margam}>
      {index && <span className="text-accent tabular-nums">{index}</span>}
      <span>{children}</span>
    </p>
  );
}
