"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { Toon } from "../toon";
import { Label, chime, useHoverCursor } from "../bits";
import { island, useIsland } from "../state";
import { findEgg } from "../eggs";

const TESTS = [C.coral, C.sun, C.cobalt, C.green, C.rose, C.teal];

/** Deterministic 0..1 noise, so the confetti burst is the same every time and render stays pure. */
const hash = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function Confetti({ go }: { go: boolean }) {
  const pts = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        v: new THREE.Vector3((hash(i, 1) - 0.5) * 4, 3 + hash(i, 2) * 3, (hash(i, 3) - 0.5) * 3),
        c: TESTS[i % TESTS.length],
      })),
    [],
  );
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t0 = useRef<number | null>(null);
  useFrame(({ clock }) => {
    if (!go) {
      t0.current = null;
      refs.current.forEach((m) => m && (m.visible = false));
      return;
    }
    if (t0.current === null) t0.current = clock.elapsedTime;
    const t = clock.elapsedTime - t0.current;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const p = pts[i];
      m.visible = t < 2.4;
      m.position.set(p.v.x * t, 2.6 + p.v.y * t - 4.9 * t * t, p.v.z * t);
      m.rotation.set(t * 6 + i, t * 4, 0);
    });
  });
  return (
    <group position={[1.6, 0, 0]}>
      {pts.map((p, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          visible={false}
        >
          <boxGeometry args={[0.12, 0.12, 0.02]} />
          <meshBasicMaterial color={p.c} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Nokia: a robot drafts tests (wireframe = draft). It cannot ship them. A human has to
 * press APPROVE. Press it, and the drafts turn solid, the sign flips to VERIFIED.
 */
export function Agent() {
  const { approved } = useIsland();
  const robot = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const antenna = useRef<THREE.MeshBasicMaterial>(null);
  const button = useRef<THREE.Mesh>(null);
  const jump = useRef(0);
  const { hovered, bind } = useHoverCursor();

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    jump.current = Math.max(0, jump.current - dt * 1.5);
    if (robot.current) {
      robot.current.position.y = Math.abs(Math.sin(jump.current * Math.PI * 2)) * 0.8 + Math.sin(t * 2) * 0.04;
      robot.current.rotation.y = approved ? Math.sin(t * 3) * 0.25 : -0.35 + Math.sin(t) * 0.08;
    }
    if (arm.current) arm.current.rotation.x = approved ? -2.6 + Math.sin(t * 8) * 0.3 : -0.9 + Math.sin(t * 2.5) * 0.35;
    if (antenna.current) antenna.current.color.set(approved ? C.green : Math.sin(t * 5) > 0 ? C.red : "#5a1f24");
    if (button.current) {
      const target = approved ? 1.02 : hovered ? 1.08 : 1.16;
      button.current.position.y += (target - button.current.position.y) * 0.25;
    }
  });

  const approve = () => {
    if (approved) {
      island.set({ approved: false });
      return;
    }
    island.set({ approved: true });
    jump.current = 1;
    chime(880);
    findEgg("approve");
  };

  return (
    <group position={[0, 0.05, 0.4]}>
      {/* the robot */}
      <group ref={robot} position={[-1.7, 0, 0]}>
        <RoundedBox args={[1.2, 1.3, 0.9]} radius={0.22} position={[0, 1.15, 0]} castShadow>
          <Toon color={C.cream} />
        </RoundedBox>
        <RoundedBox args={[1, 0.8, 0.8]} radius={0.2} position={[0, 2.25, 0]} castShadow>
          <Toon color={C.cream} />
        </RoundedBox>
        <mesh position={[0, 2.3, 0.41]}>
          <boxGeometry args={[0.72, 0.38, 0.02]} />
          <meshBasicMaterial color={C.ink} />
        </mesh>
        {[-0.17, 0.17].map((x) => (
          <mesh key={x} position={[x, 2.3, 0.43]}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshBasicMaterial color={approved ? C.green : C.sun} />
          </mesh>
        ))}
        <mesh position={[0, 2.85, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 6]} />
          <Toon color={C.ink} outline={false} />
        </mesh>
        <mesh position={[0, 3.1, 0]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshBasicMaterial ref={antenna} color={C.red} />
        </mesh>
        <group ref={arm} position={[0.68, 1.5, 0]}>
          <mesh position={[0, -0.45, 0]} castShadow>
            <capsuleGeometry args={[0.13, 0.7, 4, 8]} />
            <Toon color={C.coral} />
          </mesh>
        </group>
        <mesh position={[-0.68, 1.05, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.7, 4, 8]} />
          <Toon color={C.coral} />
        </mesh>
      </group>

      {/* the drafted tests: wireframe until a human approves */}
      <group position={[0.15, 0, -0.4]}>
        {TESTS.map((c, i) => (
          <mesh key={i} position={[(i % 3) * 0.55 - 0.55, 0.28 + Math.floor(i / 3) * 0.55, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            {approved ? <Toon color={c} thickness={1.4} /> : <meshBasicMaterial color={C.ink} wireframe />}
          </mesh>
        ))}
      </group>

      {/* the human gate */}
      <group position={[1.9, 0, 0.6]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.65, 1, 20]} />
          <Toon color={C.ink} />
        </mesh>
        <mesh ref={button} position={[0, 1.1, 0]} onClick={(e) => (e.stopPropagation(), approve())} {...bind}>
          <cylinderGeometry args={[0.46, 0.46, 0.3, 28]} />
          <Toon color={approved ? C.green : C.red} emissive={hovered && !approved ? C.red : undefined} />
        </mesh>
        <Label size={0.15} position={[0, 0.55, 0.68]} color={C.cream}>
          APPROVE
        </Label>
      </group>

      {/* status sign */}
      <group position={[0.15, 3.3, -0.6]}>
        <RoundedBox args={[2.9, 0.75, 0.15]} radius={0.08} castShadow>
          <Toon color={approved ? C.green : C.sun} />
        </RoundedBox>
        <Label size={0.3} position={[0, 0, 0.09]} color={approved ? C.cream : C.ink}>
          {approved ? "VERIFIED ✓" : "NEEDS REVIEW"}
        </Label>
      </group>
      <Confetti go={approved} />
    </group>
  );
}
