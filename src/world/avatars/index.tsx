"use client";

import type { JSX } from "react";
import { Cat } from "./Cat";
import { Duck } from "./Duck";
import { Elephant } from "./Elephant";
import { Peacock } from "./Peacock";
import { Robot } from "./Robot";
import type { AvatarMotion } from "./rig";

export type { AvatarMotion } from "./rig";

export type AvatarKind = "robot" | "cat" | "duck" | "elephant" | "peacock";

export { AVATARS } from "./meta";

/** A fresh motion record, all at rest. Handy for `useRef(restMotion())`. */
export const restMotion = (): AvatarMotion => ({ walk: 0, air: 0, cheer: 0, ride: 0 });

/**
 * One traveler. Feet at y = 0, facing +Z; the parent group sets position and heading.
 * `motion` is read every frame and never causes a re-render.
 */
export function Avatar({ kind, motion }: { kind: AvatarKind; motion: React.RefObject<AvatarMotion> }): JSX.Element {
  switch (kind) {
    case "cat":
      return <Cat motion={motion} />;
    case "duck":
      return <Duck motion={motion} />;
    case "elephant":
      return <Elephant motion={motion} />;
    case "peacock":
      return <Peacock motion={motion} />;
    default:
      return <Robot motion={motion} />;
  }
}
