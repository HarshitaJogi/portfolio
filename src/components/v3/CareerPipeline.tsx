import { pipeline, type PipelineStage } from "@/content/profile";
import { StageIcon } from "./Icons";
import { cn } from "@/lib/utils";

const fill: Record<PipelineStage["color"], string> = {
  green: "bg-green text-ink",
  teal: "bg-teal text-cream",
  marigold: "bg-marigold text-ink",
  red: "bg-red text-cream",
  ink: "bg-cream text-ink border-[3px] border-dashed border-ink",
};

/**
 * Her career as one pipeline, left to right. Data flows along the solid part.
 * The last link is dashed, a draft: it leads to the visitor's team.
 */
export function CareerPipeline() {
  return (
    <nav aria-label="Career, as a pipeline" className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] pb-2 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0">
      <ol className="relative grid min-w-[44rem] grid-cols-5 md:min-w-0">
        {/* the pipe: solid and flowing through shipped work, dashed to what is next */}
        <span aria-hidden="true" className="absolute top-[4.75rem] left-[10%] h-[6px] w-[60%] -translate-y-1/2 rounded-full bg-ink md:top-[5.25rem]">
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--marigold)_2.5px,transparent_3px)] bg-[length:28px_6px] [animation:packets_1.4s_linear_infinite] motion-reduce:[animation:none]" />
        </span>
        <span aria-hidden="true" className="rule-dashed absolute top-[4.75rem] left-[70%] w-[20%] -translate-y-1/2 text-ink md:top-[5.25rem]" />

        {pipeline.map((s) => {
          const you = s.id === "you";
          return (
            <li key={s.id} className="relative flex flex-col items-center text-center">
              <a href={s.href} className="group flex flex-col items-center no-underline">
                <span className="text-label text-muted">{s.year}</span>
                <span
                  className={cn(
                    "relative mt-3 grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full transition-transform duration-300 ease-[var(--ease-spring)] group-hover:-translate-y-1.5 group-hover:scale-110 md:h-24 md:w-24",
                    fill[s.color],
                  )}
                >
                  {you && <span aria-hidden="true" className="absolute inset-[-10px] animate-ping rounded-full border-2 border-red opacity-40 [animation-duration:2.4s] motion-reduce:hidden" />}
                  <span className="transition-transform duration-500 group-hover:rotate-[-8deg]">
                    <StageIcon name={s.icon} size={40} />
                  </span>
                </span>
                <span className={cn("mt-4 max-w-[11rem] text-[1rem] leading-tight font-bold md:text-[1.125rem]", you && "text-red")}>{s.name}</span>
                <span className="mt-1.5 font-mono text-[0.75rem] text-muted md:text-[0.8125rem]">{s.stat}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
