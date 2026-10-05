"use client";

import { Outlines } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { C } from "./palette";

let gradient: THREE.DataTexture | null = null;
/** A 3-step ramp: shadow, mid, lit. Gives the hand-painted, cel-shaded look. */
function gradientMap() {
  if (gradient) return gradient;
  const data = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  gradient = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  return gradient;
}

export type Instance = { p: [number, number, number]; s?: number | [number, number, number]; r?: [number, number, number]; color?: string };

/**
 * Many copies of one toon shape in a single draw call (two with the outline).
 * Pass the geometry as the child. Per-instance colour is optional.
 */
export function ToonInstances({
  items,
  children,
  color = C.white,
  outline = true,
  thickness = 2.2,
  castShadow = false,
  emissive,
}: {
  items: Instance[];
  children: ReactNode;
  color?: string;
  outline?: boolean;
  thickness?: number;
  castShadow?: boolean;
  emissive?: string;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  // Runs after the outline's own layout effect, which shares this instanceMatrix, so both pick up the transforms.
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    items.forEach((it, i) => {
      o.position.set(...it.p);
      o.rotation.set(...(it.r ?? [0, 0, 0]));
      if (Array.isArray(it.s)) o.scale.set(...it.s);
      else o.scale.setScalar(it.s ?? 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      if (it.color) m.setColorAt(i, c.set(it.color));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
    // the outline copy is a sibling InstancedMesh; give it the same bounds so it is culled with the shape
    m.traverse((child) => {
      if (child !== m && (child as THREE.InstancedMesh).isInstancedMesh) (child as THREE.InstancedMesh).boundingSphere = m.boundingSphere;
    });
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow={castShadow} receiveShadow>
      {children}
      <Toon color={color} outline={outline} thickness={thickness} emissive={emissive} />
    </instancedMesh>
  );
}

/** Toon material with an ink outline. Drop inside any <mesh>. */
export function Toon({ color, outline = true, thickness = 2.2, emissive }: { color: string; outline?: boolean; thickness?: number; emissive?: string }) {
  const map = useMemo(() => gradientMap(), []);
  return (
    <>
      <meshToonMaterial color={color} gradientMap={map} emissive={emissive ?? "#000000"} emissiveIntensity={emissive ? 0.6 : 0} />
      {/* drei bug: its shader branches are inverted, so the default (no `screenspace`) is the pixel-sized outline. */}
      {outline && <Outlines thickness={thickness} color={C.ink} />}
    </>
  );
}
