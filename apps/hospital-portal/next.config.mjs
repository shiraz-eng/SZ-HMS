/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Shared packages ship as TypeScript source; Next compiles them.
  transpilePackages: ["@szhms/ui", "@szhms/auth", "@szhms/database"],
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
