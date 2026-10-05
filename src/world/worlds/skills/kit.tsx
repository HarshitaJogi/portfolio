"use client";

import { Edges, Outlines, RoundedBox, Text } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { worlds } from "@/content/profile";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { FONT, Label, chime, useHoverCursor } from "../../bits";
import { atmo } from "../../atmosphere";
import { Islet } from "../../props/basics";
import { SPACING, anchor } from "../Frame";

export type V3 = [number, number, number];

/** Deterministic 0..1 noise, so render stays pure. */
export const hash = (i: number, k = 0) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const smooth = (t: number) => {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
};

/**
 * Several flat-coloured shapes baked into one geometry with vertex colours, so a cluster of
 * small unlit details (faces, dials, stripes) costs one draw call. Use with
 * <meshBasicMaterial vertexColors />, or pass `lit` and draw it with <Painted>.
 */
export function paint(parts: { g: THREE.BufferGeometry; c: string; p?: V3; r?: V3; s?: V3 }[], lit = false) {
  const col = new THREE.Color();
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const geos = parts.map(({ g, c, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1] }) => {
    const ng = (g.index ? g.toNonIndexed() : g.clone()) as THREE.BufferGeometry;
    ng.deleteAttribute("uv");
    if (!lit) ng.deleteAttribute("normal");
    m.compose(new THREE.Vector3(...p), q.setFromEuler(e.set(...r)), new THREE.Vector3(...s));
    ng.applyMatrix4(m);
    col.set(c);
    const n = ng.attributes.position.count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) arr.set([col.r, col.g, col.b], i * 3);
    ng.setAttribute("color", new THREE.Float32BufferAttribute(arr, 3));
    return ng;
  });
  return mergeGeometries(geos)!;
}

let ramp: THREE.DataTexture | null = null;
/** The same 3-step cel ramp as <Toon>. */
function cel() {
  if (ramp) return ramp;
  ramp = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  ramp.minFilter = THREE.NearestFilter;
  ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  return ramp;
}

/** A toon-shaded mesh whose colours come from a `paint(parts, true)` geometry. One draw, two with the outline. */
export function Painted({ geometry, outline = true, thickness = 2, castShadow = false, position, rotation, refMesh }: { geometry: THREE.BufferGeometry; outline?: boolean; thickness?: number; castShadow?: boolean; position?: V3; rotation?: V3; refMesh?: React.Ref<THREE.Mesh> }) {
  const map = useMemo(() => cel(), []);
  return (
    <mesh ref={refMesh} geometry={geometry} position={position} rotation={rotation} castShadow={castShadow} receiveShadow>
      <meshToonMaterial vertexColors gradientMap={map} />
      {outline && <Outlines thickness={thickness} color={C.ink} />}
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* The stall: the same build on every islet, so the path reads as one  */
/* street. Only the colour and the name change.                        */
/* ------------------------------------------------------------------ */

const W = 8.8; // awning width
const FRONT = -1.7; // awning front edge (z)
const BACK = -4.7;
const Y_FRONT = 4.25;
const Y_BACK = 4.95;
const STRIPES = 9;
const POLE = 6.7; // the lantern poles at either end of the street

function Awning({ color, alt }: { color: string; alt: string }) {
  const { stripes, scallops } = useMemo(() => {
    const sw = W / STRIPES;
    const len = Math.hypot(BACK - FRONT, Y_BACK - Y_FRONT);
    const tilt = Math.atan2(Y_BACK - Y_FRONT, FRONT - BACK);
    const stripes: Instance[] = Array.from({ length: STRIPES }, (_, i) => ({
      p: [-W / 2 + sw * (i + 0.5), (Y_FRONT + Y_BACK) / 2 + 0.05, (FRONT + BACK) / 2] as V3,
      r: [tilt, 0, 0] as V3,
      s: [sw, 1, len] as V3,
      color: i % 2 ? alt : color,
    }));
    const scallops: Instance[] = Array.from({ length: STRIPES }, (_, i) => ({
      p: [-W / 2 + sw * (i + 0.5), Y_FRONT, FRONT + 0.02] as V3,
      r: [Math.PI / 2, 0, 0] as V3,
      s: [sw / 2, 1, (sw / 2) * 0.8] as V3,
      color: i % 2 ? alt : color,
    }));
    return { stripes, scallops };
  }, [color, alt]);
  return (
    <group>
      <ToonInstances items={stripes} castShadow thickness={1.6}>
        <boxGeometry args={[1, 0.1, 1]} />
      </ToonInstances>
      {/* the scalloped valance: half discs along the front edge */}
      <ToonInstances items={scallops} thickness={1.4}>
        <cylinderGeometry args={[1, 1, 0.08, 14, 1, false, -Math.PI / 2, Math.PI]} />
      </ToonInstances>
    </group>
  );
}

const lanternFrame = paint([
  { g: new THREE.ConeGeometry(0.36, 0.32, 6), c: C.ink, p: [0, 0.46, 0] },
  { g: new THREE.CylinderGeometry(0.26, 0.26, 0.08, 6), c: C.ink, p: [0, -0.34, 0] },
  { g: new THREE.CylinderGeometry(0.025, 0.025, 0.5, 4), c: C.ink, p: [0, 0.8, 0] },
]);

/** Hexagonal street lanterns: a little warm by day, properly lit once night falls. */
function Lanterns({ at, color }: { at: V3[]; color: string }) {
  const body = useRef<THREE.InstancedMesh>(null);
  const frame = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    at.forEach((p, i) => {
      o.position.set(...p);
      o.updateMatrix();
      body.current?.setMatrixAt(i, o.matrix);
      frame.current?.setMatrixAt(i, o.matrix);
    });
    [body.current, frame.current].forEach((m) => {
      if (!m) return;
      m.instanceMatrix.needsUpdate = true;
      m.computeBoundingSphere();
    });
  }, [at]);
  const glow = useRef<THREE.MeshToonMaterial | null>(null);
  useLayoutEffect(() => {
    glow.current = (body.current?.material as THREE.MeshToonMaterial) ?? null;
  }, []);
  useFrame(({ clock }) => {
    const m = glow.current;
    if (m) m.emissiveIntensity = 0.35 + atmo.night * 0.6 + Math.sin(clock.elapsedTime * 3.1) * 0.04 * (0.3 + atmo.night);
  });
  return (
    <group>
      <instancedMesh ref={body} args={[undefined, undefined, at.length]}>
        <cylinderGeometry args={[0.3, 0.22, 0.62, 6]} />
        <Toon color={color} emissive="#ffb347" thickness={1.4} />
      </instancedMesh>
      <instancedMesh ref={frame} args={[lanternFrame, undefined, at.length]}>
        <meshBasicMaterial vertexColors />
      </instancedMesh>
    </group>
  );
}

/** Strings of pennants sagging between pairs of points. One draw for the strings, one for the flags. */
function Bunting({ runs, colors, n = 7, sag = 0.8 }: { runs: [V3, V3][]; colors: string[]; n?: number; sag?: number }) {
  const { string, flags } = useMemo(() => {
    const tubes: THREE.BufferGeometry[] = [];
    const flags: Instance[] = [];
    runs.forEach(([a, b]) => {
      const A = new THREE.Vector3(...a);
      const B = new THREE.Vector3(...b);
      const pts = Array.from({ length: 13 }, (_, i) => {
        const t = i / 12;
        const p = A.clone().lerp(B, t);
        p.y -= sag * 4 * t * (1 - t);
        return p;
      });
      const curve = new THREE.CatmullRomCurve3(pts);
      tubes.push(new THREE.TubeGeometry(curve, 24, 0.025, 4, false));
      const yaw = -Math.atan2(B.z - A.z, B.x - A.x);
      for (let i = 0; i < n; i++) {
        const p = curve.getPoint((i + 0.7) / (n + 0.4));
        flags.push({ p: [p.x, p.y - 0.24, p.z], r: [Math.PI, yaw, 0], s: [1, 1, 0.18], color: colors[(i + flags.length) % colors.length] });
      }
    });
    return { string: mergeGeometries(tubes)!, flags };
  }, [runs, colors, n, sag]);
  return (
    <group>
      <mesh geometry={string}>
        <meshBasicMaterial color={C.ink} />
      </mesh>
      <ToonInstances items={flags} outline={false}>
        <coneGeometry args={[0.26, 0.5, 3]} />
      </ToonInstances>
    </group>
  );
}

/** Counter, posts, awning, name board, and bunting out to two lantern poles. */
function Stall({ color, alt, title }: { color: string; alt: string; title: string }) {
  const posts = useMemo<Instance[]>(() => {
    const out: Instance[] = [];
    for (const x of [-W / 2 + 0.2, W / 2 - 0.2])
      for (const z of [FRONT - 0.15, BACK + 0.2]) {
        const h = z > -3 ? Y_FRONT : Y_BACK;
        out.push({ p: [x, h / 2, z], s: [1, h, 1] });
      }
    for (const x of [-POLE, POLE]) out.push({ p: [x, 2.7, 0.6], s: [1.2, 5.4, 1.2] });
    return out;
  }, []);
  const lanterns = useMemo<V3[]>(
    () => [
      [-POLE, 4.75, 0.6],
      [POLE, 4.75, 0.6],
      [-W / 2 + 0.2, Y_FRONT - 0.85, FRONT + 0.3],
      [W / 2 - 0.2, Y_FRONT - 0.85, FRONT + 0.3],
    ],
    [],
  );
  const runs = useMemo<[V3, V3][]>(
    () => [
      [
        [-POLE, 5.35, 0.6],
        [-W / 2 + 0.2, Y_FRONT + 0.1, FRONT - 0.1],
      ],
      [
        [W / 2 - 0.2, Y_FRONT + 0.1, FRONT - 0.1],
        [POLE, 5.35, 0.6],
      ],
    ],
    [],
  );
  const pennants = useMemo(() => [color, C.cream, alt === C.cream ? (color === C.sun ? C.coral : C.sun) : alt], [color, alt]);
  const nameW = Math.max(2.6, title.length * 0.37 + 0.9);
  return (
    <group>
      <ToonInstances items={posts} color={C.bark} castShadow thickness={1.6}>
        <cylinderGeometry args={[0.1, 0.12, 1, 8]} />
      </ToonInstances>
      <Awning color={color} alt={alt} />
      <Lanterns at={lanterns} color={C.sun} />
      <Bunting runs={runs} colors={pennants} />
      {/* the name board, standing on the awning's front edge */}
      <group position={[0, Y_FRONT + 0.72, FRONT + 0.15]} rotation={[-0.08, 0, 0]}>
        <RoundedBox args={[nameW, 0.8, 0.16]} radius={0.08}>
          <Toon color={C.cream} />
        </RoundedBox>
        <Label size={0.42} position={[0, 0.02, 0.09]}>
          {title}
        </Label>
      </group>
      {/* the counter */}
      <mesh position={[0, 0.62, -3.15]} receiveShadow>
        <boxGeometry args={[W - 0.7, 1.1, 1.1]} />
        <Toon color={color} />
      </mesh>
      <mesh position={[0, 1.24, -3.1]} receiveShadow>
        <boxGeometry args={[W - 0.3, 0.14, 1.35]} />
        <Toon color={C.bark} outline={false} />
      </mesh>
    </group>
  );
}

/** A chalk sandwich board out front. Lines are centred, the heading sits on top in yellow. */
export function Chalkboard({ lines, heading = "USED AT", position = [3.75, 0, 2.6], rotation = -0.35, children }: { lines?: string[]; heading?: string; position?: V3; rotation?: number; children?: ReactNode }) {
  const n = lines?.length ?? 2;
  const h = 0.8 + n * 0.4;
  const w = 2.6;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <group position={[0, h + 0.35, 0]} rotation={[-0.2, 0, 0]}>
        <mesh position={[0, -h / 2, 0]} castShadow>
          <boxGeometry args={[w, h, 0.12]} />
          <Toon color={C.bark} thickness={1.8} />
        </mesh>
        <mesh position={[0, -h / 2, 0.062]}>
          <planeGeometry args={[w - 0.22, h - 0.22]} />
          <meshBasicMaterial color="#34473d" />
        </mesh>
        {lines ? (
          <Text font={FONT} fontSize={0.3} lineHeight={1.3} textAlign="center" color={C.cream} anchorX="center" anchorY="middle" position={[0, -h / 2 - 0.17, 0.07]}>
            {lines.join("\n")}
          </Text>
        ) : (
          children
        )}
        <Label size={0.22} color={C.sun} position={[0, -0.34, 0.07]}>
          {heading}
        </Label>
      </group>
      {/* the back leg */}
      <mesh position={[0, (h + 0.35) / 2, -0.45]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[w - 0.2, h + 0.35, 0.08]} />
        <Toon color={C.bark} outline={false} />
      </mesh>
    </group>
  );
}

const ITEMS = worlds.skills.steps.filter((s) => s.kind === "item");
/** The stall and its toy are built at this scale, a touch bigger than the islet's own units. */
const SCALE = 1.35;

/** Where the bridges meet this islet, so the lane runs from one to the other. */
function laneEnds(id: string): [THREE.Vector3, THREE.Vector3] {
  const k = Math.max(0, ITEMS.findIndex((s) => s.id === id));
  const here = anchor(k);
  const prev = k === 0 ? new THREE.Vector3(-SPACING * 0.55, 0, 0) : anchor(k - 1);
  const next = anchor(k + 1);
  const a = prev.sub(here).setY(0).normalize().multiplyScalar(10.7);
  const b = next.sub(here).setY(0).normalize().multiplyScalar(10.7);
  return [a, b];
}

/** A paved lane from bridge to bridge, swinging out in front of the stall. */
function Lane({ id }: { id: string }) {
  const geo = useMemo(() => {
    const [a, b] = laneEnds(id);
    const curve = new THREE.CatmullRomCurve3([a, new THREE.Vector3(a.x * 0.66, 0, 4.4), new THREE.Vector3(0, 0, 6.2), new THREE.Vector3(b.x * 0.66, 0, 4.4), b], false, "centripetal");
    const N = 48;
    const pos: number[] = [];
    const idx: number[] = [];
    const t = new THREE.Vector3();
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const p = curve.getPoint(u);
      curve.getTangent(u, t);
      const w = 1.25;
      pos.push(p.x - t.z * w, 0.17, p.z + t.x * w, p.x + t.z * w, 0.17, p.z - t.x * w);
      if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [id]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshToonMaterial color={C.path} side={THREE.DoubleSide} />
    </mesh>
  );
}

/**
 * One islet of the market: ground, the lane between the bridges, the stall, the board.
 * The diorama's own toy goes in `children`, in stall space: x runs -4.4..4.4 under the
 * awning, the counter runs along z = -3.1, the awning's front edge is at z = -1.7.
 */
export function Market({ id, color, alt = C.cream, title, used, board, boardAt, children }: { id: string; color: string; alt?: string; title: string; used?: string[]; board?: ReactNode; boardAt?: { position: V3; rotation: number }; children: ReactNode }) {
  return (
    <group>
      <Islet r={11} top={C.sand} />
      <Lane id={id} />
      <group scale={SCALE} position={[0, 0, 1.6]}>
        <Stall color={color} alt={alt} title={title} />
        {board ?? (used && boardAt && <Chalkboard lines={used.map((u) => u.toUpperCase())} {...boardAt} />)}
        {children}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Crates: one per skill. Click one and it hops, with a note.          */
/* ------------------------------------------------------------------ */

export type CrateSpec = { t: string; p: V3; c: string; w?: number; ry?: number };
export const CRATE_H = 0.66;
const CRATE_D = 0.66;
const LABEL = 0.22;
/** Width that fits the label in Dela Gothic at LABEL size. */
export const crateW = (t: string) => Math.max(0.85, t.length * LABEL * 0.86 + 0.34);
const NOTES = [660, 742, 833, 990, 1112, 1320, 1484, 1666, 1980];

/** Lays crate names out in rows, stacked: rows[0] on the ground, centred on `at`. */
export function stack(rows: { t: string; c: string }[][], at: V3, gap = 0.08, ry = 0): CrateSpec[] {
  const out: CrateSpec[] = [];
  rows.forEach((row, r) => {
    const ws = row.map((c) => crateW(c.t));
    const total = ws.reduce((a, b) => a + b, 0) + gap * (row.length - 1);
    let x = -total / 2;
    row.forEach((c, i) => {
      const lx = x + ws[i] / 2;
      out.push({ t: c.t, c: c.c, w: ws[i], ry, p: [at[0] + lx * Math.cos(ry), at[1] + CRATE_H / 2 + r * CRATE_H, at[2] - lx * Math.sin(ry) - r * 0.06] });
      x += ws[i] + gap;
    });
  });
  return out;
}

const crateGeo = new RoundedBoxGeometry(1, 1, 1, 2, 0.07);

/**
 * Labelled crates, one instanced draw for all the bodies and one for the label plates.
 * `dashed` draws them as dashed outlines instead: familiar, not yet shown in a role.
 */
export function Crates({ items, dashed = false }: { items: CrateSpec[]; dashed?: boolean }) {
  const bodies = useRef<THREE.InstancedMesh>(null);
  const plates = useRef<THREE.InstancedMesh>(null);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const hops = useRef<number[]>([]);
  const dirty = useRef(true);
  const rig = useMemo(() => {
    const crate = new THREE.Object3D();
    const plate = new THREE.Object3D();
    crate.add(plate);
    return { crate, plate };
  }, []);
  const { bind } = useHoverCursor();

  useLayoutEffect(() => {
    const c = new THREE.Color();
    items.forEach((it, i) => {
      placeCrate(rig, it, 0, groups.current[i], bodies.current, plates.current, i);
      bodies.current?.setColorAt(i, c.set(it.c));
    });
    [bodies.current, plates.current].forEach((m) => {
      if (!m) return;
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
      m.computeBoundingSphere();
      if (m.boundingSphere) m.boundingSphere.radius += 1.5; // room for a hop
      m.traverse((ch) => {
        if (ch !== m && (ch as THREE.InstancedMesh).isInstancedMesh) (ch as THREE.InstancedMesh).boundingSphere = m.boundingSphere;
      });
    });
  }, [items, rig]);

  useFrame((_, dt) => {
    let any = false;
    for (let i = 0; i < items.length; i++) {
      const h = hops.current[i] ?? 0;
      if (h <= 0) continue;
      hops.current[i] = Math.max(0, h - dt * 1.5);
      placeCrate(rig, items[i], hops.current[i], groups.current[i], bodies.current, plates.current, i);
      any = true;
    }
    if (any || dirty.current) {
      dirty.current = any;
      if (bodies.current) bodies.current.instanceMatrix.needsUpdate = true;
      if (plates.current) plates.current.instanceMatrix.needsUpdate = true;
    }
  });

  const hop = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const i = e.instanceId ?? ((e.object.userData.i ?? e.object.parent?.userData.i) as number | undefined);
    if (i === undefined || (hops.current[i] ?? 0) > 0.4) return;
    hops.current[i] = 1;
    chime(NOTES[i % NOTES.length]);
  };

  return (
    <group onClick={hop} {...bind}>
      {!dashed && (
        <>
          <instancedMesh ref={bodies} args={[crateGeo, undefined, items.length]} castShadow receiveShadow>
            <Toon color={C.white} thickness={1.8} />
          </instancedMesh>
          <instancedMesh ref={plates} args={[undefined, undefined, items.length]}>
            <planeGeometry args={[1, 1]} />
            <Toon color={C.cream} outline={false} />
          </instancedMesh>
        </>
      )}
      {items.map((it, i) => (
        <group
          key={it.t}
          ref={(g) => {
            groups.current[i] = g;
          }}
          position={it.p}
          rotation={[0, it.ry ?? 0, 0]}
        >
          {dashed && <DashedBox it={it} i={i} />}
          <group userData={{ i }}>
            <Label size={LABEL} position={[0, -0.01, CRATE_D / 2 + 0.012]}>
              {it.t}
            </Label>
          </group>
        </group>
      ))}
    </group>
  );
}

type Rig = { crate: THREE.Object3D; plate: THREE.Object3D };

/** Puts crate i where it belongs, `h` (1..0) of the way through a hop. */
function placeCrate(rig: Rig, it: CrateSpec, h: number, g: THREE.Group | null, bodies: THREE.InstancedMesh | null, plates: THREE.InstancedMesh | null, i: number) {
  const w = it.w ?? crateW(it.t);
  const { crate, plate } = rig;
  crate.position.set(it.p[0], it.p[1] + Math.sin(h * Math.PI) * 1.1, it.p[2]);
  crate.rotation.set(0, (it.ry ?? 0) + h * Math.PI * 2, 0);
  crate.scale.set(1, 1, 1);
  plate.position.set(0, 0, CRATE_D / 2 + 0.006);
  plate.scale.set(w - 0.2, CRATE_H * 0.58, 1);
  crate.updateMatrixWorld(true);
  if (g) {
    g.position.copy(crate.position);
    g.rotation.copy(crate.rotation);
  }
  plates?.setMatrixAt(i, plate.matrixWorld);
  crate.scale.set(w, CRATE_H, CRATE_D);
  crate.updateMatrix();
  bodies?.setMatrixAt(i, crate.matrix);
}

/**
 * A crate drawn as dashed edges with a faint fill: familiar, not yet shown in a role.
 * The site's one rule: dashed is a draft, solid is verified.
 */
function DashedBox({ it, i }: { it: CrateSpec; i: number }) {
  const w = it.w ?? crateW(it.t);
  const geo = useMemo(() => new THREE.BoxGeometry(w, CRATE_H, CRATE_D), [w]);
  return (
    <group>
      <mesh geometry={geo} userData={{ i }}>
        <meshBasicMaterial color={C.cream} />
      </mesh>
      <Edges geometry={geo} color={C.ink} lineWidth={2.4} dashed dashSize={0.14} gapSize={0.09} />
    </group>
  );
}
