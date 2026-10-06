"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { Label } from "../../bits";
import type { DioramaProps } from "../Frame";
import { Crates, Market, Painted, STALL_HINT, hash, paint, smooth, stack, type V3 } from "./kit";
import { Tappable } from "../../props/tappable";
import { PopText, Ripple, hump, sfx, since, useKick, type Kick } from "@/world/fx";

/* ---------- the network: three layers, pulses running through ---------- */

const LAYERS: { x: number; ys: number[]; c: string }[] = [
  { x: -1.0, ys: [1.75, 2.45, 3.15], c: C.sun },
  { x: 0, ys: [1.45, 2.05, 2.65, 3.25], c: C.cream },
  { x: 1.0, ys: [2.05, 2.65], c: C.coral },
];
const PULSES = 7;

function Network({ position, fire }: { position: V3; fire: Kick }) {
  const { nodes, bars } = useMemo(() => {
    const nodes: Instance[] = LAYERS.flatMap((l) => l.ys.map((y) => ({ p: [l.x, y, 0] as V3, color: l.c })));
    const bars: Instance[] = [];
    for (let l = 0; l < LAYERS.length - 1; l++)
      for (const ya of LAYERS[l].ys)
        for (const yb of LAYERS[l + 1].ys) {
          const dx = LAYERS[l + 1].x - LAYERS[l].x;
          const dy = yb - ya;
          bars.push({ p: [LAYERS[l].x + dx / 2, ya + dy / 2, 0], r: [0, 0, -Math.atan2(dx, dy)], s: [1, Math.hypot(dx, dy), 1] });
        }
    return { nodes, bars };
  }, []);
  // each pulse takes a fixed route input -> hidden -> output
  const routes = useMemo(
    () =>
      Array.from({ length: PULSES }, (_, i) => {
        const a = LAYERS[0].ys[Math.floor(hash(i, 1) * 3)];
        const b = LAYERS[1].ys[Math.floor(hash(i, 2) * 4)];
        const c = LAYERS[2].ys[Math.floor(hash(i, 3) * 2)];
        return [new THREE.Vector3(-1, a, 0.02), new THREE.Vector3(0, b, 0.02), new THREE.Vector3(1, c, 0.02)];
      }),
    [],
  );
  const pulses = useRef<THREE.InstancedMesh>(null);
  const nodeMesh = useRef<THREE.InstancedMesh>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => ({ base: nodes.map((n) => new THREE.Color(n.color)), hot: new THREE.Color(C.white), tmp: new THREE.Color() }), [nodes]);
  const layerOf = useMemo(() => LAYERS.flatMap((l, k) => l.ys.map(() => k)), []);
  const phase = useRef(0);
  const settled = useRef(true);
  const placeNodes = (s: number) => {
    const m = nodeMesh.current;
    if (!m) return;
    nodes.forEach((n, i) => {
      // the cascade: each layer swells and flashes a beat after the one before
      const h = hump(s - layerOf[i] * 0.22, 0.35);
      o.position.set(...n.p);
      o.rotation.set(0, 0, 0);
      o.scale.setScalar(1 + h * 0.6);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, col.tmp.copy(col.base[i]).lerp(col.hot, h * 0.8));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  };
  useLayoutEffect(() => {
    placeNodes(9);
    const m = nodeMesh.current;
    if (!m) return;
    m.computeBoundingSphere();
    if (m.boundingSphere) m.boundingSphere.radius += 0.5;
    m.traverse((ch) => {
      if (ch !== m && (ch as THREE.InstancedMesh).isInstancedMesh) (ch as THREE.InstancedMesh).boundingSphere = m.boundingSphere;
    });
    // placeNodes only reads memoised data and refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);
  useFrame((_, dt) => {
    const m = pulses.current;
    if (!m) return;
    const s = since(fire);
    const busy = s < 1.4;
    if (busy || !settled.current) placeNodes(busy ? s : 9);
    settled.current = !busy;
    phase.current += dt * (0.45 + hump(s, 1.4) * 2.2);
    routes.forEach((r, i) => {
      const u = (phase.current + i / PULSES) % 1;
      const f = u * 2;
      const seg = Math.min(1, Math.floor(f));
      o.position.lerpVectors(r[seg], r[seg + 1], smooth(f - seg));
      o.scale.setScalar(u > 0.92 ? (1 - u) / 0.08 : 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  const plinth = useMemo(
    () =>
      paint(
        [
          { g: new THREE.CylinderGeometry(0.55, 0.65, 0.36, 18), c: C.cream, p: [0, 0.18, 0] },
          { g: new THREE.CylinderGeometry(0.6, 0.6, 0.07, 18), c: C.ink, p: [0, 0.38, 0] },
          { g: new THREE.CylinderGeometry(0.07, 0.07, 1.05, 8), c: C.ink, p: [0, 0.9, 0] },
        ],
        true,
      ),
    [],
  );
  return (
    <group position={position}>
      <Painted geometry={plinth} castShadow />
      <ToonInstances items={bars} color={C.ink} outline={false}>
        <cylinderGeometry args={[0.028, 0.028, 1, 5]} />
      </ToonInstances>
      <instancedMesh ref={nodeMesh} args={[undefined, undefined, nodes.length]} castShadow>
        <sphereGeometry args={[0.24, 16, 12]} />
        <Toon color={C.white} thickness={1.8} />
      </instancedMesh>
      <instancedMesh ref={pulses} args={[undefined, undefined, PULSES]} frustumCulled={false}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshBasicMaterial color={C.white} />
      </instancedMesh>
    </group>
  );
}

/* ---------- the maize plant, and the detector's box snapping onto the blighted leaf ---------- */

const SICK = "#b49a3a";
const LEAVES: { y: number; yaw: number; tilt: number; len: number; sick?: boolean }[] = [
  { y: 0.55, yaw: 0.4, tilt: 0.35, len: 0.95 },
  { y: 0.95, yaw: Math.PI + 0.3, tilt: 0.3, len: 1.1, sick: true },
  { y: 1.35, yaw: 1.2, tilt: 0.45, len: 0.9 },
  { y: 1.7, yaw: -0.5, tilt: 0.55, len: 0.75 },
];

function maizeGeometry() {
  const parts: Parameters<typeof paint>[0] = [{ g: new THREE.CylinderGeometry(0.06, 0.09, 2.3, 7), c: C.leaf, p: [0, 1.15, 0] }];
  LEAVES.forEach((l) => {
    const cx = Math.cos(l.yaw) * l.len * 0.5;
    const cz = -Math.sin(l.yaw) * l.len * 0.5;
    parts.push({ g: new THREE.BoxGeometry(l.len, 0.035, 0.2), c: l.sick ? SICK : C.grass, p: [cx, l.y + Math.sin(l.tilt) * l.len * 0.5, cz], r: [0, l.yaw, l.tilt] });
    if (l.sick)
      // blight lesions along the leaf
      [0.3, 0.55, 0.8].forEach((f, i) =>
        parts.push({
          g: new THREE.SphereGeometry(0.055 + i * 0.01, 6, 4),
          c: "#6b3f1d",
          p: [Math.cos(l.yaw) * l.len * f, l.y + Math.sin(l.tilt) * l.len * f + 0.03, -Math.sin(l.yaw) * l.len * f],
          s: [1.3, 0.5, 1],
        }),
      );
  });
  parts.push({ g: new THREE.CapsuleGeometry(0.11, 0.35, 3, 8), c: C.sun, p: [0.1, 1.5, 0.05], r: [0, 0, -0.3] });
  [-0.4, 0, 0.4].forEach((a) => parts.push({ g: new THREE.ConeGeometry(0.03, 0.35, 4), c: "#e8c46a", p: [Math.sin(a) * 0.12, 2.42, 0], r: [0, 0, a] }));
  return paint(parts, true);
}

/** Where the blighted leaf sits, in the plant's frame. */
const leaf = LEAVES.find((l) => l.sick)!;
const LEAF_C = new THREE.Vector3(Math.cos(leaf.yaw) * leaf.len * 0.5, leaf.y + Math.sin(leaf.tilt) * leaf.len * 0.5, -Math.sin(leaf.yaw) * leaf.len * 0.5);
const BOX = { w: 1.25, h: 0.72 };

function Detection({ position, rescan }: { position: V3; rescan: Kick }) {
  const plant = useMemo(() => maizeGeometry(), []);
  const box = useRef<THREE.Group>(null);
  const tag = useRef<THREE.Group>(null);
  const frame = useMemo(() => {
    const t = 0.05;
    return paint([
      { g: new THREE.PlaneGeometry(BOX.w, t), c: C.coral, p: [0, BOX.h / 2, 0] },
      { g: new THREE.PlaneGeometry(BOX.w, t), c: C.coral, p: [0, -BOX.h / 2, 0] },
      { g: new THREE.PlaneGeometry(t, BOX.h), c: C.coral, p: [-BOX.w / 2, 0, 0] },
      { g: new THREE.PlaneGeometry(t, BOX.h), c: C.coral, p: [BOX.w / 2, 0, 0] },
      // the class tab, top left, YOLO style
      { g: new THREE.PlaneGeometry(1.02, 0.3), c: C.coral, p: [-BOX.w / 2 + 0.51, BOX.h / 2 + 0.15, 0] },
    ]);
  }, []);
  useFrame(({ clock }) => {
    const r = since(rescan);
    const t = r < 4.2 ? r : clock.elapsedTime % 4.2;
    // search wide and loose, then snap tight onto the leaf, hold, let go
    const snap = smooth((t - 1.0) / 0.22);
    const s = 1.7 - 0.7 * snap + Math.sin(t * 5) * 0.04 * (1 - snap);
    if (box.current) {
      box.current.scale.set(s, s, 1);
      box.current.position.set(LEAF_C.x + (1 - snap) * 0.35 * Math.sin(t * 2.3), LEAF_C.y + (1 - snap) * 0.25, LEAF_C.z + 0.35);
      box.current.visible = t < 3.7;
    }
    if (tag.current) tag.current.visible = snap > 0.95 && t < 3.7;
  });
  return (
    <group position={position}>
      <Painted geometry={plant} castShadow thickness={1.4} />
      <Ripple kick={rescan} position={[LEAF_C.x, LEAF_C.y, LEAF_C.z + 0.36]} rotation={[0, -0.12, 0]} color={C.coral} from={0.3} to={1.4} dur={0.5} delay={1.2} />
      <group ref={box} rotation={[0, -0.12, 0]}>
        <mesh geometry={frame}>
          <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
        </mesh>
        <group ref={tag}>
          <Label size={0.22} color={C.cream} position={[-BOX.w / 2 + 0.51, BOX.h / 2 + 0.15, 0.01]}>
            BLIGHT
          </Label>
        </group>
      </group>
    </group>
  );
}

/* ---------- the edge board: a green module with a finned heatsink ---------- */

function edgeRig() {
  const fins = Array.from({ length: 7 }, (_, i) => ({ g: new THREE.BoxGeometry(0.045, 0.3, 0.62), c: C.silver, p: [-0.3 + i * 0.1, 0.27, 0] as V3 }));
  return paint(
    [
      { g: new THREE.BoxGeometry(1.4, 0.07, 1.0), c: C.pcb, p: [0, 0, 0] },
      { g: new THREE.BoxGeometry(0.86, 0.06, 0.74), c: C.ink, p: [0, 0.06, 0] },
      { g: new THREE.BoxGeometry(0.74, 0.08, 0.64), c: C.silver, p: [0, 0.12, 0] },
      ...fins,
      { g: new THREE.BoxGeometry(1.1, 0.07, 0.08), c: C.gold, p: [0, 0.06, -0.43] },
      { g: new THREE.BoxGeometry(0.22, 0.16, 0.22), c: C.silver, p: [0.55, 0.11, 0.3] },
      { g: new THREE.BoxGeometry(0.22, 0.16, 0.22), c: C.silver, p: [0.55, 0.11, -0.05] },
    ],
    true,
  );
}

/** The board the quantized models ran on. Its LED goes green each time the detector locks on. */
function EdgeBoard({ at, rescan }: { at: V3; rescan: Kick }) {
  const board = useMemo(() => edgeRig(), []);
  const led = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const r = since(rescan);
    const t = r < 4.2 ? r : clock.elapsedTime % 4.2;
    led.current?.color.set(t > 1.2 && t < 3.7 ? C.green : "#1f3a2a");
  });
  return (
    <group position={at} rotation={[0.55, 0.3, 0]}>
      <Painted geometry={board} castShadow thickness={1.4} />
      <mesh position={[-0.55, 0.06, 0.38]}>
        <boxGeometry args={[0.12, 0.05, 0.12]} />
        <meshBasicMaterial ref={led} color={C.green} />
      </mesh>
    </group>
  );
}

export default function Ml({ step }: DioramaProps) {
  const crates = useMemo(
    () => [
      ...stack(
        [
          [
            { t: "TENSORFLOW", c: C.sun },
            { t: "NER", c: C.cream },
          ],
          [
            { t: "SCIBERT", c: C.green },
            { t: "PRODIGY", c: C.coral },
          ],
          [
            { t: "QUANTIZE", c: C.cream },
            { t: "YOLOV9", c: C.sun },
          ],
          [
            { t: "JETSON", c: C.green },
            { t: "PYTORCH", c: C.coral },
          ],
        ],
        [-2.65, 0.15, -0.2],
        0.08,
        0.15,
      ),
    ],
    [],
  );
  const [fire, fireNet] = useKick();
  const [rescan, fireScan] = useKick();
  return (
    <Market id={step.id} color={C.green} title="MACHINE LEARNING">
      {/* the network: click it and a pulse cascades through every layer */}
      <Tappable
        onTap={() => {
          if (since(fire) < 0.8) return;
          fireNet();
          sfx.arp(523, 3, 0.22, "sine");
          sfx.whoosh(1.6);
        }}
        position={[0.85, 0, 0.55]}
        hintAt={[0, 4.05, 0]}
        hintScale={STALL_HINT / 1.1}
      >
        <group scale={1.1}>
          <Network position={[0, 0.15, 0]} fire={fire} />
          <mesh position={[0, 2.5, 0]} visible={false}>
            <boxGeometry args={[2.6, 2.4, 0.8]} />
            <meshBasicMaterial />
          </mesh>
        </group>
        <PopText kick={fire} text="ZAP" position={[1.2, 3.9, 0.4]} size={0.4} color={C.green} />
      </Tappable>
      {/* the maize: click it and the detector looks again */}
      <Tappable
        onTap={() => {
          if (since(rescan) < 1.4) return;
          fireScan();
          sfx.beep(0.9);
          setTimeout(() => sfx.arp(988, 2, 0.06, "square"), 1150);
        }}
        position={[3.15, 0, 1.7]}
        hintAt={[0, 3.25, 0]}
        hintScale={STALL_HINT / 1.1}
      >
        <group scale={1.1}>
          <Detection position={[0, 0.15, 0]} rescan={rescan} />
          <mesh position={[0, 1.4, 0]} visible={false}>
            <cylinderGeometry args={[0.8, 0.8, 2.6, 8]} />
            <meshBasicMaterial />
          </mesh>
        </group>
        <PopText kick={rescan} text="BEEP" position={[0.2, 2.9, 0.4]} size={0.36} color={C.coral} />
      </Tappable>
      <EdgeBoard at={[1.75, 0.55, 2.55]} rescan={rescan} />
      <Crates items={crates} />
    </Market>
  );
}
