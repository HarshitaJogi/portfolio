import type { Metadata } from "next";
import { Nav } from "@/components/ui/Nav";
import { SkimView } from "@/components/skim/SkimView";

export const metadata: Metadata = {
  title: "Skim",
  description: "Harshita Jogi on one screen: roles, dates, numbers, links and resume.",
  alternates: { canonical: "/skim" },
};

/** The recruiter-ready summary. Reached from the Story/Skim switch or ?view=skim. */
export default function SkimPage() {
  return (
    <>
      <Nav />
      <main id="main" className="relative z-10">
        <SkimView />
      </main>
    </>
  );
}
