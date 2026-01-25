import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    skipTrailingSlashRedirect: true,
  },
};

export default nextConfig;
