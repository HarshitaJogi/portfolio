"use client";

import dynamic from "next/dynamic";
import { GLSlot } from "@/lib/gl";
import { Monogram } from "@/components/ui/Monogram";
import { useThemeColors } from "@/lib/useThemeColors";
import { useTheme } from "next-themes";

const ElectricLogo = dynamic(() => import("@/components/bits/ElectricLogo"), { ssr: false });

/** Tillana, the joyful finale: the HJ mark, alive with current. Static on low-power devices. */
export function ContactMark() {
  const colors = useThemeColors();
  const { resolvedTheme } = useTheme();
  return (
    <GLSlot
      id="contact"
      className="aspect-square w-full max-w-[24rem]"
      fallback={
        <div className="grid h-full w-full place-items-center text-ink">
          <Monogram size={220} />
        </div>
      }
    >
      {colors && (
        <div className="h-full w-full">
          <ElectricLogo
            src="/monogram-mark.svg"
            color={colors.accent}
            glowColor={colors.accent}
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            scale={0.62}
            intensity={0.8}
            glow={0.7}
            thickness={1.2}
            strands={3}
            arcs={0.6}
            flicker={0.3}
            speed={1.6}
            cursorRadius={120}
          />
        </div>
      )}
    </GLSlot>
  );
}
