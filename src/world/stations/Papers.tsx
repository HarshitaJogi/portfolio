"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { Toon } from "../toon";
import { Label } from "../bits";

const N = 9;

/**
 * NSI: papers ride a conveyor through the LLM scanner. Before it, a lot of them are
 * flagged red. After it, nearly all are green. 60% → 98%.
 */
export function Papers() {
  const papers = useRef<(THREE.Group | null)[]>([]);
  const flags = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const scan = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    papers.current.forEach((g, i) => {
      if (!g) return;
      const u = (t * 0.12 + i / N) % 1;
      const x = -2.9 + u * 5.8;
      g.position.set(x, 0.92, 0);
      const f = flags.current[i];
      if (f) {
        const before = x < 0;
        // before the scanner: 40% wrong (red). after: 1 in 50 slips through.
        const wrong = before ? i % 5 < 2 : i === 4 && u > 0.97;
        f.color.set(wrong ? C.red : before ? C.steel : C.green);
      }
    });
    if (scan.current) scan.current.opacity = 0.25 + Math.sin(t * 6) * 0.15;
  });

  return (
    <group position={[0, 0.05, 0.3]}>
      {/* conveyor */}
      <RoundedBox args={[6.2, 0.35, 1.3]} radius={0.1} position={[0, 0.55, 0]} castShadow>
        <Toon color={C.ink} />
      </RoundedBox>
      {[-2.6, 2.6].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]}>
          <boxGeometry args={[0.3, 0.5, 1]} />
          <Toon color={C.steel} />
        </mesh>
      ))}
      {/* the LLM scanner arch */}
      <group position={[0, 0.7, 0]}>
        {[-0.8, 0.8].map((z) => (
          <mesh key={z} position={[0, 1, z]} castShadow>
            <boxGeometry args={[0.5, 2, 0.25]} />
            <Toon color={C.cobalt} />
          </mesh>
        ))}
        <RoundedBox args={[0.7, 0.55, 2]} radius={0.1} position={[0, 2.15, 0]} castShadow>
          <Toon color={C.cobalt} />
        </RoundedBox>
        <Label size={0.26} position={[0.36, 2.15, 0]} rotation={[0, Math.PI / 2, 0]} color={C.cream}>
          LLM
        </Label>
        <Label size={0.26} position={[0, 2.15, 1.01]} color={C.cream}>
          LLM
        </Label>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.1, 1.9, 1.4]} />
          <meshBasicMaterial ref={scan} color={C.sun} transparent opacity={0.3} depthWrite={false} />
        </mesh>
      </group>
      {Array.from({ length: N }, (_, i) => (
        <group
          key={i}
          ref={(g) => {
            papers.current[i] = g;
          }}
        >
          <mesh rotation={[0, 0.1 * (i % 3), 0]} castShadow>
            <boxGeometry args={[0.55, 0.06, 0.75]} />
            <Toon color={C.white} thickness={1.4} />
          </mesh>
          <mesh position={[0.15, 0.08, -0.2]}>
            <boxGeometry args={[0.18, 0.06, 0.18]} />
            <meshBasicMaterial
              ref={(m) => {
                flags.current[i] = m;
              }}
              color={C.steel}
            />
          </mesh>
        </group>
      ))}
      {/* the score board */}
      <group position={[2.6, 3.2, -0.6]}>
        <RoundedBox args={[1.9, 0.9, 0.15]} radius={0.08} castShadow>
          <Toon color={C.cream} />
        </RoundedBox>
        <Label size={0.42} position={[0, 0, 0.09]} color={C.green}>
          98%
        </Label>
      </group>
      <group position={[-2.6, 3.2, -0.6]}>
        <RoundedBox args={[1.9, 0.9, 0.15]} radius={0.08} castShadow>
          <Toon color={C.cream} />
        </RoundedBox>
        <Label size={0.42} position={[0, 0, 0.09]} color={C.red}>
          60%
        </Label>
      </group>
    </group>
  );
}
