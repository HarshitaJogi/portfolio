"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { Toon, ToonInstances, type Instance } from "../toon";
import { Blush, Eyes, ToonMapped, newPose, stepPose, type AvatarMotion } from "./rig";

export const ELEPHANT = "#b0a8d4";
const EAR_IN = "#f6b4c8";

let cloth: THREE.CanvasTexture | null = null;
/**
 * The jhool on Gajju's back, painted once: gold hems, teal bands, a rose field of gold
 * dots and a little cobalt diamond in the middle. u runs hem to hem across the back.
 */
function clothTexture() {
  if (cloth) return cloth;
  const W = 256;
  const H = 128;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  g.fillStyle = C.rose;
  g.fillRect(0, 0, W, H);
  const band = (u0: number, u1: number, col: string) => {
    g.fillStyle = col;
    g.fillRect(u0 * W, 0, (u1 - u0) * W, H);
    g.fillRect(W - u1 * W, 0, (u1 - u0) * W, H);
  };
  band(0, 0.1, C.gold);
  band(0.1, 0.17, C.teal);
  band(0.17, 0.2, C.gold);
  // front and back edges
  g.fillStyle = C.gold;
  g.fillRect(0, 0, W, 9);
  g.fillRect(0, H - 9, W, 9);
  const dot = (x: number, y: number, r: number, col: string) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  };
  // dots on the gold hem, and a rose-field scatter
  for (let y = 10; y < H; y += 18) {
    dot(0.05 * W, y, 3.2, C.rose);
    dot(0.95 * W, y, 3.2, C.rose);
  }
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 9; col++) {
      const x = (0.24 + (col + (row % 2) * 0.5) * 0.065) * W;
      const y = 20 + row * 18;
      if (x > 0.77 * W) continue;
      if (Math.abs(x - W / 2) < 30 && Math.abs(y - H / 2) < 34) continue;
      dot(x, y, 3.4, C.gold);
    }
  }
  // the medallion
  g.save();
  g.translate(W / 2, H / 2);
  g.rotate(Math.PI / 4);
  g.fillStyle = C.gold;
  g.fillRect(-24, -24, 48, 48);
  g.fillStyle = C.cobalt;
  g.fillRect(-17, -17, 34, 34);
  g.fillStyle = C.gold;
  g.fillRect(-6, -6, 12, 12);
  g.restore();
  cloth = new THREE.CanvasTexture(cv);
  cloth.colorSpace = THREE.SRGBColorSpace;
  cloth.anisotropy = 4;
  return cloth;
}

// body centre (rig space), and the cloth's hem tassels hanging off both sides
const BODY: [number, number, number] = [0, 0.92, -0.15];
const TASSELS: Instance[] = [-1, 1].flatMap((s) => [-0.3, -0.15, 0, 0.15, 0.3].map((z) => ({ p: [s * 0.62, 0.84, BODY[2] + z] as [number, number, number] })));
const PIVOT = -0.5; // the hind legs: Gajju rears up and sits around here

/**
 * Gajju: a baby elephant in soft lavender-grey with huge ears, a curly trunk, a gold
 * forehead charm and an embroidered cloth on its back.
 * Idle: ears fan slowly, trunk curls and sways. Walk: a diagonal plod with ear flaps.
 * Air: ears out like wings. Cheer: rears a little and trumpets with the trunk up high.
 */
export function Elephant({ motion }: { motion: React.RefObject<AvatarMotion> }) {
  const tex = useMemo(() => clothTexture(), []);
  const pose = useRef(newPose());
  const rig = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const earL = useRef<THREE.Group>(null);
  const earR = useRef<THREE.Group>(null);
  const t1 = useRef<THREE.Group>(null);
  const t2 = useRef<THREE.Group>(null);
  const t3 = useRef<THREE.Group>(null);
  const legs = useRef<(THREE.Group | null)[]>([]);
  const tail = useRef<THREE.Group>(null);

  useFrame(({ clock }, dt) => {
    const p = pose.current;
    const t = clock.elapsedTime;
    stepPose(p, motion.current, t, dt, 1.7, 3.7);
    const { walk, air, cheer, ride, idle } = p;
    const s = Math.sin(p.phase);
    const c = Math.cos(p.phase);

    if (rig.current) {
      rig.current.position.y = Math.abs(c) * 0.06 * walk - ride * 0.32;
      rig.current.rotation.x = -0.22 * cheer - 0.5 * ride + Math.sin(t * 9) * 0.03 * cheer + 0.06 * air;
      rig.current.rotation.y = p.spin + Math.sin(t * 5) * 0.12 * cheer;
      rig.current.rotation.z = s * 0.04 * walk + Math.sin(t * 9) * 0.05 * cheer;
    }
    if (body.current) body.current.scale.set(1 + Math.sin(t * 1.8) * 0.02 * idle, 1 + Math.sin(t * 1.8) * 0.03 * idle, 1);
    if (head.current) {
      head.current.rotation.x = Math.sin(p.phase * 2) * 0.05 * walk - 0.15 * cheer + 0.1 * ride + Math.sin(t * 1.3) * 0.03 * idle;
      head.current.rotation.y = Math.sin(t * 0.45) * 0.18 * idle;
      head.current.rotation.z = Math.sin(t * 0.7) * 0.05 * idle;
    }
    if (eyes.current) eyes.current.scale.y = p.open;
    const fan = Math.sin(t * 1.7) * 0.18 * idle + Math.sin(p.phase * 2) * 0.22 * walk + Math.sin(t * 16) * 0.45 * cheer + Math.sin(t * 14) * 0.25 * air;
    const out = 0.45 - 0.45 * air - 0.15 * cheer;
    if (earL.current) {
      earL.current.rotation.y = -out - fan;
      earL.current.rotation.z = -0.35 * air;
    }
    if (earR.current) {
      earR.current.rotation.y = out + fan;
      earR.current.rotation.z = 0.35 * air;
    }
    // the trunk: three links, each curling a bit more than the last
    const sway = Math.sin(t * 1.4) * 0.25 * idle + s * 0.25 * walk;
    if (t1.current) {
      t1.current.rotation.x = -0.4 - 0.9 * air - 1.95 * cheer - 0.6 * ride + Math.sin(t * 1.1) * 0.08;
      t1.current.rotation.z = sway;
    }
    if (t2.current) t2.current.rotation.x = -0.55 + 0.25 * cheer + Math.sin(t * 1.1 - 0.6) * 0.12 + Math.sin(t * 10) * 0.12 * cheer;
    if (t3.current) t3.current.rotation.x = -1.0 + 1.6 * cheer + Math.sin(t * 1.1 - 1.2) * 0.18;
    // diagonal pairs: front-left with back-right
    const L = legs.current;
    const sw = s * 0.5 * walk;
    const front = -0.55 * air - 0.6 * ride - 0.35 * cheer;
    const back = 0.45 * air - 1.0 * ride;
    if (L[0]) L[0].rotation.x = sw + front + Math.sin(t * 9) * 0.25 * cheer;
    if (L[1]) L[1].rotation.x = -sw + front - Math.sin(t * 9) * 0.25 * cheer;
    if (L[2]) L[2].rotation.x = -sw + back;
    if (L[3]) L[3].rotation.x = sw + back;
    if (tail.current) tail.current.rotation.z = Math.sin(t * 2.2) * 0.35 + Math.sin(t * 12) * 0.4 * cheer;
  });

  return (
    <group ref={rig} position={[0, 0, PIVOT]}>
      <group position={[0, 0, -PIVOT]}>
        {(
          [
            [-0.3, 0.24],
            [0.3, 0.24],
            [-0.3, -0.5],
            [0.3, -0.5],
          ] as const
        ).map(([x, z], i) => (
          <group
            key={i}
            ref={(g) => {
              legs.current[i] = g;
            }}
            position={[x, 0.56, z]}
          >
            <mesh position={[0, -0.28, 0]}>
              <capsuleGeometry args={[0.17, 0.22, 4, 10]} />
              <Toon color={ELEPHANT} />
            </mesh>
          </group>
        ))}
        <group ref={tail} position={[0, 1.02, -0.82]} rotation={[0.55, 0, 0]}>
          <mesh position={[0, -0.17, 0]}>
            <capsuleGeometry args={[0.045, 0.28, 4, 6]} />
            <Toon color={ELEPHANT} thickness={1.6} />
          </mesh>
        </group>
        <group ref={body} position={BODY}>
          <mesh scale={[0.95, 0.82, 1.15]} castShadow>
            <sphereGeometry args={[0.6, 22, 16]} />
            <Toon color={ELEPHANT} />
          </mesh>
          {/* the embroidered cloth, draped over the top */}
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1.02, 1, 0.88]}>
            <cylinderGeometry args={[0.6, 0.6, 0.8, 24, 1, true, Math.PI - 1.6, 3.2]} />
            <ToonMapped map={tex} />
          </mesh>
        </group>
        <ToonInstances items={TASSELS} color={C.gold} thickness={1.4}>
          <sphereGeometry args={[0.055, 8, 6]} />
        </ToonInstances>
        <group ref={head} position={[0, 1.0, 0.42]}>
          <mesh position={[0, 0.48, 0.2]} castShadow>
            <sphereGeometry args={[0.6, 24, 18]} />
            <Toon color={ELEPHANT} />
          </mesh>
          {[-1, 1].map((x) => (
            <group key={x} ref={x < 0 ? earL : earR} position={[x * 0.44, 0.62, 0.1]} rotation={[0, x * 0.45, 0]}>
              <mesh position={[x * 0.34, -0.05, 0]} scale={[1, 1.12, 0.16]}>
                <sphereGeometry args={[0.43, 18, 12]} />
                <Toon color={ELEPHANT} />
              </mesh>
              <mesh position={[x * 0.36, -0.07, 0.05]} scale={[1, 1.1, 0.1]}>
                <sphereGeometry args={[0.31, 14, 10]} />
                <Toon color={EAR_IN} outline={false} />
              </mesh>
            </group>
          ))}
          {/* trunk */}
          <group ref={t1} position={[0, 0.3, 0.72]}>
            <mesh position={[0, -0.15, 0]}>
              <capsuleGeometry args={[0.15, 0.16, 4, 10]} />
              <Toon color={ELEPHANT} />
            </mesh>
            <group ref={t2} position={[0, -0.3, 0]}>
              <mesh position={[0, -0.12, 0]}>
                <capsuleGeometry args={[0.125, 0.12, 4, 10]} />
                <Toon color={ELEPHANT} />
              </mesh>
              <group ref={t3} position={[0, -0.24, 0]}>
                <mesh position={[0, -0.09, 0]}>
                  <capsuleGeometry args={[0.11, 0.08, 4, 10]} />
                  <Toon color={ELEPHANT} />
                </mesh>
              </group>
            </group>
          </group>
          {/* gold forehead charm */}
          <mesh position={[0, 0.9, 0.6]} rotation={[-0.87, 0, 0]} scale={[1, 1.3, 0.4]}>
            <sphereGeometry args={[0.09, 12, 8]} />
            <Toon color={C.gold} thickness={1.4} />
          </mesh>
          <Eyes ref={eyes} y={0.6} x={0.25} z={0.7} r={0.1} yaw={0.4} />
          <Blush y={0.38} x={0.4} z={0.6} yaw={0.75} />
        </group>
      </group>
    </group>
  );
}
