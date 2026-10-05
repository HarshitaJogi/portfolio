"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { Toon, ToonInstances, type Instance } from "../toon";
import { Blush, Eyes, newPose, stepPose, type AvatarMotion } from "./rig";

export const GINGER = "#ff9a3c";
const CREAM = "#fff1dc";
const EAR = "#ffb3c1";
const COCOA = "#7a4a33";

// whiskers: three a side, fanning out from the muzzle
const WHISKERS: Instance[] = [-1, 1].flatMap((s) =>
  [-0.2, 0, 0.2].map((a) => ({ p: [s * 0.42, 1.35 + a * 0.3, 0.4] as [number, number, number], r: [0, s * 0.45, s * a] as [number, number, number], s: [1, 1, 1] as [number, number, number] })),
);

/**
 * Mochi: a round ginger cat with a cream muzzle and one cocoa ear (a calico wink).
 * Idle: tail sways, an ear twitches now and then, head tilts. Walk: a bouncy trot.
 * Cheer: paws up, tail curls into a hook, ears perk.
 */
export function Cat({ motion }: { motion: React.RefObject<AvatarMotion> }) {
  const pose = useRef(newPose());
  const rig = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const earL = useRef<THREE.Group>(null);
  const earR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Group>(null);

  useFrame(({ clock }, dt) => {
    const p = pose.current;
    const t = clock.elapsedTime;
    stepPose(p, motion.current, t, dt, 2.4, 1.1);
    const { walk, air, cheer, ride, idle } = p;
    const s = Math.sin(p.phase);
    const bounce = Math.abs(Math.cos(p.phase));

    if (rig.current) {
      rig.current.position.y = bounce * 0.1 * walk - ride * 0.3;
      rig.current.rotation.y = p.spin + Math.sin(t * 7) * 0.18 * cheer;
      rig.current.rotation.z = s * 0.06 * walk + Math.sin(t * 7) * 0.06 * cheer;
      rig.current.rotation.x = 0.08 * walk - 0.1 * air - 0.06 * cheer;
    }
    if (body.current) body.current.scale.set(1, 1 + Math.sin(t * 2.4) * 0.03 * idle, 1);
    if (head.current) {
      head.current.rotation.z = Math.sin(t * 0.8) * 0.12 * idle + s * 0.05 * walk + Math.sin(t * 8) * 0.1 * cheer;
      head.current.rotation.y = Math.sin(t * 0.5 + 2) * 0.2 * idle;
      head.current.rotation.x = -0.12 * cheer + 0.05 * walk;
    }
    if (eyes.current) eyes.current.scale.y = p.open;
    // a twitch every few seconds, first one ear then the other
    const tw = (t % 4.3) < 0.25 ? Math.sin(((t % 4.3) / 0.25) * Math.PI * 3) * 0.35 : 0;
    const tw2 = ((t + 2.1) % 5.1) < 0.25 ? Math.sin((((t + 2.1) % 5.1) / 0.25) * Math.PI * 3) * 0.35 : 0;
    if (earL.current) earL.current.rotation.z = 0.32 + tw + 0.15 * air - 0.12 * cheer;
    if (earR.current) earR.current.rotation.z = -0.32 + tw2 - 0.15 * air + 0.12 * cheer;
    const swing = s * 0.8 * walk;
    const wave = Math.sin(t * 11) * 0.3 * cheer;
    if (armL.current) {
      armL.current.rotation.x = swing - 0.8 * ride - 0.3 * cheer;
      armL.current.rotation.z = -0.25 - 1.2 * air - 2.0 * cheer + wave;
    }
    if (armR.current) {
      armR.current.rotation.x = -swing - 0.8 * ride - 0.3 * cheer;
      armR.current.rotation.z = 0.25 + 1.2 * air + 2.0 * cheer - wave;
    }
    if (legL.current) {
      legL.current.rotation.x = -s * 0.7 * walk - 0.8 * air - 1.35 * ride;
      legL.current.rotation.z = -0.35 * ride;
    }
    if (legR.current) {
      legR.current.rotation.x = s * 0.7 * walk - 0.5 * air - 1.35 * ride;
      legR.current.rotation.z = 0.35 * ride;
    }
    if (tail.current) {
      tail.current.rotation.z = Math.sin(t * 1.6) * 0.45 * (1 - cheer) + Math.sin(t * 5) * 0.4 * walk * (1 - cheer);
      tail.current.rotation.x = -0.75 + 0.35 * air + 0.6 * cheer - 0.6 * ride;
    }
    if (tip.current) {
      tip.current.rotation.z = Math.sin(t * 1.6 - 0.8) * 0.5 * (1 - cheer);
      tip.current.rotation.x = -0.5 + 1.9 * cheer + 0.3 * ride;
    }
  });

  return (
    <group ref={rig}>
      {[-1, 1].map((x) => (
        <group key={x} ref={x < 0 ? legL : legR} position={[x * 0.2, 0.36, 0]}>
          <mesh position={[0, -0.17, 0.04]}>
            <capsuleGeometry args={[0.14, 0.12, 4, 10]} />
            <Toon color={GINGER} />
          </mesh>
        </group>
      ))}
      <group ref={tail} position={[0, 0.42, -0.36]}>
        <mesh position={[0, 0.27, 0]}>
          <capsuleGeometry args={[0.085, 0.42, 4, 8]} />
          <Toon color={GINGER} />
        </mesh>
        <group ref={tip} position={[0, 0.52, 0]}>
          <mesh position={[0, 0.17, 0]}>
            <capsuleGeometry args={[0.09, 0.2, 4, 8]} />
            <Toon color={COCOA} />
          </mesh>
        </group>
      </group>
      <group ref={body} position={[0, 0.2, 0]}>
        <mesh position={[0, 0.42, 0]} scale={[1, 1.05, 0.9]} castShadow>
          <sphereGeometry args={[0.42, 18, 14]} />
          <Toon color={GINGER} />
        </mesh>
      </group>
      {[-1, 1].map((x) => (
        <group key={x} ref={x < 0 ? armL : armR} position={[x * 0.34, 0.86, 0.04]}>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.11, 0.22, 4, 8]} />
            <Toon color={GINGER} />
          </mesh>
        </group>
      ))}
      <group ref={head} position={[0, 1.02, 0]}>
        <mesh position={[0, 0.46, 0]} scale={[1.14, 0.94, 1]} castShadow>
          <sphereGeometry args={[0.52, 22, 16]} />
          <Toon color={GINGER} />
        </mesh>
        {/* ears: outer and pink inner; the left one is cocoa */}
        {[-1, 1].map((x) => (
          <group key={x} ref={x < 0 ? earL : earR} position={[x * 0.36, 0.78, 0]} rotation={[0, 0, -x * 0.32]}>
            <mesh position={[0, 0.17, 0]}>
              <coneGeometry args={[0.21, 0.4, 4]} />
              <Toon color={x < 0 ? COCOA : GINGER} />
            </mesh>
            <mesh position={[0, 0.13, 0.08]} rotation={[-0.15, 0, 0]}>
              <coneGeometry args={[0.12, 0.26, 4]} />
              <Toon color={EAR} outline={false} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.33, 0.45]} scale={[1.25, 0.82, 0.62]}>
          <sphereGeometry args={[0.17, 14, 10]} />
          <Toon color={CREAM} thickness={1.4} />
        </mesh>
        <mesh position={[0, 0.4, 0.55]} scale={[1.3, 0.85, 0.8]}>
          <sphereGeometry args={[0.055, 10, 8]} />
          <meshBasicMaterial color={C.rose} />
        </mesh>
        <group position={[0, -1.02, 0]}>
          <ToonInstances items={WHISKERS} color={C.ink} outline={false}>
            <boxGeometry args={[0.28, 0.018, 0.018]} />
          </ToonInstances>
        </group>
        <Eyes ref={eyes} y={0.54} x={0.22} z={0.44} r={0.105} yaw={0.42} />
        <Blush y={0.36} x={0.38} z={0.36} yaw={0.8} />
      </group>
    </group>
  );
}
