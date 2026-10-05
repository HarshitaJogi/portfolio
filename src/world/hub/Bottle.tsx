"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { Toon } from "../toon";
import { chime, useHoverCursor } from "../bits";
import { findEgg } from "../eggs";

/** A message in a bottle, bobbing just off the island. Click it and the letter opens. */
export function Bottle({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const { bind } = useHoverCursor();
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime;
    g.position.y = position[1] + Math.sin(t * 1.3) * 0.12;
    g.rotation.set(Math.sin(t * 0.9) * 0.18, t * 0.15, Math.PI / 2 - 0.25 + Math.sin(t * 1.1) * 0.1);
  });
  return (
    <group
      ref={ref}
      position={position}
      scale={1.4}
      onClick={(e) => {
        e.stopPropagation();
        chime(988);
        findEgg("bottle");
        window.dispatchEvent(new Event("open-bottle"));
      }}
      {...bind}
    >
      <mesh>
        <capsuleGeometry args={[0.32, 0.8, 6, 14]} />
        <meshToonMaterial color="#9fe3d8" transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.13, 0.16, 0.4, 10]} />
        <Toon color="#9fe3d8" thickness={1.4} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.16, 10]} />
        <Toon color={C.bark} thickness={1.2} />
      </mesh>
      {/* the rolled letter inside */}
      <mesh rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.12, 0.12, 0.7, 10]} />
        <meshBasicMaterial color={C.cream} />
      </mesh>
    </group>
  );
}
