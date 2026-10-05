"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { Label, chime, useHoverCursor } from "../../bits";
import { Islet } from "../../props/basics";
import { Boxes, Cyls, Glows, Moving, frameGeometry, hash, type V3 } from "./kit";

/*
 * 2024, IEEE SPACE: two papers out of the drone research, and a patent filed.
 * Two giant books stand on a little stage under the conference banner. Their covers swing
 * open now and then. Each carries its subject: a maize cob (leaf blight), a drone (UAV
 * crop health). In front, a lectern with the patent scroll, sealed in wax and stamped
 * FILED. Click the seal to stamp it again. Confetti, because it is a celebration.
 */

const BW = 2.3;
const BH = 3.2;
const BD = 0.6;
const STAGE_Y = 0.6;

function Book({
  position,
  rotation,
  color,
  lines,
  phase,
  children,
}: {
  position: V3;
  rotation: number;
  color: string;
  lines: [string, string];
  phase: number;
  children: ReactNode;
}) {
  const cover = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    // mostly closed; every so often the cover swings open to show the pages, then shuts
    const t = (clock.elapsedTime * 0.22 + phase) % 1;
    const open = t < 0.35 ? Math.sin((t / 0.35) * Math.PI) : 0;
    if (cover.current) cover.current.rotation.y = -0.08 - open * 0.55;
  });
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <group ref={cover} position={[-BW / 2, BH / 2, BD / 2 - 0.05]}>
        <mesh position={[BW / 2, 0, 0]} castShadow>
          <boxGeometry args={[BW, BH, 0.1]} />
          <Toon color={color} />
        </mesh>
        <RoundedBox args={[1.9, 1.15, 0.06]} radius={0.05} position={[BW / 2 + 0.05, 0.62, 0.06]}>
          <Toon color={C.cream} outline={false} />
        </RoundedBox>
        <Label size={0.33} position={[BW / 2 + 0.05, 0.85, 0.1]}>
          {lines[0]}
        </Label>
        <Label size={0.33} position={[BW / 2 + 0.05, 0.4, 0.1]}>
          {lines[1]}
        </Label>
        <group position={[BW / 2 + 0.05, -0.65, 0.06]}>{children}</group>
      </group>
    </group>
  );
}

/** A maize cob with two husk leaves: the leaf-blight paper. */
function CobEmblem() {
  return (
    <group rotation={[0, 0, -0.5]}>
      <mesh position={[0, 0, 0.12]}>
        <capsuleGeometry args={[0.2, 0.55, 4, 10]} />
        <Toon color={C.sun} thickness={1.4} />
      </mesh>
      <Boxes
        items={[-1, 1].map((k) => ({ p: [k * 0.2, -0.22, 0.1] as V3, s: [0.14, 0.75, 0.05] as V3, r: [0, 0, k * 0.45] as V3, color: C.grass }))}
        thickness={1.2}
        castShadow={false}
      />
    </group>
  );
}

/** A little quadcopter seen from above: the UAV crop-health paper. */
function DroneEmblem() {
  const rotors = useMemo<Instance[]>(
    () =>
      [
        [-0.42, 0.32],
        [0.42, 0.32],
        [-0.42, -0.32],
        [0.42, -0.32],
      ].map(([x, y]) => ({
        p: [x, y, 0.1] as V3,
        s: [0.42, 0.42, 0.04] as V3,
        color: C.cream,
      })),
    [],
  );
  return (
    <group>
      <Boxes
        items={[
          { p: [0, 0, 0.06], s: [1.15, 0.08, 0.04], r: [0, 0, 0.65], color: C.ink },
          { p: [0, 0, 0.06], s: [1.15, 0.08, 0.04], r: [0, 0, -0.65], color: C.ink },
          { p: [0, 0, 0.1], s: [0.36, 0.26, 0.1], color: C.cream },
        ]}
        thickness={1.2}
        castShadow={false}
      />
      <Cyls
        items={rotors.map((r) => ({
          ...r,
          r: [Math.PI / 2, 0, 0] as V3,
          s: [0.42, 0.04, 0.42] as V3,
        }))}
        thickness={1.2}
        castShadow={false}
        sides={16}
      />
    </group>
  );
}

/** Rosette ribbons pinned to the published books: gold discs with coral centres and tails. */
const ROSETTES: V3[] = [
  [-0.55, STAGE_Y + BH - 0.25, -1.2],
  [3.25, STAGE_Y + BH - 0.25, -1.25],
];
function Rosettes() {
  const discs = useMemo<Instance[]>(() => ROSETTES.map((p) => ({ p, s: [0.64, 0.06, 0.64] as V3, r: [Math.PI / 2, 0, 0] as V3, color: C.gold })), []);
  const hearts = useMemo<Instance[]>(
    () => [
      ...ROSETTES.map((p) => ({ p: [p[0], p[1], p[2] + 0.04] as V3, s: [0.36, 0.36, 1] as V3, color: C.coral })),
      ...ROSETTES.flatMap((p) =>
        [-1, 1].map((k) => ({ p: [p[0] + k * 0.12, p[1] - 0.42, p[2] - 0.02] as V3, s: [0.16, 0.5, 1] as V3, r: [0, 0, k * 0.25] as V3, color: C.coral })),
      ),
    ],
    [],
  );
  return (
    <>
      <Cyls items={discs} thickness={1.4} castShadow={false} sides={14} />
      <Glows items={hearts}>
        <planeGeometry args={[1, 1]} />
      </Glows>
    </>
  );
}

/** The patent: a scroll on a lectern, a wax seal, and a FILED stamp. Click the seal. */
function Patent() {
  const stamp = useRef<THREE.Group>(null);
  const hit = useRef(-10);
  const { bind } = useHoverCursor();
  const clock = useThree((st) => st.clock);
  const stampGeo = useMemo(() => frameGeometry(1.1, 0.42, 0.05), []);
  useFrame(() => {
    const g = stamp.current;
    if (!g) return;
    const a = clock.elapsedTime - hit.current;
    // thump: comes down big, settles at its size
    const k = a < 0.35 ? 1 + (1 - a / 0.35) * 0.6 : 1;
    g.scale.setScalar(k);
  });
  return (
    <group position={[-0.1, STAGE_Y, 1.75]} rotation={[0, 0.12, 0]}>
      <Boxes
        items={[
          { p: [0, 0.55, 0], s: [0.6, 1.1, 0.5], color: C.bark },
          { p: [0, 0.04, 0], s: [1.3, 0.08, 0.9], color: C.bark },
        ]}
      />
      <group position={[0, 1.22, 0]} rotation={[0.72, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.2, 0.12, 1.5]} />
          <Toon color={C.bark} />
        </mesh>
        <group position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <planeGeometry args={[1.8, 1.15]} />
            <meshBasicMaterial color="#f7e6bd" />
          </mesh>
          {/* the rolled ends */}
          <Cyls
            items={[0.62, -0.62].map((y) => ({ p: [0, y, 0.08] as V3, s: [0.2, 1.95, 0.2] as V3, r: [0, 0, Math.PI / 2] as V3, color: "#f2d9a2" }))}
            thickness={1.4}
            castShadow={false}
            sides={12}
          />
          <Label size={0.3} position={[-0.1, 0.25, 0.01]}>
            PATENT
          </Label>
          <group ref={stamp} position={[-0.15, -0.2, 0.02]} rotation={[0, 0, 0.12]}>
            <mesh geometry={stampGeo}>
              <meshBasicMaterial color={C.red} />
            </mesh>
            <Label size={0.25} color={C.red} position={[0, 0, 0.01]}>
              FILED
            </Label>
          </group>
          {/* the wax seal */}
          <group
            position={[0.62, -0.28, 0.06]}
            onClick={(e) => {
              e.stopPropagation();
              hit.current = clock.elapsedTime;
              chime(660);
            }}
            {...bind}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.22, 0.08, 14]} />
              <Toon color={C.red} thickness={1.4} />
            </mesh>
            <Glows items={[-1, 1].map((k) => ({ p: [k * 0.08, -0.26, -0.02] as V3, s: [0.1, 0.32, 1] as V3, r: [0, 0, k * 0.3] as V3, color: C.brickDark }))}>
              <planeGeometry args={[1, 1]} />
            </Glows>
          </group>
        </group>
      </group>
    </group>
  );
}

const CONFETTI = 40;
const CONFETTI_COLORS = [C.coral, C.sun, C.cobalt, C.green, C.rose, C.teal];

export function Publications() {
  const confetti = useMemo(
    () =>
      Array.from({ length: CONFETTI }, (_, i) => ({
        x: -4 + hash(i, 1) * 8.8,
        z: -3.4 + hash(i, 2) * 5.5,
        off: hash(i, 3) * 6.5,
        speed: 0.5 + hash(i, 4) * 0.4,
        spin: hash(i, 5) * 6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    [],
  );
  const kit = useMemo<Instance[]>(
    () => [
      // back covers, page blocks and spines of the two books (the front covers move)
      ...[
        { x: -1.55, r: 0.16, c: C.cobalt, s: "#2346c0" },
        { x: 2.25, r: -0.12, c: C.coral, s: "#d4502f" },
      ].flatMap(({ x, r, c, s }) => {
        const cos = Math.cos(r);
        const sin = Math.sin(r);
        // positions in the book's own frame, turned by its yaw
        const at = (lx: number, ly: number, lz: number): V3 => [x + lx * cos + lz * sin, STAGE_Y + ly, -1.7 - lx * sin + lz * cos];
        return [
          {
            p: at(0, BH / 2, -BD / 2 + 0.05),
            s: [BW, BH, 0.1] as V3,
            r: [0, r, 0] as V3,
            color: c,
          },
          {
            p: at(0.06, BH / 2, 0),
            s: [BW - 0.14, BH - 0.18, BD - 0.16] as V3,
            r: [0, r, 0] as V3,
            color: C.cream,
          },
          {
            p: at(-BW / 2, BH / 2, 0),
            s: [0.12, BH, BD] as V3,
            r: [0, r, 0] as V3,
            color: s,
          },
        ];
      }),
      // the banner across the back
      { p: [0.4, 5.75, -3.8], s: [7.8, 1.3, 0.2], color: C.plum },
    ],
    [],
  );
  const posts = useMemo<Instance[]>(
    () => [
      { p: [-3.6, 3.2, -3.85], s: [0.24, 6.4, 0.24], color: C.cream },
      { p: [4.4, 3.2, -3.85], s: [0.24, 6.4, 0.24], color: C.cream },
    ],
    [],
  );
  // pennants along a sagging string under the banner
  const pennants = useMemo<Instance[]>(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const f = i / 10;
        const x = -3.3 + f * 7.4;
        const y = 4.7 - Math.sin(f * Math.PI) * 0.4;
        return {
          p: [x, y, -3.7] as V3,
          s: [0.32, 0.5, 0.06] as V3,
          r: [0, 0, Math.PI] as V3,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        };
      }),
    [],
  );
  return (
    <group>
      <Islet r={11} top={C.sand} />
      {/* everything on the stage, scaled up as one so the books read from the camera */}
      <group position={[0.4, 0, 0.2]} scale={1.25}>
        <group position={[-0.4, 0, 0.9]}>
          <mesh position={[0.4, 0.3, -0.9]} receiveShadow castShadow>
            <cylinderGeometry args={[5.1, 5.1, 0.32, 48]} />
            <Toon color={C.plum} />
          </mesh>
          <mesh position={[0.4, 0.5, -0.9]} receiveShadow>
            <cylinderGeometry args={[4.6, 4.6, 0.12, 48]} />
            <Toon color={C.cream} outline={false} />
          </mesh>
          <Boxes items={kit} />
          <Cyls items={posts} />
          <ToonInstances items={pennants} thickness={1.2}>
            <coneGeometry args={[0.5, 1, 3]} />
          </ToonInstances>
          <Label size={0.52} color={C.cream} position={[0.4, 5.92, -3.69]}>
            IEEE SPACE
          </Label>
          <Label size={0.3} color={C.sun} position={[0.4, 5.43, -3.69]}>
            2024
          </Label>

          <Book position={[-1.55, STAGE_Y, -1.7]} rotation={0.16} color={C.cobalt} lines={["MAIZE", "BLIGHT"]} phase={0}>
            <CobEmblem />
          </Book>
          <Book position={[2.25, STAGE_Y, -1.7]} rotation={-0.12} color={C.coral} lines={["UAV CROP", "HEALTH"]} phase={0.5}>
            <DroneEmblem />
          </Book>
          <Rosettes />

          <Patent />

          <Moving
            count={CONFETTI}
            outline={false}
            onFrame={(put, t) => {
              confetti.forEach((c, i) => {
                const y = 6.8 - ((t * c.speed + c.off) % 6.2);
                put(i, c.x + Math.sin(t + c.spin) * 0.3, y, c.z, 0.16, 0.03, 0.1, t * 2 + c.spin, t + c.spin, 0);
                put.color(i, c.color);
              });
            }}
          >
            <boxGeometry args={[1, 1, 1]} />
          </Moving>
        </group>
      </group>
    </group>
  );
}
