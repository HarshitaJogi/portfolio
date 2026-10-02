import { cn } from "@/lib/utils";

/**
 * The quiet default entrance, as a server component. RevealController flips
 * [data-reveal] to [data-in] when it enters the viewport and CSS does the rest.
 * Never starts invisible (opacity 0.6), and without JS everything is simply shown.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article" | "p";
}) {
  return (
    <Tag data-reveal="" className={cn(className)} style={delay ? ({ "--reveal-delay": `${Math.round(delay * 1000)}ms` } as React.CSSProperties) : undefined}>
      {children}
    </Tag>
  );
}
