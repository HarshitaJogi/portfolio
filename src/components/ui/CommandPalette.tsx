"use client";

import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { useState } from "react";
import { media, person, sections } from "@/content/profile";
import { setView, useView } from "@/lib/view";

/** ⌘K: jump anywhere, copy the email, grab the resume. */
export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { resolvedTheme, setTheme } = useTheme();
  const view = useView();
  const [copied, setCopied] = useState(false);

  const run = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  const jump = (id: string) => {
    if (view === "skim") setView("story");
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const item =
    "flex cursor-pointer items-center justify-between gap-4 rounded-md px-3 py-2.5 text-[1rem] text-ink data-[selected=true]:bg-paper-deep data-[selected=true]:text-accent";
  const group = "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.75rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-muted";

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command menu"
      loop
      overlayClassName="fixed inset-0 z-[90] bg-ink/25"
      contentClassName="fixed left-1/2 top-[14vh] z-[100] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-hairline bg-paper shadow-[0_24px_80px_-20px_rgb(0_0_0/0.35)]"
    >
      <Command.Input
        placeholder="Jump to a section, copy email, open a link…"
        className="w-full border-b border-hairline bg-transparent px-4 py-4 text-[1.0625rem] text-ink outline-none placeholder:text-muted"
      />
      <Command.List className="max-h-[60vh] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-muted">Nothing matches that.</Command.Empty>
        <Command.Group heading="Actions" className={group}>
          <Command.Item
            className={item}
            onSelect={() => {
              navigator.clipboard?.writeText(person.email).then(() => setCopied(true));
              setTimeout(() => onOpenChange(false), 600);
            }}
          >
            {copied ? "Copied" : "Copy email"}
            <span className="font-mono text-[0.8125rem] text-muted">{person.email}</span>
          </Command.Item>
          <Command.Item className={item} onSelect={() => run(() => window.open(media.resumePdf, "_blank"))}>
            Download resume
            <span className="font-mono text-[0.8125rem] text-muted">PDF</span>
          </Command.Item>
          <Command.Item className={item} onSelect={() => run(() => window.open(person.links.github, "_blank", "noopener"))}>
            Open GitHub
          </Command.Item>
          <Command.Item className={item} onSelect={() => run(() => window.open(person.links.linkedin, "_blank", "noopener"))}>
            Open LinkedIn
          </Command.Item>
          <Command.Item className={item} onSelect={() => run(() => setView(view === "skim" ? "story" : "skim"))}>
            {view === "skim" ? "Switch to the full story" : "Switch to skim view"}
          </Command.Item>
          <Command.Item className={item} onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}>
            {resolvedTheme === "dark" ? "Light theme" : "Dark theme"}
          </Command.Item>
        </Command.Group>
        <Command.Group heading="Sections" className={group}>
          {sections.map((s) => (
            <Command.Item key={s.id} className={item} onSelect={() => run(() => jump(s.id))}>
              {s.label}
            </Command.Item>
          ))}
          <Command.Item className={item} onSelect={() => run(() => (window.location.href = "/resume"))}>
            Printable resume
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
