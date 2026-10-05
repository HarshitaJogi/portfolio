"use client";

import { worlds } from "@/content/profile";
import type { SceneProps } from "../../World";
import { WorldFrame } from "../Frame";
import { Dance } from "./Dance";
import { Margam } from "./Margam";
import { Voice } from "./Voice";

/** Off-stage: Bharatanatyam at night, the seven-part margam at dusk, and the voice by day. */
export default function Scene({ done }: SceneProps) {
  return <WorldFrame world={worlds.offstage} dioramas={{ dance: Dance, margam: Margam, voice: Voice }} done={done} connector="bridge" />;
}
