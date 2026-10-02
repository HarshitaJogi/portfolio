"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import PixelSwap from "@/components/bits/PixelSwap";
import { hero, media } from "@/content/profile";
import { useFinePointer } from "@/lib/device";
import { cn } from "@/lib/utils";

/**
 * Headshot in a tala circle. Hover, focus or tap and it dissolves into a performance
 * photo. Two sides of the same person. The ring is dashed until you look closer.
 */
export function HeroPortrait({ className, lineStart = false }: { className?: string; lineStart?: boolean }) {
  const fine = useFinePointer();
  const [dance, setDance] = useState(false);
  const [second, setSecond] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => setSecond(true), { timeout: 4000 });
    else setTimeout(() => setSecond(true), 2500);
  }, []);

  return (
    <figure className={cn("relative", className)}>
      <div className="relative aspect-square w-full">
        {lineStart && <span className="line-mark !top-1/2 !-left-[7%]" aria-hidden="true" />}
        <svg className="pointer-events-none absolute -inset-[7%] h-[114%] w-[114%] overflow-visible" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="49"
            fill="none"
            stroke={dance ? "var(--accent)" : "var(--rule-strong)"}
            strokeWidth="0.45"
            strokeDasharray={dance ? undefined : "1.4 1.6"}
            vectorEffect="non-scaling-stroke"
            style={{ transition: "stroke 400ms var(--ease-settle)" }}
          />
        </svg>
        <div className="absolute inset-0 overflow-hidden rounded-full bg-paper-deep">
          <PixelSwap
            aspectRatio="1 / 1"
            trigger={fine ? "hover" : "click"}
            label={`${media.headshot.alt}. ${fine ? hero.photoHint.fine : hero.photoHint.coarse}.`}
            onActiveChange={setDance}
            pixelSize={36}
            duration={900}
            pixelDuration={380}
            pattern="center"
            randomness={0.35}
            pixelRadius={50}
            firstContent={
              <Image
                src={media.headshot.src}
                alt=""
                fill
                priority
                sizes="(min-width: 768px) 300px, 120px"
                className="object-cover object-[50%_22%]"
              />
            }
            secondContent={
              second && <Image
                src={media.dance[0].src}
                alt=""
                fill
                sizes="(min-width: 768px) 300px, 120px"
                className="object-cover object-[50%_25%]"
              />
            }
          />
        </div>
      </div>
      <figcaption className="text-label mt-6 hidden text-center font-mono text-muted md:block">
        {dance ? "Off-stage" : fine ? hero.photoHint.fine : hero.photoHint.coarse}
      </figcaption>
    </figure>
  );
}
