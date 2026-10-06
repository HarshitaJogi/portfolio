"use client";

import { setMuted, ui, useMuted } from "@/lib/audio";

/** Sound on or off for the whole site. Remembered in this browser. */
export function SoundToggle() {
  const muted = useMuted();
  return (
    <button
      type="button"
      onClick={() => {
        setMuted(!muted);
        if (muted) setTimeout(() => ui.pop(), 0);
      }}
      aria-pressed={!muted}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      className="grid h-10 w-10 place-items-center rounded-full border-[3px] border-ink bg-[#fff8ec] text-ink shadow-[3px_3px_0_var(--ink)] transition-transform hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="#ffc93c" stroke="#2b1e1a" strokeWidth="2.2" strokeLinejoin="round" />
        {muted ? (
          <path d="M16 9l5 6M21 9l-5 6" stroke="#2b1e1a" strokeWidth="2.4" strokeLinecap="round" />
        ) : (
          <path d="M16 8.5c1.6 2 1.6 5 0 7M18.6 6c3 3.4 3 8.6 0 12" fill="none" stroke="#2b1e1a" strokeWidth="2.4" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
