"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-full border border-ink/60 px-4 py-2 text-[0.875rem] hover:border-accent hover:text-accent">
      Print
    </button>
  );
}
