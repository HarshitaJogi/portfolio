"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { Toon, ToonInstances, type Instance } from "../toon";
import { chime, useHoverCursor } from "../bits";

type V3 = [number, number, number];

/** Moves its child back and forth along local x between `from` and `to`, turning at the ends. */
export function Shuttle({ from, to, speed = 1.5, children, phase = 0, y = 0, z = 0 }: { from: number; to: number; speed?: number; children: ReactNode; phase?: number; y?: number; z?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const len = Math.abs(to - from);
    const t = ((clock.elapsedTime * speed + phase) % (len * 2)) / len; // 0..2
    const f = t < 1 ? t : 2 - t;
    const ease = f * f * (3 - 2 * f);
    ref.current.position.x = from + (to - from) * ease;
    ref.current.rotation.y = t < 1 ? 0 : Math.PI;
  });
  return (
    <group ref={ref} position={[from, y, z]}>
      {children}
    </group>
  );
}

/** A Mumbai kaali-peeli: black body, yellow roof. Click it for a honk. */
export function Taxi({ onClick }: { onClick?: () => void } = {}) {
  const { bind } = useHoverCursor();
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        chime(330);
        setTimeout(() => chime(330), 140);
        onClick?.();
      }}
      {...bind}
    >
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.6, 0.42, 0.78]} />
        <Toon color="#1e1e24" thickness={1.6} />
      </mesh>
      <mesh position={[-0.05, 0.8, 0]} castShadow>
        <boxGeometry args={[0.9, 0.36, 0.72]} />
        <Toon color={C.taxiYellow} thickness={1.6} />
      </mesh>
      <mesh position={[-0.05, 1.04, 0]}>
        <boxGeometry args={[0.32, 0.12, 0.2]} />
        <Toon color={C.taxiYellow} thickness={1.2} />
      </mesh>
      {[-0.5, 0.5].flatMap((x) =>
        [-0.4, 0.4].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.2, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.1, 12]} />
            <Toon color={C.ink} outline={false} />
          </mesh>
        )),
      )}
    </group>
  );
}

/** A Green Line streetcar, the kind that runs down Huntington Avenue past Northeastern. Click for its bell. */
export function Trolley({ onClick }: { onClick?: () => void } = {}) {
  const { bind } = useHoverCursor();
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        chime(1180);
        setTimeout(() => chime(1180), 160);
        onClick?.();
      }}
      {...bind}
    >
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[3.4, 1.2, 1.05]} />
        <Toon color={C.trolley} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[3.1, 0.2, 0.95]} />
        <Toon color={C.cream} />
      </mesh>
      {/* windows */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x) => (
        <mesh key={x} position={[x, 1.05, 0.53]}>
          <planeGeometry args={[0.44, 0.42]} />
          <meshBasicMaterial color={C.glass} />
        </mesh>
      ))}
      {/* pantograph */}
      <mesh position={[0, 1.95, 0]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.05, 0.7, 0.05]} />
        <meshBasicMaterial color={C.ink} />
      </mesh>
      <mesh position={[0.2, 2.25, 0]}>
        <boxGeometry args={[0.6, 0.04, 0.3]} />
        <meshBasicMaterial color={C.ink} />
      </mesh>
      {[-1.1, 1.1].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]}>
          <boxGeometry args={[0.8, 0.22, 0.9]} />
          <Toon color={C.ink} outline={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Two rails on sleepers along local x. */
export function Track({ length, position = [0, 0, 0] }: { length: number; position?: V3 }) {
  const n = Math.floor(length / 0.6);
  const sleepers = useMemo<Instance[]>(() => Array.from({ length: n }, (_, i) => ({ p: [-length / 2 + (i + 0.5) * (length / n), 0.17, 0] as V3 })), [n, length]);
  return (
    <group position={position}>
      {[-0.35, 0.35].map((z) => (
        <mesh key={z} position={[0, 0.22, z]}>
          <boxGeometry args={[length, 0.06, 0.06]} />
          <meshBasicMaterial color={C.steel} />
        </mesh>
      ))}
      <ToonInstances items={sleepers} color={C.bark} outline={false}>
        <boxGeometry args={[0.16, 0.06, 1]} />
      </ToonInstances>
    </group>
  );
}

/** A little sailboat that rocks on the water. */
export function Sailboat({ position = [0, 0, 0], sail = C.cream, phase = 0 }: { position?: V3; sail?: string; phase?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + phase;
    ref.current.rotation.z = Math.sin(t * 1.2) * 0.06;
    ref.current.position.y = position[1] + Math.sin(t * 1.6) * 0.06;
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0, 0]} scale={[1, 0.4, 0.45]} castShadow>
        <sphereGeometry args={[0.8, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <Toon color={C.cream} thickness={1.4} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.8, 6]} />
        <meshBasicMaterial color={C.ink} />
      </mesh>
      <mesh position={[0.32, 0.95, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.5, 1.5, 3]} />
        <Toon color={sail} thickness={1.2} />
      </mesh>
    </group>
  );
}

/** The plane that carries you between cities. Nose points along local +x. */
export function Plane() {
  const prop = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (prop.current) prop.current.rotation.x += dt * 30;
  });
  return (
    <group>
      <mesh rotation={[0, 0, -Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.32, 1.7, 4, 12]} />
        <Toon color={C.cream} />
      </mesh>
      <mesh position={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.6, 0.08, 3.2]} />
        <Toon color={C.coral} />
      </mesh>
      <mesh position={[-1, 0.35, 0]} castShadow>
        <boxGeometry args={[0.4, 0.6, 0.08]} />
        <Toon color={C.coral} />
      </mesh>
      <mesh position={[-1, 0.05, 0]}>
        <boxGeometry args={[0.35, 0.06, 1.2]} />
        <Toon color={C.coral} />
      </mesh>
      {[0.3, 0, -0.3].map((x) => (
        <mesh key={x} position={[x + 0.2, 0.12, 0.3]}>
          <circleGeometry args={[0.08, 10]} />
          <meshBasicMaterial color={C.cobalt} />
        </mesh>
      ))}
      <mesh ref={prop} position={[1.2, 0, 0]}>
        <boxGeometry args={[0.04, 0.9, 0.1]} />
        <meshBasicMaterial color={C.ink} />
      </mesh>
    </group>
  );
}
