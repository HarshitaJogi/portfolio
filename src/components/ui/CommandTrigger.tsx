"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";

// cmdk only loads the first time the palette opens.
const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

const noop = () => () => {};

export function CommandTrigger() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const mac = useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => true,
  );

  useEffect(() => {
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
        className="hidden h-10 items-center gap-1 rounded-full border-[3px] border-ink bg-[#fff8ec] px-3 font-mono text-[0.8125rem] font-medium text-ink shadow-[3px_3px_0_var(--ink)] transition-transform hover:-translate-y-0.5 md:inline-flex"
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
