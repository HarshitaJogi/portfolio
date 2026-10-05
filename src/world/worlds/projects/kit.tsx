"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { atmo } from "../../atmosphere";

export type V3 = [number, number, number];

/** A stable pseudo-random number in [0, 1) for (i, k). Same every render. */
export const hash = (i: number, k = 0) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Every static box in a diorama, in one draw call (two with the ink outline). Each part
 * is a unit cube scaled to [w, h, d] with its own colour.
 */
export function Boxes({ items, outline = true, thickness = 1.8, castShadow = true }: { items: Instance[]; outline?: boolean; thickness?: number; castShadow?: boolean }) {
  return (
    <ToonInstances items={items} outline={outline} thickness={thickness} castShadow={castShadow}>
      <boxGeometry args={[1, 1, 1]} />
    </ToonInstances>
  );
}

/** Every static cylinder in a diorama: posts, legs, poles. Unit cylinder scaled to [d, h, d]. */
export function Cyls({
  items,
  outline = true,
  thickness = 1.6,
  castShadow = true,
  sides = 10,
}: {
  items: Instance[];
  outline?: boolean;
  thickness?: number;
  castShadow?: boolean;
  sides?: number;
}) {
  return (
    <ToonInstances items={items} outline={outline} thickness={thickness} castShadow={castShadow}>
      <cylinderGeometry args={[0.5, 0.5, 1, sides]} />
    </ToonInstances>
  );
}

/** Unlit copies of one shape, for things that glow: screens, stars, sparks. */
export function Glows({
  items,
  children,
  color = C.white,
  transparent = false,
  opacity = 1,
}: {
  items: Instance[];
  children: ReactNode;
  color?: string;
  transparent?: boolean;
  opacity?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
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
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      {children}
      <meshBasicMaterial color={color} transparent={transparent} opacity={opacity} depthWrite={!transparent} toneMapped={false} />
    </instancedMesh>
  );
}

/**
 * An instanced shape whose copies move every frame. `onFrame` writes the matrices through
 * `put`. The outline copy shares the same matrices, so it follows for free.
 */
export function Moving({
  count,
  children,
  onFrame,
  color = C.white,
  outline = true,
  thickness = 1.6,
  basic = false,
  castShadow = false,
  transparent = false,
  opacity = 1,
  onClick,
  bind,
  margin = 2.5,
}: {
  margin?: number;
  count: number;
  children: ReactNode;
  onFrame: (put: Put, t: number, dt: number, m: THREE.InstancedMesh) => void;
  color?: string;
  outline?: boolean;
  thickness?: number;
  basic?: boolean;
  castShadow?: boolean;
  transparent?: boolean;
  opacity?: number;
  onClick?: (e: { stopPropagation: () => void; instanceId?: number }) => void;
  bind?: Record<string, unknown>;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const putRef = useRef<{ mesh: THREE.InstancedMesh; put: Put } | null>(null);
  const bounded = useRef(false);
  useFrame(({ clock }, dt) => {
    const m = ref.current;
    if (!m) return;
    if (putRef.current?.mesh !== m) putRef.current = { mesh: m, put: makePut(m) };
    onFrame(putRef.current.put, clock.elapsedTime, dt, m);
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    if (!bounded.current) {
      // bounds from the first frame's layout, padded for how far the copies roam, so the
      // whole set is still culled when its islet is off screen (outline copy included)
      bounded.current = true;
      m.computeBoundingSphere();
      if (m.boundingSphere) m.boundingSphere.radius += margin;
      m.traverse((o) => {
        if (o !== m && (o as THREE.InstancedMesh).isInstancedMesh) (o as THREE.InstancedMesh).boundingSphere = m.boundingSphere;
        o.frustumCulled = true;
      });
    }
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow={castShadow} receiveShadow={!basic} frustumCulled={false} onClick={onClick} {...bind}>
      {children}
      {basic ? (
        <meshBasicMaterial color={color} transparent={transparent} opacity={opacity} depthWrite={!transparent} toneMapped={false} />
      ) : (
        <Toon color={color} outline={outline} thickness={thickness} />
      )}
    </instancedMesh>
  );
}

export type Put = {
  (i: number, x: number, y: number, z: number, sx?: number, sy?: number, sz?: number, rx?: number, ry?: number, rz?: number): void;
  color: (i: number, c: string | THREE.Color) => void;
};

function makePut(m: THREE.InstancedMesh): Put {
  const o = new THREE.Object3D();
  const col = new THREE.Color();
  const put = ((i: number, x: number, y: number, z: number, sx = 1, sy = sx, sz = sx, rx = 0, ry = 0, rz = 0) => {
    o.position.set(x, y, z);
    o.rotation.set(rx, ry, rz);
    o.scale.set(sx || 1e-4, sy || 1e-4, sz || 1e-4);
    o.updateMatrix();
    m.setMatrixAt(i, o.matrix);
  }) as Put;
  put.color = (i, c) => {
    m.setColorAt(i, typeof c === "string" ? col.set(c) : c);
  };
  return put;
}

/** A basic material that brightens from `day` to `night` as the sky darkens. */
export function useNightColor(day: string, night: string) {
  const ref = useRef<THREE.MeshBasicMaterial>(null);
  const a = useMemo(() => new THREE.Color(day), [day]);
  const b = useMemo(() => new THREE.Color(night), [night]);
  useFrame(() => ref.current?.color.copy(a).lerp(b, atmo.night));
  return ref;
}

/** Stars over a night islet: tiny unlit diamonds that only show once it is dark. */
export function Stars({ count = 26, seed = 1 }: { count?: number; seed?: number }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const items = useMemo<Instance[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        // spread across the sky behind the islet, never in front of the scene
        const p: V3 = [-8 + hash(i, seed) * 19, 5.6 + hash(i, seed + 2) * 4.2, -8.5 - hash(i, seed + 1) * 3];
        return {
          p,
          s: 0.07 + hash(i, seed + 3) * 0.09,
          r: [0, 0, Math.PI / 4] as V3,
        };
      }),
    [count, seed],
  );
  useFrame(() => {
    if (mat.current) mat.current.opacity = atmo.night;
  });
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    items.forEach((it, i) => {
      o.position.set(...it.p);
      o.rotation.set(...(it.r ?? [0, 0, 0]));
      o.scale.setScalar(it.s as number);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial ref={mat} color="#fff6d8" transparent opacity={0} depthWrite={false} toneMapped={false} fog={false} />
    </instancedMesh>
  );
}

/** A big moon disc with two craters, for the night islets. */
export function Moon({ position, r = 0.9 }: { position: V3; r?: number }) {
  const mat = useNightColor("#f6e7c8", "#fff4cf");
  return (
    <group position={position}>
      <mesh>
        <circleGeometry args={[r, 32]} />
        <meshBasicMaterial ref={mat} color="#f6e7c8" toneMapped={false} fog={false} />
      </mesh>
      {[
        [-0.3, 0.2, 0.22],
        [0.28, -0.25, 0.14],
      ].map(([x, y, s]) => (
        <mesh key={x} position={[x * r, y * r, 0.01]}>
          <circleGeometry args={[s * r, 16]} />
          <meshBasicMaterial color="#e6d3a8" toneMapped={false} fog={false} />
        </mesh>
      ))}
    </group>
  );
}

/** A thick check mark built from two bars, as one geometry. Unit size: about 1 wide. */
export function useCheckGeometry(depth = 0.08) {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.5, 0.05);
    s.lineTo(-0.32, 0.23);
    s.lineTo(-0.12, 0.03);
    s.lineTo(0.34, 0.5);
    s.lineTo(0.52, 0.32);
    s.lineTo(-0.12, -0.33);
    s.lineTo(-0.5, 0.05);
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
    g.translate(0, -0.05, -depth / 2);
    return g;
  }, [depth]);
}

/* ---------- a lean clock: three hands in one draw, real local time, no allocations ---------- */

const offsets = new Map<string, { ms: number; at: number }>();
/** How far `tz` is ahead of UTC, in ms. Read with Intl now and then, cached in between. */
function tzOffset(tz: string) {
  const now = Date.now();
  const hit = offsets.get(tz);
  if (hit && now - hit.at < 600_000) return hit.ms;
  const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" });
  const v: Record<string, number> = {};
  for (const p of f.formatToParts(new Date(now))) v[p.type] = Number(p.value);
  const ms = Date.UTC(v.year, v.month - 1, v.day, v.hour, v.minute, v.second) - (now - (now % 1000));
  offsets.set(tz, { ms, at: now });
  return ms;
}

const INK = new THREE.Color(C.ink);
const CORAL = new THREE.Color(C.coral);
/** A hand: a unit plane whose pivot is at its base. */
const HAND = new THREE.PlaneGeometry(1, 1).translate(0, 0.42, 0);

/**
 * Hour, minute and second hands showing the real time in `tz`, as one instanced draw.
 * Pair with a baked `clockFace` of the same radius at the same spot (it has the centre pin).
 */
export function ClockHands({ tz, r, position }: { tz: string; r: number; position: V3 }) {
  return (
    <group position={position}>
      <Moving
        count={3}
        basic
        margin={r}
        onFrame={(put) => {
          const sec = ((Date.now() + tzOffset(tz)) / 1000) % 86400;
          const h = (sec / 3600) % 12;
          const m = (sec / 60) % 60;
          const s = Math.floor(sec % 60);
          put(0, 0, 0, 0.1, r * 0.11, r * 0.55, 1, 0, 0, -(h / 12) * Math.PI * 2);
          put(1, 0, 0, 0.11, r * 0.07, r * 0.8, 1, 0, 0, -(m / 60) * Math.PI * 2);
          put(2, 0, 0, 0.12, r * 0.03, r * 0.85, 1, 0, 0, -(s / 60) * Math.PI * 2);
          put.color(0, INK);
          put.color(1, INK);
          put.color(2, CORAL);
        }}
      >
        <primitive object={HAND} attach="geometry" />
      </Moving>
    </group>
  );
}

/** A rectangle outline of width w, height h and border b, centred on the origin. */
export function frameGeometry(w: number, h: number, b: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, -h / 2);
  s.lineTo(w / 2, -h / 2);
  s.lineTo(w / 2, h / 2);
  s.lineTo(-w / 2, h / 2);
  s.lineTo(-w / 2, -h / 2);
  const hole = new THREE.Path();
  hole.moveTo(-w / 2 + b, -h / 2 + b);
  hole.lineTo(-w / 2 + b, h / 2 - b);
  hole.lineTo(w / 2 - b, h / 2 - b);
  hole.lineTo(w / 2 - b, -h / 2 + b);
  hole.lineTo(-w / 2 + b, -h / 2 + b);
  s.holes.push(hole);
  return new THREE.ShapeGeometry(s);
}
