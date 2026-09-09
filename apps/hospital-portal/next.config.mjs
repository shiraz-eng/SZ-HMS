import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Shared packages ship as TypeScript source; Next compiles them.
  transpilePackages: ["@szhms/ui", "@szhms/auth", "@szhms/database"],
  serverExternalPackages: ["@prisma/client", "@prisma/engines"],
  // Trace workspace files from the monorepo root (needed on Vercel).
  outputFileTracingRoot: rootDir,
  // Force the Prisma client + query engine + schema into every serverless
  // function bundle. Globs are relative to THIS app dir; pnpm hoists the
  // generated client to the repo-root store under .pnpm/@prisma+client@<hash>/.
  outputFileTracingIncludes: {
    "/**/*": [
      "../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**/*",
      "../../node_modules/.pnpm/@prisma+client@*/node_modules/@prisma/client/**/*",
      "../../node_modules/.pnpm/prisma@*/node_modules/prisma/**/*",
      "../../node_modules/.pnpm/@prisma+engines@*/**/*",
      "../../node_modules/.prisma/client/**/*",
      "../../node_modules/@prisma/client/**/*",
      "../../packages/database/prisma/schema.prisma",
    ],
  },
  // `pnpm typecheck` is clean and gates CI; `next build` type-checks too.
  // ESLint still runs separately (`pnpm lint`) to keep deploys fast.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
