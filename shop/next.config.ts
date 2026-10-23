import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: __dirname,
  },
  // Dev-only floating indicator — hidden so the sandbox preview looks clean
  devIndicators: false,
};

export default nextConfig;
