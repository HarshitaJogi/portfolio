import type { TrackOrDefault } from "@/content/profile";
import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/sections/Hero";
import { Proof } from "@/components/sections/Proof";
import { Story } from "@/components/sections/Story";
import { Work } from "@/components/sections/Work";
import { Education } from "@/components/sections/Education";
import { Projects } from "@/components/sections/Projects";
import { Toolkit } from "@/components/sections/Toolkit";
import { OffStage } from "@/components/sections/OffStage";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { PageLine } from "@/components/line/PageLine";
import { SkimView } from "@/components/skim/SkimView";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { MobileBar } from "@/components/ui/MobileBar";

/** The whole page. `track` reorders highlights for ?track= links. */
const updated = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

export function Site({ track }: { track: TrackOrDefault }) {
  return (
    <>
      <Nav />
      <SectionIndex />
      <MobileBar />
      {/* The line host spans main and the footer so the line can close in the footer. */}
      <div className="relative z-10">
        <div data-story-only>
          <PageLine />
        </div>
        <main id="main" className="relative">
          <div data-skim-only>
            <SkimView />
          </div>
          <div data-story-only>
            <Hero />
            <Proof track={track} />
            <Story />
            <Work />
            <Education />
            <Projects track={track} />
            <Toolkit />
            <OffStage />
            <Contact />
          </div>
        </main>
        <Footer updated={updated} />
      </div>
    </>
  );
}
