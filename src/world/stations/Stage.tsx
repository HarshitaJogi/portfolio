"use client";

import { RoundedBox, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { media } from "@/content/profile";
import { C } from "../palette";
import { Toon } from "../toon";
import { chime, textureUrl, useHoverCursor } from "../bits";
import { island } from "../state";

/** Padam, the personal: a little stage, a spotlit portrait, and ghungroo bells you can ring. */
export function Stage() {
  const tex = useTexture(textureUrl(media.dance[0].src), (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });
  const bells = useRef<THREE.Group>(null);
  const swing = useRef(0);
  const { bind } = useHoverCursor();

  useFrame(({ clock }, dt) => {
    swing.current = Math.max(0, swing.current - dt * 0.8);
    bells.current?.children.forEach((b, i) => {
      b.rotation.z = Math.sin(clock.elapsedTime * 14 + i * 0.9) * 0.5 * swing.current + Math.sin(clock.elapsedTime + i) * 0.04;
    });
  });

  const ring = () => {
    swing.current = 1;
    chime(1500 + Math.random() * 300);
    setTimeout(() => chime(1800 + Math.random() * 300), 90);
    island.set({ bells: island.get().bells + 1 });
  };

  return (
    <group position={[0, 0.05, 0.2]}>
      {/* stage */}
      <mesh position={[0, 0.3, -0.2]} castShadow receiveShadow>
        <cylinderGeometry args={[2.6, 2.75, 0.6, 40]} />
        <Toon color={C.rose} />
      </mesh>
      {/* portrait in a frame */}
      <group position={[0, 2.2, -0.9]}>
        <RoundedBox args={[1.85, 2.55, 0.16]} radius={0.06} castShadow>
          <Toon color={C.sun} />
        </RoundedBox>
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[1.6, 2.3]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
      {/* spotlight */}
      <mesh position={[0, 2.4, 0.2]} rotation={[0.18, 0, 0]}>
        <coneGeometry args={[1.5, 4.2, 28, 1, true]} />
        <meshBasicMaterial color={C.sun} transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* a string of ghungroo between two posts */}
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} position={[x, 1.3, 1]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 1.9, 8]} />
          <Toon color={C.ink} />
        </mesh>
      ))}
      <mesh position={[0, 2.2, 1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 4.4, 6]} />
        <meshBasicMaterial color={C.plum} />
      </mesh>
      <group ref={bells} position={[0, 2.2, 1]} onClick={(e) => (e.stopPropagation(), ring())} {...bind}>
        {Array.from({ length: 11 }, (_, i) => (
          <group key={i} position={[-1.9 + i * 0.38, 0, 0]}>
            <mesh position={[0, -0.18, 0]} castShadow>
              <sphereGeometry args={[0.15, 14, 10]} />
              <Toon color={C.sun} thickness={1.6} />
            </mesh>
            <mesh position={[0, -0.28, 0.12]}>
              <boxGeometry args={[0.16, 0.03, 0.02]} />
              <meshBasicMaterial color={C.ink} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
