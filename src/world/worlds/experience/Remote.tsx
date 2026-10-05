"use client";

import { RoundedBox } from "@/world/rounded";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../../palette";
import { Toon } from "../../toon";
import { Label } from "../../bits";
import { atmo } from "../../atmosphere";
import { Islet, Sign } from "../../props/basics";
import { Bush } from "../../props/nature";
import { Tappable } from "../../props/tappable";
import { HINT, PopText, Ripple, hump, sfx, since, squash, useKick, wiggle, type Kick } from "@/world/fx";

/**
 * The laptop screen: a maize leaf, a bounding box snapping onto the blight, and the
 * internship's result. Drawn once into a small canvas.
 */
function useDetectionScreen() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 320;
    const g = c.getContext("2d")!;
    g.fillStyle = "#1d2350";
    g.fillRect(0, 0, 512, 320);
    g.fillStyle = "#fff8ec";
    g.font = "bold 26px monospace";
    g.fillText("YOLOv9, MODIFIED", 24, 44);
    // the leaf
    g.save();
    g.translate(256, 170);
    g.rotate(-0.35);
    g.fillStyle = "#7fb069";
    g.beginPath();
    g.ellipse(0, 0, 190, 46, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#4f8a3c";
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(-180, 0);
    g.lineTo(180, 0);
    g.stroke();
    // blight lesions
    g.fillStyle = "#8a5a2b";
    [
      [40, -12, 22, 9],
      [78, 10, 16, 7],
      [-60, 14, 12, 6],
    ].forEach(([x, y, rx, ry]) => {
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0.3, 0, Math.PI * 2);
      g.fill();
    });
    g.restore();
    g.fillStyle = "#ffc93c";
    g.font = "bold 28px monospace";
    g.fillText("86% DETECTION ACCURACY", 24, 296);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

/** The red box that hunts across the leaf and locks onto the lesion. A rerun hunts harder and locks with a flash. */
function DetectionBox({ rerun }: { rerun: Kick }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const r = since(rerun);
    const again = r < 4;
    const t = again ? r : clock.elapsedTime % 4;
    const lock = Math.min(1, Math.max(0, (t - 1.2) / 0.5));
    // on a rerun it lands with a punch: overshoot, then settle
    const punch = again ? hump(t - 1.7, 0.35) * 0.35 : 0;
    const s = 1.6 - lock * 0.9 + punch;
    g.scale.set(s, s * 0.8, 1);
    g.position.x = 0.32 * lock + Math.sin(clock.elapsedTime * (again ? 9 : 3)) * (again ? 0.6 : 0.2) * (1 - lock);
    g.visible = t < 3.6;
  });
  const bars: [number, number, number, number][] = [
    [0, 0.25, 0.7, 0.04],
    [0, -0.25, 0.7, 0.04],
    [-0.35, 0, 0.04, 0.54],
    [0.35, 0, 0.04, 0.54],
  ];
  return (
    <group ref={ref} position={[0.32, 0.05, 0.03]}>
      {bars.map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color="#e63946" />
        </mesh>
      ))}
      <mesh position={[-0.13, 0.33, 0]}>
        <planeGeometry args={[0.44, 0.14]} />
        <meshBasicMaterial color="#e63946" />
      </mesh>
      <Label size={0.09} position={[-0.13, 0.33, 0.01]} color={C.cream}>
        BLIGHT
      </Label>
    </group>
  );
}

/** Wi-Fi arcs, pulsing out from the router: a remote internship runs on this. */
function WifiArcs({ ping }: { ping: Kick }) {
  const arcs = useRef<(THREE.Mesh | null)[]>([]);
  const group = useRef<THREE.Group>(null);
  const phase = useRef(0);
  useFrame((_, dt) => {
    const boost = hump(since(ping), 1.6);
    phase.current += dt * (3 + boost * 9);
    arcs.current.forEach((m, i) => {
      if (m) (m.material as THREE.MeshBasicMaterial).opacity = Math.max(0, Math.sin(phase.current - i * 0.9));
    });
    group.current?.scale.setScalar(1 + boost * 0.6);
  });
  return (
    <group ref={group} position={[0, 1.15, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => void (arcs.current[i] = m)} rotation={[0, 0, Math.PI / 4]}>
          <ringGeometry args={[0.25 + i * 0.28, 0.36 + i * 0.28, 24, 1, 0, Math.PI / 2]} />
          <meshBasicMaterial color={C.cobalt} transparent side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/** IIT Patna, remote: a home desk where a YOLOv9 model learns to find blight on maize leaves. */
export function Remote() {
  const screen = useDetectionScreen();
  const lamp = useRef<THREE.MeshBasicMaterial>(null);
  const beam = useRef<THREE.Mesh>(null);
  const shade = useRef<THREE.Group>(null);
  const day = useMemo(() => new THREE.Color("#fff1c4"), []);
  const warm = useMemo(() => new THREE.Color("#ffc44d"), []);
  const off = useMemo(() => new THREE.Color("#6b6152"), []);
  const holo = useRef<THREE.Group>(null);
  const router = useRef<THREE.Group>(null);
  const lampOn = useRef(true);
  const [rerun, fireRerun] = useKick();
  const [flip, fireFlip] = useKick();
  const [ping, firePing] = useKick();
  const [lock, fireLock] = useKick();
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (lockTimer.current && clearTimeout(lockTimer.current)), []);
  useFrame(({ clock }) => {
    if (lampOn.current) lamp.current?.color.copy(day).lerp(warm, 0.4 + atmo.night * 0.6);
    else lamp.current?.color.copy(off);
    if (beam.current) {
      beam.current.visible = lampOn.current;
      (beam.current.material as THREE.MeshBasicMaterial).opacity = 0.07 + atmo.night * 0.2 + hump(since(flip), 0.5) * 0.2;
    }
    if (shade.current) squash(shade.current, wiggle(since(flip), 0.3));
    const r = since(rerun);
    if (holo.current) {
      holo.current.position.y = 5.2 + Math.sin(clock.elapsedTime * 1.4) * 0.12 + hump(r, 0.5) * 0.5;
      holo.current.rotation.z = -0.14 + wiggle(r - 1.7, 0.08, 22, 6);
    }
    if (router.current) squash(router.current, wiggle(since(ping), 0.35));
  });

  /** Run the detector again: it hunts, then locks on with a flash and a ding. */
  const detect = () => {
    if (since(rerun) < 3.6) return;
    fireRerun();
    sfx.beep(0.8);
    if (lockTimer.current) clearTimeout(lockTimer.current);
    lockTimer.current = setTimeout(() => {
      fireLock();
      sfx.arp(880, 3, 0.06);
    }, 1700);
  };
  const toggleLamp = () => {
    lampOn.current = !lampOn.current;
    fireFlip();
    sfx.click(lampOn.current ? 1 : 0.7);
  };
  const broadcast = () => {
    firePing();
    sfx.whoosh(1.4);
    sfx.beep(1.2);
  };

  return (
    <group>
      <Islet r={11} top="#e8c79a" inner={7.5} innerColor="#c9a0dc" />
      {/* the rug */}
      <mesh position={[0, 0.2, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.4, 40]} />
        <meshBasicMaterial color="#f4a3c0" />
      </mesh>
      <mesh position={[0, 0.21, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.6, 4.8, 48]} />
        <meshBasicMaterial color={C.cream} />
      </mesh>

      <group scale={1.35} position={[0, 0, 0.4]}>
      {/* desk */}
      <group position={[0, 0.15, -1.2]}>
        <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 0.25, 2.4]} />
          <Toon color={C.bark} />
        </mesh>
        {[-2.7, 2.7].flatMap((x) =>
          [-0.95, 0.95].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.72, z]}>
              <boxGeometry args={[0.2, 1.45, 0.2]} />
              <Toon color={C.bark} outline={false} />
            </mesh>
          )),
        )}

        {/* laptop: click to run the detector again */}
        <Tappable onTap={detect} position={[-0.6, 1.68, 0.1]}>
          <mesh position={[0, 0.05, 0.35]} castShadow>
            <boxGeometry args={[2.3, 0.1, 1.4]} />
            <Toon color={C.steel} />
          </mesh>
          <group position={[0, 0.1, -0.35]} rotation={[-0.22, 0, 0]}>
            <mesh position={[0, 0.78, 0]} castShadow>
              <boxGeometry args={[2.3, 1.56, 0.08]} />
              <Toon color={C.steel} />
            </mesh>
            {screen && (
              <mesh position={[0, 0.8, 0.045]}>
                <planeGeometry args={[2.1, 1.31]} />
                <meshBasicMaterial map={screen} toneMapped={false} />
              </mesh>
            )}
          </group>
        </Tappable>

        {/* the edge board the model was quantized for */}
        <group position={[1.75, 1.7, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[1.2, 0.08, 0.9]} />
            <Toon color={C.pcb} thickness={1.4} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[-0.25 + i * 0.1, 0.2, 0]}>
              <boxGeometry args={[0.05, 0.32, 0.6]} />
              <Toon color={C.silver} outline={false} />
            </mesh>
          ))}
          <Label size={0.11} position={[0, 0.06, 0.46]} color={C.cream}>
            QUANTIZED
          </Label>
        </group>

        {/* desk lamp: click to switch it */}
        <Tappable onTap={toggleLamp} position={[2.4, 1.68, -0.6]} hintAt={[-0.45, 2.3, 0]} hintScale={HINT / 1.35}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.3, 0.34, 0.12, 16]} />
            <Toon color={C.coral} />
          </mesh>
          <mesh position={[-0.2, 0.75, 0]} rotation={[0, 0, 0.35]}>
            <cylinderGeometry args={[0.04, 0.04, 1.4, 6]} />
            <Toon color={C.ink} outline={false} />
          </mesh>
          <group ref={shade} position={[-0.55, 1.4, 0]}>
            <mesh rotation={[0, 0, -2.2]}>
              <coneGeometry args={[0.3, 0.45, 16, 1, true]} />
              <Toon color={C.coral} />
            </mesh>
            <mesh position={[-0.1, -0.12, 0]}>
              <sphereGeometry args={[0.12, 10, 8]} />
              <meshBasicMaterial ref={lamp} color="#fff1c4" />
            </mesh>
          </group>
          {/* the pool of light it throws on the desk */}
          <mesh ref={beam} position={[-0.85, 0.66, 0]} rotation={[0, 0, -0.42]}>
            <coneGeometry args={[0.55, 1.25, 20, 1, true]} />
            <meshBasicMaterial color="#fff3b0" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
          {/* an easy target: the lamp is slim */}
          <mesh position={[-0.3, 0.9, 0]} visible={false}>
            <boxGeometry args={[1.1, 1.9, 0.8]} />
            <meshBasicMaterial />
          </mesh>
          <PopText kick={flip} text="CLICK" position={[-0.4, 2.0, 0.3]} size={0.32} />
        </Tappable>

        {/* a mug and a short stack of papers */}
        <mesh position={[-2.4, 1.92, 0.5]}>
          <cylinderGeometry args={[0.2, 0.18, 0.5, 14]} />
          <Toon color={C.cobalt} thickness={1.2} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-2.3 + i * 0.03, 1.72 + i * 0.05, -0.5]} rotation={[0, i * 0.15, 0]}>
            <boxGeometry args={[0.8, 0.04, 1]} />
            <Toon color={C.cream} thickness={1} />
          </mesh>
        ))}
      </group>

      {/* chair */}
      <group position={[-0.6, 0.15, 1.6]}>
        <mesh position={[0, 0.95, 0]} castShadow>
          <boxGeometry args={[1.3, 0.2, 1.2]} />
          <Toon color={C.teal} />
        </mesh>
        <mesh position={[0, 1.7, 0.55]} castShadow>
          <boxGeometry args={[1.3, 1.3, 0.18]} />
          <Toon color={C.teal} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.9, 8]} />
          <Toon color={C.ink} outline={false} />
        </mesh>
      </group>

      </group>
      {/* the leaf, blown up above the desk: the thing the model learned to see */}
      <Tappable onTap={detect} hintAt={[-0.6, 6.9, -1.6]} hintScale={HINT}>
      <group ref={holo} position={[-0.6, 5.2, -2]} rotation={[-0.4, 0, -0.14]} scale={1.45}>
        {/* ink rim, then the leaf */}
        <group scale={[2.48, 0.7, 1]}>
          <mesh position={[0, 0, -0.005]}>
            <circleGeometry args={[1, 40]} />
            <meshBasicMaterial color={C.ink} />
          </mesh>
        </group>
        <group scale={[2.4, 0.62, 1]}>
          <mesh position={[0, 0, 0.005]}>
            <circleGeometry args={[1, 40]} />
            <meshBasicMaterial color={C.grass} />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[4.6, 0.06]} />
          <meshBasicMaterial color={C.leaf} />
        </mesh>
        {[
          [0.32, 0.06, 0.2, 0.09],
          [0.85, -0.14, 0.13, 0.07],
          [-0.9, 0.12, 0.1, 0.06],
        ].map(([x, y, rx, ry], i) => (
          <mesh key={i} position={[x, y, 0.02]} scale={[rx, ry, 1]}>
            <circleGeometry args={[1, 16]} />
            <meshBasicMaterial color="#8a5a2b" />
          </mesh>
        ))}
        <DetectionBox rerun={rerun} />
        <Ripple kick={lock} position={[0.32, 0.05, 0.04]} rotation={[0, 0, 0]} color={C.sun} from={0.3} to={1.6} width={0.16} dur={0.6} />
      </group>
      </Tappable>
      <PopText kick={rerun} text="SCANNING" position={[-2.9, 5.9, -1.4]} size={0.36} color={C.cobalt} rise={0.6} dur={1.6} />
      <PopText kick={lock} text="BEEP" position={[1.9, 6.0, -1.4]} size={0.5} color={C.red} />

      {/* the router, broadcasting: click it for a big wave */}
      <Tappable onTap={broadcast} position={[4.6, 0.15, -2.6]} hintAt={[0, 2.4, 0]} hintScale={HINT}>
        <group ref={router}>
          <RoundedBox args={[1, 0.35, 0.7]} radius={0.08} position={[0, 0.2, 0]} castShadow>
            <Toon color={C.cream} />
          </RoundedBox>
          {[-0.3, 0.3].map((x) => (
            <mesh key={x} position={[x, 0.65, -0.2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
              <Toon color={C.ink} outline={false} />
            </mesh>
          ))}
        </group>
        <WifiArcs ping={ping} />
        <mesh position={[0, 0.8, 0]} visible={false}>
          <boxGeometry args={[1.6, 1.8, 1.2]} />
          <meshBasicMaterial />
        </mesh>
        {[0, 0.18, 0.36].map((d) => (
          <Ripple key={d} kick={ping} position={[0, 0.25, 0]} color={C.cobalt} from={0.4} to={6.5} width={0.05} dur={1.2} delay={d} />
        ))}
        <PopText kick={ping} text="PING" position={[0, 2.0, 0.4]} size={0.45} color={C.cobalt} />
      </Tappable>

      {/* a plant and a shelf */}
      <group position={[-4.8, 0.15, -2.2]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.45, 0.35, 0.8, 14]} />
          <Toon color={C.coral} />
        </mesh>
        <Bush position={[0, 0.7, 0]} color={C.leaf} s={1.3} />
      </group>

      <Sign text="REMOTE" sub="RESEARCH INTERN · 2023" position={[5.2, 0.15, 4.2]} rotation={-0.35} size={0.55} />
    </group>
  );
}
