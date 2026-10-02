"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// cmdk only loads the first time the palette opens.
const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

export function CommandTrigger() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [mac, setMac] = useState(true);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setLoaded(true);
        setOpen((o) => !o);
      }
    };
    const onOpen = () => {
      setLoaded(true);
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
        className="hidden md:inline-flex h-8 items-center gap-1.5 rounded-full px-3 font-mono text-[0.75rem] text-muted transition-colors hover:text-ink"
        aria-label={mac ? "⌘ K, command menu" : "Ctrl K, command menu"}
        aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}
      >
        <kbd className="font-mono">{mac ? "⌘" : "Ctrl"}</kbd>
        <kbd className="font-mono">K</kbd>
      </button>
      {loaded && <CommandPalette open={open} onOpenChange={setOpen} />}
    </>
  );
}
