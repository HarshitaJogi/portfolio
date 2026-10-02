import type { MetadataRoute } from "next";
import { person, seo } from "@/content/profile";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: person.name,
    short_name: "HJ",
    description: seo.description,
    start_url: "/",
    display: "browser",
    background_color: "#f6f1e7",
    theme_color: "#f6f1e7",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
