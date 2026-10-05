"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { atmo, paintSky } from "./atmosphere";

const DAY = { hemi: 1.15, sun: 1.6, sky: new THREE.Color("#fff1dc"), ground: new THREE.Color("#5f8f9a"), sunColor: new THREE.Color("#fff4e0") };
const NIGHT = { hemi: 0.55, sun: 0.55, sky: new THREE.Color("#8fa0ff"), ground: new THREE.Color("#2a2550"), sunColor: new THREE.Color("#b8c4ff") };

/**
 * Hemisphere + one shadow-casting sun, blended toward moonlight by `atmo.night`.
 * The sun follows `focus` so shadows stay sharp wherever the camera is.
 * Also keeps the fog and the CSS sky in step with the atmosphere.
 */
export function Lights({ focus, span = 26 }: { focus?: React.RefObject<THREE.Vector3>; span?: number }) {
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const size = useMemo(() => (typeof window !== "undefined" && window.innerWidth < 900 ? 1024 : 2048), []);
  const fog = useRef<THREE.Fog>(null);

  useFrame(() => {
    const n = atmo.night;
    if (hemi.current) {
      hemi.current.intensity = DAY.hemi + (NIGHT.hemi - DAY.hemi) * n;
      hemi.current.color.copy(DAY.sky).lerp(NIGHT.sky, n);
      hemi.current.groundColor.copy(DAY.ground).lerp(NIGHT.ground, n);
    }
    if (sun.current) {
      sun.current.intensity = DAY.sun + (NIGHT.sun - DAY.sun) * n;
      sun.current.color.copy(DAY.sunColor).lerp(NIGHT.sunColor, n);
      if (focus?.current) {
        const f = focus.current;
        sun.current.position.set(f.x + 18, 30, f.z + 12);
        sun.current.target.position.set(f.x, 0, f.z);
        sun.current.target.updateMatrixWorld();
      }
    }
    fog.current?.color.copy(atmo.bottom);
    paintSky();
  });

  return (
    <>
      <fog ref={fog} attach="fog" args={["#ffd6b8", 90, 260]} />
      <hemisphereLight ref={hemi} args={[DAY.sky, DAY.ground, DAY.hemi]} />
      <directionalLight
        ref={sun}
        position={[18, 30, 12]}
        intensity={DAY.sun}
        color={DAY.sunColor}
        castShadow
        shadow-mapSize={[size, size]}
        shadow-camera-left={-span}
        shadow-camera-right={span}
        shadow-camera-top={span}
        shadow-camera-bottom={-span}
        shadow-bias={-0.0005}
      />
    </>
  );
}
