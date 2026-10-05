"use client";

import { RoundedBox } from "@/world/rounded";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon } from "../../toon";
import { Label, chime, useHoverCursor } from "../../bits";
import type { DioramaProps } from "../Frame";
import { CRATE_H, Crates, Market, Painted, STALL_HINT, paint, smooth, stack, type V3 } from "./kit";
import { Tappable, TapHint } from "../../props/tappable";
import { Burst, PopText, Ripple, hump, sfx, since, squash, useKick, wiggle, type Kick } from "@/world/fx";

/*
 * MSCI: Spring Boot REST APIs for client-facing services, 82% test coverage with JUnit
 * and Gatling. A service window takes requests and hands back responses while its gears
 * turn. The coverage gauge stands on the two crates that measured it.
 */

const COVERAGE = 0.82;
const LOOP = 3.2;

function gear(r: number, teeth: number, depth: number, thick: number) {
  const s = new THREE.Shape();
  const n = teeth * 4;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = i % 4 === 1 || i % 4 === 2 ? r + depth : r;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, r * 0.32, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -thick / 2);
  return g;
}

const KIOSK: V3 = [1.55, 0, -0.85];
const LEDGE_Y = 1.03;

function Kiosk({ rush }: { rush: Kick }) {
  const shell = useMemo(
    () =>
      paint(
        [
          { g: new THREE.BoxGeometry(2.6, 2.0, 1.3), c: C.cobalt, p: [0, 1.0, 0] },
          { g: new THREE.BoxGeometry(3.0, 0.2, 1.65), c: C.coral, p: [0, 2.1, 0.05] },
          // window frame and ledge
          { g: new THREE.BoxGeometry(1.15, 0.85, 0.06), c: C.cream, p: [-0.55, 1.42, 0.64] },
          { g: new THREE.BoxGeometry(2.05, 0.08, 0.4), c: C.cream, p: [-0.95, LEDGE_Y - 0.06, 0.8] },
          { g: new THREE.BoxGeometry(0.08, 0.95, 0.08), c: C.cream, p: [-1.9, 0.5, 0.88] },
          // the gears' axles
          { g: new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8), c: C.ink, p: [0.72, 0.78, 0.7], r: [Math.PI / 2, 0, 0] },
          { g: new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8), c: C.ink, p: [0.72, 1.48, 0.7], r: [Math.PI / 2, 0, 0] },
          // the sign on the roof
          { g: new THREE.BoxGeometry(0.08, 0.4, 0.08), c: C.ink, p: [-0.5, 2.38, 0.2] },
          { g: new THREE.BoxGeometry(0.08, 0.4, 0.08), c: C.ink, p: [0.5, 2.38, 0.2] },
        ],
        true,
      ),
    [],
  );
  const inside = useMemo(() => paint([{ g: new THREE.PlaneGeometry(1.0, 0.7), c: "#1a1a3a", p: [-0.55, 1.42, 0.675] }]), []);
  const big = useMemo(() => gear(0.34, 10, 0.1, 0.16), []);
  const small = useMemo(() => gear(0.24, 7, 0.1, 0.16), []);
  const g1 = useRef<THREE.Mesh>(null);
  const g2 = useRef<THREE.Mesh>(null);
  const req = useRef<THREE.Group>(null);
  const res = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const body = useRef<THREE.Group>(null);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime % LOOP;
    // request slides in, the service works (gears race), the response slides back out
    const busy = t > 0.9 && t < 1.6 ? 1 : 0;
    const r = since(rush);
    spin.current += dt * (0.6 + busy * 3.2 + hump(r, 2) * 16);
    if (body.current) {
      squash(body.current, wiggle(r, 0.07, 16, 4));
      body.current.position.x = Math.sin(r * 70) * 0.03 * hump(r, 1.6);
    }
    if (g1.current) g1.current.rotation.z = spin.current;
    if (g2.current) g2.current.rotation.z = -spin.current * (10 / 7) + 0.2;
    if (req.current) {
      const f = smooth(t / 0.9);
      req.current.position.x = -1.8 + f * 1.25;
      req.current.visible = t < 0.95;
    }
    if (res.current) {
      const f = smooth((t - 1.6) / 0.9);
      res.current.position.x = -0.55 - f * 1.25;
      res.current.visible = t > 1.55 && t < 3.0;
    }
  });

  return (
    <group position={KIOSK}>
      <group ref={body}>
      <Painted geometry={shell} castShadow thickness={1.8} />
      <mesh geometry={inside}>
        <meshBasicMaterial vertexColors />
      </mesh>
      <mesh ref={g1} geometry={big} position={[0.72, 0.78, 0.74]}>
        <Toon color={C.sun} thickness={1.4} />
      </mesh>
      <mesh ref={g2} geometry={small} position={[0.72, 1.48, 0.74]}>
        <Toon color={C.cream} thickness={1.4} />
      </mesh>
      <RoundedBox args={[1.5, 0.62, 0.12]} radius={0.06} position={[0, 2.7, 0.2]}>
        <Toon color={C.cream} />
      </RoundedBox>
      <Label size={0.42} position={[0, 2.71, 0.27]}>
        API
      </Label>
      {/* a request token going in, a response token coming back */}
      <group ref={req} position={[-1.8, LEDGE_Y + 0.16, 0.8]}>
        <RoundedBox args={[0.42, 0.3, 0.14]} radius={0.05}>
          <Toon color={C.coral} thickness={1.2} />
        </RoundedBox>
      </group>
      <group ref={res} position={[-0.55, LEDGE_Y + 0.16, 0.8]} visible={false}>
        <RoundedBox args={[0.42, 0.3, 0.14]} radius={0.05}>
          <Toon color={C.green} thickness={1.2} />
        </RoundedBox>
      </group>
      </group>
      <Burst kick={rush} origin={[0.72, 1.1, 0.9]} count={10} colors={[C.sun, C.cream, C.steel]} size={0.1} speed={1.8} up={2.4} dur={0.9} />
      <PopText kick={rush} text="WHIRR" position={[0.4, 3.3, 0.5]} size={0.38} color={C.cobalt} />
    </group>
  );
}

/** The gauge: a dial from 0 to 100, the needle resting at 82. Click it to run the suite again. */
function Gauge({ position }: { position: V3 }) {
  const needle = useRef<THREE.Group>(null);
  const run = useRef(0);
  const { bind } = useHoverCursor();
  const [seen, setSeen] = useState(false);
  const [rerun, fireRerun] = useKick();
  // 0% at the lower left, 100% at the lower right, sweeping 240 degrees clockwise
  const angle = (f: number) => THREE.MathUtils.degToRad(210 - f * 240);
  const face = useMemo(() => {
    const parts: Parameters<typeof paint>[0] = [{ g: new THREE.CircleGeometry(0.78, 36), c: C.cream }];
    const band = (from: number, to: number, c: string) => parts.push({ g: new THREE.RingGeometry(0.56, 0.7, 24, 1, angle(to), angle(from) - angle(to)), c, p: [0, 0, 0.005] });
    band(0, 0.5, C.coral);
    band(0.5, 0.8, C.sun);
    band(0.8, 1, C.green);
    for (let i = 0; i <= 10; i++) {
      const a = angle(i / 10);
      parts.push({ g: new THREE.PlaneGeometry(0.035, i % 5 === 0 ? 0.2 : 0.12), c: C.ink, p: [Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.01], r: [0, 0, a - Math.PI / 2] });
    }
    parts.push({ g: new THREE.CircleGeometry(0.09, 16), c: C.ink, p: [0, 0, 0.03] });
    return paint(parts);
  }, []);
  const needleGeo = useMemo(() => paint([{ g: new THREE.PlaneGeometry(0.05, 0.52).translate(0, 0.22, 0), c: C.red }]), []);

  useFrame(({ clock }, dt) => {
    run.current = Math.max(0, run.current - dt * 0.45);
    // a fresh run sweeps up from zero, then settles with a small wobble
    const f = run.current > 0 ? COVERAGE * smooth(1 - run.current) : COVERAGE;
    const wobble = Math.sin(clock.elapsedTime * 2.3) * 0.006;
    if (needle.current) needle.current.rotation.z = angle(f + wobble) - Math.PI / 2;
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        run.current = 1;
        chime(1112);
        setSeen(true);
        fireRerun();
        sfx.whee();
      }}
      {...bind}
    >
      <mesh position={[0, 0, -0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.86, 0.86, 0.16, 36]} />
        <Toon color={C.ink} thickness={1.6} />
      </mesh>
      <mesh geometry={face} position={[0, 0, 0.005]}>
        <meshBasicMaterial vertexColors />
      </mesh>
      <group ref={needle} position={[0, 0, 0.03]}>
        <mesh geometry={needleGeo}>
          <meshBasicMaterial vertexColors />
        </mesh>
      </group>
      <Label size={0.3} position={[0, -0.36, 0.03]}>
        82%
      </Label>
      <group position={[0, -1.05, 0]}>
        <RoundedBox args={[1.9, 0.42, 0.1]} radius={0.05}>
          <Toon color={C.sun} thickness={1.4} />
        </RoundedBox>
        <Label size={0.24} position={[0, 0, 0.06]}>
          COVERAGE
        </Label>
      </group>
      {!seen && <TapHint position={[0, 1.35, 0]} scale={STALL_HINT} />}
      <Ripple kick={rerun} position={[0, 0, 0.05]} rotation={[0, 0, 0]} color={C.green} from={0.8} to={1.6} dur={0.6} delay={2.0} />
      <PopText kick={rerun} text="RERUN" position={[0, 1.0, 0.3]} size={0.34} color={C.cobalt} />
    </group>
  );
}

export default function Backend({ step }: DioramaProps) {
  const pile = useMemo(() => stack([[{ t: "SPRING BOOT", c: C.green }], [{ t: "REST APIS", c: C.cobalt }]], [-0.95, 0.15, -0.75], 0.08, 0.1), []);
  const plinth = useMemo(() => stack([[{ t: "GATLING", c: C.coral }], [{ t: "JUNIT", c: C.sun }]], [-3.0, 0.15, 1.5], 0.08, 0.15), []);
  const crates = useMemo(() => [...pile, ...plinth], [pile, plinth]);
  const [rush, fireRush] = useKick();
  return (
    <Market id={step.id} color={C.sun} alt={C.cream} title="BACKEND">
      {/* the service window: click it and the gears race */}
      <Tappable
        onTap={() => {
          if (since(rush) < 1) return;
          fireRush();
          sfx.whirr();
        }}
        position={[0.55, 0, 1.1]}
        hintAt={[KIOSK[0], 3.55, KIOSK[2] + 0.2]}
        hintScale={STALL_HINT / 1.05}
      >
        <group scale={1.05}>
          <Kiosk rush={rush} />
        </group>
      </Tappable>
      <Gauge position={[-3.0, 0.15 + CRATE_H * 2 + 1.26, 1.45]} />
      <Crates items={crates} />
    </Market>
  );
}
