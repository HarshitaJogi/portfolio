"use client";

import { useEffect, useRef, useState } from "react";
import BranchedMenu from "@/components/bits/BranchedMenu";
import { media, person, work } from "@/content/profile";
import { setView, useView } from "@/lib/view";

/** Thumb-reachable bar on phones: Resume, Email, Index. Appears once the hero is gone. */
export function MobileBar() {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const view = useView();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    sheetRef.current?.querySelector("button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (hash: string) => {
    setOpen(false);
    if (view === "skim") setView("story");
    requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const items = [
    { label: "Introduction", value: "#top" },
    { label: "Proof", value: "#proof" },
    { label: "How I work", value: "#story" },
    { label: "Work", children: work.roles.map((r) => ({ value: `#role-${r.id}`, label: r.company })) },
    { label: "Education", value: "#education" },
    {
      label: "Projects",
      children: [
        { value: "#project-bitgig", label: "Bitgig" },
        { value: "#project-drone", label: "Drone research" },
        { value: "#project-scheduler", label: "Event Scheduler" },
        { value: "#project-hackathons", label: "Hackathons" },
      ],
    },
    { label: "Toolkit", value: "#toolkit" },
    { label: "Off-stage", value: "#offstage" },
    { label: "Contact", value: "#contact" },
  ];

  const cell = "flex h-12 flex-1 items-center justify-center text-[0.9375rem] font-medium text-ink";

  return (
    <>
      <div
        className={`fixed inset-x-3 bottom-3 z-50 flex items-center rounded-full border border-hairline bg-paper/95 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)] transition-[transform,opacity] duration-300 md:hidden ${
          shown || open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <a href={media.resumePdf} className={cell} target="_blank" rel="noopener">
          Resume
        </a>
        <span className="h-5 w-px bg-hairline" aria-hidden="true" />
        <a href={`mailto:${person.email}`} className={cell}>
          Email
        </a>
        <span className="h-5 w-px bg-hairline" aria-hidden="true" />
        <button type="button" className={cell} aria-expanded={open} aria-controls="mobile-index" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Index"}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 bg-ink/20 md:hidden" onClick={() => setOpen(false)} aria-hidden="true" />
      )}
      <div
        id="mobile-index"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Section index"
        hidden={!open}
        className="fixed inset-x-3 bottom-20 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-hairline bg-paper p-6 md:hidden"
      >
        <BranchedMenu
          items={items}
          defaultOpen={-1}
          onSelect={(value) => go(value)}
          color="var(--ink)"
          accentColor="var(--accent)"
          lineColor="var(--rule-strong)"
          fontSize={17}
          rowHeight={40}
          width={320}
        />
      </div>
    </>
  );
}
