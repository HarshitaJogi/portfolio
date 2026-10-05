"use client";

import { RoundedBox } from "@/world/rounded";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { places } from "@/content/profile";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { Label, chime } from "../../bits";
import { Islet } from "../../props/basics";
import { Tappable } from "../../props/tappable";
import { HINT, PopText, hump, sfx, since, useKick, wiggle } from "@/world/fx";
import { Boxes, Glows, Moving, type V3 } from "./kit";

/*
 * Event Scheduling & Management System, Java coursework, Nov to Dec 2025.
 * A desk. The hero is a flip calendar turning from NOV to DEC, with a recurring event on
 * the same weekday every week. Behind it, a world-clock board with the real time in her
 * three cities (timezone conversion). On the right, the design patterns stacked like toy
 * blocks, MVC at the bottom. In front, a timeline where a new event tries to land on a
 * taken slot, flashes red (conflict detection) and moves to a free one. The printer
 * exports CSV and ICAL cards (Strategy and Factory). And a mug of java.
 * Click the calendar (it riffles through its pages), the pattern blocks (they wobble)
 * and the mug (a sip, a puff of steam).
 */

/** The desk's props are drawn at this scale, so hints come out the same size everywhere. */
const S = 1.08;

const DESK_Y = 0.29;

/* ---------- world clocks ---------- */

const CITIES = [places.boston, places.sunnyvale, places.mumbai];
const clockX = (i: number) => -2.4 + i * 2.85;
const CLOCK_Y = 6.1;
const CLOCK_R = 0.78;

const fmt = new Map<string, Intl.DateTimeFormat>();
function localTime(tz: string) {
  let f = fmt.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" });
    fmt.set(tz, f);
  }
  let h = 0;
  let m = 0;
  let s = 0;
  for (const p of f.formatToParts(new Date())) {
    if (p.type === "hour") h = Number(p.value);
    else if (p.type === "minute") m = Number(p.value);
    else if (p.type === "second") s = Number(p.value);
  }
  return [h, m, s] as const;
}

/** A hand: a thin plane whose pivot is at its base. */
const HAND = new THREE.PlaneGeometry(1, 1).translate(0, 0.42, 0);

function WorldClocks() {
  const angles = useRef<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const last = useRef(-1);
  const ticks = useMemo<Instance[]>(() => {
    const out: Instance[] = [];
    CITIES.forEach((_, c) => {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const big = i % 3 === 0;
        out.push({
          p: [clockX(c) + Math.sin(a) * CLOCK_R * 0.76, CLOCK_Y + Math.cos(a) * CLOCK_R * 0.76, 0.12] as V3,
          s: [big ? 0.07 : 0.04, big ? 0.2 : 0.11, 1] as V3,
          r: [0, 0, -a] as V3,
          color: C.ink,
        });
      }
      out.push({ p: [clockX(c), CLOCK_Y, 0.15], s: [0.1, 0.1, 1], r: [0, 0, Math.PI / 4], color: C.coral });
    });
    return out;
  }, []);
  const faces = useMemo<Instance[]>(
    () => CITIES.map((_, c) => ({ p: [clockX(c), CLOCK_Y, 0.04] as V3, s: [CLOCK_R * 2, 0.1, CLOCK_R * 2] as V3, r: [Math.PI / 2, 0, 0] as V3, color: C.cream })),
    [],
  );
  return (
    <group position={[0.4, 0, -5.3]}>
      <Boxes
        items={[
          { p: [0.45, CLOCK_Y - 0.35, -0.1], s: [8.6, 2.6, 0.2], color: C.cobalt },
          { p: [-3.4, (CLOCK_Y - 1.6) / 2, -0.15], s: [0.24, CLOCK_Y - 1.6, 0.24], color: C.ink },
          { p: [4.3, (CLOCK_Y - 1.6) / 2, -0.15], s: [0.24, CLOCK_Y - 1.6, 0.24], color: C.ink },
        ]}
      />
      <ToonInstances items={faces} thickness={1.6}>
        <cylinderGeometry args={[0.5, 0.5, 1, 36]} />
      </ToonInstances>
      <Glows items={ticks}>
        <planeGeometry args={[1, 1]} />
      </Glows>
      <Moving
        count={9}
        basic
        onFrame={(put, t) => {
          const q = Math.floor(t * 4);
          if (q !== last.current) {
            last.current = q;
            CITIES.forEach((city, c) => {
              const [h, m, s] = localTime(city.tz);
              angles.current[c * 3] = (((h % 12) + m / 60) / 12) * Math.PI * 2;
              angles.current[c * 3 + 1] = ((m + s / 60) / 60) * Math.PI * 2;
              angles.current[c * 3 + 2] = (s / 60) * Math.PI * 2;
            });
          }
          for (let c = 0; c < 3; c++) {
            const x = clockX(c);
            put(c * 3, x, CLOCK_Y, 0.13, 0.1, CLOCK_R * 0.5, 1, 0, 0, -angles.current[c * 3]);
            put(c * 3 + 1, x, CLOCK_Y, 0.14, 0.07, CLOCK_R * 0.78, 1, 0, 0, -angles.current[c * 3 + 1]);
            put(c * 3 + 2, x, CLOCK_Y, 0.145, 0.03, CLOCK_R * 0.84, 1, 0, 0, -angles.current[c * 3 + 2]);
            put.color(c * 3, C.ink);
            put.color(c * 3 + 1, C.ink);
            put.color(c * 3 + 2, C.coral);
          }
        }}
      >
        <primitive object={HAND} attach="geometry" />
      </Moving>
      {CITIES.map((city, c) => (
        <Label key={city.tz} size={0.28} color={C.cream} position={[clockX(c), CLOCK_Y - 1.18, 0.02]}>
          {city.city.toUpperCase()}
        </Label>
      ))}
    </group>
  );
}

/* ---------- the flip calendar ---------- */

const PW = 3.6;
const PH = 3.1;

/** One page: coral header with the month, then a grid of days with its events marked. */
function Page({ month, marks, children }: { month: string; marks: (col: number, row: number) => string | null; children?: ReactNode }) {
  const days = useMemo<Instance[]>(() => {
    const out: Instance[] = [];
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 7; c++) {
        const mark = marks(c, r);
        out.push({ p: [-1.38 + c * 0.46, -1.28 - r * 0.42, 0.065] as V3, s: [mark ? 0.34 : 0.3, mark ? 0.3 : 0.26, 1] as V3, color: mark ?? "#e6dccb" });
      }
    return out;
  }, [marks]);
  return (
    <group>
      <mesh position={[0, -PH / 2, 0]} castShadow>
        <boxGeometry args={[PW, PH, 0.1]} />
        <Toon color={C.cream} />
      </mesh>
      <mesh position={[0, -0.48, 0.055]}>
        <planeGeometry args={[PW, 0.82]} />
        <meshBasicMaterial color={C.coral} />
      </mesh>
      <Label size={0.56} color={C.cream} position={[-0.3, -0.48, 0.07]}>
        {month}
      </Label>
      <Label size={0.25} color={C.cream} position={[1.15, -0.5, 0.07]}>
        2025
      </Label>
      <Glows items={days}>
        <planeGeometry args={[1, 1]} />
      </Glows>
      {children}
    </group>
  );
}

// a recurring event: the same weekday, every week
const novMarks = (c: number, r: number) => (c === 2 ? C.teal : r === 3 && c === 5 ? C.plum : null);
const decMarks = (c: number, r: number) => (c === 2 && r < 3 ? C.teal : r === 1 && c === 4 ? C.sun : null);

function Calendar() {
  const flip = useRef<THREE.Group>(null);
  const [kick, fire] = useKick();
  useFrame(({ clock }) => {
    // NOV for a while, flip over the top to DEC, then back again
    const u = clock.elapsedTime % 9;
    const s = (x: number) => x * x * (3 - 2 * x);
    const k = u < 3.5 ? 0 : u < 4.6 ? s((u - 3.5) / 1.1) : u < 8 ? 1 : 1 - s((u - 8) / 1);
    // clicked: three fast turns of the page on top of wherever it is, ending where it began
    const c = since(kick);
    const extra = c >= 0 && c < 1.3 ? s(c / 1.3) * Math.PI * 6 : 0;
    if (flip.current) flip.current.rotation.x = -k * (Math.PI * 2 - 0.62) - extra;
  });
  const riffle = () => {
    fire();
    for (let i = 0; i < 7; i++) setTimeout(() => sfx.click(1 + i * 0.06), i * 150);
    setTimeout(() => chime(1046), 1250);
  };
  const rings = useMemo<Instance[]>(() => Array.from({ length: 6 }, (_, i) => ({ p: [-1.35 + i * 0.54, 0, 0.02] as V3, r: [0, Math.PI / 2, 0] as V3, color: C.silver })), []);
  return (
    <Tappable position={[-1.1, DESK_Y, -1.9]} onTap={riffle} hintAt={[1.3, 3.2, 0.5]} hintScale={HINT / S}>
      <PopText kick={kick} text="FLIP" position={[0, 4.1, 0.6]} size={0.42} />
      {/* the stand: a base and a back leg, leaning */}
      <Boxes
        items={[
          { p: [0, 0.08, -0.25], s: [PW + 0.3, 0.16, 2.1], color: C.ink },
          { p: [0, 1.72, -0.68], s: [PW - 0.2, 3.6, 0.12], r: [0.37, 0, 0], color: C.ink },
        ]}
      />
      <group position={[0, 3.35, 0]} rotation={[-0.16, 0, 0]}>
        <ToonInstances items={rings} thickness={1.2}>
          <torusGeometry args={[0.16, 0.04, 6, 14]} />
        </ToonInstances>
        <Page month="DEC" marks={decMarks} />
        <group ref={flip} position={[0, 0, 0.12]}>
          <Page month="NOV" marks={novMarks} />
        </group>
      </group>
    </Tappable>
  );
}

/* ---------- design patterns, stacked ---------- */

const PATTERNS: { name: string; w: number; color: string; ink: string; yaw: number }[] = [
  { name: "MVC", w: 2.7, color: C.cobalt, ink: C.cream, yaw: 0.04 },
  { name: "COMMAND", w: 2.35, color: C.coral, ink: C.cream, yaw: -0.09 },
  { name: "STRATEGY", w: 2.45, color: C.green, ink: C.cream, yaw: 0.07 },
  { name: "FACTORY", w: 2.25, color: C.sun, ink: C.ink, yaw: -0.05 },
];

function PatternTower() {
  const H = 0.78;
  const D = 1.3;
  const tower = useRef<THREE.Group>(null);
  const [kick, fire] = useKick();
  useFrame(() => {
    const g = tower.current;
    if (!g) return;
    // a wobble from the base, like a stack of toy blocks bumped
    const s = since(kick);
    g.rotation.z = wiggle(s, 0.13, 11, 2.6);
    g.rotation.x = wiggle(s - 0.05, 0.05, 9, 2.6);
  });
  const blocks = useMemo<Instance[]>(() => PATTERNS.map((p, i) => ({ p: [0, H / 2 + i * H, 0] as V3, s: [p.w, H, D] as V3, r: [0, p.yaw, 0] as V3, color: p.color })), []);
  return (
    <Tappable
      position={[3.9, DESK_Y, -1.3]}
      rotation={[0, -0.18, 0]}
      onTap={() => {
        fire();
        PATTERNS.forEach((_, i) => setTimeout(() => sfx.boop(0.9 + i * 0.22), i * 90));
      }}
      hintAt={[0, H * 4 + 0.75, 0]}
      hintScale={HINT / S}
    >
      <PopText kick={kick} text="CLACK" position={[0, H * 4 + 0.6, 0.6]} size={0.38} />
      <group ref={tower}>
        <Boxes items={blocks} thickness={2} />
        {PATTERNS.map((p, i) => (
          <group key={p.name} rotation={[0, p.yaw, 0]}>
            <Label size={i === 0 ? 0.42 : 0.3} color={p.ink} position={[0, H / 2 + i * H, D / 2 + 0.01]}>
              {p.name}
            </Label>
          </group>
        ))}
      </group>
    </Tappable>
  );
}

/* ---------- the timeline, with a conflict ---------- */

const SLOTS = [-2.4, -1.0, 0.4, 1.8];
const TAKEN = [0, 2, 3]; // slots with an event already in them
const LOOP = 7.5;

function Timeline() {
  const label = useRef<THREE.Group>(null);
  const red = useMemo(() => new THREE.Color(C.red), []);
  const base = useMemo(() => [C.teal, C.teal, C.plum].map((c) => new THREE.Color(c)), []);
  const mover = useMemo(() => new THREE.Color(C.coral), []);
  const ok = useMemo(() => new THREE.Color(C.green), []);
  // where the new event goes: first onto the taken slot 2, then to the free slot 1
  const st = useRef({ x: 0, y: 0, clash: false, k: 1, settled: -1 });
  const state = (u: number) => {
    const o = st.current;
    const s = (x: number) => x * x * (3 - 2 * x);
    const a = SLOTS[2] + 0.28;
    const b = SLOTS[1];
    o.clash = false;
    o.k = 1;
    o.settled = -1;
    if (u < 1.2) {
      o.x = -3.8 + (a + 3.8) * s(u / 1.2);
      o.y = 1.25;
    } else if (u < 1.55) {
      o.x = a;
      o.y = 1.25 - 0.63 * s((u - 1.2) / 0.35);
    } else if (u < 3.0) {
      o.x = a;
      o.y = 0.62;
      o.clash = true;
    } else if (u < 3.4) {
      o.x = a;
      o.y = 0.62 + 0.63 * s((u - 3) / 0.4);
    } else if (u < 4.3) {
      o.x = a + (b - a) * s((u - 3.4) / 0.9);
      o.y = 1.25;
    } else if (u < 4.65) {
      o.x = b;
      o.y = 1.25 - 0.63 * s((u - 4.3) / 0.35);
    } else if (u < 6.9) {
      o.x = b;
      o.y = 0.62;
      o.settled = u - 4.65;
    } else {
      o.x = b;
      o.y = 0.62;
      o.k = Math.max(1 - (u - 6.9) / 0.5, 0);
    }
    return o;
  };
  useFrame(({ clock }) => {
    const u = clock.elapsedTime % LOOP;
    if (label.current) label.current.visible = state(u).clash;
  });
  const track = useMemo<Instance[]>(
    () => [
      { p: [-0.3, 0.12, 0], s: [5.8, 0.24, 1.0], color: C.cream },
      ...Array.from({ length: 7 }, (_, i) => ({ p: [-3.0 + i * 0.9, 0.25, 0.42] as V3, s: [0.05, 0.03, 0.18] as V3, color: C.ink })),
    ],
    [],
  );
  return (
    <group position={[-0.5, DESK_Y, 2.7]}>
      <Boxes items={track} castShadow={false} />
      <Moving
        count={4}
        castShadow
        onFrame={(put, t) => {
          const u = t % LOOP;
          const ev = state(u);
          const blink = ev.clash && Math.floor(u * 6) % 2 === 0;
          TAKEN.forEach((slot, i) => {
            put(i, SLOTS[slot], 0.48, 0, 1.15, 0.42, 0.7);
            put.color(i, blink && slot === 2 ? red : base[i]);
          });
          put(3, ev.x, ev.y, 0.05, 1.15 * ev.k, 0.42 * ev.k, 0.7 * ev.k);
          put.color(3, blink ? red : ev.settled >= 0 && ev.settled < 0.7 ? ok : mover);
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
      </Moving>
      <group ref={label} visible={false}>
        <Label size={0.3} color={C.red} outline={C.cream} position={[SLOTS[2] + 0.2, 1.55, 0.1]}>
          CONFLICT
        </Label>
      </group>
    </group>
  );
}

/* ---------- export: the printer ---------- */

function Printer() {
  const cards = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    cards.current.forEach((g, i) => {
      if (!g) return;
      // each card takes turns: slides out of the slot, tips up to show its format, then drops away
      const u = (t / 2.6 + i) % 2;
      const s = (x: number) => x * x * (3 - 2 * x);
      const out = u < 1 ? s(Math.min(u / 0.45, 1)) : 1;
      const tip = u < 1 ? s(Math.min(Math.max((u - 0.35) / 0.3, 0), 1)) : 1;
      const gone = u < 1 ? 1 : Math.max(1 - (u - 1) / 0.25, 0);
      g.position.set(0, 0.55 + tip * 0.5, 0.1 + out * 0.85);
      g.rotation.x = -Math.PI / 2 + tip * (Math.PI / 2 - 0.12);
      g.scale.setScalar(gone || 1e-4);
      g.visible = u < 1.25;
    });
  });
  return (
    <group position={[4.2, DESK_Y, 1.8]} rotation={[0, -0.35, 0]}>
      <RoundedBox args={[1.6, 0.85, 1.15]} radius={0.12} position={[0, 0.42, 0]} castShadow>
        <Toon color="#e9e3d5" />
      </RoundedBox>
      <mesh position={[0, 0.62, 0.58]}>
        <planeGeometry args={[1.05, 0.08]} />
        <meshBasicMaterial color={C.ink} />
      </mesh>
      <mesh position={[0.55, 0.86, 0.3]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshBasicMaterial color={C.green} />
      </mesh>
      {["CSV", "ICAL"].map((f, i) => (
        <group
          key={f}
          ref={(g) => {
            cards.current[i] = g;
          }}
        >
          <mesh>
            <boxGeometry args={[0.95, 0.66, 0.04]} />
            <Toon color={i ? C.cobalt : C.green} thickness={1.4} />
          </mesh>
          <Label size={0.28} color={C.cream} position={[0, 0, 0.03]}>
            {f}
          </Label>
        </group>
      ))}
    </group>
  );
}

/* ---------- a mug of java ---------- */

function Mug() {
  const [kick, fire] = useKick();
  const body = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = body.current;
    if (!g) return;
    const h = hump(since(kick), 0.45);
    g.position.y = h * 0.4;
    g.rotation.z = h * 0.25;
  });
  return (
    <Tappable
      position={[-4.6, DESK_Y, 2.5]}
      onTap={() => {
        fire();
        chime(880);
        sfx.pop(0.7);
      }}
      hintAt={[0, 1.65, 0]}
      hintScale={HINT / S}
    >
      <PopText kick={kick} text="SIP" position={[0.3, 2.2, 0.3]} size={0.4} />
      <group ref={body}>
        <mesh position={[0, 0.48, 0]} castShadow>
          <cylinderGeometry args={[0.48, 0.42, 0.96, 20]} />
          <Toon color={C.coral} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.41, 0.41, 0.02, 20]} />
          <meshBasicMaterial color="#5a3420" />
        </mesh>
        <mesh position={[-0.5, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.22, 0.07, 8, 16, Math.PI]} />
          <Toon color={C.coral} thickness={1.4} />
        </mesh>
        <Label size={0.25} color={C.cream} position={[0, 0.5, 0.47]}>
          JAVA
        </Label>
        <Moving
          count={3}
          basic
          color={C.white}
          transparent
          opacity={0.5}
          onFrame={(put, t) => {
            const burst = since(kick) < 1.5 ? 1.8 : 1;
            for (let i = 0; i < 3; i++) {
              const u = (t * 0.45 + i / 3) % 1;
              const sc = (0.07 + u * 0.12) * burst * Math.sin(u * Math.PI);
              put(i, Math.sin(t * 2 + i * 2) * 0.12, 1.05 + u * 1.3, 0, sc);
            }
          }}
        >
          <sphereGeometry args={[1, 10, 8]} />
        </Moving>
      </group>
    </Tappable>
  );
}

/** A sticky note on the desk: the command parser's reach. */
function StickyNote() {
  return (
    <group position={[-4.15, DESK_Y + 0.02, -1.35]} rotation={[0, 0.35, 0]}>
      <group rotation={[-1.1, 0, 0.06]} position={[0, 0.55, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.75, 1.35, 0.03]} />
          <Toon color={C.taxiYellow} thickness={1.4} />
        </mesh>
        <Label size={0.46} position={[0, 0.17, 0.02]}>
          18+
        </Label>
        <Label size={0.25} position={[0, -0.3, 0.02]}>
          COMMANDS
        </Label>
      </group>
      <mesh position={[0, 0.28, -0.25]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.08, 0.6, 0.08]} />
        <Toon color={C.ink} outline={false} />
      </mesh>
    </group>
  );
}

export function Scheduler() {
  return (
    <group>
      <Islet r={11} top={C.sand} />
      {/* the desk top */}
      <RoundedBox args={[12.4, 0.2, 8.4]} radius={0.08} position={[0.2, 0.2, 0.6]} receiveShadow>
        <Toon color="#d9a066" />
      </RoundedBox>
      <group position={[0, 0, 1.3]} scale={S}>
        <WorldClocks />
        <Calendar />
        <PatternTower />
        <Timeline />
        <Printer />
        <Mug />
        <StickyNote />
      </group>
    </group>
  );
}
