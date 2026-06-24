import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
  },
  compress: false,
  output: "standalone",
};

export default nextConfig;
