"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { GLSlot } from "@/lib/gl";
import { media } from "@/content/profile";
import { useThemeColors } from "@/lib/useThemeColors";
import { useFinePointer } from "@/lib/device";

const HalftoneReveal = dynamic(() => import("@/components/bits/HalftoneReveal"), { ssr: false });

/** The field as print halftone. It sharpens where you look, the way the drone resolved leaves from 15m. */
export function DroneMedia() {
  const colors = useThemeColors();
  const fine = useFinePointer();
  return (
    <figure>
      <GLSlot
        id="drone"
        className="aspect-[16/10] overflow-hidden rounded-md bg-paper-deep"
        fallback={<Image src={media.drone.src} alt={media.drone.alt} fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />}
      >
        {colors && (
          <HalftoneReveal
            src={media.drone.src}
            inkColor={colors.ink}
            paperColor={colors.paperDeep}
            mode="mono"
            dotDensity={88}
            revealRadius={0.32}
            idleReveal={fine ? 0 : 0.35}
            trigger={fine ? "hover" : "always"}
            borderRadius="6px"
          />
        )}
      </GLSlot>
      <figcaption className="text-label mt-3 font-mono text-muted">{fine ? "Hover to see what the camera sees" : "Aerial field, printed as halftone"}</figcaption>
    </figure>
  );
}
