"use client";

import { RoundedBox } from "@/world/rounded";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { Label } from "../../bits";
import type { DioramaProps } from "../Frame";
import { Crates, Market, Painted, STALL_HINT, paint, smooth, stack, type V3 } from "./kit";
import { Tappable } from "../../props/tappable";
import { Burst, PopText, Ripple, sfx, since, squash, useKick, wiggle } from "@/world/fx";

/*
 * MSCI moved 15+ APIs from Azure to GCP on Kubernetes and Docker, with CI/CD releases
 * scanned by SonarQube. Bitgig ran on Cloud Run, Cloud Storage and Vercel.
 * Containers stacked under a ship's wheel (the orchestration), and a release belt that
 * carries builds through a scanner arch and up into the cloud.
 */

const BOX: V3 = [0.3, 0, 0.2];
const CONTAINERS: { p: V3; c: string; rib: string }[] = [
  { p: [-0.78, 0.34, 0], c: C.coral, rib: "#d9543a" },
  { p: [0.78, 0.34, 0], c: C.cobalt, rib: "#2448c9" },
  { p: [0, 1.02, 0.05], c: C.sun, rib: "#e0a92a" },
];

function containerStack() {
  const parts: Parameters<typeof paint>[0] = [];
  CONTAINERS.forEach(({ p, c, rib }) => {
    parts.push({ g: new THREE.BoxGeometry(1.5, 0.66, 0.68), c, p });
    for (let i = 0; i < 8; i++) parts.push({ g: new THREE.BoxGeometry(0.05, 0.52, 0.03), c: rib, p: [p[0] - 0.6 + i * 0.172, p[1], p[2] + 0.35] });
    // door end: two bars
    parts.push({ g: new THREE.BoxGeometry(0.03, 0.56, 0.6), c: rib, p: [p[0] + 0.76, p[1], p[2]] });
  });
  // the post the wheel turns on
  parts.push({ g: new THREE.CylinderGeometry(0.09, 0.12, 1.2, 8), c: C.bark, p: [0, 1.95, -0.05] });
  return paint(parts, true);
}

function wheel() {
  const parts: Parameters<typeof paint>[0] = [
    { g: new THREE.TorusGeometry(0.58, 0.07, 8, 32), c: C.bark },
    { g: new THREE.CylinderGeometry(0.16, 0.16, 0.16, 12), c: C.sun, r: [Math.PI / 2, 0, 0] },
  ];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    parts.push({ g: new THREE.CylinderGeometry(0.035, 0.035, 0.58, 6), c: C.bark, p: [Math.cos(a) * 0.29, Math.sin(a) * 0.29, 0], r: [0, 0, a - Math.PI / 2] });
    parts.push({ g: new THREE.CapsuleGeometry(0.055, 0.2, 3, 6), c: C.bark, p: [Math.cos(a) * 0.78, Math.sin(a) * 0.78, 0], r: [0, 0, a - Math.PI / 2] });
  }
  return paint(parts, true);
}

function Containers() {
  const stackGeo = useMemo(() => containerStack(), []);
  const wheelGeo = useMemo(() => wheel(), []);
  const helm = useRef<THREE.Mesh>(null);
  const boxes = useRef<THREE.Mesh>(null);
  const [steer, fireSteer] = useKick();
  useFrame(({ clock }) => {
    const s = since(steer);
    // a hard spin: two full turns, easing out
    const spin = s < 1.6 ? smooth(s / 1.6) * Math.PI * 4 : 0;
    // steering: a slow turn one way, then the other
    if (helm.current) helm.current.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.9 + spin;
    if (boxes.current) squash(boxes.current, wiggle(s - 0.2, 0.05, 18, 4));
  });
  return (
    <group position={BOX}>
      <Painted refMesh={boxes} geometry={stackGeo} castShadow thickness={1.8} />
      {/* the wheel: give it a spin */}
      <Tappable
        onTap={() => {
          if (since(steer) < 1.2) return;
          fireSteer();
          sfx.whoosh(0.9);
          sfx.clank(0.6);
        }}
        hintAt={[0, 3.65, 0.1]}
        hintScale={STALL_HINT}
      >
        <Painted refMesh={helm} geometry={wheelGeo} position={[0, 2.55, 0.08]} castShadow thickness={1.4} />
        <PopText kick={steer} text="WHEE" position={[1.1, 3.2, 0.4]} size={0.36} color={C.teal} />
      </Tappable>
      <group position={[0, 1.02, 0.4]}>
        <RoundedBox args={[1.3, 0.42, 0.06]} radius={0.04}>
          <Toon color={C.cream} outline={false} />
        </RoundedBox>
        <Label size={0.24} position={[0, 0, 0.04]}>
          DOCKER
        </Label>
      </group>
      <group position={[0, 1.62, 0.12]}>
        <RoundedBox args={[2.0, 0.4, 0.08]} radius={0.05}>
          <Toon color={C.teal} thickness={1.4} />
        </RoundedBox>
        <Label size={0.24} color={C.cream} position={[0, 0, 0.05]}>
          KUBERNETES
        </Label>
      </group>
    </group>
  );
}

/* ---------- the release belt ---------- */

const BELT = { x0: 1.3, x1: 3.45, z: 2.1, top: 0.8 };
const ARCH_X = 2.7;
const BUILDS = 5;
const CLOUD: V3 = [3.1, 3.55, 1.3];

function beltGeometry() {
  const parts: Parameters<typeof paint>[0] = [
    { g: new THREE.BoxGeometry(BELT.x1 - BELT.x0 + 0.3, 0.32, 0.62), c: C.ink, p: [(BELT.x0 + BELT.x1) / 2, BELT.top - 0.16, BELT.z] },
    { g: new THREE.BoxGeometry(BELT.x1 - BELT.x0 + 0.3, 0.04, 0.5), c: C.asphalt, p: [(BELT.x0 + BELT.x1) / 2, BELT.top + 0.01, BELT.z] },
  ];
  [BELT.x0, BELT.x1].forEach((x) => parts.push({ g: new THREE.BoxGeometry(0.1, BELT.top - 0.3, 0.5), c: C.ink, p: [x, (BELT.top - 0.3) / 2, BELT.z] }));
  // the scanner arch
  [-0.42, 0.42].forEach((dz) => parts.push({ g: new THREE.BoxGeometry(0.14, 1.75, 0.14), c: C.teal, p: [ARCH_X, 0.88, BELT.z + dz] }));
  parts.push({ g: new THREE.BoxGeometry(0.2, 0.16, 1.0), c: C.teal, p: [ARCH_X, 1.8, BELT.z] });
  return paint(parts, true);
}

function ReleaseBelt() {
  const geo = useMemo(() => beltGeometry(), []);
  const builds = useRef<THREE.InstancedMesh>(null);
  const lamp = useRef<THREE.MeshBasicMaterial>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => ({ before: new THREE.Color(C.cream), after: new THREE.Color(C.green), tmp: new THREE.Color() }), []);
  useLayoutEffect(() => {
    for (let i = 0; i < BUILDS; i++) builds.current?.setColorAt(i, col.before);
  }, [col]);
  useFrame(({ clock }) => {
    const m = builds.current;
    if (!m) return;
    let scanning = false;
    for (let i = 0; i < BUILDS; i++) {
      const u = (clock.elapsedTime * 0.11 + i / BUILDS) % 1;
      let x: number;
      let y = BELT.top + 0.17;
      let z = BELT.z;
      let s = 1;
      if (u < 0.75) x = BELT.x0 + (BELT.x1 - BELT.x0) * (u / 0.75);
      else {
        // shipped: up into the cloud
        const f = smooth((u - 0.75) / 0.25);
        x = BELT.x1 + (CLOUD[0] - BELT.x1) * f;
        y = y + (CLOUD[1] - 0.3 - y) * f;
        z = BELT.z + (CLOUD[2] - BELT.z) * f;
        s = 1 - f * 0.9;
      }
      if (Math.abs(x - ARCH_X) < 0.22) scanning = true;
      o.position.set(x, y, z);
      o.rotation.set(0, 0, 0);
      o.scale.setScalar(Math.max(s, 0.001));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, x > ARCH_X ? col.after : col.before);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    lamp.current?.color.set(scanning ? C.green : C.sun);
  });
  return (
    <group>
      <Painted geometry={geo} castShadow thickness={1.6} />
      <mesh position={[ARCH_X, 1.8, BELT.z + 0.51]}>
        <planeGeometry args={[0.16, 0.12]} />
        <meshBasicMaterial ref={lamp} color={C.sun} />
      </mesh>
      <instancedMesh ref={builds} args={[undefined, undefined, BUILDS]} frustumCulled={false}>
        <boxGeometry args={[0.32, 0.32, 0.32]} />
        <Toon color={C.white} thickness={1.4} />
      </instancedMesh>
      <group position={[ARCH_X, 2.12, BELT.z + 0.1]}>
        <RoundedBox args={[1.9, 0.42, 0.1]} radius={0.05}>
          <Toon color={C.cream} thickness={1.4} />
        </RoundedBox>
        <Label size={0.24} position={[0, 0, 0.06]}>
          SONARQUBE
        </Label>
      </group>
      <Label size={0.22} color={C.cream} position={[(BELT.x0 + BELT.x1) / 2 - 0.55, BELT.top - 0.16, BELT.z + 0.315]}>
        CI/CD
      </Label>
    </group>
  );
}

function Clouds() {
  const puffs = useMemo<Instance[]>(
    () => [
      { p: [CLOUD[0], CLOUD[1], CLOUD[2]], s: 0.62 },
      { p: [CLOUD[0] - 0.6, CLOUD[1] - 0.12, CLOUD[2] + 0.05], s: 0.46 },
      { p: [CLOUD[0] + 0.62, CLOUD[1] - 0.1, CLOUD[2]], s: 0.5 },
      { p: [CLOUD[0] + 0.2, CLOUD[1] + 0.34, CLOUD[2] - 0.1], s: 0.42 },
      { p: [-2.4, 3.75, -0.6], s: 0.42 },
      { p: [-2.85, 3.65, -0.55], s: 0.32 },
      { p: [-2.0, 3.66, -0.55], s: 0.34 },
    ],
    [],
  );
  const ref = useRef<THREE.Group>(null);
  const puffy = useRef<THREE.Group>(null);
  const [poof, firePoof] = useKick();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 1.1) * 0.1;
    if (puffy.current) {
      const w = wiggle(since(poof), 0.22, 14, 4);
      puffy.current.scale.set(1 + w, 1 - w * 0.7, 1 + w);
    }
  });
  return (
    <group ref={ref}>
      {/* the cloud: squeeze it */}
      <Tappable
        onTap={() => {
          firePoof();
          sfx.pop(0.6);
          sfx.whoosh(1.2);
        }}
        hintAt={[CLOUD[0], CLOUD[1] + 1.25, CLOUD[2]]}
        hintScale={STALL_HINT}
      >
        <group ref={puffy} position={CLOUD}>
          <group position={[-CLOUD[0], -CLOUD[1], -CLOUD[2]]}>
            <ToonInstances items={puffs} color={C.white} thickness={1.8}>
              <sphereGeometry args={[1, 18, 14]} />
            </ToonInstances>
          </group>
        </group>
        <Ripple kick={poof} position={CLOUD} rotation={[0, 0, 0]} color={C.cream} from={0.8} to={2.6} dur={0.6} />
        <Burst kick={poof} origin={CLOUD} count={10} colors={[C.white, C.cream]} size={0.2} speed={2} up={1} gravity={2} dur={0.8} />
        <PopText kick={poof} text="POOF" position={[CLOUD[0] - 0.4, CLOUD[1] + 1.0, CLOUD[2] + 0.6]} size={0.36} color={C.teal} />
      </Tappable>
    </group>
  );
}

export default function Cloud({ step }: DioramaProps) {
  const crates = useMemo(
    () =>
      stack(
        [
          [
            { t: "CLOUD RUN", c: C.teal },
            { t: "GCP", c: C.coral },
          ],
          [
            { t: "STORAGE", c: C.sun },
            { t: "AZURE", c: C.cream },
          ],
          [{ t: "VERCEL", c: C.cream }],
        ],
        [-2.7, 0.15, -0.2],
        0.08,
        0.18,
      ),
    [],
  );
  return (
    <Market id={step.id} color={C.teal} title="CLOUD & DEVOPS">
      <Containers />
      <ReleaseBelt />
      <Clouds />
      <Crates items={crates} />
    </Market>
  );
}
