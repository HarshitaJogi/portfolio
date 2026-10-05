"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { Toon, ToonInstances, type Instance } from "../toon";
import { Blush, Eyes, lerp, newPose, stepPose, useFixedBounds, type AvatarMotion } from "./rig";

export const PEACOCK = "#2453e6";
const WING = "#12a39a";
const BEAK = "#f3dfb6";
const LEG = "#cdb497";
const SPOT_CORE = "#1b2a99";
const N = 13; // tail feathers
const FEATHERS = Array.from({ length: N }, (_, i) => (i % 2 ? "#2f9e5a" : C.green));

// the crest: five thin stalks, each tipped with a teal bead, fanned like a tiny tiara
const CREST_A = [-0.5, -0.25, 0, 0.25, 0.5];
const STALKS: Instance[] = CREST_A.map((a) => ({ p: [Math.sin(a) * 0.14, 0.78 + Math.cos(a) * 0.14, -0.04], r: [0, 0, -a], s: 1 }));
const BEADS: Instance[] = CREST_A.map((a) => ({ p: [Math.sin(a) * 0.3, 0.78 + Math.cos(a) * 0.3, -0.04], r: [0, 0, -a], s: [1, 1.3, 0.7] }));

const o = new THREE.Object3D();

/**
 * Mayu: a cobalt peacock with teal wings, a beaded crest and gold ghungroo on both ankles.
 * Walking, the tail trails behind as a folded train. On a cheer it fans open into a full
 * eyed fan and Mayu dances: wings out at shoulder height, head sliding side to side
 * (a Bharatanatyam attami), feet stamping the beat.
 */
export function Peacock({ motion }: { motion: React.RefObject<AvatarMotion> }) {
  const pose = useRef(newPose());
  const rig = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Group>(null);
  const wingR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const feathers = useRef<THREE.InstancedMesh>(null);
  const rings = useRef<THREE.InstancedMesh>(null);
  const cores = useRef<THREE.InstancedMesh>(null);
  useFixedBounds(feathers, 2.4, FEATHERS);
  useFixedBounds(rings, 2.4);
  useFixedBounds(cores, 2.4);

  useFrame(({ clock }, dt) => {
    const p = pose.current;
    const t = clock.elapsedTime;
    stepPose(p, motion.current, t, dt, 2.2, 4.9);
    const { walk, air, cheer, ride, idle } = p;
    const s = Math.sin(p.phase);
    const c = Math.cos(p.phase);
    const beat = Math.sin(t * 7);

    if (rig.current) {
      rig.current.position.y = Math.abs(c) * 0.07 * walk - ride * 0.42 + Math.max(0, beat) * 0.03 * cheer;
      rig.current.rotation.y = p.spin + s * 0.08 * walk;
      rig.current.rotation.z = s * 0.06 * walk;
      rig.current.rotation.x = 0.1 * walk - 0.12 * air;
    }
    if (body.current) body.current.scale.set(1, 1 + Math.sin(t * 2.3) * 0.03 * idle, 1);
    if (head.current) {
      // attami: the head slides side to side on a level neck
      head.current.position.x = Math.sin(t * 7) * 0.09 * cheer;
      head.current.position.z = 0.04 + Math.sin(p.phase * 2) * 0.05 * walk;
      head.current.rotation.y = Math.sin(t * 0.55) * 0.3 * idle;
      head.current.rotation.z = Math.sin(t * 0.9) * 0.06 * idle;
      head.current.rotation.x = Math.sin(t * 1.4) * 0.04 * idle - 0.08 * cheer;
    }
    if (eyes.current) eyes.current.scale.y = p.open;
    const flap = Math.sin(t * 18);
    if (wingL.current) {
      wingL.current.rotation.z = -0.08 - s * 0.1 * walk - (1.0 + flap * 0.4) * air - (1.4 + beat * 0.12) * cheer;
      wingL.current.rotation.x = -0.45 * ride;
    }
    if (wingR.current) {
      wingR.current.rotation.z = 0.08 + s * 0.1 * walk + (1.0 + flap * 0.4) * air + (1.4 - beat * 0.12) * cheer;
      wingR.current.rotation.x = -0.45 * ride;
    }
    // stamps on the beat while dancing
    const stampL = Math.max(0, beat) * 0.12 * cheer;
    const stampR = Math.max(0, -beat) * 0.12 * cheer;
    if (legL.current) {
      legL.current.rotation.x = -s * 0.6 * walk - 0.4 * air - 1.3 * ride;
      legL.current.rotation.z = -0.35 * ride;
      legL.current.position.y = 0.5 + stampL + Math.max(0, s) * 0.06 * walk;
    }
    if (legR.current) {
      legR.current.rotation.x = s * 0.6 * walk - 0.2 * air - 1.3 * ride;
      legR.current.rotation.z = 0.35 * ride;
      legR.current.position.y = 0.5 + stampR + Math.max(0, -s) * 0.06 * walk;
    }

    // the tail: a folded train (pointing back, nearly flat) that pitches up and spreads into a fan
    const fan = cheer;
    if (tail.current) {
      tail.current.rotation.x = lerp(-1.66, -0.22, fan) + 0.25 * air + 0.3 * ride * (1 - fan);
      tail.current.rotation.y = s * 0.18 * walk * (1 - fan) + Math.sin(t * 1.2) * 0.05 * idle;
      tail.current.rotation.z = Math.sin(t * 40) * 0.025 * fan; // the shimmer rattle
    }
    const spread = lerp(0.34, 1.42, fan) + Math.sin(t * 1.7) * 0.03;
    const F = feathers.current;
    const R = rings.current;
    const K = cores.current;
    if (F && R && K) {
      for (let i = 0; i < N; i++) {
        const k = (i / (N - 1)) * 2 - 1;
        const a = k * spread;
        const L = lerp(1.1, 1.38 - 0.16 * Math.abs(k), fan);
        const z = -Math.abs(k) * 0.035;
        const dx = Math.sin(a);
        const dy = Math.cos(a);
        o.rotation.set(0, 0, -a);
        o.position.set(dx * L * 0.5, dy * L * 0.5, z);
        o.scale.set(lerp(0.17, 0.2, fan), L * 0.52, 0.05);
        o.updateMatrix();
        F.setMatrixAt(i, o.matrix);
        o.position.set(dx * L * 0.8, dy * L * 0.8, z);
        o.scale.set(0.125, 0.15, 0.075);
        o.updateMatrix();
        R.setMatrixAt(i, o.matrix);
        o.position.set(dx * L * 0.81, dy * L * 0.81, z);
        o.scale.set(0.065, 0.08, 0.085);
        o.updateMatrix();
        K.setMatrixAt(i, o.matrix);
      }
      F.instanceMatrix.needsUpdate = true;
      R.instanceMatrix.needsUpdate = true;
      K.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={rig}>
      {[-1, 1].map((x) => (
        <group key={x} ref={x < 0 ? legL : legR} position={[x * 0.16, 0.5, 0]}>
          <mesh position={[0, -0.24, 0]}>
            <capsuleGeometry args={[0.055, 0.36, 4, 6]} />
            <Toon color={LEG} thickness={1.6} />
          </mesh>
          {/* ghungroo */}
          <mesh position={[0, -0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.045, 6, 12]} />
            <Toon color={C.gold} thickness={1.4} />
          </mesh>
        </group>
      ))}
      <group ref={tail} position={[0, 0.8, -0.32]}>
        <instancedMesh ref={feathers} args={[undefined, undefined, N]} castShadow>
          <sphereGeometry args={[1, 12, 8]} />
          <Toon color={C.white} thickness={1.8} />
        </instancedMesh>
        <instancedMesh ref={rings} args={[undefined, undefined, N]}>
          <sphereGeometry args={[1, 10, 6]} />
          <Toon color={C.gold} outline={false} />
        </instancedMesh>
        <instancedMesh ref={cores} args={[undefined, undefined, N]}>
          <sphereGeometry args={[1, 10, 6]} />
          <meshBasicMaterial color={SPOT_CORE} />
        </instancedMesh>
      </group>
      <group ref={body} position={[0, 0.9, -0.02]}>
        <mesh scale={[1, 1.12, 1.05]} castShadow>
          <sphereGeometry args={[0.4, 20, 14]} />
          <Toon color={PEACOCK} />
        </mesh>
      </group>
      {[-1, 1].map((x) => (
        <group key={x} ref={x < 0 ? wingL : wingR} position={[x * 0.36, 1.12, -0.04]}>
          <mesh position={[x * 0.03, -0.2, 0]} scale={[0.32, 0.9, 0.68]}>
            <sphereGeometry args={[0.3, 12, 8]} />
            <Toon color={WING} />
          </mesh>
        </group>
      ))}
      <group ref={head} position={[0, 1.24, 0.04]}>
        <mesh position={[0, 0.4, 0.04]} castShadow>
          <sphereGeometry args={[0.45, 22, 16]} />
          <Toon color={PEACOCK} />
        </mesh>
        <ToonInstances items={STALKS} color={SPOT_CORE} outline={false}>
          <cylinderGeometry args={[0.016, 0.016, 0.28, 5]} />
        </ToonInstances>
        <ToonInstances items={BEADS} color={C.teal} thickness={1.4}>
          <sphereGeometry args={[0.06, 10, 8]} />
        </ToonInstances>
        <mesh position={[0, 0.32, 0.56]} rotation={[Math.PI / 2 + 0.3, 0, 0]}>
          <coneGeometry args={[0.1, 0.3, 10]} />
          <Toon color={BEAK} thickness={1.6} />
        </mesh>
        <Eyes ref={eyes} y={0.46} x={0.2} z={0.41} r={0.095} yaw={0.45} patch />
        <Blush y={0.28} x={0.32} z={0.36} r={0.075} yaw={0.75} />
      </group>
    </group>
  );
}
