"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon } from "../../toon";
import { Label } from "../../bits";

/** The gate onto the island, with her name on the beam and two flags in the wind. */
export function Welcome() {
  const flags = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    flags.current?.children.forEach((f, i) => {
      f.rotation.y = Math.sin(clock.elapsedTime * 2.4 + i) * 0.25;
    });
  });
  return (
    <group>
      {[-2.4, 2.4].map((x) => (
        <mesh key={x} position={[x, 1.9, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.34, 3.8, 12]} />
          <Toon color={C.coral} />
        </mesh>
      ))}
      <RoundedBox args={[6.2, 1.1, 0.5]} radius={0.18} position={[0, 4.1, 0]} castShadow>
        <Toon color={C.cream} />
      </RoundedBox>
      <Label size={0.52} position={[0, 4.12, 0.27]}>
        HARSHITA JOGI
      </Label>
      <group ref={flags}>
        {[-2.4, 2.4].map((x, i) => (
          <group key={x} position={[x, 4.7, 0]}>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 1.2, 6]} />
              <Toon color={C.ink} outline={false} />
            </mesh>
            <mesh position={[0.35, 1, 0]}>
              <boxGeometry args={[0.7, 0.4, 0.03]} />
              <Toon color={i ? C.sun : C.cobalt} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
