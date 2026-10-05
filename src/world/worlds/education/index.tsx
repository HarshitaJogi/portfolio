"use client";

import { worlds } from "@/content/profile";
import type { SceneProps } from "../../World";
import { WorldFrame } from "../Frame";
import { MumbaiU } from "./mumbai";
import { Northeastern } from "./boston";

/** Education: Electronics in Mumbai, then computer science in Boston, joined by a bridge. */
export default function Scene({ done }: SceneProps) {
  return <WorldFrame world={worlds.education} dioramas={{ mu: MumbaiU, neu: Northeastern }} done={done} connector="bridge" />;
}
