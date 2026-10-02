"use client";

import TextLoop from "@/components/bits/TextLoop";
import { offstage } from "@/content/profile";
import { useThemeColors } from "@/lib/useThemeColors";

/** Her line, carried along a line of movement. Slow enough to read. */
export function QuoteWave() {
  const colors = useThemeColors();
  return (
    <figure className="-mx-[var(--gutter)] md:-mr-[var(--gutter)] md:ml-0">
      <blockquote className="sr-only">{offstage.quote}</blockquote>
      <div aria-hidden="true" className="font-display">
        <TextLoop
          text={offstage.quote}
          shape="wave"
          curviness={46}
          speed={38}
          fontSize={60}
          fontWeight={400}
          letterSpacing={0}
          uppercase={false}
          separator="·"
          ribbon={false}
          color={colors?.ink ?? "#16130f"}
          pauseOnHover
        />
      </div>
    </figure>
  );
}
