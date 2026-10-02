import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home folder confuses root detection.
  turbopack: { root: __dirname },
  images: { formats: ["image/avif", "image/webp"] },
  poweredByHeader: false,
};

export default nextConfig;
