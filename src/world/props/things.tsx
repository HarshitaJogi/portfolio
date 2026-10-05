"use client";

import { Edges, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { Toon } from "../toon";
import { Label, chime, useHoverCursor } from "../bits";

type V3 = [number, number, number];

/**
 * A graduation cap. `draft` draws it as dashed edges only: a degree not yet finished,
 * by the site's one rule (dashed = draft, solid = verified).
 */
export function Mortarboard({ draft = false, color = C.ink }: { draft?: boolean; color?: string }) {
  if (draft) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[1.5, 0.08, 1.5]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges color={C.ink} lineWidth={2} dashed dashSize={0.12} gapSize={0.08} />
        </mesh>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 0.42, 16, 1, true]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges color={C.ink} lineWidth={2} threshold={30} />
        </mesh>
      </group>
    );
  }
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.08, 1.5]} />
        <Toon color={color} />
      </mesh>
      <mesh position={[0, -0.25, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.55, 0.42, 16]} />
        <Toon color={color} />
      </mesh>
      <mesh position={[0.55, -0.2, 0.55]}>
        <cylinderGeometry args={[0.03, 0.03, 0.45, 6]} />
        <meshBasicMaterial color={C.sun} />
      </mesh>
      <mesh position={[0.55, -0.45, 0.55]}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshBasicMaterial color={C.sun} />
      </mesh>
    </group>
  );
}

/** A book standing up, title on the spine. */
export function Book({ title, color, position = [0, 0, 0], h = 1.6, lean = 0 }: { title: string; color: string; position?: V3; h?: number; lean?: number }) {
  const dark = [C.cobalt, C.plum, C.teal, C.brickDark, C.ink, C.green].includes(color);
  return (
    <group position={position} rotation={[0, 0, lean]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[0.42, h, 1.2]} />
        <Toon color={color} thickness={1.6} />
      </mesh>
      <Label size={0.15} color={dark ? C.cream : C.ink} position={[0, h / 2, 0.61]} rotation={[0, 0, Math.PI / 2]}>
        {title.toUpperCase()}
      </Label>
    </group>
  );
}

/** A medal on a ribbon, hanging from a little stand. */
export function Medal({ color = C.gold, ribbon = C.cobalt, position = [0, 0, 0] }: { color?: string; ribbon?: string; position?: V3 }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 1.1 + position[0]) * 0.5;
  });
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.08, 2, 0.08]} />
        <Toon color={C.ink} outline={false} />
      </mesh>
      <mesh position={[0.4, 2, 0]}>
        <boxGeometry args={[0.9, 0.08, 0.08]} />
        <Toon color={C.ink} outline={false} />
      </mesh>
      <group ref={ref} position={[0.75, 1.95, 0]}>
        <mesh position={[0, -0.35, 0]}>
          <boxGeometry args={[0.22, 0.7, 0.03]} />
          <meshBasicMaterial color={ribbon} />
        </mesh>
        <mesh position={[0, -0.85, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.08, 24]} />
          <Toon color={color} thickness={1.6} />
        </mesh>
      </group>
    </group>
  );
}

/** A maize stalk. `sick` gives it the brown leaf-blight spots the drone looks for. */
export function Corn({ position = [0, 0, 0], h = 1.8, sick = false, phase = 0 }: { position?: V3; h?: number; sick?: boolean; phase?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.5 + phase) * 0.05;
  });
  const leaf = sick ? "#b49a3a" : C.grass;
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.07, h, 6]} />
        <Toon color={C.leaf} outline={false} />
      </mesh>
      {[0.35, 0.6, 0.85].map((f, i) => (
        <mesh key={f} position={[0, h * f, 0]} rotation={[0, i * 2.1 + phase, 0.9]}>
          <boxGeometry args={[0.7, 0.03, 0.14]} />
          <Toon color={leaf} outline={false} />
        </mesh>
      ))}
      {sick &&
        [0.35, 0.6].map((f, i) => (
          <mesh key={`s${f}`} position={[Math.cos(i * 2.1 + phase) * 0.22, h * f + 0.12, -Math.sin(i * 2.1 + phase) * 0.22]}>
            <sphereGeometry args={[0.06, 6, 4]} />
            <meshBasicMaterial color="#6b3f1d" />
          </mesh>
        ))}
      <mesh position={[0.08, h * 0.7, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.07, 0.25, 3, 6]} />
        <Toon color={C.sun} outline={false} />
      </mesh>
    </group>
  );
}

/** A jack-o'-lantern. Click to light it. Reports to `onLit` the first time. */
export function Pumpkin({ position = [0, 0, 0], s = 1, lit: startLit = false, onLit }: { position?: V3; s?: number; lit?: boolean; onLit?: () => void }) {
  const [lit, setLit] = useState(startLit);
  const { bind } = useHoverCursor();
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (glow.current) glow.current.color.setHSL(0.1, 1, lit ? 0.55 + Math.sin(clock.elapsedTime * 9 + position[0]) * 0.06 : 0.12);
  });
  return (
    <group
      position={position}
      scale={s}
      onClick={(e) => {
        e.stopPropagation();
        if (!lit) {
          setLit(true);
          chime(520);
          onLit?.();
        }
      }}
      {...bind}
    >
      <mesh position={[0, 0.45, 0]} scale={[1, 0.8, 1]} castShadow>
        <sphereGeometry args={[0.6, 14, 10]} />
        {/* lit pumpkins glow through emissive, not a light: adding lights recompiles every material */}
        <Toon color={C.pumpkin} thickness={1.6} emissive={lit ? "#ff7a1a" : undefined} />
      </mesh>
      <mesh position={[0, 0.98, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 0.25, 6]} />
        <Toon color={C.leaf} outline={false} />
      </mesh>
      {/* face */}
      {[
        [-0.2, 0.58],
        [0.2, 0.58],
      ].map(([x, y]) => (
        <mesh key={x} position={[x, y, 0.5]} rotation={[0, 0, Math.PI]}>
          <circleGeometry args={[0.1, 3]} />
          <meshBasicMaterial ref={x < 0 ? glow : undefined} color="#2a1500" />
        </mesh>
      ))}
      <mesh position={[0, 0.34, 0.52]}>
        <planeGeometry args={[0.4, 0.09]} />
        <meshBasicMaterial color={lit ? "#ffb347" : "#2a1500"} />
      </mesh>
    </group>
  );
}

/** A trophy cup on a plinth, with a place on the front. */
export function Trophy({ place, color = C.gold, position = [0, 0, 0] }: { place: string; color?: string; position?: V3 }) {
  const cup = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (cup.current) cup.current.rotation.y += dt * 0.8;
  });
  return (
    <group position={position}>
      <RoundedBox args={[1, 0.9, 1]} radius={0.08} position={[0, 0.45, 0]} castShadow>
        <Toon color={C.cream} />
      </RoundedBox>
      <Label size={0.26} position={[0, 0.45, 0.51]}>
        {place}
      </Label>
      <group ref={cup} position={[0, 0.9, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.28, 0.32, 0.22, 16]} />
          <Toon color={color} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.45, 8]} />
          <Toon color={color} />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.45, 0.18, 0.65, 18]} />
          <Toon color={color} />
        </mesh>
        {[-1, 1].map((sx) => (
          <mesh key={sx} position={[sx * 0.48, 0.98, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.16, 0.04, 6, 12]} />
            <Toon color={color} outline={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** A signpost with arrows pointing off to places. */
export function Signpost({ arrows, position = [0, 0, 0] }: { arrows: { text: string; angle: number; color?: string }[]; position?: V3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 3.2, 8]} />
        <Toon color={C.bark} />
      </mesh>
      {arrows.map((a, i) => {
        const w = a.text.length * 0.2 + 0.7;
        return (
          <group key={a.text} position={[0, 2.9 - i * 0.55, 0]} rotation={[0, a.angle, 0]}>
            <mesh position={[w / 2, 0, 0]} castShadow>
              <boxGeometry args={[w, 0.4, 0.08]} />
              <Toon color={a.color ?? C.cream} thickness={1.4} />
            </mesh>
            <mesh position={[w + 0.15, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0, 0.2, 0.3, 3]} />
              <Toon color={a.color ?? C.cream} thickness={1.4} />
            </mesh>
            <Label size={0.2} position={[w / 2, 0, 0.05]}>
              {a.text}
            </Label>
            <Label size={0.2} position={[w / 2, 0, -0.05]} rotation={[0, Math.PI, 0]}>
              {a.text}
            </Label>
          </group>
        );
      })}
    </group>
  );
}
