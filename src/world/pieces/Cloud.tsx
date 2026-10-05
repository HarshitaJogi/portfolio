"use client";

import { RoundedBox } from "@/world/rounded";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { Toon } from "../toon";
import { Label } from "../bits";

function Puff({ position, color, label, dark }: { position: [number, number, number]; color: string; label: string; dark?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.2 + position[0]) * 0.12;
  });
  return (
    <group ref={ref} position={position}>
      {[
        [0, 0, 0, 0.75],
        [-0.7, -0.15, 0, 0.55],
        [0.7, -0.12, 0.05, 0.6],
        [0.25, 0.35, -0.1, 0.5],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 18, 14]} />
          <Toon color={color} />
        </mesh>
      ))}
      <Label size={0.3} position={[0, -0.05, 0.82]} color={dark ? C.cream : C.ink}>
        {label}
      </Label>
    </group>
  );
}

/**
 * MSCI: fifteen packets arc from one cloud to the other, one per API, and land in the
 * server rack below. The rack's lights blink as they arrive.
 */
export function Cloud() {
  const from = useMemo(() => new THREE.Vector3(-2.2, 3.1, 0), []);
  const to = useMemo(() => new THREE.Vector3(2.2, 3.1, 0), []);
  const mid = useMemo(() => new THREE.Vector3(0, 5.2, 0.3), []);
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(from, mid, to), [from, mid, to]);
  const packets = useRef<(THREE.Mesh | null)[]>([]);
  const lights = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    packets.current.forEach((m, i) => {
      if (!m) return;
      const u = (t * 0.22 + i / 15) % 1;
      m.position.copy(curve.getPoint(u));
      m.rotation.set(t + i, t * 0.7, 0);
    });
    lights.current.forEach((l, i) => {
      if (l) l.color.set(Math.sin(t * 4 + i * 1.7) > 0.2 ? C.green : "#2a3a2f");
    });
  });

  return (
    <group position={[0, 0.05, 0.2]}>
      <Puff position={[-2.2, 3.1, 0]} color={C.steel} label="AZURE" />
      <Puff position={[2.2, 3.1, 0]} color={C.cobalt} label="GCP" dark />
      {Array.from({ length: 15 }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            packets.current[i] = m;
          }}
          castShadow
        >
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <Toon color={i % 3 === 0 ? C.sun : i % 3 === 1 ? C.coral : C.cream} thickness={1.4} />
        </mesh>
      ))}
      {/* server rack under the new cloud */}
      <group position={[2.2, 0, 0]}>
        <RoundedBox args={[1.3, 2.1, 1]} radius={0.08} position={[0, 1.05, 0]} castShadow>
          <Toon color={C.ink} />
        </RoundedBox>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[-0.3 + (i % 2) * 0.6, 0.45 + Math.floor(i / 2) * 0.55, 0.51]}>
            <boxGeometry args={[0.36, 0.1, 0.02]} />
            <meshBasicMaterial
              ref={(m) => {
                lights.current[i] = m;
              }}
              color={C.green}
            />
          </mesh>
        ))}
      </group>
      {/* the old rack, dimmed */}
      <RoundedBox args={[1.1, 1.4, 0.9]} radius={0.08} position={[-2.2, 0.7, 0]} castShadow>
        <Toon color={C.steel} />
      </RoundedBox>
    </group>
  );
}
