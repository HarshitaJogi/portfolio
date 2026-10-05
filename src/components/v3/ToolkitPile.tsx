"use client";

import dynamic from "next/dynamic";
import { stack, toolkit } from "@/content/profile";
import { useFinePointer, useReducedMotion } from "@/lib/device";

const FallingText = dynamic(() => import("@/components/bits/FallingText"), { ssr: false });

const TILE = [
  "bg-red text-cream",
  "bg-marigold text-ink",
  "bg-teal text-cream",
  "bg-green text-ink",
  "bg-pink text-cream",
  "bg-indigo text-cream",
  "bg-paper text-ink",
];

const words = stack.flatMap((g) => g.items.map((i) => i.name));
const text = words.map((w) => w.replace(/ /g, " ")).join(" ");
const tileClass = (_: string, i: number) =>
  `rounded-full border-2 border-ink px-4 py-2 font-semibold text-[0.9375rem] md:text-[1.0625rem] shadow-[3px_3px_0_var(--ink)] ${TILE[i % TILE.length]}`;

/** Jatiswaram: pure technique, no words. The tools drop in as tiles you can throw around. */
export function ToolkitPile() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  return (
    <div>
      <p className="sr-only">Tools: {words.join(", ")}. Also familiar with {toolkit.alsoFamiliar.join(", ")}.</p>
      <div aria-hidden="true" className="h-[30rem] w-full md:h-[26rem]">
        <FallingText text={text} trigger={reduced ? "click" : "scroll"} gravity={0.9} fontSize="1rem" wordClass={tileClass} interactive={fine} />
      </div>
    </div>
  );
}
