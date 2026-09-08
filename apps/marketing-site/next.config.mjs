/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@szhms/ui", "@szhms/payments", "@szhms/database"],
  serverExternalPackages: ["@prisma/client", "stripe"],
};

export default nextConfig;
