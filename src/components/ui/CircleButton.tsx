import Magnet from "@/components/bits/Magnet";
import { cn } from "@/lib/utils";

/** The site's primary action shape: a circle, not a pill. Leans toward the cursor. */
export function CircleButton({
  href,
  children,
  sub,
  variant = "ink",
  size = 104,
  download,
  external,
  className,
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  sub?: string;
  variant?: "ink" | "outline";
  size?: number;
  download?: boolean | string;
  external?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Magnet padding={40} magnetStrength={5}>
      <a
        href={href}
        download={download}
        aria-label={ariaLabel}
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
          <span className="text-[0.95rem] font-medium">{children}</span>
          {sub && <span className="font-mono text-[0.6875rem] tracking-[0.08em] uppercase opacity-75">{sub}</span>}
        </span>
      </a>
    </Magnet>
  );
}
