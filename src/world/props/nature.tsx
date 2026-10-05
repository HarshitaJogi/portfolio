"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { Toon, ToonInstances, type Instance } from "../toon";

type V3 = [number, number, number];

/** A palm, leaning a little, fronds that sway. California, Mumbai, anywhere warm. */
export function Palm({ position = [0, 0, 0], height = 4.2, lean = 0.12, phase = 0 }: { position?: V3; height?: number; lean?: number; phase?: number }) {
  const crown = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (crown.current) crown.current.rotation.z = Math.sin(clock.elapsedTime * 1.3 + phase) * 0.06;
  });
  const segs = 6;
  return (
    <group position={position} rotation={[0, phase, lean]}>
      {Array.from({ length: segs }, (_, i) => (
        <mesh key={i} position={[0, (i + 0.5) * (height / segs), 0]} castShadow>
          <cylinderGeometry args={[0.16 - i * 0.012, 0.19 - i * 0.012, height / segs + 0.02, 8]} />
          <Toon color={i % 2 ? C.bark : "#a0714c"} thickness={1.6} />
        </mesh>
      ))}
      <group ref={crown} position={[0, height, 0]}>
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2;
          return (
            <group key={i} rotation={[0, a, 0]}>
              <mesh position={[0.9, -0.25, 0]} rotation={[0, 0, -0.45]} castShadow>
                <boxGeometry args={[1.9, 0.06, 0.48]} />
                <Toon color={i % 2 ? C.palm : C.leaf} thickness={1.4} />
              </mesh>
            </group>
          );
        })}
        <mesh position={[0, -0.15, 0]}>
          <sphereGeometry args={[0.22, 10, 8]} />
          <Toon color={C.bark} thickness={1.4} />
        </mesh>
      </group>
    </group>
  );
}

/** Many maples in three draws. Fall colours: Boston in October. */
export function Maples({ at, colors = [C.maple, C.mapleDeep, C.sun] }: { at: { p: V3; s?: number }[]; colors?: string[] }) {
  const trunk = useMemo<Instance[]>(() => at.map((t) => ({ p: [t.p[0], t.p[1] + 0.7 * (t.s ?? 1), t.p[2]], s: t.s ?? 1 })), [at]);
  const crown = useMemo<Instance[]>(
    () => at.map((t, i) => ({ p: [t.p[0], t.p[1] + 2.1 * (t.s ?? 1), t.p[2]], s: t.s ?? 1, color: colors[i % colors.length] })),
    [at, colors],
  );
  return (
    <>
      <ToonInstances items={trunk} color={C.bark} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 1.4, 8]} />
      </ToonInstances>
      <ToonInstances items={crown} castShadow>
        <icosahedronGeometry args={[1.05, 0]} />
      </ToonInstances>
    </>
  );
}

/** Leaves drifting down around `area`, in maple colours. */
export function FallingLeaves({ count = 26, area = [10, 6, 10], colors = [C.maple, C.mapleDeep, C.sun] }: { count?: number; area?: V3; colors?: string[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (k: number) => {
          const x = Math.sin(i * 91.7 + k * 12.3) * 43758.5453;
          return x - Math.floor(x);
        };
        return { x: (r(1) - 0.5) * area[0], z: (r(2) - 0.5) * area[2], off: r(3) * area[1], speed: 0.35 + r(4) * 0.4, spin: r(5) * 6 };
      }),
    [count, area],
  );
  const o = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const colored = useRef(false);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = clock.elapsedTime;
    seeds.forEach((s, i) => {
      const y = area[1] - ((t * s.speed + s.off) % area[1]);
      o.position.set(s.x + Math.sin(t * 1.4 + s.spin) * 0.5, y, s.z + Math.cos(t + s.spin) * 0.3);
      o.rotation.set(t * 2 + s.spin, t + s.spin, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      if (!colored.current) m.setColorAt(i, col.set(colors[i % colors.length]));
    });
    colored.current = true;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[0.22, 0.16]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

/** Rolling golden hills, for the backdrop of the South Bay. */
export function Hills({ position = [0, 0, 0], color = C.hills, scale = 1 }: { position?: V3; color?: string; scale?: number }) {
  const bumps: { p: V3; s: V3 }[] = [
    { p: [-6, 0, 0], s: [7, 2.6, 4] },
    { p: [1, 0, -1], s: [8, 3.6, 5] },
    { p: [8, 0, 0.5], s: [6, 2.2, 4] },
  ];
  return (
    <group position={position} scale={scale}>
      {bumps.map((b, i) => (
        <mesh key={i} position={b.p} scale={b.s} receiveShadow>
          <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Toon color={i === 1 ? color : "#d39f4a"} thickness={2} />
        </mesh>
      ))}
    </group>
  );
}

/** A cloud of rain under a grey cloud: monsoon in Mumbai. */
export function Rain({ count = 60, area = [8, 7, 6] as V3, position = [0, 0, 0] as V3 }: { count?: number; area?: V3; position?: V3 }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (k: number) => {
          const x = Math.sin(i * 57.3 + k * 9.1) * 43758.5453;
          return x - Math.floor(x);
        };
        return { x: (r(1) - 0.5) * area[0], z: (r(2) - 0.5) * area[2], off: r(3) * area[1], speed: 7 + r(4) * 3 };
      }),
    [count, area],
  );
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    seeds.forEach((s, i) => {
      o.position.set(s.x, area[1] - ((clock.elapsedTime * s.speed + s.off) % area[1]), s.z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <group position={position}>
      <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[0.03, 0.45, 0.03]} />
        <meshBasicMaterial color="#d6ecff" transparent opacity={0.7} />
      </instancedMesh>
      <group position={[0, area[1] + 0.4, 0]}>
        {[
          [-1.6, 0, 0, 1.4],
          [0, 0.3, 0.2, 1.8],
          [1.7, 0, -0.1, 1.3],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <sphereGeometry args={[r, 14, 10]} />
            <Toon color="#9aa3b5" thickness={2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** A low bush. */
export function Bush({ position = [0, 0, 0], color = C.leaf, s = 1 }: { position?: V3; color?: string; s?: number }) {
  return (
    <mesh position={[position[0], position[1] + 0.35 * s, position[2]]} scale={[s, s * 0.75, s]} castShadow>
      <icosahedronGeometry args={[0.6, 0]} />
      <Toon color={color} thickness={1.6} />
    </mesh>
  );
}
