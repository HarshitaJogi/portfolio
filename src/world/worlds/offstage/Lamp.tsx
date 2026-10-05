"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon } from "../../toon";
import { chime, useHoverCursor } from "../../bits";
import { atmo } from "../../atmosphere";
import { findEgg } from "../../eggs";
import { flameGeometry, lampGeometry, type V3 } from "./parts";

const WICKS = 5;
const BOWL_Y = 2.36;
const BOWL_R = 0.52;

/**
 * A kuthuvilakku, the brass standing lamp lit before a recital. Unlit until you
 * click it: then its five wicks catch one after another and flicker.
 */
export function Kuthuvilakku({ position = [0, 0, 0], scale = 1, phase = 0 }: { position?: V3; scale?: number; phase?: number }) {
  const body = useMemo(() => lampGeometry(), []);
  const flame = useMemo(() => flameGeometry(), []);
  const flames = useRef<THREE.InstancedMesh>(null);
  const pool = useRef<THREE.Mesh>(null);
  const lit = useRef(-1); // time it was lit, or -1
  const t = useRef(0);
  const flare = useRef(0);
  const o = useMemo(() => new THREE.Object3D(), []);
  const { bind } = useHoverCursor();

  useLayoutEffect(() => {
    const m = flames.current;
    if (!m) return;
    m.computeBoundingSphere();
    // the flames move every frame; keep them from being culled by a stale bound
    m.frustumCulled = false;
  }, []);

  useFrame(({ clock }, dt) => {
    const now = clock.elapsedTime;
    t.current = now;
    flare.current = Math.max(0, flare.current - dt * 1.5);
    const m = flames.current;
    if (!m) return;
    const on = lit.current >= 0;
    const n = atmo.night;
    const since = on ? now - lit.current : 0;
    const up = 1 + flare.current * 0.6;
    // unlit, the wicks show as tiny embers, so the lamp reads as waiting to be lit
    for (let i = 0; i < WICKS; i++) {
      const a = (i / WICKS) * Math.PI * 2 + 0.3;
      // each wick catches 0.12s after the last
      const grow = on ? 0.25 + 0.75 * Math.min(Math.max((since - i * 0.12) * 4, 0), 1) : 0.25;
      const f = on ? 1 + Math.sin(now * 11 + i * 2.3 + phase) * 0.12 + Math.sin(now * 23 + i) * 0.06 : 1;
      o.position.set(Math.cos(a) * BOWL_R, BOWL_Y + 0.02, Math.sin(a) * BOWL_R);
      o.rotation.set(Math.sin(now * 7 + i) * 0.12 * grow, 0, Math.cos(now * 5 + i) * 0.12 * grow);
      o.scale.set(grow * 1.4, grow * 1.6 * f * up, grow * 1.4);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    if (on) {
      const k = Math.min(since * 2, 1);
      const breathe = (0.85 + Math.sin(now * 9 + phase) * 0.08) * up;
      if (pool.current) {
        pool.current.visible = true;
        (pool.current.material as THREE.MeshBasicMaterial).opacity = k * breathe * (0.1 + 0.25 * n);
      }
    } else {
      if (pool.current) pool.current.visible = false;
    }
  });

  const light = () => {
    if (lit.current >= 0) {
      // already burning: the flames jump, a softer bell
      flare.current = 1;
      chime(660);
      return;
    }
    lit.current = t.current;
    chime(990);
    setTimeout(() => chime(1320), 140);
    findEgg("lamp");
  };

  return (
    <group position={position} scale={scale}>
      <group onClick={(e) => (e.stopPropagation(), light())} {...bind}>
        <mesh geometry={body} castShadow>
          <Toon color={C.gold} emissive={C.clayDark} thickness={1.8} />
        </mesh>
        {/* an invisible, easy target: the lamp is slim */}
        <mesh position={[0, 1.6, 0]} visible={false}>
          <cylinderGeometry args={[0.7, 0.7, 3.4, 8]} />
          <meshBasicMaterial />
        </mesh>
      </group>
      <instancedMesh ref={flames} args={[flame, undefined, WICKS]}>
        <meshBasicMaterial color="#ffb02e" toneMapped={false} />
      </instancedMesh>
      <mesh ref={pool} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} visible={false}>
        <circleGeometry args={[1.3, 28]} />
        <meshBasicMaterial color={C.sun} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
