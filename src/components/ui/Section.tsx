import { cn } from "@/lib/utils";

/**
 * Every section after the hero sits on the rail: content to the right, the page line
 * on the left. A `.line-mark` at the kicker gives the line a node to pass through.
 */
export function Section({
  id,
  children,
  className,
  node = true,
  loop,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  node?: boolean;
  loop?: number;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("px-gutter relative mx-auto max-w-[90rem] py-24 md:py-36", className)}>
      <div className="rail relative">
        <span className="line-mark top-[0.6rem]" data-node={node ? "ring" : undefined} data-loop={loop} aria-hidden="true" />
        {children}
      </div>
    </section>
  );
}

/** A mark for the page line anywhere inside a rail column. */
export function LineMark({ className, node, loop }: { className?: string; node?: boolean; loop?: number }) {
  return <span className={cn("line-mark", className)} data-node={node ? "ring" : undefined} data-loop={loop} aria-hidden="true" />;
}
