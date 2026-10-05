"use client";

import { useRef } from "react";
import VariableProximity from "@/components/bits/VariableProximity";

/** The name breathes toward the cursor: letters near it get bolder and narrower. */
export function HeroName({ name }: { name: string }) {
  const box = useRef<HTMLHeadingElement>(null);
  return (
    <h1 ref={box} id="hero-name" className="text-mega relative text-ink">
      <VariableProximity
        label={name}
        containerRef={box}
        fromFontVariationSettings="'wght' 720, 'wdth' 100, 'opsz' 96"
        toFontVariationSettings="'wght' 800, 'wdth' 75, 'opsz' 96"
        radius={220}
        falloff="gaussian"
        style={{ fontFamily: "inherit" }}
      />
    </h1>
  );
}
