"use client";

import { worlds } from "@/content/profile";
import type { SceneProps } from "../../World";
import { WorldFrame } from "../Frame";
import { Bitgig } from "./Bitgig";
import { DroneField } from "./DroneField";
import { Publications } from "./Publications";
import { Scheduler } from "./Scheduler";
import { TryBud } from "./TryBud";

/** Projects & research: the drone field, the papers, TryBud, the scheduler, Bitgig. */
export default function Scene({ done }: SceneProps) {
  return (
    <WorldFrame
      world={worlds.projects}
      dioramas={{ drone: DroneField, papers: Publications, trybud: TryBud, scheduler: Scheduler, bitgig: Bitgig }}
      done={done}
      connector="bridge"
    />
  );
}
