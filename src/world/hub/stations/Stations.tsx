"use client";

import { Html } from "@react-three/drei";
import type { ComponentType, ReactNode } from "react";
import { hubStops, margamParts } from "@/content/profile";
import { RING_R, STOP_COUNT, stopAngle } from "../../palette";
import { Progressive } from "../../progressive";
import { Portal } from "../../props/basics";
import { useHoverCursor } from "../../bits";
import { hubView, orbit, useHubView } from "../view";
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

const NAMES: Record<string, string> = {
  welcome: "Start",
  education: "Education",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  offstage: "Off-stage",
  contact: "Contact",
};

/** A big, readable label floating over a district on the map. Click it to fly there. */
function DistrictLabel({ i, id, margam }: { i: number; id: string; margam: string }) {
  const { focus } = useHubView();
  const hidden = focus !== -1;
  return (
    <Html position={[0, 6.4, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: hidden ? "none" : "auto" }}>
      <button
        type="button"
        tabIndex={hidden ? -1 : 0}
        onClick={() => hubView.focus(i)}
        className={`hidden items-center gap-2 rounded-full md:flex border-[3px] border-ink bg-[#fff8ec] px-3.5 py-1.5 font-display text-[0.9375rem] whitespace-nowrap text-ink shadow-[3px_3px_0_var(--ink)] transition-all duration-300 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none md:text-[1.0625rem] ${hidden ? "scale-75 opacity-0" : "opacity-100"}`}
      >
        <span className="h-3 w-3 rounded-full border-2 border-ink" style={{ background: color.get(margam as never) }} aria-hidden="true" />
        {NAMES[id]}
      </button>
    </Html>
  );
}

/** A district you can click: the camera flies over to it. */
function District({ i, children }: { i: number; children: ReactNode }) {
  const { bind } = useHoverCursor();
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        if (orbit.suppressClick) return;
        hubView.focus(i === 0 ? -1 : i);
      }}
      {...bind}
    >
      {children}
    </group>
  );
}

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
            <District i={i}>
              {D && <D />}
              {s.world && (
                <Portal href={`/${s.world}`} label={s.world === "offstage" ? "Off-stage" : s.world} color={color.get(s.margam) ?? "#ff6b4a"} position={[0, 0, -2.7]} scale={0.95} />
              )}
            </District>
            {i > 0 && <DistrictLabel i={i} id={s.id} margam={s.margam} />}
          </group>
        );
      })}
    </Progressive>
  );
}
