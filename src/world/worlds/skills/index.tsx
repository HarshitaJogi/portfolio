"use client";

import { worlds } from "@/content/profile";
import type { SceneProps } from "../../World";
import { WorldFrame } from "../Frame";
import Llm from "./llm";
import Ml from "./ml";
import Data from "./data";
import Backend from "./backend";
import Cloud from "./cloud";
import Lang from "./lang";
import Also from "./also";

/**
 * Skills: a market street. One stall per category, the same awning in a different colour,
 * each selling its skills as labelled crates and running a small toy that shows the work.
 */
export default function Scene({ done }: SceneProps) {
  return <WorldFrame world={worlds.skills} dioramas={{ llm: Llm, ml: Ml, data: Data, backend: Backend, cloud: Cloud, lang: Lang, also: Also }} done={done} connector="bridge" />;
}
