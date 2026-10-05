"use client";

import { Text } from "@react-three/drei";
import { useEffect, useState } from "react";
import { C } from "./palette";

export const FONT = "/fonts/dela-latin.ttf";

/** Chunky signage text in the island's display face. */
export function Label({
  children,
  size = 0.5,
  color = C.ink,
  position,
  rotation,
  anchorX = "center",
  outline,
}: {
  children: string;
  size?: number;
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  anchorX?: "left" | "center" | "right";
  outline?: string;
}) {
  return (
    <Text font={FONT} fontSize={size} color={color} position={position} rotation={rotation} anchorX={anchorX} anchorY="middle" outlineWidth={outline ? size * 0.06 : 0} outlineColor={outline}>
      {children}
    </Text>
  );
}

/** Pointer cursor while hovering a clickable object. */
export function useHoverCursor() {
  const [hovered, setHovered] = useState(false);
  // set on <body>: the canvas inherits it, and the page layer above is pointer-events: none
  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);
  return {
    hovered,
    bind: {
      onPointerOver: (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        setHovered(true);
      },
      onPointerOut: () => setHovered(false),
    },
  };
}

/** A short synthesized bell, for the ghungroo and the approve button. */
// one audio context for every chime on the site: browsers cap how many can exist
let audioCtx: AudioContext | null = null;

export function chime(base = 1320) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx ??= new Ctx();
    const ctx = audioCtx;
    if (ctx.state === "suspended") void ctx.resume();
    [1, 2.76, 5.4].forEach((m, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = base * m * (1 + (Math.random() - 0.5) * 0.02);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.18 / (i + 1), ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9 - i * 0.2);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 1);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {}
}

/** A texture through Next's image optimizer: resized for its spot on the island, served as AVIF or WebP. */
export const textureUrl = (src: string, w: 640 | 828 | 1080 = 640) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
