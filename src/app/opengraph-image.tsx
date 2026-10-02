import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { person } from "@/content/profile";

export const alt = "Harshita Jogi, software engineer. AI writes the first draft. I make it right.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MONO = "M26.84 64.64Q25.97 64.64 25.97 64.00Q25.97 63.48 26.72 63.31L28.06 63.07Q29.27 62.84 29.65 62.44Q30.03 62.03 30.03 60.81V26.71Q30.03 25.49 29.65 25.08Q29.27 24.68 28.06 24.45L26.72 24.21Q25.97 24.04 25.97 23.52Q25.97 22.88 26.84 22.88H37.45Q38.32 22.88 38.32 23.58Q38.32 24.10 37.69 24.21L36.12 24.45Q34.90 24.62 34.52 25.08Q34.15 25.55 34.15 26.77V41.32Q34.15 42.14 34.96 42.14H46.44Q47.26 42.14 47.26 41.32V26.77Q47.26 25.55 46.88 25.08Q46.50 24.62 45.28 24.45L43.72 24.21Q43.08 24.10 43.08 23.58Q43.08 22.88 43.95 22.88H54.56Q55.43 22.88 55.43 23.52Q55.43 24.04 54.68 24.21L53.34 24.45Q52.13 24.68 51.75 25.08Q51.37 25.49 51.37 26.71V60.81Q51.37 62.03 51.75 62.44Q52.13 62.84 53.34 63.07L54.68 63.31Q55.43 63.48 55.43 64.00Q55.43 64.64 54.56 64.64H43.95Q43.08 64.64 43.08 63.94Q43.08 63.42 43.72 63.31L45.28 63.07Q46.50 62.90 46.88 62.44Q47.26 61.97 47.26 60.75V44.69Q47.26 43.88 46.44 43.88H34.96Q34.15 43.88 34.15 44.69V60.75Q34.15 61.97 34.52 62.44Q34.90 62.90 36.12 63.07L37.69 63.31Q38.32 63.42 38.32 63.94Q38.32 64.64 37.45 64.64ZM61.49 77.11Q59.7 77.11 58.56 76.15Q57.43 75.20 57.43 73.63Q57.43 72.47 58.10 71.72Q58.77 70.96 59.81 70.96Q60.80 70.96 61.20 71.54Q61.61 72.12 61.87 72.88Q62.13 73.63 62.48 74.21Q62.83 74.79 63.58 74.79Q64.68 74.79 65.26 73.51Q65.84 72.24 65.84 69.92V26.71Q65.84 25.49 65.47 25.08Q65.09 24.68 63.87 24.45L62.54 24.21Q61.78 24.04 61.78 23.52Q61.78 22.88 62.65 22.88H73.15Q74.02 22.88 74.02 23.52Q74.02 24.04 73.27 24.21L71.93 24.45Q70.72 24.68 70.34 25.08Q69.96 25.49 69.96 26.71V62.09Q69.96 69.05 67.70 73.08Q65.44 77.11 61.49 77.11Z";

/** The share card, in the site's own style: ivory paper, serif name, the tala circle, the line. */
export default async function OpengraphImage() {
  const [regular, italic] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/InstrumentSerif-Regular.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/InstrumentSerif-Italic.ttf")),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F6F1E7", color: "#16130F", fontFamily: "Instrument Serif", padding: "64px 72px", position: "relative" }}>
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M 930 300 C 930 470, 110 420, 110 630" fill="none" stroke="#16130F" strokeWidth="1.5" />
          <path d="M 930 300 C 930 470, 110 420, 110 630" fill="none" stroke="#C9BBA3" strokeWidth="1.5" strokeDasharray="5 7" />
          <circle cx="1010" cy="200" r="122" fill="none" stroke="#C9BBA3" strokeWidth="1.5" strokeDasharray="4 5" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", width: 780 }}>
          <div style={{ fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#625B51", fontFamily: "Instrument Serif" }}>Software engineer / AI and data systems</div>
          <div style={{ fontSize: 148, lineHeight: 0.9, marginTop: 18, letterSpacing: -3 }}>{person.name}</div>
          <div style={{ display: "flex", fontSize: 58, lineHeight: 1.05, marginTop: 34 }}>
            <span>AI writes the first draft. I make it&nbsp;</span>
            <span style={{ fontStyle: "italic", color: "#9E2A2B" }}>right.</span>
          </div>
          <div style={{ fontSize: 28, marginTop: 40, color: "#625B51" }}>Nokia · MS CS, Northeastern · Open to full-time roles starting 2027</div>
        </div>
        <svg width="220" height="220" viewBox="0 0 100 100" style={{ position: "absolute", right: 80, top: 90 }}>
          <circle cx="50" cy="50" r="46" fill="none" stroke="#9E2A2B" strokeWidth="2.5" />
          <path d={MONO} fill="#16130F" />
        </svg>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Serif", data: regular, style: "normal", weight: 400 },
        { name: "Instrument Serif", data: italic, style: "italic", weight: 400 },
      ],
    },
  );
}
