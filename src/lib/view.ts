"use client";

import { usePathname, useRouter } from "next/navigation";

export type View = "story" | "skim";

/** Story is `/`, Skim is `/skim`. Separate routes keep each page's DOM small. */
export function useView() {
  const pathname = usePathname();
  const router = useRouter();
  const view: View = pathname === "/skim" ? "skim" : "story";
  const setView = (v: View) => {
    if (v === view) return;
    router.push(v === "skim" ? "/skim" : "/", { scroll: true });
  };
  return { view, setView };
}
