"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { Toon, ToonInstances, type Instance } from "../toon";
import { atmo } from "../atmosphere";
import { ClockFace } from "./basics";

type V3 = [number, number, number];

/** Window panes that glow warmer as night falls. One shared material per building type. */
function useNightGlass(day = C.glass, night = "#ffd27a") {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: day }), [day]);
  const d = useMemo(() => new THREE.Color(day), [day]);
  const n = useMemo(() => new THREE.Color(night), [night]);
  useFrame(() => {
    mat.color.copy(d).lerp(n, Math.min(1, atmo.night * 1.2));
  });
  return mat;
}

/** A grid of windows on one face, as a single instanced draw. */
function Windows({ w, h, cols, rows, z, y0 = 0.6, size = [0.34, 0.46] as [number, number], mat }: { w: number; h: number; cols: number; rows: number; z: number; y0?: number; size?: [number, number]; mat: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => {
    const out: V3[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) out.push([-w / 2 + (w / cols) * (c + 0.5), y0 + ((h - y0) / rows) * (r + 0.5), z]);
    return out;
  }, [w, h, cols, rows, z, y0]);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    items.forEach((p, i) => {
      o.position.set(...p);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, mat, items.length]}>
      <planeGeometry args={size} />
    </instancedMesh>
  );
}

/**
 * A Boston brownstone: stoop, bay window, cornice. Rows of these line the streets
 * around Northeastern and the Back Bay.
 */
export function Brownstone({ position = [0, 0, 0], rotation = 0, color = C.brownstone, floors = 3 }: { position?: V3; rotation?: number; color?: string; floors?: number }) {
  const glass = useNightGlass();
  const h = floors * 1.15 + 0.4;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, h, 2.4]} />
        <Toon color={color} />
      </mesh>
      {/* bay window */}
      <mesh position={[-0.45, h / 2 + 0.2, 1.3]} castShadow>
        <boxGeometry args={[1, h - 0.9, 0.4]} />
        <Toon color={color} />
      </mesh>
      {/* cornice */}
      <mesh position={[0, h + 0.1, 0.1]} castShadow>
        <boxGeometry args={[2.4, 0.22, 2.7]} />
        <Toon color={C.stone} />
      </mesh>
      {/* stoop and door */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.6, 0.12 + i * 0.16, 1.55 - i * 0.18]} castShadow>
          <boxGeometry args={[0.7, 0.16, 0.36]} />
          <Toon color={C.stone} thickness={1.2} />
        </mesh>
      ))}
      <mesh position={[0.6, 0.95, 1.21]}>
        <planeGeometry args={[0.46, 0.8]} />
        <meshBasicMaterial color={C.ink} />
      </mesh>
      <Windows w={1} h={h - 0.2} cols={1} rows={floors} z={1.51} y0={0.9} mat={glass} />
      <Windows w={1} h={h - 0.2} cols={1} rows={floors - 1} z={1.21} y0={1.9} mat={glass} size={[0.3, 0.42]} />
    </group>
  );
}

/** A glass-and-concrete high-rise, the Mumbai skyline kind. */
export function Tower({ position = [0, 0, 0], h = 8, w = 2.2, d = 2.2, color = C.concrete }: { position?: V3; h?: number; w?: number; d?: number; color?: string }) {
  const glass = useNightGlass("#8ec5de", "#ffd27a");
  const rows = Math.round(h / 0.9);
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <Toon color={color} />
      </mesh>
      <mesh position={[0, h + 0.3, 0]} castShadow>
        <boxGeometry args={[w * 0.5, 0.6, d * 0.5]} />
        <Toon color={color} />
      </mesh>
      <Windows w={w} h={h} cols={3} rows={rows} z={d / 2 + 0.01} y0={0.4} size={[w / 3 - 0.18, 0.5]} mat={glass} />
    </group>
  );
}

/**
 * A red-brick college hall with white columns and a pediment. Not any one building:
 * the look of a Boston campus.
 */
export function BrickHall({ position = [0, 0, 0], rotation = 0, w = 7, h = 3.6 }: { position?: V3; rotation?: number; w?: number; h?: number }) {
  const glass = useNightGlass();
  const cols = 4;
  const columns = useMemo<Instance[]>(() => Array.from({ length: cols }, (_, i) => ({ p: [-1.5 + i, h / 2 - 0.05, 1.75] as V3 })), [h]);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, 3]} />
        <Toon color={C.brick} />
      </mesh>
      <mesh position={[0, h + 0.12, 0]} castShadow>
        <boxGeometry args={[w + 0.3, 0.24, 3.3]} />
        <Toon color={C.cream} />
      </mesh>
      {/* portico: steps, columns, pediment */}
      <mesh position={[0, 0.15, 2]} castShadow>
        <boxGeometry args={[4.4, 0.3, 1.4]} />
        <Toon color={C.stone} />
      </mesh>
      <ToonInstances items={columns} color={C.cream} castShadow>
        <cylinderGeometry args={[0.18, 0.2, h - 0.4, 12]} />
      </ToonInstances>
      <mesh position={[0, h - 0.05, 1.75]} castShadow>
        <boxGeometry args={[4.2, 0.3, 0.7]} />
        <Toon color={C.cream} />
      </mesh>
      <mesh position={[0, h + 0.5, 1.75]} rotation={[0, 0, Math.PI / 4]} scale={[1.55, 0.55, 1]} castShadow>
        <boxGeometry args={[1.4, 1.4, 0.6]} />
        <Toon color={C.cream} />
      </mesh>
      <Windows w={w} h={h - 0.3} cols={7} rows={2} z={1.51} y0={0.5} size={[0.42, 0.7]} mat={glass} />
    </group>
  );
}

/**
 * A Gothic clock tower in stone, in the spirit of the University of Mumbai's Fort campus.
 * Its clock shows the real time in Mumbai.
 */
export function GothicTower({ position = [0, 0, 0], tz = "Asia/Kolkata" }: { position?: V3; tz?: string }) {
  const tiers: { y: number; w: number; h: number }[] = [
    { y: 0, w: 2.6, h: 3.2 },
    { y: 3.2, w: 2.2, h: 2.6 },
    { y: 5.8, w: 1.8, h: 2.2 },
    { y: 8, w: 1.4, h: 1.4 },
  ];
  const pinnacles = useMemo<Instance[]>(
    () => tiers.flatMap((t) => [-1, 1].flatMap((sx) => [-1, 1].map((sz) => ({ p: [(sx * t.w) / 2, t.y + t.h + 0.3, (sz * t.w) / 2] as V3 })))),
    // the tiers are constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return (
    <group position={position}>
      {tiers.map((t, i) => (
        <group key={i}>
          <mesh position={[0, t.y + t.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[t.w, t.h, t.w]} />
            <Toon color={i % 2 ? "#e2d3b2" : C.stone} />
          </mesh>
          {/* arched windows */}
          <mesh position={[0, t.y + t.h * 0.45, t.w / 2 + 0.01]}>
            <planeGeometry args={[t.w * 0.3, t.h * 0.5]} />
            <meshBasicMaterial color={C.ink} />
          </mesh>
        </group>
      ))}
      {/* corner pinnacles, all sixteen in one draw */}
      <ToonInstances items={pinnacles} color={C.stone} thickness={1.2}>
        <coneGeometry args={[0.14, 0.7, 6]} />
      </ToonInstances>
      <mesh position={[0, 10.6, 0]} castShadow>
        <coneGeometry args={[0.95, 2.4, 8]} />
        <Toon color={C.brickDark} />
      </mesh>
      <group position={[0, 7.2, 1.13]}>
        <ClockFace tz={tz} r={0.62} />
      </group>
    </group>
  );
}

/** A street lamp. The bulb lights up as night falls. */
export function Lamp({ position = [0, 0, 0], h = 2.6 }: { position?: V3; h?: number }) {
  const bulb = useRef<THREE.MeshBasicMaterial>(null);
  const day = useMemo(() => new THREE.Color("#f3ead8"), []);
  const night = useMemo(() => new THREE.Color("#ffd27a"), []);
  useFrame(() => bulb.current?.color.copy(day).lerp(night, atmo.night));
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, h, 6]} />
        <Toon color={C.ink} outline={false} />
      </mesh>
      <mesh position={[0, h + 0.15, 0]}>
        <sphereGeometry args={[0.2, 12, 10]} />
        <meshBasicMaterial ref={bulb} color="#f3ead8" />
      </mesh>
    </group>
  );
}

/** A park bench. */
export function Bench({ position = [0, 0, 0], rotation = 0 }: { position?: V3; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.4, 0.08, 0.45]} />
        <Toon color={C.bark} thickness={1.2} />
      </mesh>
      <mesh position={[0, 0.75, -0.2]} castShadow>
        <boxGeometry args={[1.4, 0.4, 0.06]} />
        <Toon color={C.bark} thickness={1.2} />
      </mesh>
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]}>
          <boxGeometry args={[0.06, 0.44, 0.4]} />
          <Toon color={C.ink} outline={false} />
        </mesh>
      ))}
    </group>
  );
}
