"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { RING_R, STOP_COUNT, stopAngle } from "./palette";
import { journey } from "./scroll";
import { useReducedMotion } from "@/lib/device";

type Shot = { angle: number; dist: number; height: number; tr: number; ty: number; shift: number };

/** One camera shot per stop. Interpolated as orbit parameters, so moves arc around the island. */
function shots(wide: boolean): Shot[] {
  const list: Shot[] = [];
  // 0: establishing shot over the welcome gate
  list.push({ angle: stopAngle(0) + (wide ? 0.35 : 0), dist: wide ? 40 : 52, height: wide ? 21 : 30, tr: wide ? -6 : 0, ty: wide ? 0 : -6, shift: 0 });
  // 1..8: each station, the camera outside the ring looking in
  for (let i = 1; i < STOP_COUNT; i++) {
    list.push({ angle: stopAngle(i), dist: RING_R + (wide ? 14 : 16), height: wide ? 7.6 : 10, tr: RING_R, ty: wide ? 1.7 : -0.8, shift: wide ? 0.2 : 0 });
  }
  // last: top-down over the whole ring, for the margam reveal
  list.push({ angle: stopAngle(STOP_COUNT - 1) + 0.6, dist: 0.5, height: wide ? 46 : 62, tr: 0, ty: 0, shift: 0 });
  return list;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

export function CameraRig() {
  const { camera, size } = useThree();
  const wide = size.width >= 900;
  const list = useMemo(() => shots(wide), [wide]);
  const target = useRef(new THREE.Vector3());
  const reduced = useReducedMotion();

  useFrame((_, dt) => {
    // ease the progress toward where the page has scrolled
    const k = reduced ? 1 : 1 - Math.exp(-dt * 4);
    journey.progress += (journey.target - journey.progress) * k;
    const p = Math.min(Math.max(journey.progress, 0), list.length - 1);
    const i = Math.min(Math.floor(p), list.length - 2);
    const f = smooth(p - i);
    const a = list[i];
    const b = list[i + 1];
    let da = b.angle - a.angle;
    if (da < 0) da += Math.PI * 2;
    const lerp = (x: number, y: number) => x + (y - x) * f;
    const angle = a.angle + da * f;
    const dist = lerp(a.dist, b.dist);
    const height = lerp(a.height, b.height) + Math.sin(f * Math.PI) * 4; // lift between stops
    const tr = lerp(a.tr, b.tr);
    const ty = lerp(a.ty, b.ty);
    const shift = lerp(a.shift, b.shift);
    camera.position.set(Math.cos(angle) * dist, height, Math.sin(angle) * dist);
    target.current.set(Math.cos(angle + shift) * tr, ty, Math.sin(angle + shift) * tr);
    camera.lookAt(target.current);
  });
  return null;
}
