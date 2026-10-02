"use client";

import dynamic from "next/dynamic";
import { useMedia } from "@/lib/device";

const SectionIndex = dynamic(() => import("./SectionIndex").then((m) => m.SectionIndex), { ssr: false });

/** The right-edge index only exists on screens wide enough to show it, so phones never load it. */
export function SectionIndexGate() {
  const wide = useMedia("(min-width: 1600px)");
  return wide ? <SectionIndex /> : null;
}
