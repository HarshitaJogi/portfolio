"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { Label } from "../../bits";
import { Papers } from "../../pieces/Papers";
import { findEgg } from "../../eggs";
import { CityClock, Islet, Sign } from "../../props/basics";
import { Brownstone, Lamp } from "../../props/city";
import { FallingLeaves, Maples } from "../../props/nature";
import { Sailboat, Shuttle, Track, Trolley } from "../../props/vehicles";

type V3 = [number, number, number];

/**
 * A network-science sculpture: nodes and the edges between them, slowly turning, with a
 * signal hopping from node to node. The Network Science Institute's subject, as a toy.
 */
function NetworkSculpture() {
  const spin = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const { nodes, edges } = useMemo(() => {
    const h = (i: number, k: number) => {
      const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    const nodes: V3[] = Array.from({ length: 11 }, (_, i) => {
      const a = i * 2.39996;
      const r = 0.5 + h(i, 1) * 1.2;
      return [Math.cos(a) * r, 0.4 + h(i, 2) * 2.4, Math.sin(a) * r];
    });
    const edges: [number, number][] = [];
    nodes.forEach((_, i) => {
      // link each node to its two nearest neighbours
      const d = nodes.map((m, j) => ({ j, d: (m[0] - nodes[i][0]) ** 2 + (m[1] - nodes[i][1]) ** 2 + (m[2] - nodes[i][2]) ** 2 })).filter((x) => x.j !== i);
      d.sort((a, b) => a.d - b.d);
      d.slice(0, 2).forEach(({ j }) => {
        if (!edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) edges.push([i, j]);
      });
    });
    return { nodes, edges };
  }, []);
  const nodeItems = useMemo<Instance[]>(() => nodes.map((p, i) => ({ p, s: i % 4 === 0 ? 1.4 : 1, color: [C.coral, C.sun, C.cobalt, C.green][i % 4] })), [nodes]);
  const edgeGeo = useMemo(() => {
    const pos: number[] = [];
    edges.forEach(([a, b]) => pos.push(...nodes[a], ...nodes[b]));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [nodes, edges]);
  const from = useMemo(() => new THREE.Vector3(), []);
  const to = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    if (spin.current) spin.current.rotation.y = clock.elapsedTime * 0.25;
    if (pulse.current) {
      const t = clock.elapsedTime * 1.2;
      const e = edges[Math.floor(t) % edges.length];
      from.set(...nodes[e[0]]);
      to.set(...nodes[e[1]]);
      pulse.current.position.lerpVectors(from, to, t % 1);
    }
  });
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[1.3, 1.45, 0.6, 24]} />
        <Toon color={C.stone} />
      </mesh>
      <group ref={spin} position={[0, 0.6, 0]}>
        <lineSegments geometry={edgeGeo}>
          <lineBasicMaterial color={C.ink} />
        </lineSegments>
        <ToonInstances items={nodeItems} thickness={1.4}>
          <sphereGeometry args={[0.17, 12, 10]} />
        </ToonInstances>
        <mesh ref={pulse}>
          <sphereGeometry args={[0.11, 8, 6]} />
          <meshBasicMaterial color={C.cream} />
        </mesh>
      </group>
    </group>
  );
}

/** NSI in Boston: brownstones, fall maples, the Green Line, and the paper conveyor that went from 60% to 98%. */
export function Boston() {
  const maples = useMemo(
    () => [
      { p: [-8.2, 0.15, -1.4] as V3, s: 1.1 },
      { p: [-6.6, 0.15, 3.6] as V3, s: 0.9 },
      { p: [7.8, 0.15, 2.2] as V3, s: 1 },
      { p: [3.2, 0.15, -6.4] as V3, s: 1.15 },
      { p: [-2.4, 0.15, -6.8] as V3, s: 0.95 },
    ],
    [],
  );
  return (
    <group>
      <Islet r={11} top="#e2cfa6" inner={8} innerColor="#9cbf6e" />
      {/* a row of brownstones along the back */}
      <Brownstone position={[-6.2, 0.15, -6]} rotation={0.35} />
      <Brownstone position={[-4, 0.15, -7.1]} rotation={0.2} color="#9a6249" floors={4} />
      <Brownstone position={[-1.7, 0.15, -7.8]} rotation={0.06} color="#7e5140" />

      {/* the work: papers go in at 60%, come out at 98% */}
      <group position={[0.4, 0.1, 0.6]} scale={1.25}>
        <Papers />
      </group>

      <group position={[6.2, 0.15, -3.8]}>
        <NetworkSculpture />
        <Label size={0.26} position={[0, 0.32, 1.47]}>
          NETWORK SCIENCE
        </Label>
      </group>

      <Maples at={maples} />
      <FallingLeaves count={28} area={[16, 6, 12]} />

      {/* the Green Line, along the front */}
      <Track length={14} position={[0, 0, 6.6]} />
      <Shuttle from={-4.6} to={4.6} speed={1.6} y={0.15} z={6.6}>
        <group scale={0.8}>
          <Trolley onClick={() => findEgg("trolley")} />
        </group>
      </Shuttle>

      <Lamp position={[-8.2, 0.15, 4.6]} />
      <Lamp position={[8.4, 0.15, 5.2]} />
      <CityClock tz="America/New_York" city="Boston" position={[-8.6, 0.15, 0.8]} rotation={0.5} />
      <Sign text="NIH-FUNDED" size={0.34} position={[4.2, 0.15, 3.2]} rotation={-0.3} color={C.sun} />
      {/* a sailboat out on the water, like the Charles on a fall afternoon */}
      <Sailboat position={[13.5, -0.85, 5]} sail={C.coral} />
      <Sailboat position={[-14, -0.85, -3]} phase={2} />
    </group>
  );
}
