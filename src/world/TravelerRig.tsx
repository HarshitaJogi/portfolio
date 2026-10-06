"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { World } from "@/content/profile";
import { Avatar, AVATARS, restMotion } from "./avatars";
import { useHoverCursor } from "./bits";
import { journey } from "./scroll";
import { cheer, travelerCheer, travelerSay, useSpeech, useTraveler } from "./traveler";
import { ui, voices } from "@/lib/audio";
import { Plane } from "./props/vehicles";
import { RING_R, stopAngle } from "./palette";
import { hubView, ABOVE } from "./hub/view";
import { anchor, DOCK, DOCK_R, END_R, ISLET_R, STAND } from "./worlds/layout";

type V = THREE.Vector3;
const v = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const smooth = (t: number) => t * t * (3 - 2 * t);
const DECK = 0.16;
const PARK = new THREE.Vector3(2.4, 0, 0.6);
const SEAT = new THREE.Vector3(0, 0.42, 0);

/** A polyline walked by distance, so speed stays even across short and long legs. */
class Path {
  pts: V[];
  cum: number[] = [0];
  constructor(pts: V[]) {
    this.pts = pts;
    for (let i = 1; i < pts.length; i++) this.cum.push(this.cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
  }
  get length() {
    return this.cum[this.cum.length - 1];
  }
  at(f: number, out: V, dir: V) {
    const d = Math.min(Math.max(f, 0), 1) * this.length;
    let i = 1;
    while (i < this.cum.length - 1 && this.cum[i] < d) i++;
    const a = this.pts[i - 1];
    const b = this.pts[i];
    const seg = this.cum[i] - this.cum[i - 1] || 1;
    out.lerpVectors(a, b, (d - this.cum[i - 1]) / seg);
    dir.subVectors(b, a).setY(0).normalize();
  }
}

/** The speech bubble that pops up when the traveler is clicked. */
function Bubble({ text }: { text: string }) {
  return (
    <Html position={[0, 3.2, 0]} center zIndexRange={[35, 0]} style={{ pointerEvents: "none" }}>
      <div className="relative w-max max-w-[14rem] max-md:-translate-x-[30%] md:max-w-[19rem] rounded-2xl border-[4px] border-ink bg-[#fff8ec] px-4 py-2.5 text-center font-display text-[1rem] leading-snug whitespace-normal text-ink shadow-[4px_4px_0_var(--ink)] motion-safe:animate-[pop-in_0.35s_cubic-bezier(.2,.9,.3,1.4)_both] md:text-[1.125rem]">
        {text}
        <span className="absolute -bottom-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-r-[3px] border-b-[3px] border-ink bg-[#fff8ec]" />
      </div>
    </Html>
  );
}

/** Shared body: the avatar, its click (a cheer, a chime, a line), and the bubble. */
function Body({ motion, scale = 1 }: { motion: React.RefObject<ReturnType<typeof restMotion>>; scale?: number }) {
  const { kind } = useTraveler();
  const sp = useSpeech();
  // the `until` of the last line that has run out
  const [expired, setExpired] = useState(0);
  const { bind } = useHoverCursor();
  const me = AVATARS.find((a) => a.id === kind) ?? AVATARS[0];
  // re-render once the line has run its time, so the bubble goes away
  useEffect(() => {
    const t = window.setTimeout(() => setExpired(sp.until), Math.max(0, sp.until - performance.now()));
    return () => window.clearTimeout(t);
  }, [sp]);
  const showing = Boolean(sp.text) && expired !== sp.until;
  return (
    <group
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        travelerCheer();
        voices[kind]();
        travelerSay(`I'm ${me.name}. ${me.line}`, 2800);
      }}
      {...bind}
    >
      <Avatar kind={kind} motion={motion} />
      {showing && <Bubble text={sp.text} />}
    </group>
  );
}

/** Cheer strength from the shared signal: 1 right after a cheer, fading over 1.6 s. */
const cheerNow = () => Math.max(0, 1 - (performance.now() - cheer.at) / 1600);

/**
 * The traveler in a world. It stands at each step; when the step changes it walks the
 * bridges to the next islet, or, with `plane`, hops on the little plane and flies there.
 */
export function WorldTraveler({ world, plane }: { world: World; plane?: boolean }) {
  const items = world.steps.filter((s) => s.kind === "item").length;
  const body = useRef<THREE.Group>(null);
  const craft = useRef<THREE.Group>(null);
  const motion = useRef(restMotion());
  const scratch = useRef({ pos: v(), dir: v(), face: v(), a: v(), b: v(), lastQ: 0, arrived: 1, lastStep: 0, flying: false });

  // where the traveler stands at each step, and the walk between consecutive steps
  const { spots, paths } = useMemo(() => {
    const end = anchor(items);
    const centers = [DOCK, ...Array.from({ length: items }, (_, k) => anchor(k)), end];
    const radii = [DOCK_R - 0.4, ...Array.from({ length: items }, () => ISLET_R - 0.4), END_R - 0.4];
    const spots = centers.map((c, i) => (i === 0 ? c.clone().add(v(1.4, DECK, 2.6)) : i === centers.length - 1 ? c.clone().add(v(-1.4, DECK, 3.6)) : c.clone().add(STAND)));
    const paths = spots.slice(0, -1).map((s, i) => {
      const d = centers[i + 1].clone().sub(centers[i]).setY(0).normalize();
      const out = centers[i].clone().add(d.clone().multiplyScalar(radii[i])).setY(DECK);
      const into = centers[i + 1].clone().sub(d.clone().multiplyScalar(radii[i + 1])).setY(DECK);
      return new Path([s, out, into, spots[i + 1]]);
    });
    return { spots, paths };
  }, [items]);

  useFrame((state, dt) => {
    const g = body.current;
    if (!g) return;
    const m = motion.current;
    const S = scratch.current;
    const q = Math.min(Math.max(journey.progress, 0), spots.length - 1);
    const i = Math.min(Math.floor(q), spots.length - 2);
    const f = q - i;
    const moving = journey.t < 1 && f > 0.001 && f < 0.999;
    let walk = 0;
    let air = 0;
    let ride = 0;

    if (plane && craft.current) {
      // parked beside the stand spot; flies an arc to the next one
      const c = craft.current;
      const park = (k: number, out: V) => out.copy(spots[k]).add(PARK);
      park(i, S.a);
      park(i + 1, S.b);
      const ff = smooth(f);
      c.position.lerpVectors(S.a, S.b, ff);
      c.position.y = DECK + 0.55 + Math.sin(f * Math.PI) * 9;
      const dx = S.b.x - S.a.x;
      const dz = S.b.z - S.a.z;
      const yaw = Math.atan2(-dz, dx);
      c.rotation.set(0, yaw, 0, "YXZ");
      c.rotateZ(Math.cos(f * Math.PI) * 0.25 * (moving ? 1 : 0));
      if (!moving && f < 0.5) c.rotation.set(0, 0, 0);
      if (moving && f > 0.08 && !S.flying) {
        S.flying = true;
        ui.takeoff();
      }
      if (!moving) S.flying = false;
      if (moving && f > 0.1 && f < 0.9) {
        // riding on the plane's back
        S.pos.copy(c.position).add(SEAT);
        g.position.copy(S.pos);
        g.rotation.set(0, yaw + Math.PI / 2, 0);
        ride = 1;
      } else {
        // hop on, hop off
        const k = f < 0.5 ? f / 0.1 : (1 - f) / 0.1;
        const from = f < 0.5 ? spots[i] : spots[i + 1];
        S.pos.lerpVectors(from, c.position, moving ? Math.min(k, 1) : 0);
        S.pos.y += moving ? Math.sin(Math.min(k, 1) * Math.PI) * 1.2 : 0;
        g.position.copy(S.pos);
        air = moving ? Math.sin(Math.min(k, 1) * Math.PI) : 0;
      }
    } else {
      paths[i].at(moving ? f : f < 0.5 ? 0 : 1, S.pos, S.dir);
      // little hops as it walks
      const phase = f * paths[i].length * 1.4;
      const hop = moving ? Math.abs(Math.sin(phase)) * 0.28 : 0;
      const n = Math.floor(phase / Math.PI);
      if (moving && n !== S.lastStep) {
        S.lastStep = n;
        ui.step();
      }
      g.position.set(S.pos.x, S.pos.y + hop, S.pos.z);
      walk = moving ? 1 : 0;
      if (moving) g.rotation.y = Math.atan2(S.dir.x, S.dir.z);
    }

    if (!moving && !ride) {
      // at rest: turn to face the camera
      S.face.subVectors(state.camera.position, g.position);
      const want = Math.atan2(S.face.x, S.face.z);
      const d = Math.atan2(Math.sin(want - g.rotation.y), Math.cos(want - g.rotation.y));
      g.rotation.y += d * (1 - Math.exp(-dt * 5));
    }

    // a small cheer on arrival
    if (!moving && S.arrived === 0) {
      S.arrived = 1;
      if (Math.abs(q - Math.round(q)) < 0.01) cheer.at = Math.max(cheer.at, performance.now() - 900);
    }
    if (moving) S.arrived = 0;

    m.walk = walk;
    m.air = air;
    m.ride = ride;
    m.cheer = cheerNow();
  });

  return (
    <>
      <group ref={body}>
        <Body motion={motion} />
      </group>
      {plane && (
        <group ref={craft} scale={0.95}>
          <Plane />
        </group>
      )}
    </>
  );
}

const SHORE = RING_R + 5.4;

/**
 * The traveler on the hub. It runs around the shore to whichever district is picked,
 * and waits by the welcome gate on the map.
 */
export function HubTraveler() {
  const body = useRef<THREE.Group>(null);
  const motion = useRef(restMotion());
  const st = useRef({ angle: stopAngle(0) - 0.2, face: v(), lastStep: 0 });
  useFrame((state, dt) => {
    const g = body.current;
    if (!g) return;
    const f = hubView.get().focus;
    const target = (f >= 0 && f !== ABOVE ? stopAngle(f) : stopAngle(0)) - 0.2;
    const s = st.current;
    const d = Math.atan2(Math.sin(target - s.angle), Math.cos(target - s.angle));
    const speed = Math.min(Math.max(Math.abs(d) * 1.1, 0.32), 1.4);
    const step = Math.sign(d) * Math.min(Math.abs(d), speed * dt);
    s.angle += step;
    const moving = Math.abs(d) > 0.002;
    const x = Math.cos(s.angle) * SHORE;
    const z = Math.sin(s.angle) * SHORE;
    const hop = moving ? Math.abs(Math.sin(state.clock.elapsedTime * 6.5)) * 0.25 : 0;
    const n = Math.floor((state.clock.elapsedTime * 6.5) / Math.PI);
    if (moving && n !== s.lastStep) {
      s.lastStep = n;
      ui.step();
    }
    g.position.set(x, 0.16 + hop, z);
    if (moving) {
      // face along the shore, in the direction of travel
      const tx = -Math.sin(s.angle) * Math.sign(d);
      const tz = Math.cos(s.angle) * Math.sign(d);
      g.rotation.y = Math.atan2(tx, tz);
    } else {
      s.face.subVectors(state.camera.position, g.position);
      const want = Math.atan2(s.face.x, s.face.z);
      const dd = Math.atan2(Math.sin(want - g.rotation.y), Math.cos(want - g.rotation.y));
      g.rotation.y += dd * (1 - Math.exp(-dt * 5));
    }
    const m = motion.current;
    m.walk = moving ? 1 : 0;
    m.air = 0;
    m.ride = 0;
    m.cheer = cheerNow();
  });
  return (
    <group ref={body}>
      <Body motion={motion} scale={0.6} />
    </group>
  );
}
