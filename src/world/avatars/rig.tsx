"use client";

import { Outlines } from "@react-three/drei";
import { useLayoutEffect, useMemo, type Ref } from "react";
import * as THREE from "three";
import { C } from "../palette";

/** What the Traveler controller writes every frame. All 0..1. */
export type AvatarMotion = { walk: number; air: number; cheer: number; ride: number };

/**
 * The smoothed pose a character animates from. One per character, mutated in useFrame only.
 * `phase` is the walk cycle in radians, `open` is how open the eyes are, `spin` is the
 * one-turn twirl that plays when a new cheer starts.
 */
export type Pose = AvatarMotion & { t: number; phase: number; open: number; spin: number; spinT: number; lastCheer: number; idle: number };

export const newPose = (): Pose => ({ walk: 0, air: 0, cheer: 0, ride: 0, t: 0, phase: 0, open: 1, spin: 0, spinT: 9, lastCheer: 0, idle: 1 });

const damp = (x: number, to: number, k: number, dt: number) => x + (to - x) * (1 - Math.exp(-k * dt));
export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (x: number) => x * x * (3 - 2 * x);

/**
 * Advance the pose by one frame. `stride` is walk-cycle steps per second (radians/s / 2pi),
 * `seed` desyncs blinks so five travelers never blink together.
 */
export function stepPose(p: Pose, m: AvatarMotion | null, t: number, rawDt: number, stride: number, seed: number) {
  const dt = Math.min(rawDt, 0.1);
  p.t = t;
  const cheer = m ? clamp01(m.cheer) : 0;
  // a fresh cheer (the controller jumps it up): play one twirl
  if (cheer > 0.6 && cheer - p.lastCheer > 0.3) p.spinT = 0;
  p.lastCheer = cheer;
  p.walk = damp(p.walk, m ? clamp01(m.walk) : 0, 10, dt);
  p.air = damp(p.air, m ? clamp01(m.air) : 0, 16, dt);
  p.cheer = damp(p.cheer, cheer, 12, dt);
  p.ride = damp(p.ride, m ? clamp01(m.ride) : 0, 8, dt);
  p.idle = clamp01(1 - p.walk - p.air - p.ride * 0.6);
  p.phase += dt * Math.PI * 2 * stride * (0.35 + 0.65 * p.walk) * (1 - p.ride);
  p.spinT += dt;
  p.spin = p.spinT < 0.7 ? ease(p.spinT / 0.7) * Math.PI * 2 : 0;
  // blink: a quick close every ~3.4 s, now and then a double blink
  const u = (t + seed * 1.37) % 3.4;
  const v = (t + seed * 1.37) % 10.2;
  const shut = Math.max(u < 0.16 ? 1 - Math.abs(u - 0.08) / 0.08 : 0, v > 3.62 && v < 3.78 ? 1 - Math.abs(v - 3.7) / 0.08 : 0);
  // cheering squints happily
  p.open = Math.max(0.08, (1 - shut) * (1 - 0.55 * p.cheer));
}

let ramp: THREE.DataTexture | null = null;
/** Same 3-step cel ramp as toon.tsx, for the one material that needs a texture map. */
export function celRamp() {
  if (ramp) return ramp;
  const data = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  ramp = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  ramp.minFilter = THREE.NearestFilter;
  ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  return ramp;
}

/** Toon material with a texture, and the ink outline. */
export function ToonMapped({ map, thickness = 2.2 }: { map: THREE.Texture; thickness?: number }) {
  const g = useMemo(() => celRamp(), []);
  return (
    <>
      <meshToonMaterial map={map} gradientMap={g} side={THREE.DoubleSide} />
      <Outlines thickness={thickness} color={C.ink} />
    </>
  );
}

export const BLUSH = "#ff8fa3";

/**
 * Two glossy bead eyes with a highlight each, hugging a round head. The group sits at eye
 * height so scaling its y blinks both eyes about their own centres.
 */
export function Eyes({
  ref,
  y,
  x,
  z,
  r = 0.1,
  yaw = 0.42,
  color = C.ink,
  patch = false,
}: {
  ref?: Ref<THREE.Group>;
  y: number;
  x: number;
  z: number;
  r?: number;
  yaw?: number;
  color?: string;
  /** a white patch around each eye (the peacock's face markings) */
  patch?: boolean;
}) {
  return (
    <group ref={ref} position={[0, y, 0]}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * x, 0, z]} rotation={[0, s * yaw, 0]}>
          {patch && (
            <mesh position={[s * r * 0.15, 0, -r * 0.12]} scale={[1.05, 0.9, 0.3]}>
              <sphereGeometry args={[r * 1.6, 12, 8]} />
              <meshBasicMaterial color={C.white} />
            </mesh>
          )}
          <mesh scale={[0.82, 1.12, 0.5]}>
            <sphereGeometry args={[r, 14, 10]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh position={[r * 0.3, r * 0.42, r * 0.42]}>
            <sphereGeometry args={[r * 0.34, 8, 6]} />
            <meshBasicMaterial color={C.white} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Rosy cheeks. */
export function Blush({ y, x, z, r = 0.09, yaw = 0.7 }: { y: number; x: number; z: number; r?: number; yaw?: number }) {
  return (
    <>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * x, y, z]} rotation={[0, s * yaw, 0]} scale={[1.3, 0.75, 0.3]}>
          <sphereGeometry args={[r, 10, 6]} />
          <meshBasicMaterial color={BLUSH} />
        </mesh>
      ))}
    </>
  );
}

/**
 * An instanced mesh whose matrices the owner writes every frame (the peacock's fan).
 * The outline copy shares the instance matrix, and both get a fixed, generous bounding
 * sphere so neither is culled mid-flourish.
 */
export function useFixedBounds(ref: React.RefObject<THREE.InstancedMesh | null>, radius: number, colors?: string[]) {
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const sphere = new THREE.Sphere(new THREE.Vector3(), radius);
    m.boundingSphere = sphere;
    m.traverse((c) => {
      if ((c as THREE.InstancedMesh).isInstancedMesh) (c as THREE.InstancedMesh).boundingSphere = sphere;
    });
    if (colors) {
      const col = new THREE.Color();
      colors.forEach((c, i) => m.setColorAt(i, col.set(c)));
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  }, [ref, radius, colors]);
}
