"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { margamParts, stops } from "@/content/profile";
import { C, RING_R, STOP_COUNT, stopAngle } from "./palette";
import { Toon, ToonInstances } from "./toon";
import { journey } from "./scroll";

const ISLAND_R = 21;

// Deterministic scatter, so the island looks the same on every load.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** All the trees, as three instanced draws: trunks, lower cones, upper cones. */
function Forest({ trees }: { trees: { p: [number, number, number]; s: number }[] }) {
  const parts = useMemo(() => {
    const at = (y: number) => trees.map((t) => ({ p: [t.p[0], t.p[1] + y * t.s, t.p[2]] as [number, number, number], s: t.s }));
    return { trunk: at(0.6), low: at(1.7), high: at(2.4) };
  }, [trees]);
  return (
    <>
      <ToonInstances items={parts.trunk} color={C.bark} castShadow>
        <cylinderGeometry args={[0.18, 0.24, 1.2, 8]} />
      </ToonInstances>
      <ToonInstances items={parts.low} color={C.leaf} castShadow>
        <coneGeometry args={[0.9, 1.6, 8]} />
      </ToonInstances>
      <ToonInstances items={parts.high} color={C.grass} castShadow>
        <coneGeometry args={[0.65, 1.2, 8]} />
      </ToonInstances>
    </>
  );
}

function Rocks({ rocks }: { rocks: { p: [number, number, number]; s: number }[] }) {
  const items = useMemo(() => rocks.map((r) => ({ p: r.p, s: [r.s, r.s * 0.7, r.s] as [number, number, number], r: [0.3, r.p[0], 0.2] as [number, number, number] })), [rocks]);
  return (
    <ToonInstances items={items} color={C.steel} castShadow>
      <dodecahedronGeometry args={[0.6, 0]} />
    </ToonInstances>
  );
}

/** One arc of the path per stop, in that stop's recital colour. Lights up once passed. */
function MargamArcs() {
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const color = useMemo(() => new Map(margamParts.map((m) => [m.id, m.color])), []);
  const span = (Math.PI * 2) / STOP_COUNT;
  useFrame(() => {
    mats.current.forEach((m, i) => {
      if (!m) return;
      const lit = Math.min(Math.max(journey.progress - i + 0.6, 0), 1);
      m.opacity += (lit - m.opacity) * 0.15;
    });
  });
  return (
    <group position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {stops.slice(0, STOP_COUNT).map((s, i) => {
        const a = stopAngle(i);
        return (
          <mesh key={s.id}>
            <ringGeometry args={[RING_R - 1.15, RING_R + 1.15, 48, 1, -(a + span / 2), span]} />
            <meshBasicMaterial
              ref={(m) => {
                mats.current[i] = m;
              }}
              color={color.get(s.margam)}
              transparent
              opacity={0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Sea() {
  const foam = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!foam.current) return;
    foam.current.children.forEach((c, i) => {
      const s = 1 + ((clock.elapsedTime * 0.08 + i * 0.33) % 1) * 0.35;
      c.scale.set(s, s, 1);
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.55 * (1 - ((clock.elapsedTime * 0.08 + i * 0.33) % 1));
    });
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
        <circleGeometry args={[140, 64]} />
        <meshBasicMaterial color={C.sea} />
      </mesh>
      <group ref={foam} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}>
            <ringGeometry args={[ISLAND_R + 0.4, ISLAND_R + 0.9, 96]} />
            <meshBasicMaterial color={C.foam} transparent opacity={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Island() {
  const scatter = useMemo(() => {
    const r = rng(7);
    const trees: { p: [number, number, number]; s: number }[] = [];
    const rocks: { p: [number, number, number]; s: number }[] = [];
    const pads = Array.from({ length: STOP_COUNT }, (_, i) => stopAngle(i));
    const clear = (x: number, z: number) => pads.every((a) => Math.hypot(x - Math.cos(a) * RING_R, z - Math.sin(a) * RING_R) > 5.2);
    let tries = 0;
    while (trees.length < 18 && tries++ < 2000) {
      const ang = r() * Math.PI * 2;
      const band = 2.5 + r() * 6;
      const x = Math.cos(ang) * band;
      const z = Math.sin(ang) * band;
      if (!clear(x, z) || Math.hypot(x, z) < 3.2) continue;
      if (r() < 0.75) trees.push({ p: [x, 0.15, z], s: 0.7 + r() * 0.6 });
      else rocks.push({ p: [x, 0.35, z], s: 0.6 + r() * 0.9 });
    }
    return { trees, rocks };
  }, []);

  return (
    <group>
      <Sea />
      {/* the island: sand top on a clay cliff */}
      <mesh position={[0, -0.6, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[ISLAND_R, ISLAND_R - 1.6, 1.4, 72]} />
        <Toon color={C.clay} thickness={2.6} />
      </mesh>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[ISLAND_R, ISLAND_R, 0.12, 72]} />
        <Toon color={C.sand} outline={false} />
      </mesh>
      {/* grass in the middle */}
      <mesh position={[0, 0.16, 0]} receiveShadow>
        <cylinderGeometry args={[11.2, 11.2, 0.06, 64]} />
        <Toon color={C.grass} outline={false} />
      </mesh>
      {/* the path: the tala circle */}
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[RING_R - 1.15, RING_R + 1.15, 128]} />
        <meshToonMaterial color={C.path} />
      </mesh>
      <group position={[0, 0.17, 0]}>
        <MargamArcs />
      </group>
      {/* station pads */}
      {Array.from({ length: STOP_COUNT }, (_, i) => {
        const a = stopAngle(i);
        return (
          <mesh key={i} position={[Math.cos(a) * RING_R, 0.3, Math.sin(a) * RING_R]} receiveShadow>
            <cylinderGeometry args={[3.3, 3.5, 0.3, 40]} />
            <Toon color={C.cream} thickness={2} />
          </mesh>
        );
      })}
      <Forest trees={scatter.trees} />
      <Rocks rocks={scatter.rocks} />
    </group>
  );
}
