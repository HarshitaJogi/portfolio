"use client";

import { useTexture } from "@react-three/drei";
import { RoundedBox } from "@/world/rounded";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { media } from "@/content/profile";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { Label, chime, textureUrl, useHoverCursor } from "../../bits";
import { atmo } from "../../atmosphere";
import { findEgg } from "../../eggs";
import { island } from "../../state";
import { Islet } from "../../props/basics";
import { Kuthuvilakku } from "./Lamp";
import { merge, put, type V3 } from "./parts";
import { Tappable, TapHint } from "../../props/tappable";
import { Burst, HINT, PopText, Ripple, hump, sfx, since, useKick, wiggle } from "@/world/fx";

const STAGE_TOP = 0.95;
const STAGE = { x: 4.7, back: -3.4, front: 1.6 };

/* ------------------------------------------------------------------ */
/* the backdrop: a stepped tower, temple-inspired and kept abstract     */
/* ------------------------------------------------------------------ */

const TIERS = [
  { w: 6.0, d: 2.6, h: 2.3 },
  { w: 5.2, d: 2.3, h: 1.0 },
  { w: 4.4, d: 2.1, h: 1.0 },
  { w: 3.6, d: 1.9, h: 1.0 },
  { w: 2.8, d: 1.7, h: 1.0 },
  { w: 2.0, d: 1.5, h: 1.0 },
];

function useTower() {
  return useMemo(() => {
    const body: THREE.BufferGeometry[] = [];
    const trim: THREE.BufferGeometry[] = [];
    const niches: Instance[] = [];
    const bulbs: Instance[] = [];
    let y = 0.15;
    TIERS.forEach((t, i) => {
      body.push(put(new THREE.BoxGeometry(t.w, t.h, t.d), [0, y + t.h / 2, 0]));
      // a cornice at the top of each tier: the stepped silhouette
      trim.push(put(new THREE.BoxGeometry(t.w + 0.34, 0.16, t.d + 0.3), [0, y + t.h, 0]));
      // little recessed niches along the front, fewer as it narrows
      if (i > 0) {
        const n = Math.max(1, Math.floor(t.w / 0.95));
        for (let k = 0; k < n; k++) niches.push({ p: [-((n - 1) * 0.95) / 2 + k * 0.95, y + t.h * 0.48, t.d / 2 + 0.02], s: [0.34, 0.5, 0.06] });
      }
      // festival lights strung along the cornice edge
      const m = Math.floor((t.w + 0.2) / 0.36);
      for (let k = 0; k <= m; k++) bulbs.push({ p: [-(t.w + 0.2) / 2 + (k * (t.w + 0.2)) / m, y + t.h + 0.12, t.d / 2 + 0.17] });
      y += t.h;
    });
    // the barrel-vaulted crown, and three finials on its ridge
    body.push(put(new THREE.CylinderGeometry(0.62, 0.62, 2.5, 18, 1, false, 0, Math.PI), [0, y + 0.08, 0], [0, 0, Math.PI / 2]));
    [-0.75, 0, 0.75].forEach((x) => {
      trim.push(put(new THREE.SphereGeometry(0.15, 10, 8), [x, y + 0.84, 0]));
      trim.push(put(new THREE.ConeGeometry(0.08, 0.32, 8), [x, y + 1.06, 0]));
    });
    return { body: merge(body), trim: merge(trim), niches, bulbs };
  }, []);
}

function Tower({ position }: { position: V3 }) {
  const { body, trim, niches, bulbs } = useTower();
  const bulb = useRef<THREE.MeshBasicMaterial>(null);
  const day = useMemo(() => new THREE.Color(C.cream), []);
  const night = useMemo(() => new THREE.Color("#ffcf5a"), []);
  useFrame(({ clock }) => {
    // the lights warm up with the dark, and shimmer a little
    bulb.current?.color.copy(day).lerp(night, atmo.night).multiplyScalar(0.92 + Math.sin(clock.elapsedTime * 3) * 0.08);
  });
  return (
    <group position={position}>
      <mesh geometry={body} castShadow receiveShadow>
        <Toon color={C.sand} emissive={C.clayDark} thickness={2} />
      </mesh>
      <mesh geometry={trim} castShadow>
        <Toon color={C.gold} emissive={C.clayDark} thickness={1.6} />
      </mesh>
      <ToonInstances items={niches} color={C.clayDark} outline={false}>
        <boxGeometry />
      </ToonInstances>
      <Beads items={bulbs} mat={bulb} r={0.075} detail={1} />
    </group>
  );
}

/** Many small unlit beads in one draw call: they read as glowing at night. */
function Beads({ items, mat, color = C.white, r = 0.07, detail = 0 }: { items: Instance[]; mat?: React.RefObject<THREE.MeshBasicMaterial | null>; color?: string; r?: number; detail?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    items.forEach((it, i) => {
      o.position.set(...it.p);
      if (Array.isArray(it.s)) o.scale.set(...it.s);
      else o.scale.setScalar(it.s ?? 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      if (it.color) m.setColorAt(i, c.set(it.color));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <icosahedronGeometry args={[r, detail]} />
      <meshBasicMaterial ref={mat} color={color} toneMapped={false} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* the stage, with a marigold garland along its edge                    */
/* ------------------------------------------------------------------ */

function useGarland() {
  return useMemo(() => {
    const beads: Instance[] = [];
    const swag = (x0: number, x1: number, n: number, sag: number) => {
      for (let i = 0; i <= n; i++) {
        const f = i / n;
        const x = x0 + (x1 - x0) * f;
        const y = STAGE_TOP - 0.1 - Math.sin(f * Math.PI) * sag;
        beads.push({ p: [x, y, STAGE.front + 0.1], s: 0.13, color: i % 2 ? C.sun : C.pumpkin });
      }
    };
    swag(-4.6, -3.0, 9, 0.32);
    swag(-3.0, -1.45, 9, 0.32);
    swag(1.45, 3.0, 9, 0.32);
    swag(3.0, 4.6, 9, 0.32);
    // short tassels where the swags meet
    [-4.6, -3.0, -1.45, 1.45, 3.0, 4.6].forEach((x, k) => {
      for (let i = 1; i <= 3; i++) beads.push({ p: [x, STAGE_TOP - 0.1 - i * 0.17, STAGE.front + 0.12], s: 0.12, color: (i + k) % 2 ? C.pumpkin : C.sun });
    });
    return beads;
  }, []);
}

function Platform() {
  const garland = useGarland();
  const w = STAGE.x * 2;
  const d = STAGE.front - STAGE.back;
  const zc = (STAGE.front + STAGE.back) / 2;
  const steps = useMemo(
    () => merge([put(new THREE.BoxGeometry(2.6, 0.54, 0.7), [0, 0.15 + 0.27, STAGE.front + 0.35]), put(new THREE.BoxGeometry(2.6, 0.28, 0.6), [0, 0.15 + 0.14, STAGE.front + 1.0])]),
    [],
  );
  return (
    <group>
      <mesh position={[0, 0.15 + (STAGE_TOP - 0.15 - 0.1) / 2, zc]} castShadow receiveShadow>
        <boxGeometry args={[w, STAGE_TOP - 0.25, d]} />
        <Toon color={C.red} emissive={C.brickDark} />
      </mesh>
      {/* the floor, a little proud of the body */}
      <mesh position={[0, STAGE_TOP - 0.06, zc]} receiveShadow>
        <boxGeometry args={[w + 0.2, 0.12, d + 0.2]} />
        <Toon color={C.bark} emissive={C.brickDark} thickness={1.6} />
      </mesh>
      {/* steps up the middle */}
      <mesh geometry={steps} receiveShadow>
        <Toon color={C.clay} emissive={C.brickDark} thickness={1.6} />
      </mesh>
      <Beads items={garland} r={1} detail={1} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* the portrait: five performance photos in turn, under a spotlight     */
/* ------------------------------------------------------------------ */

const PHOTOS = media.dance.map((d) => textureUrl(d.src, 640));
const FRAME_W = 2.1;
const FRAME_H = 2.9;
const HOLD = 6; // seconds per photo

function Portrait({ position }: { position: V3 }) {
  const texs = useTexture(PHOTOS, (t) => {
    (Array.isArray(t) ? t : [t]).forEach((x) => (x.colorSpace = THREE.SRGBColorSpace));
  });
  const card = useRef<THREE.Group>(null);
  const photo = useRef<THREE.Mesh>(null);
  const beam = useRef<THREE.MeshBasicMaterial>(null);
  const pool = useRef<THREE.MeshBasicMaterial>(null);
  const shown = useRef(0);
  const nextAt = useRef(HOLD);
  const flip = useRef(-1); // seconds into a flip, or -1
  const t = useRef(0);
  const { bind } = useHoverCursor();
  const [seen, setSeen] = useState(false);
  const [spot, fireSpot] = useKick();

  useFrame(({ clock }, dt) => {
    t.current = clock.elapsedTime;
    const n = atmo.night + hump(since(spot), 0.9) * 0.9;
    if (beam.current) beam.current.opacity = 0.05 + 0.13 * n;
    if (pool.current) pool.current.opacity = 0.08 + 0.22 * n;
    if (flip.current < 0 && clock.elapsedTime > nextAt.current) flip.current = 0;
    const g = card.current;
    const m = photo.current;
    if (!g || !m) return;
    if (flip.current >= 0) {
      flip.current += dt;
      const f = Math.min(flip.current / 0.6, 1);
      // turn edge-on, swap the photo, turn back
      if (f >= 0.5 && g.userData.swapped !== true) {
        shown.current = (shown.current + 1) % texs.length;
        g.userData.swapped = true;
      }
      g.rotation.y = Math.sin(f * Math.PI) * (Math.PI / 2);
      if (f >= 1) {
        flip.current = -1;
        g.userData.swapped = false;
        nextAt.current = clock.elapsedTime + HOLD;
      }
    } else g.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.04;
    const tex = texs[shown.current];
    const mat = m.material as THREE.MeshBasicMaterial;
    if (mat.map !== tex) mat.map = tex;
    // fit inside the frame whatever the photo's shape
    const img = tex.image as { width: number; height: number } | undefined;
    const aspect = img && img.height ? img.width / img.height : 2 / 3;
    const iw = FRAME_W - 0.3;
    const ih = FRAME_H - 0.3;
    if (aspect > iw / ih) m.scale.set(iw, iw / aspect, 1);
    else m.scale.set(ih * aspect, ih, 1);
  });

  const next = () => {
    if (flip.current >= 0) return;
    flip.current = 0;
    setSeen(true);
    fireSpot();
    chime(1046);
    sfx.whoosh(1.1);
  };

  return (
    <group position={position}>
      {/* a low plinth */}
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[1.4, 0.24, 0.7]} />
        <Toon color={C.gold} emissive={C.clayDark} thickness={1.6} />
      </mesh>
      <group ref={card} position={[0, 0.24 + FRAME_H / 2, 0]} onClick={(e) => (e.stopPropagation(), next())} {...bind}>
        <RoundedBox args={[FRAME_W, FRAME_H, 0.16]} radius={0.07} castShadow>
          <Toon color={C.gold} emissive={C.clayDark} />
        </RoundedBox>
        <mesh position={[0, 0, 0.085]}>
          <planeGeometry args={[FRAME_W - 0.24, FRAME_H - 0.24]} />
          <meshBasicMaterial color={C.ink} />
        </mesh>
        <mesh ref={photo} position={[0, 0, 0.09]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={texs[0]} toneMapped={false} />
        </mesh>
      </group>
      {!seen && <TapHint position={[1.5, 3.0, 0.3]} scale={HINT} />}
      {/* the spotlight: a soft cone from above, and its pool on the floor */}
      <mesh position={[0, 3.3, 0.55]} rotation={[0.12, 0, 0]}>
        <coneGeometry args={[1.75, 6.6, 28, 1, true]} />
        <meshBasicMaterial ref={beam} color={C.sun} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.95]} scale={[1, 0.8, 1]}>
        <circleGeometry args={[1.85, 32]} />
        <meshBasicMaterial ref={pool} color={C.sun} transparent opacity={0.2} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* ghungroo: a pair of anklet bells, hung up on a little stand          */
/* ------------------------------------------------------------------ */

const PAD = { w: 0.5, h: 1.25 };
function anklet(): Instance[] {
  const out: Instance[] = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) out.push({ p: [(c - 1) * 0.15, -0.22 - r * 0.18 - (c % 2) * 0.05, 0.07], s: 0.085 });
  return out;
}

function Ghungroo({ position, rotation = 0 }: { position: V3; rotation?: number }) {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const swing = useRef(0);
  const bells = useMemo(() => anklet(), []);
  const stand = useMemo(
    () =>
      merge([
        put(new THREE.CylinderGeometry(0.07, 0.09, 2.2, 8), [-0.85, 1.1, 0]),
        put(new THREE.CylinderGeometry(0.07, 0.09, 2.2, 8), [0.85, 1.1, 0]),
        put(new THREE.CylinderGeometry(0.06, 0.06, 2.0, 8), [0, 2.06, 0], [0, 0, Math.PI / 2]),
        put(new THREE.BoxGeometry(2.1, 0.12, 0.6), [0, 0.06, 0]),
      ]),
    [],
  );
  const { bind } = useHoverCursor();
  const [seen, setSeen] = useState(false);
  const [jingle, fireJingle] = useKick();

  useFrame(({ clock }, dt) => {
    swing.current = Math.max(0, swing.current - dt * 0.7);
    const s = swing.current;
    const now = clock.elapsedTime;
    if (left.current) {
      left.current.rotation.z = Math.sin(now * 9) * 0.45 * s + Math.sin(now * 0.9) * 0.03;
      left.current.rotation.x = Math.sin(now * 7 + 1) * 0.2 * s;
    }
    if (right.current) {
      right.current.rotation.z = Math.sin(now * 9 + 2.1) * 0.45 * s + Math.sin(now * 0.9 + 1.4) * 0.03;
      right.current.rotation.x = Math.sin(now * 7 + 2) * 0.2 * s;
    }
  });

  const ring = () => {
    swing.current = 1;
    chime(1500 + Math.random() * 300);
    setTimeout(() => chime(1800 + Math.random() * 300), 90);
    setTimeout(() => chime(1650 + Math.random() * 300), 200);
    island.set({ bells: island.get().bells + 1 });
    findEgg("bells");
    setSeen(true);
    fireJingle();
  };

  const strand = (ref: React.RefObject<THREE.Group | null>, x: number) => (
    <group ref={ref} position={[x, 2.0, 0]}>
      <RoundedBox args={[PAD.w, PAD.h, 0.08]} radius={0.04} position={[0, -0.15 - PAD.h / 2, 0]}>
        <Toon color={C.red} emissive={C.brickDark} thickness={1.4} />
      </RoundedBox>
      <group position={[0, -0.15, 0]}>
        <ToonInstances items={bells} color={C.sun} thickness={1.2}>
          <sphereGeometry args={[1, 10, 8]} />
        </ToonInstances>
      </group>
    </group>
  );

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <group onClick={(e) => (e.stopPropagation(), ring())} {...bind}>
        {/* the stand: two posts, a bar, a base board */}
        <mesh geometry={stand} castShadow>
          <Toon color={C.bark} emissive={C.brickDark} thickness={1.6} />
        </mesh>
        {strand(left, -0.38)}
        {strand(right, 0.38)}
        {/* an easy click target around the whole stand */}
        <mesh position={[0, 1.2, 0]} visible={false}>
          <boxGeometry args={[2.2, 2.4, 0.9]} />
          <meshBasicMaterial />
        </mesh>
      </group>
      {!seen && <TapHint position={[0, 2.9, 0]} scale={HINT} />}
      <PopText kick={jingle} text="CHHAM CHHAM" position={[0, 2.7, 0.4]} size={0.38} color={C.sun} outline={C.ink} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* the degree: a scroll on a reading stand                              */
/* ------------------------------------------------------------------ */

const TILT = 0.62;

function useScroll() {
  return useMemo(() => {
    const stand = merge([
      put(new THREE.CylinderGeometry(0.08, 0.12, 1.1, 8), [0, 0.55, 0]),
      put(new THREE.CylinderGeometry(0.45, 0.5, 0.12, 16), [0, 0.06, 0]),
      // the reading board, tilted toward the viewer
      put(new THREE.BoxGeometry(2.3, 0.08, 1.0), [0, 1.25, 0], [TILT, 0, 0]),
    ]);
    const rollers: THREE.BufferGeometry[] = [];
    const caps: THREE.BufferGeometry[] = [];
    const board = new THREE.Matrix4().compose(new THREE.Vector3(0, 1.25, 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(TILT, 0, 0)), new THREE.Vector3(1, 1, 1));
    [-0.56, 0.56].forEach((z) => {
      rollers.push(put(new THREE.CylinderGeometry(0.09, 0.09, 2.0, 12), [0, 0.12, z], [0, 0, Math.PI / 2]).applyMatrix4(board));
      [-1.08, 1.08].forEach((x) => caps.push(put(new THREE.SphereGeometry(0.1, 10, 8), [x, 0.12, z]).applyMatrix4(board)));
    });
    return { stand, rollers: merge(rollers), caps: merge(caps) };
  }, []);
}


/** The degree: a scroll on a reading stand. */
function Scroll({ position, rotation = 0 }: { position: V3; rotation?: number }) {
  const { stand, rollers, caps } = useScroll();
  const hop = useRef<THREE.Group>(null);
  const [cheer, fireCheer] = useKick();
  useFrame(() => {
    const s = since(cheer);
    if (!hop.current) return;
    hop.current.position.y = hump(s, 0.4) * 0.45;
    hop.current.rotation.z = wiggle(s, 0.12, 14, 4);
  });
  return (
    <Tappable
      onTap={() => {
        fireCheer();
        sfx.arp(784, 4, 0.08, "triangle");
      }}
      position={position}
      rotation={[0, rotation, 0]}
      hintAt={[0, 2.6, 0]}
      hintScale={HINT}
    >
    <group ref={hop}>
      <mesh geometry={stand} castShadow>
        <Toon color={C.bark} emissive={C.brickDark} thickness={1.6} />
      </mesh>
      <mesh geometry={rollers}>
        <Toon color={C.red} emissive={C.brickDark} thickness={1.4} />
      </mesh>
      <mesh geometry={caps}>
        <Toon color={C.gold} outline={false} />
      </mesh>
      <group position={[0, 1.25, 0]} rotation={[TILT, 0, 0]}>
        <mesh position={[0, 0.07, 0]} receiveShadow>
          <boxGeometry args={[1.9, 0.04, 1.06]} />
          <Toon color={C.cream} emissive={C.clayDark} thickness={1.4} />
        </mesh>
        <Label size={0.42} color={C.ink} position={[0, 0.1, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          KOVIDA
        </Label>
      </group>
    </group>
      <Burst kick={cheer} origin={[0, 1.6, 0]} count={14} colors={[C.sun, C.red, C.cream]} size={0.1} speed={1.8} up={3} dur={1.1} />
      <Ripple kick={cheer} position={[0, 0.05, 0]} color={C.sun} from={0.5} to={2} dur={0.6} />
      <PopText kick={cheer} text="BRAVO" position={[0, 2.3, 0.4]} size={0.38} color={C.red} />
    </Tappable>
  );
}

/* ------------------------------------------------------------------ */
/* practice: faint footprints up to the stage. The hard work stays      */
/* invisible, almost: they fade in and out, one after another.          */
/* ------------------------------------------------------------------ */

function Footprints() {
  const geo = useMemo(() => {
    // build the outline in the XY plane, then lay it down
    const parts = [
      put(new THREE.CircleGeometry(0.13, 14), [0, 0.1, 0], [0, 0, 0], [1, 1.3, 1]),
      put(new THREE.CircleGeometry(0.1, 12), [0, -0.17, 0], [0, 0, 0], [1, 1.1, 1]),
      ...[-0.1, -0.035, 0.03, 0.09].map((x, i) => put(new THREE.CircleGeometry(0.038 - i * 0.005, 8), [x, 0.31 - Math.abs(x + 0.02) * 0.6, 0])),
    ];
    return merge(parts).rotateX(-Math.PI / 2);
  }, []);
  const prints = useMemo(() => {
    // a gentle curve from the bridge side up to the foot of the steps
    const out: { p: V3; yaw: number; left: boolean }[] = [];
    const n = 12;
    for (let i = 0; i < n; i++) {
      const f = i / (n - 1);
      const x = -6.4 + f * 6.2 + Math.sin(f * Math.PI) * 1.2;
      const z = 6.6 - f * 3.0 + Math.sin(f * Math.PI) * 1.1;
      const dx = 6.2 + Math.cos(f * Math.PI) * Math.PI * 1.2;
      const dz = -3.0 + Math.cos(f * Math.PI) * Math.PI * 1.1;
      const yaw = Math.atan2(-dx, -dz);
      const left = i % 2 === 0;
      const side = left ? -0.24 : 0.24;
      const len = Math.hypot(dx, dz);
      out.push({ p: [x + (-dz / len) * side * -1, 0.17, z + (dx / len) * side * -1], yaw, left });
    }
    return out;
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  const c = useMemo(() => new THREE.Color(), []);
  const ground = useMemo(() => new THREE.Color(C.stone), []);
  const chalk = useMemo(() => new THREE.Color(C.cream), []);
  const glowc = useMemo(() => new THREE.Color(C.sun), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    prints.forEach((pr, i) => {
      o.position.set(...pr.p);
      o.rotation.set(0, pr.yaw, 0);
      o.scale.set(pr.left ? -1.7 : 1.7, 1.7, 1.7);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, chalk);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [prints, o, chalk]);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    // a slow wave of steps walks up the path, then they fade back to almost nothing
    const head = (clock.elapsedTime * 1.6) % (prints.length + 6);
    for (let i = 0; i < prints.length; i++) {
      const d = head - i;
      const k = d < 0 ? 0 : Math.max(0, 1 - d / 5);
      c.copy(ground).lerp(chalk, 0.7).lerp(glowc, k * 0.85);
      m.setColorAt(i, c);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, prints.length]} receiveShadow>
      <Toon color={C.white} outline={false} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Kovida degree in Bharatanatyam. A stage at night under a stepped tower: the
 * performance photos in a spotlit frame, a brass lamp either side waiting to be
 * lit, the degree on a scroll, and a pair of ghungroo to ring.
 */
export function Dance() {
  return (
    <group>
      <Islet r={11} top={C.stone} cliff={C.clay} />
      <Tower position={[0, 0, -5.3]} />
      <Platform />
      <Portrait position={[0, STAGE_TOP, -1.7]} />
      <Kuthuvilakku position={[-3.3, STAGE_TOP, -0.5]} scale={1.05} hint />
      <Kuthuvilakku position={[3.3, STAGE_TOP, -0.5]} scale={1.05} phase={1.7} />
      <Ghungroo position={[4.1, 0.15, 5.6]} rotation={-0.4} />
      {/* out to the left, clear of the front where the traveler stands */}
      <Scroll position={[-6.6, 0.15, 3.0]} rotation={0.5} />
      <Footprints />
    </group>
  );
}
