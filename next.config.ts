import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Self-contained build output for Docker / VPS deployment.
  output: "standalone",

  // Pin the workspace root to this project so Next.js doesn't pick up
  // an unrelated package-lock.json from a parent directory.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
