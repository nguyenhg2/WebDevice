import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [45, 58, 62, 64, 66],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [360, 640, 768, 1024, 1280],
    imageSizes: [96, 160, 240, 320, 480],
    remotePatterns: [
      { protocol: "https", hostname: "shared.akamai.steamstatic.com" },
      { protocol: "https", hostname: "cdn.akamai.steamstatic.com" },
      { protocol: "https", hostname: "cmsassets.rgpub.io" },
      { protocol: "https", hostname: "cdn2.unrealengine.com" },
      { protocol: "https", hostname: "www.alanwake.com" },
    ],
  },
};
export default nextConfig;
