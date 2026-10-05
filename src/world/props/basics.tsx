"use client";

import { RoundedBox } from "@/world/rounded";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { Toon } from "../toon";
import { Label, useHoverCursor } from "../bits";
import { worldNav } from "../nav";

type V3 = [number, number, number];

/** A round piece of land with a clay cliff. Everything in a world stands on one. */
export function Islet({ r = 11, top = C.sand, cliff = C.clay, inner, innerColor = C.grass }: { r?: number; top?: string; cliff?: string; inner?: number; innerColor?: string }) {
  return (
    <group>
      <mesh position={[0, -0.6, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[r, r - 1.4, 1.4, 64]} />
        <Toon color={cliff} thickness={2.6} />
      </mesh>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[r, r, 0.12, 64]} />
        <Toon color={top} outline={false} />
      </mesh>
      {inner && (
        <mesh position={[0, 0.15, 0]} receiveShadow>
          <cylinderGeometry args={[inner, inner, 0.05, 56]} />
          <Toon color={innerColor} outline={false} />
        </mesh>
      )}
    </group>
  );
}

/** A flat slab on the ground: plazas, roads, lawns. */
export function Slab({ size, color, position = [0, 0.16, 0], rotation = 0 }: { size: [number, number]; color: string; position?: V3; rotation?: number }) {
  return (
    <mesh position={position} rotation={[0, rotation, 0]} receiveShadow>
      <boxGeometry args={[size[0], 0.06, size[1]]} />
      <Toon color={color} outline={false} />
    </mesh>
  );
}

/** A signboard on two posts. Big letters, so it reads from the camera. */
export function Sign({ text, sub, position = [0, 0, 0], rotation = 0, color = C.cream, ink = C.ink, width, size = 0.5 }: { text: string; sub?: string; position?: V3; rotation?: number; color?: string; ink?: string; width?: number; size?: number }) {
  const w = width ?? Math.max(2.4, text.length * size * 0.72 + 0.8);
  const h = sub ? size * 2.3 : size * 1.7;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-w / 2 + 0.25, w / 2 - 0.25].map((x) => (
        <mesh key={x} position={[x, 0.9, -0.05]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 1.8, 8]} />
          <Toon color={C.bark} />
        </mesh>
      ))}
      <RoundedBox args={[w, h, 0.18]} radius={0.08} position={[0, 1.8 + h / 2, 0]} castShadow>
        <Toon color={color} />
      </RoundedBox>
      <Label size={size} color={ink} position={[0, 1.8 + h / 2 + (sub ? size * 0.42 : 0), 0.1]}>
        {text}
      </Label>
      {sub && (
        <Label size={size * 0.42} color={ink} position={[0, 1.8 + h / 2 - size * 0.62, 0.1]}>
          {sub}
        </Label>
      )}
    </group>
  );
}

const fmt = new Map<string, Intl.DateTimeFormat>();
function localTime(tz: string) {
  let f = fmt.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" });
    fmt.set(tz, f);
  }
  const parts = f.formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { h: get("hour"), m: get("minute"), s: get("second") };
}

/** A clock face showing the real local time in `tz`. Hands move with the actual clock. */
export function ClockFace({ tz, r = 0.7, rim = C.ink, face = C.cream }: { tz: string; r?: number; rim?: string; face?: string }) {
  const hour = useRef<THREE.Mesh>(null);
  const minute = useRef<THREE.Mesh>(null);
  const second = useRef<THREE.Mesh>(null);
  const last = useRef(-1);
  useFrame(({ clock }) => {
    // the time only needs reading a few times a second
    const t = Math.floor(clock.elapsedTime * 4);
    if (t === last.current) return;
    last.current = t;
    const { h, m, s } = localTime(tz);
    if (hour.current) hour.current.rotation.z = -(((h % 12) + m / 60) / 12) * Math.PI * 2;
    if (minute.current) minute.current.rotation.z = -((m + s / 60) / 60) * Math.PI * 2;
    if (second.current) second.current.rotation.z = -(s / 60) * Math.PI * 2;
  });
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.12, 40]} />
        <Toon color={face} />
      </mesh>
      <mesh position={[0, 0, 0.065]}>
        <ringGeometry args={[r * 0.88, r, 40]} />
        <meshBasicMaterial color={rim} />
      </mesh>
      <Ticks r={r} color={rim} />
      <Hand tref={hour} len={r * 0.5} w={r * 0.1} color={rim} z={0.08} />
      <Hand tref={minute} len={r * 0.74} w={r * 0.065} color={rim} z={0.09} />
      <Hand tref={second} len={r * 0.8} w={r * 0.025} color={C.coral} z={0.1} />
      <mesh position={[0, 0, 0.11]}>
        <circleGeometry args={[r * 0.07, 12]} />
        <meshBasicMaterial color={C.coral} />
      </mesh>
    </group>
  );
}

/** The twelve hour marks, as one instanced draw. */
function Ticks({ r, color }: { r: number; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      o.position.set(Math.sin(a) * r * 0.74, Math.cos(a) * r * 0.74, 0.07);
      o.scale.setScalar(i % 3 === 0 ? 1.8 : 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [r]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 12]}>
      <circleGeometry args={[r * 0.036, 8]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  );
}

/** A clock hand that pivots at its end, at the clock's centre. */
function Hand({ tref, len, w, color, z }: { tref: React.RefObject<THREE.Mesh | null>; len: number; w: number; color: string; z: number }) {
  const geo = useMemo(() => new THREE.PlaneGeometry(w, len).translate(0, len / 2 - w / 2, 0), [w, len]);
  return (
    <mesh ref={tref} position={[0, 0, z]} geometry={geo}>
      <meshBasicMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** A street clock on a post, with the city's name: the real local time there, right now. */
export function CityClock({ tz, city, position = [0, 0, 0], rotation = 0 }: { tz: string; city: string; position?: V3; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 3.2, 10]} />
        <Toon color={C.ink} />
      </mesh>
      <group position={[0, 3.6, 0]}>
        <ClockFace tz={tz} r={0.75} />
      </group>
      <Label size={0.3} position={[0, 2.55, 0.16]} outline={C.cream}>
        {city.toUpperCase()}
      </Label>
    </group>
  );
}

/**
 * A doorway into a world. Click anywhere on it and the page flies there.
 * `children` is the miniature that stands in front of it on the hub.
 */
export function Portal({ href, label, color, position = [0, 0, 0], rotation = 0, scale = 1 }: { href: string; label: string; color: string; position?: V3; rotation?: number; scale?: number }) {
  const swirl = useRef<THREE.Group>(null);
  const { hovered, bind } = useHoverCursor();
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.45, 0);
    s.lineTo(-1.45, 2.6);
    s.absarc(0, 2.6, 1.45, Math.PI, 0, true);
    s.lineTo(1.45, 0);
    s.lineTo(-1.45, 0);
    return s;
  }, []);
  useFrame(({ clock }, dt) => {
    if (!swirl.current) return;
    swirl.current.rotation.z += dt * (hovered ? 2.4 : 0.8);
    const k = hovered ? 1.06 : 1;
    swirl.current.parent!.scale.lerp(new THREE.Vector3(k, k, k), 0.15);
    swirl.current.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.35 + 0.25 * Math.sin(clock.elapsedTime * 2 + i);
    });
  });
  return (
    <group
      position={position}
      rotation={[0, rotation, 0]}
      scale={scale}
      onClick={(e) => (e.stopPropagation(), worldNav.go(href))}
      {...bind}
    >
      <group>
        {[-1.6, 1.6].map((x) => (
          <mesh key={x} position={[x, 1.3, 0]} castShadow>
            <boxGeometry args={[0.36, 2.6, 0.5]} />
            <Toon color={color} />
          </mesh>
        ))}
        <mesh position={[0, 2.6, 0]} castShadow>
          <torusGeometry args={[1.6, 0.2, 10, 32, Math.PI]} />
          <Toon color={color} />
        </mesh>
        {/* the doorway itself */}
        <mesh position={[0, 0.02, -0.02]}>
          <shapeGeometry args={[shape]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <group ref={swirl} position={[0, 2, 0.01]}>
          {[0.4, 0.75, 1.1].map((r, i) => (
            <mesh key={r} rotation={[0, 0, i]}>
              <ringGeometry args={[r, r + 0.12, 32, 1, 0, Math.PI * 1.4]} />
              <meshBasicMaterial color={C.cream} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          ))}
        </group>
      </group>
      <group position={[0, 4.75, 0]}>
        <RoundedBox args={[Math.max(2.6, label.length * 0.3 + 0.8), 0.72, 0.16]} radius={0.08} castShadow>
          <Toon color={C.cream} />
        </RoundedBox>
        <Label size={0.36} position={[0, 0.01, 0.09]}>
          {label.toUpperCase()}
        </Label>
      </group>
    </group>
  );
}

/** Floats its children up and down a little. */
export function Bob({ children, amp = 0.15, speed = 1.6, phase = 0, position }: { children: ReactNode; amp?: number; speed?: number; phase?: number; position?: V3 }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = (position?.[1] ?? 0) + Math.sin(clock.elapsedTime * speed + phase) * amp;
  });
  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  );
}
