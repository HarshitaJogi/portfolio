"use client";

import { Outlines } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { education, places } from "@/content/profile";
import { C } from "../../palette";
import { Label, chime, useHoverCursor } from "../../bits";
import { findEgg } from "../../eggs";
import { Islet } from "../../props/basics";
import { Baked, Hands, bake, box, capsule, clockFace, cone, cyl, move, sphere, toonRamp, torus, tube, type Part, type V3 } from "./kit";

/**
 * University of Mumbai, B.E. in Electronics, 2020 to 2024, GPA 9.04/10.
 * The campus stands on a circuit board: a Gothic clock tower on Mumbai time at the back,
 * an oscilloscope tracing a sine wave, a blinking breadboard, the GPA on a seven-segment
 * display, resistors whose colour bands read the years, and caps thrown in the air.
 */

const G = 0.14; // sand
const BT = 0.38; // top of the board
const PCB_EDGE = { x0: -4.8, x1: 5.8, z0: -4.3, z1: 4.4 };
/** The whole campus is drawn a little larger than life and pushed forward, to fill the shot. */
const SCALE = 1.15;
const SHIFT: V3 = [-0.7, -0.02, 0.6];

const STONE = C.stone;
const STONE_2 = "#e6d6b4";
const STONE_LIGHT = "#f3e6c8";
const SILVER = C.silver;
const SOLDER = "#cfd6de";
const BODY_INK = "#23232b";

/* ---------------- the tower and its wing (in the spirit of the Fort campus) ---------------- */

/** A pointed (lancet) opening: a slot topped with a diamond, flat on a wall facing +z. */
function lancet(x: number, y: number, z: number, w: number, h: number, color = C.ink, ry = 0): Part[] {
  return move(
    [
      box(color, w, h, 0.02, { p: [0, 0, 0] }),
      box(color, w * 0.71, w * 0.71, 0.02, {
        p: [0, h / 2, 0],
        r: [0, 0, Math.PI / 4],
      }),
    ],
    [x, y, z],
    ry,
  );
}

const TOWER_AT: V3 = [0.8, G, -6.9];
const CLOCK_Y = 3.3;
const CLOCK_R = 0.6;

function towerParts() {
  const body: Part[] = [
    box(STONE_LIGHT, 3.0, 0.25, 3.0, { p: [0, 0.125, 0] }),
    box(STONE, 2.4, 2.0, 2.4, { p: [0, 1.25, 0] }),
    box(STONE_LIGHT, 2.62, 0.16, 2.62, { p: [0, 2.33, 0] }),
    box(STONE_2, 2.0, 1.75, 2.0, { p: [0, 3.285, 0] }),
    box(STONE_LIGHT, 2.2, 0.14, 2.2, { p: [0, 4.23, 0] }),
    cyl(STONE, 0.82, 0.82, 0.85, 8, { p: [0, 4.725, 0] }),
    cyl(STONE_LIGHT, 0.94, 0.94, 0.1, 8, { p: [0, 5.2, 0] }),
    cone(C.brickDark, 0.9, 1.25, 8, { p: [0, 5.875, 0] }),
    cyl(C.gold, 0.03, 0.03, 0.3, 6, { p: [0, 6.6, 0] }),
    sphere(C.gold, 0.09, { p: [0, 6.62, 0] }),
  ];
  for (const [y, half] of [
    [2.41, 1.2],
    [4.3, 1.0],
  ])
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        body.push(
          cone(STONE_LIGHT, 0.13, 0.55, 6, {
            p: [sx * half, y + 0.27, sz * half],
          }),
        );
  // the wing: a low Gothic hall with lancet windows and a tiled roof
  const wing: Part[] = [
    box(STONE, 3.6, 2.0, 2.0, { p: [0, 1.0, 0] }),
    box(STONE_LIGHT, 3.8, 0.14, 2.2, { p: [0, 2.05, 0] }),
    // roof: a prism turned to run along x
    {
      k: "prism",
      a: [2.2, 0.85, 3.8],
      m: new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(0, 2.12, 0),
      c: C.brickDark,
    },
    cone(STONE_LIGHT, 0.12, 0.5, 6, { p: [-1.8, 2.37, 1.0] }),
    cone(STONE_LIGHT, 0.12, 0.5, 6, { p: [1.8, 2.37, 1.0] }),
  ];
  const marks: Part[] = [
    ...lancet(0, 0.72, 1.211, 0.62, 0.9),
    ...lancet(-1.011, 3.0, 0, 0.32, 0.8, C.ink, -Math.PI / 2),
    ...lancet(0, 4.6, 0.82, 0.24, 0.4),
    ...lancet(-0.58, 4.6, 0.58, 0.2, 0.36, C.ink, -Math.PI / 4),
    ...lancet(0.58, 4.6, 0.58, 0.2, 0.36, C.ink, Math.PI / 4),
    ...move([...lancet(-1.1, 1.0, 1.01, 0.36, 0.9), ...lancet(0, 1.0, 1.01, 0.36, 0.9), ...lancet(1.1, 1.0, 1.01, 0.36, 0.9)], [3.3, 0, -0.3]),
  ];
  const clock = clockFace([0, CLOCK_Y, 1.06], CLOCK_R);
  return {
    body: move([...body, ...move(wing, [3.3, 0, -0.3]), ...clock.body], TOWER_AT),
    marks: move([...marks, ...clock.marks], TOWER_AT),
  };
}

/* ---------------- palms ---------------- */

function palmTrunk(h: number): Part[] {
  const n = 6;
  return Array.from({ length: n }, (_, i) =>
    cyl(i % 2 ? C.bark : "#a0714c", 0.16 - i * 0.012, 0.2 - i * 0.012, h / n + 0.02, 8, { p: [Math.sin(i * 0.5) * 0.04, (i + 0.5) * (h / n), 0] }),
  );
}

const FROND_PARTS: Part[] = (() => {
  const out: Part[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    out.push(...move([sphere(i % 2 ? C.palm : C.leaf, 1, { p: [0.95, -0.28, 0], r: [0, 0, -0.42], s: [1.05, 0.07, 0.3] }, 8, 5)], [0, 0, 0], a));
  }
  out.push(sphere(C.bark, 0.2, { p: [0, -0.12, 0] }));
  for (let i = 0; i < 3; i++)
    out.push(
      sphere("#7a4a2a", 0.13, {
        p: [Math.cos(i * 2.1) * 0.2, -0.3, Math.sin(i * 2.1) * 0.2],
      }),
    );
  return out;
})();

const PALMS = [
  { p: [-3.0, G, -6.3] as V3, h: 4.4, lean: 0.16, phase: 0 },
  { p: [5.7, G, -5.3] as V3, h: 3.7, lean: -0.18, phase: 2 },
];

function palmTop(p: V3, h: number, lean: number): V3 {
  return [p[0] - Math.sin(lean) * h, p[1] + Math.cos(lean) * h, p[2]];
}

function Crown({ at, phase }: { at: V3; phase: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 1.3 + phase;
    ref.current.rotation.z = Math.sin(t) * 0.06;
    ref.current.rotation.x = Math.sin(t * 0.7) * 0.04;
  });
  return (
    <group ref={ref} position={at}>
      <Baked parts={FROND_PARTS} castShadow thickness={1.6} />
    </group>
  );
}

/* ---------------- the board and its components ---------------- */

/** A copper trace along a path on the board, with round pads at both ends. */
function trace(pts: [number, number][], w = 0.13): Part[] {
  const out: Part[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const len = Math.hypot(x1 - x0, z1 - z0);
    out.push(
      box(C.copper, len + w, 0.02, w, {
        p: [(x0 + x1) / 2, BT + 0.01, (z0 + z1) / 2],
        r: [0, -Math.atan2(z1 - z0, x1 - x0), 0],
      }),
    );
  }
  for (const [x, z] of [pts[0], pts[pts.length - 1]]) out.push(cyl(C.copper, 0.17, 0.17, 0.03, 14, { p: [x, BT + 0.015, z] }));
  return out;
}

function via(x: number, z: number): Part[] {
  return [cyl(C.copper, 0.13, 0.13, 0.03, 12, { p: [x, BT + 0.015, z] }), cyl(C.ink, 0.05, 0.05, 0.035, 8, { p: [x, BT + 0.018, z] })];
}

const SCOPE_AT: V3 = [-2.7, BT, -2.9];
const SCOPE_RY = 0.14;
const SCOPE = { w: 2.4, h: 1.7, d: 1.5 };
const SCREEN: V3 = [-0.42, 0.08 + SCOPE.h / 2 + 0.06, SCOPE.d / 2 + 0.1];

function scopeParts() {
  const { w, h, d } = SCOPE;
  const y0 = 0.08;
  const body: Part[] = [
    box(C.cream, w, h, d, { p: [0, y0 + h / 2, 0] }),
    box(C.teal, w - 0.18, h - 0.18, 0.06, { p: [0, y0 + h / 2, d / 2 + 0.02] }),
    box(C.ink, 1.38, 1.02, 0.05, { p: [SCREEN[0], SCREEN[1], d / 2 + 0.05] }),
    // knobs, big and small, and two probe sockets
    cyl(C.cream, 0.15, 0.15, 0.12, 14, {
      p: [0.68, y0 + 1.28, d / 2 + 0.1],
      r: [Math.PI / 2, 0, 0],
    }),
    cyl(C.coral, 0.15, 0.15, 0.12, 14, {
      p: [0.68, y0 + 0.86, d / 2 + 0.1],
      r: [Math.PI / 2, 0, 0],
    }),
    cyl(C.sun, 0.08, 0.08, 0.1, 10, {
      p: [0.36, y0 + 1.28, d / 2 + 0.09],
      r: [Math.PI / 2, 0, 0],
    }),
    cyl(C.cream, 0.08, 0.08, 0.1, 10, {
      p: [0.36, y0 + 0.86, d / 2 + 0.09],
      r: [Math.PI / 2, 0, 0],
    }),
    cyl(SILVER, 0.08, 0.08, 0.14, 10, {
      p: [0.4, y0 + 0.36, d / 2 + 0.1],
      r: [Math.PI / 2, 0, 0],
    }),
    cyl(SILVER, 0.08, 0.08, 0.14, 10, {
      p: [0.8, y0 + 0.36, d / 2 + 0.1],
      r: [Math.PI / 2, 0, 0],
    }),
    // carry handle
    box(C.ink, 0.1, 0.28, 0.12, { p: [-0.85, y0 + h + 0.12, 0.1] }),
    box(C.ink, 0.1, 0.28, 0.12, { p: [0.85, y0 + h + 0.12, 0.1] }),
    box(C.ink, 1.8, 0.1, 0.14, { p: [0, y0 + h + 0.28, 0.1] }),
  ];
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      body.push(
        box(C.ink, 0.22, 0.08, 0.22, {
          p: [sx * (w / 2 - 0.2), 0.04, sz * (d / 2 - 0.2)],
        }),
      );
  // the screen and its graticule
  const glow: Part[] = [
    box("#0f2a20", 1.22, 0.88, 0.02, {
      p: [SCREEN[0], SCREEN[1], d / 2 + 0.08],
    }),
  ];
  for (let i = 0; i <= 4; i++)
    glow.push(
      box("#2d6b4b", 0.012, 0.84, 0.01, {
        p: [SCREEN[0] - 0.56 + i * 0.28, SCREEN[1], d / 2 + 0.09],
      }),
    );
  for (let i = 0; i <= 2; i++)
    glow.push(
      box("#2d6b4b", 1.16, 0.012, 0.01, {
        p: [SCREEN[0], SCREEN[1] - 0.38 + i * 0.38, d / 2 + 0.09],
      }),
    );
  return {
    body: move(body, SCOPE_AT, SCOPE_RY),
    glow: move(glow, SCOPE_AT, SCOPE_RY),
  };
}

const BB_AT: V3 = [0.3, BT, -0.3];
const LED_X = [-1.0, -0.5, 0, 0.5, 1.0];
const LED_COLORS = [C.red, C.sun, C.green, C.cobalt, C.coral];

function breadboardParts() {
  const body: Part[] = [box(C.cream, 3.0, 0.3, 1.6, { p: [0, 0.15, 0] })];
  const glow: Part[] = [
    box("#b9b2a4", 2.9, 0.01, 0.12, { p: [0, 0.305, 0] }),
    box(C.red, 2.8, 0.01, 0.03, { p: [0, 0.305, -0.62] }),
    box(C.cobalt, 2.8, 0.01, 0.03, { p: [0, 0.305, 0.62] }),
  ];
  for (let c = 0; c < 18; c++) {
    const x = -1.27 + c * 0.15;
    for (const z of [-0.5, -0.35, -0.2, 0.2, 0.35, 0.5]) glow.push(box("#5d574e", 0.055, 0.01, 0.055, { p: [x, 0.306, z] }));
    if (c % 3 !== 2) for (const z of [-0.72, 0.72]) glow.push(box("#5d574e", 0.055, 0.01, 0.055, { p: [x, 0.306, z] }));
  }
  // a little 8-pin timer chip across the channel: the classic LED blinker
  body.push(box(BODY_INK, 0.5, 0.16, 0.36, { p: [-0.25, 0.4, 0] }));
  for (let i = 0; i < 4; i++) for (const z of [-0.2, 0.2]) body.push(box(SILVER, 0.05, 0.1, 0.06, { p: [-0.4 + i * 0.1, 0.33, z] }));
  // LED legs and their resistors
  for (const x of LED_X) {
    body.push(box(SILVER, 0.03, 0.16, 0.03, { p: [x - 0.04, 0.38, 0.35] }), box(SILVER, 0.03, 0.16, 0.03, { p: [x + 0.04, 0.38, 0.35] }));
    body.push(
      capsule("#e8c590", 0.045, 0.14, {
        p: [x + 0.08, 0.36, 0.08],
        r: [Math.PI / 2, 0, 0],
      }),
    );
  }
  // jumper wires
  body.push(
    tube(
      C.red,
      [
        [-1.27, 0.3, -0.72],
        [-1.15, 0.55, -0.6],
        [-0.85, 0.55, -0.35],
        [-0.7, 0.3, -0.2],
      ],
      0.035,
    ),
    tube(
      C.cobalt,
      [
        [0.65, 0.3, -0.5],
        [0.85, 0.55, -0.45],
        [1.15, 0.55, -0.35],
        [1.25, 0.3, -0.2],
      ],
      0.035,
    ),
    tube(
      C.sun,
      [
        [-0.1, 0.3, -0.35],
        [0.05, 0.5, -0.3],
        [0.25, 0.5, -0.25],
        [0.35, 0.3, -0.2],
      ],
      0.035,
    ),
  );
  return { body: move(body, BB_AT), glow: move(glow, BB_AT) };
}

const CHIP_AT: V3 = [0.6, BT, -3.0];
function chipParts() {
  const body: Part[] = [box(BODY_INK, 2.0, 0.36, 0.92, { p: [0, 0.34, 0] })];
  for (let i = 0; i < 8; i++)
    for (const s of [-1, 1]) {
      const x = -0.84 + i * 0.24;
      body.push(box(SOLDER, 0.11, 0.06, 0.16, { p: [x, 0.36, s * 0.53] }), box(SOLDER, 0.09, 0.34, 0.06, { p: [x, 0.18, s * 0.6] }));
    }
  const glow: Part[] = [cyl("#4a4a56", 0.16, 0.16, 0.01, 12, { p: [-1.0, 0.525, 0] }, [0, Math.PI]), cyl("#8a8a96", 0.06, 0.06, 0.01, 10, { p: [-0.75, 0.525, 0.25] })];
  return { body: move(body, CHIP_AT), glow: move(glow, CHIP_AT) };
}

/** An electrolytic capacitor: can, minus stripe, scored top. */
function capacitor(p: V3, r: number, h: number, color: string, stripe: string): { body: Part[]; glow: Part[] } {
  return {
    body: move(
      [
        cyl(color, r, r, h, 18, { p: [0, h / 2, 0] }),
        cyl(stripe, r + 0.012, r + 0.012, h - 0.06, 18, { p: [0, h / 2, 0] }, [-0.4, 0.8]),
        cyl(SILVER, r * 0.94, r * 0.94, 0.04, 18, { p: [0, h + 0.01, 0] }),
      ],
      p,
    ),
    glow: move(
      [
        box("#8b93a0", r * 1.2, 0.01, 0.03, { p: [0, h + 0.035, 0] }),
        box("#8b93a0", 0.03, 0.01, r * 1.2, { p: [0, h + 0.035, 0] }),
        box(color, 0.14, 0.035, 0.01, { p: [0, h * 0.7, r + 0.02] }),
        box(color, 0.14, 0.035, 0.01, { p: [0, h * 0.45, r + 0.02] }),
      ],
      p,
    ),
  };
}

/** The resistor colour code, 0 to 9. */
const BAND = ["#1b1b1f", "#7a4a24", C.red, "#ff8c1a", C.sun, "#2fa84f", C.cobalt, C.plum, "#8d8d96", C.white];
const mu = education.schools.find((s) => s.id === "mu")!;
/** The four digits of a "Mon YYYY" date. */
const yearDigits = (d: string) => d.slice(-4).split("").map(Number);
/** "GPA 9.04/10" → the value and what it is out of. */
const [GPA_VALUE, GPA_OF] = (mu.gpa.match(/([\d.]+)\/(\d+)/) ?? ["", "0", "0"]).slice(1);
/** A resistor lying on the board. Its bands spell `digits` in the resistor colour code. */
function resistor(p: V3, digits: number[], body: string): Part[] {
  const out: Part[] = [capsule(body, 0.25, 0.95, { p: [0, 0.34, 0], r: [0, 0, Math.PI / 2] })];
  digits.forEach((d, i) =>
    out.push(
      cyl(BAND[d], 0.262, 0.262, 0.1, 16, {
        p: [-0.42 + i * 0.2, 0.34, 0],
        r: [0, 0, Math.PI / 2],
      }),
    ),
  );
  out.push(
    cyl(C.gold, 0.262, 0.262, 0.1, 16, {
      p: [0.42, 0.34, 0],
      r: [0, 0, Math.PI / 2],
    }),
  );
  for (const s of [-1, 1]) {
    out.push(
      cyl(SOLDER, 0.035, 0.035, 0.32, 6, {
        p: [s * 0.88, 0.34, 0],
        r: [0, 0, Math.PI / 2],
      }),
    );
    out.push(cyl(SOLDER, 0.035, 0.035, 0.34, 6, { p: [s * 1.03, 0.17, 0] }));
    out.push(cyl(SOLDER, 0.12, 0.17, 0.08, 10, { p: [s * 1.03, 0.04, 0] }));
  }
  return move(out, p);
}

/* ---------- the GPA, on a seven-segment display ---------- */

const DISPLAY_AT: V3 = [3.15, BT, 2.45];
const DISPLAY_RY = -0.26;
const SEG: Record<string, [number, number, boolean]> = {
  a: [0, 0.4, true],
  b: [0.22, 0.2, false],
  c: [0.22, -0.2, false],
  d: [0, -0.4, true],
  e: [-0.22, -0.2, false],
  f: [-0.22, 0.2, false],
  g: [0, 0, true],
};
const DIGIT = ["abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"];
/** The digits to show, each with its decimal point. */
const GPA_DIGITS = GPA_VALUE.split("").reduce<{ d: number; dp: boolean }[]>((out, ch) => {
  if (ch === ".") out[out.length - 1].dp = true;
  else out.push({ d: Number(ch), dp: false });
  return out;
}, []);

function displayParts() {
  const y = 1.12;
  const body: Part[] = [
    box("#1e4f8f", 3.3, 1.95, 0.1, { p: [0, y, 0] }),
    box(BODY_INK, 2.2, 1.2, 0.22, { p: [-0.35, y - 0.12, 0.14] }),
    box(BODY_INK, 0.7, 0.2, 0.24, { p: [-0.9, 0.1, 0] }),
    box(BODY_INK, 0.7, 0.2, 0.24, { p: [0.9, 0.1, 0] }),
  ];
  for (let i = 0; i < 6; i++)
    body.push(
      box(SOLDER, 0.05, 0.12, 0.05, {
        p: [-1.15 + i * 0.1 + (i > 2 ? 1.5 : 0), 0.18, 0],
      }),
    );
  for (const [x, yy] of [
    [-1.5, y + 0.82],
    [1.5, y + 0.82],
    [-1.5, y - 0.82],
    [1.5, y - 0.82],
  ])
    body.push(
      cyl(SOLDER, 0.09, 0.09, 0.12, 10, {
        p: [x, yy, 0.02],
        r: [Math.PI / 2, 0, 0],
      }),
    );
  const glow: Part[] = [];
  const z = 0.26;
  let extra = 0;
  GPA_DIGITS.forEach(({ d, dp }, i) => {
    const cx = -1.12 + i * 0.66 + extra;
    if (dp) extra += 0.14; // a little room for the decimal point
    const cy = y - 0.12;
    for (const [id, [sx, sy, horiz]] of Object.entries(SEG)) {
      const lit = DIGIT[d].includes(id);
      const color = lit ? "#ff3b30" : "#3b1c20";
      glow.push(
        box(color, horiz ? 0.32 : 0.085, horiz ? 0.085 : 0.32, 0.02, {
          p: [cx + sx + sy * 0.12, cy + sy, z],
          r: [0, 0, horiz ? 0 : -0.12],
        }),
      );
    }
    if (dp) glow.push(box("#ff3b30", 0.13, 0.13, 0.02, { p: [cx + 0.42, cy - 0.4, z] }));
  });
  return {
    body: move(body, DISPLAY_AT, DISPLAY_RY),
    glow: move(glow, DISPLAY_AT, DISPLAY_RY),
  };
}

/* ---------------- the board itself ---------------- */

function boardParts() {
  const { x0, x1, z0, z1 } = PCB_EDGE;
  const w = x1 - x0;
  const d = z1 - z0;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const body: Part[] = [box(C.pcb, w, BT - G + 0.02, d, { p: [cx, (BT + G) / 2 - 0.01, cz] })];
  const flat: Part[] = [];
  // mounting holes in the corners
  for (const [x, z] of [
    [x0 + 0.45, z0 + 0.45],
    [x1 - 0.45, z0 + 0.45],
    [x0 + 0.45, z1 - 0.45],
    [x1 - 0.45, z1 - 0.45],
  ])
    flat.push(cyl(C.copper, 0.3, 0.3, 0.03, 18, { p: [x, BT + 0.015, z] }), cyl(C.ink, 0.17, 0.17, 0.035, 14, { p: [x, BT + 0.018, z] }));
  // gold edge fingers along the front
  for (let i = 0; i < 9; i++)
    flat.push(
      box(C.gold, 0.22, 0.03, 0.5, {
        p: [0.9 + i * 0.36, BT + 0.012, z1 - 0.3],
      }),
    );
  // traces: components wired together, with 45 degree bends like a real layout
  flat.push(
    ...trace([
      [-1.4, -2.65],
      [-0.55, -2.65],
    ]),
    ...trace([
      [0.1, -2.3],
      [0.1, -1.2],
    ]),
    ...trace([
      [1.2, -2.3],
      [1.2, -1.2],
    ]),
    ...trace([
      [1.75, -3.15],
      [2.3, -3.15],
      [2.5, -3.35],
    ]),
    ...trace([
      [1.75, -2.8],
      [2.15, -2.4],
      [5.3, -2.4],
    ]),
    ...trace([
      [1.75, -2.6],
      [1.95, -2.1],
      [5.3, -2.1],
    ]),
    ...trace([
      [1.95, -0.1],
      [2.6, -0.1],
      [3.0, 0.3],
      [3.0, 1.75],
    ]),
    ...trace([
      [-0.93, 2.9],
      [-0.93, 1.6],
      [-0.6, 1.25],
      [-0.6, 0.55],
    ]),
    ...trace([
      [1.13, 2.9],
      [1.75, 2.9],
    ]),
    ...trace([
      [-4.3, -0.9],
      [-3.7, -0.9],
      [-3.3, -1.3],
      [-3.3, -2.05],
    ]),
    ...trace([
      [-0.47, 3.75],
      [-0.1, 3.75],
      [0.25, 4.1],
    ]),
    ...via(5.3, -2.4),
    ...via(5.3, -2.1),
    ...via(-4.3, -0.9),
    ...via(-4.2, 2.0),
    ...via(-0.2, -3.85),
    ...via(0.25, 4.1),
  );
  // silkscreen: outlines round the chip and the capacitors, in white
  const silk: Part[] = [];
  const rect = (x: number, z: number, rw: number, rd: number) =>
    silk.push(
      box(C.cream, rw, 0.01, 0.04, { p: [x, BT + 0.006, z - rd / 2] }),
      box(C.cream, rw, 0.01, 0.04, { p: [x, BT + 0.006, z + rd / 2] }),
      box(C.cream, 0.04, 0.01, rd, { p: [x - rw / 2, BT + 0.006, z] }),
      box(C.cream, 0.04, 0.01, rd, { p: [x + rw / 2, BT + 0.006, z] }),
    );
  rect(CHIP_AT[0], CHIP_AT[2], 2.4, 1.5);
  rect(0.1, 2.9, 2.9, 0.8);
  silk.push(box(C.cream, 0.3, 0.01, 0.05, { p: [1.9, BT + 0.006, -3.85] }), box(C.cream, 0.05, 0.01, 0.3, { p: [1.9, BT + 0.006, -3.85] }));
  return { body, flat: [...flat], silk };
}

/* ---------------- moving parts ---------------- */

/** The oscilloscope's trace: a sine wave scrolling across the screen. */
function SineTrace() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const n = 70;
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < n; i++) {
      const x = -0.56 + (i / (n - 1)) * 1.12;
      const y = Math.sin(x * 8.4 - t * 4) * 0.27;
      const slope = Math.cos(x * 8.4 - t * 4) * 0.27 * 8.4;
      o.position.set(SCREEN[0] + x, SCREEN[1] + y, SCREEN[2]);
      o.rotation.set(0, 0, Math.atan(slope));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <group position={SCOPE_AT} rotation={[0, SCOPE_RY, 0]}>
      <instancedMesh ref={ref} args={[undefined, undefined, n]} frustumCulled={false}>
        <boxGeometry args={[0.05, 0.045, 0.01]} />
        <meshBasicMaterial color="#8dffb0" />
      </instancedMesh>
    </group>
  );
}

/** Five LEDs on the breadboard, counting up in binary. */
function Leds() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const on = useMemo(() => LED_COLORS.map((c) => new THREE.Color(c)), []);
  const off = useMemo(() => LED_COLORS.map((c) => new THREE.Color(c).multiplyScalar(0.28)), []);
  const last = useRef(-1);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    LED_X.forEach((x, i) => {
      o.position.set(x, 0.56, 0.35);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, off[i]);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [off]);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const k = Math.floor(clock.elapsedTime * 2.5) % 32;
    if (k === last.current) return;
    last.current = k;
    for (let i = 0; i < 5; i++) m.setColorAt(i, (k >> (4 - i)) & 1 ? on[i] : off[i]);
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <group position={BB_AT}>
      <instancedMesh ref={ref} args={[undefined, undefined, 5]}>
        <capsuleGeometry args={[0.12, 0.14, 3, 10]} />
        <meshBasicMaterial />
      </instancedMesh>
    </group>
  );
}

/** Graduation, 2024: caps lie in front of the tower, and every few seconds they all go up. */
const CAP_PARTS: Part[] = [
  box(C.ink, 1.1, 0.07, 1.1, { p: [0, 0.38, 0] }),
  cyl(C.ink, 0.34, 0.38, 0.32, 14, { p: [0, 0.18, 0] }),
  cyl(C.gold, 0.06, 0.06, 0.04, 8, { p: [0, 0.43, 0] }),
  box(C.gold, 0.035, 0.3, 0.035, { p: [0.5, 0.25, 0.5] }),
  box(C.gold, 0.08, 0.12, 0.08, { p: [0.5, 0.08, 0.5] }),
];
const CAP_RESTS: { p: V3; ry: number }[] = [
  { p: [-1.05, G, -5.05], ry: 0.3 },
  { p: [0.75, G, -5.15], ry: -0.4 },
  { p: [2.45, G, -4.95], ry: 0.9 },
];

function CapToss() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => bake(CAP_PARTS), []);
  const o = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    // the outline is a sibling instanced mesh sharing these matrices; neither should be culled mid-flight
    ref.current?.traverse((c) => (c.frustumCulled = false));
    return () => geo.dispose();
  }, [geo]);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const P = 6.5;
    const T = 1.75;
    CAP_RESTS.forEach((r, i) => {
      const t = (clock.elapsedTime + 4.2 - i * 0.14) % P;
      const f = t < T ? t / T : 0;
      const y = f ? 9.81 * (T / 2) * t - 4.905 * t * t : 0;
      const sway = Math.sin(f * Math.PI) * (i - 1) * 0.9;
      // at rest each cap lies tipped on its brim, the way a dropped cap does
      const tip = (1 - Math.sin(f * Math.PI)) * (i % 2 ? 0.22 : -0.22);
      o.position.set(r.p[0] + sway, r.p[1] + y + Math.abs(tip) * 0.4, r.p[2] + Math.sin(f * Math.PI) * 0.6);
      o.rotation.set(f * Math.PI * 2 * (i % 2 ? 1 : -1) + tip, r.ry + f * Math.PI * (i + 1), f * Math.PI * 0.3 * Math.sin(f * Math.PI));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, CAP_RESTS.length]} castShadow frustumCulled={false}>
      <meshToonMaterial vertexColors gradientMap={toonRamp()} />
      <Outlines thickness={1.8} color={C.ink} />
    </instancedMesh>
  );
}

/* ---------------- the chai break (an easter egg) ---------------- */

const CHAI_AT: V3 = [-3.45, BT, 3.25];
const TABLE_PARTS: Part[] = move(
  [
    cyl(C.bark, 0.62, 0.62, 0.09, 18, { p: [0, 0.8, 0] }),
    cyl(C.bark, 0.07, 0.09, 0.76, 8, { p: [0, 0.39, 0] }),
    cyl(C.bark, 0.36, 0.4, 0.05, 14, { p: [0, 0.025, 0] }),
    cyl("#c47c3e", 0.22, 0.18, 0.36, 10, { p: [0, 1.03, 0] }),
    torus("#eef7f8", 0.245, 0.03, Math.PI * 2, {
      p: [0, 1.37, 0],
      r: [Math.PI / 2, 0, 0],
    }),
  ],
  CHAI_AT,
);

function Chai() {
  const { bind } = useHoverCursor();
  const steam = useRef<THREE.InstancedMesh>(null);
  const puff = useRef({ pending: false, start: -10 });
  const o = useMemo(() => new THREE.Object3D(), []);
  const N = 10;
  useFrame(({ clock }) => {
    const m = steam.current;
    if (!m) return;
    const now = clock.elapsedTime;
    if (puff.current.pending) {
      puff.current.pending = false;
      puff.current.start = now;
    }
    const age = now - puff.current.start;
    for (let i = 0; i < N; i++) {
      if (i < 3) {
        // the idle wisp, always rising
        const t = (now * 0.45 + i / 3) % 1;
        o.position.set(Math.sin(t * 7 + i * 2) * 0.08, 1.42 + t * 0.75, 0);
        o.scale.setScalar((0.05 + 0.08 * t) * Math.sin(t * Math.PI));
      } else {
        const a = ((i - 3) / (N - 3)) * Math.PI * 2;
        const f = Math.min(age / 1.6, 1);
        const s = f < 1 ? Math.sin(f * Math.PI) * (0.22 + 0.06 * (i % 3)) : 0;
        o.position.set(Math.cos(a) * f * 0.5, 1.5 + f * 1.5 + (i % 2) * 0.2, Math.sin(a) * f * 0.3);
        o.scale.setScalar(s);
      }
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <Baked parts={TABLE_PARTS} castShadow thickness={1.8} />
      <group position={CHAI_AT}>
        {/* the glass: see-through, so the chai shows inside it */}
        <mesh position={[0, 1.11, 0]}>
          <cylinderGeometry args={[0.245, 0.19, 0.53, 10]} />
          <meshToonMaterial color="#e8f6f8" gradientMap={toonRamp()} transparent opacity={0.45} depthWrite={false} />
        </mesh>
        <instancedMesh ref={steam} args={[undefined, undefined, N]} frustumCulled={false}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color={C.white} transparent opacity={0.7} depthWrite={false} />
        </instancedMesh>
        {/* a generous invisible hit area round the table and glass */}
        <mesh
          position={[0, 0.85, 0]}
          onClick={(e) => {
            e.stopPropagation();
            puff.current.pending = true;
            chime(988);
            setTimeout(() => chime(1318), 140);
            findEgg("chai");
          }}
          {...bind}
        >
          <cylinderGeometry args={[0.7, 0.7, 1.9, 10]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------------- the diorama ---------------- */

export function MumbaiU() {
  const parts = useMemo(() => {
    const tower = towerParts();
    const scope = scopeParts();
    const bb = breadboardParts();
    const chip = chipParts();
    const disp = displayParts();
    const board = boardParts();
    const c1 = capacitor([3.0, BT, -3.5], 0.46, 1.45, C.cobalt, "#a9c4ff");
    const c2 = capacitor([4.15, BT, -3.0], 0.36, 1.0, BODY_INK, "#9a9aa8");
    const trunks = PALMS.flatMap((pl) => move(palmTrunk(pl.h), pl.p, [0, 0, pl.lean]));
    const scopeCable = tube(
      C.ink,
      [
        [-2.15, BT + 0.44, -2.05],
        [-2.0, BT + 0.12, -1.6],
        [-1.45, BT + 0.1, -1.05],
        [-1.0, BT + 0.35, -0.55],
        [-0.75, BT + 0.62, -0.42],
      ],
      0.05,
    );
    return {
      main: [
        ...board.body,
        ...tower.body,
        ...trunks,
        ...scope.body,
        scopeCable,
        cyl(C.coral, 0.07, 0.05, 0.25, 8, {
          p: [-0.7, BT + 0.66, -0.4],
          r: [0, 0, -0.6],
        }),
        ...bb.body,
        ...chip.body,
        ...c1.body,
        ...c2.body,
        ...disp.body,
        ...resistor([0.1, BT, 2.9], yearDigits(mu.end), "#e8c590"),
        ...resistor([-1.5, BT, 3.75], yearDigits(mu.start), "#9cc8e8"),
      ],
      flat: [...board.flat],
      glow: [...tower.marks, ...scope.glow, ...bb.glow, ...chip.glow, ...c1.glow, ...c2.glow, ...disp.glow, ...board.silk],
    };
  }, []);

  return (
    <group>
      <Islet r={11} top={C.sand} />
      <group position={SHIFT} scale={SCALE}>
        <Baked parts={parts.main} castShadow />
        <Baked parts={parts.flat} look="flat" />
        <Baked parts={parts.glow} look="glow" />
        <Hands tz={places.mumbai.tz} r={CLOCK_R} position={[TOWER_AT[0], TOWER_AT[1] + CLOCK_Y, TOWER_AT[2] + 1.06]} />
        <Label size={0.3} position={[TOWER_AT[0], TOWER_AT[1] + 1.78, TOWER_AT[2] + 1.22]}>
          MUMBAI
        </Label>
        {PALMS.map((pl) => (
          <Crown key={pl.phase} at={palmTop(pl.p, pl.h, pl.lean)} phase={pl.phase} />
        ))}
        <SineTrace />
        <Leds />
        <CapToss />
        <Chai />
        {/* silkscreen on the display's little board */}
        <group position={DISPLAY_AT} rotation={[0, DISPLAY_RY, 0]}>
          <Label size={0.3} color={C.cream} position={[-0.85, 1.88, 0.06]}>
            GPA
          </Label>
          <Label size={0.3} color={C.cream} position={[1.25, 0.82, 0.06]}>
            {`/${GPA_OF}`}
          </Label>
        </group>
      </group>
    </group>
  );
}
