"use client";

import { pickTraveler, travelerKinds, useTraveler, type TravelerKind } from "@/world/traveler";
import { cn } from "@/lib/utils";
import { pop } from "./sfx";
import { AvatarIcon } from "./avatarIcons";

const NAMES: Record<TravelerKind, { name: string; species: string; color: string }> = {
  robot: { name: "Bolt", species: "robot", color: "#fff8ec" },
  cat: { name: "Mochi", species: "cat", color: "#f5a25d" },
  duck: { name: "Pip", species: "duck", color: "#ffd23f" },
  elephant: { name: "Gajju", species: "baby elephant", color: "#b9b3d6" },
  peacock: { name: "Mayu", species: "peacock", color: "#2f7fd8" },
};

/** Pick who walks the island with you. Remembered in this browser. */
export function TravelerPicker() {
  const { kind, picked } = useTraveler();
  const cur = NAMES[kind];
  return (
    <div className="mt-5">
      <p className="font-mono text-[0.8125rem] tracking-[0.06em] uppercase">{picked ? `Traveling with ${cur.name} the ${cur.species}` : "Pick your traveler"}</p>
      <div className="mt-2.5 flex flex-wrap gap-2 sm:gap-2.5" role="radiogroup" aria-label="Pick your traveler">
        {travelerKinds.map((k) => {
          const on = k === kind;
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${NAMES[k].name} the ${NAMES[k].species}`}
              title={`${NAMES[k].name} the ${NAMES[k].species}`}
              onClick={() => {
                pop();
                pickTraveler(k);
              }}
              className={cn(
                "grid h-12 w-12 place-items-center rounded-2xl border-[3px] border-ink transition-[transform,box-shadow] duration-100 hover:-translate-y-0.5 hover:rotate-[-3deg] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none md:h-16 md:w-16 sm:h-14 sm:w-14",
                on ? "bg-[#ffc93c] shadow-[4px_4px_0_var(--ink)]" : "bg-[#fff8ec] shadow-[3px_3px_0_var(--ink)]",
              )}
            >
              <AvatarIcon kind={k} className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
