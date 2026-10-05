"use client";

import { RoundedBox, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { bitgig, media } from "@/content/profile";
import { C } from "../palette";
import { Toon } from "../toon";
import { Label, textureUrl, useHoverCursor } from "../bits";

/** Side quests: a hackathon booth with Bitgig on screen, and TryBud's 2nd place trophy. */
export function Booth() {
  const tex = useTexture(textureUrl(media.bitgig.src, 828), (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });
  const trophy = useRef<THREE.Group>(null);
  const { bind } = useHoverCursor();
  useFrame(({ clock }) => {
    if (trophy.current) trophy.current.rotation.y = clock.elapsedTime * 0.8;
  });
  return (
    <group position={[0, 0.05, 0.2]}>
      {/* awning */}
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} position={[x, 1.7, -0.8]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 3.4, 8]} />
          <Toon color={C.ink} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-1.85 + i * 0.74, 3.45, -0.6]} rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.74, 0.12, 1.5]} />
          <Toon color={i % 2 ? C.cream : C.plum} thickness={1.4} />
        </mesh>
      ))}
      {/* the screen: a real screenshot of Bitgig */}
      <group position={[-0.5, 1.75, -0.7]} onClick={(e) => (e.stopPropagation(), window.open(bitgig.live, "_blank", "noopener"))} {...bind}>
        <RoundedBox args={[3.1, 2, 0.16]} radius={0.06} castShadow>
          <Toon color={C.ink} />
        </RoundedBox>
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[2.85, 1.78]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
      <Label size={0.24} position={[-0.5, 0.55, -0.6]} color={C.ink}>
        BITGIG · BERKELEY × DEEPMIND
      </Label>
      {/* trophy */}
      <group position={[2.1, 0, 0.6]}>
        <RoundedBox args={[1, 0.7, 1]} radius={0.06} position={[0, 0.35, 0]} castShadow>
          <Toon color={C.cream} />
        </RoundedBox>
        <Label size={0.22} position={[0, 0.36, 0.51]}>
          2ND
        </Label>
        <group ref={trophy} position={[0, 0.7, 0]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.25, 0.3, 12]} />
            <Toon color={C.sun} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.18, 0.8, 16]} />
            <Toon color={C.sun} />
          </mesh>
          {[-0.45, 0.45].map((x) => (
            <mesh key={x} position={[x, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.16, 0.05, 8, 16, Math.PI]} />
              <Toon color={C.sun} outline={false} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
