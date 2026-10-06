"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { margamParts, worlds, worldOrder, type WorldId } from "@/content/profile";
import type { SceneId } from "@/world/World";
import { worldNav } from "@/world/nav";
import { useReducedMotion } from "@/lib/device";
import { ui } from "@/lib/audio";
import { music, type Theme } from "@/lib/music";
import { cn } from "@/lib/utils";
import { lastPress, wipe, useWipe } from "./transition";
import { StampArt } from "./Passport";

const World = dynamic(() => import("@/world/World"), { ssr: false });

export function sceneFor(pathname: string): SceneId | null {
  if (pathname === "/") return "hub";
  const id = pathname.replace(/^\//, "").replace(/\/$/, "") as WorldId;
  return worldOrder.includes(id) ? id : null;
}

const HUB_SKY: [string, string] = ["#ffe3b3", "#ffd6b8"];
const skyFor = (s: SceneId | null) => (s && s !== "hub" ? worlds[s].steps[0].sky : HUB_SKY);
const labelFor = (s: SceneId | null) => (s && s !== "hub" ? worlds[s].label : "The island");
const margamColor = new Map(margamParts.map((m) => [m.id, m.color]));
/** The colour that fills the screen on the way into a place. */
const colorFor = (s: string) => (s !== "hub" && s in worlds ? (margamColor.get(worlds[s as WorldId].margam) ?? "#ff6b4a") : "#1f7a8c");

/** A little island, drawn, for "Back to the island". */
function IslandMark() {
  return (
    <svg viewBox="0 0 120 120" className="h-[220px] w-[220px]" aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill="#fff8ec" stroke="#2b1e1a" strokeWidth="5" />
      <ellipse cx="60" cy="78" rx="38" ry="12" fill="#1f7a8c" />
      <ellipse cx="60" cy="72" rx="30" ry="10" fill="#f2c57c" stroke="#2b1e1a" strokeWidth="3" />
      <path d="M58 72 C58 56 60 46 64 38" stroke="#8a5a3b" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M64 38 C54 34 46 38 42 44 M64 38 C70 30 80 30 86 36 M64 38 C64 30 58 24 50 24 M64 38 C74 38 80 44 82 50" stroke="#3f9a5a" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="88" cy="26" r="8" fill="#ffc93c" stroke="#2b1e1a" strokeWidth="3" />
    </svg>
  );
}

/**
 * The Animal Crossing door. A solid circle in the destination's colour grows from where
 * you clicked until it fills the screen. A big emblem says where you are going. Once the
 * new scene is built underneath, the circle closes away into the middle of the screen.
 */
function Iris() {
  const { phase, to, target, x, y } = useWipe();
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const d = el.current;
    if (!d) return;
    const big = Math.hypot(window.innerWidth, window.innerHeight);
    const run = (frames: Keyframe[], duration: number) => {
      const a = d.animate(frames, { duration, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" });
      // keep the end state as an inline style, then let the animation go
      a.onfinish = () => {
        a.commitStyles();
        a.cancel();
      };
    };
    if (phase === "cover") run([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${big}px at ${x}px ${y}px)` }], 620);
    else if (phase === "reveal") run([{ clipPath: `circle(${big}px at 50% 50%)` }, { clipPath: "circle(0px at 50% 50%)" }], 720);
  }, [phase, x, y]);
  const home = target === "hub";
  const color = colorFor(target);
  return (
    <div
      ref={el}
      aria-hidden="true"
      className={cn("fixed inset-0 z-[70] grid place-items-center", phase === "cover" ? "pointer-events-auto" : "pointer-events-none")}
      style={{
        clipPath: "circle(0px at 50% 50%)",
        background: `radial-gradient(circle at 50% 45%, rgba(255,255,255,.18), transparent 60%), radial-gradient(#2b1e1a22 2px, transparent 2.5px) 0 0 / 26px 26px, ${color}`,
      }}
    >
      <div className={cn("flex flex-col items-center text-center transition-all duration-300", phase === "cover" ? "scale-100 opacity-100 delay-300" : "scale-75 opacity-0")}>
        <div className="rounded-full shadow-[10px_10px_0_#2b1e1a] motion-safe:animate-[pop-in_0.5s_cubic-bezier(.2,.9,.3,1.4)_0.35s_both]">
          {home ? <IslandMark /> : <StampArt id={target as WorldId} size={220} />}
        </div>
        <p className="mt-7 font-mono text-[1.125rem] font-bold tracking-[0.18em] text-[#fff8ec] uppercase [text-shadow:2px_2px_0_#2b1e1a]">{home ? "Back to" : "Entering"}</p>
        <p className="font-display mt-1 text-[clamp(3rem,8vw,6.5rem)] leading-none text-[#fff8ec] [text-shadow:5px_5px_0_#2b1e1a,-2px_-2px_0_#2b1e1a,2px_-2px_0_#2b1e1a,-2px_2px_0_#2b1e1a]">{to}</p>
      </div>
    </div>
  );
}

/**
 * Everything behind the page: the sky, the poster, the one canvas, the music, and the
 * transition between scenes. Lives in the layout, so it survives navigation.
 */
export function Shell() {
  const pathname = usePathname();
  const router = useRouter();
  const scene = sceneFor(pathname);
  const reduced = useReducedMotion();
  const [mount, setMount] = useState(false);
  const [readyScene, setReadyScene] = useState<SceneId | null>(null);
  const [everReady, setEverReady] = useState(false);
  const { phase } = useWipe();
  const coverFrom = useRef<string | null>(null);
  const coveredAt = useRef(0);

  // Load the world once the page is idle, so text and LCP never wait for WebGL.
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => setMount(true), { timeout: 1500 });
    else setTimeout(() => setMount(true), 800);
  }, []);

  // Music: the first interaction starts it, in the theme of wherever you are.
  useEffect(() => {
    music.set((scene ?? "island") === "hub" ? "island" : (scene as Theme));
  }, [scene]);
  useEffect(() => {
    const start = () => music.start();
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  // Portals, the big buttons and the nav all go through here: cover, change route, reveal.
  useEffect(() => {
    worldNav.register((href) => {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        window.location.href = href;
        return;
      }
      if (url.pathname === window.location.pathname) {
        const el = url.hash ? document.getElementById(url.hash.slice(1)) : null;
        if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
        return;
      }
      const target = sceneFor(url.pathname);
      if (reduced || !target) {
        router.push(href);
        return;
      }
      coverFrom.current = window.location.pathname;
      coveredAt.current = performance.now();
      const x = lastPress.x >= 0 ? lastPress.x : window.innerWidth / 2;
      const y = lastPress.y >= 0 ? lastPress.y : window.innerHeight / 2;
      wipe.set({ phase: "cover", to: labelFor(target), target, x, y });
      ui.door();
      music.crossfade(target === "hub" ? "island" : (target as Theme), 0.5);
      window.setTimeout(() => router.push(href), 640);
    });
  }, [router, reduced]);

  const onReady = useCallback((s: SceneId) => {
    setReadyScene(s);
    setEverReady(true);
  }, []);

  // Reveal once the new route's scene is built, and after the emblem has had its moment.
  useEffect(() => {
    if (phase !== "cover") return;
    const landed = coverFrom.current !== null && pathname !== coverFrom.current;
    if (!landed) return;
    const reveal = () => {
      coverFrom.current = null;
      wipe.set({ phase: "reveal" });
      ui.arrive();
      window.setTimeout(() => wipe.set({ phase: "idle" }), 760);
    };
    const hold = Math.max(0, 1500 - (performance.now() - coveredAt.current));
    if (!mount || readyScene === scene) {
      const t = window.setTimeout(reveal, hold);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(reveal, Math.max(hold, 3500));
    return () => window.clearTimeout(t);
  }, [phase, pathname, readyScene, scene, mount]);

  const sky = skyFor(scene);

  return (
    <>
      <div
        id="sky"
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,var(--sky-top)_0%,var(--sky-bottom)_100%)]"
        style={{ "--sky-top": sky[0], "--sky-bottom": sky[1] } as CSSProperties}
      >
        {/* a still of the opening shot, so the island is there before WebGL is */}
        {scene === "hub" && (
          <div
            className={cn(
              "absolute inset-0 bg-[url(/world/poster-m.webp)] bg-cover bg-center transition-opacity duration-1000 min-[900px]:bg-[url(/world/poster-d.webp)]",
              everReady && "opacity-0",
            )}
          />
        )}
        <div className={cn("absolute inset-0 transition-opacity duration-1000", everReady ? "opacity-100" : "opacity-0")}>
          {mount && scene && <World scene={scene} onReady={onReady} />}
        </div>
      </div>
      <Iris />
    </>
  );
}
