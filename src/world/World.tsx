"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { lazy, Suspense, useCallback, useEffect, useState, type ComponentType, type ReactNode } from "react";
import type { WorldId } from "@/content/profile";
import { onJourney } from "./scroll";
import { useReducedMotion } from "@/lib/device";

export type SceneId = "hub" | WorldId;

/** Every scene takes `done`, and renders it once its last piece is mounted. */
export type SceneProps = { done: ReactNode };

// One chunk per scene: the hub never downloads a world it is not showing.
const SCENES: Record<SceneId, ComponentType<SceneProps>> = {
  hub: lazy(() => import("./hub/HubScene")),
  education: lazy(() => import("./worlds/education")),
  skills: lazy(() => import("./worlds/skills")),
  experience: lazy(() => import("./worlds/experience")),
  projects: lazy(() => import("./worlds/projects")),
  offstage: lazy(() => import("./worlds/offstage")),
};

/**
 * Rendered once a scene is fully mounted. Compiles its shaders in parallel (off the main
 * thread where the browser allows it), then reports ready, two frames later, so the first
 * real picture is on screen before anything fades to it.
 */
function Ready({ onBuilt }: { onBuilt: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    let alive = true;
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => {
        if (!alive) return;
        requestAnimationFrame(() => requestAnimationFrame(() => alive && onBuilt()));
      });
    return () => {
      alive = false;
    };
  }, [gl, scene, camera, onBuilt]);
  return null;
}

/** With reduced motion the canvas only draws when the scroll moves, so nothing drifts by itself. */
function DemandRedraw() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
    return onJourney(() => invalidate());
  }, [invalidate]);
  return null;
}

/** Stops drawing while the tab is hidden. */
function PauseWhenHidden() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const frameloop = useThree((s) => s.frameloop);
  useEffect(() => {
    if (frameloop === "demand") return;
    const on = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, [frameloop, setFrameloop]);
  return null;
}

/**
 * The one canvas. It lives in the layout, so moving between the hub and a world swaps
 * the scene without tearing down WebGL. The page scroll drives the camera.
 */
export default function World({ scene, onReady }: { scene: SceneId; onReady?: (scene: SceneId) => void }) {
  const reduced = useReducedMotion();
  // nothing draws until the first scene is built and its shaders are compiled
  const [live, setLive] = useState(false);
  const built = useCallback(() => {
    setLive(true);
    onReady?.(scene);
  }, [onReady, scene]);
  const Scene = SCENES[scene];
  // phones skip the shadow pass: about a fifth of the draw calls, for a little depth
  const [shadows] = useState(() => window.innerWidth >= 900);

  return (
    <Canvas
      shadows={shadows}
      frameloop={!live ? "never" : reduced ? "demand" : "always"}
      dpr={[1, 1.75]}
      camera={{ fov: 34, near: 0.5, far: 700, position: [0, 30, 50] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden="true"
      onCreated={({ gl, scene }) => {
        if (process.env.NODE_ENV !== "production") Object.assign(window, { __gl: gl, __scene: scene });
      }}
    >
      <Suspense fallback={null} key={scene}>
        <Scene done={<Ready onBuilt={built} />} />
      </Suspense>
      {live && (reduced ? <DemandRedraw /> : <PauseWhenHidden />)}
    </Canvas>
  );
}
