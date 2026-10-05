"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { AVATARS } from "@/world/avatars";
import { AvatarIcon } from "@/components/v5/avatarIcons";
import { labState, STATES } from "./labState";

const AvatarScene = dynamic(() => import("./AvatarScene"), { ssr: false });

export function AvatarLab() {
  const state = useSyncExternalStore(labState.subscribe, labState.get, () => 0);
  return (
    <main className="min-h-screen bg-[#fff6e8] text-[#2b1e1a]">
      <div id="stage" className="relative h-[70vh] min-h-105 w-full bg-[linear-gradient(180deg,#ffe3b3_0%,#ffd6b8_100%)]">
        <AvatarScene />
        <div id="state" className="absolute top-4 left-4 rounded-full bg-[#2b1e1a] px-4 py-1.5 font-mono text-sm tracking-wide text-[#fff6e8] uppercase">
          {STATES[state]}
        </div>
      </div>
      <section id="icons" className="flex flex-wrap items-end gap-8 p-8">
        {AVATARS.map((a) => (
          <div key={a.id} className="flex flex-col items-center gap-2">
            <div className="flex items-end gap-3">
              <AvatarIcon kind={a.id} className="size-10" />
              <AvatarIcon kind={a.id} className="size-16" />
              <div className="rounded-2xl p-2" style={{ background: a.color }}>
                <AvatarIcon kind={a.id} className="size-24" />
              </div>
            </div>
            <div className="text-sm font-bold">
              {a.name} <span className="font-normal opacity-60">{a.species}</span>
            </div>
            <div className="max-w-56 text-center text-xs opacity-75">{a.line}</div>
          </div>
        ))}
      </section>
      <section className="flex flex-wrap gap-3 bg-[#2b1e1a] p-6">
        {AVATARS.map((a) => (
          <button key={a.id} className="flex items-center gap-2 rounded-full bg-[#fff6e8] py-1 pr-4 pl-1 text-sm font-bold">
            <AvatarIcon kind={a.id} className="size-10" />
            {a.name}
          </button>
        ))}
      </section>
    </main>
  );
}
