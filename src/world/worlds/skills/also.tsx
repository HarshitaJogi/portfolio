"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Label } from "../../bits";
import type { DioramaProps } from "../Frame";
import { Chalkboard, Crates, Market, Painted, STALL_HINT, paint, stack, type V3 } from "./kit";
import { Tappable } from "../../props/tappable";
import { PopText, Ripple, hump, sfx, since, useKick, wiggle } from "@/world/fx";

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
function Legend({ tap }: { tap: ReturnType<typeof useKick>[0] }) {
  const solid = useRef<THREE.Mesh>(null);
  useFrame(() => {
    // the verified swatch swells and settles: solid is the goal
    const w = wiggle(since(tap), 0.4, 16, 4);
    solid.current?.scale.set(1 + w, 1 + w, 1);
  });
  const sq = useMemo(() => [new THREE.Vector3(-0.2, -0.2, 0), new THREE.Vector3(0.2, -0.2, 0), new THREE.Vector3(0.2, 0.2, 0), new THREE.Vector3(-0.2, 0.2, 0), new THREE.Vector3(-0.2, -0.2, 0)], []);
  return (
    <group>
      <Line points={sq} color={C.cream} lineWidth={2.5} dashed dashSize={0.09} gapSize={0.06} position={[-0.88, -0.82, 0.08]} />
      <Label size={0.28} color={C.cream} anchorX="left" position={[-0.5, -0.82, 0.08]}>
        DRAFT
      </Label>
      <mesh ref={solid} position={[-0.88, -1.32, 0.08]}>
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
  const rock = useRef<THREE.Group>(null);
  const [bump, fireBump] = useKick();
  const [tap, fireTap] = useKick();
  useFrame(() => {
    const s = since(bump);
    const g = rock.current;
    if (!g) return;
    // rocked on its wheel: tips forward, bounces back, settles
    g.rotation.z = wiggle(s, 0.12, 10, 3);
    g.position.y = 0.62 + hump(s, 0.3) * 0.25;
  });
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
        // out on the left, but back from the front edge, where the traveler stands
        <Tappable
          onTap={() => {
            fireTap();
            sfx.arp(660, 2, 0.08, "sine");
          }}
          hintAt={[-4.6, 3.35, 2.0]}
          hintScale={STALL_HINT}
        >
          <Chalkboard heading="THE RULE" position={[-4.6, 0, 2.0] as V3} rotation={0.45}>
            <Legend tap={tap} />
          </Chalkboard>
          <PopText kick={tap} text="SOLID" position={[-4.4, 3.2, 2.5]} size={0.34} color={C.green} />
        </Tappable>
      }
    >
      <group position={[-0.3, 0.15, 0.9]} scale={1.12}>
        {/* pivots on the axle */}
        <group ref={rock} position={[0.7, 0.62, 0]}>
          <group position={[-0.7, -0.62, 0]}>
            {/* the cart: give it a shove */}
            <Tappable
              onTap={() => {
                if (since(bump) < 0.6) return;
                fireBump();
                sfx.clank(0.5);
                sfx.boop(0.5);
              }}
              hintAt={[-3.6, 1.6, 0]}
              hintScale={STALL_HINT / 1.12}
            >
              <Painted geometry={cart} castShadow thickness={1.6} />
            </Tappable>
            <Crates items={crates} dashed />
            <PopText kick={bump} text="BUMP" position={[-3.2, 1.6, 0.6]} size={0.34} color={C.plum} />
          </group>
        </group>
        <Ripple kick={bump} position={[0.7, 0.03, 0]} color={C.cream} from={0.5} to={2.2} dur={0.6} />
      </group>
    </Market>
  );
}
