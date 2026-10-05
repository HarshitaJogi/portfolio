import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabWorld } from "./LabWorld";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Dev view of the island: /lab?p=3 jumps the camera to stop 3. Not served in production. */
export default function Lab() {
  if (process.env.NODE_ENV === "production") notFound();
  return <LabWorld />;
}
