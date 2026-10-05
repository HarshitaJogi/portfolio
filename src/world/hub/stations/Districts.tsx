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

/** Education: Mumbai's Gothic tower and a Boston brick hall, with the cap still dashed. */
export function EducationDistrict() {
  return (
    <group position={[0, 0.05, 0.6]}>
      <group position={[-1.5, 0, -0.2]} scale={0.3}>
        <GothicTower />
      </group>
      <group position={[1.1, 0, 0.1]} scale={0.34}>
        <BrickHall w={6} />
      </group>
      <Bob position={[0.2, 2.9, 0.4]} amp={0.12}>
        <group rotation={[0.3, 0.6, 0]} scale={0.8}>
          <Mortarboard draft />
        </group>
      </Bob>
    </group>
  );
}

/** A tiny plane on a loop around a district. */
function LoopPlane({ r = 2.6, h = 3.6 }: { r?: number; h?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime * 0.7;
    g.position.set(Math.cos(t) * r, h + Math.sin(t * 2) * 0.2, Math.sin(t) * r);
    g.rotation.set(0, -t - Math.PI / 2, -0.35);
  });
  return (
    <group ref={ref} scale={0.38}>
      <Plane />
    </group>
  );
}

/** Experience: a signpost to every city on the path, and the plane that flies between them. */
export function ExperienceDistrict() {
  return (
    <group position={[0, 0.05, 0.5]}>
      <Signpost
        position={[0.2, 0, 0]}
        arrows={[
          { text: "SUNNYVALE", angle: 0.35, color: C.sun },
          { text: "BOSTON", angle: -0.5, color: C.maple },
          { text: "MUMBAI", angle: 2.6, color: C.teal },
          { text: "REMOTE", angle: 3.4 },
        ]}
      />
      <group position={[-1.8, 0, -0.4]} scale={0.4}>
        <Tower h={6} />
      </group>
      <group position={[2.1, 0, -0.6]} scale={0.38}>
        <Brownstone />
      </group>
      <Palm position={[-2.3, 0, 0.9]} height={2.4} />
      <LoopPlane />
    </group>
  );
}

/** Projects: a drone over a maize patch, a pumpkin from Hack-o-Ween, and a trophy. */
export function ProjectsDistrict() {
  const drone = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = drone.current;
    if (!g) return;
    const t = clock.elapsedTime;
    g.position.set(-0.9 + Math.sin(t * 0.8) * 0.8, 2.4 + Math.sin(t * 3) * 0.06, 0.2 + Math.cos(t * 0.8) * 0.4);
  });
  return (
    <group position={[0, 0.05, 0.5]}>
      {Array.from({ length: 9 }, (_, i) => (
        <Corn key={i} position={[-1.8 + (i % 3) * 0.55, 0, -0.3 + Math.floor(i / 3) * 0.55]} h={1.1} sick={i === 4} phase={i} />
      ))}
      <group ref={drone} scale={0.55}>
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
      <group position={[1.4, 0, -0.2]} scale={0.7}>
        <Trophy place="2ND" color={C.silver} />
      </group>
      <Pumpkin position={[0.4, 0, 1.1]} s={0.6} lit />
    </group>
  );
}
