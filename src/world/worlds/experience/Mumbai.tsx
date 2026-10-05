"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { Cloud } from "../../pieces/Cloud";
import { findEgg } from "../../eggs";
import { CityClock, Islet } from "../../props/basics";
import { Lamp, Tower } from "../../props/city";
import { Palm, Rain } from "../../props/nature";
import { Shuttle, Taxi } from "../../props/vehicles";
import { Tappable } from "../../props/tappable";
import { Burst, HINT, Hinted, PopText, Ripple, Upright, hump, seeded, sfx, since, squash, useKick, wiggle, type Kick } from "@/world/fx";

type V3 = [number, number, number];

const DECK_Y = 1.7;
const DECK_Z = -3.4;

/**
 * A cable-stayed sea bridge, the kind that crosses Mumbai's bay: twin pylons, fans of
 * cables, and a kaali-peeli taxi going back and forth.
 */
function SeaBridge() {
  const pylons = [-3.4, 3.4];
  // all sixteen stays in one geometry: one draw instead of sixteen
  const cables = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (const px of pylons) {
      for (let k = 1; k <= 4; k++) {
        for (const side of [-1, 1]) {
          const top = new THREE.Vector3(px, 7.2 - k * 0.25, DECK_Z);
          const foot = new THREE.Vector3(px + side * k * 0.95, DECK_Y + 0.15, DECK_Z);
          const mid = top.clone().add(foot).multiplyScalar(0.5);
          const d = top.clone().sub(foot);
          const g = new THREE.CylinderGeometry(0.025, 0.025, d.length(), 4);
          g.rotateZ(-Math.atan2(d.x, d.y));
          g.translate(mid.x, mid.y, mid.z);
          parts.push(g);
        }
      }
    }
    return mergeGeometries(parts)!;
    // pylons are constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const piers = useMemo<Instance[]>(() => [-8, -5.5, -1.2, 1.2, 5.5, 8].map((x) => ({ p: [x, DECK_Y / 2 - 0.2, DECK_Z] as V3 })), []);
  return (
    <group>
      <mesh position={[0, DECK_Y, DECK_Z]} castShadow receiveShadow>
        <boxGeometry args={[19, 0.32, 1.7]} />
        <Toon color={C.concrete} />
      </mesh>
      <ToonInstances items={piers} color={C.concrete} castShadow>
        <boxGeometry args={[0.45, DECK_Y + 0.4, 0.9]} />
      </ToonInstances>
      {pylons.map((x) => (
        <group key={x} position={[x, 0, DECK_Z]}>
          {/* an inverted-Y pylon */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.45, 2.4, 0]} rotation={[0, 0, s * -0.16]} castShadow>
              <boxGeometry args={[0.32, 4.6, 0.5]} />
              <Toon color={C.stone} />
            </mesh>
          ))}
          <mesh position={[0, 6.2, 0]} castShadow>
            <boxGeometry args={[0.38, 2.6, 0.5]} />
            <Toon color={C.stone} />
          </mesh>
        </group>
      ))}
      <mesh geometry={cables}>
        <meshBasicMaterial color={C.cream} />
      </mesh>
      <Shuttle from={-8.5} to={8.5} speed={2.4} y={DECK_Y + 0.16} z={DECK_Z + 0.35}>
        <HonkingTaxi hint />
      </Shuttle>
      <Shuttle from={8.5} to={-8.5} speed={1.7} phase={6} y={DECK_Y + 0.16} z={DECK_Z - 0.35}>
        <HonkingTaxi />
      </Shuttle>
    </group>
  );
}

/** A kaali-peeli that hops when honked, with a HONK that stays readable whichever way it drives. */
function HonkingTaxi({ hint = false }: { hint?: boolean }) {
  const body = useRef<THREE.Group>(null);
  const [honk, fireHonk] = useKick();
  useFrame(() => {
    const s = since(honk);
    if (body.current) {
      body.current.position.y = hump(s, 0.35) * 0.45;
      squash(body.current, wiggle(s, 0.25), 0.62);
    }
  });
  const taxi = (
    <group ref={body} scale={0.62}>
      <Taxi
        onClick={() => {
          fireHonk();
          findEgg("taxi");
        }}
      />
    </group>
  );
  return (
    <>
      {hint ? (
        <Hinted at={[0, 1.7, 0]}>
          {taxi}
        </Hinted>
      ) : (
        taxi
      )}
      {/* the shuttle turns the taxi round at each end: keep the word facing us */}
      <Upright>
        <PopText kick={honk} text="HONK" position={[0, 1.3, 0.4]} size={0.42} color={C.ink} outline={C.taxiYellow} />
      </Upright>
    </>
  );
}

/* the cloud move, hurried along: a rush of packets over the arc, and the new rack flashing */
const ARC = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-2.2, 3.15, 0.2), new THREE.Vector3(0, 5.25, 0.5), new THREE.Vector3(2.2, 3.15, 0.2));
const RUSH = 14;
function PacketRush({ kick }: { kick: Kick }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const c = new THREE.Color();
    for (let i = 0; i < RUSH; i++) m.setColorAt(i, c.set([C.sun, C.coral, C.cream][i % 3]));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const s = since(kick);
    const on = s >= 0 && s < 1.6;
    if (m.visible !== on) m.visible = on;
    if (!on) return;
    for (let i = 0; i < RUSH; i++) {
      const u = (s - i * 0.06) / 0.55;
      const live = u > 0 && u < 1;
      ARC.getPoint(Math.min(Math.max(u, 0), 1), p);
      o.position.set(p.x, p.y, p.z + (seeded(i, 2) - 0.5) * 0.5);
      o.rotation.set(s * 9 + i, s * 6, 0);
      o.scale.setScalar(live ? 1 : 0.0001);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, RUSH]} frustumCulled={false} visible={false}>
      <boxGeometry args={[0.24, 0.24, 0.24]} />
      <meshBasicMaterial />
    </instancedMesh>
  );
}

/* tower lights: an overlay of lit panes on a tower's front, flickering on in a wave */
type TowerSpec = { p: V3; h: number; w: number; d: number; color?: string };
const TOWERS: TowerSpec[] = [
  { p: [-7.4, 0.15, -6.6], h: 9, w: 2.2, d: 2 },
  { p: [-4.9, 0.15, -7.6], h: 6.6, w: 1.8, d: 1.8, color: "#d8d2c6" },
  { p: [5.6, 0.15, -7.4], h: 8, w: 2, d: 2, color: "#cfc6b8" },
  { p: [8, 0.15, -5.4], h: 5.2, w: 1.8, d: 1.8 },
];
function TowerLights({ t, k, kick }: { t: TowerSpec; k: number; kick: Kick }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const rows = Math.round(t.h / 0.9);
  const n = rows * 3;
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const s = since(kick) - k * 0.15;
    const on = s >= 0 && s < 3.4;
    if (m.visible !== on) m.visible = on;
    if (!on) return;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < 3; c++) {
        const i = r * 3 + c;
        // each pane catches as the wave climbs, flickers once, then holds and goes out
        const at = r * 0.07 + seeded(i, k) * 0.25;
        const flick = s > at + 0.08 && s < at + 0.16;
        const lit = s > at && !flick && s < 2.6 + seeded(i, k + 9) * 0.7;
        o.position.set(-t.w / 2 + (t.w / 3) * (c + 0.5), 0.4 + ((t.h - 0.4) / rows) * (r + 0.5), t.d / 2 + 0.02);
        o.scale.setScalar(lit ? 1 : 0.0001);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
      }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} frustumCulled={false} visible={false} position={t.p}>
      <planeGeometry args={[t.w / 3 - 0.18, 0.5]} />
      <meshBasicMaterial color="#ffd23f" toneMapped={false} />
    </instancedMesh>
  );
}

function Skyline() {
  const [lights, fireLights] = useKick();
  const tall = useRef<THREE.Group>(null);
  useFrame(() => {
    if (tall.current) squash(tall.current, wiggle(since(lights), 0.06, 14, 4));
  });
  return (
    <Tappable
      onTap={() => {
        fireLights();
        sfx.arp(523, 6, 0.08, "square");
      }}
      hintAt={[-4.9, 8.1, -7.6]}
      hintScale={HINT}
    >
      {TOWERS.map((t, k) => (
        <group key={k} ref={k === 0 ? tall : undefined} position={k === 0 ? t.p : undefined}>
          <Tower position={k === 0 ? [0, 0, 0] : t.p} h={t.h} w={t.w} d={t.d} color={t.color} />
        </group>
      ))}
      {TOWERS.map((t, k) => (
        <TowerLights key={k} t={t} k={k} kick={lights} />
      ))}
      <PopText kick={lights} text="LIGHTS ON" position={[-6.2, 9.6, -5.4]} size={0.5} color={C.ink} outline={C.sun} />
    </Tappable>
  );
}

/* the monsoon cloud: click it for a lightning bolt, a flash, and thunder */
function boltShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.25, 0);
  s.lineTo(0.35, 0);
  s.lineTo(0.05, -1.3);
  s.lineTo(0.5, -1.3);
  s.lineTo(-0.35, -3.6);
  s.lineTo(-0.05, -1.75);
  s.lineTo(-0.45, -1.75);
  s.lineTo(-0.25, 0);
  return s;
}
const RAIN_AT: V3 = [6.9, 0.5, -1.4];
const RAIN_AREA: V3 = [4.5, 5.6, 3.5];
function Monsoon() {
  const [boom, fireBoom] = useKick();
  const shake = useRef<THREE.Group>(null);
  const bolt = useRef<THREE.Mesh>(null);
  const flash = useRef<THREE.Mesh>(null);
  const shape = useMemo(() => boltShape(), []);
  useFrame(() => {
    const s = since(boom);
    if (shake.current) shake.current.position.x = Math.sin(s * 60) * 0.12 * hump(s, 0.9);
    if (bolt.current) bolt.current.visible = (s > 0 && s < 0.12) || (s > 0.2 && s < 0.45);
    if (flash.current) {
      const f = s > 0 && s < 0.6 ? (s < 0.12 ? 1 : s > 0.2 && s < 0.32 ? 0.8 : 0.25 * (1 - s / 0.6)) : 0;
      flash.current.visible = f > 0;
      (flash.current.material as THREE.MeshBasicMaterial).opacity = f * 0.55;
    }
  });
  return (
    <Tappable
      onTap={() => {
        if (since(boom) < 1) return;
        fireBoom();
        sfx.thunder();
      }}
      hintAt={[RAIN_AT[0], RAIN_AT[1] + RAIN_AREA[1] + 2.6, RAIN_AT[2]]}
      hintScale={HINT}
    >
      <group ref={shake}>
        <Rain position={RAIN_AT} area={RAIN_AREA} count={40} />
      </group>
      {/* an easy target over the cloud */}
      <mesh position={[RAIN_AT[0], RAIN_AT[1] + RAIN_AREA[1] + 0.5, RAIN_AT[2]]} visible={false}>
        <sphereGeometry args={[2.6, 10, 8]} />
        <meshBasicMaterial />
      </mesh>
      <mesh ref={bolt} position={[RAIN_AT[0] + 0.2, RAIN_AT[1] + RAIN_AREA[1], RAIN_AT[2] + 1.2]} scale={1.4} visible={false}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color={C.sun} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={flash} position={[RAIN_AT[0], RAIN_AT[1] + RAIN_AREA[1] + 0.4, RAIN_AT[2]]} visible={false}>
        <sphereGeometry args={[3.4, 16, 12]} />
        <meshBasicMaterial color={C.white} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <PopText kick={boom} text="BOOM" position={[RAIN_AT[0] - 2.2, RAIN_AT[1] + RAIN_AREA[1] + 1.4, RAIN_AT[2] + 2]} size={0.7} color={C.cobalt} outline={C.cream} />
    </Tappable>
  );
}

/** The seafront curve with its lamps: lit up at dusk, the way Marine Drive is. */
function Seafront() {
  const lamps: V3[] = useMemo(() => {
    // spaced to leave the front left clear, where the traveler and the plane stand
    return [-0.9, -0.6, 0.12, 0.5, 0.9].map((d): V3 => {
      const a = -Math.PI / 2 + d;
      return [Math.cos(a) * 9.1, 0.15, -Math.sin(a) * 9.1];
    });
  }, []);
  return (
    <group>
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.9, 9.4, 48, 1, -Math.PI / 2 - 1, 2]} />
        <meshBasicMaterial color={C.cream} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9.4, 9.6, 48, 1, -Math.PI / 2 - 1, 2]} />
        <meshBasicMaterial color={C.stone} />
      </mesh>
      {lamps.map((p, i) => (
        <Lamp key={i} position={p} h={1.7} />
      ))}
    </group>
  );
}

/** MSCI in Mumbai: the cloud migration, set between the skyline, the sea bridge, and the seafront. */
export function Mumbai() {
  const [rush, fireRush] = useKick();
  return (
    <group>
      <Islet r={11} top="#e9d6b4" inner={7.6} innerColor="#d9c7a3" />
      {/* skyline: click it and the windows flicker on */}
      <Skyline />
      <SeaBridge />

      {/* the work: 15+ APIs moving from one cloud to another. Click to hurry a batch along. */}
      <Tappable
        onTap={() => {
          fireRush();
          sfx.whoosh();
          sfx.arp(784, 5, 0.09, "sine");
        }}
        position={[0, 0.1, 1.6]}
        hintAt={[0, 6.3, 0.4]}
        hintScale={HINT}
      >
        <group scale={1.3}>
          <Cloud />
          <PacketRush kick={rush} />
          <Ripple kick={rush} position={[2.2, 2.3, 0.75]} rotation={[0, 0, 0]} color={C.green} from={0.3} to={1.8} dur={0.7} delay={0.6} />
          <Burst kick={rush} origin={[2.2, 2.6, 0.4]} count={12} colors={[C.green, C.cream, C.sun]} size={0.13} up={2.6} speed={1.6} dur={1.1} />
        </group>
        <PopText kick={rush} text="WHOOSH" position={[0, 7.2, 0.6]} size={0.5} color={C.cobalt} />
      </Tappable>

      <Seafront />
      <Palm position={[-6.2, 0.15, 2.6]} height={3.6} phase={1} />
      <Palm position={[6.6, 0.15, 3.1]} height={3.2} lean={-0.15} phase={2} />
      <CityClock tz="Asia/Kolkata" city="Mumbai" position={[-8.3, 0.15, 3.9]} rotation={0.45} />
      {/* monsoon, rolling in over the bay: click the cloud for thunder */}
      <Monsoon />
    </group>
  );
}
