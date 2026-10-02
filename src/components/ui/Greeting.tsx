"use client";

import { useEffect, useState } from "react";
import { sanitizeCompany } from "@/lib/sanitize";

/**
 * `?for=Company` → "Hello, Company team." Plain text only, in a reserved slot so
 * nothing shifts. Says nothing about the company.
 */
export function Greeting() {
  const [company, setCompany] = useState<string | null>(null);
  useEffect(() => {
    setCompany(sanitizeCompany(new URLSearchParams(window.location.search).get("for")));
  }, []);
  return (
    <p className="text-label h-5 font-mono text-accent" aria-live="polite">
      {company ? `Hello, ${company} team.` : ""}
    </p>
  );
}
