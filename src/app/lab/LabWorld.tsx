"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import { resetJourney } from "@/world/scroll";
import type { SceneId } from "@/world/World";

const World = dynamic(() => import("@/world/World"), { ssr: false });

const noop = () => () => {};
const param = (k: string) => new URLSearchParams(window.location.search).get(k);

/** /lab?s=experience&p=2 frames step 2 of a scene, with no cards. Dev only. */
export function LabWorld() {
  const scene = useSyncExternalStore(noop, () => (param("s") ?? "hub") as SceneId, () => null);
  useEffect(() => {
    resetJourney(Number(param("p") ?? 0));
  }, []);
  return (
    <div id="sky" className="fixed inset-0 bg-[linear-gradient(180deg,var(--sky-top,#ffe3b3)_0%,var(--sky-bottom,#ffd6b8)_100%)]">
      {scene && <World scene={scene} />}
    </div>
  );
}
