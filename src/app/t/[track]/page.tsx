import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TRACKS, type Track } from "@/content/profile";
import { Site } from "@/components/Site";

/**
 * Pre-rendered track variants. `/?track=ai` is rewritten here by src/proxy.ts, so
 * every variant is static HTML: no client reshuffle, no layout shift.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return TRACKS.map((track) => ({ track }));
}

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

export default async function TrackPage({ params }: PageProps<"/t/[track]">) {
  const { track } = await params;
  if (!(TRACKS as readonly string[]).includes(track)) notFound();
  return <Site track={track as Track} />;
}
