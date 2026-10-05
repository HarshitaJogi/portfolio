"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { RING_R, STOP_COUNT, stopAngle } from "../palette";
import { Welcome } from "./Welcome";
import { Toolkit } from "./Toolkit";
import { Drone } from "./Drone";
import { Cloud } from "./Cloud";
import { Papers } from "./Papers";
import { Agent } from "./Agent";
import { Booth } from "./Booth";
import { Stage } from "./Stage";
import { YourTeam } from "./YourTeam";

const SCENES = [Welcome, Toolkit, Drone, Cloud, Papers, Agent, Booth, Stage, YourTeam];

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };

/**
 * Places each station on its pad, facing outward toward the camera.
 * Stations mount one per idle slice instead of all at once, so building the island
 * never blocks the page for long. `done` renders once the last one is in.
 */
export function Stations({ done }: { done?: ReactNode }) {
  const [count, setCount] = useState(1);
  useEffect(() => {
    if (count >= STOP_COUNT) return;
    const w = window as IdleWindow;
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setCount((c) => c + 1), { timeout: 250 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setCount((c) => c + 1), 16);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <group>
      {SCENES.slice(0, Math.min(count, STOP_COUNT)).map((Scene, i) => {
        const a = stopAngle(i);
        return (
          <group key={i} position={[Math.cos(a) * RING_R, 0.45, Math.sin(a) * RING_R]} rotation={[0, -a + Math.PI / 2, 0]}>
            {/* one boundary per station, so a texture still loading never hides the rest */}
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </group>
        );
      })}
      {count >= STOP_COUNT && done}
    </group>
  );
}
