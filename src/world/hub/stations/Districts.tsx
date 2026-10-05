"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Bob } from "../../props/basics";
import { BrickHall, GothicTower, Tower, Brownstone } from "../../props/city";
import { Palm } from "../../props/nature";
import { Corn, Mortarboard, Pumpkin, Signpost, Trophy } from "../../props/things";
import { Plane } from "../../props/vehicles";
import { Toon } from "../../toon";
import { Tappable } from "../../props/tappable";
import { Burst, HintUntil, PopText, Ripple, hump, sfx, since, squash, useKick, wiggle, type Kick } from "@/world/fx";

/** Education: Mumbai's Gothic tower and a Boston brick hall, with the cap still dashed. */
export function EducationDistrict() {
  const cap = useRef<THREE.Group>(null);
  const tower = useRef<THREE.Group>(null);
  const [toss, fireToss] = useKick();
  const [dong, fireDong] = useKick();
  useFrame(() => {
    const s = since(toss);
    if (cap.current) {
      // up, flipping, and back down into the hand that threw it
      cap.current.position.y = hump(s, 1.1) * 2.4;
      cap.current.rotation.set(0.3 + (s < 1.1 ? (s / 1.1) * Math.PI * 4 : 0), 0.6 + (s < 1.1 ? s * 3 : 0), 0);
    }
    if (tower.current) squash(tower.current, wiggle(since(dong), 0.08, 14, 3), 0.3);
  });
  return (
    <group position={[0, 0.05, 0.6]}>
      {/* the tower: ring its bell */}
      <Tappable
        onTap={() => {
          if (since(dong) < 0.8) return;
          fireDong();
          sfx.dong();
        }}
        position={[-1.5, 0, -0.2]}
        hintAt={[0, 4.4, 0]}
      >
        <group ref={tower} scale={0.3}>
          <GothicTower />
        </group>
        <Ripple kick={dong} position={[0, 2.16, 0.4]} rotation={[0, 0, 0]} color={C.cream} from={0.3} to={1.4} dur={0.8} />
        <PopText kick={dong} text="DONG" position={[0.2, 4.0, 0.6]} size={0.5} color={C.brickDark} />
      </Tappable>
      <group position={[1.1, 0, 0.1]} scale={0.34}>
        <BrickHall w={6} />
      </group>
      {/* the cap: toss it */}
      <Tappable
        onTap={() => {
          if (since(toss) < 1) return;
          fireToss();
          sfx.whee();
        }}
        position={[0.2, 2.9, 0.4]}
        hintAt={[0, 1.0, 0]}
      >
        <Bob amp={0.12}>
          <group ref={cap} rotation={[0.3, 0.6, 0]}>
            <group scale={0.8}>
              <Mortarboard draft />
            </group>
            <mesh position={[0, -0.1, 0]} visible={false}>
              <boxGeometry args={[1.4, 0.7, 1.4]} />
              <meshBasicMaterial />
            </mesh>
          </group>
        </Bob>
        <PopText kick={toss} text="WHEE" position={[1.1, 1.4, 0.4]} size={0.45} color={C.cobalt} />
      </Tappable>
    </group>
  );
}

/** A tiny plane on a loop around a district. */
function LoopPlane({ r = 2.6, h = 3.6, loop }: { r?: number; h?: number; loop: Kick }) {
  const ref = useRef<THREE.Group>(null);
  const roll = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime * 0.7;
    const s = since(loop);
    // a loop-the-loop: pitch all the way round while climbing and dropping back
    const f = s < 1.2 ? s / 1.2 : 0;
    g.position.set(Math.cos(t) * r, h + Math.sin(t * 2) * 0.2 + Math.sin(f * Math.PI) * 1.2, Math.sin(t) * r);
    g.rotation.set(0, -t - Math.PI / 2, -0.35);
    if (roll.current) roll.current.rotation.z = f * Math.PI * 2;
  });
  return (
    <group ref={ref}>
      <group ref={roll} scale={0.38}>
        <Plane />
        {/* an easy target: the plane is small and quick */}
        <mesh visible={false}>
          <sphereGeometry args={[2.4, 8, 6]} />
          <meshBasicMaterial />
        </mesh>
      </group>
      <HintUntil kick={loop} at={[0, 1.0, 0]} />
      <group position={[0, 0.9, 0]} rotation={[0, Math.PI / 2, 0]}>
        <PopText kick={loop} text="ZOOM" position={[0, 0, 0]} size={0.4} color={C.coral} />
      </group>
    </group>
  );
}

/** Experience: a signpost to every city on the path, and the plane that flies between them. */
const ARROWS = [
  { text: "SUNNYVALE", angle: 0.35, color: C.sun },
  { text: "BOSTON", angle: -0.5, color: C.maple },
  { text: "MUMBAI", angle: 2.6, color: C.teal },
  { text: "REMOTE", angle: 3.4 },
];

export function ExperienceDistrict() {
  const post = useRef<THREE.Group>(null);
  const palm = useRef<THREE.Group>(null);
  const [whirl, fireWhirl] = useKick();
  const [loop, fireLoop] = useKick();
  const [sway, fireSway] = useKick();
  useFrame(() => {
    const s = since(whirl);
    // the arrows spin like a weathervane in a gust, then settle back where they point
    if (post.current) post.current.rotation.y = s < 1.4 ? (1 - (1 - s / 1.4) ** 3) * Math.PI * 4 : 0;
    if (palm.current) palm.current.rotation.z = wiggle(since(sway), 0.18, 9, 2.5);
  });
  return (
    <group position={[0, 0.05, 0.5]}>
      <Tappable
        onTap={() => {
          if (since(whirl) < 1.2) return;
          fireWhirl();
          sfx.whoosh(1);
          sfx.clank(1.4);
        }}
        position={[0.2, 0, 0]}
        hintAt={[0, 3.9, 0]}
      >
        <group ref={post}>
          <Signpost arrows={ARROWS} />
        </group>
        <PopText kick={whirl} text="WHOOSH" position={[0, 3.6, 0.8]} size={0.42} color={C.maple} />
      </Tappable>
      <group position={[-1.8, 0, -0.4]} scale={0.4}>
        <Tower h={6} />
      </group>
      <group position={[2.1, 0, -0.6]} scale={0.38}>
        <Brownstone />
      </group>
      <Tappable
        onTap={() => {
          fireSway();
          sfx.rustle();
        }}
        position={[-2.3, 0, 0.9]}
        hintAt={[0, 3.3, 0]}
      >
        <group ref={palm}>
          <Palm height={2.4} />
          <mesh position={[0, 1.8, 0]} visible={false}>
            <cylinderGeometry args={[0.9, 0.9, 2.2, 8]} />
            <meshBasicMaterial />
          </mesh>
        </group>
      </Tappable>
      <Tappable
        onTap={() => {
          if (since(loop) < 1.2) return;
          fireLoop();
          sfx.whee();
          sfx.buzz();
        }}
      >
        <LoopPlane loop={loop} />
      </Tappable>
    </group>
  );
}

/** Projects: a drone over a maize patch, a pumpkin from Hack-o-Ween, and a trophy. */
export function ProjectsDistrict() {
  const drone = useRef<THREE.Group>(null);
  const flip = useRef<THREE.Group>(null);
  const cup = useRef<THREE.Group>(null);
  const field = useRef<THREE.Group>(null);
  const [buzz, fireBuzz] = useKick();
  const [ding, fireDing] = useKick();
  const [rustle, fireRustle] = useKick();
  useFrame(({ clock }) => {
    const g = drone.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const s = since(buzz);
    const f = s < 1 ? s / 1 : 0;
    g.position.set(-0.9 + Math.sin(t * 0.8) * 0.8, 2.4 + Math.sin(t * 3) * 0.06 + Math.sin(f * Math.PI) * 1.1, 0.2 + Math.cos(t * 0.8) * 0.4);
    // a flip: one full roll at the top of a hop
    if (flip.current) flip.current.rotation.x = f * Math.PI * 2;
    const d = since(ding);
    if (cup.current) {
      cup.current.position.y = hump(d, 0.45) * 0.6;
      cup.current.rotation.y = d < 0.8 ? (d / 0.8) * Math.PI * 2 : 0;
    }
    if (field.current) field.current.rotation.z = wiggle(since(rustle), 0.1, 12, 3);
  });
  return (
    <group position={[0, 0.05, 0.5]}>
      {/* the maize patch: brush through it */}
      <Tappable
        onTap={() => {
          fireRustle();
          sfx.rustle();
        }}
        position={[-1.25, 0, 0.25]}
        hintAt={[0, 1.7, 0.9]}
      >
        <group ref={field}>
          {Array.from({ length: 9 }, (_, i) => (
            <Corn key={i} position={[-0.55 + (i % 3) * 0.55, 0, -0.55 + Math.floor(i / 3) * 0.55]} h={1.1} sick={i === 4} phase={i} />
          ))}
          <mesh position={[0, 0.6, 0]} visible={false}>
            <boxGeometry args={[1.8, 1.3, 1.8]} />
            <meshBasicMaterial />
          </mesh>
        </group>
      </Tappable>
      {/* the drone: tap it for a flip */}
      <Tappable
        onTap={() => {
          if (since(buzz) < 1) return;
          fireBuzz();
          sfx.buzz();
          sfx.whee();
        }}
      >
      <group ref={drone} scale={0.55}>
        <group ref={flip}>
        <mesh visible={false}>
          <sphereGeometry args={[1.3, 8, 6]} />
          <meshBasicMaterial />
        </mesh>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.24, 0.5]} />
          <Toon color={C.cream} />
        </mesh>
        {[-0.5, 0.5].flatMap((x) =>
          [-0.4, 0.4].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.12, z]}>
              <cylinderGeometry args={[0.25, 0.25, 0.02, 12]} />
              <meshBasicMaterial color={C.ink} transparent opacity={0.5} />
            </mesh>
          )),
        )}
        </group>
        <HintUntil kick={buzz} at={[0, 1.6, 0]} scale={1.8} />
        <PopText kick={buzz} text="BZZZ" position={[0, 1.4, 0.4]} size={0.7} color={C.ink} />
      </group>
      </Tappable>
      {/* the trophy: give it a spin */}
      <Tappable
        onTap={() => {
          if (since(ding) < 0.6) return;
          fireDing();
          sfx.arp(1046, 3, 0.06, "sine");
        }}
        position={[1.4, 0, -0.2]}
        hintAt={[0, 2.7, 0]}
      >
        <group ref={cup} scale={0.7}>
          <Trophy place="2ND" color={C.silver} />
        </group>
        <Burst kick={ding} origin={[0, 1.6, 0]} count={12} colors={[C.silver, C.sun, C.white]} size={0.1} speed={1.6} up={2.6} dur={0.9} />
        <PopText kick={ding} text="DING" position={[0.4, 2.4, 0.4]} size={0.42} color={C.cobalt} />
      </Tappable>
      <Pumpkin position={[0.4, 0, 1.1]} s={0.6} lit />
    </group>
  );
}
