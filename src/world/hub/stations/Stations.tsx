"use client";

import type { ComponentType, ReactNode } from "react";
import { hubStops, margamParts } from "@/content/profile";
import { RING_R, STOP_COUNT, stopAngle } from "../../palette";
import { Progressive } from "../../progressive";
import { Portal } from "../../props/basics";
import { Welcome } from "./Welcome";
import { Toolkit } from "./Toolkit";
import { Stage } from "./Stage";
import { YourTeam } from "./YourTeam";
import { EducationDistrict, ExperienceDistrict, ProjectsDistrict } from "./Districts";

/** One district per resume section, in the order of the tour. */
const DISTRICTS: Record<string, ComponentType> = {
  welcome: Welcome,
  education: EducationDistrict,
  skills: Toolkit,
  experience: ExperienceDistrict,
  projects: ProjectsDistrict,
  offstage: Stage,
  contact: YourTeam,
};

const color = new Map(margamParts.map((m) => [m.id, m.color]));

/**
 * Places each district on its pad, facing outward toward the camera. Districts that open
 * into a world get a portal behind them, in their margam colour.
 */
export function Stations({ done }: { done?: ReactNode }) {
  const stops = hubStops.slice(0, STOP_COUNT);
  return (
    <Progressive done={done}>
      {stops.map((s, i) => {
        const a = stopAngle(i);
        const D = DISTRICTS[s.id];
        return (
          <group key={s.id} position={[Math.cos(a) * RING_R, 0.45, Math.sin(a) * RING_R]} rotation={[0, -a + Math.PI / 2, 0]}>
            {D && <D />}
            {s.world && (
              <Portal href={`/${s.world}`} label={s.world === "offstage" ? "Off-stage" : s.world} color={color.get(s.margam) ?? "#ff6b4a"} position={[0, 0, -2.7]} scale={0.95} />
            )}
          </group>
        );
      })}
    </Progressive>
  );
}
