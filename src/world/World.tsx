"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useState } from "react";
import { CameraRig } from "./CameraRig";
import { Island } from "./Island";
import { Stations } from "./stations/Stations";
import { onJourney } from "./scroll";
import { useReducedMotion } from "@/lib/device";

/**
 * Rendered once every station is mounted. Compiles every shader in parallel (off the main
 * thread where the browser allows it), then starts the frameloop and reports ready.
 * The first frame then draws without a long compile stall.
 */
function Ready({ onLive }: { onLive: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    let alive = true;
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => alive && onLive());
    return () => {
      alive = false;
    };
  }, [gl, scene, camera, onLive]);
  return null;
}

/** Fires once the first live frames have drawn. */
function FirstFrames({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    let a = 0;
    const b = requestAnimationFrame(() => {
      a = requestAnimationFrame(() => onReady?.());
    });
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, [onReady]);
  return null;
}

/** With reduced motion the canvas only draws when the scroll moves, so nothing on the island drifts by itself. */
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

/** The whole island. Mounted once, behind the page; the scroll position drives the camera. */
export default function World({ onReady }: { onReady?: () => void }) {
  const reduced = useReducedMotion();
  // phones get a smaller shadow map: a quarter of the fill cost, and the toon look hides the difference
  const [shadowSize] = useState(() => (window.innerWidth < 900 ? 1024 : 2048));
  // nothing draws until the island is built and its shaders are compiled
  const [live, setLive] = useState(false);
  const goLive = useCallback(() => setLive(true), []);
  return (
    <Canvas
      shadows
      frameloop={!live ? "never" : reduced ? "demand" : "always"}
      dpr={[1, 1.75]}
      camera={{ fov: 34, near: 0.5, far: 400, position: [0, 30, 50] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden="true"
      onCreated={({ gl }) => {
        if (process.env.NODE_ENV !== "production") (window as Window & { __gl?: unknown }).__gl = gl;
      }}
    >
      <fog attach="fog" args={["#ffd7b5", 70, 170]} />
      <hemisphereLight args={["#fff1dc", "#5f8f9a", 1.15]} />
      <directionalLight
        position={[18, 30, 12]}
        intensity={1.6}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-bias={-0.0005}
      />
      <Suspense fallback={null}>
        <Island />
        <Stations done={<Ready onLive={goLive} />} />
      </Suspense>
      <CameraRig />
      {live && <FirstFrames onReady={onReady} />}
      {live && (reduced ? <DemandRedraw /> : <PauseWhenHidden />)}
    </Canvas>
  );
}
