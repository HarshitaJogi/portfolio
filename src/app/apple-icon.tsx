import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0B0B0C" }}>
        <svg width="180" height="180" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#F2554A" strokeWidth="3" />
          <path d="M24.96 65.96V33.30H30.94V48.89L28.18 46.91H47.41L44.69 48.89V33.30H50.67V65.96H44.69V50.18L47.41 52.11H28.18L30.94 50.18V65.96ZM63.63 66.69Q60.08 66.69 57.51 65.15Q54.93 63.61 53.57 60.87Q52.22 58.14 52.17 54.64L58.20 54.32Q58.29 57.91 59.69 59.70Q61.1 61.5 63.63 61.5Q66.20 61.5 67.63 59.68Q69.05 57.86 69.05 54.32V33.30H75.03V54.32Q75.03 58.09 73.61 60.87Q72.18 63.66 69.63 65.18Q67.08 66.69 63.63 66.69Z" fill="#EDEDEF" transform="translate(5 5) scale(0.9)" />
        </svg>
      </div>
    ),
    size,
  );
}
