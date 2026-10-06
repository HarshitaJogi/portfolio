"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { worldNav } from "@/world/nav";

/** The bottom of the navigation stack: a plain client-side route change, on every page. */
export function NavBridge() {
  const router = useRouter();
  useEffect(() => worldNav.register((href) => router.push(href)), [router]);
  return null;
}
