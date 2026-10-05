"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { ThreeElements } from "@react-three/fiber";

// one geometry per size: toy scenes reuse the same few boxes many times
const cache = new Map<string, THREE.BufferGeometry>();
function rounded(w: number, h: number, d: number, radius: number, segments: number) {
  const key = `${w}|${h}|${d}|${radius}|${segments}`;
  let g = cache.get(key);
  if (!g) {
    g = new RoundedBoxGeometry(w, h, d, segments, Math.min(radius, Math.min(w, h, d) / 2 - 1e-4));
    cache.set(key, g);
  }
  return g;
}

type Props = Omit<ThreeElements["mesh"], "args"> & { args?: [number?, number?, number?]; radius?: number; smoothness?: number; children?: ReactNode };

/**
 * Drop-in for drei's <RoundedBox>, with the geometry shared between every box of the same
 * size. Building a fresh rounded box per mesh was a large part of mounting a scene.
 */
export const RoundedBox = forwardRef<THREE.Mesh, Props>(function RoundedBox({ args = [1, 1, 1], radius = 0.05, smoothness = 3, children, ...props }, ref) {
  const [w = 1, h = 1, d = 1] = args;
  const geometry = useMemo(() => rounded(w, h, d, radius, smoothness), [w, h, d, radius, smoothness]);
  return (
    <mesh ref={ref} geometry={geometry} {...props} dispose={null}>
      {children}
    </mesh>
  );
});
