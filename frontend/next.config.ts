import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  webpack: (config, { dev, isServer }) => {
    return config;
  },
  trailingSlash: false,
};

export default nextConfig;
