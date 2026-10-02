import { TRACKS, type Track } from "@/content/profile";

const MAX_COMPANY = 40;

/**
 * `?for=Company` → "Company". Whitelisted characters only, trimmed, capped.
 * The result is rendered as a plain text node, never as HTML.
 */
export function sanitizeCompany(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw
    .normalize("NFKC")
    .replace(/[^A-Za-z0-9 .&'-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_COMPANY)
    .trim();
  return cleaned.length >= 2 ? cleaned : null;
}

export function parseTrack(raw: string | null | undefined): Track | null {
  if (!raw) return null;
  const t = raw.toLowerCase().trim();
  return (TRACKS as readonly string[]).includes(t) ? (t as Track) : null;
}
