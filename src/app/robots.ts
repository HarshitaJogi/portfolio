import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/profile";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: "/t/" }], sitemap: `${SITE_URL}/sitemap.xml` };
}
