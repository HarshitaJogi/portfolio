"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { journey } from "@/world/scroll";

const World = dynamic(() => import("@/world/World"), { ssr: false });

export function LabWorld() {
  useEffect(() => {
    const p = Number(new URLSearchParams(location.search).get("p") ?? 0);
    journey.target = p;
    journey.progress = p;
  }, []);
  return (
    <div className="fixed inset-0 bg-[linear-gradient(180deg,#ffe3b3_0%,#ffcdb2_45%,#ffd6b8_100%)]">
      <World />
    </div>
  );
}
