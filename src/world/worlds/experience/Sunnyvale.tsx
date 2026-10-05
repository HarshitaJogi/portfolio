"use client";

import { Edges } from "@react-three/drei";
import { RoundedBox } from "@/world/rounded";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon } from "../../toon";
import { Label } from "../../bits";
import { Agent } from "../../pieces/Agent";
import { useIsland } from "../../state";
import { CityClock, Islet } from "../../props/basics";
import { Hills, Palm } from "../../props/nature";
import { Tappable, TapHint } from "../../props/tappable";
import { Burst, HINT, PopText, Ripple, hump, sfx, since, squash, useKick, wiggle, type Kick } from "@/world/fx";

type V3 = [number, number, number];

const UNITS = 4;
const PORTS = 8;

/**
 * Live hardware: a rack of routers with blinking ports, cabled to the bench where the
 * tests run. No product names, just the shape of a test lab.
 */
function RouterRack({ wave }: { wave: Kick }) {
  const leds = useRef<THREE.InstancedMesh>(null);
  const body = useRef<THREE.Group>(null);
  const count = UNITS * PORTS;
  const col = useMemo(() => new THREE.Color(), []);
  useLayoutEffect(() => {
    const m = leds.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let u = 0; u < UNITS; u++)
      for (let p = 0; p < PORTS; p++) {
        o.position.set(-0.62 + p * 0.18, 0.75 + u * 0.78, 0.66);
        o.updateMatrix();
        m.setMatrixAt(u * PORTS + p, o.matrix);
        m.setColorAt(u * PORTS + p, col.set(C.green));
      }
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [col]);
  const tick = useRef(-1);
  useFrame(({ clock }) => {
    const m = leds.current;
    const w = since(wave);
    if (body.current) squash(body.current, wiggle(w, 0.06, 16, 5));
    if (m && w < 2.4) {
      // a wave of light sweeping across the ports, up and down the rack
      for (let u = 0; u < UNITS; u++)
        for (let p = 0; p < PORTS; p++) {
          const v = Math.sin(p * 0.7 + u * 0.9 - w * 14);
          m.setColorAt(u * PORTS + p, col.set(v > 0.55 ? C.sun : v > -0.1 ? C.cobalt : "#1f3b2a"));
        }
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
      tick.current = -1;
      return;
    }
    const t = Math.floor(clock.elapsedTime * 6);
    if (!m || t === tick.current) return;
    tick.current = t;
    for (let i = 0; i < count; i++) {
      const x = Math.sin(i * 91.7 + t * 12.9898) * 43758.5453;
      const r = x - Math.floor(x);
      m.setColorAt(i, col.set(r > 0.82 ? C.sun : r > 0.25 ? C.green : "#1f3b2a"));
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <group ref={body}>
      <RoundedBox args={[1.9, 3.6, 1.3]} radius={0.08} position={[0, 1.8, 0]} castShadow>
        <Toon color={C.ink} />
      </RoundedBox>
      {Array.from({ length: UNITS }, (_, u) => (
        <mesh key={u} position={[0, 0.75 + u * 0.78, 0.63]}>
          <boxGeometry args={[1.65, 0.6, 0.05]} />
          <Toon color={u % 2 ? C.steel : C.silver} outline={false} />
        </mesh>
      ))}
      <instancedMesh ref={leds} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.1, 0.1, 0.04]} />
        <meshBasicMaterial />
      </instancedMesh>
      <Label size={0.2} position={[0, 3.85, 0]} outline={C.cream}>
        LIVE HARDWARE
      </Label>
    </group>
  );
}

/** Cables from the rack to the test bench, sagging a little. */
function Cables({ from, to }: { from: V3; to: V3 }) {
  const geos = useMemo(
    () =>
      [-0.3, 0, 0.3].map((dy, i) => {
        const a = new THREE.Vector3(from[0], from[1] + dy, from[2]);
        const b = new THREE.Vector3(to[0], to[1], to[2] + i * 0.25);
        const mid = a.clone().lerp(b, 0.5).setY(0.25);
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, mid, b]), 24, 0.045, 6);
      }),
    [from, to],
  );
  return (
    <>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial color={[C.cobalt, C.sun, C.coral][i]} />
        </mesh>
      ))}
    </>
  );
}

/** The next suite to port: dashed until the agent drafts it and a human approves. */
function NextSuite() {
  const { approved } = useIsland();
  return (
    <group>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshBasicMaterial transparent opacity={approved ? 0.15 : 0} color={C.green} depthWrite={false} />
        <Edges color={C.ink} lineWidth={2.5} dashed dashSize={0.16} gapSize={0.1} />
      </mesh>
      <Label size={0.2} position={[0, 1.75, 0]} outline={C.cream}>
        NEXT SUITE
      </Label>
    </group>
  );
}

/** A tall stack of printouts: the 50K+ line Python framework she extends. */
function Framework({ shuffle }: { shuffle: Kick }) {
  const sheets = 9;
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    const s = since(shuffle);
    if (s > 2) return;
    refs.current.forEach((m, i) => {
      if (!m) return;
      // each sheet hops out sideways in turn and slides back into the stack
      const h = hump(s - i * 0.06, 0.45);
      const side = i % 2 ? 1 : -1;
      m.position.set(Math.sin(i * 1.7) * 0.06 + side * h * 0.7, 0.12 + i * 0.22 + h * (0.3 + i * 0.03), Math.cos(i * 2.3) * 0.06);
      m.rotation.set(0, Math.sin(i) * 0.12 + side * h * 0.6, side * h * 0.2);
    });
  });
  return (
    <group>
      {Array.from({ length: sheets }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => void (refs.current[i] = m)}
          position={[Math.sin(i * 1.7) * 0.06, 0.12 + i * 0.22, Math.cos(i * 2.3) * 0.06]}
          rotation={[0, Math.sin(i) * 0.12, 0]}
          castShadow={i === 0}
        >
          <boxGeometry args={[1.5, 0.2, 1.1]} />
          <Toon color={i % 3 === 2 ? "#f3e6cf" : C.cream} thickness={1.2} />
        </mesh>
      ))}
      <mesh position={[0, 0.12 + sheets * 0.22, 0]}>
        <boxGeometry args={[1.1, 0.06, 0.75]} />
        <meshBasicMaterial color={C.cobalt} />
      </mesh>
      <Label size={0.26} position={[0, 0.12 + sheets * 0.22 + 0.5, 0]} outline={C.cream}>
        50K+ LINES
      </Label>
      <Label size={0.16} position={[0, 0.12 + sheets * 0.22 + 0.2, 0]} outline={C.cream}>
        PYTHON TEST FRAMEWORK
      </Label>
    </group>
  );
}

/** The California sun, low and big behind the hills. Click it and it winks. */
function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  const disc = useRef<THREE.Mesh>(null);
  const angle = useRef(0);
  const [wink, fireWink] = useKick();
  useFrame((_, dt) => {
    const s = since(wink);
    angle.current += dt * (0.1 + hump(s, 1.4) * 6);
    if (ref.current) {
      ref.current.rotation.z = angle.current;
      ref.current.scale.setScalar(1 + hump(s, 0.8) * 0.25);
    }
    // a wink: squeeze shut and pop open
    if (disc.current) disc.current.scale.set(1 + hump(s, 0.3) * 0.12, 1 - hump(s, 0.3) * 0.85, 1);
  });
  return (
    <Tappable
      onTap={() => {
        fireWink();
        sfx.whee();
        sfx.arp(1320, 3, 0.05, "sine");
      }}
      position={[10, 2.6, -40]}
      hintAt={[-7.2, 2.5, 0.5]}
      hintScale={HINT * 3.5}
    >
      <mesh ref={disc}>
        <circleGeometry args={[5, 40]} />
        <meshBasicMaterial color={C.sun} toneMapped={false} />
      </mesh>
      <mesh ref={ref} position={[0, 0, -0.1]}>
        <ringGeometry args={[5.6, 7.2, 12, 1]} />
        <meshBasicMaterial color="#ffe08a" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <PopText kick={wink} text="WINK" position={[-7.5, -0.5, 1]} size={2.4} color={C.coral} rise={2} />
    </Tappable>
  );
}

/** Nokia in Sunnyvale: golden hills, palms, a rack of live hardware, and the agent waiting at the review gate. */
export function Sunnyvale() {
  const { approved } = useIsland();
  const [wave, fireWave] = useKick();
  const [shuffle, fireShuffle] = useKick();
  const [ok, fireOk] = useKick();
  // a human approved the drafts: a ring of light around the gate and a word to go with it
  useEffect(() => {
    if (approved) fireOk();
  }, [approved, fireOk]);
  return (
    <group>
      <Islet r={11} top="#ecd39a" inner={7.8} innerColor="#a9c46a" />
      <Sun />
      <Hills position={[0, -0.9, -15]} scale={1.3} />

      {/* the work: the agent drafts tests, a human approves */}
      <group position={[0.2, 0.1, 0.9]} scale={1.4}>
        <Agent />
        {/* the human gate: press APPROVE */}
        {!approved && <TapHint position={[1.9, 2.05, 1.0]} scale={HINT / 1.4} />}
        <Ripple kick={ok} position={[1.9, 0.08, 1.0]} color={C.green} from={0.5} to={3.2} dur={0.9} width={0.1} />
        <Ripple kick={ok} position={[1.9, 0.08, 1.0]} color={C.green} from={0.5} to={3.2} dur={0.9} width={0.1} delay={0.2} />
        <PopText kick={ok} text="APPROVED" position={[1.9, 2.4, 1.2]} size={0.32} color={C.green} />
      </group>

      {/* the rack: click it and a wave of light runs across the ports */}
      <Tappable
        onTap={() => {
          fireWave();
          sfx.arp(880, 6, 0.05, "square");
        }}
        position={[-6, 0.15, -3]}
        rotation={[0, 0.4, 0]}
        hintAt={[0, 4.7, 0]}
        hintScale={HINT}
      >
        <RouterRack wave={wave} />
        <PopText kick={wave} text="BEEP BOOP" position={[0, 4.4, 0.8]} size={0.42} color={C.cobalt} />
      </Tappable>
      <Cables from={[-5.2, 1.4, -2.2]} to={[0.6, 0.4, -0.2]} />

      {/* the framework: click it and the stack shuffles */}
      <Tappable
        onTap={() => {
          if (since(shuffle) < 1) return;
          fireShuffle();
          sfx.flutter();
        }}
        position={[6.2, 0.15, -3.4]}
        rotation={[0, -0.35, 0]}
        hintAt={[0, 3.6, 0]}
        hintScale={HINT}
      >
        <Framework shuffle={shuffle} />
        <Burst kick={shuffle} origin={[0, 2.2, 0]} count={10} colors={[C.cream, C.white]} size={0.22} speed={1.8} up={2.2} dur={1.1} />
        <PopText kick={shuffle} text="SHUFFLE" position={[0, 3.3, 0.6]} size={0.4} color={C.cobalt} />
      </Tappable>
      <group position={[5.4, 0.15, 2.2]} rotation={[0, -0.3, 0]}>
        <NextSuite />
      </group>

      <Palm position={[-8.4, 0.15, 1.6]} height={4.6} phase={0.5} />
      <Palm position={[8.6, 0.15, -0.6]} height={4} lean={-0.14} phase={1.7} />
      <Palm position={[-2.6, 0.15, -7.6]} height={5} lean={0.06} phase={2.6} />
      <CityClock tz="America/Los_Angeles" city="Sunnyvale" position={[-6.4, 0.15, 4.8]} rotation={0.35} />
    </group>
  );
}
