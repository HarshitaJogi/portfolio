"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { Label, chime, useHoverCursor } from "../../bits";
import { Islet } from "../../props/basics";
import { findEgg } from "../../eggs";
import { island } from "../../state";
import { Boxes, Cyls, Glows, Moon, Moving, Stars, hash, useCheckGeometry, type V3 } from "./kit";

/*
 * TryBud, Harvard Hack-o-Ween, Oct 2025: 2nd place, $3,600, a blockchain job-verification
 * platform. Halloween night. A chain of five blocks floats over the hack table, each one
 * holding a job (a briefcase). A green light runs down the chain and stamps each job
 * verified. On the right the silver 2ND trophy, on the left the giant prize cheque. Five
 * jack-o'-lanterns wait in front: light all five and the bats come down to dance.
 */

const BLOCKS = 5;
const blockX = (i: number) => (i - 2) * 2.05;
const blockZ = (i: number) => -(2 - Math.abs(i - 2)) * 0.32;
const RUN = 5.5; // seconds for the light to travel the chain
const HOLD = 2.2;
const LOOP = RUN + HOLD;

const PUMPKINS: { p: V3; s: number }[] = [
  { p: [-3.4, 0.15, 3.1], s: 1 },
  { p: [-1.6, 0.15, 4.1], s: 0.82 },
  { p: [0.3, 0.15, 4.5], s: 1.12 },
  { p: [2.2, 0.15, 4.1], s: 0.88 },
  { p: [3.9, 0.15, 3.1], s: 1 },
];

/** The chain: five job blocks linked together, and the verifying light. */
function Chain() {
  const g = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Group>(null);
  const check = useCheckGeometry(0.1);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (g.current) g.current.position.y = 2.75 + Math.sin(t * 1.1) * 0.12;
    const u = t % LOOP;
    const f = Math.min(u / RUN, 1) * (BLOCKS - 1);
    const i = Math.floor(f);
    const k = f - i;
    if (pulse.current) {
      const x = blockX(i) + (blockX(Math.min(i + 1, BLOCKS - 1)) - blockX(i)) * k;
      const z = blockZ(i) + (blockZ(Math.min(i + 1, BLOCKS - 1)) - blockZ(i)) * k;
      pulse.current.position.set(x, 0.92 + Math.sin(k * Math.PI) * 0.35, z + 0.1);
      pulse.current.visible = u < RUN + 0.2;
      pulse.current.scale.setScalar(1 + Math.sin(t * 10) * 0.12);
    }
  });
  const parts = useMemo<Instance[]>(() => {
    const out: Instance[] = [];
    for (let i = 0; i < BLOCKS; i++) {
      const x = blockX(i);
      const z = blockZ(i);
      out.push({ p: [x, 0, z], s: 1.3, color: i % 2 ? "#7b4bc4" : C.plum });
      // the job inside: a briefcase on the block's face
      out.push({ p: [x, -0.08, z + 0.66], s: [0.66, 0.46, 0.06], color: C.cream });
      out.push({ p: [x, 0.2, z + 0.66], s: [0.26, 0.1, 0.06], color: C.cream });
      out.push({ p: [x, -0.06, z + 0.7], s: [0.66, 0.05, 0.02], color: C.bark });
    }
    return out;
  }, []);
  const links = useMemo<Instance[]>(() => {
    const out: Instance[] = [];
    for (let i = 0; i < BLOCKS - 1; i++) {
      const x = (blockX(i) + blockX(i + 1)) / 2;
      const z = (blockZ(i) + blockZ(i + 1)) / 2;
      out.push({ p: [x - 0.18, 0, z], s: 1, color: C.silver });
      out.push({ p: [x + 0.18, 0, z], s: 1, r: [Math.PI / 2, 0, 0], color: C.silver });
    }
    return out;
  }, []);
  return (
    <group position={[0.3, 2.75, -3.6]} ref={g}>
      <Boxes items={parts} thickness={1.6} />
      <ToonInstances items={links} thickness={1.2}>
        <torusGeometry args={[0.26, 0.07, 8, 18]} />
      </ToonInstances>
      {/* verified stamps: a cream badge with a green check, popping in as the light passes */}
      <Moving
        count={BLOCKS}
        basic
        color={C.cream}
        onFrame={(put, t) => {
          const u = t % LOOP;
          const f = Math.min(u / RUN, 1) * (BLOCKS - 1);
          const fade = u > LOOP - 0.4 ? (LOOP - u) / 0.4 : 1;
          for (let i = 0; i < BLOCKS; i++) {
            const a = f - i + 0.15;
            const k = a < 0 ? 0 : Math.min(a * 4, 1);
            const pop = k * (1 + Math.sin(Math.min(a * 4, 1) * Math.PI) * 0.35) * fade;
            put(i, blockX(i) + 0.55, 0.6, blockZ(i) + 0.72, 0.34 * pop, 0.34 * pop, 1);
          }
        }}
      >
        <circleGeometry args={[1, 20]} />
      </Moving>
      <Moving
        count={BLOCKS}
        basic
        color={C.green}
        onFrame={(put, t) => {
          const u = t % LOOP;
          const f = Math.min(u / RUN, 1) * (BLOCKS - 1);
          const fade = u > LOOP - 0.4 ? (LOOP - u) / 0.4 : 1;
          for (let i = 0; i < BLOCKS; i++) {
            const a = f - i + 0.15;
            const k = a < 0 ? 0 : Math.min(a * 4, 1);
            const pop = k * (1 + Math.sin(Math.min(a * 4, 1) * Math.PI) * 0.35) * fade;
            put(i, blockX(i) + 0.55, 0.6, blockZ(i) + 0.78, 0.42 * pop, 0.42 * pop, 1);
          }
        }}
      >
        <primitive object={check} attach="geometry" />
      </Moving>
      {/* the verifying light */}
      <group ref={pulse}>
        <mesh>
          <sphereGeometry args={[0.16, 12, 10]} />
          <meshBasicMaterial color="#c8ffd2" toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.36, 14, 10]} />
          <meshBasicMaterial color={C.green} transparent opacity={0.35} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** A pumpkin with eight lobes: a sphere pinched along its meridians. */
function usePumpkinGeometry() {
  return useMemo(() => {
    const g = new THREE.SphereGeometry(0.6, 32, 16);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const a = Math.atan2(v.z, v.x);
      const k = 1 - 0.07 * (1 - Math.cos(a * 8)) * 0.5;
      p.setXYZ(i, v.x * k, v.y * 0.78, v.z * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);
}

/** A jack-o'-lantern face part: a small triangle. */
const FACE = new THREE.CircleGeometry(1, 3);

function Pumpkins({ onAll }: { onAll: () => void }) {
  const body = usePumpkinGeometry();
  const [lit, setLit] = useState<boolean[]>(() => {
    const n = island.get().pumpkins;
    return PUMPKINS.map((_, i) => i < n);
  });
  const { bind } = useHoverCursor();
  const unlit = useMemo(() => new THREE.Color("#ff9a3c"), []);
  const glow = useMemo(() => new THREE.Color("#ffb347"), []);
  const dark = useMemo(() => new THREE.Color("#3a1a05"), []);
  const bright = useMemo(() => new THREE.Color("#ffe08a"), []);
  const stems = useMemo<Instance[]>(
    () => PUMPKINS.map(({ p, s }) => ({ p: [p[0], p[1] + 0.95 * s, p[2]] as V3, s: [0.14 * s, 0.26 * s, 0.14 * s] as V3, r: [0.1, 0, 0.15] as V3, color: C.leaf })),
    [],
  );

  const light = (i?: number) => {
    if (i === undefined || lit[i]) return;
    const next = lit.map((l, j) => l || j === i);
    const n = next.filter(Boolean).length;
    setLit(next);
    island.set({ pumpkins: n });
    chime(440 + n * 70);
    if (n === PUMPKINS.length) {
      findEgg("pumpkins");
      [523, 659, 784, 1047].forEach((f, k) => setTimeout(() => chime(f), 180 + k * 140));
      onAll();
    }
  };

  return (
    <>
      <Moving
        count={PUMPKINS.length}
        thickness={1.6}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          light(e.instanceId);
        }}
        bind={bind}
        onFrame={(put) => {
          PUMPKINS.forEach(({ p, s }, i) => {
            put(i, p[0], p[1] + 0.45 * s, p[2], s);
            put.color(i, lit[i] ? glow : unlit);
          });
        }}
      >
        <primitive object={body} attach="geometry" />
      </Moving>
      <ToonInstances items={stems} outline={false}>
        <cylinderGeometry args={[0.4, 0.6, 1, 6]} />
      </ToonInstances>
      {/* faces: two eyes and a grin each, dark until lit */}
      <Moving
        count={PUMPKINS.length * 3}
        basic
        onFrame={(put) => {
          PUMPKINS.forEach(({ p, s }, i) => {
            const y = p[1] + 0.45 * s;
            const z = p[2] + 0.6 * s;
            put(i * 3, p[0] - 0.2 * s, y + 0.1 * s, z, 0.11 * s, 0.11 * s, 1, -0.2, 0, Math.PI / 2);
            put(i * 3 + 1, p[0] + 0.2 * s, y + 0.1 * s, z, 0.11 * s, 0.11 * s, 1, -0.2, 0, Math.PI / 2);
            put(i * 3 + 2, p[0], y - 0.12 * s, z - 0.01 * s, 0.13 * s, 0.34 * s, 1, -0.1, 0, -Math.PI / 2);
            const c = lit[i] ? bright : dark;
            for (let k = 0; k < 3; k++) put.color(i * 3 + k, c);
          });
        }}
      >
        <primitive object={FACE} attach="geometry" />
      </Moving>
      {/* a lit pumpkin glows from inside: an unlit orange shell over the shaded body */}
      <Moving
        count={PUMPKINS.length}
        basic
        color="#ff9a2e"
        onFrame={(put) => {
          PUMPKINS.forEach(({ p, s }, i) => {
            const k = lit[i] ? s * 1.01 : 0;
            put(i, p[0], p[1] + 0.45 * s, p[2], k);
          });
        }}
      >
        <primitive object={body} attach="geometry" />
      </Moving>
      {/* and a soft halo around it, flickering like a candle */}
      <Moving
        count={PUMPKINS.length}
        basic
        color="#ffc46b"
        transparent
        opacity={0.18}
        onFrame={(put, t) => {
          PUMPKINS.forEach(({ p, s }, i) => {
            const k = lit[i] ? s * (1.45 + Math.sin(t * 9 + i * 2) * 0.06 + Math.sin(t * 23 + i) * 0.03) : 0;
            put(i, p[0], p[1] + 0.45 * s, p[2], k, k * 0.85, k);
          });
        }}
      >
        <sphereGeometry args={[0.6, 16, 12]} />
      </Moving>
    </>
  );
}

/** A bat silhouette, wings out. */
function useBatGeometry() {
  return useMemo(() => {
    const half: [number, number][] = [
      [0, 0.14],
      [0.05, 0.24],
      [0.08, 0.12],
      [0.3, 0.22],
      [0.62, 0.08],
      [0.5, 0],
      [0.42, -0.12],
      [0.3, -0.03],
      [0.18, -0.14],
      [0.08, -0.05],
      [0, -0.16],
    ];
    const s = new THREE.Shape();
    s.moveTo(0, 0.14);
    half.forEach(([x, y]) => s.lineTo(x, y));
    [...half].reverse().forEach(([x, y]) => s.lineTo(-x, y));
    return new THREE.ShapeGeometry(s);
  }, []);
}

const BATS = 7;

function Bats({ party }: { party: RefObject<number> }) {
  const geo = useBatGeometry();
  const seeds = useMemo(
    () =>
      Array.from({ length: BATS }, (_, i) => ({
        a: (i / BATS) * Math.PI * 2,
        r: 4.6 + hash(i, 1) * 1.6,
        h: 5 + hash(i, 2) * 1.8,
        sp: 0.35 + hash(i, 3) * 0.2,
        fl: 9 + hash(i, 4) * 4,
      })),
    [],
  );
  return (
    <Moving
      count={BATS}
      basic
      color="#1d1233"
      onFrame={(put, t) => {
        // after all five pumpkins are lit the bats swoop down and spin around the chain
        const since = t - party.current;
        const p = since >= 0 && since < 6 ? Math.sin((since / 6) * Math.PI) : 0;
        seeds.forEach((b, i) => {
          const a = b.a + t * b.sp * (1 + p * 2.5);
          const r = b.r * (1 - p * 0.45);
          const x = 0.5 + Math.cos(a) * r;
          const z = -2.6 + Math.sin(a) * r * 0.45;
          const y = b.h - p * 1.6 + Math.sin(t * 2 + i) * 0.2;
          const flap = 0.35 + Math.abs(Math.sin(t * b.fl)) * 0.65;
          put(i, x, y, z, 0.9 * flap, 0.9, 0.9, 0, 0, Math.sin(a) * 0.25);
        });
      }}
    >
      <primitive object={geo} attach="geometry" />
    </Moving>
  );
}

/** The silver cup for second place, turning on its plinth. */
function SilverTrophy({ position }: { position: V3 }) {
  const cup = useRef<THREE.Group>(null);
  const lathe = useMemo(() => {
    const pts = [
      [0, 0],
      [0.44, 0],
      [0.44, 0.1],
      [0.17, 0.18],
      [0.09, 0.34],
      [0.09, 0.56],
      [0.22, 0.66],
      [0.46, 0.92],
      [0.52, 1.32],
      [0, 1.32],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 24);
  }, []);
  useFrame((_, dt) => {
    if (cup.current) cup.current.rotation.y += dt * 0.7;
  });
  return (
    <group position={position}>
      <RoundedBox args={[1.25, 1, 1.15]} radius={0.08} position={[0, 0.5, 0]} castShadow>
        <Toon color={C.cream} />
      </RoundedBox>
      <Label size={0.36} color={C.ink} position={[0, 0.5, 0.59]}>
        2ND
      </Label>
      <group ref={cup} position={[0, 1, 0]}>
        <mesh geometry={lathe} castShadow>
          <Toon color={C.silver} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.5, 1.0, 0]} rotation={[0, 0, (s * Math.PI) / 2]}>
            <torusGeometry args={[0.2, 0.05, 6, 14, Math.PI]} />
            <Toon color={C.silver} outline={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** The oversized prize cheque on an easel. */
function Cheque({ position, rotation }: { position: V3; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Cyls
        items={[
          { p: [-0.85, 1.05, 0.1], s: [0.1, 2.2, 0.1], r: [0.1, 0, 0.12], color: C.bark },
          { p: [0.85, 1.05, 0.1], s: [0.1, 2.2, 0.1], r: [0.1, 0, -0.12], color: C.bark },
          { p: [0, 1.0, -0.45], s: [0.1, 2.1, 0.1], r: [-0.4, 0, 0], color: C.bark },
        ]}
        outline={false}
        sides={6}
      />
      <group position={[0, 1.95, 0.18]} rotation={[-0.1, 0, 0]}>
        <RoundedBox args={[2.9, 1.45, 0.08]} radius={0.04} castShadow>
          <Toon color={C.cream} />
        </RoundedBox>
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[2.66, 1.21]} />
          <meshBasicMaterial color="#eaf6e4" />
        </mesh>
        <Label size={0.25} color={C.green} position={[-1.15, 0.38, 0.06]} anchorX="left">
          PRIZE
        </Label>
        <Label size={0.56} color={C.ink} position={[0, -0.08, 0.06]}>
          $3,600
        </Label>
        <mesh position={[0.62, -0.46, 0.06]}>
          <planeGeometry args={[1.1, 0.03]} />
          <meshBasicMaterial color={C.ink} />
        </mesh>
      </group>
    </group>
  );
}

/** The hack table: two laptops glowing with the chain on screen. */
function HackTable() {
  const parts = useMemo<Instance[]>(
    () => [
      { p: [0, 0.9, 0], s: [3.6, 0.1, 1.1], color: C.cream },
      { p: [0, 0.62, 0.54], s: [3.6, 0.5, 0.04], color: C.plum },
      ...[-0.85, 0.85].flatMap((x) => [
        { p: [x, 0.99, 0.1] as V3, s: [0.95, 0.06, 0.62] as V3, color: C.ink },
        { p: [x, 1.32, -0.2] as V3, s: [0.95, 0.62, 0.05] as V3, r: [-0.12, Math.PI, 0] as V3, color: C.ink },
      ]),
    ],
    [],
  );
  const legs = useMemo<Instance[]>(
    () =>
      [
        [-1.65, -0.4],
        [1.65, -0.4],
        [-1.65, 0.4],
        [1.65, 0.4],
      ].map(([x, z]) => ({ p: [x, 0.45, z] as V3, s: [0.1, 0.9, 0.1] as V3, color: C.ink })),
    [],
  );
  // screens face the camera: a glowing panel with three little linked blocks on it
  const screens = useMemo<Instance[]>(
    () =>
      [-0.85, 0.85].flatMap((x) => [
        { p: [x, 1.32, -0.17] as V3, s: [0.84, 0.52, 1] as V3, r: [-0.12, 0, 0] as V3, color: "#7ef0c8" },
        ...[-0.25, 0, 0.25].map((d) => ({ p: [x + d, 1.32, -0.16] as V3, s: [0.15, 0.15, 1] as V3, r: [-0.12, 0, 0] as V3, color: C.plum })),
      ]),
    [],
  );
  return (
    <group position={[0.3, 0.15, -0.5]}>
      <Boxes items={parts} />
      <Cyls items={legs} outline={false} sides={6} />
      <Glows items={screens}>
        <planeGeometry args={[1, 1]} />
      </Glows>
    </group>
  );
}

/** A garland of orange and purple bulbs strung behind the chain, glowing at night. */
function Garland() {
  const bulbs = useMemo<Instance[]>(
    () =>
      Array.from({ length: 17 }, (_, i) => {
        const f = i / 16;
        return { p: [-5 + f * 10.6, 5.1 - Math.sin(f * Math.PI) * 0.9, -4.6] as V3, s: 0.13, color: i % 2 ? "#ffb347" : "#c99bff" };
      }),
    [],
  );
  return (
    <>
      <Cyls
        items={[
          { p: [-5.1, 2.6, -4.65], s: [0.16, 5.2, 0.16], color: C.bark },
          { p: [5.7, 2.6, -4.65], s: [0.16, 5.2, 0.16], color: C.bark },
        ]}
      />
      <Glows items={bulbs}>
        <sphereGeometry args={[1, 10, 8]} />
      </Glows>
    </>
  );
}

export function TryBud() {
  const party = useRef(-100);
  const clock = useThree((s) => s.clock);
  return (
    <group>
      <Islet r={11} top="#a7b886" />
      <Stars seed={3} />
      <Moon position={[6.4, 7.4, -9]} />
      <group position={[0, 0, 0.5]} scale={1.2}>
        <Garland />
        <Chain />
        <HackTable />
        <SilverTrophy position={[4.6, 0.15, 0.4]} />
        <Cheque position={[-4.4, 0.15, 0.2]} rotation={0.32} />
        <Pumpkins onAll={() => (party.current = clock.elapsedTime)} />
        <Bats party={party} />
      </group>
    </group>
  );
}
