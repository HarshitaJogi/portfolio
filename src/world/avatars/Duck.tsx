"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Toon, ToonInstances, type Instance } from "../toon";
import { Blush, Eyes, newPose, stepPose, type AvatarMotion } from "./rig";

export const DUCK = "#ffd23f";
const BEAK = "#ff8a1f";

// three little feathers sticking up off the crown
const TUFT: Instance[] = [
  { p: [0, 1.1, 0.02], r: [0.15, 0, 0], s: [1, 1.15, 1] },
  { p: [-0.1, 1.06, -0.02], r: [0, 0, 0.6], s: [0.85, 0.9, 0.85] },
  { p: [0.1, 1.06, -0.02], r: [0, 0, -0.6], s: [0.85, 0.9, 0.85] },
];

/**
 * Pip: a round yellow duckling with an orange beak and paddle feet.
 * Idle: bobs and looks about, tiny wing shuffles. Walk: a proper side-to-side waddle.
 * Cheer: flaps like mad with its beak open in a quack.
 */
export function Duck({ motion }: { motion: React.RefObject<AvatarMotion> }) {
  const pose = useRef(newPose());
  const rig = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const jaw = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Group>(null);
  const wingR = useRef<THREE.Group>(null);
  const footL = useRef<THREE.Group>(null);
  const footR = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);

  useFrame(({ clock }, dt) => {
    const p = pose.current;
    const t = clock.elapsedTime;
    stepPose(p, motion.current, t, dt, 2.0, 2.3);
    const { walk, air, cheer, ride, idle } = p;
    const s = Math.sin(p.phase);
    const c = Math.cos(p.phase);

    if (rig.current) {
      rig.current.position.y = Math.abs(c) * 0.05 * walk - ride * 0.16 + Math.abs(Math.sin(t * 10)) * 0.04 * cheer;
      // the waddle: roll onto each foot in turn
      rig.current.rotation.z = s * 0.2 * walk + Math.sin(t * 10) * 0.07 * cheer;
      rig.current.rotation.y = p.spin + s * 0.12 * walk;
      rig.current.rotation.x = 0.05 * walk - 0.15 * air;
    }
    if (body.current) body.current.scale.set(1 + Math.sin(t * 2.6) * 0.02 * idle, 1 + Math.sin(t * 2.6) * 0.035 * idle, 1);
    if (head.current) {
      // little pecking glances
      const g = Math.sin(t * 0.6);
      head.current.rotation.y = (g > 0.5 ? 0.3 : g < -0.5 ? -0.3 : 0) * idle;
      head.current.rotation.z = Math.sin(t * 1.1) * 0.06 * idle - s * 0.1 * walk;
      head.current.rotation.x = -0.15 * cheer + 0.06 * Math.sin(t * 3) * idle;
    }
    if (eyes.current) eyes.current.scale.y = p.open;
    if (jaw.current) jaw.current.rotation.x = (0.15 + Math.abs(Math.sin(t * 8)) * 0.35) * cheer + 0.2 * air;
    const flap = Math.sin(t * 22);
    if (wingL.current) {
      wingL.current.rotation.z = -0.1 - (0.25 + flap * 0.25) * walk * 0.6 - (1.1 + flap * 0.45) * air - (1.5 + flap * 0.7) * cheer;
      wingL.current.rotation.x = -0.5 * ride;
    }
    if (wingR.current) {
      wingR.current.rotation.z = 0.1 + (0.25 + flap * 0.25) * walk * 0.6 + (1.1 + flap * 0.45) * air + (1.5 + flap * 0.7) * cheer;
      wingR.current.rotation.x = -0.5 * ride;
    }
    if (footL.current) {
      footL.current.rotation.x = -s * 0.6 * walk + 0.7 * air - 1.3 * ride;
      footL.current.position.y = 0.2 + Math.max(0, -c) * 0.1 * walk;
    }
    if (footR.current) {
      footR.current.rotation.x = s * 0.6 * walk + 0.7 * air - 1.3 * ride;
      footR.current.position.y = 0.2 + Math.max(0, c) * 0.1 * walk;
    }
    if (tail.current) tail.current.rotation.z = Math.sin(t * 3) * 0.2 + Math.sin(t * 14) * 0.3 * (walk + cheer);
  });

  return (
    <group ref={rig}>
      {[-1, 1].map((x) => (
        <group key={x} ref={x < 0 ? footL : footR} position={[x * 0.21, 0.2, 0]}>
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.16, 6]} />
            <Toon color={BEAK} thickness={1.4} />
          </mesh>
          <mesh position={[0, -0.15, 0.13]} scale={[1, 0.32, 1.35]}>
            <sphereGeometry args={[0.17, 12, 8]} />
            <Toon color={BEAK} />
          </mesh>
        </group>
      ))}
      <group ref={tail} position={[0, 0.7, -0.44]}>
        <mesh position={[0, 0.08, -0.1]} rotation={[-0.9, 0, 0]}>
          <coneGeometry args={[0.14, 0.32, 8]} />
          <Toon color={DUCK} />
        </mesh>
      </group>
      <group ref={body} position={[0, 0.16, 0]}>
        <mesh position={[0, 0.44, 0]} scale={[1, 0.88, 1.05]} castShadow>
          <sphereGeometry args={[0.52, 20, 14]} />
          <Toon color={DUCK} />
        </mesh>
      </group>
      {[-1, 1].map((x) => (
        <group key={x} ref={x < 0 ? wingL : wingR} position={[x * 0.47, 0.82, -0.04]}>
          <mesh position={[x * 0.03, -0.16, 0]} scale={[0.36, 0.85, 0.62]}>
            <sphereGeometry args={[0.26, 12, 8]} />
            <Toon color={DUCK} />
          </mesh>
        </group>
      ))}
      <group ref={head} position={[0, 0.92, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.55, 22, 16]} />
          <Toon color={DUCK} />
        </mesh>
        <ToonInstances items={TUFT} color={DUCK}>
          <coneGeometry args={[0.07, 0.24, 6]} />
        </ToonInstances>
        {/* beak: top half fixed, bottom half opens for a quack */}
        <mesh position={[0, 0.4, 0.55]} scale={[1.25, 0.42, 1]}>
          <sphereGeometry args={[0.2, 14, 10]} />
          <Toon color={BEAK} />
        </mesh>
        <group ref={jaw} position={[0, 0.35, 0.45]}>
          <mesh position={[0, -0.02, 0.09]} scale={[1.05, 0.34, 0.9]}>
            <sphereGeometry args={[0.18, 12, 8]} />
            <Toon color={"#e8661a"} thickness={1.6} />
          </mesh>
        </group>
        <Eyes ref={eyes} y={0.6} x={0.23} z={0.47} r={0.1} yaw={0.45} />
        <Blush y={0.42} x={0.38} z={0.39} yaw={0.8} />
      </group>
    </group>
  );
}
