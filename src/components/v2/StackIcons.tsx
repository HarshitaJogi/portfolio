import { ICONS, type IconSlug } from "@/content/icons.generated";
import { cn } from "@/lib/utils";

export function BrandIcon({ slug, size = 16, className }: { slug: IconSlug; size?: number; className?: string }) {
  const icon = ICONS[slug];
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} role="img" aria-label={icon.title}>
      <path d={icon.path} />
    </svg>
  );
}

/** A quiet row of brand marks, for a project's stack. */
export function StackIcons({ slugs, className }: { slugs: readonly IconSlug[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-3 text-muted", className)} aria-label="Built with">
      {slugs.map((s) => (
        <li key={s} title={ICONS[s].title} className="transition-colors hover:text-ink">
          <BrandIcon slug={s} size={18} />
        </li>
      ))}
    </ul>
  );
}
