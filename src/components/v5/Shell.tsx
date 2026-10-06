"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { worlds, worldOrder, type WorldId } from "@/content/profile";
import type { SceneId } from "@/world/World";
import { worldNav } from "@/world/nav";
import { useReducedMotion } from "@/lib/device";
import { ui } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { wipe, useWipe } from "./transition";

const World = dynamic(() => import("@/world/World"), { ssr: false });

export function sceneFor(pathname: string): SceneId | null {
  if (pathname === "/") return "hub";
  const id = pathname.replace(/^\//, "").replace(/\/$/, "") as WorldId;
  return worldOrder.includes(id) ? id : null;
}

const HUB_SKY: [string, string] = ["#ffe3b3", "#ffd6b8"];
const skyFor = (s: SceneId | null) => (s && s !== "hub" ? worlds[s].steps[0].sky : HUB_SKY);
const labelFor = (s: SceneId | null) => (s && s !== "hub" ? worlds[s].label : "The island");

// One scalloped silhouette: straight on three sides (all off-screen), bumps along the inner edge.
const CLOUD_EDGE = (() => {
  let d = "M -20 -20 L 560 -20 L 560 0";
  for (let i = 0; i < 9; i++) d += ` A ${62 + (i % 3) * 8} ${62 + (i % 3) * 8} 0 0 1 560 ${(i + 1) * 120}`;
  return `${d} L 560 1100 L -20 1100 Z`;
})();

/** One half of the cloud wipe: a cream wall with a bumpy, ink-outlined edge. */
function CloudWall({ side }: { side: "left" | "right" }) {
  return (
    <svg viewBox="0 0 640 1080" preserveAspectRatio="none" className={cn("absolute inset-0 h-full w-full overflow-visible", side === "right" && "-scale-x-100")} aria-hidden="true">
      <path d={CLOUD_EDGE} fill="#fff8ec" stroke="#2b1e1a" strokeWidth="6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * Everything behind the page: the sky, the poster, the one canvas, and the cloud wipe
 * between scenes. Lives in the layout, so it survives navigation.
 */
export function Shell() {
  const pathname = usePathname();
  const router = useRouter();
  const scene = sceneFor(pathname);
  const reduced = useReducedMotion();
  const [mount, setMount] = useState(false);
  const [readyScene, setReadyScene] = useState<SceneId | null>(null);
  const [everReady, setEverReady] = useState(false);
  const { phase, to } = useWipe();
  const coverFrom = useRef<string | null>(null);

  // Load the world once the page is idle, so text and LCP never wait for WebGL.
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => setMount(true), { timeout: 1500 });
    else setTimeout(() => setMount(true), 800);
  }, []);

  // Portals and world links go through here: close the clouds, change route, part them once built.
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
        else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        return;
      }
      const target = sceneFor(url.pathname);
      if (reduced || !target) {
        router.push(href);
        return;
      }
      coverFrom.current = window.location.pathname;
      wipe.set({ phase: "cover", to: labelFor(target) });
      ui.whoosh();
      window.setTimeout(() => router.push(href), 650);
    });
  }, [router, reduced]);

  const onReady = useCallback((s: SceneId) => {
    setReadyScene(s);
    setEverReady(true);
  }, []);

  // Part the clouds when the new route's scene is built (or after a while, whatever happens).
  useEffect(() => {
    if (phase !== "cover") return;
    const landed = coverFrom.current !== null && pathname !== coverFrom.current;
    if (!landed) return;
    const reveal = () => {
      coverFrom.current = null;
      wipe.set({ phase: "reveal" });
      ui.whoosh();
      window.setTimeout(() => wipe.set({ phase: "idle" }), 900);
    };
    if (!mount || readyScene === scene) {
      reveal();
      return;
    }
    const t = window.setTimeout(reveal, 3500);
    return () => window.clearTimeout(t);
  }, [phase, pathname, readyScene, scene, mount]);

  const sky = skyFor(scene);
  const covered = phase === "cover";

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

      {/* the cloud wipe */}
      <div aria-hidden="true" className={cn("fixed inset-0 z-[70] overflow-hidden", covered ? "pointer-events-auto" : "pointer-events-none")}>
        <div className={cn("absolute inset-y-0 left-0 w-[max(64vw,420px)] transition-transform duration-[650ms] ease-[cubic-bezier(.7,0,.3,1)]", covered ? "translate-x-0" : "-translate-x-[110%]")}>
          <CloudWall side="left" />
        </div>
        <div className={cn("absolute inset-y-0 right-0 w-[max(64vw,420px)] transition-transform duration-[650ms] ease-[cubic-bezier(.7,0,.3,1)]", covered ? "translate-x-0" : "translate-x-[110%]")}>
          <CloudWall side="right" />
        </div>
        <div className={cn("absolute inset-0 grid place-items-center transition-opacity duration-300", covered ? "opacity-100 delay-300" : "opacity-0")}>
          <p className="text-center text-ink">
            <span className="block font-mono text-[0.8125rem] tracking-[0.08em] uppercase">Next stop</span>
            <span className="font-display mt-2 block text-[clamp(2.4rem,6vw,4.5rem)] leading-none">{to}</span>
          </p>
        </div>
      </div>
    </>
  );
}
