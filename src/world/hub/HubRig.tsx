"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RING_R, stopAngle } from "../palette";
import { blendSky } from "../atmosphere";
import { partyRoll } from "../party";
import { useReducedMotion } from "@/lib/device";
import { ABOVE, hubView, orbit } from "./view";

const HUB_SKY = [{ sky: ["#ffe3b3", "#ffd6b8"] as [string, string] }];

type Shot = { angle: number; dist: number; height: number; tr: number; ty: number };

/** Where the camera wants to be for the current view. */
function want(focus: number, wide: boolean, out: Shot) {
  if (focus === ABOVE) {
    out.angle = orbit.azimuth;
    out.dist = 0.6;
    out.height = wide ? 52 : 74;
    out.tr = 0;
    out.ty = 0;
  } else if (focus >= 0) {
    out.angle = stopAngle(focus);
    out.dist = RING_R + (wide ? 15 : 19);
    out.height = wide ? 8.5 : 12;
    out.tr = RING_R;
    out.ty = wide ? 1.8 : 0.6;
  } else {
    out.angle = orbit.azimuth;
    out.dist = wide ? 58 : 70;
    out.height = wide ? 31 : 44;
    out.tr = 0;
    out.ty = wide ? -1 : -4;
  }
}

/** Shortest signed difference between two angles. */
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * The hub camera. On the map, drag to turn the island (it drifts slowly when left alone).
 * Pick a district and the camera arcs over to it. The picture is offset so it sits beside
 * the card: right of it on wide screens, above it on phones.
 */
export function HubRig() {
  const size = useThree((s) => s.size);
  const get = useThree((s) => s.get);
  const reduced = useReducedMotion();
  const wide = size.width >= 900;
  const cur = useRef<Shot>({ angle: orbit.azimuth, dist: 60, height: 32, tr: 0, ty: 0 });
  const goal = useRef<Shot>({ angle: 0, dist: 0, height: 0, tr: 0, ty: 0 });
  const tmp = useRef({ target: new THREE.Vector3() });

  // view offset, and a wider lens on portrait phones
  useEffect(() => {
    const cam = get().camera as THREE.PerspectiveCamera;
    cam.fov = size.width / size.height < 0.8 ? 46 : 34;
    cam.updateProjectionMatrix();
    if (wide) cam.setViewOffset(size.width, size.height, -size.width * 0.2, 0, size.width, size.height);
    else cam.setViewOffset(size.width, size.height, 0, size.height * 0.2, size.width, size.height);
    return () => {
      cam.clearViewOffset();
      cam.fov = 34;
      cam.updateProjectionMatrix();
    };
  }, [get, size, wide]);

  // drag to turn
  useEffect(() => {
    const el = get().gl.domElement;
    let down = false;
    let x0 = 0;
    let moved = 0;
    const onDown = (e: PointerEvent) => {
      down = true;
      x0 = e.clientX;
      moved = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - x0;
      x0 = e.clientX;
      moved += Math.abs(dx);
      if (moved > 6) {
        const f = hubView.get().focus;
        if (f !== -1 && f !== ABOVE) {
          // start turning from wherever the camera is now
          orbit.azimuth = cur.current.angle;
          hubView.focus(-1);
        }
        orbit.azimuth -= dx * 0.0065;
        orbit.lastInput = performance.now();
        el.style.cursor = "grabbing";
      }
    };
    const onUp = () => {
      if (moved > 6) {
        orbit.suppressClick = true;
        setTimeout(() => (orbit.suppressClick = false), 0);
      }
      down = false;
      el.style.cursor = "";
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [get]);

  useFrame((state, dt) => {
    const focus = hubView.get().focus;
    // a slow drift on the map when nobody is touching it
    if (focus === -1 && !reduced && performance.now() - orbit.lastInput > 5000) orbit.azimuth += dt * 0.05;
    want(focus, wide, goal.current);
    const c = cur.current;
    const g = goal.current;
    const k = reduced ? 1 : 1 - Math.exp(-dt * 2.4);
    c.angle += wrap(g.angle - c.angle) * k;
    c.dist += (g.dist - c.dist) * k;
    c.height += (g.height - c.height) * k;
    c.tr += (g.tr - c.tr) * k;
    c.ty += (g.ty - c.ty) * k;
    const cam = state.camera;
    cam.position.set(Math.cos(c.angle) * c.dist, c.height, Math.sin(c.angle) * c.dist);
    const t = tmp.current.target.set(Math.cos(c.angle) * c.tr, c.ty, Math.sin(c.angle) * c.tr);
    cam.lookAt(t);
    cam.rotateZ(partyRoll());
    blendSky(HUB_SKY, 0);
  });
  return null;
}
