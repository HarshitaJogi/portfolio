import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { person } from "@/content/profile";

export const alt = "Harshita Jogi, software engineer. AI writes the first draft. I make it right.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MONO = "M24.96 65.96V33.30H30.94V48.89L28.18 46.91H47.41L44.69 48.89V33.30H50.67V65.96H44.69V50.18L47.41 52.11H28.18L30.94 50.18V65.96ZM63.63 66.69Q60.08 66.69 57.51 65.15Q54.93 63.61 53.57 60.87Q52.22 58.14 52.17 54.64L58.20 54.32Q58.29 57.91 59.69 59.70Q61.1 61.5 63.63 61.5Q66.20 61.5 67.63 59.68Q69.05 57.86 69.05 54.32V33.30H75.03V54.32Q75.03 58.09 73.61 60.87Q72.18 63.66 69.63 65.18Q67.08 66.69 63.63 66.69Z";

/** The share card, in the site's own style: dark instrument panel, Geist, one accent. */
export default async function OpengraphImage() {
  const font = (f: string) => readFile(join(process.cwd(), "src/assets/fonts", f));
  const [semibold, regular, mono] = await Promise.all([font("Geist-600.ttf"), font("Geist-400.ttf"), font("GeistMono-400.ttf")]);
  const grid = "linear-gradient(to right, rgba(237,237,239,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(237,237,239,0.05) 1px, transparent 1px)";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0B0B0C", backgroundImage: grid, backgroundSize: "48px 48px", color: "#EDEDEF", fontFamily: "Geist", padding: "64px 72px", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 860 }}>
          <div style={{ display: "flex", alignItems: "center", alignSelf: "flex-start", gap: 12, border: "1px solid rgba(242,85,74,0.45)", background: "rgba(242,85,74,0.12)", borderRadius: 999, padding: "8px 18px", fontFamily: "Geist Mono", fontSize: 22 }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: "#F2554A" }} />
            Open to full-time roles starting 2027
          </div>
          <div style={{ fontSize: 120, fontWeight: 600, letterSpacing: -5, lineHeight: 1, marginTop: 34 }}>{person.name}</div>
          <div style={{ display: "flex", fontSize: 48, fontWeight: 600, letterSpacing: -1.5, marginTop: 24 }}>
            <span>AI writes the first draft. I make it</span>
            <span style={{ color: "#F2554A", marginLeft: 14 }}>right.</span>
          </div>
          <div style={{ display: "flex", marginTop: 44, fontFamily: "Geist Mono", fontSize: 22, color: "#9A9AA3" }}>
            SWE Co-op, Nokia  /  MS CS, Northeastern  /  LLM agents
          </div>
        </div>
        <svg width="200" height="200" viewBox="0 0 100 100" style={{ position: "absolute", right: 80, top: 80 }}>
          <circle cx="50" cy="50" r="46" fill="none" stroke="#F2554A" strokeWidth="2" />
          <path d={MONO} fill="#EDEDEF" />
        </svg>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: semibold, style: "normal", weight: 600 },
        { name: "Geist", data: regular, style: "normal", weight: 400 },
        { name: "Geist Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
