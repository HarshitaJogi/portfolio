"use client";

import { Instance, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { C } from "../../palette";
import { Toon } from "../../toon";
import { Label, chime, useHoverCursor } from "../../bits";
import { Tappable } from "../../props/tappable";
import { Burst, PopText, hump, since, useKick } from "@/world/fx";

/** Tillana: an empty plinth, waiting for its team. Dashed, because it is still a draft. */
export function YourTeam() {
  const q = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const { hovered, bind } = useHoverCursor();
  const [spin, fireSpin] = useKick();
  const ringAngle = useRef(0);
  const big = useMemo(() => new THREE.Vector3(1.15, 1.15, 1.15), []);
  const one = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const s = since(spin);
    if (q.current) {
      q.current.position.y = 2.7 + Math.sin(t * 1.8) * 0.18 + hump(s, 0.7) * 0.8;
      // a click sends it spinning: three turns, easing out
      q.current.rotation.y = Math.sin(t * 0.9) * 0.4 + (s < 1.2 ? (1 - (1 - s / 1.2) ** 3) * Math.PI * 6 : 0);
      q.current.scale.lerp(hovered ? big : one, 0.15);
    }
    ringAngle.current += dt * (0.3 + hump(s, 1.4) * 5);
    if (ring.current) ring.current.rotation.y = ringAngle.current;
  });
  return (
    // clicking the plinth focuses the Contact district; the card beside it has the email button
    <group position={[0, 0.05, 0.2]} {...bind}>
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
      {/* the question mark: spin it (the plinth below opens an email) */}
      <Tappable
        onTap={() => {
          if (since(spin) < 0.6) return;
          fireSpin();
          [880, 1108, 1320].forEach((f, i) => setTimeout(() => chime(f), i * 90));
        }}
        hintAt={[1.0, 3.9, 0]}
      >
        <group ref={q}>
          <Label size={1.6} color={C.green} outline={C.ink}>
            ?
          </Label>
          <mesh visible={false}>
            <boxGeometry args={[1.2, 1.7, 0.6]} />
            <meshBasicMaterial />
          </mesh>
        </group>
        <Burst kick={spin} origin={[0, 2.8, 0]} count={14} colors={[C.green, C.sun, C.cream]} size={0.1} speed={2.2} up={2.4} dur={1} />
        <PopText kick={spin} text="HI" position={[-1.2, 3.6, 0.4]} size={0.6} color={C.green} />
      </Tappable>
      <Label size={0.26} position={[0, 0.6, 1.42]}>
        YOUR TEAM
      </Label>
    </group>
  );
}
