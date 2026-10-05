import type { TrackOrDefault } from "@/content/profile";
import { Nav } from "@/components/ui/Nav";
import { Journey } from "@/components/v4/Journey";
import { FooterV3 } from "@/components/v3/FooterV3";

const updated = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });

/**
 * The island: nine stops around a circular path, then the reveal.
 * Alarippu (welcome), Jatiswaram (toolkit), Shabdam (drone, MSCI, NSI, Nokia),
 * Varnam (side quests), Padam (stage), Tillana (your team), Mangalam (the view from above).
 */
export function Site({ track }: { track: TrackOrDefault }) {
  void track;
  return (
    <>
      <Nav />
      <Journey />
      <FooterV3 updated={updated} />
    </>
  );
}
