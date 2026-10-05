"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { AVATARS, Avatar, restMotion } from "@/world/avatars";
import { C } from "@/world/palette";
import { Plane } from "@/world/props/vehicles";
import { Toon } from "@/world/toon";
import { labState, STATES } from "./labState";

const GAP = 3.2;
const slotX = (i: number) => (i - 2) * GAP;

function readParams() {
  const q = new URLSearchParams(window.location.search);
  const fixed = STATES.indexOf((q.get("state") ?? "") as (typeof STATES)[number]);
  const focus = q.get("focus");
  return { fixed, focus: focus === null ? -1 : Number(focus), cam: q.get("cam") };
}

/** Drives the shared motion record through the five states, and lifts or seats the travelers. */
function Director({ motionRef, carriers, planes, fixed }: { motionRef: React.RefObject<ReturnType<typeof restMotion>>; carriers: React.RefObject<(THREE.Group | null)[]>; planes: React.RefObject<(THREE.Group | null)[]>; fixed: number }) {
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const idx = fixed >= 0 ? fixed : Math.floor(t / 3) % STATES.length;
    const u = fixed >= 0 ? 0.5 : t % 3;
    labState.set(idx);
    const m = motionRef.current;
    const st = STATES[idx];
    m.walk = st === "walk" ? 1 : 0;
    m.air = st === "air" ? 1 : 0;
    m.ride = st === "ride" ? 1 : 0;
    m.cheer = st === "cheer" ? (u < 1.8 ? 1 : Math.max(0, 1 - (u - 1.8) / 1.2)) : 0;
    carriers.current.forEach((g, i) => {
      if (!g) return;
      g.position.y = st === "air" ? 0.9 + Math.sin(t * 3 + i) * 0.08 : st === "ride" ? 1.3 + Math.sin(t * 1.6 + i) * 0.08 : 0;
      g.rotation.z = st === "ride" ? Math.sin(t * 1.2 + i) * 0.04 : 0;
    });
    planes.current.forEach((p) => p && (p.visible = st === "ride"));
  });
  return null;
}

export default function AvatarScene() {
  const [{ fixed, focus, cam }] = useState(readParams);
  const motion = useRef(restMotion());
  const carriers = useRef<(THREE.Group | null)[]>([]);
  const planes = useRef<(THREE.Group | null)[]>([]);
  const fx = focus >= 0 ? slotX(focus) : 0;
  const camPos: [number, number, number] = focus >= 0 ? [fx - 1.2, 2.9, 6.6] : cam === "mid" ? [0, 5.5, 14] : cam === "back" ? [3, 9, -13] : [0, 10, 24];
  const target: [number, number, number] = focus >= 0 ? [fx, 1.15, 0] : [0, 1.2, 0];

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 34, near: 0.3, far: 200, position: camPos }} gl={{ antialias: true, alpha: true }}>
      <hemisphereLight args={["#fff1dc", "#5f8f9a", 1.15]} />
      <directionalLight position={[18, 30, 12]} intensity={1.6} color="#fff4e0" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-0.0005} />
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[11, 11.4, 0.4, 48]} />
        <Toon color={C.sand} />
      </mesh>
      {AVATARS.map((a, i) => (
        <group key={a.id} position={[slotX(i), 0, 0]} rotation={[0, -0.35, 0]}>
          <group
            ref={(g) => {
              carriers.current[i] = g;
            }}
          >
            <group
              ref={(g) => {
                planes.current[i] = g;
              }}
              position={[0, -0.32, 0.1]}
              rotation={[0, -Math.PI / 2, 0]}
              visible={false}
            >
              <Plane />
            </group>
            <Avatar kind={a.id} motion={motion} />
          </group>
        </group>
      ))}
      <Director motionRef={motion} carriers={carriers} planes={planes} fixed={fixed} />
      <OrbitControls makeDefault target={target} />
    </Canvas>
  );
}
