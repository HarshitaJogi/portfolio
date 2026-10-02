"use client";

import { useState } from "react";
import ClickSpark from "@/components/bits/ClickSpark";
import { contact, person } from "@/content/profile";
import { useThemeColors } from "@/lib/useThemeColors";

/** The email, huge. Click the address to write, or copy it with a small spark. */
export function EmailCopy() {
  const colors = useThemeColors();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };
  return (
    <div>
      <a
        href={`mailto:${person.email}`}
        className="font-display block text-[clamp(1.5rem,7.6vw-0.4rem,6.25rem)] leading-[1.02] tracking-[-0.015em] break-words no-underline decoration-accent decoration-2 underline-offset-[0.12em] hover:text-accent hover:underline"
      >
        {person.email}
      </a>
      <div className="mt-6 flex items-center gap-4">
        <ClickSpark sparkColor={colors?.accent ?? "#9e2a2b"} sparkCount={10} sparkRadius={22} sparkSize={9} duration={420}>
          <button
            type="button"
            onClick={copy}
            className="rounded-full border border-ink/60 px-5 py-2.5 font-mono text-[0.8125rem] tracking-[0.08em] uppercase transition-colors hover:border-accent hover:text-accent"
          >
            {copied ? contact.copied : contact.copy}
          </button>
        </ClickSpark>
        <span role="status" aria-live="polite" className="sr-only">
          {copied ? "Email address copied" : ""}
        </span>
      </div>
    </div>
  );
}
