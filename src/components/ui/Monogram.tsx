import { MONOGRAM_PATH } from "./monogram-path";

/** The HJ mark: the letters inside a tala circle. Dashed ring = draft, solid = verified. */
export function Monogram({
  size = 40,
  ring = "solid",
  className,
  title,
}: {
  size?: number;
  ring?: "solid" | "dashed" | "none";
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {ring !== "none" && (
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeDasharray={ring === "dashed" ? "5 5" : undefined}
        />
      )}
      <path d={MONOGRAM_PATH} fill="currentColor" />
    </svg>
  );
}
