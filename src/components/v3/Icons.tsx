/** Hand-tuned line icons for the pipeline stages. 48×48, stroke = currentColor. */
const base = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function StageIcon({ name, size = 40 }: { name: "drone" | "cloud" | "papers" | "agent" | "you"; size?: number }) {
  const p = { ...base, width: size, height: size };
  switch (name) {
    case "drone":
      return (
        <svg {...p}>
          <rect x="19" y="20" width="10" height="8" rx="2.5" />
          <path d="M19 22 12 15M29 22l7-7M19 26l-7 7M29 26l7 7" />
          <ellipse cx="11" cy="14" rx="6" ry="2" />
          <ellipse cx="37" cy="14" rx="6" ry="2" />
          <ellipse cx="11" cy="34" rx="6" ry="2" />
          <ellipse cx="37" cy="34" rx="6" ry="2" />
          <path d="M24 28v6" strokeDasharray="2 3" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...p}>
          <path d="M15 32h19a7 7 0 0 0 0-14 10 10 0 0 0-19.5 2.5A6 6 0 0 0 15 32Z" />
          <path d="M20 26h9m0 0-3-3m3 3-3 3" />
        </svg>
      );
    case "papers":
      return (
        <svg {...p}>
          <path d="M16 10h13l7 7v21H16z" />
          <path d="M29 10v7h7" />
          <path d="M12 14v28h18" />
          <path d="M21 25h9M21 30h6" />
          <path d="m30 33 2.5 2.5L38 30" />
        </svg>
      );
    case "agent":
      return (
        <svg {...p}>
          <rect x="11" y="16" width="26" height="20" rx="6" />
          <path d="M24 16v-5M21 11h6" />
          <circle cx="19" cy="26" r="2" fill="currentColor" stroke="none" />
          <circle cx="29" cy="26" r="2" fill="currentColor" stroke="none" />
          <path d="M7 24v5M41 24v5" />
          <path d="m20 31 2.5 2 5.5-4" />
        </svg>
      );
    case "you":
      return (
        <svg {...p}>
          <circle cx="24" cy="24" r="12" strokeDasharray="4 4" />
          <path d="M24 18v12M18 24h12" />
        </svg>
      );
  }
}

export function Sparkle({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z" />
      <path d="M19 15c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z" />
    </svg>
  );
}
