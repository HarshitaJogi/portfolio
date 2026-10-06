import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { person } from "@/content/profile";

export const alt = "Harshita Jogi, software engineer. AI writes the first draft. I make it right. A playable island of her work.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card, in the island's own style: the island on the sea, and the cream name
 * card with an ink border and a hard shadow, set in the site's display face.
 */
export default async function OpengraphImage() {
  const file = (p: string) => readFile(join(process.cwd(), p));
  const [dela, geist, geistBold, island] = await Promise.all([file("public/fonts/dela-latin.ttf"), file("src/assets/fonts/Geist-400.ttf"), file("src/assets/fonts/Geist-600.ttf"), file("src/assets/og-island.jpg")]);
  const bg = `data:image/jpeg;base64,${island.toString("base64")}`;
  const ink = "#2b1e1a";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Geist" }}>
        <img src={bg} width={1200} height={630} alt="" style={{ position: "absolute", inset: 0, width: 1200, height: 630, objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            left: 56,
            top: 64,
            width: 600,
            display: "flex",
            flexDirection: "column",
            background: "#fff8ec",
            border: `6px solid ${ink}`,
            borderRadius: 34,
            boxShadow: `14px 14px 0 ${ink}`,
            padding: "40px 44px",
            color: ink,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 600, letterSpacing: 2 }}>
            <div style={{ width: 18, height: 18, borderRadius: 999, background: "#ff6b4a", border: `4px solid ${ink}` }} />
            SOFTWARE ENGINEER · SUNNYVALE, CA
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Dela", fontSize: 104, lineHeight: 0.92, marginTop: 18 }}>
            <span>{person.firstName}</span>
            <span>Jogi</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 600, marginTop: 20 }}>AI writes the first draft. I make it right.</div>
          <div style={{ display: "flex", marginTop: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#3bb273", border: `4px solid ${ink}`, borderRadius: 999, padding: "8px 20px", fontSize: 22, fontWeight: 600 }}>
              Open to full-time roles starting 2027
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: 48,
            bottom: 44,
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "#ff6b4a",
            border: `6px solid ${ink}`,
            borderRadius: 26,
            boxShadow: `8px 8px 0 ${ink}`,
            padding: "14px 28px",
            fontFamily: "Dela",
            fontSize: 38,
            color: ink,
          }}
        >
          Explore the island →
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Dela", data: dela, style: "normal", weight: 400 },
        { name: "Geist", data: geist, style: "normal", weight: 400 },
        { name: "Geist", data: geistBold, style: "normal", weight: 600 },
      ],
    },
  );
}
