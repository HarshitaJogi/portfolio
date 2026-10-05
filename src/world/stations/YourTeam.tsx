"use client";

import { Instance, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { person } from "@/content/profile";
import { C } from "../palette";
import { Toon } from "../toon";
import { Label, useHoverCursor } from "../bits";

/** Tillana: an empty plinth, waiting for its team. Dashed, because it is still a draft. */
export function YourTeam() {
  const q = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const { hovered, bind } = useHoverCursor();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (q.current) {
      q.current.position.y = 2.7 + Math.sin(t * 1.8) * 0.18;
      q.current.rotation.y = Math.sin(t * 0.9) * 0.4;
      const s = hovered ? 1.15 : 1;
      q.current.scale.lerp(new THREE.Vector3(s, s, s), 0.15);
    }
    if (ring.current) ring.current.rotation.y = t * 0.3;
  });
  return (
    <group position={[0, 0.05, 0.2]} onClick={(e) => (e.stopPropagation(), (window.location.href = `mailto:${person.email}`))} {...bind}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[1.25, 1.4, 1.2, 32]} />
        <Toon color={C.cream} />
      </mesh>
      {/* dashed ring: a draft, waiting to be made real */}
      <group ref={ring} position={[0, 1.25, 0]}>
        <Instances limit={18}>
          <boxGeometry args={[0.08, 0.08, 0.38]} />
          <meshBasicMaterial color={C.green} />
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2;
            return <Instance key={i} position={[Math.cos(a) * 1.9, 0, Math.sin(a) * 1.9]} rotation={[0, -a, 0]} />;
          })}
        </Instances>
      </group>
      <group ref={q}>
        <Label size={1.6} color={C.green} outline={C.ink}>
          ?
        </Label>
      </group>
      <Label size={0.26} position={[0, 0.6, 1.42]}>
        YOUR TEAM
      </Label>
    </group>
  );
}
