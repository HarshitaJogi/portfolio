"use client";

import TiltedCard from "@/components/bits/TiltedCard";
import { media } from "@/content/profile";
import { useFinePointer } from "@/lib/device";

const img = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

/** The drone photo tilts toward the cursor, with its one-line spec on top. */
export function ResearchVisual() {
  const fine = useFinePointer();
  return (
    <div className="card overflow-hidden p-3">
      <TiltedCard
        imageSrc={img(media.drone.src, 1080)}
        altText={media.drone.alt}
        captionText="15m up · quantized CNN on a Jetson"
        containerHeight="clamp(16rem, 34vw, 26rem)"
        imageWidth="100%"
        imageHeight="100%"
        rotateAmplitude={fine ? 8 : 0}
        scaleOnHover={fine ? 1.03 : 1}
        showMobileWarning={false}
        showTooltip={fine}
      />
    </div>
  );
}
