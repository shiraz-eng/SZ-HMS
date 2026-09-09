import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@szhms/ui", "@szhms/payments", "@szhms/database"],
  serverExternalPackages: ["@prisma/client", "@prisma/engines", "stripe"],
  outputFileTracingRoot: rootDir,
  // The Stripe webhook + checkout action use Prisma at runtime, so the query
  // engine must land in the function bundle (see scripts/vercel-build.mjs).
  outputFileTracingIncludes: {
    "/**/*": [
      "../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**/*",
      "../../node_modules/.pnpm/@prisma+client@*/node_modules/@prisma/client/**/*",
      "../../node_modules/.pnpm/@prisma+engines@*/**/*",
      "../../packages/database/prisma/schema.prisma",
    ],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
