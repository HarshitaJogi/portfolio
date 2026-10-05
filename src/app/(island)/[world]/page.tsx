import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { worldOrder, worlds, type WorldId } from "@/content/profile";
import { WorldPage } from "@/components/v5/WorldPage";

/** One static page per resume section: /education, /skills, /experience, /projects, /offstage. */
export const dynamicParams = false;

export function generateStaticParams() {
  return worldOrder.map((world) => ({ world }));
}

export async function generateMetadata({ params }: PageProps<"/[world]">): Promise<Metadata> {
  const { world } = await params;
  const w = worlds[world as WorldId];
  if (!w) return {};
  return {
    title: w.label,
    description: w.description,
    alternates: { canonical: `/${w.id}` },
  };
}

export default async function WorldRoute({ params }: PageProps<"/[world]">) {
  const { world } = await params;
  if (!worldOrder.includes(world as WorldId)) notFound();
  return <WorldPage id={world as WorldId} />;
}
