"use client";

import { Line, useTexture } from "@react-three/drei";
import { RoundedBox } from "@/world/rounded";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { bitgig, media, places } from "@/content/profile";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { Label, chime, textureUrl, useHoverCursor } from "../../bits";
import { Islet } from "../../props/basics";
import { Tappable } from "../../props/tappable";
import { HINT, PopText, sfx, since, useKick } from "@/world/fx";
import { Baked, box, clockFace, cone, cyl, sphere, type Part } from "../education/kit";
import { Boxes, ClockHands, Cyls, Glows, Moon, Moving, Stars, useCheckGeometry, type V3 } from "./kit";

/*
 * Bitgig, Berkeley × DeepMind Hackathon, Sep 2026: expert annotation for lab and medical
 * video. A hackathon booth at night, with the real Bitgig on its screen (click it: the
 * live demo opens). In front, the pipeline as a conveyor: film frames come off the reel
 * (UPLOAD), get a dashed draft outline (DRAFT, the model's pre-segmentation), a verified
 * expert corrects them (CORRECT), three experts nod them through (AGREE, consensus QC),
 * and they leave solid with a green check (VERIFIED) onto the pile of training data.
 * Dashed is draft, solid is verified: the site's one rule. Pizza, because hackathon.
 * Behind it all, a campanile in the spirit of UC Berkeley's, where the hackathon was held,
 * its clock on Berkeley time. Click the tower and its bell rings a little tune.
 */

const STAGES = bitgig.stages.map((s) => s.name.toUpperCase());
const STAGE_COLORS = [C.steel, C.cobalt, C.coral, C.sun, C.green];
const BELT_Z = 4.6;
const BELT_TOP = 0.95;
const X0 = -4.6;
const SW = 1.84; // width of a station
const sx = (i: number) => X0 + SW * (i + 0.5);
const stageAt = (x: number) => Math.min(Math.max(Math.floor((x - X0) / SW), 0), 4);
const FRAMES = 5;
const TRAVEL = 12.5; // seconds from one end of the belt to the other
const xAt = (t: number, i: number) => -5.3 + ((t / TRAVEL + i / FRAMES) % 1) * 10.6;
const PEOPLE_X = [sx(2), sx(3) - 0.55, sx(3), sx(3) + 0.55];
const FW = 1.2;
const FH = 0.86;

function Booth() {
  const tex = useTexture(textureUrl(media.bitgig.src, 828), (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });
  const { bind } = useHoverCursor();
  const open = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    window.open(bitgig.live, "_blank", "noopener");
  };
  const parts = useMemo<Instance[]>(
    () => [
      // striped awning
      ...Array.from({ length: 7 }, (_, i) => ({ p: [-2.1 + i * 0.7, 3.62, 0.15] as V3, s: [0.7, 0.12, 1.5] as V3, r: [0.35, 0, 0] as V3, color: i % 2 ? C.cream : C.plum })),
      // name board on top
      { p: [0, 4.65, -0.35], s: [3.3, 1.05, 0.16], color: C.plum },
      // the counter
      { p: [0, 0.42, 0.75], s: [4.4, 0.84, 0.8], color: C.plum },
      { p: [0, 0.74, 1.16], s: [4.4, 0.12, 0.02], color: C.cream },
    ],
    [],
  );
  const bulbs = useMemo<Instance[]>(
    () => Array.from({ length: 9 }, (_, i) => ({ p: [-2.25 + i * 0.5625, 3.32 - Math.sin((i / 8) * Math.PI) * 0.18, 0.92] as V3, s: 0.09, color: i % 2 ? "#ffd27a" : "#c99bff" })),
    [],
  );
  return (
    <group position={[0.5, 0.15, -3.1]} scale={1.3}>
      <Boxes items={parts} />
      <Cyls
        items={[
          { p: [-2.3, 1.85, -0.3], s: [0.18, 3.7, 0.18], color: C.ink },
          { p: [2.3, 1.85, -0.3], s: [0.18, 3.7, 0.18], color: C.ink },
        ]}
      />
      <Glows items={bulbs}>
        <sphereGeometry args={[1, 10, 8]} />
      </Glows>
      <group onClick={open} {...bind}>
        <Label size={0.44} color={C.cream} position={[0, 4.8, -0.26]}>
          BITGIG
        </Label>
        <Label size={0.25} color={C.sun} position={[0, 4.38, -0.26]}>
          LIVE DEMO
        </Label>
      </group>
      {/* the screen: the real thing. Click it and the live demo opens */}
      <Tappable position={[0, 2.0, -0.3]} onTap={() => window.open(bitgig.live, "_blank", "noopener")} hintAt={[1.2, 1.15, 0.35]} hintScale={HINT / 1.3}>
        <RoundedBox args={[3.4, 2.15, 0.16]} radius={0.06} castShadow>
          <Toon color={C.ink} />
        </RoundedBox>
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[3.18, 1.99]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </Tappable>
    </group>
  );
}

/** The conveyor and everything on it. */
function Pipeline() {
  const check = useCheckGeometry(0.1);
  const lines = useRef<(THREE.Group | null)[]>([]);
  const raw = useMemo(() => new THREE.Color("#9aa3b5"), []);
  const cream = useMemo(() => new THREE.Color(C.cream), []);
  const rect = useMemo<V3[]>(
    () => [
      [-FW / 2, -FH / 2, 0],
      [FW / 2, -FH / 2, 0],
      [FW / 2, FH / 2, 0],
      [-FW / 2, FH / 2, 0],
      [-FW / 2, -FH / 2, 0],
    ],
    [],
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    lines.current.forEach((g, i) => {
      if (!g) return;
      const x = xAt(t, i);
      g.position.set(x, BELT_TOP + FH / 2 + 0.06, BELT_Z);
      g.visible = stageAt(x) === 1 && x > X0;
    });
  });
  const kit = useMemo<Instance[]>(
    () => [
      { p: [0, BELT_TOP - 0.1, BELT_Z], s: [9.9, 0.2, 1.15], color: C.ink },
      { p: [0, 0.55, BELT_Z], s: [9.5, 0.6, 1.0], color: "#5b5f7a" },
      // the experts' step, behind the belt
      { p: [(sx(2) + sx(3) + 0.55) / 2 - 0.05, 0.2, BELT_Z - 0.95], s: [3.1, 0.4, 0.8], color: "#5b5f7a" },
      // the pile of verified frames: training data
      ...Array.from({ length: 4 }, (_, i) => ({
        p: [5.55 + (i % 2) * 0.06, 0.2 + i * 0.09, BELT_Z - 0.1 + (i % 2) * 0.05] as V3,
        s: [FW, 0.08, FH] as V3,
        r: [0, i * 0.15, 0] as V3,
        color: C.cream,
      })),
      { p: [5.6, 0.62, BELT_Z - 0.05], s: [0.36, 0.06, 0.36], r: [0, 0.4, 0] as V3, color: C.green },
    ],
    [],
  );
  // station plates on the belt's front, unlit so they read at night
  const plates = useMemo<Instance[]>(() => STAGE_COLORS.map((c, i) => ({ p: [sx(i), 0.52, BELT_Z + 0.51] as V3, s: [SW - 0.12, 0.46, 1] as V3, color: c })), []);
  const people = useMemo<Instance[]>(
    () => PEOPLE_X.map((x, i) => ({ p: [x, 1.15, BELT_Z - 0.95] as V3, s: [1, 1, 1] as V3, color: i === 0 ? C.coral : [C.teal, C.rose, C.cobalt][i - 1] })),
    [],
  );
  return (
    <group position={[0, 0.15, 0]}>
      <Boxes items={kit} />
      <Glows items={plates}>
        <planeGeometry args={[1, 1]} />
      </Glows>
      {STAGES.map((s, i) => (
        <Label key={s} size={0.25} color={i === 3 ? C.ink : C.cream} position={[sx(i), 0.52, BELT_Z + 0.52]}>
          {s}
        </Label>
      ))}
      <Reel />
      {/* the experts: one who corrects, three who agree */}
      <ToonInstances items={people} thickness={1.4}>
        <capsuleGeometry args={[0.22, 0.6, 4, 10]} />
      </ToonInstances>
      <Moving
        count={4}
        color="#b97a50"
        thickness={1.4}
        onFrame={(put, t) => {
          PEOPLE_X.forEach((x, i) => {
            // nod when a frame is right in front of you
            let near = 0;
            for (let f = 0; f < FRAMES; f++) near = Math.max(near, 1 - Math.min(Math.abs(xAt(t, f) - x) / 0.6, 1));
            const nod = near * Math.abs(Math.sin(t * 7 + i)) * 0.35;
            put(i, x, 1.98, BELT_Z - 0.95 + nod * 0.2, 0.25, 0.25, 0.25, nod, 0, 0);
          });
        }}
      >
        <sphereGeometry args={[1, 14, 10]} />
      </Moving>
      {/* the corrector's pencil */}
      <mesh position={[sx(2) + 0.32, 1.45, BELT_Z - 0.6]} rotation={[0.9, 0, -0.5]}>
        <cylinderGeometry args={[0.05, 0.05, 0.7, 6]} />
        <Toon color={C.sun} thickness={1.2} />
      </mesh>

      {/* the frames: solid panels, hidden while they are only a draft */}
      <Moving
        count={FRAMES}
        basic
        onFrame={(put, t) => {
          for (let i = 0; i < FRAMES; i++) {
            const x = xAt(t, i);
            const st = stageAt(x);
            const k = x < -5 || x > 5 ? 0 : st === 1 ? 0 : 1;
            put(i, x, BELT_TOP + FH / 2 + 0.06, BELT_Z, FW * k, FH * k, 0.06 * k);
            put.color(i, st === 0 ? raw : cream);
          }
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
      </Moving>
      {/* film edges along the top and bottom of each solid frame */}
      <Moving
        count={FRAMES * 2}
        basic
        color={C.ink}
        onFrame={(put, t) => {
          for (let i = 0; i < FRAMES; i++) {
            const x = xAt(t, i);
            const k = x < -5 || x > 5 || stageAt(x) === 1 ? 0 : 1;
            put(i * 2, x, BELT_TOP + 0.06 + FH - 0.08, BELT_Z + 0.04, FW * k, 0.1 * k, 1);
            put(i * 2 + 1, x, BELT_TOP + 0.06 + 0.08, BELT_Z + 0.04, FW * k, 0.1 * k, 1);
          }
        }}
      >
        <planeGeometry args={[1, 1]} />
      </Moving>
      {Array.from({ length: FRAMES }, (_, i) => (
        <group
          key={i}
          visible={false}
          ref={(g) => {
            lines.current[i] = g;
          }}
        >
          <Line points={rect} color="#b9cdff" lineWidth={4} dashed dashSize={0.14} gapSize={0.09} />
        </group>
      ))}
      {/* verified: a green check rides above each finished frame */}
      <Moving
        count={FRAMES}
        basic
        color={C.green}
        onFrame={(put, t) => {
          for (let i = 0; i < FRAMES; i++) {
            const x = xAt(t, i);
            const into = (x - (X0 + SW * 4)) / 0.3;
            const k = stageAt(x) === 4 && x < 5 ? Math.min(Math.max(into, 0), 1) : 0;
            put(i, x, BELT_TOP + FH + 0.45, BELT_Z + 0.05, 0.5 * k, 0.5 * k, 1);
          }
        }}
      >
        <primitive object={check} attach="geometry" />
      </Moving>
    </group>
  );
}

/** The film reel feeding the belt: where the video comes in. */
function Reel() {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.z -= dt * 1.4;
  });
  const holes = useMemo<Instance[]>(
    () => Array.from({ length: 5 }, (_, i) => ({ p: [Math.cos((i / 5) * Math.PI * 2) * 0.36, Math.sin((i / 5) * Math.PI * 2) * 0.36, 0.07] as V3, s: 0.15, color: C.cream })),
    [],
  );
  return (
    <group position={[-5.5, 1.75, BELT_Z - 0.2]}>
      <mesh position={[0, -0.85, -0.1]}>
        <boxGeometry args={[0.18, 1.7, 0.18]} />
        <Toon color={C.ink} outline={false} />
      </mesh>
      <group ref={g}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.68, 0.68, 0.12, 28]} />
          <Toon color={C.steel} />
        </mesh>
        <Glows items={holes}>
          <circleGeometry args={[1, 16]} />
        </Glows>
      </group>
    </group>
  );
}

/** A hack table: a laptop glowing and the pizza that fuelled it. Click the pizza: it flips. */
function Table() {
  const [kick, fire] = useKick();
  const pizza = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = pizza.current;
    if (!g) return;
    const s = since(kick);
    const k = s < 0.9 ? s / 0.9 : 1;
    // up it goes, a spin and a flip, and back down into the box
    g.position.y = 1.29 + Math.sin(k * Math.PI) * 0.9;
    g.rotation.set(k * Math.PI * 2, k * Math.PI * 3, 0);
  });
  const parts = useMemo<Instance[]>(
    () => [
      { p: [0, 0.86, 0], s: [2.6, 0.1, 1.15], color: C.cream },
      // laptop
      { p: [-0.6, 0.94, 0.1], s: [0.9, 0.06, 0.6], color: C.ink },
      { p: [-0.6, 1.24, -0.18], s: [0.9, 0.58, 0.05], r: [-0.15, 0, 0] as V3, color: C.ink },
      // pizza boxes: two closed, one open with its lid up
      { p: [0.7, 0.98, 0.05], s: [0.95, 0.14, 0.95], r: [0, 0.2, 0] as V3, color: "#e2c592" },
      { p: [0.72, 1.12, 0.04], s: [0.95, 0.14, 0.95], r: [0, -0.1, 0] as V3, color: "#e2c592" },
      { p: [0.75, 1.24, 0.05], s: [0.95, 0.06, 0.95], color: "#e2c592" },
      { p: [0.75, 1.68, -0.43], s: [0.95, 0.9, 0.04], r: [-0.25, 0, 0] as V3, color: "#e2c592" },
    ],
    [],
  );
  const legs = useMemo<Instance[]>(
    () =>
      [
        [-1.15, -0.45],
        [1.15, -0.45],
        [-1.15, 0.45],
        [1.15, 0.45],
      ].map(([x, z]) => ({ p: [x, 0.42, z] as V3, s: [0.09, 0.84, 0.09] as V3, color: C.ink })),
    [],
  );
  const pepperoni = useMemo<Instance[]>(
    () =>
      [
        [-0.15, 0.1],
        [0.15, 0.15],
        [0, -0.13],
        [0.2, -0.15],
        [-0.17, -0.2],
      ].map(([x, z]) => ({ p: [x, 0.03, z] as V3, s: [0.12, 0.02, 0.12] as V3, color: C.red })),
    [],
  );
  return (
    <group position={[4.7, 0.15, 0.6]} rotation={[0, -0.4, 0]}>
      <Boxes items={parts} />
      <Cyls items={legs} outline={false} sides={10} />
      {/* the pizza, one slice gone */}
      <Tappable
        onTap={() => {
          fire();
          sfx.whee();
          setTimeout(() => sfx.pop(0.8), 820);
        }}
        hintAt={[0.75, 2.1, 0.05]}
        hintScale={HINT}
      >
        <group ref={pizza} position={[0.75, 1.29, 0.05]}>
          <mesh>
            <cylinderGeometry args={[0.4, 0.4, 0.04, 24, 1, false, 0, Math.PI * (5 / 3)]} />
            <Toon color={C.sun} thickness={1.2} />
          </mesh>
          <Cyls items={pepperoni} outline={false} castShadow={false} sides={10} />
        </group>
        {/* a bigger, invisible target: a slice of pizza is small */}
        <mesh position={[0.75, 1.4, 0.05]} visible={false}>
          <boxGeometry args={[1.1, 0.7, 1.1]} />
          <meshBasicMaterial />
        </mesh>
      </Tappable>
      <PopText kick={kick} text="NOM" position={[0.75, 2.3, 0.3]} size={0.42} />
      <Glows items={[{ p: [-0.6, 1.24, -0.15], s: [0.8, 0.48, 1], r: [-0.15, 0, 0], color: "#9fc1ff" }]}>
        <planeGeometry args={[1, 1]} />
      </Glows>
    </group>
  );
}

/* ---------- the campanile ---------- */

const GRANITE = "#e4ddcc";
const GRANITE_2 = "#d3cab5";
const COPPER = "#86ab9c";
const LAMPLIGHT = "#ffd27a";
const CAMP_AT: V3 = [6.0, 0.15, -7.2];
const CAMP_RY = -0.3;
const SHAFT = { w: 1.4, y0: 1.5, h: 4.3 };
const BELFRY_Y = SHAFT.y0 + SHAFT.h; // 5.8
const BELFRY_H = 1.3;
const CAMP_CLOCK: V3 = [0, 5.05, SHAFT.w / 2 + 0.02];
const CAMP_CLOCK_R = 0.5;
const BELL_AT: V3 = [0, BELFRY_Y + 0.98, 0.86];
/** The tune the bell plays: a little four-note phrase, there and back. */
const TUNE = [659, 523, 587, 392, 392, 587, 659, 523];

function campanileParts() {
  const top = BELFRY_Y + BELFRY_H;
  const body: Part[] = [
    box(GRANITE_2, 3.2, 0.3, 2.6, { p: [0, 0.15, 0] }),
    box(GRANITE, 2.9, 1.0, 2.3, { p: [0, 0.8, 0] }),
    box(GRANITE_2, 3.05, 0.16, 2.45, { p: [0, 1.38, 0] }),
    box(GRANITE, SHAFT.w, SHAFT.h, SHAFT.w, { p: [0, SHAFT.y0 + SHAFT.h / 2, 0] }),
    // a band under the clock, and the belfry with its cornice
    box(GRANITE_2, SHAFT.w + 0.12, 0.12, SHAFT.w + 0.12, { p: [0, 4.45, 0] }),
    box(GRANITE_2, 1.75, 0.12, 1.75, { p: [0, BELFRY_Y + 0.06, 0] }),
    box(GRANITE, 1.6, BELFRY_H, 1.6, { p: [0, BELFRY_Y + BELFRY_H / 2, 0] }),
    box(GRANITE_2, 1.8, 0.18, 1.8, { p: [0, top + 0.09, 0] }),
    // the copper spire: a four-sided pyramid, gone green-grey, and a gold finial
    cone(COPPER, 1.15, 1.9, 4, { p: [0, top + 0.18 + 0.95, 0], r: [0, Math.PI / 4, 0] }),
    cyl(C.gold, 0.03, 0.03, 0.45, 6, { p: [0, top + 2.25, 0] }),
    sphere(C.gold, 0.08, { p: [0, top + 2.15, 0] }),
  ];
  const [rim, face] = clockFace(CAMP_CLOCK, CAMP_CLOCK_R, C.cream, C.ink).body;
  const { marks } = clockFace(CAMP_CLOCK, CAMP_CLOCK_R, C.cream, C.ink);
  // the belfry arch, lamplit at night, slit windows down the shaft, the door and the name plaque
  const glow: Part[] = [
    face,
    box(LAMPLIGHT, 0.76, 0.75, 0.02, { p: [0, BELFRY_Y + 0.5, 0.81] }),
    cyl(LAMPLIGHT, 0.38, 0.38, 0.02, 18, { p: [0, BELFRY_Y + 0.87, 0.81], r: [Math.PI / 2, 0, 0] }, [Math.PI / 2, Math.PI]),
    ...[-0.3, 0, 0.3].map((x) => box("#3b3550", 0.12, 2.3, 0.02, { p: [x, 3.05, SHAFT.w / 2 + 0.01] })),
    box("#efe6cf", 2.6, 0.52, 0.02, { p: [0, 0.82, 1.16] }),
  ];
  return { body: [...body, rim], glow: [...glow, ...marks] };
}

/** The campanile. Click it: the bell swings and plays its tune. */
function Campanile() {
  const parts = useMemo(() => campanileParts(), []);
  const bell = useRef<THREE.Group>(null);
  const [kick, fire] = useKick();
  useFrame(() => {
    if (!bell.current) return;
    const s = since(kick);
    bell.current.rotation.z = s < 4 ? Math.sin(s * 7) * 0.55 * Math.max(1 - s / 4, 0) : 0;
  });
  const ring = () => {
    fire();
    TUNE.forEach((f, i) => setTimeout(() => chime(f), i * 300 + (i > 3 ? 250 : 0)));
  };
  return (
    <group position={CAMP_AT} rotation={[0, CAMP_RY, 0]}>
      <Tappable onTap={ring} hintAt={[0, 3.6, 1.0]} hintScale={HINT}>
        <Baked parts={parts.body} castShadow thickness={2} />
        <Baked parts={parts.glow} look="glow" />
        {/* the bell, hanging in the arch */}
        <group ref={bell} position={BELL_AT}>
          <mesh position={[0, -0.28, 0]}>
            <cylinderGeometry args={[0.14, 0.3, 0.44, 14]} />
            <Toon color={C.gold} thickness={1.4} />
          </mesh>
        </group>
      </Tappable>
      <ClockHands tz={places.berkeley.tz} r={CAMP_CLOCK_R} position={CAMP_CLOCK} />
      <Label size={0.3} color={C.ink} position={[0, 0.82, 1.18]}>
        UC BERKELEY
      </Label>
      <PopText kick={kick} text="DING DONG" position={[-0.4, BELFRY_Y + 1.6, 1.2]} size={0.42} rise={0.9} dur={2.2} />
    </group>
  );
}

export function Bitgig() {
  return (
    <group>
      <Islet r={11} top="#d9c39a" />
      <Stars seed={7} />
      <Moon position={[-3.4, 8.3, -9.5]} />
      <Campanile />
      <Booth />
      <Pipeline />
      <Table />
    </group>
  );
}
