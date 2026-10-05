import { Suspense } from "react";
import type { TrackOrDefault } from "@/content/profile";
import { RevealController } from "@/components/ui/RevealController";
import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/sections/Hero";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Stack } from "@/components/sections/Stack";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { SectionIndexGate } from "@/components/ui/SectionIndexGate";
import { MobileBar } from "@/components/ui/MobileBar";

const updated = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });

/** The whole page. `track` reorders highlights for ?track= links. */
export function Site({ track }: { track: TrackOrDefault }) {
  return (
    <>
      <Nav />
      <SectionIndexGate />
      <MobileBar />
      <main id="main" className="relative z-10">
        <Hero track={track} />
        {/* Each boundary hydrates on its own, so React can yield between sections. */}
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
        <Suspense fallback={null}>
          <Projects track={track} />
        </Suspense>
        <Suspense fallback={null}>
          <Stack />
        </Suspense>
        <Suspense fallback={null}>
          <About />
        </Suspense>
        <Suspense fallback={null}>
          <Contact />
        </Suspense>
      </main>
      <Footer updated={updated} />
      <RevealController />
    </>
  );
}
