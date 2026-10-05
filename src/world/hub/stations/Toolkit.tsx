"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon } from "../../toon";
import { Label, useHoverCursor } from "../../bits";

const BLOCKS: { t: string; c: string; p: [number, number, number] }[] = [
  { t: "PYTHON", c: C.sun, p: [-1.9, 0.5, 0] },
  { t: "JAVA", c: C.coral, p: [-0.62, 0.5, 0.1] },
  { t: "TS", c: C.cobalt, p: [0.66, 0.5, -0.05] },
  { t: "GCP", c: C.green, p: [1.94, 0.5, 0.05] },
  { t: "LLM", c: C.rose, p: [-1.26, 1.5, 0.05] },
  { t: "SPARK", c: C.teal, p: [0.02, 1.5, 0] },
  { t: "K8S", c: C.plum, p: [1.3, 1.5, -0.05] },
  { t: "MCP", c: C.cream, p: [-0.62, 2.5, 0] },
  { t: "SQL", c: C.sun, p: [0.66, 2.5, 0.05] },
];

function Block({ t, c, p }: (typeof BLOCKS)[number]) {
  const ref = useRef<THREE.Group>(null);
  const hop = useRef(0);
  const { bind } = useHoverCursor();
  useFrame((_, dt) => {
    if (!ref.current) return;
    hop.current = Math.max(0, hop.current - dt * 1.6);
    const h = Math.sin(hop.current * Math.PI) * 1.4;
    ref.current.position.y = p[1] + h;
    ref.current.rotation.y = hop.current * Math.PI * 2;
  });
  const dark = c === C.cobalt || c === C.plum || c === C.teal;
  return (
    <group ref={ref} position={p} onClick={(e) => (e.stopPropagation(), (hop.current = 1))} {...bind}>
      <RoundedBox args={[1.18, 0.92, 0.92]} radius={0.12} castShadow>
        <Toon color={c} />
      </RoundedBox>
      <Label size={t.length > 4 ? 0.2 : 0.26} position={[0, 0, 0.47]} color={dark ? C.cream : C.ink}>
        {t}
      </Label>
    </group>
  );
}

/** Jatiswaram, pure technique: her tools as toy blocks. Click one and it hops. */
export function Toolkit() {
  return (
    <group position={[0, 0.05, 0.4]}>
      {BLOCKS.map((b) => (
        <Block key={b.t} {...b} />
      ))}
    </group>
  );
}
