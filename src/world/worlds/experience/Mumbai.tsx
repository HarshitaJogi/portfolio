"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon, ToonInstances, type Instance } from "../../toon";
import { Cloud } from "../../pieces/Cloud";
import { findEgg } from "../../eggs";
import { CityClock, Islet } from "../../props/basics";
import { Lamp, Tower } from "../../props/city";
import { Palm, Rain } from "../../props/nature";
import { Shuttle, Taxi } from "../../props/vehicles";

type V3 = [number, number, number];

const DECK_Y = 1.7;
const DECK_Z = -3.4;

/**
 * A cable-stayed sea bridge, the kind that crosses Mumbai's bay: twin pylons, fans of
 * cables, and a kaali-peeli taxi going back and forth.
 */
function SeaBridge() {
  const pylons = [-3.4, 3.4];
  const cables = useMemo(() => {
    const out: { p: V3; len: number; rot: number }[] = [];
    for (const px of pylons) {
      for (let k = 1; k <= 4; k++) {
        for (const side of [-1, 1]) {
          const top = new THREE.Vector3(px, 7.2 - k * 0.25, DECK_Z);
          const foot = new THREE.Vector3(px + side * k * 0.95, DECK_Y + 0.15, DECK_Z);
          const mid = top.clone().add(foot).multiplyScalar(0.5);
          const d = top.clone().sub(foot);
          out.push({ p: [mid.x, mid.y, mid.z], len: d.length(), rot: Math.atan2(d.x, d.y) });
        }
      }
    }
    return out;
    // pylons are constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const piers = useMemo<Instance[]>(() => [-8, -5.5, -1.2, 1.2, 5.5, 8].map((x) => ({ p: [x, DECK_Y / 2 - 0.2, DECK_Z] as V3 })), []);
  return (
    <group>
      <mesh position={[0, DECK_Y, DECK_Z]} castShadow receiveShadow>
        <boxGeometry args={[19, 0.32, 1.7]} />
        <Toon color={C.concrete} />
      </mesh>
      <ToonInstances items={piers} color={C.concrete} castShadow>
        <boxGeometry args={[0.45, DECK_Y + 0.4, 0.9]} />
      </ToonInstances>
      {pylons.map((x) => (
        <group key={x} position={[x, 0, DECK_Z]}>
          {/* an inverted-Y pylon */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.45, 2.4, 0]} rotation={[0, 0, s * -0.16]} castShadow>
              <boxGeometry args={[0.32, 4.6, 0.5]} />
              <Toon color={C.stone} />
            </mesh>
          ))}
          <mesh position={[0, 6.2, 0]} castShadow>
            <boxGeometry args={[0.38, 2.6, 0.5]} />
            <Toon color={C.stone} />
          </mesh>
        </group>
      ))}
      {cables.map((c, i) => (
        <mesh key={i} position={c.p} rotation={[0, 0, -c.rot]}>
          <cylinderGeometry args={[0.025, 0.025, c.len, 4]} />
          <meshBasicMaterial color={C.cream} />
        </mesh>
      ))}
      <Shuttle from={-8.5} to={8.5} speed={2.4} y={DECK_Y + 0.16} z={DECK_Z + 0.35}>
        <group scale={0.62}>
          <Taxi onClick={() => findEgg("taxi")} />
        </group>
      </Shuttle>
      <Shuttle from={8.5} to={-8.5} speed={1.7} phase={6} y={DECK_Y + 0.16} z={DECK_Z - 0.35}>
        <group scale={0.62}>
          <Taxi onClick={() => findEgg("taxi")} />
        </group>
      </Shuttle>
    </group>
  );
}

/** The seafront curve with its lamps: lit up at dusk, the way Marine Drive is. */
function Seafront() {
  const lamps: V3[] = useMemo(() => {
    const out: V3[] = [];
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 - 0.9 + (i / 4) * 1.8;
      out.push([Math.cos(a) * 9.1, 0.15, -Math.sin(a) * 9.1]);
    }
    return out;
  }, []);
  return (
    <group>
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.9, 9.4, 48, 1, -Math.PI / 2 - 1, 2]} />
        <meshBasicMaterial color={C.cream} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9.4, 9.6, 48, 1, -Math.PI / 2 - 1, 2]} />
        <meshBasicMaterial color={C.stone} />
      </mesh>
      {lamps.map((p, i) => (
        <Lamp key={i} position={p} h={1.7} />
      ))}
    </group>
  );
}

/** MSCI in Mumbai: the cloud migration, set between the skyline, the sea bridge, and the seafront. */
export function Mumbai() {
  return (
    <group>
      <Islet r={11} top="#e9d6b4" inner={7.6} innerColor="#d9c7a3" />
      {/* skyline */}
      <Tower position={[-7.4, 0.15, -6.6]} h={9} w={2.2} d={2} />
      <Tower position={[-4.9, 0.15, -7.6]} h={6.6} w={1.8} d={1.8} color="#d8d2c6" />
      <Tower position={[5.6, 0.15, -7.4]} h={8} w={2} d={2} color="#cfc6b8" />
      <Tower position={[8, 0.15, -5.4]} h={5.2} w={1.8} d={1.8} />
      <SeaBridge />

      {/* the work: 15+ APIs moving from one cloud to another */}
      <group position={[0, 0.1, 1.6]} scale={1.3}>
        <Cloud />
      </group>

      <Seafront />
      <Palm position={[-6.2, 0.15, 2.6]} height={3.6} phase={1} />
      <Palm position={[6.6, 0.15, 3.1]} height={3.2} lean={-0.15} phase={2} />
      <CityClock tz="Asia/Kolkata" city="Mumbai" position={[-4.6, 0.15, 5.4]} rotation={0.25} />
      {/* monsoon, rolling in over the bay */}
      <Rain position={[9.5, 1, -1.8]} area={[5, 7, 4]} count={46} />
    </group>
  );
}
