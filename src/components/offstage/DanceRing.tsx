"use client";

import dynamic from "next/dynamic";
import { media } from "@/content/profile";
import { useThemeColors } from "@/lib/useThemeColors";
import { useReducedMotion } from "@/lib/device";

const CircularCarousel = dynamic(() => import("@/components/bits/CircularCarousel"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

/** Performance photos on a slow ring: the tala cycle, in pictures. */
export function DanceRing() {
  const colors = useThemeColors();
  const reduced = useReducedMotion();
  return (
    <figure aria-label="Bharatanatyam performance photos">
      <div className="h-[22rem] w-full md:h-[26rem]">
        {colors && (
          <CircularCarousel
            items={media.dance.map((d) => ({ src: d.src, alt: d.alt }))}
            preset="cylinder"
            intro={reduced ? "none" : "rise"}
            cardWidth={190}
            aspectRatio={0.68}
            gap={22}
            autoplay={reduced ? "off" : "drift"}
            speed={0.25}
            pauseOnHover
            focusOnClick
            depthFade={0.55}
            fadeColor={colors.paper}
            cornerRadius={6}
            captions={false}
          />
        )}
      </div>
      <figcaption className="text-label mt-2 font-mono text-muted">Drag to turn the ring</figcaption>
    </figure>
  );
}
