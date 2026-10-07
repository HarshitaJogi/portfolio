"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { education, places } from "@/content/profile";
import { C } from "../../palette";
import { Toon } from "../../toon";
import { Label, chime } from "../../bits";
import { findEgg } from "../../eggs";
import { Bob, Islet } from "../../props/basics";
import { Tappable } from "../../props/tappable";
import { HINT, PopText, hump, sfx, since, useKick } from "@/world/fx";
import { Moving } from "../projects/kit";
import { FallingLeaves, Maples } from "../../props/nature";
import { Mortarboard } from "../../props/things";
import { Shuttle } from "../../props/vehicles";
import { Baked, Hands, box, clockFace, cone, cyl, move, prism, sphere, torus, type Part, type V3 } from "./kit";

/**
 * Northeastern University, MS in Computer Science, Sep 2025 to May 2027, GPA 3.9/4.0.
 * A red-brick hall with a cupola clock on Boston time, maples in October colours,
 * a Green Line trolley out front, a husky by the steps, the five courses stacked as
 * books, the two awards on an honour board, and the cap still dashed: not finished yet.
 * The university's name runs along the portico frieze, the city sits in the pediment.
 * Click the husky, the trolley and the stack of books (they shuffle).
 */

const G = 0.14;
const SCALE = 1.1;
const SHIFT: V3 = [-0.6, 0, 0.5];

const BRICK = C.brick;
const TRIM = C.cream;
const SLATE = "#5d6378";
const VERDIGRIS = "#5fae9a";

/* ---------------- the hall ---------------- */

const HALL_AT: V3 = [0.6, G, -6.6];
const HALL = { w: 7.2, h: 3.0, d: 2.8 };
const CUPOLA_CLOCK: V3 = [0, 4.62, 0.71];
const CLOCK_R = 0.42;
const FRIEZE_W = 6.4;
const FRIEZE_Y = 0.3 + HALL.h - 0.07;

function hallParts() {
  const { w, h, d } = HALL;
  const f = d / 2; // the front face
  const body: Part[] = [
    box(C.stone, w + 0.3, 0.3, d + 0.3, { p: [0, 0.15, 0] }),
    box(BRICK, w, h, d, { p: [0, 0.3 + h / 2, 0] }),
    box(TRIM, w + 0.35, 0.22, d + 0.35, { p: [0, 0.3 + h + 0.11, 0] }),
    // slate roof along the length
    prism(SLATE, d + 0.2, 1.0, w + 0.1, { p: [0, 0.3 + h + 0.22, 0], r: [0, Math.PI / 2, 0] }),
    // portico: steps, six columns, a frieze wide enough for the university's name, pediment
    box(C.stone, 6.5, 0.16, 0.5, { p: [0, 0.38, f + 0.35] }),
    box(C.stone, 6.7, 0.16, 0.5, { p: [0, 0.22, f + 0.75] }),
    box(C.stone, 6.9, 0.14, 0.5, { p: [0, 0.07, f + 1.15] }),
    box(TRIM, FRIEZE_W, 0.5, 0.75, { p: [0, FRIEZE_Y, f + 0.45] }),
    box(C.brickDark, FRIEZE_W - 0.2, 0.36, 0.02, { p: [0, FRIEZE_Y, f + 0.83] }),
    prism(TRIM, FRIEZE_W + 0.3, 0.9, 0.75, { p: [0, FRIEZE_Y + 0.25, f + 0.45] }),
    // cupola: base with the clock, an open belfry, a green copper dome
    box(TRIM, 1.42, 1.15, 1.42, { p: [0, 4.55, 0] }),
    box(TRIM, 1.6, 0.12, 1.6, { p: [0, 5.15, 0] }),
    cyl(TRIM, 0.55, 0.6, 0.62, 8, { p: [0, 5.52, 0] }),
    cyl(TRIM, 0.68, 0.68, 0.1, 8, { p: [0, 5.86, 0] }),
    cone(VERDIGRIS, 0.66, 0.85, 8, { p: [0, 6.33, 0] }),
    cyl(C.gold, 0.025, 0.025, 0.5, 6, { p: [0, 6.9, 0] }),
    // the weathervane arrow
    box(C.gold, 0.5, 0.04, 0.04, { p: [0.05, 7.05, 0] }),
    cone(C.gold, 0.07, 0.16, 4, { p: [0.33, 7.05, 0], r: [0, 0, -Math.PI / 2] }),
  ];
  for (let i = 0; i < 6; i++) body.push(cyl(TRIM, 0.17, 0.19, h - 0.35, 12, { p: [-2.75 + i * 1.1, 0.3 + (h - 0.35) / 2 + 0.15, f + 0.45] }));
  // window frames, white, on the brick
  const glow: Part[] = [];
  const winX = [-3.05, -2.3, 2.3, 3.05];
  for (const x of winX)
    for (const y of [1.15, 2.5]) {
      body.push(box(TRIM, 0.58, 0.86, 0.06, { p: [x, y, f + 0.02] }), box(TRIM, 0.7, 0.1, 0.14, { p: [x, y - 0.48, f + 0.05] }));
      glow.push(
        box(C.glass, 0.44, 0.7, 0.02, { p: [x, y, f + 0.06] }),
        box(TRIM, 0.04, 0.7, 0.02, { p: [x, y, f + 0.075] }),
        box(TRIM, 0.44, 0.04, 0.02, { p: [x, y, f + 0.075] }),
      );
    }
  // behind the columns: the door with its fanlight, and two tall windows
  glow.push(box("#24473a", 0.9, 1.55, 0.02, { p: [0, 0.3 + 0.78, f + 0.01] }));
  glow.push(cyl(C.glass, 0.45, 0.45, 0.02, 16, { p: [0, 1.85, f + 0.01], r: [Math.PI / 2, 0, 0] }, [Math.PI / 2, Math.PI]));
  for (const x of [-1.1, 1.1]) glow.push(box(C.glass, 0.5, 1.4, 0.02, { p: [x, 1.5, f + 0.01] }));
  // belfry openings
  glow.push(box(C.ink, 0.28, 0.4, 0.02, { p: [0, 5.52, 0.56] }));
  const clock = clockFace(CUPOLA_CLOCK, CLOCK_R);
  return { body: move([...body, ...clock.body], HALL_AT), glow: move([...glow, ...clock.marks], HALL_AT) };
}

/* ---------------- the grounds ---------------- */

const TRACK_Z = 5.2;
function groundParts() {
  const flat: Part[] = [
    // a brick walk with granite edges, from the steps to the street
    box(C.brickDark, 1.5, 0.04, 8.4, { p: [0.6, G + 0.02, 0.4] }),
    box(C.stone, 0.12, 0.05, 8.4, { p: [-0.21, G + 0.025, 0.4] }),
    box(C.stone, 0.12, 0.05, 8.4, { p: [1.41, G + 0.025, 0.4] }),
    box(C.brickDark, 5.4, 0.04, 1.2, { p: [0.6, G + 0.02, -3.55] }),
    // the street the trolley runs down
    box(C.asphalt, 15, 0.04, 2.0, { p: [0.6, G + 0.02, TRACK_Z] }),
  ];
  const glow: Part[] = [];
  for (const z of [-0.36, 0.36]) glow.push(box(C.steel, 15, 0.06, 0.07, { p: [0.6, G + 0.1, TRACK_Z + z] }));
  for (let i = 0; i < 24; i++) glow.push(box("#6b4a35", 0.16, 0.03, 1.0, { p: [-6.6 + i * 0.62, G + 0.055, TRACK_Z] }));
  return { flat, glow };
}

/* ---------------- the courses, as a stack of books ---------------- */

/** Spine titles are short forms of the five courses in the profile; `lines` splits the long one. */
type BookSpec = { lines: string[]; color: string; ink: string; len: number; t: number; d: number; dx: number; ry: number };
const BOOKS: BookSpec[] = [
  { lines: ["DISTRIBUTED", "SYSTEMS"], color: C.cobalt, ink: C.cream, len: 2.9, t: 0.74, d: 1.7, dx: 0, ry: 0.02 },
  { lines: ["ALGORITHMS"], color: C.coral, ink: C.cream, len: 2.75, t: 0.38, d: 1.55, dx: -0.12, ry: -0.06 },
  { lines: ["DATABASES"], color: C.sun, ink: C.ink, len: 2.6, t: 0.38, d: 1.5, dx: 0.14, ry: 0.05 },
  { lines: ["OOD"], color: C.teal, ink: C.cream, len: 2.0, t: 0.36, d: 1.4, dx: -0.06, ry: -0.04 },
  { lines: ["AI"], color: C.plum, ink: C.cream, len: 1.75, t: 0.36, d: 1.3, dx: 0.1, ry: 0.09 },
];
const BOOKS_AT: V3 = [-4.0, G, 0.35];
const BOOKS_RY = 0.1;

/** Where each book sits: its centre height and transform within the stack. */
const STACK = (() => {
  let y = 0;
  return BOOKS.map((b) => {
    const c = y + b.t / 2;
    y += b.t;
    return { ...b, y: c };
  });
})();

// colours as THREE.Color up front, so the per-frame writes below parse nothing
const COVER_COLORS = BOOKS.map((b) => new THREE.Color(b.color));
const PAGE_CREAM = new THREE.Color(C.cream);
const SPINE_GOLD = new THREE.Color(C.gold);
const RIBBON_RED = new THREE.Color(C.red);
const BANDS: [number, number][] = [
  [1, -1],
  [2, 1],
];

/** Where book i is, `s` seconds after the stack was clicked: each slides out, hops, and goes back. */
const SHUF = { x: 0, y: 0, ry: 0 };
function shuffle(i: number, s: number) {
  const a = s - i * 0.12;
  const h = hump(a, 0.75);
  const side = i % 2 ? -1 : 1;
  // one scratch object, read straight away by the caller: nothing allocated per frame
  SHUF.x = side * h * 0.85;
  SHUF.y = h * (0.25 + i * 0.12);
  SHUF.ry = side * h * 0.5;
  return SHUF;
}

/**
 * The five courses as books, as two instanced draws: the coloured covers (outlined) and the
 * cream page blocks with their gold spine bands. Click the stack and they shuffle.
 */
function Books() {
  const [kick, fire] = useKick();
  const spines = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    const s = since(kick);
    STACK.forEach((b, i) => {
      const g = spines.current[i];
      if (!g) return;
      const m = shuffle(i, s);
      g.position.set(b.dx + m.x, b.y + m.y, 0);
      g.rotation.y = b.ry + m.ry;
    });
  });
  return (
    <group position={BOOKS_AT} rotation={[0, BOOKS_RY, 0]}>
      <Tappable
        onTap={() => {
          fire();
          sfx.flutter();
          [523, 587, 659, 784, 880].forEach((f, i) => setTimeout(() => chime(f), i * 120));
        }}
        hintAt={[0, STACK[STACK.length - 1].y + 1.0, 0]}
        hintScale={HINT / SCALE}
      >
        <Moving
          count={STACK.length}
          castShadow
          thickness={1.8}
          margin={1.5}
          onFrame={(put) => {
            const s = since(kick);
            STACK.forEach((b, i) => {
              const m = shuffle(i, s);
              put(i, b.dx + m.x, b.y + m.y, 0, b.len, b.t, b.d, 0, b.ry + m.ry, 0);
              put.color(i, COVER_COLORS[i]);
            });
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
        </Moving>
        <Moving
          count={STACK.length * 3 + 1}
          outline={false}
          margin={1.5}
          onFrame={(put) => {
            const s = since(kick);
            STACK.forEach((b, i) => {
              const m = shuffle(i, s);
              const ry = b.ry + m.ry;
              const c = Math.cos(ry);
              const sn = Math.sin(ry);
              const x = b.dx + m.x;
              const y = b.y + m.y;
              // the page block shows at both ends, between the covers
              put(i * 3, x - 0.04 * sn, y, -0.04 * c, b.len + 0.02, b.t - 0.12, b.d - 0.14, 0, ry, 0);
              put.color(i * 3, PAGE_CREAM);
              // two gold bands on the spine
              for (const [k, e] of BANDS) {
                const lx = e * (b.len / 2 - 0.22);
                const lz = b.d / 2 + 0.006;
                put(i * 3 + k, x + lx * c + lz * sn, y, -lx * sn + lz * c, 0.05, b.t - 0.14, 0.02, 0, ry, 0);
                put.color(i * 3 + k, SPINE_GOLD);
              }
            });
            // a bookmark ribbon hanging out of the algorithms book
            const al = STACK[1];
            const m = shuffle(1, s);
            const ry = al.ry + m.ry;
            const lx = -al.len / 2 - 0.01;
            put(STACK.length * 3, al.dx + m.x + lx * Math.cos(ry) + 0.3 * Math.sin(ry), al.y + m.y - 0.14, -lx * Math.sin(ry) + 0.3 * Math.cos(ry), 0.02, 0.4, 0.1, 0.1, ry, 0);
            put.color(STACK.length * 3, RIBBON_RED);
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
        </Moving>
      </Tappable>
      {/* the course titles, one per spine, riding with their books */}
      {STACK.map((b, i) => (
        <group
          key={b.lines[0]}
          ref={(g) => {
            spines.current[i] = g;
          }}
          position={[b.dx, b.y, 0]}
          rotation={[0, b.ry, 0]}
        >
          {b.lines.map((line, j) => (
            <Label key={line} size={0.25} color={b.ink} position={[0, (b.lines.length - 1) * 0.15 - j * 0.3, b.d / 2 + 0.02]}>
              {line}
            </Label>
          ))}
        </group>
      ))}
      <PopText kick={kick} text="SHUFFLE" position={[0, STACK[STACK.length - 1].y + 1.1, 0.6]} size={0.36} />
    </group>
  );
}

/* ---------------- the awards, on an honour board ---------------- */

const BOARD_AT: V3 = [5.1, G, -1.0];
const BOARD_RY = -0.42;
const ROWS = [2.42, 1.55];
const HEADER_Y = 3.27;

function boardParts(): Part[] {
  const out: Part[] = [
    box(C.bark, 0.14, 3.65, 0.14, { p: [-1.85, 1.82, -0.08] }),
    box(C.bark, 0.14, 3.65, 0.14, { p: [1.85, 1.82, -0.08] }),
    box(C.cream, 3.9, 2.7, 0.1, { p: [0, 2.3, 0] }),
    box(C.brickDark, 3.9, 0.62, 0.14, { p: [0, HEADER_Y, 0.01] }),
    box(C.bark, 4.1, 0.14, 0.16, { p: [0, 3.65, 0] }),
    box(C.bark, 4.1, 0.14, 0.16, { p: [0, 0.95, 0] }),
  ];
  for (const y of ROWS) out.push(cyl(C.gold, 0.05, 0.05, 0.16, 8, { p: [-1.4, y + 0.3, 0.1], r: [Math.PI / 2, 0, 0] }));
  return move(out, BOARD_AT, BOARD_RY);
}

/** A medal swinging gently on its peg. */
function Medal({ y, ribbon, phase }: { y: number; ribbon: string; phase: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.4 + phase) * 0.12;
  });
  return (
    <group ref={ref} position={[-1.4, y + 0.3, 0.12]}>
      <mesh position={[-0.07, -0.2, 0]} rotation={[0, 0, 0.18]}>
        <boxGeometry args={[0.13, 0.42, 0.02]} />
        <meshBasicMaterial color={ribbon} />
      </mesh>
      <mesh position={[0.07, -0.2, 0.005]} rotation={[0, 0, -0.18]}>
        <boxGeometry args={[0.13, 0.42, 0.02]} />
        <meshBasicMaterial color={ribbon} />
      </mesh>
      <mesh position={[0, -0.52, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.08, 20]} />
        <Toon color={C.gold} thickness={1.6} />
      </mesh>
    </group>
  );
}

/* ---------------- the husky ---------------- */

const FUR = "#7f8ba3";
const FUR_DARK = "#5f6a82";
const HUSKY_AT: V3 = [-0.75, G, -3.05];
const HUSKY_RY = 0.3;
const HEAD_AT: V3 = [0, 1.4, 0.18];
const TAIL_AT: V3 = [0, 0.48, -0.48];
const TAIL_R = 0.32;

const HUSKY_BODY: Part[] = [
  sphere(FUR, 0.42, { p: [-0.3, 0.38, -0.12], s: [1, 0.85, 1.15] }),
  sphere(FUR, 0.42, { p: [0.3, 0.38, -0.12], s: [1, 0.85, 1.15] }),
  sphere(FUR_DARK, 0.5, { p: [0, 0.8, -0.04], r: [-0.2, 0, 0], s: [0.92, 1.2, 0.82] }),
  sphere(C.white, 0.36, { p: [0, 0.8, 0.27], s: [1, 1.25, 0.7] }),
  cyl(C.white, 0.1, 0.1, 0.72, 10, { p: [-0.19, 0.36, 0.34] }),
  cyl(C.white, 0.1, 0.1, 0.72, 10, { p: [0.19, 0.36, 0.34] }),
  sphere(C.white, 0.14, { p: [-0.19, 0.07, 0.42], s: [1, 0.6, 1.3] }),
  sphere(C.white, 0.14, { p: [0.19, 0.07, 0.42], s: [1, 0.6, 1.3] }),
  sphere(C.white, 0.14, { p: [-0.42, 0.07, 0.2], s: [1, 0.6, 1.4] }),
  sphere(C.white, 0.14, { p: [0.42, 0.07, 0.2], s: [1, 0.6, 1.4] }),
  // a red collar with a gold tag
  torus(C.red, 0.27, 0.05, Math.PI * 2, { p: [0, 1.16, 0.1], r: [Math.PI / 2 - 0.35, 0, 0] }),
  sphere(C.gold, 0.06, { p: [0, 1.04, 0.37] }),
];

const HUSKY_HEAD: Part[] = [
  sphere(FUR_DARK, 0.36, { s: [1.05, 0.95, 1] }),
  sphere(C.white, 0.3, { p: [0, -0.08, 0.13], s: [1, 0.8, 0.85] }),
  sphere(C.white, 0.17, { p: [0, -0.14, 0.33], s: [1, 0.8, 1.4] }),
  sphere(C.ink, 0.065, { p: [0, -0.08, 0.56] }),
  box(C.rose, 0.12, 0.14, 0.04, { p: [0, -0.3, 0.42], r: [0.3, 0, 0] }),
  cone(FUR_DARK, 0.14, 0.34, 6, { p: [-0.2, 0.36, -0.02], r: [0, 0, 0.25] }),
  cone(FUR_DARK, 0.14, 0.34, 6, { p: [0.2, 0.36, -0.02], r: [0, 0, -0.25] }),
  cone("#ffb3c7", 0.075, 0.2, 6, { p: [-0.19, 0.33, 0.05], r: [0, 0, 0.25] }),
  cone("#ffb3c7", 0.075, 0.2, 6, { p: [0.19, 0.33, 0.05], r: [0, 0, -0.25] }),
  // blue eyes and the white brow spots huskies have
  sphere("#58b7ff", 0.06, { p: [-0.13, 0.03, 0.3] }),
  sphere("#58b7ff", 0.06, { p: [0.13, 0.03, 0.3] }),
  sphere(C.ink, 0.032, { p: [-0.13, 0.03, 0.355] }),
  sphere(C.ink, 0.032, { p: [0.13, 0.03, 0.355] }),
  sphere(C.white, 0.05, { p: [-0.12, 0.16, 0.29] }),
  sphere(C.white, 0.05, { p: [0.12, 0.16, 0.29] }),
];

// a curled tail: starts at the rump, sweeps back and up, curls over towards the head
const HUSKY_TAIL: Part[] = [
  torus(FUR, TAIL_R, 0.11, Math.PI * 1.25, { p: [0, TAIL_R, 0], r: [0, Math.PI / 2, -Math.PI / 2] }),
  sphere(C.white, 0.12, { p: [0, TAIL_R - TAIL_R * Math.cos(Math.PI * 1.25), -TAIL_R * Math.sin(Math.PI * 1.25)] }),
];

function Husky() {
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const woof = useRef<THREE.Group>(null);
  const bark = useRef({ pending: false, start: -10 });
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (bark.current.pending) {
      bark.current.pending = false;
      bark.current.start = t;
    }
    const age = t - bark.current.start;
    const excited = age < 1.8;
    if (tail.current) tail.current.rotation.z = 0.75 + (excited ? Math.sin(t * 24) * 0.45 : Math.sin(t * 3.2) * 0.12);
    if (head.current) {
      head.current.rotation.z = Math.sin(t * 0.7) * 0.12;
      head.current.rotation.y = Math.sin(t * 0.33) * 0.2;
      head.current.rotation.x = excited ? -0.3 * Math.sin(Math.min(age / 0.3, 1) * Math.PI) : 0;
    }
    const w = woof.current;
    if (w) {
      w.visible = age < 1.3;
      if (w.visible) {
        const pop = age < 0.15 ? (age / 0.15) * 1.15 : age < 0.3 ? 1.15 - ((age - 0.15) / 0.15) * 0.15 : age > 1.0 ? 1 - (age - 1.0) / 0.3 : 1;
        w.scale.setScalar(Math.max(pop, 0.001));
        w.position.y = 2.35 + age * 0.35;
      }
    }
  });
  return (
    <group position={HUSKY_AT} rotation={[0, HUSKY_RY, 0]}>
      <group ref={head} position={HEAD_AT}>
        <Baked parts={HUSKY_HEAD} castShadow thickness={1.8} />
      </group>
      <group ref={tail} position={TAIL_AT}>
        <Baked parts={HUSKY_TAIL} thickness={1.8} />
      </group>
      <group ref={woof} position={[0.2, 2.35, 0.3]} visible={false}>
        <Label size={0.42} color={C.ink} outline={C.cream}>
          WOOF
        </Label>
      </group>
      <Tappable
        onTap={() => {
          bark.current.pending = true;
          chime(660);
          setTimeout(() => chime(520), 130);
          findEgg("husky");
        }}
        hintAt={[0, 2.35, 0.2]}
        hintScale={HINT / SCALE}
      >
        <mesh position={[0, 0.95, 0]} visible={false}>
          <boxGeometry args={[1.3, 1.9, 1.5]} />
          <meshBasicMaterial />
        </mesh>
      </Tappable>
    </group>
  );
}

/* ---------------- the trolley ---------------- */

const TROLLEY_BODY: Part[] = [
  box(C.ink, 0.9, 0.24, 0.84, { p: [-1.15, 0.12, 0] }),
  box(C.ink, 0.9, 0.24, 0.84, { p: [1.15, 0.12, 0] }),
  box(C.trolley, 3.6, 1.15, 1.1, { p: [0, 0.83, 0] }),
  box(C.cream, 3.64, 0.48, 1.14, { p: [0, 1.06, 0] }),
  box(C.cream, 3.4, 0.16, 1.0, { p: [0, 1.48, 0] }),
  box(C.trolley, 3.0, 0.1, 0.8, { p: [0, 1.6, 0] }),
];
const TROLLEY_GLOW: Part[] = (() => {
  const out: Part[] = [];
  for (const z of [-0.58, 0.58]) for (let i = 0; i < 5; i++) out.push(box(C.glass, 0.46, 0.34, 0.02, { p: [-1.2 + i * 0.6, 1.06, z] }));
  for (const x of [-1.83, 1.83]) {
    out.push(box(C.glass, 0.02, 0.36, 0.8, { p: [x, 1.06, 0] }));
    out.push(box(C.sun, 0.02, 0.14, 0.14, { p: [x, 0.55, 0.32] }), box(C.sun, 0.02, 0.14, 0.14, { p: [x, 0.55, -0.32] }));
    out.push(box(C.ink, 0.02, 0.16, 0.6, { p: [x * 0.99, 1.38, 0] }));
  }
  // the pantograph reaching up to the wire
  out.push(
    box(C.ink, 0.05, 0.6, 0.05, { p: [-0.12, 1.92, 0], r: [0, 0, 0.55] }),
    box(C.ink, 0.05, 0.6, 0.05, { p: [-0.12, 2.36, 0], r: [0, 0, -0.55] }),
    box(C.ink, 0.7, 0.04, 0.34, { p: [0, 2.62, 0] }),
  );
  return out;
})();

function Trolley() {
  const body = useRef<THREE.Group>(null);
  const [kick, fire] = useKick();
  const jolt = useRef({ pending: false, start: -10 });
  useFrame(({ clock }) => {
    if (jolt.current.pending) {
      jolt.current.pending = false;
      jolt.current.start = clock.elapsedTime;
    }
    const age = clock.elapsedTime - jolt.current.start;
    if (body.current) body.current.position.y = age < 0.5 ? Math.sin((age / 0.5) * Math.PI) * 0.12 : 0;
  });
  return (
    // runs the right half of the street only: the traveler stands on the left end of it (STAND), so it pulls up short of them
    <Shuttle from={0.8} to={4.2} speed={0.8} y={G + 0.14} z={TRACK_Z}>
      <Tappable
        onTap={() => {
          jolt.current.pending = true;
          fire();
          chime(1180);
          setTimeout(() => chime(1180), 160);
          findEgg("trolley");
        }}
        hintAt={[0.4, 2.15, 0.7]}
        hintScale={HINT / SCALE}
      >
        <group ref={body}>
          <Baked parts={TROLLEY_BODY} castShadow />
          <Baked parts={TROLLEY_GLOW} look="glow" />
        </group>
      </Tappable>
      <PopText kick={kick} text="DING DING" position={[0, 3.0, 0.7]} size={0.38} />
    </Shuttle>
  );
}

/* ---------------- the degree, still in the air ---------------- */

const CAP_AT: V3 = [-2.2, 6.6, -2.45];

function DraftCap() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime;
    g.rotation.set(0.3 + Math.sin(t * 0.9) * 0.08, 0.5 + t * 0.35, Math.sin(t * 0.7) * 0.1);
  });
  return (
    <group ref={ref} scale={1.3}>
      <Mortarboard draft />
    </group>
  );
}

/* ---------------- the diorama ---------------- */

const MAPLES = [
  { p: [-4.4, G, -5.5] as V3, s: 1.25 },
  { p: [5.5, G, -5.0] as V3, s: 1.3 },
  { p: [6.4, G, 3.1] as V3, s: 0.9 },
  { p: [-4.6, G, -1.0] as V3, s: 0.95 },
];

const neu = education.schools.find((s) => s.id === "neu")!;

export function Northeastern() {
  const parts = useMemo(() => {
    const hall = hallParts();
    const ground = groundParts();
    return {
      main: [...hall.body, ...boardParts(), ...move(HUSKY_BODY, HUSKY_AT, HUSKY_RY)],
      flat: ground.flat,
      glow: [...hall.glow, ...ground.glow],
    };
  }, []);
  const awards = [
    { text: "SCHOLARSHIP", ribbon: C.red },
    { text: "IMPACT AWARD", ribbon: C.ink },
  ];
  // the end year, from the profile: the degree is still in progress
  const endYear = neu.end.split(" ").pop() ?? "";

  return (
    <group>
      <Islet r={11} top={C.grass} />
      <group position={SHIFT} scale={SCALE}>
        <Baked parts={parts.main} castShadow />
        <Baked parts={parts.flat} look="flat" />
        <Baked parts={parts.glow} look="glow" />
        <Hands tz={places.boston.tz} r={CLOCK_R} position={[HALL_AT[0] + CUPOLA_CLOCK[0], HALL_AT[1] + CUPOLA_CLOCK[1], HALL_AT[2] + CUPOLA_CLOCK[2]]} />
        {/* the university's name, big, on the frieze, and the city, small, in the pediment under the clock */}
        <Label size={0.3} color={C.cream} position={[HALL_AT[0], HALL_AT[1] + FRIEZE_Y, HALL_AT[2] + HALL.d / 2 + 0.85]}>
          {neu.school.toUpperCase()}
        </Label>
        <Label size={0.22} position={[HALL_AT[0], HALL_AT[1] + FRIEZE_Y + 0.52, HALL_AT[2] + HALL.d / 2 + 0.84]}>
          {places.boston.city.toUpperCase()}
        </Label>
        <Maples at={MAPLES} />
        <FallingLeaves count={22} area={[13, 5, 10]} />

        <Books />

        {/* the awards */}
        <group position={BOARD_AT} rotation={[0, BOARD_RY, 0]}>
          <Label size={0.3} color={C.cream} position={[0, HEADER_Y, 0.1]}>
            {neu.gpa.toUpperCase()}
          </Label>
          {awards.map((a, i) => (
            <group key={a.text}>
              <Medal y={ROWS[i]} ribbon={a.ribbon} phase={i * 1.7} />
              <Label size={0.25} anchorX="left" position={[-0.85, ROWS[i], 0.07]}>
                {a.text}
              </Label>
            </group>
          ))}
        </group>

        {/* the degree: a cap thrown up that has not come down yet. Dashed until May 2027 */}
        <Bob position={CAP_AT} amp={0.18} speed={1.1}>
          <DraftCap />
          <Label size={0.42} position={[0, -1.0, 0.3]} outline={C.cream}>
            {endYear}
          </Label>
        </Bob>

        <Husky />
        <Trolley />
      </group>
    </group>
  );
}
