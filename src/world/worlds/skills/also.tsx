"use client";

import { Line } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Label } from "../../bits";
import type { DioramaProps } from "../Frame";
import { Chalkboard, Crates, Market, Painted, paint, stack, type V3 } from "./kit";

/*
 * Also familiar, and not yet shown in a role or project on this site. So the crates on
 * this cart are drawn dashed, by the site's one rule: dashed is a draft, solid is verified.
 */

const BED_Y = 1.05;

function cartGeometry() {
  const parts: Parameters<typeof paint>[0] = [
    { g: new THREE.BoxGeometry(5.2, 0.16, 1.5), c: C.bark, p: [0, BED_Y - 0.08, 0] },
    { g: new THREE.BoxGeometry(5.2, 0.2, 0.07), c: C.clayDark, p: [0, BED_Y + 0.08, 0.76] },
    { g: new THREE.BoxGeometry(5.2, 0.2, 0.07), c: C.clayDark, p: [0, BED_Y + 0.08, -0.76] },
    // axle and the stand at the front
    { g: new THREE.CylinderGeometry(0.06, 0.06, 1.9, 8), c: C.ink, p: [0.7, 0.62, 0], r: [Math.PI / 2, 0, 0] },
    { g: new THREE.BoxGeometry(0.12, 0.9, 0.12), c: C.bark, p: [2.4, 0.45, 0.6] },
    { g: new THREE.BoxGeometry(0.12, 0.9, 0.12), c: C.bark, p: [2.4, 0.45, -0.6] },
  ];
  // the handles, out to the left
  [0.6, -0.6].forEach((z) => parts.push({ g: new THREE.BoxGeometry(1.5, 0.1, 0.1), c: C.bark, p: [-3.25, BED_Y - 0.22, z], r: [0, 0, 0.28] }));
  // two spoked wheels
  [0.9, -0.9].forEach((z) => {
    parts.push({ g: new THREE.TorusGeometry(0.6, 0.07, 8, 28), c: C.ink, p: [0.7, 0.62, z] });
    parts.push({ g: new THREE.CylinderGeometry(0.13, 0.13, 0.14, 12), c: C.sun, p: [0.7, 0.62, z], r: [Math.PI / 2, 0, 0] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      parts.push({ g: new THREE.BoxGeometry(0.05, 0.56, 0.05), c: C.bark, p: [0.7 + Math.cos(a) * 0.29, 0.62 + Math.sin(a) * 0.29, z], r: [0, 0, a - Math.PI / 2] });
    }
  });
  return paint(parts, true);
}

/** The legend, chalked on the board: a dashed swatch is a draft, a solid one is verified. */
function Legend() {
  const sq = useMemo(() => [new THREE.Vector3(-0.2, -0.2, 0), new THREE.Vector3(0.2, -0.2, 0), new THREE.Vector3(0.2, 0.2, 0), new THREE.Vector3(-0.2, 0.2, 0), new THREE.Vector3(-0.2, -0.2, 0)], []);
  return (
    <group>
      <Line points={sq} color={C.cream} lineWidth={2.5} dashed dashSize={0.09} gapSize={0.06} position={[-0.88, -0.82, 0.08]} />
      <Label size={0.28} color={C.cream} anchorX="left" position={[-0.5, -0.82, 0.08]}>
        DRAFT
      </Label>
      <mesh position={[-0.88, -1.32, 0.08]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshBasicMaterial color={C.green} />
      </mesh>
      <Label size={0.28} color={C.cream} anchorX="left" position={[-0.5, -1.32, 0.08]}>
        VERIFIED
      </Label>
    </group>
  );
}

export default function Also({ step }: DioramaProps) {
  const cart = useMemo(() => cartGeometry(), []);
  const crates = useMemo(() => {
    const names = step.chips ?? [];
    // the two long names along the bottom of each row, the short ones beside them
    const byLen = [...names].sort((a, b) => b.length - a.length);
    const [l1, l2, ...short] = byLen.map((t) => ({ t: t.toUpperCase(), c: C.cream }));
    return stack([[l1, short[0], short[1]].filter(Boolean), [l2, short[2], short[3]].filter(Boolean)], [0.1, BED_Y, -0.05], 0.08, 0);
  }, [step.chips]);
  return (
    <Market
      id={step.id}
      color={C.plum}
      title="ALSO FAMILIAR"
      board={
        <Chalkboard heading="THE RULE" position={[-3.5, 0, 2.7] as V3} rotation={0.35}>
          <Legend />
        </Chalkboard>
      }
    >
      <group position={[-0.3, 0.15, 0.9]} scale={1.12}>
        <Painted geometry={cart} castShadow thickness={1.6} />
        <Crates items={crates} dashed />
      </group>
    </Market>
  );
}
