"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Label } from "../../bits";
import { Toon } from "../../toon";
import type { DioramaProps } from "../Frame";
import { Crates, Market, Painted, hash, paint, stack, type V3 } from "./kit";

/*
 * MSCI: 5TB out of OracleDB, through a Databricks ETL in PySpark, into BigQuery.
 * Raw grey cubes hop out of the barrel, go into the furnace, and come out as neat yellow
 * ones that ride the belt up into the silo.
 */

const BARREL: V3 = [-1.3, 0, -0.55];
const FURNACE: V3 = [1.0, 0, -0.45];
const SILO: V3 = [2.98, 0, -0.75];
const BELT_Y = 0.98; // cube centre height on the belts

const RAW = [new THREE.Vector3(-1.3, 1.6, -0.5), new THREE.Vector3(-0.8, 2.3, -0.45), new THREE.Vector3(-0.38, BELT_Y, -0.45), new THREE.Vector3(0.24, BELT_Y, -0.45)];
const CLEAN = [new THREE.Vector3(1.78, BELT_Y, -0.45), new THREE.Vector3(2.32, 2.2, -0.45)];
const rawCurve = new THREE.CatmullRomCurve3(RAW, false, "centripetal");
const N = 10;
const SPARKS = 9;

function plant() {
  const legs = [-0.28, 0.12, 1.98, 2.2].map((x) => ({ g: new THREE.BoxGeometry(0.08, x > 2 ? 1.6 : x > 1 ? 1.0 : 0.85, 0.08), c: C.ink, p: [x, x > 2 ? 0.8 : x > 1 ? 0.5 : 0.43, -0.45] as V3 }));
  const beltLen = Math.hypot(CLEAN[1].x - CLEAN[0].x, CLEAN[1].y - CLEAN[0].y);
  const beltA = Math.atan2(CLEAN[1].y - CLEAN[0].y, CLEAN[1].x - CLEAN[0].x);
  return paint(
    [
      // the barrel, with hoops and a lid
      { g: new THREE.CylinderGeometry(0.95, 0.88, 1.7, 22), c: C.brick, p: [BARREL[0], 0.85, BARREL[2]] },
      { g: new THREE.CylinderGeometry(0.965, 0.965, 0.42, 22, 1, true), c: C.cream, p: [BARREL[0], 0.8, BARREL[2]] },
      { g: new THREE.TorusGeometry(0.91, 0.05, 6, 24), c: C.ink, p: [BARREL[0], 0.25, BARREL[2]], r: [Math.PI / 2, 0, 0] },
      { g: new THREE.TorusGeometry(0.95, 0.05, 6, 24), c: C.ink, p: [BARREL[0], 1.45, BARREL[2]], r: [Math.PI / 2, 0, 0] },
      { g: new THREE.CylinderGeometry(0.85, 0.85, 0.04, 20), c: "#5a1f17", p: [BARREL[0], 1.71, BARREL[2]] },
      // belt in
      { g: new THREE.BoxGeometry(0.7, 0.12, 0.5), c: C.ink, p: [-0.08, BELT_Y - 0.17, -0.45] },
      // the furnace: a squat box with a round top and a chimney
      { g: new THREE.BoxGeometry(1.6, 1.25, 1.15), c: C.asphalt, p: [FURNACE[0], 0.62, FURNACE[2]] },
      { g: new THREE.CylinderGeometry(0.8, 0.8, 1.15, 18, 1, false, -Math.PI / 2, Math.PI), c: C.asphalt, p: [FURNACE[0], 1.24, FURNACE[2]], r: [-Math.PI / 2, 0, 0] },
      { g: new THREE.CylinderGeometry(0.17, 0.2, 1.1, 10), c: C.ink, p: [FURNACE[0] + 0.45, 2.15, FURNACE[2] - 0.2] },
      { g: new THREE.BoxGeometry(1.0, 0.06, 0.04), c: C.ink, p: [FURNACE[0], 0.3, FURNACE[2] + 0.6] },
      // belt out, up to the silo
      { g: new THREE.BoxGeometry(beltLen + 0.2, 0.12, 0.5), c: C.ink, p: [(CLEAN[0].x + CLEAN[1].x) / 2, (CLEAN[0].y + CLEAN[1].y) / 2 - 0.17, -0.45], r: [0, 0, beltA] },
      ...legs,
      // the silo: a cream drum with cobalt bands, a cone roof and an intake
      { g: new THREE.CylinderGeometry(0.78, 0.78, 3.0, 20), c: C.cream, p: [SILO[0], 1.5, SILO[2]] },
      { g: new THREE.CylinderGeometry(0.8, 0.8, 0.14, 20), c: C.cobalt, p: [SILO[0], 0.5, SILO[2]] },
      { g: new THREE.CylinderGeometry(0.8, 0.8, 0.14, 20), c: C.cobalt, p: [SILO[0], 2.75, SILO[2]] },
      { g: new THREE.ConeGeometry(0.9, 0.7, 20), c: C.cobalt, p: [SILO[0], 3.35, SILO[2]] },
      { g: new THREE.BoxGeometry(0.4, 0.4, 0.5), c: C.steel, p: [2.38, 2.3, -0.6] },
    ],
    true,
  );
}

function Pipeline() {
  const geo = useMemo(() => plant(), []);
  const raw = useRef<THREE.InstancedMesh>(null);
  const clean = useRef<THREE.InstancedMesh>(null);
  const sparks = useRef<THREE.InstancedMesh>(null);
  const mouth = useRef<THREE.MeshBasicMaterial>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  const glow = useMemo(() => [new THREE.Color(C.coral), new THREE.Color(C.sun)], []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    for (let i = 0; i < N; i++) {
      const u = (time * 0.12 + i / N) % 1;
      // 0..0.4 raw, out of the barrel and along the belt. 0.4..0.6 inside the furnace. 0.6..1 clean, up to the silo.
      if (u < 0.4) {
        o.position.copy(rawCurve.getPoint(u / 0.4));
        o.rotation.set(hash(i, 1) * 3, hash(i, 2) * 3, 0);
        o.scale.setScalar(0.8 + hash(i, 3) * 0.45);
      } else o.scale.setScalar(0.0001);
      o.updateMatrix();
      raw.current?.setMatrixAt(i, o.matrix);
      if (u > 0.6) {
        const f = (u - 0.6) / 0.4;
        o.position.lerpVectors(CLEAN[0], CLEAN[1], f);
        o.rotation.set(0, 0, Math.atan2(CLEAN[1].y - CLEAN[0].y, CLEAN[1].x - CLEAN[0].x));
        o.scale.setScalar(f > 0.92 ? (1 - f) / 0.08 : 1);
      } else o.scale.setScalar(0.0001);
      o.updateMatrix();
      clean.current?.setMatrixAt(i, o.matrix);
    }
    for (let i = 0; i < SPARKS; i++) {
      const u = (time * 0.7 + i / SPARKS) % 1;
      o.position.set(FURNACE[0] + 0.45 + (hash(i, 4) - 0.5) * 0.5 * u, 2.75 + u * 1.3, FURNACE[2] - 0.2 + (hash(i, 5) - 0.5) * 0.4 * u);
      o.rotation.set(u * 4, u * 3, 0);
      o.scale.setScalar(1 - u);
      o.updateMatrix();
      sparks.current?.setMatrixAt(i, o.matrix);
    }
    [raw.current, clean.current, sparks.current].forEach((m) => m && (m.instanceMatrix.needsUpdate = true));
    mouth.current?.color.copy(tmp.copy(glow[0]).lerp(glow[1], 0.5 + 0.5 * Math.sin(time * 9) * Math.sin(time * 3.7)));
  });

  return (
    <group>
      <Painted geometry={geo} castShadow thickness={1.8} />
      {/* the furnace mouth, flickering */}
      <mesh position={[FURNACE[0], 0.7, FURNACE[2] + 0.585]}>
        <circleGeometry args={[0.36, 20, 0, Math.PI]} />
        <meshBasicMaterial ref={mouth} color={C.sun} />
      </mesh>
      <mesh position={[FURNACE[0], 0.55, FURNACE[2] + 0.585]}>
        <planeGeometry args={[0.72, 0.3]} />
        <meshBasicMaterial color={C.coral} />
      </mesh>
      <instancedMesh ref={raw} args={[undefined, undefined, N]} frustumCulled={false} castShadow>
        <boxGeometry args={[0.24, 0.24, 0.24]} />
        <Toon color={C.steel} outline={false} />
      </instancedMesh>
      <instancedMesh ref={clean} args={[undefined, undefined, N]} frustumCulled={false} castShadow>
        <boxGeometry args={[0.26, 0.26, 0.26]} />
        <Toon color={C.sun} outline={false} />
      </instancedMesh>
      <instancedMesh ref={sparks} args={[undefined, undefined, SPARKS]} frustumCulled={false}>
        <boxGeometry args={[0.13, 0.13, 0.13]} />
        <meshBasicMaterial color={C.sun} />
      </instancedMesh>
      <Label size={0.22} position={[BARREL[0], 0.8, BARREL[2] + 0.98]}>
        ORACLEDB
      </Label>
      <Label size={0.26} color={C.cream} position={[FURNACE[0], 1.42, FURNACE[2] + 0.59]}>
        PYSPARK
      </Label>
      <Label size={0.22} position={[SILO[0], 1.55, SILO[2] + 0.8]}>
        BIGQUERY
      </Label>
      {/* the 5TB tag tied to the barrel */}
      <group position={[BARREL[0] - 0.56, 1.72, BARREL[2] + 0.88]} rotation={[0, -0.57, 0.12]}>
        <mesh position={[0, -0.06, 0]}>
          <boxGeometry args={[0.025, 0.14, 0.025]} />
          <meshBasicMaterial color={C.ink} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.62, 0.38, 0.03]} />
          <Toon color={C.sun} thickness={1.2} />
        </mesh>
        <Label size={0.24} position={[0, -0.3, 0.02]}>
          5TB
        </Label>
      </group>
    </group>
  );
}

export default function Data({ step }: DioramaProps) {
  const crates = useMemo(
    () =>
      stack(
        [
          [
            { t: "DATABRICKS", c: C.cobalt },
            { t: "ETL", c: C.cream },
          ],
          [
            { t: "MODELING", c: C.coral },
            { t: "PANDAS", c: C.sun },
          ],
        ],
        [-3.2, 0.15, 0.0],
        0.08,
        0.18,
      ),
    [],
  );
  return (
    <Market id={step.id} color={C.cobalt} title="DATA">
      <group position={[0.55, 0, 1.2]} scale={0.92}>
        <Pipeline />
      </group>
      <Crates items={crates} />
    </Market>
  );
}
