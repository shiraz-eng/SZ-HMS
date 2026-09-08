/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The shared design system ships as TypeScript source; Next compiles it.
  transpilePackages: ["@szhms/ui"],
};

export default nextConfig;
