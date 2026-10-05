import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AvatarLab } from "./AvatarLab";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Dev view of the five travelers cycling idle, walk, air, cheer, ride every 3 s.
 * /lab/avatars?state=cheer holds one state; &focus=2 frames one traveler up close. Not served in production.
 */
export default function AvatarsLab() {
  if (process.env.NODE_ENV === "production") notFound();
  return <AvatarLab />;
}
