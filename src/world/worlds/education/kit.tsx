"use client";

import { Outlines } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { C } from "../../palette";

/**
 * Baking: every static piece of a diorama is described as a list of primitive parts with
 * a colour each, then merged into one geometry with vertex colours. A whole campus of
 * outlined toon shapes costs three draws (shape, outline, shadow) instead of hundreds.
 */

export type V3 = [number, number, number];
type Kind = "box" | "cyl" | "cone" | "sphere" | "capsule" | "torus" | "prism" | "tube";
export type Part = { k: Kind; a: number[]; m: THREE.Matrix4; c: string };
type T = { p?: V3; r?: V3; s?: V3 | number };

const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
function compose({ p = [0, 0, 0], r = [0, 0, 0], s = 1 }: T = {}) {
  _q.setFromEuler(_e.set(r[0], r[1], r[2]));
  _p.set(p[0], p[1], p[2]);
  if (typeof s === "number") _s.setScalar(s);
  else _s.set(s[0], s[1], s[2]);
  return new THREE.Matrix4().compose(_p, _q, _s);
}

export const box = (c: string, w: number, h: number, d: number, t?: T): Part => ({ k: "box", a: [w, h, d], m: compose(t), c });
/** A cylinder; `arc` = [start, length] keeps only part of it (theta 0 faces +z). */
export const cyl = (c: string, rt: number, rb: number, h: number, seg = 14, t?: T, arc: [number, number] = [0, Math.PI * 2]): Part => ({
  k: "cyl",
  a: [rt, rb, h, seg, ...arc],
  m: compose(t),
  c,
});
export const cone = (c: string, r: number, h: number, seg = 8, t?: T): Part => ({ k: "cone", a: [r, h, seg], m: compose(t), c });
export const sphere = (c: string, r: number, t?: T, ws = 12, hs = 9): Part => ({
  k: "sphere",
  a: [r, ws, hs],
  m: compose(t),
  c,
});
export const capsule = (c: string, r: number, len: number, t?: T): Part => ({
  k: "capsule",
  a: [r, len],
  m: compose(t),
  c,
});
export const torus = (c: string, R: number, tube: number, arc = Math.PI * 2, t?: T): Part => ({ k: "torus", a: [R, tube, arc], m: compose(t), c });
/** A triangular prism: base `w` on y = 0, apex at height `h`, `d` deep along z. Roofs and pediments. */
export const prism = (c: string, w: number, h: number, d: number, t?: T): Part => ({ k: "prism", a: [w, h, d], m: compose(t), c });
/** A round tube through points (flattened x,y,z list). Cables and wires. */
export const tube = (c: string, pts: V3[], r: number, t?: T): Part => ({
  k: "tube",
  a: [r, ...pts.flat()],
  m: compose(t),
  c,
});

/** Moves, turns (about y, or by an euler) and scales a group of parts. */
export function move(parts: Part[], p: V3, r: number | V3 = 0, s = 1): Part[] {
  const M = compose({ p, r: typeof r === "number" ? [0, r, 0] : r, s });
  return parts.map((q) => ({ ...q, m: M.clone().multiply(q.m) }));
}

function geometry(pt: Part): THREE.BufferGeometry {
  const a = pt.a;
  switch (pt.k) {
    case "box":
      return new THREE.BoxGeometry(a[0], a[1], a[2]);
    case "cyl":
      return new THREE.CylinderGeometry(a[0], a[1], a[2], a[3], 1, false, a[4], a[5]);
    case "cone":
      return new THREE.ConeGeometry(a[0], a[1], a[2]);
    case "sphere":
      return new THREE.SphereGeometry(a[0], a[1], a[2]);
    case "capsule":
      return new THREE.CapsuleGeometry(a[0], a[1], 3, 10);
    case "torus":
      return new THREE.TorusGeometry(a[0], a[1], 6, 18, a[2]);
    case "prism": {
      const s = new THREE.Shape();
      s.moveTo(-a[0] / 2, 0);
      s.lineTo(a[0] / 2, 0);
      s.lineTo(0, a[1]);
      s.lineTo(-a[0] / 2, 0);
      return new THREE.ExtrudeGeometry(s, {
        depth: a[2],
        bevelEnabled: false,
      }).translate(0, 0, -a[2] / 2);
    }
    case "tube": {
      const pts: THREE.Vector3[] = [];
      for (let i = 1; i < a.length; i += 3) pts.push(new THREE.Vector3(a[i], a[i + 1], a[i + 2]));
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 6, a[0], 6, false);
    }
  }
}

export function bake(parts: Part[]) {
  const col = new THREE.Color();
  const geos = parts.map((pt) => {
    const g0 = geometry(pt);
    g0.applyMatrix4(pt.m);
    const g = g0.index ? g0.toNonIndexed() : g0;
    if (g !== g0) g0.dispose();
    for (const name of Object.keys(g.attributes)) if (name !== "position" && name !== "normal") g.deleteAttribute(name);
    col.set(pt.c);
    const n = g.attributes.position.count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = col.r;
      arr[i * 3 + 1] = col.g;
      arr[i * 3 + 2] = col.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
    return g;
  });
  const merged = mergeGeometries(geos, false);
  geos.forEach((g) => g.dispose());
  merged.computeBoundingSphere();
  return merged;
}

let ramp: THREE.DataTexture | null = null;
/** The same three-step light ramp as <Toon>, so baked shapes shade exactly like the rest. */
export function toonRamp() {
  if (ramp) return ramp;
  ramp = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  ramp.minFilter = THREE.NearestFilter;
  ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  return ramp;
}

/**
 * One draw for a whole list of parts. `toon` is cel-shaded with an ink outline,
 * `flat` is cel-shaded without one (things lying on the ground), `glow` is unlit
 * (screens, windows, printed marks).
 */
export function Baked({ parts, look = "toon", castShadow = false, thickness = 2.2 }: { parts: Part[]; look?: "toon" | "flat" | "glow"; castShadow?: boolean; thickness?: number }) {
  const geo = useMemo(() => bake(parts), [parts]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} castShadow={castShadow} receiveShadow={look !== "glow"}>
      {look === "glow" ? <meshBasicMaterial vertexColors /> : <meshToonMaterial vertexColors gradientMap={toonRamp()} />}
      {look === "toon" && <Outlines thickness={thickness} color={C.ink} />}
    </mesh>
  );
}

const fmt = new Map<string, Intl.DateTimeFormat>();
function localTime(tz: string) {
  let f = fmt.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h23",
    });
    fmt.set(tz, f);
  }
  let h = 0;
  let m = 0;
  let s = 0;
  for (const p of f.formatToParts(new Date())) {
    if (p.type === "hour") h = Number(p.value);
    else if (p.type === "minute") m = Number(p.value);
    else if (p.type === "second") s = Number(p.value);
  }
  return { h, m, s };
}

/** The face of a clock, for baking: rim, face, twelve marks. Faces +z, centre at `p`. */
export function clockFace(p: V3, r: number, face = C.cream, rim = C.ink): { body: Part[]; marks: Part[] } {
  const body = [
    cyl(rim, r, r, 0.12, 28, { p, r: [Math.PI / 2, 0, 0] }),
    cyl(face, r * 0.86, r * 0.86, 0.04, 28, {
      p: [p[0], p[1], p[2] + 0.07],
      r: [Math.PI / 2, 0, 0],
    }),
  ];
  const marks: Part[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const big = i % 3 === 0;
    marks.push(
      box(rim, r * (big ? 0.1 : 0.06), r * (big ? 0.2 : 0.12), 0.02, {
        p: [p[0] + Math.sin(a) * r * 0.68, p[1] + Math.cos(a) * r * 0.68, p[2] + 0.095],
        r: [0, 0, -a],
      }),
    );
  }
  marks.push(
    cyl(C.coral, r * 0.08, r * 0.08, 0.03, 10, {
      p: [p[0], p[1], p[2] + 0.13],
      r: [Math.PI / 2, 0, 0],
    }),
  );
  return { body, marks };
}

/** Clock hands showing the real local time in `tz`. Pair with `clockFace` at the same spot. */
export function Hands({ tz, r, position }: { tz: string; r: number; position: V3 }) {
  const hour = useRef<THREE.Mesh>(null);
  const minute = useRef<THREE.Mesh>(null);
  const second = useRef<THREE.Mesh>(null);
  const last = useRef(-1);
  const geos = useMemo(
    () =>
      [
        [r * 0.11, r * 0.48],
        [r * 0.07, r * 0.7],
        [r * 0.03, r * 0.74],
      ].map(([w, len]) => new THREE.PlaneGeometry(w, len).translate(0, len / 2 - w / 2, 0)),
    [r],
  );
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);
  useFrame(({ clock }) => {
    const t = Math.floor(clock.elapsedTime * 4);
    if (t === last.current) return;
    last.current = t;
    const { h, m, s } = localTime(tz);
    if (hour.current) hour.current.rotation.z = -(((h % 12) + m / 60) / 12) * Math.PI * 2;
    if (minute.current) minute.current.rotation.z = -((m + s / 60) / 60) * Math.PI * 2;
    if (second.current) second.current.rotation.z = -(s / 60) * Math.PI * 2;
  });
  return (
    <group position={position}>
      <mesh ref={hour} position={[0, 0, 0.1]} geometry={geos[0]}>
        <meshBasicMaterial color={C.ink} />
      </mesh>
      <mesh ref={minute} position={[0, 0, 0.11]} geometry={geos[1]}>
        <meshBasicMaterial color={C.ink} />
      </mesh>
      <mesh ref={second} position={[0, 0, 0.12]} geometry={geos[2]}>
        <meshBasicMaterial color={C.coral} />
      </mesh>
    </group>
  );
}

/** A deterministic 0..1 noise, so nothing random happens during render. */
export const hash = (i: number, k = 0) => {
  const x = Math.sin(i * 91.7 + k * 12.3) * 43758.5453;
  return x - Math.floor(x);
};
