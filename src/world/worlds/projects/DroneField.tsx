"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { Label } from "../../bits";
import { Islet } from "../../props/basics";
import { Boxes, Cyls, Glows, Moving, frameGeometry, hash, type V3 } from "./kit";

/*
 * Drone-Based Precision Agriculture, Jul to Dec 2023.
 * A maize field (the YOLOv9 paper is about maize leaf blight). The drone flies a lawnmower
 * path at "15 M", a Jetson-style board on its back, and classifies every plant it passes:
 * a bounding box per plant, green for healthy, red for blight. Behind the field the NDVI
 * board fills in tile by tile as the field is scanned, then rings the region of interest.
 * In front, the research tent and the $25,000 grant flag.
 */

const ROWS = 4;
const COLS = 9;
const fx = (c: number) => -3.4 + c * 0.95;
const fz = (r: number) => -1.9 + r * 1.25;
/** A blight patch spreading across two rows, plus one stray case. */
const SICK = new Set([5, 6, 14, 15, 24]);
const ALT = 4.6; // the drone's cruising height: "15 M"
const ROW_T = 3.2;
const SCAN = ROWS * ROW_T;
const HOLD = 4.2;
const CYCLE = SCAN + HOLD;
const X0 = -4.1;
const X1 = 4.9;
const MOTORS: [number, number][] = [
  [-0.75, 0.55],
  [0.75, 0.55],
  [-0.75, -0.55],
  [0.75, -0.55],
];

type Plant = { x: number; z: number; h: number; sick: boolean; ndvi: string };

function usePlants() {
  return useMemo<Plant[]>(() => {
    const sickAt = (r: number, c: number) => r >= 0 && r < ROWS && c >= 0 && c < COLS && SICK.has(r * COLS + c);
    return Array.from({ length: ROWS * COLS }, (_, i) => {
      const r = Math.floor(i / COLS);
      const c = i % COLS;
      const sick = SICK.has(i);
      const near = !sick && [sickAt(r - 1, c), sickAt(r + 1, c), sickAt(r, c - 1), sickAt(r, c + 1)].some(Boolean);
      // NDVI: red where the leaves are blighted, amber where stress is spreading, greens elsewhere
      const ndvi = sick ? C.red : near ? C.sun : hash(i, 4) > 0.5 ? C.green : "#2f9a5f";
      return {
        x: fx(c) + (hash(i, 1) - 0.5) * 0.12,
        z: fz(r) + (hash(i, 2) - 0.5) * 0.1,
        h: 1.5 + hash(i, 3) * 0.4,
        sick,
        ndvi,
      };
    });
  }, []);
}

/** Where the drone is at time u in the cycle. Lawnmower rows, then a glide home. */
function dronePath(u: number, out: THREE.Vector3) {
  if (u < SCAN) {
    const row = Math.floor(u / ROW_T);
    const f = (u % ROW_T) / ROW_T;
    const dir = row % 2 === 0 ? 1 : -1;
    const run = Math.min(f / 0.84, 1);
    const ease = run * run * (3 - 2 * run);
    const x = dir > 0 ? X0 + (X1 - X0) * ease : X1 - (X1 - X0) * ease;
    const turn = f > 0.84 && row < ROWS - 1 ? (f - 0.84) / 0.16 : 0;
    out.set(x, ALT, fz(row) + turn * 1.25);
    return dir;
  }
  // after the last row (which ends on the right): hover, then glide back to the start
  const g = Math.min(Math.max((u - SCAN - 1.8) / (HOLD - 1.8), 0), 1);
  const e = g * g * (3 - 2 * g);
  out.set(X0 + (X1 - X0) * (1 - e), ALT + Math.sin(e * Math.PI) * 0.6, fz(ROWS - 1) + (fz(0) - fz(ROWS - 1)) * e);
  return -1;
}

/** A detection box with a little label tab on its corner, the way a detector draws it. */
function useDetectGeometry() {
  return useMemo(() => {
    const w = 1.05;
    const h = 2.1;
    const b = 0.07;
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(w / 2, h);
    s.lineTo(-w / 2 + 0.42, h);
    s.lineTo(-w / 2 + 0.42, h + 0.16);
    s.lineTo(-w / 2, h + 0.16);
    s.lineTo(-w / 2, 0);
    const hole = new THREE.Path();
    hole.moveTo(-w / 2 + b, b);
    hole.lineTo(-w / 2 + b, h - b);
    hole.lineTo(w / 2 - b, h - b);
    hole.lineTo(w / 2 - b, b);
    hole.lineTo(-w / 2 + b, b);
    s.holes.push(hole);
    return new THREE.ShapeGeometry(s);
  }, []);
}

function Field({ plants }: { plants: Plant[] }) {
  const leaves = useMemo<Instance[]>(() => {
    const out: Instance[] = [];
    plants.forEach((p, i) => {
      [0.3, 0.5, 0.7, 0.86].forEach((f, k) => {
        const a = hash(i, 10 + k) * 0.8 + k * 2.4;
        const tilt = 0.35 + k * 0.08;
        const len = 0.78 - k * 0.1;
        const dx = Math.cos(a) * Math.cos(tilt);
        const dz = -Math.sin(a) * Math.cos(tilt);
        out.push({
          p: [p.x + dx * len * 0.5, p.h * f + Math.sin(tilt) * len * 0.5, p.z + dz * len * 0.5],
          s: [len, 0.04, 0.17],
          r: [0, a, tilt],
          color: p.sick && k < 3 ? "#c4a646" : k % 2 ? C.grass : "#93c46f",
        });
      });
    });
    return out;
  }, [plants]);
  const stalks = useMemo<Instance[]>(
    () =>
      plants.map((p) => ({
        p: [p.x, p.h / 2, p.z],
        s: [0.12, p.h, 0.12],
        color: C.leaf,
      })),
    [plants],
  );
  const bits = useMemo<Instance[]>(() => {
    const out: Instance[] = [];
    plants.forEach((p, i) => {
      // the cob and the tassel
      out.push({
        p: [p.x + 0.1, p.h * 0.62, p.z + 0.04],
        s: [0.13, 0.3, 0.13],
        r: [0, 0, -0.35],
        color: C.sun,
      });
      out.push({
        p: [p.x, p.h + 0.08, p.z],
        s: [0.1, 0.18, 0.1],
        color: "#e9c25a",
      });
      // blight lesions on the sick leaves
      if (p.sick)
        [0.3, 0.5].forEach((f, k) => {
          const a = hash(i, 10 + k) * 0.8 + k * 2.4;
          out.push({
            p: [p.x + Math.cos(a) * 0.3, p.h * f + 0.13, p.z - Math.sin(a) * 0.3],
            s: 0.07,
            color: "#6b3f1d",
          });
          out.push({
            p: [p.x + Math.cos(a) * 0.48, p.h * f + 0.2, p.z - Math.sin(a) * 0.48],
            s: 0.055,
            color: "#6b3f1d",
          });
        });
    });
    return out;
  }, [plants]);
  return (
    <>
      <Boxes items={leaves} thickness={1.2} />
      <Cyls items={stalks} outline={false} sides={6} />
      <ToonInstances items={bits} thickness={1.1}>
        <sphereGeometry args={[1, 8, 6]} />
      </ToonInstances>
    </>
  );
}

/** The drone: a cream body with a Jetson-style green board on its back and a camera underneath. */
function Drone({ plants }: { plants: Plant[] }) {
  const g = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Mesh>(null);
  const led = useRef<THREE.MeshBasicMaterial>(null);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const motors = useMemo<Instance[]>(
    () =>
      MOTORS.map(([x, z]) => ({
        p: [x, 0.06, z] as V3,
        s: [0.22, 0.16, 0.22] as V3,
        color: C.ink,
      })),
    [],
  );
  useFrame(({ clock }) => {
    const u = clock.elapsedTime % CYCLE;
    const dir = dronePath(u, pos);
    const bob = Math.sin(clock.elapsedTime * 3.1) * 0.07;
    if (g.current) {
      g.current.position.set(pos.x, pos.y + bob, pos.z);
      g.current.rotation.z += (-dir * (u < SCAN ? 0.14 : 0.05) - g.current.rotation.z) * 0.08;
    }
    if (beam.current) {
      beam.current.position.set(pos.x, (pos.y + 1.9) / 2, pos.z);
      beam.current.visible = u < SCAN;
    }
    if (led.current) {
      // red when the plant under the camera is blighted
      let sick = false;
      for (const p of plants) if (p.sick && Math.abs(p.x - pos.x) < 0.45 && Math.abs(p.z - pos.z) < 0.5) sick = true;
      led.current.color.set(u >= SCAN ? C.sun : sick ? C.red : C.green);
    }
  });
  return (
    <>
      <mesh ref={beam}>
        <coneGeometry args={[0.62, ALT - 1.9, 24, 1, true]} />
        <meshBasicMaterial color={C.sun} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <group ref={g} scale={1.45}>
        <RoundedBox args={[1.05, 0.32, 0.78]} radius={0.1} castShadow>
          <Toon color={C.cream} />
        </RoundedBox>
        {/* the Jetson-style compute board: green PCB, silver heat sink, copper pads */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.66, 0.06, 0.5]} />
          <Toon color={C.pcb} outline={false} />
        </mesh>
        <mesh position={[-0.06, 0.29, 0]}>
          <boxGeometry args={[0.32, 0.12, 0.32]} />
          <Toon color={C.silver} thickness={1} />
        </mesh>
        <mesh position={[0.24, 0.25, 0.14]}>
          <boxGeometry args={[0.1, 0.04, 0.14]} />
          <meshBasicMaterial color={C.copper} />
        </mesh>
        {[0.785, -0.785].map((a) => (
          <mesh key={a} rotation={[0, a, 0]} position={[0, 0.02, 0]}>
            <boxGeometry args={[1.95, 0.07, 0.1]} />
            <Toon color={C.ink} outline={false} />
          </mesh>
        ))}
        <ToonInstances items={motors} outline={false}>
          <cylinderGeometry args={[0.5, 0.5, 1, 10]} />
        </ToonInstances>
        <Moving
          count={4}
          basic
          color={C.ink}
          onFrame={(put, t) => {
            MOTORS.forEach(([x, z], i) => put(i, x, 0.16, z, 1, 1, 1, 0, t * 38 * (i % 2 ? 1 : -1), 0));
          }}
        >
          <boxGeometry args={[0.72, 0.02, 0.09]} />
        </Moving>
        {/* camera gimbal, looking down */}
        <mesh position={[0, -0.24, 0.12]}>
          <sphereGeometry args={[0.13, 12, 10]} />
          <Toon color={C.ink} outline={false} />
        </mesh>
        <mesh position={[0.4, 0.02, 0.4]}>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshBasicMaterial ref={led} color={C.green} />
        </mesh>
      </group>
    </>
  );
}

/** Bounding boxes on the field, and the NDVI board filling in behind it. */
function Readout({ plants }: { plants: Plant[] }) {
  const detect = useDetectGeometry();
  const seen = useRef<number[]>(plants.map(() => -1));
  const pos = useMemo(() => new THREE.Vector3(), []);
  const dark = useMemo(() => new THREE.Color("#3a3352"), []);
  const tile = useMemo(() => new THREE.Color(), []);
  const ndvi = useMemo(() => plants.map((p) => new THREE.Color(p.ndvi)), [plants]);
  // the blight patch on the board: columns 5 to 6, rows 0 to 2
  const roiGeo = useMemo(() => frameGeometry(1.24, 1.74, 0.08), []);
  const roi = useRef<THREE.Mesh>(null);
  const roiLabel = useRef<THREE.Group>(null);
  const last = useRef(0);

  // the scan reads the drone's position from the same clock, so no wiring is needed
  const step = (t: number) => {
    const u = t % CYCLE;
    if (u < last.current) seen.current.fill(-1);
    last.current = u;
    if (u < SCAN) {
      dronePath(u, pos);
      plants.forEach((p, i) => {
        if (seen.current[i] < 0 && Math.abs(p.x - pos.x) < 0.3 && Math.abs(p.z - pos.z) < 0.4) seen.current[i] = t;
      });
    }
    return u;
  };

  // board layout: one tile per plant, back row on top, like the field seen from the drone
  const tileX = (i: number) => ((i % COLS) - (COLS - 1) / 2) * 0.5;
  const tileY = (i: number) => (1.5 - Math.floor(i / COLS)) * 0.5;

  useFrame(({ clock }) => {
    const u = clock.elapsedTime % CYCLE;
    const show = u >= SCAN && u < SCAN + 3.4;
    const on = show && Math.floor((u - SCAN) * 3) % 2 === 0;
    if (roi.current) roi.current.visible = on;
    if (roiLabel.current) roiLabel.current.visible = show;
  });

  return (
    <>
      <Moving
        count={plants.length}
        basic
        onFrame={(put, t) => {
          const u = step(t);
          plants.forEach((p, i) => {
            const s = seen.current[i];
            const age = s < 0 ? -1 : t - s;
            // healthy boxes flash and fade; blighted ones stay up until the next pass
            const k = age < 0 ? 0 : p.sick ? Math.min(age * 6, 1) : age < 1.4 ? Math.min(age * 6, 1) * Math.min((1.4 - age) * 3, 1) : 0;
            const fade = u > CYCLE - 0.6 ? Math.max((CYCLE - u) / 0.6, 0) : 1;
            put(i, p.x, 0.17, p.z + 0.32, k * fade);
            put.color(i, p.sick ? C.red : C.green);
          });
        }}
      >
        <primitive object={detect} attach="geometry" />
      </Moving>

      {/* the NDVI board */}
      <group position={[0.4, 0, -4.9]} rotation={[0, 0.06, 0]}>
        <Cyls
          items={[
            { p: [-2.1, 2.5, -0.1], s: [0.22, 5, 0.22], color: C.bark },
            { p: [2.1, 2.5, -0.1], s: [0.22, 5, 0.22], color: C.bark },
          ]}
        />
        <group position={[0, 6.2, 0]}>
          <RoundedBox args={[5.5, 3.2, 0.22]} radius={0.12} castShadow>
            <Toon color={C.cream} />
          </RoundedBox>
          <mesh position={[0, -0.2, 0.115]}>
            <planeGeometry args={[4.9, 2.3]} />
            <meshBasicMaterial color="#2b2540" />
          </mesh>
          <Label size={0.4} color={C.ink} position={[-2.45, 1.22, 0.13]} anchorX="left">
            NDVI
          </Label>
          <group ref={roiLabel} visible={false}>
            <Label size={0.3} color={C.red} position={[2.45, 1.22, 0.13]} anchorX="right">
              ROI FOUND
            </Label>
          </group>
          <group position={[0, -0.2, 0]}>
            <Moving
              count={plants.length}
              basic
              onFrame={(put, t) => {
                plants.forEach((_, i) => {
                  const x = tileX(i);
                  const y = tileY(i);
                  const z = 0.13;
                  const s = seen.current[i];
                  const k = s < 0 ? 0 : Math.min((t - s) * 3, 1);
                  put(i, x, y, z, 0.42 * (0.85 + 0.15 * k), 0.42 * (0.85 + 0.15 * k), 1);
                  put.color(i, tile.copy(dark).lerp(ndvi[i], k));
                });
              }}
            >
              <planeGeometry args={[1, 1]} />
            </Moving>
            {/* region of interest: the blight patch, boxed */}
            <mesh ref={roi} position={[0.75, 0.25, 0.14]} geometry={roiGeo} visible={false}>
              <meshBasicMaterial color={C.cream} />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}

function Pole() {
  const stripes = useMemo<Instance[]>(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        p: [0, 0.46 + i * 0.92, 0] as V3,
        s: [0.2, 0.92, 0.2] as V3,
        color: i % 2 ? C.cream : C.coral,
      })),
    [],
  );
  return (
    <group position={[5.9, 0.15, -0.6]}>
      <Cyls items={stripes} />
      {/* the marker at the drone's height */}
      <mesh position={[-0.32, ALT - 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.2, 0.42, 3]} />
        <Toon color={C.sun} thickness={1.4} />
      </mesh>
      <Label size={0.42} position={[0, ALT + 0.55, 0.05]} outline={C.cream}>
        15 M
      </Label>
    </group>
  );
}

/** A prism with its ridge along z: the research tent. */
function useTentGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1, 0);
    s.lineTo(1, 0);
    s.lineTo(0, 1.55);
    s.lineTo(-1, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 2, bevelEnabled: false });
    g.translate(0, 0, -1);
    return g;
  }, []);
}

/** The research tent, the lead's laptop with the NDVI map on screen, and the grant flag. */
function Camp() {
  const flag = useRef<THREE.Group>(null);
  const tent = useTentGeometry();
  useFrame(({ clock }) => {
    if (flag.current) flag.current.rotation.y = Math.sin(clock.elapsedTime * 1.6) * 0.1;
  });
  const parts = useMemo<Instance[]>(
    () => [
      // folding table and the laptop
      { p: [1.75, 0.74, 0.55], s: [1.3, 0.08, 0.75], color: C.bark },
      { p: [1.75, 0.81, 0.62], s: [0.66, 0.05, 0.42], color: C.ink },
      {
        p: [1.75, 1.03, 0.4],
        s: [0.66, 0.42, 0.04],
        r: [-0.2, 0, 0],
        color: C.ink,
      },
      // the researcher on a stool, facing the laptop
      { p: [1.75, 0.3, 1.45], s: [0.42, 0.5, 0.42], color: C.bark },
    ],
    [],
  );
  const legs = useMemo<Instance[]>(
    () => [
      ...[
        [1.2, 0.25],
        [2.3, 0.25],
        [1.2, 0.85],
        [2.3, 0.85],
      ].map(([x, z]) => ({
        p: [x, 0.37, z] as V3,
        s: [0.06, 0.74, 0.06] as V3,
        color: C.ink,
      })),
      { p: [-1.45, 2.1, -0.9], s: [0.11, 4.2, 0.11], color: C.ink },
    ],
    [],
  );
  return (
    <group position={[-4.5, 0.15, 3.9]} rotation={[0, 0.35, 0]}>
      <mesh geometry={tent} castShadow>
        <Toon color={C.teal} />
      </mesh>
      <mesh position={[0, 0, 1.01]}>
        <shapeGeometry args={[TENT_DOOR]} />
        <meshBasicMaterial color={C.cream} />
      </mesh>
      <Boxes items={parts} />
      <Cyls items={legs} outline={false} sides={6} />
      {/* the researcher: a toy figure in a coral jacket, leaning in to the screen */}
      <mesh position={[1.75, 0.95, 1.4]} rotation={[-0.15, 0, 0]} castShadow>
        <capsuleGeometry args={[0.24, 0.45, 4, 10]} />
        <Toon color={C.coral} thickness={1.6} />
      </mesh>
      <mesh position={[1.75, 1.6, 1.32]} castShadow>
        <sphereGeometry args={[0.24, 14, 10]} />
        <Toon color="#b97a50" thickness={1.6} />
      </mesh>
      <mesh position={[1.75, 1.66, 1.38]} rotation={[0.5, 0, 0]}>
        <sphereGeometry args={[0.26, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Toon color={C.ink} outline={false} />
      </mesh>
      {/* the screen shows the field's NDVI colours, with the blight patch in red */}
      <Glows
        items={[
          {
            p: [1.75, 1.04, 0.425],
            s: [0.56, 0.34, 1],
            r: [-0.2, 0, 0],
            color: "#56c27a",
          },
          {
            p: [1.85, 1.1, 0.43],
            s: [0.14, 0.12, 1],
            r: [-0.2, 0, 0],
            color: C.red,
          },
          {
            p: [1.65, 0.98, 0.43],
            s: [0.18, 0.1, 1],
            r: [-0.2, 0, 0],
            color: C.sun,
          },
        ]}
      >
        <planeGeometry args={[1, 1]} />
      </Glows>
      <group ref={flag} position={[-1.45, 3.65, -0.9]}>
        <mesh position={[1.25, 0, 0]} castShadow>
          <boxGeometry args={[2.5, 1.15, 0.05]} />
          <Toon color={C.sun} thickness={1.6} />
        </mesh>
        <Label size={0.4} position={[1.25, 0.15, 0.04]}>
          $25,000
        </Label>
        <Label size={0.25} position={[1.25, -0.3, 0.04]}>
          GRANT
        </Label>
      </group>
    </group>
  );
}

const TENT_DOOR = (() => {
  const s = new THREE.Shape();
  s.moveTo(-0.45, 0.02);
  s.lineTo(0.45, 0.02);
  s.lineTo(0, 0.9);
  s.lineTo(-0.45, 0.02);
  return s;
})();

export function DroneField() {
  const plants = usePlants();
  const ground = useMemo<Instance[]>(
    () => [
      { p: [0.4, 0.17, -0.02], s: [9.6, 0.06, 5.3], color: "#a86a3c" },
      ...Array.from({ length: ROWS }, (_, r) => ({
        p: [0.4, 0.22, fz(r)] as V3,
        s: [9.2, 0.12, 0.62] as V3,
        color: C.clayDark,
      })),
    ],
    [],
  );
  return (
    <group>
      <Islet r={11} top={C.grass} />
      <Boxes items={ground} outline={false} castShadow={false} />
      <group position={[0, 0.2, 0]}>
        <Field plants={plants} />
        <Readout plants={plants} />
      </group>
      <Drone plants={plants} />
      <Pole />
      <Camp />
    </group>
  );
}
