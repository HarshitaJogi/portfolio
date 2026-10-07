"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ComponentType, type ReactNode } from "react";
import * as THREE from "three";
import type { World, WorldStep } from "@/content/profile";
import { C } from "../palette";
import { Toon, ToonInstances, type Instance } from "../toon";
import { journey, stepJourney } from "../scroll";
import { blendSky } from "../atmosphere";
import { partyRoll } from "../party";
import { cardUI } from "../cardUI";
import { Lights } from "../Lights";
import { Progressive } from "../progressive";
import { Islet, Portal, Sign } from "../props/basics";
import { WorldTraveler } from "../TravelerRig";
import { useReducedMotion } from "@/lib/device";

import { anchor, SPACING } from "./layout";
export { anchor, SPACING };

export type DioramaProps = { step: WorldStep };

type Shot = { pos: THREE.Vector3; look: THREE.Vector3 };

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Camera shots, one per step: the overview, each item, then the portal. */
function shots(steps: WorldStep[], wide: boolean): Shot[] {
  const items = steps.filter((s) => s.kind === "item").length;
  let k = 0;
  return steps.map((s) => {
    if (s.kind === "intro") {
      // low over the dock, looking down the path at the first islets
      const look = new THREE.Vector3(Math.min(items - 1, 2) * SPACING * 0.42, 0, 0);
      return { pos: new THREE.Vector3(-34, wide ? 15 : 24, wide ? 22 : 34), look };
    }
    if (s.kind === "next") {
      const a = anchor(items);
      return { pos: a.clone().add(new THREE.Vector3(-2, wide ? 6.5 : 9, wide ? 19 : 26)), look: a.clone().add(new THREE.Vector3(0, 2.6, 0)) };
    }
    const a = anchor(k++);
    return {
      pos: a.clone().add(new THREE.Vector3(-3, wide ? 10 : 15, wide ? 25.5 : 33)),
      look: a.clone().add(new THREE.Vector3(0, 2.4, 1.2)),
    };
  });
}

/**
 * Flies the camera between shots as the page scrolls. On wide screens the picture is
 * shifted right with a view offset (the card sits on the left); on phones it is shifted
 * up (the card sits at the bottom). Also blends the sky between steps.
 */
function Rig({ world, focus }: { world: World; focus: React.RefObject<THREE.Vector3> }) {
  const size = useThree((s) => s.size);
  const get = useThree((s) => s.get);
  const wide = size.width >= 900;
  const list = useMemo(() => shots(world.steps, wide), [world, wide]);
  const reduced = useReducedMotion();
  const pos = useRef(new THREE.Vector3());

  // a wider lens on portrait phones, so an islet fits across the narrow frame
  useEffect(() => {
    const cam = get().camera as THREE.PerspectiveCamera;
    cam.fov = size.width / size.height < 0.8 ? 46 : 34;
    cam.updateProjectionMatrix();
    return () => {
      cam.clearViewOffset();
      cam.fov = 34;
      cam.updateProjectionMatrix();
    };
  }, [get, size]);
  // the picture slides aside when the step card opens, and recentres when it collapses
  const shiftNow = useRef(0);

  useFrame((state, dt) => {
    stepJourney(dt, reduced);
    const want = cardUI.open ? 1 : 0;
    shiftNow.current += (want - shiftNow.current) * (reduced ? 1 : 1 - Math.exp(-dt * 5));
    const cam = state.camera as THREE.PerspectiveCamera;
    const k = shiftNow.current;
    // open: picture shifted right of the card (desktop) or up above it (phones); collapsed, the small card sits bottom left, so nudge the picture up and right of it
    if (wide) cam.setViewOffset(size.width, size.height, -size.width * (0.05 + 0.16 * k), size.height * 0.05 * (1 - k), size.width, size.height);
    else cam.setViewOffset(size.width, size.height, 0, size.height * (0.13 + 0.09 * k), size.width, size.height);
    const p = Math.min(Math.max(journey.progress, 0), list.length - 1);
    const i = Math.min(Math.floor(p), list.length - 2);
    const f = smooth(p - i);
    const a = list[i];
    const b = list[i + 1];
    const v = pos.current;
    v.lerpVectors(a.pos, b.pos, f);
    v.y += Math.sin(f * Math.PI) * 6; // rise between stops, like a short flight
    state.camera.position.copy(v);
    focus.current.lerpVectors(a.look, b.look, f);
    state.camera.lookAt(focus.current);
    state.camera.rotateZ(partyRoll());
    blendSky(world.steps, journey.progress);
  });
  return null;
}

/**
 * Draws a diorama in full only when the camera is near enough to see its detail.
 * Further away it swaps to a plain islet, which keeps the overview shot cheap.
 */
function Cull({ at, children, far = 80 }: { at: THREE.Vector3; children: ReactNode; far?: number }) {
  const full = useRef<THREE.Group>(null);
  const proxy = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    const near = camera.position.distanceTo(at) < far;
    if (full.current) full.current.visible = near;
    if (proxy.current) proxy.current.visible = !near;
  });
  return (
    <>
      <group ref={full}>{children}</group>
      <group ref={proxy} visible={false}>
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[11, 9.6, 1.4, 40]} />
          <Toon color={C.clay} outline={false} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[11, 11, 0.12, 40]} />
          <Toon color={C.sand} outline={false} />
        </mesh>
      </group>
    </>
  );
}

/** A plank bridge from one islet's edge to the next. */
function Bridge({ from, to, r0 = 10.6, r1 = 10.6 }: { from: THREE.Vector3; to: THREE.Vector3; r0?: number; r1?: number }) {
  const d = to.clone().sub(from).setY(0).normalize();
  const s = from.clone().add(d.clone().multiplyScalar(r0));
  const e = to.clone().sub(d.clone().multiplyScalar(r1));
  const len = s.distanceTo(e);
  const mid = s.clone().add(e).multiplyScalar(0.5);
  const yaw = -Math.atan2(d.z, d.x);
  // posts and piers: one instanced draw each, whatever the bridge's length
  const n = Math.floor(len / 3);
  const posts: Instance[] = Array.from({ length: n + 1 }, (_, i) => [-1.15, 1.15].map((z) => ({ p: [-len / 2 + i * (len / n), 0.3, z] as [number, number, number] }))).flat();
  const m = Math.floor(len / 6);
  const piers: Instance[] = Array.from({ length: m }, (_, i) => ({ p: [-len / 2 + (i + 1) * (len / (m + 1)), -0.7, 0] as [number, number, number] }));
  return (
    <group position={[mid.x, 0.05, mid.z]} rotation={[0, yaw, 0]}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[len, 0.22, 2.4]} />
        <Toon color={C.bark} thickness={1.6} />
      </mesh>
      {[-1.15, 1.15].map((z) => (
        <mesh key={z} position={[0, 0.55, z]}>
          <boxGeometry args={[len, 0.08, 0.08]} />
          <Toon color={C.cream} outline={false} />
        </mesh>
      ))}
      <ToonInstances items={posts} color={C.bark} outline={false}>
        <boxGeometry args={[0.1, 0.6, 0.1]} />
      </ToonInstances>
      <ToonInstances items={piers} color={C.bark} outline={false}>
        <cylinderGeometry args={[0.18, 0.18, 1.4, 8]} />
      </ToonInstances>
    </group>
  );
}

function Sea({ color, center }: { color: string; center: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center, -1.1, 0]} receiveShadow>
      <circleGeometry args={[420, 64]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

/** Foam around every islet, breathing in and out. One material for all of them. */
// one material for every foam ring in every world
const foamMat = new THREE.MeshBasicMaterial({ color: C.foam, transparent: true, opacity: 0.5 });

/** Foam around every islet, breathing in and out. */
function Foam({ at }: { at: { p: THREE.Vector3; r: number }[] }) {
  useFrame(({ clock }) => {
    foamMat.opacity = 0.35 + 0.2 * Math.sin(clock.elapsedTime * 1.2);
  });
  return (
    <>
      {at.map(({ p, r }, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[p.x, -1.04, p.z]} material={foamMat}>
          <ringGeometry args={[r + 0.3, r + 1, 56]} />
        </mesh>
      ))}
    </>
  );
}

/**
 * A world: a dock with its name, one islet per entry in time order, and a portal to the
 * next world. Dioramas are keyed by step id and stand on their own islets.
 */
export function WorldFrame({
  world,
  dioramas,
  done,
  connector = "bridge",
  sea = C.sea,
  extras,
}: {
  world: World;
  dioramas: Record<string, ComponentType<DioramaProps>>;
  done: ReactNode;
  connector?: "plane" | "bridge";
  sea?: string;
  extras?: ReactNode;
}) {
  const focus = useRef(new THREE.Vector3());
  const items = world.steps.filter((s) => s.kind === "item");
  const next = world.steps.find((s) => s.kind === "next");
  const nextLink = next?.links?.find((l) => l.primary);
  const nextLabel = nextLink?.href === "/#contact" ? "Contact" : (next?.title ?? "").replace(/\.$/, "");
  const dock = new THREE.Vector3(-SPACING * 0.55, 0, 0);
  const end = anchor(items.length);

  const pieces: ReactNode[] = [
    <Sea key="sea" color={sea} center={(items.length * SPACING) / 2} />,
    <Foam key="foam" at={[{ p: dock, r: 7 }, ...items.map((_, k) => ({ p: anchor(k), r: 11 })), { p: end, r: 7.5 }]} />,
    // the dock: where the world starts, with its name
    <group key="dock" position={dock}>
      <Islet r={7} top={C.sand} />
      <Sign text={world.label.toUpperCase()} sub="Scroll to walk the path" size={0.85} position={[0, 0.1, 0]} rotation={0.5} />
    </group>,
    ...items.map((s, k) => {
      const D = dioramas[s.id];
      return (
        <group key={s.id} position={anchor(k)}>
          <Cull at={anchor(k)}>{D ? <D step={s} /> : <Islet />}</Cull>
        </group>
      );
    }),
    <group key="end" position={end}>
      <Islet r={7.5} top={C.sand} />
      {nextLink && <Portal href={nextLink.href} label={nextLabel} color={C.coral} position={[0, 0.15, 0]} scale={1.25} />}
    </group>,
  ];
  if (connector === "bridge") {
    pieces.push(<Bridge key="b-dock" from={dock} to={anchor(0)} r0={6.6} />);
    items.forEach((_, k) => pieces.push(<Bridge key={`b${k}`} from={anchor(k)} to={anchor(k + 1)} r1={k === items.length - 1 ? 7.1 : 10.6} />));
  }
  // the visitor's traveler walks the bridges, or flies between cities
  pieces.push(<WorldTraveler key="traveler" world={world} plane={connector === "plane"} />);
  if (extras) pieces.push(<group key="extras">{extras}</group>);

  return (
    <>
      <Rig world={world} focus={focus} />
      <Lights focus={focus} span={20} />
      <Progressive done={done}>{pieces}</Progressive>
    </>
  );
}
