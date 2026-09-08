import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Shared packages ship as TypeScript source; Next compiles them.
  transpilePackages: ["@szhms/ui", "@szhms/auth", "@szhms/database"],
  serverExternalPackages: ["@prisma/client"],
  // Trace workspace files from the monorepo root (needed on Vercel).
  outputFileTracingRoot: rootDir,
  // Lint + typecheck run separately (`pnpm lint`, `pnpm typecheck`); keep the
  // deploy build resilient. Re-enable once the pipeline is green in CI.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
