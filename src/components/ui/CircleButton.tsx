import Magnet from "@/components/bits/Magnet";
import { cn } from "@/lib/utils";

/**
 * The site's primary action shape: a circle, not a pill. Leans toward the cursor.
 * The accessible name is the visible text, plus "opens in a new tab" for external links.
 */
export function CircleButton({
  href,
  children,
  sub,
  arrow = false,
  variant = "ink",
  size = 104,
  download,
  external,
  className,
}: {
  href: string;
  children: React.ReactNode;
  sub?: string;
  arrow?: boolean;
  variant?: "ink" | "outline";
  size?: number;
  download?: boolean | string;
  external?: boolean;
  className?: string;
}) {
  return (
    <Magnet padding={40} magnetStrength={5}>
      <a
        href={href}
        download={download}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        style={{ width: size, height: size }}
        className={cn(
          "group relative grid place-items-center rounded-full text-center leading-tight transition-colors duration-200",
          variant === "ink"
            ? "bg-ink text-paper hover:bg-accent"
            : "border border-ink/70 text-ink hover:border-accent hover:text-accent",
          className,
        )}
      >
        <span className="flex flex-col items-center gap-1">
          <span className="text-[0.95rem] font-medium">
            {children}
            {arrow && <span aria-hidden="true"> ↗</span>}
          </span>
          {sub && <span className="font-mono text-[0.6875rem] tracking-[0.08em] uppercase opacity-80">{sub}</span>}
          {external && <span className="sr-only">, opens in a new tab</span>}
        </span>
      </a>
    </Magnet>
  );
}
