"use client";

import WarmTooltip, { WarmTooltipGroup } from "@/components/bits/WarmTooltip";
import { stack, toolkit } from "@/content/profile";
import { useThemeColors } from "@/lib/useThemeColors";
import { BrandIcon } from "./StackIcons";

/** Proof, not a tag cloud: every chip answers "where?" on hover or focus. */
export function StackGrid() {
  const colors = useThemeColors();
  return (
    <WarmTooltipGroup>
      <div className="grid gap-px overflow-hidden rounded-[14px] border border-line bg-line md:grid-cols-2">
        {stack.map((g) => (
          <div key={g.group} className="bg-surface p-5 md:p-6">
            <h3 className="text-label text-muted">{g.group}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {g.items.map((it) => (
                <li key={it.name}>
                  <WarmTooltip content={it.where} side="top" size="sm" surfaceColor={colors?.ink} inkColor={colors?.bg}>
                    <button type="button" className="chip h-8 cursor-default gap-2 px-3 text-[0.8125rem] transition-colors hover:border-ink focus-visible:border-ink">
                      {it.icon ? <BrandIcon slug={it.icon} size={14} className="text-muted" /> : <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-line-strong" />}
                      {it.name}
                      <span className="sr-only">: {it.where}</span>
                    </button>
                  </WarmTooltip>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-[0.8125rem] text-muted">
        {toolkit.alsoLabel}: {toolkit.alsoFamiliar.join(", ")}
      </p>
    </WarmTooltipGroup>
  );
}
