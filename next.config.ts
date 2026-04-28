import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname,
  },
  // @ts-expect-error type missing in Next 15 prerelease definitions
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. ESLint 9 Flat Config bug workaround.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
