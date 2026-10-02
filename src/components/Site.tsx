import type { TrackOrDefault } from "@/content/profile";
import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/sections/Hero";

/** The whole page. `track` reorders highlights for ?track= links. */
export function Site({ track }: { track: TrackOrDefault }) {
  void track;
  return (
    <>
      <Nav />
      <main id="main" className="relative z-10">
        <div data-story-only>
          <Hero />
        </div>
      </main>
    </>
  );
}
