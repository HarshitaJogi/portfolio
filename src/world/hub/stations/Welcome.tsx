"use client";

import { RoundedBox } from "@/world/rounded";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon } from "../../toon";
import { Label } from "../../bits";
import { Tappable } from "../../props/tappable";
import { PopText, hump, sfx, since, squash, useKick, wiggle } from "@/world/fx";

/** The gate onto the island, with her name on the beam and two flags in the wind. */
export function Welcome() {
  const flags = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Group>(null);
  const [hello, fireHello] = useKick();
  const [flap, fireFlap] = useKick();
  useFrame(({ clock }) => {
    const f = since(flap);
    // a flick: both flags whip round once, then go back to the breeze
    const whirl = f < 0.9 ? (f / 0.9) * Math.PI * 2 : 0;
    flags.current?.children.forEach((g, i) => {
      g.rotation.y = Math.sin(clock.elapsedTime * (2.4 + hump(f, 1.5) * 10) + i) * 0.25 + (i ? -whirl : whirl);
    });
    const h = since(hello);
    if (beam.current) {
      beam.current.position.y = 4.1 + hump(h, 0.4) * 0.5;
      squash(beam.current, wiggle(h - 0.4, 0.12, 18, 5));
    }
  });
  return (
    <group>
      {[-2.4, 2.4].map((x) => (
        <mesh key={x} position={[x, 1.9, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.34, 3.8, 12]} />
          <Toon color={C.coral} />
        </mesh>
      ))}
      {/* the name beam: it bounces hello */}
      <Tappable
        onTap={() => {
          if (since(hello) < 0.5) return;
          fireHello();
          sfx.arp(659, 4, 0.08, "triangle");
        }}
        hintAt={[0, 5.3, 0.3]}
      >
        <group ref={beam} position={[0, 4.1, 0]}>
          <RoundedBox args={[6.2, 1.1, 0.5]} radius={0.18} castShadow>
            <Toon color={C.cream} />
          </RoundedBox>
          <Label size={0.52} position={[0, 0.02, 0.27]}>
            HARSHITA JOGI
          </Label>
        </group>
        <PopText kick={hello} text="HELLO" position={[0, 5.3, 0.6]} size={0.6} color={C.coral} />
      </Tappable>
      {/* the flags: flick them */}
      <Tappable
        onTap={() => {
          fireFlap();
          sfx.whoosh(1.2);
        }}
        hintAt={[2.8, 6.3, 0]}
      >
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
            {/* an easy target: the flags are thin */}
            <mesh position={[0.3, 0.9, 0]} visible={false}>
              <boxGeometry args={[1.0, 1.0, 0.6]} />
              <meshBasicMaterial />
            </mesh>
          </group>
        ))}
      </group>
      <PopText kick={flap} text="FLAP" position={[-2.4, 6.4, 0.4]} size={0.45} color={C.cobalt} />
      </Tappable>
    </group>
  );
}
