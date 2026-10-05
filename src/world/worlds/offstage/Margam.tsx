"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { margamParts } from "@/content/profile";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { Label } from "../../bits";
import { Islet } from "../../props/basics";
import { limb, merge, put, type V3 } from "./parts";

/* ------------------------------------------------------------------ */
/* layout: the seven parts zigzag in front of the dancer, left to      */
/* right, like a sequence of steps. Varnam, the centerpiece, is in the */
/* middle of the back row, right in front of her.                      */
/* ------------------------------------------------------------------ */

const DANCER: V3 = [0, 0, -3.0];
const DAIS_H = 0.7;
const SCALE = 1.6;
const STONE_H = 0.42;
const CAM = { x: -3, z: 22 };
const ROPE_Y = 6.4;
const BUNTING_Z = -5.0;
const FRONT_Z = 4.4;
const BACK_Z = 1.1;

const spots = margamParts.map((part, i) => {
  const front = i % 2 === 0;
  const x = -4.05 + i * 1.35;
  const z = front ? FRONT_Z : BACK_Z;
  return { part, x, z, front };
});

/* timing: rest on each stone, hop to the next, then a bow to the dancer */
const HOLD = 1.5;
const HOP = 0.65;
const BOW = 2.4;
const STEP = HOLD + HOP;
const CYCLE = spots.length * STEP - HOP + BOW;

/** Where the recital is at time t: the stone it rests on (or leaves), and how far into the hop. */
function at(t: number) {
  const c = t % CYCLE;
  const last = spots.length - 1;
  const endOfLast = last * STEP + HOLD;
  if (c >= endOfLast) return { i: last, hop: -1, bow: (c - endOfLast) / BOW };
  const i = Math.floor(c / STEP);
  const r = c - i * STEP;
  return { i, hop: r < HOLD ? -1 : (r - HOLD) / HOP, bow: -1 };
}

const ease = (t: number) => t * t * (3 - 2 * t);

/* ------------------------------------------------------------------ */
/* the dancer: a toy in aramandi, arms out in natyarambhe               */
/* ------------------------------------------------------------------ */

function useDancer() {
  return useMemo(() => {
    const skin: THREE.BufferGeometry[] = [];
    const silk: THREE.BufferGeometry[] = [];
    const gold: THREE.BufferGeometry[] = [];
    const hair: THREE.BufferGeometry[] = [];
    for (const s of [-1, 1]) {
      // half-sitting, knees turned out: the aramandi diamond
      silk.push(limb([s * 0.13, 1.0, 0], [s * 0.48, 0.64, 0.1], 0.12));
      silk.push(limb([s * 0.48, 0.64, 0.1], [s * 0.4, 0.16, 0.06], 0.11));
      skin.push(put(new THREE.SphereGeometry(0.11, 10, 8), [s * 0.47, 0.07, 0.12], [0, s * 0.6, 0], [0.9, 0.55, 1.5]));
      gold.push(put(new THREE.TorusGeometry(0.11, 0.035, 6, 14), [s * 0.4, 0.17, 0.06], [Math.PI / 2, 0, 0]));
      // arms straight out at the shoulder, hands flat and upright
      skin.push(limb([s * 0.2, 1.62, 0], [s * 0.9, 1.66, 0.04], 0.065));
      skin.push(put(new THREE.BoxGeometry(0.06, 0.22, 0.13), [s * 0.99, 1.74, 0.04], [0, 0, -s * 0.15]));
      gold.push(put(new THREE.TorusGeometry(0.075, 0.025, 6, 12), [s * 0.82, 1.655, 0.035], [0, Math.PI / 2, 0]));
    }
    // the pleated fan that opens between the knees
    gold.push(put(new THREE.CylinderGeometry(0.02, 0.5, 0.62, 9, 1, false, -Math.PI / 2, Math.PI), [0, 0.68, 0.11]));
    // torso, waist belt, neck, head
    silk.push(put(new THREE.CylinderGeometry(0.22, 0.17, 0.66, 14), [0, 1.33, 0]));
    gold.push(put(new THREE.TorusGeometry(0.18, 0.04, 6, 18), [0, 1.04, 0], [Math.PI / 2, 0, 0]));
    skin.push(put(new THREE.CylinderGeometry(0.07, 0.08, 0.16, 8), [0, 1.72, 0]));
    gold.push(put(new THREE.TorusGeometry(0.12, 0.03, 6, 16), [0, 1.66, 0.02], [Math.PI / 2 - 0.25, 0, 0]));
    skin.push(put(new THREE.SphereGeometry(0.22, 16, 12), [0, 1.95, 0.01]));
    hair.push(put(new THREE.SphereGeometry(0.235, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), [0, 1.96, -0.025], [-0.35, 0, 0]));
    hair.push(put(new THREE.SphereGeometry(0.12, 12, 10), [0, 1.98, -0.24]));
    // the long braid down her back
    hair.push(limb([0, 1.9, -0.26], [0, 1.18, -0.24], 0.055));
    gold.push(put(new THREE.SphereGeometry(0.05, 8, 6), [0, 1.12, -0.24]));
    // a jasmine ring around the bun
    const jasmine: Instance[] = Array.from({ length: 8 }, (_, k) => {
      const a = (k / 8) * Math.PI * 2;
      return { p: [Math.cos(a) * 0.13, 1.98 + Math.sin(a) * 0.13, -0.27], s: 0.035 };
    });
    return { skin: merge(skin), silk: merge(silk), gold: merge(gold), hair: merge(hair), jasmine };
  }, []);
}

function Dancer({ yaw }: { yaw: React.RefObject<THREE.Group | null> }) {
  const { skin, silk, gold, hair, jasmine } = useDancer();
  return (
    <group ref={yaw}>
      <mesh geometry={silk} castShadow>
        <Toon color={C.rose} thickness={1.8} />
      </mesh>
      <mesh geometry={skin} castShadow>
        <Toon color={C.clay} thickness={1.8} />
      </mesh>
      <mesh geometry={gold}>
        <Toon color={C.sun} thickness={1.4} />
      </mesh>
      <mesh geometry={hair}>
        <Toon color={C.ink} thickness={1.4} />
      </mesh>
      <ToonInstances items={jasmine} color={C.white} outline={false}>
        <sphereGeometry args={[1, 6, 5]} />
      </ToonInstances>
    </group>
  );
}

/* ------------------------------------------------------------------ */

/** Seven flags across the back, in the order and colours of the recital: the same colours the island's districts wear. */
function Bunting() {
  const { flags, posts } = useMemo(() => {
    const flags: Instance[] = margamParts.map((p, i) => {
      const f = (i + 0.5) / margamParts.length;
      const x = -4 + 8 * f;
      const y = ROPE_Y - Math.sin(f * Math.PI) * 0.75;
      return { p: [x, y - 0.3, BUNTING_Z], s: [0.62, 0.08, 0.62], r: [Math.PI / 2, 0, 0], color: p.color };
    });
    const posts: Instance[] = [
      { p: [-4.15, (ROPE_Y + 0.2) / 2, BUNTING_Z], s: [0.16, ROPE_Y + 0.2, 0.16] },
      { p: [4.15, (ROPE_Y + 0.2) / 2, BUNTING_Z], s: [0.16, ROPE_Y + 0.2, 0.16] },
    ];
    return { flags, posts };
  }, []);
  const rope = useMemo(() => {
    const pts = Array.from({ length: 17 }, (_, k) => {
      const f = k / 16;
      return new THREE.Vector3(-4.1 + 8.2 * f, ROPE_Y - Math.sin(f * Math.PI) * 0.78, BUNTING_Z);
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.03, 5, false);
  }, []);
  return (
    <group>
      <ToonInstances items={posts} color={C.bark} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
      </ToonInstances>
      <mesh geometry={rope}>
        <meshBasicMaterial color={C.ink} />
      </mesh>
      <ToonInstances items={flags} thickness={1.6}>
        <cylinderGeometry args={[1, 1, 1, 3]} />
      </ToonInstances>
    </group>
  );
}

/**
 * The margam: seven stones, one per part of the recital, in its colour and order.
 * A light steps from stone to stone, resting on each, and the dancer turns to
 * follow it. After Mangalam, the blessing, it returns to her and it begins again.
 */
export function Margam() {
  const stones = useRef<THREE.InstancedMesh>(null);
  const labels = useRef<(THREE.Group | null)[]>([]);
  const puck = useRef<THREE.Group>(null);
  const core = useRef<THREE.MeshBasicMaterial>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null);
  const dancer = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const lift = useRef(spots.map(() => 0));
  const o = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const base = useMemo(() => spots.map((s) => new THREE.Color(s.part.color)), []);
  const white = useMemo(() => new THREE.Color(C.white), []);

  const dots = useMemo(() => {
    // stepping marks on the ground between stones
    const out: Instance[] = [];
    for (let i = 0; i < spots.length - 1; i++) {
      for (let k = 1; k <= 2; k++) {
        const f = k / 3;
        const x = spots[i].x + (spots[i + 1].x - spots[i].x) * f;
        const z = spots[i].z + (spots[i + 1].z - spots[i].z) * f;
        out.push({ p: [x, 0.17, z], s: [0.17, 0.03, 0.17] });
      }
    }
    return out;
  }, []);

  useLayoutEffect(() => {
    const m = stones.current;
    if (!m) return;
    spots.forEach((s, i) => {
      o.position.set(s.x, 0.15 + STONE_H / 2, s.z);
      o.rotation.set(0, i * 0.7, 0);
      o.scale.set(1, 1, 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, base[i]);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
    if (m.boundingSphere) m.boundingSphere.radius += 1;
    m.traverse((c) => {
      if (c !== m && (c as THREE.InstancedMesh).isInstancedMesh) (c as THREE.InstancedMesh).boundingSphere = m.boundingSphere;
    });
  }, [o, base]);

  useFrame(({ clock }, dt) => {
    const now = clock.elapsedTime;
    const { i, hop, bow } = at(now);
    const k = 1 - Math.exp(-dt * 8);
    const m = stones.current;
    // the stone under the light rises a little and brightens
    spots.forEach((s, j) => {
      const target = j === i && bow < 0 ? 1 : 0;
      lift.current[j] += (target - lift.current[j]) * k;
      const l = lift.current[j];
      if (m) {
        o.position.set(s.x, 0.15 + STONE_H / 2 + l * 0.3, s.z);
        o.rotation.set(0, j * 0.7, 0);
        o.scale.set(1 + l * 0.08, 1, 1 + l * 0.08);
        o.updateMatrix();
        m.setMatrixAt(j, o.matrix);
        m.setColorAt(j, col.copy(base[j]).lerp(white, l * 0.16));
      }
      const g = labels.current[j];
      if (g) {
        g.position.y = (s.front ? 0.34 : 1.35) + l * (s.front ? 0.2 : 0.35);
        const sc = 1 + l * 0.18;
        g.scale.set(sc, sc, sc);
      }
    });
    if (m) {
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }

    // the light: resting, hopping, or flying home to the dancer
    const p = puck.current;
    let tx = spots[i].x;
    let tz = spots[i].z;
    if (p) {
      const top = 0.15 + STONE_H + 0.3 + lift.current[i] * 0.3;
      let x = spots[i].x;
      let y = top + Math.sin(now * 3) * 0.05;
      let z = spots[i].z;
      let alpha = 1;
      let c = base[i];
      if (hop >= 0) {
        const n = spots[i + 1];
        const f = ease(hop);
        x = spots[i].x + (n.x - spots[i].x) * f;
        z = spots[i].z + (n.z - spots[i].z) * f;
        y = top + Math.sin(hop * Math.PI) * 0.9;
        tx = x;
        tz = z;
        c = col.copy(base[i]).lerp(base[i + 1], f);
      } else if (bow >= 0) {
        // after the blessing, it floats to her and fades
        const f = ease(Math.min(bow / 0.6, 1));
        x = spots[i].x + (DANCER[0] - spots[i].x) * f;
        z = spots[i].z + (DANCER[2] + 0.4 - spots[i].z) * f;
        y = top + (DAIS_H + 1.7 * SCALE - top) * f + Math.sin(f * Math.PI) * 1.2;
        alpha = bow < 0.6 ? 1 : Math.max(0, 1 - (bow - 0.6) / 0.25);
        tx = 0;
        tz = 20;
      }
      p.position.set(x, y, z);
      p.scale.setScalar(Math.max(alpha, 0.001));
      core.current?.color.copy(c).lerp(white, 0.55);
      if (halo.current) {
        halo.current.color.copy(c);
        halo.current.opacity = 0.35 * alpha * (0.85 + Math.sin(now * 5) * 0.15);
      }
    }

    // she turns to follow the light, and dips on each new stone
    const d = dancer.current;
    if (d) {
      const want = Math.atan2(tx - DANCER[0], tz - DANCER[2]);
      let diff = want - d.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      d.rotation.y += diff * (1 - Math.exp(-dt * 5));
    }
    if (body.current) {
      const c = (now % CYCLE) % STEP;
      const stamp = hop < 0 && bow < 0 ? Math.max(0, 1 - c / 0.35) : 0;
      const bowDip = bow >= 0 ? Math.sin(Math.min(bow * 1.4, 1) * Math.PI) * 0.12 : 0;
      body.current.position.y = DAIS_H + 0.15 - stamp * 0.06 - bowDip;
    }
  });

  return (
    <group>
      <Islet r={11} top={C.sand} />
      <Bunting />

      {/* the dancer's dais */}
      <group position={DANCER}>
        <mesh position={[0, 0.15 + DAIS_H / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.55, 1.7, DAIS_H, 36]} />
          <Toon color={C.plum} />
        </mesh>
        <mesh position={[0, 0.15 + DAIS_H + 0.01, 0]} receiveShadow>
          <cylinderGeometry args={[1.42, 1.42, 0.04, 36]} />
          <Toon color={C.sun} outline={false} />
        </mesh>
        <group ref={body} position={[0, DAIS_H + 0.15, 0]} scale={SCALE}>
          <Dancer yaw={dancer} />
        </group>
      </group>

      {/* the seven stones */}
      <instancedMesh ref={stones} args={[undefined, undefined, spots.length]} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.86, STONE_H, 9]} />
        <Toon color={C.white} thickness={2} />
      </instancedMesh>
      <ToonInstances items={dots} color={C.clay} outline={false}>
        <cylinderGeometry args={[1, 1, 1, 10]} />
      </ToonInstances>
      {spots.map((s, j) => (
        <group key={s.part.id} ref={(el) => void (labels.current[j] = el)} position={[s.x, s.front ? 0.34 : 1.35, s.front ? s.z + 1.1 : s.z]}>
          <Label size={0.29} color={C.ink} outline={C.cream} rotation={[0, Math.atan2(CAM.x - s.x, CAM.z - s.z), 0]}>
            {s.part.name.toUpperCase()}
          </Label>
        </group>
      ))}

      {/* the travelling light */}
      <group ref={puck}>
        <mesh>
          <sphereGeometry args={[0.2, 16, 12]} />
          <meshBasicMaterial ref={core} color={C.white} toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.46, 16, 12]} />
          <meshBasicMaterial ref={halo} color={C.sun} transparent opacity={0.35} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
