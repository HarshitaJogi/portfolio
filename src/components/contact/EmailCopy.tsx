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
    <div className="@container">
      <a
        href={`mailto:${person.email}`}
        className="block text-[clamp(1.0625rem,6.4cqw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.04em] whitespace-nowrap no-underline decoration-accent decoration-2 underline-offset-[0.12em] hover:text-accent hover:underline"
      >
        {person.email}
      </a>
      <div className="mt-6 flex items-center gap-4">
        <ClickSpark sparkColor={colors?.accent ?? "#9e2a2b"} sparkCount={10} sparkRadius={22} sparkSize={9} duration={420}>
          <button
            type="button"
            onClick={copy}
            className="rounded-lg border border-line px-4 py-2.5 font-mono text-[0.8125rem] transition-colors hover:border-ink"
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
