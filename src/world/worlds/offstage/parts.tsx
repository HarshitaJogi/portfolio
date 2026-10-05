"use client";

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type V3 = [number, number, number];

/** A tiny seeded hash, so "random" layouts are the same every render. */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** One geometry from many: one draw call per colour instead of one per piece. */
export function merge(parts: THREE.BufferGeometry[]) {
  // every part needs the same attributes, and all indexed or none, to merge
  const indexed = parts.every((g) => g.index);
  const ready = parts.map((g) => {
    const n = indexed || !g.index ? g : g.toNonIndexed();
    if (!n.getAttribute("uv")) n.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(n.getAttribute("position").count * 2), 2));
    return n;
  });
  const out = mergeGeometries(ready, false);
  parts.forEach((g) => g.dispose());
  return out ?? new THREE.BufferGeometry();
}

/** Place a geometry: rotate (radians), then move. Returns the same geometry. */
export function put(g: THREE.BufferGeometry, p: V3, r: V3 = [0, 0, 0], s: V3 = [1, 1, 1]) {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s));
  g.applyMatrix4(m);
  return g;
}

/** A capsule from a to b (a limb). */
export function limb(a: V3, b: V3, r: number) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const len = va.distanceTo(vb);
  const g = new THREE.CapsuleGeometry(r, len, 4, 10);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  const m = new THREE.Matrix4().compose(va.clone().add(vb).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1));
  g.applyMatrix4(m);
  return g;
}

/** The kuthuvilakku's silhouette, turned on a lathe: foot, knotted stem, wick bowl, finial. */
export function lampGeometry() {
  const pts: [number, number][] = [
    [0, 0],
    [0.62, 0],
    [0.64, 0.1],
    [0.5, 0.16],
    [0.46, 0.26],
    [0.26, 0.32],
    [0.16, 0.42],
    [0.1, 0.62],
    [0.1, 0.82],
    [0.2, 0.9],
    [0.2, 0.98],
    [0.1, 1.06],
    [0.08, 1.5],
    [0.18, 1.58],
    [0.18, 1.64],
    [0.08, 1.72],
    [0.07, 2.02],
    [0.16, 2.1],
    [0.46, 2.2],
    [0.6, 2.32],
    [0.6, 2.38],
    [0.5, 2.36],
    [0.1, 2.3],
    [0.06, 2.36],
    [0.06, 2.62],
    [0.14, 2.7],
    [0.06, 2.8],
    [0.1, 2.9],
    [0.04, 3.05],
    [0, 3.08],
  ];
  return new THREE.LatheGeometry(
    pts.map(([x, y]) => new THREE.Vector2(x, y)),
    22,
  );
}

/** A flame: a teardrop, base at the origin. */
export function flameGeometry() {
  const pts: [number, number][] = [
    [0, 0],
    [0.06, 0.03],
    [0.085, 0.09],
    [0.07, 0.17],
    [0.035, 0.25],
    [0, 0.32],
  ];
  return new THREE.LatheGeometry(
    pts.map(([x, y]) => new THREE.Vector2(x, y)),
    10,
  );
}
