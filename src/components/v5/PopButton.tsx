"use client";

import { forwardRef, type ReactNode } from "react";
import { worldNav } from "@/world/nav";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/audio";
import { burst } from "./juice";

type Tone = "primary" | "secondary" | "sun" | "green" | "ink";
type Size = "xl" | "lg" | "md" | "sm";

const tones: Record<Tone, string> = {
  primary: "bg-[#ff6b4a] text-ink",
  secondary: "bg-[#fff8ec] text-ink",
  sun: "bg-[#ffc93c] text-ink",
  green: "bg-[#3bb273] text-ink",
  ink: "bg-ink text-[#fff8ec]",
};
const sizes: Record<Size, string> = {
  xl: "min-h-16 px-8 text-[1.25rem] md:min-h-[4.25rem] md:px-9 md:text-[1.375rem] shadow-[6px_6px_0_var(--ink)] active:shadow-[1px_1px_0_var(--ink)] active:translate-x-[5px] active:translate-y-[5px]",
  lg: "min-h-14 px-7 text-[1.125rem] md:text-[1.1875rem] shadow-[5px_5px_0_var(--ink)] active:shadow-[1px_1px_0_var(--ink)] active:translate-x-[4px] active:translate-y-[4px]",
  md: "min-h-12 px-5 text-[1rem] shadow-[4px_4px_0_var(--ink)] active:shadow-[1px_1px_0_var(--ink)] active:translate-x-[3px] active:translate-y-[3px]",
  sm: "min-h-10 px-4 text-[0.9375rem] shadow-[3px_3px_0_var(--ink)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]",
};

type Props = {
  children: ReactNode;
  tone?: Tone;
  size?: Size;
  href?: string;
  onClick?: () => void;
  back?: boolean;
  icon?: ReactNode;
  iconLeft?: ReactNode;
  className?: string;
  disabled?: boolean;
  label?: string;
  wiggle?: boolean;
};

/**
 * The site's button: chunky, ink-outlined, presses into the page on click with a pop,
 * a few confetti dots, and an arrow that leans forward on hover. Internal links fly
 * through the clouds; external links open in a new tab.
 */
export const PopButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>(function PopButton(
  { children, tone = "primary", size = "md", href, onClick, back, icon, iconLeft, className, disabled, label, wiggle },
  ref,
) {
  const external = href?.startsWith("http") || href?.startsWith("mailto:") || href?.endsWith(".pdf");
  const cls = cn(
    "group relative inline-flex select-none items-center whitespace-nowrap justify-center gap-2.5 rounded-full border-[3px] border-ink font-display leading-tight no-underline transition-[transform,box-shadow] duration-100 hover:-translate-x-[1px] hover:-translate-y-[2px] disabled:pointer-events-none disabled:opacity-40",
    tones[tone],
    sizes[size],
    wiggle && "animate-[wiggle_0.5s_ease-in-out_2]",
    className,
  );
  const inner = (
    <>
      {iconLeft && <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1" aria-hidden="true">{iconLeft}</span>}
      <span>{children}</span>
      {icon && <span className="inline-block transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">{icon}</span>}
      {href?.startsWith("http") && <span className="sr-only">, opens in a new tab</span>}
    </>
  );
  const fire = (e: React.MouseEvent) => {
    if (back) ui.back();
    else ui.pop();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    burst(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, size === "xl" ? 1.3 : size === "sm" ? 0.6 : 0.9);
  };
  const hover = size === "xl" || size === "lg" ? () => ui.tick() : undefined;
  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        aria-label={label}
        className={cls}
        onMouseEnter={hover}
        {...(external && !href.startsWith("mailto:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onClick={(e) => {
          fire(e);
          onClick?.();
          if (external || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          worldNav.go(href);
        }}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      aria-label={label}
      disabled={disabled}
      className={cls}
      onMouseEnter={hover}
      onClick={(e) => {
        fire(e);
        onClick?.();
      }}
    >
      {inner}
    </button>
  );
});
