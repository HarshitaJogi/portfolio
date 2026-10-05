import { Suspense } from "react";
import type { TrackOrDefault } from "@/content/profile";
import { RevealController } from "@/components/ui/RevealController";
import { Nav } from "@/components/ui/Nav";
import { MobileBar } from "@/components/ui/MobileBar";
import { HeroV3 } from "@/components/v3/HeroV3";
import { ToolkitBand } from "@/components/v3/ToolkitBand";
import { ExperienceV3 } from "@/components/v3/ExperienceV3";
import { ProjectsV3 } from "@/components/v3/ProjectsV3";
import { OffStageV3 } from "@/components/v3/OffStageV3";
import { ContactV3 } from "@/components/v3/ContactV3";
import { FooterV3 } from "@/components/v3/FooterV3";

const updated = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });

/**
 * The page follows a Bharatanatyam recital (a margam), in order:
 * Alarippu (hero), Jatiswaram (toolkit), Shabdam (experience), Varnam (projects),
 * Padam (off-stage), Tillana (contact), Mangalam (footer).
 */
export function Site({ track }: { track: TrackOrDefault }) {
  void track;
  return (
    <>
      <Nav />
      <MobileBar />
      <main id="main" className="relative z-10">
        <HeroV3 />
        <Suspense fallback={null}>
          <ToolkitBand />
        </Suspense>
        <Suspense fallback={null}>
          <ExperienceV3 />
        </Suspense>
        <Suspense fallback={null}>
          <ProjectsV3 />
        </Suspense>
        <Suspense fallback={null}>
          <OffStageV3 />
        </Suspense>
        <Suspense fallback={null}>
          <ContactV3 />
        </Suspense>
      </main>
      <FooterV3 updated={updated} />
      <RevealController />
    </>
  );
}
