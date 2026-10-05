"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon } from "../../toon";
import { Label } from "../../bits";
import { Papers } from "../../pieces/Papers";
import { findEgg } from "../../eggs";
import { CityClock, Islet, Sign } from "../../props/basics";
import { Brownstone, Lamp } from "../../props/city";
import { FallingLeaves, Maples } from "../../props/nature";
import { Sailboat, Shuttle, Track, Trolley } from "../../props/vehicles";
import { Tappable } from "../../props/tappable";
import { Burst, HINT, Hinted, PopText, Ripple, Upright, hump, sfx, since, squash, useKick, wiggle } from "@/world/fx";

type V3 = [number, number, number];

/**
 * A network-science sculpture: nodes and the edges between them, slowly turning, with a
 * signal hopping from node to node. The Network Science Institute's subject, as a toy.
 * Click it and the network bursts apart, then snaps back together.
 */
function NetworkSculpture() {
  const spin = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const [blast, fireBlast] = useKick();
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (snapTimer.current && clearTimeout(snapTimer.current)), []);
  const { nodes, edges, dirs } = useMemo(() => {
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
    // which way each node flies when the network bursts: out from the middle, a little up
    const dirs = nodes.map(([x, y, z], i) => new THREE.Vector3(x, (y - 1.6) * 0.8 + 0.4, z).normalize().multiplyScalar(1.4 + h(i, 3) * 0.6));
    return { nodes, edges, dirs };
  }, []);
  const colors = useMemo(() => nodes.map((_, i) => [C.coral, C.sun, C.cobalt, C.green][i % 4]), [nodes]);
  const edgeGeo = useMemo(() => {
    const pos: number[] = [];
    edges.forEach(([a, b]) => pos.push(...nodes[a], ...nodes[b]));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [nodes, edges]);
  const live = useMemo(() => nodes.map(() => new THREE.Vector3()), [nodes]);
  const o = useMemo(() => new THREE.Object3D(), []);
  const from = useMemo(() => new THREE.Vector3(), []);
  const to = useMemo(() => new THREE.Vector3(), []);
  const angle = useRef(0);

  const place = (f: number) => {
    const m = nodesRef.current;
    nodes.forEach((n, i) => {
      live[i].set(n[0], n[1], n[2]).addScaledVector(dirs[i], f);
      if (!m) return;
      o.position.copy(live[i]);
      o.scale.setScalar((i % 4 === 0 ? 1.4 : 1) * (1 + f * 0.25));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    if (m) m.instanceMatrix.needsUpdate = true;
    const l = lines.current;
    if (l) {
      const arr = l.geometry.getAttribute("position") as THREE.BufferAttribute;
      edges.forEach(([a, b], k) => {
        arr.setXYZ(k * 2, live[a].x, live[a].y, live[a].z);
        arr.setXYZ(k * 2 + 1, live[b].x, live[b].y, live[b].z);
      });
      arr.needsUpdate = true;
    }
  };

  useLayoutEffect(() => {
    const m = nodesRef.current;
    if (!m) return;
    const c = new THREE.Color();
    colors.forEach((col, i) => m.setColorAt(i, c.set(col)));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    place(0);
    m.computeBoundingSphere();
    // room for the burst; the outline copy shares these bounds
    if (m.boundingSphere) m.boundingSphere.radius += 2.6;
    m.traverse((ch) => {
      if (ch !== m && (ch as THREE.InstancedMesh).isInstancedMesh) (ch as THREE.InstancedMesh).boundingSphere = m.boundingSphere;
    });
    // place() only reads refs and memoised data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors]);

  const resting = useRef(true);
  useFrame(({ clock }, dt) => {
    const s = since(blast);
    // out fast, hang for a beat, then spring back with a little overshoot
    const f = s < 0 || s > 1.6 ? 0 : s < 0.22 ? Math.sin((s / 0.22) * Math.PI * 0.5) : s < 0.6 ? 1 : Math.cos(((s - 0.6) / 1.0) * Math.PI * 0.5) * Math.exp(-(s - 0.6) * 1.2) + wiggle(s - 1.25, 0.12, 20, 6);
    const active = f !== 0;
    if (active || !resting.current) place(active ? f : 0);
    resting.current = !active;
    angle.current += dt * (0.25 + hump(s, 1.4) * 5);
    if (spin.current) spin.current.rotation.y = angle.current;
    if (pulse.current) {
      const t = clock.elapsedTime * 1.2;
      const e = edges[Math.floor(t) % edges.length];
      from.copy(live[e[0]]);
      to.copy(live[e[1]]);
      pulse.current.position.lerpVectors(from, to, t % 1);
    }
  });

  return (
    <Tappable
      onTap={() => {
        if (since(blast) < 1.4) return;
        fireBlast();
        sfx.pop(0.8);
        sfx.pop(1.1);
        sfx.whoosh(0.8);
        if (snapTimer.current) clearTimeout(snapTimer.current);
        snapTimer.current = setTimeout(() => sfx.arp(1046, 3, 0.05, "sine"), 1150);
      }}
      hintAt={[0, 4.9, 0]}
      hintScale={HINT}
    >
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[1.3, 1.45, 0.6, 24]} />
        <Toon color={C.stone} />
      </mesh>
      <group ref={spin} position={[0, 0.6, 0]}>
        <lineSegments ref={lines} geometry={edgeGeo} frustumCulled={false}>
          <lineBasicMaterial color={C.ink} />
        </lineSegments>
        <instancedMesh ref={nodesRef} args={[undefined, undefined, nodes.length]}>
          <sphereGeometry args={[0.17, 12, 10]} />
          <Toon color={C.white} thickness={1.4} />
        </instancedMesh>
        <mesh ref={pulse}>
          <sphereGeometry args={[0.11, 8, 6]} />
          <meshBasicMaterial color={C.cream} />
        </mesh>
      </group>
      {/* an easy target around the whole sculpture */}
      <mesh position={[0, 1.9, 0]} visible={false}>
        <cylinderGeometry args={[1.7, 1.7, 3.8, 10]} />
        <meshBasicMaterial />
      </mesh>
      <Burst kick={blast} origin={[0, 2.2, 0]} count={14} colors={[C.coral, C.sun, C.cobalt, C.green]} size={0.12} speed={3} up={2.4} dur={1} />
      <PopText kick={blast} text="POP" position={[0, 4.2, 0.6]} size={0.55} color={C.coral} />
    </Tappable>
  );
}

const MAPLE_COLORS = [C.maple, C.mapleDeep, C.sun];

/** The maples: click one and it drops a flurry of leaves. */
function ShakeableMaples({ at }: { at: { p: V3; s: number }[] }) {
  const root = useRef<THREE.Group>(null);
  const origin = useMemo(() => new THREE.Vector3(), []);
  const [shake, fireShake] = useKick();
  const hint = at[1];
  return (
    <group ref={root}>
      <Tappable
        onTap={() => {
          fireShake();
          sfx.rustle();
        }}
        hintAt={[hint.p[0], hint.p[1] + 3.5 * hint.s + 0.4, hint.p[2]]}
        hintScale={HINT}
      >
        <group
          onClick={(e) => {
            // drop the leaves from whichever tree was clicked
            const g = root.current;
            if (!g) return;
            let best = at[0];
            let d = Infinity;
            g.worldToLocal(origin.copy(e.point));
            at.forEach((t) => {
              const dd = (t.p[0] - origin.x) ** 2 + (t.p[2] - origin.z) ** 2;
              if (dd < d) {
                d = dd;
                best = t;
              }
            });
            origin.set(best.p[0], best.p[1] + 2.2 * best.s, best.p[2]);
          }}
        >
          <Maples at={at} />
        </group>
      </Tappable>
      <Burst kick={shake} origin={origin} count={26} colors={MAPLE_COLORS} shape="leaf" size={0.24} speed={1.6} up={1.4} gravity={6} dur={2.4} floor={0.2} />
      <PopText kick={shake} text="RUSTLE" position={[hint.p[0], hint.p[1] + 3.6, hint.p[2] + 0.6]} size={0.42} color={C.mapleDeep} />
    </group>
  );
}

/** A sailboat on the Charles: click it and it comes about. */
function TackingBoat({ position, sail, phase }: { position: V3; sail?: string; phase?: number }) {
  const turn = useRef<THREE.Group>(null);
  const heading = useRef(0);
  const [tack, fireTack] = useKick();
  useFrame((_, dt) => {
    const g = turn.current;
    if (!g) return;
    g.rotation.y += (heading.current - g.rotation.y) * (1 - Math.exp(-dt * 4));
    g.rotation.x = Math.sin(since(tack) * 5) * 0.25 * hump(since(tack), 1.2);
  });
  return (
    <Tappable
      onTap={() => {
        heading.current += Math.PI;
        fireTack();
        sfx.whoosh(0.7);
      }}
      position={position}
      hintAt={[0, 2.8, 0]}
      hintScale={HINT}
    >
      <group ref={turn}>
        <Sailboat sail={sail} phase={phase} />
      </group>
      <mesh position={[0, 0.9, 0]} visible={false}>
        <boxGeometry args={[1.8, 2.2, 1.4]} />
        <meshBasicMaterial />
      </mesh>
      <Ripple kick={tack} position={[0, 0.05, 0]} color={C.foam} from={0.6} to={2.4} dur={0.9} />
      <PopText kick={tack} text="SWOOSH" position={[0, 2.4, 0.4]} size={0.42} color={C.cobalt} />
    </Tappable>
  );
}

/** The Green Line streetcar: it hops when its bell rings. */
function RingingTrolley() {
  const body = useRef<THREE.Group>(null);
  const [ding, fireDing] = useKick();
  useFrame(() => {
    const s = since(ding);
    if (!body.current) return;
    body.current.position.y = hump(s, 0.3) * 0.35;
    squash(body.current, wiggle(s, 0.18), 0.8);
  });
  return (
    <>
      <Hinted at={[0, 2.9, 0]}>
        <group ref={body} scale={0.8}>
          <Trolley
            onClick={() => {
              fireDing();
              findEgg("trolley");
            }}
          />
        </group>
      </Hinted>
      <Upright>
        <PopText kick={ding} text="DING DING" position={[0, 2.5, 0.6]} size={0.4} color={C.trolley} />
      </Upright>
    </>
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

      <ShakeableMaples at={maples} />
      <FallingLeaves count={28} area={[16, 6, 12]} />

      {/* the Green Line, down the brownstone street behind the work (the front stays clear for the traveler) */}
      <Track length={11.4} position={[-1.7, 0, -4.0]} />
      <Shuttle from={-5.9} to={2.5} speed={1.6} y={0.15} z={-4.0}>
        <RingingTrolley />
      </Shuttle>

      <Lamp position={[-8.2, 0.15, 4.6]} />
      <Lamp position={[8.4, 0.15, 5.2]} />
      <CityClock tz="America/New_York" city="Boston" position={[-8.6, 0.15, 0.8]} rotation={0.5} />
      <Sign text="NIH-FUNDED" size={0.34} position={[4.2, 0.15, 3.2]} rotation={-0.3} color={C.sun} />
      {/* a sailboat out on the water, like the Charles on a fall afternoon */}
      <TackingBoat position={[13.5, -0.85, 5]} sail={C.coral} />
      <TackingBoat position={[-14, -0.85, -3]} phase={2} />
    </group>
  );
}
