"use client";

import FuzzyText from "@/components/bits/FuzzyText";
import { useThemeColors } from "@/lib/useThemeColors";

export function NotFoundMark() {
  const colors = useThemeColors();
  return (
    <div aria-hidden="true" className="font-display flex justify-center">
      {colors ? (
        <FuzzyText fontSize="clamp(6rem, 22vw, 14rem)" fontWeight={400} color={colors.ink} baseIntensity={0.08} hoverIntensity={0.35}>
          404
        </FuzzyText>
      ) : (
        <span className="font-display text-[clamp(6rem,22vw,14rem)] leading-none">404</span>
      )}
    </div>
  );
}
