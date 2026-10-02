import type { TrackOrDefault } from "@/content/profile";
import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/sections/Hero";
import { Proof } from "@/components/sections/Proof";
import { Story } from "@/components/sections/Story";
import { PageLine } from "@/components/line/PageLine";

/** The whole page. `track` reorders highlights for ?track= links. */
export function Site({ track }: { track: TrackOrDefault }) {
  return (
    <>
      <Nav />
      <main id="main" className="relative z-10">
        <div data-story-only className="relative">
          <PageLine />
          <Hero />
          <Proof track={track} />
          <Story />
        </div>
      </main>
    </>
  );
}
