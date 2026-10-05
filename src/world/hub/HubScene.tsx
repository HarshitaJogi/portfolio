"use client";

import type { SceneProps } from "../World";
import { Lights } from "../Lights";
import { HubRig } from "./HubRig";
import { Island } from "./Island";
import { Stations } from "./stations/Stations";
import { Bottle } from "./Bottle";

/** The hub: the whole resume as one island, one district per section. */
export default function HubScene({ done }: SceneProps) {
  return (
    <>
      <HubRig />
      <Lights span={26} />
      <Island />
      <Bottle position={[9, -0.75, -26]} />
      <Stations done={done} />
    </>
  );
}
