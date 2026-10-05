"use client";

import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * The ink outline, after drei's <Outlines>, with one change: the creased-normal copy of a
 * geometry is computed once per shape (same type and parameters) and shared, instead of once
 * per mesh. With hundreds of toy parts, that was the biggest cost of building a scene.
 */
const vertex = /* glsl */ `
  #include <common>
  #include <morphtarget_pars_vertex>
  #include <skinning_pars_vertex>
  #include <clipping_planes_pars_vertex>
  uniform float thickness;
  uniform vec2 size;
  void main() {
    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <project_vertex>
    #include <clipping_planes_vertex>
    vec4 tNormal = vec4(normal, 0.0);
    vec4 tPosition = vec4(transformed, 1.0);
    #ifdef USE_INSTANCING
      tNormal = instanceMatrix * tNormal;
      tPosition = instanceMatrix * tPosition;
    #endif
    // pixel-sized outline: push the vertex out along the projected normal
    vec4 clipPosition = projectionMatrix * modelViewMatrix * tPosition;
    vec4 clipNormal = projectionMatrix * modelViewMatrix * tNormal;
    vec2 offset = normalize(clipNormal.xy) * thickness / size * clipPosition.w * 2.0;
    clipPosition.xy += offset;
    gl_Position = clipPosition;
  }`;
const fragment = /* glsl */ `
  uniform vec3 color;
  #include <clipping_planes_pars_fragment>
  void main() {
    #include <clipping_planes_fragment>
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

// one material per (thickness, colour)
const materials = new Map<string, THREE.ShaderMaterial>();
const drawSize = new THREE.Vector2(1, 1);
function material(thickness: number, color: string) {
  const key = `${thickness}|${color}`;
  let m = materials.get(key);
  if (!m) {
    m = new THREE.ShaderMaterial({
      uniforms: { thickness: { value: thickness }, color: { value: new THREE.Color(color) }, size: { value: drawSize } },
      vertexShader: vertex,
      fragmentShader: fragment,
      side: THREE.BackSide,
    });
    materials.set(key, m);
  }
  return m;
}

// creased copies, keyed by geometry type and parameters
const creased = new Map<string, THREE.BufferGeometry>();
const perGeometry = new WeakMap<THREE.BufferGeometry, THREE.BufferGeometry>();
function crease(g: THREE.BufferGeometry) {
  const hit = perGeometry.get(g);
  if (hit) return hit;
  const params = (g as THREE.BufferGeometry & { parameters?: object }).parameters;
  const key = params ? `${g.type}:${JSON.stringify(params)}` : null;
  const cached = key ? creased.get(key) : undefined;
  const c: THREE.BufferGeometry = cached ?? toCreasedNormals(g, Math.PI);
  if (key && !cached) creased.set(key, c);
  perGeometry.set(g, c);
  return c;
}

export function InkOutline({ thickness = 2.2, color = "#2b1e1a" }: { thickness?: number; color?: string }) {
  const ref = useRef<THREE.Group>(null);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const [mat] = useState(() => material(thickness, color));
  // outlines are sized in pixels, so they follow the drawing buffer
  useLayoutEffect(() => {
    gl.getDrawingBufferSize(drawSize);
  }, [gl, size]);
  useLayoutEffect(() => {
    const group = ref.current;
    const parent = group?.parent as THREE.Mesh | THREE.InstancedMesh | null;
    if (!group || !parent?.geometry) return;
    const geo = crease(parent.geometry);
    let mesh: THREE.Mesh;
    if ((parent as THREE.InstancedMesh).isInstancedMesh) {
      const inst = new THREE.InstancedMesh(geo, mat, (parent as THREE.InstancedMesh).count);
      inst.instanceMatrix = (parent as THREE.InstancedMesh).instanceMatrix;
      mesh = inst;
    } else {
      mesh = new THREE.Mesh(geo, mat);
    }
    group.add(mesh);
    return () => {
      group.remove(mesh);
    };
  }, [mat]);
  return <group ref={ref} />;
}
