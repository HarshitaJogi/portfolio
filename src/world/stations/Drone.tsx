"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { Toon, ToonInstances } from "../toon";

const ROWS = 5;
const COLS = 7;
const SICK = new Set([3, 11, 19, 26, 32]);

/**
 * A drone sweeps the crop rows in a lawnmower path. Leaves light up as the scanner
 * passes: healthy ones green, sick ones red. Real-time leaf classification, as a toy.
 */
export function Drone() {
  const drone = useRef<THREE.Group>(null);
  const rotors = useRef<THREE.Mesh[]>([]);
  const beam = useRef<THREE.Mesh>(null);
  const marks = useRef<(THREE.Mesh | null)[]>([]);
  const plants = useMemo(
    () =>
      Array.from({ length: ROWS * COLS }, (_, i) => ({
        x: -2.4 + (i % COLS) * 0.8,
        z: -1.6 + Math.floor(i / COLS) * 0.8,
        sick: SICK.has(i),
      })),
    [],
  );
  const leaves = useMemo(() => plants.map((p) => ({ p: [p.x, 0.34, p.z] as [number, number, number], color: p.sick ? "#c9a227" : C.grass })), [plants]);
  const scanned = useRef<number[]>(plants.map(() => 0));

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime * 0.35;
    const row = Math.floor(t) % ROWS;
    const f = t % 1;
    const dir = row % 2 === 0 ? 1 : -1;
    const x = -2.4 + (dir > 0 ? f : 1 - f) * 4.8;
    const z = -1.6 + row * 0.8;
    if (drone.current) {
      drone.current.position.set(x, 3.2 + Math.sin(clock.elapsedTime * 3) * 0.08, z);
      drone.current.rotation.z = -dir * 0.12;
    }
    rotors.current.forEach((r) => r && (r.rotation.y += dt * 40));
    if (beam.current) beam.current.position.set(x, 1.6, z);
    plants.forEach((p, i) => {
      if (Math.hypot(p.x - x, p.z - z) < 0.45) scanned.current[i] = 1;
      else scanned.current[i] = Math.max(0, scanned.current[i] - dt * 0.12);
      const m = marks.current[i];
      if (m) {
        const s = scanned.current[i];
        m.visible = s > 0.02;
        m.scale.setScalar(0.6 + s * 0.4);
      }
    });
  });

  return (
    <group position={[0, 0.05, 0.3]}>
      {/* soil rows */}
      {Array.from({ length: ROWS }, (_, r) => (
        <mesh key={r} position={[0, 0.06, -1.6 + r * 0.8]} receiveShadow>
          <boxGeometry args={[5.6, 0.12, 0.42]} />
          <Toon color={C.clayDark} outline={false} />
        </mesh>
      ))}
      <ToonInstances items={leaves} thickness={1.4} castShadow>
        <sphereGeometry args={[0.22, 10, 8]} />
      </ToonInstances>
      {plants.map((p, i) => (
        <group key={i} position={[p.x, 0.12, p.z]}>
          <mesh
            ref={(m) => {
              marks.current[i] = m;
            }}
            position={[0, 0.25, 0]}
            visible={false}
          >
            <boxGeometry args={[0.62, 0.62, 0.62]} />
            <meshBasicMaterial color={p.sick ? C.red : C.green} wireframe />
          </mesh>
        </group>
      ))}
      {/* scanner beam */}
      <mesh ref={beam} position={[0, 1.6, 0]}>
        <coneGeometry args={[0.5, 3, 20, 1, true]} />
        <meshBasicMaterial color={C.sun} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* the drone */}
      <group ref={drone}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.24, 0.5]} />
          <Toon color={C.cream} />
        </mesh>
        <mesh position={[0, -0.18, 0.18]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <Toon color={C.ink} outline={false} />
        </mesh>
        {[
          [-0.55, 0.42],
          [0.55, 0.42],
          [-0.55, -0.42],
          [0.55, -0.42],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0.05, z]}>
            <mesh rotation={[0, Math.atan2(z, x), Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.55, 6]} />
              <Toon color={C.ink} outline={false} />
            </mesh>
            <mesh
              ref={(m) => {
                if (m) rotors.current[i] = m;
              }}
              position={[0, 0.1, 0]}
            >
              <boxGeometry args={[0.62, 0.02, 0.08]} />
              <meshBasicMaterial color={C.ink} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
