"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { GLSlot } from "@/lib/gl";
import { bitgig, media } from "@/content/profile";
import { useThemeColors } from "@/lib/useThemeColors";
import { isLowPower, useFinePointer } from "@/lib/device";
import RefineFrame, { type RefineFrameStatus } from "@/components/bits/RefineFrame";

const DitherVeil = dynamic(() => import("@/components/bits/DitherVeil"), { ssr: false });

const ORDER: RefineFrameStatus[] = ["queued", "generating", "refining", "complete"];

/**
 * Raw footage printed as a 1-bit dither. The cursor (or a slow wander on touch)
 * resolves it to full clarity: AI drafts, experts correct. Low-power devices get the
 * Refine Frame stages instead, with no WebGL at all.
 */
export function BitgigMedia() {
  const colors = useThemeColors();
  const fine = useFinePointer();
  const [stage, setStage] = useState(0);
  const [live, setLive] = useState(false);
  useEffect(() => setLive(!isLowPower()), []);

  useEffect(() => {
    const t = setInterval(() => setStage((s) => (s + 1) % (ORDER.length + 1)), 1600);
    return () => clearInterval(t);
  }, []);

  const fallback = (
    <RefineFrame
      status={ORDER[Math.min(stage, ORDER.length - 1)]}
      aspectRatio="16 / 10"
      radius={6}
      background="var(--paper-deep)"
      labels={{ queued: "Raw footage", generating: "Gemini draft", refining: "Expert review", complete: "Verified" }}
      className="w-full"
    >
      <Image src={media.bitgig.src} alt="" width={media.bitgig.width} height={media.bitgig.height} sizes="(min-width: 1024px) 900px, 100vw" />
    </RefineFrame>
  );

  return (
    <figure className="max-w-[58rem]">
      <GLSlot id="bitgig" fallback={fallback} className="overflow-hidden rounded-md">
        {colors && (
          <div className="h-full w-full bg-paper-deep">
            <DitherVeil
              src={media.bitgig.src}
              fit="cover"
              pattern="floyd"
              pixelSize={2}
              inkColor={colors.ink}
              paperColor={colors.paperDeep}
              revealRadius={170}
              softness={0.65}
              linger={1.4}
              rim={0.6}
              rimColor={colors.accent}
              wander={!fine}
              clickBurst={false}
            />
          </div>
        )}
      </GLSlot>
      <figcaption className="text-label mt-3 flex justify-between gap-4 font-mono text-muted">
        <span>{!live ? "From raw footage to verified labels" : fine ? "Move across the frame to resolve it" : "The draft resolves on its own"}</span>
        <a href={bitgig.live} className="link" target="_blank" rel="noopener noreferrer">
          Live demo ↗
        </a>
      </figcaption>
    </figure>
  );
}
