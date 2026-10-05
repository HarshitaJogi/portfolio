"use client";

import { RoundedBox } from "@/world/rounded";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { Toon } from "../toon";
import { newPose, stepPose, type AvatarMotion } from "./rig";

const GLOW = "#7cf6ff";
const SCREEN = "#1d2350";
const RAINBOW = [C.coral, C.sun, C.green, C.teal, C.cobalt, C.rose];

/**
 * Bolt: a chunky cream robot with a screen for a face, coral arms and stompy boots.
 * Idle: hums up and down, glances around, antenna bobs, blinks on screen.
 * Cheer: arms up and waving, happy squint, antenna flashes through the rainbow.
 */
export function Robot({ motion }: { motion: React.RefObject<AvatarMotion> }) {
  const pose = useRef(newPose());
  const rig = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const antenna = useRef<THREE.Group>(null);
  const bulb = useRef<THREE.MeshBasicMaterial>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);

  useFrame(({ clock }, dt) => {
    const p = pose.current;
    const t = clock.elapsedTime;
    stepPose(p, motion.current, t, dt, 2.1, 0.3);
    const { walk, air, cheer, ride, idle } = p;
    const s = Math.sin(p.phase);
    const step = Math.abs(Math.cos(p.phase));

    if (rig.current) {
      rig.current.position.y = Math.sin(t * 2.2) * 0.03 * idle + step * 0.09 * walk - ride * 0.36 + Math.abs(Math.sin(t * 9)) * 0.05 * cheer;
      rig.current.rotation.z = s * 0.07 * walk + Math.sin(t * 9) * 0.08 * cheer;
      rig.current.rotation.y = p.spin + Math.sin(t * 6) * 0.15 * cheer;
      rig.current.rotation.x = 0.06 * walk - 0.08 * air;
    }
    if (torso.current) torso.current.scale.set(1, 1 + Math.sin(t * 2.2) * 0.025, 1);
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.7) * 0.22 * idle + Math.sin(t * 7) * 0.12 * cheer;
      head.current.rotation.z = Math.sin(t * 0.9 + 1) * 0.05 * idle + s * 0.05 * walk;
      head.current.rotation.x = -0.1 * cheer + 0.05 * ride;
    }
    if (eyes.current) eyes.current.scale.y = p.open;
    if (mouth.current) mouth.current.scale.setScalar(1 + cheer * 0.7);
    if (antenna.current) {
      antenna.current.rotation.z = Math.sin(t * 3) * 0.12 + s * 0.25 * walk + Math.sin(t * 14) * 0.3 * cheer;
      antenna.current.rotation.x = -0.4 * air + 0.2 * walk;
    }
    if (bulb.current) {
      if (cheer > 0.3) bulb.current.color.set(RAINBOW[Math.floor(t * 10) % RAINBOW.length]);
      else bulb.current.color.set(Math.sin(t * 3) > -0.6 ? C.red : "#7a1f28");
    }
    const swing = s * 0.7 * walk;
    const wave = Math.sin(t * 12) * 0.35 * cheer;
    if (armL.current) {
      armL.current.rotation.x = swing - 0.9 * ride - 0.35 * cheer;
      armL.current.rotation.z = -0.12 - 1.25 * air - 1.95 * cheer + wave;
    }
    if (armR.current) {
      armR.current.rotation.x = -swing - 0.9 * ride - 0.35 * cheer;
      armR.current.rotation.z = 0.12 + 1.25 * air + 1.95 * cheer - wave;
    }
    const lift = Math.max(0, s) * 0.12 * walk;
    const lift2 = Math.max(0, -s) * 0.12 * walk;
    if (legL.current) {
      legL.current.rotation.x = -s * 0.55 * walk - 0.7 * air - 1.25 * ride;
      legL.current.rotation.z = -0.3 * ride;
      legL.current.position.y = 0.42 + lift + 0.12 * air;
    }
    if (legR.current) {
      legR.current.rotation.x = s * 0.55 * walk - 0.5 * air - 1.25 * ride;
      legR.current.rotation.z = 0.3 * ride;
      legR.current.position.y = 0.42 + lift2 + 0.12 * air;
    }
  });

  return (
    <group ref={rig}>
      {/* boots */}
      {[-1, 1].map((x) => (
        <group key={x} ref={x < 0 ? legL : legR} position={[x * 0.25, 0.42, 0]}>
          <mesh position={[0, -0.14, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
            <Toon color={C.steel} thickness={1.6} />
          </mesh>
          <RoundedBox args={[0.34, 0.22, 0.44]} radius={0.09} position={[0, -0.31, 0.04]} castShadow>
            <Toon color={C.coral} />
          </RoundedBox>
        </group>
      ))}
      <group ref={torso} position={[0, 0.4, 0]}>
        <RoundedBox args={[0.92, 0.66, 0.72]} radius={0.24} position={[0, 0.33, 0]} castShadow>
          <Toon color={C.cream} />
        </RoundedBox>
        {/* chest light: a little heart-shaped glow */}
        <mesh position={[0, 0.38, 0.36]} scale={[1, 1, 0.4]}>
          <sphereGeometry args={[0.1, 12, 8]} />
          <Toon color={C.sun} thickness={1.4} emissive={C.sun} />
        </mesh>
      </group>
      {[-1, 1].map((x) => (
        <group key={x} ref={x < 0 ? armL : armR} position={[x * 0.5, 0.95, 0]}>
          <mesh position={[0, -0.26, 0]}>
            <capsuleGeometry args={[0.12, 0.32, 4, 10]} />
            <Toon color={C.coral} />
          </mesh>
        </group>
      ))}
      <group ref={head} position={[0, 1.08, 0]}>
        <RoundedBox args={[1.3, 0.98, 0.98]} radius={0.3} position={[0, 0.5, 0]} castShadow>
          <Toon color={C.cream} />
        </RoundedBox>
        {/* screen face */}
        <RoundedBox args={[1.0, 0.66, 0.1]} radius={0.05} position={[0, 0.5, 0.45]}>
          <meshBasicMaterial color={SCREEN} />
        </RoundedBox>
        <group ref={eyes} position={[0, 0.56, 0.51]}>
          {[-1, 1].map((x) => (
            <mesh key={x} position={[x * 0.22, 0, 0]} scale={[0.85, 1.25, 0.3]}>
              <sphereGeometry args={[0.11, 12, 8]} />
              <meshBasicMaterial color={GLOW} />
            </mesh>
          ))}
        </group>
        <mesh ref={mouth} position={[0, 0.38, 0.51]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.075, 0.022, 6, 12, Math.PI]} />
          <meshBasicMaterial color={GLOW} />
        </mesh>
        {[-1, 1].map((x) => (
          <mesh key={x} position={[x * 0.38, 0.4, 0.51]} scale={[1.3, 0.7, 0.2]}>
            <sphereGeometry args={[0.065, 8, 6]} />
            <meshBasicMaterial color={C.rose} />
          </mesh>
        ))}
        {/* ear bolts */}
        {[-1, 1].map((x) => (
          <mesh key={x} position={[x * 0.67, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.17, 0.14, 14]} />
            <Toon color={C.coral} />
          </mesh>
        ))}
        <group ref={antenna} position={[0, 0.97, 0]}>
          <mesh position={[0, 0.17, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.34, 6]} />
            <meshBasicMaterial color={C.ink} />
          </mesh>
          <mesh position={[0, 0.39, 0]}>
            <sphereGeometry args={[0.12, 12, 10]} />
            <meshBasicMaterial ref={bulb} color={C.red} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
