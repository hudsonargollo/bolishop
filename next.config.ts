import type { NextConfig } from "next";
import path from "node:path";

// Netlify sets NETLIFY=true during its builds. Its Next.js runtime packages the
// app itself, so the self-contained "standalone" output is only used for
// Docker / VPS deployments.
const onNetlify = process.env.NETLIFY === "true";

const nextConfig: NextConfig = {
  // Self-contained build output for Docker / VPS deployment.
  output: onNetlify ? undefined : "standalone",

  // Pin the workspace root to this project so Next.js doesn't pick up
  // an unrelated package-lock.json from a parent directory.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Make sure the Prisma query engine binaries ship with the server functions.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/.prisma/client/**/*"],
  },
};

export default nextConfig;
