"use client";

import { useTexture } from "@react-three/drei";
import { RoundedBox } from "@/world/rounded";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { media } from "@/content/profile";
import { C } from "../../palette";
import { Toon } from "../../toon";
import { chime, textureUrl, useHoverCursor } from "../../bits";
import { island } from "../../state";
import { findEgg } from "../../eggs";
import { Tappable, TapHint } from "../../props/tappable";
import { Burst, PopText, hump, sfx, since, useKick, wiggle } from "@/world/fx";

/** Padam, the personal: a little stage, a spotlit portrait, and ghungroo bells you can ring. */
export function Stage() {
  const tex = useTexture(textureUrl(media.dance[0].src), (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });
  const bells = useRef<THREE.Group>(null);
  const swing = useRef(0);
  const { bind } = useHoverCursor();
  const [seen, setSeen] = useState(false);
  const [jingle, fireJingle] = useKick();
  const [bravo, fireBravo] = useKick();
  const frame = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, dt) => {
    const b = since(bravo);
    if (frame.current) {
      frame.current.position.y = 2.2 + hump(b, 0.4) * 0.3;
      frame.current.rotation.z = wiggle(b - 0.3, 0.06, 14, 4);
    }
    if (beam.current) (beam.current.material as THREE.MeshBasicMaterial).opacity = 0.16 + hump(b, 1.2) * 0.3;
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
    findEgg("bells");
    setSeen(true);
    fireJingle();
  };

  return (
    <group position={[0, 0.05, 0.2]}>
      {/* stage */}
      <mesh position={[0, 0.3, -0.2]} castShadow receiveShadow>
        <cylinderGeometry args={[2.6, 2.75, 0.6, 40]} />
        <Toon color={C.rose} />
      </mesh>
      {/* portrait in a frame: click it for a round of applause */}
      <Tappable
        onTap={() => {
          if (since(bravo) < 1) return;
          fireBravo();
          sfx.applause();
        }}
        hintAt={[1.25, 3.4, -0.9]}
      >
        <group ref={frame} position={[0, 2.2, -0.9]}>
          <RoundedBox args={[1.85, 2.55, 0.16]} radius={0.06} castShadow>
            <Toon color={C.sun} />
          </RoundedBox>
          <mesh position={[0, 0, 0.09]}>
            <planeGeometry args={[1.6, 2.3]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
        </group>
        <Burst kick={bravo} origin={[0, 3.4, -0.6]} count={16} colors={[C.sun, C.rose, C.cream]} size={0.1} speed={1.8} up={2.6} dur={1.2} />
        <PopText kick={bravo} text="BRAVO" position={[0, 4.0, -0.4]} size={0.5} color={C.rose} />
      </Tappable>
      {/* spotlight */}
      <mesh ref={beam} position={[0, 2.4, 0.2]} rotation={[0.18, 0, 0]}>
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
      {!seen && <TapHint position={[1.9, 2.75, 1]} />}
      <PopText kick={jingle} text="CHHAM" position={[-1.2, 2.9, 1.3]} size={0.42} color={C.sun} outline={C.ink} />
    </group>
  );
}
