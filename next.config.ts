import type { NextConfig } from "next";
import path from "node:path";

// Netlify (NETLIFY=true) and Vercel (VERCEL=1) package the app themselves, so
// the self-contained "standalone" output is only used for Docker / VPS.
const onManagedHost = process.env.NETLIFY === "true" || Boolean(process.env.VERCEL);

const nextConfig: NextConfig = {
  // Self-contained build output for Docker / VPS deployment.
  output: onManagedHost ? undefined : "standalone",

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
