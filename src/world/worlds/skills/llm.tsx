"use client";

import { Line } from "@react-three/drei";
import { RoundedBox } from "@/world/rounded";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon } from "../../toon";
import { Label, chime, useHoverCursor } from "../../bits";
import type { DioramaProps } from "../Frame";
import { Crates, Market, STALL_HINT, paint, smooth, stack } from "./kit";
import { Tappable, TapHint } from "../../props/tappable";
import { Burst, PopText, hump, sfx, since, squash, useKick, wiggle } from "@/world/fx";

const LOOP = 8;

/** The robot's flat details in one draw: face screen, chest badge, antenna stem. */
const robotFace = paint([
  { g: new THREE.PlaneGeometry(0.9, 0.52), c: C.ink, p: [0, 2.12, 0.455] },
  { g: new THREE.CircleGeometry(0.2, 20), c: C.coral, p: [0, 1.12, 0.48] },
  { g: new THREE.CylinderGeometry(0.035, 0.035, 0.42, 6), c: C.ink, p: [0, 2.8, 0] },
]);
const robotEyes = paint([
  { g: new THREE.CircleGeometry(0.085, 14), c: C.sun, p: [-0.2, 0, 0] },
  { g: new THREE.CircleGeometry(0.085, 14), c: C.sun, p: [0.2, 0, 0] },
]);

/** A speech bubble outline: rounded box with a tail, bottom right. */
function bubbleShape(w: number, h: number) {
  const r = 0.22;
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - 0.75, -h / 2);
  s.lineTo(w / 2 - 0.35, -h / 2 - 0.4); // the tail, pointing at the robot
  s.lineTo(w / 2 - 0.45, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

/**
 * Nokia: the agent drafts (dashed bubble), reaches into its toolbox for the internal docs
 * (a tool call), and only then does the answer go solid. Click the bubble to verify it now.
 */
function Agent() {
  const t0 = useRef(0);
  const robot = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const doc = useRef<THREE.Mesh>(null);
  const eyes = useRef<THREE.Group>(null);
  const antenna = useRef<THREE.MeshBasicMaterial>(null);
  const draft = useRef<THREE.Group>(null);
  const solid = useRef<THREE.Group>(null);
  const { bind } = useHoverCursor();
  const [grounded, fireGrounded] = useKick();
  const [boop, fireBoop] = useKick();
  const [clank, fireClank] = useKick();
  const [seen, setSeen] = useState(false);
  const box = useRef<THREE.Group>(null);
  const tool = useRef<THREE.Mesh>(null);
  const hop = useRef<THREE.Group>(null);

  const shape = useMemo(() => bubbleShape(2.5, 0.9), []);
  const outline = useMemo(() => shape.getPoints(6).map((p) => new THREE.Vector3(p.x, p.y, 0)), [shape]);
  const extrude = useMemo(() => ({ depth: 0.14, bevelEnabled: false, curveSegments: 6 }), []);

  useFrame(({ clock }) => {
    const now = clock.elapsedTime;
    const t = (now - t0.current + LOOP * 4) % LOOP;
    // the tool call: reach down into the box, rummage, lift the doc up, hold, put it back
    const reach = smooth(t / 1.1) - smooth((t - 1.9) / 0.9);
    const lift = smooth((t - 1.9) / 0.9) - smooth((t - 6.2) / 1.0);
    const rummage = t > 1.1 && t < 1.9 ? Math.sin(now * 18) * 0.06 : 0;
    if (shoulder.current) shoulder.current.rotation.z = 0.18 + reach * 0.62 + lift * 1.75 + rummage;
    if (elbow.current) elbow.current.rotation.z = reach * 0.35 - lift * 0.55;
    if (doc.current) doc.current.scale.setScalar(Math.max(0.001, smooth((t - 1.4) / 0.4) - smooth((t - 6.6) / 0.4)));
    if (robot.current) {
      robot.current.position.y = Math.abs(Math.sin(now * 2.2)) * 0.03;
      robot.current.rotation.y = 0.25 + reach * 0.2 - lift * 0.15;
    }
    // blink
    if (eyes.current) eyes.current.scale.y = (now % 3.7) < 0.12 ? 0.15 : 1;
    // the answer stays a draft until the docs are in hand
    const verified = t > 3.4;
    if (draft.current) draft.current.visible = !verified;
    if (solid.current) {
      solid.current.visible = verified;
      const pop = smooth((t - 3.4) / 0.25);
      solid.current.scale.setScalar(0.85 + 0.15 * pop + Math.sin(Math.min(1, (t - 3.4) / 0.5) * Math.PI) * 0.08);
    }
    if (antenna.current) antenna.current.color.set(since(boop) < 0.8 ? C.rose : verified ? C.green : Math.sin(now * 6) > 0 ? C.sun : C.coral);
    // a poke: the robot hops and spins once
    const b = since(boop);
    if (hop.current) {
      hop.current.position.y = hump(b, 0.55) * 0.9;
      hop.current.rotation.y = b < 0.55 ? (b / 0.55) * Math.PI * 2 : 0;
    }
    // the toolbox rattles and a tool jumps out and back
    const c = since(clank);
    if (box.current) squash(box.current, wiggle(c, 0.22));
    if (tool.current) {
      tool.current.position.y = 0.85 + hump(c, 0.6) * 1.1;
      tool.current.rotation.z = 0.35 + (c < 0.6 ? c * 14 : 0);
    }
  });

  // clicking jumps the loop to the moment the docs arrive (applied on the next frame, where the clock is)
  const verifyNow = useRef(false);
  useFrame(({ clock }) => {
    if (!verifyNow.current) return;
    verifyNow.current = false;
    t0.current = clock.elapsedTime - 3.35;
  });
  const verify = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    verifyNow.current = true;
    setSeen(true);
    fireGrounded();
    chime(990);
    sfx.arp(990, 3, 0.06, "sine");
  };

  return (
    <group>
      {/* the robot: poke it */}
      <Tappable
        onTap={() => {
          if (since(boop) < 0.6) return;
          fireBoop();
          sfx.boop(1.2);
          setTimeout(() => sfx.beep(1), 160);
        }}
        position={[1.15, 0.15, -0.7]}
        hintAt={[-0.75, 3.0, 0.3]}
        hintScale={STALL_HINT / 1.15}
      >
      <group ref={hop}>
      <group ref={robot}>
        <RoundedBox args={[1.35, 0.42, 0.95]} radius={0.16} position={[0, 0.23, 0]}>
          <Toon color={C.ink} />
        </RoundedBox>
        <RoundedBox args={[1.3, 1.15, 0.95]} radius={0.24} position={[0, 1.05, 0]} castShadow>
          <Toon color={C.cream} />
        </RoundedBox>
        <RoundedBox args={[1.2, 0.9, 0.9]} radius={0.24} position={[0, 2.12, 0]} castShadow>
          <Toon color={C.cream} />
        </RoundedBox>
        <mesh geometry={robotFace}>
          <meshBasicMaterial vertexColors />
        </mesh>
        <group ref={eyes} position={[0, 2.14, 0.47]}>
          <mesh geometry={robotEyes}>
            <meshBasicMaterial vertexColors />
          </mesh>
        </group>
        <mesh position={[0, 3.05, 0]}>
          <sphereGeometry args={[0.11, 12, 8]} />
          <meshBasicMaterial ref={antenna} color={C.sun} />
        </mesh>
        {/* resting arm */}
        <mesh position={[-0.78, 0.98, 0.05]} rotation={[0, 0, -0.18]}>
          <capsuleGeometry args={[0.13, 0.62, 4, 8]} />
          <Toon color={C.coral} />
        </mesh>
        {/* the tool-call arm */}
        <group ref={shoulder} position={[0.74, 1.4, 0.05]}>
          <mesh position={[0, -0.34, 0]}>
            <capsuleGeometry args={[0.13, 0.5, 4, 8]} />
            <Toon color={C.coral} />
          </mesh>
          <group ref={elbow} position={[0, -0.68, 0]}>
            <mesh position={[0, -0.32, 0]}>
              <capsuleGeometry args={[0.12, 0.46, 4, 8]} />
              <Toon color={C.coral} />
            </mesh>
            {/* the doc it fetched */}
            <mesh ref={doc} position={[0.05, -0.78, 0.12]} rotation={[0, 0, 0.2]}>
              <boxGeometry args={[0.46, 0.6, 0.05]} />
              <Toon color={C.white} thickness={1.4} />
            </mesh>
          </group>
        </group>
      </group>
      </group>
      <PopText kick={boop} text="BEEP BOOP" position={[-0.2, 3.5, 0.6]} size={0.34} color={C.coral} />
      </Tappable>

      {/* the toolbox it reaches into: give it a rattle */}
      <Tappable
        onTap={() => {
          if (since(clank) < 0.5) return;
          fireClank();
          sfx.clank();
        }}
        position={[2.85, 0.15, 0.55]}
        rotation={[0, -0.25, 0]}
        hintAt={[0, 1.75, 0]}
        hintScale={STALL_HINT / 1.15}
      >
        <group ref={box}>
        <mesh position={[0, 0.36, 0]} castShadow>
          <boxGeometry args={[1.35, 0.72, 0.8]} />
          <Toon color={C.red} />
        </mesh>
        <mesh position={[0, 0.73, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 0.66]} />
          <meshBasicMaterial color="#3a1416" />
        </mesh>
        <mesh position={[0, 0.73, 0]}>
          <torusGeometry args={[0.32, 0.05, 6, 16, Math.PI]} />
          <Toon color={C.ink} outline={false} />
        </mesh>
        <Label size={0.3} color={C.cream} position={[0, 0.34, 0.41]}>
          MCP
        </Label>
        </group>
        <mesh ref={tool} position={[-0.38, 0.85, 0.12]} rotation={[0.1, 0, 0.35]}>
          <cylinderGeometry args={[0.07, 0.07, 0.42, 8]} />
          <Toon color={C.sun} outline={false} />
        </mesh>
        <PopText kick={clank} text="CLANK" position={[0, 1.6, 0.5]} size={0.32} color={C.red} />
      </Tappable>

      {/* the answer: dashed while it is a draft, solid once it is grounded */}
      <group position={[-0.35, 3.2, -0.4]} onClick={verify} {...bind}>
        <group ref={draft}>
          <mesh>
            <shapeGeometry args={[shape]} />
            <meshBasicMaterial color={C.cream} />
          </mesh>
          <Line points={outline} color={C.ink} lineWidth={3} dashed dashSize={0.16} gapSize={0.1} position={[0, 0, 0.01]} />
          <Label size={0.32} position={[0, 0.02, 0.03]}>
            DRAFT
          </Label>
        </group>
        {!seen && <TapHint position={[-1.65, 0.15, 0.2]} scale={STALL_HINT / 1.15} />}
        <group ref={solid} visible={false}>
          <mesh position={[0, 0, -0.07]}>
            <extrudeGeometry args={[shape, extrude]} />
            <Toon color={C.green} />
          </mesh>
          <Label size={0.32} color={C.cream} position={[0, 0.02, 0.09]}>
            VERIFIED
          </Label>
        </group>
        <Burst kick={grounded} origin={[0, 0.2, 0.2]} count={14} colors={[C.green, C.sun, C.cream]} size={0.12} speed={2.2} up={2.2} dur={1} />
      </group>
    </group>
  );
}

export default function Llm({ step }: DioramaProps) {
  const crates = useMemo(
    () => [
      ...stack(
        [
          [
            { t: "AGENTS", c: C.coral },
            { t: "PROMPTS", c: C.sun },
          ],
          [
            { t: "EVALS", c: C.rose },
            { t: "GEMINI", c: C.coral },
          ],
          [
            { t: "GPT-4.1", c: C.cream },
            { t: "CURSOR", c: C.sun },
          ],
        ],
        [-2.65, 0.15, 0.1],
        0.08,
        0.18,
      ),
    ],
    [],
  );
  return (
    <Market id={step.id} color={C.coral} title="LLM SYSTEMS">
      <group position={[-0.25, 0, 1.2]} scale={1.15}>
        <Agent />
      </group>
      <Crates items={crates} />
    </Market>
  );
}
