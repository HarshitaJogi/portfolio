"use client";

import type { JSX } from "react";
import { C } from "../palette";
import { Cat, GINGER } from "./Cat";
import { Duck, DUCK } from "./Duck";
import { Elephant, ELEPHANT } from "./Elephant";
import { Peacock, PEACOCK } from "./Peacock";
import { Robot } from "./Robot";
import type { AvatarMotion } from "./rig";

export type { AvatarMotion } from "./rig";

export type AvatarKind = "robot" | "cat" | "duck" | "elephant" | "peacock";

/** The five travelers, in chooser order. `color` is the main body colour, for UI accents. */
export const AVATARS: { id: AvatarKind; name: string; species: string; line: string; color: string }[] = [
  { id: "robot", name: "Bolt", species: "robot", line: "Beeps when it finds a bug.", color: C.cream },
  { id: "cat", name: "Mochi", species: "cat", line: "Naps on warm keyboards, ships anyway.", color: GINGER },
  { id: "duck", name: "Pip", species: "duckling", line: "Explains every bug to itself, out loud.", color: DUCK },
  { id: "elephant", name: "Gajju", species: "baby elephant", line: "Never forgets where the bridge was.", color: ELEPHANT },
  { id: "peacock", name: "Mayu", species: "peacock", line: "Dances a little at every finish line.", color: PEACOCK },
];

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
