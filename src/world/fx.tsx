"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { C } from "./palette";
import { Label } from "./bits";
import { TapHint } from "./props/tappable";

/*
 * Small toy reactions shared by the worlds and the hub districts: synthesized sounds,
 * a 3D word that pops up, a burst of bits, a ripple, a squash. Every effect is driven by
 * a "kick": the performance.now() of the last tap, so any number of pieces can read it
 * without fighting over who resets it.
 */

type V3 = [number, number, number];

/* ------------------------------------------------------------------ */
/* kicks                                                               */
/* ------------------------------------------------------------------ */

export type Kick = { current: number };
const NEVER = -1e9;

/** A kick and the function that fires it. */
export function useKick(): [Kick, () => void] {
  const k = useRef(NEVER);
  const fire = useMemo(() => () => void (k.current = performance.now()), []);
  return [k, fire];
}

/** Seconds since the kick fired (huge when it never has). */
export const since = (k: Kick) => (performance.now() - k.current) / 1000;

/** A damped spring wiggle: 0 at rest, swinging about 0 right after a kick. */
export const wiggle = (s: number, amp = 0.25, freq = 18, decay = 5) => (s < 0 || s > 3 ? 0 : amp * Math.sin(s * freq) * Math.exp(-s * decay));

/** Squash and stretch an object's scale around `base` from a wiggle value. */
export function squash(o: THREE.Object3D, w: number, base = 1) {
  o.scale.set(base * (1 - w * 0.5), base * (1 + w), base * (1 - w * 0.5));
}

/** 0..1..0 over `dur` seconds after a kick: a single hump. */
export const hump = (s: number, dur: number) => (s < 0 || s > dur ? 0 : Math.sin((s / dur) * Math.PI));

const backOut = (t: number) => {
  const c = 1.9;
  const x = t - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};

/** Deterministic 0..1 noise for layouts and bursts. */
export const seeded = (i: number, k = 0) => {
  const x = Math.sin(i * 12.9898 + k * 78.233 + 0.5) * 43758.5453;
  return x - Math.floor(x);
};

/* ------------------------------------------------------------------ */
/* sound: one shared audio context, a few synthesized voices            */
/* ------------------------------------------------------------------ */

let ctx: AudioContext | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, to: number, dur: number, type: OscillatorType = "sine", vol = 0.12, delay = 0) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.03);
}

function noise(dur: number, { type = "bandpass", from = 1200, to = from, q = 1, vol = 0.2, delay = 0 }: { type?: BiquadFilterType; from?: number; to?: number; q?: number; vol?: number; delay?: number } = {}) {
  const a = audio();
  if (!a) return;
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = a.currentTime + delay;
  const src = a.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = a.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.04, dur * 0.2));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.05);
}

/** Toy sound effects. `p` scales the pitch. */
export const sfx = {
  /** A bubbly pop. */
  pop: (p = 1) => tone(420 * p, 980 * p, 0.12, "sine", 0.14),
  /** A rounded boop, falling. */
  boop: (p = 1) => tone(520 * p, 300 * p, 0.2, "triangle", 0.13),
  /** Two quick electronic beeps. */
  beep: (p = 1) => {
    tone(1180 * p, 1180 * p, 0.07, "square", 0.04);
    tone(1580 * p, 1580 * p, 0.09, "square", 0.04, 0.09);
  },
  /** An airy rush. */
  whoosh: (p = 1) => noise(0.5, { from: 300 * p, to: 2600 * p, q: 1.2, vol: 0.28 }),
  /** A dull click, like a switch. */
  click: (p = 1) => {
    tone(2200 * p, 900 * p, 0.03, "square", 0.05);
    noise(0.04, { type: "highpass", from: 3000, vol: 0.12 });
  },
  /** Thunder: a crack, then a long low rumble. */
  thunder: () => {
    noise(0.25, { type: "highpass", from: 2500, to: 600, vol: 0.3 });
    noise(1.8, { type: "lowpass", from: 420, to: 60, q: 0.7, vol: 0.55, delay: 0.05 });
    tone(70, 38, 1.4, "sine", 0.25, 0.05);
  },
  /** Leaves: a soft rustle. */
  rustle: () => [0, 0.08, 0.17, 0.27].forEach((d, i) => noise(0.16, { type: "highpass", from: 2600 + i * 400, vol: 0.12, delay: d })),
  /** Sparks: tiny crackles. */
  crackle: () => [0, 0.05, 0.09, 0.16, 0.22, 0.31].forEach((d, i) => noise(0.05, { type: "bandpass", from: 3000 + (i % 3) * 1500, q: 3, vol: 0.3, delay: d })),
  /** A metal clank. */
  clank: (p = 1) => {
    tone(820 * p, 760 * p, 0.25, "square", 0.04);
    tone(1370 * p, 1300 * p, 0.3, "triangle", 0.07);
    noise(0.06, { type: "highpass", from: 4000, vol: 0.12 });
  },
  /** A rising whirr, like gears racing. */
  whirr: () => {
    tone(140, 620, 0.7, "sawtooth", 0.035);
    tone(210, 930, 0.7, "triangle", 0.05);
  },
  /** Notes stepping up: a little fanfare. */
  arp: (base = 660, n = 4, gap = 0.07, type: OscillatorType = "triangle") => {
    const steps = [1, 1.25, 1.5, 2, 2.5, 3];
    for (let i = 0; i < n; i++) tone(base * steps[i % steps.length], base * steps[i % steps.length], 0.18, type, 0.08, i * gap);
  },
  /** Paper flutter. */
  flutter: () => [0, 0.05, 0.1, 0.15, 0.2, 0.25].forEach((d, i) => noise(0.05, { type: "bandpass", from: 1800 + i * 200, q: 2, vol: 0.18, delay: d })),
  /** Applause: a crowd of claps. */
  applause: () => {
    for (let i = 0; i < 22; i++) noise(0.04, { type: "bandpass", from: 1400 + seeded(i, 3) * 1600, q: 1.5, vol: 0.22, delay: seeded(i, 7) * 0.9 });
  },
  /** A big low bell. */
  dong: () => {
    tone(196, 194, 1.6, "sine", 0.22);
    tone(392 * 1.2, 390 * 1.2, 1.1, "sine", 0.06);
    tone(196 * 2.76, 196 * 2.76, 0.7, "sine", 0.05);
  },
  /** A cheerful whistle up. */
  whee: () => tone(600, 1800, 0.35, "sine", 0.1),
  /** A buzzing drone. */
  buzz: () => {
    tone(180, 260, 0.6, "sawtooth", 0.035);
    tone(186, 270, 0.6, "sawtooth", 0.035);
  },
};

/* ------------------------------------------------------------------ */
/* a word that pops up and floats away                                 */
/* ------------------------------------------------------------------ */

/** "BEEP", "DING": a chunky word that pops out, rises, and shrinks away after a kick. */
export function PopText({ kick, text, position, color = C.ink, outline = C.cream, size = 0.5, rise = 1.3, dur = 1.15, rotation }: { kick: Kick; text: string; position: V3; color?: string; outline?: string; size?: number; rise?: number; dur?: number; rotation?: V3 }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const s = since(kick);
    const on = s >= 0 && s < dur;
    if (g.visible !== on) g.visible = on;
    if (!on) return;
    const grow = s < 0.2 ? backOut(s / 0.2) : 1;
    const shrink = s > dur - 0.25 ? Math.max(0, (dur - s) / 0.25) : 1;
    g.scale.setScalar(Math.max(grow * shrink, 0.001));
    g.position.set(position[0], position[1] + rise * (1 - Math.exp(-s * 3)), position[2]);
    g.rotation.z = Math.sin(s * 14) * 0.12 * Math.exp(-s * 3);
  });
  return (
    <group rotation={rotation}>
      <group ref={ref} position={position} visible={false}>
        <Label size={size} color={color} outline={outline}>
          {text}
        </Label>
      </group>
    </group>
  );
}

/** Undoes its parent's turn about y, so a word riding on a shuttle keeps facing the camera. */
export function Upright({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (g?.parent) g.rotation.y = -g.parent.rotation.y;
  });
  return <group ref={ref}>{children}</group>;
}

/* ------------------------------------------------------------------ */
/* bursts and ripples                                                  */
/* ------------------------------------------------------------------ */

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const WARM = [C.sun, C.coral, C.cream];
const EVEN: V3 = [1, 1, 1];
const leafGeo = new THREE.PlaneGeometry(1.4, 1);

/**
 * A handful of bits flung out from `origin` after a kick, falling under gravity and
 * shrinking away. One instanced draw, and none at all while it rests.
 */
export function Burst({ kick, origin, count = 16, colors = WARM, size = 0.14, speed = 2.6, up = 3.2, gravity = 7, dur = 1.3, shape = "box", spread = EVEN, floor = -1e9 }: { kick: Kick; origin: V3 | THREE.Vector3; count?: number; colors?: string[]; size?: number; speed?: number; up?: number; gravity?: number; dur?: number; shape?: "box" | "leaf"; spread?: V3; floor?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = seeded(i, 1) * Math.PI * 2;
        const r = 0.4 + seeded(i, 2) * 0.6;
        return { vx: Math.cos(a) * r * speed * spread[0], vy: (0.5 + seeded(i, 3)) * up * spread[1], vz: Math.sin(a) * r * speed * spread[2], spin: 2 + seeded(i, 4) * 8, s: 0.7 + seeded(i, 5) * 0.6 };
      }),
    [count, speed, up, spread],
  );
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) m.setColorAt(i, c.set(colors[i % colors.length]));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count, colors]);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const s = since(kick);
    const on = s >= 0 && s < dur;
    if (m.visible !== on) m.visible = on;
    if (!on) return;
    const ox = Array.isArray(origin) ? origin[0] : origin.x;
    const oy = Array.isArray(origin) ? origin[1] : origin.y;
    const oz = Array.isArray(origin) ? origin[2] : origin.z;
    const fade = 1 - s / dur;
    for (let i = 0; i < count; i++) {
      const d = seeds[i];
      if (shape === "leaf") {
        // leaves flutter down slowly instead of flying
        o.position.set(ox + d.vx * s * 0.6 + Math.sin(s * 5 + i) * 0.25, Math.max(floor, oy + d.vy * 0.25 * s - 0.15 * gravity * s * s), oz + d.vz * s * 0.6);
      } else o.position.set(ox + d.vx * s, Math.max(floor, oy + d.vy * s - 0.5 * gravity * s * s), oz + d.vz * s);
      o.rotation.set(s * d.spin, s * d.spin * 0.7, i);
      o.scale.setScalar(Math.max(size * d.s * (shape === "leaf" ? 1 : fade), 0.0001));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[shape === "leaf" ? leafGeo : boxGeo, undefined, count]} frustumCulled={false} visible={false}>
      <meshBasicMaterial side={shape === "leaf" ? THREE.DoubleSide : THREE.FrontSide} toneMapped={false} />
    </instancedMesh>
  );
}

/** A ring that swells out flat from a point and fades: a shockwave, a ping. */
export function Ripple({ kick, position, rotation = [-Math.PI / 2, 0, 0], color = C.cream, from = 0.3, to = 3, dur = 0.8, width = 0.12, delay = 0 }: { kick: Kick; position: V3; rotation?: V3; color?: string; from?: number; to?: number; dur?: number; width?: number; delay?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const s = since(kick) - delay;
    const on = s >= 0 && s < dur;
    if (m.visible !== on) m.visible = on;
    if (!on) return;
    const f = s / dur;
    m.scale.setScalar(from + (to - from) * (1 - (1 - f) * (1 - f)));
    (m.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - f);
  });
  return (
    <mesh ref={ref} position={position} rotation={rotation} visible={false}>
      <ringGeometry args={[1 - width, 1, 40]} />
      <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

/** Hint size on a world's islet: the camera stands well back there. */
export const HINT = 1.6;

/* ------------------------------------------------------------------ */
/* hints for things that already handle their own clicks               */
/* ------------------------------------------------------------------ */

/**
 * Shows the tap hint over something that already has its own click handler (which stops
 * the click from bubbling). Hides once anything inside is pressed. Never stops the event.
 */
export function Hinted({ at, scale = HINT, children, done = false }: { at: V3; scale?: number; children: ReactNode; done?: boolean }) {
  const [seen, setSeen] = useState(false);
  return (
    <group onPointerDown={() => setSeen(true)}>
      {children}
      {!seen && !done && <TapHint position={at} scale={scale} />}
    </group>
  );
}

/** A tap hint that rides along inside a moving thing, and goes once its kick first fires. */
export function HintUntil({ kick, at, scale = 1 }: { kick: Kick; at: V3; scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    const on = kick.current === NEVER;
    if (g && g.visible !== on) g.visible = on;
  });
  return (
    <group ref={ref}>
      <TapHint position={at} scale={scale} />
    </group>
  );
}

/** A click handler that also keeps the event from reaching anything behind. */
export const stop = (fn: (e: ThreeEvent<MouseEvent>) => void) => (e: ThreeEvent<MouseEvent>) => {
  e.stopPropagation();
  fn(e);
};
