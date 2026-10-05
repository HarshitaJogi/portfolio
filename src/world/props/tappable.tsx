"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { C } from "../palette";
import { useHoverCursor } from "../bits";
import { Outlines } from "@react-three/drei";

type V3 = [number, number, number];

// shared: every hint on every island ripples with this material
const ringMat = new THREE.MeshBasicMaterial({ color: C.cream, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, fog: false, toneMapped: false });
const arrowGeo = new THREE.ConeGeometry(0.16, 0.3, 3);
arrowGeo.rotateX(Math.PI);

/**
 * "You can click this": a bobbing arrow and a ring that ripples outward.
 * Small, consistent, and gone once the thing has been clicked.
 */
export function TapHint({ position = [0, 0, 0], scale = 1 }: { position?: V3; scale?: number }) {
  const arrow = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => ringMat.clone(), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (arrow.current) arrow.current.position.y = Math.abs(Math.sin(t * 3)) * 0.22;
    if (ring.current) {
      const f = (t * 0.8) % 1;
      ring.current.scale.setScalar(0.5 + f * 0.9);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - f);
    }
  });
  return (
    <group position={position} scale={scale}>
      <group ref={arrow}>
        {/* unlit and unfogged, so the hint reads the same by day and by night */}
        <mesh geometry={arrowGeo} position={[0, 0.25, 0]} scale={1.5}>
          <meshBasicMaterial color={C.sun} toneMapped={false} fog={false} />
          <Outlines thickness={2.2} color={C.ink} />
        </mesh>
      </group>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} material={mat}>
        <ringGeometry args={[0.32, 0.42, 28]} />
      </mesh>
    </group>
  );
}

/**
 * Wraps anything clickable: pointer cursor, a tap hint floating at `hintAt` until the first
 * click, and `onTap`. Stops the click from reaching whatever is behind it.
 */
export function Tappable({ children, onTap, hintAt, hintScale = 1, position, rotation }: { children: ReactNode; onTap: () => void; hintAt?: V3; hintScale?: number; position?: V3; rotation?: V3 }) {
  const [tapped, setTapped] = useState(false);
  const { bind } = useHoverCursor();
  return (
    <group
      position={position}
      rotation={rotation}
      // a child (a taxi, a button) may stop the click itself: pointer-down still hides the hint
      onPointerDown={() => setTapped(true)}
      onClick={(e) => {
        e.stopPropagation();
        setTapped(true);
        onTap();
      }}
      {...bind}
    >
      {children}
      {hintAt && !tapped && <TapHint position={hintAt} scale={hintScale} />}
    </group>
  );
}
