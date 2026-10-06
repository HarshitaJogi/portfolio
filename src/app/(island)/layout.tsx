import { Nav } from "@/components/ui/Nav";
import { Shell } from "@/components/v5/Shell";
import { Eggs } from "@/components/v5/Eggs";
import { Chooser } from "@/components/v5/Chooser";

/**
 * The island and its worlds share one layout, so the canvas, the sky, and the nav survive
 * every move between them. Only the cards (the page) change.
 */
export default function IslandLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Nav />
      <Shell />
      {children}
      <Eggs />
      <Chooser />
    </>
  );
}
