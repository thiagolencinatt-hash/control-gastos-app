import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  // PWA se configurará manualmente sin next-pwa para evitar conflictos con Turbopack
};

export default nextConfig;
