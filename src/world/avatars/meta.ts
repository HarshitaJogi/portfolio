import type { TravelerKind } from "../traveler";

/** The five travelers, in chooser order. No three.js here, so the page can import it cheaply. */
export const AVATARS: { id: TravelerKind; name: string; species: string; line: string; color: string }[] = [
  { id: "robot", name: "Bolt", species: "robot", line: "Beeps when it finds a bug.", color: "#fff8ec" },
  { id: "cat", name: "Mochi", species: "cat", line: "Naps on warm keyboards, ships anyway.", color: "#ff9a3c" },
  { id: "duck", name: "Pip", species: "duckling", line: "Explains every bug to itself, out loud.", color: "#ffd23f" },
  { id: "elephant", name: "Gajju", species: "baby elephant", line: "Never forgets where the bridge was.", color: "#b0a8d4" },
  { id: "peacock", name: "Mayu", species: "peacock", line: "Dances a little at every finish line.", color: "#2453e6" },
];
