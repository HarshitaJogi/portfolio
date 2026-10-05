"use client";

import { worlds } from "@/content/profile";
import type { SceneProps } from "../../World";
import { WorldFrame } from "../Frame";
import { Remote } from "./Remote";
import { Mumbai } from "./Mumbai";
import { Boston } from "./Boston";
import { Sunnyvale } from "./Sunnyvale";

/** Experience: four roles, three cities, and the plane that carries you between them. */
export default function Scene({ done }: SceneProps) {
  return <WorldFrame world={worlds.experience} dioramas={{ iitp: Remote, msci: Mumbai, nsi: Boston, nokia: Sunnyvale }} done={done} connector="plane" />;
}
