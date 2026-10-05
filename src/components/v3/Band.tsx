import { cn } from "@/lib/utils";

export type Tone = "red" | "marigold" | "teal" | "green" | "pink" | "indigo" | "cream";

const tones: Record<Tone, string> = {
  red: "bg-red text-cream band-dark",
  marigold: "bg-marigold text-ink",
  teal: "bg-teal text-cream band-dark",
  green: "bg-green text-ink",
  pink: "bg-pink text-cream band-dark",
  indigo: "bg-indigo text-cream band-dark",
  cream: "bg-cream text-ink",
};

/** A full-bleed colour band. One chapter, one colour, lots of air. */
export function Band({
  id,
  tone,
  children,
  className,
  labelledBy,
}: {
  id: string;
  tone: Tone;
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("relative overflow-hidden", tones[tone], className)}>
      <div className="px-gutter relative mx-auto max-w-[100rem] py-20 md:py-28 lg:py-32">{children}</div>
    </section>
  );
}

/** Mono label: "01 / Experience". The margam name appears on hover after the reveal. */
export function BandLabel({ index, children, margam }: { index: string; children: React.ReactNode; margam?: string }) {
  return (
    <p className="kicker text-label flex items-center gap-3" data-margam={margam}>
      <span className="grid h-7 min-w-7 place-items-center rounded-full border-[1.5px] border-current px-1.5">{index}</span>
      {children}
    </p>
  );
}
