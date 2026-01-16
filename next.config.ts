import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Disable Turbopack to avoid workspace detection issues
};

export default nextConfig;
