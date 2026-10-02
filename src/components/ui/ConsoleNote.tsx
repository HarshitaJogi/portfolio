"use client";

import { useEffect } from "react";
import { consoleNote } from "@/content/profile";

/** A short note for engineers who open DevTools. */
export function ConsoleNote() {
  useEffect(() => {
    const w = window as Window & { __hjNote?: boolean };
    if (w.__hjNote) return;
    w.__hjNote = true;
    const [first, ...rest] = consoleNote;
    console.log(
      `%c${first}%c\n${rest.join("\n")}`,
      "font: 20px Georgia, serif; color: #9e2a2b; padding: 6px 0;",
      "font: 13px ui-monospace, monospace; line-height: 1.7;",
    );
  }, []);
  return null;
}
