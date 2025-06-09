import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL("http://localhost:7000/*")],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
