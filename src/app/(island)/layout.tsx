import { Nav } from "@/components/ui/Nav";
import { Shell } from "@/components/v5/Shell";
import { Eggs } from "@/components/v5/Eggs";
import { FooterV3 } from "@/components/v3/FooterV3";

const updated = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });

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
      <FooterV3 updated={updated} />
      <Eggs />
    </>
  );
}
