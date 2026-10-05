"use client";

import dynamic from "next/dynamic";
import { useFinePointer, useReducedMotion } from "@/lib/device";
import { useThemeColors } from "@/lib/useThemeColors";

const CursorGrid = dynamic(() => import("@/components/bits/CursorGrid"), { ssr: false });

/** The instrument grid lights up under the cursor. Desktop pointers only, off under reduced motion. */
export function HeroGrid() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const colors = useThemeColors();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="bg-grid absolute inset-0" />
      {fine && !reduced && colors && (
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_30%,#000_40%,transparent_100%)]">
          <CursorGrid cellSize={48} color={colors.accent} radius={150} lineWidth={1} maxOpacity={0.55} fillOpacity={0.04} clickPulse={false} />
        </div>
      )}
    </div>
  );
}
