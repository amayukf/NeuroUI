import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@cursor/sdk"],
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
