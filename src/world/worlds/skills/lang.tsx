"use client";

import { Line, RoundedBox, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon } from "../../toon";
import { FONT, chime, useHoverCursor } from "../../bits";
import type { DioramaProps } from "../Frame";
import { Crates, Market, Painted, paint, smooth, stack, type V3 } from "./kit";

/*
 * Python at Nokia, Java at MSCI and in coursework, TypeScript, React and Next.js for Bitgig.
 * A compositor's type case sets the three languages a line at a time, an ink roller
 * passes over them, and the web page they make stands beside it.
 */

const ROWS: { word: string; color: string; ink: string }[] = [
  { word: "PYTHON", color: C.sun, ink: C.ink },
  { word: "JAVA", color: C.coral, ink: C.cream },
  { word: "TYPESCRIPT", color: C.cobalt, ink: C.cream },
];
const ROW_Y = [0.62, 0, -0.62];
const BLOCK = 0.42;
const FACE = 0.1; // tray face, in tray space
const X0 = -2.25; // left margin of the type
const LOOP = 9;
const TILT = -0.42;

/** One line of type: the word in one text draw, with a block under each letter, found from the glyph layout. */
function TypeRow({ word, color, ink, k }: { word: string; color: string; ink: string; k: number }) {
  const [xs, setXs] = useState<number[]>([]);
  const blocks = useRef<THREE.InstancedMesh>(null);
  const row = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const m = blocks.current;
    if (!m || !xs.length) return;
    const o = new THREE.Object3D();
    xs.forEach((x, i) => {
      o.position.set(x, 0, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.count = xs.length;
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [xs]);
  useFrame(({ clock }) => {
    const g = row.current;
    if (!g) return;
    const t = clock.elapsedTime % LOOP;
    // set a line at a time, hold, then lift them out last line first
    const set = smooth((t - k * 0.8) / 0.6) - smooth((t - (7.4 + (2 - k) * 0.3)) / 0.5);
    g.position.set((1 - set) * -0.5, ROW_Y[k], FACE + BLOCK / 2 + (1 - set) * 0.9);
    g.visible = set > 0.01;
  });
  return (
    <group ref={row}>
      <instancedMesh ref={blocks} args={[undefined, undefined, 12]} count={0}>
        <boxGeometry args={[BLOCK - 0.03, BLOCK, BLOCK]} />
        <Toon color={color} thickness={1.4} />
      </instancedMesh>
      <Text
        font={FONT}
        fontSize={0.3}
        letterSpacing={0.55}
        color={ink}
        anchorX="left"
        anchorY="middle"
        position={[X0, -0.01, BLOCK / 2 + 0.01]}
        onSync={(troika: { textRenderInfo?: { caretPositions?: Float32Array } }) => {
          const cp = troika.textRenderInfo?.caretPositions;
          if (!cp) return;
          const next = Array.from({ length: word.length }, (_, i) => X0 + (cp[i * 4] + cp[i * 4 + 1]) / 2);
          setXs((prev) => (prev.length === next.length && prev.every((v, i) => Math.abs(v - next[i]) < 1e-4) ? prev : next));
        }}
      >
        {word}
      </Text>
    </group>
  );
}

function trayGeometry() {
  const parts: Parameters<typeof paint>[0] = [
    { g: new THREE.BoxGeometry(5.3, 2.35, 0.16), c: C.bark, p: [0, 0, 0] },
    { g: new THREE.BoxGeometry(5.0, 2.05, 0.05), c: "#5c3a26", p: [0, 0, 0.08] },
  ];
  // rails the lines of type sit on
  ROW_Y.forEach((y) => parts.push({ g: new THREE.BoxGeometry(5.0, 0.05, 0.12), c: C.bark, p: [0, y - BLOCK / 2 - 0.03, FACE + 0.04] }));
  return paint(parts, true);
}

function easelGeometry() {
  return paint(
    [
      { g: new THREE.BoxGeometry(0.14, 2.0, 0.14), c: C.bark, p: [-2.0, 0.95, 0.15], r: [0.18, 0, 0] },
      { g: new THREE.BoxGeometry(0.14, 2.0, 0.14), c: C.bark, p: [2.0, 0.95, 0.15], r: [0.18, 0, 0] },
      { g: new THREE.BoxGeometry(0.12, 2.2, 0.12), c: C.bark, p: [0, 1.0, -0.65], r: [-0.42, 0, 0] },
      { g: new THREE.BoxGeometry(4.6, 0.1, 0.18), c: C.bark, p: [0, 0.62, 0.28] },
    ],
    true,
  );
}

function brayerGeometry() {
  return paint(
    [
      { g: new THREE.BoxGeometry(0.06, 2.1, 0.06), c: C.ink, p: [0, 0, 0.22] },
      { g: new THREE.BoxGeometry(0.06, 0.06, 0.3), c: C.ink, p: [0, 1.04, 0.08] },
      { g: new THREE.BoxGeometry(0.06, 0.06, 0.3), c: C.ink, p: [0, -1.04, 0.08] },
      { g: new THREE.CylinderGeometry(0.09, 0.09, 0.6, 10), c: C.bark, p: [0, 1.38, 0.22] },
    ],
    true,
  );
}

function TypeCase({ position }: { position: V3 }) {
  const tray = useMemo(() => trayGeometry(), []);
  const easel = useMemo(() => easelGeometry(), []);
  const brayer = useMemo(() => brayerGeometry(), []);
  const roller = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Mesh>(null);
  const { bind } = useHoverCursor();
  const kick = useRef(0);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime % LOOP;
    // the ink roller: parked at the right, rolls across the set type and back
    kick.current = Math.max(0, kick.current - dt);
    const pass = Math.max(smooth((t - 3.0) / 1.4) - smooth((t - 4.6) / 1.4), kick.current > 0 ? Math.sin((1 - kick.current) * Math.PI) : 0);
    const x = 2.3 - pass * 4.5;
    if (roller.current) roller.current.position.x = x;
    if (spin.current) spin.current.rotation.y = -x / 0.16;
  });
  return (
    <group position={position}>
      <Painted geometry={easel} castShadow thickness={1.6} />
      <group position={[0, 1.85, 0.35]} rotation={[TILT, 0, 0]}>
        <Painted geometry={tray} castShadow thickness={1.8} />
        {ROWS.map((r, k) => (
          <TypeRow key={r.word} {...r} k={k} />
        ))}
        <group
          ref={roller}
          position={[2.3, 0, FACE + BLOCK + 0.18]}
          onClick={(e) => {
            e.stopPropagation();
            if (kick.current <= 0) {
              kick.current = 1;
              chime(880);
            }
          }}
          {...bind}
        >
          <Painted geometry={brayer} thickness={1.2} />
          <mesh ref={spin} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 2.0, 14]} />
            <Toon color={C.ink} thickness={1.2} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** The page they make: a browser window showing a review screen, one card still a draft. */
function Browser({ position }: { position: V3 }) {
  const chrome = useMemo(
    () =>
      paint([
        { g: new THREE.PlaneGeometry(2.3, 0.3), c: C.rose, p: [0, 0.68, 0] },
        ...[-0.98, -0.82, -0.66].map((x) => ({ g: new THREE.CircleGeometry(0.055, 10), c: C.cream, p: [x, 0.68, 0.005] as V3 })),
        { g: new THREE.PlaneGeometry(1.3, 0.13), c: C.cream, p: [0.35, 0.68, 0.005] },
        { g: new THREE.PlaneGeometry(2.0, 0.22), c: C.cobalt, p: [0, 0.32, 0] },
        { g: new THREE.PlaneGeometry(0.9, 0.62), c: C.green, p: [0.5, -0.22, 0] },
        { g: new THREE.PlaneGeometry(0.6, 0.07), c: C.cream, p: [0.5, -0.12, 0.005] },
        { g: new THREE.PlaneGeometry(0.4, 0.07), c: C.cream, p: [0.4, -0.3, 0.005] },
        { g: new THREE.PlaneGeometry(0.6, 0.07), c: C.ink, p: [-0.5, -0.12, 0.005] },
        { g: new THREE.PlaneGeometry(0.4, 0.07), c: C.ink, p: [-0.6, -0.3, 0.005] },
      ]),
    [],
  );
  const dashed = useMemo(() => [new THREE.Vector3(-0.95, 0.09, 0), new THREE.Vector3(-0.05, 0.09, 0), new THREE.Vector3(-0.05, -0.53, 0), new THREE.Vector3(-0.95, -0.53, 0), new THREE.Vector3(-0.95, 0.09, 0)], []);
  const stand = useMemo(
    () =>
      paint(
        [
          { g: new THREE.CylinderGeometry(0.07, 0.09, 1.3, 8), c: C.ink, p: [0, 0.65, -0.1] },
          { g: new THREE.CylinderGeometry(0.45, 0.5, 0.1, 16), c: C.ink, p: [0, 0.05, -0.1] },
        ],
        true,
      ),
    [],
  );
  return (
    <group position={position} rotation={[0, -0.2, 0]}>
      <Painted geometry={stand} castShadow thickness={1.4} />
      <group position={[0, 2.05, 0]} rotation={[-0.08, 0, 0]}>
        <RoundedBox args={[2.5, 1.85, 0.14]} radius={0.1} castShadow>
          <Toon color={C.white} />
        </RoundedBox>
        <mesh geometry={chrome} position={[0, 0, 0.075]}>
          <meshBasicMaterial vertexColors />
        </mesh>
        <Line points={dashed} color={C.ink} lineWidth={2.5} dashed dashSize={0.1} gapSize={0.07} position={[0, 0, 0.08]} />
      </group>
    </group>
  );
}

export default function Lang({ step }: DioramaProps) {
  const crates = useMemo(
    () =>
      stack(
        [
          [
            { t: "REACT", c: C.cobalt },
            { t: "NEXT.JS", c: C.cream },
          ],
        ],
        [2.2, 0.15, 2.35],
        0.1,
        -0.2,
      ),
    [],
  );
  return (
    <Market id={step.id} color={C.rose} title="LANGUAGES & WEB">
      <TypeCase position={[-1.6, 0.15, 0.35]} />
      <Browser position={[2.55, 0.15, 0.0]} />
      <Crates items={crates} />
    </Market>
  );
}
