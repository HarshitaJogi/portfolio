"use client";

import { RoundedBox } from "@/world/rounded";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { Label, chime, useHoverCursor } from "../../bits";
import { Islet } from "../../props/basics";
import { merge, put, type V3 } from "./parts";
import { Tappable, TapHint } from "../../props/tappable";
import { Burst, HINT, PopText, hump, sfx, since, useKick, wiggle, type Kick } from "@/world/fx";

const FLOOR = 0.15;
const ROSTRUM = { x: -0.4, z: -3.4, w: 7.8, d: 4.0, h: 0.45 };
const TOP = FLOOR + ROSTRUM.h;
const PODIUM: V3 = [0.6, TOP, -2.5];
const PODIUM_S = 1.3;
/** The mic's head, in islet space. */
const MIC: V3 = [PODIUM[0] + 0.35 * PODIUM_S, TOP + 2.34 * PODIUM_S, PODIUM[2] + 0.27 * PODIUM_S];

/* ------------------------------------------------------------------ */
/* the blackboard: boxes and arrows, the way a system gets explained    */
/* ------------------------------------------------------------------ */

function useChalk() {
  return useMemo(() => {
    const L = 0.055; // chalk line width
    const line = (x0: number, y0: number, x1: number, y1: number) => {
      const len = Math.hypot(x1 - x0, y1 - y0);
      return put(new THREE.PlaneGeometry(len + L, L), [(x0 + x1) / 2, (y0 + y1) / 2, 0], [0, 0, Math.atan2(y1 - y0, x1 - x0)]);
    };
    const box = (x: number, y: number, w: number, h: number) => [line(x - w / 2, y - h / 2, x + w / 2, y - h / 2), line(x - w / 2, y + h / 2, x + w / 2, y + h / 2), line(x - w / 2, y - h / 2, x - w / 2, y + h / 2), line(x + w / 2, y - h / 2, x + w / 2, y + h / 2)];
    // a head pointing along the direction of travel (angle a)
    const head = (x: number, y: number, a: number) => put(new THREE.CircleGeometry(0.13, 3), [x, y, 0], [0, 0, a]);
    const y = 0.3;
    return merge([
      // three boxes and the arrows between them: how a system gets explained
      ...box(-1.0, y, 0.62, 0.46),
      ...box(0, y, 0.62, 0.46),
      ...box(1.0, y, 0.62, 0.46),
      line(-0.66, y, -0.42, y),
      head(-0.37, y, 0),
      line(0.34, y, 0.58, y),
      head(0.63, y, 0),
      // and the loop back underneath, the part that always needs explaining
      line(1.0, y - 0.26, 1.0, -0.38),
      line(1.0, -0.38, -1.0, -0.38),
      line(-1.0, -0.38, -1.0, y - 0.34),
      head(-1.0, y - 0.3, Math.PI / 2),
    ]);
  }, []);
}

function Blackboard({ position, rotation = 0 }: { position: V3; rotation?: number }) {
  const chalk = useChalk();
  const lines = useRef<THREE.Mesh>(null);
  const [aha, fireAha] = useKick();
  const cream = useMemo(() => new THREE.Color(C.cream), []);
  const gold = useMemo(() => new THREE.Color(C.sun), []);
  useFrame(() => {
    const m = lines.current;
    if (!m) return;
    const s = since(aha);
    // the diagram lights up, box by box, then dims back to chalk
    (m.material as THREE.MeshBasicMaterial).color.copy(cream).lerp(gold, hump(s, 1.2));
    m.scale.setScalar(1 + wiggle(s, 0.06, 18, 5));
  });
  const wood = useMemo(
    () =>
      merge([
        put(new THREE.BoxGeometry(0.14, 2.9, 0.14), [-1.5, 1.45, -0.05]),
        put(new THREE.BoxGeometry(0.14, 2.9, 0.14), [1.5, 1.45, -0.05]),
        // the frame, and the chalk tray along its foot
        put(new THREE.BoxGeometry(3.4, 2.1, 0.16), [0, 2.3, 0]),
        put(new THREE.BoxGeometry(3.2, 0.06, 0.2), [0, 1.22, 0.14]),
      ]),
    [],
  );
  return (
    <Tappable
      onTap={() => {
        fireAha();
        sfx.arp(587, 3, 0.1, "triangle");
      }}
      position={position}
      rotation={[0, rotation, 0]}
      hintAt={[1.1, 3.8, 0.2]}
      hintScale={HINT}
    >
      <mesh geometry={wood} castShadow>
        <Toon color={C.bark} thickness={1.8} />
      </mesh>
      <group position={[0, 2.3, 0]}>
        <mesh position={[0, 0, 0.085]}>
          <planeGeometry args={[3.1, 1.8]} />
          <meshBasicMaterial color={C.pcb} />
        </mesh>
        <mesh ref={lines} geometry={chalk} position={[0, 0.05, 0.09]}>
          <meshBasicMaterial color={C.cream} />
        </mesh>
      </group>
      <PopText kick={aha} text="AHA" position={[-0.9, 3.7, 0.4]} size={0.5} color={C.sun} outline={C.ink} />
    </Tappable>
  );
}

/* ------------------------------------------------------------------ */
/* the podium and its microphone                                        */
/* ------------------------------------------------------------------ */

function usePodium() {
  return useMemo(
    () => ({
      // the front panel and the slanted reading top
      cream: merge([put(new THREE.BoxGeometry(0.85, 0.9, 0.04), [0, 0.85, 0.43]), put(new THREE.BoxGeometry(1.45, 0.12, 1.0), [0, 1.66, -0.02], [0.32, 0, 0])]),
      // gooseneck and handle
      mic: merge([put(new THREE.CylinderGeometry(0.03, 0.03, 0.62, 6), [0.35, 1.95, 0], [0.5, 0, 0]), put(new THREE.CapsuleGeometry(0.1, 0.18, 4, 10), [0.35, 2.25, 0.16], [0.9, 0, 0])]),
    }),
    [],
  );
}

function Podium({ position, onTap }: { position: V3; onTap: () => void }) {
  const { bind } = useHoverCursor();
  const [seen, setSeen] = useState(false);
  const { cream, mic } = usePodium();
  return (
    <group position={position}>
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[1.25, 1.56, 0.85]} />
        <Toon color={C.coral} />
      </mesh>
      <mesh geometry={cream}>
        <Toon color={C.cream} thickness={1.6} />
      </mesh>
      {/* notes on it */}
      <mesh position={[-0.18, 1.74, 0.02]} rotation={[0.32 - Math.PI / 2, 0, 0.12]}>
        <planeGeometry args={[0.55, 0.7]} />
        <meshBasicMaterial color={C.white} />
      </mesh>
      {/* the microphone on a gooseneck: click it */}
      <group onClick={(e) => (e.stopPropagation(), setSeen(true), onTap())} {...bind}>
        <mesh geometry={mic}>
          <Toon color={C.ink} thickness={1.4} />
        </mesh>
        <mesh position={[0.35, 2.34, 0.27]}>
          <sphereGeometry args={[0.12, 12, 10]} />
          <Toon color={C.steel} outline={false} />
        </mesh>
        <mesh position={[0.35, 2.15, 0.15]} visible={false}>
          <sphereGeometry args={[0.45, 8, 6]} />
          <meshBasicMaterial />
        </mesh>
        {!seen && <TapHint position={[0.35, 3.0, 0.27]} scale={HINT / 1.3} />}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* speech bubbles: they rise from the mic, drift, and pop               */
/* ------------------------------------------------------------------ */

function bubbleShape(w: number, h: number) {
  const r = 0.28;
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  // the tail, pointing down toward the mic
  s.lineTo(-w / 2 + 0.38, -h / 2);
  s.lineTo(-w / 2 + 0.12, -h / 2 - 0.34);
  s.lineTo(-w / 2 + 0.72, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

const BW = 1.5;
const BH = 0.95;
const PERIOD = 4.8;

/** What each bubble says, in pictures: a thought, a diagram, and "got it". */
function useBubbleArt() {
  return useMemo(() => {
    const shell = new THREE.ExtrudeGeometry(bubbleShape(BW, BH), { depth: 0.14, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 6 });
    shell.translate(0, 0, -0.07);
    const dots = merge([-0.36, 0, 0.36].map((x) => put(new THREE.CircleGeometry(0.11, 14), [x, 0, 0])));
    const boxA = put(new THREE.PlaneGeometry(0.36, 0.36), [-0.38, 0, 0]);
    const boxB = put(new THREE.PlaneGeometry(0.36, 0.36), [0.38, 0, 0]);
    const arrow = merge([put(new THREE.PlaneGeometry(0.22, 0.06), [-0.04, 0, 0]), put(new THREE.CircleGeometry(0.1, 3), [0.1, 0, 0])]);
    const tick = merge([put(new THREE.PlaneGeometry(0.28, 0.1), [-0.16, -0.06, 0], [0, 0, -Math.PI / 4]), put(new THREE.PlaneGeometry(0.62, 0.1), [0.12, 0.06, 0], [0, 0, Math.PI / 3.6])]);
    return { shell, dots, boxA, boxB, arrow, tick };
  }, []);
}

function Bubbles({ tapped }: { tapped: React.RefObject<number> }) {
  const art = useBubbleArt();
  const refs = useRef<(THREE.Group | null)[]>([]);
  const phase = useRef(0);
  useFrame(({ clock }, dt) => {
    const now = clock.elapsedTime;
    // a tap on the mic hurries every bubble along for a moment
    const boost = Math.max(0, 1 - (now - tapped.current) / 1.25);
    phase.current += dt * (1 + boost * 3);
    refs.current.forEach((g, i) => {
      if (!g) return;
      const t = ((phase.current / PERIOD + i / 3) % 1 + 1) % 1;
      const appear = Math.min(t / 0.08, 1);
      let s = appear < 1 ? Math.sin(appear * Math.PI * 0.5) * (1 + 0.15 * Math.sin(appear * Math.PI)) : 1;
      if (t > 0.86) {
        // pop: a quick swell, then gone
        const p = (t - 0.86) / 0.06;
        s = p < 1 ? 1 + p * 0.25 : 0;
      }
      g.scale.setScalar(Math.max(s, 0.0001));
      g.visible = s > 0.001;
      g.position.set(MIC[0] + 0.9 + t * 1.6 + Math.sin(t * 6 + i) * 0.15, MIC[1] + 0.9 + t * 3.6, MIC[2] + 0.4);
      g.rotation.z = Math.sin(now * 1.2 + i * 2) * 0.06;
    });
  });
  const contents = [
    <mesh key="dots" geometry={art.dots} position={[0, 0, 0.13]}>
      <meshBasicMaterial color={C.ink} />
    </mesh>,
    <group key="diagram" position={[0, 0, 0.13]}>
      <mesh geometry={art.boxA}>
        <meshBasicMaterial color={C.cobalt} />
      </mesh>
      <mesh geometry={art.arrow}>
        <meshBasicMaterial color={C.ink} />
      </mesh>
      <mesh geometry={art.boxB}>
        <meshBasicMaterial color={C.coral} />
      </mesh>
    </group>,
    <mesh key="tick" geometry={art.tick} position={[0, 0, 0.13]}>
      <meshBasicMaterial color={C.green} />
    </mesh>,
  ];
  return (
    <group>
      {contents.map((c, i) => (
        <group key={i} ref={(el) => void (refs.current[i] = el)}>
          <mesh geometry={art.shell}>
            <Toon color={C.white} thickness={2} />
          </mesh>
          {c}
        </group>
      ))}
    </group>
  );
}

/** Sound rings out of the mic when it is tapped. */
function Rings({ tapped }: { tapped: React.RefObject<number> }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const since = clock.elapsedTime - tapped.current;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const t = since - i * 0.18;
      const on = t > 0 && t < 0.9;
      m.visible = on;
      if (!on) return;
      m.scale.setScalar(0.4 + t * 1.6);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - t / 0.9);
    });
  });
  return (
    <group position={[MIC[0] + 0.35, MIC[1] + 0.1, MIC[2] + 0.55]} rotation={[0, -0.15, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => void (refs.current[i] = el)} visible={false} rotation={[0, 0, -Math.PI / 2 + 0.2]}>
          <ringGeometry args={[0.5, 0.58, 24, 1, -0.9, 1.8]} />
          <meshBasicMaterial color={C.ink} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* the certificate on an easel                                          */
/* ------------------------------------------------------------------ */

function Certificate({ position, rotation = 0 }: { position: V3; rotation?: number }) {
  const seal = useRef<THREE.Group>(null);
  const board = useRef<THREE.Group>(null);
  const [shine, fireShine] = useKick();
  useFrame(({ clock }) => {
    const s = since(shine);
    if (seal.current) {
      seal.current.rotation.z = Math.sin(clock.elapsedTime * 1.3) * 0.08;
      seal.current.rotation.y = s < 0.9 ? (s / 0.9) * Math.PI * 4 : 0;
      seal.current.scale.setScalar(1 + hump(s, 0.9) * 0.6);
    }
    if (board.current) board.current.rotation.z = wiggle(s, 0.05, 14, 4);
  });
  const legs: Instance[] = [
    { p: [-1.05, 1.35, 0.1], s: [0.13, 2.8, 0.13], r: [-0.12, 0, 0.13] },
    { p: [1.05, 1.35, 0.1], s: [0.13, 2.8, 0.13], r: [-0.12, 0, -0.13] },
    { p: [0, 1.3, -0.6], s: [0.13, 2.7, 0.13], r: [0.3, 0, 0] },
    // the ledge it rests on
    { p: [0, 1.05, 0.22], s: [2.9, 0.1, 0.3], r: [-0.12, 0, 0] },
  ];
  const tails = useMemo(() => merge([-0.09, 0.09].map((x) => put(new THREE.PlaneGeometry(0.13, 0.42), [x, -0.22, -0.01], [0, 0, x > 0 ? -0.25 : 0.25]))), []);
  return (
    <Tappable
      onTap={() => {
        fireShine();
        chime(1320);
        sfx.arp(1046, 3, 0.07, "sine");
      }}
      position={position}
      rotation={[0, rotation, 0]}
      hintAt={[0, 3.6, 0.2]}
      hintScale={HINT}
    >
      <ToonInstances items={legs} color={C.bark} thickness={1.6} castShadow>
        <boxGeometry />
      </ToonInstances>
      <group ref={board} position={[0, 2.08, 0.16]} rotation={[-0.12, 0, 0]}>
        <RoundedBox args={[3.1, 1.95, 0.1]} radius={0.04} castShadow>
          <Toon color={C.gold} />
        </RoundedBox>
        <mesh position={[0, 0, 0.055]}>
          <planeGeometry args={[2.85, 1.7]} />
          <meshBasicMaterial color={C.cream} />
        </mesh>
        <Label size={0.44} color={C.ink} position={[0, 0.36, 0.07]}>
          GRADE 5
        </Label>
        {/* a ribbon banner with the result */}
        <mesh position={[0, -0.24, 0.065]}>
          <planeGeometry args={[2.68, 0.42]} />
          <meshBasicMaterial color={C.red} />
        </mesh>
        <Label size={0.25} color={C.cream} position={[0, -0.23, 0.08]}>
          DISTINCTION
        </Label>
        {/* the seal, with its ribbon tails */}
        <group ref={seal} position={[1.32, -0.8, 0.1]}>
          <mesh geometry={tails}>
            <meshBasicMaterial color={C.cobalt} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.06, 12]} />
            <Toon color={C.sun} thickness={1.6} />
          </mesh>
        </group>
      </group>
      <Burst kick={shine} origin={[1.3, 1.4, 0.4]} count={12} colors={[C.sun, C.cobalt, C.cream]} size={0.1} speed={1.6} up={2.4} dur={0.9} />
      <PopText kick={shine} text="DING" position={[1.1, 3.4, 0.5]} size={0.42} color={C.cobalt} />
    </Tappable>
  );
}

/* ------------------------------------------------------------------ */
/* a small audience                                                     */
/* ------------------------------------------------------------------ */

/** A few low bushes around the lawn. */
const BUSHES: Instance[] = [
  { p: [3.0, TOP + 0.3, -4.4], s: [0.9, 0.68, 0.9], color: C.leaf },
  { p: [-4.4, FLOOR + 0.35, 1.0], s: [1, 0.75, 1], color: C.grassDark },
  { p: [5.2, FLOOR + 0.3, -1.8], s: [0.8, 0.6, 0.8], color: C.leaf },
];

const SEATS: { p: V3; color: string }[] = [
  { p: [-2.1, FLOOR, 3.6], color: C.cobalt },
  { p: [-0.2, FLOOR, 3.8], color: C.sun },
  { p: [1.7, FLOOR, 3.6], color: C.green },
  // the back row sits to the right: the front left is where the traveler stands
  { p: [1.7, FLOOR, 5.6], color: C.rose },
  { p: [3.6, FLOOR, 5.1], color: C.teal },
];

type Part = { p: V3; s: V3; r?: V3; color?: string; chair: number };

/** The audience. Click a chair and the whole room bounces in its seats, applauding. */
function Chairs({ clap }: { clap: Kick }) {
  const sets = useMemo(() => {
    const seats: Part[] = [];
    const backs: Part[] = [];
    const legs: Part[] = [];
    SEATS.forEach(({ p, color }, chair) => {
      // facing the podium, so their backs are to us
      const yaw = Math.atan2(PODIUM[0] - p[0], PODIUM[2] - p[2]) + Math.PI;
      const fwd = (d: number, s: number): V3 => [p[0] - Math.sin(yaw) * d + Math.cos(yaw) * s, 0, p[2] - Math.cos(yaw) * d - Math.sin(yaw) * s];
      const seat = fwd(0, 0);
      seats.push({ p: [seat[0], p[1] + 0.6, seat[2]], s: [1.0, 0.14, 0.92], r: [0, yaw, 0], color, chair });
      const back = fwd(-0.42, 0);
      backs.push({ p: [back[0], p[1] + 1.1, back[2]], s: [1.0, 0.9, 0.12], r: [-0.08, yaw, 0], color, chair });
      for (const [d, s] of [
        [0.37, 0.4],
        [0.37, -0.4],
        [-0.37, 0.4],
        [-0.37, -0.4],
      ]) {
        const q = fwd(d, s);
        legs.push({ p: [q[0], p[1] + 0.3, q[2]], s: [0.08, 0.6, 0.08], chair });
      }
    });
    const matrices = (parts: Part[]) => {
      const o = new THREE.Object3D();
      return parts.map((it) => {
        o.position.set(...it.p);
        o.rotation.set(...(it.r ?? [0, 0, 0]));
        o.scale.set(...it.s);
        o.updateMatrix();
        return o.matrix.clone();
      });
    };
    return [seats, backs, legs].map((parts) => ({ parts, base: matrices(parts) }));
  }, []);
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const lift = useMemo(() => new THREE.Matrix4(), []);
  const scratch = useMemo(() => new THREE.Matrix4(), []);
  const resting = useRef(false);

  const place = (s: number) => {
    sets.forEach(({ parts, base }, k) => {
      const m = refs.current[k];
      if (!m) return;
      parts.forEach((it, i) => {
        // a ripple of hops along the rows, each chair a beat after the last
        const h = hump(s - it.chair * 0.1, 0.32) * 0.45 + hump(s - 0.55 - it.chair * 0.1, 0.32) * 0.3;
        lift.makeTranslation(0, h, 0);
        m.setMatrixAt(i, scratch.multiplyMatrices(lift, base[i]));
      });
      m.instanceMatrix.needsUpdate = true;
    });
  };
  useLayoutEffect(() => {
    const c = new THREE.Color();
    place(9);
    sets.forEach(({ parts }, k) => {
      const m = refs.current[k];
      if (!m) return;
      parts.forEach((it, i) => it.color && m.setColorAt(i, c.set(it.color)));
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
      m.computeBoundingSphere();
      if (m.boundingSphere) m.boundingSphere.radius += 1;
      m.traverse((ch) => {
        if (ch !== m && (ch as THREE.InstancedMesh).isInstancedMesh) (ch as THREE.InstancedMesh).boundingSphere = m.boundingSphere;
      });
    });
    // place() only reads memoised data and refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sets]);
  useFrame(() => {
    const s = since(clap);
    const busy = s < 1.6;
    if (!busy && resting.current) return;
    place(busy ? s : 9);
    resting.current = !busy;
  });
  return (
    <group>
      {sets.map(({ parts }, k) => (
        <instancedMesh key={k} ref={(m) => void (refs.current[k] = m)} args={[undefined, undefined, parts.length]} castShadow={k < 2}>
          <boxGeometry />
          {k < 2 ? <Toon color={C.white} thickness={1.6} /> : <Toon color={C.ink} outline={false} />}
        </instancedMesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Communication Skills, Grade 5, with Distinction. A podium with a mic that talks
 * in speech bubbles, a blackboard of boxes and arrows, a small audience, and the
 * certificate on an easel.
 */
const CONFETTI_AT: V3[] = [
  [-1.0, 1.8, 3.7],
  [2.6, 1.8, 5.3],
];

export function Voice() {
  const [clap, fireClap] = useKick();
  const tapped = useRef(-10);
  const clockRef = useRef(0);
  useFrame(({ clock }) => {
    clockRef.current = clock.elapsedTime;
  });
  const tap = () => {
    tapped.current = clockRef.current;
    chime(520);
    setTimeout(() => chime(780), 120);
  };
  return (
    <group>
      <Islet r={11} top={C.sand} inner={8.4} innerColor={C.grass} />
      {/* the rostrum */}
      <mesh position={[ROSTRUM.x, FLOOR + ROSTRUM.h / 2, ROSTRUM.z]} castShadow receiveShadow>
        <boxGeometry args={[ROSTRUM.w, ROSTRUM.h, ROSTRUM.d]} />
        <Toon color={C.cobalt} />
      </mesh>
      <mesh position={[ROSTRUM.x, TOP + 0.02, ROSTRUM.z]} receiveShadow>
        <boxGeometry args={[ROSTRUM.w - 0.3, 0.04, ROSTRUM.d - 0.3]} />
        <Toon color={C.cream} outline={false} />
      </mesh>
      <Blackboard position={[-2.2, TOP, -4.6]} rotation={0.12} />
      <group position={PODIUM} scale={PODIUM_S} rotation={[0, -0.1, 0]}>
        <Podium position={[0, 0, 0]} onTap={tap} />
      </group>
      <Bubbles tapped={tapped} />
      <Rings tapped={tapped} />
      <Certificate position={[3.0, FLOOR, 1.5]} rotation={-0.4} />
      {/* the audience: click a chair for a round of applause */}
      <Tappable
        onTap={() => {
          if (since(clap) < 1.2) return;
          fireClap();
          sfx.applause();
        }}
        hintAt={[-0.2, 2.7, 3.8]}
        hintScale={HINT}
      >
        <Chairs clap={clap} />
        {CONFETTI_AT.map((p, i) => (
          <Burst key={i} kick={clap} origin={p} count={8} colors={[C.sun, C.coral, C.cobalt, C.green]} size={0.1} speed={1.4} up={3} dur={1.2} />
        ))}
        <PopText kick={clap} text="CLAP CLAP" position={[-1.4, 2.5, 4.6]} size={0.5} color={C.coral} />
      </Tappable>
      <ToonInstances items={BUSHES} thickness={1.6}>
        <icosahedronGeometry args={[0.6, 0]} />
      </ToonInstances>
    </group>
  );
}
